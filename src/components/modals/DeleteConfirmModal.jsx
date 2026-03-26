import React from 'react';
import { Icons } from '../../utils/Icons';

export const DeleteConfirmModal = ({ deleteConfirmTask, setDeleteConfirmTask, handleDeleteTask, handleSkipTask, handleStopRecurring, selectedDate }) => {
    if (!deleteConfirmTask) return null;

    const isRecurring = deleteConfirmTask.frequency && deleteConfirmTask.frequency !== '仅当天';

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10200] flex items-center justify-center p-4 animate-fade-in" onClick={() => setDeleteConfirmTask(null)}>
            <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl animate-scale-in border border-slate-100" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                        <Icons.Trash2 size={24} className="text-red-500" />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-2">
                        {isRecurring ? '管理重复任务' : '确认删除任务？'}
                    </h3>
                    <p className="text-sm font-bold text-slate-500 mb-1 bg-slate-50 p-3 rounded-xl border border-slate-100 w-full" style={{ wordBreak: 'break-all' }}>
                        {deleteConfirmTask.title}
                    </p>
                    {isRecurring && (
                        <p className="text-xs text-slate-400 mb-4">
                            这是一个 <span className="font-bold text-slate-500">{deleteConfirmTask.frequency}</span> 的重复任务
                        </p>
                    )}
                    
                    {isRecurring ? (
                        <div className="flex flex-col gap-2.5 w-full mt-2">
                            {/* Skip today */}
                            <button onClick={() => handleSkipTask(deleteConfirmTask.id, selectedDate)}
                                className="w-full py-3 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                                style={{ background: '#F1F5F9', color: '#64748B' }}>
                                <Icons.SkipForward size={16} /> 仅跳过今天
                                <span className="text-[10px] font-normal text-slate-400">明天继续</span>
                            </button>
                            {/* Stop from today */}
                            <button onClick={() => handleStopRecurring(deleteConfirmTask.id, selectedDate)}
                                className="w-full py-3 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                                style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #FED7AA' }}>
                                <Icons.Pause size={16} /> 从今天起停止
                                <span className="text-[10px] font-normal" style={{ color: '#FB923C' }}>保留历史</span>
                            </button>
                            {/* Full delete */}
                            <button onClick={() => handleDeleteTask(deleteConfirmTask.id)}
                                className="w-full py-3 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 text-sm text-white"
                                style={{ background: '#EF4444', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>
                                <Icons.Trash2 size={16} /> 彻底删除
                                <span className="text-[10px] font-normal text-red-200">不可恢复</span>
                            </button>
                            {/* Cancel */}
                            <button onClick={() => setDeleteConfirmTask(null)}
                                className="w-full py-2.5 text-sm font-bold text-slate-400 transition-all active:scale-95">
                                取消
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3 w-full mt-4">
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
