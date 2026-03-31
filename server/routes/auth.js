const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { sendResetCode } = require('../emailService');

// In-memory store for reset codes: { email: { code, expires, attempts } }
const resetCodes = new Map();

module.exports = (db, { JWT_SECRET, authenticateToken, notifyUser }) => {

    // --- Forgot Password: Send verification code ---
    router.post('/forgot-password', async (req, res) => {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: '请输入邮箱地址' });

        // Check if user exists
        db.get("SELECT id, email FROM users WHERE email = ?", [email], async (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) {
                // Don't reveal whether email exists — still return success
                return res.json({ success: true, message: '如果该邮箱已注册，验证码已发送' });
            }

            // Rate limit: 60s cooldown per email
            const existing = resetCodes.get(email);
            if (existing && existing.sentAt && Date.now() - existing.sentAt < 60000) {
                const wait = Math.ceil((60000 - (Date.now() - existing.sentAt)) / 1000);
                return res.status(429).json({ error: `请${wait}秒后再试` });
            }

            // Generate 6-digit code
            const code = String(Math.floor(100000 + Math.random() * 900000));
            resetCodes.set(email, {
                code,
                expires: Date.now() + 5 * 60 * 1000, // 5 minutes
                attempts: 0,
                sentAt: Date.now(),
            });

            // Auto-cleanup after 10 minutes
            setTimeout(() => resetCodes.delete(email), 10 * 60 * 1000);

            try {
                await sendResetCode(email, code);
                console.log(`[Auth] Reset code sent to ${email}`);
                res.json({ success: true, message: '验证码已发送到您的邮箱' });
            } catch (err) {
                console.error('[Auth] Email send error:', err);
                resetCodes.delete(email);
                res.status(500).json({ error: '邮件发送失败，请稍后再试' });
            }
        });
    });

    // --- Forgot Password: Verify code ---
    router.post('/verify-reset-code', (req, res) => {
        const { email, code } = req.body;
        if (!email || !code) return res.status(400).json({ error: '请输入邮箱和验证码' });

        const entry = resetCodes.get(email);
        if (!entry) return res.status(400).json({ error: '请先获取验证码' });

        if (Date.now() > entry.expires) {
            resetCodes.delete(email);
            return res.status(400).json({ error: '验证码已过期，请重新获取' });
        }

        entry.attempts++;
        if (entry.attempts > 5) {
            resetCodes.delete(email);
            return res.status(400).json({ error: '尝试次数过多，请重新获取验证码' });
        }

        if (entry.code !== code.trim()) {
            return res.status(400).json({ error: `验证码错误，还可尝试${5 - entry.attempts}次` });
        }

        // Mark as verified
        entry.verified = true;
        res.json({ success: true });
    });

    // --- Forgot Password: Reset password ---
    router.post('/reset-password', async (req, res) => {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) return res.status(400).json({ error: '信息不完整' });

        if (newPassword.length < 6) return res.status(400).json({ error: '密码至少6位' });

        const entry = resetCodes.get(email);
        if (!entry || !entry.verified || entry.code !== code) {
            return res.status(400).json({ error: '请先完成验证码验证' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        db.run("UPDATE users SET password_hash = ? WHERE email = ?",
            [hashedPassword, email], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                resetCodes.delete(email);
                console.log(`[Auth] Password reset for ${email}`);
                res.json({ success: true, message: '密码重置成功，请登录' });
            });
    });


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

            // Read trial_days from app_settings (default 3)
            let trialDays = 3;
            try {
                const settingRow = await new Promise((resolve, reject) => {
                    db.get("SELECT value FROM app_settings WHERE key = 'trial_days'", [], (err, row) => err ? reject(err) : resolve(row));
                });
                if (settingRow?.value) trialDays = parseInt(settingRow.value) || 3;
            } catch (e) { /* fallback to 3 */ }

            const subEndDate = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000).toISOString();

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

    // --- Public settings (no auth required) ---
    router.get('/settings/public', (req, res) => {
        db.all("SELECT key, value FROM app_settings WHERE key IN ('wechat_qr', 'xiaohongshu_qr')", [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            const settings = {};
            (rows || []).forEach(r => { settings[r.key] = r.value; });
            res.json(settings);
        });
    });

    return router;
};
