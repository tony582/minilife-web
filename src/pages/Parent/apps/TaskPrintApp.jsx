import React, { useState, useMemo, useRef } from 'react';
import { useDataContext } from '../../../context/DataContext.jsx';
import { Icons, AvatarDisplay } from '../../../utils/Icons';
import { isTaskDueOnDate } from '../../../utils/taskUtils';

const fmtDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const WEEKDAY_CN = ['日', '一', '二', '三', '四', '五', '六'];
const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
    date.setHours(0, 0, 0, 0);
    return date;
};

const getStartTime = (t) => {
    if (t.startTime) return t.startTime;
    if (t.timeStr && t.timeStr.includes('-')) return t.timeStr.split('-')[0].trim();
    if (t.timeStr && /^\d{1,2}:\d{2}/.test(t.timeStr)) return t.timeStr.match(/^(\d{1,2}:\d{2})/)[1];
    return '';
};

const getTimeDisplay = (t) => {
    if (t.timeStr) return t.timeStr;
    const st = getStartTime(t);
    return st || '';
};

const parseTimeMinutes = (timeStr) => {
    if (!timeStr) return -1;
    const m = timeStr.match(/(\d{1,2}):(\d{2})/);
    return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : -1;
};

const sortTasks = (tasks, sortBy) => {
    const sorted = [...tasks];
    if (sortBy === 'time') {
        sorted.sort((a, b) => {
            const ta = parseTimeMinutes(getStartTime(a));
            const tb = parseTimeMinutes(getStartTime(b));
            if (ta === -1 && tb === -1) return 0;
            if (ta === -1) return 1;
            if (tb === -1) return -1;
            return ta - tb;
        });
    } else if (sortBy === 'category') {
        sorted.sort((a, b) => (a.category || '其他').localeCompare(b.category || '其他', 'zh'));
    }
    return sorted;
};

// Categorize tasks into time blocks
const categorizeByTimeBlock = (tasks) => {
    const blocks = { morning: [], afternoon: [], evening: [], unscheduled: [] };
    tasks.forEach(t => {
        const mins = parseTimeMinutes(getStartTime(t));
        if (mins === -1) blocks.unscheduled.push(t);
        else if (mins < 720) blocks.morning.push(t);     // before 12:00
        else if (mins < 1080) blocks.afternoon.push(t);   // 12:00 - 18:00
        else blocks.evening.push(t);                       // after 18:00
    });
    return blocks;
};

