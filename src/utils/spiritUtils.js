// ═══════════════════════════════════════════════════
//  MiniLife — 学习等级系统 (Level System)
// ═══════════════════════════════════════════════════

// ── 学习等级阶段 (Mini 品牌体系, 5 stages) ──
export const SPIRIT_FORMS = [
    {
        id: 'egg',
        name: 'Mini 萌新',
        emoji: '🐾',
        minLevel: 0,
        maxLevel: 0,
        desc: '欢迎加入 MiniLife，开始你的学习之旅！',
        bg: 'from-amber-100 to-orange-200',
        color: '#F59E0B',
        glow: 'rgba(245,158,11,0.3)',
        interestBonus: 0,
        dailyBonus: 0,
        shopDiscount: 0,
        unlockText: '刚刚加入，对一切都充满好奇。',
    },
    {
        id: 'sprout',
        name: 'Mini 探险家',
        emoji: '🌟',
        minLevel: 1,
        maxLevel: 5,
        desc: '踏上学习的旅程，每天都有新发现！',
        bg: 'from-green-300 to-emerald-400',
        color: '#10B981',
        glow: 'rgba(16,185,129,0.3)',
        interestBonus: 0,
        dailyBonus: 0,
        shopDiscount: 0,
        unlockText: '好奇心爆棚，什么都想探索！',
    },
    {
        id: 'young',
        name: 'Mini 学生',
        emoji: '💖',
        minLevel: 6,
        maxLevel: 12,
        desc: '养成了学习习惯，稳步前进中！',
        bg: 'from-blue-300 to-cyan-400',
        color: '#06B6D4',
        glow: 'rgba(6,182,212,0.3)',
        interestBonus: 1,
        dailyBonus: 1,
        shopDiscount: 0,
        unlockText: '行动力满分，每天坚持打卡！',
    },
    {
        id: 'mature',
        name: 'Mini 达人',
        emoji: '🏆',
        minLevel: 13,
        maxLevel: 20,
        desc: '学习能力显著提升，成为小伙伴的榜样！',
        bg: 'from-indigo-400 to-purple-500',
        color: '#8B5CF6',
        glow: 'rgba(139,92,246,0.35)',
        interestBonus: 2,
        dailyBonus: 2,
        shopDiscount: 5,
        unlockText: '持之以恒，已经是别人的学习榜样！',
    },
    {
        id: 'ultimate',
        name: 'Mini 学霸',
        emoji: '👑',
        minLevel: 21,
        maxLevel: 30,
        desc: '登顶学习之巅，掌握 MiniLife 最高荣誉！',
        bg: 'from-rose-400 to-fuchsia-500',
        color: '#EC4899',
        glow: 'rgba(236,72,153,0.4)',
        interestBonus: 5,
        dailyBonus: 3,
        shopDiscount: 10,
        unlockText: '传奇级别！解锁专属特效光环！',
    },
];

// 满星特殊状态 (Lv.30)
export const SPIRIT_MAX_STAR = {
    interestBonus: 8,
    dailyBonus: 5,
    shopDiscount: 15,
};

// ── 获取当前精灵形态 ──
export const getSpiritForm = (level) => {
    if (level <= 0) return SPIRIT_FORMS[0]; // egg
    for (let i = SPIRIT_FORMS.length - 1; i >= 0; i--) {
        if (level >= SPIRIT_FORMS[i].minLevel) return SPIRIT_FORMS[i];
    }
    return SPIRIT_FORMS[0];
};

// ── 是否满星 (Lv.30) ──
export const isSpiritMaxStar = (level) => level >= 30;

// ── 获取精灵特权数值 ──
export const getSpiritPrivileges = (level) => {
    if (isSpiritMaxStar(level)) {
        return {
            interestBonus: SPIRIT_MAX_STAR.interestBonus,
            dailyBonus: SPIRIT_MAX_STAR.dailyBonus,
            shopDiscount: SPIRIT_MAX_STAR.shopDiscount,
        };
    }
    const form = getSpiritForm(level);
    return {
        interestBonus: form.interestBonus,
        dailyBonus: form.dailyBonus,
        shopDiscount: form.shopDiscount,
    };
};

