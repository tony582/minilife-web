import React, { useState, useCallback } from 'react';
import { Icons } from '../../utils/Icons';
import { formatDate, getDaysInMonth } from '../../utils/dateUtils';
import { useSwipeBack } from '../../hooks/useSwipeBack';

export const MigrateTasksModal = ({ show, onClose, incompleteTasks, sourceDate, handleMigrateTasks }) => {
    const [selectedTaskIds, setSelectedTaskIds] = useState([]);
    const [targetDate, setTargetDate] = useState(formatDate(new Date()));
    const [showCalendar, setShowCalendar] = useState(false);
    const [calMonth, setCalMonth] = useState(new Date());

    const closeModal = useCallback(() => { onClose(); }, [onClose]);
    const { swipeRef, swipeHandlers } = useSwipeBack(closeModal, { enabled: show });

    // Reset when modal opens
    React.useEffect(() => {
        if (show) {
            setSelectedTaskIds([]);
            setTargetDate(formatDate(new Date()));
            setShowCalendar(false);
            setCalMonth(new Date());
        }
    }, [show, sourceDate]);

    const toggleTask = (id) => {
        setSelectedTaskIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const selectAll = () => {
        if (selectedTaskIds.length === incompleteTasks.length) {
            setSelectedTaskIds([]);
        } else {
            setSelectedTaskIds(incompleteTasks.map(t => t.id));
        }
    };

    const handleConfirm = async () => {
        if (selectedTaskIds.length === 0) return;
        await handleMigrateTasks(selectedTaskIds, sourceDate, targetDate);
        setSelectedTaskIds([]);
        onClose();
    };

    if (!show) return null;

    const today = formatDate(new Date());
    const C = {
        bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
        orange: '#FF8C42', orangeHot: '#FF6B1A',
        textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
    };

    const sourceDateLabel = (() => {
        const todayDt = new Date();
        const src = new Date(sourceDate);
        const diffDays = Math.round((todayDt - src) / (24 * 60 * 60 * 1000));
        if (diffDays === 1) return '昨天';
        if (diffDays === 2) return '前天';
        return sourceDate.slice(5).replace('-', '/');
    })();

    const targetDateLabel = (() => {
        if (targetDate === today) return '今天';
        const todayDt = new Date();
        const tgt = new Date(targetDate);
        const diffDays = Math.round((tgt - todayDt) / (24 * 60 * 60 * 1000));
        if (diffDays === 1) return '明天';
        if (diffDays === 2) return '后天';
        return targetDate.slice(5).replace('-', '/');
    })();

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-6 animate-fade-in"
            style={{ background: 'rgba(27,46,75,0.3)', backdropFilter: 'blur(8px)' }}>
            <div ref={swipeRef} {...swipeHandlers}
                className="w-full h-full md:h-auto md:max-h-[85vh] md:max-w-lg flex flex-col md:rounded-3xl overflow-hidden animate-bounce-in"
                style={{ background: C.bg }}
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.bgLight}` }}>
                    <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: C.bgLight }}>
                        <Icons.X size={18} style={{ color: C.textSoft }} />
                    </button>
                    <h2 className="text-lg font-black" style={{ color: C.textPrimary }}>📋 迁移任务</h2>
                    <div className="w-9" />
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Source info */}
                    <div className="px-5 pt-4 pb-2">
                        <div className="text-xs font-bold mb-3" style={{ color: C.textMuted }}>
                            {sourceDateLabel}（{sourceDate.slice(5).replace('-', '/')}）的未完成任务
                        </div>

                        {/* Select all */}
                        {incompleteTasks.length > 1 && (
                            <button onClick={selectAll} className="text-xs font-bold mb-3 px-3 py-1.5 rounded-full transition-all"
                                style={{ background: `${C.orange}15`, color: C.orange }}>
                                {selectedTaskIds.length === incompleteTasks.length ? '取消全选' : `全选 (${incompleteTasks.length})`}
                            </button>
                        )}

                        {/* Task list */}
                        <div className="space-y-2">
                            {incompleteTasks.map(t => {
                                const isSelected = selectedTaskIds.includes(t.id);
                                return (
                                    <button key={t.id} onClick={() => toggleTask(t.id)}
                                        className="w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left"
                                        style={{
                                            background: isSelected ? C.bgCard : C.bgLight,
                                            border: isSelected ? `2px solid ${C.orange}` : '2px solid transparent',
                                            boxShadow: isSelected ? '0 2px 12px rgba(255,140,66,0.15)' : 'none',
                                        }}>
                                        <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
                                            style={{
                                                borderColor: isSelected ? C.orange : C.textMuted,
                                                background: isSelected ? C.orange : 'transparent',
                                            }}>
                                            {isSelected && <Icons.Check size={12} style={{ color: '#fff' }} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold truncate" style={{ color: C.textPrimary }}>{t.title}</div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-bold px-1.5 py-px rounded" style={{ background: `${C.orange}15`, color: C.orange }}>{t.category || '计划'}</span>
                                                <span className="text-[10px] flex items-center gap-0.5" style={{ color: '#D97706' }}>{t.reward}<Icons.Star size={8} fill="currentColor" /></span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Target date section */}
                    <div className="px-5 pt-4 pb-3">
                        <div className="text-xs font-bold mb-3" style={{ color: C.textMuted }}>迁移到</div>

                        {/* Quick date options */}
                        <div className="flex gap-2 mb-3 flex-wrap">
                            {[0, 1, 2].map(offset => {
                                const d = new Date(); d.setDate(d.getDate() + offset);
                                const ds = formatDate(d);
                                const labels = ['今天', '明天', '后天'];
                                return (
                                    <button key={ds} onClick={() => { setTargetDate(ds); setShowCalendar(false); }}
                                        className="py-2 px-4 rounded-xl text-xs font-bold transition-all"
                                        style={{
                                            background: targetDate === ds ? C.orange : C.bgCard,
                                            color: targetDate === ds ? '#fff' : C.textSoft,
                                            boxShadow: targetDate === ds ? `0 4px 14px ${C.orange}40` : 'none',
                                        }}>
                                        {labels[offset]}
                                    </button>
                                );
                            })}
                            <button onClick={() => setShowCalendar(!showCalendar)}
                                className="py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                                style={{
                                    background: showCalendar || ![0, 1, 2].some(o => { const d = new Date(); d.setDate(d.getDate() + o); return formatDate(d) === targetDate; }) ? C.orange : C.bgCard,
                                    color: showCalendar || ![0, 1, 2].some(o => { const d = new Date(); d.setDate(d.getDate() + o); return formatDate(d) === targetDate; }) ? '#fff' : C.textSoft,
                                }}>
                                <Icons.Calendar size={12} /> {showCalendar ? '收起' : '更多日期'}
                            </button>
                        </div>

                        {/* Full month calendar */}
                        {showCalendar && (
                            <div className="rounded-2xl p-4 mb-2" style={{ background: C.bgCard }}>
                                <div className="flex items-center justify-between mb-3">
                                    <button onClick={() => { const d = new Date(calMonth); d.setMonth(d.getMonth() - 1); setCalMonth(d); }}
                                        className="p-1.5 rounded-full" style={{ color: C.textSoft }}><Icons.ChevronLeft size={16} /></button>
                                    <span className="text-sm font-black" style={{ color: C.textPrimary }}>
                                        {calMonth.getFullYear()}年{calMonth.getMonth() + 1}月
                                    </span>
                                    <button onClick={() => { const d = new Date(calMonth); d.setMonth(d.getMonth() + 1); setCalMonth(d); }}
                                        className="p-1.5 rounded-full" style={{ color: C.textSoft }}><Icons.ChevronRight size={16} /></button>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                                    {['一', '二', '三', '四', '五', '六', '日'].map((d, i) => (
                                        <div key={d} className={`text-[10px] font-bold py-1 ${i >= 5 ? 'text-rose-400' : ''}`} style={{ color: i < 5 ? C.textMuted : undefined }}>{d}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {getDaysInMonth(calMonth.getFullYear(), calMonth.getMonth()).map((dayObj, i) => {
                                        const isSel = dayObj.dateStr === targetDate;
                                        const isToday = dayObj.dateStr === today;
                                        const isPast = dayObj.dateStr < today;
                                        return (
                                            <button key={i}
                                                onClick={() => { if (!isPast && dayObj.isCurrentMonth) { setTargetDate(dayObj.dateStr); setShowCalendar(false); } }}
                                                disabled={isPast || !dayObj.isCurrentMonth}
                                                className="aspect-square flex items-center justify-center rounded-lg text-xs font-bold transition-all"
                                                style={{
                                                    background: isSel ? C.orange : 'transparent',
                                                    color: isSel ? '#fff' : !dayObj.isCurrentMonth ? '#ddd' : isPast ? C.textMuted : C.textPrimary,
                                                    boxShadow: isSel ? `0 4px 12px ${C.orange}40` : 'none',
                                                    opacity: !dayObj.isCurrentMonth ? 0.3 : isPast ? 0.4 : 1,
                                                    cursor: isPast || !dayObj.isCurrentMonth ? 'default' : 'pointer',
                                                }}>
                                                {dayObj.day}
                                                {isToday && !isSel && <div className="absolute bottom-0.5 w-1 h-1 rounded-full" style={{ background: C.orange }} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Selected target display */}
                        {!showCalendar && ![0, 1, 2].some(o => { const d = new Date(); d.setDate(d.getDate() + o); return formatDate(d) === targetDate; }) && (
                            <div className="text-xs font-bold rounded-xl px-3 py-2 mb-2" style={{ background: `${C.orange}10`, color: C.orange }}>
                                已选择：{targetDate.slice(5).replace('-', '/')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4" style={{ borderTop: `1px solid ${C.bgLight}` }}>
                    <button onClick={handleConfirm}
                        disabled={selectedTaskIds.length === 0}
                        className="w-full py-3.5 rounded-2xl font-black text-white transition-all active:scale-[0.98] disabled:opacity-40"
                        style={{ background: selectedTaskIds.length > 0 ? C.orange : C.bgMuted, boxShadow: selectedTaskIds.length > 0 ? `0 4px 14px ${C.orange}50` : 'none' }}>
                        迁移 {selectedTaskIds.length} 个任务到{targetDateLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
