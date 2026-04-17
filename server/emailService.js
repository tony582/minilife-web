const nodemailer = require('nodemailer');
const path = require('path');

// ═══ Email Service for MiniLife ═══
// SMTP: Tencent Enterprise Mail (腾讯企业邮箱)

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.exmail.qq.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // SSL
    auth: {
        user: process.env.SMTP_USER || 'noreply@minilife.online',
        pass: process.env.SMTP_PASS || '',
    },
});

// Verify connection on startup
transporter.verify().then(() => {
    console.log('📧 Email service connected.');
}).catch(err => {
    console.warn('⚠️ Email service not available:', err.message);
});

// Logo path
const logoPath = path.resolve(__dirname, '../public/minilife_logo_transparent.png');

/**
 * Send a password reset verification code
 * @param {string} to - recipient email
 * @param {string} code - 6-digit code
 * @returns {Promise}
 */
async function sendResetCode(to, code) {
    const html = `
    <div style="max-width:480px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;background:#f8f9fc;padding:40px 0;">
        <div style="background:#fff;border-radius:16px;padding:40px;margin:0 20px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
            <div style="text-align:center;margin-bottom:24px;">
                <h1 style="margin:0;font-size:22px;color:#1e293b;font-weight:900;">MiniLife</h1>
                <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;">密码重置验证码</p>
            </div>
            <div style="text-align:center;margin:32px 0;">
                <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:32px;font-weight:900;letter-spacing:8px;padding:16px 32px;border-radius:12px;">
                    ${code}
                </div>
            </div>
            <p style="color:#475569;font-size:14px;line-height:1.6;text-align:center;">
                您正在重置 MiniLife 账号密码，<br>
                验证码 <strong>5 分钟</strong>内有效，请勿分享给他人。
            </p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
            <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
                如非本人操作，请忽略此邮件。<br>
                &copy; ${new Date().getFullYear()} MiniLife &middot; 让成长看得见
            </p>
        </div>
    </div>`;

    return transporter.sendMail({
        from: `"MiniLife" <${process.env.SMTP_USER || 'noreply@minilife.online'}>`,
        to,
        subject: `【MiniLife】密码重置验证码: ${code}`,
        html,
        priority: 'high',
        headers: {
            'X-Priority': '1',
            'Importance': 'high',
            'X-MSMail-Priority': 'High',
        },
    });
}

/**
 * Send a monitoring alert email to admin
 * @param {string} subject - Alert subject
 * @param {string} body - Alert body (HTML)
 * @param {'error'|'warning'|'info'} severity - Alert severity
 */
async function sendAlert(subject, body, severity = 'error') {
    const adminEmail = process.env.ALERT_EMAIL || process.env.SMTP_USER || 'noreply@minilife.online';
    const colorMap = { error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    const labelMap = { error: '🚨 ERROR', warning: '⚠️ WARNING', info: 'ℹ️ INFO' };
    const color = colorMap[severity] || colorMap.error;
    const label = labelMap[severity] || labelMap.error;

    const html = `
    <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;background:#f8f9fc;padding:24px 0;">
        <div style="background:#fff;border-radius:12px;padding:32px;margin:0 16px;box-shadow:0 2px 12px rgba(0,0,0,0.06);border-top:4px solid ${color};">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
                <span style="background:${color};color:#fff;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:700;">${label}</span>
                <span style="color:#64748b;font-size:12px;">${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</span>
            </div>
            <h2 style="margin:0 0 16px;font-size:18px;color:#1e293b;">${subject}</h2>
            <div style="background:#f1f5f9;border-radius:8px;padding:16px;font-size:13px;color:#334155;line-height:1.8;word-break:break-all;">
                ${body}
            </div>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
            <p style="color:#94a3b8;font-size:11px;margin:0;">MiniLife Monitoring · ${process.env.NODE_ENV || 'development'}</p>
        </div>
    </div>`;

    try {
        await transporter.sendMail({
            from: `"MiniLife Monitor" <${process.env.SMTP_USER || 'noreply@minilife.online'}>`,
            to: adminEmail,
            subject: `[MiniLife ${label}] ${subject}`,
            html,
        });
    } catch (e) {
        console.error('[Monitor] Failed to send alert email:', e.message);
    }
}

module.exports = { sendResetCode, sendAlert };
