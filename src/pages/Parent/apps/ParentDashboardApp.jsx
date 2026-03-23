import React, { useState, useMemo } from 'react';
import { useDataContext } from '../../../context/DataContext.jsx';
import { useUIContext } from '../../../context/UIContext.jsx';
import { Icons, AvatarDisplay } from '../../../utils/Icons';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, Legend,
    ResponsiveContainer
} from 'recharts';
import { isTaskDueOnDate } from '../../../utils/taskUtils';

const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
    orange: '#FF8C42', orangeHot: '#FF6B1A', yellow: '#FFD93D', teal: '#4ECDC4',
    coral: '#FF6B6B', green: '#10B981', purple: '#7C5CFC', blue: '#6C9CFF',
    pink: '#EC4899', indigo: '#6366F1',
    textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
    cardShadow: '0 2px 12px rgba(27,46,75,0.06)',
};

const PIE_COLORS = ['#7C5CFC', '#FF8C42', '#4ECDC4', '#FF6B6B', '#EC4899', '#6366F1', '#6C9CFF', '#10B981', '#F59E0B'];

// Get Monday of a given week
const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
    date.setHours(0, 0, 0, 0);
    return date;
};

const fmtDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

// Custom tooltip
const ChartTooltipContent = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="px-3 py-2 rounded-xl text-[11px] font-bold shadow-xl"
            style={{ background: C.bgCard, border: `1px solid ${C.bgLight}`, color: C.textPrimary }}>
            <div className="mb-1" style={{ color: C.textMuted }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color || p.fill }}>
                    {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
                </div>
            ))}
        </div>
    );
};

