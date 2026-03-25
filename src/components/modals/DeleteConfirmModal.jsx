import React from 'react';
import { Icons } from '../../utils/Icons';

export const DeleteConfirmModal = ({ deleteConfirmTask, setDeleteConfirmTask, handleDeleteTask }) => {
    if (!deleteConfirmTask) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={() => setDeleteConfirmTask(null)}>
            <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl animate-scale-in border border-slate-100" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                        <Icons.Trash2 size={24} className="text-red-500" />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-2">确认删除任务？</h3>
                    <p className="text-sm font-bold text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100 w-full word-break">
                        {deleteConfirmTask.title}
                    </p>
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
                </div>
            </div>
        </div>
    );
};
