import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useDataContext } from '../../context/DataContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { useTaskManager } from '../../hooks/useTaskManager';
import { apiFetch } from '../../api/client';
import { Icons, renderIcon } from '../../utils/Icons';
import { formatDate, getDisplayDateArray, getWeekNumber } from '../../utils/dateUtils';
import { getCategoryGradient, getIconForCategory } from '../../utils/categoryUtils';
import { isTaskDueOnDate, getPeriodProgress } from '../../utils/taskUtils';
import useOnClickOutside from '../../hooks/useOnClickOutside';
import { ReorderableList } from '../../components/common/ReorderableList';

// ═══════════════════════════════════════════════════════
// 🎨 Headspace × MiniLife — Light / Dark Theme
// ═══════════════════════════════════════════════════════
const themes = {
    light: {
        bg:         '#FBF7F0',   // warm cream
        bgCard:     '#FFFFFF',   // pure white cards
        bgLight:    '#F0EBE1',   // hover / subtle bg
        bgMuted:    '#E8E0D4',   // muted elements

        orange:     '#FF8C42',
        orangeHot:  '#FF6B1A',
        orangeLight:'#FFB67A',
        orangePale: '#FF8C4218',

        yellow:     '#FFD93D',
        teal:       '#4ECDC4',
        coral:      '#FF6B6B',
        blue:       '#6C9CFF',
        pink:       '#FF8FAB',
        lavender:   '#9B8EC4',

        textPrimary:'#1B2E4B',   // deep navy text
        textSoft:   '#5A6E8A',   // secondary text
        textMuted:  '#9CAABE',   // muted hints

        cardShadow: '0 2px 12px rgba(27,46,75,0.06)',
        dropShadow: '0 20px 50px rgba(27,46,75,0.12)',
        stickyBg:   '#FBF7F0ee',
    },
    dark: {
        bg:         '#1E1541',
        bgCard:     '#2C2157',
        bgLight:    '#3A2E6E',
        bgMuted:    '#4A3D80',

        orange:     '#FF8C42',
        orangeHot:  '#FF6B1A',
        orangeLight:'#FFB67A',
        orangePale: '#FF8C4220',

        yellow:     '#FFD93D',
        teal:       '#4ECDC4',
        coral:      '#FF6B6B',
        blue:       '#6C9CFF',
        pink:       '#FF8FAB',
        lavender:   '#B8A9E8',

        textPrimary:'#FFFFFF',
        textSoft:   '#B8A9E8',
        textMuted:  '#7A6CB0',

        cardShadow: 'none',
        dropShadow: '0 20px 50px rgba(0,0,0,0.4)',
        stickyBg:   '#1E1541f0',
    }
};

// Default to light mode (change to 'dark' for dark mode)
const C = themes.light;

// Category colors — mapped from getCategoryGradient in categoryUtils.js
const catColors = {
    '语文': '#F43F5E',    // rose-500
    '数学': '#6366F1',    // indigo-500
    '英语': '#0EA5E9',    // sky-500
    '物理': '#F59E0B',    // amber-500
    '化学': '#D946EF',    // fuchsia-500
    '生物': '#10B981',    // emerald-500
    '历史': '#78716C',    // stone-500
    '地理': '#14B8A6',    // teal-500
    '政治': '#EF4444',    // red-500
    '道德与法治': '#3B82F6', // blue-500
    '信息技术': '#06B6D4', // cyan-500
    '体育运动': '#F97316', // orange-500
    '娱乐': '#EAB308',    // yellow-500
    '兴趣班': '#EC4899',  // pink-500
    '其他': '#64748B',    // slate-500
    '计划': '#FF8C42',    // orange (Headspace)
};
const getCatColor = (cat, customColor) => {
    // Ignore old Tailwind gradient classes (e.g. "from-rose-500 to-rose-600"), only use valid CSS colors
    const validColor = customColor && !customColor.includes('from-') ? customColor : null;
    return validColor || catColors[cat] || catColors['计划'];
};

