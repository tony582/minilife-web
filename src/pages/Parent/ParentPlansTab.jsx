import React, { useState } from 'react';
import { useDataContext } from '../../context/DataContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons } from '../../utils/Icons';
import { getCategoryGradient, getIconForCategory } from '../../utils/categoryUtils';
import { formatDate } from '../../utils/dateUtils';

// You might need to import or define this if it is meant to be local, but it seems to be defined in App.jsx or context?
// Ah wait, getDefaultTimeRange was defined inside App.jsx, I copied it to ParentTasksTab last time.
// It's better to just redefine it here or if I already put it in a util?
// Actually, earlier I redefined it in ParentTasksTab.jsx. Let's redefine it here or import it if I put it in a util... wait I didn't put it in a util. I'll define it here.
const getDefaultTimeRange = () => {
    try {
        const savedEndTimeStr = localStorage.getItem('lastTaskEndTime');
        if (!savedEndTimeStr) return { start: '16:00', end: '16:30' };

        const [hoursStr, minutesStr] = savedEndTimeStr.split(':');
        let hours = parseInt(hoursStr, 10);
        let minutes = parseInt(minutesStr, 10);

        const startHours = String(hours).padStart(2, '0');
        const startMinutes = String(minutes).padStart(2, '0');

        minutes += 30;
        if (minutes >= 60) {
            minutes -= 60;
            hours += 1;
            if (hours >= 24) hours = 0;
        }

        const endHours = String(hours).padStart(2, '0');
        const endMinutes = String(minutes).padStart(2, '0');

        return {
            start: `${startHours}:${startMinutes}`,
            end: `${endHours}:${endMinutes}`
        };
    } catch (e) {
        return { start: '16:00', end: '16:30' };
    }
};

