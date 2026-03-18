const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'minilife.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Initialize Tables
        db.serialize(() => {
            // Because we are moving to multi-tenant, we wipe the old single-tenant tables.
            // DO NOT WIPE PRODUCTION DATA
            // db.run(`DROP TABLE IF EXISTS kids`);
            // db.run(`DROP TABLE IF EXISTS tasks`);
            // db.run(`DROP TABLE IF EXISTS inventory`);
            // db.run(`DROP TABLE IF EXISTS orders`);
            // db.run(`DROP TABLE IF EXISTS transactions`);
            // db.run(`DROP TABLE IF EXISTS users`);
            // db.run(`DROP TABLE IF EXISTS activation_codes`);

            // Users Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                trial_start TEXT,
                sub_end_date TEXT,
                created_at TEXT
            )`);

            // Activation Codes Table
            db.run(`CREATE TABLE IF NOT EXISTS activation_codes (
                code TEXT PRIMARY KEY,
                duration_days INTEGER NOT NULL,
                status TEXT DEFAULT 'active',
                used_by TEXT,
                used_at TEXT
            )`);

            // Create a default Admin user (password: admin123)
            // bcrypt hash for "admin123" ($2b$10$uekgwsW6PjiJsqlT7X807esIAvMyLIeDvfBtOZuey6F3iBG1fxGSi)
            const insertAdmin = "INSERT INTO users (id, email, password_hash, role, created_at) VALUES (?,?,?,?,?)";
            db.run(insertAdmin, ['admin_1', 'admin@minilife.com', '$2b$10$uekgwsW6PjiJsqlT7X807esIAvMyLIeDvfBtOZuey6F3iBG1fxGSi', 'admin', new Date().toISOString()], (err) => {
                if (err) {
                    // Ignored on restart if it already exists
                }
            });

            // Kids Table (Multi-tenant)
            db.run(`CREATE TABLE IF NOT EXISTS kids (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                name TEXT NOT NULL,
                avatar TEXT,
                level INTEGER DEFAULT 1,
                exp INTEGER DEFAULT 0,
                balance_spend INTEGER DEFAULT 0,
                balance_save INTEGER DEFAULT 0,
                balance_give INTEGER DEFAULT 0,
                vault_locked INTEGER DEFAULT 0,
                vault_projected INTEGER DEFAULT 0
            )`);

            // Tasks Table (Multi-tenant)
            db.run(`CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                kidId TEXT,
                title TEXT NOT NULL,
                type TEXT,
                reward INTEGER,
                status TEXT,
                iconName TEXT,
                iconEmoji TEXT,
                category TEXT,
                catColor TEXT,
                frequency TEXT,
                timeStr TEXT,
                standards TEXT,
                dates TEXT,
                history TEXT,
                startDate TEXT,
                pointRule TEXT,
                habitType TEXT,
                attachments TEXT,
                requireApproval INTEGER,
                repeatConfig TEXT,
                "order" INTEGER DEFAULT 0,
                periodMaxPerDay INTEGER,
                periodMaxType TEXT
            )`);
            
            // Add safe migrations for existing instances
            db.run(`ALTER TABLE tasks ADD COLUMN periodMaxPerDay INTEGER`, (err) => {});
            db.run(`ALTER TABLE tasks ADD COLUMN periodMaxType TEXT`, (err) => {});
            db.run(`ALTER TABLE tasks ADD COLUMN linkedClassId TEXT`, (err) => {});


            // Inventory Table (Multi-tenant)
            db.run(`CREATE TABLE IF NOT EXISTS inventory (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                name TEXT NOT NULL,
                price INTEGER,
                desc TEXT,
                iconEmoji TEXT,
                image TEXT,
                type TEXT,
                walletTarget TEXT DEFAULT 'spend',
                charityTarget TEXT,
                maxExchanges INTEGER,
                periodMaxType TEXT
            )`);

            // Orders Table (Multi-tenant)
            db.run(`CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                kidId TEXT,
                itemName TEXT,
                itemImage TEXT,
                price INTEGER,
                status TEXT,
                date TEXT,
                rating INTEGER,
                comment TEXT,
                redeemCode TEXT
            )`);

            // Safe migrations for newly added columns
            db.run(`ALTER TABLE inventory ADD COLUMN image TEXT`, (err) => {});
            db.run(`ALTER TABLE inventory ADD COLUMN walletTarget TEXT DEFAULT 'spend'`, (err) => {});
            db.run(`ALTER TABLE inventory ADD COLUMN charityTarget TEXT`, (err) => {});
            db.run(`ALTER TABLE inventory ADD COLUMN maxExchanges INTEGER`, (err) => {});
            db.run(`ALTER TABLE inventory ADD COLUMN periodMaxType TEXT`, (err) => {});
            db.run(`ALTER TABLE orders ADD COLUMN itemImage TEXT`, (err) => {});
            db.run(`ALTER TABLE orders ADD COLUMN redeemCode TEXT`, (err) => {});

            // Transactions Table (Multi-tenant)
            db.run(`CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                kidId TEXT,
                type TEXT,
                amount INTEGER,
                title TEXT,
                date TEXT,
                category TEXT
            )`);

            // Interest Classes Table (Multi-tenant)
            db.run(`CREATE TABLE IF NOT EXISTS classes (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                kidId TEXT NOT NULL,
                name TEXT NOT NULL,
                iconEmoji TEXT,
                teacher TEXT,
                location TEXT,
                totalSessions INTEGER DEFAULT 0,
                usedSessions INTEGER DEFAULT 0,
                sessionsPerClass INTEGER DEFAULT 1,
                scheduleDays TEXT,
                timeStr TEXT,
                startDate TEXT,
                reward INTEGER DEFAULT 0,
                checkinMode TEXT DEFAULT 'parent',
                linkedTaskId TEXT,
                notes TEXT,
                status TEXT DEFAULT 'active',
                checkinHistory TEXT DEFAULT '[]',
                createdAt TEXT
            )`);
            
            // Safe migrations for classes
            db.run(`ALTER TABLE classes ADD COLUMN checkinMode TEXT DEFAULT 'parent'`, (err) => {});
            db.run(`ALTER TABLE classes ADD COLUMN linkedTaskId TEXT`, (err) => {});
            db.run(`ALTER TABLE classes ADD COLUMN classMode TEXT DEFAULT 'package'`, (err) => {});
            db.run(`ALTER TABLE classes ADD COLUMN pricePerSession REAL DEFAULT 0`, (err) => {});
            db.run(`ALTER TABLE classes ADD COLUMN settlementType TEXT DEFAULT 'manual'`, (err) => {});
        });
    }
});

module.exports = db;
