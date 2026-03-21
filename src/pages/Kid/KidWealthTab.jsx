import React, { useState } from 'react';
import { useDataContext } from '../../context/DataContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons } from '../../utils/Icons';
import { isTaskDueOnDate } from '../../utils/taskUtils';
import { formatDate } from '../../utils/dateUtils';

// Shared warm Headspace theme (same as KidHabitTab / KidStudyTab)
const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
    orange: '#FF8C42', orangeHot: '#FF6B1A', yellow: '#FFD93D', teal: '#4ECDC4',
    coral: '#FF6B6B', green: '#10B981', red: '#EF4444',
    textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
};

// Map transaction categories to flat icon + color
const txMeta = (item) => {
    const isIncome = item.type === 'income';
    if (item.category === 'interest' || item.title?.includes('利息') || item.title?.includes('生息'))
        return { icon: 'Sparkles', color: C.teal, label: '利息' };
    if (item.category === 'charity' || item.category === 'give' || item.title?.includes('爱心') || item.title?.includes('公益') || item.title?.includes('捐'))
        return { icon: 'Heart', color: '#EC4899', label: '爱心' };
    if (item.category === 'habit')
        return { icon: 'CheckCircle', color: C.teal, label: '打卡' };
    if (item.category === 'purchase' || item.category === 'shop')
        return { icon: 'ShoppingBag', color: C.coral, label: '兑换' };
    if (isIncome)
        return { icon: 'TrendingUp', color: C.green, label: '收入' };
    return { icon: 'ShoppingBag', color: C.coral, label: '消费' };
};

