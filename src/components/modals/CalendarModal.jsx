import React from 'react';
import { Icons } from '../../utils/Icons';
import { getDaysInMonth, formatDate } from '../../utils/dateUtils';

export const CalendarModal = ({ context }) => {
    const {
        showCalendarModal, setShowCalendarModal,
        monthViewDate, setMonthViewDate,
        selectedDate, setSelectedDate,
        setCurrentViewDate,
        getIncompleteStudyTasksCount
    } = context;

    if (!showCalendarModal) return null;

    const changeMonth = (offset) => {
        const newDate = new Date(monthViewDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setMonthViewDate(newDate);
    };

    const handleDayClick = (dateStr) => {
        setSelectedDate(dateStr);
        setCurrentViewDate(new Date(dateStr));
        setShowCalendarModal(false);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in">
            <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden zoom-in transition-all duration-300 transform">
                <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-6 px-1 sm:px-2">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.Calendar size={24} className="text-indigo-500" /> 全月总览</h3>
                        <button onClick={() => setShowCalendarModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"><Icons.X size={20} /></button>
                    </div>

                    <div className="flex items-center justify-between mb-4 sm:mb-6 px-1 sm:px-4 py-1.5 sm:py-2 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                        <button onClick={() => changeMonth(-1)} className="p-1 sm:p-2 text-indigo-600 hover:bg-white shadow-sm hover:shadow rounded-full transition-all"><Icons.ChevronLeft size={18} className="sm:w-[20px] sm:h-[20px]" /></button>
                        <div className="font-black text-lg sm:text-xl text-slate-800 tracking-wide drop-shadow-sm flex items-center gap-1">
                            {monthViewDate.getMonth() + 1} <span className="text-sm font-bold text-indigo-500">月</span>
                        </div>
                        <button onClick={() => changeMonth(1)} className="p-1 sm:p-2 text-indigo-600 hover:bg-white shadow-sm hover:shadow rounded-full transition-all"><Icons.ChevronRight size={18} className="sm:w-[20px] sm:h-[20px]" /></button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-2 px-1 sm:px-2">
                        {['一', '二', '三', '四', '五', '六', '日'].map((d, idx) => (
                            <div key={d} className={`text-[10px] sm:text-xs font-bold py-1.5 sm:py-2 ${idx >= 5 ? 'text-rose-400' : 'text-slate-400'}`}>{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 sm:gap-1.5 px-1 sm:px-2">
                        {getDaysInMonth(monthViewDate.getFullYear(), monthViewDate.getMonth()).map((dayObj, i) => {
                            const isSelected = dayObj.dateStr === selectedDate;
                            const isToday = dayObj.dateStr === formatDate(new Date());
                            const { count, total } = getIncompleteStudyTasksCount(dayObj.dateStr);

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleDayClick(dayObj.dateStr)}
                                    className={`
                                            aspect-square flex flex-col items-center justify-center rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold transition-all relative pt-2
                                            ${!dayObj.isCurrentMonth ? 'text-slate-300 pointer-events-none scale-95 opacity-50' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer hover:scale-105 active:scale-95'}
                                            ${isSelected && dayObj.isCurrentMonth ? '!bg-indigo-600 !text-white shadow-lg shadow-indigo-600/40 scale-105 z-10' : ''}
                                            ${isToday && !isSelected && dayObj.isCurrentMonth ? '!bg-yellow-400 !text-yellow-900 shadow-sm' : ''}
                                        `}
                                >
                                    <span className="mb-0.5">{dayObj.day}</span>
                                    <div className="h-3.5 flex items-center justify-center mb-1 w-full">
                                        {count > 0 && dayObj.isCurrentMonth ? (
                                            <span className={`text-[9px] font-bold px-[4px] py-[1px] leading-none rounded-full ${isSelected ? 'bg-indigo-400/50 text-white' : 'bg-red-100 text-red-600'}`}>
                                                {count}
                                            </span>
                                        ) : (total > 0 && dayObj.isCurrentMonth ? (
                                            <span className={`text-[10px] ${isSelected ? 'text-indigo-300' : 'text-emerald-500'}`}><Icons.Check size={10} /></span>
                                        ) : null)}
                                    </div>
                                    {isToday && !isSelected && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-600 animate-pulse"></div>}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 sm:mt-8 pt-4 border-t border-slate-100 flex justify-end px-1 sm:px-2">
                        <button
                            onClick={() => { setMonthViewDate(new Date()); handleDayClick(formatDate(new Date())); }}
                            className="px-5 py-2.5 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center gap-2 border border-slate-200"
                        >
                            <Icons.RefreshCw size={16} className="text-slate-400" /> 回到今天
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