// ── 精灵鼓励语（根据形态 + 时间 + 状态） ──
export const getSpiritMessage = (level, context = {}) => {
    const form = getSpiritForm(level);
    const hour = new Date().getHours();
    const { spiritName, recentTaskCount = 0, streakDays = 0 } = context;
    const name = spiritName || '';

    // Time-based greetings
    const timeGreetings = hour < 7
        ? ['早安～还在被窝里吗？☀️', '新的一天开始啦！', `${name ? name + '也' : ''}起床啦～打起精神！`]
        : hour < 12
        ? ['上午好！今天也要加油哦！🌸', '阳光真好，适合学习！', '早上的时间最宝贵，冲鸭！']
        : hour < 14
        ? ['午安～吃饱了吗？😋', '休息一下再出发！', '中午记得补充能量哦～']
        : hour < 18
        ? ['下午好！继续加油！💪', '离完成今天的目标不远了！', '专注一会儿，你可以的！']
        : hour < 21
        ? ['晚上好～辛苦了一天！🌙', '快完成今天的任务吧！', '今天也很努力呢，真棒！']
        : ['晚安～明天见！✨', '该休息啦，好好睡觉！', '梦里也要一起冒险哦～💤'];

    // Status-based messages (based on context)
    const statusMsgs = [];
    if (recentTaskCount >= 3) {
        statusMsgs.push('今天好勤奋！已经做完了好几个任务！🔥', '太厉害了，今天的你特别闪耀！✨');
    }
    if (streakDays >= 7) {
        statusMsgs.push(`已经连续打卡 ${streakDays} 天了，坚持就是力量！💪`);
    }
    if (streakDays >= 30) {
        statusMsgs.push('一个月了！你的毅力让我骄傲！🏆');
    }

    // Form-specific personality messages  
    const personalityMsgs = {
        egg: ['快来孵化我吧！🥚', '我在蛋里等你哦~', '完成任务就能见到我啦！', '蛋壳里好温暖，但我想见你！'],
        sprout: ['加油加油！🌱', '今天也要元气满满！', '你是最棒的小探险家！', '和你在一起好开心！', name ? `${name}最喜欢和你一起学习！` : '继续努力，我会长大的！', '今天想优雅地靠在你身边 🌿'],
        young: ['和你在一起的每一天都很开心 🐣', '想和你一起冒险！', '你今天完成了好多任务呢！', '我又长大了一点，谢谢你！', '太棒了，继续保持！'],
        mature: ['有你真好！🦊', '我们是最强搭档！', '今天的你特别闪耀 ✨', '一起向星耀进发！', '想要一直陪在你身边～', '你今天好努力呢，我很开心！'],
        ultimate: ['传说中的光芒！🐉', '你已经是真正的探险家了！', '整个星球都为你骄傲！', '你的坚持创造了奇迹！', '我们一起走过了这么远的路… 🌟', '能成为你的伙伴，是我的荣幸 👑'],
    };

    // Build pool with weighted selection
    const pool = [
        ...timeGreetings,
        ...(personalityMsgs[form.id] || personalityMsgs.sprout),
        ...statusMsgs,
    ];

    return pool[Math.floor(Math.random() * pool.length)];
};

// ── 精灵大表情（用于进化庆祝） ──
export const SPIRIT_EVOLUTION_EMOJIS = {
    egg: '🥚',        // 还没孵化
    sprout: '🌱✨',    // 第一次孵化
    young: '🐣🎉',    // 长出翅膀
    mature: '🦊🌟',   // 完整形态
    ultimate: '🐉👑',  // 终极进化
};

// ── 毕业+孵化系统 ──
export const MAX_SPIRIT_LEVEL = 30;

/**
 * 检查精灵是否可以毕业
 */
export const canSpiritGraduate = (level) => level >= MAX_SPIRIT_LEVEL;

/**
 * 精灵毕业时生成毕业记录
 * @param {Object} kid - 当前孩子数据
 * @returns {Object} - { graduatedSpirit, updatedKid }
 */
export const graduateSpirit = (kid) => {
    const generation = (kid.spirit_generation || 1);
    const existingGraduated = kid.graduated_spirits || [];

    // 记录当前精灵为已毕业
    const graduatedSpirit = {
        generation,
        level: kid.level,
        graduatedAt: new Date().toISOString(),
        emoji: '🐉',
        name: `第${generation}只精灵`,
    };

    return {
        graduatedSpirit,
        // 返回需要更新到 kid 的字段
        kidUpdates: {
            level: 1,
            exp: 0,
            spirit_generation: generation + 1,
            graduated_spirits: [...existingGraduated, graduatedSpirit],
        },
    };
};

/**
 * 获取已毕业精灵列表
 */
export const getGraduatedSpirits = (kid) => kid.graduated_spirits || [];

// ── 宝箱定义（累积打卡制） ──
export const CHEST_TYPES = [
    {
        id: 'bronze',
        name: '铜宝箱',
        emoji: '🟫',
        image: '/assets/chests/bronze.png',
        condition: '累计打卡 3 天',
        streakDays: 3,
        rewards: { minDust: 10, maxDust: 30 },
        bg: 'from-amber-600 to-amber-800',
        color: '#B45309',
        glow: 'rgba(180,83,9,0.3)',
    },
    {
        id: 'silver',
        name: '银宝箱',
        emoji: '⬜',
        image: '/assets/chests/silver.png',
        condition: '累计打卡 7 天',
        streakDays: 7,
        rewards: { minDust: 30, maxDust: 80 },
        bg: 'from-slate-300 to-slate-500',
        color: '#64748B',
        glow: 'rgba(148,163,184,0.3)',
    },
    {
        id: 'gold',
        name: '金宝箱',
        emoji: '🟨',
        image: '/assets/chests/gold.png',
        condition: '累计打卡 14 天',
        streakDays: 14,
        rewards: { minDust: 80, maxDust: 200 },
        bg: 'from-yellow-400 to-amber-500',
        color: '#D97706',
        glow: 'rgba(245,158,11,0.4)',
    },
    {
        id: 'rainbow',
        name: '彩虹宝箱',
        emoji: '🌈',
        image: '/assets/chests/rainbow.png',
        condition: '累计打卡 30 天',
        streakDays: 30,
        rewards: { minDust: 200, maxDust: 500 },
        bg: 'from-rose-400 via-purple-400 to-cyan-400',
        color: '#A855F7',
        glow: 'rgba(168,85,247,0.4)',
    },
];

