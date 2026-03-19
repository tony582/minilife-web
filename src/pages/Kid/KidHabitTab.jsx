import React, { useState } from 'react';
import { useDataContext } from '../../context/DataContext.jsx';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { useTaskManager } from '../../hooks/useTaskManager';
import { getWeeklyCompletionCount } from '../../hooks/useTasks';
import { Icons, renderIcon } from '../../utils/Icons';

// Warm Headspace theme constants
const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
    orange: '#FF8C42', orangeHot: '#FF6B1A', yellow: '#FFD93D', teal: '#4ECDC4',
    coral: '#FF6B6B', green: '#10B981', red: '#EF4444',
    textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
    cardShadow: '0 2px 12px rgba(27,46,75,0.06)',
    dropShadow: '0 20px 50px rgba(27,46,75,0.12)',
};

export const KidHabitTab = () => {
    const authC = useAuthContext();
    const dataC = useDataContext();
    const uiC = useUIContext();

    const { transactions, tasks, activeKidId } = dataC;
    const { selectedDate, historyFilter, setHistoryFilter } = uiC;
    const { handleAttemptSubmit } = useTaskManager(authC, dataC, uiC);

    const [searchKidHabitKeyword, setSearchKidHabitKeyword] = useState('');
    const [habitCardFilter, setHabitCardFilter] = useState('all');
    const [showSearchOverlay, setShowSearchOverlay] = useState(false);

    const todayTransactions = transactions.filter(t => t.kidId === activeKidId && t.category === 'habit' && new Date(t.date).toDateString() === new Date().toDateString());
    const todayEarned = todayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const todayDeducted = todayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // Filtered habits
    const allHabits = tasks.filter(t => t.type === 'habit' && (!searchKidHabitKeyword || t.title.toLowerCase().includes(searchKidHabitKeyword.toLowerCase())));
    const filteredHabits = allHabits.filter(t => {
        const entry = t.kidId === 'all' ? t.history?.[selectedDate]?.[activeKidId] : t.history?.[selectedDate];
        const count = Array.isArray(entry) ? entry.length : (entry?.count || (entry?.status === 'completed' ? 1 : 0));
        let currentLimitCount = count;
        if (t.habitType === 'multiple' && t.periodMaxType === 'weekly') currentLimitCount = getWeeklyCompletionCount(t, activeKidId, selectedDate);
        const maxPerDay = t.periodMaxPerDay || t.maxPerDay || 1;
        const isDone = (t.habitType === 'daily_once' && count >= 1) || (t.habitType === 'multiple' && currentLimitCount >= maxPerDay);
        if (habitCardFilter === 'income') return t.reward >= 0;
        if (habitCardFilter === 'expense') return t.reward < 0;
        if (habitCardFilter === 'completed') return isDone;
        if (habitCardFilter === 'pending') return !isDone;
        return true;
    });

    // Separate good/bad habit stats
    const getHabitDone = (t) => {
        const entry = t.kidId === 'all' ? t.history?.[selectedDate]?.[activeKidId] : t.history?.[selectedDate];
        const count = Array.isArray(entry) ? entry.length : (entry?.count || (entry?.status === 'completed' ? 1 : 0));
        let currentLimitCount = count;
        if (t.habitType === 'multiple' && t.periodMaxType === 'weekly') currentLimitCount = getWeeklyCompletionCount(t, activeKidId, selectedDate);
        const maxPerDay = t.periodMaxPerDay || t.maxPerDay || 1;
        return (t.habitType === 'daily_once' && count >= 1) || (t.habitType === 'multiple' && currentLimitCount >= maxPerDay);
    };
    const goodHabits = allHabits.filter(t => t.reward >= 0);
    const badHabits = allHabits.filter(t => t.reward < 0);
    const goodDone = goodHabits.filter(getHabitDone).length;
    const badDone = badHabits.filter(getHabitDone).length;
    const goodPct = goodHabits.length > 0 ? Math.round((goodDone / goodHabits.length) * 100) : 0;
    const badPct = badHabits.length > 0 ? Math.round((badDone / badHabits.length) * 100) : 0;

    return (
        <div className="animate-fade-in -mx-4 md:-mx-8 px-0 pb-10" style={{ background: C.bg, minHeight: '100vh' }}>
          <div className="max-w-5xl mx-auto">

            {/* ═══ Hero: Two merged stat cards ═══ */}
            <div className="relative pb-4 px-4">
                <div className="absolute -top-32 -left-20 w-56 h-56 rounded-full opacity-15" style={{ background: C.teal }}></div>
                <div className="absolute -top-20 -left-12 w-40 h-40 rounded-full opacity-10" style={{ background: C.green }}></div>

                <div className="relative z-10 flex gap-3">
                    {/* Good habits card */}
                    <div className="flex-1 p-4 rounded-2xl" style={{ background: C.bgCard, boxShadow: C.cardShadow }}>
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 shrink-0">
                                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                                    <circle cx="24" cy="24" r="20" fill="none" stroke={`${C.teal}20`} strokeWidth="4" />
                                    <circle cx="24" cy="24" r="20" fill="none" stroke={C.teal} strokeWidth="4" strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 20}`} strokeDashoffset={`${2 * Math.PI * 20 * (1 - goodPct / 100)}`}
                                        className="transition-all duration-700" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Icons.TrendingUp size={16} style={{ color: C.teal }} />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>好习惯</div>
                                <div className="text-xl font-black leading-tight" style={{ color: C.teal }}>+{todayEarned}</div>
                                <div className="text-[10px] font-bold mt-0.5" style={{ color: C.textMuted }}>{goodDone}/{goodHabits.length} 完成</div>
                            </div>
                        </div>
                    </div>

                    {/* Bad habits card */}
                    <div className="flex-1 p-4 rounded-2xl" style={{ background: C.bgCard, boxShadow: C.cardShadow }}>
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 shrink-0">
                                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                                    <circle cx="24" cy="24" r="20" fill="none" stroke={`${C.coral}20`} strokeWidth="4" />
                                    <circle cx="24" cy="24" r="20" fill="none" stroke={C.coral} strokeWidth="4" strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 20}`} strokeDashoffset={`${2 * Math.PI * 20 * (1 - badPct / 100)}`}
                                        className="transition-all duration-700" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Icons.TrendingDown size={16} style={{ color: C.coral }} />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>坏习惯</div>
                                <div className="text-xl font-black leading-tight" style={{ color: C.coral }}>-{todayDeducted}</div>
                                <div className="text-[10px] font-bold mt-0.5" style={{ color: C.textMuted }}>{badDone}/{badHabits.length} 记录</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ Toolbar: Search + Filter ═══ */}
            <div className="px-4 mb-4">
                <div className="flex items-center gap-2">
                    {/* PC: inline search bar */}
                    <div className="relative flex-1 min-w-0 hidden md:block">
                        <Icons.Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textMuted }} />
                        <input type="text" placeholder="搜索习惯..." value={searchKidHabitKeyword} onChange={e => setSearchKidHabitKeyword(e.target.value)}
                            className="w-full text-sm font-bold rounded-xl pl-9 pr-8 py-2.5 focus:outline-none transition-all placeholder:font-normal border-none"
                            style={{ background: C.bgCard, color: C.textPrimary, caretColor: C.teal }}
                        />
                        {searchKidHabitKeyword && (
                            <button onClick={() => setSearchKidHabitKeyword('')} className="absolute inset-y-0 right-0 pr-3 flex items-center" style={{ color: C.textMuted }}><Icons.X size={14} /></button>
                        )}
                    </div>
                    {/* Mobile: search icon → overlay */}
                    <button onClick={() => setShowSearchOverlay(true)}
                        className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
                        style={{ background: searchKidHabitKeyword ? C.teal : C.bgCard, color: searchKidHabitKeyword ? '#fff' : C.textMuted }}>
                        <Icons.Search size={16} />
                    </button>
                    <div className="flex items-center gap-1 p-1 rounded-xl flex-1 md:flex-none shrink-0 overflow-x-auto hide-scrollbar" style={{ background: C.bgCard }}>
                        {[
                            { id: 'all', label: '全部' },
                            { id: 'income', label: '好习惯' },
                            { id: 'expense', label: '坏习惯' },
                            { id: 'completed', label: '已打卡' },
                            { id: 'pending', label: '未打卡' }
                        ].map(f => (
                            <button key={f.id} onClick={() => setHabitCardFilter(f.id)}
                                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex-1 md:flex-none"
                                style={{ background: habitCardFilter === f.id ? C.teal : 'transparent', color: habitCardFilter === f.id ? '#fff' : C.textMuted }}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile search overlay */}
            {showSearchOverlay && (
                <div className="fixed inset-0 z-[300] md:hidden animate-fade-in" style={{ background: 'rgba(27,46,75,0.3)', backdropFilter: 'blur(8px)' }}
                    onClick={() => setShowSearchOverlay(false)}>
                    <div className="pt-[env(safe-area-inset-top)] px-4 mt-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2 p-2 rounded-2xl" style={{ background: C.bgCard, boxShadow: C.dropShadow }}>
                            <Icons.Search size={18} className="ml-2 shrink-0" style={{ color: C.textMuted }} />
                            <input type="text" placeholder="搜索习惯名称..." value={searchKidHabitKeyword}
                                onChange={e => setSearchKidHabitKeyword(e.target.value)}
                                autoFocus
                                className="flex-1 text-sm font-bold py-2.5 focus:outline-none border-none bg-transparent"
                                style={{ color: C.textPrimary, caretColor: C.teal }}
                            />
                            <button onClick={() => { setSearchKidHabitKeyword(''); setShowSearchOverlay(false); }}
                                className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold"
                                style={{ color: C.teal }}>取消</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Habit Cards ═══ */}
            <div className="px-4 mb-6">
                {filteredHabits.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl" style={{ background: C.bgCard }}>
                        <div className="text-5xl mb-4">🌱</div>
                        <div className="text-lg font-black" style={{ color: C.textPrimary }}>没有找到该习惯哦</div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {filteredHabits.map(t => {
                            const isNegative = t.reward < 0;
                            const entry = t.kidId === 'all' ? t.history?.[selectedDate]?.[activeKidId] : t.history?.[selectedDate];
                            const count = Array.isArray(entry) ? entry.length : (entry?.count || (entry?.status === 'completed' ? 1 : 0));
                            let currentLimitCount = count;
                            if (t.habitType === 'multiple' && t.periodMaxType === 'weekly') currentLimitCount = getWeeklyCompletionCount(t, activeKidId, selectedDate);
                            const maxPerDay = t.periodMaxPerDay || t.maxPerDay || 1;
                            const isDailyOnce = t.habitType === 'daily_once';
                            const isMaxedOut = t.habitType === 'multiple' && currentLimitCount >= maxPerDay;
                            const isDone = (isDailyOnce && count >= 1) || isMaxedOut;

                            const accentColor = isNegative ? C.coral : C.teal;
                            const displayMax = isDailyOnce ? 1 : maxPerDay;
                            const displayCount = isDailyOnce ? (count >= 1 ? 1 : 0) : currentLimitCount;

                            return (
                                <div key={t.id}
                                    className="flex items-center gap-3 rounded-xl p-3 transition-all hover:shadow-md relative overflow-hidden"
                                    style={{
                                        background: isDone ? (isNegative ? `${C.coral}08` : `${C.teal}08`) : C.bgCard,
                                        border: `1px solid ${isDone ? (isNegative ? `${C.coral}25` : `${C.teal}25`) : C.bgLight}`,
                                    }}>
                                    {/* Left accent bar */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: accentColor }}></div>

                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${isNegative ? '' : `bg-gradient-to-br ${t.habitColor || 'from-emerald-400 to-teal-500'}`}`}
                                        style={isNegative ? { background: `${C.coral}18`, color: C.coral } : { color: '#fff' }}>
                                        {t.iconEmoji || renderIcon(t.iconName, 20)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="font-bold text-sm truncate" style={{
                                                color: isDone ? (isNegative ? '#6B7280' : C.textSoft) : C.textPrimary,
                                                textDecoration: isDone && !isNegative ? 'line-through' : 'none',
                                            }}>{t.title}</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 items-center">
                                            <span className="text-[10px] font-bold px-1.5 py-px rounded"
                                                style={{ background: `${accentColor}12`, color: accentColor }}>
                                                {isNegative ? `扣${Math.abs(t.reward)}` : `+${t.reward}`}
                                            </span>
                                            {/* Progress dots or bar */}
                                            {(() => {
                                                const useProgressBar = displayMax > 7 || (t.habitType === 'multiple' && t.periodMaxType === 'weekly');
                                                if (useProgressBar) {
                                                    const label = t.periodMaxType === 'weekly' ? '周' : '日';
                                                    return (
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: C.bgLight }}>
                                                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (displayCount / displayMax) * 100)}%`, background: accentColor }}></div>
                                                            </div>
                                                            <span className="text-[9px] font-bold" style={{ color: C.textMuted }}>{displayCount}/{displayMax}{label}</span>
                                                        </div>
                                                    );
                                                } else if (displayMax > 1) {
                                                    return (
                                                        <div className="flex gap-0.5 items-center">
                                                            {Array.from({ length: displayMax }).map((_, i) => (
                                                                <div key={i} className="w-2 h-2 rounded-full transition-all" style={{
                                                                    background: i < displayCount ? accentColor : C.bgLight,
                                                                    boxShadow: i < displayCount ? `0 0 6px ${accentColor}60` : 'none',
                                                                }} />
                                                            ))}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                            {isDone && (
                                                <span className="text-[10px] font-bold flex items-center gap-0.5" style={{ color: isNegative ? C.coral : C.green }}>
                                                    <Icons.CheckCircle size={10} /> {isNegative ? '已达上限' : '已达标'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <div className="shrink-0">
                                        {isDone ? (
                                            <div className="w-9 h-9 rounded-full flex items-center justify-center"
                                                style={{ background: isNegative ? `${C.coral}15` : `${C.green}15` }}>
                                                {isNegative ? <Icons.ShieldAlert size={16} style={{ color: C.coral }} /> : <Icons.CheckCircle size={16} style={{ color: C.green }} />}
                                            </div>
                                        ) : (
                                            <button onClick={() => handleAttemptSubmit(t)}
                                                className="rounded-full py-1.5 px-4 text-xs font-black text-white transition-all active:scale-95 flex items-center gap-1"
                                                style={{ background: isNegative ? C.coral : C.teal, boxShadow: `0 4px 12px ${isNegative ? C.coral : C.teal}40` }}>
                                                {isNegative ? <><Icons.ShieldAlert size={12} /> 坦白</> : <><Icons.Zap size={12} /> 打卡</>}
                                                {count > 0 && <span className="text-[9px] opacity-80">({count})</span>}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ═══ Activity Log ═══ */}
            <div className="px-4">
                <div className="rounded-2xl overflow-hidden" style={{ background: C.bgCard, boxShadow: C.cardShadow }}>
                    <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.bgLight}` }}>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${C.teal}18` }}>
                                <Icons.TrendingUp size={14} style={{ color: C.teal }} />
                            </div>
                            <h3 className="font-black text-sm" style={{ color: C.textPrimary }}>近期足迹</h3>
                        </div>
                        <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: C.bgLight }}>
                            {[['all','全部'],['income','获得'],['expense','扣分']].map(([id,l]) => (
                                <button key={id} onClick={() => setHistoryFilter(id)}
                                    className="px-2.5 py-1 rounded-md text-[11px] font-bold transition-all"
                                    style={{ background: historyFilter === id ? C.bgCard : 'transparent', color: historyFilter === id ? (id === 'expense' ? C.coral : C.teal) : C.textMuted, boxShadow: historyFilter === id ? C.cardShadow : 'none' }}>{l}</button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 relative">
                        {transactions.filter(t => t.kidId === activeKidId && t.category === 'habit' && (historyFilter === 'all' || t.type === historyFilter)).length === 0 ? (
                            <div className="text-center py-10 rounded-xl text-sm font-bold" style={{ color: C.textMuted, background: C.bg }}>
                                {historyFilter === 'all' ? '暂无足迹记录，快去打卡吧！' : '没有相关记录。'}
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[22rem] overflow-y-auto pr-1">
                                {transactions.filter(t => t.kidId === activeKidId && t.category === 'habit' && (historyFilter === 'all' || t.type === historyFilter)).slice(0, 30).map((item, idx) => {
                                    const isIncome = item.type === 'income';
                                    const displayAmount = isIncome ? `+${item.amount}` : `-${item.amount}`;
                                    const cleanTitle = item.title.replace(/\(Exp\)/i, '').replace(/^(记录成长[:：\s]*)+/u, '').trim();

                                    return (
                                        <div key={item.id || `habit-tx-${idx}`}
                                            className="flex items-center gap-3 p-3 rounded-xl transition-all"
                                            style={{ background: C.bg }}>
                                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: isIncome ? C.teal : C.coral, boxShadow: `0 0 6px ${isIncome ? C.teal : C.coral}50` }}></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm truncate" style={{ color: C.textPrimary }}>{cleanTitle}</div>
                                                <div className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: C.textMuted }}>
                                                    <Icons.Clock size={9} />
                                                    {new Date(item.date).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <div className="text-sm font-black shrink-0 px-2 py-1 rounded-lg"
                                                style={{ color: isIncome ? C.teal : C.coral, background: isIncome ? `${C.teal}12` : `${C.coral}12` }}>
                                                {displayAmount}
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
        </div>
    );
};
