import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../../utils/Icons';
import PixelPetEngine from './PixelPetEngine';
import { SPIRIT_FORMS } from '../../utils/spiritUtils';
import { DEFAULT_ROOM, FURNITURE_VARIANTS, ROOM_VARIANTS } from '../../data/roomConfig';

// ═══════════════════════════════════════════════
// 🌅 DAY/NIGHT CYCLE
// ═══════════════════════════════════════════════
const SYSTEM_ICONS = {
    sun: {
        palette: { '#': '#f59e0b', 'o': '#fcd34d' },
        grid: [
            " # # ",
            "#ooo#",
            " ooo ",
            "#ooo#",
            " # # "
        ]
    },
    moon: {
        palette: { '#': '#475569', 'o': '#cbd5e1' },
        grid: [
            "  ## ",
            " #o# ",
            "  o# ",
            " #o# ",
            "  ## "
        ]
    }
};

// ═══════════════════════════════════════════════
// 🌅 DAY/NIGHT CYCLE
// ═══════════════════════════════════════════════
const TIME_PHASES = {
    dawn:      { sky: 'bg-gradient-to-b from-orange-300 to-amber-200', windowBg: 'bg-orange-200', label: '清晨', greeting: '早安主人！新的一天开始啦~' },
    day:       { sky: 'bg-[#93c5fd]', windowBg: 'bg-[#38bdf8]', label: '白天', greeting: null },
    dusk:      { sky: 'bg-gradient-to-b from-purple-400 to-orange-300', windowBg: 'bg-orange-400', label: '黄昏', greeting: null },
    night:     { sky: 'bg-gradient-to-b from-indigo-900 to-slate-800', windowBg: 'bg-indigo-950', label: '夜晚', greeting: null },
    lateNight: { sky: 'bg-gradient-to-b from-slate-950 to-slate-900', windowBg: 'bg-slate-950', label: '深夜', greeting: '太晚了，该睡觉啦 Zzz' },
};

const getTimePhase = () => {
    const h = new Date().getHours();
    if (h >= 6 && h < 8) return 'dawn';
    if (h >= 8 && h < 17) return 'day';
    if (h >= 17 && h < 19) return 'dusk';
    if (h >= 19 && h < 22) return 'night';
    return 'lateNight';
};

// ── PIXEL RENDERER ──
const PixelIcon = ({ grid, palette, size = 3, className = "" }) => {
    const boxSize = grid[0].length * size;
    let shadows = [];
    grid.forEach((row, y) => {
        for(let x = 0; x < row.length; x++) {
            const char = row[x];
            if (char !== ' ' && palette[char]) {
                shadows.push(`${x * size}px ${y * size}px 0 ${palette[char]}`);
            }
        }
    });
    return (
        <div className={`relative flex-shrink-0 origin-center ${className}`} style={{ width: boxSize, height: boxSize }}>
            <div className="absolute top-0 left-0 transition-transform group-hover:scale-[1.05]" style={{
                width: size, height: size,
                boxShadow: shadows.join(','),
                backgroundColor: 'transparent'
            }} />
        </div>
    );
};

