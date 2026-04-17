import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../../utils/Icons';
import { ACHIEVEMENTS } from '../../utils/achievements';

const CAT_ICONS = {
    '📚 学习': Icons.BookOpen,
    '🎯 习惯': Icons.Target,
    '💰 理财': Icons.Wallet, 
    '⭐ 成长': Icons.Star,
    '🎁 收集': Icons.Package,
    '📊 纪录': Icons.Zap
};

const Confetti = () => {
    const particles = useMemo(() => {
        const colors = ['#FCD34D', '#34D399', '#60A5FA', '#F472B6', '#A78BFA'];
        return Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            color: colors[Math.floor(Math.random() * colors.length)],
            tx: (Math.random() - 0.5) * 350,
            ty: (Math.random() - 0.5) * 350 - 100, // shoot upwards
            rot: Math.random() * 360,
            delay: Math.random() * 0.1,
            scale: 0.5 + Math.random() * 1,
            shape: Math.random() > 0.5 ? '50%' : '2px'
        }));
    }, []);

    return (
        <div className="absolute top-1/2 left-1/2 w-0 h-0 pointer-events-none z-[-1]">
            {particles.map(p => (
                <div key={p.id} className="absolute w-3 h-3"
                    style={{
                        background: p.color,
                        borderRadius: p.shape,
                        '--tx': `${p.tx}px`,
                        '--ty': `${p.ty}px`,
                        '--rot': `${p.rot}deg`,
                        '--s': p.scale,
                        transform: 'translate(-50%, -50%)',
                        animation: `confettiBang 1.2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards`,
                        animationDelay: `${p.delay}s`,
                        opacity: 0
                    }} 
                />
            ))}
        </div>
    );
};

