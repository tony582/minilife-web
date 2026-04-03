import React, { useMemo, useState } from 'react';
import { useDataContext } from '../../context/DataContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons, AvatarDisplay } from '../../utils/Icons';
import { getLevelReq } from '../../utils/levelUtils';
import {
    getSpiritForm, getSpiritPrivileges, getSpiritMessage,
    SPIRIT_FORMS, getCurrentTerm, isSpiritMaxStar,
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
    0%   { opacity:0; transform:translateY(10px); }
    10%  { opacity:1; transform:translateY(0); }
    80%  { opacity:1; transform:translateY(0); }
    100% { opacity:0; transform:translateY(-10px); }
}
@keyframes drawerIn {
    from { transform:translateY(100%); }
    to   { transform:translateY(0); }
}
`;

// ── Pet Capsule Card ─────────────────────────────────────────────
function PetCard({ activeKid, onOpenRoom }) {
    const { rooms, activeRoom, activeRoomIdx, setActiveRoomIdx, loading } = usePetRooms(activeKid?.id);

    if (loading || !activeRoom) return (
        <div className="rounded-3xl p-4 mb-5 flex items-center justify-center" style={{
            background: C.bgCard, boxShadow: C.cardShadow, border: `1px solid ${C.bgLight}`, minHeight: 96,
        }}>
            <span className="text-xs font-bold" style={{ color: C.textMuted }}>加载宠物中…</span>
        </div>
    );

    const hunger = activeRoom.petHunger ?? 100;
    const mood   = activeRoom.petMood   ?? 100;

    const VitalBar = ({ value, color, label, icon }) => (
        <div className="flex items-center gap-2 w-full">
            <span className="text-sm flex-shrink-0">{icon}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: C.bgLight }}>
                <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${value}%`, background: color }} />
            </div>
            <span className="text-[9px] font-black flex-shrink-0 w-6 text-right" style={{ color }}>{value}</span>
        </div>
    );

    return (
        <div className="rounded-3xl mb-5 overflow-hidden" style={{
            background: C.bgCard, boxShadow: C.cardShadow, border: `1px solid ${C.bgLight}`,
        }}>
            {/* Multi-room tab if there are multiple rooms */}
            {rooms.length > 1 && (
                <div className="flex px-4 pt-3 gap-2">
                    {rooms.map((r, i) => (
                        <button key={r.id} onClick={() => setActiveRoomIdx(i)}
                            className="text-[10px] font-black px-3 py-1 rounded-full transition-all"
                            style={{
                                background: i === activeRoomIdx ? C.orange : C.bgLight,
                                color: i === activeRoomIdx ? 'white' : C.textMuted,
                            }}>
                            {r.roomName || `小窝 ${i + 1}`}
                        </button>
                    ))}
                </div>
            )}

            <div className="p-4 flex items-center gap-4">
                {/* Cat animation */}
                <div className="flex-shrink-0 relative" style={{ width: 88, height: 88 }}>
                    <div className="absolute inset-0 rounded-full"
                        style={{ background: 'radial-gradient(circle at 40% 35%, #FFF5EE, #FFE9D5)' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div style={{ transform: 'translateY(-6px)' }}>
                            <PetBoxTeaser size={76} />
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-black" style={{ color: C.textPrimary }}>
                                {activeRoom.roomName || '我的小窝'}
                            </div>
                            <div className="text-[10px] font-bold mt-0.5" style={{ color: C.textMuted }}>
                                {activeKid.spirit_name ? `「${activeKid.spirit_name}」` : '点击进入探索 →'}
                            </div>
                        </div>
                        <button
                            onClick={onOpenRoom}
                            className="flex-shrink-0 flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-full transition-all hover:scale-105"
                            style={{ background: `${C.orange}15`, color: C.orange }}>
                            进入小窝
                            <Icons.ChevronRight size={10} />
                        </button>
                    </div>

                    <VitalBar value={mood}   color="#4ECDC4" label="心情" icon="😊" />
                    <VitalBar value={hunger} color="#FF8C42" label="饥饿" icon="🍖" />
                </div>
            </div>
        </div>
    );
}

// ── Achievement Badge Drawer ──────────────────────────────────────
function BadgeDrawer({ badge, onClose }) {
    if (!badge) return null;
    return (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end" onClick={onClose}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }} />
            <div
                className="relative rounded-t-3xl py-6 px-6"
                style={{
                    background: C.bgCard,
                    animation: 'drawerIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                    maxHeight: '65vh',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Drag handle */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full"
                    style={{ background: C.bgMuted }} />

                {/* Badge icon */}
                <div className="flex flex-col items-center gap-3 mb-5 mt-2">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${badge.bg} flex items-center justify-center text-4xl shadow-lg border-2 border-white/60 ${!badge.unlocked ? 'grayscale opacity-50' : ''}`}>
                        {badge.unlocked ? badge.emoji : <Icons.Lock size={28} className="text-gray-400" />}
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-black" style={{ color: C.textPrimary }}>{badge.title}</div>
                        <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                            style={{
                                background: badge.unlocked ? `${C.green}15` : `${C.textMuted}15`,
                                color: badge.unlocked ? C.green : C.textMuted,
                            }}>
                            {badge.unlocked ? '✓ 已获得' : '× 未解锁'}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="rounded-2xl p-4 mb-3" style={{ background: C.bg }}>
                    <div className="text-xs font-bold mb-1" style={{ color: C.textMuted }}>获得条件</div>
                    <div className="text-sm font-black" style={{ color: C.textPrimary }}>{badge.desc}</div>
                    {badge.unlocked && (
                        <div className="text-xs font-bold mt-2" style={{ color: C.green }}>🎉 你已经做到了！太棒了！</div>
                    )}
                    {!badge.unlocked && (
                        <div className="text-xs font-bold mt-2" style={{ color: C.orange }}>💪 加油！完成条件即可解锁！</div>
                    )}
                </div>

                {/* Category tag */}
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: C.bgLight, color: C.textMuted }}>
                        {badge.category}
                    </span>
                    <button onClick={onClose}
                        className="text-[10px] font-black px-4 py-1.5 rounded-full"
                        style={{ background: `${C.orange}15`, color: C.orange }}>
                        关闭
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ───────────────────────────────────────────────
export const KidProfileTab = () => {
    const { kids, activeKidId, tasks, transactions } = useDataContext();
    const { parentSettings } = useNavigationStore();
    const { setShowAvatarPickerModal, setShowTransactionHistoryModal, setTransactionHistoryKidId } = useUIContext();

    const [showExpHistory, setShowExpHistory] = useState(false);
    const [badgeDrawer,    setBadgeDrawer]    = useState(null);
    const [showPetRoom,    setShowPetRoom]    = useState(false);
    const [spiritMsg,      setSpiritMsg]      = useState('');
    const [showSpiritMsg,  setShowSpiritMsg]  = useState(false);

    const activeKid = kids.find(k => k.id === activeKidId);
    if (!activeKid) return null;

    const nextLevelExp = getLevelReq(activeKid.level);
    const form         = getSpiritForm(activeKid.level);
    const privileges   = getSpiritPrivileges(activeKid.level);
    const term         = getCurrentTerm(parentSettings);
    const expPercent   = Math.max(0, Math.min(100, (activeKid.exp / nextLevelExp) * 100));

    // Next level tier
    const currentFormIdx  = SPIRIT_FORMS.findIndex(f => f.id === form.id);
    const nextForm        = currentFormIdx < SPIRIT_FORMS.length - 1 ? SPIRIT_FORMS[currentFormIdx + 1] : null;
    const levelsToNextTier = nextForm ? nextForm.minLevel - activeKid.level : 0;

    // Achievements
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

    return (
        <div className="animate-fade-in pb-10 pt-2 max-w-4xl mx-auto">
            <style>{CSS}</style>

            {/* ─── Pet Room Modal ───────────────────────────── */}
            {showPetRoom && (
                <VirtualPetDashboard
                    activeKid={activeKid}
                    onClose={() => setShowPetRoom(false)}
                />
            )}

            {/* ─── Achievement Drawer ───────────────────────── */}
            <BadgeDrawer badge={badgeDrawer} onClose={() => setBadgeDrawer(null)} />

            {/* ═══════════════════════════════════════════════
                1. HERO — 学习档案
            ═══════════════════════════════════════════════ */}
            <div className="rounded-3xl overflow-hidden relative mb-5" style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                boxShadow: '0 12px 40px rgba(15,52,96,0.3)',
            }}>
                {/* Background glow & stars */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-80 h-80 rounded-full"
                        style={{ background: `radial-gradient(circle, ${form.glow} 0%, transparent 70%)` }} />
                    <div className="absolute bottom-[-30%] left-[-15%] w-96 h-96 rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(78,205,196,0.1) 0%, transparent 70%)' }} />
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="absolute w-1 h-1 rounded-full animate-pulse" style={{
                            background: ['#FFD93D','#4ECDC4','#FF8C42','#8B5CF6','#EC4899','#10B981'][i],
                            opacity: 0.4, top: `${10 + i * 15}%`, left: `${10 + i * 14}%`,
                            animationDelay: `${i * 0.5}s`,
                        }} />
                    ))}
                </div>

                <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                    {/* Avatar + spirit message */}
                    <button onClick={handleSpiritTap}
                        className="flex-shrink-0 relative hover:scale-105 transition-transform cursor-pointer"
                        style={{ width: 120, height: 120 }}>
                        <div className="absolute inset-0 rounded-full border-4 border-white/10 overflow-hidden flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.08)' }}>
                            <AvatarDisplay avatar={activeKid.avatar} />
                        </div>
                        {showSpiritMsg && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-xl text-[10px] font-bold z-50 pointer-events-none"
                                style={{
                                    background: 'rgba(255,255,255,0.95)', color: C.textPrimary,
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                                    animation: 'messageFloat 3s ease-in-out forwards',
                                }}>
                                {spiritMsg}
                                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                                    style={{ background: 'rgba(255,255,255,0.95)' }} />
                            </div>
                        )}
                    </button>

                    {/* Info panel */}
                    <div className="flex-1 w-full min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                                {term.emoji} {term.name}
                            </div>
                            <button onClick={() => setShowAvatarPickerModal(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold hover:scale-105 transition-transform"
                                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                                <Icons.Camera size={10} /> 换头像
                            </button>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-white truncate drop-shadow-sm mb-3">
                            {activeKid.name}
                        </h2>

                        {/* Level badge */}
                        <div className="mb-4">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black text-white/90 bg-gradient-to-r ${form.bg} border border-white/20 shadow-lg`}>
                                {form.emoji} Lv.{activeKid.level} · {form.name}
                            </div>
                        </div>

                        {/* XP bar */}
                        <div className="w-full">
                            <div className="flex justify-between mb-1.5">
                                <span className="text-[10px] font-black text-white/50 tracking-widest uppercase">学习星尘</span>
                                <span className="text-[10px] font-black text-white/90 bg-white/10 px-2 py-0.5 rounded-sm">{activeKid.exp} / {nextLevelExp}</span>
                            </div>
                            <div className="h-3 rounded-full overflow-hidden bg-black/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] relative">
                                <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${expPercent}%`,
                                        background: 'linear-gradient(90deg, #4ade80, #facc15)',
                                        boxShadow: '0 0 15px rgba(74,222,128,0.4)',
                                    }} />
                                <div className="absolute top-0 right-0 left-0 h-1 bg-white/20 rounded-full" />
                            </div>
                            <div className="flex justify-between mt-1.5">
                                <span className="text-[9px] font-bold text-white/40">✨ 完成任务/打卡获取星尘</span>
                                {nextForm ? (
                                    <span className="text-[9px] font-bold text-green-300/80">还差 {levelsToNextTier} 级升阶</span>
                                ) : (
                                    <span className="text-[9px] font-bold text-yellow-400/50">⭐ 最高等级</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════
                2. 我的宠物 (Pet Capsule Card)
            ═══════════════════════════════════════════════ */}
            <h3 className="text-sm font-black mb-3 flex items-center gap-2 pl-1" style={{ color: C.textPrimary }}>
                <div className="w-1 h-4 rounded-full" style={{ background: C.orange }} />
                🐾 我的宠物
            </h3>
            <PetCard activeKid={activeKid} onOpenRoom={() => setShowPetRoom(true)} />

            {/* ═══════════════════════════════════════════════
                3. MiniLife 特权
            ═══════════════════════════════════════════════ */}
            <div className="mb-5">
                <h3 className="text-sm font-black mb-3 flex items-center gap-2 pl-1" style={{ color: C.textPrimary }}>
                    <div className="w-1 h-4 rounded-full" style={{ background: form.color }} />
                    🎖 MiniLife 特权
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
                        <div key={i} className="rounded-2xl p-3 text-center"
                            style={{
                                background: p.active ? C.bgCard : `${C.bgLight}80`,
                                boxShadow: p.active ? C.cardShadow : 'none',
                                border: `1px solid ${p.active ? `${p.color}20` : `${C.bgMuted}80`}`,
                                opacity: p.active ? 1 : 0.6,
                            }}>
                            <div className="text-2xl mb-1">{p.icon}</div>
                            <div className="text-[10px] font-bold mb-0.5" style={{ color: C.textMuted }}>{p.label}</div>
                            <div className="text-xs font-black" style={{ color: p.active ? p.color : C.textMuted }}>{p.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════
                4. 学期进度
            ═══════════════════════════════════════════════ */}
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
                        <div className="h-full rounded-full transition-all"
                            style={{ width: `${term.progress}%`, background: `linear-gradient(90deg, ${term.color}80, ${term.color})` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[9px] font-bold" style={{ color: C.textMuted }}>已过 {Math.round(term.progress)}%</span>
                        <span className="text-[9px] font-bold" style={{ color: term.color }}>
                            {term.daysLeft > 0 ? `${term.daysLeft} 天后结束` : '已结束'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════
                5. 星尘明细
            ═══════════════════════════════════════════════ */}
            <div className="mb-5">
                <button
                    onClick={() => setShowExpHistory(!showExpHistory)}
                    className="w-full rounded-2xl p-3 flex items-center gap-3 transition-all hover:scale-[1.01]"
                    style={{
                        background: showExpHistory ? `${C.teal}10` : C.bgCard,
                        boxShadow: C.cardShadow,
                        border: `1px solid ${showExpHistory ? `${C.teal}30` : C.bgLight}`,
                    }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${C.teal}15` }}>
                        <Icons.Activity size={16} style={{ color: C.teal }} />
                    </div>
                    <div className="text-sm font-black" style={{ color: C.textPrimary }}>星尘明细</div>
                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${C.teal}15`, color: C.teal }}>
                        共 {activeKid.exp} ✨
                    </span>
                    <Icons.ChevronRight size={14} style={{ color: C.textMuted, transform: showExpHistory ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {showExpHistory && (
                    <div className="mt-2 rounded-2xl overflow-hidden" style={{ background: C.bgCard, boxShadow: C.cardShadow, border: `1px solid ${C.bgLight}` }}>
                        <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.bgLight}` }}>
                            <div className="flex items-center justify-between text-[10px] font-bold" style={{ color: C.textMuted }}>
                                <span>Lv.{activeKid.level} → Lv.{activeKid.level + 1}</span>
                                <span>还需 {nextLevelExp - activeKid.exp} ✨</span>
                            </div>
                            <div className="h-1.5 rounded-full mt-1.5 overflow-hidden" style={{ background: C.bgLight }}>
                                <div className="h-full rounded-full transition-all"
                                    style={{ width: `${expPercent}%`, background: `linear-gradient(90deg, ${C.teal}, ${C.green})` }} />
                            </div>
                        </div>
                        <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                            {(() => {
                                const expTx = transactions
                                    .filter(t => t.kidId === activeKidId && t.type === 'income' && (t.category === 'task' || t.category === 'habit'))
                                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                                    .slice(0, 20);
                                if (!expTx.length) return (
                                    <div className="text-center py-6">
                                        <div className="text-2xl mb-2">✨</div>
                                        <div className="text-xs font-bold" style={{ color: C.textMuted }}>完成任务就能积累星尘！</div>
                                    </div>
                                );
                                return expTx.map((t, idx) => (
                                    <div key={t.id || idx} className="flex items-center gap-3 py-2 px-2 rounded-xl"
                                        style={{ background: idx % 2 === 0 ? C.bg : 'transparent' }}>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: t.category === 'habit' ? `${C.green}15` : `${C.teal}15` }}>
                                            {t.category === 'habit'
                                                ? <Icons.ShieldCheck size={14} style={{ color: C.green }} />
                                                : <Icons.BookOpen size={14} style={{ color: C.teal }} />}
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
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════
                6. 成就勋章
            ═══════════════════════════════════════════════ */}
            <div>
                <h3 className="text-sm font-black mb-3 flex items-center gap-2 pl-1" style={{ color: C.textPrimary }}>
                    <div className="w-1 h-4 rounded-full" style={{ background: C.purple }} />
                    🏆 成就勋章
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto"
                        style={{ background: `${C.orange}15`, color: C.orange }}>
                        {unlockedCount} / {ACHIEVEMENTS.length}
                    </span>
                </h3>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    {achievementStatus.map(a => (
                        <button key={a.id}
                            onClick={() => setBadgeDrawer(a)}
                            className={`rounded-2xl p-3 flex flex-col items-center text-center transition-all hover:scale-105 active:scale-95 ${!a.unlocked ? 'opacity-50' : ''}`}
                            style={{
                                background: a.unlocked ? C.bgCard : C.bg,
                                boxShadow: a.unlocked ? C.cardShadow : 'none',
                                border: `1px solid ${a.unlocked ? C.bgLight : C.bgMuted}80`,
                                filter: a.unlocked ? 'none' : 'grayscale(0.6)',
                            }}>
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${a.bg} flex items-center justify-center text-2xl mb-1.5 shadow-inner border-2 border-white/50`}>
                                {a.unlocked ? a.emoji : <Icons.Lock size={14} className="text-gray-400" />}
                            </div>
                            <div className="text-[10px] font-black truncate w-full" style={{ color: a.unlocked ? C.textPrimary : C.textMuted }}>{a.title}</div>
                            <div className="text-[8px] font-bold mt-0.5 leading-tight line-clamp-2" style={{ color: C.textMuted }}>{a.desc}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
