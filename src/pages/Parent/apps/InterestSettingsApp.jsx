import React, { useState } from 'react';
import { useDataContext } from '../../../context/DataContext.jsx';
import { useUIContext } from '../../../context/UIContext.jsx';
import { useToast } from '../../../hooks/useToast';
import { Icons } from '../../../utils/Icons';
import { getSpiritForm, getSpiritPrivileges } from '../../../utils/spiritUtils';
import { apiFetch } from '../../../api/client';

const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
    orange: '#FF8C42', teal: '#4ECDC4', green: '#10B981', purple: '#8B5CF6',
    yellow: '#FFD93D', coral: '#FF6B6B', pink: '#EC4899', fuchsia: '#C026D3',
    textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
};

export const InterestSettingsApp = () => {
    const { kids } = useDataContext();
    const { parentSettings, setParentSettings } = useUIContext();
    const { notify } = useToast();
    const [calculating, setCalculating] = useState(false);
    const [results, setResults] = useState(null);

    const interestEnabled = parentSettings.interestEnabled !== false;
    const baseRate = parentSettings.interestBaseRate ?? 2;
    const maxCap = parentSettings.interestMaxCap ?? 50;

    const updateSetting = (key, value) => {
        setParentSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleCalculateInterest = async () => {
        setCalculating(true);
        try {
            const res = await apiFetch('/api/interest/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            setResults(data.results || []);
            if (data.results?.some(r => r.interest > 0)) {
                notify('利息已发放！', 'success');
            } else {
                notify('本次无利息发放（余额为0或功能关闭）', 'info');
            }
        } catch (e) {
            notify('利息计算失败: ' + e.message, 'error');
        }
        setCalculating(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">

            {/* ── Page Header ───────────────────────────────────── */}
            <div>
                <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: C.textPrimary }}>
                    <Icons.Sparkles size={26} style={{ color: C.purple }} />
                    星尘等级设置
                </h1>
                <p className="text-sm font-bold mt-0.5" style={{ color: C.textSoft }}>
                    管理利息参数，等级越高加成越多，激励孩子坚持打卡
                </p>
            </div>

            {/* ── Main 2-col grid ───────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

                {/* ── Left: Settings ──────────────────────────── */}
                <div className="space-y-4">

                    {/* Enable Toggle */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                    style={{ background: interestEnabled ? `${C.green}15` : `${C.textMuted}15` }}>
                                    <Icons.Zap size={22} style={{ color: interestEnabled ? C.green : C.textMuted }} />
                                </div>
                                <div>
                                    <div className="text-base font-black" style={{ color: C.textPrimary }}>启用利息系统</div>
                                    <div className="text-xs font-bold mt-0.5" style={{ color: C.textMuted }}>
                                        {interestEnabled ? '每周日自动按余额发放' : '利息功能已关闭'}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => updateSetting('interestEnabled', !interestEnabled)}
                                className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors ${interestEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${interestEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    {interestEnabled && (
                        <>
                            {/* Base Rate Slider */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${C.teal}15` }}>
                                        <Icons.TrendingUp size={22} style={{ color: C.teal }} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-base font-black" style={{ color: C.textPrimary }}>基础利率</div>
                                        <div className="text-xs font-bold" style={{ color: C.textMuted }}>每周按余额百分比自动发放</div>
                                    </div>
                                    <div className="text-2xl font-black" style={{ color: C.teal }}>{baseRate}%<span className="text-sm font-bold text-slate-400">/周</span></div>
                                </div>
                                <input type="range" min="0" max="10" step="1" value={baseRate}
                                    onChange={e => updateSetting('interestBaseRate', Number(e.target.value))}
                                    className="w-full accent-teal-500 h-2" />
                                <div className="flex justify-between mt-1.5">
                                    <span className="text-[10px] font-bold" style={{ color: C.textMuted }}>0% 关闭</span>
                                    <span className="text-[10px] font-bold" style={{ color: C.textMuted }}>10% 最高</span>
                                </div>
                            </div>

                            {/* Max Cap Slider */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${C.orange}15` }}>
                                        <Icons.ShieldCheck size={22} style={{ color: C.orange }} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-base font-black" style={{ color: C.textPrimary }}>每周利息上限</div>
                                        <div className="text-xs font-bold" style={{ color: C.textMuted }}>每个孩子每周最多获得的利息</div>
                                    </div>
                                    <div className="text-2xl font-black" style={{ color: C.orange }}>{maxCap}<span className="text-sm font-bold text-slate-400"> 币</span></div>
                                </div>
                                <input type="range" min="10" max="200" step="10" value={maxCap}
                                    onChange={e => updateSetting('interestMaxCap', Number(e.target.value))}
                                    className="w-full accent-orange-500 h-2" />
                                <div className="flex justify-between mt-1.5">
                                    <span className="text-[10px] font-bold" style={{ color: C.textMuted }}>10</span>
                                    <span className="text-[10px] font-bold" style={{ color: C.textMuted }}>200</span>
                                </div>
                            </div>

                            {/* Manual trigger */}
                            <button onClick={handleCalculateInterest} disabled={calculating}
                                className="w-full rounded-3xl p-4 text-sm font-black text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                                style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.green})`, boxShadow: `0 4px 16px ${C.teal}40` }}>
                                {calculating
                                    ? <><Icons.RefreshCw size={16} className="animate-spin" /> 计算中...</>
                                    : <><Icons.Zap size={16} /> 手动发放本周利息</>}
                            </button>

                            {/* Results */}
                            {results && results.length > 0 && (
                                <div className="rounded-3xl p-5 border" style={{ background: `${C.green}08`, borderColor: `${C.green}25` }}>
                                    <div className="flex items-center gap-2 text-sm font-black mb-3" style={{ color: C.green }}>
                                        <Icons.CheckCircle size={16} /> 利息发放结果
                                    </div>
                                    <div className="space-y-2">
                                        {results.map((r, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs font-bold py-1.5 px-3 rounded-xl" style={{ background: C.bgCard }}>
                                                <span style={{ color: C.textPrimary }}>{r.name}</span>
                                                {r.interest > 0
                                                    ? <span style={{ color: C.green }}>+{r.interest} 家庭币 · {r.rate}%</span>
                                                    : <span style={{ color: C.textMuted }}>{r.reason || '无利息'}</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── Right: Kids Preview ─────────────────────── */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Icons.Users size={16} style={{ color: C.purple }} />
                        <span className="text-sm font-black" style={{ color: C.textPrimary }}>各孩子利息预览</span>
                    </div>
                    {kids.length === 0 ? (
                        <div className="text-center py-10" style={{ color: C.textMuted }}>
                            <Icons.Users size={32} className="mx-auto mb-2 opacity-30" />
                            <div className="text-sm font-bold">暂无孩子信息</div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {kids.map(kid => {
                                const form = getSpiritForm(kid.level);
                                const priv = getSpiritPrivileges(kid.level);
                                const totalRate = baseRate + priv.interestBonus;
                                const balance = kid.balances?.spend || 0;
                                const est = interestEnabled ? Math.min(Math.floor(balance * totalRate / 100), maxCap) : 0;

                                return (
                                    <div key={kid.id} className="rounded-2xl p-4" style={{ background: C.bg, border: `1px solid ${C.bgLight}` }}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                                style={{ background: `${form.color}15` }}>
                                                <Icons.Sparkles size={16} style={{ color: form.color }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-black truncate" style={{ color: C.textPrimary }}>{kid.name}</div>
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md mt-0.5"
                                                    style={{ background: `${form.color}15`, border: `1px solid ${form.color}25` }}>
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black"
                                                        style={{ background: form.color, color: '#FFF' }}>Lv.{kid.level}</span>
                                                    <span className="text-[10px] font-black" style={{ color: form.color }}>{form.name}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.8)' }}>
                                                <div className="text-[9px] font-bold mb-0.5" style={{ color: C.textMuted }}>余额</div>
                                                <div className="text-sm font-black" style={{ color: C.textPrimary }}>{balance}</div>
                                            </div>
                                            <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.8)' }}>
                                                <div className="text-[9px] font-bold mb-0.5" style={{ color: C.textMuted }}>利率</div>
                                                <div className="text-sm font-black" style={{ color: C.teal }}>
                                                    {totalRate}%
                                                    {priv.interestBonus > 0 && <span className="text-[9px] text-purple-400 block">+{priv.interestBonus}%等级加成</span>}
                                                </div>
                                            </div>
                                            <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.8)' }}>
                                                <div className="text-[9px] font-bold mb-0.5" style={{ color: C.textMuted }}>预计/周</div>
                                                <div className="text-sm font-black" style={{ color: interestEnabled ? C.green : C.textMuted }}>
                                                    {interestEnabled ? `+${est}` : '—'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Legend */}
                    <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] font-bold" style={{ color: C.textMuted }}>
                        <div className="flex items-center gap-1.5 mb-1">
                            <Icons.Info size={11} />
                            预计利息 = 余额 × 总利率，不超过每周上限
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Icons.Clock size={11} />
                            每周日 00:00 自动结算并发放
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
