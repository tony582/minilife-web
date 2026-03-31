const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('./database');
const router = express.Router();

// Canonical categories — MUST match frontend categoryUtils.js defaultCategories
const VALID_CATEGORIES = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '道德与法治', '信息技术', '体育运动', '娱乐', '兴趣班', '其他'];

// Category -> emoji mapping (aligned with valid categories)
const catEmojiMap = {
    '语文': '📖', '数学': '🧮', '英语': '🔤', '物理': '⚡',
    '化学': '🧪', '生物': '🌿', '历史': '⏳', '地理': '🌍',
    '政治': '🏛️', '道德与法治': '⚖️', '信息技术': '💻', '体育运动': '🏃',
    '娱乐': '🎮', '兴趣班': '🎨', '其他': '📋'
};

// Keyword-based fuzzy matching: map AI output to canonical categories
const categoryKeywords = {
    '语文': ['语文', '作文', '写字', '汉字', '生字', '词语', '古诗', '课文', '阅读理解', '日记', '练字', '拼音', '笔顺', '默写', '抄写', '朗读', '诗词', '成语', '造句'],
    '数学': ['数学', '算术', '口算', '计算', '几何', '方程', '奥数', '算数', '练习题', '应用题', '竖式'],
    '英语': ['英语', 'english', '单词', '英文', '听力', '口语', '音标', '字母', 'unit', 'word', 'reading', '背单词', '新概念'],
    '物理': ['物理'],
    '化学': ['化学'],
    '生物': ['生物'],
    '历史': ['历史'],
    '地理': ['地理'],
    '政治': ['政治'],
    '道德与法治': ['道德', '法治'],
    '信息技术': ['编程', '电脑', '信息', '计算机', '代码', '程序'],
    '体育运动': ['体育', '运动', '跑步', '跳绳', '游泳', '球', '锻炼', '体能'],
    '娱乐': ['游戏', '娱乐', '玩'],
    '兴趣班': ['钢琴', '小提琴', '乐器', '画画', '美术', '音乐', '舞蹈', '书法', '围棋', '象棋', '乐高', '编程课', '兴趣']
};

/**
 * Normalize AI-returned category to a canonical one.
 * Strategy: exact match → keyword match on title → keyword match on category → fallback '其他'
 */
const normalizeCategory = (aiCategory, taskTitle = '') => {
    // 1. Exact match against valid categories
    if (VALID_CATEGORIES.includes(aiCategory)) return aiCategory;

    const combined = `${aiCategory} ${taskTitle}`.toLowerCase();

    // 2. Keyword match — check each canonical category's keywords
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        for (const kw of keywords) {
            if (combined.includes(kw.toLowerCase())) return cat;
        }
    }

    // 3. Fallback
    return '其他';
};

const SYSTEM_PROMPT = `将作业内容拆解为具体学习任务，并智能判断任务安排。
**分类规则（非常重要）**：category 必须按照学科/科目分类，不能用动作类型（如"练习""背诵""默写"）。
可用分类仅限: ${VALID_CATEGORIES.join('/')}
例如："英语：背诵Unit 3单词" → category 应为 "英语"，不是 "背诵"
例如："语文：默写古诗" → category 应为 "语文"，不是 "默写"
例如："跳绳100个" → category 应为 "体育运动"
如果无法确定科目，使用 "其他"

时长10-120分钟。奖励: 简单5-10分, 中等10-20, 难20-30。模糊作业要拆具体步骤。
任务安排规则:
- schedule="today": 一次性作业(如"完成XX卷子""明天交的作业")
- schedule="daily": 每天都要做的(如"每天练字""每天背单词""坚持XX")
- schedule="weekly": 每周固定几天做的(如"周三周五练琴""每周二上课")，需附weeklyDays数组(1=周一..7=周日)
- 如无法判断，默认"today"
仅返回JSON数组:
[{"title":"任务标题","category":"学科分类","desc":"具体标准","reward":分数,"durationPreset":分钟,"schedule":"today/daily/weekly","weeklyDays":[]}]`;

// Helper: get AI config from DB, fallback to env
const getAiConfig = () => new Promise((resolve, reject) => {
    db.get("SELECT * FROM ai_config WHERE id = 1", [], (err, row) => {
        if (err) return reject(err);
        resolve(row || {
            provider: 'gemini',
            api_key: process.env.GOOGLE_AI_API_KEY || '',
            model_name: 'gemini-2.0-flash',
            base_url: '',
            default_quota: 50
        });
    });
});

