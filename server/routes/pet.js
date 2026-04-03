// ═══════════════════════════════════════════════════════
// Pet Rooms API — /api/pet/*
// ═══════════════════════════════════════════════════════
const express = require('express');

const ROOM_UNLOCK_COSTS = [0, 500, 1500, 3000]; // room index 0 = free
const DEFAULT_FURNITURE = JSON.stringify([
    { id: 'bed',        src: '/pets/furniture/bed_pink.png',             style: { bottom: '50.240%', left: '39.808%', width: '21.484%' }, zIndex: 7,  skinIdx: 0 },
    { id: 'shelf',      src: '/pets/furniture/bookshelf_tan_fixed.png',  style: { bottom: '34.686%', left: '5.224%',  width: '17.000%' }, zIndex: 2,  skinIdx: 0 },
    { id: 'plant_tree', src: '/pets/furniture/plant_tree.png',           style: { bottom: '42.196%', left: '21.620%', width: '10.000%' }, zIndex: 2,  skinIdx: 0 },
    { id: 'bowl_food',  src: '/pets/furniture/bowl_blue_empty_exact.png',srcFull: '/pets/furniture/bowl_blue_full_exact.png', style: { bottom: '20.195%', left: '55.285%', width: '8.398%' }, zIndex: 11, skinIdx: 0, interactive: true },
    { id: 'window_curtain', src: '/pets/furniture/railing_window.png',  style: { bottom: '52.315%', left: '17.719%', width: '22.000%' }, zIndex: 1,  skinIdx: 0 },
]);

