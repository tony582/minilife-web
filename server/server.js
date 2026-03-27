require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const { clients, notifyUser, authenticateToken, requireAdmin, JWT_SECRET } = require('./middleware');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Shared dependencies for route modules
const deps = { JWT_SECRET, clients, notifyUser, authenticateToken, requireAdmin };

// --- SSE Synchronization Endpoint ---
app.get('/api/sync', authenticateToken, (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); 

    const userId = req.user.id;
    if (!clients[userId]) clients[userId] = [];
    clients[userId].push(res);
    
    res.write(`data: ${JSON.stringify({ action: 'connected' })}\n\n`);

    req.on('close', () => {
        if (clients[userId]) {
            clients[userId] = clients[userId].filter(client => client !== res);
            if (clients[userId].length === 0) delete clients[userId];
        }
    });
});

// --- Route Modules ---
const aiRoutes = require('./aiRoutes');
app.use('/api/ai', authenticateToken, aiRoutes);

app.use('/api', require('./routes/auth')(db, deps));
app.use('/api/admin', require('./routes/admin')(db, deps));
app.use('/api/kids', require('./routes/kids')(db, deps));
app.use('/api/tasks', require('./routes/tasks')(db, deps));
app.use('/api/inventory', require('./routes/inventory')(db, deps));
app.use('/api/orders', require('./routes/orders')(db, deps));
app.use('/api/classes', require('./routes/classes')(db, deps));
app.use('/api/transactions', require('./routes/transactions')(db, deps));
app.use('/api/settings', require('./routes/settings')(db, deps));

// --- Serve Frontend in Production ---
app.use(express.static(path.join(__dirname, '../dist')));

// SPA fallback: serve index.html for any non-API request
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
