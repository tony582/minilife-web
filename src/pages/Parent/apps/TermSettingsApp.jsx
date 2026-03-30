import React, { useState } from 'react';
import { useUIContext } from '../../../context/UIContext.jsx';
import { Icons } from '../../../utils/Icons';

const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1',
    textPrimary: '#1B2E4B', textMuted: '#9CAABE',
    teal: '#4ECDC4', orange: '#FF8C42', pink: '#EC4899',
};

const EMOJI_OPTIONS = ['🌸', '🌊', '🍂', '❄️', '📚', '🎒', '⭐', '🏖️', '🎄'];
const COLOR_OPTIONS = [
    { label: '粉红', value: '#EC4899' },
    { label: '蓝绿', value: '#06B6D4' },
    { label: '琥珀', value: '#F59E0B' },
    { label: '靛蓝', value: '#6366F1' },
    { label: '亮绿', value: '#10B981' },
    { label: '橙色', value: '#FF8C42' },
];

export const TermSettingsApp = () => {
    const { parentSettings, setParentSettings } = useUIContext();
    const currentTerm = parentSettings?.currentTerm || {};

    const [name, setName] = useState(currentTerm.name || '');
    const [emoji, setEmoji] = useState(currentTerm.emoji || '📚');
    const [color, setColor] = useState(currentTerm.color || '#EC4899');
    const [startDate, setStartDate] = useState(currentTerm.startDate || '');
    const [endDate, setEndDate] = useState(currentTerm.endDate || '');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        if (!name || !startDate || !endDate) return;
        setParentSettings(prev => ({
            ...prev,
            currentTerm: { name, emoji, color, startDate, endDate },
        }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleClear = () => {
        setParentSettings(prev => {
            const next = { ...prev };
            delete next.currentTerm;
            return next;
        });
        setName('');
        setEmoji('📚');
        setColor('#EC4899');
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Header info */}
            <div className="rounded-2xl p-4" style={{ background: `${C.pink}08`, border: `1px solid ${C.pink}15` }}>
                <div className="flex items-start gap-3">
                    <div className="text-2xl">📚</div>
                    <div>
                        <div className="text-sm font-black" style={{ color: C.textPrimary }}>学期/时段设置</div>
                        <div className="text-xs font-medium mt-0.5" style={{ color: C.textMuted }}>
                            设置当前学期或假期的时间范围，孩子端会显示一个时间进度条。如果不设置，系统会自动按默认学期日历显示。
                        </div>
                    </div>
                </div>
            </div>

            {/* Name */}
            <div className="rounded-2xl p-4" style={{ background: C.bgCard, border: `1px solid ${C.bgLight}` }}>
                <label className="text-xs font-black mb-2 block" style={{ color: C.textPrimary }}>
                    学期名称
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="例如：三年级下学期、暑假"
                    className="w-full px-4 py-2.5 rounded-xl text-sm font-bold outline-none transition-shadow focus:ring-2"
                    style={{
                        background: C.bg,
                        color: C.textPrimary,
                        border: `1px solid ${C.bgLight}`,
                    }}
                />
            </div>

            {/* Emoji picker */}
            <div className="rounded-2xl p-4" style={{ background: C.bgCard, border: `1px solid ${C.bgLight}` }}>
                <label className="text-xs font-black mb-2 block" style={{ color: C.textPrimary }}>
                    图标
                </label>
                <div className="flex gap-2 flex-wrap">
                    {EMOJI_OPTIONS.map(e => (
                        <button
                            key={e}
                            onClick={() => setEmoji(e)}
                            className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${emoji === e ? 'ring-2 ring-offset-1 scale-110' : 'hover:scale-105'}`}
                            style={{
                                background: emoji === e ? `${color}15` : C.bgLight,
                                ringColor: color,
                            }}
                        >
                            {e}
                        </button>
                    ))}
                </div>
            </div>

            {/* Color picker */}
            <div className="rounded-2xl p-4" style={{ background: C.bgCard, border: `1px solid ${C.bgLight}` }}>
                <label className="text-xs font-black mb-2 block" style={{ color: C.textPrimary }}>
                    主题色
                </label>
                <div className="flex gap-2 flex-wrap">
                    {COLOR_OPTIONS.map(c => (
                        <button
                            key={c.value}
                            onClick={() => setColor(c.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${color === c.value ? 'ring-2 ring-offset-1 text-white scale-105' : 'hover:scale-105'}`}
                            style={{
                                background: color === c.value ? c.value : `${c.value}15`,
                                color: color === c.value ? '#fff' : c.value,
                                ringColor: c.value,
                            }}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Date range */}
            <div className="rounded-2xl p-4" style={{ background: C.bgCard, border: `1px solid ${C.bgLight}` }}>
                <label className="text-xs font-black mb-2 block" style={{ color: C.textPrimary }}>
                    时间范围
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <div className="text-[10px] font-bold mb-1" style={{ color: C.textMuted }}>开始日期</div>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-sm font-bold outline-none"
                            style={{ background: C.bg, color: C.textPrimary, border: `1px solid ${C.bgLight}` }}
                        />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold mb-1" style={{ color: C.textMuted }}>结束日期</div>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-sm font-bold outline-none"
                            style={{ background: C.bg, color: C.textPrimary, border: `1px solid ${C.bgLight}` }}
                        />
                    </div>
                </div>
            </div>

            {/* Preview */}
            {name && startDate && endDate && (
                <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.bgLight}` }}>
                    <div className="px-4 py-2 text-[10px] font-black" style={{ background: C.bgLight, color: C.textMuted }}>
                        预览
                    </div>
                    <div className="px-4 py-3 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)` }}>
                        <div className="text-2xl">{emoji}</div>
                        <div className="flex-1">
                            <div className="text-sm font-black" style={{ color: C.textPrimary }}>{name}</div>
                            <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>
                                {new Date(startDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} — {new Date(endDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={handleSave}
                    disabled={!name || !startDate || !endDate}
                    className="flex-1 py-3 rounded-2xl text-sm font-black text-white transition-all active:scale-[0.98] disabled:opacity-40"
                    style={{ background: saved ? '#10B981' : `linear-gradient(135deg, ${color}, ${color}DD)` }}
                >
                    {saved ? '✅ 已保存' : '保存设置'}
                </button>
                {currentTerm.name && (
                    <button
                        onClick={handleClear}
                        className="px-5 py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
                        style={{ background: C.bgLight, color: C.textMuted }}
                    >
                        恢复默认
                    </button>
                )}
            </div>
        </div>
    );
};
