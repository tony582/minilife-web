import React, { useState } from 'react';
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

/**
 * ParentMoreAppsTab - 应用启动器 (Launcher)
 * 
 * 默认显示 AppGrid，点击应用后切换到对应子视图。
 * 新增应用只需：
 *   1) 在 apps/ 下创建组件
 *   2) 在 appComponents 注册
 *   3) 在 apps 数组加一项
 */
export const ParentMoreAppsTab = () => {
    const { handleLogout } = useAuthContext();
    const { parentSettings } = useUIContext();

    // 当前打开的子应用，null = 显示应用列表
    const [currentApp, setCurrentApp] = useState(null);

    // --- 子应用路由表 ---
    const appComponents = {
        dashboard: <ParentDashboardApp />,
        kid_settings: <KidSettingsApp />,
        subscription: <SubscriptionApp />,
        security: <SecurityApp />,
        interest_classes: <InterestClassApp />,
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
            id: 'logout',
            icon: <Icons.LogOut size={22} />,
            label: '退出登录',
            color: 'text-rose-500',
            bgColor: 'bg-rose-50',
            onClick: handleLogout,
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
        </div>
    );
};
