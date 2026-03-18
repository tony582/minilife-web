import React, { useState } from 'react';
import { useDataContext } from '../../context/DataContext.jsx';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { useTaskManager } from '../../hooks/useTaskManager';
import { getWeeklyCompletionCount } from '../../hooks/useTasks';
import { Icons, renderIcon } from '../../utils/Icons';

export const KidHabitTab = () => {
    const authC = useAuthContext();
    const dataC = useDataContext();
    const uiC = useUIContext();

    const { transactions, tasks, activeKidId } = dataC;
    const { selectedDate, historyFilter, setHistoryFilter } = uiC;
    const { handleAttemptSubmit } = useTaskManager(authC, dataC, uiC);

    const [searchKidHabitKeyword, setSearchKidHabitKeyword] = useState('');
    const [habitCardFilter, setHabitCardFilter] = useState('all');

    const todayTransactions = transactions.filter(t => t.kidId === activeKidId && t.category === 'habit' && new Date(t.date).toDateString() === new Date().toDateString());
    const todayEarned = todayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const todayDeducted = todayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* --- Glassmorphic Hero Dashboard Area --- */}
            <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-emerald-500/20 text-white relative overflow-hidden group min-h-[160px] flex items-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700 pointer-events-none"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>
                <Icons.ShieldCheck size={140} className="absolute -right-6 -bottom-8 opacity-[0.08] rotate-12 group-hover:rotate-0 transition-transform duration-500 pointer-events-none" />

                <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 bg-white/20 w-fit px-3.5 py-1.5 rounded-full text-sm font-black backdrop-blur-md border border-white/20 mb-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-emerald-50">
                            <Icons.Star size={16} className="text-yellow-300 fill-yellow-300" /> 习惯决定未来
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black drop-shadow-md flex items-center gap-2">
                            习惯养成基地
                        </h2>
                    </div>

                    {/* Daily Summary Stats */}
                    <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/20 shadow-inner w-full md:w-auto mt-2 md:mt-0">
                        <div className="text-center flex-1 md:flex-initial">
                            <div className="text-[12px] font-black text-emerald-100 mb-1 tracking-widest">今日奖励</div>
                            <div className="text-3xl font-black text-white drop-shadow-sm leading-none">+{todayEarned}</div>
                        </div>
                        <div className="w-px h-10 bg-white/20 rounded-full"></div>
                        <div className="text-center flex-1 md:flex-initial">
                            <div className="text-[12px] font-black text-emerald-100 mb-1 tracking-widest">今日扣除</div>
                            <div className="text-3xl font-black text-yellow-300 drop-shadow-sm leading-none">-{todayDeducted}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Chunky Habit Cards Grid --- */}
            <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 px-2">
                    <h3 className="font-black text-slate-800 text-lg flex items-center gap-2 mb-2 md:mb-0">
                        <span className="w-1.5 h-5 bg-emerald-500 rounded-full"></span>
                        今日习惯打卡
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Icons.Search size={14} />
                            </div>
                            <input
                                type="text"
                                placeholder="搜索习惯名称..."
                                value={searchKidHabitKeyword}
                                onChange={(e) => setSearchKidHabitKeyword(e.target.value)}
                                className="w-full bg-white border border-slate-200 text-sm font-bold rounded-2xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                            />
                            {searchKidHabitKeyword && (
                                <button onClick={() => setSearchKidHabitKeyword('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                                    <Icons.X size={14} />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto hide-scrollbar">
                            {[
                                { id: 'all', label: '全部' },
                                { id: 'income', label: '好习惯' },
                                { id: 'expense', label: '坏习惯' },
                                { id: 'completed', label: '已打卡' },
                                { id: 'pending', label: '未打卡' }
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => setHabitCardFilter(filter.id)}
                                    className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${habitCardFilter === filter.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {tasks.filter(t => t.type === 'habit' && (!searchKidHabitKeyword || t.title.toLowerCase().includes(searchKidHabitKeyword.toLowerCase()))).filter(t => {
                    const entry = t.kidId === 'all' ? t.history?.[selectedDate]?.[activeKidId] : t.history?.[selectedDate];
                    const count = Array.isArray(entry) ? entry.length : (entry?.count || (entry?.status === 'completed' ? 1 : 0));
                    let currentLimitCount = count;
                    if (t.habitType === 'multiple' && t.periodMaxType === 'weekly') currentLimitCount = getWeeklyCompletionCount(t, activeKidId, selectedDate);
                    const maxPerDay = t.periodMaxPerDay || t.maxPerDay || 1;
                    const isDone = (t.habitType === 'daily_once' && count >= 1) || (t.habitType === 'multiple' && currentLimitCount >= maxPerDay);
                    if (habitCardFilter === 'income') return t.reward >= 0;
                    if (habitCardFilter === 'expense') return t.reward < 0;
                    if (habitCardFilter === 'completed') return isDone;
                    if (habitCardFilter === 'pending') return !isDone;
                    return true;
                }).length === 0 ? (
                    <div className="text-center bg-white rounded-3xl py-12 px-6 border border-slate-100 shadow-sm mt-4 w-full">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-3 mx-auto grayscale opacity-60"><Icons.ShieldCheck size={32} className="text-slate-400" /></div>
                        <div className="text-slate-400 font-bold mb-1">没有找到该习惯哦</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        {tasks.filter(t => t.type === 'habit' && (!searchKidHabitKeyword || t.title.toLowerCase().includes(searchKidHabitKeyword.toLowerCase()))).filter(t => {
                        const entry = t.kidId === 'all' ? t.history?.[selectedDate]?.[activeKidId] : t.history?.[selectedDate];
                        const count = Array.isArray(entry) ? entry.length : (entry?.count || (entry?.status === 'completed' ? 1 : 0));
                        let currentLimitCount = count;
                        if (t.habitType === 'multiple' && t.periodMaxType === 'weekly') currentLimitCount = getWeeklyCompletionCount(t, activeKidId, selectedDate);
                        const maxPerDay = t.periodMaxPerDay || t.maxPerDay || 1;
                        const isDone = (t.habitType === 'daily_once' && count >= 1) || (t.habitType === 'multiple' && currentLimitCount >= maxPerDay);
                        if (habitCardFilter === 'income') return t.reward >= 0;
                        if (habitCardFilter === 'expense') return t.reward < 0;
                        if (habitCardFilter === 'completed') return isDone;
                        if (habitCardFilter === 'pending') return !isDone;
                        return true;
                    }).map(t => {
                        const isNegative = t.reward < 0;
                        const entry = t.kidId === 'all' ? t.history?.[selectedDate]?.[activeKidId] : t.history?.[selectedDate];
                        const count = Array.isArray(entry) ? entry.length : (entry?.count || (entry?.status === 'completed' ? 1 : 0));
                        let currentLimitCount = count;
                        if (t.habitType === 'multiple' && t.periodMaxType === 'weekly') currentLimitCount = getWeeklyCompletionCount(t, activeKidId, selectedDate);
                        const maxPerDay = t.periodMaxPerDay || t.maxPerDay || 1;
                        const isDailyOnce = t.habitType === 'daily_once';
                        const isMaxedOut = t.habitType === 'multiple' && currentLimitCount >= maxPerDay;
                        const isDone = (isDailyOnce && count >= 1) || isMaxedOut;

                        return (
                            <div key={t.id} className="bg-white p-5 rounded-[2rem] border border-slate-100/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all flex flex-col justify-between group">
                                <div className="flex items-start justify-between gap-3 mb-5">
                                    <div className="flex items-start gap-4 flex-1">
                                        {/* Squircle Icon Container */}
                                        <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-300 ${isNegative ? 'bg-red-50 text-red-500' : `bg-gradient-to-br ${t.habitColor || 'from-emerald-400 to-teal-500'} text-white`}`}>
                                            {t.iconEmoji || renderIcon(t.iconName, 26)}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <h3 className="font-black text-slate-800 text-lg leading-tight mb-1.5 line-clamp-1">{t.title}</h3>
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide border ${isNegative ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                {isNegative ? `扣 ${Math.abs(t.reward)} 家庭币` : `+${t.reward} 家庭币`}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visual Streak / Counters / Progress Bars */}
                                    {(() => {
                                        const displayMax = isDailyOnce ? 1 : (t.periodMaxPerDay || 3);
                                        const displayCount = isDailyOnce ? (count >= 1 ? 1 : 0) : currentLimitCount;
                                        const useProgressBar = displayMax > 7 || (t.habitType === 'multiple' && t.periodMaxType === 'weekly');

                                        if (useProgressBar) {
                                            const labelPrefix = t.periodMaxType === 'weekly' ? '本周' : '今日';
                                            return (
                                                <div className="flex flex-col items-end gap-1.5 mt-1 shrink-0 w-24">
                                                    <span className="text-[10px] font-black text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{labelPrefix} {displayCount}/{displayMax}</span>
                                                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                                                        <div className={`h-full rounded-full transition-all duration-500 ease-out ${isNegative ? 'bg-gradient-to-r from-red-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`} style={{ width: `${Math.min(100, (displayCount / displayMax) * 100)}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="flex gap-1 shrink-0 bg-slate-50 p-1.5 rounded-full border border-slate-100/50 flex-wrap mt-1 justify-end max-w-[80px]">
                                                    {Array.from({ length: displayMax }).map((_, i) => (
                                                        <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < displayCount ? (isNegative ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]') : 'bg-slate-200 shadow-inner'}`} />
                                                    ))}
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>

                                {/* Action Button Area */}
                                <div className="mt-auto border-t border-slate-50 pt-4">
                                    {isDone ? (
                                        isNegative ? (
                                            <div className="w-full bg-red-50/50 border border-red-100/50 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-black text-red-500 shadow-inner">
                                                <Icons.ShieldAlert size={18} />
                                                已达记录上限 {count > 1 ? `(${count}次)` : ''}
                                            </div>
                                        ) : (
                                            <div className="w-full bg-emerald-50/50 border border-emerald-100/50 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-black text-emerald-600 shadow-inner">
                                                <Icons.CheckCircle size={18} />
                                                今日已达标 {count > 1 ? `(${count}次)` : ''}
                                            </div>
                                        )
                                    ) : isNegative ? (
                                        <button type="button" onClick={() => handleAttemptSubmit(t)} className="relative overflow-hidden w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-black shadow-[0_8px_20px_rgba(245,158,11,0.3)] active:scale-[0.98] transition-all group/btn">
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                                            <Icons.ShieldAlert size={16} className="relative z-10" />
                                            <span className="relative z-10">我要坦白 (主动承认扣分)</span>
                                        </button>
                                    ) : (
                                        <button type="button" onClick={() => handleAttemptSubmit(t)} className="relative overflow-hidden w-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-black shadow-[0_8px_20px_rgba(52,211,153,0.3)] active:scale-[0.98] transition-all group/btn">
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                                            <Icons.Zap size={16} className="relative z-10" />
                                            <span className="relative z-10">我要去打卡</span>
                                            {count > 0 && <span className="relative z-10 bg-white/20 px-2 py-0.5 rounded-md text-[10px] ml-1 font-bold">已打卡 {count} 次</span>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    </div>
                )}
            </div>

            {/* --- Habit Activity Log (Redesigned Timeline) --- */}
            <div className="bg-white rounded-[2rem] border border-slate-100/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden relative">
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-400"></div>

                <div className="p-5 sm:p-6 border-b border-slate-50 bg-white flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner"><Icons.TrendingUp size={18} strokeWidth={2.5} /></div>
                            近期足迹明细
                        </h3>
                    </div>
                    {/* Filter Chips */}
                    <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 p-1 rounded-2xl">
                        <button onClick={() => setHistoryFilter('all')} className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${historyFilter === 'all' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>全部</button>
                        <button onClick={() => setHistoryFilter('income')} className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${historyFilter === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>获得</button>
                        <button onClick={() => setHistoryFilter('expense')} className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${historyFilter === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>扣分</button>
                    </div>
                </div>

                <div className="p-4 sm:p-6 relative">
                    {transactions.filter(t => t.kidId === activeKidId && t.category === 'habit' && (historyFilter === 'all' || t.type === historyFilter)).length === 0 ? (
                        <div className="text-center text-slate-400 text-sm py-10 font-bold bg-slate-50 rounded-[1.5rem]">
                            {historyFilter === 'all' ? '暂无足迹记录，快去完成第一个习惯吧！' : '没有相关类型的足迹记录。'}
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[22rem] overflow-y-auto custom-scrollbar pr-2 relative">
                            <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-slate-100 rounded-full z-0"></div>

                            {transactions.filter(t => t.kidId === activeKidId && t.category === 'habit' && (historyFilter === 'all' || t.type === historyFilter)).slice(0, 30).map(item => {
                                const isIncome = item.type === 'income';
                                const displayAmount = isIncome ? `+${item.amount}` : `-${item.amount}`;
                                // Clean up legacy titles: Remove (Exp) and prefix "记录成长: "
                                const cleanTitle = item.title.replace(/\(Exp\)/i, '').replace(/^(记录成长[:：\s]*)+/u, '').trim();

                                return (
                                    <div key={item.id} className="relative pl-12 group z-10 mb-4 last:mb-0">
                                        {/* Timeline Dot */}
                                        <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full border-2 border-white shadow-sm flex items-center justify-center ${isIncome ? 'bg-emerald-400' : 'bg-red-400'} z-20`}></div>

                                        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${isIncome ? 'bg-gradient-to-r from-emerald-50/50 to-emerald-50/10 border-emerald-100 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-100'
                                                : 'bg-gradient-to-r from-red-50/50 to-red-50/10 border-red-100 hover:border-red-200 hover:shadow-md hover:shadow-red-100'
                                            }`}>
                                            <div className="flex-1 min-w-0 pr-4">
                                                <div className="font-black text-slate-700 text-sm line-clamp-2">{cleanTitle}</div>
                                                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-1.5">
                                                    <Icons.Clock size={10} />
                                                    {new Date(item.date).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>

                                            <div className={`shrink-0 font-black text-base sm:text-lg tracking-tight bg-white px-3 py-1.5 rounded-xl shadow-sm border whitespace-nowrap flex items-baseline gap-0.5 ${isIncome ? 'text-emerald-500 border-emerald-100/50' : 'text-red-500 border-red-100/50'
                                                }`}>
                                                {displayAmount} <span className="text-[10px] font-bold text-slate-400">家庭币</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
