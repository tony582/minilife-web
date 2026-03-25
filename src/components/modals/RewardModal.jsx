import React from 'react';
import { Icons, AvatarDisplay } from '../../utils/Icons';

export const RewardModal = ({ context }) => {
    const {
        showRewardModal, setShowRewardModal,
        penaltyTaskContext,
        penaltySelectedKidIds, setPenaltySelectedKidIds,
        kids,
        confirmReward,
        toggleKidSelectionPenalty
    } = context;

    if (!showRewardModal || !penaltyTaskContext) return null;

    const availableKids = penaltyTaskContext.kidId === 'all'
        ? kids
        : kids.filter(k => k.id === penaltyTaskContext.kidId);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in pb-12">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-5 shadow-2xl text-left border-[3px] border-white/50">
                <div className="flex flex-col items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2 text-2xl">
                        🌟
                    </div>
                    <h2 className="text-lg font-black text-slate-800">确认加分对象</h2>
                    <p className="text-xs text-slate-500 font-bold mt-1 text-center">
                        请勾选要给予奖励 <span className="text-yellow-500 text-sm font-extrabold flex inline-flex items-center gap-0.5"><Icons.Star size={14} className="fill-yellow-500" />{Math.abs(penaltyTaskContext.reward)}</span> 的孩子<br />
                        <span className="text-[10px] text-slate-400 font-normal">(单据限制: {penaltyTaskContext.maxPerDay || 1}次/天)</span>
                    </p>
                </div>

                {availableKids.length > 1 && (
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-400">选择奖励对象 ({availableKids.length} 人)</span>
                        <button
                            onClick={() => {
                                if (penaltySelectedKidIds.length === availableKids.length) {
                                    setPenaltySelectedKidIds([]);
                                } else {
                                    setPenaltySelectedKidIds(availableKids.map(k => k.id));
                                }
                            }}
                            className="text-xs font-black transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-transparent hover:border-slate-200 hover:bg-slate-50 active:bg-slate-100"
                            style={{ color: penaltySelectedKidIds.length === availableKids.length ? '#10b981' : '#64748b' }}
                        >
                            <Icons.CheckSquare size={14} />
                            {penaltySelectedKidIds.length === availableKids.length ? '取消全选' : '全部选中'}
                        </button>
                    </div>
                )}

                <div className="space-y-2.5 mb-5 max-h-[35vh] overflow-y-auto pr-1 custom-scrollbar">
                    {availableKids.map(k => {
                        const isSelected = penaltySelectedKidIds.includes(k.id);
                        return (
                            <button
                                key={k.id}
                                onClick={() => toggleKidSelectionPenalty(k.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50 shadow-inner' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-2xl border border-slate-200 shadow-sm shrink-0 overflow-hidden">
                                    <AvatarDisplay avatar={k.avatar} />
                                </div>
                                <span className={`font-black text-left flex-1 ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>{k.name}</span>
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                                    {isSelected && <Icons.Check size={14} className="text-white" />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setShowRewardModal(false)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200">取消</button>
                    <button
                        disabled={penaltySelectedKidIds.length === 0}
                        onClick={confirmReward}
                        className="flex-[2] py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-lg shadow-emerald-500/30 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        执行奖励
                    </button>
                </div>
            </div>
        </div>
    );
};
