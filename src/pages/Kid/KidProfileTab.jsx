import React, { useMemo, useState, useEffect } from 'react';
import { useDataContext } from '../../context/DataContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons, AvatarDisplay } from '../../utils/Icons';
import { getLevelReq, getLevelTier } from '../../utils/levelUtils';
import { getSpiritForm, getSpiritPrivileges, getSpiritMessage, SPIRIT_FORMS, getCurrentSeason, isSpiritMaxStar } from '../../utils/spiritUtils';

// Shared warm Headspace palette
const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
    orange: '#FF8C42', orangeHot: '#FF6B1A', yellow: '#FFD93D', teal: '#4ECDC4',
    coral: '#FF6B6B', green: '#10B981', red: '#EF4444', purple: '#8B5CF6',
    textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
    cardShadow: '0 4px 24px rgba(27,46,75,0.06)',
};

// ── Achievement definitions ──
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
    { id: 'level5', emoji: '🌱', title: '成长之芽', desc: '等级达到5级', category: '等级', bg: 'from-lime-200 to-green-400',
        check: (kid) => kid.level >= 5 },
    { id: 'level10', emoji: '🌳', title: '参天大树', desc: '等级达到10级', category: '等级', bg: 'from-green-300 to-emerald-500',
        check: (kid) => kid.level >= 10 },
    { id: 'level50', emoji: '🚀', title: '火箭少年', desc: '等级达到50级', category: '等级', bg: 'from-sky-200 to-blue-500',
        check: (kid) => kid.level >= 50 },
];

