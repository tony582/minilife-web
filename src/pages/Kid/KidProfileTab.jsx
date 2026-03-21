import React, { useMemo, useState } from 'react';
import { useDataContext } from '../../context/DataContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons, AvatarDisplay } from '../../utils/Icons';
import { getLevelReq, getLevelTier } from '../../utils/levelUtils';

// Shared warm Headspace palette
const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
    orange: '#FF8C42', orangeHot: '#FF6B1A', yellow: '#FFD93D', teal: '#4ECDC4',
    coral: '#FF6B6B', green: '#10B981', red: '#EF4444', purple: '#8B5CF6',
    textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
    cardShadow: '0 4px 24px rgba(27,46,75,0.06)',
};

// ── All level tiers for the rules page ──
const LEVEL_TIERS = [
    { minLevel: 1,  maxLevel: 9,  title: '新手村学徒', emoji: '🌱', bg: 'from-green-400 to-emerald-500', color: '#10B981', desc: '刚踏入成长旅程，每一步都是进步' },
    { minLevel: 10, maxLevel: 19, title: '探索达人',   emoji: '🧭', bg: 'from-blue-400 to-cyan-500',    color: '#3B82F6', desc: '好奇探索世界的小冒险家' },
    { minLevel: 20, maxLevel: 29, title: '进阶骑士',   emoji: '⚔️', bg: 'from-indigo-400 to-purple-500', color: '#6366F1', desc: '勇敢面对挑战的小骑士' },
    { minLevel: 30, maxLevel: 39, title: '白银守卫',   emoji: '🛡️', bg: 'from-slate-300 to-slate-500',   color: '#64748B', desc: '守护好习惯的坚定卫士' },
    { minLevel: 40, maxLevel: 49, title: '黄金领主',   emoji: '👑', bg: 'from-yellow-400 to-amber-500',  color: '#F59E0B', desc: '习惯和学业的金牌管理者' },
    { minLevel: 50, maxLevel: '∞', title: '传说星耀',  emoji: '🌟', bg: 'from-rose-400 to-fuchsia-600',  color: '#F43F5E', desc: '传说中的全能之星，闪耀不息' },
];

