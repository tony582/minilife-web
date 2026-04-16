import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../context/AuthContext.jsx';
import { useDataContext } from '../../../context/DataContext.jsx';
import { useToast } from '../../../hooks/useToast';
import { apiFetch, safeJsonOr } from '../../../api/client';
import { Icons } from '../../../utils/Icons';

// ─── Plan config ───────────────────────────────────────────────────
const PLANS = [
    {
        id: 'quarterly',
        label: '季度订阅',
        price: '¥38',
        period: '/ 季',
        days: 90,
        badge: '试一试',
        color: '#6366F1',
        bg: '#EEF2FF',
        highlight: false,
        perMonth: '¥12.7/月',
    },
    {
        id: 'annual',
        label: '年度订阅',
        price: '¥98',
        period: '/ 年',
        days: 365,
        badge: '推荐 省35%',
        color: '#FF8C42',
        bg: '#FFF7ED',
        highlight: true,
        perMonth: '¥8.2/月',
    },
];

const PLAN_LABEL = { quarterly: '季度订阅', annual: '年度订阅', custom: '自定义', null: '订阅' };

export const SubscriptionApp = () => {
    const { user, setUser } = useAuthContext();
    const { usedCodes, setUsedCodes } = useDataContext();
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [qrSettings, setQrSettings] = useState({});
    const { notify } = useToast();

    useEffect(() => {
        apiFetch('/api/settings/public')
            .then(r => r.ok ? r.json() : {})
            .then(d => setQrSettings(d))
            .catch(() => {});
    }, []);

    const handleRedeem = async () => {
        if (!code.trim() || submitting) return;
        setSubmitting(true);
        try {
            const res = await apiFetch('/api/redeem-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim() }),
            });
            const ct = res.headers.get('content-type') || '';
            if (!ct.includes('application/json')) {
                notify('服务器响应异常，请稍后重试', 'error');
                setSubmitting(false);
                return;
            }
            const data = await res.json();
            if (!res.ok) {
                const hint = (data.remaining_attempts !== undefined && data.remaining_attempts > 0)
                    ? `（还可尝试 ${data.remaining_attempts} 次）` : '';
                notify((data.error || '兑换失败') + hint, 'error');
                setSubmitting(false);
                return;
            }
            notify(`🎉 ${data.plan_label || '订阅'}已激活！有效期 +${data.duration_days} 天`, 'success');
            setUser(prev => ({ ...prev, sub_end_date: data.new_sub_end_date }));
            setCode('');
            apiFetch('/api/me/codes').then(r => safeJsonOr(r, [])).then(d => d && setUsedCodes(d)).catch(console.error);
        } catch {
            notify('网络错误，请重试', 'error');
        }
        setSubmitting(false);
    };

    const isExpired = user?.sub_end_date && new Date(user.sub_end_date) < new Date();
    const daysLeft = user?.sub_end_date
        ? Math.max(0, Math.ceil((new Date(user.sub_end_date).getTime() - Date.now()) / 86400000))
        : null;
    const hasWechatQr = qrSettings.wechat_qr;
    const hasXhsQr = qrSettings.xiaohongshu_qr;

    return (
        <div className="space-y-5 max-w-lg mx-auto">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Icons.Award size={22} className="text-orange-500" /> 订阅与兑换
            </h2>

            {/* ─── 账号状态卡 ─────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className={`px-5 py-4 ${isExpired ? 'bg-rose-50' : 'bg-gradient-to-r from-emerald-50 to-teal-50'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs font-bold text-slate-400 mb-0.5">当前账号</div>
                            <div className="font-black text-slate-800 text-sm">{user?.email}</div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-black shadow-sm
                            ${isExpired ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                            {isExpired ? '⚠️ 已到期' : '✅ 正常使用'}
                        </div>
                    </div>
                </div>
                <div className="px-5 py-4 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-400 mb-0.5">服务有效期至</div>
                        <div className={`font-black text-lg ${isExpired ? 'text-rose-500' : 'text-emerald-600'}`}>
                            {user?.sub_end_date ? new Date(user.sub_end_date).toLocaleDateString('zh-CN') : '永久有效'}
                        </div>
                    </div>
                    {!isExpired && daysLeft !== null && (
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-400 mb-0.5">剩余</div>
                            <div className={`font-black text-2xl ${daysLeft <= 7 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                {daysLeft} <span className="text-base font-bold">天</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── 价格方案 ────────────────────────────────────── */}
            <div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">订阅方案</div>
                <div className="grid grid-cols-2 gap-3">
                    {PLANS.map(plan => (
                        <div key={plan.id}
                            className="rounded-2xl border-2 p-4 relative overflow-hidden transition-all"
                            style={{
                                borderColor: plan.highlight ? plan.color : '#E2E8F0',
                                background: plan.highlight ? plan.bg : '#FAFAFA',
                            }}>
                            {plan.highlight && (
                                <div className="absolute top-0 right-0 text-[10px] font-black text-white px-2.5 py-1 rounded-bl-xl"
                                    style={{ background: plan.color }}>
                                    {plan.badge}
                                </div>
                            )}
                            {!plan.highlight && (
                                <div className="absolute top-0 right-0 text-[10px] font-black px-2.5 py-1 rounded-bl-xl"
                                    style={{ color: plan.color, background: plan.bg }}>
                                    {plan.badge}
                                </div>
                            )}
                            <div className="text-xs font-bold mt-1 mb-2" style={{ color: plan.color }}>{plan.label}</div>
                            <div className="flex items-end gap-0.5 mb-1">
                                <span className="text-2xl font-black" style={{ color: '#1E293B' }}>{plan.price}</span>
                                <span className="text-xs font-bold text-slate-400 mb-1">{plan.period}</span>
                            </div>
                            <div className="text-[10px] font-bold text-slate-400">{plan.perMonth} · {plan.days}天</div>
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-slate-400 font-bold text-center mt-2">
                    📌 付款后联系客服获取专属兑换码，输入下方激活
                </p>
            </div>

            {/* ─── 兑换码输入 ──────────────────────────────────── */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 mb-3">
                    <Icons.Key size={16} className="text-amber-500" />
                    输入兑换码激活
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={code}
                        onChange={e => setCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleRedeem()}
                        className="flex-1 bg-slate-50 border-2 border-slate-200 p-3 rounded-xl font-black text-slate-800 tracking-widest outline-none focus:border-orange-400 uppercase placeholder:text-slate-300 placeholder:font-bold placeholder:tracking-normal"
                        placeholder="A-XXXXX 或 Q-XXXXX"
                        maxLength={20}
                    />
                    <button
                        onClick={handleRedeem}
                        disabled={submitting || !code.trim()}
                        className="px-6 rounded-xl font-bold shadow-md transition-all shrink-0 disabled:opacity-50 text-white text-sm"
                        style={{ background: 'linear-gradient(135deg, #FF8C42, #FFB347)', boxShadow: '0 4px 12px rgba(255,140,66,0.3)' }}>
                        {submitting ? (
                            <span className="inline-flex items-center gap-1">
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".25"/>
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                                </svg>
                            </span>
                        ) : '激活'}
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-2">
                    年度码格式：A-XXXXXXX · 季度码格式：Q-XXXXXXX
                </p>
            </div>

            {/* ─── 购买渠道 QR ─────────────────────────────────── */}
            {(hasWechatQr || hasXhsQr) && (
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                        <Icons.ShoppingBag size={16} className="text-orange-500" />
                        购买渠道
                    </h3>
                    <div className={`grid ${hasWechatQr && hasXhsQr ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                        {hasWechatQr && (
                            <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    <span className="text-sm">💬</span>
                                    <span className="text-xs font-black text-emerald-700">微信客服</span>
                                </div>
                                <div className="bg-white rounded-lg p-1.5 mx-auto inline-block border border-emerald-100">
                                    <img src={qrSettings.wechat_qr} alt="微信客服" className="w-28 h-28 object-contain" />
                                </div>
                                <p className="text-[10px] text-emerald-600 font-bold mt-2">扫码咨询 · 付款获取激活码</p>
                            </div>
                        )}
                        {hasXhsQr && (
                            <div className="bg-rose-50 rounded-xl p-4 text-center border border-rose-100">
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    <span className="text-sm">📕</span>
                                    <span className="text-xs font-black text-rose-700">小红书购买</span>
                                </div>
                                <div className="bg-white rounded-lg p-1.5 mx-auto inline-block border border-rose-100">
                                    <img src={qrSettings.xiaohongshu_qr} alt="小红书购买" className="w-28 h-28 object-contain" />
                                </div>
                                <p className="text-[10px] text-rose-600 font-bold mt-2">关注账号 · 私信购买</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── 兑换历史 ────────────────────────────────────── */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
                    <Icons.Clock size={16} className="text-slate-400" />
                    兑换历史
                </h3>
                {usedCodes.length === 0 ? (
                    <div className="text-center py-6">
                        <div className="text-3xl mb-2">📋</div>
                        <div className="text-sm font-bold text-slate-400">暂无兑换记录</div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {usedCodes.map(c => {
                            const plan = c.plan_type || 'custom';
                            const planColor = plan === 'annual' ? '#FF8C42' : plan === 'quarterly' ? '#6366F1' : '#64748B';
                            return (
                                <div key={c.code} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 text-xs tracking-widest shrink-0">
                                            {c.code}
                                        </div>
                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0"
                                            style={{ color: planColor, background: `${planColor}18` }}>
                                            {PLAN_LABEL[plan] || '订阅'}
                                        </span>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        <span className="font-black text-emerald-600 block text-sm">+{c.duration_days}天</span>
                                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                            {new Date(c.used_at).toLocaleDateString('zh-CN')}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