// Helper: check user's monthly quota
const checkQuota = (userId) => new Promise((resolve, reject) => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    db.get(`SELECT u.ai_quota,
                   (SELECT default_quota FROM ai_config WHERE id = 1) as global_quota,
                   (SELECT COUNT(*) FROM ai_usage_log l WHERE l.user_id = u.id AND l.created_at >= ?) as used
            FROM users u WHERE u.id = ?`,
        [monthStart.toISOString(), userId], (err, row) => {
            if (err) return reject(err);
            if (!row) return resolve({ allowed: true, used: 0, quota: 50 });
            const quota = row.ai_quota !== null ? row.ai_quota : (row.global_quota || 50);
            resolve({ allowed: row.used < quota, used: row.used, quota, remaining: quota - row.used });
        });
});

// Helper: log AI usage
const logUsage = (userId, action = 'parse-homework') => new Promise((resolve, reject) => {
    db.run("INSERT INTO ai_usage_log (user_id, action, created_at) VALUES (?, ?, ?)",
        [userId, action, new Date().toISOString()], (err) => err ? reject(err) : resolve());
});

// Helper: call AI provider
const callAI = async (config, parts) => {
    const apiKey = config.api_key || process.env.GOOGLE_AI_API_KEY || '';

    if (!apiKey) return null; // Will trigger mock fallback

    if (config.provider === 'gemini' || !config.provider) {
        // Google Gemini — pass system prompt via systemInstruction to avoid ByteString encoding issues
        const genAI = new GoogleGenerativeAI(apiKey);
        // Separate system prompt from content parts
        const contentParts = parts.filter(p => p.text !== SYSTEM_PROMPT);
        const model = genAI.getGenerativeModel({
            model: config.model_name || 'gemini-2.0-flash',
            systemInstruction: SYSTEM_PROMPT,
            generationConfig: { maxOutputTokens: 1024, temperature: 0.2 }
        });
        const result = await model.generateContent(contentParts);
        return result.response.text();
    }

    // OpenAI-compatible API (DeepSeek, Qwen, custom)
    const baseUrl = config.base_url || {
        deepseek: 'https://api.deepseek.com/v1',
        qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    }[config.provider] || config.base_url;

    if (!baseUrl) throw new Error(`Unknown provider: ${config.provider}`);

    // Convert parts to OpenAI messages format
    const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
    const userContent = [];
    for (const part of parts) {
        if (part.text && part.text !== SYSTEM_PROMPT) {
            userContent.push({ type: 'text', text: part.text });
        }
        if (part.inlineData) {
            userContent.push({
                type: 'image_url',
                image_url: { url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` }
            });
        }
    }
    if (userContent.length > 0) messages.push({ role: 'user', content: userContent });

    const resp = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: config.model_name || 'deepseek-chat',
            messages,
            temperature: 0.2,
            max_tokens: 1024,
        })
    });

    if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`AI API error (${resp.status}): ${errorText}`);
    }

    const data = await resp.json();
    return data.choices?.[0]?.message?.content || '';
};

// ═══ Parse Homework Endpoint ═══
router.post('/parse-homework', async (req, res) => {
    const { text, image, currentTasks, refineInstruction } = req.body;
    const isRefine = currentTasks && refineInstruction;

    if (!text && !image && !isRefine) {
        return res.status(400).json({ error: '请提供作业文字或图片' });
    }

    // Check quota
    try {
        const quotaInfo = await checkQuota(req.user.id);
        if (!quotaInfo.allowed) {
            return res.status(403).json({
                error: `本月 AI 配额已用完（${quotaInfo.quota}次/月），请联系管理员增加配额`,
                quota: quotaInfo
            });
        }
    } catch (err) {
        console.error('[AI] Quota check error:', err);
    }

    // Get AI config
    let config;
    try {
        config = await getAiConfig();
    } catch (err) {
        config = { provider: 'gemini', api_key: process.env.GOOGLE_AI_API_KEY || '', model_name: 'gemini-2.0-flash' };
    }

    const apiKey = config.api_key || process.env.GOOGLE_AI_API_KEY || '';

    // No API key: return mock data
    if (!apiKey) {
        console.log('[AI] No API key configured, returning mock data');
        const mockTasks = [
            { title: '语文：抄写生字词3遍', category: '语文', desc: '工整抄写，注意笔顺', reward: 10, durationPreset: 25, iconEmoji: '📖' },
            { title: '数学：完成课本练习题', category: '数学', desc: '独立完成，写清过程', reward: 15, durationPreset: 30, iconEmoji: '🧮' },
            { title: '英语：背诵Unit 3单词', category: '英语', desc: '能正确拼写和发音', reward: 10, durationPreset: 20, iconEmoji: '🔤' },
        ];
        return res.json({ tasks: mockTasks, mock: true });
    }

    // Build prompt parts
    const parts = [{ text: SYSTEM_PROMPT }];
    if (isRefine) {
        // Refinement mode: send current tasks + user's adjustment instruction
        const tasksJson = JSON.stringify(currentTasks.map(t => ({ title: t.title, category: t.category, desc: t.desc, reward: t.reward, durationPreset: t.durationPreset })));
        parts.push({ text: `当前任务列表:\n${tasksJson}\n\n用户要求调整: ${refineInstruction}\n\n请根据用户要求修改任务列表，仅返回调整后的JSON数组。` });
    } else {
        if (text) parts.push({ text: `以下是家长提供的作业/学习内容：\n${text}` });
        if (image) {
            const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
            const mimeMatch = image.match(/^data:(image\/\w+);/);
            const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
            parts.push({ inlineData: { data: base64Data, mimeType } });
            if (!text) parts.push({ text: '请识别这张作业图片中的内容，并拆解为学习任务。' });
        }
    }

    // Call AI
    try {
        const hasImage = parts.some(p => p.inlineData);
        console.log(`[AI] Calling ${config.provider}/${config.model_name} | parts: ${parts.length} | hasImage: ${hasImage} | textLen: ${text?.length || 0}`);
        const responseText = await callAI(config, parts);

        if (!responseText) {
            return res.status(500).json({ error: 'AI 返回为空' });
        }

        // Extract JSON from response — robust handling for AI quirks
        let jsonStr = responseText;
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) jsonStr = jsonMatch[1].trim();

        // Find outermost array using bracket depth (handles nested arrays like weeklyDays)
        const start = jsonStr.indexOf('[');
        if (start !== -1) {
            let depth = 0;
            let end = start;
            for (let i = start; i < jsonStr.length; i++) {
                if (jsonStr[i] === '[') depth++;
                else if (jsonStr[i] === ']') { depth--; if (depth === 0) { end = i; break; } }
            }
            jsonStr = jsonStr.substring(start, end + 1);
        }

        // Clean up common AI formatting issues
        jsonStr = jsonStr
            .replace(/\/\/[^\n]*/g, '')       // remove line comments
            .replace(/,\s*([}\]])/g, '$1')    // remove trailing commas
            .replace(/[\x00-\x1f]/g, ' ');    // remove control chars

        const tasks = JSON.parse(jsonStr);

        // Enrich with normalized category + emoji
        const enrichedTasks = tasks.map(t => {
            const normalizedCat = normalizeCategory(t.category, t.title);
            return {
                ...t,
                category: normalizedCat,
                iconEmoji: catEmojiMap[normalizedCat] || '📚',
            };
        });

        // Log usage AFTER successful parse
        try { await logUsage(req.user.id, 'parse-homework'); } catch (e) { console.error('[AI] Usage log error:', e); }

        res.json({ tasks: enrichedTasks });
    } catch (err) {
        console.error('[AI] Parse error:', err);
        let errorMsg = 'AI 解析失败，请重试或手动创建';
        if (err.status === 429 || err.message?.includes('429') || err.message?.includes('Too Many Requests') || err.message?.includes('quota')) {
            errorMsg = 'AI 请求频率超限或免费额度已用完，请稍后重试或升级 API 套餐';
        } else if (err.message?.includes('API key')) {
            errorMsg = 'API Key 无效，请在管理后台检查配置';
        }
        res.status(err.status === 429 ? 429 : 500).json({
            error: errorMsg,
            details: err.message
        });
    }
});

// ═══ Get user's own quota info ═══
router.get('/my-quota', async (req, res) => {
    try {
        const info = await checkQuota(req.user.id);
        res.json(info);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
