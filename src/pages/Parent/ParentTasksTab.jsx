import React, { useRef, useState } from 'react';
import { useDataContext } from '../../context/DataContext.jsx';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { useTaskManager } from '../../hooks/useTaskManager';
import { Icons, AvatarDisplay, renderIcon } from '../../utils/Icons';
import { isTaskDueOnDate } from '../../utils/taskUtils';
import { getCategoryGradient, getIconForCategory } from '../../utils/categoryUtils';
import { getWeekNumber, getDisplayDateArray, formatDate } from '../../utils/dateUtils';
import useOnClickOutside from '../../hooks/useOnClickOutside';

export const ParentTasksTab = () => {
    const authC = useAuthContext();
    const dataC = useDataContext();
    const uiC = useUIContext();
    
    const { kids, tasks, setTasks } = dataC;
    const {
        selectedDate, setSelectedDate,
        setShowAddPlanModal,
        setEditingTask, setPlanType, setPlanForm,
        setPreviewTask, setShowPreviewModal,
        setDeleteConfirmTask, setShowCalendarModal,
        lastSavedEndTime, apiFetch,
        parentKidFilter, setParentKidFilter,
        currentViewDate, setCurrentViewDate
    } = uiC;

    const {
        handleApproveAllTasks, getIncompleteStudyTasksCount,
        getTaskStatusOnDate
    } = useTaskManager(authC, dataC, uiC);

    const [parentTaskFilter, setParentTaskFilter] = useState([]);
    const [parentTaskStatusFilter, setParentTaskStatusFilter] = useState('all');
    const [parentTaskSort, setParentTaskSort] = useState('default');

    const [isReordering, setIsReordering] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    const parentFilterRef = useRef(null);
    const parentSortRef = useRef(null);

    useOnClickOutside(parentFilterRef, () => setShowFilterDropdown(false));
    useOnClickOutside(parentSortRef, () => setShowSortDropdown(false));

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
            if (statuses.includes('failed')) return 'failed';
            if (statuses.includes('pending_approval')) return 'pending_approval';
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
        if (isReordering) return (a.order || 0) - (b.order || 0);

        if (parentTaskSort === 'time_asc') {
            const getMins = t => t.timeStr && t.timeStr.includes('分钟') ? parseInt(t.timeStr) : 999;
            return getMins(a) - getMins(b);
        }
        if (parentTaskSort === 'category') return (a.category || '').localeCompare(b.category || '');
        if (parentTaskSort === 'status') {
            const statusWeight = { completed: 3, pending_approval: 2, in_progress: 1, failed: 0, todo: 0 };
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

        updatedSubList.forEach((task, idx) => task.order = idx);

        const newGlobalTasks = [...tasks];
        updatedSubList.forEach(task => {
            const globalIndex = newGlobalTasks.findIndex(g => g.id === task.id);
            if (globalIndex > -1) newGlobalTasks[globalIndex].order = task.order;
            apiFetch(`/api/tasks/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: task.order }) }).catch(console.error);
        });
        setTasks(newGlobalTasks);
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

    return (
        <div className="animate-fade-in">
            {/* Week Calendar */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-6">
                <div className="flex items-center justify-between mb-6 px-1">
                    <div className="flex items-center text-indigo-600 font-black text-sm sm:text-lg">
                        第{getWeekNumber(currentViewDate)[1]}周
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-3">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button onClick={() => { const d = new Date(currentViewDate); d.setDate(d.getDate() - 7); setCurrentViewDate(d); }} className="p-1 sm:p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors bg-indigo-50/50">
                                <Icons.ChevronLeft size={16} className="sm:w-[20px] sm:h-[20px]" />
                            </button>
                            <button onClick={() => { setCurrentViewDate(new Date()); setSelectedDate(formatDate(new Date())); }} className="bg-yellow-400 text-yellow-900 px-2.5 sm:px-5 py-1 sm:py-2 rounded-full font-black text-[11px] sm:text-sm hover:bg-yellow-500 transition-colors shadow-sm">
                                今天
                            </button>
                            <button onClick={() => { const d = new Date(currentViewDate); d.setDate(d.getDate() + 7); setCurrentViewDate(d); }} className="p-1 sm:p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors bg-indigo-50/50">
                                <Icons.ChevronRight size={16} className="sm:w-[20px] sm:h-[20px]" />
                            </button>
                        </div>
                        <button onClick={() => setShowCalendarModal(true)} className="p-1.5 sm:p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors bg-slate-50">
                            <Icons.Calendar size={16} className="sm:w-[20px] sm:h-[20px]" />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-1 md:gap-2 pt-2 pb-2">
                    {getDisplayDateArray(currentViewDate).map((day, i) => {
                        const { count, total } = getIncompleteStudyTasksCount(day.dateStr);

                        return (
                            <button key={i} onClick={() => setSelectedDate(day.dateStr)}
                                className={`flex flex-col items-center py-2 md:py-4 px-1 rounded-xl md:rounded-2xl transition-all
                                    ${selectedDate === day.dateStr ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 -translate-y-1' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}
                                `}>
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

            {/* Kid Filter Bar */}
            {kids.length > 0 && (
                <div className="flex overflow-x-auto hide-scrollbar gap-4 sm:gap-6 mb-6 py-3 -mx-4 md:-mx-8 items-center">
                    <div className="w-2 md:w-5 shrink-0"></div>
                    {kids.map(k => (
                        <button
                            key={k.id}
                            onClick={() => setParentKidFilter(k.id)}
                            className="shrink-0 flex flex-col items-center gap-1.5 group transition-transform focus:outline-none"
                        >
                            <div className={`p-[3px] rounded-full transition-all duration-300 ${parentKidFilter === k.id ? 'bg-indigo-500 shadow-md shadow-indigo-200/50 scale-105' : 'bg-transparent hover:bg-slate-200'}`}>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl sm:text-3xl overflow-hidden ring-2 ring-white">
                                    <AvatarDisplay avatar={k.avatar} />
                                </div>
                            </div>
                            <span className={`text-[10px] sm:text-xs font-black tracking-wide transition-colors ${parentKidFilter === k.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                {k.name}
                            </span>
                        </button>
                    ))}
                    <div className="w-2 md:w-5 shrink-0"></div>
                </div>
            )}

            {/* Title & Action Bar */}
            <div className="flex justify-between items-center mb-6 relative">
                <div className="text-xl font-black text-slate-800 border-l-4 border-indigo-500 pl-3">当日任务总览</div>
                <button onClick={() => {
                    const defaultTimes = getDefaultTimeRange();
                    setEditingTask(null);
                    setPlanType('study');
                    setPlanForm({ targetKids: parentKidFilter === 'all' ? ['all'] : [parentKidFilter], category: '语文', iconName: getIconForCategory('语文'), title: '', desc: '', startDate: new Date().toISOString().split('T')[0], endDate: '', repeatType: 'today', weeklyDays: [1, 2, 3, 4, 5], ebbStrength: 'normal', periodDaysType: 'any', periodCustomDays: [1, 2, 3, 4, 5], periodTargetCount: 1, periodMaxPerDay: 1, periodMaxType: 'daily', timeSetting: 'range', startTime: defaultTimes.start, endTime: defaultTimes.end, durationPreset: 25, pointRule: 'default', reward: '', iconEmoji: '📚', habitColor: 'from-blue-400 to-blue-500', habitType: 'daily_once', attachments: [] });
                    setShowAddPlanModal(true);
                }} className="bg-blue-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-0.5">
                    <Icons.Plus size={18} /> <span className="hidden sm:inline">新建任务</span><span className="sm:hidden">新建</span>
                </button>
            </div>

            {/* Pending Approvals Banner */}
            {pendingApprovals.length > 0 && (
                <div className="bg-[#FFF8EE] border border-orange-100 rounded-[2rem] p-4 sm:p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-extrabold text-orange-700 flex items-center gap-2 text-lg">
                            <Icons.Bell size={20} className="text-orange-600" /> 待审核验收
                            <span className="bg-orange-500 text-white text-xs px-2.5 py-1 rounded-full">{pendingApprovals.length}</span>
                        </h3>
                        <button
                            onClick={() => handleApproveAllTasks(pendingApprovals)}
                            className="text-xs font-black text-orange-600 bg-orange-100/80 hover:bg-orange-200 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                        >
                            <Icons.CheckCircle size={14} /> 一键全部通过
                        </button>
                    </div>
                    <div className="space-y-3">
                        {pendingApprovals.map(({ task: t, date, actualKidId, record }) => {
                            const kidInfo = kids.find(k => k.id === actualKidId);
                            return (
                                <div
                                    key={`${t.id}-${date}`}
                                    onClick={() => { setSelectedDate(date); setPreviewTask(t); setShowPreviewModal(true); }}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-transparent cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group"
                                >
                                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                        <div className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${getCategoryGradient(t.category || '计划')} flex flex-col items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                                            {renderIcon(t.iconName || getIconForCategory(t.category), 22)}
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-800 text-lg mb-1">{t.title}</div>
                                            <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
                                                <span className="bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1.5"><div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center shrink-0"><AvatarDisplay avatar={kidInfo?.avatar} /></div> {kidInfo?.name}</span>
                                                <span>·</span>
                                                <span>{date}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-none border-slate-50">
                                        <span className="font-black text-indigo-600 text-md whitespace-nowrap">{t.reward > 0 ? '+' : ''}{t.reward} 家庭币</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedDate(date); setPreviewTask(t); setShowPreviewModal(true); }}
                                            className="shrink-0 px-4 sm:px-6 py-2.5 bg-[#00C875] text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-200/50 hover:bg-[#00b065] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <Icons.Check size={16} strokeWidth={3} /> 去审核
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Task Cards Grid */}
            <div className="flex flex-col gap-4 w-full pb-10">
                {/* Advanced Filter & Sort Bar */}
                <div className="flex items-center justify-between bg-slate-50 border-b border-slate-200 pt-2 pb-3 mb-4">
                    <div className="flex items-center gap-2 md:gap-4 flex-1 relative">
                        {/* Filtering Button */}
                        <div className="relative shrink-0" ref={parentFilterRef}>
                            <button onClick={() => { setShowFilterDropdown(!showFilterDropdown); setShowSortDropdown(false); }} className={`flex items-center justify-center gap-1.5 w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-full sm:rounded-none sm:bg-transparent shadow-sm sm:shadow-none border sm:border-transparent transition-colors ${parentTaskFilter.length > 0 || parentTaskStatusFilter !== 'all' ? 'bg-indigo-600 text-white sm:text-indigo-600 sm:bg-transparent sm:border-transparent border-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600'}`}>
                                <Icons.Filter size={16} className={`sm:w-[14px] sm:h-[14px] ${showFilterDropdown ? 'text-indigo-600 fill-indigo-100' : ''}`} />
                                <span className="hidden sm:inline font-bold text-sm">筛选</span>
                                {(parentTaskFilter.length > 0 || parentTaskStatusFilter !== 'all') && <span className="absolute -top-1 -right-1 sm:static sm:w-auto sm:text-xs bg-red-500 text-white text-[10px] min-w-[16px] h-4 flex items-center justify-center rounded-full sm:bg-indigo-100 sm:text-indigo-600 sm:px-2">{parentTaskFilter.length + (parentTaskStatusFilter !== 'all' ? 1 : 0)}</span>}
                            </button>

                            {/* Filter Dropdown */}
                            {showFilterDropdown && (
                                <div className="absolute left-0 sm:left-auto mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-[60]">
                                    <div className="px-3 py-2 text-xs font-black text-slate-400 border-b border-slate-50 mb-2">按状态</div>
                                    <div className="grid grid-cols-2 gap-2 px-2">
                                        <button onClick={() => setParentTaskStatusFilter('all')} className={`py-1.5 text-xs font-bold rounded-lg ${parentTaskStatusFilter === 'all' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>全部状态</button>
                                        <button onClick={() => setParentTaskStatusFilter('incomplete')} className={`py-1.5 text-xs font-bold rounded-lg ${parentTaskStatusFilter === 'incomplete' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>未完成</button>
                                        <button onClick={() => setParentTaskStatusFilter('pending')} className={`py-1.5 text-xs font-bold rounded-lg ${parentTaskStatusFilter === 'pending' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>待审核</button>
                                        <button onClick={() => setParentTaskStatusFilter('completed')} className={`py-1.5 text-xs font-bold rounded-lg ${parentTaskStatusFilter === 'completed' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>已完成</button>
                                    </div>

                                    <div className="px-3 py-2 text-xs font-black text-slate-400 border-b border-slate-50 mt-2 mb-2">按科目 ({availableCategories.length})</div>
                                    <div className="flex flex-col max-h-40 overflow-y-auto px-2 custom-scrollbar">
                                        {availableCategories.map(cat => (
                                            <label key={cat} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={parentTaskFilter.includes(cat)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setParentTaskFilter([...parentTaskFilter, cat]);
                                                        else setParentTaskFilter(parentTaskFilter.filter(c => c !== cat));
                                                    }}
                                                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                                />
                                                <span className="text-slate-700 font-bold">{cat}</span>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="border-t border-slate-100 mt-2 pt-2 px-4 flex gap-2">
                                        <button onClick={() => { setParentTaskFilter([]); setParentTaskStatusFilter('all'); }} className="flex-1 text-center py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">重置</button>
                                        <button onClick={() => setShowFilterDropdown(false)} className="flex-1 text-center py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm shadow-indigo-200">完成</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-px h-4 bg-slate-200 shrink-0 hidden sm:block"></div>

                        {/* Sorting Selector */}
                        <div className="relative shrink-0 flex items-center justify-center group" ref={parentSortRef}>
                            <button
                                onClick={() => { setShowSortDropdown(!showSortDropdown); setShowFilterDropdown(false); }}
                                className={`flex items-center justify-center flex-row gap-1.5 w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-full sm:rounded-none sm:bg-transparent bg-white shadow-sm sm:shadow-none border sm:border-transparent transition-colors cursor-pointer ${showSortDropdown || parentTaskSort !== 'default' ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'text-slate-500 border-slate-200 hover:text-indigo-600'}`}
                            >
                                <Icons.SortAsc size={16} className="sm:w-[14px] sm:h-[14px]" />
                                <span className="hidden sm:inline font-bold text-[13px] sm:text-sm">
                                    {parentTaskSort === 'default' && '默认顺序'}
                                    {parentTaskSort === 'time_asc' && '最快完成的'}
                                    {parentTaskSort === 'category' && '按科目分类'}
                                    {parentTaskSort === 'status' && '按完成状态'}
                                    {parentTaskSort === 'created_desc' && '最新添加的'}
                                    {parentTaskSort === 'reward_desc' && '奖励最多的'}
                                </span>
                                <Icons.ChevronDown size={14} className={`hidden sm:block transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showSortDropdown && (
                                <div className="absolute top-full right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-[60] animate-fade-in origin-top">
                                    {[
                                        { id: 'default', label: '默认顺序' },
                                        { id: 'time_asc', label: '最快完成的' },
                                        { id: 'category', label: '按科目分类' },
                                        { id: 'status', label: '按完成状态' },
                                        { id: 'created_desc', label: '最新添加的' },
                                        { id: 'reward_desc', label: '奖励最多的' },
                                    ].map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => { setParentTaskSort(option.id); setShowSortDropdown(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors flex flex-row items-center justify-between ${parentTaskSort === option.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {option.label}
                                            {parentTaskSort === option.id && <Icons.Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="w-px h-4 bg-slate-200 shrink-0 hidden sm:block"></div>

                        {/* Reordering Toggle */}
                        <button onClick={() => setIsReordering(!isReordering)} className={`shrink-0 flex items-center justify-center gap-1.5 w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-full sm:rounded-none sm:bg-transparent shadow-sm sm:shadow-none border sm:border-transparent transition-colors ${isReordering ? 'bg-indigo-600 text-white sm:text-indigo-600 sm:bg-transparent sm:border-transparent border-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600'}`}>
                            {isReordering ? <Icons.Check size={16} className="sm:w-[14px] sm:h-[14px]" /> : <Icons.List size={16} className="sm:w-[14px] sm:h-[14px]" />}
                            <span className="hidden sm:inline font-bold text-sm">{isReordering ? '保存排序' : '自定义排序'}</span>
                        </button>
                    </div>
                </div>

                {parentTasks.length === 0 && <div className="text-center py-16 text-slate-400 font-bold bg-white rounded-2xl border border-slate-100 shadow-sm">没有找到符合条件的任务哦~</div>}

                {parentTasks.map((t, index) => {
                    let displayKidId = t.kidId;
                    if (t.kidId === 'all') displayKidId = effectiveFilter === 'all' ? 'all' : effectiveFilter;

                    const kidInfo = displayKidId === 'all' ? { name: '全部孩子', avatar: '👥' } : kids.find(k => k.id === displayKidId);
                    const status = getDailyStatus(t);
                    return (
                        <div
                            key={t.id}
                            draggable={isReordering}
                            onDragStart={(e) => { e.dataTransfer.setData('text/plain', index); e.currentTarget.classList.add('opacity-50'); }}
                            onDragEnd={(e) => { e.currentTarget.classList.remove('opacity-50'); }}
                            onDragOver={(e) => { e.preventDefault(); }}
                            onDrop={(e) => {
                                e.preventDefault();
                                const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                                handleParentReorderTask(sourceIndex, index);
                            }}
                            className={`bg-white rounded-[2rem] p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group flex flex-col sm:flex-row gap-4 relative overflow-hidden mb-4 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] ${status === 'completed' ? 'border-2 border-emerald-100 shadow-[0_8px_30px_rgba(16,185,129,0.06)]' : 'border border-slate-100/60'} ${isReordering ? 'cursor-move ring-2 ring-indigo-300' : ''}`}
                        >
                            {!isReordering && <button onClick={() => { setSelectedDate(selectedDate); setPreviewTask(t); setShowPreviewModal(true); }} className="absolute inset-0 z-0 cursor-pointer hidden sm:block" aria-label="查看任务详情"></button>}

                            {isReordering && (
                                <>
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300 flex items-center justify-center p-2 z-10 hidden sm:flex">
                                        <Icons.GripVertical size={20} />
                                    </div>
                                    <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20 sm:hidden">
                                        <button onClick={(e) => { e.stopPropagation(); handleParentReorderTask(index, index - 1); }} disabled={index === 0} className="w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur hover:bg-slate-50 border border-slate-200/50 rounded-full text-slate-400 disabled:opacity-30 disabled:bg-slate-50 shadow-sm transition-all"><Icons.ChevronDown className="rotate-180" size={16} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleParentReorderTask(index, index + 1); }} disabled={index === parentTasks.length - 1} className="w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur hover:bg-slate-50 border border-slate-200/50 rounded-full text-slate-400 disabled:opacity-30 disabled:bg-slate-50 shadow-sm transition-all"><Icons.ChevronDown size={16} /></button>
                                    </div>
                                </>
                            )}

                            {/* Left Section: Big Colorful Squircle Icon */}
                            <div onClick={() => { if (!isReordering) { setPreviewTask(t); setShowPreviewModal(true); } }} className={`flex z-10 sm:w-auto items-start gap-4 flex-1 ${!isReordering ? 'cursor-pointer' : ''} ${isReordering ? 'sm:ml-6' : ''}`}>
                                <div className={`w-16 h-16 shrink-0 rounded-[1.25rem] bg-gradient-to-br ${getCategoryGradient(t.category || '计划')} flex flex-col items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform duration-300 relative`}>
                                    {renderIcon(t.iconName || getIconForCategory(t.category), 26)}
                                    <span className={`text-[11px] font-black mt-1 text-center w-full line-clamp-1 opacity-90 tracking-wide`}>{t.category || '计划'}</span>
                                    {/* Premium Checkmark Badge overlay for completed status */}
                                    {status === 'completed' && (
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                            <div className="bg-emerald-500 rounded-full w-5 h-5 flex items-center justify-center text-white">
                                                <Icons.Check size={12} strokeWidth={4} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col pt-0.5">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className={`font-black text-lg md:text-xl leading-tight line-clamp-2 ${status === 'completed' ? 'text-slate-400' : 'text-slate-800'}`}>{t.title}</h3>
                                        <span className="bg-slate-100 text-slate-500 text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded whitespace-nowrap flex items-center gap-1"><div className="w-3.5 h-3.5 rounded-full overflow-hidden flex items-center justify-center shrink-0"><AvatarDisplay avatar={kidInfo?.avatar} /></div> {kidInfo?.name}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 items-center mt-2">
                                        {/* Reward Pill */}
                                        <div className="bg-amber-100/80 text-amber-600 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 border border-amber-200/50">
                                            {t.reward} <Icons.Star size={12} fill="currentColor" />
                                        </div>
                                        {/* Time Pill */}
                                        <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <Icons.Clock size={12} /> {t.timeStr || '--:--'}
                                        </div>
                                        {/* Frequency Pill */}
                                        <div className="bg-indigo-50 text-indigo-500 px-2 py-1 rounded-full text-[10px] font-black tracking-wide">
                                            {t.frequency || '每天'}
                                        </div>
                                        {status === 'completed' && (
                                            <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-1 rounded-full text-[10px] font-black tracking-wide flex items-center gap-1">
                                                <Icons.CheckCircle size={10} /> 已完成
                                            </div>
                                        )}
                                        {status === 'pending_approval' && (
                                            <div className="bg-orange-50 text-orange-600 border border-orange-200 px-2 py-1 rounded-full text-[10px] font-black tracking-wide flex items-center gap-1">
                                                <Icons.Clock size={10} /> 待审批
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right/Bottom Section: Parent Actions */}
                            <div className="z-10 flex sm:flex-col justify-end sm:justify-center items-stretch gap-2 shrink-0 sm:w-32 mt-2 sm:mt-0 relative">
                                {status === 'pending_approval' ? (
                                    <button onClick={(e) => { e.stopPropagation(); setPreviewTask(t); setShowPreviewModal(true); }} className="flex-1 sm:flex-none bg-gradient-to-b from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-500/30 text-white rounded-xl py-3 sm:py-2 px-4 text-xs sm:text-sm font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-emerald-400/50">
                                        <Icons.CheckCircle size={16} fill="currentColor" /> 去审核
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingTask(t);
                                            setPlanType(t.type || 'study');
                                            setPlanForm({
                                                targetKids: [t.kidId || 'all'],
                                                category: t.category || '技能',
                                                title: t.title,
                                                desc: t.standards || t.desc || '',
                                                startDate: t.startDate || new Date().toISOString().split('T')[0],
                                                endDate: t.repeatConfig?.endDate || '',
                                                repeatType: t.repeatConfig?.type || (t.frequency === '仅当天' ? 'today' : (t.frequency === '每周一至周五' ? 'weekly_custom' : 'daily')),
                                                weeklyDays: t.repeatConfig?.weeklyDays || [1, 2, 3, 4, 5],
                                                ebbStrength: t.repeatConfig?.ebbStrength || 'normal',
                                                periodDaysType: t.repeatConfig?.periodDaysType || 'any',
                                                periodCustomDays: t.repeatConfig?.periodCustomDays || [1, 2, 3, 4, 5],
                                                periodTargetCount: t.repeatConfig?.periodTargetCount || 1,
                                                periodMaxPerDay: t.repeatConfig?.periodMaxPerDay || 1,
                                                periodMaxType: t.periodMaxType || 'daily',
                                                timeSetting: t.timeStr && String(t.timeStr) !== '--:--' ? (String(t.timeStr).includes('-') ? 'range' : 'duration') : 'none',
                                                startTime: t.timeStr && String(t.timeStr).includes('-') ? String(t.timeStr).split('-')[0] : '',
                                                endTime: t.timeStr && String(t.timeStr).includes('-') ? String(t.timeStr).split('-')[1] : '',
                                                durationPreset: t.timeStr && String(t.timeStr).includes('分钟') ? parseInt(String(t.timeStr)) : 25,
                                                pointRule: (t.pointRule && t.pointRule === 'custom') || (t.type === 'habit') ? 'custom' : 'default',
                                                reward: String(t.reward || ''),
                                                iconEmoji: t.iconEmoji || '📚',
                                                habitColor: t.catColor || 'from-blue-400 to-blue-500',
                                                habitType: t.habitType || 'daily_once',
                                                attachments: t.attachments || [],
                                                requireApproval: t.requireApproval !== undefined ? t.requireApproval : true
                                            });
                                            setShowAddPlanModal(true);
                                        }} className="flex-1 sm:flex-none bg-gradient-to-b from-blue-400 to-blue-500 shadow-lg shadow-blue-500/30 text-white rounded-full py-2 px-4 text-xs font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-blue-400/50">
                                            <Icons.Edit3 size={14} fill="currentColor" /> 编辑
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmTask(t); }} className="flex-1 sm:flex-none bg-gradient-to-b from-slate-100 to-slate-200 text-slate-500 rounded-full py-2 px-4 text-xs font-black hover:bg-slate-300 transition-colors flex items-center justify-center gap-1.5 border border-slate-200/50">
                                            <Icons.Trash2 size={14} /> 删除
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
