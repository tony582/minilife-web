import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDataContext }    from '../../context/DataContext.jsx';
import { useUIContext }      from '../../context/UIContext.jsx';

import { Icons, AvatarDisplay } from '../../utils/Icons';
import { getLevelReq }          from '../../utils/levelUtils';
import { getSpiritForm, getSpiritPrivileges } from '../../utils/spiritUtils';
import { useNavigationStore }    from '../../stores/navigationStore';
import { ACHIEVEMENTS }          from '../../utils/achievements';
import { isTaskDueOnDate }       from '../../utils/taskUtils';
import PetBoxTeaser              from '../../components/VirtualPet/PetBoxTeaser';
import PetRoomModal              from '../../components/VirtualPet/PetRoomModal';
import { ExpHistoryModal }       from './ExpHistoryModal';
import { LevelPrivilegeModal }   from '../../components/modals/LevelPrivilegeModal';
import { AchievementsModal }     from '../../components/modals/AchievementsModal';
import { usePetRooms }           from '../../hooks/usePetRooms';

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export const KidProfileTab = () => {
    const { kids, activeKidId, transactions, tasks } = useDataContext();
    const { parentSettings }                  = useNavigationStore();
    const { setShowAvatarPickerModal }         = useUIContext();

    const [showPetRoom,             setShowPetRoom]             = useState(false);
    const [showExpModal,            setShowExpModal]            = useState(false);
    const [showLevelPrivilegeModal, setShowLevelPrivilegeModal] = useState(false);
    const [showAchievementsModal,   setShowAchievementsModal]   = useState(false);
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

    const todayStr = new Date().toISOString().split('T')[0];
    
    // Compute exact task completion ratio
    const myStudyTasks = tasks.filter(t => (t.kidId === activeKid.id || t.kidId === 'all') && t.type === 'study' && isTaskDueOnDate(t, todayStr));
    const myHabitTasks = tasks.filter(t => (t.kidId === activeKid.id || t.kidId === 'all') && t.type === 'habit');
    
    const completedStudy = myStudyTasks.filter(t => {
        const entry = t.kidId === 'all' ? t.history?.[todayStr]?.[activeKid.id] : t.history?.[todayStr];
        return entry?.status === 'completed';
    }).length;
    
    const completedHabit = myHabitTasks.filter(t => {
        const entry = t.kidId === 'all' ? t.history?.[todayStr]?.[activeKid.id] : t.history?.[todayStr];
        return entry?.status === 'completed';
    }).length;

    const todayIncome = todayTx.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
    const todaySpend  = todayTx.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount || 0), 0);

    const achievementStatus = useMemo(() =>
        ACHIEVEMENTS.map(a => ({ ...a, unlocked: a.check(activeKid, transactions) })),
        [activeKid, transactions]
    );
    const unlockedCount = achievementStatus.filter(a => a.unlocked).length;

    return (
        <div className="animate-fade-in pb-24" style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(180deg, #E6EAFF 0%, #F5F7FA 40%, #F5F7FA 100%)', 
            backgroundAttachment: 'fixed',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
            overflowX: 'hidden'
        }}>
            <style>{`
                @keyframes slowFloat { 0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)} }
                .pet-float { animation: slowFloat 4s ease-in-out infinite; }
                .otter-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 28px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0,0,0,0.02); border: 1px solid rgba(255,255,255,0.8); }
            `}</style>

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
            {showAchievementsModal && <AchievementsModal activeKid={activeKid} transactions={transactions} onClose={() => setShowAchievementsModal(false)} />}
            {showExpModal && <ExpHistoryModal activeKid={activeKid} transactions={transactions} tasks={tasks} nextLevelExp={nextLevelExp} onClose={() => setShowExpModal(false)} />}
            <LevelPrivilegeModal isOpen={showLevelPrivilegeModal} onClose={() => setShowLevelPrivilegeModal(false)} activeKid={activeKid} currentForm={form} />

            {/* Center constrained wrapper for PC/Tablet, width constraints expanded for PC */}
            <div className="w-full max-w-4xl xl:max-w-5xl mx-auto relative z-10" style={{ paddingTop: 'env(safe-area-inset-top, 24px)', paddingBottom: 100 }}>

                {/* ═════════════════════════════════════════════════════
                    SECTION 1: IMMERSIVE HERO
                ═════════════════════════════════════════════════════ */}
                <div className="relative overflow-hidden pb-5 px-4 sm:px-5">
                    {/* Decorative half-circle blobs — pink theme for profile */}
                    <div className="absolute -top-32 -left-20 w-56 h-56 rounded-full opacity-15" style={{ background: '#EC4899' }}></div>
                    <div className="absolute -top-20 -left-12 w-40 h-40 rounded-full opacity-10" style={{ background: '#F472B6' }}></div>

                    {/* Title */}
                    <div className="relative z-10 mb-5 pt-1 px-1">
                        <div className="text-2xl font-black" style={{ color: '#1B2E4B' }}>
                            成长档案
                        </div>
                        <div className="text-sm font-bold mt-0.5" style={{ color: '#5A6E8A' }}>
                            记录你的每一步闪耀时刻
                        </div>
                    </div>

                    {/* Stardust Progress Card */}
                    <div className="otter-card cursor-pointer flex items-stretch p-3.5 sm:p-5 gap-3 sm:gap-4 relative z-10" 
                        onClick={() => setShowLevelPrivilegeModal(true)}
                    >
                        {/* ── Left Column: Avatar & Name (Pure Flat, Centered & Enlarged) ── */}
                        <div className="flex flex-col items-center justify-center shrink-0 w-[4rem] sm:w-[4.5rem] md:w-[5.5rem]">
                            <div 
                                className="w-14 h-14 sm:w-[4.25rem] sm:h-[4.25rem] md:w-[4.75rem] md:h-[4.75rem] rounded-full flex items-center justify-center text-[36px] sm:text-[40px] md:text-[44px] bg-slate-100 mb-2 overflow-hidden cursor-pointer hover:bg-slate-200 transition-colors"
                                onClick={(e) => { e.stopPropagation(); setShowAvatarPickerModal(true); }}
                            >
                                <AvatarDisplay avatar={activeKid.avatar} />
                            </div>
                            <div className="text-xs sm:text-[13px] md:text-sm font-black text-slate-700 w-full text-center truncate px-0.5">
                                {activeKid.name}
                            </div>
                        </div>

                        {/* ── Right Column: Level, Progress & Privileges ── */}
                        <div className="flex-1 flex flex-col gap-2.5 sm:gap-3 min-w-0">
                            {/* ── Title Row ── */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="shrink-0" style={{ color: form.color }}>
                                        <Icons.Sparkles className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={2} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-xs sm:text-[13px] flex items-center gap-1.5 sm:gap-2" style={{ color: '#1B2E4B' }}>
                                            星尘等级
                                            <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded shrink-0" style={{ background: `${form.color}15` }}>
                                                <span className="font-bold text-[9px] sm:text-[10px]" style={{ color: form.color }}>
                                                    Lv.{activeKid.level}
                                                </span>
                                                <span className="w-1 h-1 rounded-full opacity-30" style={{ background: form.color }}></span>
                                                <span className="text-[9px] sm:text-[10px] font-bold truncate pr-0.5" style={{ color: form.color }}>
                                                    {form.name}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Progress Bar ── */}
                            <div className="flex flex-col gap-1.5 w-full">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-wider pl-0.5">当前进度</span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setShowExpModal(true); }}
                                        className="flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-transparent py-0.5 cursor-pointer transition-colors border-none"
                                    >
                                        {activeKid.exp} / {nextLevelExp}
                                        <Icons.ChevronRight size={10} strokeWidth={3} />
                                    </button>
                                </div>
                                <div style={{ position: 'relative', width: '100%', height: 20, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
                                    <div style={{ width: `${expPercent}%`, height: '100%', background: form.color, borderRadius: 99, position: 'relative', zIndex: 1, minWidth: '15%', transition: 'width 0.5s ease-out' }} />
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', padding: '0 8px', zIndex: 2, pointerEvents: 'none' }}>
                                        <span style={{ fontSize: 10, fontWeight: 900, color: expPercent > 15 ? 'rgba(255,255,255,0.95)' : '#9CA3AF' }}>{Math.round(expPercent)}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* ── 3 Privilege Boxes Grid (Pure Flat) ── */}
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                                <div className="rounded-xl px-1 py-1.5 sm:p-2.5 text-center flex flex-col justify-center bg-slate-50">
                                    <div className="text-[8px] sm:text-[9px] font-bold mb-0.5 sm:mb-1 scale-95 sm:scale-100" style={{ color: '#94A3B8' }}>周利息加成</div>
                                    <div className="text-xs sm:text-sm font-black" style={{ color: privileges.interestBonus > 0 ? '#0D9488' : '#CBD5E1' }}>
                                        {privileges.interestBonus > 0 ? `+${privileges.interestBonus}%` : '待解锁'}
                                    </div>
                                </div>
                                <div className="rounded-xl px-1 py-1.5 sm:p-2.5 text-center flex flex-col justify-center bg-slate-50">
                                    <div className="text-[8px] sm:text-[9px] font-bold mb-0.5 sm:mb-1 scale-95 sm:scale-100" style={{ color: '#94A3B8' }}>每日掉落</div>
                                    <div className="text-xs sm:text-sm font-black" style={{ color: privileges.dailyBonus > 0 ? '#EA580C' : '#CBD5E1' }}>
                                        {privileges.dailyBonus > 0 ? `+${privileges.dailyBonus}` : '待解锁'}
                                    </div>
                                </div>
                                <div className="rounded-xl px-1 py-1.5 sm:p-2.5 text-center flex flex-col justify-center bg-slate-50">
                                    <div className="text-[8px] sm:text-[9px] font-bold mb-0.5 sm:mb-1 scale-95 sm:scale-100" style={{ color: '#94A3B8' }}>兑换折扣</div>
                                    <div className="text-xs sm:text-sm font-black" style={{ color: privileges.shopDiscount > 0 ? '#7C3AED' : '#CBD5E1' }}>
                                        {privileges.shopDiscount > 0 ? `${100 - privileges.shopDiscount}折` : '待解锁'}
                                    </div>
                                </div>
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
                                    <Icons.BookOpen size={18} style={{ color: '#4F46E5' }} />
                                </div>
                                <span style={{ fontSize: 15, fontWeight: 800, color: '#4B5563' }}>今日任务</span>
                            </div>
                            <div style={{ fontSize: 32, fontWeight: 900, color: '#111827', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                {completedStudy}
                                <span style={{ fontSize: 16, color: '#9CA3AF', fontWeight: 800 }}>/{myStudyTasks.length}</span>
                            </div>
                        </div>

                        {/* Habit Card */}
                        <div className="otter-card" style={{ padding: '22px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 12, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icons.ShieldCheck size={18} style={{ color: '#D97706' }} />
                                </div>
                                <span style={{ fontSize: 15, fontWeight: 800, color: '#4B5563' }}>好习惯</span>
                            </div>
                            <div style={{ fontSize: 32, fontWeight: 900, color: '#111827', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                {completedHabit}
                                <span style={{ fontSize: 16, color: '#9CA3AF', fontWeight: 800 }}>/{myHabitTasks.length}</span>
                            </div>
                        </div>
                    </div>



                    {/* Row 3: Direct Link to Room */}
                    <button onClick={() => setShowPetRoom(true)} className="otter-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {/* Floating Pet Model on the left */}
                            <div className="pet-float" style={{ marginLeft: '-8px', marginRight: '4px', transformOrigin: 'bottom left' }}>
                                <PetBoxTeaser size={72} />
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>访问{petName}的小窝</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF' }}>去布置你的专属空间</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icons.ChevronRight size={16} style={{ color: '#9CA3AF' }} />
                            </div>
                        </div>
                    </button>
                    
                    {/* ═════════════════════════════════════════════════════
                        SECTION 3: ACHIEVEMENTS SUMMARY CARD
                    ═════════════════════════════════════════════════════ */}
                    <button onClick={() => setShowAchievementsModal(true)} className="otter-card" style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 12, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icons.Award size={18} style={{ color: '#D97706' }} />
                                </div>
                                <span style={{ fontSize: 15, fontWeight: 800, color: '#4B5563' }}>我的奖状</span>
                            </div>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icons.ChevronRight size={14} style={{ color: '#9CA3AF' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ fontSize: 32, fontWeight: 900, color: '#111827', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                {unlockedCount}
                                <span style={{ fontSize: 16, color: '#9CA3AF', fontWeight: 800 }}>/{ACHIEVEMENTS.length}</span>
                            </div>
                            <div style={{ width: 100, height: 6, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
                                <div style={{ width: `${(unlockedCount/ACHIEVEMENTS.length)*100}%`, height: '100%', background: '#F59E0B', borderRadius: 99, transition: 'width 0.5s ease-out' }} />
                            </div>
                        </div>
                    </button>
                    
                </div>
            </div>
        </div>
    );
};
