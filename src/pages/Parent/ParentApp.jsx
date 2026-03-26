import React from 'react';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons } from '../../utils/Icons';
import { ParentTasksTab } from './ParentTasksTab';
import { ParentPlansTab } from './ParentPlansTab';
import { ParentWealthTab } from './ParentWealthTab';
import { ParentShopTab } from './ParentShopTab';
import { ParentMoreAppsTab } from './ParentMoreAppsTab';

const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1',
    orange: '#FF8C42', textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
};

const tabs = [
    { id: 'tasks', label: '学习任务', icon: Icons.BookOpen },
    { id: 'plans', label: '习惯养成', icon: Icons.Target },
    { id: 'wealth', label: '财富中心', icon: Icons.Wallet },
    { id: 'shop_manage', label: '家庭超市', icon: Icons.ShoppingBag },
    { id: 'more', label: '更多应用', icon: Icons.LayoutGrid },
];

export const ParentApp = () => {
    const {
        changeAppState,
        parentTab,
        setParentTab
    } = useUIContext();

    return (
        <div className="min-h-screen font-sans pb-24 text-left animate-fade-in overflow-x-hidden" style={{ background: C.bg }}>
            {/* ═══ Unified PC Header ═══ */}
            <div className="sticky top-0 z-[110] hidden md:block" style={{ background: C.bgCard, borderBottom: `1px solid ${C.bgLight}` }}>
                <div className="max-w-5xl mx-auto flex items-center h-14 px-4 lg:px-8 min-w-0">
                    {/* Left: Logo */}
                    <div className="flex items-center gap-2 shrink-0 mr-4 lg:mr-8">
                        <img src="/minilife_logo.png" className="w-8 h-8 rounded-lg" alt="Logo" />
                        <span className="font-black text-base tracking-tight hidden lg:inline" style={{ color: C.textPrimary }}>MiniLife</span>
                    </div>

                    {/* Center: Tabs */}
                    <nav className="flex-1 flex items-center justify-center gap-0 lg:gap-1 min-w-0">
                        {tabs.map(t => {
                            const active = parentTab === t.id;
                            const TabIcon = t.icon;
                            return (
                                <button key={t.id} onClick={() => setParentTab(t.id)}
                                    className="relative flex items-center gap-1 lg:gap-1.5 px-2 lg:px-3 py-3.5 text-[12px] lg:text-sm font-bold transition-colors whitespace-nowrap"
                                    style={{ color: active ? C.orange : C.textMuted }}
                                >
                                    <TabIcon size={15} />
                                    {t.label}
                                    {active && (
                                        <div className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full" style={{ background: C.orange }}></div>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Right: Switch role */}
                    <button onClick={() => changeAppState('profiles')}
                        className="shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all active:scale-95"
                        style={{ background: C.bgLight, color: C.textSoft }}>
                        <Icons.ArrowLeft size={14} />
                        切换角色
                    </button>
                </div>
            </div>

            {/* ═══ Mobile Header ═══ */}
            <div className="md:hidden sticky top-0 z-[110]" style={{ background: C.bgCard, borderBottom: `1px solid ${C.bgLight}` }}>
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        <img src="/minilife_logo.png" className="w-7 h-7 rounded-lg" alt="Logo" />
                        <span className="font-black text-base" style={{ color: C.textPrimary }}>MiniLife</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: C.orange + '18', color: C.orange }}>家长端</span>
                    </div>
                    <button onClick={() => changeAppState('profiles')}
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all"
                        style={{ background: C.bgLight, color: C.textSoft }}>
                        切换
                        <Icons.ArrowRight size={14} />
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 pb-4 md:px-8 md:pb-8">
                {parentTab === 'tasks' && <ParentTasksTab />}
                {parentTab === 'plans' && <ParentPlansTab />}
                {parentTab === 'wealth' && <ParentWealthTab />}
                {parentTab === 'shop_manage' && <ParentShopTab />}
                {parentTab === 'more' && <ParentMoreAppsTab />}
            </div>
        </div>
    );
};
