const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

module.exports = (db, { JWT_SECRET, authenticateToken, notifyUser }) => {

    // --- Register ---
    router.post('/register', async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email and password required" });

        db.get("SELECT id FROM users WHERE email = ?", [email], async (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) return res.status(400).json({ error: "User already exists" });

            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = `user_${Date.now()}`;

            const now = new Date();
            const trialStart = now.toISOString();
            const subEndDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();

            const insert = "INSERT INTO users (id, email, password_hash, role, trial_start, sub_end_date, created_at) VALUES (?,?,?,?,?,?,?)";
            db.run(insert, [userId, email, hashedPassword, 'user', trialStart, subEndDate, trialStart], function (err) {
                if (err) return res.status(500).json({ error: err.message });

                const token = jwt.sign({ id: userId, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
                res.json({ token, user: { id: userId, email, role: 'user', sub_end_date: subEndDate } });
            });
        });
    });

    // --- Login ---
    router.post('/login', (req, res) => {
        const { email, password } = req.body;
        db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(400).json({ error: "该邮箱未注册" });

            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) return res.status(400).json({ error: "密码错误，请重新输入" });

            // Check if user is banned
            if (user.status === 'banned') return res.status(403).json({ error: "您的账号已被禁用，请联系管理员" });

            const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

            // Record login for DAU tracking
            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
            db.run("INSERT INTO login_log (user_id, login_at, ip_address) VALUES (?, ?, ?)",
                [user.id, new Date().toISOString(), ip]);

            res.json({ token, user: { id: user.id, email: user.email, role: user.role, sub_end_date: user.sub_end_date } });
        });
    });

    // --- Get current user ---
    router.get('/me', authenticateToken, (req, res) => {
        db.get("SELECT id, email, role, trial_start, sub_end_date, created_at FROM users WHERE id = ?", [req.user.id], (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(404).json({ error: "用户不存在" });
            res.json(user);
        });
    });

    // --- Redeem activation code ---
    router.post('/redeem-code', authenticateToken, (req, res) => {
        const { code } = req.body;
        db.get("SELECT * FROM activation_codes WHERE code = ?", [code], (err, codeRow) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!codeRow) return res.status(400).json({ error: "激活码无效" });
            if (codeRow.status !== 'active') return res.status(400).json({ error: "Code already used" });

            db.get("SELECT sub_end_date FROM users WHERE id = ?", [req.user.id], (err, user) => {
                if (err || !user) return res.status(500).json({ error: "User error" });

                const now = new Date();
                let currentEnd = new Date(user.sub_end_date);
                if (currentEnd < now) currentEnd = now;

                const newEnd = new Date(currentEnd.getTime() + codeRow.duration_days * 24 * 60 * 60 * 1000);

                db.serialize(() => {
                    db.run("UPDATE activation_codes SET status = 'used', used_by = ?, used_at = ? WHERE code = ?", [req.user.id, now.toISOString(), code]);
                    db.run("UPDATE users SET sub_end_date = ? WHERE id = ?", [newEnd.toISOString(), req.user.id], function (err) {
                        if (err) return res.status(500).json({ error: err.message });
                        res.json({ success: true, new_sub_end_date: newEnd.toISOString() });
                    });
                });
            });
        });
    });

    // --- Used codes history ---
    router.get('/me/codes', authenticateToken, (req, res) => {
        db.all("SELECT code, duration_days, used_at FROM activation_codes WHERE used_by = ? ORDER BY used_at DESC", [req.user.id], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    return router;
};
