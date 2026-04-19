/**
 * MiniLife — File Upload Route
 * POST /api/upload
 *   Accepts: multipart/form-data, field name = "file"
 *   Returns: { url, name, type, size }
 *
 * Files are saved to /opt/minilife/public/uploads/ (production)
 * or <project_root>/public/uploads/ (local dev)
 */

const path = require('path');
const fs   = require('fs');
const multer = require('multer');

module.exports = (db, { authenticateToken }) => {
    const express = require('express');
    const router  = express.Router();

    // ── Storage destination ──────────────────────────────────────────────
    const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
        filename: (req, file, cb) => {
            // userId_timestamp_sanitised-original-name
            const userId  = req.user?.id || 'anon';
            const ts      = Date.now();
            const safe    = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            cb(null, `${userId}_${ts}_${safe}`);
        },
    });

    // ── Limits (bytes) ───────────────────────────────────────────────────
    const LIMITS = {
        image: 10  * 1024 * 1024,   // 10 MB
        audio: 30  * 1024 * 1024,   // 30 MB
        video: 150 * 1024 * 1024,   // 150 MB
    };

    const fileFilter = (_req, file, cb) => {
        const isImage = file.mimetype.startsWith('image/');
        const isAudio = file.mimetype.startsWith('audio/');
        const isVideo = file.mimetype.startsWith('video/');
        if (isImage || isAudio || isVideo) {
            cb(null, true);
        } else {
            cb(new Error(`不支持的文件类型: ${file.mimetype}`));
        }
    };

    // Use the largest limit at the multer level; enforce per-type below
    const upload = multer({
        storage,
        fileFilter,
        limits: { fileSize: LIMITS.video },
    });

    // ── POST /api/upload ─────────────────────────────────────────────────
    router.post('/', authenticateToken, upload.single('file'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: '未收到文件' });
        }

        const { mimetype, size, filename, originalname } = req.file;

        // Per-type size enforcement
        const isImage = mimetype.startsWith('image/');
        const isAudio = mimetype.startsWith('audio/');
        const limit   = isImage ? LIMITS.image : isAudio ? LIMITS.audio : LIMITS.video;
        if (size > limit) {
            fs.unlink(req.file.path, () => {}); // clean up
            const label = isImage ? '10MB' : isAudio ? '30MB' : '150MB';
            return res.status(413).json({ error: `文件超过 ${label} 限制` });
        }

        return res.json({
            url:  `/uploads/${filename}`,
            name: originalname,
            type: mimetype,
            size,
        });
    });

    // ── Multer error handler ─────────────────────────────────────────────
    // eslint-disable-next-line no-unused-vars
    router.use((err, _req, res, _next) => {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: '文件超出大小限制（视频最大150MB）' });
        }
        return res.status(400).json({ error: err.message || '上传失败' });
    });

    return router;
};
