import React, { useMemo, useState, useEffect } from 'react';
import { useDataContext }    from '../../context/DataContext.jsx';
import { useUIContext }      from '../../context/UIContext.jsx';
import { Icons, AvatarDisplay } from '../../utils/Icons';
import { getLevelReq }          from '../../utils/levelUtils';
import { getSpiritForm, getSpiritPrivileges, getCurrentTerm } from '../../utils/spiritUtils';
import { useNavigationStore }    from '../../stores/navigationStore';
import { ACHIEVEMENTS }          from '../../utils/achievements';
import PetBoxTeaser              from '../../components/VirtualPet/PetBoxTeaser';
import VirtualPetDashboard       from '../../components/VirtualPet/VirtualPetDashboard';
import { ExpHistoryModal }       from './ExpHistoryModal';
import { LevelPrivilegeModal }   from '../../components/modals/LevelPrivilegeModal';
import { usePetRooms }           from '../../hooks/usePetRooms';

/* ─── Global keyframes ────────────────────── */
const CSS = `
@keyframes drawerIn { from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1} }
@keyframes petBob   { 0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)} }
.pet-bob { animation: petBob 3s ease-in-out infinite; }
`;

/* ─── Reusable card shell ─────────────────── */
const Card = ({ children, style = {}, className = '', onClick }) => (
    <div
        className={className}
        onClick={onClick}
        style={{
            background: '#fff',
            borderRadius: 20,
            border: '1px solid #F0EDE8',
            boxShadow: '0 2px 12px rgba(28,20,10,0.06)',
            overflow: 'hidden',
            ...style,
        }}
    >{children}</div>
);

/* ─── Stat card (2-col grid item) ─────────── */
const StatCard = ({ Icon, label, value, unit, accent = '#FF8C42' }) => (
    <Card style={{ padding: '18px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#A09080' }}>{label}</span>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} style={{ color: accent }} strokeWidth={2.5} />
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: '#1C1410', lineHeight: 1 }}>{value}</span>
            {unit && <span style={{ fontSize: 12, fontWeight: 700, color: '#B0A090' }}>{unit}</span>}
        </div>
    </Card>
);