// ═══ Print CSS ═══
const PRINT_CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif; color: #111; padding: 16px; line-height: 1.45; }
.print-page { max-width: 700px; margin: 0 auto; }
.header { text-align: center; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 2.5px solid #111; }
.header h1 { font-size: 18px; font-weight: 900; letter-spacing: 1px; }
.header .meta { font-size: 10px; color: #555; margin-top: 3px; }
.goal-box { border: 1.5px dashed #999; border-radius: 6px; padding: 8px 12px; margin-bottom: 14px; }
.goal-label { font-size: 12px; font-weight: 900; }
.goal-line { border-bottom: 1px solid #ccc; height: 24px; margin-left: 4px; flex: 1; }
.time-block { margin-bottom: 10px; }
.block-title { font-size: 12px; font-weight: 900; padding: 3px 8px; margin-bottom: 4px; border-left: 3px solid #333; background: #f5f5f5; }
table { width: 100%; border-collapse: collapse; font-size: 11px; }
th { background: #f0f0f0; font-weight: 800; text-align: left; padding: 5px 6px; border: 1px solid #ccc; font-size: 10px; }
td { padding: 6px; border: 1px solid #ccc; vertical-align: top; }
.cb { width: 13px; height: 13px; border: 1.5px solid #666; border-radius: 2px; display: inline-block; }
.section { margin-bottom: 12px; }
.section-title { font-size: 12px; font-weight: 900; padding: 3px 0; margin-bottom: 5px; border-bottom: 1.5px solid #333; }
.habit-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
.habit-item { display: flex; align-items: center; gap: 3px; padding: 4px 5px; border: 1px solid #ddd; border-radius: 3px; font-size: 10px; }
.reflection { border: 1.5px solid #333; border-radius: 6px; padding: 10px 12px; margin-top: 12px; }
.reflect-title { font-size: 12px; font-weight: 900; margin-bottom: 6px; }
.reflect-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 2px; font-size: 11px; }
.reflect-label { font-weight: 700; white-space: nowrap; min-width: 110px; }
.reflect-line { border-bottom: 1px dashed #bbb; height: 24px; flex: 1; }
.stars { display: flex; gap: 4px; margin-top: 2px; }
.star { width: 18px; height: 18px; border: 1.5px solid #888; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; }
.footer { text-align: center; font-size: 8px; color: #aaa; margin-top: 12px; padding-top: 6px; border-top: 1px solid #ddd; }
.week-grid { display: grid; grid-template-columns: repeat(7, 1fr); border: 1px solid #ccc; }
.week-col { border-right: 1px solid #ccc; min-width: 0; }
.week-col:last-child { border-right: none; }
.week-col-header { background: #f0f0f0; text-align: center; padding: 5px 2px; font-weight: 800; font-size: 11px; border-bottom: 1px solid #ccc; }
.week-col-header .date { font-size: 9px; color: #777; font-weight: 600; }
.week-item { padding: 3px 4px; border-bottom: 1px solid #eee; font-size: 9px; }
.week-goal { border-top: 1px dashed #ccc; padding: 3px 4px; min-height: 22px; font-size: 8px; color: #bbb; }
.weekend { background: #fafafa; }
@media print { body { padding: 8px; } .no-print { display: none !important; } }
`;

// ═══ Shared table styles ═══
const TH = { background: '#f0f0f0', fontWeight: 800, textAlign: 'left', padding: '5px 7px', border: '1px solid #bbb', fontSize: 10 };
const TD = { padding: '6px 7px', border: '1px solid #bbb', verticalAlign: 'top', fontSize: 11 };
const TABLE = { width: '100%', borderCollapse: 'collapse', fontSize: 11 };

// ═══ Task Table Component ═══
const TaskTable = ({ tasks, showDetails }) => (
    <table style={TABLE}>
        <thead>
            <tr>
                <th style={{ ...TH, width: 72 }}>时间</th>
                <th style={{ ...TH, width: 62 }}>科目</th>
                <th style={TH}>学习内容</th>
                <th style={{ ...TH, width: 36, textAlign: 'center' }}>✓</th>
                <th style={{ ...TH, width: 86 }}>备注</th>
            </tr>
        </thead>
        <tbody>
            {tasks.map(t => (
                <tr key={t.id}>
                    <td style={{ ...TD, fontSize: 10, color: '#444' }}>{getTimeDisplay(t) || '—'}</td>
                    <td style={{ ...TD, fontWeight: 700, fontSize: 10 }}>{t.category || '其他'}</td>
                    <td style={TD}>
                        <span style={{ fontWeight: 700 }}>{t.title}</span>
                        {showDetails && (t.standards || t.desc) && (
                            <div style={{ fontSize: 9, color: '#777', marginTop: 2 }}>▸ {t.standards || t.desc}</div>
                        )}
                    </td>
                    <td style={{ ...TD, textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', width: 13, height: 13, border: '1.5px solid #666', borderRadius: 2 }}></span>
                    </td>
                    <td style={TD}></td>
                </tr>
            ))}
        </tbody>
    </table>
);

// ═══ Main Component ═══
export const TaskPrintApp = () => {
    const { kids, tasks, activeKidId, setActiveKidId } = useDataContext();
    const activeKid = kids.find(k => k.id === activeKidId);
    const printRef = useRef(null);

    const [mode, setMode] = useState('daily');
    const [date, setDate] = useState(fmtDate(new Date()));
    const [sortBy, setSortBy] = useState('time');
    const [showDetails, setShowDetails] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);

    const dateObj = new Date(date + 'T00:00:00');
    const weekday = WEEKDAY_CN[dateObj.getDay()];
    const monday = useMemo(() => getMonday(dateObj), [date]);
    const weekDates = useMemo(() =>
        Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(d.getDate() + i); return d; }),
        [monday]
    );

    // Daily data
    const studyTasks = useMemo(() => {
        const raw = tasks.filter(t => t.type === 'study' && (t.kidId === 'all' || t.kidId === activeKidId) && isTaskDueOnDate(t, date));
        return sortTasks(raw, sortBy);
    }, [tasks, activeKidId, date, sortBy]);

    const habitTasks = useMemo(() =>
        tasks.filter(t => t.type === 'habit' && (t.kidId === 'all' || t.kidId === activeKidId) && isTaskDueOnDate(t, date)),
        [tasks, activeKidId, date]
    );

    const timeBlocks = useMemo(() => categorizeByTimeBlock(studyTasks), [studyTasks]);

    // Weekly data
    const weeklyTasks = useMemo(() => {
        return weekDates.map(d => {
            const ds = fmtDate(d);
            const raw = tasks.filter(t => t.type === 'study' && (t.kidId === 'all' || t.kidId === activeKidId) && isTaskDueOnDate(t, ds));
            return sortTasks(raw, sortBy);
        });
    }, [tasks, activeKidId, weekDates, sortBy]);

    const handlePrint = () => {
        const content = printRef.current;
        if (!content) return;
        const pw = window.open('', '_blank');
        pw.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${activeKid?.name || ''}的学习计划</title><style>${PRINT_CSS}</style></head><body>${content.innerHTML}</body></html>`);
        pw.document.close();
        setTimeout(() => pw.print(), 300);
    };

    if (!activeKid) {
        return (
            <div className="text-center py-20 rounded-3xl bg-white">
                <div className="text-5xl mb-4">👶</div>
                <p className="text-sm font-bold text-slate-400">请先添加宝贝资料</p>
            </div>
        );
    }

    const sortOptions = [
        { id: 'time', label: '按时间段' },
        { id: 'category', label: '按科目' },
        { id: 'default', label: '默认顺序' },
    ];

    const weekLabel = `${monday.getFullYear()}年${monday.getMonth() + 1}月${monday.getDate()}日 — ${weekDates[6].getMonth() + 1}月${weekDates[6].getDate()}日`;

    const BLOCK_META = [
        { key: 'morning',  icon: '▌', label: '上午', sub: '12:00 前' },
        { key: 'afternoon', icon: '▐', label: '下午', sub: '12:00 — 18:00' },
        { key: 'evening',  icon: '▍', label: '晚上', sub: '18:00 后' },
    ];

    return (
        <div className="animate-fade-in space-y-3">

            {/* ═══ Toolbar ═══ */}
            <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl p-2.5 shadow-sm border border-slate-100">
                {/* Mode toggle */}
                <div className="flex bg-slate-100 rounded-lg p-0.5">
                    <button onClick={() => setMode('daily')}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-black transition-all ${mode === 'daily' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                        每日计划
                    </button>
                    <button onClick={() => setMode('weekly')}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-black transition-all ${mode === 'weekly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                        周计划
                    </button>
                </div>

                {/* Date nav */}
                <div className="flex items-center gap-1">
                    <button onClick={() => { const d = new Date(date + 'T00:00:00'); d.setDate(d.getDate() - (mode === 'weekly' ? 7 : 1)); setDate(fmtDate(d)); }}
                        className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-500">
                        <Icons.ChevronLeft size={14} />
                    </button>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        className="text-xs font-bold px-2 py-1.5 rounded-md bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-300 w-[130px]" />
                    <button onClick={() => { const d = new Date(date + 'T00:00:00'); d.setDate(d.getDate() + (mode === 'weekly' ? 7 : 1)); setDate(fmtDate(d)); }}
                        className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-500">
                        <Icons.ChevronRight size={14} />
                    </button>
                </div>

                {/* Sort */}
                <div className="relative">
                    <button onClick={() => setShowSortMenu(!showSortMenu)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-50 border border-slate-200">
                        排序 <Icons.ChevronDown size={12} />
                    </button>
                    {showSortMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)}></div>
                            <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 min-w-[130px]">
                                {sortOptions.map(opt => (
                                    <button key={opt.id} onClick={() => { setSortBy(opt.id); setShowSortMenu(false); }}
                                        className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center gap-2 ${sortBy === opt.id ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}>
                                        {sortBy === opt.id ? <Icons.Check size={12} /> : <span className="w-3"></span>}
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Details toggle — renamed */}
                <label className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-50 border border-slate-200 select-none">
                    <input type="checkbox" checked={showDetails} onChange={e => setShowDetails(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-blue-600" />
                    显示任务说明
                </label>

                {/* Kid switcher + print — circular avatars */}
                <div className="flex items-center gap-2 ml-auto">
                    {kids.length > 1 && kids.map(k => (
                        <button key={k.id} onClick={() => setActiveKidId(k.id)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-base transition-all border-2 ${activeKidId === k.id ? 'border-slate-500 ring-2 ring-slate-300 bg-slate-50' : 'border-slate-200 bg-white'}`}>
                            <AvatarDisplay avatar={k.avatar} />
                        </button>
                    ))}
                    <button onClick={handlePrint}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black text-white bg-slate-800 hover:bg-slate-700 active:scale-95 shadow-sm">
                        <Icons.Printer size={13} />
                        打印 / 导出
                    </button>
                </div>
            </div>

            {/* ═══ Preview ═══ */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div ref={printRef}>
                    <div style={{ fontFamily: '-apple-system, "PingFang SC", "Noto Sans SC", sans-serif', color: '#111', maxWidth: 700, margin: '0 auto', padding: '24px 28px' }}>

                        {/* Header */}
                        <div style={{ textAlign: 'center', paddingBottom: 10, marginBottom: 12, borderBottom: '2.5px solid #111' }}>
                            <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 1 }}>
                                {mode === 'weekly' ? `${activeKid.name} 的周学习计划` : `${activeKid.name} 的今日计划`}
                            </div>
                            <div style={{ fontSize: 10, color: '#555', marginTop: 3 }}>
                                {mode === 'weekly' ? weekLabel : `${date}  星期${weekday}`}
                            </div>
                        </div>

                        {mode === 'daily' ? (
                            <>
                                {/* ═══ Daily Goal ═══ */}
                                <div style={{ border: '1.5px dashed #999', borderRadius: 6, padding: '8px 12px', marginBottom: 14 }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                        <span style={{ fontSize: 12, fontWeight: 900, whiteSpace: 'nowrap' }}>◆ 今日目标：</span>
                                        <div style={{ borderBottom: '1px solid #ccc', height: 22, flex: 1 }}></div>
                                    </div>
                                </div>

                                {/* ═══ Time-blocked Tasks ═══ */}
                                {BLOCK_META.map(({ key, icon, label, sub }) => {
                                    const blockTasks = timeBlocks[key];
                                    if (blockTasks.length === 0) return null;
                                    return (
                                        <div key={key} style={{ marginBottom: 10 }}>
                                            <div style={{ fontSize: 12, fontWeight: 900, padding: '3px 8px', marginBottom: 4, borderLeft: '3px solid #333', background: '#f5f5f5' }}>
                                                {icon} {label} <span style={{ fontSize: 9, fontWeight: 600, color: '#888' }}>({sub})</span>
                                            </div>
                                            <TaskTable tasks={blockTasks} showDetails={showDetails} />
                                        </div>
                                    );
                                })}

                                {/* Unscheduled tasks */}
                                {timeBlocks.unscheduled.length > 0 && (
                                    <div style={{ marginBottom: 10 }}>
                                        <div style={{ fontSize: 12, fontWeight: 900, padding: '3px 8px', marginBottom: 4, borderLeft: '3px solid #aaa', background: '#fafafa' }}>
                                            ◇ 自由安排 <span style={{ fontSize: 9, fontWeight: 600, color: '#888' }}>(未设定时间)</span>
                                        </div>
                                        <TaskTable tasks={timeBlocks.unscheduled} showDetails={showDetails} />
                                    </div>
                                )}

                                {/* Empty row for custom tasks */}
                                <div style={{ marginBottom: 10 }}>
                                    <table style={TABLE}>
                                        <tbody>
                                            {[1, 2].map(i => (
                                                <tr key={`e-${i}`}>
                                                    <td style={{ ...TD, width: 72, color: '#bbb', fontStyle: 'italic', fontSize: 10 }}>自选</td>
                                                    <td style={{ ...TD, width: 62 }}></td>
                                                    <td style={TD}></td>
                                                    <td style={{ ...TD, width: 36, textAlign: 'center' }}>
                                                        <span style={{ display: 'inline-block', width: 13, height: 13, border: '1.5px solid #bbb', borderRadius: 2 }}></span>
                                                    </td>
                                                    <td style={{ ...TD, width: 86 }}></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>



                                {/* ═══ Growth-Mindset Reflection ═══ */}
                                <div style={{ border: '1.5px solid #333', borderRadius: 6, padding: '10px 12px', marginTop: 12 }}>
                                    <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 8 }}>■ 今日复盘</div>
                                    {[
                                        { label: '★ 今天做得好的事', emoji: '' },
                                        { label: '▸ 明天想改进的', emoji: '' },
                                        { label: '♡ 今天最开心的事', emoji: '' },
                                    ].map(({ label }) => (
                                        <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 2, fontSize: 11 }}>
                                            <span style={{ fontWeight: 700, whiteSpace: 'nowrap', minWidth: 130 }}>{label}：</span>
                                            <div style={{ borderBottom: '1px dashed #bbb', height: 24, flex: 1 }}></div>
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 11 }}>
                                        <span style={{ fontWeight: 700 }}>自评：</span>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <span key={i} style={{ width: 18, height: 18, border: '1.5px solid #888', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>☆</span>
                                            ))}
                                        </div>
                                        <span style={{ marginLeft: 12, fontWeight: 700 }}>完成度：</span>
                                        <span style={{ color: '#aaa', fontWeight: 700 }}>_____ %</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* ═══ WEEKLY VIEW ═══ */
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', border: '1px solid #ccc' }}>
                                    {weekDates.map((d, i) => {
                                        const ds = fmtDate(d);
                                        const dayTasks = weeklyTasks[i];
                                        const isToday = ds === fmtDate(new Date());
                                        const isWeekend = i >= 5;
                                        return (
                                            <div key={i} style={{ borderRight: i < 6 ? '1px solid #ccc' : 'none', background: isWeekend ? '#fafafa' : 'transparent' }}>
                                                <div style={{ background: isToday ? '#e0e0e0' : '#f0f0f0', textAlign: 'center', padding: '5px 2px', fontWeight: 800, fontSize: 11, borderBottom: '1px solid #ccc' }}>
                                                    周{DAY_LABELS[i]}
                                                    <div style={{ fontSize: 9, color: '#777', fontWeight: 600 }}>{d.getMonth() + 1}/{d.getDate()}</div>
                                                </div>
                                                <div style={{ minHeight: 50 }}>
                                                    {dayTasks.length === 0 ? (
                                                        <div style={{ padding: 5, fontSize: 9, color: '#ccc', textAlign: 'center' }}>—</div>
                                                    ) : (
                                                        dayTasks.map(t => (
                                                            <div key={t.id} style={{ padding: '3px 4px', borderBottom: '1px solid #eee', fontSize: 9 }}>
                                                                <div style={{ fontWeight: 800, fontSize: 10 }}>{t.category || '其他'}</div>
                                                                <div style={{ color: '#333', marginTop: 1 }}>{t.title}</div>
                                                                {showDetails && (t.standards || t.desc) && <div style={{ color: '#999', fontSize: 8, marginTop: 1 }}>{t.standards || t.desc}</div>}
                                                                {getTimeDisplay(t) && <div style={{ color: '#888', fontSize: 8 }}>{getTimeDisplay(t)}</div>}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                {/* Weekly goal area per day */}
                                                <div style={{ borderTop: '1px dashed #ccc', padding: '3px 4px', minHeight: 22, fontSize: 8, color: '#bbb' }}>
                                                    目标：
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Weekly reflection */}
                                <div style={{ border: '1.5px solid #333', borderRadius: 6, padding: '8px 12px', marginTop: 12 }}>
                                    <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6 }}>■ 本周回顾</div>
                                    {[
                                        '本周最大的进步',
                                        '下周想挑战的目标',
                                    ].map(label => (
                                        <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 2, fontSize: 11 }}>
                                            <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{label}：</span>
                                            <div style={{ borderBottom: '1px dashed #bbb', height: 24, flex: 1 }}></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div style={{ textAlign: 'center', fontSize: 8, color: '#aaa', marginTop: 12, paddingTop: 6, borderTop: '1px solid #ddd' }}>
                            MiniLife · {activeKid.name}的成长记录 · {mode === 'weekly' ? weekLabel : date}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
