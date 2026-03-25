import React from 'react';
import { Icons } from '../../utils/Icons';

export const TaskSubmitModal = ({ context }) => {
    const { taskToSubmit, setTaskToSubmit, confirmSubmitTask } = context;

    if (!taskToSubmit) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pb-[5rem] md:pb-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-5 md:p-6 shadow-2xl text-left max-h-[75vh] md:max-h-[85vh] overflow-y-auto">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4"><Icons.CheckSquare size={24} /></div>
                <h2 className="text-xl font-black text-slate-800 mb-2">提交验收确认</h2>
                <p className="text-sm text-slate-500 mb-4">在提交给家长审核前，请确认你是否达到了以下标准：</p>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-6">
                    <h3 className="font-bold text-slate-700 text-sm mb-1">【{taskToSubmit.title}】</h3>
                    <p className="text-slate-600 text-sm">{taskToSubmit.standards}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setTaskToSubmit(null)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200">还没做好</button>
                    <button onClick={confirmSubmitTask} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700">我确认达标</button>
                </div>
            </div>
        </div>
    );
};
