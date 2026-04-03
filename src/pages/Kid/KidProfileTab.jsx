import React, { useMemo, useState, useEffect } from 'react';
import { useDataContext } from '../../context/DataContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons, AvatarDisplay } from '../../utils/Icons';
import { getLevelReq } from '../../utils/levelUtils';
import {
    getSpiritForm, getSpiritPrivileges, getSpiritMessage,
    SPIRIT_FORMS, getCurrentTerm
} from '../../utils/spiritUtils';
import { useNavigationStore } from '../../stores/navigationStore';
import { ACHIEVEMENTS } from '../../utils/achievements';
import PetBoxTeaser from '../../components/VirtualPet/PetBoxTeaser';
import VirtualPetDashboard from '../../components/VirtualPet/VirtualPetDashboard';
import { ExpHistoryModal } from './ExpHistoryModal';
import { LevelPrivilegeModal } from '../../components/modals/LevelPrivilegeModal';
import { usePetRooms } from '../../hooks/usePetRooms';

// ── Global CSS ────────────────────────────────────────────────────
const CSS = `
@keyframes drawerIn {
    from { transform:translateY(100%); opacity:0; }
    to   { transform:translateY(0);    opacity:1; }
}
@keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(255,140,66,0.3); }
    50%       { box-shadow: 0 0 40px rgba(255,140,66,0.6); }
}
@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-6px); }
}
@keyframes shimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
}
.pet-float { animation: float 3s ease-in-out infinite; }
.xp-shimmer::after {
  content:''; position:absolute; inset:0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 2s infinite;
}
`;

