const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'minilife_super_secret_key_2026'; // ⚠️ 生产环境务必在 .env 中设置 JWT_SECRET

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

// Factory: creates authenticateToken middleware that also checks ban status
const createAuthMiddleware = (db) => {
    return (req, res, next) => {
        let token = null;
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            token = authHeader.split(' ')[1];
        } else if (req.query.token) {
            token = req.query.token;
        }

        if (token == null) return res.status(401).json({ error: "No token provided" });

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json({ error: "登录已过期，请重新登录" });
            req.user = user; // { id, role }

            // Skip ban check for admins
            if (user.role === 'admin') return next();

            // Check if user is banned
            db.get("SELECT status FROM users WHERE id = ?", [user.id], (err, row) => {
                if (err) return next(); // on DB error, allow through
                if (row && row.status === 'banned') {
                    return res.status(403).json({ error: "您的账号已被禁用，请联系管理员" });
                }
                next();
            });
        });
    };
};

// Middleware: Require Admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Admin access required" });
    next();
};

module.exports = { JWT_SECRET, clients, notifyUser, createAuthMiddleware, requireAdmin };

