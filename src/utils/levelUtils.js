export const getLevelTier = (level) => {
    if (level < 10) return { title: '新手村学徒', emoji: '🌱', bg: 'from-green-400 to-emerald-500', color: 'text-emerald-500' };
    if (level < 20) return { title: '探索达人', emoji: '🧭', bg: 'from-blue-400 to-cyan-500', color: 'text-blue-500' };
    if (level < 30) return { title: '进阶骑士', emoji: '⚔️', bg: 'from-indigo-400 to-purple-500', color: 'text-indigo-500' };
    if (level < 40) return { title: '白银守卫', emoji: '🛡️', bg: 'from-slate-300 to-slate-500', color: 'text-slate-600' };
    if (level < 50) return { title: '黄金领主', emoji: '👑', bg: 'from-yellow-400 to-amber-500', color: 'text-amber-500' };
    return { title: '传说星耀', emoji: '🌟', bg: 'from-rose-400 to-fuchsia-600', color: 'text-rose-500' };
};

export const getLevelReq = (level) => level * 100;
