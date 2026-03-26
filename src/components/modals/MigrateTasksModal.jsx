import React, { useState } from 'react';
import { Icons } from '../../utils/Icons';
import { formatDate } from '../../utils/dateUtils';

export const MigrateTasksModal = ({ show, onClose, incompleteTasks, sourceDate, handleMigrateTasks }) => {
    const [selectedTaskIds, setSelectedTaskIds] = useState([]);
    const [targetDate, setTargetDate] = useState(formatDate(new Date()));
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Reset selections when modal opens with new data
    React.useEffect(() => {
        if (show) {
            setSelectedTaskIds([]);
            setTargetDate(formatDate(new Date()));
            setShowDatePicker(false);
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

    const C = {
        orange: '#FF8C42', teal: '#4ECDC4', coral: '#FF6B6B',
        textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
        bgCard: '#FFFFFF', bgLight: '#F0EBE1',
    };

    const sourceDateLabel = (() => {
        const today = new Date();
        const src = new Date(sourceDate);
        const diffDays = Math.round((today - src) / (24 * 60 * 60 * 1000));
        if (diffDays === 1) return '昨天';
        if (diffDays === 2) return '前天';
        return sourceDate.slice(5).replace('-', '/');
    })();

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10200] flex items-end sm:items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[80vh] flex flex-col shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
                    <div>
                        <h3 className="text-lg font-black" style={{ color: C.textPrimary }}>📋 迁移任务</h3>
                        <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>{sourceDateLabel} · {incompleteTasks.length} 个未完成</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: C.bgLight }}>
                        <Icons.X size={16} style={{ color: C.textSoft }} />
                    </button>
                </div>

                {/* Task list */}
                <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
                    {incompleteTasks.length > 0 && (
                        <button onClick={selectAll} className="text-xs font-bold mb-1" style={{ color: C.orange }}>
                            {selectedTaskIds.length === incompleteTasks.length ? '取消全选' : '全选'}
                        </button>
                    )}
                    {incompleteTasks.map(t => {
                        const isSelected = selectedTaskIds.includes(t.id);
                        return (
                            <button key={t.id} onClick={() => toggleTask(t.id)}
                                className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left"
                                style={{
                                    background: isSelected ? `${C.orange}10` : C.bgLight,
                                    border: isSelected ? `2px solid ${C.orange}` : '2px solid transparent',
                                }}>
                                <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0"
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

                {/* Footer: target date + confirm */}
                <div className="px-5 py-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold" style={{ color: C.textSoft }}>迁移到</span>
                        <button onClick={() => setShowDatePicker(!showDatePicker)}
                            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold transition-all"
                            style={{ background: C.bgLight, color: C.textPrimary }}>
                            <Icons.Calendar size={12} />
                            {targetDate === formatDate(new Date()) ? '今天' : targetDate.slice(5).replace('-', '/')}
                            <Icons.ChevronDown size={12} />
                        </button>
                    </div>
                    {showDatePicker && (
                        <div className="flex gap-2 flex-wrap">
                            {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                                const d = new Date();
                                d.setDate(d.getDate() + offset);
                                const ds = formatDate(d);
                                const labels = ['今天', '明天', '后天'];
                                const label = offset < 3 ? labels[offset] : `${d.getMonth() + 1}/${d.getDate()}`;
                                return (
                                    <button key={ds} onClick={() => { setTargetDate(ds); setShowDatePicker(false); }}
                                        className="py-1.5 px-3 rounded-full text-xs font-bold transition-all"
                                        style={{
                                            background: targetDate === ds ? C.orange : C.bgLight,
                                            color: targetDate === ds ? '#fff' : C.textSoft,
                                        }}>
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    <button onClick={handleConfirm}
                        disabled={selectedTaskIds.length === 0}
                        className="w-full py-3.5 rounded-2xl font-black text-white transition-all active:scale-[0.98] disabled:opacity-40"
                        style={{ background: C.orange, boxShadow: `0 4px 14px ${C.orange}50` }}>
                        迁移 {selectedTaskIds.length} 个任务
                    </button>
                </div>
            </div>
        </div>
    );
};
