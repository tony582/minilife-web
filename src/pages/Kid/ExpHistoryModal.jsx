import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icons, renderIcon } from '../../utils/Icons';
import { renderHabitIcon } from '../../utils/habitIcons';
import { useTransactionDetails } from '../../hooks/useTransactionDetails.jsx';

export function ExpHistoryModal({ activeKid, transactions, nextLevelExp, onClose, tasks = [] }) {
    const parseTx = useTransactionDetails();
    const expPercent = Math.max(0, Math.min(100, (activeKid.exp / nextLevelExp) * 100));
    
    // Star dust transactions
    const expTx = useMemo(() =>
        transactions
            .filter(t => t.kidId === activeKid.id && t.type === 'income' && (t.category === 'task' || t.category === 'habit'))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 30),
        [transactions, activeKid.id]
    );

    return createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden flex flex-col shadow-2xl animate-scale-up max-h-[80vh] relative" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-white">
                    <div className="font-black text-slate-800 text-lg flex items-center gap-2">
                        <Icons.Sparkles size={20} className="text-indigo-500" /> 星尘获取明细
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100"><Icons.X size={18} /></button>
                </div>
                
                {/* Summary */}
                <div className="px-6 py-5 bg-slate-50 border-b border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-slate-700">Lv.{activeKid.level} → Lv.{activeKid.level+1}</span>
                        <span className="text-[11px] font-black text-orange-600 bg-orange-100 px-2.5 py-1 rounded-md shadow-sm border border-orange-200 flex items-center gap-1">总计 {activeKid.exp} <Icons.Sparkles size={12} /></span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-200/80 overflow-hidden shadow-inner">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${expPercent}%`, background: 'linear-gradient(90deg, #34d399, #facc15)' }} />
                    </div>
                    <div className="text-[11px] text-slate-500 font-bold mt-2 text-right">还需 {nextLevelExp - activeKid.exp} 星尘升级</div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-4 py-3 bg-slate-50/30">
                    {expTx.length === 0 ? (
                        <div className="text-center py-10 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-3"><Icons.Activity /></div>
                            <div className="text-slate-500 text-sm font-bold">还没有记录，完成任务获取星尘！</div>
                        </div>
                    ) : expTx.map((t, i) => {
                        const meta = parseTx(t);
                        return (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all">
                                <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center shadow-inner border border-slate-50 relative ${t.category === 'habit' ? 'bg-[#FEF3C7]' : 'bg-[#E0E7FF]'}`}>
                                    {meta.renderIcon(20)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-black text-slate-800 truncate">{meta.title}</div>
                                    <div className="text-[10px] text-slate-400 font-bold mt-1 tracking-wider uppercase">{new Date(t.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</div>
                                </div>
                                <div className="font-black text-base text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+{t.amount}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>,
        document.body
    );
}
