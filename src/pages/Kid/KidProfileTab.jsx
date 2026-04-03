import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useDataContext } from '../../context/DataContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons, AvatarDisplay } from '../../utils/Icons';
import { getLevelReq } from '../../utils/levelUtils';
import { getSpiritForm, getSpiritPrivileges, getCurrentTerm } from '../../utils/spiritUtils';
import { useNavigationStore } from '../../stores/navigationStore';
import { ACHIEVEMENTS } from '../../utils/achievements';
import PetBoxTeaser from '../../components/VirtualPet/PetBoxTeaser';
import VirtualPetDashboard from '../../components/VirtualPet/VirtualPetDashboard';
import { ExpHistoryModal } from './ExpHistoryModal';
import { LevelPrivilegeModal } from '../../components/modals/LevelPrivilegeModal';
import { usePetRooms } from '../../hooks/usePetRooms';

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — ONE place, ONE language
   Every section uses these. Nothing deviates.
═══════════════════════════════════════════════════════════════ */
const T = {
    // Page
    pageBg: '#F7F4F0',

    // Cards — all identical treatment
    cardBg:     '#FFFFFF',
    cardRadius: '1.5rem',            // 24px
    cardBorder: '1px solid #EDEBE7',
    cardShadow: '0 2px 16px rgba(30,20,10,0.06)',

    // Brand palette — orange-first, warm
    orange:    '#FF8C42',
    orangeLight: '#FFF3EB',
    orangeMid:   '#FFE0C8',
    amber:     '#F59E0B',
    green:     '#22C55E',
    teal:      '#14B8A6',
    purple:    '#8B5CF6',
    red:       '#EF4444',

    // Text
    text1: '#1C1410',   // headings
    text2: '#6B5E52',   // secondary
    text3: '#A8998C',   // disabled / labels

    // Accent tinted (for locked/muted states)
    muted: '#F0ECE8',
};

