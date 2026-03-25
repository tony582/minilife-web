const express = require('express');
const router = express.Router();

module.exports = (db, { authenticateToken, notifyUser }) => {

    // --- List transactions ---
    router.get('/', authenticateToken, (req, res) => {
        const { kidId } = req.query;
        let query = "SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC";
        let params = [req.user.id];
        if (kidId) {
            query = "SELECT * FROM transactions WHERE userId = ? AND kidId = ? ORDER BY date DESC";
            params = [req.user.id, kidId];
        }
        db.all(query, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // --- Create transaction ---
    router.post('/', authenticateToken, (req, res) => {
        const { id, kidId, type, amount, title, date, category } = req.body;
        const insert = "INSERT INTO transactions (id, userId, kidId, type, amount, title, date, category) VALUES (?,?,?,?,?,?,?,?)";
        db.run(insert, [id, req.user.id, kidId, type, amount, title, date, category], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            notifyUser(req.user.id);
            res.json({ id });
        });
    });

    return router;
};
