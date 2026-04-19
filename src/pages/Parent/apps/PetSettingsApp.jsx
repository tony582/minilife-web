import React from 'react';
import { useDataContext } from '../../../context/DataContext.jsx';
import { useUIContext } from '../../../context/UIContext.jsx';
import { Icons } from '../../../utils/Icons';

const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1',
    orange: '#FF8C42', teal: '#4ECDC4', green: '#10B981',
    purple: '#8B5CF6', blue: '#6C9CFF', coral: '#FF6B6B',
    textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
};

const DECAY_OPTIONS = [
    { id: 'slow',   label: '慢速',   desc: '属性下降较慢，适合家长工作繁忙时' },
    { id: 'normal', label: '正常',   desc: '默认节奏，每天需要照看一次' },
    { id: 'fast',   label: '快速',   desc: '属性下降较快，增强紧迫感和互动频率' },
];

const TREAT_COST_OPTIONS = [3, 5, 8, 10, 15];
const DAILY_MINUTES_OPTIONS = [10, 15, 20, 30, 45, 60];

export const PetSettingsApp = () => {
    const { kids } = useDataContext();
    const { parentSettings, setParentSettings } = useUIContext();

    const petEnabled       = parentSettings.petEnabled !== false;
    const petDailyMinutes  = parentSettings.petDailyMinutes ?? 15;
    const petDecaySpeed    = parentSettings.petDecaySpeed ?? 'normal';
    const petTreatCost     = parentSettings.petTreatCost ?? 5;
    const petAntiAddiction = parentSettings.petAntiAddiction !== false;

    const update = (key, value) =>
        setParentSettings(prev => ({ ...prev, [key]: value }));

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: C.textPrimary }}>
                    <Icons.Heart size={26} style={{ color: C.coral }} />
                    宠物系统设置
                </h1>
                <p className="text-sm font-bold mt-0.5" style={{ color: C.textSoft }}>
                    配置虚拟宠物的行为规则，让孩子们养成照顾生命的习惯
                </p>
            </div>

            {/* 2-col layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

                {/* Left: Settings */}
                <div className="space-y-4">

                    {/* Global Enable */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                    style={{ background: petEnabled ? `${C.coral}15` : `${C.textMuted}15` }}>
                                    <Icons.Heart size={22} style={{ color: petEnabled ? C.coral : C.textMuted }} />
                                </div>
                                <div>
                                    <div className="text-base font-black" style={{ color: C.textPrimary }}>启用虚拟宠物</div>
                                    <div className="text-xs font-bold mt-0.5" style={{ color: C.textMuted }}>
                                        {petEnabled ? '孩子可在宠物房间与猫咪互动' : '宠物功能已关闭，子页不可见'}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => update('petEnabled', !petEnabled)}
                                className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors ${petEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${petEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    {petEnabled && (<>

                        {/* Anti-addiction daily limit */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                        style={{ background: `${C.blue}15` }}>
                                        <Icons.Clock size={22} style={{ color: C.blue }} />
                                    </div>
                                    <div>
                                        <div className="text-base font-black" style={{ color: C.textPrimary }}>防沉迷时长限制</div>
                                        <div className="text-xs font-bold" style={{ color: C.textMuted }}>每天可进入宠物房间的时间上限</div>
                                    </div>
                                </div>
                                <button onClick={() => update('petAntiAddiction', !petAntiAddiction)}
                                    className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors ${petAntiAddiction ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${petAntiAddiction ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {petAntiAddiction && (
                                <div className="flex flex-wrap gap-2">
                                    {DAILY_MINUTES_OPTIONS.map(m => (
                                        <button key={m} onClick={() => update('petDailyMinutes', m)}
                                            className="px-4 py-2 rounded-xl text-sm font-black transition-all"
                                            style={{
                                                background: petDailyMinutes === m ? C.blue : C.bg,
                                                color: petDailyMinutes === m ? '#FFF' : C.textSoft,
                                                border: `2px solid ${petDailyMinutes === m ? C.blue : C.bgLight}`,
                                            }}>
                                            {m} 分钟
                                        </button>
                                    ))}
                                </div>
                            )}
                            {!petAntiAddiction && (
                                <div className="text-xs font-bold px-1" style={{ color: C.textMuted }}>
                                    已关闭时长限制，孩子可无限进入宠物房间
                                </div>
                            )}
                        </div>

                        {/* Decay speed */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                    style={{ background: `${C.orange}15` }}>
                                    <Icons.Activity size={22} style={{ color: C.orange }} />
                                </div>
                                <div>
                                    <div className="text-base font-black" style={{ color: C.textPrimary }}>属性衰减速度</div>
                                    <div className="text-xs font-bold" style={{ color: C.textMuted }}>控制宠物饥饿度、心情的下降节奏</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {DECAY_OPTIONS.map(opt => (
                                    <button key={opt.id} onClick={() => update('petDecaySpeed', opt.id)}
                                        className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all"
                                        style={{
                                            background: petDecaySpeed === opt.id ? `${C.orange}08` : C.bg,
                                            border: `2px solid ${petDecaySpeed === opt.id ? C.orange : 'transparent'}`,
                                        }}>
                                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                                            style={{ borderColor: petDecaySpeed === opt.id ? C.orange : C.textMuted }}>
                                            {petDecaySpeed === opt.id && (
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.orange }} />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black" style={{ color: petDecaySpeed === opt.id ? C.orange : C.textPrimary }}>{opt.label}</div>
                                            <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>{opt.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Treat cost */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                    style={{ background: `${C.green}15` }}>
                                    <Icons.Gift size={22} style={{ color: C.green }} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-base font-black" style={{ color: C.textPrimary }}>喂食消耗金币</div>
                                    <div className="text-xs font-bold" style={{ color: C.textMuted }}>每次喂宠物零食消耗的家庭币数量</div>
                                </div>
                                <div className="text-2xl font-black" style={{ color: C.green }}>
                                    {petTreatCost}<span className="text-sm font-bold text-slate-400"> 币</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {TREAT_COST_OPTIONS.map(n => (
                                    <button key={n} onClick={() => update('petTreatCost', n)}
                                        className="px-4 py-2 rounded-xl text-sm font-black transition-all"
                                        style={{
                                            background: petTreatCost === n ? C.green : C.bg,
                                            color: petTreatCost === n ? '#FFF' : C.textSoft,
                                            border: `2px solid ${petTreatCost === n ? C.green : C.bgLight}`,
                                        }}>
                                        {n} 币
                                    </button>
                                ))}
                            </div>
                        </div>

                    </>)}
                </div>

                {/* Right: kids pets status */}
                <div className="space-y-4">
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Icons.Users size={16} style={{ color: C.purple }} />
                            <span className="text-sm font-black" style={{ color: C.textPrimary }}>各孩子的宠物</span>
                        </div>
                        {kids.length === 0 ? (
                            <div className="text-center py-10" style={{ color: C.textMuted }}>
                                <Icons.Heart size={32} className="mx-auto mb-2 opacity-20" />
                                <div className="text-sm font-bold">暂无孩子信息</div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {kids.map(kid => (
                                    <div key={kid.id} className="rounded-2xl p-4 flex items-center gap-3"
                                        style={{ background: C.bg, border: `1px solid ${C.bgLight}` }}>
                                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm"
                                            style={{ background: C.bgLight }}>
                                            {/* Avatar placeholder */}
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Icons.User size={18} style={{ color: C.textMuted }} />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-black truncate" style={{ color: C.textPrimary }}>{kid.name}</div>
                                            <div className="text-xs font-bold mt-0.5" style={{ color: C.textMuted }}>
                                                Lv.{kid.level} · 宠物在宠物房间设置
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            {petEnabled
                                                ? <span className="text-[10px] font-black px-2 py-1 rounded-full" style={{ background: `${C.green}15`, color: C.green }}>已开启</span>
                                                : <span className="text-[10px] font-black px-2 py-1 rounded-full" style={{ background: `${C.textMuted}15`, color: C.textMuted }}>已关闭</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tips */}
                    <div className="rounded-3xl p-5 space-y-3" style={{ background: `${C.purple}08`, border: `1px solid ${C.purple}20` }}>
                        <div className="text-xs font-black" style={{ color: C.purple }}>设计说明</div>
                        {[
                            { icon: <Icons.Heart size={12} />, text: '孩子完成任务/打卡可为宠物赚取能量值' },
                            { icon: <Icons.Gift size={12} />, text: '消耗家庭币购买零食喂养宠物提升心情' },
                            { icon: <Icons.Clock size={12} />, text: '防沉迷功能每天重置，超时自动退出' },
                            { icon: <Icons.Activity size={12} />, text: '属性衰减使孩子每天都有理由照看宠物' },
                        ].map((tip, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <div className="mt-0.5 shrink-0" style={{ color: C.purple }}>{tip.icon}</div>
                                <span className="text-[11px] font-bold" style={{ color: C.textSoft }}>{tip.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
