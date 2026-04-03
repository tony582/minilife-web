import React from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../../utils/Icons';
import { SPIRIT_FORMS } from '../../utils/spiritUtils';

// Icon and color config per level stage
const STAGE_CONFIG = {
    egg:      { Icon: Icons.Star,          bg: 'from-amber-100 to-orange-200',     accent: '#F59E0B', light: '#FEF3C7' },
    sprout:   { Icon: Icons.Leaf,          bg: 'from-green-100 to-emerald-200',    accent: '#10B981', light: '#D1FAE5' },
    young:    { Icon: Icons.BookOpen,      bg: 'from-blue-100 to-cyan-200',        accent: '#06B6D4', light: '#CFFAFE' },
    mature:   { Icon: Icons.GraduationCap, bg: 'from-indigo-100 to-purple-200',    accent: '#8B5CF6', light: '#EDE9FE' },
    ultimate: { Icon: Icons.Gem,           bg: 'from-rose-100 to-fuchsia-200',     accent: '#EC4899', light: '#FCE7F3' },
};

export const LevelPrivilegeModal = ({ isOpen, onClose, activeKid, currentForm }) => {
    if (!isOpen || !activeKid || !currentForm) return null;

    const cfg = STAGE_CONFIG[currentForm.id] || STAGE_CONFIG.egg;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Sheet — slides up on mobile, centered on PC */}
            <div
                className="relative bg-white w-full md:max-w-md md:rounded-[2.5rem] rounded-t-[2rem] shadow-2xl z-10 flex flex-col overflow-hidden"
                style={{ maxHeight: '90vh', animation: 'drawerIn 0.35s cubic-bezier(0.34,1.1,0.64,1)' }}
            >
                {/* ── Coloured Header ── */}
                <div className={`bg-gradient-to-br ${cfg.bg} px-6 pt-5 pb-6 relative overflow-hidden shrink-0`}>
                    {/* Drag handle */}
                    <div className="flex justify-center mb-4 md:hidden">
                        <div className="w-10 h-1.5 rounded-full bg-black/10" />
                    </div>
                    {/* Close btn (PC) */}
                    <button onClick={onClose}
                        className="absolute top-5 right-5 hidden md:flex w-8 h-8 rounded-full bg-black/10 items-center justify-center hover:bg-black/15 transition-colors">
                        <Icons.X size={16} />
                    </button>

                    {/* Title */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                            style={{ background: cfg.accent }}>
                            <cfg.Icon size={24} className="text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-black/40 tracking-widest uppercase mb-0.5">我的等级</div>
                            <div className="text-2xl font-black text-slate-800 tracking-tight">
                                Lv.{activeKid.level} {currentForm.name}
                            </div>
                        </div>
                    </div>

                    {/* Stage description */}
                    <div className="mt-4 text-sm font-bold text-slate-600 bg-white/50 rounded-2xl px-4 py-3 leading-relaxed">
                        {currentForm.unlockText || currentForm.desc}
                    </div>
                </div>

                {/* ── Level Roadmap ── */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3 bg-slate-50/60">
                    <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase px-1 mb-1">全部等阶 · 点亮你的成长之路</div>

                    {SPIRIT_FORMS.map((form, idx) => {
                        const stageCfg = STAGE_CONFIG[form.id] || STAGE_CONFIG.egg;
                        const isCurrent = currentForm.id === form.id;
                        const isUnlocked = activeKid.level >= form.minLevel;
                        const StageIcon = stageCfg.Icon;
                        const hasPerks = form.interestBonus > 0 || form.dailyBonus > 0 || form.shopDiscount > 0;

                        return (
                            <div key={form.id}
                                className={`rounded-[1.5rem] overflow-hidden border-2 transition-all ${isCurrent
                                    ? 'border-transparent shadow-[0_4px_20px_rgba(0,0,0,0.1)]'
                                    : isUnlocked
                                        ? 'border-slate-100 bg-white'
                                        : 'border-slate-100 bg-white/50 opacity-50 grayscale'
                                    }`}
                                style={isCurrent ? { borderColor: stageCfg.accent + '60', background: '#fff' } : {}}
                            >
                                {/* Top bar */}
                                <div className={`px-4 py-3 flex items-center gap-3 ${isCurrent ? 'bg-gradient-to-r ' + stageCfg.bg : 'bg-white'}`}>
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0`}
                                        style={{ background: isUnlocked ? stageCfg.accent : '#CBD5E1' }}>
                                        <StageIcon size={18} className="text-white" strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2 flex-wrap">
                                            <span className="font-black text-slate-800 text-sm">{form.name}</span>
                                            <span className="text-[10px] font-bold text-slate-400">Lv.{form.minLevel}{form.maxLevel > form.minLevel ? `–${form.maxLevel}` : '+'}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">{form.desc}</div>
                                    </div>
                                    {isCurrent && (
                                        <div className="flex-shrink-0 text-[10px] font-black text-white px-2.5 py-1 rounded-full"
                                            style={{ background: stageCfg.accent }}>
                                            当前
                                        </div>
                                    )}
                                    {!isUnlocked && (
                                        <Icons.Lock size={14} className="flex-shrink-0 text-slate-300" />
                                    )}
                                </div>

                                {/* Perks */}
                                {hasPerks && (
                                    <div className="px-4 pb-3 pt-1 flex flex-wrap gap-2">
                                        {form.interestBonus > 0 && (
                                            <div className="flex items-center gap-1 text-[11px] font-bold rounded-lg px-2.5 py-1 border"
                                                style={{ background: '#F0FDFA', color: '#0D9488', borderColor: '#99F6E4' }}>
                                                <Icons.TrendingUp size={11} />
                                                利息 +{form.interestBonus}%/周
                                            </div>
                                        )}
                                        {form.dailyBonus > 0 && (
                                            <div className="flex items-center gap-1 text-[11px] font-bold rounded-lg px-2.5 py-1 border"
                                                style={{ background: '#FFF7ED', color: '#EA580C', borderColor: '#FED7AA' }}>
                                                <Icons.Sparkles size={11} />
                                                每日 +{form.dailyBonus} 奖励
                                            </div>
                                        )}
                                        {form.shopDiscount > 0 && (
                                            <div className="flex items-center gap-1 text-[11px] font-bold rounded-lg px-2.5 py-1 border"
                                                style={{ background: '#FAF5FF', color: '#7C3AED', borderColor: '#DDD6FE' }}>
                                                <Icons.Tag size={11} />
                                                商城 {100 - form.shopDiscount}折
                                            </div>
                                        )}
                                    </div>
                                )}
                                {!hasPerks && (
                                    <div className="px-4 pb-3 pt-1">
                                        <span className="text-[11px] text-slate-400 font-bold">继续积累星尘，更多特权等着你！</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Safe area bottom */}
                    <div style={{ height: 'env(safe-area-inset-bottom, 16px)' }} />
                </div>
            </div>
        </div>,
        document.body
    );
};
