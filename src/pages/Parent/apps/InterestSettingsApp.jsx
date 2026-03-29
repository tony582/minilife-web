import React, { useState, useEffect } from 'react';
import { useDataContext } from '../../../context/DataContext.jsx';
import { useUIContext } from '../../../context/UIContext.jsx';
import { useToast } from '../../../hooks/useToast';
import { Icons } from '../../../utils/Icons';
import { getSpiritForm, getSpiritPrivileges } from '../../../utils/spiritUtils';
import { apiFetch } from '../../../api/client';

const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
    orange: '#FF8C42', teal: '#4ECDC4', green: '#10B981', purple: '#8B5CF6',
    yellow: '#FFD93D', coral: '#FF6B6B',
    textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
};

export const InterestSettingsApp = () => {
    const { kids, transactions } = useDataContext();
    const { parentSettings, setParentSettings } = useUIContext();
    const { notify } = useToast();
    const [calculating, setCalculating] = useState(false);
    const [results, setResults] = useState(null);

    // Interest settings from parentSettings
    const interestEnabled = parentSettings.interestEnabled !== false;
    const baseRate = parentSettings.interestBaseRate ?? 2;
    const maxCap = parentSettings.interestMaxCap ?? 50;

    const updateSetting = (key, value) => {
        setParentSettings(prev => ({ ...prev, [key]: value }));
    };

    // Manual interest calculation trigger
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
        <div className="space-y-5 max-w-lg">
            {/* Header */}
            <div className="rounded-2xl p-5 relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                    boxShadow: '0 8px 32px rgba(15,52,96,0.2)',
                }}>
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-15"
                    style={{ background: `radial-gradient(circle, ${C.teal}, transparent)` }}></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="text-3xl">💰</div>
                        <div>
                            <div className="text-base font-black text-white">精灵能量站设置</div>
                            <div className="text-[10px] font-bold text-white/40">
                                管理利息参数，让家庭币生息
                            </div>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-white/30 mt-2">
                        💡 精灵等级越高，利息加成越多，鼓励孩子坚持打卡！
                    </div>
                </div>
            </div>

            {/* Enable/Disable Toggle */}
            <div className="rounded-2xl p-4" style={{ background: C.bgCard, border: `1px solid ${C.bgLight}` }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: interestEnabled ? `${C.green}15` : `${C.textMuted}15` }}>
                            <Icons.Zap size={18} style={{ color: interestEnabled ? C.green : C.textMuted }} />
                        </div>
                        <div>
                            <div className="text-sm font-black" style={{ color: C.textPrimary }}>启用利息</div>
                            <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>
                                {interestEnabled ? '每周日自动发放' : '利息功能已关闭'}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => updateSetting('interestEnabled', !interestEnabled)}
                        className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors ${interestEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${interestEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>
            </div>

            {interestEnabled && (
                <>
                    {/* Base Rate Slider */}
                    <div className="rounded-2xl p-4" style={{ background: C.bgCard, border: `1px solid ${C.bgLight}` }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${C.teal}15` }}>
                                <Icons.TrendingUp size={18} style={{ color: C.teal }} />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-black" style={{ color: C.textPrimary }}>基础利率</div>
                                <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>每周按余额百分比发放</div>
                            </div>
                            <div className="text-lg font-black" style={{ color: C.teal }}>{baseRate}%/周</div>
                        </div>
                        <input type="range" min="0" max="10" step="1" value={baseRate}
                            onChange={e => updateSetting('interestBaseRate', Number(e.target.value))}
                            className="w-full accent-teal-500 h-2" />
                        <div className="flex justify-between mt-1">
                            <span className="text-[9px] font-bold" style={{ color: C.textMuted }}>0%</span>
                            <span className="text-[9px] font-bold" style={{ color: C.textMuted }}>10%</span>
                        </div>
                    </div>

                    {/* Max Cap */}
                    <div className="rounded-2xl p-4" style={{ background: C.bgCard, border: `1px solid ${C.bgLight}` }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${C.orange}15` }}>
                                <Icons.ShieldCheck size={18} style={{ color: C.orange }} />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-black" style={{ color: C.textPrimary }}>利息上限</div>
                                <div className="text-[10px] font-bold" style={{ color: C.textMuted }}>每周每个孩子最多获得</div>
                            </div>
                            <div className="text-lg font-black" style={{ color: C.orange }}>{maxCap}</div>
                        </div>
                        <input type="range" min="10" max="200" step="10" value={maxCap}
                            onChange={e => updateSetting('interestMaxCap', Number(e.target.value))}
                            className="w-full accent-orange-500 h-2" />
                        <div className="flex justify-between mt-1">
                            <span className="text-[9px] font-bold" style={{ color: C.textMuted }}>10</span>
                            <span className="text-[9px] font-bold" style={{ color: C.textMuted }}>200</span>
                        </div>
                    </div>

                    {/* Kids Preview */}
                    <div className="rounded-2xl p-4" style={{ background: C.bgCard, border: `1px solid ${C.bgLight}` }}>
                        <div className="text-sm font-black mb-3 flex items-center gap-2" style={{ color: C.textPrimary }}>
                            <Icons.Users size={14} style={{ color: C.purple }} /> 各孩子利息预览
                        </div>
                        <div className="space-y-2">
                            {kids.map(kid => {
                                const form = getSpiritForm(kid.level);
                                const priv = getSpiritPrivileges(kid.level);
                                const totalRate = baseRate + priv.interestBonus;
                                const balance = kid.balances?.spend || 0;
                                const est = Math.min(Math.floor(balance * totalRate / 100), maxCap);

                                return (
                                    <div key={kid.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: C.bg }}>
                                        <div className="text-xl">{form.emoji}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-black truncate" style={{ color: C.textPrimary }}>{kid.name}</div>
                                            <div className="text-[9px] font-bold" style={{ color: C.textMuted }}>
                                                Lv.{kid.level} {form.name} · 余额 {balance}
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-xs font-black" style={{ color: C.teal }}>
                                                +{est}/周
                                            </div>
                                            <div className="text-[8px] font-bold" style={{ color: C.textMuted }}>
                                                {baseRate}%{priv.interestBonus > 0 ? ` +${priv.interestBonus}%精灵` : ''}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Manual Calculate Button */}
                    <button onClick={handleCalculateInterest} disabled={calculating}
                        className="w-full rounded-2xl p-4 text-sm font-black text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                        style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.green})` }}>
                        {calculating ? '⏳ 计算中...' : '🚀 手动发放本周利息'}
                    </button>

                    {/* Results */}
                    {results && results.length > 0 && (
                        <div className="rounded-2xl p-4" style={{ background: `${C.green}08`, border: `1px solid ${C.green}20` }}>
                            <div className="text-xs font-black mb-2" style={{ color: C.green }}>✅ 利息发放结果</div>
                            {results.map((r, i) => (
                                <div key={i} className="text-[11px] font-bold py-1" style={{ color: C.textSoft }}>
                                    {r.name}: {r.interest > 0 ? (
                                        <span style={{ color: C.green }}>+{r.interest} 家庭币 (利率 {r.rate}%)</span>
                                    ) : (
                                        <span style={{ color: C.textMuted }}>{r.reason || '无利息'}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
