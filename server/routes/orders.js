const express = require('express');
const router = express.Router();

module.exports = (db, { authenticateToken, notifyUser }) => {

    // --- List orders ---
    router.get('/', authenticateToken, (req, res) => {
        db.all("SELECT * FROM orders WHERE userId = ? ORDER BY date DESC", [req.user.id], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // --- Create order ---
    router.post('/', authenticateToken, (req, res) => {
        const { id, kidId, itemId, itemName, itemImage, price, status, date, rating, comment, redeemCode } = req.body;
        const insert = `INSERT INTO orders (id, userId, kidId, itemId, itemName, itemImage, price, status, date, rating, comment, redeemCode) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;
        db.run(insert, [id, req.user.id, kidId, itemId || null, itemName, itemImage, price, status, date, rating, comment, redeemCode], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            notifyUser(req.user.id);
            res.json({ id });
        });
    });

    // --- Update order ---
    router.put('/:id', authenticateToken, (req, res) => {
        const { status, rating, comment } = req.body;
        let query = "UPDATE orders SET status = ?";
        let params = [status];
        if (rating !== undefined) { query += ", rating = ?"; params.push(rating); }
        if (comment !== undefined) { query += ", comment = ?"; params.push(comment); }
        query += " WHERE id = ? AND userId = ?";
        params.push(req.params.id, req.user.id);

        db.run(query, params, function (err) {
            if (err) return res.status(500).json({ error: err.message });
            notifyUser(req.user.id);
            res.json({ updatedID: req.params.id });
        });
    });

    return router;
};
