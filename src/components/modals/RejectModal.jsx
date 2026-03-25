import React from 'react';

export const RejectModal = ({ context }) => {
    const {
        showRejectModal, setShowRejectModal,
        rejectingTaskInfo, setRejectingTaskInfo,
        rejectReason, setRejectReason,
        confirmRejectTask
    } = context;

    if (!showRejectModal || !rejectingTaskInfo) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl text-left">
                <h2 className="text-xl font-black text-rose-600 mb-2">打回</h2>
                <p className="text-slate-500 text-sm mb-6">觉得孩子完成的不够好？写下原因让Ta修改吧：</p>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="例如：字迹太潦草了，请重新写一遍..." className="w-full bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm font-medium outline-none focus:border-rose-400 focus:bg-white h-28 resize-none mb-6 placeholder:text-rose-300 transition-colors" />
                <div className="flex gap-3">
                    <button onClick={() => { setShowRejectModal(false); setRejectingTaskInfo(null); setRejectReason(''); }} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200">取消</button>
                    <button onClick={confirmRejectTask} className="flex-[2] py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white font-black shadow-lg shadow-rose-500/30 rounded-xl hover:scale-105 transition-all">确认打回</button>
                </div>
            </div>
        </div>
    );
};
