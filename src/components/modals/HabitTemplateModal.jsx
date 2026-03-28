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
                iconEmoji: tpl.iconEmoji,
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
                <div className="shrink-0 px-5 pt-5 pb-4" style={{ background: C.bgCard, borderBottom: `1px solid ${C.bgLight}` }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-400 to-emerald-500">
                                <PhIcon name="Package" size={22} weight="duotone" style={{ color: '#fff' }} />
                            </div>
                            <div>
                                <h2 className="font-black text-base" style={{ color: C.textPrimary }}>批量导入习惯</h2>
                                <div className="text-[11px] font-bold" style={{ color: C.textMuted }}>勾选需要的习惯，点击底部按钮导入</div>
                            </div>
                        </div>
                        <button onClick={onClose}
                            className="w-9 h-9 rounded-full flex items-center justify-center"
                            style={{ background: C.bgLight, color: C.textMuted }}>
                            <Icons.X size={18} />
                        </button>
                    </div>
                </div>

                {/* Body — single scrollable list with section headers */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1.5">

                    {/* ── Good Habits Section ── */}
                    <div className="flex items-center justify-between py-2 sticky top-0 z-10" style={{ background: C.bg }}>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-5 rounded-full" style={{ background: C.teal }}></span>
                            <span className="text-xs font-black" style={{ color: C.teal }}>好习惯</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${C.teal}15`, color: C.teal }}>
                                {selectedGood.size}/{goodTemplates.length}
                            </span>
                        </div>
                        <button onClick={() => selectedGood.size === goodTemplates.length ? selectNoneGood() : selectAllGood()}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all"
                            style={{ background: `${C.teal}12`, color: C.teal }}>
                            {selectedGood.size === goodTemplates.length ? '取消全选' : '全选'}
                        </button>
                    </div>
                    {goodTemplates.map((tpl, idx) => {
                        const isSelected = selectedGood.has(idx);
                        const exists = existingTitles.has(tpl.title);
                        return (
                            <button key={`good-${idx}`}
                                onClick={exists ? undefined : () => toggleGood(idx)}
                                disabled={exists}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${exists ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}`}
                                style={{
                                    background: isSelected && !exists ? C.bgCard : `${C.bgCard}80`,
                                    border: `1.5px solid ${isSelected && !exists ? C.teal + '40' : C.bgLight}`,
                                    boxShadow: isSelected && !exists ? C.cardShadow : 'none',
                                }}>
                                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                                    style={{ background: exists ? C.bgMuted : (isSelected ? C.teal : C.bgLight), color: '#fff' }}>
                                    {(exists || isSelected) && <Icons.Check size={12} />}
                                </div>
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${tpl.color}`}
                                    style={{ color: '#fff' }}>
                                    <PhIcon name={tpl.iconEmoji?.startsWith('ph:') ? tpl.iconEmoji.slice(3) : tpl.iconEmoji} size={18} weight="fill" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm truncate" style={{ color: C.textPrimary }}>{tpl.title}</span>
                                        {exists && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 shrink-0">已存在</span>}
                                    </div>
                                    <div className="text-[11px] mt-0.5 truncate" style={{ color: C.textSoft }}>{tpl.desc}</div>
                                </div>
                                <div className="shrink-0 text-[11px] font-black px-2 py-1 rounded-lg"
                                    style={{ background: `${C.teal}12`, color: C.teal }}>
                                    +{tpl.reward}
                                </div>
                            </button>
                        );
                    })}

                    {/* ── Bad Habits Section ── */}
                    <div className="flex items-center justify-between py-2 mt-3 sticky top-0 z-10" style={{ background: C.bg }}>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-5 rounded-full" style={{ background: C.coral }}></span>
                            <span className="text-xs font-black" style={{ color: C.coral }}>坏习惯</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${C.coral}15`, color: C.coral }}>
                                {selectedBad.size}/{badTemplates.length}
                            </span>
                        </div>
                        <button onClick={() => selectedBad.size === badTemplates.length ? selectNoneBad() : selectAllBad()}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all"
                            style={{ background: `${C.coral}12`, color: C.coral }}>
                            {selectedBad.size === badTemplates.length ? '取消全选' : '全选'}
                        </button>
                    </div>
                    {badTemplates.map((tpl, idx) => {
                        const isSelected = selectedBad.has(idx);
                        const exists = existingTitles.has(tpl.title);
                        return (
                            <button key={`bad-${idx}`}
                                onClick={exists ? undefined : () => toggleBad(idx)}
                                disabled={exists}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${exists ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}`}
                                style={{
                                    background: isSelected && !exists ? C.bgCard : `${C.bgCard}80`,
                                    border: `1.5px solid ${isSelected && !exists ? C.coral + '40' : C.bgLight}`,
                                    boxShadow: isSelected && !exists ? C.cardShadow : 'none',
                                }}>
                                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                                    style={{ background: exists ? C.bgMuted : (isSelected ? C.coral : C.bgLight), color: '#fff' }}>
                                    {(exists || isSelected) && <Icons.Check size={12} />}
                                </div>
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${tpl.color}`}
                                    style={{ color: '#fff' }}>
                                    <PhIcon name={tpl.iconEmoji?.startsWith('ph:') ? tpl.iconEmoji.slice(3) : tpl.iconEmoji} size={18} weight="fill" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm truncate" style={{ color: C.textPrimary }}>{tpl.title}</span>
                                        {exists && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 shrink-0">已存在</span>}
                                    </div>
                                    <div className="text-[11px] mt-0.5 truncate" style={{ color: C.textSoft }}>{tpl.desc}</div>
                                </div>
                                <div className="shrink-0 text-[11px] font-black px-2 py-1 rounded-lg"
                                    style={{ background: `${C.coral}12`, color: C.coral }}>
                                    -{Math.abs(tpl.reward)}
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
                        ) : totalSelected > 0 ? (
                            <>
                                <PhIcon name="Download" size={18} weight="bold" />
                                导入已选的 {totalSelected} 个习惯
                            </>
                        ) : (
                            '请先勾选要导入的习惯'
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
