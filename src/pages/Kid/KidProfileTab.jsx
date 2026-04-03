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
import { usePetRooms } from '../../hooks/usePetRooms';

// ── Palette ──────────────────────────────────────────────────────
const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
    orange: '#FF8C42', yellow: '#FFD93D', teal: '#4ECDC4',
    coral: '#FF6B6B', green: '#10B981', purple: '#8B5CF6',
    textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
    cardShadow: '0 4px 24px rgba(27,46,75,0.06)',
};

// ── Animations ───────────────────────────────────────────────────
const CSS = `
@keyframes messageFloat {
    0%   { opacity:0; transform:translateY(8px); }
    12%  { opacity:1; transform:translateY(0); }
    80%  { opacity:1; transform:translateY(0); }
    100% { opacity:0; transform:translateY(-8px); }
}
@keyframes drawerIn {
    from { transform:translateY(100%); opacity:0; }
    to   { transform:translateY(0);    opacity:1; }
}
`;

// ── Pet Card (Banner Style) ──────────────────────────────────────
function PetCard({ activeKid, onOpenRoom }) {
    const { rooms, activeRoom, activeRoomIdx, setActiveRoomIdx, loading } = usePetRooms(activeKid?.id);
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setTimedOut(true), 5000);
        return () => clearTimeout(t);
    }, []);

    if (!loading && (rooms.length === 0 || !activeRoom) || (!loading && timedOut)) {
        return (
            <div className="rounded-3xl mb-5 p-4 flex items-center justify-between"
                style={{ background: C.bgCard, boxShadow: C.cardShadow, border: `1px solid ${C.bgLight}` }}>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-orange-50">🐾</div>
                    <div>
                        <div className="text-sm font-black text-slate-800">还没有小窝</div>
                        <div className="text-[10px] text-slate-500 font-bold mt-0.5">去设置你的第一个宠物房间吧！</div>
                    </div>
                </div>
                <button onClick={onOpenRoom} className="px-3 py-1.5 bg-orange-100 text-orange-500 text-[11px] font-black rounded-full transition-transform hover:scale-105">
                    去设置
                </button>
            </div>
        );
    }

    if (loading && !timedOut) {
        return (
            <div className="rounded-3xl mb-5 h-32 animate-pulse"
                style={{ background: C.bgCard, boxShadow: C.cardShadow, border: `1px solid ${C.bgLight}` }} />
        );
    }

    const hunger = activeRoom?.petHunger ?? 100;
    const mood   = activeRoom?.petMood   ?? 100;
    const hungerColor = hunger > 50 ? C.orange : '#EF4444';
    const moodColor   = mood   > 50 ? C.teal   : '#8B5CF6';

    const VitalBar = ({ val, color, icon }) => (
        <div className="flex items-center gap-1.5 flex-1">
            <span className="text-[11px]">{icon}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
                <div className="h-full rounded-full transition-all" style={{ width: `${val}%`, background: color }} />
            </div>
        </div>
    );

    return (
        <div className="rounded-3xl mb-5 overflow-hidden flex flex-col relative"
            style={{ background: C.bgCard, boxShadow: C.cardShadow, border: `1px solid ${C.bgLight}` }}>

            {/* Top Preview Banner */}
            <div className="relative h-28 md:h-36 flex items-center justify-center overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #FFF5EE 0%, #FFE8CC 100%)' }}>
                {/* Background decorative glow */}
                <div className="absolute inset-0 bg-white/20" style={{ backdropFilter: 'blur(10px)' }} />
                
                {/* Pet Box Container */}
                <div className="relative z-10 w-24 h-24 md:w-32 md:h-32 translate-y-3">
                    <PetBoxTeaser size={100} />
                </div>
                
                {/* Click overlay */}
                <button onClick={onOpenRoom} className="absolute inset-0 z-20 w-full h-full cursor-pointer hover:bg-white/10 transition-colors" />

                {/* Multiple Rooms Tab Overlay */}
                {rooms.length > 1 && (
                    <div className="absolute top-3 left-3 z-30 flex gap-1.5">
                        {rooms.map((r, i) => (
                            <button key={r.id} onClick={(e) => { e.stopPropagation(); setActiveRoomIdx(i); }}
                                className="text-[9px] font-black px-2 py-0.5 rounded-full transition-all shadow-sm"
                                style={{ background: i === activeRoomIdx ? C.orange : 'rgba(255,255,255,0.7)', color: i === activeRoomIdx ? 'white' : C.textMuted }}>
                                {r.roomName || `小窝 ${i + 1}`}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Info Bar */}
            <div className="p-3 md:p-4 bg-white relative z-30 flex items-center justify-between gap-4 border-t border-slate-50">
                <div className="min-w-0">
                    <div className="text-sm font-black text-slate-800 truncate">{activeRoom?.roomName || '我的小窝'}</div>
                    {activeKid.spirit_name && <div className="text-[10px] text-slate-400 font-bold truncate mt-0.5">「{activeKid.spirit_name}」</div>}
                </div>
                <div className="flex-1 flex flex-col gap-1.5 max-w-[120px] md:max-w-[160px]">
                    <VitalBar val={mood} color={moodColor} icon="😊" />
                    <VitalBar val={hunger} color={hungerColor} icon="🍖" />
                </div>
                <button onClick={onOpenRoom}
                    className="flex-shrink-0 bg-orange-50 text-orange-500 hover:bg-orange-100 flex items-center justify-center w-8 h-8 rounded-full transition-colors">
                    <Icons.ChevronRight size={14} className="ml-0.5" />
                </button>
            </div>
        </div>
    );
}

// ── Badge Drawer ─────────────────────────────────────────────────
function BadgeDrawer({ badge, onClose }) {
    if (!badge) return null;
    return (
        <div className="fixed inset-0 z-[500] flex flex-col justify-end" onClick={onClose} style={{ touchAction: 'none' }}>
            {/* Backdrop */}
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            
            {/* Drawer */}
            <div
                className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col"
                style={{ animation: 'drawerIn 0.35s cubic-bezier(0.34,1.2,0.64,1)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-10 h-1.5 rounded-full bg-slate-200" />
                </div>

                {/* Content */}
                <div className="px-6 pb-8 overflow-y-auto min-h-0 flex-1">
                    <div className="flex flex-col items-center gap-2 py-5">
                        <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br ${badge.bg} flex items-center justify-center text-4xl md:text-5xl shadow-xl border-4 border-white ${!badge.unlocked ? 'grayscale opacity-40' : ''}`}>
                            {badge.unlocked ? badge.emoji : <Icons.Lock size={32} className="text-gray-400" />}
                        </div>
                        <div className="text-lg md:text-xl font-black text-center mt-2" style={{ color: C.textPrimary }}>{badge.title}</div>
                        <span className="px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold"
                            style={{ background: badge.unlocked ? `${C.green}15` : `${C.textMuted}15`, color: badge.unlocked ? C.green : C.textMuted }}>
                            {badge.unlocked ? '✓ 已解锁' : '× 未解锁'}
                        </span>
                    </div>

                    <div className="rounded-2xl p-4 mb-5" style={{ background: C.bgLight }}>
                        <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: C.textSoft }}>获得条件</div>
                        <div className="text-sm md:text-base font-bold text-slate-800">{badge.desc}</div>
                        <div className="mt-3 text-xs font-bold" style={{ color: badge.unlocked ? C.green : C.orange }}>
                            {badge.unlocked ? '🎉 你已经做到了，太棒了！' : '💪 加油完成条件即可解锁！'}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-500">
                            {badge.category}
                        </span>
                        <button onClick={onClose}
                            className="text-xs font-black px-6 py-2 rounded-full hover:scale-105 transition-transform"
                            style={{ background: `${C.orange}15`, color: C.orange }}>
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Star Dust History Modal ──────────────────────────────────────
function ExpHistoryModal({ activeKid, transactions, nextLevelExp, onClose }) {
    const expPercent = Math.max(0, Math.min(100, (activeKid.exp / nextLevelExp) * 100));
    
    // Star dust transactions
    const expTx = useMemo(() =>
        transactions
            .filter(t => t.kidId === activeKid.id && t.type === 'income' && (t.category === 'task' || t.category === 'habit'))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 30),
        [transactions, activeKid.id]
    );

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl animate-fade-in max-h-[80vh]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-5 py-4 flex items-center justify-between bg-slate-50 border-b border-slate-100">
                    <div className="font-black text-slate-800 text-base">✨ 星尘获取明细</div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icons.X size={20} /></button>
                </div>
                
                {/* Summary */}
                <div className="px-5 py-4 bg-slate-50/50">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500">Lv.{activeKid.level} → Lv.{activeKid.level+1}</span>
                        <span className="text-[10px] font-black text-orange-500 bg-orange-100 px-2 py-0.5 rounded">总计 {activeKid.exp} ✨</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${expPercent}%`, background: 'linear-gradient(90deg, #4ade80, #facc15)' }} />
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1.5">还需 {nextLevelExp - activeKid.exp} 星尘升级</div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-2 py-2">
                    {expTx.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs font-bold">还没有记录，完成任务获取星尘！</div>
                    ) : expTx.map((t, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50">
                            <span className="text-lg">{t.category === 'habit' ? '🎯' : '📚'}</span>
                            <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-bold text-slate-700 truncate">{t.title || (t.category === 'habit' ? '习惯打卡' : '学习规则')}</div>
                                <div className="text-[9px] text-slate-400 mt-0.5">{new Date(t.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric'})}</div>
                            </div>
                            <div className="font-black text-sm text-teal-500">+{t.amount}</div>
                        </div>
                    ))}
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

    const [badgeDrawer,    setBadgeDrawer]    = useState(null);
    const [showPetRoom,    setShowPetRoom]    = useState(false);
    const [showExpModal,   setShowExpModal]   = useState(false);
    const [spiritMsg,      setSpiritMsg]      = useState('');
    const [showSpiritMsg,  setShowSpiritMsg]  = useState(false);

    const activeKid = kids.find(k => k.id === activeKidId);
    if (!activeKid) return null;

    const nextLevelExp = getLevelReq(activeKid.level);
    const form         = getSpiritForm(activeKid.level);
    const privileges   = getSpiritPrivileges(activeKid.level);
    const term         = getCurrentTerm(parentSettings);
    const expPercent   = Math.max(0, Math.min(100, (activeKid.exp / nextLevelExp) * 100));

    const achievementStatus = useMemo(() =>
        ACHIEVEMENTS.map(a => ({ ...a, unlocked: a.check(activeKid, transactions) })),
        [activeKid, transactions]
    );
    const unlockedCount = achievementStatus.filter(a => a.unlocked).length;

    const handleSpiritTap = () => {
        const today = new Date().toISOString().slice(0, 10);
        const recentTaskCount = transactions.filter(t =>
            t.kidId === activeKid.id && t.type === 'income' &&
            t.category === 'task' && t.date?.startsWith(today)
        ).length;
        setSpiritMsg(getSpiritMessage(activeKid.level, {
            spiritName: activeKid.spirit_name,
            recentTaskCount, streakDays: activeKid.streak_days || 0,
        }));
        setShowSpiritMsg(true);
        setTimeout(() => setShowSpiritMsg(false), 3000);
    };

    return (
        <div className="animate-fade-in pb-10 pt-2 max-w-4xl mx-auto">
            <style>{CSS}</style>

            {showPetRoom && <VirtualPetDashboard activeKid={activeKid} onClose={() => setShowPetRoom(false)} />}
            <BadgeDrawer badge={badgeDrawer} onClose={() => setBadgeDrawer(null)} />
            {showExpModal && <ExpHistoryModal activeKid={activeKid} transactions={transactions} nextLevelExp={nextLevelExp} onClose={() => setShowExpModal(false)} />}

            {/* ══════════════════════════════
                1. HERO — 学习档案
            ══════════════════════════════ */}
            <div className="rounded-3xl overflow-hidden relative mb-5" style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                boxShadow: '0 12px 40px rgba(15,52,96,0.3)',
            }}>
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-80 h-80 rounded-full"
                        style={{ background: `radial-gradient(circle, ${form.glow} 0%, transparent 70%)` }} />
                    <div className="absolute bottom-[-30%] left-[-15%] w-80 h-80 rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(78,205,196,0.12) 0%, transparent 70%)' }} />
                </div>

                <div className="relative z-10 p-5 md:p-8">
                    {/* Term tag top right */}
                    <div className="flex justify-end mb-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                            {term.emoji} {term.name} · 还剩 {term.daysLeft} 天
                        </div>
                    </div>

                    {/* Avatar + Name row */}
                    <div className="flex items-center gap-5 md:gap-8 mb-6">
                        {/* Clickable avatar ENLARGED */}
                        <button
                            onClick={() => setShowAvatarPickerModal(true)}
                            className="relative flex-shrink-0 group hover:scale-105 transition-transform"
                            style={{ width: 96, height: 96 }} // Increased size natively
                        >
                            <div className="w-full h-full md:w-32 md:h-32 rounded-full border-4 border-white/15 overflow-hidden flex items-center justify-center text-4xl md:text-6xl"
                                style={{ background: 'rgba(255,255,255,0.1)' }}>
                                <AvatarDisplay avatar={activeKid.avatar} />
                            </div>
                            <div className="absolute inset-0 md:w-32 md:h-32 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ background: 'rgba(0,0,0,0.4)' }}>
                                <Icons.Camera size={24} className="text-white drop-shadow-md" />
                            </div>
                        </button>

                        <div className="flex-1 min-w-0">
                            {/* Level tap */}
                            <button onClick={handleSpiritTap} className="relative mb-2">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black bg-gradient-to-r ${form.bg} text-white/90 shadow-md`}>
                                    {form.emoji} Lv.{activeKid.level} · {form.name}
                                </div>
                                {showSpiritMsg && (
                                    <div className="absolute left-0 -top-11 whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold z-50"
                                        style={{
                                            background: 'rgba(255,255,255,0.95)', color: C.textPrimary,
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                                            animation: 'messageFloat 3s ease-in-out forwards',
                                        }}>
                                        {spiritMsg}
                                        <div className="absolute -bottom-1 left-5 w-2 h-2 rotate-45"
                                            style={{ background: 'rgba(255,255,255,0.95)' }} />
                                    </div>
                                )}
                            </button>
                            <h2 className="text-2xl md:text-4xl font-black text-white truncate drop-shadow-sm">
                                {activeKid.name}
                            </h2>
                        </div>
                    </div>

                    {/* XP bar — click to open modal */}
                    <button
                        className="w-full text-left group"
                        onClick={() => setShowExpModal(true)}
                    >
                        <div className="flex justify-between mb-1.5">
                            <span className="text-[10px] md:text-xs font-black text-white/50 tracking-widest transition-colors group-hover:text-white/70">学习星尘 ✨</span>
                            <span className="text-[10px] md:text-xs font-black text-white/90 bg-white/15 px-2 py-0.5 rounded-sm">
                                {activeKid.exp} / {nextLevelExp}
                            </span>
                        </div>
                        <div className="h-3 md:h-4 rounded-full overflow-hidden bg-black/30 relative">
                            <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${expPercent}%`, background: 'linear-gradient(90deg, #4ade80, #facc15)', boxShadow: '0 0 12px rgba(74,222,128,0.4)' }} />
                            <div className="absolute top-0 inset-x-0 h-1 bg-white/20 rounded-full" />
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-[9px] md:text-[10px] font-bold text-white/40 group-hover:text-white/60 transition-colors">
                                ▼ 点击查看明细
                            </span>
                        </div>
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════
                2. 我的宠物
            ══════════════════════════════ */}
            <h3 className="text-sm md:text-base font-black mb-3 flex items-center gap-2 pl-1" style={{ color: C.textPrimary }}>
                <div className="w-1.5 h-5 rounded-full" style={{ background: C.orange }} />
                🐾 我的宠物
            </h3>
            <PetCard activeKid={activeKid} onOpenRoom={() => setShowPetRoom(true)} />

            {/* ══════════════════════════════
                3. MiniLife 特权
            ══════════════════════════════ */}
            <div className="mb-6">
                <h3 className="text-sm md:text-base font-black mb-3 flex items-center gap-2 pl-1" style={{ color: C.textPrimary }}>
                    <div className="w-1.5 h-5 rounded-full" style={{ background: form.color }} />
                    🎖 MiniLife 特权
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full ml-auto"
                        style={{ background: `${form.color}15`, color: form.color }}>
                        {form.name}
                    </span>
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: '利息加成', value: privileges.interestBonus > 0 ? `+${privileges.interestBonus}%/周` : '未解锁', icon: '💰', active: privileges.interestBonus > 0, color: C.teal },
                        { label: '每日奖励', value: privileges.dailyBonus > 0 ? `+${privileges.dailyBonus}` : '未解锁', icon: '🪙', active: privileges.dailyBonus > 0, color: C.orange },
                        { label: '商城折扣', value: privileges.shopDiscount > 0 ? `${100 - privileges.shopDiscount}折` : '未解锁', icon: '🏷️', active: privileges.shopDiscount > 0, color: C.purple },
                    ].map((p, i) => (
                        <div key={i} className="rounded-2xl p-4 text-center"
                            style={{
                                background: p.active ? C.bgCard : `${C.bgLight}80`,
                                boxShadow: p.active ? C.cardShadow : 'none',
                                border: `1px solid ${p.active ? `${p.color}20` : `${C.bgMuted}80`}`,
                                opacity: p.active ? 1 : 0.65,
                            }}>
                            <div className="text-2xl md:text-3xl mb-2">{p.icon}</div>
                            <div className="text-[10px] md:text-xs font-bold mb-1" style={{ color: C.textMuted }}>{p.label}</div>
                            <div className="text-[11px] md:text-sm font-black" style={{ color: p.active ? p.color : C.textMuted }}>{p.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══════════════════════════════
                4. 成就勋章
            ══════════════════════════════ */}
            <div>
                <h3 className="text-sm md:text-base font-black mb-3 flex items-center gap-2 pl-1" style={{ color: C.textPrimary }}>
                    <div className="w-1.5 h-5 rounded-full" style={{ background: C.purple }} />
                    🏆 成就勋章
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto"
                        style={{ background: `${C.orange}15`, color: C.orange }}>
                        {unlockedCount} / {ACHIEVEMENTS.length}
                    </span>
                </h3>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 md:gap-4">
                    {achievementStatus.map(a => (
                        <button key={a.id}
                            onClick={() => setBadgeDrawer(a)}
                            className="rounded-2xl p-3 md:p-4 flex flex-col items-center text-center transition-all hover:scale-105 active:scale-95"
                            style={{
                                background: a.unlocked ? C.bgCard : C.bg,
                                boxShadow: a.unlocked ? C.cardShadow : 'none',
                                border: `1px solid ${a.unlocked ? C.bgLight : C.bgMuted}80`,
                                filter: a.unlocked ? 'none' : 'grayscale(0.7)',
                                opacity: a.unlocked ? 1 : 0.55,
                            }}>
                            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${a.bg} flex items-center justify-center text-2xl md:text-3xl mb-2 border-2 border-white/50`}>
                                {a.unlocked ? a.emoji : <Icons.Lock size={16} className="text-gray-400" />}
                            </div>
                            <div className="text-[10px] md:text-[11px] font-black truncate w-full leading-tight" style={{ color: a.unlocked ? C.textPrimary : C.textMuted }}>{a.title}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
