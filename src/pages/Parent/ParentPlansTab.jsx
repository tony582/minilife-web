import React, { useState, useRef, useEffect, useMemo } from 'react';
import { HabitTemplateModal } from '../../components/modals/HabitTemplateModal';
import { renderHabitIcon } from '../../utils/habitIcons';
import { createPortal } from 'react-dom';
import { useDataContext } from '../../context/DataContext.jsx';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons } from '../../utils/Icons';
import { getCategoryGradient, getIconForCategory } from '../../utils/categoryUtils';
import { formatDate, getDisplayDateArray, getWeekNumber } from '../../utils/dateUtils';
import { getWeeklyCompletionCount } from '../../hooks/useTasks';
import { apiFetch } from '../../api/client';
import { ReorderableList } from '../../components/common/ReorderableList';

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

// Warm Headspace theme
const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
    orange: '#FF8C42', teal: '#4ECDC4', coral: '#FF6B6B', green: '#10B981',
    textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
    cardShadow: '0 2px 12px rgba(27,46,75,0.06)',
    stickyBg: '#FBF7F0ee',
};

export const ParentPlansTab = () => {
    const authC = useAuthContext();
    const { kids, tasks, transactions, setKids, setTasks } = useDataContext();
    const {
        pointActionTimings, setPointActionTimings,
        setShowEmotionalReminderModal, setEmotionalCooldownSeconds,
        setPenaltyTaskContext, setPenaltySelectedKidIds,
        setShowRewardModal, setShowPenaltyModal,
        setEditingTask, setPlanType, setPlanForm, setShowAddPlanModal,
        setDeleteConfirmTask,
        selectedDate, setSelectedDate, currentViewDate, setCurrentViewDate, setShowCalendarModal
    } = useUIContext();

    const [searchPlanKeyword, setSearchPlanKeyword] = useState('');
    const [habitCardFilter, setHabitCardFilter] = useState('all');
    const [detailModalType, setDetailModalType] = useState(null);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [manageMode, setManageMode] = useState(null); // 'reorder' | 'delete' | null
    const [batchDeleteSet, setBatchDeleteSet] = useState(new Set());

    // Habits sorted by order for reorder/manage
    const habitTasks = useMemo(() => tasks.filter(t => t.type === 'habit').sort((a, b) => (a.order || 0) - (b.order || 0)), [tasks]);

    const handleHabitReorder = (sourceIndex, targetIndex) => {
        if (sourceIndex === targetIndex || targetIndex < 0 || targetIndex >= habitTasks.length) return;
        const updated = [...habitTasks];
        const [removed] = updated.splice(sourceIndex, 1);
        updated.splice(targetIndex, 0, removed);
        const orderMap = {};
        updated.forEach((task, idx) => { orderMap[task.id] = idx; });
        setTasks(prev => prev.map(t => orderMap[t.id] !== undefined ? { ...t, order: orderMap[t.id] } : t));
        updated.forEach((task, idx) => {
            apiFetch(`/api/tasks/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: idx }) }).catch(console.error);
        });
    };

    const handleBatchDelete = async () => {
        if (batchDeleteSet.size === 0) return;
        const ids = [...batchDeleteSet];
        for (const id of ids) {
            try {
                await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
            } catch (e) { console.error(e); }
        }
        setTasks(prev => prev.filter(t => !batchDeleteSet.has(t.id)));
        authC.notify(`已删除 ${ids.length} 个习惯`, 'success');
        setBatchDeleteSet(new Set());
        setManageMode(null);
    };


    // Sticky compact calendar
    const calendarSentinelRef = useRef(null);
    const [showCompactCalendar, setShowCompactCalendar] = useState(false);
    useEffect(() => {
        const sentinel = calendarSentinelRef.current;
        if (!sentinel) return;
        const onScroll = () => setShowCompactCalendar(sentinel.getBoundingClientRect().bottom < 10);
        const targets = [window];
        let el = sentinel.parentElement;
        while (el) { const s = getComputedStyle(el); if (s.overflowY === 'auto' || s.overflowY === 'scroll') targets.push(el); el = el.parentElement; }
        targets.forEach(t => t.addEventListener('scroll', onScroll, { passive: true }));
        onScroll();
        return () => targets.forEach(t => t.removeEventListener('scroll', onScroll));
    }, []);

    // Helper: count incomplete habits for a given date
    const getIncompleteHabitCounts = (dateStr) => {
        const allH = tasks.filter(t => t.type === 'habit');
        const total = allH.length;
        const done = allH.filter(t => {
            const kidsList = t.kidId === 'all' ? kids : kids.filter(k => k.id === t.kidId);
            return kidsList.every(k => {
                const entry = t.kidId === 'all' ? t.history?.[dateStr]?.[k.id] : t.history?.[dateStr];
                const count = Array.isArray(entry) ? entry.length : (entry?.count || (entry?.status === 'completed' ? 1 : 0));
                const maxPerDay = t.periodMaxPerDay || t.maxPerDay || 1;
                return count >= maxPerDay;
            });
        }).length;
        return { count: total - done, total };
    };

    // Stats for good/bad habits
    const allHabits = tasks.filter(t => t.type === 'habit');
    const goodHabits = allHabits.filter(t => t.reward >= 0);
    const badHabits = allHabits.filter(t => t.reward < 0);
    const getHabitDoneForParent = (t) => {
        const kidsList = t.kidId === 'all' ? kids : kids.filter(k => k.id === t.kidId);
        return kidsList.every(k => {
            const entry = t.kidId === 'all' ? t.history?.[selectedDate]?.[k.id] : t.history?.[selectedDate];
            const count = Array.isArray(entry) ? entry.length : (entry?.count || (entry?.status === 'completed' ? 1 : 0));
            const maxPerDay = t.periodMaxPerDay || t.maxPerDay || 1;
            return count >= maxPerDay;
        });
    };
    const goodDone = goodHabits.filter(getHabitDoneForParent).length;
    const badDone = badHabits.filter(getHabitDoneForParent).length;

    const todayHabitTx = transactions.filter(t => t.category === 'habit' && new Date(t.date).toDateString() === new Date(selectedDate).toDateString());
    const todayEarned = todayHabitTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const todayDeducted = todayHabitTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

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
        <div className="animate-fade-in -mx-4 md:-mx-8 px-0 pb-10" style={{ background: C.bg, minHeight: '100vh' }}>
          <div className="max-w-5xl mx-auto">

            {/* ═══ Compact Sticky Calendar (portal) ═══ */}
            {createPortal(
                <div className={`fixed top-0 left-0 right-0 z-[9998] sm:hidden transition-all duration-300 ${showCompactCalendar ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
                    <div style={{ background: C.stickyBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.bgLight}`, paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }} className="px-3 py-2">
                        <div className="flex items-center gap-1">
                            {getDisplayDateArray(currentViewDate).map((day, i) => {
                                const isSel = selectedDate === day.dateStr;
                                const isToday = day.dateStr === formatDate(new Date());
                                const { count, total } = getIncompleteHabitCounts(day.dateStr);
                                return (
                                    <button key={i} onClick={() => setSelectedDate(day.dateStr)}
                                        className="flex-1 flex flex-col items-center py-1.5 rounded-2xl transition-all"
                                        style={isSel ? { background: C.teal, boxShadow: `0 4px 14px ${C.teal}60` } : {}}
                                    >
                                        <span className="text-[9px] font-bold" style={{ color: isSel ? '#fff9' : C.textMuted }}>{day.d}</span>
                                        <span className="text-sm font-black leading-tight" style={{ color: isSel ? '#fff' : (isToday ? C.teal : C.textSoft) }}>{day.displayDate.split('/')[1]}</span>
                                        <div className="mt-0.5 h-2 flex items-center justify-center">
                                            {count > 0 ? <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.coral }}></span>
                                            : total > 0 ? <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.teal }}></span>
                                            : null}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ═══ Calendar Section ═══ */}
            <div className="relative overflow-hidden pb-4 px-4">
                <div className="absolute -top-32 -left-20 w-56 h-56 rounded-full opacity-15" style={{ background: C.teal }}></div>
                <div className="absolute -top-20 -left-12 w-40 h-40 rounded-full opacity-10" style={{ background: C.green }}></div>

                <div className="relative z-10 flex items-center justify-between mb-5">
                    <div>
                        <div className="text-2xl font-black" style={{ color: C.textPrimary }}>
                            {new Date(currentViewDate).getMonth() + 1}月
                        </div>
                        <div className="text-sm font-bold mt-0.5" style={{ color: C.textSoft }}>
                            第{getWeekNumber(currentViewDate)[1]}周
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => { const d = new Date(currentViewDate); d.setDate(d.getDate() - 7); setCurrentViewDate(d); }}
                            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                            style={{ background: C.bgCard, color: C.textSoft }}>
                            <Icons.ChevronLeft size={18} />
                        </button>
                        <button onClick={() => { setCurrentViewDate(new Date()); setSelectedDate(formatDate(new Date())); }}
                            className="px-4 py-2 rounded-full font-black text-xs transition-all active:scale-95"
                            style={{ background: C.teal, color: '#fff', boxShadow: `0 4px 14px ${C.teal}50` }}>
                            今天
                        </button>
                        <button onClick={() => { const d = new Date(currentViewDate); d.setDate(d.getDate() + 7); setCurrentViewDate(d); }}
                            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                            style={{ background: C.bgCard, color: C.textSoft }}>
                            <Icons.ChevronRight size={18} />
                        </button>
                        <button onClick={() => setShowCalendarModal(true)}
                            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                            style={{ background: C.bgCard, color: C.textSoft }}>
                            <Icons.Calendar size={16} />
                        </button>
                    </div>
                </div>

                <div ref={calendarSentinelRef} className="grid grid-cols-7 gap-1.5">
                    {getDisplayDateArray(currentViewDate).map((day, i) => {
                        const { count, total } = getIncompleteHabitCounts(day.dateStr);
                        const isSel = selectedDate === day.dateStr;
                        const isToday = day.dateStr === formatDate(new Date());
                        return (
                            <button key={i} onClick={() => setSelectedDate(day.dateStr)}
                                className="flex flex-col items-center py-3 md:py-4 rounded-2xl transition-all duration-200"
                                style={isSel ? {
                                    background: C.teal,
                                    boxShadow: `0 8px 24px ${C.teal}50`,
                                    transform: 'translateY(-2px)'
                                } : {
                                    background: isToday ? C.bgLight : C.bgCard,
                                }}
                            >
                                <span className="text-[9px] md:text-[10px] font-bold mb-1" style={{ color: isSel ? '#fff9' : C.textMuted }}>{day.d}</span>
                                <span className="text-lg md:text-xl font-black" style={{ color: isSel ? '#fff' : (isToday ? C.teal : C.textPrimary) }}>{day.displayDate.split('/')[1]}</span>
                                <div className="mt-1.5 h-3 flex items-center justify-center">
                                    {count > 0 ? (
                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: isSel ? '#fff3' : `${C.coral}30`, color: isSel ? '#fff' : C.coral }}>{count}</span>
                                    ) : total > 0 ? (
                                        <Icons.Check size={11} style={{ color: isSel ? '#fffc' : C.teal }} />
                                    ) : (
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: isSel ? '#fff4' : (isToday ? C.teal : 'transparent') }}></div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ═══ Compact Stats + Toolbar ═══ */}
            <div className="px-4 pb-3">
                {/* Row 1: Stat pills (clickable) + Action icons */}
                <div className="flex items-center gap-2 mb-2.5">
                    {/* Good habit pill */}
                    <button onClick={() => setDetailModalType('good')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-95"
                        style={{ background: `${C.teal}12`, border: `1px solid ${C.teal}25` }}>
                        <Icons.TrendingUp size={13} style={{ color: C.teal }} />
                        <span className="text-xs font-black" style={{ color: C.teal }}>+{todayEarned}</span>
                        <span className="text-[10px] font-bold" style={{ color: `${C.teal}99` }}>{goodDone}/{goodHabits.length}</span>
                    </button>
                    {/* Bad habit pill */}
                    <button onClick={() => setDetailModalType('bad')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-95"
                        style={{ background: `${C.coral}12`, border: `1px solid ${C.coral}25` }}>
                        <Icons.TrendingDown size={13} style={{ color: C.coral }} />
                        <span className="text-xs font-black" style={{ color: C.coral }}>-{todayDeducted}</span>
                        <span className="text-[10px] font-bold" style={{ color: `${C.coral}99` }}>{badDone}/{badHabits.length}</span>
                    </button>
                    {/* Spacer */}
                    <div className="flex-1" />
                    {/* Action icons */}
                    <button onClick={() => {
                        const defaultTimes = getDefaultTimeRange();
                        setEditingTask(null);
                        setPlanType('habit');
                        setPlanForm({ targetKids: ['all'], category: '语文', iconName: getIconForCategory('语文'), title: '', desc: '', startDate: new Date().toISOString().split('T')[0], endDate: '', repeatType: 'today', weeklyDays: [1, 2, 3, 4, 5], ebbStrength: 'normal', periodDaysType: 'any', periodCustomDays: [1, 2, 3, 4, 5, 6, 7], periodTargetCount: 1, periodMaxPerDay: 1, periodMaxType: 'daily', timeSetting: 'range', startTime: defaultTimes.start, endTime: defaultTimes.end, durationPreset: 25, pointRule: 'default', reward: '', iconEmoji: 'ph:Star', habitColor: 'from-blue-400 to-blue-500', habitType: 'daily_once', attachments: [] });
                        setShowAddPlanModal(true);
                    }} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
                        style={{ background: C.teal, color: '#fff', boxShadow: `0 3px 10px ${C.teal}40` }}
                        title="新建习惯">
                        <Icons.Plus size={18} />
                    </button>
                    <button onClick={() => setShowTemplateModal(true)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
                        style={{ background: C.bgCard, color: C.teal, boxShadow: C.cardShadow }}
                        title="批量导入">
                        <Icons.Package size={16} />
                    </button>
                    {habitTasks.length > 0 && (
                        <button onClick={() => { setManageMode('reorder'); setBatchDeleteSet(new Set()); }}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
                            style={{ background: C.bgCard, color: C.textSoft, boxShadow: C.cardShadow }}
                            title="管理">
                            <Icons.Settings size={16} />
                        </button>
                    )}
                </div>
                {/* Row 2: Filter tabs + Search */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 p-1 rounded-xl shrink-0" style={{ background: C.bgCard }}>
                        {[{ id: 'all', label: '全部' }, { id: 'income', label: '好' }, { id: 'expense', label: '坏' }].map(f => (
                            <button key={f.id} onClick={() => setHabitCardFilter(f.id)}
                                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all"
                                style={{ background: habitCardFilter === f.id ? C.teal : 'transparent', color: habitCardFilter === f.id ? '#fff' : C.textMuted }}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div className="relative flex-1 min-w-0">
                        <Icons.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textMuted }} />
                        <input type="text" placeholder="搜索..." value={searchPlanKeyword} onChange={e => setSearchPlanKeyword(e.target.value)}
                            className="w-full text-xs font-bold rounded-xl pl-8 pr-7 py-2 focus:outline-none transition-all placeholder:font-normal border-none"
                            style={{ background: C.bgCard, color: C.textPrimary, caretColor: C.teal }}
                        />
                        {searchPlanKeyword && (
                            <button onClick={() => setSearchPlanKeyword('')} className="absolute inset-y-0 right-0 pr-2.5 flex items-center" style={{ color: C.textMuted }}><Icons.X size={13} /></button>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ Habit Rules ═══ */}
            <div className="px-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {tasks.filter(t => t.type === 'habit' && (!searchPlanKeyword || t.title.toLowerCase().includes(searchPlanKeyword.toLowerCase()) || (t.desc && t.desc.toLowerCase().includes(searchPlanKeyword.toLowerCase())))).filter(t => {
                        if (habitCardFilter === 'income') return t.reward >= 0;
                        if (habitCardFilter === 'expense') return t.reward < 0;
                        return true;
                    }).length === 0 ? (
                        <div className="col-span-full text-center py-16 rounded-2xl" style={{ background: C.bgCard }}>
                            <div className="text-5xl mb-4">🌱</div>
                            <div className="font-black text-base" style={{ color: C.textPrimary }}>未找到相关习惯</div>
                            <div className="text-xs font-bold mt-1" style={{ color: C.textMuted }}>尝试更换搜索词或新建一个习惯吧</div>
                        </div>
                    ) : (
                        tasks.filter(t => t.type === 'habit' && (!searchPlanKeyword || t.title.toLowerCase().includes(searchPlanKeyword.toLowerCase()) || (t.desc && t.desc.toLowerCase().includes(searchPlanKeyword.toLowerCase())))).filter(t => {
                            if (habitCardFilter === 'income') return t.reward >= 0;
                            if (habitCardFilter === 'expense') return t.reward < 0;
                            return true;
                        }).map(t => {
                            const kName = t.kidId === 'all' ? (kids.length === 1 ? kids[0].name : '全部孩子') : (kids.find(k => k.id === t.kidId)?.name || '未知');
                            const isNeg = t.reward < 0;
                            const accent = isNeg ? C.coral : C.teal;
                            return (
                                <div key={t.id} className="p-5 rounded-2xl transition-all hover:shadow-lg relative overflow-hidden"
                                    style={{ background: C.bgCard, boxShadow: C.cardShadow }}>
                                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: accent }}></div>
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${t.catColor || t.habitColor || 'from-emerald-400 to-teal-500'} flex items-center justify-center text-2xl`}
                                            style={{ color: '#fff' }}>
                                            {renderHabitIcon(t.iconEmoji, '🛡️', 22)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-0.5">
                                                <h4 className="font-black text-base line-clamp-1" style={{ color: C.textPrimary }}>{t.title}</h4>
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap w-fit" style={{ background: C.bgLight, color: C.textMuted }}>{kName}</span>
                                            </div>
                                            <p className="text-xs mt-1 line-clamp-2" style={{ color: C.textSoft }}>{t.standards || t.desc}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-3 mt-auto" style={{ borderColor: C.bgLight }}>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
                                            style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}20` }}>
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
                                                        className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${allMaxed ? 'cursor-not-allowed' : 'active:scale-90'}`}
                                                        style={{
                                                            background: allMaxed ? C.bgLight : `${accent}12`,
                                                            color: allMaxed ? C.textMuted : accent,
                                                        }}
                                                    >
                                                        {t.reward < 0 ? <Icons.Minus size={16} strokeWidth={3} /> : <Icons.Plus size={16} strokeWidth={3} />}
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
                                                    reward: String(Math.abs(t.reward ?? 0)), 
                                                    habitRewardType: (t.reward || 0) < 0 ? 'penalty' : 'reward',
                                                    iconEmoji: t.iconEmoji || '📘', habitColor: t.catColor || t.habitColor || 'from-blue-400 to-blue-500', habitType: t.habitType || 'daily_once', attachments: t.attachments || [], requireApproval: t.requireApproval !== undefined ? t.requireApproval : true
                                                });
                                                setShowAddPlanModal(true);
                                            }} className="flex items-center justify-center w-9 h-9 rounded-xl transition-all active:scale-90" style={{ background: C.bgLight, color: C.textSoft }}>
                                                <Icons.Edit3 size={16} />
                                            </button>
                                            <button onClick={() => setDeleteConfirmTask(t)} className="flex items-center justify-center w-9 h-9 rounded-xl transition-all active:scale-90" style={{ background: `${C.coral}10`, color: C.coral }}>
                                                <Icons.Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    {tasks.filter(t => t.type === 'habit').length === 0 && (
                        <div className="col-span-full text-center py-16 rounded-2xl" style={{ background: C.bgCard }}>
                            <div className="text-5xl mb-4">🌱</div>
                            <div className="font-black" style={{ color: C.textPrimary }}>暂无习惯规则</div>
                            <div className="text-xs font-bold mt-1 mb-4" style={{ color: C.textMuted }}>点击下方一键导入推荐模板，快速开始！</div>
                            <button onClick={() => setShowTemplateModal(true)}
                                className="px-6 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 inline-flex items-center gap-2"
                                style={{ background: C.teal, color: '#fff', boxShadow: `0 4px 14px ${C.teal}40` }}>
                                <Icons.Package size={16} /> 批量导入
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ Detail Modal ═══ */}
            {showTemplateModal && <HabitTemplateModal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} />}

            {/* ═══ Manage Modal (Reorder / Batch Delete) ═══ */}
            {manageMode && createPortal(
                <div className="z-[200]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: C.bg }}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${C.bgLight}` }}>
                        <button onClick={() => { setManageMode(null); setBatchDeleteSet(new Set()); }}
                            className="p-2 rounded-full" style={{ color: C.textSoft }}>
                            <Icons.X size={22} />
                        </button>
                        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: C.bgLight }}>
                            <button onClick={() => { setManageMode('reorder'); setBatchDeleteSet(new Set()); }}
                                className="px-4 py-1.5 rounded-lg text-xs font-black transition-all"
                                style={{ background: manageMode === 'reorder' ? C.bgCard : 'transparent', color: manageMode === 'reorder' ? C.teal : C.textMuted, boxShadow: manageMode === 'reorder' ? C.cardShadow : 'none' }}>
                                排序
                            </button>
                            <button onClick={() => { setManageMode('delete'); setBatchDeleteSet(new Set()); }}
                                className="px-4 py-1.5 rounded-lg text-xs font-black transition-all"
                                style={{ background: manageMode === 'delete' ? C.bgCard : 'transparent', color: manageMode === 'delete' ? C.coral : C.textMuted, boxShadow: manageMode === 'delete' ? C.cardShadow : 'none' }}>
                                删除
                            </button>
                        </div>
                        <button onClick={() => { setManageMode(null); setBatchDeleteSet(new Set()); }}
                            className="font-black px-4 py-2 rounded-full text-sm" style={{ color: C.teal }}>
                            完成
                        </button>
                    </div>

                    {/* Body */}
                    <div style={{ position: 'absolute', top: 57, left: 0, right: 0, bottom: manageMode === 'delete' && batchDeleteSet.size > 0 ? 72 : 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '1rem', paddingBottom: '2rem' }}>
                        <div className="max-w-2xl mx-auto">
                            {manageMode === 'reorder' ? (
                                <>
                                    <div className="text-[13px] font-bold p-3 rounded-2xl mb-4 text-center" style={{ background: C.bgCard, color: C.textSoft, boxShadow: C.cardShadow }}>
                                        💡 长按拖动调整习惯顺序
                                    </div>
                                    <ReorderableList
                                        items={habitTasks}
                                        onReorder={handleHabitReorder}
                                        keyExtractor={(t) => t.id}
                                        renderItem={(t) => (
                                            <div className="rounded-xl px-4 py-3.5 flex items-center gap-3 select-none" style={{ background: C.bgCard }}>
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${t.catColor || t.habitColor || 'from-emerald-400 to-teal-500'}`} style={{ color: '#fff' }}>
                                                    {renderHabitIcon(t.iconEmoji, '🛡️', 18)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-black text-sm truncate" style={{ color: C.textPrimary }}>{t.title}</div>
                                                    <div className="text-[10px] font-bold" style={{ color: t.reward < 0 ? C.coral : C.teal }}>{t.reward > 0 ? '+' : ''}{t.reward} 家庭币</div>
                                                </div>
                                                <Icons.GripVertical size={18} style={{ color: C.textMuted }} />
                                            </div>
                                        )}
                                    />
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[13px] font-bold" style={{ color: C.textSoft }}>
                                            已选 {batchDeleteSet.size} 个
                                        </span>
                                        <button onClick={() => batchDeleteSet.size === habitTasks.length ? setBatchDeleteSet(new Set()) : setBatchDeleteSet(new Set(habitTasks.map(t => t.id)))}
                                            className="text-xs font-black px-3 py-1.5 rounded-lg"
                                            style={{ background: C.bgCard, color: C.textSoft }}>
                                            {batchDeleteSet.size === habitTasks.length ? '取消全选' : '全选'}
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {habitTasks.map(t => {
                                            const isChecked = batchDeleteSet.has(t.id);
                                            return (
                                                <button key={t.id}
                                                    onClick={() => setBatchDeleteSet(prev => { const n = new Set(prev); n.has(t.id) ? n.delete(t.id) : n.add(t.id); return n; })}
                                                    className="w-full rounded-xl px-4 py-3.5 flex items-center gap-3 text-left transition-all"
                                                    style={{ background: C.bgCard, border: `1.5px solid ${isChecked ? C.coral + '40' : C.bgLight}` }}>
                                                    <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                                                        style={{ background: isChecked ? C.coral : C.bgLight, color: '#fff' }}>
                                                        {isChecked && <Icons.Check size={12} />}
                                                    </div>
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${t.catColor || t.habitColor || 'from-emerald-400 to-teal-500'}`} style={{ color: '#fff' }}>
                                                        {renderHabitIcon(t.iconEmoji, '🛡️', 18)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-black text-sm truncate" style={{ color: C.textPrimary }}>{t.title}</div>
                                                        <div className="text-[10px] font-bold" style={{ color: t.reward < 0 ? C.coral : C.teal }}>{t.reward > 0 ? '+' : ''}{t.reward} 家庭币</div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Batch delete footer */}
                    {manageMode === 'delete' && batchDeleteSet.size > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: C.bgCard, borderTop: `1px solid ${C.bgLight}` }}>
                            <button onClick={handleBatchDelete}
                                className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                style={{ background: C.coral, color: '#fff', boxShadow: `0 4px 14px ${C.coral}40` }}>
                                <Icons.Trash2 size={18} />
                                删除 {batchDeleteSet.size} 个习惯
                            </button>
                        </div>
                    )}
                </div>,
                document.body
            )}

            {detailModalType && (() => {
                const isGood = detailModalType === 'good';
                const accent = isGood ? C.teal : C.coral;
                const modalHabits = isGood ? goodHabits : badHabits;
                const icon = isGood ? <Icons.TrendingUp size={20} /> : <Icons.TrendingDown size={20} />;
                const title = isGood ? '好习惯打卡明细' : '坏习惯记录明细';

                const entries = [];
                modalHabits.forEach(t => {
                    const kidsList = t.kidId === 'all' ? kids : kids.filter(k => k.id === t.kidId);
                    kidsList.forEach(k => {
                        const entry = t.kidId === 'all' ? t.history?.[selectedDate]?.[k.id] : t.history?.[selectedDate];
                        if (!entry) return;
                        const records = Array.isArray(entry) ? entry : (entry.status ? [entry] : []);
                        records.forEach((rec, idx) => {
                            if (rec.status === 'completed' || rec.status === 'pending_approval') {
                                entries.push({ task: t, kid: k, record: rec, recordIndex: idx });
                            }
                        });
                    });
                });

                const handleUndoCheckIn = async (task, kid, recordIndex) => {
                    if (!window.confirm(`确定要撤销「${kid.name}」的「${task.title}」打卡吗？\n\n已获得/扣除的金币和经验会一并返还。`)) return;
                    try {
                        let newHistory = JSON.parse(JSON.stringify(task.history || {}));
                        if (task.kidId === 'all') {
                            let arr = newHistory[selectedDate]?.[kid.id];
                            if (Array.isArray(arr)) { arr.splice(recordIndex, 1); if (arr.length === 0) delete newHistory[selectedDate][kid.id]; }
                            else if (arr) delete newHistory[selectedDate][kid.id];
                        } else {
                            let arr = newHistory[selectedDate];
                            if (Array.isArray(arr)) { arr.splice(recordIndex, 1); if (arr.length === 0) delete newHistory[selectedDate]; }
                            else if (arr) delete newHistory[selectedDate];
                        }
                        const reward = task.reward || 0;
                        const expDiff = Math.ceil(Math.abs(reward) * 1.5);
                        if (reward !== 0) {
                            const newBals = { ...kid.balances, spend: Math.max(0, kid.balances.spend - reward) };
                            const newExp = Math.max(0, kid.exp - (reward > 0 ? expDiff : -expDiff));
                            setKids(kids.map(k => k.id === kid.id ? { ...k, balances: newBals, exp: newExp } : k));
                            apiFetch(`/api/kids/${kid.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ exp: newExp, balances: newBals }) }).catch(console.error);
                        }
                        setTasks(tasks.map(t => t.id === task.id ? { ...t, history: newHistory } : t));
                        apiFetch(`/api/tasks/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: newHistory }) }).catch(console.error);
                        authC.notify('已撤销打卡，金币和经验已返还', 'success');
                    } catch (e) {
                        authC.notify('撤销失败', 'error');
                    }
                };

                return createPortal(
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-6 animate-fade-in"
                        style={{ background: 'rgba(27,46,75,0.3)', backdropFilter: 'blur(8px)' }}
                        onClick={() => setDetailModalType(null)}>
                        <div className="w-full h-full md:h-auto md:max-h-[80vh] md:max-w-lg flex flex-col md:rounded-3xl overflow-hidden animate-bounce-in"
                            style={{ background: C.bg }}
                            onClick={e => e.stopPropagation()}>
                            <div className="shrink-0 p-5 flex items-center justify-between" style={{ background: C.bgCard, borderBottom: `1px solid ${C.bgLight}` }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}18`, color: accent }}>{icon}</div>
                                    <div>
                                        <h2 className="font-black text-base" style={{ color: C.textPrimary }}>{title}</h2>
                                        <div className="text-[11px] font-bold mt-0.5" style={{ color: C.textMuted }}>{selectedDate} · {entries.length} 条记录</div>
                                    </div>
                                </div>
                                <button onClick={() => setDetailModalType(null)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: C.bgLight, color: C.textMuted }}>
                                    <Icons.X size={18} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {entries.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center"
                                            style={{ background: `${accent}15`, color: accent }}>
                                            {isGood ? <Icons.TrendingUp size={28} /> : <Icons.ShieldAlert size={28} />}
                                        </div>
                                        <div className="font-black text-base" style={{ color: C.textPrimary }}>{isGood ? '今天还没有打卡' : '今天没有坏习惯记录'}</div>
                                        <div className="text-xs font-bold mt-1" style={{ color: C.textMuted }}>{isGood ? '快去督促打卡吧！' : '继续保持！'}</div>
                                    </div>
                                ) : (
                                    entries.map((e, idx) => (
                                        <div key={`${e.task.id}-${e.kid.id}-${e.recordIndex}-${idx}`}
                                            className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: C.bgCard, border: `1px solid ${C.bgLight}` }}>
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-base ${!isGood ? '' : `bg-gradient-to-br ${e.task.catColor || e.task.habitColor || 'from-emerald-400 to-teal-500'}`}`}
                                                style={!isGood ? { background: `${C.coral}15`, color: C.coral } : { color: '#fff' }}>
                                                {renderHabitIcon(e.task.iconEmoji, '✨', 16)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm truncate" style={{ color: C.textPrimary }}>{e.task.title}</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] font-bold px-1.5 py-px rounded" style={{ background: C.bgLight, color: C.textMuted }}>{e.kid.name}</span>
                                                    <span className="text-[10px] font-bold px-1.5 py-px rounded" style={{ background: `${accent}12`, color: accent }}>
                                                        {isGood ? `+${e.task.reward}` : `-${Math.abs(e.task.reward)}`}
                                                    </span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleUndoCheckIn(e.task, e.kid, e.recordIndex)}
                                                className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-[11px] font-bold transition-all active:scale-95"
                                                style={{ background: `${C.coral}12`, color: C.coral }}>
                                                <Icons.RefreshCw size={12} /> 撤销
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            {entries.length > 0 && (
                                <div className="shrink-0 p-4" style={{ background: C.bgCard, borderTop: `1px solid ${C.bgLight}` }}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold" style={{ color: C.textMuted }}>合计</span>
                                        <span className="font-black text-lg" style={{ color: accent }}>
                                            {isGood ? '+' : '-'}{entries.reduce((s, e) => s + Math.abs(e.task.reward || 0), 0)} 家庭币
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                );
            })()}

          </div>
        </div>
    );
};
