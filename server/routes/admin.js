const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

module.exports = (db, { authenticateToken, requireAdmin }) => {

    // --- Generate activation codes ---
    router.post('/codes', authenticateToken, requireAdmin, (req, res) => {
        const { duration_days, count, note } = req.body;
        const batchId = `batch_${Date.now()}`;
        const codes = [];
        for (let i = 0; i < count; i++) {
            codes.push(`ACT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
        }

        const stmt = db.prepare("INSERT INTO activation_codes (code, duration_days, status, batch_id, created_at, note) VALUES (?, ?, 'active', ?, ?, ?)");
        const now = new Date().toISOString();
        codes.forEach(c => stmt.run([c, duration_days, batchId, now, note || null]));
        stmt.finalize();

        res.json({ codes, batchId });
    });

    // --- List activation codes ---
    router.get('/codes', authenticateToken, requireAdmin, (req, res) => {
        db.all(`SELECT a.*, u.email as used_by_email 
                FROM activation_codes a 
                LEFT JOIN users u ON a.used_by = u.id 
                ORDER BY a.created_at DESC, a.used_at DESC`, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // --- Revoke activation code ---
    router.put('/codes/:code/revoke', authenticateToken, requireAdmin, (req, res) => {
        db.run("UPDATE activation_codes SET status = 'revoked' WHERE code = ? AND status = 'active'",
            [req.params.code], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(400).json({ error: '该激活码不可作废（已使用或已作废）' });
                res.json({ success: true });
            });
    });

    // --- Delete activation code ---
    router.delete('/codes/:code', authenticateToken, requireAdmin, (req, res) => {
        db.run("DELETE FROM activation_codes WHERE code = ? AND status != 'used'",
            [req.params.code], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(400).json({ error: '已核销的激活码不可删除' });
                res.json({ success: true });
            });
    });

    // --- List users ---
    router.get('/users', authenticateToken, requireAdmin, (req, res) => {
        db.all("SELECT id, email, role, status, trial_start, sub_end_date, created_at, ai_quota FROM users", [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // --- User details (children, task count, transaction count) ---
    router.get('/users/:id/details', authenticateToken, requireAdmin, (req, res) => {
        const userId = req.params.id;
        const result = {};

        db.all("SELECT id, name, level, balance_spend FROM kids WHERE userId = ?", [userId], (err, kids) => {
            result.kids = kids || [];
            db.get("SELECT COUNT(*) as count FROM tasks WHERE userId = ?", [userId], (err2, row) => {
                result.taskCount = row?.count || 0;
                db.get("SELECT COUNT(*) as count FROM transactions WHERE userId = ?", [userId], (err3, row2) => {
                    result.transactionCount = row2?.count || 0;
                    db.get("SELECT COUNT(*) as count FROM login_log WHERE user_id = ?", [userId], (err4, row3) => {
                        result.loginCount = row3?.count || 0;
                        db.get("SELECT login_at FROM login_log WHERE user_id = ? ORDER BY login_at DESC LIMIT 1",
                            [userId], (err5, row4) => {
                                result.lastLogin = row4?.login_at || null;
                                res.json(result);
                            });
                    });
                });
            });
        });
    });

    // --- Ban / Enable user ---
    router.put('/users/:id/status', authenticateToken, requireAdmin, (req, res) => {
        const { status } = req.body; // 'active' or 'banned'
        if (!['active', 'banned'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        db.run("UPDATE users SET status = ? WHERE id = ? AND role != 'admin'",
            [status, req.params.id], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(400).json({ error: '操作失败（管理员不可禁用）' });
                res.json({ success: true });
            });
    });

    // --- Adjust subscription ---
    router.put('/users/:id/subscription', authenticateToken, requireAdmin, (req, res) => {
        const { sub_end_date } = req.body;
        db.run("UPDATE users SET sub_end_date = ? WHERE id = ?",
            [sub_end_date, req.params.id], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true });
            });
    });

    // --- Reset password ---
    router.post('/users/:id/reset-password', authenticateToken, requireAdmin, async (req, res) => {
        const tempPassword = Math.random().toString(36).substring(2, 10);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        db.run("UPDATE users SET password_hash = ? WHERE id = ?",
            [hashedPassword, req.params.id], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, tempPassword });
            });
    });

    // --- Delete user (cascade) ---
    router.delete('/users/:id', authenticateToken, requireAdmin, (req, res) => {
        const userId = req.params.id;
        db.serialize(() => {
            db.run("DELETE FROM kids WHERE userId = ?", [userId]);
            db.run("DELETE FROM tasks WHERE userId = ?", [userId]);
            db.run("DELETE FROM inventory WHERE userId = ?", [userId]);
            db.run("DELETE FROM orders WHERE userId = ?", [userId]);
            db.run("DELETE FROM transactions WHERE userId = ?", [userId]);
            db.run("DELETE FROM classes WHERE userId = ?", [userId]);
            db.run("DELETE FROM user_settings WHERE userId = ?", [userId]);
            db.run("DELETE FROM login_log WHERE user_id = ?", [userId]);
            db.run("DELETE FROM ai_usage_log WHERE user_id = ?", [userId]);
            db.run("DELETE FROM users WHERE id = ? AND role != 'admin'", [userId], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(400).json({ error: '删除失败（管理员不可删除）' });
                res.json({ success: true });
            });
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

