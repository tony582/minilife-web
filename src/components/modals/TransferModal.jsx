import React from 'react';
import { Icons } from '../../utils/Icons';

export const TransferModal = ({ context }) => {
    const {
        showTransferModal, setShowTransferModal,
        transferForm, setTransferForm,
        activeKidId, kids,
        confirmTransfer
    } = context;

    if (!showTransferModal) return null;
    const activeKid = kids.find(k => k.id === activeKidId);
    if (!activeKid) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl text-left">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.RefreshCw className="text-indigo-500" /> 资金手动划转</h2>
                    <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors"><Icons.X size={20} /></button>
                </div>

                <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl mb-6 font-bold text-center border border-indigo-100">
                    日常消费钱包余额：<span className="text-2xl font-black">{activeKid.balances.spend}</span> 家庭币
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">转入到哪里？</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setTransferForm({ ...transferForm, target: 'vault' })} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${transferForm.target === 'vault' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-inner' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                                <Icons.Lock size={24} />
                                <span className="font-bold">时光金库 (储蓄)</span>
                            </button>
                            <button onClick={() => setTransferForm({ ...transferForm, target: 'give' })} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${transferForm.target === 'give' ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-inner' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                                <Icons.Heart size={24} />
                                <span className="font-bold">公益基金</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">划转金额</label>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <button onClick={() => setTransferForm({ ...transferForm, amount: 10 })} className="py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">+ 10</button>
                            <button onClick={() => setTransferForm({ ...transferForm, amount: 50 })} className="py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">+ 50</button>
                            <button onClick={() => setTransferForm({ ...transferForm, amount: activeKid.balances.spend })} className="py-2 bg-slate-100 text-indigo-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">全部余额</button>
                        </div>
                        <div className="relative">
                            <input type="number" value={transferForm.amount} onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })} placeholder="输入数字" className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl text-lg font-bold outline-none focus:border-indigo-500 transition-colors" />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">家庭币</span>
                        </div>
                    </div>
                </div>

                <button onClick={confirmTransfer} className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all hover:-translate-y-0.5 mt-2">
                    确认划转
                </button>
            </div>
        </div>
    );
};
