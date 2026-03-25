const express = require('express');
const router = express.Router();

module.exports = (db, { authenticateToken, requireAdmin }) => {

    // --- Generate activation codes ---
    router.post('/codes', authenticateToken, requireAdmin, (req, res) => {
        const { duration_days, count } = req.body;
        const codes = [];
        for (let i = 0; i < count; i++) {
            codes.push(`ACT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
        }

        const stmt = db.prepare("INSERT INTO activation_codes (code, duration_days, status) VALUES (?, ?, 'active')");
        codes.forEach(c => stmt.run([c, duration_days]));
        stmt.finalize();

        res.json({ codes });
    });

    // --- List activation codes ---
    router.get('/codes', authenticateToken, requireAdmin, (req, res) => {
        db.all("SELECT * FROM activation_codes ORDER BY used_at DESC", [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // --- List users ---
    router.get('/users', authenticateToken, requireAdmin, (req, res) => {
        db.all("SELECT id, email, role, trial_start, sub_end_date, created_at, ai_quota FROM users", [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // --- AI Config ---
    router.get('/ai-config', authenticateToken, requireAdmin, (req, res) => {
        db.get("SELECT * FROM ai_config WHERE id = 1", [], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) {
                db.run("INSERT OR IGNORE INTO ai_config (id, provider, model_name, default_quota, updated_at) VALUES (1, 'gemini', 'gemini-2.0-flash', 50, ?)",
                    [new Date().toISOString()], function() {
                        db.get("SELECT * FROM ai_config WHERE id = 1", [], (e, r) => {
                            res.json(r || { provider: 'gemini', api_key: '', model_name: 'gemini-2.0-flash', base_url: '', default_quota: 50 });
                        });
                    });
            } else {
                res.json(row);
            }
        });
    });

    router.put('/ai-config', authenticateToken, requireAdmin, (req, res) => {
        const { provider, api_key, model_name, base_url, default_quota } = req.body;
        db.run(`INSERT OR REPLACE INTO ai_config (id, provider, api_key, model_name, base_url, default_quota, updated_at)
                VALUES (1, ?, ?, ?, ?, ?, ?)`,
            [provider || 'gemini', api_key || '', model_name || 'gemini-2.0-flash', base_url || '', default_quota || 50, new Date().toISOString()],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true });
            });
    });

    // --- AI Usage ---
    router.get('/ai-usage', authenticateToken, requireAdmin, (req, res) => {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const monthStr = monthStart.toISOString();

        db.all(`SELECT u.id, u.email, u.ai_quota,
                       (SELECT COUNT(*) FROM ai_usage_log l WHERE l.user_id = u.id AND l.created_at >= ?) as used_this_month,
                       (SELECT default_quota FROM ai_config WHERE id = 1) as global_quota
                FROM users u WHERE u.role != 'admin' ORDER BY u.email`,
            [monthStr], (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(rows.map(r => ({
                    ...r,
                    quota: r.ai_quota !== null ? r.ai_quota : (r.global_quota || 50),
                    remaining: (r.ai_quota !== null ? r.ai_quota : (r.global_quota || 50)) - r.used_this_month
                })));
            });
    });

    // --- Per-user AI quota ---
    router.put('/users/:id/ai-quota', authenticateToken, requireAdmin, (req, res) => {
        const { quota } = req.body;
        db.run("UPDATE users SET ai_quota = ? WHERE id = ?", [quota, req.params.id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });

    return router;
};
