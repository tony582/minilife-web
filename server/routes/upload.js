/**
 * MiniLife — File Upload Route
 * POST /api/upload
 *   Accepts: multipart/form-data, field name = "file"
 *   Returns immediately: { url, name, type, size, compressing? }
 *
 * For videos: the original is saved and the URL is returned right away.
 * FFmpeg then compresses the video in the background (same filename),
 * so the client URL remains valid throughout.
 *
 * Compression config (video):
 *   - Codec:     H.264 (libx264), CRF 28, preset fast
 *   - Max res:   1280×720 (landscape) / 720×1280 (portrait), aspect preserved
 *   - Audio:     AAC 96kbps
 *   - Metadata:  faststart (stream-friendly)
 *   Expected:    ~70-90% size reduction for typical phone videos
 */

const path   = require('path');
const fs     = require('fs');
const { spawn } = require('child_process');

module.exports = (db, { authenticateToken }) => {
    const express = require('express');
    const multer  = require('multer');
    const router  = express.Router();

    // ── Storage destination ──────────────────────────────────────────────
    const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
        filename: (req, file, cb) => {
            const userId = req.user?.id || 'anon';
            const ts     = Date.now();
            const safe   = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            cb(null, `${userId}_${ts}_${safe}`);
        },
    });

    // ── Size limits (bytes) ───────────────────────────────────────────────
    const LIMITS = {
        image: 10  * 1024 * 1024,   // 10 MB
        audio: 30  * 1024 * 1024,   // 30 MB
        video: 300 * 1024 * 1024,   // 300 MB raw (before compression)
    };

    const fileFilter = (_req, file, cb) => {
        const ok = file.mimetype.startsWith('image/') ||
                   file.mimetype.startsWith('audio/') ||
                   file.mimetype.startsWith('video/');
        ok ? cb(null, true) : cb(new Error(`不支持的文件类型: ${file.mimetype}`));
    };

    const upload = multer({ storage, fileFilter, limits: { fileSize: LIMITS.video } });

    // ── FFmpeg async compression ──────────────────────────────────────────
    /**
     * Compress a video file in-place using FFmpeg.
     * The URL returned to the client stays the same throughout.
     * @param {string} filePath  absolute path to the saved video
     */
    const compressVideoAsync = (filePath) => {
        const tmpPath = filePath + '.tmp.mp4';

        const args = [
            '-i', filePath,
            // Video: H.264, CRF 28 (good quality), fast encode
            '-c:v', 'libx264',
            '-crf', '28',
            '-preset', 'fast',
            // Scale down to ≤720p (landscape) or ≤1280 wide (portrait), keep aspect ratio
            '-vf', "scale='if(gt(iw,ih),min(1280,iw),min(720,iw))':-2",
            // Audio: AAC 96kbps
            '-c:a', 'aac',
            '-b:a', '96k',
            // Metadata at front for fast streaming start
            '-movflags', '+faststart',
            // Force mp4 container for compatibility
            '-f', 'mp4',
            '-y', tmpPath
        ];

        const ff = spawn('ffmpeg', args, { stdio: 'pipe' });

        ff.on('close', (code) => {
            if (code === 0 && fs.existsSync(tmpPath)) {
                const originalSize  = fs.statSync(filePath).size;
                const compressedSize = fs.statSync(tmpPath).size;
                const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
                // Replace original with compressed
                fs.renameSync(tmpPath, filePath);
                console.log(`[Upload] 视频压缩完成: ${path.basename(filePath)} — ${(originalSize/1024/1024).toFixed(1)}MB → ${(compressedSize/1024/1024).toFixed(1)}MB (节省 ${ratio}%)`);
            } else {
                // Compression failed — keep original, clean up temp
                console.warn(`[Upload] FFmpeg 压缩失败 (exit ${code}): ${path.basename(filePath)}, 保留原始文件`);
                if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
            }
        });

        ff.stderr.on('data', () => {}); // suppress ffmpeg progress logs
    };

    // ── POST /api/upload ─────────────────────────────────────────────────
    router.post('/', authenticateToken, upload.single('file'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: '未收到文件' });
        }

        const { mimetype, size, filename, originalname, path: filePath } = req.file;

        // Per-type hard size limit (before compression)
        const isImage = mimetype.startsWith('image/');
        const isAudio = mimetype.startsWith('audio/');
        const isVideo = mimetype.startsWith('video/');
        const limit   = isImage ? LIMITS.image : isAudio ? LIMITS.audio : LIMITS.video;

        if (size > limit) {
            fs.unlink(filePath, () => {});
            const label = isImage ? '10MB' : isAudio ? '30MB' : '300MB';
            return res.status(413).json({ error: `文件超过 ${label} 限制` });
        }

        // Respond immediately with the URL — client can show the file right away
        const response = {
            url:         `/uploads/${filename}`,
            name:        originalname,
            type:        mimetype,
            size,
            compressing: isVideo,  // tells client compression is running in background
        };

        res.json(response);

        // Start background compression for videos (non-blocking)
        if (isVideo) {
            setImmediate(() => compressVideoAsync(filePath));
        }
    });

    // ── Multer error handler ─────────────────────────────────────────────
    // eslint-disable-next-line no-unused-vars
    router.use((err, _req, res, _next) => {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: '文件超出大小限制（视频最大300MB）' });
        }
        return res.status(400).json({ error: err.message || '上传失败' });
    });

    return router;
};
