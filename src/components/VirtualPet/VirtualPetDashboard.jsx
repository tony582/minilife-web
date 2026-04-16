import React from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../../utils/Icons';
import PixelPetEngine from './PixelPetEngine';
import PixelBackground from './PixelBackground';
import PixelIcon from './PixelIcon';
import usePetGame from './usePetGame';
import { SYSTEM_ICONS, TIME_PHASES, getActionCards, STAGE_ICONS, POOP_ICON, MINI_ZONE_ICONS, SCENE_PROPS } from './petConstants';
import { SPIRIT_FORMS } from '../../utils/spiritUtils';
import { FURNITURE_VARIANTS, ROOM_VARIANTS, FURNITURE_VARIANT_LABELS } from '../../data/roomConfig';
import { BOWL_VARIANTS } from '../../data/furnitureCatalog';
import { ITEMS_CATALOG, getItem, getHearts, FIXED_TOOLBAR, DEFAULT_HOTBAR } from '../../data/itemsCatalog';


export default function VirtualPetDashboard({
    activeKid, onClose,
    // ── Phase 2: Room persistence + decoration mode ──
    roomData          = null,
    onSkinChange      = null,
    onFurnitureChange = null,
    onPetVitalsChange = null,
    embedded          = false,
    showDecorate      = false,
    onDecorateToggle  = null,
    kidId             = null,
    newFurnitureToAdd = null,
    // ── Phase 3: Inventory ──
    decorateMode         = false,
    onFurnitureItemClick = null,
    onFlipFurniture      = null,
    onStowFurniture      = null,
    // ── Phase 4: Unified Game HUD ──
    extensionActions     = [],
    // ── Phase 5: Item / Consumables system ──
    consumables          = {},
    hotbar               = [...DEFAULT_HOTBAR],
    onUseItem            = null,
    onOpenChest          = null,
    onOpenShop,
    
    // Auto-purchase
    balance              = 0,
    onBuyConsumable      = null,
    
    // Furniture callbacks
    onHotbarChange       = null,
}) {
    // ══════════════════════════════════════════════
    // All game state & logic delegated to usePetGame hook
    // ══════════════════════════════════════════════
    const {
        petRef, containerRef, roomAspectRef,
        availableAP, consumeAP,
        engineSize,
        stats, setStats,
        isSick, isSleeping,
        embeddedToast, showToastEmbed,
        debugTimePhase, setDebugTimePhase,
        debugSpecies, debugBondLevel,
        activeScene, isTransitioning,
        isRenamingPet, setIsRenamingPet,
        newPetName, setNewPetName,
        roomConfig, setRoomConfig, currentRoomSrc, roomSkinIdx,
        handleRoomClick,
        coinBalance, spendCoins,
        selectedFurnitureAction, setSelectedFurnitureAction,
        forceBuyConfirm, setForceBuyConfirm,
        dyeTarget, setDyeTarget,
        handleFurnitureClick, handleDecorateFurnitureColor,
        handleDyeAction, handleDecorateFurnitureRemove,
        isEditMode, draggingId, handlePointerDown,
        isFeeding, bowlHasFood, bowlFoodType, isCleaning,
        speechBubble, wantsBubble,
        timePhase, timeConfig, isNightTime,
        activeEvent, bedPosition,
        handlePetClick, handlePetStateChange, handleAction,
        currentLevel, currentStageDisplay, currentZone,
    } = usePetGame({
        activeKid,
        roomData,
        onSkinChange,
        onFurnitureChange,
        onPetVitalsChange,
        kidId,
        newFurnitureToAdd,
        showDecorate,
        onFlipFurniture,
        onStowFurniture,
    });

    // ── Pixel Art Definitions (imported from petConstants.js) ──
    const ACTION_CARDS = getActionCards(isSick, isSleeping, activeScene);





    const modalContent = (
        <div className="fixed inset-0 z-[99999] p-0 md:p-8 flex justify-center items-center bg-gray-900/60 backdrop-blur-sm animate-fade-in">
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

                {/* ── DEBUG TOOLBAR (hidden in production) ── */}
                {false && (
                <div className="flex-shrink-0 border-b-2 border-dashed border-orange-300 bg-orange-50 px-4 py-2 flex flex-col gap-2 text-[10px] font-mono">
                    {/* Row 1: Time & Species & Growth */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-orange-600 mr-1">🛠 DEBUG</span>
                        {['dawn','day','dusk','night','lateNight'].map(p => (
                            <button key={p} onClick={() => setDebugTimePhase(prev => prev === p ? null : p)}
                                className={`px-2 py-0.5 rounded border ${(debugTimePhase || timePhase) === p ? 'bg-orange-500 text-white border-orange-600' : 'bg-white border-gray-300 text-gray-600'}`}>
                                {TIME_PHASES[p].label}
                            </button>
                        ))}
                    </div>
                </div>
                )}

                {/* ── SCROLLABLE INNER ── */}
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
                                         style={{ filter: (isSleeping || isNightTime) ? 'brightness(0.6)' : 'none' }}>

                                        {/* Aspect-Locked Container for Pixel-Perfect Placement */}
                                        <div className="relative w-full h-full max-w-full max-h-full"
                                             ref={roomAspectRef}
                                             style={{ aspectRatio: '1/1' }}>
                                            
                                            {/* Layer 0: Room shell — click to cycle color theme */}
                                            <img src={currentRoomSrc}
                                                 className={`absolute inset-0 w-full h-full object-contain select-none transition-opacity duration-500 ${
                                                     !isEditMode && !showDecorate ? 'cursor-pointer' : 'cursor-default pointer-events-none'
                                                 }`}
                                                 style={{ imageRendering: 'pixelated', zIndex: 0 }}
                                                 onClick={handleRoomClick}
                                                 title={`点击切换房间颜色 (${roomSkinIdx + 1}/${ROOM_VARIANTS.length})`}
                                                 alt="Room" />

                                            {/* Layer 1+: Assembled furniture pieces (only placed:true, or legacy items without placed field) */}
                                            {roomConfig.furniture
                                                .filter(item => item.placed !== false)
                                                .map(item => {
                                                const typeKey = item.type || item.id;
                                                const hasVariants = !!FURNITURE_VARIANTS[typeKey];
                                                let imgSrc = item.src;
                                                if ((item.type || item.id) === 'bowl_food') {
                                                    const bVariant = BOWL_VARIANTS[item.skinIdx || 0] || BOWL_VARIANTS[0];
                                                    if (bowlHasFood) {
                                                        imgSrc = (bowlFoodType === 'kibble' && bVariant.kibble) ? bVariant.kibble : (bVariant.treat || item.srcFull);
                                                    } else {
                                                        imgSrc = bVariant.empty;
                                                    }
                                                }
                                                const isFlipped = item.flipped || item.flipX;
                                                const instId = item.instanceId ?? item.id;
                                                return (
                                                    <div key={instId}
                                                         className={`absolute ${
                                                             isEditMode
                                                                 ? 'cursor-move ring-offset-1 hover:ring-2 hover:ring-pink-400 touch-none select-none pointer-events-auto'
                                                                 : decorateMode
                                                                     ? 'pointer-events-auto'
                                                                     : showDecorate
                                                                         ? 'pointer-events-auto cursor-pointer'
                                                                         : hasVariants
                                                                             ? 'pointer-events-auto cursor-pointer group'
                                                                             : 'pointer-events-none'
                                                         }`}
                                                         style={{
                                                             ...item.style,
                                                             zIndex: isEditMode && draggingId === item.id ? 9999 : item.zIndex,
                                                         }}
                                                         onPointerDown={(e) => handlePointerDown(e, item.id)}
                                                         onClick={(e) => {
                                                             if (!decorateMode) {
                                                                 if (onFurnitureItemClick) onFurnitureItemClick(e, item);
                                                                 else handleFurnitureClick(e, item);
                                                             } else {
                                                                 // Show new unified Action Toolbar
                                                                 setSelectedFurnitureAction({ item });
                                                             }
                                                         }}>
                                                        
                                                        {/* ── Contextual Smart Toolbar (Glassmorphism) ── */}
                                                        {decorateMode && showDecorate && selectedFurnitureAction?.item.id === item.id && (
                                                            <div
                                                                className="absolute -top-[50px] left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 z-50 px-2 py-1.5 rounded-full shadow-2xl animate-pop-in"
                                                                style={{
                                                                    background: 'rgba(255,255,255,0.85)',
                                                                    backdropFilter: 'blur(12px)',
                                                                    border: '1px solid rgba(255,255,255,1)',
                                                                    boxShadow: '0 8px 16px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,1)',
                                                                    minWidth: 'max-content'
                                                                }}
                                                                onPointerDown={e => { e.stopPropagation(); }}
                                                                onClick={e => { e.stopPropagation(); }}
                                                            >
                                                                {onFlipFurniture && (
                                                                    <button
                                                                        onClick={() => onFlipFurniture(instId)}
                                                                        className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-[15px] hover:-translate-y-0.5 active:scale-95 transition-all text-slate-700 hover:shadow-md border border-slate-100"
                                                                    >🔄</button>
                                                                )}
                                                                {FURNITURE_VARIANTS[item.type || item.id]?.length > 1 && (
                                                                    <button
                                                                        onClick={() => handleDecorateFurnitureColor(item)}
                                                                        className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-[15px] hover:-translate-y-0.5 active:scale-95 transition-all text-orange-600 hover:shadow-md border border-orange-100"
                                                                    >🎨</button>
                                                                )}
                                                                {onStowFurniture && (
                                                                    <button
                                                                        onClick={() => { onStowFurniture(instId); setSelectedFurnitureAction(null); }}
                                                                        className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-[15px] hover:-translate-y-0.5 active:scale-95 transition-all text-rose-600 hover:shadow-md border border-rose-100"
                                                                    >📦</button>
                                                                )}
                                                            </div>
                                                        )}

                                                        {showDecorate && !decorateMode && (
                                                            <div className="absolute inset-0 border-2 border-dashed border-orange-400/60 rounded-sm pointer-events-none z-10"
                                                                style={{ margin: '-3px' }} />
                                                        )}
                                                        <img src={imgSrc}
                                                             draggable={false}
                                                             className={`w-full h-auto object-contain pointer-events-none select-none transition-all duration-150 ${
                                                                 hasVariants && !isEditMode && !showDecorate ? 'group-hover:brightness-110 group-hover:scale-105' : ''
                                                             } ${showDecorate ? 'hover:brightness-110 hover:scale-105' : ''}`}
                                                             style={{ imageRendering: 'pixelated', transform: isFlipped ? 'scaleX(-1)' : 'none' }}
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
                            {activeScene === 'home' && poops.map((p) => (
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

    // ── EMBEDDED MODE: render inline inside PetRoomModal (no portal) ──
    if (embedded) {
        const hearts = getHearts(stats.satiety, stats.clean, stats.mood);

        // Direct Item cinematic usage
        const performUseCinematic = (itemId, item, bypassDeduction) => {
            switch (itemId) {
                case 'food':
                case 'catcan':
                    handleAction('feed', itemId);
                    break;
                case 'soap':
                    handleAction('bathe');
                    break;
                case 'broom':
                    handleAction('clean');
                    break;
                case 'yarn':
                    if (petRef.current && petRef.current.play) petRef.current.play();
                    setStats(s => ({ ...s, mood: Math.min(100, s.mood + 30) }));
                    break;
                case 'medicine':
                    handleAction('heal');
                    break;
            }

            // Sync with backend / inventory logic
            if (!bypassDeduction) {
                onUseItem?.(itemId);
            }
            showToastEmbed(`使用了 ${item.emoji} ${item.label}!`);
        };

        const handleDirectUseConsumable = async (itemId, bypassConfirmation = false) => {
            const qty = consumables[itemId] ?? 0;
            const item = getItem(itemId);
            if (!item) return;

            if (availableAP > 0) {
                // AP overrides everything
                consumeAP();
                showToastEmbed(`✨ 消耗 1 次免费互动！`);
                performUseCinematic(itemId, item, true);
            } else if (qty > 0) {
                // Have inventory items, consume it
                performUseCinematic(itemId, item, false);
            } else {
                // Auto-Purchase flow (AP is empty, and inventory is empty)
                if (balance < item.price) {
                    showToastEmbed('❌ 免费次数和金币均不足，快去完成任务赚取吧！');
                    return;
                }
                
                // Prompt user to consider doing tasks instead of spending money
                if (!bypassConfirmation) {
                    setForceBuyConfirm({ itemId, item });
                    return;
                }

                if (onBuyConsumable) {
                    const success = await onBuyConsumable(item.id, item.price);
                    if (success) {
                        showToastEmbed(`💸 -${item.price}金币！已购买 ${item.label}，再次点击使用。`);
                        // WE DO NOT performUseCinematic HERE anymore! The item is bought into inventory.
                    }
                }
            }
        };

        return (
            <div className="w-full h-full flex flex-col md:flex-row overflow-y-auto md:overflow-hidden relative" style={{ background: '#F4F4F0' }}>
                {/* ── MAIN CONTENT: full-bleed canvas ── */}
                <div className="w-full aspect-square md:w-auto md:aspect-auto md:flex-1 md:h-full overflow-hidden relative flex-shrink-0 bg-[#e0dbd3]">
                    {/* Game Canvas fills its container completely */}
                    <div className="absolute inset-0 w-full h-full"
                        ref={containerRef}
                    >
                            {/* ── Pixel art time-based background ── */}
                            <PixelBackground timePhase={debugTimePhase ?? timePhase} />

                            {/* ── Top HUD overlay ── */}
                            <div className="absolute top-3 left-3 right-3 z-40 flex items-start justify-between pointer-events-none">
                                {/* Left: Time pill */}
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full w-max"
                                        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', color: '#fff' }}>
                                        <div className="shrink-0 flex items-center justify-center">
                                            <PixelIcon grid={isNightTime ? SYSTEM_ICONS.moon.grid : SYSTEM_ICONS.sun.grid} palette={isNightTime ? SYSTEM_ICONS.moon.palette : SYSTEM_ICONS.sun.palette} size={1.5} />
                                        </div>
                                        <span className="text-[10px] font-black tracking-wide">{timeConfig.label}</span>
                                    </div>
                                </div>
                                {/* Right: Controls & Indicators */}
                                <div className="flex flex-col gap-1.5 items-end">

                                    <div className="flex gap-1.5 justify-end pointer-events-none w-max">
                                        <button onClick={onOpenChest} className="px-2.5 py-1.5 bg-[#f4f4f5] border-[2.5px] border-gray-900 rounded-full shadow-[2px_2px_0px_#111827] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all flex items-center justify-center gap-[5px] pointer-events-auto hover:bg-white shrink-0">
                                            <PixelIcon grid={SYSTEM_ICONS.backpack.grid} palette={SYSTEM_ICONS.backpack.palette} size={1.5} />
                                            <span className="text-[11px] font-black tracking-wide leading-none pointer-events-none text-gray-900 pr-0.5">仓库</span>
                                        </button>
                                        <button onClick={onOpenShop} className="px-2.5 py-1.5 bg-[#f4f4f5] border-[2.5px] border-gray-900 rounded-full shadow-[2px_2px_0px_#111827] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all flex items-center justify-center gap-[4px] pointer-events-auto hover:bg-white shrink-0">
                                            <PixelIcon grid={SYSTEM_ICONS.shop.grid} palette={SYSTEM_ICONS.shop.palette} size={1.4} />
                                            <span className="text-[11px] font-black tracking-wide leading-none pointer-events-none text-gray-900 pr-0.5">商店</span>
                                        </button>
                                        <button onClick={() => onDecorateToggle?.()} className={`px-2.5 py-1.5 border-[2.5px] border-gray-900 rounded-full shadow-[2px_2px_0px_#111827] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all flex items-center justify-center gap-[4px] pointer-events-auto hover:brightness-105 shrink-0 ${showDecorate ? 'bg-[#f472b6] text-white' : 'bg-[#FFE566] text-gray-900'}`}>
                                            <PixelIcon grid={showDecorate ? SYSTEM_ICONS.check.grid : SYSTEM_ICONS.decorate.grid} palette={showDecorate ? SYSTEM_ICONS.check.palette : SYSTEM_ICONS.decorate.palette} size={1.5} />
                                            <span className="text-[11px] font-black tracking-wide leading-none pointer-events-none pr-0.5">{showDecorate ? '完成' : '布局'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>



                            <div className="absolute inset-0 transition-opacity duration-700 hover:pointer-events-auto" style={{ opacity: isTransitioning ? 0 : 1 }}>
                                <div className="absolute inset-0 transition-all duration-[2000ms] flex items-center justify-center overflow-hidden"
                                     style={{ filter: (isSleeping || isNightTime) ? 'brightness(0.6)' : 'none' }}>
                                    
                                    {/* Perfect 1:1 scaling container using explicit JS sizing to prevent CSS flex bugs */}
                                    <div 
                                        className="relative shrink-0" 
                                        style={{ width: engineSize.w > 0 ? engineSize.w : '100%', height: engineSize.h > 0 ? engineSize.h : '100%' }} 
                                        ref={roomAspectRef}
                                    >
                                        <div className="absolute inset-0 pointer-events-none">
                                            {/* SCENE: HOME */}
                                            {activeScene === 'home' && (
                                            <div className="absolute inset-0 pointer-events-auto">
                                                {showDecorate && !decorateMode && (
                                                    <div className="absolute inset-0 border-2 border-dashed border-orange-400/60 rounded-sm pointer-events-none z-10" style={{ margin: '-3px' }} />
                                                )}
                                                <img src={currentRoomSrc}
                                                     className={`absolute inset-0 w-full h-full object-contain select-none transition-opacity duration-500 ${
                                                         !isEditMode && !showDecorate ? 'cursor-pointer' : 'cursor-default pointer-events-none'
                                                     } ${showDecorate ? 'opacity-80' : ''}`}
                                                     style={{ imageRendering: 'pixelated', zIndex: 0 }}
                                                     onClick={handleRoomClick}
                                                 alt="Room" />
                                            
                                            {/* Layer 1+: Assembled furniture pieces */}
                                            {roomConfig.furniture
                                                .filter(item => item.placed !== false)
                                                .map(item => {
                                                const typeKey = item.type || item.id;
                                                const hasVariants = !!FURNITURE_VARIANTS[typeKey];
                                                let imgSrc = item.src;
                                                if ((item.type || item.id) === 'bowl_food') {
                                                    const bVariant = BOWL_VARIANTS[item.skinIdx || 0] || BOWL_VARIANTS[0];
                                                    if (bowlHasFood) {
                                                        imgSrc = (bowlFoodType === 'kibble' && bVariant.kibble) ? bVariant.kibble : (bVariant.treat || item.srcFull);
                                                    } else {
                                                        imgSrc = bVariant.empty;
                                                    }
                                                }
                                                const isFlipped = item.flipped || item.flipX;
                                                const instId = item.instanceId ?? item.id;
                                                return (
                                                    <div key={instId}
                                                         className={`absolute ${
                                                             isEditMode
                                                                 ? 'cursor-move ring-offset-1 hover:ring-2 hover:ring-pink-400 touch-none select-none pointer-events-auto'
                                                                 : decorateMode
                                                                     ? 'pointer-events-auto'
                                                                     : showDecorate
                                                                         ? 'pointer-events-auto cursor-pointer'
                                                                         : hasVariants
                                                                             ? 'pointer-events-auto cursor-pointer group'
                                                                             : 'pointer-events-none'
                                                         }`}
                                                         style={{
                                                             ...item.style,
                                                             zIndex: isEditMode && draggingId === item.id ? 9999 : item.zIndex,
                                                         }}
                                                         onPointerDown={(e) => handlePointerDown(e, item.id)}
                                                         onClick={(e) => {
                                                             if (!decorateMode) {
                                                                 if (onFurnitureItemClick) onFurnitureItemClick(e, item);
                                                                 else handleFurnitureClick(e, item);
                                                             } else {
                                                                 setSelectedFurnitureAction({ item });
                                                             }
                                                         }}>
                                                        
                                                        {/* ── Contextual Smart Toolbar ── */}
                                                        {decorateMode && showDecorate && selectedFurnitureAction?.item.id === item.id && (
                                                            <div
                                                                className="absolute -top-[50px] left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 z-50 px-2 py-1.5 rounded-full shadow-2xl animate-pop-in"
                                                                style={{
                                                                    background: 'rgba(255,255,255,0.85)',
                                                                    backdropFilter: 'blur(12px)',
                                                                    border: '1px solid rgba(255,255,255,1)',
                                                                    boxShadow: '0 8px 16px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,1)',
                                                                    minWidth: 'max-content'
                                                                }}
                                                                onPointerDown={e => { e.stopPropagation(); }}
                                                                onClick={e => { e.stopPropagation(); }}
                                                            >
                                                                {onFlipFurniture && (
                                                                    <button
                                                                        onClick={() => onFlipFurniture(instId)}
                                                                        className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-[15px] hover:-translate-y-0.5 active:scale-95 transition-all text-slate-700 hover:shadow-md border border-slate-100"
                                                                    >🔄</button>
                                                                )}
                                                                {FURNITURE_VARIANTS[item.type || item.id]?.length > 1 && (
                                                                    <button
                                                                        onClick={() => handleDecorateFurnitureColor(item)}
                                                                        className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-[15px] hover:-translate-y-0.5 active:scale-95 transition-all text-orange-600 hover:shadow-md border border-orange-100"
                                                                    >🎨</button>
                                                                )}
                                                                {onStowFurniture && !['bed', 'bowl_food', 'litter'].includes(item.type || item.id) && (
                                                                    <button
                                                                        onClick={() => { onStowFurniture(instId); setSelectedFurnitureAction(null); }}
                                                                        className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-[15px] hover:-translate-y-0.5 active:scale-95 transition-all text-rose-600 hover:shadow-md border border-rose-100"
                                                                    >📦</button>
                                                                )}
                                                            </div>
                                                        )}

                                                        {showDecorate && !decorateMode && (
                                                            <div className="absolute inset-0 border-2 border-dashed border-orange-400/60 rounded-sm pointer-events-none z-10" style={{ margin: '-3px' }} />
                                                        )}
                                                        <img src={imgSrc} draggable={false}
                                                             className={`w-full h-auto object-contain pointer-events-none select-none transition-all duration-150 ${
                                                                 hasVariants && !isEditMode && !showDecorate ? 'group-hover:brightness-110 group-hover:scale-105' : ''
                                                             } ${showDecorate ? 'hover:brightness-110 hover:scale-105' : ''}`}
                                                             style={{ imageRendering: 'pixelated', transform: isFlipped ? 'scaleX(-1)' : 'none' }}
                                                             alt={item.id} />
                                                    </div>
                                                );
                                            })}
                                            </div>
                                            )}

                                        {/* SCENE: BATHROOM */}
                                        {activeScene === 'bathroom' && (
                                            <>
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
                                                <div className="absolute top-0 w-full h-[65%] bg-[#d1fae5] border-b-8 border-[#94a3b8]">
                                                    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 opacity-90 p-3 bg-white border-4 border-gray-900 rounded shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                                                        <PixelIcon grid={SCENE_PROPS.medicalCross.grid} palette={SCENE_PROPS.medicalCross.palette} size={4} />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-0 w-full h-[35%] bg-[#f1f5f9] flex justify-center">
                                                    <div className="w-full h-full opacity-50" style={{ backgroundImage: 'linear-gradient(90deg, #e2e8f0 2px, transparent 2px), linear-gradient(#e2e8f0 2px, transparent 2px)', backgroundSize: '60px 20px' }}></div>
                                                </div>
                                            </>
                                        )}

                                        {/* OVERLAYS & SHARED ENTITIES */}
                                        {engineSize.w > 0 && (
                                            <div className="absolute inset-0 z-20 transition-opacity duration-500 pointer-events-none" style={{ filter: isSleeping ? 'brightness(0.6)' : 'none', opacity: isTransitioning ? 0 : 1 }}>
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
                                                    onStateChange={handlePetStateChange}
                                                    bedPosition={bedPosition}
                                                />
                                            </div>
                                        )}
                                        {speechBubble && !isTransitioning && (
                                            <div className="absolute z-50 animate-bounce" style={{ left: speechBubble.x, bottom: '45%', transform: 'translate(-50%, 0)' }}>
                                                <div className="bg-white/95 backdrop-blur border-2 border-[#3b3b6b] px-3 py-2 rounded-2xl shadow-xl text-slate-800 font-black text-xs whitespace-nowrap">
                                                    {speechBubble.text}
                                                </div>
                                            </div>
                                        )}
                                        {activeScene === 'home' && poops.map((p) => (
                                            <div key={p.id} className="absolute z-10 animate-bounce" style={{ left: p.x, top: p.y, transform: 'translate(-50%, -50%)', opacity: isTransitioning ? 0 : 1 }}>
                                                <PixelIcon grid={POOP_ICON.grid} palette={POOP_ICON.palette} size={3} />
                                            </div>
                                        ))}
                                        {wantsBubble && !speechBubble && !isSleeping && !isTransitioning && (
                                            <div className="absolute z-50" style={{ right: '12%', top: '15%' }}>
                                                <div className="bg-white/90 backdrop-blur border border-[#3b3b6b] px-2 py-1 rounded-2xl shadow-xl flex items-center gap-1 animate-bounce">
                                                    <span className="text-base">{wantsBubble.emoji}</span>
                                                    <span className="font-black text-xs text-slate-700">{wantsBubble.text}</span>
                                                </div>
                                            </div>
                                        )}
                                        </div>{/* /absolute inset-0 */}
                                    </div>{/* /relative max-w-full */}
                                </div>
                            </div>
                        </div>{/* /canvas inner */}
                    </div>{/* /canvas absolute */}
                {/* RIGHT: Controls panel (Stacked on Mobile, Right side on PC) */}
                <div className="flex flex-col w-full md:w-[360px] md:h-full flex-shrink-0 overflow-y-auto relative z-20 border-t-4 md:border-t-0 md:border-l-4 border-gray-900"
                    style={{ background: '#F4F4F0' }}>

                        <div className="flex-shrink-0 p-4 bg-white border-b-4 border-gray-900 relative">
                            {/* Name + Edit icon */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="text-[22px] font-black leading-tight text-gray-900 tracking-tight">
                                        {roomData?.petName || '波奇'}
                                    </div>
                                    <button onClick={() => { setIsRenamingPet(true); setNewPetName(roomData?.petName || '波奇'); }} 
                                        className="px-2 py-1 bg-white hover:bg-yellow-300 font-black text-[12px] border-[2px] border-gray-900 transition-all cursor-pointer shadow-[2px_2px_0_#111827] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                                        style={{ borderRadius: '0' }}>
                                        ✎ 改名
                                    </button>
                                </div>
                                
                                {/* 像素化健康状态指示器 */}
                                <div className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-black shadow-[2px_2px_0px_#111827] flex-shrink-0"
                                    style={{ background: isSick ? '#fee2e2' : isSleeping ? '#e0e7ff' : '#fef9c3', color: isSick ? '#dc2626' : isSleeping ? '#4338ca' : '#92400e', border: `3px solid #111827` }}>
                                    
                                    {isSick ? (
                                        <div className="w-3 h-3 bg-red-600 relative">
                                            <div className="absolute top-1 bottom-1 -left-1 -right-1 bg-red-600"></div>
                                            <div className="absolute top-1 bottom-1 left-1 right-1 bg-white z-10"></div>
                                            <div className="absolute top-[4px] bottom-[4px] left-0 right-0 bg-white z-10"></div>
                                        </div>
                                    ) : isSleeping ? (
                                        <span className="font-mono text-[14px] leading-none mb-[2px]">Zzz</span>
                                    ) : (
                                        <div className="w-3 h-3 bg-green-500 relative">
                                            <div className="absolute top-1 bottom-1 -left-1 -right-1 bg-green-500"></div>
                                            <div className="absolute top-1 bottom-1 left-[2px] right-[2px] bg-white z-10"></div>
                                        </div>
                                    )}
                                    <span>{isSick ? '生病' : isSleeping ? '睡眠' : '健康'}</span>
                                </div>
                            </div>

                            {/* Minecraft-style Grid Hearts */}
                            <div className="flex items-center gap-[4px] mb-5">
                                {Array.from({ length: 5 }).map((_, i) => {
                                    const active = i < hearts;
                                    const grid = [
                                        [0,1,1,0,0,0,1,1,0],
                                        [1,2,2,1,0,1,3,3,1],
                                        [1,2,3,3,1,3,3,3,1],
                                        [1,3,3,3,3,3,3,3,1],
                                        [0,1,3,3,3,3,3,1,0],
                                        [0,0,1,3,3,3,1,0,0],
                                        [0,0,0,1,3,1,0,0,0],
                                        [0,0,0,0,1,0,0,0,0]
                                    ];
                                    return (
                                        <div key={i} className={`flex flex-col ${active ? '' : 'grayscale opacity-30'} ${active && isTransitioning ? 'scale-110' : ''}`} style={{ filter: active ? 'drop-shadow(2px 2px 0px rgba(17,24,39,0.4))' : 'none', transition: 'all 0.2s', flexShrink: 0 }}>
                                            {grid.map((row, rIdx) => (
                                                <div key={rIdx} className="flex">
                                                    {row.map((cell, cIdx) => (
                                                        <div key={cIdx} style={{ 
                                                            width: '2.5px', height: '2.5px', 
                                                            backgroundColor: cell === 1 ? '#111827' : cell === 2 ? '#fca5a5' : cell === 3 ? '#ef4444' : 'transparent' 
                                                        }} />
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* THICK STATUS BARS */}
                            <div className="flex flex-col gap-3">
                                {[
                                    { pixelSrc: '/pets/furniture/catfood_small.png', name: '饱腹', val: stats.satiety, color: 'bg-[#FF8C42]', alert: stats.satiety <= 30, help: '饿了！拖拽【脆脆粮】喂宝宝！' },
                                    { pixelSrc: '/pets/furniture/litter_white.png',  name: '清洁', val: stats.clean,   color: 'bg-[#3BCECD]', alert: stats.clean   <= 40, help: '太脏了！买【香草浴】或【扫帚】！' },
                                    { pixelSrc: '/pets/furniture/mouse_toy.png',     name: '心情', val: stats.mood,    color: 'bg-[#FF90E8]', alert: stats.mood    <= 20, help: '无聊了！给它买个【毛线球】玩耍！' },
                                ].map((s, i) => {
                                    const filledBlocks = Math.round(s.val / 10); // 0-10 blocks
                                    return (
                                        <div key={i} className="flex items-center gap-2">
                                            {/* Name */}
                                            <div className="flex items-center shrink-0 w-[32px]">
                                                <span className="text-[14px] font-black leading-none text-gray-900 tracking-tight">{s.name}</span>
                                            </div>

                                            {/* Blocky Progress Bar */}
                                            <div className="flex-1 flex gap-[2px] h-[16px] shrink-0">
                                                {Array.from({ length: 10 }).map((_, bIdx) => (
                                                    <div key={bIdx} className={`flex-1 border-[2px] border-gray-900 ${bIdx < filledBlocks ? s.color : 'bg-gray-200'}`} style={{ borderRadius: '0' }} />
                                                ))}
                                            </div>

                                            {/* Alert Button / Percentage */}
                                            <div className="w-[38px] shrink-0 flex items-center justify-end">
                                                {s.alert ? (
                                                    <button 
                                                        onClick={() => showToastEmbed(s.help)}
                                                        className="w-[20px] h-[20px] bg-red-500 hover:bg-red-400 border-[2px] border-gray-900 text-white font-black text-[12px] flex items-center justify-center shadow-[1px_1px_0_#111827] cursor-pointer animate-pulse"
                                                        style={{ borderRadius: '0', marginLeft: 'auto' }}
                                                    >
                                                        ?
                                                    </button>
                                                ) : (
                                                    <span className="text-[14px] font-black font-mono tracking-tighter" style={{ color: '#111827' }}>
                                                        {Math.floor(s.val)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>


                        {/* ── Desktop Right Column Action Grid (Replaces old dock) ── */}
                        <div className="flex flex-col p-4 shrink-0 pb-6 w-full mx-auto">
                            
                            {/* Action Panel Card */}
                            <div className="flex flex-col gap-0">
                                
                                <div className="flex justify-between items-center mb-5 mt-1">
                                    {/* Styled Title */}
                                    <div className="flex bg-[#111827] text-white px-3 py-1.5 rounded-l-xl rounded-r-sm shadow-[2px_2px_0_#A78BFA] border-2 border-[#111827]">
                                        <span className="text-[14px] font-black tracking-widest leading-none pt-0.5">逗宠百宝箱</span>
                                    </div>
                                    
                                    {/* Free AP Badge */}
                                    <div className="flex items-center gap-1.5 bg-yellow-400 border-[3px] border-gray-900 shadow-[2px_2px_0_#111827] px-2.5 py-1 rounded-full z-10">
                                        <Icons.Star size={12} className="fill-white text-white drop-shadow-[1px_1px_0_rgba(17,24,39,0.5)]" />
                                        <span className="text-xs font-black text-gray-900 leading-none pt-0.5">免费 {availableAP} 次</span>
                                    </div>
                                </div>

                                {/* 6-slot Action Grid */}
                                <div className="grid grid-cols-2 gap-3 pb-2">
                                    {FIXED_TOOLBAR.map((itemId, idx) => {
                                        const item = getItem(itemId);
                                        const qty = consumables[itemId] ?? 0;
                                        const hasStock = qty > 0;
                                        
                                        return (
                                            <button key={idx} onClick={() => handleDirectUseConsumable(itemId)}
                                                className="relative flex flex-col items-center justify-center gap-1.5 border-[3px] border-gray-900 rounded-2xl transition-all shadow-[4px_4px_0_#111827] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0_#111827] group overflow-hidden h-full min-h-[90px]"
                                                style={{
                                                    background: hasStock ? '#fbbf24' : '#F4F4F0'
                                                }}
                                            >
                                                {item && (<div className={`pointer-events-none flex flex-col flex-1 items-center justify-center`}>
                                                    {item.src ? (
                                                        <img src={item.src} className="w-8 h-8 object-contain mb-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]" style={{ imageRendering: 'pixelated' }} alt={item.label} />
                                                    ) : item.pixelGrid ? (
                                                        <PixelIcon grid={item.pixelGrid.layout || item.pixelGrid} palette={item.pixelGrid.palette || item.pixelPalette} size={2.5} className="mb-0.5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]" />
                                                    ) : (
                                                        <span className="text-[20px] mb-1">{item.emoji}</span>
                                                    )}
                                                    
                                                    <div className="text-[11px] font-black text-gray-900 mt-1 uppercase tracking-tight">
                                                        {item.label}
                                                    </div>
                                                </div>)}
                                                
                                                {/* Corner badge */}
                                                <div className="absolute top-0 right-0 min-w-[22px] h-[22px] flex items-center justify-center rounded-bl-xl text-[10px] font-black px-1.5 border-b-[3px] border-l-[3px] border-gray-900 transition-colors tracking-widest" 
                                                    style={{ background: availableAP > 0 ? '#10B981' : (hasStock ? '#ef4444' : '#f59e0b'), color: '#fff' }}>
                                                    {availableAP > 0 ? '免费' : (hasStock ? qty : (
                                                        <div className="flex items-center gap-[1px] tracking-normal">
                                                            <Icons.Star size={10} className="fill-white text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.2)]" />
                                                            <span className="leading-none text-[11px] pt-px">{item.price}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                {/* ── Dye Bottom Drawer UI ── */}
                {dyeTarget && (
                    <div className="absolute inset-x-0 bottom-0 z-50 bg-[#F4F4F0] border-t-4 border-gray-900 shadow-[0_-8px_32px_rgba(0,0,0,0.15)] overflow-hidden rounded-t-3xl pb-safe">
                        <div className="px-5 pt-4 pb-6 flex flex-col gap-4">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">🖌️ 换个颜色</h3>
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-black bg-white border-[3px] border-gray-900 shadow-[2px_2px_0_#1a1a1a]">
                                        <Icons.StarFilled size={16} className="text-yellow-400" />
                                        <span className="leading-none pt-0.5">{coinBalance?.toLocaleString() || 0}</span>
                                    </div>
                                </div>
                                <button onClick={() => setDyeTarget(null)} className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-[3px] border-gray-900 shadow-[2px_2px_0_#1a1a1a] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none transition-all">
                                    <Icons.X size={20} strokeWidth={3} className="text-gray-900" />
                                </button>
                            </div>

                            {/* Color Grid */}
                            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1" style={{ scrollbarWidth: 'none' }}>
                                {(FURNITURE_VARIANTS[dyeTarget.type || dyeTarget.id] || []).map((src, idx) => {
                                    const labels = FURNITURE_VARIANT_LABELS[dyeTarget.type || dyeTarget.id] || [];
                                    const label = labels[idx] || `颜色 ${idx + 1}`;
                                    
                                    const unlocked = dyeTarget.unlockedVariants || [0];
                                    const isUnlocked = idx === 0 || unlocked.includes(idx);
                                    const isCurrent = dyeTarget.src === src || (idx === 0 && !FURNITURE_VARIANTS[dyeTarget.type || dyeTarget.id]?.includes(dyeTarget.src) && dyeTarget.src === src); // Fallback for base src checking

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleDyeAction(idx)}
                                            className="flex-shrink-0 flex flex-col items-center gap-2 relative group"
                                            style={{ width: '80px' }}
                                        >
                                            <div 
                                                className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all bg-white relative"
                                                style={{
                                                    border: isCurrent ? '4px solid #1a1a1a' : '3px solid #e5e7eb',
                                                    boxShadow: isCurrent ? '0 6px 0 #1a1a1a' : 'none',
                                                    transform: isCurrent ? 'translateY(-4px)' : 'none',
                                                    opacity: !isUnlocked ? 0.6 : 1,
                                                }}
                                            >
                                                <img src={src} alt={label} style={{ imageRendering: 'pixelated', maxHeight: '56px', maxWidth: '56px', objectFit: 'contain' }} />
                                                
                                                {!isUnlocked && (
                                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border-2 border-gray-900 shadow-sm flex items-center justify-center">
                                                        <Icons.Lock size={14} className="text-gray-900" />
                                                    </div>
                                                )}
                                                
                                                {isCurrent && (
                                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#10b981] border-[3px] border-gray-900 shadow-[2px_2px_0_#1a1a1a] flex items-center justify-center">
                                                        <Icons.Check size={16} strokeWidth={4} className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <span className="text-[11px] font-black tracking-tight" style={{ color: isCurrent ? '#1a1a1a' : '#6b7280' }}>
                                                {label}
                                            </span>
                                            
                                            {!isUnlocked && (
                                                <div className="inline-flex items-center gap-1 bg-[#fbbf24] px-2 py-0.5 rounded-full border-2 border-gray-900">
                                                    <Icons.StarFilled size={10} className="text-yellow-50" fill="white" />
                                                    <span className="text-[10px] font-black text-gray-900">50</span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Renaming Modal (Neo-Brutalist) ── */}
                {isRenamingPet && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                        <div className="bg-[#fef9c3] w-[300px] border-[4px] border-gray-900 shadow-[8px_8px_0_#111827] p-5" style={{ borderRadius: '0' }}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">给小宝贝起个名字</h3>
                                <button onClick={() => setIsRenamingPet(false)} className="text-gray-500 hover:text-gray-900 cursor-pointer border-2 border-transparent">
                                    <Icons.X size={20} weight="bold" />
                                </button>
                            </div>
                            <input
                                type="text"
                                maxLength={8}
                                value={newPetName}
                                onChange={e => setNewPetName(e.target.value)}
                                className="w-full bg-white border-[3px] border-gray-900 p-2 font-black text-center mb-5 outline-none focus:bg-[#e0e7ff] transition-colors shadow-[inset_2px_2px_0_rgba(0,0,0,0.1)]"
                                style={{ borderRadius: '0', fontSize: '18px' }}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsRenamingPet(false)}
                                    className="flex-1 py-2 font-black border-[3px] border-gray-900 bg-white hover:bg-gray-100 shadow-[2px_2px_0_#111827] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none cursor-pointer"
                                    style={{ borderRadius: '0' }}
                                >
                                    取消
                                </button>
                                <button
                                    onClick={() => {
                                        if (newPetName.trim() && onPetNameChange) {
                                            onPetNameChange(newPetName.trim());
                                        }
                                        setIsRenamingPet(false);
                                    }}
                                    className="flex-1 py-2 font-black border-[3px] border-gray-900 bg-[#fbbf24] hover:bg-[#f59e0b] shadow-[2px_2px_0_#111827] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none cursor-pointer"
                                    style={{ borderRadius: '0' }}
                                >
                                    确定
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* ── Force Buy Confirmation Modal ── */}
                {forceBuyConfirm && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-[#FDFBF7] border-[3px] border-gray-900 shadow-[6px_6px_0_#111827] rounded-3xl w-full max-w-sm overflow-hidden flex flex-col items-center p-6 text-center animate-scale-up">
                            <div className="text-4xl mb-3 drop-shadow-md">{forceBuyConfirm.item?.emoji || '⚠️'}</div>
                            <h3 className="text-lg font-black text-gray-900 mb-2">免费次数用完啦！</h3>
                            <p className="text-[13px] font-bold text-gray-600 mb-6 px-2">
                                去完成任务赚取更多免费互动次数吧！<br/>
                                也可花费 <span className="text-yellow-600 font-black">金币</span> 购买噢。
                            </p>
                            
                            <div className="flex w-full gap-3">
                                {/* Cancel */}
                                <button
                                    onClick={() => setForceBuyConfirm(null)}
                                    className="flex-1 py-3 bg-white border-2 border-gray-900 rounded-2xl font-black text-gray-900 shadow-[2px_2px_0_#111827] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none transition-all text-sm"
                                >
                                    去完成任务
                                </button>
                                {/* Confirm */}
                                <button
                                    onClick={() => {
                                        const id = forceBuyConfirm.itemId;
                                        setForceBuyConfirm(null);
                                        handleDirectUseConsumable(id, true); // bypass confirmation
                                    }}
                                    className="flex-1 flex justify-center items-center gap-1 py-3 bg-yellow-400 border-2 border-gray-900 rounded-2xl font-black text-gray-900 shadow-[2px_2px_0_#111827] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none transition-all text-sm"
                                >
                                    继续购买(<Icons.Star size={12} className="fill-white text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.2)] -mr-0.5" /> {forceBuyConfirm.item?.price})
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
            </div>
        );
    }

    // ── FULL-SCREEN MODE: render as portal overlay ──
    return createPortal(modalContent, document.body);
}

