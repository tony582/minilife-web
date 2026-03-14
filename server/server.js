const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const JWT_SECRET = 'minilife_super_secret_key_2026'; // In production, use env variable

// Global Active SSE Connections Mapping
const clients = {};

// Helper: Notify all connected clients for a user
const notifyUser = (userId) => {
    if (clients[userId]) {
        clients[userId].forEach(clientRes => {
            try {
                clientRes.write(`data: ${JSON.stringify({ action: 'sync', timestamp: Date.now() })}\n\n`);
            } catch (err) {
                console.error("SSE Write Error:", err);
            }
        });
    }
};

// Middleware: Authenticate Token (Supports headers or query param for SSE)
const authenticateToken = (req, res, next) => {
    let token = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        token = authHeader.split(' ')[1];
    } else if (req.query.token) {
        token = req.query.token;
    }

    if (token == null) return res.status(401).json({ error: "No token provided" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user; // { id, role }
        next();
    });
};

// SSE Synchronization Endpoint
app.get('/api/sync', authenticateToken, (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); 

    const userId = req.user.id;
    if (!clients[userId]) clients[userId] = [];
    clients[userId].push(res);
    
    // Send initial connection heartbeat
    res.write(`data: ${JSON.stringify({ action: 'connected' })}\n\n`);

    req.on('close', () => {
        if (clients[userId]) {
            clients[userId] = clients[userId].filter(client => client !== res);
            if (clients[userId].length === 0) delete clients[userId];
        }
    });
});

// Middleware: Require Admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Admin access required" });
    next();
};

// --- Auth & Subscription API ---

app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    db.get("SELECT id FROM users WHERE email = ?", [email], async (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = `user_${Date.now()}`;

        // 3 days free trial
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

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(400).json({ error: "User not found" });

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(400).json({ error: "Invalid password" });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email: user.email, role: user.role, sub_end_date: user.sub_end_date } });
    });
});

app.get('/api/me', authenticateToken, (req, res) => {
    db.get("SELECT id, email, role, trial_start, sub_end_date, created_at FROM users WHERE id = ?", [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    });
});

