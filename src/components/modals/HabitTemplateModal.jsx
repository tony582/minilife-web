import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useDataContext } from '../../context/DataContext.jsx';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { Icons } from '../../utils/Icons';
import { GOOD_HABIT_TEMPLATES, BAD_HABIT_TEMPLATES } from '../../data/defaultHabits';
import { apiFetch } from '../../api/client';

// Individual Phosphor icon imports (tree-shakeable)
import {
    PencilLine, BookOpen, MagnifyingGlass, Brain, PenNib, Armchair,
    Trophy, Lightbulb, Target, Notebook, SoccerBall, PersonSimpleRun,
    Eye, Moon, Sun, Backpack, TShirt, Broom, ForkKnife, Timer,
    House, HandWaving, Heart, Smiley, Medal, ClockCountdown,
    WarningCircle, Windmill, SpeakerSlash, BookOpenText, Binoculars,
    Warning, DeviceMobile, GameController, SmileyAngry, ChatTeardropDots,
    Prohibit, MaskSad, SmileyMeh, HandFist, Trash, BowlFood,
    Alarm, CookingPot, Megaphone, ShieldWarning, Phone, Package,
    DownloadSimple
} from '@phosphor-icons/react';

const PH_ICON_MAP = {
    PencilLine, BookOpen, MagnifyingGlass, Brain, PenNib, Armchair,
    Trophy, Lightbulb, Target, Notebook, PersonSimpleRun,
    Eye, Moon, Sun, Backpack, TShirt, Broom, ForkKnife, Timer,
    House, HandWaving, Heart, Smiley, Medal, ClockCountdown,
    WarningCircle, Windmill, SpeakerSlash, BookOpenText, Binoculars,
    Warning, DeviceMobile, GameController, SmileyAngry, ChatTeardropDots,
    Prohibit, MaskSad, SmileyMeh, HandFist, Trash, BowlFood,
    CookingPot, Megaphone, ShieldWarning, Phone, Package,
    Soccer: SoccerBall,
    AlarmClock: Alarm,
    Download: DownloadSimple,
};

const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
    teal: '#4ECDC4', coral: '#FF6B6B', green: '#10B981',
    textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
    cardShadow: '0 2px 12px rgba(27,46,75,0.06)',
};

const PhIcon = ({ name, size = 20, weight = 'duotone', ...rest }) => {
    const Icon = PH_ICON_MAP[name];
    if (!Icon) return <Icons.Star size={size} {...rest} />;
    return <Icon size={size} weight={weight} {...rest} />;
};

