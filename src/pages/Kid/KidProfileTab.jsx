import React, { useMemo, useState, useEffect } from 'react';
import { useDataContext } from '../../context/DataContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons, AvatarDisplay } from '../../utils/Icons';
import { getLevelReq, getLevelTier } from '../../utils/levelUtils';
import { getSpiritForm, getSpiritPrivileges, getSpiritMessage, SPIRIT_FORMS, getCurrentTerm, isSpiritMaxStar, CHEST_TYPES, getNextChest, getUnlockedChests } from '../../utils/spiritUtils';
import { useNavigationStore } from '../../stores/navigationStore';
import { HelpTip, HELP } from '../../components/HelpTip.jsx';
import { ACHIEVEMENTS, BADGE_CATEGORY_IMAGES } from '../../utils/achievements';
import PixelPetEngine from '../../components/VirtualPet/PixelPetEngine';
import PetBoxTeaser from '../../components/VirtualPet/PetBoxTeaser';
import VirtualPetDashboard from '../../components/VirtualPet/VirtualPetDashboard';

// Shared warm Headspace palette
const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
    orange: '#FF8C42', orangeHot: '#FF6B1A', yellow: '#FFD93D', teal: '#4ECDC4',
    coral: '#FF6B6B', green: '#10B981', red: '#EF4444', purple: '#8B5CF6',
    textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
    cardShadow: '0 4px 24px rgba(27,46,75,0.06)',
};


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
    const { kids, activeKidId, tasks, transactions, updateActiveKid } = useDataContext();
    const { parentSettings } = useNavigationStore();
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
    const [showExpHistory, setShowExpHistory] = useState(false);
    const [showAlmanac, setShowAlmanac] = useState(false);
    const [showDailyPointsModal, setShowDailyPointsModal] = useState(false);
    
    // Virtual Pet Dashboard State
    const [showPetDashboard, setShowPetDashboard] = useState(false);
    const [showNamingModal, setShowNamingModal] = useState(false);
    const [spiritNameInput, setSpiritNameInput] = useState('');

    const activeKid = kids.find(k => k.id === activeKidId);
    if (!activeKid) return null;

    const nextLevelExp = getLevelReq(activeKid.level);
    const tier = getLevelTier(activeKid.level);
    const form = getSpiritForm(activeKid.level);
    const privileges = getSpiritPrivileges(activeKid.level);
    const maxStar = isSpiritMaxStar(activeKid.level);
    const term = getCurrentTerm(parentSettings);
    const expPercent = Math.max(0, Math.min(100, (activeKid.exp / nextLevelExp) * 100));

    // Achievement status
    const achievementStatus = useMemo(() => {
        return ACHIEVEMENTS.map(a => ({ ...a, unlocked: a.check(activeKid, transactions) }));
    }, [activeKid, transactions]);
    const unlockedCount = achievementStatus.filter(a => a.unlocked).length;
    const visibleBadges = showAllBadges ? achievementStatus : achievementStatus.slice(0, 9);

    // Spirit random message with context
    const handleSpiritTap = () => {
        const today = new Date().toISOString().slice(0, 10);
        const recentTaskCount = transactions.filter(t => t.kidId === activeKid.id && t.type === 'income' && t.category === 'task' && t.date?.startsWith(today)).length;
        setSpiritMessage(getSpiritMessage(activeKid.level, {
            spiritName: activeKid.spirit_name,
            recentTaskCount,
            streakDays: activeKid.streak_days || 0,
        }));
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

            {showPetDashboard && (
                <VirtualPetDashboard 
                    activeKid={activeKid} 
                    onClose={() => setShowPetDashboard(false)} 
                />
            )}

            {/* ═══════════════════════════════════════════
                 1. HERO — Profile & Tamagotchi System
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

                <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                    
                    {/* Left: Transparent Pixel Pet Engine */}
                    <button 
                        onClick={() => setShowPetDashboard(true)}
                        className="flex-shrink-0 w-[140px] h-[140px] md:w-[160px] md:h-[160px] relative hover:scale-105 transition-transform cursor-pointer group"
                    >
                        <div className="absolute inset-0 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors pointer-events-none"></div>
                        <PetBoxTeaser size={140} />
                        {/* Spirit message bubble over Pet */}
                        {showSpiritMsg && (
                            <div className="absolute top-[0px] left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-xl text-[10px] font-bold z-50 pointer-events-none"
                                style={{
                                    background: 'rgba(255,255,255,0.95)',
                                    color: C.textPrimary,
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                                    animation: 'messageFloat 3s ease-in-out forwards',
                                }}>
                                {spiritMessage}
                                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style={{ background: 'rgba(255,255,255,0.95)' }}></div>
                            </div>
                        )}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 text-white backdrop-blur-sm shadow-sm pointer-events-none">
                            点击进入宠物房间 🏠
                        </div>
                    </button>

                    {/* Right: Info */}
                    <div className="flex-1 w-full min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-5">
                            <div className="inline-flex items-center gap-1 xl:gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold"
                                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                                <span>{term.emoji}</span>
                                {term.name}
                            </div>
                            <button onClick={() => setShowAvatarPickerModal(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all hover:scale-105"
                                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                                <Icons.Camera size={10} /> 换头像
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-3xl overflow-hidden border-2 border-white/20 flex-shrink-0 shadow-lg">
                                <AvatarDisplay avatar={activeKid.avatar} />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-2xl md:text-3xl font-black text-white truncate drop-shadow-sm">{activeKid.name}</h2>
                                <button 
                                    onClick={() => { setSpiritNameInput(activeKid.spirit_name || ''); setShowNamingModal(true); }}
                                    className="text-[11px] font-bold flex items-center gap-1 hover:opacity-100 transition-opacity mt-1"
                                    style={{ color: activeKid.spirit_name ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)' }}>
                                    {activeKid.spirit_name 
                                        ? <>🐾 精灵「{activeKid.spirit_name}」<Icons.Edit3 size={10} /></>
                                        : <>✏️ 给外置猫咪取个名字</>}
                                </button>
                            </div>
                        </div>

                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <button onClick={() => setShowLevelRulesModal(true)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black text-white/90 bg-gradient-to-r ${form.bg} border border-white/20 shadow-lg hover:scale-105 transition-transform`}>
                                {form.emoji} Lv.{activeKid.level} · {form.name}
                                <Icons.ChevronRight size={10} className="opacity-60" />
                            </button>
                            {(activeKid.spirit_generation || 1) > 1 && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
                                    🎓 第{activeKid.spirit_generation || 1}代主人
                                </span>
                            )}
                        </div>

                        <div className="w-full mt-2">
                            <div className="flex justify-between mb-2">
                                <span className="text-[10px] font-black text-white/50 tracking-widest uppercase">Pet Experience</span>
                                <span className="text-[10px] font-black text-white/90 bg-white/10 px-2 py-0.5 rounded-sm">{activeKid.exp} / {nextLevelExp}</span>
                            </div>
                            <div className="h-3 rounded-full overflow-hidden bg-black/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] relative">
                                <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${expPercent}%`,
                                        background: `linear-gradient(90deg, #4ade80, #facc15)`,
                                        boxShadow: `0 0 15px rgba(74, 222, 128, 0.4)`,
                                    }}>
                                </div>
                                <div className="absolute top-0 right-0 left-0 h-1 bg-white/20 rounded-full"></div>
                            </div>
                            <div className="flex justify-between mt-2 pl-1">
                                <span className="text-[9px] font-bold text-white/40">✨ 每日打卡获取成长值</span>
                                {nextForm ? (
                                    <span className="text-[9px] font-bold text-green-300/80">
                                        还差 {levelsToNextForm} 级进化
                                    </span>
                                ) : (
                                    <span className="text-[9px] font-bold text-yellow-400/50">⭐ 终极形态</span>
                                )}
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
                2.5 Treasure Chest Progress 🎁
            ═══════════════════════════════════════════ */}
            <div className="rounded-2xl p-4 mb-5" style={{ background: C.bgCard, boxShadow: C.cardShadow, border: `1px solid ${C.bgLight}` }}>
                <h3 className="text-sm font-black mb-3 flex items-center gap-2 pl-1" style={{ color: C.textPrimary }}>
                    <div className="w-1 h-4 rounded-full" style={{ background: C.yellow }}></div>
                    🎁 宝箱进度
                    <HelpTip {...HELP.chest} size={14} />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto" style={{ background: `${C.yellow}15`, color: '#D97706' }}>
                        已打卡 {activeKid.streak_days || 0} 天
                    </span>
                </h3>

                {/* Progress bar with chest milestones */}
                <div className="relative px-2">
                    {/* Background track */}
                    <div className="h-2 rounded-full" style={{ background: C.bgLight }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{
                            width: `${Math.min(100, ((activeKid.streak_days || 0) / 30) * 100)}%`,
                            background: 'linear-gradient(90deg, #FBBF24, #F59E0B, #D97706)',
                        }}></div>
                    </div>

                    {/* Chest milestone nodes */}
                    <div className="flex justify-between mt-2">
                        {CHEST_TYPES.map(chest => {
                            const unlocked = (activeKid.streak_days || 0) >= chest.streakDays;
                            const isNext = !unlocked && (getNextChest(activeKid.streak_days || 0)?.id === chest.id);
                            return (
                                <div key={chest.id} className="flex flex-col items-center" style={{ width: '22%' }}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${unlocked ? 'scale-110' : isNext ? 'animate-pulse' : 'opacity-40 grayscale'}`}
                                        style={{
                                            background: unlocked ? `linear-gradient(135deg, ${chest.color}20, ${chest.color}10)` : C.bgLight,
                                            border: unlocked ? `2px solid ${chest.color}40` : `1px solid ${C.bgMuted}`,
                                            boxShadow: unlocked ? `0 4px 12px ${chest.glow}` : 'none',
                                        }}>
                                        {unlocked ? chest.emoji : <Icons.Lock size={14} style={{ color: C.textMuted }} />}
                                    </div>
                                    <div className="text-[9px] font-black mt-1" style={{ color: unlocked ? chest.color : C.textMuted }}>
                                        {chest.name}
                                    </div>
                                    <div className="text-[8px] font-bold" style={{ color: C.textMuted }}>
                                        {chest.streakDays}天
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Next chest info */}
                {(() => {
                    const next = getNextChest(activeKid.streak_days || 0);
                    if (!next) return (
                        <div className="mt-3 text-center text-[10px] font-bold rounded-xl py-2" style={{ background: `${C.yellow}10`, color: '#D97706' }}>
                            🎉 所有宝箱已解锁！你是打卡之王！
                        </div>
                    );
                    const remaining = next.streakDays - (activeKid.streak_days || 0);
                    return (
                        <div className="mt-3 text-center text-[10px] font-bold rounded-xl py-2" style={{ background: C.bg, color: C.textMuted }}>
                            距离 {next.emoji} {next.name} 还需打卡 <span style={{ color: '#D97706', fontWeight: 900 }}>{remaining}</span> 天
                        </div>
                    );
                })()}
            </div>

            {/* ═══════════════════════════════════════════
                2.7 Term / Semester Progress 📚
            ═══════════════════════════════════════════ */}
            <div className="rounded-2xl overflow-hidden mb-5" style={{ boxShadow: C.cardShadow, border: `1px solid ${C.bgLight}` }}>
                <div className="px-4 py-3 flex items-center gap-3"
                    style={{ background: `linear-gradient(135deg, ${term.color}15, ${term.color}08)` }}>
                    <div className="text-2xl">{term.emoji}</div>
                    <div className="flex-1">
                        <div className="text-sm font-black" style={{ color: C.textPrimary }}>{term.name}</div>
                        <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>
                            {term.startDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} — {term.endDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-black" style={{ color: term.color }}>还剩 {term.daysLeft} 天</div>
                        <div className="text-[9px] font-bold" style={{ color: C.textMuted }}>共 {term.totalDays} 天</div>
                    </div>
                </div>
                <div className="px-4 py-3" style={{ background: C.bgCard }}>
                    <div className="h-2 rounded-full" style={{ background: C.bgLight }}>
                        <div className="h-full rounded-full transition-all" style={{
                            width: `${term.progress}%`,
                            background: `linear-gradient(90deg, ${term.color}80, ${term.color})`,
                        }}></div>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[9px] font-bold" style={{ color: C.textMuted }}>已过 {Math.round(term.progress)}%</span>
                        <span className="text-[9px] font-bold" style={{ color: term.color }}>{term.daysLeft > 0 ? `${term.daysLeft} 天后结束` : '已结束'}</span>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                3. Quick Actions (3 buttons)
            ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-3 gap-2.5 mb-5">
                <button onClick={() => setShowExpHistory(!showExpHistory)}
                    className="rounded-2xl p-3 flex flex-col items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: showExpHistory ? `${C.teal}10` : C.bgCard, boxShadow: C.cardShadow, border: `1px solid ${showExpHistory ? `${C.teal}30` : C.bgLight}` }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${C.teal}15` }}>
                        <Icons.Activity size={16} style={{ color: C.teal }} />
                    </div>
                    <div className="text-[10px] font-black" style={{ color: C.textPrimary }}>星尘明细</div>
                </button>
                <button onClick={() => setShowAlmanac(true)}
                    className="rounded-2xl p-3 flex flex-col items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: C.bgCard, boxShadow: C.cardShadow, border: `1px solid ${C.bgLight}` }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${C.orange}15` }}>
                        <Icons.BookOpen size={16} style={{ color: C.orange }} />
                    </div>
                    <div className="text-[10px] font-black" style={{ color: C.textPrimary }}>精灵图鉴</div>
                </button>
                <button onClick={() => setShowLevelRulesModal(true)}
                    className="rounded-2xl p-3 flex flex-col items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: C.bgCard, boxShadow: C.cardShadow, border: `1px solid ${C.bgLight}` }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${C.purple}15` }}>
                        <Icons.Award size={16} style={{ color: C.purple }} />
                    </div>
                    <div className="text-[10px] font-black" style={{ color: C.textPrimary }}>进化之路</div>
                </button>
            </div>

            {/* ═══ Stardust Experience History (inline) ═══ */}
            {showExpHistory && (
                <div className="mb-5 rounded-2xl overflow-hidden" style={{ background: C.bgCard, boxShadow: C.cardShadow, border: `1px solid ${C.bgLight}` }}>
                    <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderBottom: '1px solid rgba(78,205,196,0.1)' }}>
                        <span className="text-base">✨</span>
                        <span className="text-xs font-black text-white">星尘获取明细</span>
                        <span className="text-[9px] font-bold ml-auto px-2 py-0.5 rounded-full" style={{ background: 'rgba(78,205,196,0.15)', color: C.teal }}>
                            总计 {activeKid.exp} 星尘
                        </span>
                    </div>
                    <div className="px-4 py-3 space-y-2 max-h-[300px] overflow-y-auto">
                        {/* EXP-related transactions */}
                        {(() => {
                            const expTx = transactions
                                .filter(t => t.kidId === activeKidId && t.type === 'income' && (t.category === 'task' || t.category === 'habit'))
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .slice(0, 20);
                            if (expTx.length === 0) return (
                                <div className="text-center py-6">
                                    <div className="text-2xl mb-2">✨</div>
                                    <div className="text-xs font-bold" style={{ color: C.textMuted }}>还没有获得星尘呢，完成任务就能积累！</div>
                                </div>
                            );
                            return expTx.map((t, idx) => (
                                <div key={t.id || idx} className="flex items-center gap-3 py-2 px-2 rounded-xl" style={{ background: idx % 2 === 0 ? C.bg : 'transparent' }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                                        background: t.category === 'habit' ? `${C.green}15` : `${C.teal}15`
                                    }}>
                                        {t.category === 'habit'
                                            ? <Icons.ShieldCheck size={14} style={{ color: C.green }} />
                                            : <Icons.BookOpen size={14} style={{ color: C.teal }} />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold truncate" style={{ color: C.textPrimary }}>{t.title || (t.category === 'habit' ? '习惯打卡' : '学习任务')}</div>
                                        <div className="text-[9px] font-bold" style={{ color: C.textMuted }}>
                                            {t.category === 'habit' ? '🎯 习惯养成' : '📚 学习任务'} · {new Date(t.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                    <div className="text-xs font-black flex-shrink-0" style={{ color: C.teal }}>+{t.amount} ✨</div>
                                </div>
                            ));
                        })()}
                    </div>
                    {/* Level progress summary */}
                    <div className="px-4 py-3" style={{ background: C.bg, borderTop: `1px solid ${C.bgLight}` }}>
                        <div className="flex items-center justify-between text-[10px] font-bold" style={{ color: C.textMuted }}>
                            <span>Lv.{activeKid.level} → Lv.{activeKid.level + 1}</span>
                            <span>还需 {nextLevelExp - activeKid.exp} ✨ 星尘</span>
                        </div>
                        <div className="h-1.5 rounded-full mt-1.5 overflow-hidden" style={{ background: C.bgLight }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${expPercent}%`, background: `linear-gradient(90deg, ${C.teal}, ${C.green})` }}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════
                4. Achievement Badges
            ═══════════════════════════════════════════ */}
            <div>
                <h3 className="text-sm font-black mb-3 flex items-center gap-2 pl-1" style={{ color: C.textPrimary }}>
                    <div className="w-1 h-4 rounded-full" style={{ background: C.purple }}></div>
                    🏆 成就勋章
                    <HelpTip {...HELP.achievement} size={14} />
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
                            <div className="flex items-center gap-1.5 mt-1">
                                {BADGE_CATEGORY_IMAGES[selectedBadge.category] && (
                                    <img src={BADGE_CATEGORY_IMAGES[selectedBadge.category]} alt="" className="w-4 h-4 object-contain" />
                                )}
                                <span className="text-[10px] font-bold" style={{ color: C.textMuted }}>分类：{selectedBadge.category}</span>
                            </div>
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
                <div className="fixed inset-0 z-[9999] flex flex-col animate-fade-in" style={{ background: C.bg }}>
                    {/* ── Full-screen Header ── */}
                    <div className="shrink-0 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-[-30%] right-[-10%] w-80 h-80 rounded-full" style={{ background: `radial-gradient(circle, ${form.glow} 0%, transparent 70%)` }}></div>
                            <div className="absolute bottom-[-30%] left-[-15%] w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(78,205,196,0.1), transparent 70%)' }}></div>
                            {/* Sparkles */}
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="absolute w-1 h-1 rounded-full animate-pulse"
                                    style={{
                                        background: ['#FFD93D', '#4ECDC4', '#FF8C42', '#8B5CF6', '#EC4899', '#10B981', '#60A5FA', '#F472B6'][i],
                                        opacity: 0.5, top: `${10 + i * 10}%`, left: `${5 + i * 12}%`, animationDelay: `${i * 0.3}s`
                                    }}></div>
                            ))}
                        </div>

                        <div className="relative z-10 px-5 pt-12 pb-8">
                            {/* Close button */}
                            <button onClick={() => setShowLevelRulesModal(false)}
                                className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
                                style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
                                <Icons.ChevronLeft size={22} />
                            </button>
                            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-sm font-black text-white/90 tracking-widest flex items-center gap-1.5">精灵进化之路 <HelpTip {...HELP.evolution} size={13} /></div>

                            {/* Current spirit large display */}
                            <div className="flex flex-col items-center mt-4">
                                <div className="text-6xl mb-3" style={{
                                    animation: 'spiritFloat 3s ease-in-out infinite',
                                    filter: `drop-shadow(0 0 20px ${form.glow})`,
                                    '--glow-color': form.glow,
                                }}>{form.emoji}</div>
                                <div className="text-lg font-black text-white mb-1">{activeKid.name} 的守护精灵</div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-black text-white px-3 py-1 rounded-full" style={{ background: `${form.color}50` }}>
                                        {form.emoji} Lv.{activeKid.level} · {maxStar ? '🌟 满星精灵' : form.name}
                                    </span>
                                </div>
                                <div className="text-[11px] font-bold text-white/40 text-center px-8">{form.desc}</div>

                                {/* Mini progress bar */}
                                <div className="w-48 mt-3">
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                        <div className="h-full rounded-full" style={{ width: `${expPercent}%`, background: `linear-gradient(90deg, ${form.color}, ${C.teal})` }}></div>
                                    </div>
                                    <div className="flex justify-between mt-1 text-[8px] font-bold text-white/30">
                                        <span>{activeKid.exp} ✨</span>
                                        <span>{nextLevelExp} ✨</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Scrollable evolution timeline ── */}
                    <div className="flex-1 overflow-y-auto -mt-4 relative z-10 pb-24">
                        <div className="px-5 pt-6 space-y-3 max-w-lg mx-auto">
                            {SPIRIT_FORMS.filter(f => f.id !== 'egg').map((f, i) => {
                                const isCurrent = f.id === form.id;
                                const isPast = activeKid.level > (f.maxLevel || 999);
                                const isFuture = activeKid.level < f.minLevel;
                                const priv = getSpiritPrivileges(f.minLevel);

                                return (
                                    <div key={f.id} className="relative">
                                        {/* Timeline connector */}
                                        {i > 0 && (
                                            <div className="absolute -top-3 left-6 w-0.5 h-3" style={{
                                                background: isFuture ? C.bgMuted : `linear-gradient(${isPast ? C.green : form.color}, ${isPast ? C.green : form.color})`
                                            }}></div>
                                        )}

                                        <div className={`rounded-2xl p-4 transition-all ${isCurrent ? 'ring-2 scale-[1.02]' : ''}`}
                                            style={{
                                                background: isCurrent ? C.bgCard : isFuture ? `${C.bgLight}60` : C.bgCard,
                                                border: isCurrent ? `2px solid ${f.color}40` : `1px solid ${C.bgLight}`,
                                                boxShadow: isCurrent ? `0 8px 24px ${f.glow}` : C.cardShadow,
                                                ringColor: f.color,
                                                opacity: isFuture ? 0.55 : 1,
                                            }}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.bg} flex items-center justify-center text-2xl shadow-md ${isFuture ? 'grayscale' : ''}`}
                                                    style={isCurrent ? { animation: 'spiritFloat 3s ease-in-out infinite' } : {}}>
                                                    {f.emoji}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-sm font-black" style={{ color: isCurrent ? f.color : C.textPrimary }}>{f.name}</span>
                                                        {isCurrent && (
                                                            <span className="text-[8px] font-black px-2 py-0.5 rounded-full text-white animate-pulse" style={{ background: f.color }}>
                                                                ← 当前
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
                                    </div>
                                );
                            })}

                            {/* Max star card */}
                            <div className="relative">
                                <div className="absolute -top-3 left-6 w-0.5 h-3" style={{ background: maxStar ? '#F59E0B' : C.bgMuted }}></div>
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
                            <div className="rounded-xl p-3 text-center" style={{ background: `${C.orange}08` }}>
                                <p className="text-[10px] font-bold" style={{ color: C.textMuted }}>
                                    💡 完成任务和习惯打卡可以获得星尘（经验值），喂养精灵让它进化！
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════
                SPIRIT ALMANAC 精灵图鉴
            ═══════════════════════════════════════════ */}
            {showAlmanac && (
                <div className="fixed inset-0 z-[9999] flex flex-col animate-fade-in" style={{ background: C.bg }}>
                    {/* Header - starry sky */}
                    <div className="shrink-0 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0a1e 0%, #1a1040 40%, #0f3460 100%)' }}>
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {/* Stars */}
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="absolute rounded-full"
                                    style={{
                                        width: `${1 + Math.random() * 2}px`, height: `${1 + Math.random() * 2}px`,
                                        background: '#fff', opacity: 0.3 + Math.random() * 0.4,
                                        top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                                        animation: `sparkle ${2 + Math.random() * 3}s ease-in-out infinite ${Math.random() * 2}s`,
                                    }}></div>
                            ))}
                            {/* Nebula glow */}
                            <div className="absolute top-[-40%] right-[-20%] w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)' }}></div>
                            <div className="absolute bottom-[-40%] left-[-20%] w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(78,205,196,0.1), transparent 70%)' }}></div>
                        </div>

                        <div className="relative z-10 px-5 pt-12 pb-6">
                            <button onClick={() => setShowAlmanac(false)}
                                className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
                                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
                                <Icons.ChevronLeft size={22} />
                            </button>
                            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-sm font-black text-white/90 tracking-widest flex items-center gap-1.5">精灵图鉴 <HelpTip {...HELP.almanac} size={13} /></div>

                            {/* Collection progress */}
                            <div className="flex flex-col items-center mt-4">
                                <div className="text-3xl mb-2">📖</div>
                                <div className="text-base font-black text-white mb-1">精灵收集册</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black px-3 py-1 rounded-full" style={{ background: 'rgba(78,205,196,0.2)', color: '#4ECDC4' }}>
                                        {SPIRIT_FORMS.filter(f => f.id !== 'egg' && activeKid.level >= f.minLevel).length}/{SPIRIT_FORMS.filter(f => f.id !== 'egg').length} 精灵已收集
                                    </span>
                                    {maxStar && (
                                        <span className="text-[10px] font-black px-3 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.2)', color: '#FBBF24' }}>
                                            🌟 满星达成
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable card grid */}
                    <div className="flex-1 overflow-y-auto -mt-3 relative z-10 pb-24">
                        <div className="px-4 pt-5 max-w-lg mx-auto">
                            {/* Spirit Cards Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {SPIRIT_FORMS.filter(f => f.id !== 'egg').map(f => {
                                    const unlocked = activeKid.level >= f.minLevel;
                                    const isCurrent = f.id === form.id;
                                    const priv = getSpiritPrivileges(f.minLevel);
                                    
                                    return (
                                        <div key={f.id} className={`rounded-2xl overflow-hidden transition-all ${isCurrent ? 'scale-[1.03] ring-2' : ''}`}
                                            style={{
                                                background: C.bgCard,
                                                border: isCurrent ? `2px solid ${f.color}50` : `1px solid ${C.bgLight}`,
                                                boxShadow: isCurrent ? `0 8px 24px ${f.glow}` : C.cardShadow,
                                                ringColor: f.color,
                                                opacity: unlocked ? 1 : 0.6,
                                            }}>
                                            {/* Card top - gradient bg */}
                                            <div className={`relative h-24 bg-gradient-to-br ${f.bg} flex items-center justify-center`}
                                                style={{ opacity: unlocked ? 1 : 0.3 }}>
                                                {unlocked ? (
                                                    <div className="text-5xl" style={isCurrent ? {
                                                        animation: 'spiritFloat 3s ease-in-out infinite',
                                                        filter: `drop-shadow(0 0 12px ${f.glow})`,
                                                    } : {}}>
                                                        {f.emoji}
                                                    </div>
                                                ) : (
                                                    <div className="text-4xl opacity-30 grayscale">❓</div>
                                                )}
                                                {isCurrent && (
                                                    <div className="absolute top-2 right-2 text-[8px] font-black px-2 py-0.5 rounded-full text-white animate-pulse" style={{ background: f.color }}>
                                                        当前
                                                    </div>
                                                )}
                                                {unlocked && !isCurrent && (
                                                    <div className="absolute top-2 right-2 text-[8px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.8)', color: C.green }}>
                                                        ✓
                                                    </div>
                                                )}
                                            </div>
                                            {/* Card bottom - info */}
                                            <div className="p-3">
                                                <div className="text-xs font-black mb-0.5" style={{ color: unlocked ? f.color : C.textMuted }}>
                                                    {unlocked ? f.name : '???'}
                                                </div>
                                                <div className="text-[9px] font-bold mb-2" style={{ color: C.textMuted }}>
                                                    {unlocked ? `Lv.${f.minLevel}~${f.maxLevel}` : `Lv.${f.minLevel} 解锁`}
                                                </div>
                                                {unlocked ? (
                                                    <div className="flex gap-1 flex-wrap">
                                                        {priv.interestBonus > 0 && (
                                                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${C.teal}10`, color: C.teal }}>
                                                                💰+{priv.interestBonus}%
                                                            </span>
                                                        )}
                                                        {priv.dailyBonus > 0 && (
                                                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${C.orange}10`, color: C.orange }}>
                                                                🪙+{priv.dailyBonus}
                                                            </span>
                                                        )}
                                                        {priv.shopDiscount > 0 && (
                                                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${C.purple}10`, color: C.purple }}>
                                                                🏷{100 - priv.shopDiscount}折
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <Icons.Lock size={10} style={{ color: C.textMuted }} />
                                                        <span className="text-[8px] font-bold" style={{ color: C.textMuted }}>未解锁</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Max Star Special Card */}
                            <div className="rounded-2xl overflow-hidden mb-6" style={{
                                background: maxStar
                                    ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)'
                                    : C.bgCard,
                                border: maxStar ? '2px solid #F59E0B40' : `1px solid ${C.bgMuted}`,
                                opacity: maxStar ? 1 : 0.5,
                                boxShadow: maxStar ? '0 8px 32px rgba(245,158,11,0.2)' : C.cardShadow,
                            }}>
                                <div className="p-4 flex items-center gap-4">
                                    <div className="text-4xl">{maxStar ? '🌟' : '❓'}</div>
                                    <div className="flex-1">
                                        <div className="text-sm font-black" style={{ color: maxStar ? '#92400E' : C.textMuted }}>
                                            {maxStar ? '满星精灵 · Lv.30' : '??? · Lv.30 解锁'}
                                        </div>
                                        <div className="text-[10px] font-bold" style={{ color: maxStar ? '#B45309' : C.textMuted }}>
                                            {maxStar ? '传说中的至高境界，所有能力全面提升！' : '达到满级即可解锁'}
                                        </div>
                                        {maxStar && (
                                            <div className="flex gap-1.5 mt-2 flex-wrap">
                                                <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg" style={{ background: '#92400E20', color: '#92400E' }}>💰+8%</span>
                                                <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg" style={{ background: '#92400E20', color: '#92400E' }}>🪙+5</span>
                                                <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg" style={{ background: '#92400E20', color: '#92400E' }}>🏷85折</span>
                                                <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg" style={{ background: '#92400E20', color: '#92400E' }}>✨闪光</span>
                                            </div>
                                        )}
                                    </div>
                                    {!maxStar && <Icons.Lock size={16} style={{ color: C.textMuted }} />}
                                </div>
                            </div>

                            {/* Chest Collection */}
                            <div className="rounded-2xl p-4 mb-4" style={{ background: C.bgCard, boxShadow: C.cardShadow, border: `1px solid ${C.bgLight}` }}>
                                <h3 className="text-xs font-black mb-3 flex items-center gap-2" style={{ color: C.textPrimary }}>
                                    🎁 宝箱收集
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${C.yellow}15`, color: '#D97706' }}>
                                        {getUnlockedChests(activeKid.streak_days || 0).length}/{CHEST_TYPES.length}
                                    </span>
                                </h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {CHEST_TYPES.map(chest => {
                                        const unlocked = (activeKid.streak_days || 0) >= chest.streakDays;
                                        return (
                                            <div key={chest.id} className="flex flex-col items-center p-2 rounded-xl transition-all"
                                                style={{ background: unlocked ? `${chest.color}08` : C.bg, opacity: unlocked ? 1 : 0.4 }}>
                                                <div className="w-10 h-10 mb-1 flex items-center justify-center">
                                                    {unlocked ? (
                                                        <img src={chest.image} alt={chest.name} className="w-10 h-10 object-contain drop-shadow-md"
                                                            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                                                    ) : null}
                                                    <span style={{ display: unlocked ? 'none' : 'block' }} className="text-xl">🔒</span>
                                                </div>
                                                <div className="text-[8px] font-black" style={{ color: unlocked ? chest.color : C.textMuted }}>{chest.name}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Spirit Naming Modal ── */}
            {showNamingModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6"
                    style={{ background: 'rgba(27,46,75,0.3)', backdropFilter: 'blur(6px)' }}
                    onClick={() => setShowNamingModal(false)}>
                    <div className="relative max-w-xs w-full rounded-3xl overflow-hidden"
                        style={{ background: C.bgCard, boxShadow: '0 25px 60px rgba(27,46,75,0.15)', animation: 'helpBounceIn 0.35s ease-out forwards' }}
                        onClick={e => e.stopPropagation()}>
                        <div className="px-6 pt-6 pb-3 text-center">
                            <div className="text-4xl mb-2">{form.emoji}</div>
                            <h3 className="text-base font-black" style={{ color: C.textPrimary }}>
                                {activeKid.spirit_name ? '修改精灵名字' : '给精灵取个名字吧！'}
                            </h3>
                            <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                                取一个可爱的名字，让精灵更有归属感 💕
                            </p>
                        </div>
                        <div className="px-6 pb-3">
                            <input
                                type="text"
                                value={spiritNameInput}
                                onChange={e => setSpiritNameInput(e.target.value.slice(0, 10))}
                                placeholder="最多10个字..."
                                maxLength={10}
                                autoFocus
                                className="w-full px-4 py-3 rounded-xl text-sm font-bold text-center outline-none transition-all"
                                style={{
                                    background: C.bg,
                                    border: `2px solid ${C.teal}40`,
                                    color: C.textPrimary,
                                }}
                                onFocus={e => e.target.style.borderColor = C.teal}
                                onBlur={e => e.target.style.borderColor = `${C.teal}40`}
                            />
                            <div className="text-[10px] text-right mt-1" style={{ color: C.textMuted }}>
                                {spiritNameInput.length}/10
                            </div>
                        </div>
                        <div className="px-6 pb-5 flex gap-2">
                            <button
                                onClick={() => setShowNamingModal(false)}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
                                style={{ background: C.bgLight, color: C.textMuted }}>
                                取消
                            </button>
                            <button
                                onClick={async () => {
                                    const name = spiritNameInput.trim();
                                    if (name) {
                                        await updateActiveKid({ spirit_name: name });
                                        setShowNamingModal(false);
                                    }
                                }}
                                disabled={!spiritNameInput.trim()}
                                className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all active:scale-[0.98] disabled:opacity-40"
                                style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.teal}DD)` }}>
                                确定 ✨
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
