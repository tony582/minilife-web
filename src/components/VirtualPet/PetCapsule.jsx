// ═══════════════════════════════════════════════════════════
// PetCapsule — 全局浮动小猫
// 右下角漂浮的小猫盒子动画，任务完成后弹出鼓励气泡
// ═══════════════════════════════════════════════════════════
import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import PetBoxTeaser from './PetBoxTeaser';

// 鼓励语列表
const ENCOURAGE_MESSAGES = [
    '太棒了！继续加油～ 🌟',
    '你真的很厉害！🎉',
    '喵！又完成了一个！💪',
    '为你骄傲！✨',
    '今天超级给力！🚀',
    '喵喵为你欢呼！🎊',
    '你是最棒的小朋友！🌈',
    '好厉害！继续努力！⭐',
];

const IDLE_MESSAGES = [
    '喵~ 今天要努力哦！',
    '一起加油！喵～',
    '有我陪着你呢 🐱',
    '记得按时完成任务～',
];

function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export default function PetCapsule({ kidId, completedTasksToday = 0 }) {
    const [bubble, setBubble] = useState(null); // { text, type: 'encourage'|'idle' }
    const [pos, setPos] = useState({ right: 20, bottom: 80 });
    const [isDragging, setIsDragging] = useState(false);
    const bubbleTimerRef = useRef(null);
    const prevTasksRef = useRef(completedTasksToday);
    const dragStartRef = useRef(null);

    // ── Show bubble for N seconds then hide ─────────────────────────
    const showBubble = useCallback((text, type = 'idle', duration = 4000) => {
        clearTimeout(bubbleTimerRef.current);
        setBubble({ text, type });
        bubbleTimerRef.current = setTimeout(() => setBubble(null), duration);
    }, []);

    // ── Task completed → encouragement bubble ────────────────────────
    useEffect(() => {
        if (completedTasksToday > prevTasksRef.current) {
            // Delay slightly so it appears after the task animation
            const t = setTimeout(() => {
                showBubble(randomPick(ENCOURAGE_MESSAGES), 'encourage', 5000);
            }, 800);
            return () => clearTimeout(t);
        }
        prevTasksRef.current = completedTasksToday;
    }, [completedTasksToday, showBubble]);

    useEffect(() => {
        prevTasksRef.current = completedTasksToday;
    }, [completedTasksToday]);

    useEffect(() => {
        return () => clearTimeout(bubbleTimerRef.current);
    }, []);

    // ── Click → idle message ─────────────────────────────────────────
    const handleClick = useCallback(() => {
        if (isDragging) return;
        showBubble(randomPick(IDLE_MESSAGES), 'idle', 3500);
    }, [isDragging, showBubble]);

    // ── Drag to reposition ───────────────────────────────────────────
    const handlePointerDown = useCallback((e) => {
        dragStartRef.current = {
            startX: e.clientX, startY: e.clientY,
            startRight: pos.right, startBottom: pos.bottom,
            moved: false,
        };
        const onMove = (mv) => {
            const dx = mv.clientX - dragStartRef.current.startX;
            const dy = mv.clientY - dragStartRef.current.startY;
            if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
                dragStartRef.current.moved = true;
                setIsDragging(true);
                const newRight  = Math.max(8, Math.min(window.innerWidth  - 90, dragStartRef.current.startRight  - dx));
                const newBottom = Math.max(60, Math.min(window.innerHeight - 90, dragStartRef.current.startBottom - dy));
                setPos({ right: newRight, bottom: newBottom });
            }
        };
        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup',   onUp);
            setTimeout(() => setIsDragging(false), 50);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup',   onUp);
        e.preventDefault();
    }, [pos]);

    return (
        <div
            className="fixed z-[80] select-none touch-none"
            style={{ right: pos.right, bottom: pos.bottom }}
            onPointerDown={handlePointerDown}
            onClick={handleClick}
        >
            {/* ── Speech Bubble ────────────────────────────────────── */}
            {bubble && (
                <div
                    key={bubble.text}
                    className="absolute bottom-full right-0 mb-2 pointer-events-none"
                    style={{ animation: 'petBubbleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
                >
                    <div className={`
                        relative px-3 py-2 rounded-2xl rounded-br-sm shadow-xl
                        text-xs font-bold leading-snug max-w-[140px] text-center whitespace-pre-wrap
                        ${bubble.type === 'encourage'
                            ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white'
                            : 'bg-white text-slate-700 border border-slate-100'
                        }
                    `}>
                        {bubble.text}
                        {/* bubble tail */}
                        <div className={`
                            absolute -bottom-1.5 right-4 w-3 h-3 rotate-45 rounded-sm
                            ${bubble.type === 'encourage' ? 'bg-amber-500' : 'bg-white border-r border-b border-slate-100'}
                        `} />
                    </div>
                </div>
            )}

            {/* ── Cat in Box ───────────────────────────────────────── */}
            <div
                className={`
                    cursor-pointer transition-transform duration-200
                    ${isDragging ? '' : 'hover:scale-110 active:scale-95'}
                `}
                title="点我打招呼"
            >
                <PetBoxTeaser size={72} />
            </div>

            {/* Global animation keyframes */}
            <style>{`
                @keyframes petBubbleIn {
                    0%   { opacity: 0; transform: scale(0.7) translateY(8px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
