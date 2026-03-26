import React, { useState, useCallback } from 'react';
import { Icons, renderIcon } from '../../utils/Icons';
import { useSwipeBack } from '../../hooks/useSwipeBack';
import { getCatHexColor } from '../../utils/categoryUtils';

const ICON_OPTIONS = [
    'BookOpen', 'Calculator', 'MessageCircle', 'Zap', 'FlaskConical', 'Leaf',
    'Hourglass', 'Globe', 'Landmark', 'Scale', 'Monitor', 'Dumbbell',
    'Gamepad2', 'Palette', 'Star', 'Heart', 'Target', 'Award',
    'GraduationCap', 'Coffee', 'Sparkles', 'Activity', 'Wrench', 'Tag'
];

const COLOR_OPTIONS = [
    '#F43F5E', '#EF4444', '#F97316', '#F59E0B', '#EAB308',
    '#84CC16', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
    '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#EC4899',
    '#78716C', '#64748B'
];

export const CategoryManagerModal = ({ show, onClose, parentSettings, setParentSettings, allCategories, getCatHexColor: getCatHex }) => {
    const [newName, setNewName] = useState('');
    const [newIcon, setNewIcon] = useState('Star');
    const [newColor, setNewColor] = useState('#F97316');
    const [showAddForm, setShowAddForm] = useState(false);

    const closeModal = useCallback(() => { onClose(); }, [onClose]);
    const { swipeRef, swipeHandlers } = useSwipeBack(closeModal, { enabled: show });

    if (!show) return null;

    const customCats = parentSettings.customCategories || [];
    // Normalize: support both old string[] and new {name, icon, color}[] formats
    const normalizedCats = customCats.map(c => typeof c === 'string' ? { name: c, icon: 'Star', color: getCatHexColor(c) } : c);

    const handleAdd = () => {
        if (!newName.trim()) return;
        const entry = { name: newName.trim(), icon: newIcon, color: newColor };
        setParentSettings(prev => ({
            ...prev,
            customCategories: [...(prev.customCategories || []).filter(c => (typeof c === 'string' ? c : c.name) !== entry.name), entry]
        }));
        setNewName('');
        setNewIcon('Star');
        setNewColor('#F97316');
        setShowAddForm(false);
    };

    const handleDelete = (name) => {
        setParentSettings(prev => ({
            ...prev,
            customCategories: (prev.customCategories || []).filter(c => (typeof c === 'string' ? c : c.name) !== name)
        }));
    };

    const C = {
        bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1',
        orange: '#FF8C42', textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
    };

    return (
        <div className="fixed inset-0 z-[10100] flex items-center justify-center p-0 md:p-6 animate-fade-in"
            style={{ background: 'rgba(27,46,75,0.3)', backdropFilter: 'blur(8px)' }}>
            <div ref={swipeRef} {...swipeHandlers}
                className="w-full h-full md:h-auto md:max-h-[85vh] md:max-w-lg flex flex-col md:rounded-3xl overflow-hidden animate-bounce-in"
                style={{ background: C.bg }}
                onClick={e => e.stopPropagation()}>

                {/* — Header — */}
                <div className="shrink-0 px-5 py-4 flex items-center justify-between"
                    style={{ background: '#FFFFFF', borderBottom: '1px solid #F0EBE1' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: '#FF8C4218', color: '#FF8C42' }}>
                            <Icons.Tag size={20} />
                        </div>
                        <div>
                            <h2 className="font-black text-base" style={{ color: C.textPrimary }}>分类管理</h2>
                            <div className="text-[11px] font-bold mt-0.5" style={{ color: C.textMuted }}>
                                管理自定义分类
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                        style={{ background: '#F0EBE1', color: '#9CAABE' }}>
                        <Icons.X size={18} />
                    </button>
                </div>

                {/* — Scrollable Body — */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">

                    {/* Existing custom categories */}
                    {normalizedCats.length > 0 ? (
                        <div className="space-y-2">
                            {normalizedCats.map(cat => (
                                <div key={cat.name} className="flex items-center gap-3 p-3.5 rounded-2xl"
                                    style={{ background: C.bgCard, border: '1px solid #F0EBE1' }}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                                        style={{ background: cat.color }}>
                                        {renderIcon(cat.icon, 18)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold truncate" style={{ color: C.textPrimary }}>{cat.name}</div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                                            <span className="text-[10px]" style={{ color: C.textMuted }}>{cat.icon}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => { if (confirm(`删除「${cat.name}」分类？`)) handleDelete(cat.name); }}
                                        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90"
                                        style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
                                        <Icons.Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-3xl mb-2">📁</div>
                            <p className="text-sm font-bold" style={{ color: C.textMuted }}>暂无自定义分类</p>
                            <p className="text-xs mt-1" style={{ color: C.textMuted }}>点击下方按钮添加</p>
                        </div>
                    )}

                    {/* Add form */}
                    {showAddForm ? (
                        <div className="rounded-2xl p-4 space-y-4" style={{ background: C.bgCard, border: '1px solid #F0EBE1' }}>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold" style={{ color: C.textSoft }}>新建分类</span>
                                <button onClick={() => setShowAddForm(false)}
                                    className="w-6 h-6 rounded-full flex items-center justify-center"
                                    style={{ background: C.bgLight, color: C.textMuted }}>
                                    <Icons.X size={12} />
                                </button>
                            </div>

                            {/* Preview card */}
                            <div className="rounded-2xl p-4 flex items-center gap-3 text-white"
                                style={{ background: newColor, boxShadow: `0 4px 20px ${newColor}40` }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm">
                                    {renderIcon(newIcon, 22, 'text-white')}
                                </div>
                                <div>
                                    <div className="font-black text-base">{newName || '分类名称'}</div>
                                    <div className="text-white/70 text-[11px] font-bold mt-0.5">自定义分类</div>
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: C.textMuted }}>名称</label>
                                <input
                                    value={newName}
                                    onChange={e => setNewName(e.target.value.substring(0, 8))}
                                    placeholder="例如：书法、编程"
                                    className="w-full rounded-xl px-4 py-3 outline-none font-bold text-sm"
                                    style={{ background: C.bg, border: '1.5px solid #F0EBE1', color: C.textPrimary }}
                                    onFocus={e => e.target.style.borderColor = C.orange}
                                    onBlur={e => e.target.style.borderColor = '#F0EBE1'}
                                />
                            </div>

                            {/* Icon picker */}
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: C.textMuted }}>图标</label>
                                <div className="grid grid-cols-8 gap-1.5">
                                    {ICON_OPTIONS.map(ic => (
                                        <button key={ic} onClick={() => setNewIcon(ic)}
                                            className="aspect-square rounded-xl flex items-center justify-center transition-all active:scale-90"
                                            style={{
                                                background: newIcon === ic ? newColor : C.bg,
                                                color: newIcon === ic ? '#fff' : C.textSoft,
                                                border: newIcon === ic ? 'none' : '1px solid #F0EBE1',
                                                boxShadow: newIcon === ic ? `0 4px 12px ${newColor}40` : 'none',
                                            }}>
                                            {renderIcon(ic, 16)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color picker */}
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: C.textMuted }}>颜色</label>
                                <div className="flex flex-wrap gap-2">
                                    {COLOR_OPTIONS.map(col => (
                                        <button key={col} onClick={() => setNewColor(col)}
                                            className="w-8 h-8 rounded-full transition-all active:scale-90"
                                            style={{
                                                background: col,
                                                boxShadow: newColor === col ? `0 0 0 3px ${C.bg}, 0 0 0 5px ${col}` : 'none',
                                                transform: newColor === col ? 'scale(1.15)' : 'scale(1)',
                                            }} />
                                    ))}
                                </div>
                            </div>

                            {/* Confirm */}
                            <button onClick={handleAdd}
                                disabled={!newName.trim()}
                                className="w-full py-3.5 rounded-2xl font-black text-white transition-all active:scale-[0.98] disabled:opacity-40"
                                style={{ background: newName.trim() ? C.orange : '#ccc', boxShadow: newName.trim() ? `0 4px 14px ${C.orange}50` : 'none' }}>
                                添加分类
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setShowAddForm(true)}
                            className="w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            style={{ background: C.bgCard, color: C.orange, border: `2px dashed ${C.orange}40` }}>
                            <Icons.Plus size={16} /> 新建分类
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
