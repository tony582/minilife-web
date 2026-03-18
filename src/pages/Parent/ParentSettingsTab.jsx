import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Icons, AvatarDisplay } from '../../utils/Icons';

export const ParentSettingsTab = () => {
    const {
        activeKid,
        kids,
        activeKidId,
        setActiveKidId,
        transactions,
        selectedDate,
        orders,
        tasks
    } = useAppContext();

    if (!activeKid) {
        return (
            <div className="animate-fade-in text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icons.Users size={32} className="text-slate-300" />
                </div>
                <h2 className="text-xl font-black text-slate-800">欢迎来到我的宝贝数据中心</h2>
                <p className="text-slate-500 mt-2 text-sm font-bold">您还没有添加宝贝资料，请点击右上角设置添加。</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            {/* --- Dashboard Header (Kid Info & Switcher) --- */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-6xl shadow-inner border-4 border-white/20 shrink-0">
                            <AvatarDisplay avatar={activeKid.avatar} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl font-black">{activeKid.name}</h2>
                                <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-xl text-sm font-bold border border-white/30 truncate max-w-[120px]">
                                    {activeKid.title || '成长中'}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-indigo-100 font-medium">
                                <span className="bg-indigo-900/40 px-2 py-0.5 rounded text-sm">Lv.{activeKid.level}</span>
                                <span>学力值: {activeKid.exp}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar bg-black/10 p-2 rounded-2xl w-full md:w-auto">
                        {kids.map(k => (
                            <button 
                                key={k.id} 
                                onClick={() => setActiveKidId(k.id)}
                                className={`relative shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${activeKidId === k.id ? 'bg-white shadow-lg scale-110 z-10' : 'bg-white/20 hover:bg-white/40'}`}
                            >
                                <AvatarDisplay avatar={k.avatar} />
                                {activeKidId === k.id && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-indigo-500 rounded-full"></div>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- Daily Metrics Row --- */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                    <div className="text-slate-400 font-bold mb-1 relative z-10 text-xs sm:text-sm">今日获得</div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-500 relative z-10 flex items-center gap-1">
                        + {transactions.filter(t => t.kidId === activeKidId && t.date === selectedDate && t.type === 'income').reduce((sum, t) => sum + t.amount, 0)}
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                    <div className="text-slate-400 font-bold mb-1 relative z-10 text-xs sm:text-sm">今日支出/扣分</div>
                    <div className="text-2xl sm:text-3xl font-black text-rose-500 relative z-10 flex items-center gap-1">
                        - {transactions.filter(t => t.kidId === activeKidId && t.date === selectedDate && t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0)}
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                    <div className="text-slate-400 font-bold mb-1 relative z-10 text-xs sm:text-sm">钱包余额</div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-500 relative z-10 flex items-center gap-1">
                        <Icons.Star size={18} className="fill-amber-400 hidden sm:block" /> {activeKid.money}
                    </div>
                </div>
            </div>

            {/* --- Supermarket Logs (Full Width) --- */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center"><Icons.Package size={18} /></div>
                        家庭超市动态
                    </h3>
                </div>
                <div className="flex-x overflow-x-auto pb-4 hide-scrollbar">
                    <div className="flex gap-4">
                        {orders.filter(o => o.kidId === activeKidId).length === 0 ? (
                            <div className="w-full h-32 flex flex-col items-center justify-center opacity-50 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                <Icons.Inbox className="w-10 h-10 mb-2 text-slate-300" />
                                <span className="text-slate-400 font-bold text-sm">还没有去过超市购物哦</span>
                            </div>
                        ) : (
                            orders.filter(o => o.kidId === activeKidId).map(o => (
                                <div key={o.id} className="min-w-[240px] bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-black text-slate-800 text-base">{o.itemName}</div>
                                        <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold">
                                            {o.status === 'completed' ? '已核销' : '待核销'}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end mt-4">
                                        <div className="text-[10px] text-slate-400 font-mono">{o.date}</div>
                                        <div className="font-black text-rose-500">- {o.price}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* --- Two Column Report Layout --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Task Column */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center"><Icons.Target size={18} /></div>
                            今日学习任务榜
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {tasks.filter(t => t.type === 'study' && (t.kidId === 'all' || t.kidId === activeKidId) && (t.days || []).includes(new Date(selectedDate).getDay())).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-50">
                                <Icons.Inbox className="w-12 h-12 mb-2 text-slate-300" />
                                <span className="text-slate-400 font-bold text-sm">今日空空如也</span>
                            </div>
                        ) : (
                            tasks.filter(t => t.type === 'study' && (t.kidId === 'all' || t.kidId === activeKidId) && (t.days || []).includes(new Date(selectedDate).getDay())).map(t => {
                                const entry = t.kidId === 'all' ? t.history?.[selectedDate]?.[activeKidId] : t.history?.[selectedDate];
                                const status = entry?.status || 'pending';
                                return (
                                    <div key={t.id} className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${status === 'completed' ? 'bg-emerald-500 text-white' : status === 'review' ? 'bg-amber-400 text-white' : 'bg-white text-slate-400 shadow-sm border border-slate-200'}`}>
                                            {status === 'completed' ? <Icons.Check size={20} /> : status === 'review' ? <Icons.Clock size={20} /> : <Icons.Target size={20} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-slate-800 truncate">{t.title}</div>
                                            <div className="text-[10px] font-bold text-slate-400 mt-0.5">{status === 'completed' ? '已完成' : status === 'review' ? '等待家长审核' : '待完成'}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Habit Column */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center"><Icons.Zap size={18} /></div>
                            今日习惯足迹
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {transactions.filter(t => t.kidId === activeKidId && t.date === selectedDate && t.category === 'habit').length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-50">
                                <Icons.Star className="w-12 h-12 mb-2 text-slate-300" />
                                <span className="text-slate-400 font-bold text-sm">今日未产生习惯足迹</span>
                            </div>
                        ) : (
                            transactions.filter(t => t.kidId === activeKidId && t.date === selectedDate && t.category === 'habit').map(tx => (
                                <div key={tx.id} className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'}`}>
                                            {tx.type === 'income' ? <Icons.ArrowUpCircle size={18} /> : <Icons.ArrowRightLeft size={18} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-700 max-w-[120px] sm:max-w-xs truncate">{tx.desc}</div>
                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>
                                    <div className={`font-black tracking-wide ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {tx.type === 'income' ? '+' : '-'}{Math.abs(tx.amount)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
