const express = require('express');
const router = express.Router();

module.exports = (db, { authenticateToken, requireAdmin }) => {

    // --- Overview KPIs ---
    router.get('/overview', authenticateToken, requireAdmin, (req, res) => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const today = now.toISOString().split('T')[0];

        const queries = {
            totalUsers: "SELECT COUNT(*) as count FROM users WHERE role != 'admin'",
            activeSubscriptions: `SELECT COUNT(*) as count FROM users WHERE role != 'admin' AND sub_end_date > '${now.toISOString()}'`,
            newThisMonth: `SELECT COUNT(*) as count FROM users WHERE role != 'admin' AND created_at >= '${monthStart}'`,
            aiCallsThisMonth: `SELECT COUNT(*) as count FROM ai_usage_log WHERE created_at >= '${monthStart}'`,
            expiredUsers: `SELECT COUNT(*) as count FROM users WHERE role != 'admin' AND sub_end_date <= '${now.toISOString()}'`,
            bannedUsers: "SELECT COUNT(*) as count FROM users WHERE status = 'banned'",
            totalCodes: "SELECT COUNT(*) as count FROM activation_codes",
            unusedCodes: "SELECT COUNT(*) as count FROM activation_codes WHERE status = 'active'",
            todayLogins: `SELECT COUNT(DISTINCT user_id) as count FROM login_log WHERE login_at >= '${today}'`,
        };

        const result = {};
        const keys = Object.keys(queries);
        let completed = 0;

        keys.forEach(key => {
            db.get(queries[key], [], (err, row) => {
                result[key] = err ? 0 : (row?.count || 0);
                completed++;
                if (completed === keys.length) {
                    res.json(result);
                }
            });
        });
    });

    // --- User Growth (last 30 days) ---
    router.get('/growth', authenticateToken, requireAdmin, (req, res) => {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startStr = startDate.toISOString();

        db.all(
            `SELECT DATE(created_at) as date, COUNT(*) as count 
             FROM users WHERE role != 'admin' AND created_at >= ?
             GROUP BY DATE(created_at) ORDER BY date`,
            [startStr], (err, registrations) => {
                if (err) return res.status(500).json({ error: err.message });

                db.all(
                    `SELECT DATE(login_at) as date, COUNT(DISTINCT user_id) as count 
                     FROM login_log WHERE login_at >= ?
                     GROUP BY DATE(login_at) ORDER BY date`,
                    [startStr], (err2, logins) => {
                        if (err2) return res.status(500).json({ error: err2.message });
                        res.json({ registrations: registrations || [], dau: logins || [] });
                    }
                );
            }
        );
    });

    // --- Subscription funnel ---
    router.get('/funnel', authenticateToken, requireAdmin, (req, res) => {
        const now = new Date().toISOString();
        const queries = [
            { key: 'registered', sql: "SELECT COUNT(*) as count FROM users WHERE role != 'admin'" },
            { key: 'active', sql: `SELECT COUNT(*) as count FROM users WHERE role != 'admin' AND sub_end_date > '${now}'` },
            { key: 'expired', sql: `SELECT COUNT(*) as count FROM users WHERE role != 'admin' AND sub_end_date <= '${now}'` },
            { key: 'usedCodes', sql: "SELECT COUNT(DISTINCT used_by) as count FROM activation_codes WHERE status = 'used'" },
        ];

        const result = {};
        let completed = 0;
        queries.forEach(({ key, sql }) => {
            db.get(sql, [], (err, row) => {
                result[key] = err ? 0 : (row?.count || 0);
                completed++;
                if (completed === queries.length) res.json(result);
            });
        });
    });

    // --- Expiring Soon (users expiring within 7 days) ---
    router.get('/expiring', authenticateToken, requireAdmin, (req, res) => {
        const now = new Date();
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        db.all(
            `SELECT id, email, sub_end_date FROM users 
             WHERE role != 'admin' AND sub_end_date > ? AND sub_end_date <= ?
             ORDER BY sub_end_date ASC`,
            [now.toISOString(), sevenDaysLater.toISOString()],
            (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(rows || []);
            }
        );
    });

    return router;
};