export const KidWealthTab = () => {
    const { transactions, kids, activeKidId, tasks } = useDataContext();
    const activeKid = kids.find(k => k.id === activeKidId);
    const {
        setShowInterestDetailsModal,
        setShowTransactionHistoryModal
    } = useUIContext();

    const [txFilter, setTxFilter] = useState('all'); // all | income | expense

    if (!activeKid) return null;

    const allTx = transactions
        .filter(t => t.kidId === activeKidId && t.category !== 'habit');

    // Unified balance
    const totalBalance = activeKid.balances?.spend || 0;


    // Today's tasks summary — how many can still earn coins
    const todayStr = formatDate(new Date());
    const myStudyTasks = tasks.filter(t => (t.kidId === activeKidId || t.kidId === 'all') && t.type === 'study' && isTaskDueOnDate(t, todayStr));
    const myHabitTasks = tasks.filter(t => (t.kidId === activeKidId || t.kidId === 'all') && t.type === 'habit');

    const completedStudy = myStudyTasks.filter(t => {
        const entry = t.kidId === 'all' ? t.history?.[todayStr]?.[activeKidId] : t.history?.[todayStr];
        if (Array.isArray(entry)) return entry.some(e => e.status === 'completed');
        return entry?.status === 'completed';
    }).length;
    const completedHabit = myHabitTasks.filter(t => {
        const entry = t.kidId === 'all' ? t.history?.[todayStr]?.[activeKidId] : t.history?.[todayStr];
        const count = Array.isArray(entry) ? entry.length : (entry?.count || (entry?.status === 'completed' ? 1 : 0));
        return count >= 1;
    }).length;

    // Potential earnings from incomplete tasks today
    const pendingStudyReward = myStudyTasks
        .filter(t => {
            const entry = t.kidId === 'all' ? t.history?.[todayStr]?.[activeKidId] : t.history?.[todayStr];
            if (Array.isArray(entry)) return !entry.some(e => e.status === 'completed');
            return entry?.status !== 'completed';
        })
        .reduce((sum, t) => sum + (t.reward || 0), 0);

    const pendingHabitReward = myHabitTasks
        .filter(t => {
            if (t.reward < 0) return false;
            const entry = t.kidId === 'all' ? t.history?.[todayStr]?.[activeKidId] : t.history?.[todayStr];
            const count = Array.isArray(entry) ? entry.length : (entry?.count || (entry?.status === 'completed' ? 1 : 0));
            return count < 1;
        })
        .reduce((sum, t) => sum + (t.reward || 0), 0);

    const totalPending = pendingStudyReward + pendingHabitReward;

    // Time-range stats — weekly / monthly
    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);

    const weeklyIncome = allTx.filter(t => t.type === 'income' && new Date(t.date) >= weekAgo).reduce((s, t) => s + (t.amount || 0), 0);
    const monthlyIncome = allTx.filter(t => t.type === 'income' && new Date(t.date) >= monthAgo).reduce((s, t) => s + (t.amount || 0), 0);
    const totalSpent = allTx.filter(t => t.type !== 'income').reduce((s, t) => s + (t.amount || 0), 0);

    // Filtered recent transactions for the list
    const filteredTx = allTx
        .filter(t => {
            if (txFilter === 'income') return t.type === 'income';
            if (txFilter === 'expense') return t.type !== 'income';
            return true;
        })
        .slice(0, 20);

    // Today's earned (completed tasks today)
    const todayEarned = allTx
        .filter(t => t.type === 'income' && new Date(t.date).toDateString() === now.toDateString())
        .reduce((s, t) => s + (t.amount || 0), 0);

    return (
        <div className="animate-fade-in -mx-4 md:-mx-8 px-0 pb-10" style={{ background: C.bg, minHeight: '100vh' }}>
            <div className="max-w-5xl mx-auto">

                {/* ═══ Hero Section ═══ */}
                <div className="relative overflow-hidden pb-5 px-4">
                    {/* Decorative blobs — same as habit/task tabs */}
                    <div className="absolute -top-32 -left-20 w-56 h-56 rounded-full opacity-15" style={{ background: C.orange }}></div>
                    <div className="absolute -top-20 -left-12 w-40 h-40 rounded-full opacity-10" style={{ background: C.yellow }}></div>
                    <div className="absolute -top-16 right-8 w-24 h-24 rounded-full opacity-8" style={{ background: C.teal }}></div>

                    {/* Title */}
                    <div className="relative z-10 mb-5 pt-1">
                        <div className="text-2xl font-black" style={{ color: C.textPrimary }}>
                            我的小金库
                        </div>
                        <div className="text-sm font-bold mt-0.5" style={{ color: C.textSoft }}>
                            管理你的家庭币，学会理财
                        </div>
                    </div>

                    {/* ═══ Balance Card — Clean white ═══ */}
                    <div className="relative z-10 rounded-3xl p-6 overflow-hidden"
                        style={{
                            background: C.bgCard,
                            boxShadow: '0 4px 24px rgba(27,46,75,0.06)',
                            border: `1px solid ${C.bgLight}`,
                        }}>
                        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-[0.04]" style={{ background: C.orange }}></div>
                        <div className="absolute -right-4 -bottom-8 w-28 h-28 rounded-full opacity-[0.03]" style={{ background: C.teal }}></div>

                        <div className="relative z-10">
                            {/* Label */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                    style={{ background: `${C.orange}12` }}>
                                    <Icons.Wallet size={16} style={{ color: C.orange }} />
                                </div>
                                <span className="text-xs font-bold" style={{ color: C.textMuted }}>家庭币余额</span>
                            </div>

                            {/* Main balance */}
                            <div className="mb-4">
                                <div className="text-5xl md:text-6xl font-black tracking-tight leading-none" style={{ color: C.textPrimary }}>
                                    {totalBalance.toLocaleString()}
                                </div>
                                <div className="text-sm font-bold mt-1.5" style={{ color: C.textMuted }}>
                                    家庭币
                                </div>
                            </div>

                            {/* Time-range stats row — weekly / monthly / spent */}
                            <div className="flex items-center gap-4 mb-4 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                    <Icons.TrendingUp size={12} style={{ color: C.green }} />
                                    <span className="text-[11px] font-bold" style={{ color: C.textSoft }}>
                                        本周 <span className="font-black" style={{ color: C.green }}>+{weeklyIncome.toLocaleString()}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Icons.TrendingUp size={12} style={{ color: C.teal }} />
                                    <span className="text-[11px] font-bold" style={{ color: C.textSoft }}>
                                        本月 <span className="font-black" style={{ color: C.teal }}>+{monthlyIncome.toLocaleString()}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Icons.TrendingDown size={12} style={{ color: C.coral }} />
                                    <span className="text-[11px] font-bold" style={{ color: C.textSoft }}>
                                        已消费 <span className="font-black" style={{ color: C.coral }}>{totalSpent.toLocaleString()}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Pending Income Capsule */}
                            {totalPending > 0 && (
                                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl"
                                    style={{ background: `${C.green}08`, border: `1px solid ${C.green}18` }}>
                                    <Icons.Clock size={13} style={{ color: C.green }} />
                                    <span className="text-xs font-bold" style={{ color: C.green }}>
                                        今日还可赚 <span className="font-black">+{totalPending}</span>
                                    </span>
                                </div>
                            )}
                            {totalPending === 0 && myStudyTasks.length + myHabitTasks.length > 0 && (
                                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl"
                                    style={{ background: `${C.green}08`, border: `1px solid ${C.green}18` }}>
                                    <Icons.CheckCircle size={13} style={{ color: C.green }} />
                                    <span className="text-xs font-bold" style={{ color: C.green }}>
                                        今日任务全部搞定！
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ═══ Today's Earning Breakdown — reference-inspired ═══ */}
                <div className="mx-4 mb-4 rounded-2xl p-5 relative overflow-hidden"
                    style={{ background: C.bgCard, border: `1px solid ${C.bgLight}`, boxShadow: '0 2px 12px rgba(27,46,75,0.04)' }}>
                    <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-[0.05]" style={{ background: C.orange }}></div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: `${C.orange}10` }}>
                                    <Icons.Zap size={16} style={{ color: C.orange }} />
                                </div>
                                <div>
                                    <div className="font-black text-sm" style={{ color: C.textPrimary }}>今日收入明细</div>
                                    <div className="text-[11px] font-bold" style={{ color: C.textMuted }}>
                                        已赚取 <span style={{ color: C.green }}>+{todayEarned}</span> 家庭币
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Breakdown items */}
                        <div className="space-y-2">
                            {/* Study tasks */}
                            <div className="flex items-center justify-between py-2.5 px-3 rounded-xl" style={{ background: C.bg }}>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                        style={{ background: `${C.orange}10` }}>
                                        <Icons.BookOpen size={14} style={{ color: C.orange }} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold" style={{ color: C.textPrimary }}>学习任务</div>
                                        <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>
                                            已完成 {completedStudy}/{myStudyTasks.length} 个
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {pendingStudyReward > 0 ? (
                                        <span className="text-xs font-black" style={{ color: C.orange }}>可赚 +{pendingStudyReward}</span>
                                    ) : (
                                        <span className="text-xs font-black" style={{ color: C.green }}>
                                            <Icons.CheckCircle size={11} className="inline mr-0.5" style={{ verticalAlign: '-1px' }} /> 全部完成
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Habit tasks */}
                            <div className="flex items-center justify-between py-2.5 px-3 rounded-xl" style={{ background: C.bg }}>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                        style={{ background: `${C.teal}10` }}>
                                        <Icons.ShieldCheck size={14} style={{ color: C.teal }} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold" style={{ color: C.textPrimary }}>习惯打卡</div>
                                        <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>
                                            已打卡 {completedHabit}/{myHabitTasks.length} 个
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {pendingHabitReward > 0 ? (
                                        <span className="text-xs font-black" style={{ color: C.teal }}>可赚 +{pendingHabitReward}</span>
                                    ) : (
                                        <span className="text-xs font-black" style={{ color: C.green }}>
                                            <Icons.CheckCircle size={11} className="inline mr-0.5" style={{ verticalAlign: '-1px' }} /> 全部完成
                                        </span>
                                    )}
                                </div>
                            </div>



                            {/* Full attendance bonus hint */}
                            {totalPending > 0 && (
                                <div className="flex items-center gap-2 pt-2 px-1">
                                    <Icons.Award size={13} style={{ color: C.orange }} />
                                    <span className="text-[11px] font-bold" style={{ color: C.orange }}>
                                        今天最多还能获得 <span className="font-black">{totalPending}</span> 家庭币
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>



                {/* ═══ 4-stat Summary Grid ═══ */}
                <div className="grid grid-cols-4 gap-2.5 px-4 mb-4">
                    {[
                        { label: '总收入', value: allTx.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0), color: C.green, icon: 'TrendingUp' },
                        { label: '总支出', value: totalSpent, color: C.coral, icon: 'ShoppingBag' },
                        { label: '净收益', value: allTx.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0) - totalSpent, color: C.teal, icon: 'Activity' },
                        { label: '交易数', value: allTx.length, color: C.orange, icon: 'Clock' },
                    ].map((s, i) => {
                        const IconCmp = Icons[s.icon] || Icons.Star;
                        return (
                            <div key={i} className="rounded-2xl p-3 text-center"
                                style={{ background: C.bgCard, border: `1px solid ${C.bgLight}` }}>
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5"
                                    style={{ background: `${s.color}10` }}>
                                    <IconCmp size={13} style={{ color: s.color }} />
                                </div>
                                <div className="text-[10px] font-bold mb-0.5" style={{ color: C.textMuted }}>{s.label}</div>
                                <div className="text-sm font-black" style={{ color: s.color }}>{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</div>
                            </div>
                        );
                    })}
                </div>

                {/* ═══ Transaction History — Banking App style with filter ═══ */}
                <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: C.bgCard, border: `1px solid ${C.bgLight}` }}>
                    {/* Header with filter tabs */}
                    <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.bgLight}` }}>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: `${C.orange}10` }}>
                                <Icons.List size={15} style={{ color: C.orange }} />
                            </div>
                            <h3 className="font-black text-sm" style={{ color: C.textPrimary }}>交易记录</h3>
                        </div>
                        <button onClick={() => setShowTransactionHistoryModal(true)}
                            className="text-xs font-bold flex items-center gap-0.5 transition-all active:scale-95"
                            style={{ color: C.orange }}>
                            全部 <Icons.ChevronRight size={12} />
                        </button>
                    </div>

                    {/* Filter tabs */}
                    <div className="px-4 pt-3 pb-1 flex items-center gap-1.5">
                        {[
                            { id: 'all', label: '全部记录' },
                            { id: 'income', label: '收入', icon: 'TrendingUp' },
                            { id: 'expense', label: '支出', icon: 'TrendingDown' },
                        ].map(f => {
                            const isActive = txFilter === f.id;
                            return (
                                <button key={f.id} onClick={() => setTxFilter(f.id)}
                                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                                    style={{
                                        background: isActive ? C.orange : C.bg,
                                        color: isActive ? '#fff' : C.textMuted,
                                    }}>
                                    {f.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-3">
                        {filteredTx.length === 0 ? (
                            <div className="text-center py-14">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                                    style={{ background: C.bg }}>
                                    <Icons.Wallet size={24} style={{ color: C.textMuted }} />
                                </div>
                                <div className="text-sm font-black" style={{ color: C.textSoft }}>
                                    {txFilter === 'all' ? '还没有交易记录' : txFilter === 'income' ? '暂无收入记录' : '暂无支出记录'}
                                </div>
                                <div className="text-[11px] font-bold mt-1" style={{ color: C.textMuted }}>
                                    完成任务就能赚到家庭币啦！
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredTx.map((item, idx) => {
                                    const isIncome = item.type === 'income';
                                    const meta = txMeta(item);
                                    const IconCmp = Icons[meta.icon] || Icons.Star;
                                    return (
                                        <div key={item.id || `tx-${idx}`}
                                            className="flex items-center justify-between px-3 py-3 rounded-xl transition-all hover:shadow-sm"
                                            style={{ background: C.bg }}>
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                                    style={{ background: `${meta.color}10` }}>
                                                    <IconCmp size={17} style={{ color: meta.color }} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-bold text-[13px] leading-tight truncate" style={{ color: C.textPrimary }}>
                                                        {item.title}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                                                            style={{ background: `${meta.color}08`, color: meta.color }}>
                                                            {meta.label}
                                                        </span>
                                                        <span className="text-[10px] font-bold" style={{ color: C.textMuted }}>
                                                            {new Date(item.date).toLocaleString([], {
                                                                month: '2-digit', day: '2-digit',
                                                                hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="font-black text-sm shrink-0 ml-3" style={{ color: isIncome ? C.green : C.textPrimary }}>
                                                {isIncome ? '+' : '-'}{item.amount?.toLocaleString()}
                                            </div>
                                        </div>
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
