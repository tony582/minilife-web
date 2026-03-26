import React, { useState } from 'react';
import { Icons, renderIcon } from '../../utils/Icons';
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
    const [formName, setFormName] = useState('');
    const [formIcon, setFormIcon] = useState('Star');
    const [formColor, setFormColor] = useState('#F97316');
    const [formMode, setFormMode] = useState(null); // null | 'add' | 'edit'
    const [editingOriginalName, setEditingOriginalName] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // name of category pending delete

    if (!show) return null;

    const customCats = parentSettings.customCategories || [];
    const normalizedCats = customCats.map(c => typeof c === 'string' ? { name: c, icon: 'Star', color: getCatHexColor(c) } : c);

    const openAddForm = () => {
        setFormName(''); setFormIcon('Star'); setFormColor('#F97316');
        setFormMode('add'); setEditingOriginalName(null);
    };

    const openEditForm = (cat) => {
        setFormName(cat.name); setFormIcon(cat.icon); setFormColor(cat.color);
        setFormMode('edit'); setEditingOriginalName(cat.name);
    };

    const handleSave = () => {
        if (!formName.trim()) return;
        const entry = { name: formName.trim(), icon: formIcon, color: formColor };
        setParentSettings(prev => {
            const cats = (prev.customCategories || []).filter(c => {
                const n = typeof c === 'string' ? c : c.name;
                // When editing, remove the original; when adding, remove duplicates
                return formMode === 'edit' ? n !== editingOriginalName : n !== entry.name;
            });
            return { ...prev, customCategories: [...cats, entry] };
        });
        setFormMode(null); setFormName(''); setFormIcon('Star'); setFormColor('#F97316');
    };

    const handleDelete = (name) => {
        setParentSettings(prev => ({
            ...prev,
            customCategories: (prev.customCategories || []).filter(c => (typeof c === 'string' ? c : c.name) !== name)
        }));
        setDeleteConfirm(null);
    };

    const C = {
        bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1',
        orange: '#FF8C42', textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
    };

    return (
        <div className="fixed inset-0 z-[10100] flex items-center justify-center p-0 md:p-6 animate-fade-in"
            style={{ background: 'rgba(27,46,75,0.3)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}>
            <div className="w-full h-full md:h-auto md:max-h-[85vh] md:max-w-lg flex flex-col md:rounded-3xl overflow-hidden animate-bounce-in"
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

                    {/* Category list */}
                    {normalizedCats.length > 0 ? (
                        <div className="space-y-2">
                            {normalizedCats.map(cat => (
                                <div key={cat.name}>
                                    <div className="flex items-center gap-3 p-3.5 rounded-2xl"
                                        style={{ background: C.bgCard, border: '1px solid #F0EBE1' }}>
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                                            style={{ background: cat.color }}>
                                            {renderIcon(cat.icon, 18)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold truncate" style={{ color: C.textPrimary }}>{cat.name}</div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button onClick={() => openEditForm(cat)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90"
                                                style={{ background: `${C.orange}12`, color: C.orange }}>
                                                <Icons.Edit3 size={14} />
                                            </button>
                                            <button onClick={() => setDeleteConfirm(cat.name)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90"
                                                style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
                                                <Icons.Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Inline delete confirmation */}
                                    {deleteConfirm === cat.name && (
                                        <div className="mt-1.5 rounded-xl p-3 flex items-center justify-between animate-fade-in"
                                            style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                                            <span className="text-xs font-bold" style={{ color: '#EF4444' }}>
                                                确定删除「{cat.name}」？
                                            </span>
                                            <div className="flex gap-2">
                                                <button onClick={() => setDeleteConfirm(null)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                                                    style={{ background: '#fff', color: C.textSoft, border: '1px solid #F0EBE1' }}>
                                                    取消
                                                </button>
                                                <button onClick={() => handleDelete(cat.name)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all active:scale-95"
                                                    style={{ background: '#EF4444' }}>
                                                    删除
                                                </button>
                                            </div>
                                        </div>
                                    )}
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

                    {/* Add / Edit form */}
                    {formMode ? (
                        <div className="rounded-2xl p-4 space-y-4" style={{ background: C.bgCard, border: '1px solid #F0EBE1' }}>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold" style={{ color: C.textSoft }}>
                                    {formMode === 'edit' ? '编辑分类' : '新建分类'}
                                </span>
                                <button onClick={() => setFormMode(null)}
                                    className="w-6 h-6 rounded-full flex items-center justify-center"
                                    style={{ background: C.bgLight, color: C.textMuted }}>
                                    <Icons.X size={12} />
                                </button>
                            </div>

                            {/* Preview card */}
                            <div className="rounded-2xl p-4 flex items-center gap-3 text-white"
                                style={{ background: formColor, boxShadow: `0 4px 20px ${formColor}40` }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm">
                                    {renderIcon(formIcon, 22, 'text-white')}
                                </div>
                                <div>
                                    <div className="font-black text-base">{formName || '分类名称'}</div>
                                    <div className="text-white/70 text-[11px] font-bold mt-0.5">自定义分类</div>
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: C.textMuted }}>名称</label>
                                <input
                                    value={formName}
                                    onChange={e => setFormName(e.target.value.substring(0, 8))}
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
                                        <button key={ic} onClick={() => setFormIcon(ic)}
                                            className="aspect-square rounded-xl flex items-center justify-center transition-all active:scale-90"
                                            style={{
                                                background: formIcon === ic ? formColor : C.bg,
                                                color: formIcon === ic ? '#fff' : C.textSoft,
                                                border: formIcon === ic ? 'none' : '1px solid #F0EBE1',
                                                boxShadow: formIcon === ic ? `0 4px 12px ${formColor}40` : 'none',
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
                                        <button key={col} onClick={() => setFormColor(col)}
                                            className="w-8 h-8 rounded-full transition-all active:scale-90"
                                            style={{
                                                background: col,
                                                boxShadow: formColor === col ? `0 0 0 3px ${C.bg}, 0 0 0 5px ${col}` : 'none',
                                                transform: formColor === col ? 'scale(1.15)' : 'scale(1)',
                                            }} />
                                    ))}
                                </div>
                            </div>

                            {/* Save button */}
                            <button onClick={handleSave}
                                disabled={!formName.trim()}
                                className="w-full py-3.5 rounded-2xl font-black text-white transition-all active:scale-[0.98] disabled:opacity-40"
                                style={{ background: formName.trim() ? C.orange : '#ccc', boxShadow: formName.trim() ? `0 4px 14px ${C.orange}50` : 'none' }}>
                                {formMode === 'edit' ? '保存修改' : '添加分类'}
                            </button>
                        </div>
                    ) : (
                        <button onClick={openAddForm}
                            className="w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            style={{ background: C.bgCard, color: C.orange, border: `2px dashed ${C.orange}40` }}>
                            <Icons.Plus size={16} /> 新建分类
                        </button>
                    )}
                </div>

                {/* — Footer — */}
                <div className="shrink-0 px-5 py-4" style={{ borderTop: '1px solid #F0EBE1' }}>
                    <button onClick={onClose}
                        className="w-full py-3.5 rounded-2xl font-black text-white transition-all active:scale-[0.98]"
                        style={{ background: '#FF8C42', boxShadow: '0 4px 14px rgba(255,140,66,0.3)' }}>
                        完成
                    </button>
                </div>
            </div>
        </div>
    );
};