// ── Spirit floating animation keyframes ──
const spiritFloatCSS = `
@keyframes spiritFloat {
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-8px) scale(1.03); }
}
@keyframes spiritGlow {
    0%, 100% { filter: drop-shadow(0 0 8px var(--glow-color)); }
    50% { filter: drop-shadow(0 0 16px var(--glow-color)) drop-shadow(0 0 24px var(--glow-color)); }
}
@keyframes sparkle {
    0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
    50% { opacity: 1; transform: scale(1) rotate(180deg); }
}
@keyframes messageFloat {
    0% { opacity: 0; transform: translateY(10px); }
    10% { opacity: 1; transform: translateY(0); }
    80% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
}
`;

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
    const [spiritMessage, setSpiritMessage] = useState('');
    const [showSpiritMsg, setShowSpiritMsg] = useState(false);

    const activeKid = kids.find(k => k.id === activeKidId);
    if (!activeKid) return null;

    const nextLevelExp = getLevelReq(activeKid.level);
    const tier = getLevelTier(activeKid.level);
    const form = getSpiritForm(activeKid.level);
    const privileges = getSpiritPrivileges(activeKid.level);
    const maxStar = isSpiritMaxStar(activeKid.level);
    const season = getCurrentSeason();
    const expPercent = Math.max(0, Math.min(100, (activeKid.exp / nextLevelExp) * 100));

    // Achievement status
    const achievementStatus = useMemo(() => {
        return ACHIEVEMENTS.map(a => ({ ...a, unlocked: a.check(activeKid, transactions) }));
    }, [activeKid, transactions]);
    const unlockedCount = achievementStatus.filter(a => a.unlocked).length;
    const visibleBadges = showAllBadges ? achievementStatus : achievementStatus.slice(0, 6);

    // Spirit random message
    const handleSpiritTap = () => {
        setSpiritMessage(getSpiritMessage(activeKid.level));
        setShowSpiritMsg(true);
        setTimeout(() => setShowSpiritMsg(false), 3000);
    };

    const openTransactionHistory = () => {
        setTransactionHistoryKidId(activeKidId);
        setShowTransactionHistoryModal(true);
    };

    // Next evolution info
    const currentFormIdx = SPIRIT_FORMS.findIndex(f => f.id === form.id);
    const nextForm = currentFormIdx < SPIRIT_FORMS.length - 1 ? SPIRIT_FORMS[currentFormIdx + 1] : null;
    const levelsToNextForm = nextForm ? nextForm.minLevel - activeKid.level : 0;

    return (
        <div className="animate-fade-in pb-10 pt-2 max-w-4xl mx-auto">
            <style>{spiritFloatCSS}</style>

            {/* ═══════════════════════════════════════════
                1. HERO — Spirit + Profile Card
            ═══════════════════════════════════════════ */}
            <div className="rounded-3xl overflow-hidden relative mb-5" style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                boxShadow: '0 12px 40px rgba(15,52,96,0.3)',
            }}>
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-80 h-80 rounded-full" style={{ background: `radial-gradient(circle, ${form.glow} 0%, transparent 70%)` }}></div>
                    <div className="absolute bottom-[-30%] left-[-15%] w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(78,205,196,0.1) 0%, transparent 70%)' }}></div>
                    {/* Stars */}
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="absolute w-1 h-1 rounded-full animate-pulse"
                            style={{
                                background: ['#FFD93D', '#4ECDC4', '#FF8C42', '#8B5CF6', '#EC4899', '#10B981'][i],
                                opacity: 0.4,
                                top: `${10 + i * 15}%`,
                                left: `${10 + i * 14}%`,
                                animationDelay: `${i * 0.5}s`,
                            }}></div>
                    ))}
                </div>

                <div className="relative z-10 p-6 md:p-8">
                    {/* Season Badge */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black"
                            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                            {season.emoji} {season.name}
                        </div>
                        <button onClick={() => setShowAvatarPickerModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all hover:scale-105"
                            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                            <Icons.Camera size={10} /> 换头像
                        </button>
                    </div>

                    {/* Spirit + Avatar Row */}
                    <div className="flex items-center gap-5 md:gap-8">
                        {/* Spirit Display (Left) */}
                        <button onClick={handleSpiritTap} className="relative flex-shrink-0 group/spirit">
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center text-5xl md:text-6xl relative"
                                style={{
                                    '--glow-color': form.glow,
                                    animation: 'spiritFloat 3s ease-in-out infinite, spiritGlow 2s ease-in-out infinite',
                                    background: `radial-gradient(circle, ${form.glow} 0%, transparent 65%)`,
                                }}>
                                {form.emoji}
                                {/* Max star sparkle effect */}
                                {maxStar && (
                                    <>
                                        {[0, 1, 2, 3].map(i => (
                                            <div key={i} className="absolute text-xs"
                                                style={{
                                                    animation: `sparkle 2s ease-in-out infinite ${i * 0.5}s`,
                                                    top: `${[0, 20, 80, 60][i]}%`,
                                                    left: `${[30, 90, 10, 85][i]}%`,
                                                }}>✨</div>
                                        ))}
                                    </>
                                )}
                            </div>
                            {/* Spirit message bubble */}
                            {showSpiritMsg && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-xl text-[10px] font-bold"
                                    style={{
                                        background: 'rgba(255,255,255,0.95)',
                                        color: C.textPrimary,
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                        animation: 'messageFloat 3s ease-in-out forwards',
                                    }}>
                                    {spiritMessage}
                                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style={{ background: 'rgba(255,255,255,0.95)' }}></div>
                                </div>
                            )}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap opacity-0 group-hover/spirit:opacity-100 transition-opacity"
                                style={{ background: form.color, color: '#fff' }}>
                                点我说话
                            </div>
                        </button>

                        {/* Info (Right) */}
                        <div className="flex-1 min-w-0">
                            {/* Avatar + Name Row */}
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl overflow-hidden border-2 border-white/20 flex-shrink-0">
                                    <AvatarDisplay avatar={activeKid.avatar} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-xl md:text-2xl font-black text-white truncate">{activeKid.name}</h2>
                                </div>
                            </div>

                            {/* Spirit Form Badge */}
                            <button onClick={() => setShowLevelRulesModal(true)}
                                className={`mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black text-white/90 bg-gradient-to-r ${form.bg} border border-white/20 shadow-lg hover:scale-105 transition-transform`}>
                                {form.emoji} Lv.{activeKid.level} · {maxStar ? '🌟 满星精灵' : form.name}
                                <Icons.ChevronRight size={10} className="opacity-60" />
                            </button>

                            {/* EXP bar */}
                            <div className="max-w-sm">
                                <div className="h-2 rounded-full overflow-hidden bg-white/10">
                                    <div className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${expPercent}%`,
                                            background: `linear-gradient(90deg, ${form.color}, ${C.yellow})`,
                                            boxShadow: `0 0 10px ${form.glow}`,
                                        }}></div>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-[9px] font-bold text-white/30">{activeKid.exp} / {nextLevelExp} ✨星尘</span>
                                    {nextForm ? (
                                        <span className="text-[9px] font-bold" style={{ color: `${form.color}80` }}>
                                            {nextForm.emoji} 还差 {levelsToNextForm} 级进化
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-bold text-yellow-400/50">⭐ 已满星</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                2. Spirit Privileges Panel
            ═══════════════════════════════════════════ */}
            <div className="mb-5">
                <h3 className="text-sm font-black mb-3 flex items-center gap-2 pl-1" style={{ color: C.textPrimary }}>
                    <div className="w-1 h-4 rounded-full" style={{ background: form.color }}></div>
                    🎖 精灵特权
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full ml-auto"
                        style={{ background: `${form.color}15`, color: form.color }}>
                        {form.name}
                    </span>
                </h3>
                <div className="grid grid-cols-3 gap-2.5">
                    {[
                        { label: '利息加成', value: privileges.interestBonus > 0 ? `+${privileges.interestBonus}%/周` : '未解锁', icon: '💰', active: privileges.interestBonus > 0, color: C.teal },
                        { label: '每日奖励', value: privileges.dailyBonus > 0 ? `+${privileges.dailyBonus}` : '未解锁', icon: '🪙', active: privileges.dailyBonus > 0, color: C.orange },
                        { label: '商城折扣', value: privileges.shopDiscount > 0 ? `${100 - privileges.shopDiscount}折` : '未解锁', icon: '🏷️', active: privileges.shopDiscount > 0, color: C.purple },
                    ].map((p, i) => (
                        <div key={i} className="rounded-2xl p-3 text-center transition-all"
                            style={{
                                background: p.active ? C.bgCard : `${C.bgLight}80`,
                                boxShadow: p.active ? C.cardShadow : 'none',
                                border: p.active ? `1px solid ${p.color}20` : `1px solid ${C.bgMuted}80`,
                                opacity: p.active ? 1 : 0.6,
                            }}>
                            <div className="text-2xl mb-1">{p.icon}</div>
                            <div className="text-[10px] font-bold mb-0.5" style={{ color: C.textMuted }}>{p.label}</div>
                            <div className="text-xs font-black" style={{ color: p.active ? p.color : C.textMuted }}>{p.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                3. Quick Actions
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
                <button onClick={() => setShowLevelRulesModal(true)}
                    className="rounded-2xl p-4 flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: C.bgCard, boxShadow: C.cardShadow, border: `1px solid ${C.bgLight}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${C.purple}15` }}>
                        <Icons.Award size={20} style={{ color: C.purple }} />
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-black" style={{ color: C.textPrimary }}>进化之路</div>
                        <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>精灵形态一览</div>
                    </div>
                </button>
            </div>

            {/* ═══════════════════════════════════════════
                4. Achievement Badges
            ═══════════════════════════════════════════ */}
            <div>
                <h3 className="text-sm font-black mb-3 flex items-center gap-2 pl-1" style={{ color: C.textPrimary }}>
                    <div className="w-1 h-4 rounded-full" style={{ background: C.purple }}></div>
                    🏆 成就勋章
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
                SPIRIT EVOLUTION RULES MODAL
            ═══════════════════════════════════════════ */}
            {showLevelRulesModal && (
                <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center animate-fade-in" onClick={() => setShowLevelRulesModal(false)}>
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
                    <div className="relative w-full h-full md:w-[540px] md:h-auto md:max-h-[85vh] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                        style={{ background: C.bg }}
                        onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="shrink-0 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute top-[-30%] right-[-10%] w-60 h-60 rounded-full" style={{ background: `radial-gradient(circle, ${form.glow} 0%, transparent 70%)` }}></div>
                            </div>
                            <div className="px-6 pt-6 pb-5 relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                                        🐾 精灵进化之路
                                    </h2>
                                    <button onClick={() => setShowLevelRulesModal(false)}
                                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
                                        style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                                        <Icons.X size={18} />
                                    </button>
                                </div>
                                {/* Current spirit summary */}
                                <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
                                    style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
                                    <div className="text-3xl" style={{ animation: 'spiritFloat 3s ease-in-out infinite' }}>{form.emoji}</div>
                                    <div className="flex-1">
                                        <div className="text-xs font-black text-white">
                                            Lv.{activeKid.level} · {maxStar ? '🌟 满星精灵' : form.name}
                                        </div>
                                        <div className="text-[10px] font-bold mt-0.5 text-white/50">
                                            {form.desc}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Evolution stages list */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="px-5 py-5 space-y-3">
                                {SPIRIT_FORMS.filter(f => f.id !== 'egg').map((f, i) => {
                                    const isCurrent = f.id === form.id;
                                    const isPast = activeKid.level > (f.maxLevel || 999);
                                    const isFuture = activeKid.level < f.minLevel;
                                    const priv = getSpiritPrivileges(f.minLevel);

                                    return (
                                        <div key={f.id} className={`rounded-2xl p-4 transition-all ${isCurrent ? 'ring-2 scale-[1.02]' : ''}`}
                                            style={{
                                                background: isCurrent ? C.bgCard : isFuture ? `${C.bgLight}60` : C.bgCard,
                                                border: isCurrent ? `2px solid ${f.color}40` : `1px solid ${C.bgLight}`,
                                                boxShadow: isCurrent ? `0 8px 24px ${f.glow}` : 'none',
                                                ringColor: f.color,
                                                opacity: isFuture ? 0.6 : 1,
                                            }}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.bg} flex items-center justify-center text-2xl shadow-md ${isFuture ? 'grayscale' : ''}`}>
                                                    {f.emoji}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black" style={{ color: isCurrent ? f.color : C.textPrimary }}>{f.name}</span>
                                                        {isCurrent && (
                                                            <span className="text-[8px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: f.color }}>
                                                                ← 当前形态
                                                            </span>
                                                        )}
                                                        {isPast && (
                                                            <span className="text-[8px] font-black px-2 py-0.5 rounded-full" style={{ background: `${C.green}15`, color: C.green }}>
                                                                ✓ 已经历
                                                            </span>
                                                        )}
                                                        {isFuture && <Icons.Lock size={10} style={{ color: C.textMuted }} />}
                                                    </div>
                                                    <p className="text-[10px] font-bold mt-0.5" style={{ color: C.textMuted }}>
                                                        Lv.{f.minLevel} ~ {f.maxLevel} · {f.desc}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Privileges */}
                                            <div className="flex gap-2 flex-wrap">
                                                {priv.interestBonus > 0 && (
                                                    <span className="text-[9px] font-bold px-2 py-1 rounded-lg" style={{ background: `${C.teal}10`, color: C.teal }}>
                                                        💰 利息 +{priv.interestBonus}%
                                                    </span>
                                                )}
                                                {priv.dailyBonus > 0 && (
                                                    <span className="text-[9px] font-bold px-2 py-1 rounded-lg" style={{ background: `${C.orange}10`, color: C.orange }}>
                                                        🪙 每日 +{priv.dailyBonus}
                                                    </span>
                                                )}
                                                {priv.shopDiscount > 0 && (
                                                    <span className="text-[9px] font-bold px-2 py-1 rounded-lg" style={{ background: `${C.purple}10`, color: C.purple }}>
                                                        🏷 {100 - priv.shopDiscount}折
                                                    </span>
                                                )}
                                                {priv.interestBonus === 0 && priv.dailyBonus === 0 && priv.shopDiscount === 0 && (
                                                    <span className="text-[9px] font-bold px-2 py-1 rounded-lg" style={{ background: `${C.textMuted}10`, color: C.textMuted }}>
                                                        {f.unlockText}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Max star special card */}
                                <div className="rounded-2xl p-4" style={{
                                    background: maxStar
                                        ? 'linear-gradient(135deg, #FEF3C7, #FDE68A, #FBBF24)'
                                        : `${C.bgLight}60`,
                                    border: maxStar ? '2px solid #F59E0B40' : `1px solid ${C.bgMuted}`,
                                    opacity: maxStar ? 1 : 0.5,
                                }}>
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl">🌟</div>
                                        <div>
                                            <div className="text-sm font-black" style={{ color: maxStar ? '#92400E' : C.textMuted }}>
                                                满星精灵 Lv.30
                                            </div>
                                            <div className="text-[10px] font-bold" style={{ color: maxStar ? '#B45309' : C.textMuted }}>
                                                💰 利息 +8% · 🪙 每日 +5 · 🏷 85折 · ✨ 闪光特效
                                            </div>
                                        </div>
                                        {!maxStar && <Icons.Lock size={14} style={{ color: C.textMuted }} className="ml-auto" />}
                                    </div>
                                </div>
                            </div>

                            {/* Tip */}
                            <div className="px-6 pb-6 pt-0">
                                <div className="rounded-xl p-3 text-center" style={{ background: `${C.orange}08` }}>
                                    <p className="text-[10px] font-bold" style={{ color: C.textMuted }}>
                                        💡 完成任务和习惯打卡可以获得星尘（经验值），喂养精灵让它进化！
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
