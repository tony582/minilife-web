/**
 * MiniLife 成就勋章系统
 * —— 学习 Apple Fitness 分类: 学习 / 习惯 / 理财 / 成长 / 收集 / 纪录
 */

// ── Category badge images (AI-generated) ──
export const BADGE_CATEGORY_IMAGES = {
    '📚 学习': '/assets/badges/learning.png',
    '🎯 习惯': '/assets/badges/habit.png',
    '💰 理财': '/assets/badges/finance.png',
    '⭐ 成长': '/assets/badges/growth.png',
    '🎁 收集': '/assets/badges/collection.png',
    '📊 纪录': '/assets/badges/record.png',
};
// ── Helper: count transactions by category ──
const countTx = (kid, tx, category) =>
    tx.filter(t => t.kidId === kid.id && t.type === 'income' && t.category === category).length;

const totalIncome = (kid, tx) =>
    tx.filter(t => t.kidId === kid.id && t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);

const totalExpense = (kid, tx) =>
    tx.filter(t => t.kidId === kid.id && t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount || 0), 0);

// ── ACHIEVEMENTS (40 medals) ──
export const ACHIEVEMENTS = [
    // ====== 📚 学习 (6) ======
    { id: 'task_first', emoji: '🔥', title: '初出茅庐', desc: '完成第一个任务', category: '📚 学习',
        bg: 'from-amber-200 to-orange-400',
        check: (kid, tx) => countTx(kid, tx, 'task') > 0 },
    { id: 'task_10', emoji: '📖', title: '勤奋学子', desc: '累计完成10个任务', category: '📚 学习',
        bg: 'from-blue-200 to-indigo-400',
        check: (kid, tx) => countTx(kid, tx, 'task') >= 10 },
    { id: 'task_50', emoji: '🎓', title: '学霸养成', desc: '累计完成50个任务', category: '📚 学习',
        bg: 'from-cyan-200 to-blue-500',
        check: (kid, tx) => countTx(kid, tx, 'task') >= 50 },
    { id: 'task_100', emoji: '🏅', title: '百战百胜', desc: '累计完成100个任务', category: '📚 学习',
        bg: 'from-yellow-200 to-amber-500',
        check: (kid, tx) => countTx(kid, tx, 'task') >= 100 },
    { id: 'task_200', emoji: '💯', title: '学无止境', desc: '累计完成200个任务', category: '📚 学习',
        bg: 'from-emerald-200 to-teal-500',
        check: (kid, tx) => countTx(kid, tx, 'task') >= 200 },
    { id: 'task_500', emoji: '🧠', title: '千锤百炼', desc: '累计完成500个任务', category: '📚 学习',
        bg: 'from-rose-200 to-pink-500',
        check: (kid, tx) => countTx(kid, tx, 'task') >= 500 },

    // ====== 🎯 习惯 (7) ======
    { id: 'habit_first', emoji: '⚡', title: '习惯新星', desc: '第一次习惯打卡', category: '🎯 习惯',
        bg: 'from-indigo-200 to-purple-400',
        check: (kid, tx) => countTx(kid, tx, 'habit') > 0 },
    { id: 'habit_7', emoji: '💪', title: '毅力之火', desc: '习惯打卡累计7次', category: '🎯 习惯',
        bg: 'from-violet-300 to-purple-500',
        check: (kid, tx) => countTx(kid, tx, 'habit') >= 7 },
    { id: 'habit_30', emoji: '🌟', title: '钢铁意志', desc: '习惯打卡累计30次', category: '🎯 习惯',
        bg: 'from-fuchsia-200 to-pink-500',
        check: (kid, tx) => countTx(kid, tx, 'habit') >= 30 },
    { id: 'habit_100', emoji: '🏆', title: '习惯大师', desc: '习惯打卡累计100次', category: '🎯 习惯',
        bg: 'from-amber-300 to-orange-500',
        check: (kid, tx) => countTx(kid, tx, 'habit') >= 100 },
    { id: 'habit_200', emoji: '🔱', title: '毅力传说', desc: '习惯打卡累计200次', category: '🎯 习惯',
        bg: 'from-sky-300 to-blue-600',
        check: (kid, tx) => countTx(kid, tx, 'habit') >= 200 },
    { id: 'habit_365', emoji: '🌈', title: '打卡一整年', desc: '习惯打卡累计365次', category: '🎯 习惯',
        bg: 'from-pink-300 via-purple-300 to-cyan-300',
        check: (kid, tx) => countTx(kid, tx, 'habit') >= 365 },
    { id: 'full_week', emoji: '📅', title: '全勤王', desc: '一周内每天都有完成记录', category: '🎯 习惯',
        bg: 'from-lime-200 to-emerald-400',
        check: (kid, tx) => {
            // Check if any 7 consecutive days all have at least 1 income tx
            const dates = [...new Set(tx.filter(t => t.kidId === kid.id && t.type === 'income')
                .map(t => new Date(t.date).toISOString().slice(0, 10)))].sort();
            for (let i = 6; i < dates.length; i++) {
                const end = new Date(dates[i]);
                const start = new Date(end);
                start.setDate(start.getDate() - 6);
                const daysInRange = dates.filter(d => d >= start.toISOString().slice(0, 10) && d <= dates[i]).length;
                if (daysInRange >= 7) return true;
            }
            return false;
        } },

    // ====== 💰 理财 (8) ======
    { id: 'earn_100', emoji: '⭐', title: '小小储蓄', desc: '累计获得100家庭币', category: '💰 理财',
        bg: 'from-emerald-200 to-teal-400',
        check: (kid, tx) => totalIncome(kid, tx) >= 100 },
    { id: 'earn_500', emoji: '💰', title: '小富翁', desc: '累计获得500家庭币', category: '💰 理财',
        bg: 'from-teal-200 to-cyan-400',
        check: (kid, tx) => totalIncome(kid, tx) >= 500 },
    { id: 'earn_1000', emoji: '💎', title: '千金王', desc: '累计获得1000家庭币', category: '💰 理财',
        bg: 'from-teal-300 to-emerald-500',
        check: (kid, tx) => totalIncome(kid, tx) >= 1000 },
    { id: 'earn_5000', emoji: '🏦', title: '理财达人', desc: '累计获得5000家庭币', category: '💰 理财',
        bg: 'from-sky-200 to-indigo-400',
        check: (kid, tx) => totalIncome(kid, tx) >= 5000 },
    { id: 'earn_10000', emoji: '👑', title: '家庭币大亨', desc: '累计获得10000家庭币', category: '💰 理财',
        bg: 'from-yellow-300 to-amber-500',
        check: (kid, tx) => totalIncome(kid, tx) >= 10000 },
    { id: 'balance_100', emoji: '🐷', title: '小猪存钱罐', desc: '余额首次超过100', category: '💰 理财',
        bg: 'from-pink-200 to-rose-400',
        check: (kid) => kid.balance >= 100 },
    { id: 'balance_500', emoji: '🏧', title: '稳健理财', desc: '余额首次超过500', category: '💰 理财',
        bg: 'from-amber-200 to-yellow-500',
        check: (kid) => kid.balance >= 500 },
    { id: 'first_spend', emoji: '🛍️', title: '精明消费', desc: '在家庭超市完成首次消费', category: '💰 理财',
        bg: 'from-orange-200 to-red-400',
        check: (kid, tx) => totalExpense(kid, tx) > 0 },

    // ====== ⭐ 成长 (7) ======
    { id: 'level_3', emoji: '🌱', title: '破壳而出', desc: '等级达到3级', category: '⭐ 成长',
        bg: 'from-lime-200 to-green-400',
        check: (kid) => kid.level >= 3 },
    { id: 'level_5', emoji: '🌿', title: '成长之芽', desc: '等级达到5级', category: '⭐ 成长',
        bg: 'from-green-200 to-emerald-400',
        check: (kid) => kid.level >= 5 },
    { id: 'level_10', emoji: '🌳', title: '参天大树', desc: '等级达到10级', category: '⭐ 成长',
        bg: 'from-green-300 to-emerald-500',
        check: (kid) => kid.level >= 10 },
    { id: 'level_15', emoji: '🦊', title: '精灵觉醒', desc: '等级达到15级', category: '⭐ 成长',
        bg: 'from-orange-200 to-amber-500',
        check: (kid) => kid.level >= 15 },
    { id: 'level_20', emoji: '🐉', title: '究极进化', desc: '等级达到20级', category: '⭐ 成长',
        bg: 'from-indigo-300 to-purple-600',
        check: (kid) => kid.level >= 20 },
    { id: 'level_25', emoji: '🔮', title: '传说之路', desc: '等级达到25级', category: '⭐ 成长',
        bg: 'from-violet-300 to-purple-600',
        check: (kid) => kid.level >= 25 },
    { id: 'level_30', emoji: '✨', title: '满星传说', desc: '等级达到30级（满星！）', category: '⭐ 成长',
        bg: 'from-yellow-300 via-amber-400 to-orange-500',
        check: (kid) => kid.level >= 30 },

    // ====== 🎁 收集 (7) ======
    { id: 'chest_bronze', emoji: '🟫', title: '铜箱猎人', desc: '首次开启铜宝箱', category: '🎁 收集',
        bg: 'from-amber-300 to-amber-600',
        check: (kid) => (kid.streak_days || 0) >= 3 },
    { id: 'chest_silver', emoji: '⬜', title: '银箱猎人', desc: '首次开启银宝箱', category: '🎁 收集',
        bg: 'from-slate-200 to-slate-500',
        check: (kid) => (kid.streak_days || 0) >= 7 },
    { id: 'chest_gold', emoji: '🟨', title: '金箱猎人', desc: '首次开启金宝箱', category: '🎁 收集',
        bg: 'from-yellow-300 to-amber-500',
        check: (kid) => (kid.streak_days || 0) >= 14 },
    { id: 'chest_rainbow', emoji: '🌈', title: '彩虹猎人', desc: '首次开启彩虹宝箱', category: '🎁 收集',
        bg: 'from-pink-300 via-purple-300 to-cyan-300',
        check: (kid) => (kid.streak_days || 0) >= 30 },
    { id: 'all_chest', emoji: '🗝️', title: '寻宝大师', desc: '集齐全部4种宝箱', category: '🎁 收集',
        bg: 'from-amber-200 via-yellow-300 to-teal-400',
        check: (kid) => (kid.streak_days || 0) >= 30 },
    { id: 'spirit_evolve_1', emoji: '🐣', title: '首次进化', desc: '精灵完成首次进化', category: '🎁 收集',
        bg: 'from-rose-200 to-pink-400',
        check: (kid) => kid.level >= 6 },
    { id: 'spirit_evolve_3', emoji: '🐲', title: '进化达人', desc: '精灵完成3次进化', category: '🎁 收集',
        bg: 'from-indigo-300 to-violet-500',
        check: (kid) => kid.level >= 21 },

    // ====== 📊 纪录 (5) ======
    { id: 'daily_star_10', emoji: '⚡', title: '日进斗金', desc: '单日获得10+星尘', category: '📊 纪录',
        bg: 'from-yellow-200 to-orange-400',
        check: (kid, tx) => {
            const byDay = {};
            tx.filter(t => t.kidId === kid.id && t.type === 'income' && (t.category === 'task' || t.category === 'habit'))
              .forEach(t => {
                  const d = new Date(t.date).toISOString().slice(0, 10);
                  byDay[d] = (byDay[d] || 0) + (t.stardust || t.amount || 0);
              });
            return Object.values(byDay).some(v => v >= 10);
        } },
    { id: 'daily_star_20', emoji: '🔥', title: '单日最强', desc: '单日获得20+星尘', category: '📊 纪录',
        bg: 'from-orange-300 to-red-500',
        check: (kid, tx) => {
            const byDay = {};
            tx.filter(t => t.kidId === kid.id && t.type === 'income' && (t.category === 'task' || t.category === 'habit'))
              .forEach(t => {
                  const d = new Date(t.date).toISOString().slice(0, 10);
                  byDay[d] = (byDay[d] || 0) + (t.stardust || t.amount || 0);
              });
            return Object.values(byDay).some(v => v >= 20);
        } },
    { id: 'weekly_100', emoji: '🏆', title: '周冠军', desc: '一周内获得100+家庭币', category: '📊 纪录',
        bg: 'from-sky-300 to-blue-500',
        check: (kid, tx) => {
            const now = new Date();
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            const weekIncome = tx.filter(t => t.kidId === kid.id && t.type === 'income' && new Date(t.date) >= weekAgo)
                .reduce((s, t) => s + (t.amount || 0), 0);
            return weekIncome >= 100;
        } },
    { id: 'total_tasks_habits', emoji: '🎯', title: '双管齐下', desc: '同时完成过学习任务和习惯打卡', category: '📊 纪录',
        bg: 'from-teal-200 to-emerald-500',
        check: (kid, tx) => countTx(kid, tx, 'task') > 0 && countTx(kid, tx, 'habit') > 0 },
    { id: 'streak_days_10', emoji: '📆', title: '十天坚持', desc: '累计打卡天数达到10天', category: '📊 纪录',
        bg: 'from-purple-200 to-indigo-500',
        check: (kid) => (kid.streak_days || 0) >= 10 },
];
