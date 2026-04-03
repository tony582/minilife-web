// ═══════════════════════════════════════════════════════════
// PetCapsule — 全局浮动小猫
// 圆形磨玻璃背景 + 自动淡出（4s无交互→半透明）
// ═══════════════════════════════════════════════════════════
import React, { useState, useRef, useEffect, useCallback } from 'react';
import PetBoxTeaser from './PetBoxTeaser';

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

// 不透明度状态
const OPACITY_ACTIVE = 1;
const OPACITY_IDLE   = 0.22; // 背景有内容时很透明
const IDLE_DELAY_MS  = 4000; // 4秒无交互后淡出

export default function PetCapsule({ kidId, completedTasksToday = 0 }) {
    const [bubble,     setBubble]     = useState(null);
    const [pos,        setPos]        = useState({ right: 20, bottom: 80 });
    const [opacity,    setOpacity]    = useState(OPACITY_ACTIVE);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered,  setIsHovered]  = useState(false);

    const bubbleTimerRef  = useRef(null);
    const idleTimerRef    = useRef(null);
    const prevTasksRef    = useRef(completedTasksToday);
    const dragStartRef    = useRef(null);

    // ── 动活跃状态：任何交互重置淡出计时器 ─────────────────────
    const keepActive = useCallback(() => {
        setOpacity(OPACITY_ACTIVE);
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
            setOpacity(OPACITY_IDLE);
        }, IDLE_DELAY_MS);
    }, []);

    // 挂载时启动计时
    useEffect(() => {
        keepActive();
        return () => {
            clearTimeout(idleTimerRef.current);
            clearTimeout(bubbleTimerRef.current);
        };
    }, [keepActive]);

    // ── 气泡显示 ────────────────────────────────────────────────
    const showBubble = useCallback((text, type = 'idle', duration = 4000) => {
        clearTimeout(bubbleTimerRef.current);
        setBubble({ text, type });
        keepActive(); // 气泡期间保持可见
        bubbleTimerRef.current = setTimeout(() => setBubble(null), duration);
    }, [keepActive]);

    // ── 打卡/任务完成 → 鼓励气泡 ────────────────────────────────
    useEffect(() => {
        if (completedTasksToday > prevTasksRef.current) {
            const t = setTimeout(() => {
                showBubble(randomPick(ENCOURAGE_MESSAGES), 'encourage', 5000);
            }, 800);
            prevTasksRef.current = completedTasksToday;
            return () => clearTimeout(t);
        }
        prevTasksRef.current = completedTasksToday;
    }, [completedTasksToday, showBubble]);

    // ── 点击 → 打招呼 ────────────────────────────────────────────
    const handleClick = useCallback(() => {
        if (isDragging) return;
        showBubble(randomPick(IDLE_MESSAGES), 'idle', 3500);
    }, [isDragging, showBubble]);

    // ── 拖拽移位 ─────────────────────────────────────────────────
    const handlePointerDown = useCallback((e) => {
        keepActive();
        dragStartRef.current = {
            startX: e.clientX, startY: e.clientY,
            startRight: pos.right, startBottom: pos.bottom,
        };
        const onMove = (mv) => {
            const dx = mv.clientX - dragStartRef.current.startX;
            const dy = mv.clientY - dragStartRef.current.startY;
            if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
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
    }, [pos, keepActive]);

    // 悬停时保持活跃
    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
        keepActive();
    }, [keepActive]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        // 离开后重新启动淡出计时
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => setOpacity(OPACITY_IDLE), IDLE_DELAY_MS);
    }, []);

    // 当有气泡时始终完全可见
    const effectiveOpacity = bubble ? OPACITY_ACTIVE : opacity;

    return (
        <div
            className="fixed z-[80] select-none touch-none"
            style={{
                right:       pos.right,
                bottom:      pos.bottom,
                opacity:     effectiveOpacity,
                transition:  'opacity 1.2s ease',
                pointerEvents: 'auto',
            }}
            onPointerDown={handlePointerDown}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* ── 气泡 ─────────────────────────────────────────── */}
            {bubble && (
                <div
                    key={bubble.text}
                    className="absolute bottom-full right-0 mb-2 pointer-events-none"
                    style={{ animation: 'petBubbleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
                >
                    <div className={`
                        relative px-3 py-2 rounded-2xl rounded-br-sm shadow-xl
                        text-xs font-bold leading-snug max-w-[150px] text-center
                        ${bubble.type === 'encourage'
                            ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white'
                            : 'bg-white/95 text-slate-700 border border-white/60 backdrop-blur-sm'
                        }
                    `}>
                        {bubble.text}
                        <div className={`
                            absolute -bottom-1.5 right-5 w-3 h-3 rotate-45 rounded-sm
                            ${bubble.type === 'encourage' ? 'bg-amber-500' : 'bg-white/95'}
                        `} />
                    </div>
                </div>
            )}

            {/* ── 圆形磨玻璃容器 + 猫动画 ─────────────────────── */}
            <div
                className={`
                    relative flex items-center justify-center
                    rounded-full cursor-pointer
                    transition-transform duration-200
                    ${isDragging ? '' : 'hover:scale-110 active:scale-95'}
                `}
                style={{
                    width:  88,
                    height: 88,
                    background:    'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.18) 100%)',
                    backdropFilter:'blur(12px) saturate(1.4)',
                    WebkitBackdropFilter: 'blur(12px) saturate(1.4)',
                    border:        '1.5px solid rgba(255,255,255,0.5)',
                    boxShadow:     '0 8px 32px rgba(255,140,66,0.18), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
                }}
                title="点我打招呼"
            >
                {/* 内发光圈（纯装饰） */}
                <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle at 30% 25%, rgba(255,200,100,0.15) 0%, transparent 65%)',
                    }}
                />
                <PetBoxTeaser size={68} />
            </div>

            {/* 全局动画 */}
            <style>{`
                @keyframes petBubbleIn {
                    0%   { opacity: 0; transform: scale(0.6) translateY(10px); }
                    100% { opacity: 1; transform: scale(1)   translateY(0); }
                }
            `}</style>
        </div>
    );
}
