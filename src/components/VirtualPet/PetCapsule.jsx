// ═══════════════════════════════════════════════════════════
// PetCapsule — 全局浮动宠物胶囊
// 始终悬浮在右下角，点击展开房间全屏弹窗
// ═══════════════════════════════════════════════════════════
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePetRooms } from '../../hooks/usePetRooms';
import { useAntiAddiction } from '../../hooks/useAntiAddiction';
import PetRoomModal from './PetRoomModal';

// ─── Mini pixel cat sprite (simple CSS animation) ─────────
const PET_EMOJI_BY_MOOD = (mood) => {
    if (mood >= 80) return '😸';
    if (mood >= 60) return '😺';
    if (mood >= 40) return '😿';
    return '😾';
};

export default function PetCapsule({ kidId, completedTasksToday = 0 }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [pos, setPos] = useState({ right: 16, bottom: 80 });
    const capsuleRef = useRef(null);
    const dragStartRef = useRef(null);

    const { rooms, activeRoom, activeRoomIdx, setActiveRoomIdx, loading,
            updateSkin, updateFurniture, updatePetVitals, unlockRoom } = usePetRooms(kidId);

    const { remainingSeconds, limitSeconds, isLocked, remainingLabel, progressPct,
            startSession, endSession, showWarning, dismissWarning } = useAntiAddiction(kidId, completedTasksToday);

    // Short-circuit if no room data yet
    const mood = activeRoom?.petMood ?? 100;
    const hunger = activeRoom?.petHunger ?? 100;

    // ── Open / Close room modal ──────────────────────────────────────
    const openRoom = useCallback(() => {
        if (isDragging) return;
        if (isLocked) {
            // Still open but show locked state inside modal
        }
        setIsOpen(true);
        startSession();
    }, [isDragging, isLocked, startSession]);

    const closeRoom = useCallback(() => {
        setIsOpen(false);
        endSession();
    }, [endSession]);

    // ── Drag to reposition ───────────────────────────────────────────
    const handlePointerDown = useCallback((e) => {
        if (e.target.closest('[data-no-drag]')) return;
        dragStartRef.current = {
            startX: e.clientX, startY: e.clientY,
            startRight: pos.right, startBottom: pos.bottom,
            moved: false,
        };
        const onMove = (mv) => {
            const dx = mv.clientX - dragStartRef.current.startX;
            const dy = mv.clientY - dragStartRef.current.startY;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                dragStartRef.current.moved = true;
                setIsDragging(true);
                const newRight = Math.max(8, Math.min(window.innerWidth - 100, dragStartRef.current.startRight - dx));
                const newBottom = Math.max(70, Math.min(window.innerHeight - 100, dragStartRef.current.startBottom - dy));
                setPos({ right: newRight, bottom: newBottom });
            }
        };
        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            setTimeout(() => setIsDragging(false), 50);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    }, [pos]);

    if (loading) return null;

    return (
        <>
            {/* ── Floating Capsule ─────────────────────────────────── */}
            <div
                ref={capsuleRef}
                onPointerDown={handlePointerDown}
                onClick={openRoom}
                className="fixed z-[80] select-none touch-none"
                style={{ right: pos.right, bottom: pos.bottom }}
            >
                <div className={`
                    relative flex items-center gap-2 pl-2 pr-3 py-1.5
                    rounded-full shadow-2xl cursor-pointer
                    border border-white/30 backdrop-blur-md
                    transition-all duration-300 active:scale-95
                    ${isLocked
                        ? 'bg-slate-500/80 opacity-70'
                        : 'bg-white/90 hover:bg-white hover:shadow-orange-200/50'
                    }
                `}
                style={{ boxShadow: isLocked ? undefined : '0 8px 32px rgba(255,140,66,0.25)' }}
                >
                    {/* Pet emoji preview */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xl
                        bg-gradient-to-br from-orange-100 to-amber-50 border border-orange-200/50
                        ${isLocked ? 'grayscale' : 'animate-[bounce_3s_ease-in-out_infinite]'}
                    `}>
                        {isLocked ? '😴' : PET_EMOJI_BY_MOOD(mood)}
                    </div>

                    {/* Status info */}
                    <div className="flex flex-col gap-0.5 min-w-[60px]">
                        {/* Room name */}
                        <span className="text-[10px] font-black text-slate-700 leading-none">
                            {activeRoom?.roomName ?? '我的小窝'}
                        </span>

                        {/* Hunger bar */}
                        <div className="flex items-center gap-1">
                            <span className="text-[9px] text-slate-400">🍖</span>
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${hunger}%`,
                                        background: hunger > 50 ? '#4ade80' : hunger > 25 ? '#fbbf24' : '#f87171'
                                    }} />
                            </div>
                        </div>

                        {/* Time remaining (show when limited) */}
                        {isLocked ? (
                            <span className="text-[9px] text-red-400 font-bold leading-none">已休息 🔒</span>
                        ) : remainingSeconds < limitSeconds * 0.3 ? (
                            <span className="text-[9px] text-orange-400 font-bold leading-none">剩 {remainingLabel}</span>
                        ) : null}
                    </div>

                    {/* Notification dot: hunger low */}
                    {hunger < 30 && !isLocked && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full
                            flex items-center justify-center text-[8px] text-white font-black
                            animate-pulse shadow-md"
                        >!</div>
                    )}

                    {/* Time progress ring */}
                    {!isLocked && (
                        <div className="absolute inset-0 rounded-full pointer-events-none overflow-hidden opacity-20">
                            <div className="absolute inset-0 rounded-full border-2 border-orange-300" />
                        </div>
                    )}
                </div>

                {/* Tail indicator */}
                <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2
                    w-3 h-3 rotate-45 rounded-sm
                    ${isLocked ? 'bg-slate-500/80' : 'bg-white/90'}`}
                />
            </div>

            {/* ── Anti-Addiction Warning Banner ────────────────────── */}
            {showWarning && !isLocked && (
                <div className="fixed bottom-28 right-4 z-[85] max-w-[220px]
                    bg-amber-400 text-amber-900 px-4 py-3 rounded-2xl shadow-xl
                    text-xs font-bold animate-bounce-in"
                >
                    <p className="mb-2">已玩 5 分钟啦 🐱</p>
                    <p className="text-[10px] opacity-80 mb-2">去完成一个任务再回来？</p>
                    <button data-no-drag
                        onClick={(e) => { e.stopPropagation(); dismissWarning(); }}
                        className="w-full bg-amber-900/20 rounded-xl py-1 text-[10px] font-black hover:bg-amber-900/30 transition-colors"
                    >知道啦～</button>
                </div>
            )}

            {/* ── Room Modal ───────────────────────────────────────── */}
            {isOpen && (
                <PetRoomModal
                    rooms={rooms}
                    activeRoomIdx={activeRoomIdx}
                    setActiveRoomIdx={setActiveRoomIdx}
                    updateSkin={updateSkin}
                    updateFurniture={updateFurniture}
                    updatePetVitals={updatePetVitals}
                    unlockRoom={unlockRoom}
                    kidId={kidId}
                    isLocked={isLocked}
                    remainingLabel={remainingLabel}
                    remainingSeconds={remainingSeconds}
                    limitSeconds={limitSeconds}
                    progressPct={progressPct}
                    onClose={closeRoom}
                />
            )}
        </>
    );
}
