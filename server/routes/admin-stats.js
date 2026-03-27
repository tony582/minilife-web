const express = require('express');
const router = express.Router();

module.exports = (db, { authenticateToken, requireAdmin }) => {

    // Helper: run query and return promise
    const q = (sql, params = []) => new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
    });
    const qAll = (sql, params = []) => new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows || []));
    });

    // --- Overview KPIs (comprehensive) ---
    router.get('/overview', authenticateToken, requireAdmin, async (req, res) => {
        try {
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const today = now.toISOString().split('T')[0];
            const nowISO = now.toISOString();
            const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

            const [totalUsers, activeSubscriptions, newThisMonth, aiCallsThisMonth,
                   expiredUsers, bannedUsers, totalCodes, unusedCodes, todayLogins,
                   totalKids, totalTasks, totalTransactions, totalOrders,
                   weekLogins, newThisWeek, totalClasses, usedCodes,
                   avgTasksPerUser, mostActiveUser] = await Promise.all([
                q("SELECT COUNT(*) as c FROM users WHERE role != 'admin'"),
                q(`SELECT COUNT(*) as c FROM users WHERE role != 'admin' AND sub_end_date > '${nowISO}'`),
                q(`SELECT COUNT(*) as c FROM users WHERE role != 'admin' AND created_at >= '${monthStart}'`),
                q(`SELECT COUNT(*) as c FROM ai_usage_log WHERE created_at >= '${monthStart}'`),
                q(`SELECT COUNT(*) as c FROM users WHERE role != 'admin' AND sub_end_date <= '${nowISO}'`),
                q("SELECT COUNT(*) as c FROM users WHERE status = 'banned'"),
                q("SELECT COUNT(*) as c FROM activation_codes"),
                q("SELECT COUNT(*) as c FROM activation_codes WHERE status = 'active'"),
                q(`SELECT COUNT(DISTINCT user_id) as c FROM login_log WHERE login_at >= '${today}'`),
                q("SELECT COUNT(*) as c FROM kids"),
                q("SELECT COUNT(*) as c FROM tasks"),
                q("SELECT COUNT(*) as c FROM transactions"),
                q("SELECT COUNT(*) as c FROM orders"),
                q(`SELECT COUNT(DISTINCT user_id) as c FROM login_log WHERE login_at >= '${weekAgo}'`),
                q(`SELECT COUNT(*) as c FROM users WHERE role != 'admin' AND created_at >= '${weekAgo}'`),
                q("SELECT COUNT(*) as c FROM classes"),
                q("SELECT COUNT(*) as c FROM activation_codes WHERE status = 'used'"),
                q("SELECT ROUND(AVG(cnt), 1) as c FROM (SELECT COUNT(*) as cnt FROM tasks GROUP BY userId)"),
                q(`SELECT u.email, COUNT(*) as cnt FROM login_log l JOIN users u ON l.user_id = u.id WHERE l.login_at >= '${monthStart}' GROUP BY l.user_id ORDER BY cnt DESC LIMIT 1`),
            ]);

            // Subscription conversion rate
            const total = totalUsers.c || 1;
            const conversionRate = total > 0 ? Math.round((usedCodes.c / total) * 100) : 0;

            res.json({
                // Core
                totalUsers: totalUsers.c, activeSubscriptions: activeSubscriptions.c,
                newThisMonth: newThisMonth.c, newThisWeek: newThisWeek.c,
                aiCallsThisMonth: aiCallsThisMonth.c,
                expiredUsers: expiredUsers.c, bannedUsers: bannedUsers.c,
                todayLogins: todayLogins.c, weekLogins: weekLogins.c,
                // Codes
                totalCodes: totalCodes.c, unusedCodes: unusedCodes.c, usedCodes: usedCodes.c,
                // Platform
                totalKids: totalKids.c, totalTasks: totalTasks.c,
                totalTransactions: totalTransactions.c, totalOrders: totalOrders.c,
                totalClasses: totalClasses.c,
                // Computed
                conversionRate,
                avgTasksPerUser: avgTasksPerUser.c || 0,
                mostActiveUser: mostActiveUser?.email || '–',
                mostActiveLogins: mostActiveUser?.cnt || 0,
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // --- User Growth (last N days) ---
    router.get('/growth', authenticateToken, requireAdmin, async (req, res) => {
        try {
            const days = parseInt(req.query.days) || 30;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const startStr = startDate.toISOString();

            const [registrations, dau, aiDaily] = await Promise.all([
                qAll(`SELECT DATE(created_at) as date, COUNT(*) as count FROM users WHERE role != 'admin' AND created_at >= ? GROUP BY DATE(created_at) ORDER BY date`, [startStr]),
                qAll(`SELECT DATE(login_at) as date, COUNT(DISTINCT user_id) as count FROM login_log WHERE login_at >= ? GROUP BY DATE(login_at) ORDER BY date`, [startStr]),
                qAll(`SELECT DATE(created_at) as date, COUNT(*) as count FROM ai_usage_log WHERE created_at >= ? GROUP BY DATE(created_at) ORDER BY date`, [startStr]),
            ]);

            res.json({ registrations, dau, aiDaily });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // --- Subscription funnel ---
    router.get('/funnel', authenticateToken, requireAdmin, async (req, res) => {
        try {
            const nowISO = new Date().toISOString();
            const [registered, active, expired, paidUsers] = await Promise.all([
                q("SELECT COUNT(*) as c FROM users WHERE role != 'admin'"),
                q(`SELECT COUNT(*) as c FROM users WHERE role != 'admin' AND sub_end_date > '${nowISO}'`),
                q(`SELECT COUNT(*) as c FROM users WHERE role != 'admin' AND sub_end_date <= '${nowISO}'`),
                q("SELECT COUNT(DISTINCT used_by) as c FROM activation_codes WHERE status = 'used'"),
            ]);
            res.json({ registered: registered.c, active: active.c, expired: expired.c, paidUsers: paidUsers.c });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // --- Expiring Soon (within 7 days) ---
    router.get('/expiring', authenticateToken, requireAdmin, (req, res) => {
        const now = new Date();
        const sevenDaysLater = new Date(now.getTime() + 7 * 86400000);
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

    // --- Recent Activity (last 20 events) ---
    router.get('/recent-activity', authenticateToken, requireAdmin, async (req, res) => {
        try {
            const [recentLogins, recentRegistrations, recentCodes] = await Promise.all([
                qAll(`SELECT l.login_at as time, u.email, 'login' as type 
                      FROM login_log l JOIN users u ON l.user_id = u.id 
                      ORDER BY l.login_at DESC LIMIT 8`),
                qAll(`SELECT created_at as time, email, 'register' as type 
                      FROM users WHERE role != 'admin' 
                      ORDER BY created_at DESC LIMIT 5`),
                qAll(`SELECT a.used_at as time, u.email, 'redeem' as type 
                      FROM activation_codes a JOIN users u ON a.used_by = u.id 
                      WHERE a.status = 'used' AND a.used_at IS NOT NULL 
                      ORDER BY a.used_at DESC LIMIT 5`),
            ]);
            const all = [...recentLogins, ...recentRegistrations, ...recentCodes]
                .sort((a, b) => new Date(b.time) - new Date(a.time))
                .slice(0, 15);
            res.json(all);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
