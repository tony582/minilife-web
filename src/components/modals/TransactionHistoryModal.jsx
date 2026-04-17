import React from 'react';
import { Icons } from '../../utils/Icons';
import { useTransactionDetails } from '../../hooks/useTransactionDetails.jsx';

export const TransactionHistoryModal = ({ context }) => {
    const parseTx = useTransactionDetails();
    const {
        showTransactionHistoryModal, setShowTransactionHistoryModal,
        transactionHistoryKidId, setTransactionHistoryKidId,
        transactionHistoryFilterTime, setTransactionHistoryFilterTime,
        transactionHistoryFilterType, setTransactionHistoryFilterType,
        transactionHistoryStartDate, setTransactionHistoryStartDate,
        transactionHistoryEndDate, setTransactionHistoryEndDate,
        activeKidId, kids, transactions
    } = context;

    if (!showTransactionHistoryModal) return null;

    const _C = {
        bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
        orange: '#FF8C42', teal: '#4ECDC4', coral: '#FF6B6B', green: '#10B981',
        textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
    };

    const modalKidId = transactionHistoryKidId || activeKidId;
    const modalKid = kids.find(k => k.id === modalKidId);

    let filteredTrans = transactions.filter(t => t.kidId === modalKidId && t.category !== 'habit');

    const now = new Date();
    if (transactionHistoryFilterTime !== 'all' && transactionHistoryFilterTime !== 'custom') {
        const days = parseInt(transactionHistoryFilterTime, 10);
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        filteredTrans = filteredTrans.filter(t => new Date(t.date) >= cutoff);
    } else if (transactionHistoryFilterTime === 'custom' && transactionHistoryStartDate && transactionHistoryEndDate) {
        const start = new Date(transactionHistoryStartDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(transactionHistoryEndDate);
        end.setHours(23, 59, 59, 999);
        filteredTrans = filteredTrans.filter(t => { const d = new Date(t.date); return d >= start && d <= end; });
    }

    if (transactionHistoryFilterType !== 'all') {
        filteredTrans = filteredTrans.filter(t => t.type === transactionHistoryFilterType);
    }

    const totalIncome = filteredTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    const totalExpense = filteredTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    const netChange = totalIncome - totalExpense;

    const groupedTrans = filteredTrans.reduce((acc, t) => {
        const dStr = new Date(t.date).toLocaleDateString();
        if (!acc[dStr]) acc[dStr] = [];
        acc[dStr].push(t);
        return acc;
    }, {});
    const sortedDates = Object.keys(groupedTrans).sort((a, b) => new Date(b) - new Date(a));

    return (
        <div className="fixed inset-0 z-[300] flex items-end md:items-center justify-center animate-fade-in" onClick={() => { setShowTransactionHistoryModal(false); setTransactionHistoryKidId(null); }}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <div className="relative w-full h-full md:w-[640px] md:h-auto md:max-h-[85vh] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden" style={{ background: _C.bg }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="px-5 py-4 flex items-center justify-between shrink-0" style={{ background: _C.bgCard, borderBottom: `1px solid ${_C.bgLight}` }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${_C.orange}12` }}>
                            <Icons.List size={16} style={{ color: _C.orange }} />
                        </div>
                        <div>
                            <h2 className="font-black text-base" style={{ color: _C.textPrimary }}>{modalKid ? `${modalKid.name}的交易记录` : '交易记录'}</h2>
                            <div className="text-[10px] font-bold" style={{ color: _C.textMuted }}>查看你的家庭币收支明细</div>
                        </div>
                    </div>
                    <button onClick={() => { setShowTransactionHistoryModal(false); setTransactionHistoryKidId(null); }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
                        style={{ background: _C.bgLight, color: _C.textMuted }}>
                        <Icons.X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-4 space-y-3.5">
                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { label: '时段获得', value: totalIncome, color: _C.green, icon: 'TrendingUp', prefix: '+' },
                                { label: '时段消费', value: totalExpense, color: _C.coral, icon: 'ShoppingBag', prefix: '-' },
                                { label: '净变化', value: netChange, color: _C.teal, icon: 'Activity', prefix: netChange >= 0 ? '+' : '' },
                                { label: '记录条数', value: filteredTrans.length, color: _C.orange, icon: 'Clock', prefix: '' },
                            ].map((s, i) => {
                                const IC = Icons[s.icon] || Icons.Star;
                                return (
                                    <div key={i} className="rounded-2xl p-3 text-center" style={{ background: _C.bgCard, border: `1px solid ${_C.bgLight}` }}>
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5" style={{ background: `${s.color}10` }}>
                                            <IC size={13} style={{ color: s.color }} />
                                        </div>
                                        <div className="text-[9px] font-bold mb-0.5" style={{ color: _C.textMuted }}>{s.label}</div>
                                        <div className="text-xs font-black" style={{ color: s.color }}>{s.prefix}{s.value.toLocaleString()}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Filters */}
                        <div className="rounded-2xl p-4" style={{ background: _C.bgCard, border: `1px solid ${_C.bgLight}` }}>
                            <div className="text-[10px] font-bold mb-2" style={{ color: _C.textMuted }}>统计时段</div>
                            <div className="flex flex-wrap gap-1.5">
                                {[{ id: 'all', label: '全部' }, { id: '7', label: '近7天' }, { id: '30', label: '近30天' }, { id: '90', label: '近90天' }, { id: 'custom', label: '自定义' }].map(f => (
                                    <button key={f.id} onClick={() => setTransactionHistoryFilterTime(f.id)}
                                        className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                                        style={{ background: transactionHistoryFilterTime === f.id ? _C.orange : _C.bg, color: transactionHistoryFilterTime === f.id ? '#fff' : _C.textMuted }}>
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                            {transactionHistoryFilterTime === 'custom' && (
                                <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl" style={{ background: _C.bg, border: `1px solid ${_C.bgLight}` }}>
                                    <input type="date" value={transactionHistoryStartDate} onChange={e => setTransactionHistoryStartDate(e.target.value)}
                                        className="flex-1 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none"
                                        style={{ background: _C.bgCard, border: `1px solid ${_C.bgLight}`, color: _C.textPrimary }} />
                                    <span className="text-xs font-bold" style={{ color: _C.textMuted }}>至</span>
                                    <input type="date" value={transactionHistoryEndDate} onChange={e => setTransactionHistoryEndDate(e.target.value)}
                                        className="flex-1 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none"
                                        style={{ background: _C.bgCard, border: `1px solid ${_C.bgLight}`, color: _C.textPrimary }} />
                                </div>
                            )}
                            <div className="text-[10px] font-bold mt-3 mb-2" style={{ color: _C.textMuted }}>交易类型</div>
                            <div className="flex gap-1.5">
                                {[{ id: 'all', label: '全部记录' }, { id: 'income', label: '收入' }, { id: 'expense', label: '支出' }].map(f => (
                                    <button key={f.id} onClick={() => setTransactionHistoryFilterType(f.id)}
                                        className="flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                                        style={{ background: transactionHistoryFilterType === f.id ? _C.orange : _C.bg, color: transactionHistoryFilterType === f.id ? '#fff' : _C.textMuted }}>
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Transaction List */}
                        {sortedDates.length === 0 ? (
                            <div className="text-center py-14 rounded-2xl" style={{ background: _C.bgCard, border: `1px solid ${_C.bgLight}` }}>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: _C.bg }}>
                                    <Icons.Wallet size={24} style={{ color: _C.textMuted }} />
                                </div>
                                <div className="text-sm font-black" style={{ color: _C.textSoft }}>暂无交易记录</div>
                                <div className="text-[11px] font-bold mt-1" style={{ color: _C.textMuted }}>调整筛选条件试试</div>
                            </div>
                        ) : (
                            <div className="pb-6">
                                {sortedDates.map(dateStr => {
                                    const dailyIncome = groupedTrans[dateStr].filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
                                    const dailyExpense = groupedTrans[dateStr].filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
                                    const isToday = new Date(dateStr).toDateString() === now.toDateString();

                                    return (
                                        <React.Fragment key={dateStr}>
                                            <div className="flex items-center justify-between px-1 pt-4 pb-2">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[11px] font-black" style={{ color: _C.textSoft }}>{dateStr}</span>
                                                    {isToday && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md" style={{ background: `${_C.orange}12`, color: _C.orange }}>今天</span>}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black">
                                                    {dailyIncome > 0 && <span style={{ color: _C.green }}>+{dailyIncome.toLocaleString()}</span>}
                                                    {dailyExpense > 0 && <span style={{ color: _C.coral }}>-{dailyExpense.toLocaleString()}</span>}
                                                </div>
                                            </div>
                                            {groupedTrans[dateStr].map((item, idx) => {
                                                const meta = parseTx(item);
                                                return (
                                                    <div key={item.id || `tx-${idx}`} className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-1" style={{ background: _C.bgCard }}>
                                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${meta.color}10` }}>
                                                                {meta.renderIcon(15)}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="font-bold text-xs leading-tight truncate" style={{ color: _C.textPrimary }}>{meta.title}</div>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${meta.color}08`, color: meta.color }}>{meta.label}</span>
                                                                    <span className="text-[9px] font-bold" style={{ color: _C.textMuted }}>{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="font-black text-sm shrink-0 ml-3" style={{ color: meta.amountColor }}>
                                                            {meta.amountStr}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
