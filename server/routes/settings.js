const express = require('express');

module.exports = (db, { authenticateToken }) => {
    const router = express.Router();

    // GET /api/settings — load user settings
    router.get('/', authenticateToken, (req, res) => {
        db.get("SELECT data FROM user_settings WHERE userId = ?", [req.user.id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            const data = row ? JSON.parse(row.data) : {};
            res.json(data);
        });
    });

    // PUT /api/settings — save user settings
    router.put('/', authenticateToken, (req, res) => {
        const data = JSON.stringify(req.body);
        db.run(
            "INSERT INTO user_settings (userId, data) VALUES (?, ?) ON CONFLICT(userId) DO UPDATE SET data = ?",
            [req.user.id, data, data],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ ok: true });
            }
        );
    });

    return router;
};
