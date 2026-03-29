const { Pool } = require('pg');

// ═══════════════════════════════════════════════════════════
// PostgreSQL Database Layer with SQLite-compatible API
// ═══════════════════════════════════════════════════════════
// Provides db.get(), db.all(), db.run() callbacks just like
// sqlite3 so route files need zero structural changes.
// The wrapper auto-converts `?` placeholders → `$1, $2, $3`.
//
// COLUMN NAME STRATEGY:
// SQLite is case-insensitive: `userId` and `userid` are same.
// PostgreSQL lowercases unquoted identifiers: `userId` → `userid`.
// So we define all PG columns in lowercase. Existing route SQL
// uses `userId` unquoted, PG treats it as `userid` → match.
//
// RESULT MAPPING:
// PG always returns lowercase keys. Route code accesses `row.userId`.
// We add a result mapper to restore camelCase keys so JS code works.
// ═══════════════════════════════════════════════════════════

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://minilife:minilife@localhost:5432/minilife';

const pool = new Pool({
    connectionString: DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// ─── Column name mapping: lowercase PG → camelCase JS ───
const COLUMN_MAP = {
    userid: 'userId', kidid: 'kidId', iconname: 'iconName',
    iconemoji: 'iconEmoji', catcolor: 'catColor', timestr: 'timeStr',
    startdate: 'startDate', pointrule: 'pointRule', habittype: 'habitType',
    requireapproval: 'requireApproval', repeatconfig: 'repeatConfig',
    periodmaxperday: 'periodMaxPerDay', periodmaxtype: 'periodMaxType',
    linkedclassid: 'linkedClassId', wallettarget: 'walletTarget',
    charitytarget: 'charityTarget', maxexchanges: 'maxExchanges',
    itemname: 'itemName', itemimage: 'itemImage', redeemcode: 'redeemCode',
    totalsessions: 'totalSessions', usedsessions: 'usedSessions',
    sessionsperclass: 'sessionsPerClass', scheduledays: 'scheduleDays',
    checkinmode: 'checkinMode', linkedtaskid: 'linkedTaskId',
    checkinhistory: 'checkinHistory', createdat: 'createdAt',
    classmode: 'classMode', pricepersession: 'pricePerSession',
    settlementtype: 'settlementType', password_hash: 'password_hash',
    sub_end_date: 'sub_end_date', trial_start: 'trial_start',
    created_at: 'created_at', ai_quota: 'ai_quota',
    user_id: 'user_id', login_at: 'login_at', ip_address: 'ip_address',
    api_key: 'api_key', model_name: 'model_name', base_url: 'base_url',
    default_quota: 'default_quota', updated_at: 'updated_at',
    tokens_used: 'tokens_used', duration_days: 'duration_days',
    used_by: 'used_by', used_at: 'used_at', batch_id: 'batch_id',
    expires_at: 'expires_at',
    spirit_type: 'spirit_type', spirit_accessories: 'spirit_accessories',
    streak_days: 'streak_days', last_streak_date: 'last_streak_date',
    highest_level: 'highest_level', badges: 'badges',
    interest_amount: 'interest_amount', interest_rate: 'interest_rate',
    interest_bonus: 'interest_bonus', calculated_at: 'calculated_at',
};

// Columns that should always be numbers (PG bigint returns strings)
const NUMERIC_COLUMNS = new Set([
    'amount', 'balance_spend', 'balance_save', 'balance_give',
    'vault_locked', 'vault_projected', 'level', 'exp',
    'coins', 'gems', 'reward', 'price', 'quantity', 'maxperday',
    'periodmaxperday', 'ai_quota', 'default_quota', 'tokens_used',
    'duration_days', 'totalsessions', 'usedsessions', 'sessionsperclass',
    'pricepersession', 'streak_days', 'highest_level',
    'interest_amount', 'interest_rate', 'interest_bonus',
]);

function mapRow(row) {
    if (!row) return row;
    const mapped = {};
    for (const [key, value] of Object.entries(row)) {
        const mappedKey = COLUMN_MAP[key] || key;
        // Convert bigint strings to numbers
        if (NUMERIC_COLUMNS.has(key) && value !== null && value !== undefined) {
            mapped[mappedKey] = Number(value);
        } else {
            mapped[mappedKey] = value;
        }
    }
    return mapped;
}

function mapRows(rows) {
    return rows.map(mapRow);
}

// ─── Helper: Convert SQLite `?` placeholders to PG `$1, $2, $3` ───
function convertPlaceholders(sql) {
    let idx = 0;
    return sql.replace(/\?/g, () => `$${++idx}`);
}

// ─── SQLite-compatible API wrapper ───
const db = {
    // db.get(sql, params, cb) → returns single row or undefined
    get(sql, params, cb) {
        if (typeof params === 'function') { cb = params; params = []; }
        const pgSql = convertPlaceholders(sql);
        pool.query(pgSql, params || [])
            .then(result => cb(null, mapRow(result.rows[0]) || undefined))
            .catch(err => cb(err));
    },

    // db.all(sql, params, cb) → returns array of rows
    all(sql, params, cb) {
        if (typeof params === 'function') { cb = params; params = []; }
        const pgSql = convertPlaceholders(sql);
        pool.query(pgSql, params || [])
            .then(result => cb(null, mapRows(result.rows)))
            .catch(err => cb(err));
    },

    // db.run(sql, params, cb) → runs INSERT/UPDATE/DELETE
    run(sql, params, cb) {
        if (typeof params === 'function') { cb = params; params = []; }
        const pgSql = convertPlaceholders(sql);
        pool.query(pgSql, params || [])
            .then(result => {
                if (cb) cb(null, { changes: result.rowCount });
            })
            .catch(err => {
                if (cb) cb(err);
            });
    },

    // No-op for compat
    serialize(fn) { if (fn) fn(); },

    // Expose pool for direct queries (admin-stats)
    pool,
};

// ─── Initialize Schema ───
async function initializeDatabase() {
    const client = await pool.connect();
    try {
        console.log('Connected to PostgreSQL database.');

        // Users Table
        await client.query(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            trial_start TEXT,
            sub_end_date TEXT,
            created_at TEXT,
            ai_quota INTEGER DEFAULT NULL,
            status TEXT DEFAULT 'active'
        )`);

        // Activation Codes Table
        await client.query(`CREATE TABLE IF NOT EXISTS activation_codes (
            code TEXT PRIMARY KEY,
            duration_days INTEGER NOT NULL,
            status TEXT DEFAULT 'active',
            used_by TEXT,
            used_at TEXT,
            batch_id TEXT,
            created_at TEXT,
            note TEXT
        )`);

        // Kids Table (all lowercase columns — PG auto-lowercases unquoted SQL)
        await client.query(`CREATE TABLE IF NOT EXISTS kids (
            id TEXT PRIMARY KEY,
            userid TEXT NOT NULL,
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

        // Tasks Table
        await client.query(`CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            userid TEXT NOT NULL,
            kidid TEXT,
            title TEXT NOT NULL,
            type TEXT,
            reward INTEGER,
            status TEXT,
            iconname TEXT,
            iconemoji TEXT,
            category TEXT,
            catcolor TEXT,
            frequency TEXT,
            timestr TEXT,
            standards TEXT,
            dates TEXT,
            history TEXT,
            startdate TEXT,
            pointrule TEXT,
            habittype TEXT,
            attachments TEXT,
            requireapproval INTEGER,
            repeatconfig TEXT,
            "order" INTEGER DEFAULT 0,
            periodmaxperday INTEGER,
            periodmaxtype TEXT,
            linkedclassid TEXT
        )`);

        // Inventory Table
        await client.query(`CREATE TABLE IF NOT EXISTS inventory (
            id TEXT PRIMARY KEY,
            userid TEXT NOT NULL,
            name TEXT NOT NULL,
            price INTEGER,
            "desc" TEXT,
            iconemoji TEXT,
            image TEXT,
            type TEXT,
            wallettarget TEXT DEFAULT 'spend',
            charitytarget TEXT,
            maxexchanges INTEGER,
            periodmaxtype TEXT
        )`);

        // Orders Table
        await client.query(`CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            userid TEXT NOT NULL,
            kidid TEXT,
            itemname TEXT,
            itemimage TEXT,
            price INTEGER,
            status TEXT,
            date TEXT,
            rating INTEGER,
            comment TEXT,
            redeemcode TEXT
        )`);

        // Transactions Table
        await client.query(`CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            userid TEXT NOT NULL,
            kidid TEXT,
            type TEXT,
            amount INTEGER,
            title TEXT,
            date TEXT,
            category TEXT
        )`);

        // Interest Classes Table
        await client.query(`CREATE TABLE IF NOT EXISTS classes (
            id TEXT PRIMARY KEY,
            userid TEXT NOT NULL,
            kidid TEXT NOT NULL,
            name TEXT NOT NULL,
            iconemoji TEXT,
            teacher TEXT,
            location TEXT,
            totalsessions INTEGER DEFAULT 0,
            usedsessions INTEGER DEFAULT 0,
            sessionsperclass INTEGER DEFAULT 1,
            scheduledays TEXT,
            timestr TEXT,
            startdate TEXT,
            reward INTEGER DEFAULT 0,
            checkinmode TEXT DEFAULT 'parent',
            linkedtaskid TEXT,
            notes TEXT,
            status TEXT DEFAULT 'active',
            checkinhistory TEXT DEFAULT '[]',
            createdat TEXT,
            classmode TEXT DEFAULT 'package',
            pricepersession REAL DEFAULT 0,
            settlementtype TEXT DEFAULT 'manual'
        )`);

        // AI Config Table
        await client.query(`CREATE TABLE IF NOT EXISTS ai_config (
            id INTEGER PRIMARY KEY DEFAULT 1,
            provider TEXT DEFAULT 'gemini',
            api_key TEXT DEFAULT '',
            model_name TEXT DEFAULT 'gemini-2.0-flash',
            base_url TEXT DEFAULT '',
            default_quota INTEGER DEFAULT 50,
            updated_at TEXT
        )`);

        // AI Usage Log Table
        await client.query(`CREATE TABLE IF NOT EXISTS ai_usage_log (
            id SERIAL PRIMARY KEY,
            user_id TEXT NOT NULL,
            action TEXT DEFAULT 'parse-homework',
            tokens_used INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )`);

        // User Settings Table
        await client.query(`CREATE TABLE IF NOT EXISTS user_settings (
            userid TEXT PRIMARY KEY,
            data TEXT DEFAULT '{}'
        )`);

        // Login Log
        await client.query(`CREATE TABLE IF NOT EXISTS login_log (
            id SERIAL PRIMARY KEY,
            user_id TEXT NOT NULL,
            login_at TEXT NOT NULL,
            ip_address TEXT
        )`);

        // System Announcements
        await client.query(`CREATE TABLE IF NOT EXISTS announcements (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT,
            type TEXT DEFAULT 'info',
            active INTEGER DEFAULT 1,
            created_at TEXT,
            expires_at TEXT
        )`);

        // Create default Admin user if not exists
        await client.query(
            `INSERT INTO users (id, email, password_hash, role, created_at)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO NOTHING`,
            ['admin_1', 'admin@minilife.com', '$2b$10$uekgwsW6PjiJsqlT7X807esIAvMyLIeDvfBtOZuey6F3iBG1fxGSi', 'admin', new Date().toISOString()]
        );

        // ── Spirit System: safe migration for existing DBs ──
        await client.query(`ALTER TABLE kids ADD COLUMN IF NOT EXISTS spirit_type TEXT DEFAULT 'sprout'`);
        await client.query(`ALTER TABLE kids ADD COLUMN IF NOT EXISTS spirit_accessories TEXT DEFAULT '[]'`);
        await client.query(`ALTER TABLE kids ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0`);
        await client.query(`ALTER TABLE kids ADD COLUMN IF NOT EXISTS last_streak_date TEXT DEFAULT ''`);
        await client.query(`ALTER TABLE kids ADD COLUMN IF NOT EXISTS highest_level INTEGER DEFAULT 1`);
        await client.query(`ALTER TABLE kids ADD COLUMN IF NOT EXISTS badges TEXT DEFAULT '[]'`);

        // Interest History Table
        await client.query(`CREATE TABLE IF NOT EXISTS interest_history (
            id TEXT PRIMARY KEY,
            userid TEXT NOT NULL,
            kidid TEXT NOT NULL,
            interest_amount INTEGER DEFAULT 0,
            interest_rate REAL DEFAULT 0,
            interest_bonus REAL DEFAULT 0,
            balance_snapshot INTEGER DEFAULT 0,
            calculated_at TEXT NOT NULL
        )`);

        console.log('PostgreSQL schema initialized successfully.');
    } catch (err) {
        console.error('Database initialization error:', err.message);
    } finally {
        client.release();
    }
}

// Run initialization
initializeDatabase();

module.exports = db;
