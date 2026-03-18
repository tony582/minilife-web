import React from 'react';
import { useDataContext } from '../../context/DataContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons } from '../../utils/Icons';

export const ParentWealthTab = () => {
    const { kids, transactions } = useDataContext();
    const { setShowTransactionHistoryModal } = useUIContext();

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="text-xl font-black text-slate-800 border-l-4 border-amber-500 pl-3">💰 全家财富总览</div>
            </div>

            {/* Per-kid Financial Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {kids.map(k => {
                    const total = (k.balances.spend || 0) + (k.balances.save || 0) + (k.balances.give || 0) + (k.vault?.lockedAmount || 0);
                    const pctSpend = total > 0 ? Math.round(((k.balances.spend || 0) / total) * 100) : 0;
                    const pctSave = total > 0 ? Math.round(((k.balances.save || 0) / total) * 100) : 0;
                    const pctGive = total > 0 ? Math.round(((k.balances.give || 0) / total) * 100) : 0;
                    const pctVault = total > 0 ? Math.round(((k.vault?.lockedAmount || 0) / total) * 100) : 0;

                    // Build income/expense history from transactions (exclude Habit logs)
                    const kidTrans = transactions.filter(t => t.kidId === k.id && t.category !== 'habit');

                    return (
                        <div key={k.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 p-6">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <div className="font-black text-white text-xl">{k.name}</div>
                                        <div className="text-yellow-100 text-sm font-bold">Lv.{k.level} · 总资产 {total} 家庭币</div>
                                    </div>
                                </div>
                            </div>

                            {/* Balances Grid */}
                            <div className="grid grid-cols-2 gap-4 p-6">
                                <div className="bg-indigo-50 rounded-2xl p-4 text-center border border-indigo-100">
                                    <div className="text-xs font-bold text-indigo-500 mb-1">💳 活期钱包</div>
                                    <div className="text-2xl font-black text-indigo-600">{k.balances.spend}</div>
                                    <div className="text-[10px] text-indigo-400 font-bold">可消费</div>
                                </div>
                                <div className="bg-rose-50 rounded-2xl p-4 text-center border border-rose-100">
                                    <div className="text-xs font-bold text-rose-500 mb-1">💝 公益基金</div>
                                    <div className="text-2xl font-black text-rose-600">{k.balances.give}</div>
                                    <div className="text-[10px] text-rose-400 font-bold">爱心捐赠</div>
                                </div>
                                <div className="bg-slate-800 rounded-2xl p-4 text-center border border-slate-700">
                                    <div className="text-xs font-bold text-yellow-400 mb-1">🔒 时光金库</div>
                                    <div className="text-2xl font-black text-white">{k.vault?.lockedAmount || 0}</div>
                                    <div className="text-[10px] text-slate-400 font-bold">预期收益 +{k.vault?.projectedReturn || 0}</div>
                                </div>
                            </div>

                            {/* Distribution Bar */}
                            <div className="px-6 pb-4">
                                <div className="text-xs font-bold text-slate-500 mb-2">财富分配比例</div>
                                <div className="flex h-4 rounded-full overflow-hidden bg-slate-100">
                                    {pctSpend > 0 && <div style={{ width: `${pctSpend}%` }} className="bg-indigo-500 transition-all" title={`活期 ${pctSpend}%`}></div>}
                                    {pctSave > 0 && <div style={{ width: `${pctSave}%` }} className="bg-purple-500 transition-all" title={`储蓄 ${pctSave}%`}></div>}
                                    {pctGive > 0 && <div style={{ width: `${pctGive}%` }} className="bg-rose-500 transition-all" title={`公益 ${pctGive}%`}></div>}
                                    {pctVault > 0 && <div style={{ width: `${pctVault}%` }} className="bg-slate-700 transition-all" title={`金库 ${pctVault}%`}></div>}
                                </div>
                                <div className="flex gap-4 mt-2 text-[10px] font-bold">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> 活期 {pctSpend}%</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> 储蓄 {pctSave}%</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> 公益 {pctGive}%</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-700"></span> 金库 {pctVault}%</span>
                                </div>
                            </div>

                            {/* Unified Transaction History */}
                            <div className="border-t border-slate-100 p-6 bg-slate-50/30">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-black text-slate-700 flex items-center gap-2 text-sm"><Icons.List size={16} className="text-slate-500" /> 财务账单</h4>
                                    <button onClick={() => setShowTransactionHistoryModal(true)} className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-0.5 transition-colors">
                                        全部流水 <Icons.ChevronRight size={12} />
                                    </button>
                                </div>
                                {kidTrans.length === 0 ? (
                                    <div className="text-center text-slate-400 text-sm py-6">暂无明细记录</div>
                                ) : (
                                    <div className="space-y-2 custom-scrollbar pr-2">
                                        {kidTrans.slice(0, 30).map((item, idx) => {
                                            const isIncome = item.type === 'income';
                                            return (
                                                <div key={item.id || `pw-tx-${idx}`} className="flex items-center justify-between py-3 px-4 bg-white/50 hover:bg-white transition-colors rounded-xl border border-slate-100/50 group">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner shrink-0 ${isIncome ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                                            {isIncome ? <Icons.TrendingUp size={16} /> : <Icons.ShoppingBag size={16} />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-700 text-sm">{item.title}</div>
                                                            <div className="text-[11px] font-bold text-slate-400 mt-0.5">{new Date(item.date).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className={`font-black tracking-tight ${isIncome ? 'text-emerald-500' : 'text-slate-800'}`}>
                                                        {isIncome ? '+' : '-'}{item.amount}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
