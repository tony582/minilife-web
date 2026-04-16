// ═══════════════════════════════════════════════
// usePetGame.js — 宠物游戏核心状态 & 逻辑 Hook
// 从 VirtualPetDashboard 提取
// ═══════════════════════════════════════════════
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { getTimePhase, TIME_PHASES } from './petConstants';
import { DEFAULT_ROOM, FURNITURE_VARIANTS, ROOM_VARIANTS } from '../../data/roomConfig';
import { usePetCoins } from '../../hooks/usePetCoins';
import { PRICE_TABLE, SKIN_CHANGE_COST, ROOM_SKIN_COST, BOWL_VARIANTS } from '../../data/furnitureCatalog';
import { useDataContext } from '../../context/DataContext.jsx';

/**
 * usePetGame — 宠物房间的全部游戏状态与逻辑
 * 
 * @param {object} params
 * @returns 扁平对象，包含所有 state/dispatch/ref 供 UI 消费
 */
export default function usePetGame({
    activeKid,
    roomData       = null,
    onSkinChange   = null,
    onFurnitureChange = null,
    onPetVitalsChange = null,
    kidId          = null,
    newFurnitureToAdd = null,
    showDecorate   = false,
    onFlipFurniture = null,
    onStowFurniture = null,
}) {
    // ── REFS ──
    const petRef = useRef(null);
    const containerRef = useRef(null);
    const roomAspectRef = useRef(null);
    const lastPosRef = useRef(null);
    const clickCountRef = useRef(0);
    const clickResetTimer = useRef(null);
    const eventTimerRef = useRef(null);
    const vitalsRef = useRef(null);

    // ── ACTION POINTS LOGIC ──
    let dataContext;
    try { dataContext = useDataContext(); } catch(e) {}
    const tasks = dataContext?.tasks || [];
    
    const earnedAP = useMemo(() => {
        if (!kidId) return 0;
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        
        let completions = 0;
        tasks.forEach(t => {
            const hist = t.history || {};
            let entry = t.kidId === 'all' ? hist[todayStr]?.[kidId] : hist[todayStr];
            if (!entry) return;
            if (Array.isArray(entry)) {
                completions += entry.filter(e => ['completed', 'pending_approval', 'in_progress'].includes(e.status)).length;
            } else if (['completed', 'pending_approval', 'in_progress'].includes(entry.status)) {
                completions += (entry.count || 1);
            }
        });
        return completions;
    }, [tasks, kidId]);

    const BASE_AP = 3;
    const totalAP = BASE_AP + earnedAP;

    const [usedAP, setUsedAP] = useState(() => {
        if (!kidId) return 0;
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const key = `minilife_used_ap_${kidId}_${todayStr}`;
        const stored = localStorage.getItem(key);
        return stored ? parseInt(stored, 10) : 0;
    });

    const availableAP = Math.max(0, totalAP - usedAP);

    const consumeAP = () => {
        if (!kidId) return;
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const key = `minilife_used_ap_${kidId}_${todayStr}`;
        const newUsed = usedAP + 1;
        localStorage.setItem(key, newUsed);
        const yest = new Date(now); yest.setDate(yest.getDate() - 1);
        const yestStr = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(yest.getDate()).padStart(2, '0')}`;
        localStorage.removeItem(`minilife_used_ap_${kidId}_${yestStr}`);
        setUsedAP(newUsed);
    };

    const [engineSize, setEngineSize] = useState({ w: 400, h: 300 });

    // ── GAME STATE ──
    const [stats, setStats] = useState(() => ({
        satiety: roomData?.petHunger ?? 60,
        clean:   100,
        mood:    roomData?.petMood   ?? 85,
    }));
    const [petLastFed, setPetLastFed] = useState(roomData?.petLastFed ?? '');
    const [poops, setPoops] = useState([]);
    const [isSick, setIsSick] = useState(false);
    const [isSleeping, setIsSleeping] = useState(() => {
        const initialPhase = getTimePhase();
        if (initialPhase === 'lateNight') return true;
        return false;
    });

    const [embeddedToast, setEmbeddedToast] = useState('');
    const showToastEmbed = useCallback((msg) => {
        setEmbeddedToast(msg);
        setTimeout(() => setEmbeddedToast(''), 2000);
    }, []);

    // ── DEBUG CONTROLS ──
    const [debugTimePhase, setDebugTimePhase] = useState(null);
    const [debugSpecies, setDebugSpecies] = useState('pochi');
    const [debugBondLevel, setDebugBondLevel] = useState(null);
    
    // ── SCENE STATE ──
    const [activeScene, setActiveScene] = useState('home');
    const [isTransitioning, setIsTransitioning] = useState(false);

    // ── Pet Renaming State ──
    const [isRenamingPet, setIsRenamingPet] = useState(false);
    const [newPetName, setNewPetName] = useState(roomData?.petName || '波奇');

    // ── Parse furniture ──
    const parseFurnitureField = (raw) => {
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'string' && raw.length > 0) {
            try { return JSON.parse(raw); } catch { return []; }
        }
        return [];
    };

    const [roomConfig, setRoomConfig] = useState(() => ({
        ...DEFAULT_ROOM,
        furniture: parseFurnitureField(roomData?.furnitureJson ?? roomData?.furniture_json),
    }));

    useEffect(() => {
        setRoomConfig({
            ...DEFAULT_ROOM,
            furniture: parseFurnitureField(roomData?.furnitureJson ?? roomData?.furniture_json),
        });
    }, [roomData?.id, roomData?.furnitureJson]);
    
    const roomConfigRef = useRef(roomConfig);
    useEffect(() => { roomConfigRef.current = roomConfig; }, [roomConfig]);

    // ── Coins ──
    const { balance: coinBalance, spendCoins, refundCoins } = usePetCoins(kidId || '') ?? {};

    // ── Decoration state ──
    const [selectedFurnitureAction, setSelectedFurnitureAction] = useState(null);
    const [forceBuyConfirm, setForceBuyConfirm] = useState(null);

    useEffect(() => {
        setIsEditMode(!!showDecorate);
        if (!showDecorate) setSelectedFurnitureAction(null);
    }, [showDecorate]);

    // ── ROOM SKIN ──
    const [roomSkinIdx, setRoomSkinIdx] = useState(() => roomData?.skinIdx ?? 0);
    const currentRoomSrc = ROOM_VARIANTS[roomSkinIdx] ?? ROOM_VARIANTS[0];

    const handleRoomClick = async (e) => {
        if (isEditMode) return;
        if (e.target !== e.currentTarget) return;
        if (showDecorate) {
            await handleDecorateSkinChange();
        }
    };

    const handleDecorateSkinChange = useCallback(async () => {
        if (!spendCoins) return;
        const result = await spendCoins(ROOM_SKIN_COST, '换房间配色');
        if (result.ok) {
            const nextIdx = (roomSkinIdx + 1) % ROOM_VARIANTS.length;
            setRoomSkinIdx(nextIdx);
            onSkinChange?.(nextIdx);
        } else {
            alert(`您的家庭币不足！需要 ${ROOM_SKIN_COST} 币，当前余额 ${coinBalance ?? 0} 币`);
        }
    }, [spendCoins, roomSkinIdx, onSkinChange, coinBalance]);

    // ── FURNITURE COLOR SKINS ──
    const [dyeTarget, setDyeTarget] = useState(null);

    const handleFurnitureClick = (e, item) => {
        if (isEditMode) return;
        e.stopPropagation();
        if (showDecorate) {
            const rect = e.currentTarget.getBoundingClientRect();
            setSelectedFurnitureAction({ item, rect });
        }
    };

    const handleDecorateFurnitureColor = useCallback((item) => {
        setDyeTarget(item);
        setSelectedFurnitureAction(null);
    }, []);

    const handleDyeAction = async (variantIdx) => {
        if (!dyeTarget) return;

        const baseType = dyeTarget.type || dyeTarget.id;
        const variants = FURNITURE_VARIANTS[baseType];
        
        let unlocked = dyeTarget.unlockedVariants || [0];

        if (!unlocked.includes(0)) {
            unlocked = [0, ...unlocked];
        }

        const isUnlocked = unlocked.includes(variantIdx);

        if (!isUnlocked) {
            if (!spendCoins) return;
            const result = await spendCoins(50, '家具换色');
            if (!result.ok) {
                alert(`家庭币不足！染色需要 50 币`);
                return;
            }
            unlocked.push(variantIdx);
        }

        const nextSrc = variants[variantIdx];
        const isBowl = baseType === 'bowl_food';
        const newFurniture = roomConfig.furniture.map(f =>
            (f.instanceId === dyeTarget.instanceId || f.id === dyeTarget.id)
                ? { ...f, src: nextSrc, unlockedVariants: unlocked, ...(isBowl ? { skinIdx: variantIdx } : {}) } 
                : f
        );
        
        setRoomConfig(c => ({ ...c, furniture: newFurniture }));
        setTimeout(() => onFurnitureChange?.(JSON.stringify(newFurniture)), 0);
        
        setDyeTarget(newFurniture.find(f => (f.instanceId === dyeTarget.instanceId || f.id === dyeTarget.id)));
    };

    // ── Remove furniture ──
    const handleDecorateFurnitureRemove = useCallback(async (item) => {
        if (onStowFurniture) {
            onStowFurniture(item.instanceId || item.id);
            setSelectedFurnitureAction(null);
            return;
        }
        const price = PRICE_TABLE[item.type || item.id] ?? 0;
        const refund = Math.floor(price * 0.5);
        const newFurniture = roomConfig.furniture.filter(f => f.id !== item.id);
        setRoomConfig(c => ({ ...c, furniture: newFurniture }));
        onFurnitureChange?.(JSON.stringify(newFurniture));
        if (refund > 0 && refundCoins) await refundCoins(refund, '移除装饰退款');
        setSelectedFurnitureAction(null);
    }, [roomConfig.furniture, onFurnitureChange, refundCoins]);

    // ── Add furniture ──
    const addFurnitureToRoom = useCallback((newItem) => {
        setRoomConfig(prev => {
            const newFurniture = [...prev.furniture, newItem];
            setTimeout(() => onFurnitureChange?.(JSON.stringify(newFurniture)), 0);
            return { ...prev, furniture: newFurniture };
        });
    }, [onFurnitureChange]);

    useEffect(() => {
        if (newFurnitureToAdd) addFurnitureToRoom(newFurnitureToAdd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newFurnitureToAdd]);
    
    // ── EDIT MODE (DRAG & DROP) ──
    const [isEditMode, setIsEditMode] = useState(false);
    const [draggingId, setDraggingId] = useState(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(entries => {
            const entry = entries[0];
            if (entry) {
                const maxAllowed = Math.min(entry.contentRect.width, entry.contentRect.height);
                setEngineSize({ w: maxAllowed, h: maxAllowed });
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const handlePointerDown = (e, id) => {
        if (!isEditMode) return;
        setDraggingId(id);
        lastPosRef.current = { x: e.clientX, y: e.clientY };
    };

    useEffect(() => {
        if (!draggingId || !isEditMode) return;

        const handleWinMove = (e) => {
            if (!roomAspectRef.current || !lastPosRef.current) return;
            
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
            if (onFurnitureChange) {
                setRoomConfig(c => {
                    setTimeout(() => onFurnitureChange(JSON.stringify(c.furniture)), 0);
                    return c;
                });
            }
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
    const [bowlFoodType, setBowlFoodType] = useState(null);
    const [isCleaning, setIsCleaning] = useState(false);
    const [speechBubble, setSpeechBubble] = useState(null);
    
    // ── NEEDS BUBBLE & TOUCH STATES ──
    const [wantsBubble, setWantsBubble] = useState(null);

    // ── DAY/NIGHT CYCLE ──
    const [timePhase, setTimePhase] = useState(getTimePhase());
    useEffect(() => {
        const interval = setInterval(() => setTimePhase(getTimePhase()), 60000);
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
                const timeMoodMult = isNightTime ? 0.6 : 1.0;
                
                let newSatiety = Math.max(0, s.satiety - 0.014); 
                let newClean = Math.max(0, s.clean - (0.008 + poops.length * 0.005)); 
                let newMood = Math.max(0, s.mood - ((0.01 + poopsPenalty * 0.01) * timeMoodMult));
                
                // Poop Spawner
                const poopChance = 0.008;
                if (activeScene === 'home' && Math.random() < poopChance && s.satiety > 20 && poops.length < 5) {
                    let targetX = engineSize.w * 0.8 + (Math.random() * 40 - 20);
                    let targetY = engineSize.h * 0.75 - 15 + (Math.random() * 20);
                    
                    const litter = roomConfigRef.current.furniture.find(i => (i.type || i.id).includes('litter') && i.placed !== false);
                    if (litter && litter.style) {
                        if (litter.style.left) {
                            const leftPct = parseFloat(litter.style.left) / 100;
                            const widthPct = parseFloat(litter.style.width || "10") / 100;
                            targetX = engineSize.w * (leftPct + widthPct / 2) + (Math.random() * 4 - 2);
                        }
                        if (litter.style.bottom) {
                            const bottomPct = parseFloat(litter.style.bottom) / 100;
                            targetY = engineSize.h * (1 - bottomPct) - 20 + (Math.random() * 4 - 2);
                        } else if (litter.style.top) {
                            const topPct = parseFloat(litter.style.top) / 100;
                            targetY = engineSize.h * (topPct) + 15 + (Math.random() * 4 - 2);
                        }
                    }

                    setPoops(prev => [...prev, {
                        id: Date.now() + Math.random(),
                        x: targetX,
                        y: targetY
                    }]);
                }
                
                if (newSatiety === 0 || poops.length >= 4) setIsSick(true);
                if (newSatiety < 20 && s.clean < 30 && Math.random() < 0.002) setIsSick(true);
                
                return { satiety: newSatiety, clean: newClean, mood: newMood };
            });
        }, 5000);
        
        return () => clearInterval(interval);
    }, [isSleeping, poops.length, engineSize, activeScene, isNightTime]);

    // ── PERSIST PET VITALS to DB every 30s (when embedded) ──
    vitalsRef.current = { satiety: stats.satiety, mood: stats.mood };
    useEffect(() => {
        if (!onPetVitalsChange) return;
        const interval = setInterval(() => {
            onPetVitalsChange({
                petHunger: Math.round(vitalsRef.current.satiety),
                petMood:   Math.round(vitalsRef.current.mood),
                petState:  isSleeping ? 'sleeping' : 'idle',
                petLastFed,
            });
        }, 30000);
        return () => clearInterval(interval);
    }, [onPetVitalsChange, isSleeping, petLastFed]);

    // ── NEEDS BUBBLE SYSTEM ──
    useEffect(() => {
        const interval = setInterval(() => {
            if (isSleeping || isSick || speechBubble) return;
            
            if (stats.satiety <= 30 && Math.random() < 0.3) {
                setWantsBubble({ emoji: '🍖', text: '好饿...' });
            } else if (stats.clean <= 40 && Math.random() < 0.25) {
                setWantsBubble({ emoji: '💧', text: '想洗澡...' });
            } else if (stats.mood <= 20 && Math.random() < 0.2) {
                setWantsBubble({ emoji: '💔', text: '好无聊...' });
            } else {
                setWantsBubble(null);
            }
        }, 4000);
        return () => clearInterval(interval);
    }, [stats, isSleeping, isSick, speechBubble]);

    // ── TOUCH / CLICK INTERACTION ──
    const handlePetClick = (pos) => {
        if (isSleeping || isSick || isTransitioning) return;
        const pet = petRef.current;
        
        clickCountRef.current += 1;
        const clicks = clickCountRef.current;
        
        clearTimeout(clickResetTimer.current);
        clickResetTimer.current = setTimeout(() => { clickCountRef.current = 0; }, 2000);
        
        if (clicks >= 5) {
            triggerSpeech("别闹啦！人家会不开心的！", '50%', 0, 2000);
            setStats(s => ({ ...s, mood: Math.max(0, s.mood - 3) }));
            clickCountRef.current = 0;
        } else {
            if (pet) pet.triggerHeart();
            setStats(s => ({ ...s, mood: Math.min(100, s.mood + 2) }));
            setWantsBubble(null);
            
            const responses = ["喵~", "嗯？", "摸摸~", "❤️", "嘿嘿"];
            if (Math.random() < 0.4) {
                triggerSpeech(responses[Math.floor(Math.random() * responses.length)], '50%', 0, 1500);
            }
        }
    };

    // ── RANDOM EVENTS SYSTEM ──
    const [activeEvent, setActiveEvent] = useState(null);

    const bedPosition = useMemo(() => {
        const bed = roomConfig.furniture.find(f => {
            if (f.placed === false) return false;
            const hasBedKeyword = (str) => str && str.toLowerCase().includes('bed');
            return hasBedKeyword(f.type) || hasBedKeyword(f.id) || hasBedKeyword(f.src);
        });
        if (!bed || !bed.style) return null;
        const parseVal = (str, fallback) => {
            const val = parseFloat(str);
            return isNaN(val) ? fallback : val;
        };
        const bedWidthPct = parseVal(bed.style.width, 20);
        const bedLeftPct = parseVal(bed.style.left, 40);
        const bedBottomPct = parseVal(bed.style.bottom, 50);
        const bedHeightPct = bedWidthPct * (82 / 110);
        return {
            xPct: (bedLeftPct + bedWidthPct / 2) / 100 + (bed.flipped ? -0.01 : 0.01),
            yPct: (bedBottomPct + bedHeightPct * 0.15) / 100
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
            onTrigger: () => { setStats(s => ({ ...s, mood: Math.max(0, s.mood - 10) })); },
        },
    ], []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const scheduleEvent = () => {
            const delay = (180 + Math.random() * 180) * 1000;
            eventTimerRef.current = setTimeout(() => {
                if (isTransitioning || speechBubble || activeEvent) { scheduleEvent(); return; }
                
                const pool = RANDOM_EVENTS.filter(e => {
                    if (e.needsSleep && !isSleeping) return false;
                    if (!e.needsSleep && isSleeping) return false;
                    if (activeScene !== 'home') return false;
                    return true;
                });
                if (pool.length === 0) { scheduleEvent(); return; }
                
                const totalWeight = pool.reduce((s, e) => s + e.weight, 0);
                let roll = Math.random() * totalWeight;
                let selected = pool[0];
                for (const ev of pool) {
                    roll -= ev.weight;
                    if (roll <= 0) { selected = ev; break; }
                }
                
                setActiveEvent({ type: selected.type, emoji: selected.emoji });
                triggerSpeech(selected.speech, '50%', 500, 3000);
                selected.onTrigger();
                if (petRef.current) petRef.current.triggerHeart();
                
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

    // ── PET STATE CHANGE (animation complete callback) ──
    const handlePetStateChange = useCallback((newState) => {
        if (newState === 'idle') {
            setIsFeeding(prevFeeding => {
                if (prevFeeding) {
                    setBowlHasFood(false);
                    setBowlFoodType(null);
                    const now = new Date().toISOString();
                    setStats(s => {
                        const nextStats = { ...s, satiety: Math.min(100, s.satiety + 40) };
                        vitalsRef.current = nextStats;
                        onPetVitalsChange?.({
                            petHunger: Math.round(nextStats.satiety),
                            petMood:   Math.round(nextStats.mood),
                            petState:  'idle',
                            petLastFed: now,
                        });
                        return nextStats;
                    });
                    setPetLastFed(now);
                    return false;
                }
                return prevFeeding;
            });
        }
    }, [onPetVitalsChange, setStats, setPetLastFed]);

    // ── HANDLE ACTION (core interaction dispatcher) ──
    const handleAction = (type, payload) => {
        if (!petRef.current || isTransitioning) return;
        const pet = petRef.current;

        if (type === 'sleep') {
            triggerSpeech(isSleeping ? "伸懒腰...早安主人！" : "呼噜噜...晚安主人 Zzz", '50%');
            setIsSleeping(!isSleeping);
            return;
        }
        
        if (isSleeping) return;

        if (isSick && type !== 'heal' && type !== 'clean') {
            return;
        }

        switch (type) {
            case 'feed': {
                if (activeScene !== 'home') return;
                setIsFeeding(true);
                setBowlHasFood(true);
                setBowlFoodType(payload === 'food' ? 'kibble' : 'treat');
                const bowlPos = (() => {
                    const bowl = roomConfig.furniture.find(f => (f.type || f.id) === 'bowl_food');
                    const leftPct = bowl && bowl.style && bowl.style.left ? parseFloat(bowl.style.left) / 100 : 0.46;
                    const bottomPct = bowl && bowl.style && bowl.style.bottom ? parseFloat(bowl.style.bottom) / 100 : 0.18;
                    return { 
                        x: engineSize.w * (leftPct + 0.045),
                        y: engineSize.h * (1 - bottomPct)
                    };
                })();
                pet.feed(bowlPos.x, bowlPos.y);

                let speechConfig = { text: "吧唧吧唧...太香了嘟！", delay: 900 };
                if (stats.satiety >= 80) speechConfig = { text: "既然主人喂了...就再吃点！", delay: 1500 };
                else if (stats.satiety <= 30) speechConfig = { text: "饿死本喵了！大口炫！", delay: 500 };
                
                triggerSpeech(speechConfig.text, '25%', speechConfig.delay, 3000);
                break;
            }

            case 'clean':
                if (activeScene !== 'home') return;
                setIsCleaning(true);
                setTimeout(() => {
                    setPoops([]);
                    setIsCleaning(false);
                    triggerSpeech("呼~房间终于没那么臭了！", '50%', 0, 2000);
                }, 1000);
                break;

            case 'bathe':
                if (activeScene !== 'home') return;
                setIsTransitioning(true);
                setTimeout(() => {
                    setActiveScene('bathroom');
                    setIsTransitioning(false);
                    
                    if (engineSize && engineSize.w > 0 && petRef.current && petRef.current.feed) {
                        petRef.current.feed(engineSize.w / 2, engineSize.h / 2);
                    }
                    
                    pet.bathe();
                    triggerSpeech("洗香香啦，好舒爽嘟~", '50%', 500, 3000);
                
                setTimeout(() => {
                    setStats(s => ({ ...s, clean: 100 }));
                    pet.triggerHeart();
                    
                    setTimeout(() => {
                        setIsTransitioning(true);
                        setTimeout(() => {
                            setActiveScene('home');
                            setIsTransitioning(false);
                        }, 500);
                    }, 2000);
                }, 5000);
                }, 500);
                break;

            case 'heal':
                if (isSick) {
                    setIsTransitioning(true);
                    setTimeout(() => {
                        setActiveScene('hospital');
                        setIsTransitioning(false);
                        
                        if (engineSize && engineSize.w > 0 && petRef.current && petRef.current.feed) {
                            petRef.current.feed(engineSize.w / 2, engineSize.h / 2);
                        }
                        
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

    // ── ZONE STATUS ──
    const getZoneStatus = () => {
        if (isSick) return { icon: 'alert', text: 'Mini 危险警告！', bg: 'bg-red-500 text-white animate-pulse' };
        if (isSleeping) return { icon: 'sleep', text: 'Mini 睡眠模式', bg: 'bg-blue-900 text-white border-blue-400' };
        if (activeScene === 'home') return { icon: 'home', text: 'Mini 小屋', bg: 'bg-white/90 text-gray-800' };
        if (activeScene === 'bathroom') return { icon: 'bath', text: 'Mini 浴室', bg: 'bg-white/90 text-gray-800' };
        return { icon: 'hospital', text: 'Mini 急诊室', bg: 'bg-white/90 text-gray-800' };
    };

    const currentLevel = activeKid.level || 1;
    const currentStageDisplay = (level => level===0?1 : level<=5?2 : level<=12?3 : level<=20?4 : 5)(currentLevel);
    const currentZone = getZoneStatus();

    // ── Return all state and handlers ──
    return {
        // Refs
        petRef,
        containerRef,
        roomAspectRef,

        // AP
        earnedAP,
        totalAP,
        availableAP,
        usedAP,
        consumeAP,

        // Engine
        engineSize,

        // Game state
        stats, setStats,
        petLastFed,
        poops,
        isSick,
        isSleeping,
        embeddedToast,
        showToastEmbed,

        // Debug
        debugTimePhase, setDebugTimePhase,
        debugSpecies,
        debugBondLevel, setDebugBondLevel,

        // Scene
        activeScene,
        isTransitioning,

        // Pet naming
        isRenamingPet, setIsRenamingPet,
        newPetName, setNewPetName,

        // Room
        roomConfig, setRoomConfig,
        currentRoomSrc,
        roomSkinIdx,
        handleRoomClick,
        coinBalance,
        spendCoins,

        // Furniture
        selectedFurnitureAction, setSelectedFurnitureAction,
        forceBuyConfirm, setForceBuyConfirm,
        dyeTarget, setDyeTarget,
        handleFurnitureClick,
        handleDecorateFurnitureColor,
        handleDyeAction,
        handleDecorateFurnitureRemove,

        // Drag & drop
        isEditMode,
        draggingId,
        handlePointerDown,

        // Cinematic
        isFeeding,
        bowlHasFood,
        bowlFoodType,
        isCleaning,
        speechBubble,

        // Needs bubble
        wantsBubble,

        // Day/night
        timePhase,
        timeConfig,
        isNightTime,

        // Events
        activeEvent,

        // Bed
        bedPosition,

        // Interaction
        handlePetClick,
        handlePetStateChange,
        handleAction,

        // Level
        currentLevel,
        currentStageDisplay,
        currentZone,
    };
}
