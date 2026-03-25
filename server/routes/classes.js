const express = require('express');
const router = express.Router();

module.exports = (db, { authenticateToken, notifyUser }) => {

    // --- List classes ---
    router.get('/', authenticateToken, (req, res) => {
        db.all("SELECT * FROM classes WHERE userId = ? ORDER BY createdAt DESC", [req.user.id], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            const classes = rows.map(r => ({
                ...r,
                scheduleDays: r.scheduleDays ? JSON.parse(r.scheduleDays) : [],
                checkinHistory: r.checkinHistory ? JSON.parse(r.checkinHistory) : [],
                autoCreateTask: r.autoCreateTask === 1,
                pricePerSession: r.pricePerSession || 0
            }));
            res.json(classes);
        });
    });

    // --- Create class ---
    router.post('/', authenticateToken, (req, res) => {
        const { id, kidId, name, iconEmoji, teacher, location, totalSessions, sessionsPerClass, scheduleDays, timeStr, startDate, reward, autoCreateTask,
            checkinMode, notes, classMode, pricePerSession, settlementType } = req.body;
            
        const mode = checkinMode || (autoCreateTask ? 'kid' : 'parent');
        let linkedTaskId = null;
        if (mode === 'kid') {
            linkedTaskId = 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        }

        const insert = `INSERT INTO classes (id, userId, kidId, name, iconEmoji, teacher, location, totalSessions, usedSessions, sessionsPerClass, scheduleDays, timeStr, startDate, reward, checkinMode, linkedTaskId, notes, status, checkinHistory, classMode, pricePerSession, settlementType, createdAt) VALUES (?,?,?,?,?,?,?,?,0,?,?,?,?,?,?,?,?,'active','[]',?,?,?,?)`;
        db.run(insert, [id, req.user.id, kidId, name, iconEmoji || '📚', teacher || '', location || '', totalSessions || 0, sessionsPerClass || 1, JSON.stringify(scheduleDays || []), timeStr || '', startDate || '', reward || 0, mode, linkedTaskId, notes || '', classMode || 'package', pricePerSession || 0, settlementType || 'manual', new Date().toISOString()], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            
            if (linkedTaskId) {
                const weeklyDaysForTask = (scheduleDays || []).map(d => d === 0 ? 7 : d);
                const repeatConfigStr = JSON.stringify({
                    type: 'weekly_custom',
                    weeklyDays: weeklyDaysForTask,
                    periodDaysType: 'any',
                    periodCustomDays: [],
                    periodTargetCount: 1,
                    periodMaxPerDay: 1,
                    pointRule: 'default'
                });

                const insertTask = `INSERT INTO tasks (id, userId, kidId, title, type, reward, status, iconEmoji, category, catColor, frequency, dates, repeatConfig, startDate, timeStr, linkedClassId, "order") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                db.run(insertTask, [
                    linkedTaskId, req.user.id, kidId, name, 'study', reward || 0, 'active', iconEmoji || '📚', '兴趣班', 'bg-pink-50 text-pink-600 border-pink-200', '按周重复', '[]', repeatConfigStr, startDate || new Date().toISOString().split('T')[0], timeStr || '', id, 999
                ], (tErr) => {
                    notifyUser(req.user.id);
                    res.json({ id, linkedTaskId });
                });
            } else {
                notifyUser(req.user.id);
                res.json({ id });
            }
        });
    });

    // --- Update class ---
    router.put('/:id', authenticateToken, (req, res) => {
        const { kidId, name, iconEmoji, teacher, location, totalSessions, usedSessions, sessionsPerClass, scheduleDays, timeStr, startDate, reward, checkinMode, notes, status, checkinHistory, classMode, pricePerSession, settlementType } = req.body;
        let query = "UPDATE classes SET ";
        let params = [];
        if (kidId !== undefined) { query += "kidId = ?, "; params.push(kidId); }
        if (name !== undefined) { query += "name = ?, "; params.push(name); }
        if (iconEmoji !== undefined) { query += "iconEmoji = ?, "; params.push(iconEmoji); }
        if (teacher !== undefined) { query += "teacher = ?, "; params.push(teacher); }
        if (location !== undefined) { query += "location = ?, "; params.push(location); }
        if (totalSessions !== undefined) { query += "totalSessions = ?, "; params.push(totalSessions); }
        if (usedSessions !== undefined) { query += "usedSessions = ?, "; params.push(usedSessions); }
        if (sessionsPerClass !== undefined) { query += "sessionsPerClass = ?, "; params.push(sessionsPerClass); }
        if (scheduleDays !== undefined) { query += "scheduleDays = ?, "; params.push(JSON.stringify(scheduleDays)); }
        if (timeStr !== undefined) { query += "timeStr = ?, "; params.push(timeStr); }
        if (startDate !== undefined) { query += "startDate = ?, "; params.push(startDate); }
        if (reward !== undefined) { query += "reward = ?, "; params.push(reward); }
        if (checkinMode !== undefined) { query += "checkinMode = ?, "; params.push(checkinMode); }
        if (notes !== undefined) { query += "notes = ?, "; params.push(notes); }
        if (status !== undefined) { query += "status = ?, "; params.push(status); }
        if (checkinHistory !== undefined) { query += "checkinHistory = ?, "; params.push(JSON.stringify(checkinHistory)); }
        if (classMode !== undefined) { query += "classMode = ?, "; params.push(classMode); }
        if (pricePerSession !== undefined) { query += "pricePerSession = ?, "; params.push(pricePerSession); }
        if (settlementType !== undefined) { query += "settlementType = ?, "; params.push(settlementType); }
        if (params.length === 0) return res.status(400).json({ error: "No fields to update" });
        query = query.slice(0, -2) + " WHERE id = ? AND userId = ?";
        params.push(req.params.id, req.user.id);
        db.run(query, params, function (err) {
            if (err) return res.status(500).json({ error: err.message });
            
            // Push updates to the linked task if applicable
            if (name !== undefined || iconEmoji !== undefined || scheduleDays !== undefined || reward !== undefined || timeStr !== undefined || startDate !== undefined) {
                db.get("SELECT linkedTaskId FROM classes WHERE id = ? AND userId = ?", [req.params.id, req.user.id], (tErr, cRow) => {
                    if (cRow && cRow.linkedTaskId) {
                        let taskUpdate = "UPDATE tasks SET ";
                        let tParams = [];
                        if (name !== undefined) { taskUpdate += "title = ?, "; tParams.push(name); }
                        if (iconEmoji !== undefined) { taskUpdate += "iconEmoji = ?, "; tParams.push(iconEmoji); }
                        if (scheduleDays !== undefined) { 
                            const weeklyDaysForTask = scheduleDays.map(d => d === 0 ? 7 : d);
                            const repeatConfigStr = JSON.stringify({
                                type: 'weekly_custom',
                                weeklyDays: weeklyDaysForTask,
                                periodDaysType: 'any',
                                periodCustomDays: [],
                                periodTargetCount: 1,
                                periodMaxPerDay: 1,
                                pointRule: 'default'
                            });
                            taskUpdate += "repeatConfig = ?, dates = '[]', "; 
                            tParams.push(repeatConfigStr); 
                        }
                        if (reward !== undefined) { taskUpdate += "reward = ?, "; tParams.push(reward); }
                        if (timeStr !== undefined) { taskUpdate += "timeStr = ?, "; tParams.push(timeStr); }
                        if (startDate !== undefined) { taskUpdate += "startDate = ?, "; tParams.push(startDate); }
                        
                        if (tParams.length > 0) {
                            taskUpdate = taskUpdate.slice(0, -2) + " WHERE id = ? AND userId = ?";
                            tParams.push(cRow.linkedTaskId, req.user.id);
                            db.run(taskUpdate, tParams, () => {
                                notifyUser(req.user.id);
                            });
                        }
                    } else {
                        notifyUser(req.user.id);
                    }
                });
            } else {
                notifyUser(req.user.id);
            }
            res.json({ updatedID: req.params.id });
        });
    });

    // --- Checkin ---
    router.post('/:id/checkin', authenticateToken, (req, res) => {
        const { date, note } = req.body;
        db.get("SELECT * FROM classes WHERE id = ? AND userId = ?", [req.params.id, req.user.id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: "课程不存在" });
            const sessionsPerClass = row.sessionsPerClass || 1;
            const newUsed = (row.usedSessions || 0) + sessionsPerClass;
            let history = [];
            try { history = JSON.parse(row.checkinHistory || '[]'); } catch (e) {}
            history.push({ date: date || new Date().toISOString().split('T')[0], note: note || '', timestamp: new Date().toISOString() });
            const newStatus = newUsed >= row.totalSessions ? 'completed' : 'active';
            db.run("UPDATE classes SET usedSessions = ?, checkinHistory = ?, status = ? WHERE id = ? AND userId = ?",
                [newUsed, JSON.stringify(history), newStatus, req.params.id, req.user.id], function (updateErr) {
                if (updateErr) return res.status(500).json({ error: updateErr.message });
                notifyUser(req.user.id);
                res.json({ usedSessions: newUsed, status: newStatus, checkinHistory: history });
            });
        });
    });

    // --- Delete class ---
    router.delete('/:id', authenticateToken, (req, res) => {
        db.get("SELECT linkedTaskId FROM classes WHERE id = ? AND userId = ?", [req.params.id, req.user.id], (err, row) => {
            db.run("DELETE FROM classes WHERE id = ? AND userId = ?", [req.params.id, req.user.id], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                if (row && row.linkedTaskId) {
                    db.run("DELETE FROM tasks WHERE id = ? AND userId = ?", [row.linkedTaskId, req.user.id]);
                }
                notifyUser(req.user.id);
                res.json({ deletedID: req.params.id });
            });
        });
    });

    return router;
};
