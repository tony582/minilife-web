const express = require('express');
const router = express.Router();

module.exports = (db, { authenticateToken, sendAlert }) => {

    // ═══ 1. Health Check — Public endpoint for uptime monitors ═══
    router.get('/health', async (req, res) => {
        const checks = { server: 'ok', database: 'unknown', uptime: process.uptime() };
        try {
            await new Promise((resolve, reject) => {
                db.get("SELECT 1 as ping", [], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            checks.database = 'ok';
        } catch (e) {
            checks.database = 'error';
            checks.dbError = e.message;
        }
        const allOk = checks.database === 'ok';
        res.status(allOk ? 200 : 503).json({
            status: allOk ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            ...checks,
        });
    });

    // ═══ 2. Frontend Error Reporting — Receives client-side errors ═══
    router.post('/report-error', (req, res) => {
        const { message, stack, url, userAgent, userId, extra } = req.body;
        if (!message) return res.status(400).json({ error: 'message required' });

        const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const timestamp = new Date().toISOString();

        // Store in database
        db.run(
            `INSERT INTO error_logs (id, source, message, stack, url, user_agent, user_id, extra, created_at)
             VALUES (?,?,?,?,?,?,?,?,?)`,
            [errorId, 'frontend', message, stack || '', url || '', userAgent || '', userId || '', JSON.stringify(extra || {}), timestamp],
            (err) => {
                if (err) console.error('[Monitor] Failed to log error:', err.message);
            }
        );

        // Rate-limit alerts: max 1 email per 5 minutes for same error message
        const cacheKey = `alert_${message.substring(0, 100)}`;
        if (!alertThrottle[cacheKey]) {
            alertThrottle[cacheKey] = true;
            setTimeout(() => delete alertThrottle[cacheKey], 5 * 60 * 1000);

            sendAlert(
                `前端错误: ${message.substring(0, 80)}`,
                `<b>Error ID:</b> ${errorId}<br>
                 <b>Message:</b> ${message}<br>
                 <b>URL:</b> ${url || 'N/A'}<br>
                 <b>User:</b> ${userId || 'anonymous'}<br>
                 <b>Stack:</b><pre style="font-size:11px;overflow:auto;max-height:200px;">${(stack || '').substring(0, 1500)}</pre>`,
                'error'
            );
        }

        res.json({ logged: true, errorId });
    });

    // ═══ 3. Backend Error Logger — Middleware ═══
    // This is exported as middleware, not a route
    router.backendErrorLogger = (err, req, res, next) => {
        const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        console.error(`[${errorId}] Server Error:`, err.message, err.stack);

        db.run(
            `INSERT INTO error_logs (id, source, message, stack, url, user_agent, user_id, extra, created_at)
             VALUES (?,?,?,?,?,?,?,?,?)`,
            [errorId, 'backend', err.message, err.stack || '', req.originalUrl, req.get('user-agent') || '', req.user?.id || '', JSON.stringify({ method: req.method, body: req.body }), new Date().toISOString()],
            () => {}
        );

        const cacheKey = `be_${err.message?.substring(0, 100)}`;
        if (!alertThrottle[cacheKey]) {
            alertThrottle[cacheKey] = true;
            setTimeout(() => delete alertThrottle[cacheKey], 5 * 60 * 1000);
            sendAlert(
                `后端错误: ${err.message?.substring(0, 80)}`,
                `<b>Error ID:</b> ${errorId}<br>
                 <b>Endpoint:</b> ${req.method} ${req.originalUrl}<br>
                 <b>User:</b> ${req.user?.id || 'N/A'}<br>
                 <b>Stack:</b><pre style="font-size:11px;overflow:auto;max-height:200px;">${(err.stack || '').substring(0, 1500)}</pre>`,
                'error'
            );
        }

        res.status(500).json({ error: 'Internal server error', errorId });
    };

    // ═══ 4. Business Anomaly Check — Admin-only endpoint ═══
    router.get('/anomaly-check', authenticateToken, async (req, res) => {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

        const anomalies = [];
        const check = (label, query, params = []) => new Promise(resolve => {
            db.all(query, params, (err, rows) => {
                if (err) { anomalies.push({ label, error: err.message }); resolve(); return; }
                if (rows && rows.length > 0) anomalies.push({ label, count: rows.length, samples: rows.slice(0, 5) });
                resolve();
            });
        });

        // Check 1: Transactions without taskId (recent, task/habit category)
        await check(
            '交易记录缺少 taskId',
            `SELECT id, title, category, date FROM transactions WHERE category IN ('task','habit') AND (taskid IS NULL OR taskid = '') AND date > $1 ORDER BY date DESC LIMIT 10`,
            [new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()]
        );

        // Check 2: Negative balances
        await check(
            '账户余额为负数',
            `SELECT id, name, balance_spend, balance_save, balance_give FROM kids WHERE balance_spend < 0 OR balance_save < 0 OR balance_give < 0`
        );

        // Check 3: Orphaned transactions (taskId points to non-existent task)
        await check(
            '孤立交易 (taskId 指向已删除的任务)',
            `SELECT t.id, t.title, t.taskid FROM transactions t LEFT JOIN tasks tk ON t.taskid = tk.id WHERE t.taskid IS NOT NULL AND t.taskid != '' AND tk.id IS NULL AND t.date > $1 LIMIT 10`,
            [new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()]
        );

        // Check 4: Recent errors count
        await check(
            '最近24小时错误数',
            `SELECT source, COUNT(*) as count FROM error_logs WHERE created_at > $1 GROUP BY source`,
            [new Date(Date.now() - 24 * 3600 * 1000).toISOString()]
        );

        // Check 5: Tasks with dirty emoji (standard categories should not have emoji)
        const stdCats = ['数学','语文','英语','物理','化学','生物','历史','地理','政治','道德与法治','信息技术','体育运动','兴趣班','其他'];
        await check(
            '标准分类任务使用了 emoji',
            `SELECT id, title, category, iconemoji FROM tasks WHERE category = ANY($1) AND iconemoji IS NOT NULL AND iconemoji != ''`,
            [stdCats]
        );

        res.json({
            healthy: anomalies.length === 0,
            checkedAt: new Date().toISOString(),
            anomalies,
        });
    });

    // ═══ 6. Error Logs List — Admin-only ═══
    router.get('/errors', authenticateToken, (req, res) => {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
        db.all(
            `SELECT * FROM error_logs ORDER BY created_at DESC LIMIT 50`,
            [],
            (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(rows || []);
            }
        );
    });

    // ═══ 5. Daily Anomaly Cron (runs automatically) ═══
    const DAILY_CHECK_HOUR = 9; // 每天早上9点
    let lastDailyCheck = null;

    setInterval(() => {
        const now = new Date();
        const hour = now.getHours();
        const dateStr = now.toISOString().slice(0, 10);
        
        if (hour === DAILY_CHECK_HOUR && lastDailyCheck !== dateStr) {
            lastDailyCheck = dateStr;
            runDailyAnomalyCheck();
        }
    }, 60 * 1000); // Check every minute

    async function runDailyAnomalyCheck() {
        console.log('[Monitor] Running daily anomaly check...');
        const issues = [];

        // Check negative balances
        await new Promise(resolve => {
            db.all(`SELECT id, name, balance_spend FROM kids WHERE balance_spend < 0`, [], (err, rows) => {
                if (!err && rows?.length > 0) issues.push(`${rows.length} 个账户余额为负数`);
                resolve();
            });
        });

        // Check recent error spikes
        await new Promise(resolve => {
            db.get(`SELECT COUNT(*) as count FROM error_logs WHERE created_at > $1`,
                [new Date(Date.now() - 24 * 3600 * 1000).toISOString()],
                (err, row) => {
                    if (!err && row && row.count > 10) issues.push(`过去24小时有 ${row.count} 个错误`);
                    resolve();
                }
            );
        });

        if (issues.length > 0) {
            sendAlert(
                `每日健康检查发现 ${issues.length} 个异常`,
                issues.map(i => `• ${i}`).join('<br>'),
                'warning'
            );
        }
        console.log(`[Monitor] Daily check complete: ${issues.length} issues found.`);
    }

    return router;
};

// Alert throttle cache
const alertThrottle = {};
