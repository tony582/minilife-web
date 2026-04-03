// ═══════════════════════════════════════════════════════════
// PetRoomModal — 多房间全屏弹窗
// ═══════════════════════════════════════════════════════════
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ROOM_VARIANTS, FURNITURE_VARIANTS } from '../../data/roomConfig';
import VirtualPetDashboard from './VirtualPetDashboard';
import { Icons } from '../../utils/Icons';

const ROOM_UNLOCK_COSTS = [0, 500, 1500, 3000];

export default function PetRoomModal({
    rooms, activeRoomIdx, setActiveRoomIdx,
    updateSkin, updateFurniture, updatePetVitals,
    unlockRoom, kidId, onClose,
    isLocked, remainingLabel, remainingSeconds, limitSeconds, progressPct,
}) {
    const [unlocking, setUnlocking] = useState(false);
    const [showDecorate, setShowDecorate] = useState(false);
    const modalRef = useRef(null);
    const touchStartY = useRef(null);

    const activeRoom = rooms[activeRoomIdx] ?? rooms[0];
    const canUnlock = rooms.length < 4;
    const nextCost = ROOM_UNLOCK_COSTS[rooms.length] ?? 3000;

    // ── Swipe down to close ──────────────────────────────────────────
    const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
    const handleTouchEnd = (e) => {
        if (!touchStartY.current) return;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        if (dy > 80) onClose();
        touchStartY.current = null;
    };

    // ── Room unlock flow ─────────────────────────────────────────────
    const handleUnlock = useCallback(async () => {
        if (!canUnlock || unlocking) return;
        setUnlocking(true);
        try {
            await unlockRoom(`第${rooms.length + 1}间小窝`);
        } catch (e) {
            alert('解锁失败：' + e.message);
        } finally {
            setUnlocking(false);
        }
    }, [canUnlock, unlocking, unlockRoom, rooms.length]);

    return (
        <div className="fixed inset-0 z-[90] flex flex-col"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Modal container — slides up */}
            <div
                ref={modalRef}
                className="absolute inset-x-0 bottom-0 flex flex-col rounded-t-[2rem] overflow-hidden"
                style={{
                    height: '92vh',
                    background: '#f8f4ef',
                    animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* ── Header ──────────────────────────────────────── */}
                <div className="flex-shrink-0 px-4 pt-3 pb-2 flex items-center gap-3"
                    style={{ background: '#f8f4ef', borderBottom: '1px solid #e8e0d5' }}
                >
                    {/* Drag handle */}
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-300 rounded-full" />

                    {/* Room name */}
                    <div className="flex-1 mt-2">
                        <span className="text-base font-black text-slate-800">
                            {activeRoom?.roomName ?? '我的小窝'}
                        </span>
                    </div>

                    {/* Anti-addiction timer */}
                    {!isLocked && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ background: remainingSeconds < 180 ? '#fef3c7' : '#f0fdf4', color: remainingSeconds < 180 ? '#92400e' : '#166534' }}
                        >
                            <div className="w-12 h-1.5 rounded-full overflow-hidden bg-slate-200">
                                <div className="h-full rounded-full transition-all"
                                    style={{ width: `${100 - progressPct}%`, background: progressPct > 70 ? '#f87171' : '#4ade80' }} />
                            </div>
                            ⏱ {remainingLabel}
                        </div>
                    )}
                    {isLocked && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-500">
                            🔒 今日已满
                        </div>
                    )}

                    {/* Close */}
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors mt-2"
                    >
                        <Icons.X size={16} className="text-slate-500" />
                    </button>
                </div>

                {/* ── Room switcher dots ───────────────────────────── */}
                <div className="flex-shrink-0 flex items-center justify-center gap-2 py-2">
                    {rooms.map((room, idx) => (
                        <button
                            key={room.id}
                            onClick={() => setActiveRoomIdx(idx)}
                            className={`transition-all duration-200 rounded-full ${
                                idx === activeRoomIdx
                                    ? 'w-6 h-2.5 bg-orange-400'
                                    : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                            }`}
                            title={room.roomName}
                        />
                    ))}
                    {/* Unlock + button */}
                    {canUnlock && (
                        <button
                            onClick={handleUnlock}
                            disabled={unlocking}
                            className="w-7 h-7 rounded-full border-2 border-dashed border-slate-300
                                flex items-center justify-center text-slate-400
                                hover:border-orange-400 hover:text-orange-400 transition-colors"
                            title={`解锁新房间 (${nextCost} 币)`}
                        >
                            {unlocking ? <Icons.Loader size={12} className="animate-spin" /> : <Icons.Plus size={14} />}
                        </button>
                    )}
                </div>

                {/* ── Locked overlay ───────────────────────────────── */}
                {isLocked && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center"
                        style={{ background: 'rgba(248,244,239,0.92)', backdropFilter: 'blur(4px)', top: '80px' }}
                    >
                        <div className="text-6xl mb-4 animate-bounce">😴</div>
                        <h3 className="text-xl font-black text-slate-700 mb-2">小猫已经休息啦</h3>
                        <p className="text-slate-500 text-sm text-center px-8 mb-6">
                            今天的互动时间到了哦！<br />
                            完成学习任务可以解锁更多时间 🎯
                        </p>
                        <div className="flex flex-col gap-3 w-48">
                            <button onClick={onClose}
                                className="w-full py-3 bg-orange-400 text-white rounded-2xl font-black text-sm shadow-md"
                            >去完成任务！</button>
                            <button onClick={onClose}
                                className="w-full py-2.5 bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm"
                            >明天再来</button>
                        </div>
                    </div>
                )}

                {/* ── Main room content ────────────────────────────── */}
                <div className="flex-1 overflow-hidden relative">
                    {activeRoom && (
                        <VirtualPetDashboard
                            key={activeRoom.id}
                            roomData={activeRoom}
                            onSkinChange={updateSkin}
                            onFurnitureChange={updateFurniture}
                            onPetVitalsChange={updatePetVitals}
                            embedded={true}
                        />
                    )}
                </div>

                {/* ── Bottom action bar ────────────────────────────── */}
                {!isLocked && (
                    <div className="flex-shrink-0 px-4 py-3 flex items-center gap-3"
                        style={{ borderTop: '1px solid #e8e0d5', background: '#f8f4ef' }}
                    >
                        <button
                            onClick={() => setShowDecorate(d => !d)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                                showDecorate
                                    ? 'bg-orange-400 text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                        >
                            🎨 {showDecorate ? '退出装饰' : '装饰房间'}
                        </button>

                        <div className="flex-1 text-right text-xs text-slate-400 font-bold">
                            {rooms.length} / 4 个房间
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to   { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
