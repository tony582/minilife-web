import React from 'react';
import { useDataContext } from '../../context/DataContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { useToast } from '../../hooks/useToast';
import { apiFetch } from '../../api/client';
import { Icons, AvatarDisplay } from '../../utils/Icons';
import { getLevelTier, getLevelReq } from '../../utils/levelUtils';
import { getSpiritForm } from '../../utils/spiritUtils';
import { KidStudyTab } from './KidStudyTab';
import { KidHabitTab } from './KidHabitTab';
import { KidWealthTab } from './KidWealthTab';
import { KidShopTab } from './KidShopTab';
import { KidProfileTab } from './KidProfileTab';
import PetCapsule from '../../components/VirtualPet/PetCapsule';

export const KidApp = () => {
    const {
        kids,
        tasks,
        orders,
        transactions,
        setKids,
        activeKidId,
        changeActiveKid,
    } = useDataContext();

    const {
        changeAppState,
        showKidSwitcher,
        setShowKidSwitcher,
        showParentPinModal,
        setShowParentPinModal,
        pinInput,
        setPinInput,
        showAvatarPickerModal,
        setShowAvatarPickerModal,
        pendingAvatar,
        setPendingAvatar,
        showLevelModal,
        setShowLevelModal,
        kidTab,
        setKidTab,
        parentSettings,
    } = useUIContext();

    const { notify } = useToast();

    const activeKid = kids.find(k => k.id === activeKidId);

    const switchKid = (kidId) => {
        changeActiveKid(kidId);
        setShowKidSwitcher(false);
        setKidTab('study');
    };

    const openParentFromKid = () => {
        if (parentSettings.pinEnabled) {
            setShowParentPinModal(true);
        } else {
            changeAppState('parent_app');
        }
    };

    const handlePinClick = (num) => {
        if (pinInput.length < 4) {
            const newVal = pinInput + num;
            setPinInput(newVal);
            if (newVal.length === 4) {
                if (newVal === parentSettings.pinCode) {
                    setShowParentPinModal(false);
                    setPinInput('');
                    changeAppState('parent_app');
                } else {
                    notify("家长密码错误！", "error");
                    setPinInput('');
                }
            }
        }
    };

    if (!activeKid) return null;

    const myTasks = tasks.filter(t => t.kidId === activeKidId || t.kidId === 'all');
    const myOrders = orders.filter(o => o.kidId === activeKidId);
    const nextLevelExp = getLevelReq(activeKid.level);

    // Count today's completed tasks for anti-addiction bonus calculation
    const today = new Date().toISOString().split('T')[0];
    const completedTasksToday = myTasks.filter(t =>
        t.status === 'completed' &&
        (t.date === today || (t.dates && t.dates.includes(today)))
    ).length;

    return (
        <>
        <div className={`min-h-screen font-sans text-left animate-fade-in overflow-x-hidden ${kidTab !== 'profile' ? 'pb-24' : ''}`} style={{ background: (kidTab === 'study' || kidTab === 'habit' || kidTab === 'wealth' || kidTab === 'profile') ? '#FBF7F0' : '#f4f7f9' }}>
            {/* Mobile navbar - unchanged */}
            <div className="md:hidden bg-white border-b border-slate-100 px-4 py-3 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-2">
                    <img src="/minilife_logo.png" className="w-8 h-8 rounded-xl shadow-sm border border-slate-100/50" alt="Logo" /> <span className="font-black text-xl text-slate-800 tracking-tight">MiniLife</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button onClick={() => setShowKidSwitcher(!showKidSwitcher)} className="flex items-center gap-2 bg-slate-50 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-lg overflow-hidden"><AvatarDisplay avatar={activeKid.avatar} /></div>
                            <span className="text-sm font-bold text-slate-700">{activeKid.name}</span>
                            <Icons.ChevronRight size={14} className={`text-slate-400 transition-transform ${showKidSwitcher ? 'rotate-90' : ''}`} />
                        </button>
                        {showKidSwitcher && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowKidSwitcher(false)}></div>
                                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 min-w-[160px] z-50 animate-fade-in">
                                    {kids.map(k => (
                                        <button key={k.id} onClick={() => switchKid(k.id)} className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left ${k.id === activeKidId ? 'bg-indigo-50' : ''}`}>
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xl overflow-hidden"><AvatarDisplay avatar={k.avatar} /></div>
                                            <span className={`font-bold text-sm ${k.id === activeKidId ? 'text-indigo-600' : 'text-slate-700'}`}>{k.name}</span>
                                            {k.id === activeKidId && <Icons.Check size={14} className="text-indigo-500 ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    <button onClick={openParentFromKid} className="flex items-center gap-1.5 text-sm font-bold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-200">
                        <Icons.Lock size={14} /> 家长
                    </button>
                </div>
            </div>

            {/* PC unified header */}
            <div className="hidden md:block sticky top-0 z-20 bg-white" style={{ borderBottom: '2px solid #f0ebe1' }}>
                <div className="max-w-6xl mx-auto px-4 lg:px-8">
                    <div className="flex items-center h-14 min-w-0">
                        {/* Logo */}
                        <div className="flex items-center gap-2 flex-shrink-0 mr-4 lg:mr-8">
                            <img src="/minilife_logo.png" className="w-7 h-7 rounded-lg" alt="Logo" />
                            <span className="font-black text-lg tracking-tight text-slate-800 hidden lg:inline">MiniLife</span>
                        </div>

                        {/* Underline Tabs — center */}
                        <nav className="flex items-center gap-0 lg:gap-1 flex-1 min-w-0">
                            {[
                                { id: 'study', icon: <Icons.BookOpen size={16} />, label: "学习任务" },
                                { id: 'habit', icon: <Icons.ShieldCheck size={16} />, label: "习惯养成" },
                                { id: 'wealth', icon: <Icons.Wallet size={16} />, label: "财富中心" },
                                { id: 'shop', icon: <Icons.ShoppingBag size={16} />, label: "家庭超市" },
                                { id: 'profile', icon: <Icons.User size={16} />, label: "我的" }
                            ].map(tab => (
                                <button key={tab.id} onClick={() => setKidTab(tab.id)}
                                    className="relative flex items-center gap-1 lg:gap-1.5 px-2 lg:px-4 h-14 font-bold text-[12px] lg:text-[13px] whitespace-nowrap transition-colors"
                                    style={{ color: kidTab === tab.id ? '#FF8C42' : '#8896AB' }}>
                                    {tab.icon} {tab.label}
                                    {/* Active underline */}
                                    {kidTab === tab.id && (
                                        <div className="absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full" style={{ background: '#FF8C42' }}></div>
                                    )}
                                </button>
                            ))}
                        </nav>

                        {/* Right side: Avatar chip + 家长 */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            {/* Avatar chip with level — opens level modal, dropdown for kid switch */}
                            <div className="relative">
                                <button onClick={() => setShowKidSwitcher(!showKidSwitcher)}
                                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all hover:bg-slate-50"
                                    style={{ border: '1px solid #eee' }}>
                                    <div className="relative flex-shrink-0">
                                        <svg className="absolute -inset-px w-[calc(100%+2px)] h-[calc(100%+2px)] -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="44" fill="none" stroke="#f0f0f0" strokeWidth="8" />
                                            <circle cx="50" cy="50" r="44" fill="none" stroke="#FF8C42" strokeWidth="8" strokeLinecap="round"
                                                strokeDasharray="276.46" strokeDashoffset={276.46 - (276.46 * Math.max(0, activeKid.exp / nextLevelExp))} />
                                        </svg>
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg overflow-hidden relative z-10 bg-amber-50"><AvatarDisplay avatar={activeKid.avatar} /></div>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-slate-700 leading-tight">{activeKid.name}</div>
                                        <div className="text-[9px] font-bold text-slate-400 leading-tight">{getSpiritForm(activeKid.level).emoji} LV.{activeKid.level} · {activeKid.exp}/{nextLevelExp}</div>
                                    </div>
                                    <Icons.ChevronDown size={12} className="text-slate-300" />
                                </button>
                                {showKidSwitcher && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowKidSwitcher(false)}></div>
                                        <div className="absolute right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 min-w-[200px] z-50 animate-fade-in">
                                            {/* Level info card */}
                                            <button onClick={() => { setShowKidSwitcher(false); setShowLevelModal(true); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl overflow-hidden bg-amber-50"><AvatarDisplay avatar={activeKid.avatar} /></div>
                                                <div>
                                                    <div className="font-black text-sm text-slate-800">{activeKid.name}</div>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <span className={`text-[9px] font-black text-white px-1.5 py-px rounded bg-gradient-to-r ${getLevelTier(activeKid.level).bg}`}>
                                                            {getLevelTier(activeKid.level).emoji} LV.{activeKid.level} {getLevelTier(activeKid.level).title}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Icons.ChevronRight size={14} className="text-slate-300 ml-auto" />
                                            </button>
                                            {/* Kid list */}
                                            {kids.length > 1 && (
                                                <div className="py-1">
                                                    <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">切换孩子</div>
                                                    {kids.map(k => (
                                                        <button key={k.id} onClick={() => switchKid(k.id)}
                                                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors text-left"
                                                            style={{ background: k.id === activeKidId ? '#FFF7ED' : 'transparent' }}>
                                                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-base overflow-hidden bg-amber-50"><AvatarDisplay avatar={k.avatar} /></div>
                                                            <span className="font-bold text-sm" style={{ color: k.id === activeKidId ? '#FF8C42' : '#475569' }}>{k.name}</span>
                                                            {k.id === activeKidId && <Icons.Check size={14} className="ml-auto" style={{ color: '#FF8C42' }} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                            <button onClick={openParentFromKid}
                                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full transition-colors hover:bg-slate-50 text-slate-500"
                                style={{ border: '1px solid #eee' }}>
                                <Icons.Lock size={12} /> 家长
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showParentPinModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-slate-800/90 w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl border border-white/10">
                        <button onClick={() => { setShowParentPinModal(false); setPinInput(''); }} className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                            <Icons.X size={20} />
                        </button>
                        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center text-slate-400 mb-4 mx-auto">
                            <Icons.Lock size={28} />
                        </div>
                        <h2 className="text-white text-xl font-black mb-6">输入家长 PIN 码</h2>
                        <div className="flex gap-3 justify-center mb-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className={`w-4 h-4 rounded-full transition-all ${i < pinInput.length ? 'bg-indigo-500 scale-110' : 'bg-slate-600'}`}></div>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                <button key={n} onClick={() => handlePinClick(n)} className="w-16 h-16 bg-slate-700 rounded-2xl text-white text-2xl font-bold hover:bg-slate-600 transition-colors flex items-center justify-center">{n}</button>
                            ))}
                            <div className="w-16 h-16"></div>
                            <button onClick={() => handlePinClick(0)} className="w-16 h-16 bg-slate-700 rounded-2xl text-white text-2xl font-bold hover:bg-slate-600 transition-colors flex items-center justify-center">0</button>
                            <button onClick={() => setPinInput(pinInput.slice(0, -1))} className="w-16 h-16 text-slate-400 flex items-center justify-center hover:text-white transition-colors rounded-2xl hover:bg-slate-700">
                                <Icons.X size={22} />
                            </button>
                        </div>
                        <button onClick={() => { setShowParentPinModal(false); setPinInput(''); }} className="mt-6 text-slate-500 hover:text-slate-300 text-sm font-bold transition-colors">取消</button>
                    </div>
                </div>
            )}







            {kidTab === 'study' && (
                <div className="px-4 md:px-8 pb-28 md:pb-8">
                    <KidStudyTab />
                </div>
            )}
            {kidTab === 'profile' && (
                <div style={{ marginTop: '-1px' }}>
                    <KidProfileTab />
                </div>
            )}
            {kidTab === 'shop' && (
                <div className="max-w-5xl mx-auto px-4 md:px-8 pb-28 md:pb-8">
                    <KidShopTab />
                </div>
            )}
            {kidTab === 'wealth' && (
                <div className="px-4 md:px-8 pb-28 md:pb-8">
                    <KidWealthTab />
                </div>
            )}
            {kidTab === 'habit' && (
                <div className="px-4 md:px-8 pb-28 md:pb-8">
                    <KidHabitTab />
                </div>
            )}
        </div>

        {/* ── Global Pet Capsule — floats over all tabs except 我的 ── */}
        {kidTab !== 'profile' && (
            <PetCapsule
                key={activeKidId}
                kidId={activeKidId}
                completedTasksToday={completedTasksToday}
            />
        )}
        </>
    );
};
