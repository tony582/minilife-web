import React, { useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Icons } from '../../utils/Icons';
import { ParentTasksTab } from './ParentTasksTab';
import { ParentPlansTab } from './ParentPlansTab';
import { ParentWealthTab } from './ParentWealthTab';
import { ParentShopTab } from './ParentShopTab';
import { ParentSettingsTab } from './ParentSettingsTab';

export const ParentApp = () => {
    const {
        changeAppState,
        parentSettings,
        showParentSettingsDropdown,
        setShowParentSettingsDropdown,
        setShowSettingsModal,
        setShowSubscriptionModal,
        setShowSecurityParamsModal,
        handleLogout,
        parentTab,
        setParentTab
    } = useAppContext();

    const parentSettingsRef = useRef(null);

    return (
        <div className="min-h-screen bg-[#f4f7f9] font-sans pb-24 text-left animate-fade-in">
            <div className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center sticky top-0 z-[110]">
                <div className="flex items-center gap-2 md:gap-3">
                    <button onClick={() => changeAppState('profiles')} className="group flex items-center gap-1.5 md:gap-2 text-slate-300 hover:text-white transition-colors bg-slate-800/80 hover:bg-slate-700/80 rounded-full px-3 py-1.5 md:px-4 md:py-2 border border-slate-700/50 hover:border-slate-600/50 shadow-sm backdrop-blur-sm">
                        <Icons.ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        <span className="font-bold text-xs md:text-sm">切换角色</span>
                    </button>
                    <div className="hidden sm:flex items-center gap-2.5 ml-1 pl-3 md:pl-4 border-l border-slate-800/80">
                        <img src="/minilife_logo.png" className="w-8 h-8 md:w-10 md:h-10 rounded-xl shadow-sm" alt="Logo" /> <span className="font-black text-lg md:text-xl text-white tracking-tight">MiniLife 家庭版</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4 relative" ref={parentSettingsRef}>
                    <button onClick={() => setShowParentSettingsDropdown(!showParentSettingsDropdown)} className={`relative flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full transition-all duration-300 group shadow-sm ${showParentSettingsDropdown ? 'bg-indigo-500 text-white shadow-indigo-500/30' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/50 hover:border-slate-600/50'}`}>
                        <Icons.Settings size={20} className={`transition-transform duration-500 ${showParentSettingsDropdown ? 'rotate-90' : 'group-hover:rotate-45'}`} />
                        {parentSettings.pinEnabled && <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>}
                    </button>

                    {showParentSettingsDropdown && (
                        <div className="absolute top-full right-0 mt-3 w-64 md:w-72 bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-2 z-[110] animate-fade-in origin-top-right overflow-hidden before:content-[''] before:absolute before:-top-2 before:right-6 before:w-4 before:h-4 before:bg-white before:rotate-45 before:border-l before:border-t before:border-slate-100">

                            <div className="sm:hidden px-4 py-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl mb-2 flex items-center gap-3 border border-purple-100/50">
                                <img src="/minilife_logo.png" className="w-9 h-9 rounded-xl shadow-sm border border-white" alt="Logo" /> <span className="font-black text-[15px] text-indigo-900 tracking-tight">MiniLife 家庭版</span>
                            </div>

                            <div className="flex flex-col gap-1 p-1">
                                <button onClick={() => { setShowParentSettingsDropdown(false); setShowSettingsModal(true); }} className="flex items-center gap-3 px-3 py-3 rounded-2xl text-left hover:bg-slate-50 transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-100 transition-all shrink-0"><Icons.Users size={18} /></div>
                                    <div>
                                        <div className="font-bold text-[15px] text-slate-800 group-hover:text-blue-600 transition-colors">孩子资料与基础管教</div>
                                        <div className="text-[11px] font-medium text-slate-400 mt-0.5">管理孩子名单、设定权限</div>
                                    </div>
                                    <Icons.ChevronRight size={14} className="ml-auto text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                                </button>

                                <button onClick={() => { setShowParentSettingsDropdown(false); setShowSubscriptionModal(true); }} className="flex items-center gap-3 px-3 py-3 rounded-2xl text-left hover:bg-slate-50 transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-100 transition-all shrink-0"><Icons.Gem size={18} /></div>
                                    <div>
                                        <div className="font-bold text-[15px] text-slate-800 group-hover:text-purple-600 transition-colors">MiniLife 体验计划与订阅</div>
                                        <div className="text-[11px] font-medium text-slate-400 mt-0.5">解锁完整功能、激活码兑换</div>
                                    </div>
                                    <Icons.ChevronRight size={14} className="ml-auto text-slate-300 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
                                </button>

                                <div className="h-px bg-slate-100 my-1 mx-2"></div>

                                <button onClick={() => { setShowParentSettingsDropdown(false); setShowSecurityParamsModal(true); }} className="flex items-center gap-3 px-3 py-3 rounded-2xl text-left hover:bg-slate-50 transition-colors group">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-all shrink-0 ${parentSettings.pinEnabled ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                                        {parentSettings.pinEnabled ? <Icons.Lock size={18} /> : <Icons.Unlock size={18} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-[15px] text-slate-800 flex items-center gap-2">
                                            后台安全锁
                                            {parentSettings.pinEnabled ? <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] uppercase tracking-wider font-black rounded text-center">已开启</span> : <span className="px-1.5 py-0.5 bg-slate-200 text-slate-500 text-[9px] uppercase tracking-wider font-black rounded text-center">未开启</span>}
                                        </div>
                                        <div className="text-[11px] font-medium text-slate-400 mt-0.5">保护后台不被孩子误触</div>
                                    </div>
                                </button>
                            </div>

                            <div className="p-2 border-t border-slate-100 mt-1 bg-slate-50/50 rounded-b-[22px]">
                                <button onClick={() => { setShowParentSettingsDropdown(false); handleLogout(); }} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-rose-500 font-bold hover:bg-rose-50 hover:text-rose-600 transition-colors">
                                    <Icons.LogOut size={16} /> 退回登录页
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-4 md:p-8">
                <div className="hidden md:flex gap-4 border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
                    <button onClick={() => setParentTab('tasks')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'tasks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>学习任务</button>
                    <button onClick={() => setParentTab('plans')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'plans' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>习惯养成</button>
                    <button onClick={() => setParentTab('wealth')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'wealth' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>财富中心</button>
                    <button onClick={() => setParentTab('shop_manage')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'shop_manage' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>家庭超市</button>
                    <button onClick={() => setParentTab('settings')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'settings' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>我的</button>
                </div>

                {parentTab === 'tasks' && <ParentTasksTab />}
                {parentTab === 'plans' && <ParentPlansTab />}
                {parentTab === 'wealth' && <ParentWealthTab />}
                {parentTab === 'shop_manage' && <ParentShopTab />}
                {parentTab === 'settings' && <ParentSettingsTab />}
            </div>
        </div>
    );
};
