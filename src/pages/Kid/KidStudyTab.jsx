import React, { useRef, useState } from 'react';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useDataContext } from '../../context/DataContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { useTaskManager } from '../../hooks/useTaskManager';
import { apiFetch } from '../../api/client';
import { Icons, renderIcon } from '../../utils/Icons';
import { formatDate, getDisplayDateArray, getWeekNumber } from '../../utils/dateUtils';
import { getCategoryGradient, getIconForCategory } from '../../utils/categoryUtils';
import { isTaskDueOnDate } from '../../utils/taskUtils';
import useOnClickOutside from '../../hooks/useOnClickOutside';

export const KidStudyTab = () => {
    const kidFilterRef = useRef();

    const authC = useAuthContext();
    const dataC = useDataContext();
    const uiC = useUIContext();

    const { tasks, setTasks, activeKidId } = dataC;

    const {
        currentViewDate, setCurrentViewDate,
        setPreviewTask, setShowPreviewModal,
        setShowCalendarModal,
        selectedDate, setSelectedDate
    } = uiC;

    const {
        handleStartTask,
        handleAttemptSubmit,
        getTaskStatusOnDate,
        getIncompleteStudyTasksCount,
        openQuickComplete
    } = useTaskManager(authC, dataC, uiC);

    const [searchKidTaskKeyword, setSearchKidTaskKeyword] = useState('');
    const [taskFilter, setTaskFilter] = useState([]);
    const [taskStatusFilter, setTaskStatusFilter] = useState('all');
    const [taskSort, setTaskSort] = useState('default');
    
    const [isReordering, setIsReordering] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    useOnClickOutside(kidFilterRef, () => setShowFilterDropdown(false));

    let myTasks = tasks.filter(t => (t.kidId === activeKidId || t.kidId === 'all') && t.type === 'study' && isTaskDueOnDate(t, selectedDate));

    if (Array.isArray(taskFilter) && taskFilter.length > 0) {
        myTasks = myTasks.filter(t => taskFilter.includes(t.category || '计划'));
    }

    const getDailyStatus = (t) => getTaskStatusOnDate(t, selectedDate, activeKidId);

    if (taskStatusFilter === 'completed') {
        myTasks = myTasks.filter(t => getDailyStatus(t) === 'completed');
    } else if (taskStatusFilter === 'incomplete') {
        myTasks = myTasks.filter(t => getDailyStatus(t) !== 'completed');
    }

    const sortedTasks = [...myTasks];
    // Handle kid-friendly sort options
    switch (taskSort) {
        case 'time_asc':
            // Sort by time (shorter time first). Assuming t.reward correlates with expected time, or parse t.timePreset...
            sortedTasks.sort((a, b) => parseInt(a.timeStr || 0) - parseInt(b.timeStr || 0));
            break;
        case 'category':
            sortedTasks.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
            break;
        case 'status':
            sortedTasks.sort((a, b) => {
                const statusOrder = { 'todo': 0, 'in_progress': 1, 'failed': 2, 'pending_approval': 3, 'completed': 4 };
                return statusOrder[getDailyStatus(a)] - statusOrder[getDailyStatus(b)];
            });
            break;
        case 'created_desc':
            // Assuming ID dictates creation somewhat, or just fallback if no created field
            sortedTasks.sort((a, b) => (b.id < a.id ? -1 : 1));
            break;
        case 'reward_desc':
            sortedTasks.sort((a, b) => b.reward - a.reward);
            break;
        case 'reward_asc':
            sortedTasks.sort((a, b) => a.reward - b.reward);
            break;
        case 'default':
        default:
            // Sort by the new custom order first, then ID
            sortedTasks.sort((a, b) => {
                if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
                return a.id.localeCompare(b.id);
            });
            break;
    }
    myTasks = sortedTasks;
    // Helper for reordering (via Drag/Drop or Mobile buttons)
    const handleReorderTask = (sourceIndex, targetIndex) => {
        if (sourceIndex === targetIndex || targetIndex < 0 || targetIndex >= myTasks.length) return;
        const updatedTasks = [...myTasks];
        const [removed] = updatedTasks.splice(sourceIndex, 1);
        updatedTasks.splice(targetIndex, 0, removed);

        // Assign new orders globally across identical day tasks
        updatedTasks.forEach((task, idx) => task.order = idx);

        // Update all backend tasks (optimistic UI update + API call)
        const newGlobalTasks = [...tasks];
        updatedTasks.forEach(task => {
            const globalIndex = newGlobalTasks.findIndex(g => g.id === task.id);
            if (globalIndex > -1) newGlobalTasks[globalIndex].order = task.order;
            apiFetch(`/api/tasks/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: task.order }) }).catch(console.error);
        });
        setTasks(newGlobalTasks);
    };

    return (
        <div className="animate-fade-in">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-8 mx-4">
                <div className="flex items-center justify-between mb-6 px-1">
                    <div className="flex items-center text-indigo-600 font-black text-sm sm:text-lg">
                        第{getWeekNumber(currentViewDate)[1]}周
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-3">
                        <button
                            onClick={() => { const d = new Date(currentViewDate); d.setDate(d.getDate() - 7); setCurrentViewDate(d); }}
                            className="p-1 sm:p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors bg-indigo-50/50"
                        >
                            <Icons.ChevronLeft size={16} className="sm:w-[20px] sm:h-[20px]" />
                        </button>
                        <button
                            onClick={() => { setCurrentViewDate(new Date()); setSelectedDate(formatDate(new Date())); }}
                            className="bg-yellow-400 text-yellow-900 px-2.5 sm:px-5 py-1 sm:py-2 rounded-full font-black text-[11px] sm:text-sm hover:bg-yellow-500 transition-colors shadow-sm"
                        >
                            今天
                        </button>
                        <button
                            onClick={() => { const d = new Date(currentViewDate); d.setDate(d.getDate() + 7); setCurrentViewDate(d); }}
                            className="p-1 sm:p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors bg-indigo-50/50"
                        >
                            <Icons.ChevronRight size={16} className="sm:w-[20px] sm:h-[20px]" />
                        </button>
                        <button onClick={() => setShowCalendarModal(true)} className="p-1.5 sm:p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors bg-slate-50">
                            <Icons.Calendar size={16} className="sm:w-[20px] sm:h-[20px]" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1 md:gap-2 pt-2 pb-2">
                    {getDisplayDateArray(currentViewDate).map((day, i) => {
                        const { count, total } = getIncompleteStudyTasksCount(day.dateStr);

                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(day.dateStr)}
                                className={`flex flex-col items-center py-2 md:py-4 px-1 rounded-xl md:rounded-2xl transition-all
                                    ${selectedDate === day.dateStr ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 -translate-y-1' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}
                                `}
                            >
                                <span className={`text-[9px] md:text-xs font-bold mb-1 md:mb-2 whitespace-nowrap ${selectedDate === day.dateStr ? 'text-indigo-200' : 'text-slate-400'}`}>{day.d}</span>
                                <span className="text-base sm:text-lg md:text-xl font-black">{day.displayDate.split('/')[1]}</span>
                                <div className="mt-1.5 md:mt-2 h-3.5 flex items-center justify-center">
                                    {count > 0 ? (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${selectedDate === day.dateStr ? 'bg-indigo-400/50 text-white' : 'bg-red-100 text-red-600'}`}>
                                            {count}
                                        </span>
                                    ) : (total > 0 ? (
                                        <span className={`text-[10px] ${selectedDate === day.dateStr ? 'text-indigo-300' : 'text-emerald-500'}`}><Icons.Check size={12} /></span>
                                    ) : (
                                        <div className={`w-1.5 h-1.5 rounded-full ${selectedDate === day.dateStr ? 'bg-white/30' : (day.dateStr === formatDate(new Date()) ? 'bg-orange-500' : 'bg-transparent')}`}></div>
                                    ))}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-between items-center mb-4 px-2">
                <div className="text-xl font-black text-slate-800 border-l-4 border-green-500 pl-3 shrink-0">今日任务</div>
                <div className="flex items-center justify-end gap-2 sm:gap-4 text-slate-500 text-xs sm:text-sm font-bold relative z-20 pb-2 sm:pb-0">
                    {/* 统一筛选下拉 (综合科目与状态) */}
                    <div className="relative shrink-0" ref={kidFilterRef}>
                        <button
                            onClick={() => { setShowFilterDropdown(!showFilterDropdown); setShowStatusDropdown(false); setShowSortDropdown(false); }}
                            className={`flex items-center justify-center gap-1.5 w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-full sm:rounded-none sm:bg-transparent transition-colors shadow-sm sm:shadow-none border sm:border-transparent ${showFilterDropdown || (Array.isArray(taskFilter) && taskFilter.length > 0) || taskStatusFilter !== 'all' ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'bg-white border-slate-200 hover:text-indigo-600'}`}
                        >
                            <Icons.Filter size={16} className="sm:w-[14px] sm:h-[14px]" />
                            <span className="hidden sm:inline">按条件筛选 {(Array.isArray(taskFilter) && taskFilter.length > 0) || taskStatusFilter !== 'all' ? '•' : ''}</span>
                            <Icons.ChevronDown size={14} className={`hidden sm:block transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showFilterDropdown && (
                            <div className="absolute top-full mt-2 w-56 transform -translate-x-1/2 left-1/2 sm:left-0 sm:translate-x-0 bg-white border border-slate-100 shadow-2xl rounded-2xl py-3 z-50 animate-fade-in origin-top">
                                <div className="px-4 pb-2 mb-2 text-xs font-black text-slate-400 border-b border-slate-50 uppercase tracking-widest">任务状态</div>
                                <div className="flex gap-2 px-4 mb-4">
                                    <button onClick={() => setTaskStatusFilter('all')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${taskStatusFilter === 'all' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>全部</button>
                                    <button onClick={() => setTaskStatusFilter('incomplete')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${taskStatusFilter === 'incomplete' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>未完成</button>
                                    <button onClick={() => setTaskStatusFilter('completed')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${taskStatusFilter === 'completed' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>已完成</button>
                                </div>
                                <div className="px-4 pb-2 mb-2 text-xs font-black text-slate-400 border-b border-slate-50 uppercase tracking-widest flex justify-between items-center">
                                    <span>科目</span>
                                    {Array.isArray(taskFilter) && taskFilter.length > 0 && (
                                        <button onClick={() => setTaskFilter([])} className="text-indigo-500 hover:text-indigo-700 capitalize text-[10px] bg-indigo-50 px-2 py-0.5 rounded-md">清除选择</button>
                                    )}
                                </div>
                                <div className="max-h-48 overflow-y-auto px-2 space-y-1 custom-scrollbar">
                                    {Array.from(new Set(tasks.filter(t => (t.kidId === activeKidId || t.kidId === 'all') && t.type === 'study' && isTaskDueOnDate(t, selectedDate)).map(t => t.category).filter(Boolean))).map(cat => (
                                        <label key={cat} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors w-full">
                                            <input
                                                type="checkbox"
                                                checked={Array.isArray(taskFilter) && taskFilter.includes(cat)}
                                                onChange={(e) => {
                                                    const currentFilters = Array.isArray(taskFilter) ? taskFilter : [];
                                                    if (e.target.checked) setTaskFilter([...currentFilters, cat]);
                                                    else setTaskFilter(currentFilters.filter(c => c !== cat));
                                                }}
                                                className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500 border-slate-300"
                                            />
                                            <span className="text-sm font-bold text-slate-600 flex-1 truncate">{cat}</span>
                                        </label>
                                    ))}
                                    {Array.from(new Set(tasks.filter(t => (t.kidId === activeKidId || t.kidId === 'all') && t.type === 'study' && isTaskDueOnDate(t, selectedDate)).map(t => t.category).filter(Boolean))).length === 0 && (
                                        <div className="text-center text-xs text-slate-400 py-4 font-bold">暂无可筛选的科目</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                    {/* 排序按钮下拉 */}
                    <div className="relative shrink-0">
                        <button
                            onClick={() => { setShowSortDropdown(!showSortDropdown); setShowFilterDropdown(false); setShowStatusDropdown(false); }}
                            className={`flex items-center justify-center gap-1.5 w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-full sm:rounded-none sm:bg-transparent transition-colors shadow-sm sm:shadow-none border sm:border-transparent ${showSortDropdown || taskSort !== 'default' ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'bg-white border-slate-200 hover:text-indigo-600'}`}
                        >
                            <Icons.ArrowUpDown size={16} className="sm:w-[14px] sm:h-[14px]" />
                            <span className="hidden sm:inline">排序 {taskSort !== 'default' ? '•' : ''}</span>
                            <Icons.ChevronDown size={14} className={`hidden sm:block transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showSortDropdown && (
                            <div className="absolute top-full mt-2 w-48 transform -translate-x-1/2 left-1/2 sm:left-auto sm:right-0 sm:translate-x-0 bg-white border border-slate-100 shadow-xl rounded-2xl py-2 z-50 animate-fade-in origin-top">
                                {[
                                    { id: 'default', label: '默认排序 (可拖拽)', icon: Icons.List },
                                    { id: 'time_asc', label: '预计耗时从短到长', icon: Icons.Clock },
                                    { id: 'category', label: '按科目分组', icon: Icons.LayoutGrid },
                                    { id: 'status', label: '按完成状态', icon: Icons.Activity },
                                    { id: 'created_desc', label: '最新创建', icon: Icons.Calendar },
                                    { id: 'reward_desc', label: '金币奖励最多', icon: Icons.Star },
                                    { id: 'reward_asc', label: '金币奖励最少', icon: Icons.StarHalf },
                                ].map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => { setTaskSort(option.id); setShowSortDropdown(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-colors ${taskSort === option.id ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                    >
                                        <option.icon size={16} className={taskSort === option.id ? 'text-indigo-500' : 'text-slate-400'} />
                                        {option.label}
                                        {taskSort === option.id && <Icons.Check size={14} className="ml-auto" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="h-4 w-px bg-slate-200 block sm:hidden"></div>

                    <div className="relative shrink-0 w-32 sm:w-48 transition-all hidden sm:block">
                        <Icons.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="搜索任务名称..."
                            value={searchKidTaskKeyword}
                            onChange={(e) => setSearchKidTaskKeyword(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-sm font-bold rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                        />
                        {searchKidTaskKeyword && (
                            <button onClick={() => setSearchKidTaskKeyword('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                                <Icons.X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="relative shrink-0 w-full transition-all sm:hidden mb-4 px-2">
                    <Icons.Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                    <input
                        type="text"
                        placeholder="搜索任务名称..."
                        value={searchKidTaskKeyword}
                        onChange={(e) => setSearchKidTaskKeyword(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-sm font-bold rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                    />
                    {searchKidTaskKeyword && (
                        <button onClick={() => setSearchKidTaskKeyword('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                            <Icons.X size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4 px-4 sm:px-0">
                {myTasks.filter(t => !searchKidTaskKeyword || t.title.toLowerCase().includes(searchKidTaskKeyword.toLowerCase())).length === 0 ? (
                    <div className="text-center py-10 text-slate-400 font-bold bg-white rounded-2xl border border-slate-100 shadow-sm md:col-span-2">这一天没有安排相关任务哦~</div>
                ) : myTasks.filter(t => !searchKidTaskKeyword || t.title.toLowerCase().includes(searchKidTaskKeyword.toLowerCase())).map((t, index) => (
                    <div
                        key={t.id}
                        draggable={isReordering}
                        onDragStart={(e) => { e.dataTransfer.setData('text/plain', index); e.currentTarget.classList.add('opacity-50'); }}
                        onDragEnd={(e) => { e.currentTarget.classList.remove('opacity-50'); }}
                        onDragOver={(e) => { e.preventDefault(); }}
                        onDrop={(e) => {
                            e.preventDefault();
                            const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                            handleReorderTask(sourceIndex, index);
                        }}
                        className={`bg-white rounded-[2rem] p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 group flex flex-col sm:flex-row gap-4 relative overflow-hidden ${isReordering ? 'cursor-move ring-2 ring-indigo-300' : ''}`}
                    >
                        {!isReordering && <button onClick={() => { setPreviewTask(t); setShowPreviewModal(true); }} className="absolute inset-0 z-0 cursor-pointer hidden sm:block" aria-label="查看任务详情"></button>}

                        {isReordering && (
                            <>
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300 flex items-center justify-center p-2 z-10 hidden sm:flex">
                                    <Icons.GripVertical size={20} />
                                </div>
                                <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20 sm:hidden">
                                    <button onClick={(e) => { e.stopPropagation(); handleReorderTask(index, index - 1); }} disabled={index === 0} className="w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur hover:bg-slate-50 border border-slate-200/50 rounded-full text-slate-400 disabled:opacity-30 disabled:bg-slate-50 shadow-sm transition-all"><Icons.ChevronDown className="rotate-180" size={16} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleReorderTask(index, index + 1); }} disabled={index === myTasks.length - 1} className="w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur hover:bg-slate-50 border border-slate-200/50 rounded-full text-slate-400 disabled:opacity-30 disabled:bg-slate-50 shadow-sm transition-all"><Icons.ChevronDown size={16} /></button>
                                </div>
                            </>
                        )}

                        {/* Left Section: Big Colorful Squircle Icon */}
                        <div onClick={() => { if (!isReordering) { setPreviewTask(t); setShowPreviewModal(true); } }} className={`flex z-10 sm:w-auto items-start gap-4 flex-1 ${!isReordering ? 'cursor-pointer' : ''} ${isReordering ? 'sm:ml-6' : ''}`}>
                            <div className={`w-16 h-16 shrink-0 rounded-[1.25rem] bg-gradient-to-br ${getCategoryGradient(t.category || '计划')} flex flex-col items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                                {renderIcon(t.iconName || getIconForCategory(t.category), 26)}
                                <span className={`text-[11px] font-black mt-1 text-center w-full line-clamp-1 opacity-90 tracking-wide`}>{t.category || '计划'}</span>
                            </div>
                            <div className="flex-1 flex flex-col pt-0.5 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 w-full">
                                    <h3 className="font-black text-slate-800 text-lg md:text-xl leading-tight truncate">
                                        {t.title}
                                    </h3>
                                    {/* Frequency Pill (Moved next to Title) */}
                                    <div className="shrink-0 bg-indigo-50/80 text-indigo-500 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black tracking-wide border border-indigo-100/50">
                                        {t.frequency || '每天'}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 items-center">
                                    {/* Reward Pill */}
                                    <div className="bg-amber-100/80 text-amber-600 px-2 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 border border-amber-200/50">
                                        {t.reward} <Icons.Star size={10} fill="currentColor" />
                                    </div>
                                    {/* Time Pill */}
                                    <div className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 min-w-0">
                                        <Icons.Clock size={10} className="shrink-0" />
                                        <span className="truncate">{t.timeStr || '--:--'}</span>
                                    </div>
                                    {/* Running Timer Pill */}
                                    {getDailyStatus(t) === 'in_progress' && t.actualStartTime && (
                                        <div className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 animate-pulse border border-green-200 min-w-0">
                                            <Icons.Play size={10} fill="currentColor" className="shrink-0" />
                                            <span className="truncate whitespace-nowrap">{(Math.floor((new Date() - new Date(t.actualStartTime)) / 60000))}M</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right/Bottom Section: Juicy Actions */}
                        <div className="z-10 flex sm:flex-col justify-end sm:justify-center items-stretch gap-2 shrink-0 sm:w-36 mt-2 sm:mt-0">
                            {(getDailyStatus(t) === 'todo' || getDailyStatus(t) === 'failed') && (
                                <>
                                    {t.durationPreset || t.timeSetting === 'range' ? (
                                        <button onClick={() => handleStartTask(t.id)} className="flex-1 bg-gradient-to-b from-green-400 to-green-500 shadow-lg shadow-green-500/30 text-white rounded-full py-3 px-4 text-sm font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1">
                                            <Icons.Play size={16} fill="currentColor" /> {getDailyStatus(t) === 'failed' ? '重新开始' : 'START'}
                                        </button>
                                    ) : (
                                        <button onClick={() => openQuickComplete(t)} className="flex-1 bg-gradient-to-b from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 text-white rounded-full py-3 px-4 text-sm font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1">
                                            <Icons.Check size={16} strokeWidth={3} /> {getDailyStatus(t) === 'failed' ? '重新提交' : '完成'}
                                        </button>
                                    )}
                                </>
                            )}
                            {getDailyStatus(t) === 'in_progress' && (
                                <button onClick={() => handleAttemptSubmit(t)} className="w-full bg-indigo-100 text-indigo-600 rounded-full py-3 px-4 text-xs font-black hover:bg-indigo-200 transition-colors flex items-center justify-center gap-1 border border-indigo-200/50">
                                    <Icons.Check size={14} strokeWidth={3} /> 确认达标
                                </button>
                            )}
                            {getDailyStatus(t) === 'pending_approval' && (
                                <div className="w-full text-center text-orange-500 bg-orange-50 rounded-full py-3 px-4 text-xs font-black flex items-center justify-center gap-1 border border-orange-200/50">
                                    <Icons.Clock size={14} /> 待审批
                                </div>
                            )}
                            {getDailyStatus(t) === 'completed' && (
                                <div className="w-full text-center text-emerald-500 bg-emerald-50 rounded-full py-3 px-4 text-xs font-black flex items-center justify-center gap-1 border border-emerald-200/50">
                                    <Icons.CheckCircle size={14} /> 已完成
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