module.exports = (db, { authenticateToken }) => {
    const router = express.Router();
    router.use(authenticateToken);

    // ── GET /api/pet/rooms?kidId=xxx ─────────────────────────────────
    // Returns all rooms for a kid (creates default room if none exist)
    router.get('/rooms', (req, res) => {
        const { kidId } = req.query;
        const userId = req.user.id;
        if (!kidId) return res.status(400).json({ error: 'kidId required' });

        db.all(
            `SELECT * FROM pet_rooms WHERE userid = ? AND kidid = ? ORDER BY sort_order ASC`,
            [userId, kidId],
            async (err, rooms) => {
                if (err) return res.status(500).json({ error: err.message });

                // Auto-create default room if none exist
                if (rooms.length === 0) {
                    const defaultId = `room_${kidId}_0_${Date.now()}`;
                    db.run(
                        `INSERT INTO pet_rooms (id, userid, kidid, room_name, sort_order, skin_idx, furniture_json, coins_spent, pet_id, pet_hunger, pet_mood, pet_state, pet_last_fed, unlocked_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [defaultId, userId, kidId, '我的小窝', 0, 0, DEFAULT_FURNITURE, 0, '', 100, 100, 'idle', '', new Date().toISOString()],
                        (createErr) => {
                            if (createErr) return res.status(500).json({ error: createErr.message });
                            db.all(
                                `SELECT * FROM pet_rooms WHERE userid = ? AND kidid = ? ORDER BY sort_order ASC`,
                                [userId, kidId],
                                (err2, newRooms) => {
                                    if (err2) return res.status(500).json({ error: err2.message });
                                    res.json(newRooms.map(parseRoom));
                                }
                            );
                        }
                    );
                } else {
                    res.json(rooms.map(parseRoom));
                }
            }
        );
    });

    // ── POST /api/pet/rooms — unlock new room ─────────────────────────
    router.post('/rooms', (req, res) => {
        const { kidId, roomName } = req.body;
        const userId = req.user.id;
        if (!kidId) return res.status(400).json({ error: 'kidId required' });

        db.all(
            `SELECT * FROM pet_rooms WHERE userid = ? AND kidid = ? ORDER BY sort_order ASC`,
            [userId, kidId],
            (err, rooms) => {
                if (err) return res.status(500).json({ error: err.message });
                const nextOrder = rooms.length;
                if (nextOrder >= 4) return res.status(400).json({ error: '已达到最大房间数量（4个）' });

                const coinCost = ROOM_UNLOCK_COSTS[nextOrder] || 3000;
                const newId = `room_${kidId}_${nextOrder}_${Date.now()}`;
                db.run(
                    `INSERT INTO pet_rooms (id, userid, kidid, room_name, sort_order, skin_idx, furniture_json, coins_spent, pet_id, pet_hunger, pet_mood, pet_state, pet_last_fed, unlocked_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [newId, userId, kidId, roomName || `第${nextOrder + 1}间小窝`, nextOrder, 0, DEFAULT_FURNITURE, coinCost, '', 100, 100, 'idle', '', new Date().toISOString()],
                    (createErr) => {
                        if (createErr) return res.status(500).json({ error: createErr.message });
                        db.get(`SELECT * FROM pet_rooms WHERE id = ?`, [newId], (e2, room) => {
                            if (e2) return res.status(500).json({ error: e2.message });
                            res.json({ room: parseRoom(room), coinCost });
                        });
                    }
                );
            }
        );
    });

    // ── PUT /api/pet/rooms/:id — save room state ──────────────────────
    router.put('/rooms/:id', (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;
        const { skinIdx, furnitureJson, roomName, petHunger, petMood, petState, petLastFed } = req.body;

        const updates = [];
        const params = [];
        if (skinIdx !== undefined)      { updates.push(`skin_idx = ?`);      params.push(skinIdx); }
        if (furnitureJson !== undefined) { updates.push(`furniture_json = ?`); params.push(JSON.stringify(furnitureJson)); }
        if (roomName !== undefined)      { updates.push(`room_name = ?`);      params.push(roomName); }
        if (petHunger !== undefined)     { updates.push(`pet_hunger = ?`);     params.push(petHunger); }
        if (petMood !== undefined)       { updates.push(`pet_mood = ?`);       params.push(petMood); }
        if (petState !== undefined)      { updates.push(`pet_state = ?`);      params.push(petState); }
        if (petLastFed !== undefined)    { updates.push(`pet_last_fed = ?`);   params.push(petLastFed); }

        if (updates.length === 0) return res.json({ ok: true });

        params.push(id, userId);
        db.run(
            `UPDATE pet_rooms SET ${updates.join(', ')} WHERE id = ? AND userid = ?`,
            params,
            (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ ok: true });
            }
        );
    });

    // ── POST /api/pet/interaction — record session time ───────────────
    router.post('/interaction', (req, res) => {
        const { kidId, durationSeconds } = req.body;
        const userId = req.user.id;
        if (!kidId || !durationSeconds) return res.status(400).json({ error: 'kidId and durationSeconds required' });

        const today = new Date().toISOString().split('T')[0];
        const recordId = `aa_${kidId}_${today}`;

        db.run(
            `INSERT INTO pet_anti_addiction (id, userid, kidid, date_str, total_seconds, bonus_seconds, last_session_at)
             VALUES (?, ?, ?, ?, ?, 0, ?)
             ON CONFLICT (kidid, date_str) DO UPDATE SET
                total_seconds = pet_anti_addiction.total_seconds + EXCLUDED.total_seconds,
                last_session_at = EXCLUDED.last_session_at`,
            [recordId, userId, kidId, today, durationSeconds, new Date().toISOString()],
            (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ ok: true });
            }
        );
    });

    // ── GET /api/pet/interaction/today?kidId=xxx ──────────────────────
    router.get('/interaction/today', (req, res) => {
        const { kidId } = req.query;
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        db.get(
            `SELECT * FROM pet_anti_addiction WHERE userid = ? AND kidid = ? AND date_str = ?`,
            [userId, kidId, today],
            (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(row || { totalSeconds: 0, bonusSeconds: 0, lastSessionAt: '' });
            }
        );
    });

    return router;
};

function parseRoom(room) {
    if (!room) return null;
    return {
        ...room,
        furnitureJson: typeof room.furnitureJson === 'string'
            ? JSON.parse(room.furnitureJson || '[]')
            : (room.furnitureJson || []),
        skinIdx: Number(room.skinIdx ?? 0),
        petHunger: Number(room.petHunger ?? 100),
        petMood: Number(room.petMood ?? 100),
    };
}