export default function VirtualPetDashboard({ activeKid, onClose }) {
    
    const petRef = useRef(null);
    const containerRef = useRef(null);
    const [engineSize, setEngineSize] = useState({ w: 400, h: 300 });

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(entries => {
            const entry = entries[0];
            if (entry) {
                setEngineSize({ w: entry.contentRect.width, h: entry.contentRect.height });
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // ── GAME STATE ──
    const [stats, setStats] = useState({ satiety: 60, clean: 100, mood: 85 });
    const [poops, setPoops] = useState([]);
    const [isSick, setIsSick] = useState(false);
    const [isSleeping, setIsSleeping] = useState(false);
    
    // ── DEBUG CONTROLS ──
    const [debugTimePhase, setDebugTimePhase] = useState(null); // null = auto
    const [debugSpecies, setDebugSpecies] = useState('cat');
    const [debugBondLevel, setDebugBondLevel] = useState(null); // null = use real level
    
    // ── SCENE STATE ──
    const [activeScene, setActiveScene] = useState('home');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [roomConfig, setRoomConfig] = useState(DEFAULT_ROOM);

    // ── ROOM SKIN (background color cycling) ──
    const [roomSkinIdx, setRoomSkinIdx] = useState(0);
    const currentRoomSrc = ROOM_VARIANTS[roomSkinIdx] ?? ROOM_VARIANTS[0];

    const handleRoomClick = (e) => {
        if (isEditMode) return;
        // Only trigger if clicking on the bare room (not on furniture)
        if (e.target !== e.currentTarget) return;
        setRoomSkinIdx(prev => (prev + 1) % ROOM_VARIANTS.length);
    };

    // ── FURNITURE COLOR SKINS ──
    // { furnitureId → currentSrc } — overrides the default src on click
    const [furnitureSkins, setFurnitureSkins] = useState({});

    const handleFurnitureClick = (e, item) => {
        if (isEditMode) return; // drag mode handles pointer events
        const variants = FURNITURE_VARIANTS[item.id];
        if (!variants || variants.length <= 1) return;
        e.stopPropagation();
        setFurnitureSkins(prev => {
            const currentSrc = prev[item.id] || item.src;
            const currentIdx = variants.indexOf(currentSrc);
            const nextIdx = (currentIdx + 1) % variants.length;
            return { ...prev, [item.id]: variants[nextIdx] };
        });
    };
    
    // ── EDIT MODE (DRAG & DROP) ──
    const [isEditMode, setIsEditMode] = useState(false);
    const [draggingId, setDraggingId] = useState(null);
    const roomAspectRef = useRef(null);
    const lastPosRef = useRef(null);

    const handlePointerDown = (e, id) => {
        if (!isEditMode) return;
        // Don't preventDefault here as it can break touch
        setDraggingId(id);
        lastPosRef.current = { x: e.clientX, y: e.clientY };
    };

    useEffect(() => {
        if (!draggingId || !isEditMode) return;

        const handleWinMove = (e) => {
            if (!roomAspectRef.current || !lastPosRef.current) return;
            
            // For touch devices, standard pointermove doesn't use preventDefault easily unless we use touch-action: none.
            const dx = e.clientX - lastPosRef.current.x;
            const dy = e.clientY - lastPosRef.current.y;
            lastPosRef.current = { x: e.clientX, y: e.clientY };
            
            const rect = roomAspectRef.current.getBoundingClientRect();
            const moveXPct = (dx / rect.width) * 100;
            const moveYPct = (dy / rect.height) * 100;

            setRoomConfig(prev => ({
                ...prev,
                furniture: prev.furniture.map(f => {
                    if (f.id === draggingId) {
                        const currentLeft = parseFloat(f.style.left) || 0;
                        const currentBottom = parseFloat(f.style.bottom) || 0;
                        return {
                            ...f,
                            style: {
                                ...f.style,
                                left: `${(currentLeft + moveXPct).toFixed(3)}%`,
                                bottom: `${(currentBottom - moveYPct).toFixed(3)}%`
                            }
                        };
                    }
                    return f;
                })
            }));
        };

        const handleWinUp = () => {
            setDraggingId(null);
            lastPosRef.current = null;
        };

        window.addEventListener('pointermove', handleWinMove, { passive: false });
        window.addEventListener('pointerup', handleWinUp);
        window.addEventListener('pointercancel', handleWinUp);

        return () => {
            window.removeEventListener('pointermove', handleWinMove);
            window.removeEventListener('pointerup', handleWinUp);
            window.removeEventListener('pointercancel', handleWinUp);
        };
    }, [isEditMode, draggingId]);
    // ── CINEMATIC STATES ──
    const [isFeeding, setIsFeeding] = useState(false);
    const [bowlHasFood, setBowlHasFood] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);
    const [speechBubble, setSpeechBubble] = useState(null);
    
    // ── NEEDS BUBBLE & TOUCH STATES ──
    const [wantsBubble, setWantsBubble] = useState(null);
    const clickCountRef = useRef(0);
    const clickResetTimer = useRef(null);


    // ── DAY/NIGHT CYCLE ──
    const [timePhase, setTimePhase] = useState(getTimePhase());
    useEffect(() => {
        const interval = setInterval(() => setTimePhase(getTimePhase()), 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);
    const timeConfig = TIME_PHASES[debugTimePhase || timePhase];
    const isNightTime = (debugTimePhase || timePhase) === 'night' || (debugTimePhase || timePhase) === 'lateNight';

    // Auto-sleep at late night
    useEffect(() => {
        if (timePhase === 'lateNight' && !isSleeping && activeScene === 'home') {
            setIsSleeping(true);
            if (petRef.current) petRef.current.sleep();
            triggerSpeech(TIME_PHASES.lateNight.greeting, '50%', 500, 3000);
        }
    }, [timePhase, activeScene]); // eslint-disable-line react-hooks/exhaustive-deps

    const triggerSpeech = (text, posX, delay = 0, duration = 3000) => {
        setTimeout(() => {
            setSpeechBubble({ text, x: posX });
            setTimeout(() => setSpeechBubble(null), duration);
        }, delay);
    };

    // ── GAME LOOP ──
    useEffect(() => {
        const interval = setInterval(() => {
            if (isSleeping) return;
            
            setStats(s => {
                const poopsPenalty = Math.max(0, poops.length - 1) * 0.3;
                
                // Night time = mood decays slower (cozy), day = normal
                const timeMoodMult = isNightTime ? 0.6 : 1.0;
                
                let newSatiety = Math.max(0, s.satiety - 0.014); 
                let newClean = Math.max(0, s.clean - (0.008 + poops.length * 0.005)); 
                let newMood = Math.max(0, s.mood - ((0.01 + poopsPenalty * 0.01) * timeMoodMult));
                
                // Poop Spawner
                const poopChance = 0.008;
                if (activeScene === 'home' && Math.random() < poopChance && s.satiety > 20 && poops.length < 5) {
                    setPoops(prev => [...prev, {
                        id: Date.now() + Math.random(),
                        x: engineSize.w * 0.8 + (Math.random() * 40 - 20),
                        y: engineSize.h * 0.75 - 15 + (Math.random() * 20)
                    }]);
                }
                
                if (newSatiety === 0 || poops.length >= 4) setIsSick(true);
                if (newSatiety < 20 && s.clean < 30 && Math.random() < 0.002) setIsSick(true);
                
                return { satiety: newSatiety, clean: newClean, mood: newMood };
            });
        }, 5000);
        
        return () => clearInterval(interval);
    }, [isSleeping, poops.length, engineSize, activeScene, isNightTime]);

    // ── NEEDS BUBBLE SYSTEM — Pet proactively expresses wants ──
    useEffect(() => {
        const interval = setInterval(() => {
            if (isSleeping || isSick || speechBubble) return; // Don't override other bubbles
            
            // Priority order: hunger > dirty > sad
            if (stats.satiety <= 30 && Math.random() < 0.3) {
                setWantsBubble({ emoji: '🍖', text: '好饿...' });
            } else if (stats.clean <= 40 && Math.random() < 0.25) {
                setWantsBubble({ emoji: '💧', text: '想洗澡...' });
            } else if (stats.mood <= 20 && Math.random() < 0.2) {
                setWantsBubble({ emoji: '💔', text: '好无聊...' });
            } else {
                setWantsBubble(null);
            }
        }, 4000); // Check every 4 seconds
        return () => clearInterval(interval);
    }, [stats, isSleeping, isSick, speechBubble]);

    // ── TOUCH / CLICK INTERACTION HANDLER ──
    const handlePetClick = (pos) => {
        if (isSleeping || isSick || isTransitioning) return;
        const pet = petRef.current;
        
        clickCountRef.current += 1;
        const clicks = clickCountRef.current;
        
        // Reset click counter after 2 seconds of no clicking
        clearTimeout(clickResetTimer.current);
        clickResetTimer.current = setTimeout(() => { clickCountRef.current = 0; }, 2000);
        
        if (clicks >= 5) {
            // Spam clicking = annoyed!
            triggerSpeech("别闹啦！人家会不开心的！", '50%', 0, 2000);
            setStats(s => ({ ...s, mood: Math.max(0, s.mood - 3) }));
            clickCountRef.current = 0;
        } else {
            // Normal click = affection
            if (pet) pet.triggerHeart();
            setStats(s => ({ ...s, mood: Math.min(100, s.mood + 2) }));
            setWantsBubble(null); // Dismiss needs bubble on interaction
            
            // Random happy responses
            const responses = ["喵~", "嗯？", "摸摸~", "❤️", "嘿嘿"];
            if (Math.random() < 0.4) {
                triggerSpeech(responses[Math.floor(Math.random() * responses.length)], '50%', 0, 1500);
            }
        }
    };

    // ── RANDOM EVENTS SYSTEM ──
    const [activeEvent, setActiveEvent] = useState(null); // { type, timer }
    const eventTimerRef = useRef(null);

    // Memoize bed position so it doesn't create a new object every render
    const bedPosition = useMemo(() => {
        const bed = roomConfig.furniture.find(f => f.id === 'bed');
        if (!bed) return null;
        const bedWidthPct = parseFloat(bed.style.width);
        const bedLeftPct = parseFloat(bed.style.left);
        const bedBottomPct = parseFloat(bed.style.bottom);
        const bedHeightPct = bedWidthPct * (82 / 110);
        return {
            xPct: (bedLeftPct + bedWidthPct / 2) / 100,
            yPct: (bedBottomPct + bedHeightPct * 0.55) / 100
        };
    }, [roomConfig]);

    const RANDOM_EVENTS = useMemo(() => [
        { 
            type: 'butterfly', weight: 25, emoji: '🦋', 
            speech: '蝴蝶！好想抓住它！', 
            onTrigger: () => setStats(s => ({ ...s, mood: Math.min(100, s.mood + 8) })),
        },
        { 
            type: 'rain', weight: 15, emoji: '🌧️', 
            speech: '下雨了！毛都湿了...', 
            onTrigger: () => setStats(s => ({ ...s, clean: Math.max(0, s.clean - 8) })),
        },
        { 
            type: 'gift', weight: 15, emoji: '🎁', 
            speech: '哇！发现了神秘礼物！', 
            onTrigger: () => setStats(s => ({ ...s, mood: Math.min(100, s.mood + 12), satiety: Math.min(100, s.satiety + 5) })),
        },
        { 
            type: 'fish', weight: 20, emoji: '🐟', 
            speech: '在地板下面找到了鱼干！', 
            onTrigger: () => setStats(s => ({ ...s, satiety: Math.min(100, s.satiety + 12) })),
        },
        { 
            type: 'nightmare', weight: 10, emoji: '😱', needsSleep: true,
            speech: '做了噩梦...好可怕！', 
            onTrigger: () => { setStats(s => ({ ...s, mood: Math.max(0, s.mood - 10) })); setIsSleeping(false); },
        },
    ], []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const scheduleEvent = () => {
            const delay = (180 + Math.random() * 180) * 1000; // 3~6 minutes
            eventTimerRef.current = setTimeout(() => {
                if (isTransitioning || speechBubble || activeEvent) { scheduleEvent(); return; }
                
                // Filter events by context
                const pool = RANDOM_EVENTS.filter(e => {
                    if (e.needsSleep && !isSleeping) return false;
                    if (!e.needsSleep && isSleeping) return false;
                    if (activeScene !== 'home') return false;
                    return true;
                });
                if (pool.length === 0) { scheduleEvent(); return; }
                
                // Weighted random selection
                const totalWeight = pool.reduce((s, e) => s + e.weight, 0);
                let roll = Math.random() * totalWeight;
                let selected = pool[0];
                for (const ev of pool) {
                    roll -= ev.weight;
                    if (roll <= 0) { selected = ev; break; }
                }
                
                // Execute event
                setActiveEvent({ type: selected.type, emoji: selected.emoji });
                triggerSpeech(selected.speech, '50%', 500, 3000);
                selected.onTrigger();
                if (petRef.current) petRef.current.triggerHeart();
                
                // Clear event after 5 seconds
                setTimeout(() => setActiveEvent(null), 5000);
                scheduleEvent();
            }, delay);
        };
        scheduleEvent();
        return () => clearTimeout(eventTimerRef.current);
    }, [isSleeping, isTransitioning, activeScene, activeEvent, speechBubble, RANDOM_EVENTS]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── TASK COMPLETION LINKAGE ──
    useEffect(() => {
        const handler = (e) => {
            const { reward } = e.detail || {};
            if (petRef.current) petRef.current.triggerHeart();
            setWantsBubble(null);
            
            if (reward > 0) {
                triggerSpeech('主人好棒！继续加油！', '50%', 0, 2500);
                setStats(s => ({ ...s, mood: Math.min(100, s.mood + 5), satiety: Math.min(100, s.satiety + 3) }));
            } else if (reward < 0) {
                triggerSpeech('没关系，下次注意哦~', '50%', 0, 2500);
                setStats(s => ({ ...s, mood: Math.max(0, s.mood - 2) }));
            }
        };
        window.addEventListener('minilife-task-complete', handler);
        return () => window.removeEventListener('minilife-task-complete', handler);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAction = (type) => {
        if (!petRef.current || isTransitioning) return;
        const pet = petRef.current;

        if (type === 'sleep') {
            triggerSpeech(isSleeping ? "伸懒腰...早安主人！" : "呼噜噜...晚安主人 Zzz", '50%');
            setIsSleeping(!isSleeping);
            // Don't call pet.sleep() — let the game loop handle walk_to_bed
            return;
        }
        
        if (isSleeping) return; // Can't interact while sleeping

        if (isSick && type !== 'heal' && type !== 'clean') {
            return; // Sick pets refuse normal play/food 
        }

        switch (type) {
            case 'feed':
                if (activeScene !== 'home') return;
                setIsFeeding(true);
                setBowlHasFood(true);
                // Drop meant perfectly at the bowl
                pet.feed((() => {
                    // Walk to the exact bowl position from roomConfig
                    const bowl = roomConfig.furniture.find(f => f.id === 'bowl_food');
                    const leftPct = bowl ? parseFloat(bowl.style.left) / 100 : 0.553;
                    return engineSize.w * leftPct;
                })());

                // Dynamic speech and timing based on satiety!
                let speechConfig = { text: "吧唧吧唧...太香了嘟！", delay: 900 };
                if (stats.satiety >= 80) speechConfig = { text: "既然主人喂了...就再吃点！", delay: 1500 };
                else if (stats.satiety <= 30) speechConfig = { text: "饿死本喵了！大口炫！", delay: 500 };
                
                triggerSpeech(speechConfig.text, '25%', speechConfig.delay, 3000); // Pops up right as the cat sprints into position
                setTimeout(() => setIsFeeding(false), 3000); // Wait 3s before zooming out
                
                // Wait 4s (time to walk + time to eat) before emptying the bowl and gaining satiety
                setTimeout(() => {
                    setBowlHasFood(false);
                    setStats(s => ({ ...s, satiety: Math.min(100, s.satiety + 40) })); 
                }, 4000);
                break;

            case 'clean':
                // Sweep home poops
                if (activeScene !== 'home') return;
                setIsCleaning(true);
                setTimeout(() => {
                    setPoops([]);
                    setIsCleaning(false);
                    triggerSpeech("呼~房间终于没那么臭了！", '50%', 0, 2000);
                }, 1000); // Broom animation 1s
                break;

            case 'bathe':
                if (activeScene !== 'home') return;
                pet.bathe(); // Trigger engine bathtub visual
                triggerSpeech("洗香香啦，好舒爽嘟~", '50%', 500, 3000);
                
                // Wait for bathing to finish
                setTimeout(() => {
                    setStats(s => ({ ...s, clean: 100 }));
                    pet.triggerHeart();
                }, 5000);
                break;

            case 'heal':
                if (isSick) {
                    setIsTransitioning(true);
                    setTimeout(() => {
                        setActiveScene('hospital');
                        setIsTransitioning(false);
                        
                        // Pochi cries at the hospital — sad but will be ok!
                        if (pet && pet.cry) pet.cry();
                        triggerSpeech("呜呜...好不舒服...", '50%', 500, 2500);

                        setTimeout(() => {
                            triggerSpeech("复活啦！感谢抢救！", '50%', 0, 3000);
                            if (pet.heal) pet.heal();
                            else pet.triggerHeart();

                            setTimeout(() => {
                                setIsTransitioning(true);
                                setTimeout(() => {
                                    setActiveScene('home');
                                    setIsSick(false);
                                    setStats(s => ({ ...s, satiety: Math.max(s.satiety, 30), mood: Math.max(s.mood, 50) }));
                                    setIsTransitioning(false);
                                }, 500);
                            }, 3000);
                        }, 2800);
                    }, 500);
                }
                break;

            case 'play':
                if (activeScene !== 'home') return;
                pet.play();
                setStats(s => ({ ...s, mood: Math.min(100, s.mood + 25), satiety: Math.max(0, s.satiety - 10) }));
                break;
        }
    };

    const currentLevel = activeKid.level || 1;
    const currentStageDisplay = (level => level===0?1 : level<=5?2 : level<=12?3 : level<=20?4 : 5)(currentLevel);

    // ── Pixel Art Definitions ──
    const ACTION_CARDS = [
        { 
            id: 'feed', label: '大餐', bg: isSick?'bg-gray-300':'bg-[#FF90E8]',
            grid: ["          ", "  XX  XX  ", " XBBXXBBX ", " XBBBBBBX ", " XXRRRRXX ", "  XRRRRX  ", " XBBBBBBX ", " XBBXXBBX ", "  XX  XX  ", "          "],
            palette: { 'X': '#111827', 'B': '#f3f4f6', 'R': '#ef4444' }
        },
        { 
            id: 'clean', label: '扫除', bg: activeScene !== 'home' ? 'bg-gray-300' : 'bg-[#fcd34d]',
            grid: ["   XXXXX  ", "  XYYYYYX ", "  XXYYYXX ", "   XXXXX  ", "  XWWWWWX ", "  XXWWWXX ", "  XXXXXXX ", "   X   X  ", "          ", "          "],
            palette: { 'X': '#111827', 'Y': '#fbbf24', 'W': '#f97316' }
        },
        { 
            id: 'bathe', label: '洗浴', bg: 'bg-[#3BCECD]',
            grid: ["   XXXX   ", "  XWWWWX  ", " XXWWWWXX ", " X      X ", " XYYYYYYX ", " XXYYYYXX ", "  XXXXXX  ", "          ", "          ", "          "],
            palette: { 'X': '#111827', 'W': '#bae6fd', 'Y': '#e0f2fe' } // Water droplet/tub
        },
        { 
            id: 'heal', label: '看病', bg: isSick ? 'bg-[#ff7b7b] animate-bounce' : 'bg-gray-300',
            grid: ["    XX    ", "   XRRX   ", "  XRRRXX  ", " XRRRXXWX ", " XXRXXWWWX", "  XXWWWXX ", "   XWWX   ", "    XX    ", "          ", "          "],
            palette: { 'X': '#111827', 'R': '#ef4444', 'W': '#ffffff' }
        },
        { 
            id: 'sleep', label: isSleeping ? '唤醒' : '关灯', bg: 'bg-[#8B5CF6] text-white',
            grid: ["  XXX     ", " XYYYX    ", " XYXX     ", " XYYX     ", " XYYX ZZZ ", " XYYX   Z ", "  XYYX Z  ", "  XYYYX   ", "   XXX    ", "          "],
            palette: { 'X': '#111827', 'Y': '#facc15', 'Z': '#d1d5db' }
        }
    ];

    const STAGE_ICONS = [
        { grid: ["          ", "  XX  XX  ", " XXXX XXXX", "  XX  XX  ", "   XXXX   ", "  XXXXXX  ", "  XXXXXX  ", "   XXXX   ", "    XX    ", "          "], palette: { 'X': '#111827' } },
        { grid: ["          ", "    XX    ", "   XXXX   ", " XXWYYWXX ", "  XYYYYX  ", "  XYYYYX  ", " XXWYYWXX ", "   XXXX   ", "    XX    ", "          "], palette: { 'X': '#111827', 'Y': '#facc15', 'W': '#ffffff' } },
        { grid: ["          ", "  XX  XX  ", " XRRX XRRX", " XRRRXRRRX", " XRRRRRRRX", "  XRRRRRX ", "   XRRRX  ", "    XRX   ", "     X    ", "          "], palette: { 'X': '#111827', 'R': '#f472b6' } },
        { grid: ["          ", " XXXXXXXX ", " XYWWWWYX ", "  XYYYYX  ", "   XYYX   ", "   XXXX   ", "  XYYYYX  ", " XXXXXXXX ", "          ", "          "], palette: { 'X': '#111827', 'Y': '#facc15', 'W': '#e5e7eb' } },
        { grid: ["          ", " X  X  X  ", " XWXXXWX  ", " XYWYWYX  ", " XYYYYYX  ", " XYYYYYX  ", "  XXXXX   ", "          ", "          ", "          "], palette: { 'X': '#111827', 'W': '#ffffff', 'Y': '#facc15' } }
    ];

    const POOP_ICON = {
        grid: ["   XX   ", "  XBBX  ", " XBBBBX ", " XBBBBX ", "XBBBBBBX", " XXXXXX "],
        palette: { 'X': '#451a03', 'B': '#92400e' } 
    };

    const MINI_ZONE_ICONS = {
        home: {
            grid: ["   XX   ", "  XWWX  ", " XWWWWX ", " XXXXXX ", "  XWWX  ", "  X  X  "],
            palette: { 'X': '#111827', 'W': '#fcd34d' }
        },
        bath: {
            grid: ["   XX   ", "  XWWX  ", "  XWWX  ", " XWWWWX ", " XWWWWX ", "  XXXX  "],
            palette: { 'X': '#111827', 'W': '#38bdf8' }
        },
        hospital: {
            grid: ["   XX   ", "   XX   ", " XXXXXX ", " XXXXXX ", "   XX   ", "   XX   "],
            palette: { 'X': '#ef4444' } // Red cross
        },
        sleep: {
            grid: ["   XXX  ", "  XX    ", "  XX    ", "  XX    ", "   XXX  ", "        "],
            palette: { 'X': '#facc15' } // Moon
        },
        alert: {
            grid: ["  XX  ", "  XX  ", "  XX  ", "      ", "  XX  ", "      "],
            palette: { 'X': '#ffffff' } // Exclamation mark
        }
    };

    const SCENE_PROPS = {
        bowlEmpty: {
            grid: [
                "            ",
                "            ",
                "            ",
                "            ",
                "  XXXXXXXX  ",
                " XXWWWWWWXX ",
                " XWWWWWWWWX ",
                "  XXXXXXXX  "
            ],
            palette: { 'X': '#111827', 'W': '#e5e7eb', 'M': '#b91c1c' }
        },
        bowlFull: {
            grid: [
                "            ",
                "    MMMM    ",
                "   MMMMMM   ",
                "  MMMMMMMM  ",
                "  XXXXXXXX  ",
                " XXWWWWWWXX ",
                " XWWWWWWWWX ",
                "  XXXXXXXX  "
            ],
            palette: { 'X': '#111827', 'W': '#e5e7eb', 'M': '#b91c1c' }
        },
        litterBox: {
            grid: ["          ", " XXXXXXXX ", "XBWWWWWWBX", "XWYYYYYYWX", "XWYYYYYYWX", " XXXXXXXX "],
            palette: { 'X': '#111827', 'B': '#3b82f6', 'W': '#60a5fa', 'Y': '#fef08a' }
        },
        foodBag: {
            grid: ["  XXXX  ", " XYYYYX ", "XYyyyyYX", "XYyyyyYX", "XYYYXYYX", "XYYXYYYX", "XXXXXXXX"],
            palette: { 'X': '#111827', 'Y': '#fb923c', 'y': '#fdba74' } // Orange food bag
        },
        medicalCross: {
            grid: ["   XX   ", "   XX   ", " XXXXXX ", " XXXXXX ", "   XX   ", "   XX   "],
            palette: { 'X': '#22c55e' } // Green Cross
        },
        showerHead: {
            grid: ["  XXXX  ", " XXWWXX ", "XXWWWWXX", "  XXXX  ", "  XXXX  "],
            palette: { 'X': '#94a3b8', 'W': '#f1f5f9' } 
        }
    };

    const getZoneStatus = () => {
        if (isSick) return { icon: 'alert', text: 'Mini 危险警告！', bg: 'bg-red-500 text-white animate-pulse' };
        if (isSleeping) return { icon: 'sleep', text: 'Mini 睡眠模式', bg: 'bg-blue-900 text-white border-blue-400' };
        if (activeScene === 'home') return { icon: 'home', text: 'Mini 小屋', bg: 'bg-white/90 text-gray-800' };
        if (activeScene === 'bathroom') return { icon: 'bath', text: 'Mini 浴室', bg: 'bg-white/90 text-gray-800' };
        return { icon: 'hospital', text: 'Mini 急诊室', bg: 'bg-white/90 text-gray-800' };
    };
    const currentZone = getZoneStatus();

    const modalContent = (
        <div className="fixed inset-0 z-[9999] p-0 md:p-8 flex justify-center items-center bg-gray-900/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-4xl h-[100dvh] md:h-auto md:max-h-[95vh] bg-[#F4F4F0] flex flex-col md:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative border-0 md:border-4 border-gray-900">
                
                {/* ── HEAD BAR ── */}
                <div className="flex-shrink-0 border-b-4 border-gray-900 bg-white px-6 py-4 flex items-center justify-between z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-gray-900 rounded bg-[#ff90e8] flex items-center justify-center shadow-[2px_2px_0px_#111827]">
                            <PixelIcon grid={MINI_ZONE_ICONS.home.grid} palette={MINI_ZONE_ICONS.home.palette} size={2} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest leading-none">
                            {activeKid.spirit_name || (activeKid.name ? `${activeKid.name} 的陪伴宠物` : '我的陪伴宠物')}
                        </h2>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 border-2 border-gray-900 rounded-full flex items-center justify-center bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-[2px_2px_0px_#111827]">
                        <Icons.X size={20} className="text-gray-900" />
                    </button>
                </div>

                {/* ── DEBUG TOOLBAR ── */}
                <div className="flex-shrink-0 border-b-2 border-dashed border-orange-300 bg-orange-50 px-4 py-2 flex flex-col gap-2 text-[10px] font-mono">
                    {/* Row 1: Time & Species & Growth */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-orange-600 mr-1">🛠 DEBUG</span>
                        {/* Time Phase */}
                        {['dawn','day','dusk','night','lateNight'].map(p => (
                            <button key={p} onClick={() => setDebugTimePhase(prev => prev === p ? null : p)}
                                className={`px-2 py-0.5 rounded border ${(debugTimePhase || timePhase) === p ? 'bg-orange-500 text-white border-orange-600' : 'bg-white border-gray-300 text-gray-600'}`}>
                                {TIME_PHASES[p].label}
                            </button>
                        ))}
                        <span className="mx-1 text-gray-300">|</span>
                        {/* Species */}
                        {[
                            {id:'cat',          label:'🐱 小橘'},
                            {id:'pochi',        label:'🐱 奶油'},
                            {id:'pochi_black',  label:'🖤 黑猫'},
                            {id:'pochi_grey',   label:'🩶 灰猫'},
                            {id:'pochi_grey_white', label:'🤍 灰白'},
                            {id:'pochi_orange', label:'🟠 橘猫'},
                            {id:'pochi_white',  label:'🤍 白猫'},
                        ].map(s => (
                            <button key={s.id} onClick={() => setDebugSpecies(s.id)}
                                className={`px-2 py-0.5 rounded border text-xs ${debugSpecies === s.id ? 'bg-blue-500 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-600'}`}>
                                {s.label}
                            </button>
                        ))}
                        <span className="mx-1 text-gray-300">|</span>
                        {/* Growth Stage */}
                        {[{lv:1,label:'奶宝宝'},{lv:8,label:'少年期'},{lv:15,label:'成年期'}].map(g => (
                            <button key={g.lv} onClick={() => setDebugBondLevel(prev => prev === g.lv ? null : g.lv)}
                                className={`px-2 py-0.5 rounded border ${debugBondLevel === g.lv ? 'bg-green-500 text-white border-green-600' : 'bg-white border-gray-300 text-gray-600'}`}>
                                {g.label}
                            </button>
                        ))}
                        <span className="mx-1 text-gray-300">|</span>
                        <button onClick={() => setIsEditMode(!isEditMode)} 
                            className={`px-2 py-0.5 rounded border ${isEditMode ? 'bg-pink-500 text-white border-pink-600 font-bold' : 'bg-white border-gray-300 text-gray-600'}`}>
                            {isEditMode ? '装修模式 [开启]' : '编辑摆放'}
                        </button>
                        {isEditMode && (
                            <button onClick={() => console.log('===================\nFINAL CONFIG:\n', JSON.stringify(roomConfig, null, 2), '\n===================')} 
                                className="px-2 py-0.5 rounded border bg-gray-900 text-white border-black font-bold animate-pulse hover:bg-black transition">
                                💾 控制台打印坐标
                            </button>
                        )}
                    </div>
                    {/* Row 2: Pet Actions & Animations */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-purple-600 mr-1">🎬 动作</span>
                        {[
                            { label: '🚶 散步', action: () => { if(petRef.current) petRef.current.play(); } },
                            { label: '🍽️ 喂食', action: () => handleAction('feed') },
                            { label: '😴 睡觉', action: () => handleAction('sleep') },
                            { label: '🛁 洗澡', action: () => handleAction('bathe') },
                            { label: '🏥 看病', action: () => { setIsSick(true); setTimeout(() => handleAction('heal'), 300); } },
                            { label: '🎉 跳舞', action: () => { if(petRef.current) { const gs = petRef.current; gs.play(); } } },
                            { label: '🧹 扫除', action: () => { setPoops([{ id: 1, x: engineSize.w*0.7, y: engineSize.h*0.7 }]); setTimeout(() => handleAction('clean'), 300); } },
                        ].map(btn => (
                            <button key={btn.label} onClick={btn.action}
                                className="px-2 py-0.5 rounded border bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-200 active:bg-purple-300 transition">
                                {btn.label}
                            </button>
                        ))}
                        <span className="mx-1 text-gray-300">|</span>
                        <span className="font-bold text-rose-600 mr-1">🎞️ 帧</span>
                        {[
                            { fk: 'idle', action: (gs) => { setIsSick(false); setIsSleeping(false); gs.heal(); } },
                            { fk: 'walk', action: (gs) => { setIsSick(false); setIsSleeping(false); gs.play(); } },
                            { fk: 'run', action: (gs) => { setIsSick(false); setIsSleeping(false); gs.play(); } },
                            { fk: 'eat', action: (gs) => { gs.feed(engineSize.w * 0.5); } },
                            { fk: 'sleep', action: (gs) => { gs.sleep(); setIsSleeping(true); } },
                            { fk: 'sleep2', action: (gs) => { gs.sleep(); setIsSleeping(true); } },
                            { fk: 'sick', action: () => { setIsSick(true); } },
                            { fk: 'sickRun', action: () => { setIsSick(true); } },
                            { fk: 'dance', action: (gs) => { setIsSick(false); setIsSleeping(false); gs.play(); } },
                            { fk: 'wait', action: (gs) => { setIsSick(false); setIsSleeping(false); gs.heal(); } },
                            { fk: 'cry', action: (gs) => { setIsSick(false); setIsSleeping(false); gs.heal(); } },
                            { fk: 'surprised', action: (gs) => { setIsSick(false); setIsSleeping(false); gs.heal(); } },
                            { fk: 'excited', action: (gs) => { setIsSick(false); setIsSleeping(false); gs.heal(); } },
                            { fk: 'bathe', action: (gs) => { gs.bathe(); } },
                        ].map(({ fk, action }) => (
                            <button key={fk} onClick={() => {
                                if(petRef.current) action(petRef.current);
                            }}
                                className="px-1.5 py-0.5 rounded border bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-200 active:bg-rose-300 transition text-[9px]">
                                {fk}
                            </button>
                        ))}
                    </div>
                    {/* Row 3: Scene Switches */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-teal-600 mr-1">🏠 场景</span>
                        {[
                            { id: 'home', label: '🏡 家', emoji: '🏡' },
                            { id: 'bathroom', label: '🛁 浴室' },
                            { id: 'hospital', label: '🏥 医院' },
                        ].map(scene => (
                            <button key={scene.id} onClick={() => {
                                setIsTransitioning(true);
                                setTimeout(() => {
                                    setActiveScene(scene.id);
                                    setIsTransitioning(false);
                                }, 300);
                            }}
                                className={`px-2 py-0.5 rounded border ${activeScene === scene.id ? 'bg-teal-500 text-white border-teal-600' : 'bg-white border-gray-300 text-gray-600'} hover:bg-teal-100 transition`}>
                                {scene.label}
                            </button>
                        ))}
                        <span className="mx-1 text-gray-300">|</span>
                        <span className="font-bold text-amber-600 mr-1">⚡ 状态</span>
                        <button onClick={() => setIsSick(!isSick)}
                            className={`px-2 py-0.5 rounded border ${isSick ? 'bg-red-500 text-white border-red-600' : 'bg-white border-gray-300 text-gray-600'} transition`}>
                            {isSick ? '🤒 生病中' : '生病'}
                        </button>
                        <button onClick={() => { setIsSleeping(!isSleeping); if(!isSleeping && petRef.current) petRef.current.sleep(); }}
                            className={`px-2 py-0.5 rounded border ${isSleeping ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-white border-gray-300 text-gray-600'} transition`}>
                            {isSleeping ? '💤 睡觉中' : '睡觉'}
                        </button>
                        <button onClick={() => setBowlHasFood(!bowlHasFood)}
                            className={`px-2 py-0.5 rounded border ${bowlHasFood ? 'bg-amber-500 text-white border-amber-600' : 'bg-white border-gray-300 text-gray-600'} transition`}>
                            {bowlHasFood ? '🍖 碗满' : '碗空'}
                        </button>
                        <button onClick={() => setStats({ satiety: 30, clean: 20, mood: 15 })}
                            className="px-2 py-0.5 rounded border bg-white border-gray-300 text-gray-600 hover:bg-red-100 transition">
                            📉 低状态
                        </button>
                        <button onClick={() => setStats({ satiety: 100, clean: 100, mood: 100 })}
                            className="px-2 py-0.5 rounded border bg-white border-gray-300 text-gray-600 hover:bg-green-100 transition">
                            📈 满状态
                        </button>
                    </div>
                </div>

                {/* ── SCROLLABLE INNER ── */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
                    <div className="p-3 md:p-6 flex flex-col gap-5">
                        {/* ── MULTI-SCENE VIRTUAL ENVIRONMENT ── */}
                        <div className={`w-full aspect-square max-w-[420px] md:max-w-[480px] mx-auto rounded-2xl relative overflow-hidden flex-shrink-0 transition-all duration-700 flex items-end justify-center`}
                            ref={containerRef}
                        >
                            {/* STATUS OVERLAY */}
                            <div className={`absolute top-4 left-4 z-40 flex items-center gap-2 font-mono text-xs md:text-sm font-black px-3 py-1.5 rounded-full border-2 border-slate-900 bg-white/80 backdrop-blur-sm shadow-[2px_2px_0px_#111827]`}>
                                <div className="shrink-0 flex items-center justify-center pb-0.5">
                                    <PixelIcon grid={isNightTime ? SYSTEM_ICONS.moon.grid : SYSTEM_ICONS.sun.grid} palette={isNightTime ? SYSTEM_ICONS.moon.palette : SYSTEM_ICONS.sun.palette} size={2} />
                                </div>
                                <span className="leading-none text-slate-900">{timeConfig.label}</span>
                            </div>

                            {/* ====== SCENE RENDERING STAGE ====== */}
                            <div className={`absolute inset-0 transition-transform duration-[1500ms] ease-in-out ${isFeeding ? 'scale-[1.05] md:scale-[1.15]' : 'scale-100'} origin-[30%_bottom] z-0`}>
                                <div className={`absolute inset-0 transition-opacity duration-700 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                                    
                                     {/* SCENE: HOME - ASSEMBLED ROOM */}
                                    {activeScene === 'home' && (
                                    <div className="absolute inset-0 transition-all duration-[2000ms] flex items-center justify-center overflow-hidden"
                                         style={{ 
                                             filter: (isSleeping || isNightTime) ? 'brightness(0.6)' : 'none'
                                         }}>
                                         
                                        {/* Aspect-Locked Container for Pixel-Perfect Placement */}
                                        <div className="relative w-full h-full max-w-full max-h-full"
                                             ref={roomAspectRef}
                                             style={{ aspectRatio: '1/1' }}>
                                            
                                            {/* Layer 0: Room shell — click to cycle color theme */}
                                            <img src={currentRoomSrc}
                                                 className={`absolute inset-0 w-full h-full object-contain select-none transition-opacity duration-500 ${
                                                     !isEditMode ? 'cursor-pointer' : 'cursor-default pointer-events-none'
                                                 }`}
                                                 style={{ imageRendering: 'pixelated', zIndex: 0 }}
                                                 onClick={handleRoomClick}
                                                 title={`点击切换房间颜色 (${roomSkinIdx + 1}/${ROOM_VARIANTS.length})`}
                                                 alt="Room" />
                                            
                                            {/* Layer 1+: Assembled furniture pieces */}
                                            {roomConfig.furniture.map(item => {
                                                const skin = furnitureSkins[item.id];
                                                const hasVariants = !!FURNITURE_VARIANTS[item.id];
                                                const imgSrc = (item.id === 'bowl_food' && bowlHasFood)
                                                    ? item.srcFull
                                                    : (skin || item.src);
                                                return (
                                                    <div key={item.id}
                                                         className={`absolute ${
                                                             isEditMode
                                                                 ? 'cursor-move ring-offset-1 hover:ring-2 hover:ring-pink-400 touch-none select-none pointer-events-auto'
                                                                 : hasVariants
                                                                     ? 'pointer-events-auto cursor-pointer group'
                                                                     : 'pointer-events-none'
                                                         }`}
                                                         style={{
                                                             ...item.style,
                                                             zIndex: isEditMode && draggingId === item.id ? 9999 : item.zIndex,
                                                         }}
                                                         onPointerDown={(e) => handlePointerDown(e, item.id)}
                                                         onClick={(e) => handleFurnitureClick(e, item)}>
                                                        <img src={imgSrc}
                                                             draggable={false}
                                                             className={`w-full h-auto object-contain pointer-events-none select-none transition-all duration-150 ${
                                                                 hasVariants && !isEditMode ? 'group-hover:brightness-110 group-hover:scale-105' : ''
                                                             }`}
                                                             style={{ imageRendering: 'pixelated', transform: item.flipX ? 'scaleX(-1)' : 'none' }}
                                                             alt={item.id} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* SCENE: BATHROOM */}
                                {activeScene === 'bathroom' && (
                                    <>
                                        {/* Tiled Wall */}
                                        <div className="absolute top-0 w-full h-[65%] bg-[#f8fafc] border-b-8 border-[#94a3b8]" style={{ backgroundImage: 'linear-gradient(90deg, #e2e8f0 4px, transparent 4px), linear-gradient(#e2e8f0 4px, transparent 4px)', backgroundSize: '40px 40px' }}>
                                            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 opacity-80">
                                                <PixelIcon grid={SCENE_PROPS.showerHead.grid} palette={SCENE_PROPS.showerHead.palette} size={5} />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 w-full h-[35%] bg-[#38bdf8] flex justify-center items-center">
                                            <div className="w-[90%] h-full bg-[#7dd3fc] opacity-50" style={{ backgroundImage: 'radial-gradient(circle, #bae6fd 4px, transparent 4px)', backgroundSize: '16px 16px' }}></div>
                                        </div>
                                    </>
                                )}

                                {/* SCENE: HOSPITAL */}
                                {activeScene === 'hospital' && (
                                    <>
                                        {/* Medical Room */}
                                        <div className="absolute top-0 w-full h-[65%] bg-[#d1fae5] border-b-8 border-[#94a3b8]">
                                            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 opacity-90 p-3 bg-white border-4 border-gray-900 rounded shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                                                <PixelIcon grid={SCENE_PROPS.medicalCross.grid} palette={SCENE_PROPS.medicalCross.palette} size={4} />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 w-full h-[35%] bg-[#f1f5f9] flex justify-center">
                                            {/* Cold clinical tiles */}
                                            <div className="w-full h-full opacity-50" style={{ backgroundImage: 'linear-gradient(90deg, #e2e8f0 2px, transparent 2px), linear-gradient(#e2e8f0 2px, transparent 2px)', backgroundSize: '60px 20px' }}></div>
                                        </div>
                                    </>
                                )}

                            </div>
                            </div>
                            {/* ==================================== */}
                            
                            {/* --- SPEECH BUBBLE OVERLAY --- */}
                            {speechBubble && !isTransitioning && (
                                <div className="absolute z-50 animate-bounce" style={{ left: speechBubble.x, bottom: '45%', transform: 'translate(-50%, 0)' }}>
                                    <div className="bg-white/95 backdrop-blur border-4 border-gray-900 px-3 py-2 rounded-2xl shadow-[4px_4px_0px_#111827] text-gray-900 font-black text-xs md:text-sm whitespace-nowrap">
                                        {speechBubble.text}
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-gray-900"></div>
                                    <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-white"></div>
                                </div>
                            )}

                            {/* --- DIRT OVERLAY --- */}
                            {(poops.length >= 3 || stats.clean < 50) && !isSleeping && activeScene === 'home' && (
                                <div className="absolute inset-0 bg-green-900/10 mix-blend-multiply z-10 pointer-events-none transition-opacity duration-1000"></div>
                            )}

                            {/* --- SWEEPING BROOM CINEMATIC --- */}
                            {isCleaning && activeScene === 'home' && (
                                <div className="absolute left-[-20%] bottom-[10%] w-[150%] h-[40px] bg-yellow-400 border-4 border-gray-900 skew-x-[-20deg] animate-pulse z-30 transition-transform duration-700 translate-x-full opacity-80" />
                            )}

                            {/* --- DROPPED POOPS --- */}
                            {poops.map((p) => (
                                <div key={p.id} className="absolute z-10 animate-bounce" style={{ left: p.x, top: p.y, transform: 'translate(-50%, -50%)', opacity: isTransitioning ? 0 : 1 }}>
                                    <PixelIcon grid={POOP_ICON.grid} palette={POOP_ICON.palette} size={3} />
                                </div>
                            ))}
                            
                            {/* --- PIXEL ENGINE (Cat) --- */}
                            {engineSize.w > 0 && (
                                <div className={`absolute inset-0 z-20 transition-opacity duration-500 pointer-events-none`} style={{ filter: isSleeping ? 'brightness(0.6)' : 'none', opacity: isTransitioning ? 0 : 1 }}>
                                    <PixelPetEngine 
                                        ref={petRef}
                                        width={engineSize.w}
                                        height={engineSize.h}
                                        isSick={isSick}
                                        isSleeping={isSleeping}
                                        isDirty={stats.clean < 50}
                                        satiety={stats.satiety}
                                        species={debugSpecies}
                                        bondLevel={debugBondLevel !== null ? debugBondLevel : currentLevel}
                                        onPetClick={handlePetClick}
                                        bedPosition={bedPosition}
                                    />
                                </div>
                            )}

                            {/* --- RANDOM EVENT VISUAL EFFECTS --- */}
                            {activeEvent && (
                                <>
                                    {activeEvent.type === 'butterfly' && (
                                        <div className="absolute z-30 pointer-events-none" style={{ animation: 'butterflyFloat 4s ease-in-out forwards' }}>
                                            <span className="text-2xl md:text-3xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>🦋</span>
                                        </div>
                                    )}
                                    {activeEvent.type === 'rain' && (
                                        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
                                            {Array.from({length: 20}).map((_, i) => (
                                                <div key={i} className="absolute w-px bg-blue-300/60" 
                                                    style={{ 
                                                        left: `${5 + Math.random() * 90}%`, 
                                                        top: '-10%',
                                                        height: `${10 + Math.random() * 15}px`,
                                                        animation: `rainDrop ${0.5 + Math.random() * 0.3}s linear ${Math.random() * 0.5}s infinite`,
                                                    }} />
                                            ))}
                                        </div>
                                    )}
                                    {activeEvent.type === 'gift' && (
                                        <div className="absolute z-30 pointer-events-none animate-bounce" style={{ left: '55%', bottom: '28%' }}>
                                            <span className="text-3xl md:text-4xl" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))' }}>🎁</span>
                                        </div>
                                    )}
                                    {activeEvent.type === 'fish' && (
                                        <div className="absolute z-30 pointer-events-none" style={{ left: '40%', bottom: '30%', animation: 'fishBounce 1s ease-out' }}>
                                            <span className="text-2xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>🐟</span>
                                        </div>
                                    )}
                                    {activeEvent.type === 'nightmare' && (
                                        <div className="absolute inset-0 z-30 pointer-events-none bg-purple-900/30 animate-pulse">
                                            {Array.from({length: 5}).map((_, i) => (
                                                <span key={i} className="absolute text-lg animate-ping" 
                                                    style={{ left: `${20 + Math.random() * 60}%`, top: `${20 + Math.random() * 60}%`, animationDelay: `${i*0.2}s` }}>💀</span>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* --- NEEDS BUBBLE (Pet proactively expresses wants) --- */}
                            {wantsBubble && !speechBubble && !isSleeping && !isTransitioning && (
                                <div className="absolute z-50" style={{ right: '12%', top: '15%' }}>
                                    <div className="bg-white/90 backdrop-blur border-3 border-gray-900 px-2.5 py-1.5 rounded-2xl shadow-[3px_3px_0px_#111827] flex items-center gap-1.5 animate-bounce">
                                        <span className="text-lg">{wantsBubble.emoji}</span>
                                        <span className="font-black text-xs text-gray-700">{wantsBubble.text}</span>
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* ── HORIZONTAL BOND TRACK ── */}
                        <div className="w-full bg-white border-4 border-gray-900 p-4 md:p-5 rounded-2xl shadow-[6px_6px_0px_#111827] flex flex-col gap-4 mt-1">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 z-10 w-full">
                                <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                                    <PixelIcon grid={STAGE_ICONS[2].grid} palette={STAGE_ICONS[2].palette} size={1.5} /> 
                                    羁绊阶级 (Lv.{currentLevel})
                                </h3>
                                <div className="text-xs font-bold text-gray-700 bg-pink-100 px-3 py-1.5 border-2 border-gray-900 rounded-lg shadow-[2px_2px_0px_#111827] flex-shrink-0">
                                    {SPIRIT_FORMS[currentStageDisplay - 1]?.unlockText}
                                </div>
                            </div>
                            
                            <div className="relative flex justify-between items-center mt-1 px-2 md:px-6">
                                <div className="absolute left-[10%] right-[10%] top-1/2 h-2.5 bg-gray-200 border-y-2 border-gray-900 -translate-y-1/2 z-0 hidden md:block"></div>
                                <div className="absolute left-[10%] top-1/2 h-2.5 bg-pink-500 border-y-2 border-gray-900 -translate-y-1/2 z-0 transition-all duration-1000 hidden md:block" style={{ width: `${(Math.min(currentStageDisplay, 4)) * 20}%` }}></div>
                                {SPIRIT_FORMS.map((stage, idx) => {
                                    const lvl = idx + 1;
                                    const isCurrent = currentStageDisplay === lvl;
                                    const isLocked = currentStageDisplay < lvl;
                                    
                                    return (
                                        <div key={idx} className={`relative z-10 flex flex-col items-center gap-2 transition-all`}>
                                            <div className={`w-[46px] h-[46px] md:w-16 md:h-16 border-[3px] md:border-4 border-gray-900 rounded-full flex items-center justify-center bg-white ${!isLocked && 'shadow-[4px_4px_0px_#111827]'} ${isCurrent && 'border-pink-500 bg-pink-50 translate-y-[-4px] shadow-[4px_8px_0px_#111827]'} ${isLocked && 'bg-gray-100'} transition-transform z-10`}>
                                                <div className={`${isLocked ? 'opacity-30 grayscale' : 'opacity-100'}`}>
                                                    <PixelIcon grid={STAGE_ICONS[idx].grid} palette={STAGE_ICONS[idx].palette} size={isCurrent ? 2.5 : 2} />
                                                </div>
                                            </div>
                                            <span className={`font-black text-[10px] md:text-xs text-center border-2 border-gray-900 px-1.5 md:px-2 py-0.5 rounded shadow-[2px_2px_0px_#111827] ${isCurrent ? 'bg-pink-500 text-white' : 'bg-white text-gray-900'} ${isLocked ? 'text-gray-400 opacity-60' : 'opacity-100'}`}>
                                                {stage.name}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* ── 5 HUD ACTION DECK (Split Actions) ── */}
                        <div className="grid grid-cols-5 gap-2 md:gap-3 mt-1">
                            {ACTION_CARDS.map(btn => (
                                <button 
                                    key={btn.id}
                                    onClick={() => handleAction(btn.id)}
                                    className={`${btn.bg} border-[3px] md:border-4 border-gray-900 rounded-xl md:rounded-2xl p-2 md:p-4 flex flex-col items-center justify-center gap-1 md:gap-2 shadow-[2px_2px_0px_#111827] md:shadow-[4px_4px_0px_#111827] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#111827] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all group overflow-hidden`}
                                >
                                    <PixelIcon grid={btn.grid} palette={btn.palette} size={2} className="md:scale-125 scale-90 mb-0 md:mb-1" />
                                    <span className="font-black tracking-wide text-[10px] md:text-[14px] leading-none pt-1">{btn.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* ── THICK STATUS BARS ── */}
                        <div className="bg-white border-4 border-gray-900 p-4 md:p-6 rounded-2xl shadow-[6px_6px_0px_#111827] grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 mt-1">
                            {[
                                { label: '饱腹', val: stats.satiety, color: 'bg-orange-500', alert: stats.satiety <= 30 },
                                { label: '清洁', val: stats.clean, color: 'bg-[#3BCECD]', alert: stats.clean <= 40 },
                                { label: '心情', val: stats.mood, color: 'bg-[#FF90E8]', alert: stats.mood <= 20 }
                            ].map((s, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center font-black text-gray-800 text-sm">
                                        <span className={s.alert ? 'text-red-500 animate-pulse' : ''}>{s.label}</span>
                                        <span className={s.alert ? 'text-red-500' : ''}>{Math.floor(s.val)}%</span>
                                    </div>
                                    <div className={`w-full h-5 bg-gray-200 border-4 border-gray-900 rounded-xl overflow-hidden shrink-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] relative ${s.alert ? 'ring-2 ring-red-500' : ''}`}>
                                        <div className={`absolute top-0 bottom-0 left-0 ${s.color} border-r-4 border-gray-900 transition-all duration-300`} style={{ width: `${s.val}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>


                    </div>
                </div>

            </div>
        </div>
    );
    
    if (typeof document === 'undefined') return null;
    return createPortal(modalContent, document.body);
}