/* ═══════════════════════════════════════════════════════════════
   SECTION HEADER — used for every section
═══════════════════════════════════════════════════════════════ */
function SectionHeader({ title, right }) {
    return (
        <div className="flex items-center justify-between mb-3 px-0.5">
            <h3 className="font-black text-[15px] tracking-tight" style={{ color: T.text1 }}>{title}</h3>
            {right}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   CARD — wrapper giving every card the same look
═══════════════════════════════════════════════════════════════ */
function Card({ children, className = '', onClick, style = {} }) {
    return (
        <div
            onClick={onClick}
            className={`overflow-hidden ${onClick ? 'cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]' : ''} ${className}`}
            style={{
                background:   T.cardBg,
                borderRadius: T.cardRadius,
                border:       T.cardBorder,
                boxShadow:    T.cardShadow,
                ...style,
            }}
        >
            {children}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   PET CARD
═══════════════════════════════════════════════════════════════ */
function PetCard({ activeKid, onOpenRoom }) {
    const { rooms, activeRoom, activeRoomIdx, setActiveRoomIdx, loading } = usePetRooms(activeKid?.id);
    const [timedOut, setTimedOut] = useState(false);
    useEffect(() => { const t = setTimeout(() => setTimedOut(true), 5000); return () => clearTimeout(t); }, []);

    if (!loading && (rooms.length === 0 || !activeRoom) && timedOut) {
        return (
            <Card onClick={onOpenRoom} className="mb-4 p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: T.orangeLight }}>🐾</div>
                <div className="flex-1 min-w-0">
                    <div className="font-black text-sm" style={{ color: T.text1 }}>还没有小窝</div>
                    <div className="text-xs font-bold mt-0.5" style={{ color: T.orange }}>点击布置你的第一个宠物房间 →</div>
                </div>
            </Card>
        );
    }
    if (loading && !timedOut) {
        return <div className="rounded-[1.5rem] h-32 animate-pulse mb-4" style={{ background: T.muted }} />;
    }

    const hunger = activeRoom?.petHunger ?? 100;
    const mood   = activeRoom?.petMood   ?? 100;

    const StatusBar = ({ label, value, color }) => (
        <div className="flex items-center gap-2.5">
            <div className="text-[11px] font-bold w-8 shrink-0" style={{ color: T.text3 }}>{label}</div>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: T.muted }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
            </div>
            <div className="text-[11px] font-black w-7 text-right" style={{ color }}>{value}%</div>
        </div>
    );

    return (
        <Card className="mb-4">
            {/* Preview strip */}
            <div className="relative h-36 flex items-end overflow-hidden"
                style={{ background: `linear-gradient(160deg, #FFF8F3 0%, ${T.orangeMid} 100%)` }}>
                {/* Room tabs */}
                {rooms.length > 1 && (
                    <div className="absolute top-3 left-4 flex gap-1.5 z-10">
                        {rooms.map((r, i) => (
                            <button key={r.id}
                                onClick={e => { e.stopPropagation(); setActiveRoomIdx(i); }}
                                className="text-[9px] font-black px-2.5 py-1 rounded-full transition-all"
                                style={{ background: i === activeRoomIdx ? T.orange : 'rgba(255,255,255,0.8)', color: i === activeRoomIdx ? '#fff' : T.text2 }}>
                                {r.roomName || `小窝 ${i + 1}`}
                            </button>
                        ))}
                    </div>
                )}
                {/* Pet */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: 16 }}>
                    <div style={{ width: 96, height: 96 }}>
                        <PetBoxTeaser size={90} />
                    </div>
                </div>
                {/* Enter CTA */}
                <button onClick={onOpenRoom} className="absolute bottom-3 right-4 z-10 flex items-center gap-1 text-[11px] font-black px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                    style={{ background: 'rgba(255,255,255,0.85)', color: T.orange, backdropFilter: 'blur(6px)' }}>
                    进入小窝 <Icons.ChevronRight size={12} />
                </button>
                {/* Room name */}
                <div className="relative z-10 px-4 pb-3 flex items-baseline gap-2">
                    <span className="font-black text-sm" style={{ color: T.text1 }}>{activeRoom?.roomName || '我的小窝'}</span>
                    {activeKid.spirit_name && <span className="text-[10px] font-bold" style={{ color: T.text2 }}>「{activeKid.spirit_name}」</span>}
                </div>
            </div>
            {/* Vitals */}
            <div className="px-5 py-4 space-y-2.5">
                <StatusBar label="心情" value={mood}   color={mood   > 50 ? T.teal : T.red} />
                <StatusBar label="饱腹" value={hunger} color={hunger > 50 ? T.orange : T.red} />
            </div>
        </Card>
    );
}

/* ═══════════════════════════════════════════════════════════════
   BADGE DRAWER
═══════════════════════════════════════════════════════════════ */
function BadgeDrawer({ badge, onClose }) {
    if (!badge) return null;
    return (
        <div className="fixed inset-0 z-[500] flex flex-col justify-end" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative bg-white rounded-t-[2rem] max-h-[80vh] flex flex-col"
                style={{ animation: 'drawerIn .3s ease-out', paddingBottom: 'env(safe-area-inset-bottom,16px)' }}
                onClick={e => e.stopPropagation()}>
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-9 h-1 rounded-full bg-slate-200" />
                </div>
                <div className="px-6 pb-8 overflow-y-auto">
                    <div className="flex flex-col items-center pt-4 pb-6">
                        <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${badge.bg} flex items-center justify-center text-4xl shadow-lg ${!badge.unlocked ? 'grayscale opacity-40' : ''}`}>
                            {badge.unlocked ? badge.emoji : <Icons.Lock size={28} className="text-white/60" />}
                        </div>
                        <div className="text-xl font-black text-center mt-4" style={{ color: T.text1 }}>{badge.title}</div>
                        <div className="text-xs font-bold mt-1.5 px-3 py-1 rounded-full"
                            style={{ background: badge.unlocked ? '#DCFCE7' : T.muted, color: badge.unlocked ? '#16A34A' : T.text3 }}>
                            {badge.unlocked ? '已解锁' : '尚未解锁'}
                        </div>
                    </div>
                    <div className="rounded-2xl p-4 mb-5" style={{ background: T.muted, border: T.cardBorder }}>
                        <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: T.text3 }}>获得条件</div>
                        <div className="text-sm font-bold" style={{ color: T.text1 }}>{badge.desc}</div>
                        <div className="text-xs font-bold mt-2.5" style={{ color: badge.unlocked ? T.green : T.orange }}>
                            {badge.unlocked ? '🎉 已完成，非常棒！' : '💪 还差一点，加油！'}
                        </div>
                    </div>
                    <button onClick={onClose} className="w-full py-3 rounded-xl font-black text-sm transition-colors hover:opacity-80"
                        style={{ background: T.muted, color: T.text2 }}>关闭</button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN — KidProfileTab
═══════════════════════════════════════════════════════════════ */
export const KidProfileTab = () => {
    const { kids, activeKidId, transactions } = useDataContext();
    const { parentSettings } = useNavigationStore();
    const { setShowAvatarPickerModal } = useUIContext();

    const [badgeDrawer,             setBadgeDrawer]             = useState(null);
    const [showPetRoom,             setShowPetRoom]             = useState(false);
    const [showExpModal,            setShowExpModal]            = useState(false);
    const [showLevelPrivilegeModal, setShowLevelPrivilegeModal] = useState(false);

    const activeKid    = kids.find(k => k.id === activeKidId);
    if (!activeKid) return null;

    const nextLevelExp = getLevelReq(activeKid.level);
    const form         = getSpiritForm(activeKid.level);
    const privileges   = getSpiritPrivileges(activeKid.level);
    const term         = getCurrentTerm(parentSettings);
    const expPercent   = Math.min(100, Math.max(0, (activeKid.exp / nextLevelExp) * 100));

    const achievementStatus = useMemo(() =>
        ACHIEVEMENTS.map(a => ({ ...a, unlocked: a.check(activeKid, transactions) })),
        [activeKid, transactions]
    );
    const unlockedCount = achievementStatus.filter(a => a.unlocked).length;

    const privItems = [
        { label: '利息加成', value: privileges.interestBonus > 0 ? `+${privileges.interestBonus}%/周` : '未解锁', active: privileges.interestBonus > 0, color: T.teal, Icon: Icons.TrendingUp },
        { label: '每日奖励', value: privileges.dailyBonus    > 0 ? `+${privileges.dailyBonus}`      : '未解锁', active: privileges.dailyBonus    > 0, color: T.amber,  Icon: Icons.Sparkles  },
        { label: '商城折扣', value: privileges.shopDiscount  > 0 ? `${100 - privileges.shopDiscount}折` : '未解锁', active: privileges.shopDiscount  > 0, color: T.purple, Icon: Icons.Tag       },
    ];

    return (
        <div className="pb-28 md:pb-12 pt-3 max-w-2xl mx-auto" style={{ background: T.pageBg }}>
            <style>{`
                @keyframes drawerIn { from { transform:translateY(30px); opacity:0; } to { transform:translateY(0); opacity:1; } }
                @keyframes xpShimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
            `}</style>

            {showPetRoom    && <VirtualPetDashboard activeKid={activeKid} onClose={() => setShowPetRoom(false)} />}
            <BadgeDrawer     badge={badgeDrawer} onClose={() => setBadgeDrawer(null)} />
            {showExpModal   && <ExpHistoryModal   activeKid={activeKid} transactions={transactions} nextLevelExp={nextLevelExp} onClose={() => setShowExpModal(false)} />}
            <LevelPrivilegeModal isOpen={showLevelPrivilegeModal} onClose={() => setShowLevelPrivilegeModal(false)} activeKid={activeKid} currentForm={form} />

            {/* ──────────────────────────────────────────
                HERO CARD
                White card. Level colour tints ONE accent band at top.
                Avatar + name + XP side by side on tablet+, stacked on phone.
            ────────────────────────────────────────── */}
            <Card className="mb-4">
                {/* Thin accent band */}
                <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${form.color}, ${form.color}88)` }} />

                <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center md:gap-8">
                    {/* Avatar */}
                    <button
                        onClick={() => setShowAvatarPickerModal(true)}
                        className="group relative self-center flex-shrink-0 mb-5 md:mb-0 transition-transform hover:scale-[1.03] active:scale-[0.97]"
                    >
                        {/* Avatar ring in level colour */}
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full flex-shrink-0"
                            style={{ padding: 3, background: `linear-gradient(135deg, ${form.color}, ${form.color}44)` }}>
                            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center text-5xl bg-white">
                                <AvatarDisplay avatar={activeKid.avatar} />
                            </div>
                        </div>
                        {/* Hover */}
                        <div className="absolute inset-[3px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                            <Icons.Camera size={20} className="text-white" />
                        </div>
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0 text-center md:text-left">
                        {/* Name + term */}
                        <div className="flex items-center gap-2 justify-center md:justify-start mb-1.5 flex-wrap">
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: T.text1 }}>
                                {activeKid.name}
                            </h2>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: T.muted, color: T.text3 }}>
                                {term.name}
                            </span>
                        </div>

                        {/* Level */}
                        <button
                            onClick={() => setShowLevelPrivilegeModal(true)}
                            className="inline-flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-full font-black text-xs text-white transition-all hover:opacity-85 active:scale-95"
                            style={{ background: form.color, boxShadow: `0 4px 12px ${form.color}50` }}
                        >
                            Lv.{activeKid.level} · {form.name}
                            <Icons.ChevronRight size={12} className="opacity-75" />
                        </button>

                        {/* XP bar */}
                        <button
                            className="block w-full text-left group rounded-xl p-3 transition-colors hover:bg-slate-50"
                            onClick={() => setShowExpModal(true)}
                        >
                            <div className="flex justify-between items-baseline mb-2">
                                <span className="text-[11px] font-black tracking-widest uppercase" style={{ color: T.text3 }}>学习星尘 ✨</span>
                                <span className="text-[11px] font-bold" style={{ color: T.text2 }}>
                                    {activeKid.exp} <span style={{ color: T.text3 }}>/ {nextLevelExp}</span>
                                </span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ background: T.muted }}>
                                <div
                                    className="h-full rounded-full transition-all duration-1000"
                                    style={{
                                        width: `${expPercent}%`,
                                        background: `linear-gradient(90deg, ${T.green}, ${T.amber})`,
                                        boxShadow: `0 0 8px ${T.green}60`,
                                    }}
                                />
                            </div>
                            <div className="text-[10px] font-bold mt-1.5 text-right transition-colors group-hover:opacity-100 opacity-50" style={{ color: T.text3 }}>
                                还需 {nextLevelExp - activeKid.exp} 星尘升级 →
                            </div>
                        </button>
                    </div>
                </div>
            </Card>

            {/* ──────────────────────────────────────────
                PET
            ────────────────────────────────────────── */}
            <SectionHeader
                title="我的宠物"
                right={
                    <button onClick={() => setShowPetRoom(true)} className="text-xs font-black flex items-center gap-0.5 transition-opacity hover:opacity-60" style={{ color: T.orange }}>
                        进入小窝 <Icons.ChevronRight size={13} />
                    </button>
                }
            />
            <PetCard activeKid={activeKid} onOpenRoom={() => setShowPetRoom(true)} />

            {/* ──────────────────────────────────────────
                PRIVILEGES
            ────────────────────────────────────────── */}
            <SectionHeader
                title="MiniLife 特权"
                right={
                    <button onClick={() => setShowLevelPrivilegeModal(true)} className="text-xs font-black flex items-center gap-0.5 transition-opacity hover:opacity-60" style={{ color: form.color }}>
                        全部等阶 <Icons.ChevronRight size={13} />
                    </button>
                }
            />
            <div className="grid grid-cols-3 gap-3 mb-6">
                {privItems.map((p, i) => (
                    <Card key={i} className="p-4 flex flex-col items-start gap-3"
                        style={{ opacity: p.active ? 1 : 0.5 }}>
                        {/* Icon in tinted circle */}
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: p.active ? `${p.color}18` : T.muted }}>
                            <p.Icon size={16} style={{ color: p.active ? p.color : T.text3 }} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className="text-[13px] md:text-sm font-black" style={{ color: p.active ? T.text1 : T.text3 }}>{p.value}</div>
                            <div className="text-[10px] font-bold mt-0.5" style={{ color: T.text3 }}>{p.label}</div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* ──────────────────────────────────────────
                ACHIEVEMENTS
            ────────────────────────────────────────── */}
            <SectionHeader
                title="成就勋章"
                right={
                    <span className="text-[11px] font-black px-2.5 py-1 rounded-full" style={{ background: T.orangeLight, color: T.orange }}>
                        {unlockedCount} / {ACHIEVEMENTS.length}
                    </span>
                }
            />
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {achievementStatus.map(a => (
                    <button key={a.id}
                        onClick={() => setBadgeDrawer(a)}
                        className="rounded-[1.25rem] p-3 flex flex-col items-center text-center transition-all hover:scale-105 active:scale-95"
                        style={{
                            background:  a.unlocked ? T.cardBg : T.muted,
                            border:      a.unlocked ? T.cardBorder : 'none',
                            boxShadow:   a.unlocked ? T.cardShadow : 'none',
                            filter:      a.unlocked ? 'none' : 'grayscale(1)',
                            opacity:     a.unlocked ? 1 : 0.45,
                        }}>
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.bg} flex items-center justify-center text-2xl mb-2`}>
                            {a.unlocked ? a.emoji : <Icons.Lock size={14} className="text-white/50" />}
                        </div>
                        <div className="text-[10px] font-black leading-tight truncate w-full" style={{ color: a.unlocked ? T.text1 : T.text3 }}>
                            {a.title}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
