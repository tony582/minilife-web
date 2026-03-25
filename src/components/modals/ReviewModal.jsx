import React from 'react';
import { Icons } from '../../utils/Icons';

export const ReviewModal = ({ context }) => {
    const {
        selectedOrder, setSelectedOrder,
        reviewStars, setReviewStars,
        reviewComment, setReviewComment,
        submitReview
    } = context;

    if (!selectedOrder) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl text-left">
                <h2 className="text-xl font-black text-slate-800 mb-2">订单评价</h2>
                <p className="text-slate-500 text-sm mb-6">收到"{selectedOrder.itemName}"了吗？给个真实反馈吧！</p>
                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} onClick={() => setReviewStars(s)} className={`p-1 transition-all ${s <= reviewStars ? 'text-yellow-400 scale-110' : 'text-slate-200'}`}><Icons.Star size={36} fill={s <= reviewStars ? 'currentColor' : 'none'} /></button>
                    ))}
                </div>
                <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="写下你的真实感受吧..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 h-28 resize-none mb-6" />
                <div className="flex gap-3">
                    <button onClick={() => setSelectedOrder(null)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200">暂不评价</button>
                    <button onClick={() => submitReview(selectedOrder.id, reviewStars, reviewComment || "默认好评！")} className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">提交评价</button>
                </div>
            </div>
        </div>
    );
};
