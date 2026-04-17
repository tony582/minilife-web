import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDataContext }    from '../../context/DataContext.jsx';
import { useUIContext }      from '../../context/UIContext.jsx';

import { Icons, AvatarDisplay } from '../../utils/Icons';
import { getLevelReq }          from '../../utils/levelUtils';
import { getSpiritForm, getSpiritPrivileges } from '../../utils/spiritUtils';
import { useNavigationStore }    from '../../stores/navigationStore';
import { ACHIEVEMENTS }          from '../../utils/achievements';
import PetBoxTeaser              from '../../components/VirtualPet/PetBoxTeaser';
import PetRoomModal              from '../../components/VirtualPet/PetRoomModal';
import { ExpHistoryModal }       from './ExpHistoryModal';
import { LevelPrivilegeModal }   from '../../components/modals/LevelPrivilegeModal';
import { usePetRooms }           from '../../hooks/usePetRooms';

/* ─── Keyframes ──────────────────────────── */
const CSS = `
@keyframes drawerIn { from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1} }
@keyframes slowFloat { 0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)} }
@keyframes pulseGlow { 0%,100%{opacity:0.4; transform:scale(1)}50%{opacity:0.6; transform:scale(1.1)} }

.pet-float { animation: slowFloat 4s ease-in-out infinite; }
.bg-glow-1 { position:absolute; top: 10%; left: 20%; width: 250px; height: 250px; background: radial-gradient(circle, rgba(167, 139, 250, 0.4) 0%, rgba(255,255,255,0) 70%); animation: pulseGlow 6s infinite; border-radius: 50%; pointer-events: none;}
.bg-glow-2 { position:absolute; top: 5%; right: 10%; width: 200px; height: 200px; background: radial-gradient(circle, rgba(110, 231, 183, 0.3) 0%, rgba(255,255,255,0) 70%); animation: pulseGlow 8s infinite reverse; border-radius: 50%; pointer-events: none;}

.otter-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 28px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0,0,0,0.02);
    border: 1px solid rgba(255,255,255,0.8);
}
.otter-pill {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 99px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const CAT_ICONS = {
    '📚 学习': Icons.BookOpen,
    '🎯 习惯': Icons.Target,
    '💰 理财': Icons.Wallet, 
    '⭐ 成长': Icons.Star,
    '🎁 收集': Icons.Package,
    '📊 纪录': Icons.Zap
};

/* ─── Badge drawer ────────────────────────── */
function BadgeDrawer({ badge, onClose }) {
    if (!badge) return null;
    const CatIcon = CAT_ICONS[badge.category] || Icons.Star;
    return (
        <div style={{ position:'fixed', inset:0, zIndex:500, display:'flex', flexDirection:'column', justifyContent:'flex-end' }} onClick={onClose}>
            <div style={{ position:'absolute', inset:0, background:'rgba(20,20,30,0.3)', backdropFilter:'blur(5px)' }} />
            <div style={{ position:'relative', background:'#F9FAFB', borderRadius:'32px 32px 0 0', animation:'drawerIn .3s cubic-bezier(0.16, 1, 0.3, 1)', paddingBottom:'env(safe-area-inset-bottom,20px)' }}
                onClick={e => e.stopPropagation()}>
                <div style={{ display:'flex', justifyContent:'center', padding:'16px 0 8px' }}>
                    <div style={{ width:40, height:6, borderRadius:99, background:'#D1D5DB' }} />
                </div>
                <div style={{ padding:'12px 28px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    
                    <div className={`bg-gradient-to-br ${badge.bg}`}
                        style={{ width:100, height:100, borderRadius:32, display:'flex', alignItems:'center', justifyContent:'center', marginTop:12,
                            filter: badge.unlocked?'none':'grayscale(1)', opacity: badge.unlocked?1:0.4, border: badge.unlocked?'none':'2px solid #E5E7EB',
                            boxShadow: badge.unlocked?'0 12px 30px rgba(0,0,0,0.15)':'none' }}>
                        {badge.unlocked ? <CatIcon size={42} style={{ color: 'white' }} /> : <Icons.Lock size={40} style={{ color: '#9CA3AF' }}/>}
                    </div>
                    
                    <div style={{ fontWeight:900, fontSize:24, color:'#111827', marginTop:20, letterSpacing:'-0.02em', textAlign:'center' }}>{badge.title}</div>
                    
                    <div style={{ fontSize:13, fontWeight:800, padding:'6px 18px', borderRadius:99, marginTop:10, background: badge.unlocked?'#10B981':'#E5E7EB', color: badge.unlocked?'#FFFFFF':'#6B7280' }}>
                        {badge.unlocked ? '✨ 已解锁' : '尚未解锁'}
                    </div>

                    <div className="otter-card" style={{ width:'100%', padding:22, marginTop:24, marginBottom:20, background:'#FFFFFF' }}>
                        <div style={{ fontSize:12, fontWeight:800, color:'#6B7280', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                            <Icons.Info size={16} /> 获得条件
                        </div>
                        <div style={{ fontSize:16, fontWeight:800, color:'#374151', lineHeight: 1.4 }}>{badge.desc}</div>
                    </div>
                    
                    <button onClick={onClose} style={{ width:'100%', padding:18, borderRadius:24, fontWeight:800, fontSize:16, background:'#111827', color:'#FFFFFF', border:'none', cursor:'pointer' }}>关闭</button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export const KidProfileTab = () => {
    const { kids, activeKidId, transactions, tasks } = useDataContext();
    const { parentSettings }                  = useNavigationStore();
    const { setShowAvatarPickerModal }         = useUIContext();

    const [badgeDrawer,             setBadgeDrawer]             = useState(null);
    const [showPetRoom,             setShowPetRoom]             = useState(false);
    const [showExpModal,            setShowExpModal]            = useState(false);
    const [showLevelPrivilegeModal, setShowLevelPrivilegeModal] = useState(false);
    const [badgeTab,                setBadgeTab]                = useState('全部');
    const petRooms = usePetRooms(activeKidId);

    const activeKid = kids.find(k => k.id === activeKidId);
    if (!activeKid) return null;

    const nextLevelExp = getLevelReq(activeKid.level);
    const form         = getSpiritForm(activeKid.level);
    const privileges   = getSpiritPrivileges(activeKid.level);
    const expPercent   = Math.min(100, Math.max(0, (activeKid.exp / nextLevelExp) * 100));
    const petName      = petRooms.activeRoom?.petName || '波奇';

    /* ── Today's data ── */
    const today = new Date().toDateString();
    const kidTx = transactions.filter(t => t.kidId === activeKid.id);
    const todayTx = kidTx.filter(t => new Date(t.date).toDateString() === today);

    const todayTasks  = todayTx.filter(t => t.type === 'income' && t.category === 'task').length;
    const todayHabits = todayTx.filter(t => t.type === 'income' && t.category === 'habit').length;
    const todayIncome = todayTx.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
    const todaySpend  = todayTx.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount || 0), 0);

    const achievementStatus = useMemo(() =>
        ACHIEVEMENTS.map(a => ({ ...a, unlocked: a.check(activeKid, transactions) })),
        [activeKid, transactions]
    );
    const unlockedCount = achievementStatus.filter(a => a.unlocked).length;
    const badgeCategories = ['全部', '📚 学习', '🎯 习惯', '💰 理财', '⭐ 成长', '🎁 收集', '📊 纪录'];
    const filteredBadges = badgeTab === '全部' ? achievementStatus : achievementStatus.filter(a => a.category === badgeTab);

    return (
        <div className="animate-fade-in pb-24" style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(180deg, #E6EAFF 0%, #F5F7FA 40%, #F5F7FA 100%)', 
            backgroundAttachment: 'fixed',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
            overflowX: 'hidden'
        }}>
            <style>{CSS}</style>

            {/* Decorative half-circle blobs — pink theme for profile */}
            <div className="absolute -top-32 -left-20 w-56 h-56 rounded-full opacity-15" style={{ background: '#EC4899', position: 'absolute', zIndex: 0 }}></div>
            <div className="absolute -top-20 -left-12 w-40 h-40 rounded-full opacity-10" style={{ background: '#F472B6', position: 'absolute', zIndex: 0 }}></div>

            {/* Ambient Background Glows connecting PC/Mobile boundaries softly */}
            <div className="bg-glow-1"></div>
            <div className="bg-glow-2"></div>

            {/* ── Modals ── */}
            {showPetRoom && createPortal(
                <PetRoomModal
                    rooms={petRooms.rooms}
                    activeRoomIdx={petRooms.activeRoomIdx}
                    setActiveRoomIdx={petRooms.setActiveRoomIdx}
                    updateSkin={petRooms.updateSkin}
                    updateFurniture={petRooms.updateFurniture}
                    updatePetVitals={petRooms.updatePetVitals}
                    updatePetName={petRooms.updatePetName}
                    unlockRoom={petRooms.unlockRoom}
                    kidId={activeKid.id}
                    activeKid={activeKid}
                    onClose={() => setShowPetRoom(false)}
                    isLocked={false}
                    remainingLabel=""
                    remainingSeconds={9999}
                    limitSeconds={9999}
                    progressPct={0}
                    backpack={petRooms.globalBackpack}
                    updateFurnitureItem={petRooms.updateFurnitureItem}
                    placeFurnitureFromGlobal={petRooms.placeFurnitureFromGlobal}
                    consumables={petRooms.consumables}
                    hotbar={petRooms.hotbar}
                    updateConsumables={petRooms.updateConsumables}
                    updateHotbar={petRooms.updateHotbar}
                />,
                document.body
            )}
            <BadgeDrawer badge={badgeDrawer} onClose={() => setBadgeDrawer(null)} />
            {showExpModal && <ExpHistoryModal activeKid={activeKid} transactions={transactions} tasks={tasks} nextLevelExp={nextLevelExp} onClose={() => setShowExpModal(false)} />}
            <LevelPrivilegeModal isOpen={showLevelPrivilegeModal} onClose={() => setShowLevelPrivilegeModal(false)} activeKid={activeKid} currentForm={form} />

            {/* Center constrained wrapper for PC/Tablet, width constraints isolated here */}
            <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 'env(safe-area-inset-top, 24px)', paddingBottom: 100, position:'relative', zIndex: 10 }}>

                {/* ═════════════════════════════════════════════════════
                    SECTION 1: IMMERSIVE HERO (Otterlife Style)
                ═════════════════════════════════════════════════════ */}

                {/* The Floating Pet (Moved to top since redundant avatar is removed) */}
                <button 
                    onClick={() => setShowPetRoom(true)}
                    style={{ width: '100%', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 16 }}
                >
                    <div className="pet-float" style={{ transformOrigin: 'bottom center' }}>
                        <PetBoxTeaser size={140} />
                    </div>
                </button>

                {/* Main Prominent Title */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
                        {form.name}
                    </h1>
                </div>

                {/* Full-width Progress Card */}
                <div style={{ padding: '0 20px', marginBottom: 16 }}>
                    <div className="otter-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <button onClick={() => setShowLevelPrivilegeModal(true)} style={{ background: form.color, border: 'none', color: 'white', fontSize: 13, fontWeight: 900, padding: '4px 10px', borderRadius: 8, cursor: 'pointer', boxShadow: `0 4px 12px ${form.color}40` }}>
                                    Lv.{activeKid.level}
                                </button>
                                <span style={{ fontSize: 16, fontWeight: 900, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Icons.Sparkles size={18} style={{ color: form.color }} /> 学习星尘
                                </span>
                            </div>
                            <button onClick={() => setShowExpModal(true)} style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 900, color: '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2, padding: 0 }}>
                                记录 <Icons.ChevronRight size={14} />
                            </button>
                        </div>

                        {/* Thick Progress Bar with inner text */}
                        <div style={{ position: 'relative', width: '100%', height: 28, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: `${expPercent}%`, height: '100%', background: form.color, borderRadius: 99, position: 'relative', zIndex: 1, minWidth: '15%', transition: 'width 0.5s ease-out' }} />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px', zIndex: 2, pointerEvents: 'none' }}>
                                <span style={{ fontSize: 12, fontWeight: 900, color: expPercent > 15 ? 'rgba(255,255,255,0.9)' : '#9CA3AF' }}>{Math.round(expPercent)}%</span>
                                <span style={{ fontSize: 12, fontWeight: 800, color: '#9CA3AF' }}>{activeKid.exp} / {nextLevelExp}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═════════════════════════════════════════════════════
                    SECTION 2: OTTERLIFE STYLE BUBBLY CARDS
                ═════════════════════════════════════════════════════ */}
                <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    
                    {/* Row 1: Tasks & Habits (Side by Side) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {/* Task Card */}
                        <div className="otter-card" style={{ padding: '22px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 12, background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icons.CheckCircle size={18} style={{ color: '#4F46E5' }} />
                                </div>
                                <span style={{ fontSize: 15, fontWeight: 800, color: '#4B5563' }}>今日任务</span>
                            </div>
                            <div style={{ fontSize: 32, fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>
                                {todayTasks} <span style={{ fontSize: 14, color: '#9CA3AF' }}>项</span>
                            </div>
                        </div>

                        {/* Habit Card */}
                        <div className="otter-card" style={{ padding: '22px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 12, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icons.Target size={18} style={{ color: '#D97706' }} />
                                </div>
                                <span style={{ fontSize: 15, fontWeight: 800, color: '#4B5563' }}>好习惯</span>
                            </div>
                            <div style={{ fontSize: 32, fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>
                                {todayHabits} <span style={{ fontSize: 14, color: '#9CA3AF' }}>个</span>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Wealth Full-width Card */}
                    <div className="otter-card" style={{ padding: '24px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 12, background: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icons.Wallet size={18} style={{ color: '#BE185D' }} />
                                </div>
                                <span style={{ fontSize: 15, fontWeight: 800, color: '#4B5563' }}>我的小金库</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: '#10B981', background: '#D1FAE5', padding: '4px 10px', borderRadius: 99, display: 'inline-block', marginBottom: 4 }}>收 +{todayIncome}</div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: '#EF4444', background: '#FEE2E2', padding: '4px 10px', borderRadius: 99, display: 'inline-block', marginLeft: 6 }}>支 -{todaySpend}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <span style={{ fontSize: 40, fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>{activeKid.balance ?? 0}</span>
                            <span style={{ fontSize: 16, fontWeight: 800, color: '#9CA3AF' }}>币</span>
                        </div>
                    </div>

                    {/* Row 3: Direct Link to Room */}
                    <button onClick={() => setShowPetRoom(true)} className="otter-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 16, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icons.Home size={22} style={{ color: '#4B5563' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>访问{petName}的小窝</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF' }}>去布置你的专属空间</div>
                            </div>
                        </div>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.ChevronRight size={18} style={{ color: '#9CA3AF' }} />
                        </div>
                    </button>
                    
                    {/* ═════════════════════════════════════════════════════
                        SECTION 3: ACHIEVEMENTS
                    ═════════════════════════════════════════════════════ */}
                    <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111827', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Icons.Award size={22} style={{ color: '#4B5563' }} /> 成就收集
                            </h3>
                            <div style={{ fontSize: 14, fontWeight: 900, color: '#6B7280' }}>
                                {unlockedCount}/{ACHIEVEMENTS.length}
                            </div>
                        </div>

                        {/* Category filter pills */}
                        <div className="hide-scrollbar" style={{ display: 'flex', gap: 10, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
                            {badgeCategories.map(cat => {
                                const isActive = badgeTab === cat;
                                const catLabel = cat === '全部' ? '全部' : cat.slice(2).trim();
                                return (
                                    <button key={cat} onClick={() => setBadgeTab(cat)}
                                        style={{
                                            flexShrink: 0,
                                            fontSize: 14, fontWeight: 800, letterSpacing: '0.02em',
                                            padding: '10px 20px', borderRadius: 99,
                                            border: 'none',
                                            background: isActive ? '#111827' : '#FFFFFF',
                                            color: isActive ? '#FFFFFF' : '#6B7280',
                                            cursor: 'pointer', transition: 'all .2s ease',
                                            boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.02)'
                                        }}>
                                        {catLabel}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Flat Grid for Badges */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                            {filteredBadges.map(a => {
                                const CatIcon = CAT_ICONS[a.category] || Icons.Star;
                                return (
                                    <button key={a.id}
                                        onClick={() => setBadgeDrawer(a)}
                                        className="otter-card"
                                        style={{
                                            padding: '24px 12px 20px',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                                            cursor: 'pointer',
                                            border: 'none',
                                            background: a.unlocked ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                                            boxShadow: a.unlocked ? '0 8px 24px rgba(0,0,0,0.04)' : 'none'
                                        }}
                                    >
                                        <div className={a.unlocked ? `bg-gradient-to-br ${a.bg}` : ''}
                                            style={{ 
                                                width: 60, height: 60, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                                                background: a.unlocked ? undefined : '#F3F4F6',
                                                boxShadow: a.unlocked ? '0 8px 16px rgba(0,0,0,0.1)' : 'none'
                                            }}>
                                            {a.unlocked ? <CatIcon size={28} style={{ color:'white' }} /> : <Icons.Lock size={24} style={{ color:'#D1D5DB' }} />}
                                        </div>
                                        <div style={{ fontSize: 14, fontWeight: 900, color: a.unlocked ? '#111827' : '#9CA3AF', lineHeight: 1.2, textAlign: 'center', overflow: 'hidden', width: '100%' }}>
                                            {a.title}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
