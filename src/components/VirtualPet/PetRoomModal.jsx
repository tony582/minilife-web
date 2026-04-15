// ═══════════════════════════════════════════════════════════
// PetRoomModal — Phase 3: Responsive Full-Screen Layout
//   Mobile: 3-tab (房间/商店/背包) full-screen UX
//   PC    : wide side-by-side (room left, shop right)
// ═══════════════════════════════════════════════════════════
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ROOM_VARIANTS } from '../../data/roomConfig';
import { ROOM_UNLOCK_COSTS } from '../../data/furnitureCatalog';
import VirtualPetDashboard from './VirtualPetDashboard';
import FurnitureShop from './FurnitureShop';
import BackpackModal from './BackpackModal';
import { usePetCoins } from '../../hooks/usePetCoins';
import { Icons } from '../../utils/Icons';
import { DEFAULT_CONSUMABLES, DEFAULT_HOTBAR, getItem } from '../../data/itemsCatalog';

const NEXT_ROOM_COSTS = [0, 500, 1500, 3000];

export default function PetRoomModal({
    rooms, activeRoomIdx, setActiveRoomIdx,
    updateSkin, updateFurniture, updatePetVitals, updatePetName,
    unlockRoom, kidId, activeKid, onClose,
    isLocked, remainingLabel, remainingSeconds, limitSeconds, progressPct,
    backpack = [],
    updateFurnitureItem,
    placeFurnitureFromGlobal,
    // ── Consumables system ──
    consumables       = { ...DEFAULT_CONSUMABLES },
    hotbar            = [...DEFAULT_HOTBAR],
    updateConsumables = null,
    updateHotbar      = null,
}) {
    // ── Notify App to hide bottom nav & intercept mobile back gesture ──
    const closedByBackRef = useRef(false);
    useEffect(() => {
        window.dispatchEvent(new Event('petroom:open'));
        
        // Push a history entry so swipe-back closes the modal instead of navigating
        window.history.pushState({ petRoom: true }, '');
        
        const handlePopState = () => {
            closedByBackRef.current = true;
            onClose();
        };
        window.addEventListener('popstate', handlePopState);
        
        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.dispatchEvent(new Event('petroom:close'));
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Nav & mode state ─────────────────────────────────────────────
    const [activeOverlay, setActiveOverlay] = useState(null); // null | 'shop' | 'backpack' | 'itemShop' | 'chest'
    const [decorateMode,  setDecorateMode]  = useState(false);
    const [pendingPlace, setPendingPlace] = useState(null);    // item waiting to be tapped-placed

    // ── Misc state ───────────────────────────────────────────────────
    const [unlocking,  setUnlocking]  = useState(false);
    const [toastMsg,   setToastMsg]   = useState('');
    const [dragState,  setDragState]  = useState(null);        // ghost drag {item,ghostX,ghostY}

    const modalRef        = useRef(null);
    const touchStartY     = useRef(null);
    const roomContainerRef = useRef(null);

    const activeRoom = rooms[activeRoomIdx] ?? rooms[0];
    const canUnlock  = rooms.length < 4;
    const nextCost   = NEXT_ROOM_COSTS[rooms.length] ?? 3000;

    // ── Helpers ──────────────────────────────────────────────────────
    const showToast = useCallback((msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 2500);
    }, []);

    const parseFurniture = (room) => {
        try { return JSON.parse(room?.furnitureJson ?? '[]') || []; } catch { return []; }
    };

    const ownedCounts = useMemo(() => {
        const arr = parseFurniture(activeRoom);
        const counts = {};
        arr.forEach(f => {
            const t = f.type || f.id;
            counts[t] = (counts[t] || 0) + 1;
        });
        return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeRoom?.furnitureJson]);

    // ── Coin hook ────────────────────────────────────────────────────
    const { balance, spendCoins } = usePetCoins(kidId) ?? {};

    // ── Swipe-down to close (mobile) ─────────────────────────────────
    const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
    const handleTouchEnd   = (e) => {
        if (!touchStartY.current) return;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        if (dy > 80 && !activeOverlay && !decorateMode) onClose();
        touchStartY.current = null;
    };

    // ── Unlock room ──────────────────────────────────────────────────
    const handleUnlock = useCallback(async () => {
        if (!canUnlock || unlocking) return;
        if (balance < nextCost) { showToast(`解锁需要 ${nextCost} 家庭币`); return; }
        setUnlocking(true);
        try {
            const result = await spendCoins(nextCost, `解锁第${rooms.length + 1}间小窝`);
            if (result?.ok) {
                await unlockRoom(`第${rooms.length + 1}间小窝`);
            } else if (result?.reason === 'api_error') {
                showToast('网络连接失败');
            } else {
                showToast('家庭币不足');
            }
        } catch (e) {
            showToast('解锁失败：' + e.message);
        } finally { setUnlocking(false); }
    }, [canUnlock, unlocking, balance, nextCost, spendCoins, unlockRoom, rooms.length, showToast]);

    // ── Buy furniture → backpack ─────────────────────────────────────
    const handleBuyFurniture = useCallback(async (furnitureItem, price, name) => {
        if (!spendCoins) return showToast('初始化中...');
        const result = await spendCoins(price, `购买${name}`);
        if (result?.ok) {
            const newItem = { ...furnitureItem, placed: false, flipped: false, instanceId: `item_${Date.now()}` };
            const current = parseFurniture(rooms[activeRoomIdx] ?? rooms[0]);
            updateFurniture(JSON.stringify([...current, newItem]));
            showToast(`🎒 ${name} 已放入背包！`);
        } else if (result?.reason === 'api_error') {
            showToast('购买失败：网络连接异常');
        } else {
            showToast(`家庭币不足，需要 ${price} 币`);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spendCoins, showToast, rooms, activeRoomIdx, updateFurniture]);

    // ── Place from inventory (物品栏 furniture tap-to-place flow) ──
    const handlePlaceFurnitureFromInventory = useCallback((item) => {
        setActiveOverlay(null);  // Close 物品栏 modal
        setPendingPlace(item);   // Enter placement mode
        // Don't force decorateMode — placement works in normal mode too
    }, []);

    const handleRoomTapPlace = useCallback((e) => {
        if (!pendingPlace) return;
        const rect = roomContainerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const leftPct   = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + '%';
        const bottomPct = ((1 - (e.clientY - rect.top) / rect.height) * 100).toFixed(1) + '%';
        const newStyle = { ...pendingPlace.style, left: leftPct, bottom: bottomPct };
        if (placeFurnitureFromGlobal && pendingPlace.originRoomId) {
            placeFurnitureFromGlobal(pendingPlace.instanceId, pendingPlace.originRoomId, newStyle);
        } else {
            updateFurnitureItem?.(pendingPlace.instanceId, f => ({
                placed: true,
                style: newStyle,
            }));
        }
        setPendingPlace(null);
        showToast('✅ 已放置！进装修模式可调整位置');
    }, [pendingPlace, updateFurnitureItem, placeFurnitureFromGlobal, showToast]);

    // ── Ghost drag (PC/desktop drag from backpack drawer) ───────────
    const handleStartDrag = useCallback((item, e) => {
        e.preventDefault();
        document.body.style.overflow = 'hidden';
        setDragState({ item, ghostX: e.clientX, ghostY: e.clientY });
    }, []);

    useEffect(() => {
        if (!dragState) return;
        const onMove = (e) =>
            setDragState(prev => prev ? { ...prev, ghostX: e.clientX, ghostY: e.clientY } : null);
        const onUp = (e) => {
            document.body.style.overflow = '';
            const rect = roomContainerRef.current?.getBoundingClientRect();
            if (rect
                && e.clientX >= rect.left && e.clientX <= rect.right
                && e.clientY >= rect.top  && e.clientY <= rect.bottom
                && updateFurnitureItem
            ) {
                const leftPct   = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + '%';
                const bottomPct = ((1 - (e.clientY - rect.top) / rect.height) * 100).toFixed(1) + '%';
                const newStyle = { ...dragState.item.style, left: leftPct, bottom: bottomPct };
                if (placeFurnitureFromGlobal && dragState.item.originRoomId) {
                    placeFurnitureFromGlobal(dragState.item.instanceId, dragState.item.originRoomId, newStyle);
                } else {
                    updateFurnitureItem(dragState.item.instanceId, f => ({
                        placed: true,
                        style: newStyle,
                    }));
                }
                showToast('✅ 家具已放置！');
            }
            setDragState(null);
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerup',   onUp);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup',   onUp);
        };
    }, [dragState, updateFurnitureItem, placeFurnitureFromGlobal, showToast]);

    // ── Furniture flip / stow (passed into VirtualPetDashboard) ─────
    const handleFlipItem  = useCallback((instanceId) => {
        updateFurnitureItem?.(instanceId, f => ({ flipped: !f.flipped }));
    }, [updateFurnitureItem]);

    const handleStowItem = useCallback((instanceId) => {
        updateFurnitureItem?.(instanceId, { placed: false, style: {} });
        showToast('📦 已收回物品栏');
    }, [updateFurnitureItem, showToast]);

    // ── Item use handler ──
    const handleUseItem = useCallback((itemId) => {
        const item = getItem(itemId);
        if (!item) return;
        const qty = consumables[itemId] ?? 0;
        if (qty <= 0) return;
        updateConsumables?.({ [itemId]: qty - 1 });
    }, [consumables, updateConsumables]);

    // ── Buy consumable item from shop ──
    const handleBuyItem = useCallback(async (itemId, price) => {
        if (!spendCoins) return false;
        const itemObj = getItem(itemId);
        if (!itemObj) return false;

        const result = await spendCoins(price, `购买 ${itemObj.label}`);
        if (result?.ok) {
            const qty = consumables[itemId] ?? 0;
            updateConsumables?.({ [itemId]: qty + 1 });
            return true;
        } else if (result?.reason === 'api_error') {
            showToast('购买失败：网络连接异常');
            return false;
        } else {
            showToast(`金币不足，需要 ${price} 币`);
            return false;
        }
    }, [spendCoins, consumables, updateConsumables, showToast]);

    // ── Add item to hotbar from chest ──
    const handleAddToHotbar = useCallback((itemId, targetIdx = null) => {
        const newSlots = [...hotbar];
        if (targetIdx !== null && targetIdx >= 0 && targetIdx < newSlots.length) {
            // Place into specific slot
            newSlots[targetIdx] = itemId;
        } else {
            const emptyIdx = newSlots.findIndex(s => s === null);
            if (emptyIdx === -1) { showToast('道具栏已满！请先清空一格'); return; }
            newSlots[emptyIdx] = itemId;
        }
        updateHotbar?.(newSlots);
        showToast(`✅ ${getItem(itemId)?.emoji} 已放入道具栏`);
    }, [hotbar, updateHotbar, showToast]);

    const handleClearHotbarSlot = useCallback((idx) => {
        const newSlots = [...hotbar];
        newSlots[idx] = null;
        updateHotbar?.(newSlots);
    }, [hotbar, updateHotbar]);

    // ── Render ───────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-[90] p-0 md:p-8 flex justify-center items-center"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                ref={modalRef}
                className="w-full max-w-6xl h-[100dvh] md:h-[88vh] bg-[#F4F4F0] flex flex-col md:rounded-3xl shadow-[0_28px_80px_-15px_rgba(0,0,0,0.6)] overflow-hidden relative border-0 md:border-4 border-gray-900"
            >
                {/* ── Header ───────────────────────────────── */}
                <div className="flex-shrink-0 bg-white px-5 py-3 flex items-center justify-between z-10" style={{ borderBottom: '1px solid #e8e0d5' }}>
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-slate-800">
                            {activeRoom?.petName ? `${activeRoom.petName}的小窝` : (activeRoom?.roomName ?? '我的小窝')}
                        </span>
                        {decorateMode && (
                            <span className="text-[10px] font-bold text-orange-400 bg-orange-50 px-2 py-0.5 rounded-full">
                                装饰中
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {!decorateMode && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F4F4F0] rounded-xl text-xs font-black text-slate-700">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="#FACC15" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                <span>{balance?.toLocaleString() ?? 0}</span>
                            </div>
                        )}
                        <button onClick={onClose}
                            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all text-slate-400 hover:text-slate-600">
                            <Icons.X size={18} />
                        </button>
                    </div>
                </div>

                {/* ── Main Dashboard ──────────────────────────────── */}
                <div
                    className="overflow-hidden flex-1 relative flex flex-col"
                    ref={roomContainerRef}
                    onClick={pendingPlace ? handleRoomTapPlace : undefined}
                    style={{ cursor: pendingPlace ? 'crosshair' : 'default' }}
                >
                    <div style={{ display: activeOverlay ? 'none' : 'flex', flex: 1, flexDirection: 'column', minHeight: 0 }}>
                        {activeRoom && (
                            <VirtualPetDashboard
                                key={activeRoom.id}
                                activeKid={activeKid}
                                roomData={activeRoom}
                                onSkinChange={updateSkin}
                                onFurnitureChange={updateFurniture}
                                onPetVitalsChange={updatePetVitals}
                                onPetNameChange={updatePetName}
                                embedded={true}
                                showDecorate={decorateMode}
                                onDecorateToggle={() => setDecorateMode(!decorateMode)}
                                kidId={kidId}
                                newFurnitureToAdd={null}
                                decorateMode={decorateMode}
                                onFlipFurniture={handleFlipItem}
                                onStowFurniture={handleStowItem}
                                consumables={consumables}
                                hotbar={hotbar}
                                onUseItem={handleUseItem}
                                onOpenChest={() => setActiveOverlay('backpack')}
                                onOpenShop={() => setActiveOverlay('shop')}
                                balance={balance ?? 0}
                                onBuyConsumable={handleBuyItem}
                                onHotbarChange={updateHotbar}
                            />
                        )}
                    </div>
                </div>


                {/* ── Unified Shop overlay (家具 + 道具 + 背包) ── */}
                {activeOverlay === 'shop' && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
                        <div className="w-full h-full md:max-w-2xl md:h-[85dvh] flex flex-col md:rounded-3xl shadow-2xl overflow-hidden animate-slide-up-fast md:animate-none md:border-4 border-gray-900 bg-[#F4F4F0]">
                            <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 md:py-4 bg-white" 
                                style={{ borderBottom: '3px solid #1a1a1a', paddingTop: 'max(env(safe-area-inset-top), 12px)' }}>
                                <span className="font-black text-lg text-gray-900">🏠 家具商城</span>
                                <button onClick={() => setActiveOverlay(null)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all bg-gray-100 hover:bg-gray-200"
                                    style={{ border: '2px solid #1a1a1a', boxShadow: '2px 2px 0 #1a1a1a' }}>
                                    <Icons.X size={15} className="text-gray-900" strokeWidth={3} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-hidden relative">
                                    <FurnitureShop
                                        balance={balance ?? 0}
                                        onBuyFurniture={handleBuyFurniture}
                                        roomSkinIdx={activeRoom?.skinIdx ?? 0}
                                        totalRoomSkins={ROOM_VARIANTS.length}
                                        disabled={isLocked}
                                        ownedCounts={ownedCounts}
                                        onBackpackItemTap={handlePlaceFurnitureFromInventory}
                                    />
                                </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* ── Placement floatbar — shown when pendingPlace is set ── */}
                {pendingPlace && (
                    <div
                        className="absolute top-0 left-0 right-0 z-[98] flex items-center gap-3 px-4 py-3"
                        style={{
                            background: 'rgba(26,26,26,0.92)',
                            backdropFilter: 'blur(8px)',
                            borderBottom: '2px solid #4DD9C0',
                        }}
                    >
                        {pendingPlace.src && (
                            <img
                                src={pendingPlace.src}
                                alt={pendingPlace.label}
                                style={{ imageRendering: 'pixelated', width: 32, height: 32, objectFit: 'contain' }}
                            />
                        )}
                        <span className="flex-1 text-sm font-black" style={{ color: '#4DD9C0' }}>
                            🛠 点击房间任意位置放下「{pendingPlace.label || pendingPlace.type}」
                        </span>
                        <button
                            onClick={() => setPendingPlace(null)}
                            className="px-3 py-1 rounded-xl text-xs font-black"
                            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                        >
                            取消
                        </button>
                    </div>
                )}

                {/* ── Backpack overlay ── */}
                {activeOverlay === 'backpack' && (
                    <BackpackModal
                        onClose={() => setActiveOverlay(null)}
                        furnitureItems={backpack}
                        onPlaceFurniture={handlePlaceFurnitureFromInventory}
                    />
                )}

                {/* Toast */}
                {toastMsg && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black shadow-xl border border-slate-700 whitespace-nowrap z-[100]">
                        {toastMsg}
                    </div>
                )}

                {/* Ghost drag */}
                {dragState && (
                    <div className="fixed z-[200] pointer-events-none" style={{ left: dragState.ghostX - 30, top: dragState.ghostY - 30, width: 60, height: 60 }}>
                        <img src={dragState.item.src} alt="drag" className="w-full h-full object-contain opacity-80" style={{ imageRendering: 'pixelated' }} />
                    </div>
                )}
            </div>
        </div>
    );
}
