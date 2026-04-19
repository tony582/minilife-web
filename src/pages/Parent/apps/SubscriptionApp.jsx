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
        features: ['全部功能解锁', '最多 5 位孩子', '无限任务计划', '习惯打卡系统'],
    },
    {
        id: 'annual',
        label: '年度订阅',
        price: '¥98',
        period: '/ 年',
        days: 365,
        badge: '推荐 · 省 35%',
        color: '#FF8C42',
        bg: '#FFF7ED',
        highlight: true,
        perMonth: '¥8.2/月',
        features: ['全部功能解锁', '最多 5 位孩子', '无限任务计划', '习惯打卡系统', '虚拟宠物系统', '优先客服支持'],
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
            notify(`${data.plan_label || '订阅'}已激活！有效期 +${data.duration_days} 天`, 'success');
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
        <div className="max-w-5xl mx-auto space-y-6 pb-10">

            {/* ─── Page title ─────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Icons.Award size={26} className="text-orange-500" />
                        订阅与激活
                    </h1>
                    <p className="text-sm font-bold text-slate-400 mt-0.5">管理你的订阅方案，兑换激活码</p>
                </div>
            </div>

            {/* ─── 账号状态卡（宽屏）─────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className={`px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isExpired ? 'bg-rose-50' : 'bg-gradient-to-r from-emerald-50 to-teal-50'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isExpired ? 'bg-rose-100' : 'bg-emerald-100'}`}>
                            <Icons.ShieldCheck size={22} className={isExpired ? 'text-rose-500' : 'text-emerald-500'} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 mb-0.5">当前账号</div>
                            <div className="font-black text-slate-800">{user?.email}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 sm:gap-10">
                        <div>
                            <div className="text-xs font-bold text-slate-400 mb-0.5">服务有效期至</div>
                            <div className={`font-black text-lg ${isExpired ? 'text-rose-500' : 'text-emerald-600'}`}>
                                {user?.sub_end_date ? new Date(user.sub_end_date).toLocaleDateString('zh-CN') : '永久有效'}
                            </div>
                        </div>
                        {!isExpired && daysLeft !== null && (
                            <div>
                                <div className="text-xs font-bold text-slate-400 mb-0.5">剩余天数</div>
                                <div className={`font-black text-3xl ${daysLeft <= 7 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                    {daysLeft} <span className="text-base font-bold">天</span>
                                </div>
                            </div>
                        )}
                        <div className={`px-4 py-2 rounded-full text-sm font-black shadow-sm flex items-center gap-1.5
                            ${isExpired ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                            {isExpired
                                ? <><Icons.AlertTriangle size={13} /> 已到期</>
                                : <><Icons.CheckCircle size={13} /> 正常使用</>}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── 主体双列布局 ──────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

                {/* 左列：方案 + 激活码 */}
                <div className="space-y-5">

                    {/* 价格方案 */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">订阅方案</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {PLANS.map(plan => (
                                <div key={plan.id}
                                    className="rounded-2xl border-2 p-5 relative overflow-hidden transition-all hover:shadow-md"
                                    style={{
                                        borderColor: plan.highlight ? plan.color : '#E2E8F0',
                                        background: plan.highlight ? plan.bg : '#FAFAFA',
                                    }}>
                                    {/* Badge */}
                                    <div className="absolute top-0 right-0 text-[10px] font-black px-2.5 py-1 rounded-bl-xl"
                                        style={{
                                            color: plan.highlight ? '#FFF' : plan.color,
                                            background: plan.highlight ? plan.color : plan.bg,
                                        }}>
                                        {plan.badge}
                                    </div>
                                    <div className="text-sm font-black mb-3 mt-1" style={{ color: plan.color }}>{plan.label}</div>
                                    <div className="flex items-end gap-1 mb-1">
                                        <span className="text-4xl font-black" style={{ color: '#1E293B' }}>{plan.price}</span>
                                        <span className="text-sm font-bold text-slate-400 mb-1.5">{plan.period}</span>
                                    </div>
                                    <div className="text-xs font-bold text-slate-400 mb-4">{plan.perMonth} · {plan.days}天</div>
                                    <ul className="space-y-1.5">
                                        {plan.features.map(f => (
                                            <li key={f} className="flex items-center gap-2 text-xs font-bold" style={{ color: '#475569' }}>
                                                <Icons.CheckCircle size={13} style={{ color: plan.color, flexShrink: 0 }} />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <p className="text-[11px] text-slate-400 font-bold text-center mt-4 bg-slate-50 rounded-xl px-4 py-2">
                            <Icons.Info size={12} className="inline mr-1 mb-0.5" />
                            付款后联系客服获取专属兑换码，在下方输入激活
                        </p>
                    </div>

                    {/* 兑换码输入 */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <label className="flex items-center gap-2 text-base font-black text-slate-700 mb-4">
                            <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Icons.Key size={16} className="text-amber-500" />
                            </div>
                            输入兑换码激活
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                                onKeyDown={e => e.key === 'Enter' && handleRedeem()}
                                className="flex-1 bg-slate-50 border-2 border-slate-200 px-4 py-3.5 rounded-2xl font-black text-slate-800 tracking-widest outline-none focus:border-orange-400 uppercase placeholder:text-slate-300 placeholder:font-bold placeholder:tracking-normal text-sm"
                                placeholder="A-XXXXX 或 Q-XXXXX"
                                maxLength={20}
                            />
                            <button
                                onClick={handleRedeem}
                                disabled={submitting || !code.trim()}
                                className="px-8 rounded-2xl font-black shadow-md transition-all shrink-0 disabled:opacity-50 text-white text-sm hover:scale-[1.02] active:scale-[0.98]"
                                style={{ background: 'linear-gradient(135deg, #FF8C42, #FFB347)', boxShadow: '0 4px 16px rgba(255,140,66,0.35)' }}>
                                {submitting ? (
                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".25"/>
                                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                                    </svg>
                                ) : '激活'}
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 font-bold mt-3">
                            年度码格式：A-XXXXXXX &nbsp;·&nbsp; 季度码格式：Q-XXXXXXX
                        </p>
                    </div>

                    {/* 兑换历史 */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="text-base font-black text-slate-700 mb-4 flex items-center gap-2">
                            <Icons.Clock size={18} className="text-slate-400" />
                            兑换历史
                        </h3>
                        {usedCodes.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <Icons.FileText size={24} className="text-slate-300" />
                                </div>
                                <div className="text-sm font-black">暂无兑换记录</div>
                                <div className="text-xs font-bold mt-1">激活首个兑换码后将在此显示</div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {usedCodes.map(c => {
                                    const plan = c.plan_type || 'custom';
                                    const planColor = plan === 'annual' ? '#FF8C42' : plan === 'quarterly' ? '#6366F1' : '#64748B';
                                    return (
                                        <div key={c.code} className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="font-mono font-black text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs tracking-widest shrink-0 shadow-sm">
                                                    {c.code}
                                                </div>
                                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
                                                    style={{ color: planColor, background: `${planColor}15` }}>
                                                    {PLAN_LABEL[plan] || '订阅'}
                                                </span>
                                            </div>
                                            <div className="text-right shrink-0 ml-3">
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

                {/* 右列：购买渠道 */}
                <div className="space-y-5">
                    {(hasWechatQr || hasXhsQr) && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-base font-black text-slate-700 mb-4 flex items-center gap-2">
                                <Icons.ShoppingBag size={18} className="text-orange-500" />
                                购买渠道
                            </h3>
                            <div className="space-y-4">
                                {hasWechatQr && (
                                    <div className="bg-emerald-50 rounded-2xl p-5 text-center border border-emerald-100">
                                        <div className="flex items-center justify-center gap-1.5 mb-3">
                                            <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
                                                <Icons.MessageCircle size={13} className="text-white" />
                                            </div>
                                            <span className="text-sm font-black text-emerald-700">微信客服</span>
                                        </div>
                                        <div className="bg-white rounded-2xl p-3 mx-auto inline-block border border-emerald-100 shadow-sm">
                                            <img src={qrSettings.wechat_qr} alt="微信客服" className="w-36 h-36 object-contain" />
                                        </div>
                                        <p className="text-xs text-emerald-600 font-bold mt-3">扫码咨询 · 付款获取激活码</p>
                                    </div>
                                )}
                                {hasXhsQr && (
                                    <div className="bg-rose-50 rounded-2xl p-5 text-center border border-rose-100">
                                        <div className="flex items-center justify-center gap-1.5 mb-3">
                                            <div className="w-6 h-6 bg-rose-500 rounded-lg flex items-center justify-center">
                                                <Icons.BookOpen size={13} className="text-white" />
                                            </div>
                                            <span className="text-sm font-black text-rose-700">小红书购买</span>
                                        </div>
                                        <div className="bg-white rounded-2xl p-3 mx-auto inline-block border border-rose-100 shadow-sm">
                                            <img src={qrSettings.xiaohongshu_qr} alt="小红书购买" className="w-36 h-36 object-contain" />
                                        </div>
                                        <p className="text-xs text-rose-600 font-bold mt-3">关注账号 · 私信购买</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 说明卡片 */}
                    <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 space-y-3">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">购买流程</div>
                        {[
                            { icon: <Icons.Camera size={15} />, text: '扫描右方二维码联系客服' },
                            { icon: <Icons.Wallet size={15} />, text: '选择方案完成付款' },
                            { icon: <Icons.Key size={15} />, text: '收到专属激活码' },
                            { icon: <Icons.CheckCircle size={15} />, text: '在左方表单输入激活' },
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-500 shadow-sm">
                                    {step.icon}
                                </div>
                                <span className="text-xs font-bold text-slate-600">{step.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