// ── 根据累积天数获取可领取的宝箱 ──
export const getChestForStreak = (streakDays) => {
    // 返回当前刚好触发的宝箱（如果恰好到达门槛）
    return CHEST_TYPES.find(c => c.streakDays === streakDays) || null;
};

// ── 获取下一个宝箱目标 ──
export const getNextChest = (streakDays) => {
    return CHEST_TYPES.find(c => c.streakDays > streakDays) || null;
};

// ── 获取所有已解锁宝箱 ──
export const getUnlockedChests = (streakDays) => {
    return CHEST_TYPES.filter(c => c.streakDays <= streakDays);
};

// ── 计算宝箱奖励（只给星尘/经验） ──
export const calculateChestReward = (chest) => {
    const { minDust, maxDust } = chest.rewards;
    const dust = Math.floor(Math.random() * (maxDust - minDust + 1)) + minDust;
    return { dust };
};

// ── 利息计算 ──
export const calculateInterest = (balance, baseRate, level) => {
    const privileges = getSpiritPrivileges(level);
    const totalRate = baseRate + privileges.interestBonus;
    return Math.floor(balance * totalRate / 100);
};

// ── 学期/时段定义 ──
// 默认学期（如果家长没有自定义）
const DEFAULT_TERMS = [
    { name: '春季学期', emoji: '🌸', startMonth: 2, startDay: 20, endMonth: 6, endDay: 30, color: '#EC4899' },
    { name: '暑假', emoji: '🌊', startMonth: 7, startDay: 1, endMonth: 8, endDay: 31, color: '#06B6D4' },
    { name: '秋季学期', emoji: '🍂', startMonth: 9, startDay: 1, endMonth: 1, endDay: 20, color: '#F59E0B' },
    { name: '寒假', emoji: '❄️', startMonth: 1, startDay: 21, endMonth: 2, endDay: 19, color: '#6366F1' },
];

/**
 * 获取当前学期/时段
 * @param {Object} parentSettings - 家长设置（可选）
 * @returns {{ name, emoji, color, startDate, endDate, progress, daysLeft, totalDays }}
 */
export const getCurrentTerm = (parentSettings) => {
    const now = new Date();

    // 优先使用家长自定义学期
    if (parentSettings?.currentTerm?.name) {
        const term = parentSettings.currentTerm;
        const start = new Date(term.startDate);
        const end = new Date(term.endDate);
        const total = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));
        const elapsed = Math.max(0, (now - start) / (1000 * 60 * 60 * 24));
        const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
        const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

        return {
            name: term.name,
            emoji: term.emoji || '📚',
            color: term.color || '#4ECDC4',
            startDate: start,
            endDate: end,
            progress,
            daysLeft,
            totalDays: Math.ceil(total),
        };
    }

    // 默认：根据当前月份自动匹配学期
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const matchTerm = DEFAULT_TERMS.find(t => {
        if (t.startMonth <= t.endMonth) {
            // 不跨年
            return (month > t.startMonth || (month === t.startMonth && day >= t.startDay)) &&
                   (month < t.endMonth || (month === t.endMonth && day <= t.endDay));
        } else {
            // 跨年（如秋季学期 9月→次年1月）
            return (month > t.startMonth || (month === t.startMonth && day >= t.startDay)) ||
                   (month < t.endMonth || (month === t.endMonth && day <= t.endDay));
        }
    }) || DEFAULT_TERMS[0];

    const year = now.getFullYear();
    let startDate, endDate;

    if (matchTerm.startMonth <= matchTerm.endMonth) {
        startDate = new Date(year, matchTerm.startMonth - 1, matchTerm.startDay);
        endDate = new Date(year, matchTerm.endMonth - 1, matchTerm.endDay);
    } else {
        // 跨年
        if (month >= matchTerm.startMonth) {
            startDate = new Date(year, matchTerm.startMonth - 1, matchTerm.startDay);
            endDate = new Date(year + 1, matchTerm.endMonth - 1, matchTerm.endDay);
        } else {
            startDate = new Date(year - 1, matchTerm.startMonth - 1, matchTerm.startDay);
            endDate = new Date(year, matchTerm.endMonth - 1, matchTerm.endDay);
        }
    }

    const total = Math.max(1, (endDate - startDate) / (1000 * 60 * 60 * 24));
    const elapsed = Math.max(0, (now - startDate) / (1000 * 60 * 60 * 24));
    const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
    const daysLeft = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));

    return {
        name: matchTerm.name,
        emoji: matchTerm.emoji,
        color: matchTerm.color,
        startDate,
        endDate,
        progress,
        daysLeft,
        totalDays: Math.ceil(total),
    };
};

// Legacy alias for backward compatibility
export const getCurrentSeason = getCurrentTerm;
