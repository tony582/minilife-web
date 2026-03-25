const express = require('express');
const router = express.Router();

module.exports = (db, { authenticateToken, notifyUser }) => {

    // --- List inventory ---
    router.get('/', authenticateToken, (req, res) => {
        db.all("SELECT * FROM inventory WHERE userId = ?", [req.user.id], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // --- Create item ---
    router.post('/', authenticateToken, (req, res) => {
        const { id, name, price, desc, iconEmoji, image, type, walletTarget, charityTarget, maxExchanges, periodMaxType } = req.body;
        const insert = `INSERT INTO inventory (id, userId, name, price, desc, iconEmoji, image, type, walletTarget, charityTarget, maxExchanges, periodMaxType) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;
        db.run(insert, [id, req.user.id, name, price, desc, iconEmoji, image, type, walletTarget || 'spend', charityTarget || '', maxExchanges || null, periodMaxType || null], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            notifyUser(req.user.id);
            res.json({ id });
        });
    });

    // --- Update item ---
    router.put('/:id', authenticateToken, (req, res) => {
        const { name, price, desc, iconEmoji, image, type, walletTarget, charityTarget, maxExchanges, periodMaxType } = req.body;
        const query = "UPDATE inventory SET name = ?, price = ?, desc = ?, iconEmoji = ?, image = ?, type = ?, walletTarget = ?, charityTarget = ?, maxExchanges = ?, periodMaxType = ? WHERE id = ? AND userId = ?";
        db.run(query, [name, price, desc, iconEmoji, image, type, walletTarget || 'spend', charityTarget || '', maxExchanges || null, periodMaxType || null, req.params.id, req.user.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            notifyUser(req.user.id);
            res.json({ updatedID: req.params.id });
        });
    });

    // --- Delete item ---
    router.delete('/:id', authenticateToken, (req, res) => {
        db.run("DELETE FROM inventory WHERE id = ? AND userId = ?", [req.params.id, req.user.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            notifyUser(req.user.id);
            res.json({ deletedID: req.params.id });
        });
    });

    return router;
};