export const KidStudyTab = () => {
    const kidFilterRef = useRef();
    const authC = useAuthContext();
    const dataC = useDataContext();
    const uiC = useUIContext();
    const { tasks, setTasks, activeKidId } = dataC;
    const { currentViewDate, setCurrentViewDate, setPreviewTask, setShowPreviewModal, showPreviewModal, setShowCalendarModal, selectedDate, setSelectedDate, quickCompleteTask } = uiC;
    const { handleStartTask, handleAttemptSubmit, getTaskStatusOnDate, getIncompleteStudyTasksCount, openQuickComplete } = useTaskManager(authC, dataC, uiC);

    const [searchKidTaskKeyword, setSearchKidTaskKeyword] = useState('');
    const [taskFilter, setTaskFilter] = useState([]);
    const [taskStatusFilter, setTaskStatusFilter] = useState('all');
    const [taskSort, setTaskSort] = useState('default');
    const [showReorderModal, setShowReorderModal] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Layout toggle: 1-col or 2-col, persisted in localStorage
    const [layoutCols, setLayoutCols] = useState(() => {
        try { return localStorage.getItem('kid_task_layout') || '2'; } catch { return '2'; }
    });
    const toggleLayout = () => {
        const next = layoutCols === '1' ? '2' : '1';
        setLayoutCols(next);
        try { localStorage.setItem('kid_task_layout', next); } catch {}
    };

    useOnClickOutside(kidFilterRef, () => { setShowFilterDropdown(false); setShowSortDropdown(false); });


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

    // Data
    let myTasks = tasks.filter(t => (t.kidId === activeKidId || t.kidId === 'all') && t.type === 'study' && isTaskDueOnDate(t, selectedDate));
    if (Array.isArray(taskFilter) && taskFilter.length > 0) myTasks = myTasks.filter(t => taskFilter.includes(t.category || '计划'));
    const getDailyStatus = (t) => getTaskStatusOnDate(t, selectedDate, activeKidId);
    if (taskStatusFilter === 'completed') myTasks = myTasks.filter(t => getDailyStatus(t) === 'completed');
    else if (taskStatusFilter === 'incomplete') myTasks = myTasks.filter(t => getDailyStatus(t) !== 'completed');

    const sortedTasks = [...myTasks];
    if (showReorderModal) {
        sortedTasks.sort((a, b) => { if (a.order !== undefined && b.order !== undefined) return a.order - b.order; return a.id.localeCompare(b.id); });
    } else {
        switch (taskSort) {
            case 'time_asc': sortedTasks.sort((a, b) => parseInt(a.timeStr || 0) - parseInt(b.timeStr || 0)); break;
            case 'category': sortedTasks.sort((a, b) => (a.category || '').localeCompare(b.category || '')); break;
            case 'status': sortedTasks.sort((a, b) => { const o = { 'todo': 0, 'in_progress': 1, 'failed': 2, 'pending_approval': 3, 'completed': 4 }; return o[getDailyStatus(a)] - o[getDailyStatus(b)]; }); break;
            case 'reward_desc': sortedTasks.sort((a, b) => b.reward - a.reward); break;
            default: sortedTasks.sort((a, b) => { if (a.order !== undefined && b.order !== undefined) return a.order - b.order; return a.id.localeCompare(b.id); }); break;
        }
    }
    myTasks = sortedTasks;

    const handleReorderTask = (si, ti) => {
        if (si === ti || ti < 0 || ti >= myTasks.length) return;
        const u = [...myTasks]; const [r] = u.splice(si, 1); u.splice(ti, 0, r);
        const orderMap = {};
        u.forEach((t, i) => { orderMap[t.id] = i; });
        setTasks(prev => prev.map(t => orderMap[t.id] !== undefined ? { ...t, order: orderMap[t.id] } : t));
        u.forEach((t, i) => { apiFetch(`/api/tasks/${t.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: i }) }).catch(console.error); });
    };

    const completedCount = myTasks.filter(t => getDailyStatus(t) === 'completed').length;
    const totalCount = myTasks.length;
    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // ═══════════════════════════════════════════════════════
    return (
        <div className="animate-fade-in -mx-4 md:-mx-8 px-0 pb-10" style={{ background: C.bg, minHeight: '100vh' }}>
          <div className="max-w-5xl mx-auto">

            {/* ═══ Compact Sticky Calendar (portal) ═══ */}
            {createPortal(
                <div className={`fixed top-0 left-0 right-0 z-[9998] sm:hidden transition-all duration-300 ${showCompactCalendar && !showPreviewModal && !quickCompleteTask ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
                    <div style={{ background: C.stickyBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.bgLight}`, paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }} className="px-3 py-2">
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
                {/* Decorative blobs */}
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

            {/* ═══ Progress + Toolbar (stacked) ═══ */}
            <div className="px-4 mb-4">
            {totalCount > 0 && (
                <div className="p-4 rounded-2xl flex items-center gap-4 mb-4" style={{ background: C.bgCard }}>
                    {/* Circle progress */}
                    <div className="relative w-12 h-12 shrink-0">
                        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                            <circle cx="24" cy="24" r="20" fill="none" stroke={C.bgLight} strokeWidth="4" />
                            <circle cx="24" cy="24" r="20" fill="none" stroke={C.orange} strokeWidth="4" strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 20}`} strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPct / 100)}`}
                                className="transition-all duration-700" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black" style={{ color: C.textPrimary }}>{progressPct}%</div>
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-black" style={{ color: C.textPrimary }}>今日进度</div>
                        <div className="text-xs mt-0.5" style={{ color: C.textSoft }}>已完成 {completedCount} / {totalCount} 个任务</div>
                    </div>
                    {progressPct === 100 && <div className="text-2xl">🎉</div>}
                </div>
            )}

            {/* ═══ Toolbar ═══ */}
            <div className="flex items-center gap-2 flex-1 relative z-20" ref={kidFilterRef}>
                <div className="relative flex-1 min-w-0">
                    <Icons.Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textMuted }} />
                    <input type="text" placeholder="搜索任务..." value={searchKidTaskKeyword} onChange={(e) => setSearchKidTaskKeyword(e.target.value)}
                        className="w-full text-sm font-bold rounded-xl pl-9 pr-8 py-2.5 focus:outline-none transition-all placeholder:font-normal border-none"
                        style={{ background: C.bgCard, color: C.textPrimary, caretColor: C.orange }}
                    />
                    {searchKidTaskKeyword && (
                        <button onClick={() => setSearchKidTaskKeyword('')} className="absolute inset-y-0 right-0 pr-3 flex items-center" style={{ color: C.textMuted }}><Icons.X size={14} /></button>
                    )}
                </div>
                {/* Layout toggle — only visible on wide screens */}
                <button onClick={toggleLayout}
                    className="hidden lg:flex px-3.5 py-2.5 rounded-xl items-center justify-center transition-all gap-1.5"
                    style={{ background: C.bgCard, color: C.textSoft }}
                    title={layoutCols === '1' ? '切换为两列' : '切换为一列'}>
                    {layoutCols === '1' ? <Icons.Columns size={16} /> : <Icons.List size={16} />}
                    <span className="text-sm font-bold">布局</span>
                </button>
                {/* Filter */}
                <div className="relative">
                    <button onClick={() => { setShowFilterDropdown(!showFilterDropdown); setShowSortDropdown(false); }}
                        className="w-10 h-10 sm:w-auto sm:h-auto sm:px-3.5 sm:py-2.5 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: showFilterDropdown || (Array.isArray(taskFilter) && taskFilter.length > 0) || taskStatusFilter !== 'all' ? C.orange : C.bgCard, color: showFilterDropdown || (Array.isArray(taskFilter) && taskFilter.length > 0) || taskStatusFilter !== 'all' ? '#fff' : C.textSoft }}>
                        <Icons.Filter size={16} />
                        <span className="hidden sm:inline ml-1.5 text-sm font-bold">筛选</span>
                    </button>
                    {showFilterDropdown && (
                        <div className="absolute top-full right-0 mt-2 w-56 rounded-2xl py-3 z-50 animate-simple-fade" style={{ background: C.bgCard, boxShadow: C.dropShadow }}>
                            <div className="px-4 pb-2 mb-2 text-[10px] font-black uppercase tracking-widest" style={{ color: C.textMuted, borderBottom: `1px solid ${C.bgLight}` }}>任务状态</div>
                            <div className="flex gap-1.5 px-3 mb-3">
                                {[['all','全部'],['incomplete','未完成'],['completed','已完成']].map(([id,l]) => (
                                    <button key={id} onClick={() => setTaskStatusFilter(id)} className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                                        style={{ background: taskStatusFilter === id ? C.orange : C.bgLight, color: taskStatusFilter === id ? '#fff' : C.textSoft }}>{l}</button>
                                ))}
                            </div>
                            <div className="px-4 pb-2 mb-2 text-[10px] font-black uppercase tracking-widest flex justify-between items-center" style={{ color: C.textMuted, borderBottom: `1px solid ${C.bgLight}` }}>
                                <span>科目</span>
                                {Array.isArray(taskFilter) && taskFilter.length > 0 && <button onClick={() => setTaskFilter([])} className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ background: `${C.orange}30`, color: C.orange }}>清除</button>}
                            </div>
                            <div className="max-h-48 overflow-y-auto px-2 space-y-0.5">
                                {Array.from(new Set(tasks.filter(t => (t.kidId === activeKidId || t.kidId === 'all') && t.type === 'study' && isTaskDueOnDate(t, selectedDate)).map(t => t.category).filter(Boolean))).map(cat => (
                                    <label key={cat} className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors w-full" style={{ ':hover': { background: C.bgLight } }}>
                                        <div className="w-3 h-3 rounded-sm border-2 flex items-center justify-center" style={{ borderColor: Array.isArray(taskFilter) && taskFilter.includes(cat) ? C.orange : C.textMuted, background: Array.isArray(taskFilter) && taskFilter.includes(cat) ? C.orange : 'transparent' }}
                                            onClick={(e) => { e.preventDefault(); const cf = Array.isArray(taskFilter) ? taskFilter : []; if (cf.includes(cat)) setTaskFilter(cf.filter(c => c !== cat)); else setTaskFilter([...cf, cat]); }}>
                                            {Array.isArray(taskFilter) && taskFilter.includes(cat) && <Icons.Check size={8} style={{ color: '#fff' }} />}
                                        </div>
                                        <span className="text-sm font-bold flex-1 truncate" style={{ color: C.textPrimary }}>{cat}</span>
                                        <div className="w-3 h-3 rounded-full" style={{ background: getCatColor(cat) }}></div>
                                    </label>
                                ))}
                                {Array.from(new Set(tasks.filter(t => (t.kidId === activeKidId || t.kidId === 'all') && t.type === 'study' && isTaskDueOnDate(t, selectedDate)).map(t => t.category).filter(Boolean))).length === 0 && (
                                    <div className="text-center text-xs font-bold py-4" style={{ color: C.textMuted }}>暂无科目</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {/* Sort */}
                <div className="relative">
                    <button onClick={() => { setShowSortDropdown(!showSortDropdown); setShowFilterDropdown(false); }}
                        className="w-10 h-10 sm:w-auto sm:h-auto sm:px-3.5 sm:py-2.5 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: showSortDropdown || taskSort !== 'default' ? C.orange : C.bgCard, color: showSortDropdown || taskSort !== 'default' ? '#fff' : C.textSoft }}>
                        <Icons.ArrowUpDown size={16} />
                        <span className="hidden sm:inline ml-1.5 text-sm font-bold">排序</span>
                    </button>
                    {showSortDropdown && (
                        <div className="absolute top-full right-0 mt-2 w-44 rounded-2xl py-2 z-50 animate-simple-fade" style={{ background: C.bgCard, boxShadow: C.dropShadow }}>
                            {[{id:'default',label:'默认',icon:Icons.List},{id:'category',label:'按科目',icon:Icons.LayoutGrid},{id:'status',label:'按状态',icon:Icons.Activity},{id:'reward_desc',label:'金币最多',icon:Icons.Star}].map(o => (
                                <button key={o.id} onClick={() => { setTaskSort(o.id); setShowSortDropdown(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-2.5 transition-colors"
                                    style={{ color: taskSort === o.id ? C.orange : C.textSoft, background: taskSort === o.id ? `${C.orange}15` : 'transparent' }}>
                                    <o.icon size={15} /> {o.label}
                                    {taskSort === o.id && <Icons.Check size={13} className="ml-auto" style={{ color: C.orange }} />}
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

            {/* ═══ Task Cards ═══ */}
            <div className={`grid gap-3 px-4 ${layoutCols === '1' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
                {myTasks.filter(t => !searchKidTaskKeyword || t.title.toLowerCase().includes(searchKidTaskKeyword.toLowerCase())).length === 0 ? (
                    <div className="text-center py-16 rounded-[2rem] lg:col-span-2" style={{ background: C.bgCard }}>
                        <div className="text-5xl mb-4">🌟</div>
                        <div className="text-lg font-black" style={{ color: C.textPrimary }}>今天没有任务</div>
                        <div className="text-sm mt-1" style={{ color: C.textMuted }}>享受自由时光吧~</div>
                    </div>
                ) : myTasks.filter(t => !searchKidTaskKeyword || t.title.toLowerCase().includes(searchKidTaskKeyword.toLowerCase())).map((t) => {
                    const status = getDailyStatus(t);
                    const catColor = getCatColor(t.category, t.catColor);
                    const isCompleted = status === 'completed';
                    const isPending = status === 'pending_approval';
                    const isFailed = status === 'failed';
                    const pp = getPeriodProgress(t, activeKidId, selectedDate);

                    return (
                        <div key={t.id}
                            className="rounded-2xl transition-all duration-200 group relative overflow-hidden flex items-stretch"
                            style={{
                                background: isCompleted || pp?.periodDone ? '#F0FDF4' : isFailed ? '#FFF5F5' : '#fff',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                border: isCompleted || pp?.periodDone ? '1px solid #BBF7D0' : isFailed ? '1px solid #FECACA' : '1px solid #f0f0f0',
                            }}
                        >
                            {/* Left accent bar */}
                            <div className="w-1 shrink-0 rounded-l-2xl" style={{ background: isCompleted || pp?.periodDone ? '#22C55E' : catColor }}></div>

                            <button onClick={() => { setPreviewTask(t); setShowPreviewModal(true); }} className="absolute inset-0 z-0 cursor-pointer hidden sm:block"></button>

                            <div onClick={() => { setPreviewTask(t); setShowPreviewModal(true); }}
                                className="flex items-center gap-3 flex-1 min-w-0 px-3 py-3 relative z-10 cursor-pointer">
                                {/* Icon */}
                                <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110"
                                    style={{
                                        background: catColor,
                                        opacity: isCompleted || pp?.periodDone ? 0.6 : 1,
                                    }}>
                                    {renderIcon(t.iconName || getIconForCategory(t.category), 18)}
                                </div>

                                {/* Title + meta */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm leading-tight truncate"
                                        style={{ color: isCompleted || pp?.periodDone ? '#6B7280' : '#1E293B', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                                        {t.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-1 items-center mt-1">
                                        <span className="text-[10px] font-bold px-1.5 py-px rounded"
                                            style={{ background: `${catColor}12`, color: catColor }}>
                                            {t.category || '计划'}
                                        </span>
                                        <span className="text-[10px] font-bold px-1 py-px rounded flex items-center gap-0.5"
                                            style={{ color: '#D97706' }}>
                                            {t.reward}<Icons.Star size={8} fill="currentColor" />
                                        </span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                            <Icons.Clock size={8} />{t.timeStr || '--:--'}
                                        </span>
                                        {/* Period progress tag */}
                                        {pp && (
                                            pp.periodDone ? (
                                                <span className="text-[10px] font-bold px-1.5 py-px rounded flex items-center gap-0.5"
                                                    style={{ background: '#D1FAE5', color: '#059669' }}>
                                                    ✓ {pp.periodLabel}已达标
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold px-1.5 py-px rounded flex items-center gap-1"
                                                    style={{ background: `${C.orange}15`, color: C.orange }}>
                                                    {pp.periodLabel} {pp.periodCompletions}/{pp.periodTarget}
                                                    <span className="inline-block w-8 h-1.5 rounded-full overflow-hidden" style={{ background: `${C.orange}20` }}>
                                                        <span className="block h-full rounded-full transition-all" style={{ width: `${Math.min(100, pp.periodCompletions / pp.periodTarget * 100)}%`, background: C.orange }}></span>
                                                    </span>
                                                </span>
                                            )
                                        )}
                                        {status === 'in_progress' && t.actualStartTime && (
                                            <span className="text-[10px] font-bold px-1.5 py-px rounded animate-pulse flex items-center gap-0.5"
                                                style={{ background: `${C.teal}18`, color: C.teal }}>
                                                <Icons.Play size={8} fill="currentColor" /> {Math.floor((new Date() - new Date(t.actualStartTime)) / 60000)}min
                                            </span>
                                        )}
                                        {isFailed && (
                                            <span className="text-[10px] font-bold px-1.5 py-px rounded flex items-center gap-0.5"
                                                style={{ background: '#FEE2E2', color: '#DC2626' }}>
                                                ✕ 被打回
                                            </span>
                                        )}
                                    </div>
                                    {/* Reject feedback — show reason to student */}
                                    {isFailed && (() => {
                                        const hist = t?.history || {};
                                        const entry = t?.kidId === 'all'
                                            ? hist[selectedDate]?.[activeKidId]
                                            : hist[selectedDate];
                                        const feedback = entry?.rejectFeedback;
                                        return feedback ? (
                                            <div className="mt-1 flex items-start gap-1 text-[11px] leading-tight" style={{ color: '#DC2626' }}>
                                                <span className="shrink-0">💬</span>
                                                <span className="line-clamp-2">{feedback}</span>
                                            </div>
                                        ) : null;
                                    })()}
                                </div>
                            </div>

                            {/* Inline action button — right side */}
                            <div className="relative z-10 flex items-center pr-3 shrink-0">
                                {isPending ? (
                                    <div className="rounded-full py-1.5 px-3 text-[11px] font-bold flex items-center gap-1"
                                        style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #FED7AA' }}>
                                        <Icons.Clock size={10} /> 待审批
                                    </div>
                                ) : pp?.periodDone && pp?.periodFailed ? (
                                    <button onClick={() => openQuickComplete(t)}
                                        className="rounded-full py-1.5 px-4 text-xs font-black text-white transition-all active:scale-95 flex items-center gap-1"
                                        style={{ background: '#EF4444' }}>
                                        <Icons.RefreshCw size={12} /> 重新提交
                                    </button>
                                ) : pp?.periodDone ? (
                                    <div className="rounded-full py-1.5 px-3 text-[11px] font-bold flex items-center gap-1"
                                        style={{ color: '#16A34A' }}>
                                        <Icons.CheckCircle size={12} /> 已达标
                                    </div>
                                ) : (() => {
                                    // For period tasks: allow multi-completion per day
                                    const canStillComplete = pp && !pp.periodDone && !pp.todayMaxed;
                                    const showActionBtn = status === 'todo' || status === 'failed' || (canStillComplete && status === 'completed');
                                    return (
                                        <>
                                        {showActionBtn && (
                                            <button onClick={() => openQuickComplete(t)}
                                                className="rounded-full py-1.5 px-4 text-xs font-black text-white transition-all active:scale-95 flex items-center gap-1"
                                                style={{ background: status === 'failed' ? '#EF4444' : C.teal }}>
                                                {status === 'failed' ? <><Icons.RefreshCw size={12} /> 重来</> : <><Icons.Check size={12} strokeWidth={3} /> 完成</>}
                                            </button>
                                        )}
                                        {!showActionBtn && status === 'in_progress' && (
                                            <button onClick={() => handleAttemptSubmit(t)}
                                                className="rounded-full py-1.5 px-4 text-xs font-black transition-all active:scale-95 flex items-center gap-1"
                                                style={{ background: `${C.orange}15`, color: C.orange }}>
                                                <Icons.Check size={12} strokeWidth={3} /> 达标
                                            </button>
                                        )}
                                        {!showActionBtn && isCompleted && (
                                            pp && pp.todayMaxed && !pp.periodDone ? (
                                                <div className="rounded-full py-1.5 px-3 text-[11px] font-bold flex items-center gap-1"
                                                    style={{ color: '#9CA3AF' }}>
                                                    <Icons.Clock size={10} /> 今日已达上限
                                                </div>
                                            ) : (
                                                <div className="rounded-full py-1.5 px-3 text-[11px] font-bold flex items-center gap-1"
                                                    style={{ color: '#16A34A' }}>
                                                    <Icons.CheckCircle size={12} /> 已完成
                                                </div>
                                            )
                                        )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ═══ Reorder Modal ═══ */}
            {showReorderModal && createPortal(
                <div className="z-[200]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: C.bg }}>
                    <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${C.bgLight}` }}>
                        <button onClick={() => setShowReorderModal(false)} className="p-2 rounded-full" style={{ color: C.textSoft }}><Icons.X size={24} /></button>
                        <h2 className="text-lg font-black" style={{ color: C.textPrimary }}>调整顺序</h2>
                        <button onClick={() => setShowReorderModal(false)} className="font-black px-4 py-2 rounded-full" style={{ color: C.orange }}>完成</button>
                    </div>
                    <div style={{ position: 'absolute', top: 57, left: 0, right: 0, bottom: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '1rem', paddingBottom: '10rem' }}>
                        <div className="max-w-2xl mx-auto">
                            <div className="text-[13px] font-bold p-3 rounded-2xl mb-5 text-center" style={{ background: C.bgCard, color: C.textSoft, boxShadow: C.cardShadow }}>
                                💡 长按拖动调整任务顺序
                            </div>
                            <ReorderableList items={myTasks} onReorder={handleReorderTask} keyExtractor={(t) => t.id}
                                renderItem={(t) => (
                                    <div className="rounded-xl px-4 py-3.5 flex items-center gap-3 select-none transition-all"
                                        style={{ background: C.bgCard }}>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: getCatColor(t.category, t.catColor) }}>
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
