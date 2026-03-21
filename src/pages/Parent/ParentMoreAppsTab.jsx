import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons } from '../../utils/Icons';
import { AppGrid } from '../../components/common/AppGrid';

// --- 子应用注册 ---
import { ParentDashboardApp } from './apps/ParentDashboardApp';
import { KidSettingsApp } from './apps/KidSettingsApp';
import { SubscriptionApp } from './apps/SubscriptionApp';
import { SecurityApp } from './apps/SecurityApp';
import { InterestClassApp } from './apps/InterestClassApp';
import { TaskPrintApp } from './apps/TaskPrintApp';

export const ParentMoreAppsTab = () => {
    const { handleLogout } = useAuthContext();
    const { parentSettings } = useUIContext();

    const [currentApp, setCurrentApp] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // --- 子应用路由表 ---
    const appComponents = {
        dashboard: <ParentDashboardApp />,
        kid_settings: <KidSettingsApp />,
        subscription: <SubscriptionApp />,
        security: <SecurityApp />,
        interest_classes: <InterestClassApp />,
        task_print: <TaskPrintApp />,
    };

    // --- 应用注册表 ---
    const apps = [
        {
            id: 'dashboard',
            icon: <Icons.User size={22} />,
            label: '我的宝贝',
            desc: '数据概览与成长轨迹',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            onClick: () => setCurrentApp('dashboard'),
        },
        {
            id: 'kid_settings',
            icon: <Icons.Users size={22} />,
            label: '孩子资料与管教',
            desc: '管理孩子名单、设定权限',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            onClick: () => setCurrentApp('kid_settings'),
        },
        {
            id: 'subscription',
            icon: <Icons.Gem size={22} />,
            label: '订阅与激活',
            desc: '解锁完整功能、激活码',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            onClick: () => setCurrentApp('subscription'),
        },
        {
            id: 'security',
            icon: parentSettings.pinEnabled ? <Icons.Lock size={22} /> : <Icons.Unlock size={22} />,
            label: '后台安全锁',
            desc: '保护后台不被误触',
            color: parentSettings.pinEnabled ? 'text-emerald-600' : 'text-slate-500',
            bgColor: parentSettings.pinEnabled ? 'bg-emerald-50' : 'bg-slate-100',
            onClick: () => setCurrentApp('security'),
            badge: parentSettings.pinEnabled ? '已开启' : null,
        },
        {
            id: 'interest_classes',
            icon: <Icons.GraduationCap size={22} />,
            label: '兴趣班管理',
            desc: '课外班课时追踪',
            color: 'text-pink-600',
            bgColor: 'bg-pink-50',
            onClick: () => setCurrentApp('interest_classes'),
        },
        {
            id: 'task_print',
            icon: <Icons.Printer size={22} />,
            label: '任务打印',
            desc: '打印每日任务清单',
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            onClick: () => setCurrentApp('task_print'),
        },
        {
            id: 'logout',
            icon: <Icons.LogOut size={22} />,
            label: '退出登录',
            color: 'text-rose-500',
            bgColor: 'bg-rose-50',
            onClick: () => setShowLogoutConfirm(true),
        },
    ];

    // --- 子视图模式 ---
    if (currentApp && appComponents[currentApp]) {
        return (
            <div className="animate-fade-in">
                <button
                    onClick={() => setCurrentApp(null)}
                    className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm mb-6 transition-colors"
                >
                    <Icons.ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    返回更多应用
                </button>
                {appComponents[currentApp]}
            </div>
        );
    }

    // --- 默认：AppGrid ---
    return (
        <div className="animate-fade-in space-y-2">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                    <Icons.LayoutGrid size={20} />
                </div>
                更多应用
            </h2>
            <p className="text-sm text-slate-400 font-medium mb-6">管理家庭、查看数据、探索更多功能</p>
            <AppGrid apps={apps} />

            {/* 退出登录确认弹窗 */}
            {showLogoutConfirm && createPortal(
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-xs md:max-w-sm overflow-hidden shadow-2xl scale-100 animate-pop-in border border-white/20">
                        <div className="p-8 text-center bg-gradient-to-b from-rose-50/50 to-white">
                            <div className="w-20 h-20 bg-white shadow-xl shadow-rose-100 text-rose-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-5 border border-rose-50">
                                <Icons.LogOut size={36} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">退出登录</h3>
                            <p className="text-sm font-bold text-slate-500 mt-2">
                                确定要退出当前账号吗？<br/>
                                <span className="text-slate-400">退出后需重新登录才能使用</span>
                            </p>
                        </div>
                        <div className="flex border-t border-slate-100 bg-slate-50/50">
                            <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">取消</button>
                            <div className="w-px bg-slate-200 my-4"></div>
                            <button onClick={() => { setShowLogoutConfirm(false); handleLogout(); }} className="flex-1 py-4 font-black text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors">确认退出</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