export const ParentPlansTab = () => {
    const { kids, tasks, transactions } = useDataContext();
    const {
        pointActionTimings, setPointActionTimings,
        setShowEmotionalReminderModal, setEmotionalCooldownSeconds,
        setPenaltyTaskContext, setPenaltySelectedKidIds,
        setShowRewardModal, setShowPenaltyModal,
        setEditingTask, setPlanType, setPlanForm, setShowAddPlanModal,
        setDeleteConfirmTask
    } = useUIContext();

    const [searchPlanKeyword, setSearchPlanKeyword] = useState('');
    const [habitCardFilter, setHabitCardFilter] = useState('all');

    const handlePointAction = (t, actionType) => {
        const now = Date.now();
        const TIME_WINDOW = 30000; // 30 seconds
        const amount = Math.abs(t.reward || 0);

        // Filter timestamps within the window
        const recentActions = pointActionTimings.filter(action => typeof action === 'object' && now - action.time < TIME_WINDOW);

        const recentPenalties = recentActions.filter(a => a.type === 'penalty');
        const totalPenaltyAmount = recentPenalties.reduce((sum, a) => sum + a.amount, 0);

        const isHighPenalty = actionType === 'penalty' && (totalPenaltyAmount + amount >= 40);
        const isTooFrequentPenalties = actionType === 'penalty' && recentPenalties.length >= 3;
        const isTooFrequentOverall = recentActions.length >= 5;

        if (isHighPenalty || isTooFrequentPenalties || isTooFrequentOverall) {
            setShowEmotionalReminderModal({
                type: actionType === 'penalty' ? 'anger' : 'frequent',
                amount: totalPenaltyAmount + amount
            });
            // Trigger 5-second unskippable cooldown
            setEmotionalCooldownSeconds(5);
            // Keep the previous timings so we stay blocked until it naturally expires
            return;
        }

        // Add current action timestamp
        setPointActionTimings([...recentActions, { time: now, type: actionType, amount }]);

        // Proceed with modal
        setPenaltyTaskContext(t);
        const initialSelectedKids = t.kidId !== 'all' ? [t.kidId] : (kids.length === 1 ? [kids[0].id] : []);
        setPenaltySelectedKidIds(initialSelectedKids);

        if (actionType === 'reward') {
            setShowRewardModal(true);
        } else {
            setShowPenaltyModal(true);
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            {/* Glassmorphic Hero Section */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-emerald-500/20 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
                <div className="relative z-10 w-full sm:w-auto">
                    <h2 className="font-extrabold text-white text-2xl sm:text-3xl mb-2 flex items-center gap-3 drop-shadow-sm">
                        <span className="bg-white/20 p-2 rounded-2xl backdrop-blur-sm border border-white/20 text-xl sm:text-2xl">🌱</span>
                        习惯养成与成长
                    </h2>
                    <p className="text-emerald-50 text-sm sm:text-base font-medium opacity-90 max-w-sm">设置正向行为规范，引导孩子通过日常点滴积累家庭财富，培养好习惯。</p>
                </div>
                <button onClick={() => {
                    const defaultTimes = getDefaultTimeRange();
                    setEditingTask(null);
                    setPlanType('habit');
                    setPlanForm({ targetKids: ['all'], category: '语文', iconName: getIconForCategory('语文'), title: '', desc: '', startDate: new Date().toISOString().split('T')[0], endDate: '', repeatType: 'today', weeklyDays: [1, 2, 3, 4, 5], ebbStrength: 'normal', periodDaysType: 'any', periodCustomDays: [1, 2, 3, 4, 5], periodTargetCount: 1, periodMaxPerDay: 1, periodMaxType: 'daily', timeSetting: 'range', startTime: defaultTimes.start, endTime: defaultTimes.end, durationPreset: 25, pointRule: 'default', reward: '', iconEmoji: '📚', habitColor: 'from-blue-400 to-blue-500', habitType: 'daily_once', attachments: [] });
                    setShowAddPlanModal(true);
                }} className="relative z-10 w-full sm:w-auto bg-white/95 backdrop-blur-sm text-emerald-700 px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl font-black text-base sm:text-lg transition-all hover:scale-105 hover:bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center gap-2 group">
                    <Icons.Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" /> 新建习惯规则
                </button>
            </div>

            {/* Habit Rules Grid */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-5 gap-3">
                    <h3 className="font-black text-slate-800 text-lg sm:text-xl flex items-center gap-2 px-2 shrink-0">
                        <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                        当前生效的习惯规则
                    </h3>
                    <div className="relative w-full sm:w-64 shrink-0">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icons.Search size={16} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="搜索习惯名称..."
                            value={searchPlanKeyword}
                            onChange={(e) => setSearchPlanKeyword(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-sm font-bold rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                        />
                        {searchPlanKeyword && (
                            <button onClick={() => setSearchPlanKeyword('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                                <Icons.X size={14} />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto hide-scrollbar">
                        {[
                            { id: 'all', label: '全部' },
                            { id: 'income', label: '好习惯' },
                            { id: 'expense', label: '坏习惯' }
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {tasks.filter(t => t.type === 'habit' && (!searchPlanKeyword || t.title.toLowerCase().includes(searchPlanKeyword.toLowerCase()) || (t.desc && t.desc.toLowerCase().includes(searchPlanKeyword.toLowerCase())))).filter(t => {
                        if (habitCardFilter === 'income') return t.reward >= 0;
                        if (habitCardFilter === 'expense') return t.reward < 0;
                        return true;
                    }).length === 0 ? (
                        <div className="col-span-full bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner"><Icons.SearchX size={28} /></div>
                            <div className="text-slate-500 font-bold mb-1">未找到相关习惯</div>
                            <div className="text-slate-400 text-sm">尝试更换搜索词或新建一个习惯吧</div>
                        </div>
                    ) : (
                        tasks.filter(t => t.type === 'habit' && (!searchPlanKeyword || t.title.toLowerCase().includes(searchPlanKeyword.toLowerCase()) || (t.desc && t.desc.toLowerCase().includes(searchPlanKeyword.toLowerCase())))).filter(t => {
                            if (habitCardFilter === 'income') return t.reward >= 0;
                            if (habitCardFilter === 'expense') return t.reward < 0;
                            return true;
                        }).map(t => {
                            const kName = t.kidId === 'all' ? '全部孩子' : (kids.find(k => k.id === t.kidId)?.name || '未知');
                            return (
                                <div key={t.id} className="bg-white p-5 rounded-[2rem] border border-slate-100/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all flex flex-col justify-between group">
                                    <div className="flex items-start gap-4 mb-5">
                                        <div className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${t.habitColor || 'from-emerald-400 to-teal-500'} flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                                            {t.iconEmoji || '🛡️'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 mb-1">
                                                <h4 className="font-black text-slate-800 text-lg line-clamp-1">{t.title}</h4>
                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-bold whitespace-nowrap w-fit">{kName} 专属</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">{t.standards || t.desc}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-black tracking-wide ${t.reward < 0 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                            {t.reward > 0 ? '+' : ''}{t.reward} 家庭币
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {(() => {
                                                const todayStr = formatDate(new Date());
                                                const kidHistory = t.history || {};
                                                const todayHist = kidHistory[todayStr] || {};
                                                const maxAllowed = t.periodMaxPerDay || t.maxPerDay || 1;

                                                // Check if ALL assigned kids are maxed out
                                                const targetKids = t.kidId === 'all' ? kids : kids.filter(k => k.id === t.kidId);
                                                let allMaxed = true;

                                                for (const k of targetKids) {
                                                    const kidTodayData = t.kidId === 'all' ? (todayHist[k.id] || {}) : todayHist;
                                                    const attemptsToday = Array.isArray(kidTodayData) ? kidTodayData.length : (kidTodayData.status ? 1 : 0);

                                                    const isBlockedByFreq = attemptsToday >= maxAllowed;
                                                    const isBlockedByBalance = (t.reward < 0) && (k.balances?.spend < Math.abs(t.reward));

                                                    // If there is ANY kid who is NOT blocked by frequency AND NOT blocked by balance
                                                    // then we shouldn't gray out the button.
                                                    if (!isBlockedByFreq && !isBlockedByBalance) {
                                                        allMaxed = false;
                                                    }
                                                }

                                                return (
                                                    <button
                                                        onClick={() => {
                                                            if (allMaxed) return;
                                                            handlePointAction(t, t.reward < 0 ? 'penalty' : 'reward');
                                                        }}
                                                        className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all shadow-sm ${allMaxed ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : (t.reward < 0 ? 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100 hover:border-red-500' : 'bg-amber-50 text-amber-600 hover:bg-emerald-500 hover:text-white border border-amber-100 hover:border-emerald-500')}`}
                                                    >
                                                        {t.reward < 0 ? <Icons.Minus size={18} strokeWidth={3} /> : <Icons.Plus size={18} strokeWidth={3} />}
                                                    </button>
                                                );
                                            })()}
                                            <button onClick={() => {
                                                setEditingTask(t);
                                                setPlanType('habit');
                                                // ensure safe extraction for edit form
                                                const ebbStr = t.repeatConfig?.ebbStrength || 'normal';
                                                const ptgt = t.repeatConfig?.periodTargetCount || 1;
                                                const pmaxp = t.repeatConfig?.periodMaxPerDay || 1;
                                                const pdtype = t.repeatConfig?.periodDaysType || 'any';
                                                const pcdays = t.repeatConfig?.periodCustomDays || [1, 2, 3, 4, 5];
                                                const pmaxtype = t.repeatConfig?.periodMaxType || 'daily';

                                                setPlanForm({
                                                    title: t.title, desc: t.desc || t.standards || '',
                                                    category: t.category, iconName: t.iconName,
                                                    targetKids: t.kidId === 'all' ? ['all'] : [t.kidId],
                                                    startDate: t.startDate || new Date().toISOString().split('T')[0], endDate: t.endDate || '',
                                                    repeatType: t.repeatType || 'today',
                                                    weeklyDays: t.weeklyDays || [1, 2, 3, 4, 5],
                                                    ebbStrength: ebbStr, periodTargetCount: ptgt, periodMaxPerDay: pmaxp, periodDaysType: pdtype, periodCustomDays: pcdays, periodMaxType: pmaxtype,
                                                    timeSetting: t.timeStr && String(t.timeStr) !== '--:--' ? (String(t.timeStr).includes('-') ? 'range' : 'duration') : 'none',
                                                    startTime: t.timeStr && String(t.timeStr).includes('-') ? String(t.timeStr).split('-')[0] : '',
                                                    endTime: t.timeStr && String(t.timeStr).includes('-') ? String(t.timeStr).split('-')[1] : '',
                                                    durationPreset: t.timeStr && String(t.timeStr).includes('分钟') ? parseInt(String(t.timeStr)) : 25,
                                                    pointRule: (t.pointRule && t.pointRule === 'custom') || (t.type === 'habit') ? 'custom' : 'default',
                                                    reward: String(Math.abs(t.reward || '')), 
                                                    habitRewardType: (t.reward || 0) < 0 ? 'penalty' : 'reward',
                                                    iconEmoji: t.iconEmoji || '📘', habitColor: t.catColor || t.habitColor || 'from-blue-400 to-blue-500', habitType: t.habitType || 'daily_once', attachments: t.attachments || [], requireApproval: t.requireApproval !== undefined ? t.requireApproval : true
                                                });
                                                setShowAddPlanModal(true);
                                            }} className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-100 shadow-sm">
                                                <Icons.Edit3 size={18} />
                                            </button>
                                            <button onClick={() => setDeleteConfirmTask(t)} className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100 hover:border-red-100 shadow-sm">
                                                <Icons.Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    {tasks.filter(t => t.type === 'habit').length === 0 && (
                        <div className="md:col-span-2 bg-white rounded-[2rem] border-2 border-slate-100 border-dashed flex flex-col items-center justify-center py-16 sm:py-20 shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-4xl mb-4 grayscale opacity-60">🌱</div>
                            <div className="text-slate-400 font-bold text-base sm:text-lg">暂无习惯规则，点击上方新建吧~</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Habit Transactions Feed */}
            <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100/80 overflow-hidden relative">
                {/* Decorative Top Banner */}
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-400"></div>

                <div className="p-5 sm:p-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                        <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner"><Icons.TrendingUp size={18} strokeWidth={2.5} /></div>
                            近期成长轨迹
                        </h3>
                        <p className="text-xs text-slate-400 font-bold mt-1 ml-10">此处仅展示习惯打卡的家庭币收支记录</p>
                    </div>
                </div>

                <div className="p-4 sm:p-6 relative">
                    {transactions.filter(t => t.category === 'habit').length === 0 ? (
                        <div className="text-center py-12 text-slate-400 font-bold bg-slate-50 rounded-[1.5rem]">还没有产生打卡记录哦~</div>
                    ) : (
                        <div className="space-y-4 max-h-[28rem] overflow-y-auto custom-scrollbar pr-2 relative">
                            {/* Global Timeline Track */}
                            <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-slate-100 rounded-full z-0"></div>

                            {transactions.filter(t => t.category === 'habit').slice(0, 40).map((item, idx) => {
                                const kName = kids.find(k => k.id === item.kidId)?.name || '未知';
                                const isIncome = item.type === 'income';

                                // Handle cases where older backend versions logged 'EXP' into title or amounts
                                const displayAmount = isIncome ? `+${item.amount}` : `-${item.amount}`;
                                const cleanTitle = item.title.replace(/\(Exp\)/i, '').trim();

                                return (
                                    <div key={item.id || `plan-tx-${idx}`} className="relative pl-12 group z-10">
                                        {/* Timeline Dot */}
                                        <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full border-2 border-white shadow-sm flex items-center justify-center ${isIncome ? 'bg-emerald-400' : 'bg-red-400'} z-20`}></div>

                                        <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-300 ${isIncome ? 'bg-gradient-to-r from-emerald-50/50 to-emerald-50/10 border-emerald-100 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-100'
                                                : 'bg-gradient-to-r from-red-50/50 to-red-50/10 border-red-100 hover:border-red-200 hover:shadow-md hover:shadow-red-100'
                                            }`}>
                                            <div className="mb-2 sm:mb-0">
                                                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                                                    <span className="text-[10px] bg-white border border-slate-200 shadow-sm font-black text-slate-600 px-2.5 py-1 rounded-lg tracking-wider">{kName}</span>
                                                    <div className="font-black text-slate-700 text-sm sm:text-[15px]">{cleanTitle}</div>
                                                </div>
                                                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mt-2">
                                                    <div className="bg-slate-100 p-1 rounded-md"><Icons.Clock size={10} /></div>
                                                    {new Date(item.date).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end">
                                                <div className={`font-black text-lg tracking-tight bg-white px-4 py-2 rounded-xl shadow-sm border ${isIncome ? 'text-emerald-500 border-emerald-100/50' : 'text-red-500 border-red-100/50'
                                                    }`}>
                                                    {displayAmount} <span className="text-[11px] font-bold text-slate-400 ml-0.5">币</span>
                                                </div>
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