export const ParentDashboardApp = () => {
    const { kids, transactions, orders, tasks, activeKidId, setActiveKidId } = useDataContext();
    const { selectedDate } = useUIContext();
    const activeKid = kids.find(k => k.id === activeKidId);

    const [weekOffset, setWeekOffset] = useState(0);

    const monday = useMemo(() => {
        const m = getMonday(new Date());
        m.setDate(m.getDate() + weekOffset * 7);
        return m;
    }, [weekOffset]);

    const weekDates = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday);
            d.setDate(d.getDate() + i);
            return d;
        });
    }, [monday]);

    const weekDateStrs = useMemo(() => weekDates.map(fmtDate), [weekDates]);
    const sunday = weekDates[6];

    const weekLabel = `${monday.getMonth() + 1}/${monday.getDate()} - ${sunday.getMonth() + 1}/${sunday.getDate()}`;
    const getWeekNum = () => {
        const d = new Date(monday);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
        const w1 = new Date(d.getFullYear(), 0, 4);
        return 1 + Math.round(((d.getTime() - w1.getTime()) / 864e5 - 3 + (w1.getDay() + 6) % 7) / 7);
    };

    if (!activeKid) {
        return (
            <div className="text-center py-20 rounded-3xl" style={{ background: C.bgCard }}>
                <div className="text-5xl mb-4">👶</div>
                <h2 className="text-xl font-black" style={{ color: C.textPrimary }}>欢迎来到 MiniLife</h2>
                <p className="text-sm font-bold mt-2" style={{ color: C.textSoft }}>请先添加宝贝资料</p>
            </div>
        );
    }

    // ═══ DATA COMPUTATION ═══

    // Tasks for this kid in this week
    const weekTasks = useMemo(() => {
        return tasks.filter(t => t.type === 'study' && (t.kidId === 'all' || t.kidId === activeKidId));
    }, [tasks, activeKidId]);

    const taskStats = useMemo(() => {
        let completed = 0, total = 0;
        const catMap = {};
        const dailyData = weekDates.map((d, i) => {
            const dateStr = fmtDate(d);
            const dayTasks = weekTasks.filter(t => isTaskDueOnDate(t, dateStr));
            let dayCompleted = 0, dayTotal = dayTasks.length;
            total += dayTotal;

            dayTasks.forEach(t => {
                const historyObj = typeof t.history === 'string' ? JSON.parse(t.history || '{}') : (t.history || {});
                const entry = t.kidId === 'all' ? historyObj[dateStr]?.[activeKidId] : historyObj[dateStr];
                const isCompleted = entry?.status === 'completed';
                if (isCompleted) { dayCompleted++; completed++; }

                const cat = t.category || '其他';
                if (!catMap[cat]) catMap[cat] = { completed: 0, total: 0 };
                catMap[cat].total++;
                if (isCompleted) catMap[cat].completed++;
            });

            return { name: `周${DAY_LABELS[i]}`, completed: dayCompleted, total: dayTotal };
        });

        const categories = Object.entries(catMap)
            .map(([name, v]) => ({ name, ...v, rate: v.total > 0 ? Math.round(v.completed / v.total * 100) : 0 }))
            .sort((a, b) => b.total - a.total);

        return { completed, total, dailyData, categories, rate: total > 0 ? Math.round(completed / total * 100) : 0 };
    }, [weekTasks, weekDates, activeKidId]);

    // Habits
    const habitStats = useMemo(() => {
        const habitTasks = tasks.filter(t => t.type === 'habit' && (t.kidId === 'all' || t.kidId === activeKidId));
        const habitMap = {};
        let totalCheckins = 0, totalPoints = 0;

        const dailyData = weekDates.map((d, i) => {
            const dateStr = fmtDate(d);
            let dayCheckins = 0, dayPoints = 0;

            habitTasks.forEach(t => {
                const historyObj = typeof t.history === 'string' ? JSON.parse(t.history || '{}') : (t.history || {});
                const entry = t.kidId === 'all' ? historyObj[dateStr]?.[activeKidId] : historyObj[dateStr];
                if (entry?.status === 'completed' || entry?.count > 0) {
                    const count = entry?.count || 1;
                    dayCheckins += count;
                    const pts = (t.reward || 0) * count;
                    dayPoints += pts;

                    if (!habitMap[t.title]) habitMap[t.title] = { checkins: 0, points: 0, emoji: t.iconEmoji || '⏰' };
                    habitMap[t.title].checkins += count;
                    habitMap[t.title].points += pts;
                }
            });

            // Also count from transactions
            const habitTxs = transactions.filter(tx =>
                String(tx.kidId) === String(activeKidId) && tx.date === dateStr && tx.category === 'habit'
            );
            habitTxs.forEach(tx => {
                if (!habitMap[tx.desc]) {
                    dayCheckins++;
                    dayPoints += Math.abs(tx.amount);
                }
            });

            totalCheckins += dayCheckins;
            totalPoints += dayPoints;
            return { name: `周${DAY_LABELS[i]}`, checkins: dayCheckins, points: dayPoints };
        });

        const habits = Object.entries(habitMap)
            .map(([name, v]) => ({ name, ...v }))
            .sort((a, b) => b.checkins - a.checkins);

        return { totalCheckins, totalPoints, dailyData, habits };
    }, [tasks, transactions, weekDates, activeKidId]);

    // Shop purchases
    const shopStats = useMemo(() => {
        const weekOrders = orders.filter(o =>
            String(o.kidId) === String(activeKidId) && weekDateStrs.includes(o.date?.split('T')[0] || fmtDate(new Date(o.date)))
        );
        const totalSpent = weekOrders.reduce((s, o) => s + (o.price || 0), 0);
        const itemMap = {};
        weekOrders.forEach(o => {
            if (!itemMap[o.itemName]) itemMap[o.itemName] = { count: 0, spent: 0 };
            itemMap[o.itemName].count++;
            itemMap[o.itemName].spent += (o.price || 0);
        });
        const items = Object.entries(itemMap)
            .map(([name, v]) => ({ name, ...v }))
            .sort((a, b) => b.spent - a.spent);

        return { count: weekOrders.length, totalSpent, items };
    }, [orders, activeKidId, weekDateStrs]);

    // Finance
    const financeStats = useMemo(() => {
        const dailyData = weekDates.map((d, i) => {
            const dateStr = fmtDate(d);
            const dayTxs = transactions.filter(tx => String(tx.kidId) === String(activeKidId) && tx.date === dateStr);
            const income = dayTxs.filter(tx => tx.type === 'income').reduce((s, tx) => s + Math.abs(tx.amount), 0);
            const expense = dayTxs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + Math.abs(tx.amount), 0);
            return { name: `周${DAY_LABELS[i]}`, income, expense, net: income - expense };
        });

        const totalIncome = dailyData.reduce((s, d) => s + d.income, 0);
        const totalExpense = dailyData.reduce((s, d) => s + d.expense, 0);

        return { dailyData, totalIncome, totalExpense, net: totalIncome - totalExpense };
    }, [transactions, activeKidId, weekDates]);

    // ═══ RENDER ═══
    return (
        <div className="animate-fade-in -mx-4 md:-mx-8 px-0 pb-10" style={{ background: C.bg, minHeight: '100vh' }}>
          <div className="max-w-5xl mx-auto">

            {/* Hero */}
            <div className="relative overflow-hidden pb-4 px-4">

                {/* Kid switcher */}
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex items-center justify-center text-3xl sm:text-4xl ring-3 ring-white shadow-lg shrink-0" style={{ background: C.bgLight }}>
                            <AvatarDisplay avatar={activeKid.avatar} />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-2xl font-black" style={{ color: C.textPrimary }}>{activeKid.name}的周报</h1>
                            <p className="text-xs sm:text-sm font-bold" style={{ color: C.textSoft }}>Lv.{activeKid.level} · {activeKid.title || '成长中'}</p>
                        </div>
                    </div>
                    {kids.length > 1 && (
                        <div className="flex gap-1.5 ml-15 sm:ml-0">
                            {kids.map(k => (
                                <button key={k.id} onClick={() => setActiveKidId(k.id)}
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl transition-all"
                                    style={{
                                        background: activeKidId === k.id ? C.orange : C.bgCard,
                                        boxShadow: activeKidId === k.id ? `0 4px 14px ${C.orange}50` : C.cardShadow,
                                    }}>
                                    <AvatarDisplay avatar={k.avatar} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Week navigator */}
                <div className="relative z-10 flex items-center justify-center gap-3">
                    <button onClick={() => setWeekOffset(w => w - 1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                        style={{ background: C.bgCard, color: C.textSoft }}>
                        <Icons.ChevronLeft size={18} />
                    </button>
                    <div className="px-5 py-2 rounded-full text-sm font-black flex items-center gap-2"
                        style={{ background: C.bgCard, color: C.textPrimary, boxShadow: C.cardShadow }}>
                        <Icons.Calendar size={14} style={{ color: C.orange }} />
                        第{getWeekNum()}周 ({weekLabel})
                    </div>
                    <button onClick={() => setWeekOffset(w => w + 1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                        style={{ background: C.bgCard, color: C.textSoft }}
                        disabled={weekOffset >= 0}>
                        <Icons.ChevronRight size={18} />
                    </button>
                    {weekOffset !== 0 && (
                        <button onClick={() => setWeekOffset(0)}
                            className="px-3 py-1.5 rounded-full text-xs font-black text-white transition-all active:scale-95"
                            style={{ background: C.orange }}>
                            本周
                        </button>
                    )}
                </div>
            </div>

            <div className="px-4 space-y-4">

                {/* ═══ Summary Cards ═══ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {[
                        { emoji: '📚', label: '任务完成', value: `${taskStats.completed}/${taskStats.total}`, sub: `完成率 ${taskStats.rate}%`, color: C.orange },
                        { emoji: '⏰', label: '习惯打卡', value: `${habitStats.totalCheckins} 次`, sub: `+${habitStats.totalPoints} 金币`, color: C.teal },
                        { emoji: '🛒', label: '超市兑换', value: `${shopStats.count} 次`, sub: `-${shopStats.totalSpent} 金币`, color: C.purple },
                        { emoji: '💰', label: '财务净值', value: financeStats.net >= 0 ? `+${financeStats.net}` : `${financeStats.net}`, sub: `余额 ${activeKid.money || activeKid.balances?.spend || 0}`, color: financeStats.net >= 0 ? C.green : C.coral },
                    ].map((c, i) => (
                        <div key={i} className="rounded-2xl p-3 sm:p-4 relative overflow-hidden" style={{ background: C.bgCard, boxShadow: C.cardShadow }}>
                            <div className="absolute -right-3 -top-3 w-12 h-12 rounded-full opacity-10" style={{ background: c.color }}></div>
                            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{c.emoji}</div>
                            <div className="text-[10px] font-bold mb-0.5" style={{ color: C.textMuted }}>{c.label}</div>
                            <div className="text-lg sm:text-xl font-black" style={{ color: c.color }}>{c.value}</div>
                            <div className="text-[10px] font-bold mt-0.5" style={{ color: C.textSoft }}>{c.sub}</div>
                        </div>
                    ))}
                </div>

                {/* ═══ Study Task Analysis ═══ */}
                <div className="rounded-2xl p-5" style={{ background: C.bgCard, boxShadow: C.cardShadow }}>
                    <h3 className="text-base font-black mb-4 flex items-center gap-2" style={{ color: C.textPrimary }}>
                        <div className="w-1 h-5 rounded-full" style={{ background: C.orange }}></div>
                        学习任务分析
                    </h3>
                    <div className="h-48 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={taskStats.dailyData} barSize={16}>
                                <CartesianGrid strokeDasharray="3 3" stroke={C.bgLight} vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.textMuted, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: C.textMuted }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="total" name="总任务" fill={C.bgMuted} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="completed" name="已完成" fill={C.orange} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Category breakdown */}
                    {taskStats.categories.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-xs font-bold" style={{ color: C.textMuted }}>科目完成率</div>
                            {taskStats.categories.slice(0, 6).map((cat, i) => (
                                <div key={cat.name} className="flex items-center gap-3">
                                    <span className="text-xs font-bold w-16 truncate" style={{ color: C.textPrimary }}>{cat.name}</span>
                                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: C.bgLight }}>
                                        <div className="h-full rounded-full transition-all" style={{ width: `${cat.rate}%`, background: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                                    </div>
                                    <span className="text-xs font-black w-12 text-right" style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>{cat.rate}%</span>
                                    <span className="text-[10px] font-bold w-10 text-right" style={{ color: C.textMuted }}>{cat.completed}/{cat.total}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ═══ Habit Analysis ═══ */}
                <div className="rounded-2xl p-5" style={{ background: C.bgCard, boxShadow: C.cardShadow }}>
                    <h3 className="text-base font-black mb-4 flex items-center gap-2" style={{ color: C.textPrimary }}>
                        <div className="w-1 h-5 rounded-full" style={{ background: C.teal }}></div>
                        习惯养成分析
                    </h3>
                    <div className="h-48 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={habitStats.dailyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={C.bgLight} vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.textMuted, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: C.textMuted }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Line type="monotone" dataKey="checkins" name="打卡次数" stroke={C.teal} strokeWidth={2.5} dot={{ r: 4, fill: C.teal }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="points" name="获得金币" stroke={C.orange} strokeWidth={2} dot={{ r: 3, fill: C.orange }} strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Habit detail list */}
                    {habitStats.habits.length > 0 ? (
                        <div className="space-y-1.5">
                            <div className="flex items-center text-[10px] font-bold px-1" style={{ color: C.textMuted }}>
                                <span className="flex-1">习惯名称</span>
                                <span className="w-16 text-center">打卡次数</span>
                                <span className="w-16 text-right">获得金币</span>
                            </div>
                            {habitStats.habits.map(h => (
                                <div key={h.name} className="flex items-center px-3 py-2 rounded-xl" style={{ background: C.bgLight }}>
                                    <span className="mr-2 text-base">{h.emoji}</span>
                                    <span className="flex-1 text-xs font-bold truncate" style={{ color: C.textPrimary }}>{h.name}</span>
                                    <span className="w-16 text-center text-xs font-black" style={{ color: C.teal }}>{h.checkins}</span>
                                    <span className="w-16 text-right text-xs font-black" style={{ color: C.orange }}>+{h.points}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-xs font-bold" style={{ color: C.textMuted }}>本周暂无打卡记录</div>
                    )}
                </div>

                {/* ═══ Shopping Behavior ═══ */}
                <div className="rounded-2xl p-5" style={{ background: C.bgCard, boxShadow: C.cardShadow }}>
                    <h3 className="text-base font-black mb-4 flex items-center gap-2" style={{ color: C.textPrimary }}>
                        <div className="w-1 h-5 rounded-full" style={{ background: C.purple }}></div>
                        消费行为
                    </h3>
                    {shopStats.items.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Pie chart */}
                            <div className="h-52 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={shopStats.items}
                                            dataKey="spent"
                                            nameKey="name"
                                            cx="50%" cy="50%"
                                            innerRadius={45} outerRadius={75}
                                            paddingAngle={3}
                                            strokeWidth={0}
                                        >
                                            {shopStats.items.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<ChartTooltipContent />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Item list */}
                            <div className="space-y-1.5">
                                {shopStats.items.map((item, i) => (
                                    <div key={item.name} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: C.bgLight }}>
                                        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                                        <span className="flex-1 text-xs font-bold truncate" style={{ color: C.textPrimary }}>{item.name}</span>
                                        <span className="text-[10px] font-bold" style={{ color: C.textMuted }}>{item.count}次</span>
                                        <span className="text-xs font-black" style={{ color: C.coral }}>-{item.spent}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-xs font-bold" style={{ color: C.textMuted }}>本周暂无消费记录</div>
                    )}
                </div>

                {/* ═══ Financial Trends ═══ */}
                <div className="rounded-2xl p-5" style={{ background: C.bgCard, boxShadow: C.cardShadow }}>
                    <h3 className="text-base font-black mb-4 flex items-center gap-2" style={{ color: C.textPrimary }}>
                        <div className="w-1 h-5 rounded-full" style={{ background: C.green }}></div>
                        财务趋势
                    </h3>
                    <div className="h-52 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={financeStats.dailyData}>
                                <defs>
                                    <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={C.green} stopOpacity={0.3} />
                                        <stop offset="100%" stopColor={C.green} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={C.coral} stopOpacity={0.3} />
                                        <stop offset="100%" stopColor={C.coral} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={C.bgLight} vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.textMuted, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: C.textMuted }} axisLine={false} tickLine={false} width={30} />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Area type="monotone" dataKey="income" name="收入" stroke={C.green} strokeWidth={2} fill="url(#gradIncome)" dot={{ r: 3, fill: C.green }} />
                                <Area type="monotone" dataKey="expense" name="支出" stroke={C.coral} strokeWidth={2} fill="url(#gradExpense)" dot={{ r: 3, fill: C.coral }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Summary row */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-xl p-3 text-center" style={{ background: `${C.green}10` }}>
                            <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>总收入</div>
                            <div className="text-lg font-black" style={{ color: C.green }}>+{financeStats.totalIncome}</div>
                        </div>
                        <div className="rounded-xl p-3 text-center" style={{ background: `${C.coral}10` }}>
                            <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>总支出</div>
                            <div className="text-lg font-black" style={{ color: C.coral }}>-{financeStats.totalExpense}</div>
                        </div>
                        <div className="rounded-xl p-3 text-center" style={{ background: financeStats.net >= 0 ? `${C.green}10` : `${C.coral}10` }}>
                            <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>净变化</div>
                            <div className="text-lg font-black" style={{ color: financeStats.net >= 0 ? C.green : C.coral }}>
                                {financeStats.net >= 0 ? '+' : ''}{financeStats.net}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
          </div>
        </div>
    );
};
