// ═══════════════════════════════════════════════════════════
// PetCapsule — 全局浮动小猫
// 彩虹旋转光环 · 自动淡出 · 可拖动 · 长按收起/恢复
// ═══════════════════════════════════════════════════════════
import React, { useState, useRef, useEffect, useCallback } from 'react';
import PetBoxTeaser from './PetBoxTeaser';

const ENCOURAGE_MESSAGES = [
    '太棒了！继续加油～ 🌟', '你真的很厉害！🎉',
    '喵！又完成了一个！💪', '为你骄傲！✨',
    '今天超级给力！🚀',     '喵喵为你欢呼！🎊',
    '你是最棒的小朋友！🌈', '好厉害！继续努力！⭐',
];
const IDLE_MESSAGES = [
    '喵~ 今天要努力哦！', '一起加油！喵～',
    '有我陪着你呢 🐱',   '记得按时完成任务～',
];
function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const SIZE           = 88;
const OPACITY_ACTIVE = 1;
const OPACITY_IDLE   = 0.22;
const IDLE_DELAY     = 4000; // ms before auto-fade

export default function PetCapsule({ kidId, completedTasksToday = 0 }) {
    const [pos,        setPos]        = useState({ right: 20, bottom: 90 });
    const [bubble,     setBubble]     = useState(null);
    const [hidden,     setHidden]     = useState(false);
    const [showManage, setShowManage] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [opacity,    setOpacity]    = useState(OPACITY_ACTIVE);

    const bubbleTimer    = useRef(null);
    const idleTimer      = useRef(null);
    const longPressTimer = useRef(null);
    const dragStart      = useRef(null);
    const didDragRef     = useRef(false);
    const didLongPress   = useRef(false); // absorb click that ends a long press
    const prevTasks      = useRef(completedTasksToday);

    useEffect(() => () => {
        clearTimeout(bubbleTimer.current);
        clearTimeout(idleTimer.current);
        clearTimeout(longPressTimer.current);
    }, []);

    // ── Auto-fade logic ─────────────────────────────────────
    const keepActive = useCallback(() => {
        setOpacity(OPACITY_ACTIVE);
        clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => setOpacity(OPACITY_IDLE), IDLE_DELAY);
    }, []);

    useEffect(() => { keepActive(); }, [keepActive]);

    // ── Show bubble ─────────────────────────────────────────
    const showBubble = useCallback((text, type, ms = 4000) => {
        clearTimeout(bubbleTimer.current);
        setBubble({ text, type });
        keepActive();
        bubbleTimer.current = setTimeout(() => setBubble(null), ms);
    }, [keepActive]);

    // Task completion → encourage
    useEffect(() => {
        if (completedTasksToday > prevTasks.current) {
            const t = setTimeout(() =>
                showBubble(randomPick(ENCOURAGE_MESSAGES), 'encourage', 5000), 800);
            prevTasks.current = completedTasksToday;
            return () => clearTimeout(t);
        }
        prevTasks.current = completedTasksToday;
    }, [completedTasksToday, showBubble]);

    // ── Drag + Long press ───────────────────────────────────
    const handlePointerDown = useCallback((e) => {
        e.preventDefault();
        didDragRef.current   = false;
        didLongPress.current = false;
        keepActive();

        // 600ms → show manage overlay, mark long-press so next click is ignored
        longPressTimer.current = setTimeout(() => {
            if (!didDragRef.current) {
                setShowManage(true);
                didLongPress.current = true;
            }
        }, 600);

        dragStart.current = { x: e.clientX, y: e.clientY, r: pos.right, b: pos.bottom };

        const onMove = (mv) => {
            const dx = mv.clientX - dragStart.current.x;
            const dy = mv.clientY - dragStart.current.y;
            if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
                didDragRef.current = true;
                clearTimeout(longPressTimer.current);
                setShowManage(false);
                setIsDragging(true);
                setPos({
                    right:  Math.max(8, Math.min(window.innerWidth  - SIZE - 8, dragStart.current.r - dx)),
                    bottom: Math.max(60, Math.min(window.innerHeight - SIZE - 8, dragStart.current.b - dy)),
                });
            }
        };
        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup',   onUp);
            clearTimeout(longPressTimer.current);
            requestAnimationFrame(() => setIsDragging(false));
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup',   onUp);
    }, [pos, keepActive]);

    const handleClick = useCallback(() => {
        if (didDragRef.current) return;
        // If this click ended a long-press, eat it so manage overlay stays
        if (didLongPress.current) { didLongPress.current = false; return; }
        if (showManage) { setShowManage(false); return; }
        showBubble(randomPick(IDLE_MESSAGES), 'idle', 3500);
    }, [showManage, showBubble]);

    // Hover → keep active
    const handleMouseEnter = useCallback(() => keepActive(), [keepActive]);
    const handleMouseLeave = useCallback(() => {
        clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => setOpacity(OPACITY_IDLE), IDLE_DELAY);
    }, []);

    const effectiveOpacity = (bubble || showManage) ? OPACITY_ACTIVE : opacity;

    // ── Hidden edge tab ─────────────────────────────────────
    if (hidden) {
        return (
            <>
                <style>{`@keyframes petEdgeIn { from{transform:translateX(100%)} to{transform:translateX(0)} }`}</style>
                <div
                    className="fixed z-[80] cursor-pointer select-none"
                    style={{ right: 0, bottom: pos.bottom, animation: 'petEdgeIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}
                    onClick={() => { setHidden(false); setShowManage(false); }}
                >
                    <div style={{
                        background: 'linear-gradient(160deg, #FF8C42, #FF4757)',
                        borderRadius: '14px 0 0 14px',
                        padding: '10px 8px 10px 13px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        boxShadow: '-4px 4px 24px rgba(255,71,87,0.4), inset 1px 1px 0 rgba(255,255,255,0.25)',
                    }}>
                        <span style={{ fontSize: 20 }}>🐱</span>
                        <span style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.9)', writingMode: 'vertical-rl', letterSpacing: 1 }}>叫我</span>
                    </div>
                </div>
            </>
        );
    }

    // ── Main capsule ────────────────────────────────────────
    return (
        <>
            <style>{`
                @keyframes petFloat {
                    0%,100% { transform: translateY(0px);  }
                    50%     { transform: translateY(-7px); }
                }
                @keyframes petRingSpin { to { transform: rotate(360deg); } }
                @keyframes petGlow {
                    0%,100% { opacity:.55; transform:scale(1);    }
                    50%     { opacity:.9;  transform:scale(1.18); }
                }
                @keyframes petBubbleIn {
                    from { opacity:0; transform:scale(0.6) translateY(12px); }
                    to   { opacity:1; transform:scale(1)   translateY(0); }
                }
                @keyframes petManageIn {
                    from { opacity:0; transform:scale(0.85); }
                    to   { opacity:1; transform:scale(1); }
                }
            `}</style>

            <div
                className="fixed z-[80] select-none touch-none"
                style={{
                    right: pos.right, bottom: pos.bottom,
                    opacity: effectiveOpacity,
                    transition: 'opacity 1.2s ease',
                }}
                onPointerDown={handlePointerDown}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* ── Bubble ────────────────────────────────── */}
                {bubble && (
                    <div className="absolute pointer-events-none" style={{
                        bottom: SIZE + 8, right: 0,
                        animation: 'petBubbleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards', zIndex: 2,
                    }}>
                        <div style={{
                            ...(bubble.type === 'encourage'
                                ? { background: 'linear-gradient(135deg,#FF8C42,#FF6B6B)', color:'#fff', boxShadow:'0 8px 24px rgba(255,107,107,0.4)' }
                                : { background: 'rgba(255,255,255,0.96)', color:'#2d3748', border:'1.5px solid rgba(255,255,255,0.9)', boxShadow:'0 8px 24px rgba(0,0,0,0.12)' }
                            ),
                            padding:'8px 13px', borderRadius:'14px 14px 4px 14px',
                            fontSize:12, fontWeight:700, maxWidth:160, textAlign:'center',
                            backdropFilter:'blur(8px)', lineHeight:1.4, position:'relative',
                        }}>
                            {bubble.text}
                            <div style={{
                                position:'absolute', bottom:-6, right:10, width:12, height:12,
                                background: bubble.type==='encourage' ? '#FF6B6B' : 'rgba(255,255,255,0.96)',
                                transform:'rotate(45deg)', borderRadius:2,
                            }} />
                        </div>
                    </div>
                )}

                {/* ── Ring + cat ────────────────────────────── */}
                <div style={{
                    width: SIZE, height: SIZE, position: 'relative', cursor: 'grab',
                    animation: isDragging ? 'none' : 'petFloat 3.2s ease-in-out infinite',
                    transform: isDragging ? 'scale(1.08)' : undefined,
                    transition: isDragging ? 'transform 0.15s' : undefined,
                }}>
                    {/* Outer glow */}
                    <div style={{
                        position:'absolute', inset:-12, borderRadius:'50%',
                        background:'radial-gradient(circle,rgba(255,140,66,0.35) 0%,transparent 70%)',
                        animation:'petGlow 2.4s ease-in-out infinite', pointerEvents:'none',
                    }} />
                    {/* Rainbow ring */}
                    <div style={{
                        position:'absolute', inset:0, borderRadius:'50%',
                        background:'conic-gradient(from 0deg,#FF6B6B,#FF8C42,#FFD93D,#4ECDC4,#8B5CF6,#EC4899,#FF6B6B)',
                        WebkitMask:'radial-gradient(circle at center,transparent 83%,black 83%)',
                        mask:'radial-gradient(circle at center,transparent 83%,black 83%)',
                        animation:'petRingSpin 3.5s linear infinite',
                    }} />
                    {/* Inner shadow */}
                    <div style={{ position:'absolute', inset:4, borderRadius:'50%', boxShadow:'inset 0 2px 6px rgba(0,0,0,0.12),0 2px 12px rgba(255,140,66,0.2)' }} />
                    {/* Cat interior */}
                    <div style={{
                        position:'absolute', inset:5, borderRadius:'50%',
                        background:'radial-gradient(circle at 38% 32%,#FFF5EE,#FFE9D5)',
                        display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden',
                    }}>
                        <div style={{ transform:'translateY(-8px)', lineHeight:0 }}>
                            <PetBoxTeaser size={72} />
                        </div>
                    </div>

                    {/* ── Manage overlay (long press) ────────── */}
                    {showManage && (
                        <div
                            style={{
                                position:'absolute', inset:0, borderRadius:'50%',
                                background:'rgba(15,15,25,0.75)',
                                backdropFilter:'blur(6px)',
                                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4,
                                zIndex:5,
                                animation:'petManageIn 0.2s ease-out',
                            }}
                        >
                            <button
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setHidden(true);
                                    setShowManage(false);
                                }}
                                style={{
                                    background:'linear-gradient(135deg,#FF8C42,#FF4757)',
                                    border:'none', borderRadius:10, color:'white',
                                    fontSize:11, fontWeight:900, padding:'5px 12px',
                                    cursor:'pointer', boxShadow:'0 4px 12px rgba(255,71,87,0.4)',
                                    pointerEvents:'all',
                                }}
                            >
                                🙈 收起
                            </button>
                            <span
                                style={{ color:'rgba(255,255,255,0.4)', fontSize:8.5, fontWeight:700, pointerEvents:'none' }}
                            >
                                点空白处关闭
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
