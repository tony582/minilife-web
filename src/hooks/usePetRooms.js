// ═══════════════════════════════════════════════════════════
// usePetRooms — multi-room state management hook
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { apiFetch, safeJsonOr, safeJson } from '../api/client';
import { DEFAULT_CONSUMABLES, DEFAULT_HOTBAR } from '../data/itemsCatalog';

const SAVE_DEBOUNCE_MS = 2000; // debounce DB writes

export function usePetRooms(kidId) {
    const [rooms, setRooms] = useState([]);
    const [activeRoomIdx, setActiveRoomIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const saveTimerRef = useRef(null);

    // ── Load rooms from API ──────────────────────────────────────────
    const loadRooms = useCallback(async () => {
        if (!kidId) {
            console.warn('[usePetRooms] no kidId — skipping load');
            return;
        }
        try {
            setLoading(true);
            const res = await apiFetch(`/api/pet/rooms?kidId=${kidId}`);
            const data = await safeJsonOr(res, []);
            console.log('[usePetRooms] rooms loaded:', data);
            setRooms(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('[usePetRooms] load failed:', e);
        } finally {
            setLoading(false);
        }
    }, [kidId]);

    useEffect(() => {
        loadRooms();
    }, [loadRooms]);

    // ── Current active room ──────────────────────────────────────────
    const activeRoom = rooms[activeRoomIdx] ?? rooms[0] ?? null;

    // ── Save a specific room field(s) to DB (debounced) ──────────────
    const saveRoom = useCallback((roomId, updates) => {
        clearTimeout(saveTimerRef.current);
        // Optimistic local update
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, ...updates } : r));
        // Debounced DB write
        saveTimerRef.current = setTimeout(async () => {
            try {
                await apiFetch(`/api/pet/rooms/${roomId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates),
                });
            } catch (e) {
                console.error('[usePetRooms] save failed:', e);
            }
        }, SAVE_DEBOUNCE_MS);
    }, []);

    // ── Update active room skin ──────────────────────────────────────
    const updateSkin = useCallback((skinIdx) => {
        if (!activeRoom) return;
        saveRoom(activeRoom.id, { skinIdx });
    }, [activeRoom, saveRoom]);

    // ── Update furniture layout ──────────────────────────────────────
    const updateFurniture = useCallback((furnitureJson) => {
        if (!activeRoom) return;
        saveRoom(activeRoom.id, { furnitureJson });
    }, [activeRoom, saveRoom]);

    // ── Update pet vitals ────────────────────────────────────────────
    const updatePetVitals = useCallback((vitals) => {
        if (!activeRoom) return;
        saveRoom(activeRoom.id, vitals);
    }, [activeRoom, saveRoom]);

    // ── Update pet name ──────────────────────────────────────────────
    const updatePetName = useCallback((petName) => {
        if (!activeRoom) return;
        saveRoom(activeRoom.id, { petName });
    }, [activeRoom, saveRoom]);

    // ── Unlock new room ──────────────────────────────────────────────
    const unlockRoom = useCallback(async (roomName) => {
        const res = await apiFetch('/api/pet/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kidId, roomName }),
        });
        const result = await safeJson(res);
        if (result.room) {
            setRooms(prev => [...prev, result.room]);
            setActiveRoomIdx(rooms.length); // switch to new room
        }
        return result;
    }, [kidId, rooms.length]);

    // ── Record interaction time ──────────────────────────────────────
    const recordInteraction = useCallback(async (durationSeconds) => {
        if (!kidId || !durationSeconds) return;
        try {
            await apiFetch('/api/pet/interaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kidId, durationSeconds }),
            });
        } catch (e) {
            console.error('[usePetRooms] record interaction failed:', e);
        }
    }, [kidId]);

    // ── Inventory helpers ──────────────────────────────────────────
    // Parse furniture_json safely — handles both JSON string (new) and Array (legacy)
    const _parseFurniture = (room) => {
        const v = room?.furnitureJson;
        if (Array.isArray(v)) return v;
        if (typeof v === 'string' && v.length > 0) {
            try { return JSON.parse(v) || []; } catch { return []; }
        }
        return [];
    };

    // ── Global Backpack (Unplaced Items across ALL rooms) ────────────
    const globalBackpack = useMemo(() => {
        const allUnplaced = [];
        for (const r of rooms) {
            const arr = _parseFurniture(r);
            for (const f of arr) {
                if (!f.placed) {
                    allUnplaced.push({ ...f, originRoomId: r.id });
                }
            }
        }
        return allUnplaced;
    }, [rooms]);

    // Items NOT yet placed in the active room (legacy local backpack)
    const backpack = useMemo(() => {
        if (!activeRoom) return [];
        return _parseFurniture(activeRoom).filter(f => !f.placed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeRoom?.furnitureJson]);

    // Items currently placed in the room
    const placedFurniture = useMemo(() => {
        if (!activeRoom) return [];
        return _parseFurniture(activeRoom).filter(f => f.placed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeRoom?.furnitureJson]);

    // Patch a single furniture item by instanceId (in the active room)
    const updateFurnitureItem = useCallback((instanceId, patchOrFn) => {
        setRooms(prevRooms => {
            const currentRoom = prevRooms.find(r => r.id === activeRoom?.id);
            if (!currentRoom) return prevRooms;
            
            const arr = _parseFurniture(currentRoom).map(f => {
                if (f.instanceId !== instanceId) return f;
                const patch = typeof patchOrFn === 'function' ? patchOrFn(f) : patchOrFn;
                return { ...f, ...patch };
            });
            
            const newJson = JSON.stringify(arr);
            setTimeout(() => saveRoom(currentRoom.id, { furnitureJson: newJson }), 0);
            
            return prevRooms.map(r => r.id === currentRoom.id ? { ...r, furnitureJson: newJson } : r);
        });
    }, [activeRoom?.id, saveRoom]);

    // Move an item from the global backpack (potentially another room) into the active room
    const placeFurnitureFromGlobal = useCallback((instanceId, originRoomId, newStyle) => {
        setRooms(prevRooms => {
            const currentRoom = prevRooms.find(r => r.id === activeRoom?.id);
            const originRoom = prevRooms.find(r => r.id === originRoomId);
            
            if (!currentRoom || !originRoom) return prevRooms;
            
            const originArr = _parseFurniture(originRoom);
            const itemToMove = originArr.find(f => f.instanceId === instanceId);
            if (!itemToMove) return prevRooms;

            const updatedItem = { ...itemToMove, placed: true, style: newStyle || {} };
            let nextRooms = [...prevRooms];
            
            if (originRoom.id === currentRoom.id) {
                // Moving inside the SAME room
                const activeArr = _parseFurniture(currentRoom).map(f => 
                    f.instanceId === instanceId ? updatedItem : f
                );
                const activeJson = JSON.stringify(activeArr);
                setTimeout(() => saveRoom(currentRoom.id, { furnitureJson: activeJson }), 0);
                nextRooms = nextRooms.map(r => r.id === currentRoom.id ? { ...r, furnitureJson: activeJson } : r);
            } else {
                // Moving CROSS rooms
                const newOriginArr = originArr.filter(f => f.instanceId !== instanceId);
                const newActiveArr = [..._parseFurniture(currentRoom), updatedItem];
                
                const originJson = JSON.stringify(newOriginArr);
                const activeJson = JSON.stringify(newActiveArr);
                
                setTimeout(() => {
                    saveRoom(originRoom.id, { furnitureJson: originJson });
                    saveRoom(currentRoom.id, { furnitureJson: activeJson });
                }, 0);
                
                nextRooms = nextRooms.map(r => {
                    if (r.id === originRoom.id) return { ...r, furnitureJson: originJson };
                    if (r.id === currentRoom.id) return { ...r, furnitureJson: activeJson };
                    return r;
                });
            }
            return nextRooms;
        });
    }, [activeRoom?.id, saveRoom]);

    // ── Consumables helpers ──────────────────────────────────────────
    const _parseJson = (val, fallback) => {
        if (val && typeof val === 'object') return val;
        if (typeof val === 'string' && val.length > 0) {
            try { return JSON.parse(val); } catch { /**/ }
        }
        return fallback;
    };

    const consumables = useMemo(() => (
        { ...DEFAULT_CONSUMABLES, ..._parseJson(activeRoom?.consumablesJson, {}) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [activeRoom?.consumablesJson]);

    const hotbar = useMemo(() => (
        _parseJson(activeRoom?.hotbarJson, [...DEFAULT_HOTBAR])
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [activeRoom?.hotbarJson]);

    const updateConsumables = useCallback((updates) => {
        if (!activeRoom) return;
        const next = { ...DEFAULT_CONSUMABLES, ..._parseJson(activeRoom.consumablesJson, {}), ...updates };
        saveRoom(activeRoom.id, { consumablesJson: JSON.stringify(next) });
    }, [activeRoom, saveRoom]);

    const updateHotbar = useCallback((slots) => {
        if (!activeRoom) return;
        saveRoom(activeRoom.id, { hotbarJson: JSON.stringify(slots) });
    }, [activeRoom, saveRoom]);

    return {
        rooms,
        activeRoom,
        activeRoomIdx,
        setActiveRoomIdx,
        loading,
        updateSkin,
        updateFurniture,
        updatePetVitals,
        updatePetName,
        unlockRoom,
        recordInteraction,
        reload: loadRooms,
        // ── Furniture inventory ──
        backpack,
        globalBackpack,
        placedFurniture,
        updateFurnitureItem,
        placeFurnitureFromGlobal,
        // ── Consumables + Hotbar ──
        consumables,
        hotbar,
        updateConsumables,
        updateHotbar,
    };
}
