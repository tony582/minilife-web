const express = require('express');
const router = express.Router();

module.exports = (db, { authenticateToken, notifyUser }) => {

    // ── Calculate & distribute interest for all kids ──
    // POST /api/interest/calculate
    // Called manually by parent or by cron job on Sundays
    router.post('/calculate', authenticateToken, (req, res) => {
        // Read user settings for interest config
        db.get("SELECT data FROM user_settings WHERE userId = ?", [req.user.id], (err, settingsRow) => {
            if (err) return res.status(500).json({ error: err.message });

            const settings = settingsRow ? JSON.parse(settingsRow.data) : {};
            const interestEnabled = settings.interestEnabled !== false; // default ON
            const baseRate = settings.interestBaseRate ?? 2; // default 2% per week
            const maxCap = settings.interestMaxCap ?? 50; // default max 50 coins/week

            if (!interestEnabled) {
                return res.json({ message: 'Interest is disabled', results: [] });
            }

            // Get all kids
            db.all("SELECT * FROM kids WHERE userId = ?", [req.user.id], (err2, kids) => {
                if (err2) return res.status(500).json({ error: err2.message });

                const results = [];
                let pending = kids.length;
                if (pending === 0) return res.json({ message: 'No kids', results: [] });

                kids.forEach(kid => {
                    const balance = kid.balance_spend || 0;
                    const level = kid.level || 1;

                    // Spirit bonus: derived from level
                    // Same logic as spiritUtils.js but server-side
                    let spiritBonus = 0;
                    if (level >= 30) spiritBonus = 8;
                    else if (level >= 21) spiritBonus = 5;
                    else if (level >= 13) spiritBonus = 2;
                    else if (level >= 6) spiritBonus = 1;

                    const totalRate = baseRate + spiritBonus;
                    const rawInterest = Math.floor(balance * totalRate / 100);
                    const finalInterest = Math.min(rawInterest, maxCap);

                    if (finalInterest <= 0) {
                        results.push({ kidId: kid.id, name: kid.name, interest: 0, reason: 'balance too low' });
                        pending--;
                        if (pending === 0) res.json({ message: 'Interest calculated', results });
                        return;
                    }

                    // 1. Add interest to balance
                    const newBalance = balance + finalInterest;
                    db.run(
                        "UPDATE kids SET balance_spend = ? WHERE id = ? AND userId = ?",
                        [newBalance, kid.id, req.user.id],
                        (err3) => {
                            if (err3) {
                                results.push({ kidId: kid.id, error: err3.message });
                                pending--;
                                if (pending === 0) res.json({ message: 'Interest calculated', results });
                                return;
                            }

                            // 2. Create transaction record
                            const txId = `interest_${kid.id}_${Date.now()}`;
                            const now = new Date().toISOString();
                            db.run(
                                "INSERT INTO transactions (id, userId, kidId, type, amount, title, date, category) VALUES (?,?,?,?,?,?,?,?)",
                                [txId, req.user.id, kid.id, 'income', finalInterest,
                                    `🌟 精灵能量站利息 (利率${totalRate}%)`, now, 'interest']
                            );

                            // 3. Save interest history
                            const histId = `ih_${kid.id}_${Date.now()}`;
                            db.run(
                                "INSERT INTO interest_history (id, userId, kidId, interest_amount, interest_rate, interest_bonus, balance_snapshot, calculated_at) VALUES (?,?,?,?,?,?,?,?)",
                                [histId, req.user.id, kid.id, finalInterest, baseRate, spiritBonus, balance, now]
                            );

                            notifyUser(req.user.id);
                            results.push({
                                kidId: kid.id, name: kid.name,
                                interest: finalInterest, rate: totalRate,
                                baseRate, spiritBonus, balance, newBalance
                            });
                            pending--;
                            if (pending === 0) res.json({ message: 'Interest calculated', results });
                        }
                    );
                });
            });
        });
    });

    // ── Get interest history ──
    // GET /api/interest/history?kidId=xxx
    router.get('/history', authenticateToken, (req, res) => {
        const { kidId } = req.query;
        const sql = kidId
            ? "SELECT * FROM interest_history WHERE userId = ? AND kidId = ? ORDER BY calculated_at DESC LIMIT 52"
            : "SELECT * FROM interest_history WHERE userId = ? ORDER BY calculated_at DESC LIMIT 100";
        const params = kidId ? [req.user.id, kidId] : [req.user.id];

        db.all(sql, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    return router;
};
