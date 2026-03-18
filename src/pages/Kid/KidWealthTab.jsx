import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Icons } from '../../utils/Icons';

export const KidWealthTab = () => {
    const {
        activeKid,
        activeKidId,
        setKidTab,
        setShowTransferModal,
        setShowInterestDetailsModal,
        transactions,
        setShowTransactionHistoryModal
    } = useAppContext();

    if (!activeKid) return null;

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10">

            {/* --- Header Area --- */}
            <div className="flex flex-col gap-1 mb-2">
                <h2 className="text-2xl font-black text-slate-800">我的财富中心 💰</h2>
                <p className="text-sm font-bold text-slate-400">合理分配零花钱，做个理财小能手！</p>
            </div>

            {/* --- Wallet Cards (Dribbble Style) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                {/* 1. Spend Wallet */}
                <div className="bg-gradient-to-br from-[#FFD166] to-[#FFB703] p-6 sm:p-8 rounded-[2.5rem] text-slate-800 shadow-[0_10px_40px_rgba(255,183,3,0.3)] relative overflow-hidden group flex flex-col justify-between" style={{ minHeight: '220px' }}>
                    {/* Decorative elements */}
                    <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
                    <Icons.ShoppingBag size={140} className="absolute -right-6 -bottom-8 opacity-10 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500" />

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-2xl mb-4 border border-white/30 shadow-sm">
                            <span className="text-xl">🍔</span>
                            <span className="font-black text-sm text-yellow-900/80">日常消费钱包</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-6xl sm:text-7xl font-black tracking-tighter text-yellow-950 drop-shadow-md">{activeKid.balances?.spend || 0}</span>
                            <span className="text-xl sm:text-2xl font-black text-yellow-800">家庭币</span>
                        </div>
                    </div>

                    <div className="relative z-10 flex gap-3 mt-6">
                        <button onClick={() => setKidTab('shop')} className="flex-1 bg-yellow-900/90 hover:bg-yellow-950 text-white py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 border border-yellow-800/50">
                            去逛超市小卖部
                        </button>
                        <button onClick={() => setShowTransferModal(true)} className="w-14 h-14 bg-white/30 hover:bg-white/50 backdrop-blur-md rounded-2xl text-yellow-950 flex items-center justify-center shadow-lg active:scale-95 transition-all border border-white/40 shrink-0">
                            <Icons.ArrowRightLeft size={24} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* 2. Charity Wallet */}
                <div className="bg-gradient-to-br from-[#FF99C8] to-[#FF5D8F] p-6 sm:p-8 rounded-[2.5rem] text-white shadow-[0_10px_40px_rgba(255,93,143,0.3)] relative overflow-hidden group flex flex-col justify-between" style={{ minHeight: '220px' }}>
                    {/* Decorative elements */}
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/20 rounded-full blur-xl mix-blend-overlay"></div>
                    <Icons.Heart size={140} className="absolute -right-4 -bottom-6 opacity-10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" />

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-2xl mb-4 border border-white/20 shadow-sm">
                            <span className="text-xl">💖</span>
                            <span className="font-black text-sm text-pink-50">爱心公益基金</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-5xl sm:text-6xl font-black tracking-tighter drop-shadow-md">{activeKid.balances?.give || 0}</span>
                            <span className="text-xl sm:text-2xl font-bold opacity-90">家庭币</span>
                        </div>
                        <p className="text-sm font-bold text-pink-100 leading-relaxed max-w-[80%]">用来给家人买礼物，<br />或者实现长辈的愿望。</p>
                    </div>
                </div>
            </div>

            {/* --- Time Vault (Short-Term Interest Magic UI) --- */}
            <div>
                <h2 className="text-xl font-black text-slate-800 ml-2 mb-4 mt-8 flex items-center gap-2">时光金库 🏦 <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-1 rounded-full uppercase tracking-widest border border-emerald-200">每天自动生钱</span></h2>

                <div className="bg-[#111827] rounded-[3rem] p-6 sm:p-8 relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-slate-800">
                    {/* Tech/Magic Background glow */}
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20"></div>
                    <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-600 rounded-full blur-[100px] opacity-20"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

                        {/* Vault Balance */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-auto">
                            <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-full mb-3">
                                <Icons.Lock className="text-emerald-400" size={14} strokeWidth={3} />
                                <span className="font-black text-xs text-slate-300">已存入金库</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{activeKid.vault?.lockedAmount || 0}</span>
                            </div>
                        </div>

                        {/* Divider (Mobile) */}
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent md:hidden"></div>

                        {/* Magic Interest Engine */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 flex-1 w-full relative group">
                            {/* Animated border pulse */}
                            <div className="absolute inset-0 rounded-3xl border-2 border-emerald-500/0 group-hover:border-emerald-500/50 transition-colors duration-500"></div>

                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-sm font-black text-emerald-400">
                                    <Icons.Sparkles size={16} className="animate-pulse" /> 赚钱引擎运行中...
                                </div>
                                <button onClick={() => setShowInterestDetailsModal(true)} className="text-xs font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 border border-slate-700">
                                    收益明细 <Icons.ChevronRight size={12} />
                                </button>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/50 shrink-0">
                                    <Icons.TrendingUp size={28} strokeWidth={3} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 mb-0.5">预计明日收益 (每日凌晨发放)</div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-emerald-400">+{Math.max(1, Math.floor((activeKid.vault?.lockedAmount || 0) * 0.01))}</span>
                                        <span className="text-xs font-bold text-slate-500">币/天</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons beneath vault */}
                    <div className="relative z-10 flex gap-3 mt-8">
                        <button className="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black text-sm sm:text-base border border-white/10 backdrop-blur-sm transition-all active:scale-95 flex items-center justify-center gap-2">
                            <Icons.Download size={18} strokeWidth={3} /> 取出到消费钱包
                        </button>
                        <button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-4 rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-emerald-900/50 transition-all active:scale-95 flex items-center justify-center gap-2 border border-emerald-400/30">
                            <Icons.ArrowUpCircle size={18} strokeWidth={3} /> 存入更多钱
                        </button>
                    </div>
                </div>
            </div>


            {/* Kid Transaction History */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 p-6 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="font-black text-slate-800 text-lg flex items-center gap-2"><Icons.List size={18} className="text-slate-500" /> 近期交易明细</h3>
                    <button onClick={() => setShowTransactionHistoryModal(true)} className="text-sm font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                        查看全部明细 <Icons.ChevronRight size={14} />
                    </button>
                </div>
                <div className="p-6">
                    {transactions.filter(t => t.kidId === activeKidId && t.category !== 'habit').length === 0 ? (
                        <div className="text-center text-slate-400 text-sm py-8">暂无交易记录</div>
                    ) : (
                        <div className="space-y-3 custom-scrollbar pr-2">
                            {transactions.filter(t => t.kidId === activeKidId && t.category !== 'habit').slice(0, 40).map(item => {
                                const isIncome = item.type === 'income';
                                return (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/50 transition-colors rounded-2xl border border-slate-100/50">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner shrink-0 ${isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                {isIncome ? <Icons.TrendingUp size={20} /> : <Icons.ShoppingBag size={20} />}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-700 text-base">{item.title}</div>
                                                <div className="text-xs font-bold text-slate-400 mt-0.5">{new Date(item.date).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        </div>
                                        <div className={`font-black text-lg ${isIncome ? 'text-emerald-600' : 'text-slate-800'}`}>
                                            {isIncome ? '+' : '-'}{item.amount}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
