const express = require('express');
const router = express.Router();

module.exports = (db, { authenticateToken, notifyUser }) => {

    // --- List kids ---
    router.get('/', authenticateToken, (req, res) => {
        db.all("SELECT * FROM kids WHERE userId = ?", [req.user.id], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            const kids = rows.map(r => ({
                id: r.id,
                name: r.name,
                avatar: r.avatar,
                level: r.level,
                exp: r.exp,
                balances: { spend: r.balance_spend, save: r.balance_save, give: r.balance_give },
                vault: { lockedAmount: r.vault_locked, projectedReturn: r.vault_projected }
            }));
            res.json(kids);
        });
    });

    // --- Create kid ---
    router.post('/', authenticateToken, (req, res) => {
        const { id, name, avatar } = req.body;
        const insert = "INSERT INTO kids (id, userId, name, avatar, level, exp, balance_spend, balance_save, balance_give, vault_locked, vault_projected) VALUES (?,?,?,?,1,0,0,0,0,0,0)";
        db.run(insert, [id, req.user.id, name, avatar], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            notifyUser(req.user.id);
            res.json({ id });
        });
    });

    // --- Update kid ---
    router.put('/:id', authenticateToken, (req, res) => {
        const { name, avatar, level, exp, balances, vault } = req.body;
        let query = "UPDATE kids SET ";
        let params = [];
        if (name !== undefined) { query += "name = ?, "; params.push(name); }
        if (avatar !== undefined) { query += "avatar = ?, "; params.push(avatar); }
        if (level !== undefined) { query += "level = ?, "; params.push(level); }
        if (exp !== undefined) { query += "exp = ?, "; params.push(exp); }
        if (balances) {
            if (balances.spend !== undefined) { query += "balance_spend = ?, "; params.push(balances.spend); }
            if (balances.save !== undefined) { query += "balance_save = ?, "; params.push(balances.save); }
            if (balances.give !== undefined) { query += "balance_give = ?, "; params.push(balances.give); }
        }
        if (vault) {
            if (vault.lockedAmount !== undefined) { query += "vault_locked = ?, "; params.push(vault.lockedAmount); }
            if (vault.projectedReturn !== undefined) { query += "vault_projected = ?, "; params.push(vault.projectedReturn); }
        }

        query = query.slice(0, -2) + " WHERE id = ? AND userId = ?";
        params.push(req.params.id, req.user.id);

        db.run(query, params, function (err) {
            if (err) return res.status(500).json({ error: err.message });
            notifyUser(req.user.id);
            res.json({ updatedID: req.params.id });
        });
    });

    // --- Atomic reward ---
    router.post('/:id/reward', authenticateToken, (req, res) => {
        const { coins, exp } = req.body;
        if (coins === undefined && exp === undefined) return res.status(400).json({ error: "No reward specified" });
        
        db.get("SELECT * FROM kids WHERE id = ? AND userId = ?", [req.params.id, req.user.id], (err, kid) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!kid) return res.status(404).json({ error: "Kid not found" });
            
            const newSpend = Math.max(0, kid.balance_spend + (coins || 0));
            let newExp = Math.max(0, kid.exp + (exp || 0));
            let newLevel = kid.level;
            
            const getLevelReq = (lvl) => 100 + (lvl - 1) * 50;
            while (newExp >= getLevelReq(newLevel)) {
                newExp -= getLevelReq(newLevel);
                newLevel++;
            }
            
            db.run(
                "UPDATE kids SET balance_spend = ?, exp = ?, level = ? WHERE id = ? AND userId = ?",
                [newSpend, newExp, newLevel, req.params.id, req.user.id],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    notifyUser(req.user.id);
                    res.json({ 
                        updatedID: req.params.id,
                        spend: newSpend,
                        exp: newExp,
                        level: newLevel
                    });
                }
            );
        });
    });

    // --- Delete kid ---
    router.delete('/:id', authenticateToken, (req, res) => {
        db.serialize(() => {
            db.run("DELETE FROM tasks WHERE kidId = ? AND userId = ?", [req.params.id, req.user.id]);
            db.run("DELETE FROM orders WHERE kidId = ? AND userId = ?", [req.params.id, req.user.id]);
            db.run("DELETE FROM transactions WHERE kidId = ? AND userId = ?", [req.params.id, req.user.id]);
            db.run("DELETE FROM kids WHERE id = ? AND userId = ?", [req.params.id, req.user.id], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                notifyUser(req.user.id);
                res.json({ deletedID: req.params.id });
            });
        });
    });

    return router;
};
