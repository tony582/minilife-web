export const defaultCategories = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '道德与法治', '信息技术', '体育运动', '娱乐', '兴趣班', '其他'];

export const getCategoryColor = (cat) => {
    const colors = {
        '语文': 'bg-rose-50 text-rose-600 border-rose-200',
        '数学': 'bg-indigo-50 text-indigo-600 border-indigo-200',
        '英语': 'bg-sky-50 text-sky-600 border-sky-200',
        '物理': 'bg-amber-50 text-amber-600 border-amber-200',
        '化学': 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200',
        '生物': 'bg-emerald-50 text-emerald-600 border-emerald-200',
        '历史': 'bg-stone-50 text-stone-600 border-stone-200',
        '地理': 'bg-teal-50 text-teal-600 border-teal-200',
        '政治': 'bg-red-50 text-red-600 border-red-200',
        '道德与法治': 'bg-blue-50 text-blue-600 border-blue-200',
        '信息技术': 'bg-cyan-50 text-cyan-600 border-cyan-200',
        '体育运动': 'bg-orange-50 text-orange-600 border-orange-200',
        '娱乐': 'bg-yellow-50 text-yellow-600 border-yellow-200',
        '兴趣班': 'bg-pink-50 text-pink-600 border-pink-200',
        '其他': 'bg-slate-50 text-slate-600 border-slate-200'
    };
    if (colors[cat]) return colors[cat];
    let hash = 0;
    for (let i = 0; i < (cat || '').length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
    const dynamicColors = ['bg-rose-50 text-rose-600 border-rose-200', 'bg-lime-50 text-lime-600 border-lime-200', 'bg-teal-50 text-teal-600 border-teal-200', 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200', 'bg-sky-50 text-sky-600 border-sky-200'];
    return dynamicColors[Math.abs(hash) % dynamicColors.length];
};

export const getCategoryGradient = (cat) => {
    const gradients = {
        '语文': 'from-rose-500 to-rose-600',
        '数学': 'from-indigo-500 to-indigo-600',
        '英语': 'from-sky-500 to-sky-600',
        '物理': 'from-amber-500 to-amber-600',
        '化学': 'from-fuchsia-500 to-fuchsia-600',
        '生物': 'from-emerald-500 to-emerald-600',
        '历史': 'from-stone-500 to-stone-600',
        '地理': 'from-teal-500 to-teal-600',
        '政治': 'from-red-500 to-red-600',
        '道德与法治': 'from-blue-500 to-blue-600',
        '信息技术': 'from-cyan-500 to-cyan-600',
        '体育运动': 'from-orange-500 to-orange-600',
        '娱乐': 'from-yellow-500 to-yellow-600',
        '兴趣班': 'from-pink-500 to-pink-600',
        '其他': 'from-slate-500 to-slate-600'
    };
    if (gradients[cat]) return gradients[cat];
    let hash = 0; for (let i = 0; i < (cat || '').length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
    const dynamicGradients = ['from-rose-500 to-rose-600', 'from-lime-500 to-lime-600', 'from-teal-500 to-teal-600', 'from-fuchsia-500 to-fuchsia-600', 'from-sky-500 to-sky-600'];
    return dynamicGradients[Math.abs(hash) % dynamicGradients.length];
};

export const getIconForCategory = (cat) => {
    const iconMap = {
        '语文': 'BookOpen', '数学': 'Calculator', '英语': 'MessageCircle',
        '物理': 'Zap', '化学': 'FlaskConical', '生物': 'Leaf',
        '历史': 'Hourglass', '地理': 'Globe', '政治': 'Landmark',
        '道德与法治': 'Scale', '信息技术': 'Monitor', '体育运动': 'Dumbbell',
        '娱乐': 'Gamepad2', '兴趣班': 'Palette'
    };
    return iconMap[cat] || 'Star';
};
