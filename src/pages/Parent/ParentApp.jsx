import React from 'react';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons } from '../../utils/Icons';
import { ParentTasksTab } from './ParentTasksTab';
import { ParentPlansTab } from './ParentPlansTab';
import { ParentWealthTab } from './ParentWealthTab';
import { ParentShopTab } from './ParentShopTab';
import { ParentMoreAppsTab } from './ParentMoreAppsTab';

export const ParentApp = () => {
    const {
        changeAppState,
        parentTab,
        setParentTab
    } = useUIContext();

    return (
        <div className="min-h-screen bg-[#f4f7f9] font-sans pb-24 text-left animate-fade-in">
            <div className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center sticky top-0 z-[110]">
                <div className="flex items-center gap-2 md:gap-3">
                    <button onClick={() => changeAppState('profiles')} className="group flex items-center gap-1.5 md:gap-2 text-slate-300 hover:text-white transition-colors bg-slate-800/80 hover:bg-slate-700/80 rounded-full px-3 py-1.5 md:px-4 md:py-2 border border-slate-700/50 hover:border-slate-600/50 shadow-sm backdrop-blur-sm">
                        <Icons.ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        <span className="font-bold text-xs md:text-sm">切换角色</span>
                    </button>
                    <div className="flex items-center gap-2.5 ml-1 pl-3 md:pl-4 border-l border-slate-800/80">
                        <img src="/minilife_logo.png" className="w-8 h-8 md:w-10 md:h-10 rounded-xl shadow-sm" alt="Logo" /> <span className="font-black text-lg md:text-xl text-white tracking-tight">MiniLife 家庭版</span>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-4 md:p-8">
                <div className="hidden md:flex gap-4 border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
                    <button onClick={() => setParentTab('tasks')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'tasks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>学习任务</button>
                    <button onClick={() => setParentTab('plans')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'plans' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>习惯养成</button>
                    <button onClick={() => setParentTab('wealth')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'wealth' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>财富中心</button>
                    <button onClick={() => setParentTab('shop_manage')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'shop_manage' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>家庭超市</button>
                    <button onClick={() => setParentTab('more')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'more' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>更多应用</button>
                </div>

                {parentTab === 'tasks' && <ParentTasksTab />}
                {parentTab === 'plans' && <ParentPlansTab />}
                {parentTab === 'wealth' && <ParentWealthTab />}
                {parentTab === 'shop_manage' && <ParentShopTab />}
                {parentTab === 'more' && <ParentMoreAppsTab />}
            </div>
        </div>
    );
};