/* ─── Pet section ─────────────────────────── */
function PetCard({ activeKid, onOpenRoom }) {
    const { rooms, activeRoom, activeRoomIdx, setActiveRoomIdx, loading } = usePetRooms(activeKid?.id);
    const [timedOut, setTimedOut] = useState(false);
    useEffect(() => { const t = setTimeout(() => setTimedOut(true), 5000); return () => clearTimeout(t); }, []);

    if (loading && !timedOut) return <Card style={{ height: 120 }}><div style={{ height: '100%', background: '#F5F3F0' }} /></Card>;

    if (!activeRoom) return (
        <Card onClick={onOpenRoom} style={{ padding: '20px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: '#FFF3EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>🐾</div>
            <div>
                <div style={{ fontWeight: 900, fontSize: 15, color: '#1C1410' }}>布置你的第一个小窝</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#FF8C42', marginTop: 3 }}>点击开始 →</div>
            </div>
        </Card>
    );

    const hunger = activeRoom?.petHunger ?? 100;
    const mood   = activeRoom?.petMood   ?? 100;

    return (
        <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                {/* Left: room thumb area */}
                <div style={{ width: 110, height: 110, flexShrink: 0, background: 'linear-gradient(145deg,#FFF8F3,#FFE8CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #F0EDE8' }}
                    className="pet-bob">
                    <button onClick={onOpenRoom} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <PetBoxTeaser size={80} />
                    </button>
                </div>

                {/* Right: info */}
                <div style={{ flex: 1, padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: 14, color: '#1C1410' }}>{activeRoom?.roomName || '我的小窝'}</div>
                            {activeKid.spirit_name && <div style={{ fontSize: 10, fontWeight: 700, color: '#B0A090', marginTop: 1 }}>「{activeKid.spirit_name}」</div>}
                        </div>
                        <button onClick={onOpenRoom} style={{ fontSize: 11, fontWeight: 900, color: '#FF8C42', background: '#FFF3EB', border: 'none', padding: '5px 12px', borderRadius: 99, cursor: 'pointer' }}>
                            进入
                        </button>
                    </div>

                    {/* Vitals */}
                    {[
                        { label: '心情', value: mood,   color: mood   > 50 ? '#22C55E' : '#EF4444' },
                        { label: '饱腹', value: hunger, color: hunger > 50 ? '#FF8C42' : '#EF4444' },
                    ].map(v => (
                        <div key={v.label} style={{ marginBottom: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#B0A090' }}>{v.label}</span>
                                <span style={{ fontSize: 10, fontWeight: 900, color: v.color }}>{v.value}%</span>
                            </div>
                            <div style={{ height: 4, borderRadius: 99, background: '#F0EDE8', overflow: 'hidden' }}>
                                <div style={{ width: `${v.value}%`, height: '100%', borderRadius: 99, background: v.color, transition: 'width .7s ease' }} />
                            </div>
                        </div>
                    ))}

                    {/* Room tabs */}
                    {rooms.length > 1 && (
                        <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                            {rooms.map((r, i) => (
                                <button key={r.id}
                                    onClick={e => { e.stopPropagation(); setActiveRoomIdx(i); }}
                                    style={{ fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 99, border: 'none', cursor: 'pointer', background: i === activeRoomIdx ? '#FF8C42' : '#F0EDE8', color: i === activeRoomIdx ? '#fff' : '#A09080' }}>
                                    {r.roomName || `小窝${i + 1}`}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}

/* ─── Badge drawer ────────────────────────── */
function BadgeDrawer({ badge, onClose }) {
    if (!badge) return null;
    return (
        <div style={{ position:'fixed', inset:0, zIndex:500, display:'flex', flexDirection:'column', justifyContent:'flex-end' }} onClick={onClose}>
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(6px)' }} />
            <div style={{ position:'relative', background:'#fff', borderRadius:'28px 28px 0 0', animation:'drawerIn .28s ease-out', paddingBottom:'env(safe-area-inset-bottom,20px)' }}
                onClick={e => e.stopPropagation()}>
                <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 4px' }}>
                    <div style={{ width:32, height:4, borderRadius:99, background:'#E8E0D4' }} />
                </div>
                <div style={{ padding:'4px 24px 24px' }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingBottom:20 }}>
                        <div className={`bg-gradient-to-br ${badge.bg}`}
                            style={{ width:84, height:84, borderRadius:26, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, marginTop:12,
                                boxShadow:'0 8px 24px rgba(0,0,0,0.14)', filter: badge.unlocked?'none':'grayscale(1)', opacity: badge.unlocked?1:0.5 }}>
                            {badge.unlocked ? badge.emoji : <Icons.Lock size={26} style={{ color:'rgba(255,255,255,0.55)' }}/>}
                        </div>
                        <div style={{ fontWeight:900, fontSize:20, color:'#1C1410', marginTop:14 }}>{badge.title}</div>
                        <div style={{ fontSize:11, fontWeight:700, padding:'4px 14px', borderRadius:99, marginTop:6, background: badge.unlocked?'#DCFCE7':'#F1F5F9', color: badge.unlocked?'#16A34A':'#94A3B8' }}>
                            {badge.unlocked ? '已解锁' : '尚未解锁'}
                        </div>
                    </div>
                    <div style={{ background:'#F7F4F0', borderRadius:18, padding:18, marginBottom:14 }}>
                        <div style={{ fontSize:10, fontWeight:900, letterSpacing:'0.1em', textTransform:'uppercase', color:'#B0A090', marginBottom:6 }}>获得条件</div>
                        <div style={{ fontSize:14, fontWeight:700, color:'#1C1410' }}>{badge.desc}</div>
                        <div style={{ fontSize:12, fontWeight:700, marginTop:10, color: badge.unlocked?'#16A34A':'#FF8C42' }}>
                            {badge.unlocked?'🎉 已完成，非常棒！':'💪 还差一点，冲！'}
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width:'100%', padding:14, borderRadius:14, fontWeight:900, fontSize:14, background:'#F7F4F0', color:'#8C7E70', border:'none', cursor:'pointer' }}>关闭</button>
                </div>
            </div>
        </div>
    );
}

/* ─── MAIN ────────────────────────────────── */
export const KidProfileTab = () => {
    const { kids, activeKidId, transactions } = useDataContext();
    const { parentSettings }                  = useNavigationStore();
    const { setShowAvatarPickerModal }         = useUIContext();

    const [badgeDrawer,             setBadgeDrawer]             = useState(null);
    const [showPetRoom,             setShowPetRoom]             = useState(false);
    const [showExpModal,            setShowExpModal]            = useState(false);
    const [showLevelPrivilegeModal, setShowLevelPrivilegeModal] = useState(false);

    const activeKid = kids.find(k => k.id === activeKidId);
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
    const taskCount = transactions.filter(t => t.kidId === activeKid.id && t.type === 'income').length;

    const privTags = [
        privileges.interestBonus > 0 && { label: `利息 +${privileges.interestBonus}%`, color: '#14B8A6', bg: '#F0FDFA' },
        privileges.dailyBonus    > 0 && { label: `每日 +${privileges.dailyBonus}`,     color: '#F59E0B', bg: '#FFFBEB' },
        privileges.shopDiscount  > 0 && { label: `商城 ${100 - privileges.shopDiscount}折`, color: '#8B5CF6', bg: '#FAF5FF' },
    ].filter(Boolean);

    return (
        <div style={{ background: '#F9F6F2', minHeight: '100%', paddingBottom: 110 }}>
            <style>{CSS}</style>

            {showPetRoom  && <VirtualPetDashboard activeKid={activeKid} onClose={() => setShowPetRoom(false)} />}
            <BadgeDrawer   badge={badgeDrawer} onClose={() => setBadgeDrawer(null)} />
            {showExpModal && <ExpHistoryModal activeKid={activeKid} transactions={transactions} nextLevelExp={nextLevelExp} onClose={() => setShowExpModal(false)} />}
            <LevelPrivilegeModal isOpen={showLevelPrivilegeModal} onClose={() => setShowLevelPrivilegeModal(false)} activeKid={activeKid} currentForm={form} />

            <div style={{ maxWidth: 640, margin: '0 auto', padding: '12px 16px 0' }}>

                {/* ── COMPACT HEADER ───────────────────────────────
                    Small avatar · greeting · term badge
                ──────────────────────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    {/* Small avatar */}
                    <button onClick={() => setShowAvatarPickerModal(true)}
                        style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', border: '2.5px solid #fff', boxShadow: '0 2px 10px rgba(0,0,0,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: '#F0ECE8', padding: 0 }}>
                        <AvatarDisplay avatar={activeKid.avatar} />
                    </button>
                    {/* Greeting */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#B0A090' }}>你好！</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#1C1410', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {activeKid.name}
                        </div>
                    </div>
                    {/* Term pill */}
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#8C7E70', background: '#fff', border: '1px solid #EDE8E2', padding: '6px 12px', borderRadius: 99, flexShrink: 0, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                        {term.emoji} {term.daysLeft}天
                    </div>
                </div>

                {/* ── FEATURED PROGRESS CARD ───────────────────────
                    Level-coloured card, like the "Weekly Progress" hero
                ──────────────────────────────────────────────── */}
                <div style={{ borderRadius: 24, background: `linear-gradient(135deg, ${form.color}DD, ${form.color})`, padding: '22px 22px 24px', marginBottom: 14, boxShadow: `0 8px 28px ${form.color}50`, position: 'relative', overflow: 'hidden' }}>
                    {/* Decorative circles */}
                    <div style={{ position:'absolute', top:-30, right:-20, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.12)', pointerEvents:'none' }} />
                    <div style={{ position:'absolute', bottom:-40, right:60, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.08)', pointerEvents:'none' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            {/* Level label */}
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginBottom: 4, letterSpacing: '0.05em' }}>
                                我的等级
                            </div>
                            {/* Level badge — tap to see privileges */}
                            <button onClick={() => setShowLevelPrivilegeModal(true)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', border: 'none', borderRadius: 99, padding: '6px 14px', cursor: 'pointer', color: '#fff', fontWeight: 900, fontSize: 14, marginBottom: 14 }}>
                                Lv.{activeKid.level} · {form.name}
                                <Icons.ChevronRight size={13} style={{ opacity: 0.7 }} />
                            </button>

                            {/* Privilege micro-tags */}
                            {privTags.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                                    {privTags.map((t, i) => (
                                        <span key={i} style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 99, background: 'rgba(255,255,255,0.25)', color: '#fff' }}>{t.label}</span>
                                    ))}
                                </div>
                            )}

                            {/* XP */}
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>学习星尘 ✨</div>
                            <button onClick={() => setShowExpModal(true)} style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                                <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.25)', overflow: 'hidden', marginBottom: 5 }}>
                                    <div style={{ width: `${expPercent}%`, height: '100%', borderRadius: 99, background: '#fff', transition: 'width 1s ease', boxShadow: '0 0 8px rgba(255,255,255,0.6)' }} />
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>
                                    {activeKid.exp} / {nextLevelExp} · 还差 {nextLevelExp - activeKid.exp} →
                                </div>
                            </button>
                        </div>

                        {/* Right: circular progress ring */}
                        <div style={{ flexShrink: 0, marginLeft: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width={72} height={72} viewBox="0 0 72 72">
                                <circle cx={36} cy={36} r={28} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={6} />
                                <circle cx={36} cy={36} r={28} fill="none" stroke="white" strokeWidth={6}
                                    strokeDasharray={`${2 * Math.PI * 28 * expPercent / 100} ${2 * Math.PI * 28 * (1 - expPercent / 100)}`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 36 36)"
                                    style={{ transition: 'stroke-dasharray 1s ease' }}
                                />
                                <text x={36} y={40} textAnchor="middle" fill="white" fontSize={14} fontWeight="900" fontFamily="sans-serif">
                                    {Math.round(expPercent)}%
                                </text>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* ── STATS 2-COL GRID ─────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <StatCard Icon={Icons.CheckSquare} label="完成任务" value={taskCount}       unit="次"  accent="#22C55E" />
                    <StatCard Icon={Icons.Award}       label="成就徽章" value={`${unlockedCount}/${ACHIEVEMENTS.length}`} accent="#F59E0B" />
                </div>

                {/* ── PET ──────────────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#1C1410' }}>我的宠物</h3>
                    <button onClick={() => setShowPetRoom(true)}
                        style={{ fontSize: 12, fontWeight: 800, color: '#FF8C42', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
                        进入小窝 <Icons.ChevronRight size={13} />
                    </button>
                </div>
                <div style={{ marginBottom: 24 }}>
                    <PetCard activeKid={activeKid} onOpenRoom={() => setShowPetRoom(true)} />
                </div>

                {/* ── ACHIEVEMENTS ─────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#1C1410' }}>成就勋章</h3>
                    <span style={{ fontSize: 12, fontWeight: 900, color: '#FF8C42', background: '#FFF3EB', padding: '4px 12px', borderRadius: 99 }}>
                        {unlockedCount} / {ACHIEVEMENTS.length}
                    </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                    {achievementStatus.map(a => (
                        <button key={a.id}
                            onClick={() => setBadgeDrawer(a)}
                            style={{
                                background: a.unlocked ? '#fff' : '#F0ECE8',
                                border: a.unlocked ? '1px solid #EDE8E2' : 'none',
                                borderRadius: 20,
                                padding: '16px 10px 12px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                cursor: 'pointer',
                                boxShadow: a.unlocked ? '0 2px 12px rgba(28,20,10,0.07)' : 'none',
                                filter: a.unlocked ? 'none' : 'grayscale(1)',
                                opacity: a.unlocked ? 1 : 0.45,
                                transition: 'transform .15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div className={`bg-gradient-to-br ${a.bg}`} style={{ width: 50, height: 50, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 9, boxShadow: a.unlocked ? '0 4px 14px rgba(0,0,0,0.14)' : 'none' }}>
                                {a.unlocked ? a.emoji : <Icons.Lock size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />}
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 900, color: a.unlocked ? '#1C1410' : '#B0A090', lineHeight: 1.3, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                                {a.title}
                            </div>
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
};
