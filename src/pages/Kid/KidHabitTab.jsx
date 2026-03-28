import React, { useState, useRef, useEffect } from 'react';
import { renderHabitIcon } from '../../utils/habitIcons';
import { createPortal } from 'react-dom';
import { useDataContext } from '../../context/DataContext.jsx';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { useTaskManager } from '../../hooks/useTaskManager';
import { getWeeklyCompletionCount } from '../../hooks/useTasks';
import { Icons, renderIcon } from '../../utils/Icons';
import { formatDate, getDisplayDateArray, getWeekNumber } from '../../utils/dateUtils';
import { apiFetch } from '../../api/client';

// Warm Headspace theme constants
const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
    orange: '#FF8C42', orangeHot: '#FF6B1A', yellow: '#FFD93D', teal: '#4ECDC4',
    coral: '#FF6B6B', green: '#10B981', red: '#EF4444',
    textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
    cardShadow: '0 2px 12px rgba(27,46,75,0.06)',
    dropShadow: '0 20px 50px rgba(27,46,75,0.12)',
    stickyBg: '#FBF7F0ee',
};

export const KidHabitTab = () => {
    const authC = useAuthContext();
    const dataC = useDataContext();
    const uiC = useUIContext();

    const { transactions, tasks, activeKidId } = dataC;
    const { selectedDate, setSelectedDate, currentViewDate, setCurrentViewDate, setShowCalendarModal, historyFilter, setHistoryFilter } = uiC;
    const { handleAttemptSubmit } = useTaskManager(authC, dataC, uiC);

    const [searchKidHabitKeyword, setSearchKidHabitKeyword] = useState('');
    const [habitCardFilter, setHabitCardFilter] = useState('all');
    const [showSearchOverlay, setShowSearchOverlay] = useState(false);
    const [detailModalType, setDetailModalType] = useState(null); // 'good' | 'bad' | null


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
        const allH = tasks.filter(t => t.type === 'habit' && (t.kidId === activeKidId || t.kidId === 'all'));
        const total = allH.length;
        const done = allH.filter(t => {
            const entry = t.kidId === 'all' ? t.history?.[dateStr]?.[activeKidId] : t.history?.[dateStr];
            const count = Array.isArray(entry) ? entry.length : (entry?.count || (entry?.status === 'completed' ? 1 : 0));
            let currentLimitCount = count;
            if (t.habitType === 'multiple' && t.periodMaxType === 'weekly') currentLimitCount = getWeeklyCompletionCount(t, activeKidId, dateStr);
            const maxPerDay = t.periodMaxPerDay || t.maxPerDay || 1;
            return (t.habitType === 'daily_once' && count >= 1) || (t.habitType === 'multiple' && currentLimitCount >= maxPerDay);
        }).length;
        return { count: total - done, total };
    };

    const todayTransactions = transactions.filter(t => t.kidId === activeKidId && t.category === 'habit' && new Date(t.date).toDateString() === new Date().toDateString());
    const todayEarned = todayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const todayDeducted = todayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // Filtered habits
    const allHabits = tasks.filter(t => t.type === 'habit' && (!searchKidHabitKeyword || t.title.toLowerCase().includes(searchKidHabitKeyword.toLowerCase())));
    const filteredHabits = allHabits.filter(t => {
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
    });

    // Separate good/bad habit stats
    const getHabitDone = (t) => {
        const entry = t.kidId === 'all' ? t.history?.[selectedDate]?.[activeKidId] : t.history?.[selectedDate];
        const count = Array.isArray(entry) ? entry.length : (entry?.count || (entry?.status === 'completed' ? 1 : 0));
        let currentLimitCount = count;
        if (t.habitType === 'multiple' && t.periodMaxType === 'weekly') currentLimitCount = getWeeklyCompletionCount(t, activeKidId, selectedDate);
        const maxPerDay = t.periodMaxPerDay || t.maxPerDay || 1;
        return (t.habitType === 'daily_once' && count >= 1) || (t.habitType === 'multiple' && currentLimitCount >= maxPerDay);
    };
    const goodHabits = allHabits.filter(t => t.reward >= 0);
    const badHabits = allHabits.filter(t => t.reward < 0);
    const goodDone = goodHabits.filter(getHabitDone).length;
    const badDone = badHabits.filter(getHabitDone).length;
    const goodPct = goodHabits.length > 0 ? Math.round((goodDone / goodHabits.length) * 100) : 0;
    const badPct = badHabits.length > 0 ? Math.round((badDone / badHabits.length) * 100) : 0;

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
                {/* Decorative blobs */}
                <div className="absolute -top-32 -left-20 w-56 h-56 rounded-full opacity-15" style={{ background: C.teal }}></div>
                <div className="absolute -top-20 -left-12 w-40 h-40 rounded-full opacity-10" style={{ background: C.green }}></div>

                {/* Month + Week Header */}
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

                {/* ═══ Week Calendar ═══ */}
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

            {/* ═══ Hero: Two merged stat cards ═══ */}
            <div className="relative pb-4 px-4">

                <div className="relative z-10 flex gap-3">
                    {/* Good habits card — clickable */}
                    <button onClick={() => setDetailModalType('good')} className="flex-1 p-4 rounded-2xl text-left transition-all active:scale-[0.98] hover:shadow-lg cursor-pointer relative" style={{ background: C.bgCard, boxShadow: C.cardShadow }}>
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 shrink-0">
                                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                                    <circle cx="24" cy="24" r="20" fill="none" stroke={`${C.teal}20`} strokeWidth="4" />
                                    <circle cx="24" cy="24" r="20" fill="none" stroke={C.teal} strokeWidth="4" strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 20}`} strokeDashoffset={`${2 * Math.PI * 20 * (1 - goodPct / 100)}`}
                                        className="transition-all duration-700" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Icons.TrendingUp size={16} style={{ color: C.teal }} />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>好习惯</div>
                                <div className="text-xl font-black leading-tight" style={{ color: C.teal }}>+{todayEarned}</div>
                                <div className="text-[10px] font-bold mt-0.5" style={{ color: C.textMuted }}>{goodDone}/{goodHabits.length} 完成</div>
                            </div>
                        </div>
                        <div className="absolute top-2.5 right-2.5 md:hidden w-5 h-5 rounded-md flex items-center justify-center" style={{ background: `${C.teal}10` }}><Icons.ChevronRight size={12} style={{ color: C.teal, opacity: 0.5 }} /></div>
                        <div className="hidden md:flex items-center gap-1 absolute bottom-3 right-4 text-[10px] font-bold" style={{ color: C.teal, opacity: 0.6 }}>查看明细 <Icons.ChevronRight size={11} /></div>
                    </button>

                    {/* Bad habits card — clickable */}
                    <button onClick={() => setDetailModalType('bad')} className="flex-1 p-4 rounded-2xl text-left transition-all active:scale-[0.98] hover:shadow-lg cursor-pointer relative" style={{ background: C.bgCard, boxShadow: C.cardShadow }}>
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 shrink-0">
                                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                                    <circle cx="24" cy="24" r="20" fill="none" stroke={`${C.coral}20`} strokeWidth="4" />
                                    <circle cx="24" cy="24" r="20" fill="none" stroke={C.coral} strokeWidth="4" strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 20}`} strokeDashoffset={`${2 * Math.PI * 20 * (1 - badPct / 100)}`}
                                        className="transition-all duration-700" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Icons.TrendingDown size={16} style={{ color: C.coral }} />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>坏习惯</div>
                                <div className="text-xl font-black leading-tight" style={{ color: C.coral }}>-{todayDeducted}</div>
                                <div className="text-[10px] font-bold mt-0.5" style={{ color: C.textMuted }}>{badDone}/{badHabits.length} 记录</div>
                            </div>
                        </div>
                        <div className="absolute top-2.5 right-2.5 md:hidden w-5 h-5 rounded-md flex items-center justify-center" style={{ background: `${C.coral}10` }}><Icons.ChevronRight size={12} style={{ color: C.coral, opacity: 0.5 }} /></div>
                        <div className="hidden md:flex items-center gap-1 absolute bottom-3 right-4 text-[10px] font-bold" style={{ color: C.coral, opacity: 0.6 }}>查看明细 <Icons.ChevronRight size={11} /></div>
                    </button>
                </div>
            </div>

            {/* ═══ Toolbar: Search + Filter ═══ */}
            <div className="px-4 mb-4">
                <div className="flex items-center gap-2">
                    {/* PC: inline search bar */}
                    <div className="relative flex-1 min-w-0 hidden md:block">
                        <Icons.Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textMuted }} />
                        <input type="text" placeholder="搜索习惯..." value={searchKidHabitKeyword} onChange={e => setSearchKidHabitKeyword(e.target.value)}
                            className="w-full text-sm font-bold rounded-xl pl-9 pr-8 py-2.5 focus:outline-none transition-all placeholder:font-normal border-none"
                            style={{ background: C.bgCard, color: C.textPrimary, caretColor: C.teal }}
                        />
                        {searchKidHabitKeyword && (
                            <button onClick={() => setSearchKidHabitKeyword('')} className="absolute inset-y-0 right-0 pr-3 flex items-center" style={{ color: C.textMuted }}><Icons.X size={14} /></button>
                        )}
                    </div>
                    {/* Mobile: search icon → overlay */}
                    <button onClick={() => setShowSearchOverlay(true)}
                        className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
                        style={{ background: searchKidHabitKeyword ? C.teal : C.bgCard, color: searchKidHabitKeyword ? '#fff' : C.textMuted }}>
                        <Icons.Search size={16} />
                    </button>
                    <div className="flex items-center gap-1 p-1 rounded-xl flex-1 md:flex-none shrink-0 overflow-x-auto hide-scrollbar" style={{ background: C.bgCard }}>
                        {[
                            { id: 'all', label: '全部' },
                            { id: 'income', label: '好习惯' },
                            { id: 'expense', label: '坏习惯' },
                            { id: 'completed', label: '已打卡' },
                            { id: 'pending', label: '未打卡' }
                        ].map(f => (
                            <button key={f.id} onClick={() => setHabitCardFilter(f.id)}
                                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex-1 md:flex-none"
                                style={{ background: habitCardFilter === f.id ? C.teal : 'transparent', color: habitCardFilter === f.id ? '#fff' : C.textMuted }}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile search overlay */}
            {showSearchOverlay && (
                <div className="fixed inset-0 z-[300] md:hidden animate-fade-in" style={{ background: 'rgba(27,46,75,0.3)', backdropFilter: 'blur(8px)' }}
                    onClick={() => setShowSearchOverlay(false)}>
                    <div className="pt-[env(safe-area-inset-top)] px-4 mt-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2 p-2 rounded-2xl" style={{ background: C.bgCard, boxShadow: C.dropShadow }}>
                            <Icons.Search size={18} className="ml-2 shrink-0" style={{ color: C.textMuted }} />
                            <input type="text" placeholder="搜索习惯名称..." value={searchKidHabitKeyword}
                                onChange={e => setSearchKidHabitKeyword(e.target.value)}
                                autoFocus
                                className="flex-1 text-sm font-bold py-2.5 focus:outline-none border-none bg-transparent"
                                style={{ color: C.textPrimary, caretColor: C.teal }}
                            />
                            <button onClick={() => { setSearchKidHabitKeyword(''); setShowSearchOverlay(false); }}
                                className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold"
                                style={{ color: C.teal }}>取消</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Habit Cards ═══ */}
            <div className="px-4 mb-6">
                {filteredHabits.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl" style={{ background: C.bgCard }}>
                        <div className="text-5xl mb-4">🌱</div>
                        <div className="text-lg font-black" style={{ color: C.textPrimary }}>没有找到该习惯哦</div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {filteredHabits.map(t => {
                            const isNegative = t.reward < 0;
                            const entry = t.kidId === 'all' ? t.history?.[selectedDate]?.[activeKidId] : t.history?.[selectedDate];
                            const count = Array.isArray(entry) ? entry.length : (entry?.count || (entry?.status === 'completed' ? 1 : 0));
                            let currentLimitCount = count;
                            if (t.habitType === 'multiple' && t.periodMaxType === 'weekly') currentLimitCount = getWeeklyCompletionCount(t, activeKidId, selectedDate);
                            const maxPerDay = t.periodMaxPerDay || t.maxPerDay || 1;
                            const isDailyOnce = t.habitType === 'daily_once';
                            const isMaxedOut = t.habitType === 'multiple' && currentLimitCount >= maxPerDay;
                            const isDone = (isDailyOnce && count >= 1) || isMaxedOut;

                            const accentColor = isNegative ? C.coral : C.teal;
                            const displayMax = isDailyOnce ? 1 : maxPerDay;
                            const displayCount = isDailyOnce ? (count >= 1 ? 1 : 0) : currentLimitCount;

                            return (
                                <div key={t.id}
                                    className="flex items-center gap-3 rounded-xl p-3 transition-all hover:shadow-md relative overflow-hidden"
                                    style={{
                                        background: isDone ? (isNegative ? `${C.coral}08` : `${C.teal}08`) : C.bgCard,
                                        border: `1px solid ${isDone ? (isNegative ? `${C.coral}25` : `${C.teal}25`) : C.bgLight}`,
                                    }}>
                                    {/* Left accent bar */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: accentColor }}></div>

                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${isNegative ? '' : `bg-gradient-to-br ${t.habitColor || 'from-emerald-400 to-teal-500'}`}`}
                                        style={isNegative ? { background: `${C.coral}18`, color: C.coral } : { color: '#fff' }}>
                                        {renderHabitIcon(t.iconEmoji, null, 20) || renderIcon(t.iconName, 20)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="font-bold text-sm truncate" style={{
                                                color: isDone ? (isNegative ? '#6B7280' : C.textSoft) : C.textPrimary,
                                                textDecoration: isDone && !isNegative ? 'line-through' : 'none',
                                            }}>{t.title}</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 items-center">
                                            <span className="text-[10px] font-bold px-1.5 py-px rounded"
                                                style={{ background: `${accentColor}12`, color: accentColor }}>
                                                {isNegative ? `扣${Math.abs(t.reward)}` : `+${t.reward}`}
                                            </span>
                                            {/* Progress dots or bar */}
                                            {(() => {
                                                const useProgressBar = displayMax > 7 || (t.habitType === 'multiple' && t.periodMaxType === 'weekly');
                                                if (useProgressBar) {
                                                    const label = t.periodMaxType === 'weekly' ? '周' : '日';
                                                    return (
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: C.bgLight }}>
                                                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (displayCount / displayMax) * 100)}%`, background: accentColor }}></div>
                                                            </div>
                                                            <span className="text-[9px] font-bold" style={{ color: C.textMuted }}>{displayCount}/{displayMax}{label}</span>
                                                        </div>
                                                    );
                                                } else if (displayMax > 1) {
                                                    return (
                                                        <div className="flex gap-0.5 items-center">
                                                            {Array.from({ length: displayMax }).map((_, i) => (
                                                                <div key={i} className="w-2 h-2 rounded-full transition-all" style={{
                                                                    background: i < displayCount ? accentColor : C.bgLight,
                                                                    boxShadow: i < displayCount ? `0 0 6px ${accentColor}60` : 'none',
                                                                }} />
                                                            ))}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                            {isDone && (
                                                <span className="text-[10px] font-bold flex items-center gap-0.5" style={{ color: isNegative ? C.coral : C.green }}>
                                                    <Icons.CheckCircle size={10} /> {isNegative ? '已达上限' : '已达标'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <div className="shrink-0">
                                        {isDone ? (
                                            <div className="w-9 h-9 rounded-full flex items-center justify-center"
                                                style={{ background: isNegative ? `${C.coral}15` : `${C.green}15` }}>
                                                {isNegative ? <Icons.ShieldAlert size={16} style={{ color: C.coral }} /> : <Icons.CheckCircle size={16} style={{ color: C.green }} />}
                                            </div>
                                        ) : (
                                            <button onClick={() => handleAttemptSubmit(t)}
                                                className="rounded-full py-1.5 px-4 text-xs font-black text-white transition-all active:scale-95 flex items-center gap-1"
                                                style={{ background: isNegative ? C.coral : C.teal, boxShadow: `0 4px 12px ${isNegative ? C.coral : C.teal}40` }}>
                                                {isNegative ? <><Icons.ShieldAlert size={12} /> 坦白</> : <><Icons.Zap size={12} /> 打卡</>}
                                                {count > 0 && <span className="text-[9px] opacity-80">({count})</span>}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ═══ Detail Modal (Good/Bad habit check-in history) ═══ */}
            {detailModalType && (() => {
                const isGood = detailModalType === 'good';
                const accent = isGood ? C.teal : C.coral;
                const modalHabits = isGood ? goodHabits : badHabits;
                const icon = isGood ? <Icons.TrendingUp size={20} /> : <Icons.TrendingDown size={20} />;
                const title = isGood ? '好习惯打卡明细' : '坏习惯记录明细';

                // Build check-in entries for today
                const entries = [];
                modalHabits.forEach(t => {
                    const entry = t.kidId === 'all' ? t.history?.[selectedDate]?.[activeKidId] : t.history?.[selectedDate];
                    if (!entry) return;
                    const records = Array.isArray(entry) ? entry : (entry.status ? [entry] : []);
                    records.forEach((rec, idx) => {
                        if (rec.status === 'completed' || rec.status === 'pending_approval') {
                            entries.push({ task: t, record: rec, recordIndex: idx, totalRecords: records.length });
                        }
                    });
                });

                const handleUndoCheckIn = async (task, recordIndex) => {
                    if (!window.confirm(`确定要撤销「${task.title}」的这次打卡吗？\n\n已获得/扣除的金币和经验会一并返还。`)) return;
                    try {
                        let newHistory = JSON.parse(JSON.stringify(task.history || {}));
                        if (task.kidId === 'all') {
                            let arr = newHistory[selectedDate]?.[activeKidId];
                            if (Array.isArray(arr)) { arr.splice(recordIndex, 1); if (arr.length === 0) delete newHistory[selectedDate][activeKidId]; }
                            else if (arr) delete newHistory[selectedDate][activeKidId];
                        } else {
                            let arr = newHistory[selectedDate];
                            if (Array.isArray(arr)) { arr.splice(recordIndex, 1); if (arr.length === 0) delete newHistory[selectedDate]; }
                            else if (arr) delete newHistory[selectedDate];
                        }
                        // Reverse coin + exp
                        const reward = task.reward || 0;
                        const expDiff = Math.ceil(Math.abs(reward) * 1.5);
                        const kids = dataC.kids;
                        const targetKid = kids.find(k => k.id === activeKidId);
                        if (targetKid && reward !== 0) {
                            const newBals = { ...targetKid.balances, spend: Math.max(0, targetKid.balances.spend - reward) };
                            const newExp = Math.max(0, targetKid.exp - (reward > 0 ? expDiff : -expDiff));
                            dataC.setKids(kids.map(k => k.id === activeKidId ? { ...k, balances: newBals, exp: newExp } : k));
                            apiFetch(`/api/kids/${activeKidId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ exp: newExp, balances: newBals }) }).catch(console.error);
                        }
                        dataC.setTasks(tasks.map(t => t.id === task.id ? { ...t, history: newHistory } : t));
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
                            {/* Header */}
                            <div className="shrink-0 p-5 flex items-center justify-between" style={{ background: C.bgCard, borderBottom: `1px solid ${C.bgLight}` }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}18`, color: accent }}>
                                        {icon}
                                    </div>
                                    <div>
                                        <h2 className="font-black text-base" style={{ color: C.textPrimary }}>{title}</h2>
                                        <div className="text-[11px] font-bold mt-0.5" style={{ color: C.textMuted }}>{selectedDate} · {entries.length} 条记录</div>
                                    </div>
                                </div>
                                <button onClick={() => setDetailModalType(null)}
                                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                                    style={{ background: C.bgLight, color: C.textMuted }}>
                                    <Icons.X size={18} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {entries.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="text-4xl mb-3">{isGood ? '🌟' : '🛡️'}</div>
                                        <div className="font-black text-base" style={{ color: C.textPrimary }}>
                                            {isGood ? '今天还没有打卡哦' : '今天没有坏习惯记录'}
                                        </div>
                                        <div className="text-xs font-bold mt-1" style={{ color: C.textMuted }}>
                                            {isGood ? '快去养成好习惯吧！' : '继续保持！'}
                                        </div>
                                    </div>
                                ) : (
                                    entries.map((e, idx) => (
                                        <div key={`${e.task.id}-${e.recordIndex}-${idx}`}
                                            className="flex items-center gap-3 p-3.5 rounded-xl transition-all"
                                            style={{ background: C.bgCard, border: `1px solid ${C.bgLight}` }}>
                                            {/* Icon */}
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-base ${!isGood ? '' : `bg-gradient-to-br ${e.task.habitColor || 'from-emerald-400 to-teal-500'}`}`}
                                                style={!isGood ? { background: `${C.coral}15`, color: C.coral } : { color: '#fff' }}>
                                                {renderHabitIcon(e.task.iconEmoji, '✨', 16)}
                                            </div>
                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm truncate" style={{ color: C.textPrimary }}>{e.task.title}</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold px-1.5 py-px rounded"
                                                        style={{ background: `${accent}12`, color: accent }}>
                                                        {isGood ? `+${e.task.reward}` : `-${Math.abs(e.task.reward)}`}
                                                    </span>
                                                    {e.record.attemptId && (
                                                        <span className="text-[9px] font-bold" style={{ color: C.textMuted }}>
                                                            #{e.recordIndex + 1}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Undo button */}
                                            <button onClick={() => handleUndoCheckIn(e.task, e.recordIndex)}
                                                className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-[11px] font-bold transition-all active:scale-95"
                                                style={{ background: `${C.coral}12`, color: C.coral }}>
                                                <Icons.RefreshCw size={12} /> 撤销
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer summary */}
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
