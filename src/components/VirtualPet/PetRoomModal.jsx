// ═══════════════════════════════════════════════════════════
// PetRoomModal — 多房间全屏弹窗（Phase 2：装饰经济系统）
// ═══════════════════════════════════════════════════════════
import React, { useState, useRef, useCallback } from 'react';
import { ROOM_VARIANTS } from '../../data/roomConfig';
import { ROOM_UNLOCK_COSTS } from '../../data/furnitureCatalog';
import VirtualPetDashboard from './VirtualPetDashboard';
import FurnitureShop from './FurnitureShop';
import { usePetCoins } from '../../hooks/usePetCoins';
import { useDataContext } from '../../context/DataContext';
import { Icons } from '../../utils/Icons';

// Peer constant: keep in sync with furnitureCatalog ROOM_UNLOCK_COSTS
const NEXT_ROOM_COSTS = [0, 500, 1500, 3000];

export default function PetRoomModal({
    rooms, activeRoomIdx, setActiveRoomIdx,
    updateSkin, updateFurniture, updatePetVitals,
    unlockRoom, kidId, activeKid, onClose,
    isLocked, remainingLabel, remainingSeconds, limitSeconds, progressPct,
}) {
    const [unlocking, setUnlocking]             = useState(false);
    const [showDecorate, setShowDecorate]       = useState(false);
    const [newFurnitureToAdd, setNewFurniture]  = useState(null);
    const [toastMsg, setToastMsg]               = useState('');
    const modalRef   = useRef(null);
    const touchStartY = useRef(null);

    const activeRoom = rooms[activeRoomIdx] ?? rooms[0];
    const canUnlock  = rooms.length < 4;
    const nextCost   = NEXT_ROOM_COSTS[rooms.length] ?? 3000;

    // ── Coin hook (for furniture purchase deduction) ─────────────────
    const { balance, spendCoins } = usePetCoins(kidId) ?? {};

    // ── Toast helper ─────────────────────────────────────────────────
    const showToast = useCallback((msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 2500);
    }, []);

    // ── Swipe-down to close ──────────────────────────────────────────
    const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
    const handleTouchEnd   = (e) => {
        if (!touchStartY.current) return;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        if (dy > 80) onClose();
        touchStartY.current = null;
    };

    // ── Unlock new room ──────────────────────────────────────────────
    const handleUnlock = useCallback(async () => {
        if (!canUnlock || unlocking) return;
        if (balance < nextCost) { showToast(`解锁需要 ${nextCost} 家庭币`); return; }
        setUnlocking(true);
        try {
            const result = await spendCoins(nextCost, `解锁第${rooms.length + 1}间小窝`);
            if (result?.ok) {
                await unlockRoom(`第${rooms.length + 1}间小窝`);
            } else {
                showToast('家庭币不足');
            }
        } catch (e) {
            showToast('解锁失败：' + e.message);
        } finally {
            setUnlocking(false);
        }
    }, [canUnlock, unlocking, balance, nextCost, spendCoins, unlockRoom, rooms.length, showToast]);

    // ── Buy furniture from shop ──────────────────────────────────────
    const handleBuyFurniture = useCallback(async (furnitureItem, price, name) => {
        if (!spendCoins) return showToast('初始化中...');
        const result = await spendCoins(price, `购买${name}`);
        if (result?.ok) {
            // Pass to VirtualPetDashboard via prop change
            setNewFurniture({ ...furnitureItem, _ts: Date.now() });
            showToast(`✅ ${name} 已加入房间！`);
        } else {
            showToast(`家庭币不足，需要 ${price} 币`);
        }
    }, [spendCoins, showToast]);

    // ── Toggle decoration mode ────────────────────────────────────────
    const handleToggleDecorate = () => {
        setShowDecorate(d => !d);
        setNewFurniture(null); // clear pending add
    };

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
                <div className="flex-shrink-0 px-4 pt-3 pb-2 flex items-center gap-2 relative"
                    style={{ borderBottom: '1px solid #e8e0d5' }}
                >
                    {/* Drag handle */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-300 rounded-full" />

                    {/* Room name */}
                    <div className="flex-1 mt-2">
                        <span className="text-base font-black text-slate-800">
                            {activeRoom?.roomName ?? '我的小窝'}
                        </span>
                        {showDecorate && (
                            <span className="ml-2 text-[10px] font-bold text-orange-400 bg-orange-50 px-2 py-0.5 rounded-full">
                                装饰中
                            </span>
                        )}
                    </div>

                    {/* Balance badge (shown in decorate mode) */}
                    {showDecorate && (
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-xl border border-amber-200 mt-2">
                            <span className="text-sm">🪙</span>
                            <span className="text-xs font-black text-amber-700">{balance ?? '—'}</span>
                        </div>
                    )}

                    {/* Anti-addiction timer */}
                    {!isLocked && !showDecorate && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mt-2"
                            style={{ background: remainingSeconds < 180 ? '#fef3c7' : '#f0fdf4',
                                     color:      remainingSeconds < 180 ? '#92400e' : '#166534' }}
                        >
                            <div className="w-10 h-1.5 rounded-full overflow-hidden bg-slate-200">
                                <div className="h-full rounded-full transition-all"
                                    style={{ width: `${100 - progressPct}%`,
                                             background: progressPct > 70 ? '#f87171' : '#4ade80' }} />
                            </div>
                            ⏱ {remainingLabel}
                        </div>
                    )}
                    {isLocked && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-500 mt-2">
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
                            onClick={() => { setActiveRoomIdx(idx); setShowDecorate(false); }}
                            className={`transition-all duration-200 rounded-full ${
                                idx === activeRoomIdx
                                    ? 'w-6 h-2.5 bg-orange-400'
                                    : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                            }`}
                            title={room.roomName}
                        />
                    ))}
                    {/* Unlock button */}
                    {canUnlock && !isLocked && (
                        <button
                            onClick={handleUnlock}
                            disabled={unlocking || (balance ?? 0) < nextCost}
                            className={`w-7 h-7 rounded-full border-2 border-dashed flex items-center justify-center transition-all ${
                                (balance ?? 0) >= nextCost
                                    ? 'border-orange-300 text-orange-400 hover:border-orange-500'
                                    : 'border-slate-200 text-slate-300 cursor-not-allowed'
                            }`}
                            title={`解锁新房间 (${nextCost} 币)`}
                        >
                            {unlocking
                                ? <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                                : <Icons.Plus size={14} />}
                        </button>
                    )}
                </div>

                {/* ── Locked overlay ───────────────────────────────── */}
                {isLocked && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center"
                        style={{ background: 'rgba(248,244,239,0.93)', backdropFilter: 'blur(4px)', top: '80px' }}
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

                {/* ── Main room + shop layout ──────────────────────── */}
                <div className={`flex-1 overflow-hidden flex flex-col min-h-0 transition-all duration-300`}>
                    {/* Room viewport — shrinks when shop is open */}
                    <div className={`overflow-hidden transition-all duration-300 flex-shrink-0 ${
                        showDecorate ? 'h-[48%]' : 'flex-1'
                    }`}>
                        {activeRoom && (
                            <VirtualPetDashboard
                                key={activeRoom.id}
                                activeKid={activeKid}
                                roomData={activeRoom}
                                onSkinChange={updateSkin}
                                onFurnitureChange={updateFurniture}
                                onPetVitalsChange={updatePetVitals}
                                embedded={true}
                                showDecorate={showDecorate}
                                kidId={kidId}
                                newFurnitureToAdd={newFurnitureToAdd}
                            />
                        )}
                    </div>

                    {/* Furniture shop — slides up in decorate mode */}
                    {showDecorate && (
                        <div className="flex-1 min-h-0 border-t border-slate-200">
                            <FurnitureShop
                                balance={balance ?? 0}
                                onBuyFurniture={handleBuyFurniture}
                                roomSkinIdx={activeRoom?.skinIdx ?? 0}
                                totalRoomSkins={ROOM_VARIANTS.length}
                                disabled={isLocked}
                            />
                        </div>
                    )}
                </div>

                {/* ── Bottom action bar ────────────────────────────── */}
                {!isLocked && (
                    <div className="flex-shrink-0 px-4 py-2.5 flex items-center gap-3"
                        style={{ borderTop: showDecorate ? 'none' : '1px solid #e8e0d5', background: '#f8f4ef' }}
                    >
                        <button
                            onClick={handleToggleDecorate}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                                showDecorate
                                    ? 'bg-orange-400 text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
                            }`}
                        >
                            {showDecorate ? '✅ 完成装饰' : '🎨 装饰房间'}
                        </button>

                        {showDecorate && (
                            <span className="text-[11px] text-slate-400 font-bold flex-1">
                                👆 点击背景换色 · 点家具操作
                            </span>
                        )}

                        {!showDecorate && (
                            <div className="flex-1 text-right text-xs text-slate-400 font-bold">
                                {rooms.length} / 4 个房间
                            </div>
                        )}
                    </div>
                )}

                {/* ── Toast notification ───────────────────────────── */}
                {toastMsg && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50
                        bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-2xl
                        shadow-xl opacity-90 whitespace-nowrap animate-bounce-in">
                        {toastMsg}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to   { transform: translateY(0); }
                }
                @keyframes bounce-in {
                    0%   { opacity: 0; transform: translateX(-50%) scale(0.85); }
                    60%  { transform: translateX(-50%) scale(1.05); }
                    100% { opacity: 0.9; transform: translateX(-50%) scale(1); }
                }
                .animate-bounce-in { animation: bounce-in 0.3s ease-out; }
            `}</style>
        </div>
    );
}