// ── Expanded achievement definitions ──
const ACHIEVEMENTS = [
    { id: 'first_task', emoji: '🔥', title: '初出茅庐', desc: '完成第一个任务', category: '学习', bg: 'from-amber-200 to-orange-400',
        check: (kid, tx) => tx.filter(t => t.kidId === kid.id && t.type === 'income' && t.category === 'task').length > 0 },
    { id: 'task_10', emoji: '📚', title: '勤奋学子', desc: '累计完成10个任务', category: '学习', bg: 'from-blue-200 to-indigo-400',
        check: (kid, tx) => tx.filter(t => t.kidId === kid.id && t.type === 'income' && t.category === 'task').length >= 10 },
    { id: 'task_50', emoji: '🎓', title: '学霸养成', desc: '累计完成50个任务', category: '学习', bg: 'from-cyan-200 to-blue-500',
        check: (kid, tx) => tx.filter(t => t.kidId === kid.id && t.type === 'income' && t.category === 'task').length >= 50 },
    { id: 'task_100', emoji: '🏅', title: '百战百胜', desc: '累计完成100个任务', category: '学习', bg: 'from-yellow-200 to-amber-500',
        check: (kid, tx) => tx.filter(t => t.kidId === kid.id && t.type === 'income' && t.category === 'task').length >= 100 },
    { id: 'habit_first', emoji: '⚡', title: '习惯新星', desc: '第一次习惯打卡', category: '习惯', bg: 'from-indigo-200 to-purple-400',
        check: (kid, tx) => tx.filter(t => t.kidId === kid.id && t.type === 'income' && t.category === 'habit').length > 0 },
    { id: 'streak_7', emoji: '💪', title: '毅力之火', desc: '习惯打卡累计7次', category: '习惯', bg: 'from-violet-300 to-purple-500',
        check: (kid, tx) => tx.filter(t => t.kidId === kid.id && t.type === 'income' && t.category === 'habit').length >= 7 },
    { id: 'streak_30', emoji: '🌟', title: '钢铁意志', desc: '习惯打卡累计30次', category: '习惯', bg: 'from-fuchsia-200 to-pink-500',
        check: (kid, tx) => tx.filter(t => t.kidId === kid.id && t.type === 'income' && t.category === 'habit').length >= 30 },
    { id: 'streak_100', emoji: '🏆', title: '习惯大师', desc: '习惯打卡累计100次', category: '习惯', bg: 'from-amber-300 to-orange-500',
        check: (kid, tx) => tx.filter(t => t.kidId === kid.id && t.type === 'income' && t.category === 'habit').length >= 100 },
    { id: 'rich_100', emoji: '⭐', title: '小小理财', desc: '累计获得100积分', category: '财富', bg: 'from-emerald-200 to-teal-400',
        check: (kid, tx) => tx.filter(t => t.kidId === kid.id && t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0) >= 100 },
    { id: 'rich_1000', emoji: '💎', title: '财富新星', desc: '累计获得1000积分', category: '财富', bg: 'from-teal-300 to-emerald-500',
        check: (kid, tx) => tx.filter(t => t.kidId === kid.id && t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0) >= 1000 },
    { id: 'rich_10000', emoji: '👑', title: '积分大亨', desc: '累计获得10000积分', category: '财富', bg: 'from-yellow-300 to-amber-500',
        check: (kid, tx) => tx.filter(t => t.kidId === kid.id && t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0) >= 10000 },
    { id: 'shopper_first', emoji: '🛍️', title: '消费达人', desc: '完成第一次兑换', category: '超市', bg: 'from-rose-200 to-pink-400',
        check: (kid, tx) => tx.filter(t => t.kidId === kid.id && (t.category === 'shop' || t.category === 'purchase')).length > 0 },
    { id: 'shopper_5', emoji: '🎁', title: '购物狂人', desc: '累计兑换5次', category: '超市', bg: 'from-pink-300 to-rose-500',
        check: (kid, tx) => tx.filter(t => t.kidId === kid.id && (t.category === 'shop' || t.category === 'purchase')).length >= 5 },
    { id: 'level5', emoji: '🌱', title: '成长之芽', desc: '等级达到5级', category: '等级', bg: 'from-lime-200 to-green-400',
        check: (kid) => kid.level >= 5 },
    { id: 'level10', emoji: '🌳', title: '参天大树', desc: '等级达到10级', category: '等级', bg: 'from-green-300 to-emerald-500',
        check: (kid) => kid.level >= 10 },
    { id: 'level50', emoji: '🚀', title: '火箭少年', desc: '等级达到50级', category: '等级', bg: 'from-sky-200 to-blue-500',
        check: (kid) => kid.level >= 50 },
];

