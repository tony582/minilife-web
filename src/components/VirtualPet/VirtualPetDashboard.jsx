import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../../utils/Icons';
import PixelPetEngine from './PixelPetEngine';
import { SPIRIT_FORMS } from '../../utils/spiritUtils';

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
    
    // ── SCENE STATE ──
    const [activeScene, setActiveScene] = useState('home'); // 'home', 'bathroom', 'hospital'
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    // ── CINEMATIC STATES ──
    const [isFeeding, setIsFeeding] = useState(false);
    const [bowlHasFood, setBowlHasFood] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);
    const [speechBubble, setSpeechBubble] = useState(null);
    
    // ── NEEDS BUBBLE & TOUCH STATES ──
    const [wantsBubble, setWantsBubble] = useState(null); // { emoji, text }
    const clickCountRef = useRef(0);
    const clickResetTimer = useRef(null);

    const triggerSpeech = (text, posX, delay = 0, duration = 3000) => {
        setTimeout(() => {
            setSpeechBubble({ text, x: posX });
            setTimeout(() => setSpeechBubble(null), duration);
        }, delay);
    };

    // ── GAME LOOP (Real-time Decay — SLOW, hours-based) ──
    useEffect(() => {
        const interval = setInterval(() => {
            if (isSleeping) return;
            
            setStats(s => {
                const poopsPenalty = Math.max(0, poops.length - 1) * 0.3;
                
                // REBALANCED: ~6 hours from 100→0 at 5s interval
                // 0.014/5s = 0.168/min = 10.08/hr → 100/10 ≈ 10 hours
                let newSatiety = Math.max(0, s.satiety - 0.014); 
                let newClean = Math.max(0, s.clean - (0.008 + poops.length * 0.005)); 
                let newMood = Math.max(0, s.mood - (0.01 + poopsPenalty * 0.01));
                
                // Poop Spawner (much slower)
                if (activeScene === 'home' && Math.random() < 0.008 && s.satiety > 20 && poops.length < 5) {
                    setPoops(prev => [...prev, {
                        id: Date.now() + Math.random(),
                        x: engineSize.w * 0.8 + (Math.random() * 40 - 20),
                        y: engineSize.h * 0.75 - 15 + (Math.random() * 20)
                    }]);
                }
                
                // Sickness: hunger=0 OR poops>=4 OR random low chance when dirty+hungry
                if (newSatiety === 0 || poops.length >= 4) setIsSick(true);
                if (newSatiety < 20 && s.clean < 30 && Math.random() < 0.002) setIsSick(true);
                
                return { satiety: newSatiety, clean: newClean, mood: newMood };
            });
        }, 5000); // 5s tick (slower for balance)
        
        return () => clearInterval(interval);
    }, [isSleeping, poops.length, engineSize, activeScene]);

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


    const handleAction = (type) => {
        if (!petRef.current || isTransitioning) return;
        const pet = petRef.current;

        if (type === 'sleep') {
            triggerSpeech(isSleeping ? "伸懒腰...早安主人！" : "呼噜噜...晚安主人 Zzz", '50%');
            setIsSleeping(!isSleeping);
            if (!isSleeping) pet.sleep();
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
                pet.feed(engineSize.w * 0.18); 

                // Dynamic speech and timing based on satiety!
                let speechConfig = { text: "吧唧吧唧...太香了嘟！", delay: 900 };
                if (stats.satiety >= 80) speechConfig = { text: "既然主人喂了...就再吃点！", delay: 1500 };
                else if (stats.satiety <= 30) speechConfig = { text: "饿死本喵了！大口炫！", delay: 500 };
                
                triggerSpeech(speechConfig.text, '25%', speechConfig.delay, 3000); // Pops up right as the cat sprints into position
                setTimeout(() => setIsFeeding(false), 2000); // Wait 2s before zooming out
                
                // Wait 3s (time to walk + time to eat) before emptying the bowl and gaining satiety
                setTimeout(() => {
                    setBowlHasFood(false);
                    setStats(s => ({ ...s, satiety: Math.min(100, s.satiety + 40) })); 
                }, 3000);
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
                // Transition to BATHROOM scene!
                setIsTransitioning(true);
                setTimeout(() => {
                    setActiveScene('bathroom');
                    setIsTransitioning(false);
                    
                    pet.bathe(); // Trigger engine bathtub visual
                    triggerSpeech("洗香香啦，好舒爽嘟~", '50%', 500, 3000);
                    
                    // Wait for 3s bathing to finish, then go home
                    setTimeout(() => {
                        setIsTransitioning(true);
                        setTimeout(() => {
                            setActiveScene('home');
                            setStats(s => ({ ...s, clean: 100 }));
                            setIsTransitioning(false);
                            pet.triggerHeart();
                        }, 500);
                    }, 3500);
                }, 500);
                break;

            case 'heal':
                if (isSick) {
                    setIsTransitioning(true);
                    setTimeout(() => {
                        setActiveScene('hospital');
                        setIsTransitioning(false);
                        
                        triggerSpeech("复活啦！感谢抢救！", '50%', 1500, 3000);
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

                {/* ── SCROLLABLE INNER ── */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
                    <div className="p-3 md:p-6 flex flex-col gap-5">
                        
                        {/* ── MULTI-SCENE VIRTUAL ENVIRONMENT ── */}
                        <div className={`w-full h-[280px] md:h-[380px] rounded-2xl border-4 border-gray-900 shadow-[8px_8px_0px_#111827] relative overflow-hidden flex-shrink-0 transition-all duration-700 bg-black`}
                            ref={containerRef}
                        >
                            {/* Inner Screen Shadow (CRT style) */}
                            <div className="absolute inset-0 shadow-[inset_0_4px_30px_rgba(0,0,0,0.25)] pointer-events-none z-40"></div>
                            
                            {/* STATUS OVERLAY */}
                            <div className={`absolute top-4 left-4 z-40 flex items-center gap-2 font-mono text-[10px] md:text-sm font-black px-3 py-1.5 rounded border-2 border-gray-900 backdrop-blur-sm shadow-[2px_2px_0px_#111827] ${currentZone.bg}`}>
                                <div className="shrink-0 flex items-center justify-center pb-0.5">
                                    <PixelIcon grid={MINI_ZONE_ICONS[currentZone.icon].grid} palette={MINI_ZONE_ICONS[currentZone.icon].palette} size={2} />
                                </div>
                                <span className="leading-none">{currentZone.text}</span>
                            </div>

                            {/* ====== SCENE RENDERING STAGE ====== */}
                            <div className={`absolute inset-0 transition-transform duration-[1500ms] ease-in-out ${isFeeding ? 'scale-[1.05] md:scale-[1.15]' : 'scale-100'} origin-[30%_bottom] z-0`}>
                                <div className={`absolute inset-0 transition-opacity duration-700 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                                    
                                    {/* SCENE: HOME */}
                                    {activeScene === 'home' && (
                                    <>
                                        <div className={`absolute top-0 w-full h-[65%] border-b-8 border-gray-800 transition-colors duration-1000 ${isSleeping ? 'bg-[#334155]' : 'bg-[#93c5fd]'}`}>
                                            {/* Window */}
                                            <div className={`absolute left-[15%] top-[20%] w-[80px] h-[80px] md:w-[120px] md:h-[120px] border-4 border-gray-900 rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,0.3)] flex overflow-hidden ${isSleeping ? 'bg-[#0f172a]' : 'bg-[#38bdf8]'} transition-colors duration-1000`}>
                                                <div className="absolute top-1/2 w-full h-1 bg-gray-900"></div><div className="absolute left-1/2 h-full w-1 bg-gray-900"></div>
                                                {isSleeping ? <div className="absolute top-[15%] right-[15%] w-6 h-6 bg-yellow-100 rounded-full shadow-[0_0_10px_#fef08a]"></div> : <div className="absolute top-[15%] left-[15%] w-8 h-8 bg-yellow-300 rounded-full"></div>}
                                            </div>
                                            <div className={`absolute right-[20%] top-[30%] w-12 h-16 border-4 border-gray-900 shadow-[4px_4px_0px_#111827] flex items-center justify-center transition-colors duration-1000 ${isSleeping ? 'bg-amber-900' : 'bg-amber-400'}`}><div className="w-6 h-6 bg-white rounded-full border-2 border-gray-900"></div></div>
                                        </div>
                                        <div className={`absolute bottom-0 w-full h-[35%] transition-colors duration-1000 ${isSleeping ? 'bg-[#78350f]' : 'bg-[#d97706]'} flex justify-center items-start pt-2 md:pt-4`}>
                                            {/* Floor Props */}
                                            <div className="absolute top-[20%] left-[18%] opacity-90 transition-opacity duration-1000 z-10" style={{ transform: 'translate(-50%, -50%)', filter: isSleeping?'brightness(0.6)':'none' }}>
                                                <PixelIcon 
                                                    grid={bowlHasFood ? SCENE_PROPS.bowlFull.grid : SCENE_PROPS.bowlEmpty.grid} 
                                                    palette={bowlHasFood ? SCENE_PROPS.bowlFull.palette : SCENE_PROPS.bowlEmpty.palette} 
                                                    size={4} 
                                                />
                                            </div>

                                            <div className="absolute top-[30%] left-[80%] opacity-90 transition-opacity duration-1000 z-10" style={{ transform: 'translate(-50%, -50%)', filter: isSleeping?'brightness(0.6)':'none' }}>
                                                <PixelIcon grid={SCENE_PROPS.litterBox.grid} palette={SCENE_PROPS.litterBox.palette} size={4} />
                                            </div>
                                            {/* Carpet */}
                                            <div className={`w-[60%] h-[70%] border-4 border-gray-900 rounded-2xl shadow-[inset_0_4px_0px_rgba(255,255,255,0.2)] transition-colors duration-1000 relative ${isSleeping ? 'bg-[#831843]' : 'bg-[#be123c]'}`} style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.05) 75%), linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.05) 75%)', backgroundSize: '16px 16px', backgroundPosition: '0 0, 8px 8px' }}></div>
                                        </div>
                                    </>
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
                                <div className={`absolute inset-0 z-20 transition-opacity duration-500`} style={{ filter: isSleeping ? 'brightness(0.6)' : 'none', opacity: isTransitioning ? 0 : 1 }}>
                                    <PixelPetEngine 
                                        ref={petRef}
                                        width={engineSize.w}
                                        height={engineSize.h}
                                        scale={petRef.current?.width < 350 ? 1.5 : 2} 
                                        isSick={isSick}
                                        isSleeping={isSleeping}
                                        isDirty={stats.clean < 50}
                                        satiety={stats.satiety}
                                        onPetClick={handlePetClick}
                                    />
                                </div>
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
