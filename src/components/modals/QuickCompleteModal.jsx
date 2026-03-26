import React, { useCallback } from 'react';
import { useSwipeBack } from '../../hooks/useSwipeBack';
import { Icons } from '../../utils/Icons';
import { getPeriodProgress } from '../../utils/taskUtils';

export const QuickCompleteModal = ({ context }) => {
    const {
        quickCompleteTask, setQuickCompleteTask,
        qcHours, setQcHours,
        qcMinutes, setQcMinutes,
        qcSeconds, setQcSeconds,
        qcTimeMode, setQcTimeMode,
        qcStartTime, setQcStartTime,
        qcEndTime, setQcEndTime,
        qcNote, setQcNote,
        qcAttachments, setQcAttachments,
        handleQcQuickDuration,
        handleQcFileUpload,
        handleQuickComplete,
        selectedDate,
        activeKidId,
    } = context;

    const closeModal = useCallback(() => setQuickCompleteTask(null), [setQuickCompleteTask]);
    const { swipeRef, swipeHandlers } = useSwipeBack(closeModal, { enabled: !!quickCompleteTask });

    if (!quickCompleteTask) return null;
    const t = quickCompleteTask;
    const totalMins = qcHours * 60 + qcMinutes + Math.round(qcSeconds / 60);
    const totalDisplay = totalMins >= 60 ? `${Math.floor(totalMins / 60)}小时${totalMins % 60 > 0 ? totalMins % 60 + '分钟' : ''}` : `${totalMins}分钟`;
    const pp = getPeriodProgress(t, activeKidId, selectedDate);

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pb-[5rem] md:pb-4 animate-fade-in">
            <div ref={swipeRef} {...swipeHandlers}
                className="w-full max-w-md rounded-[2rem] shadow-2xl text-left max-h-[75vh] md:max-h-[90vh] overflow-y-auto" style={{ background: '#FBF7F0' }}>
                {/* Header */}
                <div className="sticky top-0 z-10 p-6 pb-4 rounded-t-[2rem]" style={{ background: '#FBF7F0', borderBottom: '1px solid #F0EBE1' }}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ background: '#FF8C42', boxShadow: '0 4px 14px rgba(255,140,66,0.3)' }}>
                                <Icons.CheckCircle size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black" style={{ color: '#1B2E4B' }}>完成任务</h2>
                                <p className="text-sm font-bold" style={{ color: '#5A6E8A' }}>{t.title}</p>
                            </div>
                        </div>
                        <button onClick={() => setQuickCompleteTask(null)} className="p-1 rounded-full transition-colors" style={{ color: '#9CAABE' }}>
                            <Icons.X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 pt-4 space-y-5">
                    {/* Task info card */}
                    <div className="p-4 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: '#FF8C42' }}>
                                {t.category || '任务'}
                            </div>
                            <span className="text-xs font-bold" style={{ color: '#9CAABE' }}>{selectedDate}</span>
                            {t.frequency && <span className="text-xs font-bold" style={{ color: '#9CAABE' }}>{t.frequency}</span>}
                        </div>
                        <div className="font-black text-lg" style={{ color: '#1B2E4B' }}>{t.title}</div>
                        {t.standards && <p className="text-xs mt-1" style={{ color: '#5A6E8A' }}>{t.standards}</p>}
                        {/* Period progress banner */}
                        {pp && (
                            <div className="mt-3 p-3 rounded-xl" style={{ background: pp.periodDone ? '#D1FAE533' : '#FF8C4210', border: pp.periodDone ? '1px solid #A7F3D0' : '1px solid #FF8C4225' }}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-black" style={{ color: pp.periodDone ? '#059669' : '#FF8C42' }}>
                                        {pp.periodDone ? `✓ ${pp.periodLabel}已达标` : `${pp.periodLabel}进度`}
                                    </span>
                                    <span className="text-xs font-bold" style={{ color: '#5A6E8A' }}>
                                        {pp.periodCompletions}/{pp.periodTarget}次 · 今日{pp.todayCount}/{pp.dailyMax}次
                                    </span>
                                </div>
                                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: pp.periodDone ? '#A7F3D0' : '#FF8C4220' }}>
                                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, pp.periodCompletions / pp.periodTarget * 100)}%`, background: pp.periodDone ? '#10B981' : '#FF8C42' }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Time input */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Icons.Clock size={16} className="text-slate-500" />
                            <span className="font-black text-slate-700 text-sm">耗时记录</span>
                        </div>

                        <div className="flex rounded-xl p-1 mb-4" style={{ background: '#F0EBE1' }}>
                            <button onClick={() => setQcTimeMode('duration')}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${qcTimeMode === 'duration' ? 'shadow-sm' : ''}`}
                                style={qcTimeMode === 'duration' ? { background: '#fff', color: '#FF8C42' } : { color: '#5A6E8A' }}>
                                输入时长
                            </button>
                            <button onClick={() => setQcTimeMode('actual')}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${qcTimeMode === 'actual' ? 'shadow-sm' : ''}`}
                                style={qcTimeMode === 'actual' ? { background: '#fff', color: '#FF8C42' } : { color: '#5A6E8A' }}>
                                实际时间
                            </button>
                        </div>

                        {qcTimeMode === 'duration' ? (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex-1">
                                        <label className="text-[11px] font-bold text-slate-400 block mb-1 text-center">小时</label>
                                        <input type="number" min="0" max="23" value={qcHours} onChange={e => setQcHours(Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-full text-center text-2xl font-black text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl py-3 outline-none focus:border-indigo-400 transition-colors" />
                                    </div>
                                    <span className="text-2xl font-black text-slate-300 mt-5">:</span>
                                    <div className="flex-1">
                                        <label className="text-[11px] font-bold text-slate-400 block mb-1 text-center">分钟</label>
                                        <input type="number" min="0" max="59" value={qcMinutes} onChange={e => setQcMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                                            className="w-full text-center text-2xl font-black text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl py-3 outline-none focus:border-indigo-400 transition-colors" />
                                    </div>
                                    <span className="text-2xl font-black text-slate-300 mt-5">:</span>
                                    <div className="flex-1">
                                        <label className="text-[11px] font-bold text-slate-400 block mb-1 text-center">秒</label>
                                        <input type="number" min="0" max="59" value={qcSeconds} onChange={e => setQcSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                                            className="w-full text-center text-2xl font-black text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl py-3 outline-none focus:border-indigo-400 transition-colors" />
                                    </div>
                                </div>
                                <div className="text-center rounded-xl py-2 mb-4" style={{ background: '#FF8C4215', border: '1px solid #FF8C4230' }}>
                                    <span className="text-sm font-bold" style={{ color: '#FF8C42' }}>总计: {totalDisplay}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 mb-2 block">常用时长</span>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[{ label: '15分钟', val: 15 }, { label: '30分钟', val: 30 }, { label: '45分钟', val: 45 }, { label: '1小时', val: 60 }, { label: '1.5小时', val: 90 }, { label: '2小时', val: 120 }].map(opt => (
                                            <button key={opt.val} onClick={() => handleQcQuickDuration(opt.val)}
                                                className={`py-2.5 text-sm font-bold rounded-full border-2 transition-all
                                                    ${totalMins === opt.val ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                    <label className="text-[11px] font-bold text-slate-500 mb-1 block text-center">开始时间</label>
                                    <input type="time" value={qcStartTime} onChange={e => setQcStartTime(e.target.value)}
                                        className="w-full box-border bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-1 text-center text-sm font-black text-slate-800 outline-none focus:border-indigo-400 transition-colors" />
                                </div>
                                <span className="text-slate-300 font-bold mt-5">-</span>
                                <div className="flex-1 min-w-0">
                                    <label className="text-[11px] font-bold text-slate-500 mb-1 block text-center">结束时间</label>
                                    <input type="time" value={qcEndTime} onChange={e => setQcEndTime(e.target.value)}
                                        className="w-full box-border bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-1 text-center text-sm font-black text-slate-800 outline-none focus:border-indigo-400 transition-colors" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Icons.FileText size={16} className="text-slate-500" />
                            <span className="font-bold text-slate-700 text-sm">学习备注</span>
                            <span className="text-xs text-slate-400">(可选)</span>
                        </div>
                        <textarea value={qcNote} onChange={e => setQcNote(e.target.value)} placeholder="记录学习心得或笔记..."
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-4 text-sm text-slate-700 outline-none focus:border-indigo-400 transition-colors resize-none h-24 placeholder:text-slate-300" />
                    </div>

                    {/* Attachments */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Icons.Image size={16} className="text-slate-500" />
                            <span className="font-bold text-slate-700 text-sm">完成证据</span>
                            <span className="text-xs text-slate-400">(可选，最多5个)</span>
                        </div>
                        {(qcAttachments || []).length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mb-3">
                                {(qcAttachments || []).map((att, idx) => (
                                    <div key={idx} className="relative group">
                                        {att.type.startsWith('image/') ? (
                                            <img src={att.data} alt={att.name} className="w-full aspect-square object-cover rounded-xl border-2 border-slate-200" />
                                        ) : (
                                            <div className="w-full aspect-square bg-slate-100 rounded-xl border-2 border-slate-200 flex flex-col items-center justify-center p-1">
                                                <Icons.FileText size={20} className="text-slate-400" />
                                                <span className="text-[9px] text-slate-400 truncate w-full text-center mt-1">{att.name}</span>
                                            </div>
                                        )}
                                        <button onClick={() => setQcAttachments(prev => prev.filter((_, i) => i !== idx))}
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                            <Icons.X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {(qcAttachments || []).length < 5 && (
                            <label className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-2 group-hover:bg-indigo-100 transition-colors">
                                    <Icons.Upload size={20} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                </div>
                                <span className="text-sm font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">点击上传图片或文件</span>
                                <span className="text-[11px] text-slate-300 mt-1">支持图片、音频、视频</span>
                                <input type="file" multiple accept="image/*,audio/*,video/*" onChange={handleQcFileUpload} className="hidden" />
                            </label>
                        )}
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="sticky bottom-0 p-4 flex gap-3 rounded-b-[2rem]" style={{ background: '#FBF7F0', borderTop: '1px solid #F0EBE1' }}>
                    <button onClick={() => setQuickCompleteTask(null)} className="flex-1 py-3.5 font-bold rounded-xl transition-colors flex items-center justify-center gap-2" style={{ background: '#F0EBE1', color: '#5A6E8A' }}>
                        <Icons.X size={16} /> 取消
                    </button>
                    <button onClick={handleQuickComplete} className="flex-[2] py-3.5 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95" style={{ background: '#FF8C42', boxShadow: '0 4px 14px rgba(255,140,66,0.3)' }}>
                        <Icons.CheckCircle size={18} /> 确认完成
                    </button>
                </div>
            </div>
        </div>
    );
};
