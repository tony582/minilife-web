// ═══════════════════════════════════════════════════
//  MiniLife — 守护精灵系统 (Spirit System)
// ═══════════════════════════════════════════════════

// ── 精灵进化形态 (5 stages) ──
export const SPIRIT_FORMS = [
    {
        id: 'egg',
        name: '蛋蛋期',
        emoji: '🥚',
        minLevel: 0,
        maxLevel: 0,
        desc: '一颗神秘的精灵蛋，温暖它就能孵化哦！',
        bg: 'from-amber-100 to-orange-200',
        color: '#F59E0B',
        glow: 'rgba(245,158,11,0.3)',
        interestBonus: 0,
        dailyBonus: 0,
        shopDiscount: 0,
        unlockText: '完成 3 天打卡即可孵化！',
    },
    {
        id: 'sprout',
        name: '幼芽期',
        emoji: '🌱',
        minLevel: 1,
        maxLevel: 5,
        desc: '刚破壳的小精灵，好奇地打量着世界',
        bg: 'from-green-300 to-emerald-400',
        color: '#10B981',
        glow: 'rgba(16,185,129,0.3)',
        interestBonus: 0,
        dailyBonus: 0,
        shopDiscount: 0,
        unlockText: '精灵在首页跟着你走~',
    },
    {
        id: 'young',
        name: '成长期',
        emoji: '🐣',
        minLevel: 6,
        maxLevel: 12,
        desc: '长出了小翅膀，学会了飞翔！',
        bg: 'from-blue-300 to-cyan-400',
        color: '#06B6D4',
        glow: 'rgba(6,182,212,0.3)',
        interestBonus: 1,
        dailyBonus: 1,
        shopDiscount: 0,
        unlockText: '精灵会说鼓励语',
    },
    {
        id: 'mature',
        name: '成熟期',
        emoji: '🦊',
        minLevel: 13,
        maxLevel: 20,
        desc: '拥有了完整的形态和独特力量！',
        bg: 'from-indigo-400 to-purple-500',
        color: '#8B5CF6',
        glow: 'rgba(139,92,246,0.35)',
        interestBonus: 2,
        dailyBonus: 2,
        shopDiscount: 5,
        unlockText: '精灵有动态表情',
    },
    {
        id: 'ultimate',
        name: '究极进化',
        emoji: '🐉',
        minLevel: 21,
        maxLevel: 30,
        desc: '传说中的终极形态，散发着耀眼光芒！',
        bg: 'from-rose-400 to-fuchsia-500',
        color: '#EC4899',
        glow: 'rgba(236,72,153,0.4)',
        interestBonus: 5,
        dailyBonus: 3,
        shopDiscount: 10,
        unlockText: '首页有专属光环特效',
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

// ── 精灵鼓励语（根据形态不同） ──
export const getSpiritMessage = (level) => {
    const form = getSpiritForm(level);
    const messages = {
        egg: ['快来孵化我吧！🥚', '我在蛋里等你哦~', '完成任务就能见到我啦！'],
        sprout: ['加油加油！🌱', '今天也要元气满满！', '你是最棒的小探险家！', '继续努力，我会长大的！'],
        young: ['我学会飞啦！🐣', '和我一起冒险吧！', '你今天完成了好多任务呢！', '太厉害了，继续保持！'],
        mature: ['有你真好！🦊', '我们是最强搭档！', '今天的你特别闪耀✨', '一起向星耀进发！'],
        ultimate: ['传说中的光芒！🐉', '你已经是真正的探险家了！', '整个星球都为你骄傲！', '你的坚持创造了奇迹！'],
    };
    const pool = messages[form.id] || messages.sprout;
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

// ── 宝箱定义 ──
export const CHEST_TYPES = [
    {
        id: 'bronze',
        name: '铜宝箱',
        emoji: '🟫',
        condition: '连续打卡 3 天',
        streakDays: 3,
        rewards: { minDust: 10, maxDust: 30, items: 1 },
        bg: 'from-amber-600 to-amber-800',
        glow: 'rgba(180,83,9,0.3)',
    },
    {
        id: 'silver',
        name: '银宝箱',
        emoji: '🟨',
        condition: '连续打卡 7 天',
        streakDays: 7,
        rewards: { minDust: 30, maxDust: 80, items: 2 },
        bg: 'from-slate-300 to-slate-500',
        glow: 'rgba(148,163,184,0.3)',
    },
    {
        id: 'gold',
        name: '金宝箱',
        emoji: '🟧',
        condition: '连续打卡 14 天',
        streakDays: 14,
        rewards: { minDust: 80, maxDust: 200, items: 3 },
        bg: 'from-yellow-400 to-amber-500',
        glow: 'rgba(245,158,11,0.4)',
    },
    {
        id: 'rainbow',
        name: '彩虹宝箱',
        emoji: '🌈',
        condition: '连续打卡 30 天',
        streakDays: 30,
        rewards: { minDust: 200, maxDust: 400, items: 4 },
        bg: 'from-rose-400 via-purple-400 to-cyan-400',
        glow: 'rgba(168,85,247,0.4)',
    },
];

// ── 利息计算 ──
export const calculateInterest = (balance, baseRate, level) => {
    const privileges = getSpiritPrivileges(level);
    const totalRate = baseRate + privileges.interestBonus;
    return Math.floor(balance * totalRate / 100);
};

// ── 赛季定义 ──
export const SEASONS = [
    { id: 'S1', name: '春日冒险季', planet: '🌸 樱花星', emoji: '🌸', months: [3, 4, 5], bg: 'from-pink-300 to-rose-400' },
    { id: 'S2', name: '夏日探索季', planet: '🌊 深海星', emoji: '🌊', months: [6, 7, 8], bg: 'from-cyan-300 to-blue-400' },
    { id: 'S3', name: '秋收成就季', planet: '🍂 枫叶星', emoji: '🍂', months: [9, 10, 11], bg: 'from-orange-300 to-amber-400' },
    { id: 'S4', name: '冬日挑战季', planet: '❄️ 冰雪星', emoji: '❄️', months: [12, 1, 2], bg: 'from-sky-200 to-indigo-300' },
];

export const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    return SEASONS.find(s => s.months.includes(month)) || SEASONS[0];
};