function BadgeDrawer({ badge, onClose }) {
    if (!badge) return null;
    const CatIcon = CAT_ICONS[badge.category] || Icons.Star;
    return (
        <div className="fixed inset-0 z-[10005] flex flex-col justify-end md:justify-center md:items-center" onClick={onClose}>
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />
            <div className="relative bg-[#F9FAFB] rounded-t-[32px] md:rounded-[2rem] w-full md:max-w-sm pb-[env(safe-area-inset-bottom,20px)] md:pb-0 flex flex-col shadow-2xl"
                style={{ animation: 'drawerIn .3s cubic-bezier(0.16, 1, 0.3, 1)' }}
                onClick={e => e.stopPropagation()}>
                <div className="flex justify-center pt-4 pb-2 md:hidden">
                    <div className="w-10 h-1.5 rounded-full bg-slate-300" />
                </div>
                <div className="px-7 pt-3 pb-8 md:pt-8 md:pb-8 flex flex-col items-center">
                    
                    <div className="relative group" style={{ marginTop: 12 }}>
                        {badge.unlocked && <Confetti />}
                        
                        {/* Aura glow (only unlocked) */}
                        {badge.unlocked && (
                            <div className="absolute inset-0 bg-yellow-400 rounded-[32px] blur-[24px] opacity-40 animate-pulse pointer-events-none" />
                        )}

                        <div className={`bg-gradient-to-br ${badge.bg} relative overflow-hidden`}
                            style={{ 
                                width:110, height:110, borderRadius:32, display:'flex', alignItems:'center', justifyContent:'center',
                                filter: badge.unlocked?'none':'grayscale(1)', opacity: badge.unlocked?1:0.4, border: badge.unlocked?'none':'2px solid #E5E7EB',
                                boxShadow: badge.unlocked ? '0 20px 40px rgba(251, 191, 36, 0.3), inset 0 2px 0 rgba(255,255,255,0.4)' : 'none',
                                animation: badge.unlocked ? 'badgePop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none'
                             }}>
                            
                            {/* Shiny sweep effect */}
                            {badge.unlocked && (
                                <div className="absolute inset-0 z-[1] w-[200%] h-full pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0.5) 60%, transparent 80%)', animation: 'sweep 2.5s ease-in-out infinite' }} />
                            )}
                            
                            {/* Animated Icon */}
                            <div className="relative z-10" style={{ animation: badge.unlocked ? 'iconFloat 3s ease-in-out infinite' : 'none' }}>
                                {badge.unlocked ? <CatIcon size={48} style={{ color: 'white', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }} /> : <Icons.Lock size={40} style={{ color: '#9CA3AF' }}/>}
                            </div>
                        </div>
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

export const AchievementsModal = ({ activeKid, transactions, onClose }) => {
    const [badgeTab, setBadgeTab] = useState('全部');
    const [badgeDrawer, setBadgeDrawer] = useState(null);

    const achievementStatus = useMemo(() =>
        ACHIEVEMENTS.map(a => ({ ...a, unlocked: a.check(activeKid, transactions) })),
        [activeKid, transactions]
    );

    const badgeCategories = ['全部', '📚 学习', '🎯 习惯', '💰 理财', '⭐ 成长', '🎁 收集', '📊 纪录'];
    const filteredBadges = badgeTab === '全部' ? achievementStatus : achievementStatus.filter(a => a.category === badgeTab);
    const unlockedCount = achievementStatus.filter(a => a.unlocked).length;

    const modalContent = (
        <div className="fixed inset-0 z-[10000] flex flex-col md:items-center md:justify-center md:bg-slate-900/40 md:backdrop-blur-sm transition-opacity" onClick={onClose}>
            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes drawerIn { from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1} }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .otter-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 28px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0,0,0,0.02); border: 1px solid rgba(255,255,255,0.8); }
                @keyframes badgePop {
                    0% { transform: scale(0.3) rotate(-15deg); opacity: 0; }
                    50% { transform: scale(1.1) rotate(5deg); opacity: 1; }
                    100% { transform: scale(1) rotate(0deg); opacity: 1;}
                }
                @keyframes iconFloat {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-4px) scale(1.05); }
                }
                @keyframes sweep {
                    0% { transform: translateX(-100%) skewX(-15deg); }
                    50%, 100% { transform: translateX(100%) skewX(-15deg); }
                }
                @keyframes confettiBang {
                    0% { opacity: 1; transform: translate(-50%, -50%) scale(0) rotate(0deg); }
                    80% { opacity: 1; }
                    100% { opacity: 0; transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(var(--s)) rotate(var(--rot)); }
                }
            `}</style>
            
            <div 
                className="flex flex-col flex-1 md:flex-none w-full h-full md:h-[85vh] bg-[#F9FAFB] md:rounded-[2rem] md:max-w-4xl md:shadow-2xl overflow-hidden relative"
                style={{ animation: 'fade-in 0.2s ease-out' }}
                onClick={e => e.stopPropagation()}
            >
            {/* Header */}
            <div className="pt-[env(safe-area-inset-top,20px)] md:pt-4 pb-4 px-5 md:px-8 bg-white flex items-center justify-between border-b border-slate-100">
                <div style={{ fontSize: 20, fontWeight: 900, color: '#111827', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icons.Award size={22} style={{ color: '#4B5563' }} /> 
                    我的奖状
                </div>
                <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                    <Icons.X size={20} style={{ color: '#6B7280' }} />
                </button>
            </div>

            {/* Filter Pills */}
            <div style={{ background: '#FFFFFF', padding: '16px 20px 8px' }}>
                <div className="hide-scrollbar" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 12 }}>
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
                                    background: isActive ? '#111827' : '#F3F4F6',
                                    color: isActive ? '#FFFFFF' : '#6B7280',
                                    cursor: 'pointer', transition: 'all .2s ease',
                                    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                                }}>
                                {catLabel}
                            </button>
                        );
                    })}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#9CA3AF', paddingBottom: 8 }}>
                    已收集 {unlockedCount} / {ACHIEVEMENTS.length}
                </div>
            </div>

            {/* Badge Grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 100px' }}>
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
                                    cursor: 'pointer', border: 'none',
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
                                <div style={{ fontSize: 13, fontWeight: 900, color: a.unlocked ? '#111827' : '#9CA3AF', lineHeight: 1.2, textAlign: 'center', overflow: 'hidden', width: '100%' }}>
                                    {a.title}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <BadgeDrawer badge={badgeDrawer} onClose={() => setBadgeDrawer(null)} />
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
