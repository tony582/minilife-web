// ═══════════════════════════════════════════════════════════
// usePetRooms — multi-room state management hook
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '../api/client';

const SAVE_DEBOUNCE_MS = 2000; // debounce DB writes

export function usePetRooms(kidId) {
    const [rooms, setRooms] = useState([]);
    const [activeRoomIdx, setActiveRoomIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const saveTimerRef = useRef(null);

    // ── Load rooms from API ──────────────────────────────────────────
    const loadRooms = useCallback(async () => {
        if (!kidId) return;
        try {
            setLoading(true);
            const data = await apiFetch(`/api/pet/rooms?kidId=${kidId}`);
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

    // ── Auto-create default room if none exist ───────────────────────
    useEffect(() => {
        if (loading) return;
        if (!kidId) return;
        if (rooms.length > 0) return;
        // Create the default room
        apiFetch('/api/pet/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kidId, roomName: '我的小窝' }),
        }).then(result => {
            if (result.room) {
                setRooms([result.room]);
            }
        }).catch(e => console.error('[usePetRooms] auto-create room failed:', e));
    }, [loading, kidId, rooms.length]);

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

    // ── Unlock new room ──────────────────────────────────────────────
    const unlockRoom = useCallback(async (roomName) => {
        const result = await apiFetch('/api/pet/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kidId, roomName }),
        });
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

    return {
        rooms,
        activeRoom,
        activeRoomIdx,
        setActiveRoomIdx,
        loading,
        updateSkin,
        updateFurniture,
        updatePetVitals,
        unlockRoom,
        recordInteraction,
        reload: loadRooms,
    };
}
