import React from 'react';
import { Icons, AvatarDisplay } from '../../utils/Icons';

export const PenaltyModal = ({ context }) => {
    const {
        showPenaltyModal, setShowPenaltyModal,
        penaltyTaskContext,
        penaltySelectedKidIds, setPenaltySelectedKidIds,
        kids,
        confirmPenalty,
        toggleKidSelectionPenalty
    } = context;

    if (!showPenaltyModal || !penaltyTaskContext) return null;

    const availableKids = penaltyTaskContext.kidId === 'all'
        ? kids
        : kids.filter(k => k.id === penaltyTaskContext.kidId);

    const eligibleKids = availableKids.filter(k => k.balances.spend >= Math.abs(penaltyTaskContext.reward));

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in pb-12">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-5 shadow-2xl text-left border-[3px] border-white/50">
                <div className="flex flex-col items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-2 text-2xl">
                        🚨
                    </div>
                    <h2 className="text-lg font-black text-slate-800">确认扣分对象</h2>
                    <p className="text-xs text-slate-500 font-bold mt-1 text-center">
                        请勾选要扣除 <span className="text-red-500 text-sm font-extrabold">{Math.abs(penaltyTaskContext.reward)}</span> 家庭币的孩子<br />
                        <span className="text-[10px] text-slate-400 font-normal">(单据限制: {penaltyTaskContext.periodMaxPerDay || penaltyTaskContext.maxPerDay || 1}次/天)</span>
                    </p>
                </div>

                {availableKids.length > 1 && (
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-400">选择受罚对象 ({availableKids.length} 人)</span>
                        <button
                            onClick={() => {
                                if (penaltySelectedKidIds.length === eligibleKids.length && eligibleKids.length > 0) {
                                    setPenaltySelectedKidIds([]);
                                } else {
                                    setPenaltySelectedKidIds(eligibleKids.map(k => k.id));
                                }
                            }}
                            disabled={eligibleKids.length === 0}
                            className="text-xs font-black transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-transparent hover:border-slate-200 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ color: penaltySelectedKidIds.length === eligibleKids.length && eligibleKids.length > 0 ? '#f43f5e' : '#64748b' }}
                        >
                            <Icons.CheckSquare size={14} />
                            {penaltySelectedKidIds.length === eligibleKids.length && eligibleKids.length > 0 ? '取消全选' : '选中可用'}
                        </button>
                    </div>
                )}

                <div className="space-y-2.5 mb-5 max-h-[35vh] overflow-y-auto pr-1 custom-scrollbar">
                    {availableKids.map(k => {
                        const isSelected = penaltySelectedKidIds.includes(k.id);
                        const requiredCoins = Math.abs(penaltyTaskContext.reward);
                        const isShort = k.balances.spend < requiredCoins;
                        return (
                            <button
                                key={k.id}
                                onClick={() => toggleKidSelectionPenalty(k.id)}
                                disabled={isShort}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-red-500 bg-red-50 shadow-inner' : (isShort ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed' : 'border-slate-100 hover:border-slate-200 bg-white')}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl border ${isShort ? 'bg-slate-200 border-slate-300 opacity-50 grayscale' : 'bg-slate-100 border-slate-200 shadow-sm'} shrink-0 overflow-hidden`}>
                                    <AvatarDisplay avatar={k.avatar} />
                                </div>
                                <div className="flex-1 flex flex-col items-start -mt-0.5">
                                    <span className={`font-black text-left ${isSelected ? 'text-red-700' : (isShort ? 'text-slate-400' : 'text-slate-700')}`}>{k.name}</span>
                                    {isShort && <span className="text-[10px] font-bold text-red-400 bg-red-50 px-1.5 py-0.5 rounded mt-0.5">余额不足 ({k.balances.spend}枚)</span>}
                                </div>
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isSelected ? 'border-red-500 bg-red-500' : 'border-slate-300'}`}>
                                    {isSelected && <Icons.Check size={14} className="text-white" />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setShowPenaltyModal(false)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200">取消</button>
                    <button
                        disabled={penaltySelectedKidIds.length === 0}
                        onClick={confirmPenalty}
                        className="flex-[2] py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-black shadow-lg shadow-red-500/30 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        执行扣分
                    </button>
                </div>
            </div>
        </div>
    );
};
