const express = require('express');
const router = express.Router();

module.exports = (db, { authenticateToken, notifyUser }) => {

    // --- List tasks ---
    router.get('/', authenticateToken, (req, res) => {
        db.all("SELECT * FROM tasks WHERE userId = ?", [req.user.id], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            const tasks = rows.map(r => ({
                ...r,
                dates: r.dates ? JSON.parse(r.dates) : [],
                history: r.history ? JSON.parse(r.history) : {},
                attachments: r.attachments ? JSON.parse(r.attachments) : [],
                repeatConfig: r.repeatConfig ? JSON.parse(r.repeatConfig) : null,
                requireApproval: r.requireApproval === 1
            }));
            res.json(tasks);
        });
    });

    // --- Create task ---
    router.post('/', authenticateToken, (req, res) => {
        const { id, kidId, title, type, reward, status, iconName, iconEmoji, category, catColor, frequency, timeStr, standards, dates, startDate, pointRule, habitType, attachments, requireApproval, repeatConfig, order, periodMaxPerDay, periodMaxType } = req.body;
        const datesStr = dates ? JSON.stringify(dates) : '[]';
        const attachmentsStr = attachments ? JSON.stringify(attachments) : '[]';
        const repeatConfigStr = repeatConfig ? JSON.stringify(repeatConfig) : null;
        const requireApprovalInt = requireApproval ? 1 : 0;
        const orderInt = order || 0;

        // Server-side guard: study-type tasks must NEVER have emoji icons
        const safeIconEmoji = (type === 'study' && iconEmoji && !iconEmoji.startsWith('ph:')) ? '' : iconEmoji;

        const insert = `INSERT INTO tasks (id, userId, kidId, title, type, reward, status, iconName, iconEmoji, category, catColor, frequency, timeStr, standards, dates, history, startDate, pointRule, habitType, attachments, requireApproval, repeatConfig, "order", periodMaxPerDay, periodMaxType) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        db.run(insert, [id, req.user.id, kidId, title, type, reward, status, iconName, safeIconEmoji, category, catColor, frequency, timeStr, standards, datesStr, '{}', startDate, pointRule, habitType, attachmentsStr, requireApprovalInt, repeatConfigStr, orderInt, periodMaxPerDay, periodMaxType], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            notifyUser(req.user.id);
            res.json({ id });
        });
    });

    // --- Update task ---
    router.put('/:id', authenticateToken, (req, res) => {
        const { status, title, reward, timeStr, frequency, standards, category, catColor, iconEmoji, iconName, dates, history, startDate, pointRule, habitType, attachments, requireApproval, repeatConfig, order, periodMaxPerDay, periodMaxType } = req.body;
        let query = "UPDATE tasks SET ";
        let params = [];
        if (status !== undefined) { query += "status = ?, "; params.push(status); }
        if (title !== undefined) { query += "title = ?, "; params.push(title); }
        if (reward !== undefined) { query += "reward = ?, "; params.push(reward); }
        if (timeStr !== undefined) { query += "timeStr = ?, "; params.push(timeStr); }
        if (frequency !== undefined) { query += "frequency = ?, "; params.push(frequency); }
        if (standards !== undefined) { query += "standards = ?, "; params.push(standards); }
        if (category !== undefined) { query += "category = ?, "; params.push(category); }
        if (catColor !== undefined) { query += "catColor = ?, "; params.push(catColor); }
        if (iconEmoji !== undefined) {
            // Server-side guard: only allow ph: prefixed or empty emoji
            // study tasks should never have emoji; habits always use ph: prefix
            const safeEmoji = (iconEmoji && !iconEmoji.startsWith('ph:')) ? '' : iconEmoji;
            query += "iconEmoji = ?, "; params.push(safeEmoji);
        }
        if (iconName !== undefined) { query += "iconName = ?, "; params.push(iconName); }
        if (dates !== undefined) { query += "dates = ?, "; params.push(JSON.stringify(dates)); }
        if (history !== undefined) { query += "history = ?, "; params.push(JSON.stringify(history)); }
        if (startDate !== undefined) { query += "startDate = ?, "; params.push(startDate); }
        if (pointRule !== undefined) { query += "pointRule = ?, "; params.push(pointRule); }
        if (habitType !== undefined) { query += "habitType = ?, "; params.push(habitType); }
        if (attachments !== undefined) { query += "attachments = ?, "; params.push(JSON.stringify(attachments)); }
        if (requireApproval !== undefined) { query += "requireApproval = ?, "; params.push(requireApproval ? 1 : 0); }
        if (repeatConfig !== undefined) { query += "repeatConfig = ?, "; params.push(repeatConfig ? JSON.stringify(repeatConfig) : null); }
        if (order !== undefined) { query += '"order" = ?, '; params.push(order); }
        if (periodMaxPerDay !== undefined) { query += "periodMaxPerDay = ?, "; params.push(periodMaxPerDay); }
        if (periodMaxType !== undefined) { query += "periodMaxType = ?, "; params.push(periodMaxType); }
        if (params.length === 0) return res.status(400).json({ error: "No fields to update" });

        query = query.slice(0, -2) + " WHERE id = ? AND userId = ?";
        params.push(req.params.id, req.user.id);
        db.run(query, params, function (err) {
            if (err) {
                console.error('[TASK UPDATE ERROR]', { taskId: req.params.id, error: err.message, query: query.substring(0, 200) });
                return res.status(500).json({ error: err.message });
            }

            // Sync linked class when history is updated
            if (history !== undefined) {
                db.get("SELECT history AS oldHistory, linkedClassId FROM tasks WHERE id = ? AND userId = ?", [req.params.id, req.user.id], (hErr, taskRow) => {
                    if (!hErr && taskRow && taskRow.linkedClassId) {
                        let completedCount = 0;
                        const newH = history;
                        for (const dateKey in newH) {
                            const entry = newH[dateKey];
                            if (entry && typeof entry === 'object') {
                                if (entry.status === 'completed' || entry.status === true) {
                                    completedCount++;
                                } else {
                                    for (const subKey in entry) {
                                        const sub = entry[subKey];
                                        if (sub && (sub.status === 'completed' || sub.status === true)) {
                                            completedCount++;
                                        }
                                    }
                                }
                            }
                        }
                        db.get("SELECT * FROM classes WHERE id = ?", [taskRow.linkedClassId], (cErr, classRow) => {
                            if (!cErr && classRow) {
                                const spc = classRow.sessionsPerClass || 1;
                                const newUsed = completedCount * spc;
                                const isTutor = classRow.classMode === 'tutor';
                                const cappedUsed = isTutor ? newUsed : Math.min(newUsed, classRow.totalSessions);
                                const newStatus = isTutor ? 'active' : (cappedUsed >= classRow.totalSessions ? 'completed' : 'active');
                                db.run("UPDATE classes SET usedSessions = ?, status = ? WHERE id = ?", [cappedUsed, newStatus, classRow.id], () => {
                                    notifyUser(req.user.id);
                                });
                            } else {
                                notifyUser(req.user.id);
                            }
                        });
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

    // --- Update task history ---
    router.put('/:id/history', authenticateToken, (req, res) => {
        const { date, status, timeSpent, note } = req.body;
        db.get("SELECT history, linkedClassId FROM tasks WHERE id = ? AND userId = ?", [req.params.id, req.user.id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: "任务不存在" });

            let history = {};
            try { if (row.history) history = JSON.parse(row.history); } catch (e) { }

            const previousStatus = history[date]?.status;
            history[date] = { status, timeSpent, note, updatedAt: new Date().toISOString() };
            
            db.run("UPDATE tasks SET history = ? WHERE id = ? AND userId = ?", [JSON.stringify(history), req.params.id, req.user.id], function (updateErr) {
                if (updateErr) return res.status(500).json({ error: updateErr.message });
                
                // Sync with linked class
                const isNowCompleted = (status === 'completed' || status === true);
                const wasPreviouslyCompleted = (previousStatus === 'completed' || previousStatus === true);
                if (row.linkedClassId && isNowCompleted !== wasPreviouslyCompleted) {
                    db.get("SELECT * FROM classes WHERE id = ?", [row.linkedClassId], (cErr, classRow) => {
                        if (!cErr && classRow) {
                            const spc = classRow.sessionsPerClass || 1;
                            let newUsed = classRow.usedSessions + (isNowCompleted ? spc : -spc);
                            if (newUsed < 0) newUsed = 0;
                            const isTutor = classRow.classMode === 'tutor';
                            const newStatus = isTutor ? 'active' : (newUsed >= classRow.totalSessions ? 'completed' : 'active');
                            db.run("UPDATE classes SET usedSessions = ?, status = ? WHERE id = ?", [newUsed, newStatus, classRow.id], () => {
                                notifyUser(req.user.id);
                            });
                        }
                    });
                }

                notifyUser(req.user.id);
                res.json({ updatedID: req.params.id, history });
            });
        });
    });

    // --- Delete task ---
    router.delete('/:id', authenticateToken, (req, res) => {
        db.run("DELETE FROM tasks WHERE id = ? AND userId = ?", [req.params.id, req.user.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            notifyUser(req.user.id);
            res.json({ deletedID: req.params.id });
        });
    });

    return router;
};