export const KidProfileTab = () => {
    const { kids, activeKidId, tasks, transactions } = useDataContext();
    const {
        setShowAvatarPickerModal,
        setShowTransactionHistoryModal,
        setTransactionHistoryKidId,
    } = useUIContext();

    const [selectedBadge, setSelectedBadge] = useState(null);
    const [showAllBadges, setShowAllBadges] = useState(false);
    const [showLevelRulesModal, setShowLevelRulesModal] = useState(false);

    const activeKid = kids.find(k => k.id === activeKidId);
    if (!activeKid) return null;

    const nextLevelExp = getLevelReq(activeKid.level);
    const tier = getLevelTier(activeKid.level);
    const expPercent = Math.max(0, Math.min(100, (activeKid.exp / nextLevelExp) * 100));

    // Achievement status
    const achievementStatus = useMemo(() => {
        return ACHIEVEMENTS.map(a => ({ ...a, unlocked: a.check(activeKid, transactions) }));
    }, [activeKid, transactions]);
    const unlockedCount = achievementStatus.filter(a => a.unlocked).length;
    const visibleBadges = showAllBadges ? achievementStatus : achievementStatus.slice(0, 6);

    const openTransactionHistory = () => {
        setTransactionHistoryKidId(activeKidId);
        setShowTransactionHistoryModal(true);
    };

    return (
        <div className="animate-fade-in pb-10 pt-2 max-w-4xl mx-auto">

            {/* ═══════════════════════════════════════════
                1. HERO — Dark profile card
            ═══════════════════════════════════════════ */}
            <div className="rounded-3xl overflow-hidden relative mb-5" style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                boxShadow: '0 12px 40px rgba(15,52,96,0.3)',
            }}>
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,140,66,0.15) 0%, transparent 70%)' }}></div>
                    <div className="absolute bottom-[-30%] left-[-15%] w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(78,205,196,0.1) 0%, transparent 70%)' }}></div>
                    <div className="absolute top-[10%] left-[20%] w-2 h-2 rounded-full bg-yellow-400/30 animate-pulse"></div>
                    <div className="absolute top-[30%] right-[25%] w-1.5 h-1.5 rounded-full bg-teal-400/40 animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative z-10 p-6 md:p-8 md:flex md:items-center md:gap-8">
                    {/* Avatar */}
                    <div className="flex flex-col items-center md:flex-shrink-0">
                        <button onClick={() => setShowAvatarPickerModal(true)} className="relative group/avatar mb-3">
                            <svg className="absolute -inset-2.5 w-[calc(100%+1.25rem)] h-[calc(100%+1.25rem)] -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                                <circle cx="50" cy="50" r="44" fill="none" stroke={C.orange} strokeWidth="5" strokeLinecap="round"
                                    strokeDasharray="276.46" strokeDashoffset={276.46 - (276.46 * expPercent / 100)}
                                    style={{ filter: 'drop-shadow(0 0 4px rgba(255,140,66,0.5))' }} />
                            </svg>
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-4xl md:text-5xl overflow-hidden relative z-10 border-2 border-white/20 group-hover/avatar:border-orange-400/50 transition-all group-hover/avatar:scale-105">
                                <AvatarDisplay avatar={activeKid.avatar} />
                            </div>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-md whitespace-nowrap z-20 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                换头像
                            </div>
                        </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left mt-3 md:mt-0">
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide">{activeKid.name}</h2>

                        {/* Level badge — clicks opens NEW level rules page */}
                        <button onClick={() => setShowLevelRulesModal(true)}
                            className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black text-white/90 bg-gradient-to-r ${tier.bg} border border-white/20 backdrop-blur-sm shadow-lg hover:scale-105 transition-transform`}>
                            {tier.emoji} LV.{activeKid.level} {tier.title}
                            <Icons.Info size={12} className="opacity-60" />
                        </button>

                        {/* EXP bar */}
                        <div className="mt-3 max-w-sm mx-auto md:mx-0">
                            <div className="h-1.5 rounded-full overflow-hidden bg-white/10">
                                <div className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${expPercent}%`, background: `linear-gradient(90deg, ${C.orange}, ${C.yellow})`, boxShadow: `0 0 8px ${C.orange}60` }}>
                                </div>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-[9px] font-bold text-white/25">{activeKid.exp} / {nextLevelExp} EXP</span>
                                <span className="text-[9px] font-bold text-orange-400/50">→ LV.{activeKid.level + 1}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                2. Quick Actions
            ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <button onClick={openTransactionHistory}
                    className="rounded-2xl p-4 flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: C.bgCard, boxShadow: C.cardShadow, border: `1px solid ${C.bgLight}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${C.teal}15` }}>
                        <Icons.Star size={20} style={{ color: C.teal }} fill="currentColor" />
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-black" style={{ color: C.textPrimary }}>积分明细</div>
                        <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>收支记录</div>
                    </div>
                </button>
                <button onClick={() => setShowAvatarPickerModal(true)}
                    className="rounded-2xl p-4 flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: C.bgCard, boxShadow: C.cardShadow, border: `1px solid ${C.bgLight}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${C.purple}15` }}>
                        <Icons.Camera size={20} style={{ color: C.purple }} />
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-black" style={{ color: C.textPrimary }}>更换头像</div>
                        <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>个性化形象</div>
                    </div>
                </button>
            </div>

            {/* ═══════════════════════════════════════════
                3. Achievement Badges
            ═══════════════════════════════════════════ */}
            <div>
                <h3 className="text-sm font-black mb-3 flex items-center gap-2 pl-1" style={{ color: C.textPrimary }}>
                    <div className="w-1 h-4 rounded-full" style={{ background: C.purple }}></div>
                    成就勋章
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto" style={{ background: `${C.orange}15`, color: C.orange }}>
                        {unlockedCount} / {ACHIEVEMENTS.length}
                    </span>
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    {visibleBadges.map(a => (
                        <button key={a.id}
                            onClick={() => setSelectedBadge(selectedBadge?.id === a.id ? null : a)}
                            className={`rounded-2xl p-3 flex flex-col items-center text-center transition-all ${a.unlocked ? 'hover:scale-105' : 'opacity-40 grayscale'} ${selectedBadge?.id === a.id ? 'ring-2 ring-orange-400 scale-105' : ''}`}
                            style={{ background: C.bgCard, boxShadow: a.unlocked ? C.cardShadow : 'none', border: `1px solid ${a.unlocked ? C.bgLight : C.bgMuted}` }}>
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${a.bg} flex items-center justify-center text-2xl mb-1.5 shadow-inner border-2 border-white/50`}>
                                {a.unlocked ? a.emoji : <Icons.Lock size={16} className="text-gray-500/50" />}
                            </div>
                            <div className="text-[10px] font-black truncate w-full" style={{ color: a.unlocked ? C.textPrimary : C.textMuted }}>{a.title}</div>
                            <div className="text-[8px] font-bold mt-0.5 leading-tight" style={{ color: C.textMuted }}>{a.desc}</div>
                        </button>
                    ))}
                </div>

                {/* Badge detail */}
                {selectedBadge && (
                    <div className="mt-3 rounded-2xl p-4 animate-fade-in flex items-center gap-4"
                        style={{ background: C.bgCard, boxShadow: '0 6px 24px rgba(27,46,75,0.1)', border: `1px solid ${C.bgLight}` }}>
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${selectedBadge.bg} flex items-center justify-center text-3xl shadow-lg border-2 border-white/50 flex-shrink-0`}>
                            {selectedBadge.unlocked ? selectedBadge.emoji : <Icons.Lock size={24} className="text-gray-500/50" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-base font-black" style={{ color: C.textPrimary }}>{selectedBadge.title}</span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{
                                    background: selectedBadge.unlocked ? `${C.green}15` : `${C.textMuted}15`,
                                    color: selectedBadge.unlocked ? C.green : C.textMuted
                                }}>
                                    {selectedBadge.unlocked ? '已获得 ✓' : '未解锁'}
                                </span>
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: C.textSoft }}>{selectedBadge.desc}</p>
                            <p className="text-[10px] mt-1 font-bold" style={{ color: C.textMuted }}>分类：{selectedBadge.category}</p>
                        </div>
                        <button onClick={() => setSelectedBadge(null)} className="flex-shrink-0 opacity-40 hover:opacity-80 transition-opacity">
                            <Icons.X size={16} style={{ color: C.textMuted }} />
                        </button>
                    </div>
                )}

                {ACHIEVEMENTS.length > 6 && (
                    <button onClick={() => { setShowAllBadges(!showAllBadges); setSelectedBadge(null); }}
                        className="w-full mt-3 py-2.5 text-xs font-black rounded-xl transition-all hover:scale-[1.01]"
                        style={{ color: C.orange, background: `${C.orange}08`, border: `1px dashed ${C.orange}30` }}>
                        {showAllBadges ? `收起勋章 ↑` : `查看全部 ${ACHIEVEMENTS.length} 枚勋章 →`}
                    </button>
                )}
            </div>

            {/* ═══════════════════════════════════════════
                LEVEL RULES — bright, warm, game-like full-screen
            ═══════════════════════════════════════════ */}
            {showLevelRulesModal && (
                <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center animate-fade-in" onClick={() => setShowLevelRulesModal(false)}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

                    {/* Panel: mobile=full-screen, md+=centered floating card */}
                    <div className="relative w-full h-full md:w-[540px] md:h-auto md:max-h-[85vh] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                        style={{ background: C.bg }}
                        onClick={e => e.stopPropagation()}>

                        {/* ═══ Warm gradient header ═══ */}
                        <div className="shrink-0 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFE8D6 0%, #FFD4B8 50%, #FFCBA4 100%)' }}>
                            <div className="absolute top-4 right-4 w-24 h-24 rounded-full opacity-20"
                                style={{ background: 'radial-gradient(circle, #FF8C42, transparent)' }}></div>
                            <div className="px-6 pt-6 pb-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-xl font-black flex items-center gap-2" style={{ color: '#6B3A0A' }}>
                                        🏅 等级之路
                                    </h2>
                                    <button onClick={() => setShowLevelRulesModal(false)}
                                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
                                        style={{ background: 'rgba(255,255,255,0.5)', color: '#6B3A0A' }}>
                                        <Icons.X size={18} />
                                    </button>
                                </div>
                                <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
                                    style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)' }}>
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.bg} flex items-center justify-center text-xl shadow-md`}>
                                        {tier.emoji}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-black" style={{ color: '#6B3A0A' }}>
                                            当前 LV.{activeKid.level} · {tier.title}
                                        </div>
                                        <div className="text-[10px] font-bold mt-0.5" style={{ color: '#9B6B3A' }}>
                                            升级需 {nextLevelExp} EXP · 每级 = 等级 × 100
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ═══ Scrollable content ═══ */}
                        <div className="flex-1 overflow-y-auto">

                            {/* Tier progression list */}
                            <div className="px-5 py-5">
                                {LEVEL_TIERS.map((t, i) => {
                                    const isCurrent = t.minLevel <= activeKid.level && (t.maxLevel === '∞' || activeKid.level <= t.maxLevel);
                                    const isPast = typeof t.maxLevel === 'number' && activeKid.level > t.maxLevel;
                                    const isFuture = !isCurrent && !isPast;
                                    return (
                                        <div key={t.title} className="flex gap-4">
                                            {/* Left: vertical path line + node */}
                                            <div className="flex flex-col items-center w-10 flex-shrink-0">
                                                {/* Connecting line above (except first) */}
                                                {i > 0 && <div className="w-0.5 h-4 rounded-full" style={{ background: isPast || isCurrent ? C.orange : C.bgMuted }}></div>}
                                                {/* Node circle */}
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.bg} flex items-center justify-center text-lg shadow-md flex-shrink-0 ${isFuture ? 'opacity-40 grayscale' : ''} ${isCurrent ? 'ring-2 ring-orange-400 ring-offset-2 scale-110' : ''}`}
                                                    style={{ ringOffsetColor: C.bg }}>
                                                    {t.emoji}
                                                </div>
                                                {/* Connecting line below (except last) */}
                                                {i < LEVEL_TIERS.length - 1 && <div className="w-0.5 flex-1 min-h-4 rounded-full" style={{ background: isPast ? C.orange : C.bgMuted }}></div>}
                                            </div>

                                            {/* Right: tier info card */}
                                            <div className={`flex-1 mb-3 rounded-2xl px-4 py-3 transition-all ${isCurrent ? 'shadow-md' : ''}`}
                                                style={{
                                                    background: isCurrent ? C.bgCard : 'transparent',
                                                    border: isCurrent ? `2px solid ${C.orange}30` : `1px solid transparent`,
                                                    opacity: isFuture ? 0.5 : 1,
                                                }}>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black" style={{ color: isCurrent ? C.orange : C.textPrimary }}>{t.title}</span>
                                                    {isCurrent && (
                                                        <span className="text-[8px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: C.orange }}>
                                                            ← 你在这里
                                                        </span>
                                                    )}
                                                    {isPast && (
                                                        <span className="text-[8px] font-black px-2 py-0.5 rounded-full" style={{ background: `${C.green}15`, color: C.green }}>
                                                            ✓ 已达成
                                                        </span>
                                                    )}
                                                    {isFuture && (
                                                        <Icons.Lock size={10} style={{ color: C.textMuted }} />
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-bold mt-0.5" style={{ color: C.textMuted }}>{t.desc}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${t.color}12`, color: t.color }}>
                                                        LV.{t.minLevel} ~ {t.maxLevel}
                                                    </span>
                                                    <span className="text-[9px] font-bold" style={{ color: C.textMuted }}>
                                                        每级 {t.minLevel * 100}~{typeof t.maxLevel === 'number' ? t.maxLevel * 100 : '∞'} EXP
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="px-6 pb-6 pt-0">
                                <div className="rounded-xl p-3 text-center" style={{ background: `${C.orange}08` }}>
                                    <p className="text-[10px] font-bold" style={{ color: C.textMuted }}>
                                        💡 完成任务和习惯打卡可以获得经验值哦！
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
