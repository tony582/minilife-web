import React, { useMemo } from 'react';
import { Icons } from '../../utils/Icons';

export function ExpHistoryModal({ activeKid, transactions, nextLevelExp, onClose }) {
    const expPercent = Math.max(0, Math.min(100, (activeKid.exp / nextLevelExp) * 100));
    
    // Star dust transactions
    const expTx = useMemo(() =>
        transactions
            .filter(t => t.kidId === activeKid.id && t.type === 'income' && (t.category === 'task' || t.category === 'habit'))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 30),
        [transactions, activeKid.id]
    );

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}>
            <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden flex flex-col shadow-2xl animate-scale-up max-h-[80vh]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-white">
                    <div className="font-black text-slate-800 text-lg flex items-center gap-2">
                        <span className="text-xl">✨</span> 星尘获取明细
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100"><Icons.X size={18} /></button>
                </div>
                
                {/* Summary */}
                <div className="px-6 py-5 bg-slate-50 border-b border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-slate-700">Lv.{activeKid.level} → Lv.{activeKid.level+1}</span>
                        <span className="text-[11px] font-black text-orange-600 bg-orange-100 px-2.5 py-1 rounded-md shadow-sm border border-orange-200">总计 {activeKid.exp} ✨</span>
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
                    ) : expTx.map((t, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl shadow-inner border border-slate-50">
                                {t.category === 'habit' ? '🎯' : '📚'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-black text-slate-800 truncate">{t.title || (t.category === 'habit' ? '习惯打卡' : '学习规则')}</div>
                                <div className="text-[10px] text-slate-400 font-bold mt-1 tracking-wider uppercase">{new Date(t.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</div>
                            </div>
                            <div className="font-black text-base text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+{t.amount}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
