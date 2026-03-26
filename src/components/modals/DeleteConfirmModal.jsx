import React from 'react';
import { Icons } from '../../utils/Icons';

export const DeleteConfirmModal = ({ deleteConfirmTask, setDeleteConfirmTask, handleDeleteTask, handleSkipTask, handleStopRecurring, selectedDate }) => {
    if (!deleteConfirmTask) return null;

    const isRecurring = deleteConfirmTask.frequency && deleteConfirmTask.frequency !== '仅当天';

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10200] flex items-center justify-center p-4 animate-fade-in" onClick={() => setDeleteConfirmTask(null)}>
            <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl animate-scale-in border border-slate-100" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-3">
                        <Icons.Trash2 size={22} className="text-red-500" />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-1">
                        {isRecurring ? '管理重复任务' : '确认删除？'}
                    </h3>
                    <p className="text-xs text-slate-400 mb-4" style={{ wordBreak: 'break-all' }}>
                        {deleteConfirmTask.title}
                        {isRecurring && <span className="ml-1 text-slate-500">（{deleteConfirmTask.frequency}）</span>}
                    </p>

                    {isRecurring ? (
                        <div className="w-full space-y-2">
                            <button onClick={() => handleSkipTask(deleteConfirmTask.id, selectedDate)}
                                className="w-full py-3 px-4 rounded-2xl transition-all active:scale-[0.98] flex items-center gap-3 text-left"
                                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: '#E2E8F0' }}>
                                    <Icons.SkipForward size={14} className="text-slate-500" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-700">仅跳过今天</div>
                                    <div className="text-[10px] text-slate-400">今天不做，明天照常</div>
                                </div>
                            </button>

                            <button onClick={() => handleStopRecurring(deleteConfirmTask.id, selectedDate)}
                                className="w-full py-3 px-4 rounded-2xl transition-all active:scale-[0.98] flex items-center gap-3 text-left"
                                style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: '#FDE68A' }}>
                                    <Icons.Pause size={14} className="text-amber-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold" style={{ color: '#B45309' }}>从今天起停止</div>
                                    <div className="text-[10px]" style={{ color: '#D97706' }}>以后不再出现，保留历史记录</div>
                                </div>
                            </button>

                            <button onClick={() => handleDeleteTask(deleteConfirmTask.id)}
                                className="w-full py-3 px-4 rounded-2xl transition-all active:scale-[0.98] flex items-center gap-3 text-left"
                                style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: '#FECACA' }}>
                                    <Icons.Trash2 size={14} className="text-red-500" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-red-600">彻底删除</div>
                                    <div className="text-[10px] text-red-400">删除任务及所有记录，不可恢复</div>
                                </div>
                            </button>

                            <button onClick={() => setDeleteConfirmTask(null)}
                                className="w-full py-2 text-sm font-bold text-slate-400 mt-1">
                                取消
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3 w-full">
                            <button onClick={() => setDeleteConfirmTask(null)}
                                className="flex-1 py-3.5 rounded-2xl font-bold transition-all text-slate-600 bg-slate-100 hover:bg-slate-200">
                                取消
                            </button>
                            <button onClick={() => handleDeleteTask(deleteConfirmTask.id)}
                                className="flex-1 py-3.5 rounded-2xl font-bold transition-all text-white bg-red-500 shadow-lg shadow-red-500/30 hover:bg-red-600 active:scale-95">
                                确定删除
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