// ── Pet Card ─────────────────────────────────────────────────────
function PetCard({ activeKid, onOpenRoom }) {
    const { rooms, activeRoom, activeRoomIdx, setActiveRoomIdx, loading } = usePetRooms(activeKid?.id);
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setTimedOut(true), 5000);
        return () => clearTimeout(t);
    }, []);

    if (!loading && (rooms.length === 0 || !activeRoom) || (!loading && timedOut)) {
        return (
            <div onClick={onOpenRoom} className="cursor-pointer rounded-[2rem] mb-4 p-5 flex items-center gap-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{ background: 'linear-gradient(135deg, #FFF5EE, #FFEDE0)', border: '1.5px dashed #FFB875' }}>
                <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl flex-shrink-0">🐾</div>
                <div className="flex-1 min-w-0">
                    <div className="font-black text-slate-700 text-sm">布置你的第一个小窝</div>
                    <div className="text-[11px] text-orange-400 font-bold mt-0.5">你的宠物在等你 →</div>
                </div>
            </div>
        );
    }

    if (loading && !timedOut) {
        return <div className="rounded-[2rem] mb-4 h-28 animate-pulse bg-slate-100" />;
    }

    const hunger = activeRoom?.petHunger ?? 100;
    const mood = activeRoom?.petMood ?? 100;

    const Bar = ({ val, label, color, bg }) => (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">{label}</span>
                <span className="text-[10px] font-black" style={{ color }}>{val}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: bg }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${val}%`, background: color }} />
            </div>
        </div>
    );

    return (
        <div className="rounded-[2rem] mb-4 overflow-hidden" style={{ background: '#FFFAF6', border: '1.5px solid #F0E6D6', boxShadow: '0 8px 30px rgba(255,140,66,0.08)' }}>
            <div className="relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #FFF0E0 0%, #FFE4C8 50%, #FFDAB5 100%)', height: 120 }}>
                {/* Decorative circles */}
                <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #FFB347, transparent)' }} />
                <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #FF8C42, transparent)' }} />

                {/* Pet & room name */}
                <div className="absolute left-4 top-4 z-10">
                    <div className="text-sm font-black text-slate-700">{activeRoom?.roomName || '我的小窝'}</div>
                    {activeKid.spirit_name && <div className="text-[10px] text-orange-500 font-bold mt-0.5">「{activeKid.spirit_name}」</div>}
                </div>

                {/* Room tabs */}
                {rooms.length > 1 && (
                    <div className="absolute top-4 right-4 z-10 flex gap-1.5">
                        {rooms.map((r, i) => (
                            <button key={r.id} onClick={(e) => { e.stopPropagation(); setActiveRoomIdx(i); }}
                                className="text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm transition-all"
                                style={{ background: i === activeRoomIdx ? '#FF8C42' : 'rgba(255,255,255,0.8)', color: i === activeRoomIdx ? 'white' : '#9CAABE' }}>
                                {r.roomName || `小窝 ${i + 1}`}
                            </button>
                        ))}
                    </div>
                )}

                {/* Pet in center */}
                <div className="absolute inset-0 flex items-center justify-center pet-float" style={{ paddingTop: 20 }}>
                    <div className="w-20 h-20">
                        <PetBoxTeaser size={80} />
                    </div>
                </div>

                {/* Enter button */}
                <button onClick={onOpenRoom}
                    className="absolute bottom-3 right-4 z-10 flex items-center gap-1 text-[10px] font-black bg-white/70 backdrop-blur-sm text-orange-500 px-3 py-1.5 rounded-full border border-orange-100 transition-all hover:bg-white hover:scale-105 shadow-sm">
                    进入小窝 <Icons.ChevronRight size={11} />
                </button>
            </div>

            {/* Vitals strip */}
            <div className="px-5 py-3 flex gap-6">
                <div className="flex-1">
                    <Bar val={mood} label="心情" color="#4ECDC4" bg="#E0F7F6" />
                </div>
                <div className="flex-1">
                    <Bar val={hunger} label="饱腹" color="#FF8C42" bg="#FFF0E5" />
                </div>
            </div>
        </div>
    );
}

// ── Badge Drawer ─────────────────────────────────────────────────
function BadgeDrawer({ badge, onClose }) {
    if (!badge) return null;
    return (
        <div className="fixed inset-0 z-[500] flex flex-col justify-end" onClick={onClose}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            <div
                className="relative bg-white rounded-t-[2rem] max-h-[80vh] flex flex-col"
                style={{ animation: 'drawerIn 0.35s cubic-bezier(0.34,1.2,0.64,1)', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-center pt-3 pb-2 shrink-0">
                    <div className="w-10 h-1.5 rounded-full bg-slate-200" />
                </div>
                <div className="px-6 pb-6 overflow-y-auto min-h-0 flex-1">
                    <div className="flex flex-col items-center gap-2 py-5">
                        <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${badge.bg} flex items-center justify-center text-4xl shadow-xl ${!badge.unlocked ? 'grayscale opacity-40' : ''}`}>
                            {badge.unlocked ? badge.emoji : <Icons.Lock size={32} className="text-gray-400" />}
                        </div>
                        <div className="text-xl font-black text-slate-800 text-center mt-2">{badge.title}</div>
                        <span className="px-3 py-1.5 rounded-full text-[11px] font-bold"
                            style={{ background: badge.unlocked ? '#DCFCE7' : '#F1F5F9', color: badge.unlocked ? '#16A34A' : '#94A3B8' }}>
                            {badge.unlocked ? '✓ 已解锁' : '尚未解锁'}
                        </span>
                    </div>
                    <div className="rounded-2xl p-4 mb-5 bg-slate-50 border border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">获得条件</div>
                        <div className="text-sm font-bold text-slate-700">{badge.desc}</div>
                        <div className="mt-3 text-xs font-bold" style={{ color: badge.unlocked ? '#16A34A' : '#FF8C42' }}>
                            {badge.unlocked ? '🎉 你已经做到了，太棒了！' : '💪 加油完成条件即可解锁！'}
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-black text-sm bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">关闭</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main ─────────────────────────────────────────────────────────
export const KidProfileTab = () => {
    const { kids, activeKidId, transactions } = useDataContext();
    const { parentSettings } = useNavigationStore();
    const { setShowAvatarPickerModal } = useUIContext();

    const [badgeDrawer,             setBadgeDrawer]             = useState(null);
    const [showPetRoom,             setShowPetRoom]             = useState(false);
    const [showExpModal,            setShowExpModal]            = useState(false);
    const [showLevelPrivilegeModal, setShowLevelPrivilegeModal] = useState(false);

    const activeKid = kids.find(k => k.id === activeKidId);
    if (!activeKid) return null;

    const nextLevelExp = getLevelReq(activeKid.level);
    const form = getSpiritForm(activeKid.level);
    const privileges = getSpiritPrivileges(activeKid.level);
    const term = getCurrentTerm(parentSettings);
    const expPercent = Math.max(0, Math.min(100, (activeKid.exp / nextLevelExp) * 100));

    const achievementStatus = useMemo(() =>
        ACHIEVEMENTS.map(a => ({ ...a, unlocked: a.check(activeKid, transactions) })),
        [activeKid, transactions]
    );
    const unlockedCount = achievementStatus.filter(a => a.unlocked).length;

    const PRIV_ITEMS = [
        { label: '利息加成', val: privileges.interestBonus > 0 ? `+${privileges.interestBonus}%` : '--', active: privileges.interestBonus > 0, gradient: 'linear-gradient(135deg, #0EA5E9, #06B6D4)', Icon: Icons.TrendingUp },
        { label: '每日奖励', val: privileges.dailyBonus > 0 ? `+${privileges.dailyBonus}` : '--', active: privileges.dailyBonus > 0, gradient: 'linear-gradient(135deg, #FF8C42, #FFD93D)', Icon: Icons.Sparkles },
        { label: '商城折扣', val: privileges.shopDiscount > 0 ? `${100 - privileges.shopDiscount}折` : '--', active: privileges.shopDiscount > 0, gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)', Icon: Icons.Tag },
    ];

    return (
        <div className="animate-fade-in pb-28 md:pb-10 pt-2 max-w-4xl mx-auto">
            <style>{CSS}</style>

            {showPetRoom && <VirtualPetDashboard activeKid={activeKid} onClose={() => setShowPetRoom(false)} />}
            <BadgeDrawer badge={badgeDrawer} onClose={() => setBadgeDrawer(null)} />
            {showExpModal && <ExpHistoryModal activeKid={activeKid} transactions={transactions} nextLevelExp={nextLevelExp} onClose={() => setShowExpModal(false)} />}
            <LevelPrivilegeModal isOpen={showLevelPrivilegeModal} onClose={() => setShowLevelPrivilegeModal(false)} activeKid={activeKid} currentForm={form} />

            {/* ════════════════════════════════════════
                HERO 卡片 — 全宽深色沉浸卡
            ════════════════════════════════════════ */}
            <div className="relative rounded-[2.5rem] overflow-hidden mb-6"
                style={{
                    background: 'linear-gradient(145deg, #0F1923 0%, #1A2744 40%, #0D2137 100%)',
                    boxShadow: `0 24px 60px rgba(15,25,35,0.4), 0 0 0 1px rgba(255,255,255,0.04)`,
                    minHeight: 220,
                }}>
                {/* Colour orbs behind */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-25"
                        style={{ background: `radial-gradient(circle, ${form.color}, transparent 70%)`, filter: 'blur(30px)' }} />
                    <div className="absolute -bottom-16 -left-12 w-56 h-56 rounded-full opacity-15"
                        style={{ background: 'radial-gradient(circle, #4ECDC4, transparent 70%)', filter: 'blur(24px)' }} />
                    {/* Grid texture */}
                    <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                {/* Term pill top-right */}
                <div className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}>
                    {term.emoji} {term.name} · {term.daysLeft}天
                </div>

                {/* Content */}
                <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:gap-12">

                    {/* === Left/Top: Avatar === */}
                    <button
                        onClick={() => setShowAvatarPickerModal(true)}
                        className="group relative self-center md:self-auto flex-shrink-0 mb-6 md:mb-0"
                    >
                        {/* Multi-ring glow */}
                        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ boxShadow: `0 0 0 6px ${form.color}30, 0 0 30px ${form.color}40` }} />
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full"
                            style={{
                                padding: 3,
                                background: `conic-gradient(from 180deg, ${form.color}, rgba(255,255,255,0.2) 40%, ${form.color} 60%, rgba(255,255,255,0.4))`,
                                boxShadow: `0 8px 32px ${form.color}50`,
                            }}>
                            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center text-5xl"
                                style={{ background: '#0D1A2B' }}>
                                <AvatarDisplay avatar={activeKid.avatar} />
                            </div>
                        </div>
                        {/* Camera on hover */}
                        <div className="absolute inset-[3px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
                            <Icons.Camera size={22} className="text-white" />
                        </div>
                    </button>

                    {/* === Right/Bottom: Info === */}
                    <div className="flex-1 min-w-0 text-center md:text-left">
                        {/* Name */}
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none mb-3">
                            {activeKid.name}
                        </h2>

                        {/* Level badge */}
                        <button onClick={() => setShowLevelPrivilegeModal(true)}
                            className="inline-flex items-center gap-2 mb-5 group">
                            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-black text-white bg-gradient-to-r ${form.bg} shadow-md transition-all group-hover:shadow-lg group-hover:scale-105 active:scale-95`}
                                style={{ boxShadow: `0 4px 16px ${form.color}40` }}>
                                Lv.{activeKid.level} · {form.name}
                                <Icons.ChevronRight size={12} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                        </button>

                        {/* XP bar */}
                        <button className="block w-full md:min-w-[280px] text-left group" onClick={() => setShowExpModal(true)}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-white/40 tracking-widest uppercase group-hover:text-white/60 transition-colors">学习星尘</span>
                                <span className="text-[11px] font-black text-white/70 group-hover:text-white/90 transition-colors">
                                    {activeKid.exp} <span className="text-white/30 font-bold">/ {nextLevelExp}</span>
                                </span>
                            </div>
                            {/* Bar track */}
                            <div className="h-2 rounded-full relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                <div className="absolute inset-y-0 left-0 rounded-full xp-shimmer relative overflow-hidden transition-all duration-1000"
                                    style={{ width: `${expPercent}%`, background: 'linear-gradient(90deg, #4ade80, #a3e635, #facc15)', boxShadow: '0 0 12px rgba(74,222,128,0.5)' }} />
                            </div>
                            <div className="text-[9px] font-bold text-white/25 group-hover:text-white/45 mt-1.5 text-right transition-colors">
                                点击查看明细 →
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════
                STATS ROW — 3 mini-stat cards
            ════════════════════════════════════════ */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                    { label: '已完成任务', val: transactions.filter(t => t.kidId === activeKid.id && t.type === 'income').length, suffix: '个', gradient: 'linear-gradient(135deg, #667EEA, #764BA2)', icon: Icons.CheckSquare },
                    { label: '成就徽章', val: `${unlockedCount}/${ACHIEVEMENTS.length}`, suffix: '', gradient: 'linear-gradient(135deg, #F093FB, #F5576C)', icon: Icons.Award },
                    { label: '学习等级', val: `Lv.${activeKid.level}`, suffix: '', gradient: `linear-gradient(135deg, ${form.color}, #facc15)`, icon: Icons.Star },
                ].map((s, i) => (
                    <div key={i} className="rounded-[1.5rem] p-4 text-center relative overflow-hidden hover:scale-[1.02] transition-transform cursor-default"
                        style={{ background: s.gradient, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
                        {/* Faint circle decoration */}
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full" />
                        <s.icon size={18} className="text-white/70 mx-auto mb-1.5" strokeWidth={2} />
                        <div className="text-lg md:text-xl font-black text-white leading-none">{s.val}{s.suffix}</div>
                        <div className="text-[9px] md:text-[10px] font-bold text-white/60 mt-1 tracking-wide">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* ════════════════════════════════════════
                PET SECTION
            ════════════════════════════════════════ */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-base font-black text-slate-800">我的宠物</h3>
                    <button onClick={() => setShowPetRoom(true)} className="text-[11px] font-black text-orange-400 hover:text-orange-500 transition-colors flex items-center gap-0.5">
                        进入小窝 <Icons.ChevronRight size={13} />
                    </button>
                </div>
                <PetCard activeKid={activeKid} onOpenRoom={() => setShowPetRoom(true)} />
            </div>

            {/* ════════════════════════════════════════
                PRIVILEGES SECTION — horizontal scroll
            ════════════════════════════════════════ */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-base font-black text-slate-800">MiniLife 特权</h3>
                    <button onClick={() => setShowLevelPrivilegeModal(true)}
                        className="text-[11px] font-black flex items-center gap-0.5 transition-colors"
                        style={{ color: form.color }}>
                        全部特权 <Icons.ChevronRight size={13} />
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {PRIV_ITEMS.map((p, i) => (
                        <div key={i} className={`rounded-[1.5rem] p-4 relative overflow-hidden transition-all ${p.active ? 'hover:scale-[1.02]' : ''}`}
                            style={{
                                background: p.active ? p.gradient : '#F8FAFC',
                                boxShadow: p.active ? '0 8px 24px rgba(0,0,0,0.15)' : 'none',
                                border: p.active ? 'none' : '1.5px solid #E2E8F0',
                            }}>
                            {p.active && <div className="absolute -right-3 -top-3 w-12 h-12 bg-white/10 rounded-full" />}
                            <p.Icon size={18} className={p.active ? 'text-white/80 mb-2' : 'text-slate-300 mb-2'} strokeWidth={2} />
                            <div className={`text-base font-black leading-none ${p.active ? 'text-white' : 'text-slate-300'}`}>{p.val}</div>
                            <div className={`text-[10px] font-bold mt-1 ${p.active ? 'text-white/60' : 'text-slate-400'}`}>{p.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ════════════════════════════════════════
                ACHIEVEMENTS — masonry badge grid
            ════════════════════════════════════════ */}
            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-base font-black text-slate-800">成就勋章</h3>
                    <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-orange-50 text-orange-400">
                        {unlockedCount} / {ACHIEVEMENTS.length}
                    </span>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {achievementStatus.map(a => (
                        <button key={a.id}
                            onClick={() => setBadgeDrawer(a)}
                            className="rounded-[1.5rem] p-3.5 flex flex-col items-center text-center transition-all hover:scale-105 active:scale-95 relative overflow-hidden"
                            style={{
                                background: a.unlocked ? 'white' : '#F8FAFC',
                                boxShadow: a.unlocked ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
                                border: a.unlocked ? '1.5px solid rgba(0,0,0,0.04)' : '1.5px solid #EEF2F7',
                                filter: a.unlocked ? 'none' : 'grayscale(1)',
                                opacity: a.unlocked ? 1 : 0.45,
                            }}>
                            {a.unlocked && (
                                <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
                            )}
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.bg} flex items-center justify-center text-2xl mb-2.5 shadow-inner`}
                                style={{ boxShadow: a.unlocked ? `0 6px 16px ${a.bg.includes('amber') ? 'rgba(245,158,11,0.3)' : 'rgba(99,102,241,0.3)'}` : 'none' }}>
                                {a.unlocked ? a.emoji : <Icons.Lock size={14} className="text-white/60" />}
                            </div>
                            <div className="text-[10px] font-black leading-tight text-slate-700 truncate w-full">{a.title}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
