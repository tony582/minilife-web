// ═══════════════════════════════════════════════════════
// Pet Rooms API — /api/pet/*
// ═══════════════════════════════════════════════════════
const express = require('express');

const ROOM_UNLOCK_COSTS = [0, 500, 1500, 3000]; // room index 0 = free
const DEFAULT_FURNITURE = JSON.stringify([
    { "id": "bed_1", "type": "bed", "src": "/pets/furniture/bed_pink.png", "style": { "bottom": "49.905%", "left": "39.875%", "width": "21.484%", "zIndex": 7 }, "zIndex": 7, "skinIdx": 0, "placed": true, "flipped": false, "instanceId": "item_default_1" },
    { "id": "bowl_food_1", "type": "bowl_food", "src": "/pets/furniture/bowl_blue_empty.png", "srcFull": "/pets/furniture/bowl_blue_full.png", "interactive": true, "style": { "bottom": "17.920%", "left": "46.772%", "width": "8.398%", "zIndex": 11 }, "zIndex": 11, "skinIdx": 0, "placed": true, "flipped": false, "instanceId": "item_default_2" },
    { "id": "window_frame_1", "type": "window_frame", "src": "/pets/furniture/frame_light.png", "style": { "bottom": "59.363%", "left": "67.226%", "width": "10.000%", "zIndex": 1 }, "zIndex": 1, "skinIdx": 0, "placed": true, "flipped": false, "instanceId": "item_default_3" },
    { "id": "painting_plant_1", "type": "painting_plant", "src": "/pets/furniture/painting_plant.png", "style": { "bottom": "51.072%", "left": "83.062%", "width": "8.000%", "zIndex": 1 }, "zIndex": 1, "skinIdx": 0, "placed": true, "flipped": false, "instanceId": "item_default_4" },
    { "id": "litter_1", "type": "litter", "src": "/pets/furniture/litter_tan.png", "style": { "bottom": "35.308%", "left": "78.177%", "width": "10.000%", "zIndex": 5 }, "zIndex": 5, "skinIdx": 0, "placed": true, "flipped": false, "instanceId": "item_default_5" },
    { "id": "shelf_1", "type": "shelf", "src": "/pets/furniture/shelf_beige.png", "style": { "bottom": "35.617%", "left": "10.003%", "width": "17.000%", "zIndex": 2 }, "zIndex": 2, "skinIdx": 0, "placed": true, "flipped": false, "instanceId": "item_default_6" },
    { "id": "window_curtain_1", "type": "window_curtain", "src": "/pets/furniture/window_curtain_white.png", "style": { "bottom": "55.237%", "left": "26.007%", "width": "22.000%", "zIndex": 1 }, "zIndex": 1, "skinIdx": 0, "placed": true, "flipped": false, "instanceId": "item_default_7" },
    { "id": "post_1", "type": "post", "src": "/pets/furniture/post_lime.png", "style": { "bottom": "41.887%", "left": "70.218%", "width": "8.000%", "zIndex": 3 }, "zIndex": 3, "skinIdx": 0, "placed": true, "flipped": false, "instanceId": "item_default_8" },
    { "id": "plant_tree_1", "type": "plant_tree", "src": "/pets/furniture/plant_large_gray.png", "style": { "bottom": "43.385%", "left": "25.296%", "width": "10.000%", "zIndex": 2 }, "zIndex": 2, "skinIdx": 0, "placed": true, "flipped": false, "instanceId": "item_default_9" },
    { "id": "plant_desk_1", "type": "plant_desk", "src": "/pets/furniture/plant_pot_pink.png", "style": { "bottom": "51.859%", "left": "18.157%", "width": "4.500%", "zIndex": 3 }, "zIndex": 3, "skinIdx": 0, "placed": true, "flipped": false, "instanceId": "item_default_10" },
    { "id": "window_frame_1_bp", "type": "window_frame", "src": "/pets/furniture/frame_light.png", "style": { "bottom": "50%", "left": "50%", "width": "10.000%", "zIndex": 1 }, "zIndex": 1, "skinIdx": 0, "placed": false, "flipped": false, "instanceId": "item_default_bp_3" },
    { "id": "painting_plant_1_bp", "type": "painting_plant", "src": "/pets/furniture/painting_plant.png", "style": { "bottom": "50%", "left": "50%", "width": "8.000%", "zIndex": 1 }, "zIndex": 1, "skinIdx": 0, "placed": false, "flipped": false, "instanceId": "item_default_bp_4" },
    { "id": "shelf_1_bp", "type": "shelf", "src": "/pets/furniture/shelf_beige.png", "style": { "bottom": "50%", "left": "50%", "width": "17.000%", "zIndex": 2 }, "zIndex": 2, "skinIdx": 0, "placed": false, "flipped": false, "instanceId": "item_default_bp_6" },
    { "id": "window_curtain_1_bp", "type": "window_curtain", "src": "/pets/furniture/window_curtain_white.png", "style": { "bottom": "50%", "left": "50%", "width": "22.000%", "zIndex": 1 }, "zIndex": 1, "skinIdx": 0, "placed": false, "flipped": false, "instanceId": "item_default_bp_7" },
    { "id": "post_1_bp", "type": "post", "src": "/pets/furniture/post_lime.png", "style": { "bottom": "50%", "left": "50%", "width": "8.000%", "zIndex": 3 }, "zIndex": 3, "skinIdx": 0, "placed": false, "flipped": false, "instanceId": "item_default_bp_8" },
    { "id": "plant_tree_1_bp", "type": "plant_tree", "src": "/pets/furniture/plant_large_gray.png", "style": { "bottom": "50%", "left": "50%", "width": "10.000%", "zIndex": 2 }, "zIndex": 2, "skinIdx": 0, "placed": false, "flipped": false, "instanceId": "item_default_bp_9" },
    { "id": "plant_desk_1_bp", "type": "plant_desk", "src": "/pets/furniture/plant_pot_pink.png", "style": { "bottom": "50%", "left": "50%", "width": "4.500%", "zIndex": 3 }, "zIndex": 3, "skinIdx": 0, "placed": false, "flipped": false, "instanceId": "item_default_bp_10" }
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
        const { skinIdx, furnitureJson, roomName, petName, petHunger, petMood, petState, petLastFed,
                consumablesJson, hotbarJson } = req.body;

        const updates = [];
        const params = [];
        if (skinIdx !== undefined)        { updates.push(`skin_idx = ?`);         params.push(skinIdx); }
        if (furnitureJson !== undefined)  { updates.push(`furniture_json = ?`);   params.push(JSON.stringify(furnitureJson)); }
        if (roomName !== undefined)       { updates.push(`room_name = ?`);        params.push(roomName); }
        if (petName !== undefined)        { updates.push(`pet_name = ?`);         params.push(petName); }
        if (petHunger !== undefined)      { updates.push(`pet_hunger = ?`);       params.push(petHunger); }
        if (petMood !== undefined)        { updates.push(`pet_mood = ?`);         params.push(petMood); }
        if (petState !== undefined)       { updates.push(`pet_state = ?`);        params.push(petState); }
        if (petLastFed !== undefined)     { updates.push(`pet_last_fed = ?`);     params.push(petLastFed); }
        if (consumablesJson !== undefined){ updates.push(`consumables_json = ?`); params.push(consumablesJson); }
        if (hotbarJson !== undefined)     { updates.push(`hotbar_json = ?`);      params.push(hotbarJson); }

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
    const rawFurniture = room.furniture_json ?? room.furnitureJson;
    return {
        id:           room.id,
        userid:       room.userid,
        kidid:        room.kidid,
        roomName:     room.room_name  ?? room.roomName  ?? '我的小窝',
        sortOrder:    Number(room.sort_order  ?? room.sortOrder  ?? 0),
        skinIdx:      Number(room.skin_idx    ?? room.skinIdx    ?? 0),
        furnitureJson: typeof rawFurniture === 'string'
            ? JSON.parse(rawFurniture || '[]')
            : (rawFurniture || []),
        coinsSpent:   Number(room.coins_spent ?? room.coinsSpent ?? 0),
        petId:        room.pet_id      ?? room.petId      ?? '',
        petName:      room.pet_name    ?? room.petName    ?? '波奇',
        petHunger:    Number(room.pet_hunger  ?? room.petHunger  ?? 100),
        petMood:      Number(room.pet_mood    ?? room.petMood    ?? 100),
        petState:     room.pet_state   ?? room.petState   ?? 'idle',
        petLastFed:   room.pet_last_fed ?? room.petLastFed ?? '',
        unlockedAt:   room.unlocked_at  ?? room.unlockedAt  ?? '',
    };
}

