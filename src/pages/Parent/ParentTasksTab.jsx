import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDataContext } from '../../context/DataContext.jsx';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { useTaskManager } from '../../hooks/useTaskManager';
import { Icons, AvatarDisplay, renderIcon } from '../../utils/Icons';
import { isTaskDueOnDate } from '../../utils/taskUtils';
import { getCategoryGradient, getIconForCategory } from '../../utils/categoryUtils';
import { getWeekNumber, getDisplayDateArray, formatDate } from '../../utils/dateUtils';
import useOnClickOutside from '../../hooks/useOnClickOutside';
import { ReorderableList } from '../../components/common/ReorderableList';

export const ParentTasksTab = () => {
    const authC = useAuthContext();
    const dataC = useDataContext();
    const uiC = useUIContext();
    
    const { kids, tasks, setTasks, activeKidId, setActiveKidId } = dataC;
    const {
        selectedDate, setSelectedDate,
        setShowAddPlanModal, setShowAiTaskCreator,
        setEditingTask, setPlanType, setPlanForm,
        setPreviewTask, setShowPreviewModal,
        setDeleteConfirmTask, setShowCalendarModal,
        lastSavedEndTime, apiFetch,
        parentKidFilter, setParentKidFilter,
        currentViewDate, setCurrentViewDate
    } = uiC;

    const {
        handleApproveAllTasks, getIncompleteStudyTasksCount,
        getTaskStatusOnDate, openQuickComplete
    } = useTaskManager(authC, dataC, uiC);

    // Parent-side kid picker for completing "all kids" tasks
    const [kidPickerTask, setKidPickerTask] = useState(null);

    const [parentTaskFilter, setParentTaskFilter] = useState([]);
    const [parentTaskStatusFilter, setParentTaskStatusFilter] = useState('all');
    const [parentTaskSort, setParentTaskSort] = useState('default');

    const [showReorderModal, setShowReorderModal] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');

    const parentFilterRef = useRef(null);
    const parentSortRef = useRef(null);
    const calendarSentinelRef = useRef(null);
    const [showCompactCalendar, setShowCompactCalendar] = useState(false);

    useOnClickOutside(parentFilterRef, () => setShowFilterDropdown(false));
    useOnClickOutside(parentSortRef, () => setShowSortDropdown(false));

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

    const getDefaultTimeRange = () => {
        if (!lastSavedEndTime) return { start: "17:00", end: "18:00" };
        const [h, m] = lastSavedEndTime.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return { start: "17:00", end: "18:00" };
        const endH = (h + 1) % 24;
        return {
            start: lastSavedEndTime,
            end: `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        };
    };

    const effectiveFilter = parentKidFilter;
    let parentTasks = tasks.filter(t => t.type === 'study' && isTaskDueOnDate(t, selectedDate));
    if (effectiveFilter !== 'all') {
        parentTasks = parentTasks.filter(t => t.kidId === effectiveFilter || t.kidId === 'all');
    }

    const availableCategories = Array.from(new Set(tasks.filter(t => t.type === 'study' && isTaskDueOnDate(t, selectedDate) && (effectiveFilter === 'all' || t.kidId === effectiveFilter || t.kidId === 'all')).map(t => t.category || '计划'))).filter(Boolean);

    const getDailyStatus = (t) => {
        if (t.kidId === 'all' && effectiveFilter === 'all') {
            let statuses = kids.map(k => getTaskStatusOnDate(t, selectedDate, k.id));
            if (statuses.length === 0) return 'todo';
            if (statuses.every(s => s === 'skipped')) return 'skipped';
            if (statuses.includes('pending_approval')) return 'pending_approval';
            if (statuses.includes('failed')) return 'failed';
            if (statuses.includes('in_progress')) return 'in_progress';
            if (statuses.includes('todo')) return 'todo';
            return 'completed';
        } else {
            let queryKidId = effectiveFilter === 'all' ? t.kidId : effectiveFilter;
            return getTaskStatusOnDate(t, selectedDate, queryKidId);
        }
    };

    if (parentTaskFilter.length > 0) {
        parentTasks = parentTasks.filter(t => parentTaskFilter.includes(t.category || '计划'));
    }

    // Filter out skipped tasks
    parentTasks = parentTasks.filter(t => getDailyStatus(t) !== 'skipped');

    if (parentTaskStatusFilter !== 'all') {
        parentTasks = parentTasks.filter(t => {
            const st = getDailyStatus(t);
            if (parentTaskStatusFilter === 'completed') return st === 'completed';
            if (parentTaskStatusFilter === 'pending') return st === 'pending_approval';
            if (parentTaskStatusFilter === 'incomplete') return st === 'todo' || st === 'in_progress' || st === 'failed';
            return true;
        });
    }

    parentTasks.sort((a, b) => {
        if (showReorderModal) return (a.order || 0) - (b.order || 0);

        if (parentTaskSort === 'time_asc') {
            const getMins = t => t.timeStr && t.timeStr.includes('分钟') ? parseInt(t.timeStr) : 999;
            return getMins(a) - getMins(b);
        }
        if (parentTaskSort === 'category') return (a.category || '').localeCompare(b.category || '');
        if (parentTaskSort === 'status') {
            const statusWeight = { completed: 3, skipped: 3, pending_approval: 2, in_progress: 1, failed: 0, todo: 0 };
            return statusWeight[getDailyStatus(a)] - statusWeight[getDailyStatus(b)];
        }
        if (parentTaskSort === 'created_desc') return (b.createdAt || '').localeCompare(a.createdAt || '');
        if (parentTaskSort === 'reward_desc') return (b.reward || 0) - (a.reward || 0);
        return (a.order || 0) - (b.order || 0);
    });

    const handleParentReorderTask = (sourceIndex, targetIndex) => {
        if (sourceIndex === targetIndex || targetIndex < 0 || targetIndex >= parentTasks.length) return;
        const updatedSubList = [...parentTasks];
        const [removed] = updatedSubList.splice(sourceIndex, 1);
        updatedSubList.splice(targetIndex, 0, removed);

        // Build a map of id -> new order
        const orderMap = {};
        updatedSubList.forEach((task, idx) => { orderMap[task.id] = idx; });

        // Immutable state update with new object references
        setTasks(prev => prev.map(t =>
            orderMap[t.id] !== undefined ? { ...t, order: orderMap[t.id] } : t
        ));

        // Persist to server
        updatedSubList.forEach((task, idx) => {
            apiFetch(`/api/tasks/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: idx }) }).catch(console.error);
        });
    };

    const pendingApprovals = tasks.flatMap(t => {
        if (t.type !== 'study') return [];
        const historyObj = typeof t.history === 'string' ? JSON.parse(t.history || '{}') : (t.history || {});

        const approvals = [];
        Object.entries(historyObj).forEach(([date, hr]) => {
            if (t.kidId === 'all') {
                Object.entries(hr || {}).forEach(([kId, kResult]) => {
                    if (parentKidFilter !== 'all' && kId !== parentKidFilter) return;
                    if (kId !== 'status' && kResult?.status === 'pending_approval') {
                        approvals.push({ task: t, date, record: kResult, actualKidId: kId });
                    }
                });
            } else {
                if (parentKidFilter !== 'all' && t.kidId !== parentKidFilter) return;
                if (hr?.status === 'pending_approval') {
                    approvals.push({ task: t, date, record: hr, actualKidId: t.kidId });
                }
            }
        });
        return approvals;
    });

    // Theme constants — same as KidStudyTab
    const C = {
        bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
        orange: '#FF8C42', orangeHot: '#FF6B1A', yellow: '#FFD93D', teal: '#4ECDC4',
        coral: '#FF6B6B', blue: '#6C9CFF', textPrimary: '#1B2E4B', textSoft: '#5A6E8A',
        textMuted: '#9CAABE', cardShadow: '0 2px 12px rgba(27,46,75,0.06)',
        dropShadow: '0 20px 50px rgba(27,46,75,0.12)',
    };

    // Category hex colors — synced with KidStudyTab catColors
    const catHexMap = {
        '语文': '#F43F5E', '数学': '#6366F1', '英语': '#0EA5E9', '物理': '#F59E0B',
        '化学': '#D946EF', '生物': '#10B981', '历史': '#78716C', '地理': '#14B8A6',
        '政治': '#EF4444', '道德与法治': '#3B82F6', '信息技术': '#06B6D4', '体育运动': '#F97316',
        '娱乐': '#EAB308', '兴趣班': '#EC4899', '其他': '#64748B', '计划': '#FF8C42',
    };
    const getCatHex = (cat) => catHexMap[cat] || catHexMap['计划'];

    const completedCount = parentTasks.filter(t => getDailyStatus(t) === 'completed').length;
    const totalCount = parentTasks.length;
    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="animate-fade-in -mx-4 md:-mx-8 px-0 pb-10" style={{ background: C.bg, minHeight: '100vh' }}>
          <div className="max-w-5xl mx-auto">

            {/* ═══ Compact Sticky Calendar (portal) ═══ */}
            {createPortal(
                <div className={`fixed top-0 left-0 right-0 z-[9998] sm:hidden transition-all duration-300 ${showCompactCalendar ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
                    <div style={{ background: '#FBF7F0ee', backdropFilter: 'blur(20px)', borderBottom: '1px solid #F0EBE1', paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }} className="px-3 py-2">
                        <div className="flex items-center gap-1">
                            {getDisplayDateArray(currentViewDate).map((day, i) => {
                                const isSel = selectedDate === day.dateStr;
                                const isToday = day.dateStr === formatDate(new Date());
                                const { count, total } = getIncompleteStudyTasksCount(day.dateStr);
                                return (
                                    <button key={i} onClick={() => setSelectedDate(day.dateStr)}
                                        className="flex-1 flex flex-col items-center py-1.5 rounded-2xl transition-all"
                                        style={isSel ? { background: C.orange, boxShadow: `0 4px 14px ${C.orange}60` } : {}}
                                    >
                                        <span className="text-[9px] font-bold" style={{ color: isSel ? '#fff9' : C.textMuted }}>{day.d}</span>
                                        <span className="text-sm font-black leading-tight" style={{ color: isSel ? '#fff' : (isToday ? C.orange : C.textSoft) }}>{day.displayDate.split('/')[1]}</span>
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

            {/* ═══ Hero Section with Orange Blob ═══ */}
            <div className="relative overflow-hidden pb-4 px-4">
                <div className="absolute -top-32 -left-20 w-56 h-56 rounded-full opacity-15" style={{ background: C.orange }}></div>
                <div className="absolute -top-20 -left-12 w-40 h-40 rounded-full opacity-10" style={{ background: C.yellow }}></div>

                {/* Month + Week */}
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
                            style={{ background: C.orange, color: '#fff', boxShadow: `0 4px 14px ${C.orange}50` }}>
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
                        const { count, total } = getIncompleteStudyTasksCount(day.dateStr);
                        const isSel = selectedDate === day.dateStr;
                        const isToday = day.dateStr === formatDate(new Date());
                        return (
                            <button key={i} onClick={() => setSelectedDate(day.dateStr)}
                                className="flex flex-col items-center py-3 md:py-4 rounded-2xl transition-all duration-200"
                                style={isSel ? {
                                    background: C.orange,
                                    boxShadow: `0 8px 24px ${C.orange}50`,
                                    transform: 'translateY(-2px)'
                                } : {
                                    background: isToday ? C.bgLight : C.bgCard,
                                }}
                            >
                                <span className="text-[9px] md:text-[10px] font-bold mb-1" style={{ color: isSel ? '#fff9' : C.textMuted }}>{day.d}</span>
                                <span className="text-lg md:text-xl font-black" style={{ color: isSel ? '#fff' : (isToday ? C.orange : C.textPrimary) }}>{day.displayDate.split('/')[1]}</span>
                                <div className="mt-1.5 h-3 flex items-center justify-center">
                                    {count > 0 ? (
                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: isSel ? '#fff3' : `${C.coral}30`, color: isSel ? '#fff' : C.coral }}>{count}</span>
                                    ) : total > 0 ? (
                                        <Icons.Check size={11} style={{ color: isSel ? '#fffc' : C.teal }} />
                                    ) : (
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: isSel ? '#fff4' : (isToday ? C.orange : 'transparent') }}></div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ═══ Kid Filter Bar (hidden when only one kid) ═══ */}
            {kids.length > 1 && (
                <div className="flex overflow-x-auto hide-scrollbar gap-4 sm:gap-5 mb-4 py-3 px-4 items-center">
                    <button onClick={() => setParentKidFilter('all')}
                        className="shrink-0 flex flex-col items-center gap-1.5 transition-transform"
                    >
                        <div className={`p-[3px] rounded-full transition-all duration-300`} style={{ background: parentKidFilter === 'all' ? C.orange : 'transparent' }}>
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl ring-2 ring-white"
                                style={{ background: C.bgLight }}>
                                👥
                            </div>
                        </div>
                        <span className="text-[10px] sm:text-xs font-black tracking-wide" style={{ color: parentKidFilter === 'all' ? C.orange : C.textMuted }}>全部</span>
                    </button>
                    {kids.map(k => (
                        <button key={k.id} onClick={() => setParentKidFilter(k.id)}
                            className="shrink-0 flex flex-col items-center gap-1.5 transition-transform"
                        >
                            <div className={`p-[3px] rounded-full transition-all duration-300`} style={{ background: parentKidFilter === k.id ? C.orange : 'transparent' }}>
                                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl overflow-hidden ring-2 ring-white" style={{ background: C.bgLight }}>
                                    <AvatarDisplay avatar={k.avatar} />
                                </div>
                            </div>
                            <span className="text-[10px] sm:text-xs font-black tracking-wide" style={{ color: parentKidFilter === k.id ? C.orange : C.textMuted }}>{k.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* ═══ Progress + Toolbar ═══ */}
            <div className="px-4 mb-4">
                {totalCount > 0 && (
                    <div className="rounded-2xl mb-4" style={{ background: C.bgCard }}>
                        {/* Row 1: Progress circle + text */}
                        <div className="p-4 flex items-center gap-4">
                            <div className="relative w-12 h-12 shrink-0">
                                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                                    <circle cx="24" cy="24" r="20" fill="none" stroke={C.bgLight} strokeWidth="4" />
                                    <circle cx="24" cy="24" r="20" fill="none" stroke={C.orange} strokeWidth="4" strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 20}`} strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPct / 100)}`}
                                        className="transition-all duration-700" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black" style={{ color: C.textPrimary }}>{progressPct}%</div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-black flex items-center gap-1.5" style={{ color: progressPct === 100 ? '#10B981' : C.textPrimary }}>
                                    今日进度 {progressPct === 100 && <span className="text-xs px-1.5 py-0.5 rounded-full font-black" style={{ background: '#D1FAE5', color: '#059669' }}>✓ 全部完成</span>}
                                </div>
                                <div className="text-xs mt-0.5" style={{ color: C.textSoft }}>已完成 {completedCount} / {totalCount} 个任务</div>
                            </div>
                        </div>
                        {/* Row 2: Action buttons */}
                        <div className="flex items-center gap-2 px-4 pb-4">
                            <button onClick={() => setShowAiTaskCreator(true)}
                                className="flex-1 rounded-xl py-2.5 text-xs font-black text-white transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 14px rgba(102,126,234,0.3)' }}>
                                ✨ AI 智能生成
                            </button>
                            <button onClick={() => {
                                const defaultTimes = getDefaultTimeRange();
                                setEditingTask(null);
                                setPlanType('study');
                                setPlanForm({ targetKids: parentKidFilter === 'all' ? ['all'] : [parentKidFilter], category: '语文', iconName: getIconForCategory('语文'), title: '', desc: '', startDate: new Date().toISOString().split('T')[0], endDate: '', repeatType: 'today', weeklyDays: [1, 2, 3, 4, 5], ebbStrength: 'normal', periodDaysType: 'any', periodCustomDays: [1, 2, 3, 4, 5], periodTargetCount: 1, periodMaxPerDay: 1, periodMaxType: 'daily', timeSetting: 'range', startTime: defaultTimes.start, endTime: defaultTimes.end, durationPreset: 25, pointRule: 'default', reward: '', iconEmoji: '📚', habitColor: 'from-blue-400 to-blue-500', habitType: 'daily_once', attachments: [] });
                                setShowAddPlanModal(true);
                            }} className="flex-1 rounded-xl py-2.5 text-xs font-black text-white transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                style={{ background: C.orange, boxShadow: `0 4px 14px ${C.orange}50` }}>
                                <Icons.Plus size={14} /> 新建任务
                            </button>
                        </div>
                    </div>
                )}
                {totalCount === 0 && (
                    <div className="rounded-2xl mb-4" style={{ background: C.bgCard }}>
                        <div className="p-4 flex items-center gap-4">
                            <div className="text-sm font-black" style={{ color: C.textSoft }}>今日暂无任务</div>
                        </div>
                        <div className="flex items-center gap-2 px-4 pb-4">
                            <button onClick={() => setShowAiTaskCreator(true)}
                                className="flex-1 rounded-xl py-2.5 text-xs font-black text-white transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 14px rgba(102,126,234,0.3)' }}>
                                ✨ AI 智能生成
                            </button>
                            <button onClick={() => {
                                const defaultTimes = getDefaultTimeRange();
                                setEditingTask(null);
                                setPlanType('study');
                                setPlanForm({ targetKids: parentKidFilter === 'all' ? ['all'] : [parentKidFilter], category: '语文', iconName: getIconForCategory('语文'), title: '', desc: '', startDate: new Date().toISOString().split('T')[0], endDate: '', repeatType: 'today', weeklyDays: [1, 2, 3, 4, 5], ebbStrength: 'normal', periodDaysType: 'any', periodCustomDays: [1, 2, 3, 4, 5], periodTargetCount: 1, periodMaxPerDay: 1, periodMaxType: 'daily', timeSetting: 'range', startTime: defaultTimes.start, endTime: defaultTimes.end, durationPreset: 25, pointRule: 'default', reward: '', iconEmoji: '📚', habitColor: 'from-blue-400 to-blue-500', habitType: 'daily_once', attachments: [] });
                                setShowAddPlanModal(true);
                            }} className="flex-1 rounded-xl py-2.5 text-xs font-black text-white transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                style={{ background: C.orange, boxShadow: `0 4px 14px ${C.orange}50` }}>
                                <Icons.Plus size={14} /> 新建任务
                            </button>
                        </div>
                    </div>
                )}

                {/* Toolbar: search + filter + sort + reorder */}
                <div className="flex items-center gap-2 relative z-20" ref={parentFilterRef}>
                    <div className="relative flex-1 min-w-0">
                        <Icons.Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textMuted }} />
                        <input type="text" placeholder="搜索任务..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}
                            className="w-full text-sm font-bold rounded-xl pl-9 pr-8 py-2.5 focus:outline-none transition-all placeholder:font-normal border-none"
                            style={{ background: C.bgCard, color: C.textPrimary, caretColor: C.orange }}
                        />
                        {searchKeyword && (
                            <button onClick={() => setSearchKeyword('')} className="absolute inset-y-0 right-0 pr-3 flex items-center" style={{ color: C.textMuted }}><Icons.X size={14} /></button>
                        )}
                    </div>
                    {/* Filter */}
                    <div className="relative">
                        <button onClick={() => { setShowFilterDropdown(!showFilterDropdown); setShowSortDropdown(false); }}
                            className="w-10 h-10 sm:w-auto sm:h-auto sm:px-3.5 sm:py-2.5 rounded-xl flex items-center justify-center transition-all"
                            style={{ background: showFilterDropdown || parentTaskFilter.length > 0 || parentTaskStatusFilter !== 'all' ? C.orange : C.bgCard, color: showFilterDropdown || parentTaskFilter.length > 0 || parentTaskStatusFilter !== 'all' ? '#fff' : C.textSoft }}>
                            <Icons.Filter size={16} />
                            <span className="hidden sm:inline ml-1.5 text-sm font-bold">筛选</span>
                        </button>
                        {showFilterDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-56 rounded-2xl py-3 z-50 animate-fade-in" style={{ background: C.bgCard, boxShadow: C.dropShadow }}>
                                <div className="px-4 pb-2 mb-2 text-[10px] font-black uppercase tracking-widest" style={{ color: C.textMuted, borderBottom: `1px solid ${C.bgLight}` }}>任务状态</div>
                                <div className="flex gap-1.5 px-3 mb-3">
                                    {[['all','全部'],['incomplete','未完成'],['pending','待审核'],['completed','已完成']].map(([id,l]) => (
                                        <button key={id} onClick={() => setParentTaskStatusFilter(id)} className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                                            style={{ background: parentTaskStatusFilter === id ? C.orange : C.bgLight, color: parentTaskStatusFilter === id ? '#fff' : C.textSoft }}>{l}</button>
                                    ))}
                                </div>
                                <div className="px-4 pb-2 mb-2 text-[10px] font-black uppercase tracking-widest flex justify-between items-center" style={{ color: C.textMuted, borderBottom: `1px solid ${C.bgLight}` }}>
                                    <span>科目 ({availableCategories.length})</span>
                                    {parentTaskFilter.length > 0 && <button onClick={() => setParentTaskFilter([])} className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ background: `${C.orange}30`, color: C.orange }}>清除</button>}
                                </div>
                                <div className="max-h-48 overflow-y-auto px-2 space-y-0.5">
                                    {availableCategories.map(cat => (
                                        <label key={cat} className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors w-full hover:bg-slate-50">
                                            <div className="w-3 h-3 rounded-sm border-2 flex items-center justify-center"
                                                style={{ borderColor: parentTaskFilter.includes(cat) ? C.orange : C.textMuted, background: parentTaskFilter.includes(cat) ? C.orange : 'transparent' }}
                                                onClick={(e) => { e.preventDefault(); if (parentTaskFilter.includes(cat)) setParentTaskFilter(parentTaskFilter.filter(c => c !== cat)); else setParentTaskFilter([...parentTaskFilter, cat]); }}>
                                                {parentTaskFilter.includes(cat) && <Icons.Check size={8} style={{ color: '#fff' }} />}
                                            </div>
                                            <span className="text-sm font-bold flex-1 truncate" style={{ color: C.textPrimary }}>{cat}</span>
                                            <div className="w-3 h-3 rounded-full" style={{ background: getCatHex(cat) }}></div>
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-2 pt-2 px-3 flex gap-2" style={{ borderTop: `1px solid ${C.bgLight}` }}>
                                    <button onClick={() => { setParentTaskFilter([]); setParentTaskStatusFilter('all'); }} className="flex-1 py-2 rounded-lg text-xs font-bold transition-colors" style={{ color: C.textSoft }}>重置</button>
                                    <button onClick={() => setShowFilterDropdown(false)} className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition-colors" style={{ background: C.orange }}>完成</button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Sort */}
                    <div className="relative" ref={parentSortRef}>
                        <button onClick={() => { setShowSortDropdown(!showSortDropdown); setShowFilterDropdown(false); }}
                            className="w-10 h-10 sm:w-auto sm:h-auto sm:px-3.5 sm:py-2.5 rounded-xl flex items-center justify-center transition-all"
                            style={{ background: showSortDropdown || parentTaskSort !== 'default' ? C.orange : C.bgCard, color: showSortDropdown || parentTaskSort !== 'default' ? '#fff' : C.textSoft }}>
                            <Icons.SortAsc size={16} />
                            <span className="hidden sm:inline ml-1.5 text-sm font-bold">排序</span>
                        </button>
                        {showSortDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-44 rounded-2xl py-2 z-50 animate-fade-in" style={{ background: C.bgCard, boxShadow: C.dropShadow }}>
                                {[
                                    { id: 'default', label: '默认顺序' },
                                    { id: 'time_asc', label: '最快完成的' },
                                    { id: 'category', label: '按科目分类' },
                                    { id: 'status', label: '按完成状态' },
                                    { id: 'created_desc', label: '最新添加的' },
                                    { id: 'reward_desc', label: '奖励最多的' },
                                ].map(o => (
                                    <button key={o.id} onClick={() => { setParentTaskSort(o.id); setShowSortDropdown(false); }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-2.5 transition-colors"
                                        style={{ color: parentTaskSort === o.id ? C.orange : C.textSoft, background: parentTaskSort === o.id ? `${C.orange}15` : 'transparent' }}>
                                        {o.label}
                                        {parentTaskSort === o.id && <Icons.Check size={13} className="ml-auto" style={{ color: C.orange }} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Reorder */}
                    <button onClick={() => setShowReorderModal(true)}
                        className="w-10 h-10 sm:w-auto sm:h-auto sm:px-3.5 sm:py-2.5 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: C.bgCard, color: C.textSoft }}>
                        <Icons.List size={16} />
                        <span className="hidden sm:inline ml-1.5 text-sm font-bold">排序</span>
                    </button>
                </div>
            </div>

            {/* ═══ Pending Approvals Banner ═══ */}
            {pendingApprovals.length > 0 && (
                <div className="px-4 mb-4">
                    <div className="rounded-2xl p-4" style={{ background: '#FFF8EE', border: '1px solid #FED7AA' }}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-black text-sm flex items-center gap-2" style={{ color: '#EA580C' }}>
                                <Icons.Bell size={16} /> 待审核
                                <span className="text-white text-[10px] px-2 py-0.5 rounded-full" style={{ background: C.orange }}>{pendingApprovals.length}</span>
                            </h3>
                            <button onClick={() => handleApproveAllTasks(pendingApprovals)}
                                className="text-[11px] font-black px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                                style={{ background: `${C.orange}20`, color: C.orange }}>
                                <Icons.CheckCircle size={12} /> 一键通过
                            </button>
                        </div>
                        <div className="space-y-2">
                            {pendingApprovals.map(({ task: t, date, actualKidId }) => {
                                const kidInfo = kids.find(k => k.id === actualKidId);
                                return (
                                    <div key={`${t.id}-${date}-${actualKidId}`}
                                        onClick={() => { setSelectedDate(date); setPreviewTask({ ...t, _previewKidId: actualKidId }); setShowPreviewModal(true); }}
                                        className="flex items-center gap-3 rounded-xl p-3 cursor-pointer hover:shadow-sm transition-all"
                                        style={{ background: '#fff' }}>
                                        <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-white"
                                            style={{ background: getCatHex(t.category || '计划') }}>
                                            {renderIcon(t.iconName || getIconForCategory(t.category), 16)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm truncate" style={{ color: C.textPrimary }}>{t.title}</div>
                                            <div className="text-[10px] flex items-center gap-1.5" style={{ color: C.textMuted }}>
                                                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full overflow-hidden"><AvatarDisplay avatar={kidInfo?.avatar} /></div>{kidInfo?.name}</span>
                                                <span>· {date}</span>
                                            </div>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedDate(date); setPreviewTask({ ...t, _previewKidId: actualKidId }); setShowPreviewModal(true); }}
                                            className="rounded-full py-1.5 px-3 text-[11px] font-black text-white flex items-center gap-1 shrink-0 active:scale-95 transition-all"
                                            style={{ background: '#10B981' }}>
                                            <Icons.Check size={10} strokeWidth={3} /> 审核
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Task Cards ═══ */}
            <div className="flex flex-col gap-2 px-4 pb-10">
                {parentTasks.length === 0 && (
                    <div className="text-center py-16 rounded-2xl" style={{ background: C.bgCard }}>
                        <div className="text-5xl mb-4">☀️</div>
                        <div className="text-sm font-black" style={{ color: C.textPrimary }}>这里还空空的，去布置些任务吧～</div>
                    </div>
                )}

                {parentTasks.filter(t => !searchKeyword || t.title.toLowerCase().includes(searchKeyword.toLowerCase())).map((t, index) => {
                    let displayKidId = t.kidId;
                    if (t.kidId === 'all') displayKidId = effectiveFilter === 'all' ? 'all' : effectiveFilter;

                    const kidInfo = displayKidId === 'all' ? (kids.length === 1 ? kids[0] : { name: '全部孩子', avatar: '👥' }) : kids.find(k => k.id === displayKidId);
                    const status = getDailyStatus(t);
                    const isCompleted = status === 'completed';
                    const isPending = status === 'pending_approval';

                    // Use the outer catHexMap (synced with KidStudyTab)
                    const accentColor = getCatHex(t.category || '计划');

                    return (
                        <div key={t.id}
                            className="rounded-2xl transition-all duration-200 group relative overflow-hidden flex items-stretch mb-2 hover:-translate-y-0.5 hover:shadow-md"
                            style={{
                                background: isCompleted ? '#F0FDF4' : '#fff',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                border: isCompleted ? '1px solid #BBF7D0' : isPending ? '1px solid #FED7AA' : '1px solid #f0f0f0',
                            }}
                        >
                            {/* Left accent bar */}
                            <div className="w-1 shrink-0 rounded-l-2xl" style={{ background: isCompleted ? '#22C55E' : isPending ? '#F97316' : accentColor }}></div>

                            <button onClick={() => { setSelectedDate(selectedDate); setPreviewTask(t); setShowPreviewModal(true); }} className="absolute inset-0 z-0 cursor-pointer hidden sm:block" aria-label="查看任务详情"></button>

                            {/* Content area */}
                            <div onClick={() => { setPreviewTask(t); setShowPreviewModal(true); }}
                                className="flex items-center gap-3 flex-1 min-w-0 px-3 py-3 relative z-10 cursor-pointer">
                                {/* Icon */}
                                <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110"
                                    style={{ background: accentColor, opacity: isCompleted ? 0.6 : 1 }}>
                                    {renderIcon(t.iconName || getIconForCategory(t.category), 18)}
                                </div>

                                {/* Title + meta */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="font-bold text-sm leading-tight truncate"
                                            style={{ color: isCompleted ? '#6B7280' : '#1E293B', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                                            {t.title}
                                        </h3>
                                        <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap flex items-center gap-1 shrink-0">
                                            <div className="w-3 h-3 rounded-full overflow-hidden flex items-center justify-center shrink-0"><AvatarDisplay avatar={kidInfo?.avatar} /></div>
                                            {kidInfo?.name}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 items-center">
                                        <span className="text-[10px] font-bold px-1.5 py-px rounded"
                                            style={{ background: `${accentColor}12`, color: accentColor }}>
                                            {t.category || '计划'}
                                        </span>
                                        <span className="text-[10px] font-bold px-1 py-px rounded flex items-center gap-0.5"
                                            style={{ color: '#D97706' }}>
                                            {t.reward}<Icons.Star size={8} fill="currentColor" />
                                        </span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                            <Icons.Clock size={8} />{t.timeStr || '--:--'}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            {t.frequency || '每天'}
                                        </span>

                                        {isPending && (
                                            <span className="text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-px rounded"
                                                style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #FED7AA' }}>
                                                <Icons.Clock size={8} /> 待审批
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Inline action buttons — right side */}
                            <div className="relative z-10 flex items-center pr-3 shrink-0">
                                {isPending ? (
                                    <button onClick={(e) => { e.stopPropagation(); setPreviewTask(t); setShowPreviewModal(true); }}
                                        className="rounded-full py-1.5 px-4 text-xs font-black text-white transition-all active:scale-95 flex items-center gap-1"
                                        style={{ background: '#10B981' }}>
                                        <Icons.CheckCircle size={12} /> 去审核
                                    </button>
                                ) : isCompleted ? (
                                    <div className="rounded-full py-1.5 px-3 text-[11px] font-bold flex items-center gap-1"
                                        style={{ color: '#16A34A' }}>
                                        <Icons.CheckCircle size={12} /> 已完成
                                    </div>
                                ) : (status === 'todo' || status === 'failed') ? (
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        let targetKid = null;
                                        if (t.kidId === 'all') {
                                            if (effectiveFilter !== 'all') {
                                                targetKid = effectiveFilter;
                                            } else if (kids.length === 1) {
                                                targetKid = kids[0].id;
                                            } else {
                                                // Open preview modal so parent can see per-kid status
                                                setSelectedDate(selectedDate);
                                                setPreviewTask(t);
                                                setShowPreviewModal(true);
                                                return;
                                            }
                                        } else {
                                            targetKid = t.kidId;
                                        }
                                        setActiveKidId(targetKid);
                                        openQuickComplete({ ...t, requireApproval: false });
                                    }}
                                        className="rounded-full py-1.5 px-4 text-xs font-black text-white transition-all active:scale-95 flex items-center gap-1"
                                        style={{ background: C.teal, boxShadow: `0 2px 8px ${C.teal}40` }}>
                                        <Icons.Check size={12} strokeWidth={3} /> 完成
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>



            {showReorderModal && ReactDOM.createPortal(
                <div className="z-[200]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: C.bg }}>
                    <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${C.bgLight}` }}>
                        <button onClick={() => setShowReorderModal(false)} className="p-2 rounded-full" style={{ color: C.textSoft }}><Icons.X size={24} /></button>
                        <h2 className="text-lg font-black" style={{ color: C.textPrimary }}>调整任务顺序</h2>
                        <button onClick={() => setShowReorderModal(false)} className="font-black px-4 py-2 rounded-full" style={{ color: C.orange }}>完成</button>
                    </div>
                    <div style={{ position: 'absolute', top: 57, left: 0, right: 0, bottom: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '1rem', paddingBottom: '10rem' }}>
                        <div className="max-w-2xl mx-auto">
                            <div className="text-[13px] font-bold p-3 rounded-2xl mb-5 text-center" style={{ background: C.bgCard, color: C.textSoft, boxShadow: C.cardShadow }}>
                                💡 长按拖动调整任务顺序
                            </div>
                            <ReorderableList
                                items={parentTasks}
                                onReorder={handleParentReorderTask}
                                keyExtractor={(t) => t.id}
                                renderItem={(t, index) => (
                                    <div className="rounded-xl px-4 py-3.5 flex items-center gap-3 select-none transition-all"
                                        style={{ background: C.bgCard }}>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                                            style={{ background: getCatHex(t.category || '计划') }}>
                                            {renderIcon(t.iconName || getIconForCategory(t.category), 16)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] font-bold mb-0.5" style={{ color: C.textMuted }}>{t.category || '计划'} · {t.frequency || '每天'}</div>
                                            <div className="font-black text-sm truncate" style={{ color: C.textPrimary }}>{t.title}</div>
                                        </div>
                                        <Icons.GripVertical size={18} style={{ color: C.textMuted }} />
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </div>,
                document.body
            )}

          </div>
        </div>
    );
};
