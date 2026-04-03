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

const CSS = `
@keyframes drawerIn { from{transform:translateY(30px);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes petBob   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
.pet-bob { animation: petBob 2.8s ease-in-out infinite; }
`;

/* ──────────────────────────────────────────
   Thin vitals bar
────────────────────────────────────────── */
function Vital({ label, value, color }) {
    return (
        <div style={{ flex: 1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.35)', letterSpacing: '0.05em' }}>{label}</span>
                <span style={{ fontSize: 10, fontWeight: 900, color }}>{value}%</span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                <div style={{ width: `${value}%`, height: '100%', borderRadius: 99, background: color, transition: 'width .8s ease' }} />
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────
   Pet section (embedded inside hero card)
────────────────────────────────────────── */
function PetSection({ activeKid, onOpenRoom }) {
    const { rooms, activeRoom, activeRoomIdx, setActiveRoomIdx, loading } = usePetRooms(activeKid?.id);
    const [timedOut, setTimedOut] = useState(false);
    useEffect(() => { const t = setTimeout(() => setTimedOut(true), 5000); return () => clearTimeout(t); }, []);

    if (loading && !timedOut) {
        return (
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 99, background: 'rgba(0,0,0,0.06)', animation: 'pulse 1.5s infinite' }} />
            </div>
        );
    }

    if (!activeRoom) {
        return (
            <button onClick={onOpenRoom}
                style={{ width: '100%', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 14, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: 48, height: 48, borderRadius: 18, background: '#FFF3EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🐾</div>
                <div>
                    <div style={{ fontWeight: 900, fontSize: 14, color: '#1C1410' }}>布置你的小窝</div>
                    <div style={{ fontWeight: 700, fontSize: 11, color: '#FF8C42', marginTop: 2 }}>你的宠物在等你 →</div>
                </div>
            </button>
        );
    }

    const hunger = activeRoom?.petHunger ?? 100;
    const mood   = activeRoom?.petMood   ?? 100;

    return (
        <div style={{ padding: '4px 0 0' }}>
            {/* Room select tabs if multiple */}
            {rooms.length > 1 && (
                <div style={{ display: 'flex', gap: 6, padding: '0 24px 10px' }}>
                    {rooms.map((r, i) => (
                        <button key={r.id}
                            onClick={e => { e.stopPropagation(); setActiveRoomIdx(i); }}
                            style={{ fontSize: 10, fontWeight: 900, padding: '3px 10px', borderRadius: 99, border: 'none', cursor: 'pointer', background: i === activeRoomIdx ? '#FF8C42' : 'rgba(0,0,0,0.07)', color: i === activeRoomIdx ? '#fff' : '#9CAABE', transition: 'all .2s' }}>
                            {r.roomName || `小窝 ${i + 1}`}
                        </button>
                    ))}
                </div>
            )}

            {/* Pet preview + vitals */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px 22px', gap: 20 }}>
                {/* Pet animation */}
                <button onClick={onOpenRoom}
                    style={{ position: 'relative', flexShrink: 0, width: 80, height: 80, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    className="pet-bob">
                    <PetBoxTeaser size={80} />
                    <div style={{ position: 'absolute', inset: 0, borderRadius: 99, background: 'rgba(0,0,0,0)', transition: 'background .2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'} />
                </button>

                {/* Info + vitals */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: 13, color: '#1C1410' }}>{activeRoom?.roomName || '我的小窝'}</div>
                            {activeKid.spirit_name && <div style={{ fontSize: 10, fontWeight: 700, color: '#A8998C', marginTop: 1 }}>「{activeKid.spirit_name}」</div>}
                        </div>
                        <button onClick={onOpenRoom}
                            style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 900, color: '#FF8C42', background: '#FFF3EB', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 99, transition: 'opacity .2s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '.75'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                            进入 <Icons.ChevronRight size={11} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <Vital label="心情" value={mood}   color={mood   > 50 ? '#14B8A6' : '#EF4444'} />
                        <Vital label="饱腹" value={hunger} color={hunger > 50 ? '#FF8C42' : '#EF4444'} />
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────
   Badge drawer
────────────────────────────────────────── */
function BadgeDrawer({ badge, onClose }) {
    if (!badge) return null;
    return (
        <div style={{ position:'fixed', inset:0, zIndex:500, display:'flex', flexDirection:'column', justifyContent:'flex-end' }} onClick={onClose}>
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(6px)' }} />
            <div style={{ position:'relative', background:'#fff', borderRadius:'2rem 2rem 0 0', maxHeight:'80vh', display:'flex', flexDirection:'column', animation:'drawerIn .3s ease-out', paddingBottom:'env(safe-area-inset-bottom,20px)' }}
                onClick={e => e.stopPropagation()}>
                <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 6px' }}>
                    <div style={{ width:36, height:4, borderRadius:99, background:'#E8E0D4' }} />
                </div>
                <div style={{ padding:'0 24px 28px', overflowY:'auto' }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'16px 0 24px' }}>
                        <div className={`bg-gradient-to-br ${badge.bg}`}
                            style={{ width:88, height:88, borderRadius:28, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', filter: badge.unlocked ? 'none' : 'grayscale(1)', opacity: badge.unlocked ? 1 : 0.5 }}>
                            {badge.unlocked ? badge.emoji : <Icons.Lock size={28} style={{ color:'rgba(255,255,255,0.6)' }} />}
                        </div>
                        <div style={{ fontWeight:900, fontSize:20, color:'#1C1410', marginTop:16, textAlign:'center' }}>{badge.title}</div>
                        <div style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:99, marginTop:6, background: badge.unlocked ? '#DCFCE7' : '#F1F5F9', color: badge.unlocked ? '#16A34A' : '#94A3B8' }}>
                            {badge.unlocked ? '已解锁' : '尚未解锁'}
                        </div>
                    </div>
                    <div style={{ background:'#F7F4F0', borderRadius:20, padding:20, marginBottom:16 }}>
                        <div style={{ fontSize:10, fontWeight:900, letterSpacing:'0.1em', textTransform:'uppercase', color:'#A8998C', marginBottom:8 }}>获得条件</div>
                        <div style={{ fontSize:14, fontWeight:700, color:'#1C1410' }}>{badge.desc}</div>
                        <div style={{ fontSize:12, fontWeight:700, marginTop:10, color: badge.unlocked ? '#16A34A' : '#FF8C42' }}>
                            {badge.unlocked ? '🎉 已完成，非常棒！' : '💪 还差一点，加油冲！'}
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width:'100%', padding:'14px', borderRadius:16, fontWeight:900, fontSize:14, background:'#F1F5F9', color:'#6B7280', border:'none', cursor:'pointer' }}>
                        关闭
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────
   MAIN
────────────────────────────────────────── */
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

    // Privilege micro-tags shown inline
    const privTags = [
        privileges.interestBonus  > 0 && { label: `利息 +${privileges.interestBonus}%`, color: '#14B8A6', bg: '#F0FDFA' },
        privileges.dailyBonus     > 0 && { label: `每日 +${privileges.dailyBonus}`,     color: '#F59E0B', bg: '#FFFBEB' },
        privileges.shopDiscount   > 0 && { label: `商城 ${100 - privileges.shopDiscount}折`, color: '#8B5CF6', bg: '#FAF5FF' },
    ].filter(Boolean);

    return (
        <div style={{ background: '#F2EEE9', minHeight: '100%', paddingBottom: 100 }}>
            <style>{CSS}</style>

            {showPetRoom            && <VirtualPetDashboard activeKid={activeKid} onClose={() => setShowPetRoom(false)} />}
            <BadgeDrawer             badge={badgeDrawer} onClose={() => setBadgeDrawer(null)} />
            {showExpModal           && <ExpHistoryModal activeKid={activeKid} transactions={transactions} nextLevelExp={nextLevelExp} onClose={() => setShowExpModal(false)} />}
            <LevelPrivilegeModal     isOpen={showLevelPrivilegeModal} onClose={() => setShowLevelPrivilegeModal(false)} activeKid={activeKid} currentForm={form} />

            <div style={{ maxWidth: 640, margin: '0 auto', padding: '8px 16px 0' }}>

                {/* ═══════════════════════════════════════════
                    HERO + PET — ONE unified card
                ═══════════════════════════════════════════ */}
                <div style={{ background: '#fff', borderRadius: 32, overflow: 'hidden', boxShadow: '0 4px 24px rgba(28,20,16,0.09)', marginBottom: 20 }}>

                    {/* ── Coloured header band ────────────────────── */}
                    <div style={{ position: 'relative', background: `linear-gradient(135deg, ${form.color}E0 0%, ${form.color} 100%)`, padding: '28px 24px 56px' }}>
                        {/* Decorative blob */}
                        <div style={{ position:'absolute', top:-30, right:-20, width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,0.12)', pointerEvents:'none' }} />
                        <div style={{ position:'absolute', bottom:-20, left:-10, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.08)', pointerEvents:'none' }} />

                        {/* Term pill */}
                        <div style={{ position:'absolute', top:16, right:16, fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.75)', background:'rgba(255,255,255,0.18)', backdropFilter:'blur(8px)', padding:'4px 10px', borderRadius:99 }}>
                            {term.emoji} {term.name} · {term.daysLeft}天
                        </div>
                    </div>

                    {/* ── Avatar floating at boundary ─────────────── */}
                    <div style={{ position:'relative', marginTop: -44, display:'flex', alignItems:'flex-end', gap:16, padding:'0 24px' }}>
                        {/* Avatar */}
                        <button
                            onClick={() => setShowAvatarPickerModal(true)}
                            className="group"
                            style={{ position:'relative', flexShrink:0, width:88, height:88, borderRadius:'50%', padding:3, background:'#fff', boxShadow:'0 4px 20px rgba(0,0,0,0.18)', cursor:'pointer', border:'none', transition:'transform .2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform='scale(1.04)'}
                            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                        >
                            <div style={{ width:'100%', height:'100%', borderRadius:'50%', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', background:'#F7F4F0', fontSize:40 }}>
                                <AvatarDisplay avatar={activeKid.avatar} />
                            </div>
                            {/* Camera hover */}
                            <div className="group-hover:opacity-100" style={{ position:'absolute', inset:3, borderRadius:'50%', background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity .2s' }}>
                                <Icons.Camera size={20} style={{ color:'#fff' }} />
                            </div>
                        </button>

                        {/* Name (sits beside avatar baseline) */}
                        <div style={{ paddingBottom: 8, flex:1, minWidth:0 }}>
                            <h2 style={{ margin:0, fontSize:24, fontWeight:900, color:'#1C1410', lineHeight:1.1, wordBreak:'break-word' }}>
                                {activeKid.name}
                            </h2>
                        </div>
                    </div>

                    {/* ── Info section below boundary ─────────────── */}
                    <div style={{ padding:'16px 24px 0' }}>
                        {/* Level badge + privilege tags */}
                        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:6, marginBottom:16 }}>
                            <button
                                onClick={() => setShowLevelPrivilegeModal(true)}
                                style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 14px', borderRadius:99, border:'none', cursor:'pointer', background:form.color, color:'#fff', fontSize:12, fontWeight:900, boxShadow:`0 4px 12px ${form.color}60`, transition:'all .2s' }}
                                onMouseEnter={e => e.currentTarget.style.opacity='.8'}
                                onMouseLeave={e => e.currentTarget.style.opacity='1'}
                            >
                                Lv.{activeKid.level} · {form.name}
                                <Icons.ChevronRight size={12} style={{ opacity:.7 }} />
                            </button>

                            {/* Inline privilege micro-tags */}
                            {privTags.map((tag, i) => (
                                <span key={i} style={{ fontSize:10, fontWeight:800, padding:'4px 10px', borderRadius:99, background:tag.bg, color:tag.color }}>
                                    {tag.label}
                                </span>
                            ))}
                            {privTags.length === 0 && (
                                <span style={{ fontSize:10, fontWeight:700, color:'#A8998C' }}>升级后解锁特权</span>
                            )}
                        </div>

                        {/* XP bar */}
                        <button
                            onClick={() => setShowExpModal(true)}
                            style={{ display:'block', width:'100%', background:'none', border:'none', cursor:'pointer', textAlign:'left', padding:'0 0 20px' }}
                        >
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6 }}>
                                <span style={{ fontSize:11, fontWeight:800, color:'#A8998C', letterSpacing:'0.08em', textTransform:'uppercase' }}>学习星尘 ✨</span>
                                <span style={{ fontSize:12, fontWeight:900, color:'#6B5E52' }}>
                                    {activeKid.exp} <span style={{ fontWeight:600, color:'#C4B8AE' }}>/ {nextLevelExp}</span>
                                </span>
                            </div>
                            <div style={{ height:8, borderRadius:99, background:'#F0EAE4', overflow:'hidden', position:'relative' }}>
                                <div style={{ position:'absolute', inset:0, width:`${expPercent}%`, borderRadius:99, background:'linear-gradient(90deg, #4ade80, #a3e635)', boxShadow:'0 0 8px rgba(74,222,128,0.5)', transition:'width 1s ease' }} />
                            </div>
                            <div style={{ fontSize:10, fontWeight:700, color:'#C4B8AE', marginTop:5, textAlign:'right' }}>
                                还差 {nextLevelExp - activeKid.exp} 星尘 →
                            </div>
                        </button>
                    </div>

                    {/* ── Divider ─────────────────────────────────── */}
                    <div style={{ height:1, background:'#F2EEE9', margin:'0 24px' }} />

                    {/* ── Pet section ─────────────────────────────── */}
                    <div style={{ padding:'12px 0 0' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px 10px' }}>
                            <span style={{ fontSize:13, fontWeight:900, color:'#1C1410' }}>我的宠物</span>
                        </div>
                        <PetSection activeKid={activeKid} onOpenRoom={() => setShowPetRoom(true)} />
                    </div>
                </div>

                {/* ═══════════════════════════════════════════
                    ACHIEVEMENTS
                ═══════════════════════════════════════════ */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                    <h3 style={{ margin:0, fontSize:15, fontWeight:900, color:'#1C1410' }}>成就勋章</h3>
                    <span style={{ fontSize:11, fontWeight:900, color:'#FF8C42', background:'#FFF3EB', padding:'4px 10px', borderRadius:99 }}>
                        {unlockedCount}/{ACHIEVEMENTS.length}
                    </span>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}
                    className="md:grid-cols-4 lg:grid-cols-5">
                    {achievementStatus.map(a => (
                        <button key={a.id}
                            onClick={() => setBadgeDrawer(a)}
                            style={{
                                background: a.unlocked ? '#fff' : '#F0ECE8',
                                border: a.unlocked ? '1px solid #EDEBE7' : 'none',
                                borderRadius: 22,
                                padding: '14px 10px 12px',
                                display:'flex', flexDirection:'column', alignItems:'center',
                                textAlign:'center', cursor:'pointer',
                                boxShadow: a.unlocked ? '0 2px 14px rgba(28,20,16,0.07)' : 'none',
                                filter: a.unlocked ? 'none' : 'grayscale(1)',
                                opacity: a.unlocked ? 1 : 0.45,
                                transition: 'transform .15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'}
                            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                        >
                            <div className={`bg-gradient-to-br ${a.bg}`}
                                style={{ width:48, height:48, borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:8, boxShadow: a.unlocked ? '0 4px 12px rgba(0,0,0,0.12)' : 'none' }}>
                                {a.unlocked ? a.emoji : <Icons.Lock size={14} style={{ color:'rgba(255,255,255,0.5)' }} />}
                            </div>
                            <div style={{ fontSize:10, fontWeight:900, color: a.unlocked ? '#1C1410' : '#A8998C', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', width:'100%' }}>
                                {a.title}
                            </div>
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
};
