import React, { useState } from 'react';
import { useDataContext } from '../../context/DataContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons, AvatarDisplay } from '../../utils/Icons';
import { AreaChart, Area, Tooltip, XAxis } from 'recharts';

// Warm Headspace theme
const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
    orange: '#FF8C42', orangeHot: '#FF6B1A', yellow: '#FFD93D', teal: '#4ECDC4',
    coral: '#FF6B6B', green: '#10B981', red: '#EF4444', pink: '#EC4899',
    textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
};

// Time filter options
const TIME_FILTERS = [
    { id: 'today', label: '今天' },
    { id: 'week', label: '本周' },
    { id: 'month', label: '本月' },
    { id: 'all', label: '全部' },
];

// Custom tooltip
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-lg"
            style={{ background: C.bgCard, border: `1px solid ${C.bgLight}`, color: C.textPrimary }}>
            <div style={{ color: C.textMuted }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color }}>
                    {p.name === 'task' ? '学习任务' : '习惯养成'} +{p.value.toLocaleString()}
                </div>
            ))}
        </div>
    );
};

// Helper: get Monday of the current week
const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Mon=0 offset
    date.setDate(date.getDate() + diff);
    return date;
};

export const ParentWealthTab = () => {
    const { kids, transactions } = useDataContext();
    const { setShowTransactionHistoryModal, setTransactionHistoryKidId } = useUIContext();
    const [timeFilter, setTimeFilter] = useState('today');

    const now = new Date();
    const todayStr = now.toDateString();

    // Build current week Mon→Sun
    const monday = getMonday(now);
    const weekDays = [];
    const weekLabels = ['一', '二', '三', '四', '五', '六', '日'];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(d.getDate() + i);
        weekDays.push(d);
    }

    // Time filter cutoff
    const getFilterCutoff = () => {
        if (timeFilter === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (timeFilter === 'week') return monday;
        if (timeFilter === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
        return new Date(0); // 'all'
    };
    const cutoff = getFilterCutoff();

    const openKidDetails = (kidId) => {
        setTransactionHistoryKidId(kidId);
        setShowTransactionHistoryModal(true);
    };

    return (
        <div className="animate-fade-in pb-4">
            {/* ═══ Header ═══ */}
            <div className="relative overflow-hidden pb-4 -mx-4 md:-mx-8 px-4 md:px-8 mb-1">
                <div className="absolute -top-32 -left-20 w-56 h-56 rounded-full opacity-15" style={{ background: C.orange }}></div>
                <div className="absolute -top-20 -left-12 w-40 h-40 rounded-full opacity-10" style={{ background: C.yellow }}></div>
                <div className="absolute -top-16 right-8 w-24 h-24 rounded-full opacity-8" style={{ background: C.teal }}></div>

                <div className="relative z-10 pt-1 flex items-end justify-between">
                    <div>
                        <div className="text-2xl font-black" style={{ color: C.textPrimary }}>全家财富总览</div>
                        <div className="text-sm font-bold mt-0.5" style={{ color: C.textSoft }}>了解孩子的学习与行为表现</div>
                    </div>

                    {/* Time filter pills */}
                    <div className="flex items-center gap-1 shrink-0">
                        {TIME_FILTERS.map(f => (
                            <button key={f.id} onClick={() => setTimeFilter(f.id)}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                                style={{
                                    background: timeFilter === f.id ? C.orange : 'transparent',
                                    color: timeFilter === f.id ? '#fff' : C.textMuted,
                                }}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ Per-Kid Cards ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {kids.map(k => {
                    const balance = k.balances?.spend || 0;
                    const kidTx = transactions.filter(t => t.kidId === k.id);
                    const filteredTx = kidTx.filter(t => new Date(t.date) >= cutoff);

                    // Behavioral breakdown — filtered by time period
                    const taskIncome = filteredTx.filter(t => t.category === 'task' && t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
                    const habitIncome = filteredTx.filter(t => t.category === 'habit' && t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
                    const shopSpend = filteredTx.filter(t => (t.category === 'shop' || t.category === 'purchase') && t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
                    const charitySpend = filteredTx.filter(t => (t.category === 'charity' || t.category === 'give' || t.category === 'wish' || t.title?.includes('爱心') || t.title?.includes('公益'))).reduce((s, t) => s + (t.amount || 0), 0);
                    const penaltyAmount = filteredTx.filter(t => t.category === 'habit' && t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);

                    // Chart: Mon→Sun task vs habit income (always this week)
                    const chartData = weekDays.map((d, i) => {
                        const dayStr = d.toDateString();
                        const dayTask = kidTx.filter(t => t.category === 'task' && t.type === 'income' && new Date(t.date).toDateString() === dayStr).reduce((s, t) => s + (t.amount || 0), 0);
                        const dayHabit = kidTx.filter(t => t.category === 'habit' && t.type === 'income' && new Date(t.date).toDateString() === dayStr).reduce((s, t) => s + (t.amount || 0), 0);
                        return { name: weekLabels[i], task: dayTask, habit: dayHabit };
                    });

                    return (
                        <div key={k.id} className="rounded-3xl overflow-hidden"
                            style={{ background: C.bgCard, boxShadow: '0 4px 24px rgba(27,46,75,0.06)', border: `1px solid ${C.bgLight}` }}>

                            {/* ── Kid Header ── */}
                            <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${C.bgLight}` }}>
                                <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg overflow-hidden shrink-0 bg-amber-50"
                                    style={{ border: `2px solid ${C.bgLight}` }}>
                                    <AvatarDisplay avatar={k.avatar} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-black text-base truncate" style={{ color: C.textPrimary }}>{k.name}</div>
                                    <div className="text-[11px] font-bold" style={{ color: C.textMuted }}>Lv.{k.level}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>家庭币</div>
                                    <div className="text-2xl font-black" style={{ color: C.orange }}>{balance.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="p-5 space-y-4">

                                {/* ── Behavioral Breakdown ── */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    {[
                                        { label: '学习任务', value: taskIncome, color: C.orange, icon: Icons.BookOpen, desc: '完成任务获得' },
                                        { label: '好习惯', value: habitIncome, color: C.teal, icon: Icons.CheckCircle, desc: '坚持打卡获得' },
                                        { label: '超市兑换', value: shopSpend, color: C.coral, icon: Icons.ShoppingBag, desc: '兑换商品消费', prefix: '-' },
                                        { label: '坏习惯', value: penaltyAmount, color: C.red, icon: Icons.AlertCircle, desc: '行为提醒扣分', prefix: '-' },
                                    ].map((s, i) => {
                                        const IconCmp = s.icon;
                                        return (
                                            <div key={i} className="rounded-2xl p-3.5"
                                                style={{ background: C.bg, border: `1px solid ${C.bgLight}` }}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                                                        style={{ background: `${s.color}12` }}>
                                                        <IconCmp size={12} style={{ color: s.color }} />
                                                    </div>
                                                    <span className="text-[10px] font-bold" style={{ color: C.textMuted }}>{s.label}</span>
                                                </div>
                                                <div className="text-lg font-black" style={{ color: s.value > 0 ? s.color : C.textMuted }}>
                                                    {s.prefix || '+'}{s.value.toLocaleString()}
                                                </div>
                                                <div className="text-[9px] font-bold mt-0.5" style={{ color: C.textMuted }}>{s.desc}</div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Charity capsule — only if any */}
                                {charitySpend > 0 && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                        style={{ background: `${C.pink}06`, border: `1px solid ${C.pink}12` }}>
                                        <Icons.Heart size={12} style={{ color: C.pink }} />
                                        <span className="text-[10px] font-bold" style={{ color: C.pink }}>
                                            爱心公益 <span className="font-black">-{charitySpend.toLocaleString()}</span>
                                        </span>
                                    </div>
                                )}

                                {/* ── Weekly Chart: Mon→Sun ── */}
                                <div className="rounded-2xl p-4 pb-1" style={{ background: C.bg }}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>本周收入 · 任务 vs 习惯</div>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 text-[9px] font-bold" style={{ color: C.textMuted }}>
                                                <span className="w-2 h-2 rounded-full" style={{ background: C.orange }}></span> 任务
                                            </span>
                                            <span className="flex items-center gap-1 text-[9px] font-bold" style={{ color: C.textMuted }}>
                                                <span className="w-2 h-2 rounded-full" style={{ background: C.teal }}></span> 习惯
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ width: '100%', height: 80 }}>
                                        <AreaChart data={chartData} width={500} height={76} margin={{ top: 4, right: 4, bottom: 0, left: 10 }}
                                            style={{ width: '100%', height: '100%' }}>
                                            <defs>
                                                <linearGradient id={`gradTask-${k.id}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={C.orange} stopOpacity={0.25} />
                                                    <stop offset="100%" stopColor={C.orange} stopOpacity={0.02} />
                                                </linearGradient>
                                                <linearGradient id={`gradHabit-${k.id}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={C.teal} stopOpacity={0.25} />
                                                    <stop offset="100%" stopColor={C.teal} stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" axisLine={false} tickLine={false}
                                                tick={{ fontSize: 9, fill: C.textMuted, fontWeight: 700 }} dy={4} />
                                            <Tooltip content={<ChartTooltip />} cursor={false} />
                                            <Area type="monotone" dataKey="task" name="task"
                                                stroke={C.orange} strokeWidth={2} fill={`url(#gradTask-${k.id})`}
                                                dot={false} activeDot={{ r: 3, fill: C.orange, strokeWidth: 0 }} />
                                            <Area type="monotone" dataKey="habit" name="habit"
                                                stroke={C.teal} strokeWidth={2} fill={`url(#gradHabit-${k.id})`}
                                                dot={false} activeDot={{ r: 3, fill: C.teal, strokeWidth: 0 }} />
                                        </AreaChart>
                                    </div>
                                </div>

                                {/* ── View Details Button ── */}
                                <button onClick={() => openKidDetails(k.id)}
                                    className="w-full text-xs font-bold flex items-center justify-center gap-1.5 py-3 rounded-2xl transition-all active:scale-[0.98]"
                                    style={{ background: `${C.orange}08`, color: C.orange, border: `1px solid ${C.orange}15` }}>
                                    <Icons.List size={14} />
                                    查看{k.name}的完整明细
                                    <Icons.ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
