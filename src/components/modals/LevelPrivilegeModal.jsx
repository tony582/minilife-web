import React from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../../utils/Icons';
import { SPIRIT_FORMS } from '../../utils/spiritUtils';

const STAGE_CONFIG = {
    egg:      { Icon: Icons.Star,          accent: '#F59E0B', bg: '#FEF3C7' },
    sprout:   { Icon: Icons.Leaf,          accent: '#10B981', bg: '#D1FAE5' },
    young:    { Icon: Icons.BookOpen,      accent: '#06B6D4', bg: '#CFFAFE' },
    mature:   { Icon: Icons.GraduationCap, accent: '#8B5CF6', bg: '#EDE9FE' },
    ultimate: { Icon: Icons.Gem,           accent: '#EC4899', bg: '#FCE7F3' },
};

const PERK_NONE_TEXT = '完成任务积累星尘，解锁更多特权';

export const LevelPrivilegeModal = ({ isOpen, onClose, activeKid, currentForm }) => {
    if (!isOpen || !activeKid || !currentForm) return null;

    const cfg = STAGE_CONFIG[currentForm.id] || STAGE_CONFIG.egg;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Sheet */}
            <div className="relative bg-white w-full md:max-w-md md:rounded-[2rem] rounded-t-[2rem] shadow-2xl z-10 flex flex-col overflow-hidden"
                style={{ maxHeight: '90vh', animation: 'drawerIn 0.35s cubic-bezier(0.34,1.1,0.64,1)' }}>

                {/* ── Header ── */}
                <div className="shrink-0 px-6 pt-5 pb-5" style={{ background: cfg.bg }}>
                    {/* Drag handle */}
                    <div className="flex justify-center mb-4 md:hidden">
                        <div className="w-10 h-1.5 rounded-full bg-black/10" />
                    </div>

                    {/* Close (PC) */}
                    <button onClick={onClose}
                        className="absolute top-5 right-5 hidden md:flex w-8 h-8 rounded-full bg-black/10 items-center justify-center hover:bg-black/15 transition-colors">
                        <Icons.X size={16} />
                    </button>

                    {/* Level badge + name */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                            style={{ background: cfg.accent }}>
                            <cfg.Icon size={22} className="text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <div className="text-[11px] font-bold tracking-widest uppercase mb-0.5" style={{ color: cfg.accent }}>
                                星尘等级
                            </div>
                            <div className="text-xl font-black text-slate-800">
                                Lv.{activeKid.level} · {currentForm.name}
                            </div>
                        </div>
                    </div>

                    {/* Level range progress bar */}
                    <div className="rounded-xl px-4 py-2.5 bg-white/60">
                        <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                            <span>Lv.{currentForm.minLevel}</span>
                            <span>Lv.{currentForm.maxLevel > currentForm.minLevel ? currentForm.maxLevel : '∞'}</span>
                        </div>
                        <div className="h-2 rounded-full bg-black/8 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: currentForm.maxLevel > currentForm.minLevel
                                        ? `${Math.min(100, ((activeKid.level - currentForm.minLevel) / (currentForm.maxLevel - currentForm.minLevel)) * 100)}%`
                                        : '100%',
                                    background: cfg.accent,
                                }} />
                        </div>
                    </div>
                </div>

                {/* ── Roadmap ── */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-slate-50">
                    <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase px-1 mb-3">成长路线</div>

                    {SPIRIT_FORMS.map((form) => {
                        const stageCfg = STAGE_CONFIG[form.id] || STAGE_CONFIG.egg;
                        const isCurrent = currentForm.id === form.id;
                        const isUnlocked = activeKid.level >= form.minLevel;
                        const StageIcon = stageCfg.Icon;
                        const perks = [];
                        if (form.interestBonus > 0)  perks.push({ icon: Icons.TrendingUp, label: `周利息 +${form.interestBonus}%`, color: '#0D9488' });
                        if (form.dailyBonus > 0)      perks.push({ icon: Icons.Sparkles,  label: `每日掉落 +${form.dailyBonus}`, color: '#EA580C' });
                        if (form.shopDiscount > 0)    perks.push({ icon: Icons.Tag,        label: `商城 ${100 - form.shopDiscount}折`, color: '#7C3AED' });

                        return (
                            <div key={form.id}
                                className="rounded-2xl overflow-hidden transition-all"
                                style={{
                                    background: '#fff',
                                    border: isCurrent ? `2px solid ${stageCfg.accent}` : '2px solid transparent',
                                    opacity: !isUnlocked ? 0.45 : 1,
                                    boxShadow: isCurrent ? `0 4px 16px ${stageCfg.accent}25` : '0 1px 3px rgba(0,0,0,0.04)',
                                }}>
                                {/* Row */}
                                <div className="flex items-center gap-3 px-4 py-3">
                                    {/* Icon */}
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ background: isUnlocked ? stageCfg.bg : '#F1F5F9' }}>
                                        <StageIcon size={18} style={{ color: isUnlocked ? stageCfg.accent : '#CBD5E1' }} strokeWidth={2.5} />
                                    </div>

                                    {/* Name + range */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-slate-800 text-sm">{form.name}</span>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                Lv.{form.minLevel}{form.maxLevel > form.minLevel ? `–${form.maxLevel}` : '+'}
                                            </span>
                                        </div>
                                        {/* Perks inline */}
                                        {perks.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                {perks.map((p, i) => (
                                                    <span key={i} className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg"
                                                        style={{ background: `${p.color}12`, color: p.color }}>
                                                        <p.icon size={9} />
                                                        {p.label}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-[11px] text-slate-400 font-medium mt-0.5">{PERK_NONE_TEXT}</div>
                                        )}
                                    </div>

                                    {/* Status badge */}
                                    {isCurrent ? (
                                        <span className="shrink-0 text-[10px] font-black text-white px-2.5 py-1 rounded-full"
                                            style={{ background: stageCfg.accent }}>当前</span>
                                    ) : !isUnlocked ? (
                                        <Icons.Lock size={13} className="shrink-0 text-slate-300" />
                                    ) : (
                                        <Icons.CheckCircle size={15} style={{ color: stageCfg.accent }} className="shrink-0" />
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    <div style={{ height: 'env(safe-area-inset-bottom, 16px)' }} />
                </div>
            </div>
        </div>,
        document.body
    );
};
