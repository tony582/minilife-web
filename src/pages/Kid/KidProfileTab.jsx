import React from 'react';
import { useDataContext } from '../../context/DataContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons } from '../../utils/Icons';
import { getLevelReq, getLevelTier } from '../../utils/levelUtils';

export const KidProfileTab = () => {
    const { kids, activeKidId } = useDataContext();
    const {
        setShowAvatarPickerModal,
        setShowLevelModal
    } = useUIContext();

    const activeKid = kids.find(k => k.id === activeKidId);
    if (!activeKid) return null;
    const nextLevelExp = getLevelReq(activeKid.level);

    return (
        <div className="space-y-6 animate-fade-in pb-10 pt-4">
            {/* --- 专属个人名片与等级进度 --- */}
            <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2"></div>

                <div className="flex flex-col items-center">
                    <button
                        onClick={() => setShowAvatarPickerModal(true)}
                        className="relative mb-4 group/avatar"
                    >
                        <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-5xl shadow-inner border-[4px] border-white group-hover/avatar:border-indigo-100 transition-colors relative z-10 overflow-hidden">
                            {activeKid.avatar?.startsWith('data:image/') ? (
                                <img src={activeKid.avatar} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                activeKid.avatar
                            )}
                        </div>
                        <div className="absolute -bottom-2 -translate-x-1/2 left-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-20 opacity-0 group-hover/avatar:opacity-100 transition-opacity shadow-md pointer-events-none whitespace-nowrap">
                            点击更换头像
                        </div>
                        {/* Animated EXP Ring */}
                        <svg className="absolute -inset-3 w-[calc(100%+1.5rem)] h-[calc(100%+1.5rem)] -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="46" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                            <circle
                                cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6"
                                strokeLinecap="round"
                                className={getLevelTier(activeKid.level).color}
                                strokeDasharray="289.02"
                                strokeDashoffset={289.02 - (289.02 * Math.max(0, activeKid.exp / nextLevelExp))}
                            />
                        </svg>
                    </button>

                    <h2 className="text-2xl font-black text-slate-800">{activeKid.name}</h2>

                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">{activeKid.exp} / {nextLevelExp} EXP</span>
                    </div>
                </div>

                <button
                    onClick={() => setShowLevelModal(true)}
                    className={`w-full mt-6 py-4 flex items-center justify-center gap-2 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 bg-gradient-to-r ${getLevelTier(activeKid.level).bg} shadow-${getLevelTier(activeKid.level).color.split('-')[1]}-500/20`}
                >
                    <span className="text-xl">{getLevelTier(activeKid.level).emoji}</span>
                    <span>我的等级特权：Lv.{activeKid.level} {getLevelTier(activeKid.level).title}</span>
                    <Icons.ChevronRight size={18} className="opacity-70" />
                </button>
            </div>

            {/* --- Apple Fitness 风格 成就勋章系统 (Placeholder) --- */}
            <div className="bg-slate-900 p-6 rounded-[2rem] relative overflow-hidden shadow-2xl isolate">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2"></div>

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-white flex items-center gap-2 drop-shadow-md">
                        <Icons.Award size={24} className="text-yellow-400" />
                        我的成就勋章
                    </h2>
                    <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-md">即将上线</span>
                </div>

                <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 -mx-2 px-2 snap-x">
                    <div className="min-w-[140px] flex flex-col items-center bg-slate-800/80 p-5 rounded-[1.5rem] border border-slate-700/50 backdrop-blur-md relative snap-center group">
                        <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-br from-yellow-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD700] via-[#FDB931] to-[#9F7928] shadow-[0_0_20px_rgba(255,215,0,0.3),inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.6)] flex items-center justify-center mb-4 relative z-10 box-border border-2 border-yellow-200/30">
                            <Icons.Star size={36} className="text-amber-900 opacity-80" strokeWidth={2.5} />
                        </div>
                        <p className="text-sm font-black text-white tracking-wider mb-1">初次闪耀</p>
                        <p className="text-[10px] text-slate-400 font-bold text-center">完成首次习惯打卡</p>
                    </div>

                    <div className="min-w-[140px] flex flex-col items-center bg-slate-800/40 p-5 rounded-[1.5rem] border border-slate-700/30 backdrop-blur-md relative snap-center opacity-60">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),inset_0_4px_8px_rgba(255,255,255,0.1)] flex items-center justify-center mb-4 relative z-10 box-border border-2 border-slate-600">
                            <Icons.Zap size={36} className="text-slate-900 opacity-50" strokeWidth={2.5} />
                        </div>
                        <p className="text-sm font-black text-slate-300 tracking-wider mb-1">毅力之火</p>
                        <p className="text-[10px] text-slate-500 font-bold text-center">连续打卡 7 天</p>
                        <div className="absolute top-3 right-3 text-slate-600"><Icons.Lock size={14} /></div>
                    </div>

                    <div className="min-w-[140px] flex flex-col items-center bg-slate-800/40 p-5 rounded-[1.5rem] border border-slate-700/30 backdrop-blur-md relative snap-center opacity-60">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),inset_0_4px_8px_rgba(255,255,255,0.1)] flex items-center justify-center mb-4 relative z-10 box-border border-2 border-slate-600">
                            <Icons.PiggyBank size={36} className="text-slate-900 opacity-50" strokeWidth={2.5} />
                        </div>
                        <p className="text-sm font-black text-slate-300 tracking-wider mb-1">理财大师</p>
                        <p className="text-[10px] text-slate-500 font-bold text-center">累计获得 1000 币</p>
                        <div className="absolute top-3 right-3 text-slate-600"><Icons.Lock size={14} /></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