app.post('/api/redeem-code', authenticateToken, (req, res) => {
    const { code } = req.body;
    db.get("SELECT * FROM activation_codes WHERE code = ?", [code], (err, codeRow) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!codeRow) return res.status(400).json({ error: "Invalid code" });
        if (codeRow.status !== 'active') return res.status(400).json({ error: "Code already used" });

        db.get("SELECT sub_end_date FROM users WHERE id = ?", [req.user.id], (err, user) => {
            if (err || !user) return res.status(500).json({ error: "User error" });

            const now = new Date();
            let currentEnd = new Date(user.sub_end_date);
            if (currentEnd < now) currentEnd = now;

            // + duration_days
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


app.get('/api/me/codes', authenticateToken, (req, res) => {
    db.all("SELECT code, duration_days, used_at FROM activation_codes WHERE used_by = ? ORDER BY used_at DESC", [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- Admin API ---
app.post('/api/admin/codes', authenticateToken, requireAdmin, (req, res) => {
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

app.get('/api/admin/codes', authenticateToken, requireAdmin, (req, res) => {
    db.all("SELECT * FROM activation_codes ORDER BY used_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
    db.all("SELECT id, email, role, trial_start, sub_end_date, created_at FROM users", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});


// --- Kids API ---
app.get('/api/kids', authenticateToken, (req, res) => {
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

app.post('/api/kids', authenticateToken, (req, res) => {
    const { id, name, avatar } = req.body;
    const insert = "INSERT INTO kids (id, userId, name, avatar, level, exp, balance_spend, balance_save, balance_give, vault_locked, vault_projected) VALUES (?,?,?,?,1,0,0,0,0,0,0)";
    db.run(insert, [id, req.user.id, name, avatar], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        notifyUser(req.user.id);
        res.json({ id });
    });
});

app.put('/api/kids/:id', authenticateToken, (req, res) => {
    const { name, level, exp, balances, vault } = req.body;
    let query = "UPDATE kids SET ";
    let params = [];
    if (name !== undefined) { query += "name = ?, "; params.push(name); }
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

app.delete('/api/kids/:id', authenticateToken, (req, res) => {
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

// --- Tasks API ---
app.get('/api/tasks', authenticateToken, (req, res) => {
    db.all("SELECT * FROM tasks WHERE userId = ?", [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const tasks = rows.map(r => ({
            ...r,
            dates: r.dates ? JSON.parse(r.dates) : [],
            history: r.history ? JSON.parse(r.history) : {},
            attachments: r.attachments ? JSON.parse(r.attachments) : [],
            repeatConfig: r.repeatConfig ? JSON.parse(r.repeatConfig) : null,
            requireApproval: r.requireApproval === 1
        }));
        res.json(tasks);
    });
});

app.post('/api/tasks', authenticateToken, (req, res) => {
    const { id, kidId, title, type, reward, status, iconName, iconEmoji, category, catColor, frequency, timeStr, standards, dates, startDate, pointRule, habitType, attachments, requireApproval, repeatConfig, order, periodMaxPerDay, periodMaxType } = req.body;
    const datesStr = dates ? JSON.stringify(dates) : '[]';
    const attachmentsStr = attachments ? JSON.stringify(attachments) : '[]';
    const repeatConfigStr = repeatConfig ? JSON.stringify(repeatConfig) : null;
    const requireApprovalInt = requireApproval ? 1 : 0;
    const orderInt = order || 0;

    const insert = `INSERT INTO tasks (id, userId, kidId, title, type, reward, status, iconName, iconEmoji, category, catColor, frequency, timeStr, standards, dates, history, startDate, pointRule, habitType, attachments, requireApproval, repeatConfig, "order", periodMaxPerDay, periodMaxType) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    db.run(insert, [id, req.user.id, kidId, title, type, reward, status, iconName, iconEmoji, category, catColor, frequency, timeStr, standards, datesStr, '{}', startDate, pointRule, habitType, attachmentsStr, requireApprovalInt, repeatConfigStr, orderInt, periodMaxPerDay, periodMaxType], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        notifyUser(req.user.id);
        res.json({ id });
    });
});

app.put('/api/tasks/:id', authenticateToken, (req, res) => {
    const { status, title, reward, timeStr, frequency, standards, category, catColor, iconEmoji, iconName, dates, history, startDate, pointRule, habitType, attachments, requireApproval, repeatConfig, order, periodMaxPerDay, periodMaxType } = req.body;
    let query = "UPDATE tasks SET ";
    let params = [];
    if (status !== undefined) { query += "status = ?, "; params.push(status); }
    if (title !== undefined) { query += "title = ?, "; params.push(title); }
    if (reward !== undefined) { query += "reward = ?, "; params.push(reward); }
    if (timeStr !== undefined) { query += "timeStr = ?, "; params.push(timeStr); }
    if (frequency !== undefined) { query += "frequency = ?, "; params.push(frequency); }
    if (standards !== undefined) { query += "standards = ?, "; params.push(standards); }
    if (category !== undefined) { query += "category = ?, "; params.push(category); }
    if (catColor !== undefined) { query += "catColor = ?, "; params.push(catColor); }
    if (iconEmoji !== undefined) { query += "iconEmoji = ?, "; params.push(iconEmoji); }
    if (iconName !== undefined) { query += "iconName = ?, "; params.push(iconName); }
    if (dates !== undefined) { query += "dates = ?, "; params.push(JSON.stringify(dates)); }
    if (history !== undefined) { query += "history = ?, "; params.push(JSON.stringify(history)); }
    if (startDate !== undefined) { query += "startDate = ?, "; params.push(startDate); }
    if (pointRule !== undefined) { query += "pointRule = ?, "; params.push(pointRule); }
    if (habitType !== undefined) { query += "habitType = ?, "; params.push(habitType); }
    if (attachments !== undefined) { query += "attachments = ?, "; params.push(JSON.stringify(attachments)); }
    if (requireApproval !== undefined) { query += "requireApproval = ?, "; params.push(requireApproval ? 1 : 0); }
    if (repeatConfig !== undefined) { query += "repeatConfig = ?, "; params.push(repeatConfig ? JSON.stringify(repeatConfig) : null); }
    if (order !== undefined) { query += '"order" = ?, '; params.push(order); }
    if (periodMaxPerDay !== undefined) { query += "periodMaxPerDay = ?, "; params.push(periodMaxPerDay); }
    if (periodMaxType !== undefined) { query += "periodMaxType = ?, "; params.push(periodMaxType); }
    if (params.length === 0) return res.status(400).json({ error: "No fields to update" });

    query = query.slice(0, -2) + " WHERE id = ? AND userId = ?";
    params.push(req.params.id, req.user.id);
    db.run(query, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        notifyUser(req.user.id);
        res.json({ updatedID: req.params.id });
    });
});

app.put('/api/tasks/:id/history', authenticateToken, (req, res) => {
    const { date, status, timeSpent, note } = req.body;
    db.get("SELECT history FROM tasks WHERE id = ? AND userId = ?", [req.params.id, req.user.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Task not found" });

        let history = {};
        try { if (row.history) history = JSON.parse(row.history); } catch (e) { }

        history[date] = { status, timeSpent, note, updatedAt: new Date().toISOString() };
        db.run("UPDATE tasks SET history = ? WHERE id = ? AND userId = ?", [JSON.stringify(history), req.params.id, req.user.id], function (updateErr) {
            if (updateErr) return res.status(500).json({ error: updateErr.message });
            notifyUser(req.user.id);
            res.json({ updatedID: req.params.id, history });
        });
    });
});

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
    db.run("DELETE FROM tasks WHERE id = ? AND userId = ?", [req.params.id, req.user.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        notifyUser(req.user.id);
        res.json({ deletedID: req.params.id });
    });
});

// --- Inventory API ---
app.get('/api/inventory', authenticateToken, (req, res) => {
    db.all("SELECT * FROM inventory WHERE userId = ?", [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/inventory', authenticateToken, (req, res) => {
    const { id, name, price, desc, iconEmoji, image, type } = req.body;
    const insert = `INSERT INTO inventory (id, userId, name, price, desc, iconEmoji, image, type) VALUES (?,?,?,?,?,?,?,?)`;
    db.run(insert, [id, req.user.id, name, price, desc, iconEmoji, image, type], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        notifyUser(req.user.id);
        res.json({ id });
    });
});

app.put('/api/inventory/:id', authenticateToken, (req, res) => {
    const { name, price, desc, iconEmoji, image, type } = req.body;
    const query = "UPDATE inventory SET name = ?, price = ?, desc = ?, iconEmoji = ?, image = ?, type = ? WHERE id = ? AND userId = ?";
    db.run(query, [name, price, desc, iconEmoji, image, type, req.params.id, req.user.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        notifyUser(req.user.id);
        res.json({ updatedID: req.params.id });
    });
});

app.delete('/api/inventory/:id', authenticateToken, (req, res) => {
    db.run("DELETE FROM inventory WHERE id = ? AND userId = ?", [req.params.id, req.user.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        notifyUser(req.user.id);
        res.json({ deletedID: req.params.id });
    });
});

// --- Orders API ---
app.get('/api/orders', authenticateToken, (req, res) => {
    db.all("SELECT * FROM orders WHERE userId = ? ORDER BY date DESC", [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/orders', authenticateToken, (req, res) => {
    const { id, kidId, itemName, itemImage, price, status, date, rating, comment, redeemCode } = req.body;
    const insert = `INSERT INTO orders (id, userId, kidId, itemName, itemImage, price, status, date, rating, comment, redeemCode) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
    db.run(insert, [id, req.user.id, kidId, itemName, itemImage, price, status, date, rating, comment, redeemCode], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        notifyUser(req.user.id);
        res.json({ id });
    });
});

app.put('/api/orders/:id', authenticateToken, (req, res) => {
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

// --- Transactions API ---
app.get('/api/transactions', authenticateToken, (req, res) => {
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

app.post('/api/transactions', authenticateToken, (req, res) => {
    const { id, kidId, type, amount, title, date, category } = req.body;
    const insert = "INSERT INTO transactions (id, userId, kidId, type, amount, title, date, category) VALUES (?,?,?,?,?,?,?,?)";
    db.run(insert, [id, req.user.id, kidId, type, amount, title, date, category], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        notifyUser(req.user.id);
        res.json({ id });
    });
});

// --- Serve Frontend in Production ---
// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