export const HabitTemplateModal = ({ isOpen, onClose }) => {
    const { tasks, setTasks } = useDataContext();
    const { user, notify } = useAuthContext();
    const [selectedGood, setSelectedGood] = useState(() => new Set(GOOD_HABIT_TEMPLATES.map((_, i) => i)));
    const [selectedBad, setSelectedBad] = useState(() => new Set(BAD_HABIT_TEMPLATES.map((_, i) => i)));
    const [importing, setImporting] = useState(false);
    const [activeTab, setActiveTab] = useState('good');

    // Check which templates already exist (by title)
    const existingTitles = useMemo(() => new Set(tasks.filter(t => t.type === 'habit').map(t => t.title)), [tasks]);

    const toggleGood = (idx) => {
        setSelectedGood(prev => {
            const n = new Set(prev);
            n.has(idx) ? n.delete(idx) : n.add(idx);
            return n;
        });
    };
    const toggleBad = (idx) => {
        setSelectedBad(prev => {
            const n = new Set(prev);
            n.has(idx) ? n.delete(idx) : n.add(idx);
            return n;
        });
    };
    const selectAllGood = () => setSelectedGood(new Set(GOOD_HABIT_TEMPLATES.map((_, i) => i)));
    const selectNoneGood = () => setSelectedGood(new Set());
    const selectAllBad = () => setSelectedBad(new Set(BAD_HABIT_TEMPLATES.map((_, i) => i)));
    const selectNoneBad = () => setSelectedBad(new Set());

    const totalSelected = selectedGood.size + selectedBad.size;

    const handleImport = async () => {
        if (totalSelected === 0) return;
        setImporting(true);
        let created = 0;
        let skipped = 0;
        const newTasks = [];

        const buildTask = (tpl, isGood) => {
            const id = `habit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            return {
                id,
                kidId: 'all',
                title: tpl.title,
                type: 'habit',
                reward: tpl.reward,
                status: 'active',
                iconName: '',
                iconEmoji: '',
                category: '',
                catColor: '',
                frequency: '',
                timeStr: '',
                standards: tpl.desc,
                dates: '[]',
                startDate: new Date().toISOString().split('T')[0],
                pointRule: 'custom',
                habitType: tpl.habitType,
                habitColor: tpl.color,
                attachments: '[]',
                requireApproval: false,
                repeatConfig: JSON.stringify({}),
                order: 999,
                periodMaxPerDay: tpl.periodMaxPerDay,
                periodMaxType: 'daily',
                // Store Phosphor icon name for rendering
                phIcon: tpl.icon,
            };
        };

        for (const idx of selectedGood) {
            const tpl = GOOD_HABIT_TEMPLATES[idx];
            if (existingTitles.has(tpl.title)) { skipped++; continue; }
            newTasks.push(buildTask(tpl, true));
        }
        for (const idx of selectedBad) {
            const tpl = BAD_HABIT_TEMPLATES[idx];
            if (existingTitles.has(tpl.title)) { skipped++; continue; }
            newTasks.push(buildTask(tpl, false));
        }

        // Create tasks one by one (API has no batch endpoint)
        for (const task of newTasks) {
            try {
                await apiFetch('/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(task),
                });
                created++;
            } catch (e) {
                console.error('Failed to create habit:', task.title, e);
            }
            // Small delay to avoid overwhelming the server
            await new Promise(r => setTimeout(r, 50));
        }

        // Refresh task list
        try {
            const res = await apiFetch('/api/tasks');
            const data = await res.json();
            setTasks(data);
        } catch (e) { console.error(e); }

        setImporting(false);
        const msg = skipped > 0
            ? `成功导入 ${created} 个习惯，${skipped} 个已存在被跳过`
            : `成功导入 ${created} 个习惯！`;
        notify(msg, 'success');
        onClose();
    };

    if (!isOpen) return null;

    const goodTemplates = GOOD_HABIT_TEMPLATES;
    const badTemplates = BAD_HABIT_TEMPLATES;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-6 animate-fade-in"
            style={{ background: 'rgba(27,46,75,0.35)', backdropFilter: 'blur(10px)' }}
            onClick={onClose}>
            <div className="w-full h-full md:h-auto md:max-h-[85vh] md:max-w-lg flex flex-col md:rounded-3xl overflow-hidden animate-bounce-in"
                style={{ background: C.bg }}
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="shrink-0 px-5 pt-5 pb-3" style={{ background: C.bgCard, borderBottom: `1px solid ${C.bgLight}` }}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-400 to-emerald-500">
                                <PhIcon name="Package" size={22} weight="duotone" style={{ color: '#fff' }} />
                            </div>
                            <div>
                                <h2 className="font-black text-base" style={{ color: C.textPrimary }}>习惯模板库</h2>
                                <div className="text-[11px] font-bold" style={{ color: C.textMuted }}>精选 {goodTemplates.length + badTemplates.length} 个习惯，一键导入</div>
                            </div>
                        </div>
                        <button onClick={onClose}
                            className="w-9 h-9 rounded-full flex items-center justify-center"
                            style={{ background: C.bgLight, color: C.textMuted }}>
                            <Icons.X size={18} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 p-1 rounded-xl" style={{ background: C.bgLight }}>
                        <button onClick={() => setActiveTab('good')}
                            className="flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5"
                            style={{
                                background: activeTab === 'good' ? C.bgCard : 'transparent',
                                color: activeTab === 'good' ? C.teal : C.textMuted,
                                boxShadow: activeTab === 'good' ? C.cardShadow : 'none',
                            }}>
                            <Icons.TrendingUp size={14} />
                            好习惯 ({selectedGood.size}/{goodTemplates.length})
                        </button>
                        <button onClick={() => setActiveTab('bad')}
                            className="flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5"
                            style={{
                                background: activeTab === 'bad' ? C.bgCard : 'transparent',
                                color: activeTab === 'bad' ? C.coral : C.textMuted,
                                boxShadow: activeTab === 'bad' ? C.cardShadow : 'none',
                            }}>
                            <Icons.TrendingDown size={14} />
                            坏习惯 ({selectedBad.size}/{badTemplates.length})
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {/* Select all / none */}
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold" style={{ color: C.textMuted }}>
                            {activeTab === 'good' ? `已选 ${selectedGood.size} 个好习惯` : `已选 ${selectedBad.size} 个坏习惯`}
                        </span>
                        <div className="flex gap-2">
                            <button onClick={activeTab === 'good' ? selectAllGood : selectAllBad}
                                className="text-[11px] font-bold px-2 py-1 rounded-lg transition-all"
                                style={{ color: C.teal }}>
                                全选
                            </button>
                            <button onClick={activeTab === 'good' ? selectNoneGood : selectNoneBad}
                                className="text-[11px] font-bold px-2 py-1 rounded-lg transition-all"
                                style={{ color: C.textMuted }}>
                                取消全选
                            </button>
                        </div>
                    </div>

                    {/* Template list */}
                    {(activeTab === 'good' ? goodTemplates : badTemplates).map((tpl, idx) => {
                        const isSelected = activeTab === 'good' ? selectedGood.has(idx) : selectedBad.has(idx);
                        const toggle = activeTab === 'good' ? () => toggleGood(idx) : () => toggleBad(idx);
                        const exists = existingTitles.has(tpl.title);
                        const accent = tpl.reward >= 0 ? C.teal : C.coral;

                        return (
                            <button key={`${activeTab}-${idx}`}
                                onClick={exists ? undefined : toggle}
                                disabled={exists}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${exists ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}`}
                                style={{
                                    background: isSelected && !exists ? C.bgCard : `${C.bgCard}80`,
                                    border: `1.5px solid ${isSelected && !exists ? accent + '40' : C.bgLight}`,
                                    boxShadow: isSelected && !exists ? C.cardShadow : 'none',
                                }}>
                                {/* Checkbox */}
                                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                                    style={{
                                        background: exists ? C.bgMuted : (isSelected ? accent : C.bgLight),
                                        color: '#fff',
                                    }}>
                                    {exists ? <Icons.Check size={12} /> : (isSelected ? <Icons.Check size={12} /> : null)}
                                </div>

                                {/* Icon */}
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${tpl.color}`}
                                    style={{ color: '#fff' }}>
                                    <PhIcon name={tpl.icon} size={18} weight="fill" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm truncate" style={{ color: C.textPrimary }}>{tpl.title}</span>
                                        {exists && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 shrink-0">已存在</span>}
                                    </div>
                                    <div className="text-[11px] mt-0.5 truncate" style={{ color: C.textSoft }}>{tpl.desc}</div>
                                </div>

                                {/* Reward badge */}
                                <div className="shrink-0 text-[11px] font-black px-2 py-1 rounded-lg"
                                    style={{ background: `${accent}12`, color: accent }}>
                                    {tpl.reward > 0 ? '+' : ''}{tpl.reward}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="shrink-0 p-4" style={{ background: C.bgCard, borderTop: `1px solid ${C.bgLight}` }}>
                    <button onClick={handleImport}
                        disabled={totalSelected === 0 || importing}
                        className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: totalSelected > 0 ? C.teal : C.bgMuted,
                            color: '#fff',
                            boxShadow: totalSelected > 0 ? `0 4px 14px ${C.teal}40` : 'none',
                        }}>
                        {importing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                正在导入...
                            </>
                        ) : (
                            <>
                                <PhIcon name="Download" size={18} weight="bold" />
                                一键导入 {totalSelected} 个习惯
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
