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
        badge: '推荐 · 省35%',
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
        <div className="max-w-5xl mx-auto space-y-5 pb-10">

            {/* ─── Page title ─────────────────────────────────────── */}
            <div>
                <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Icons.Award size={22} className="text-orange-500" />
                    订阅与激活
                </h1>
                <p className="text-sm font-bold text-slate-400 mt-0.5">管理订阅方案，兑换激活码</p>
            </div>

            {/* ─── 账号状态卡 ─────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className={`px-4 py-4 ${isExpired ? 'bg-rose-50' : 'bg-gradient-to-r from-emerald-50 to-teal-50'}`}>
                    {/* Top row: icon + email + badge */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isExpired ? 'bg-rose-100' : 'bg-emerald-100'}`}>
                            <Icons.ShieldCheck size={20} className={isExpired ? 'text-rose-500' : 'text-emerald-500'} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-slate-400">当前账号</div>
                            <div className="font-black text-slate-800 text-sm truncate">{user?.email}</div>
                        </div>
                        {/* Status badge */}
                        <div className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1 shrink-0 ${isExpired ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                            {isExpired
                                ? <><Icons.AlertTriangle size={12} /> 已到期</>
                                : <><Icons.CheckCircle size={12} /> 有效</>}
                        </div>
                    </div>
                    {/* Bottom row: date + days */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="text-[11px] font-bold text-slate-400 mb-0.5">服务有效期至</div>
                            <div className={`font-black text-base ${isExpired ? 'text-rose-500' : 'text-emerald-600'}`}>
                                {user?.sub_end_date ? new Date(user.sub_end_date).toLocaleDateString('zh-CN') : '永久有效'}
                            </div>
                        </div>
                        {!isExpired && daysLeft !== null && (
                            <div className="text-right">
                                <div className="text-[11px] font-bold text-slate-400 mb-0.5">剩余</div>
                                <div className={`font-black text-2xl leading-none ${daysLeft <= 7 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                    {daysLeft}<span className="text-sm font-bold ml-0.5">天</span>
                                </div>
                            </div>
                        )}
                        {isExpired && (
                            <div className="text-right">
                                <div className="text-[11px] font-bold text-rose-400 mb-0.5">试用已结束</div>
                                <div className="text-xs font-bold text-rose-400">续费后恢复全部功能</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── 激活码输入（到期时置顶突出显示）────────────────── */}
            {/* ─── 主体布局 ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">

                {/* 左列：方案 + 激活码 */}
                <div className="space-y-4">

                    {/* 价格方案 */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">订阅方案</div>
                        <div className="grid grid-cols-2 gap-3">
                            {PLANS.map(plan => (
                                <div key={plan.id}
                                    className="rounded-2xl border-2 p-4 relative overflow-hidden"
                                    style={{
                                        borderColor: plan.highlight ? plan.color : '#E2E8F0',
                                        background: plan.highlight ? plan.bg : '#FAFAFA',
                                    }}>
                                    {/* Badge */}
                                    <div className="text-[10px] font-black px-1.5 py-0.5 rounded-lg inline-block mb-2"
                                        style={{
                                            color: plan.highlight ? '#FFF' : plan.color,
                                            background: plan.highlight ? plan.color : `${plan.color}20`,
                                        }}>
                                        {plan.badge}
                                    </div>
                                    <div className="text-xs font-black mb-2" style={{ color: plan.color }}>{plan.label}</div>
                                    <div className="flex items-baseline gap-0.5 mb-0.5">
                                        <span className="text-2xl font-black" style={{ color: '#1E293B' }}>{plan.price}</span>
                                        <span className="text-xs font-bold text-slate-400">{plan.period}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 mb-3">{plan.perMonth}</div>
                                    <ul className="space-y-1">
                                        {plan.features.slice(0, 3).map(f => (
                                            <li key={f} className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: '#475569' }}>
                                                <Icons.CheckCircle size={11} style={{ color: plan.color, flexShrink: 0 }} />
                                                {f}
                                            </li>
                                        ))}
                                        {plan.features.length > 3 && (
                                            <li className="text-[11px] font-bold text-slate-400">+{plan.features.length - 3} 项更多</li>
                                        )}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <p className="text-[11px] text-slate-400 font-bold text-center mt-3 bg-slate-50 rounded-xl px-3 py-2">
                            <Icons.Info size={11} className="inline mr-1 mb-0.5" />
                            付款后联系客服获取专属兑换码，在上方输入激活
                        </p>
                    </div>

                    {/* 激活码输入 */}
                    <div className={`bg-white p-4 rounded-2xl border-2 shadow-sm ${isExpired ? 'border-amber-200' : 'border-slate-100'}`}>
                            <label className="flex items-center gap-2 text-sm font-black text-slate-700 mb-3">
                                <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Icons.Key size={14} className="text-amber-500" />
                                </div>
                                输入兑换码激活
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                    onKeyDown={e => e.key === 'Enter' && handleRedeem()}
                                    className="flex-1 min-w-0 bg-slate-50 border-2 border-slate-200 px-3 py-3 rounded-xl font-black text-slate-800 tracking-widest outline-none focus:border-orange-400 uppercase placeholder:text-slate-300 placeholder:font-bold placeholder:tracking-normal text-sm"
                                    placeholder="A-XXXXX"
                                    maxLength={20}
                                />
                                <button
                                    onClick={handleRedeem}
                                    disabled={submitting || !code.trim()}
                                    className="px-4 rounded-xl font-black shadow-md transition-all shrink-0 disabled:opacity-50 text-white text-sm active:scale-[0.96]"
                                    style={{ background: 'linear-gradient(135deg, #FF8C42, #FFB347)' }}>
                                    {submitting ? (
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".25"/>
                                            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                                        </svg>
                                    ) : '激活'}
                                </button>
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold mt-2">
                                年度码：A-XXXXXXX &nbsp;·&nbsp; 季度码：Q-XXXXXXX
                            </p>
                    </div>

                    {/* 兑换历史 */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-1.5">
                            <Icons.Clock size={16} className="text-slate-400" />
                            兑换历史
                        </h3>
                        {usedCodes.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                                    <Icons.FileText size={20} className="text-slate-300" />
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
                                        <div key={c.code} className="flex items-center gap-2 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-mono font-black text-slate-700 text-xs tracking-wider truncate">{c.code}</span>
                                                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0"
                                                        style={{ color: planColor, background: `${planColor}15` }}>
                                                        {PLAN_LABEL[plan] || '订阅'}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-bold">
                                                    {new Date(c.used_at).toLocaleDateString('zh-CN')}
                                                </div>
                                            </div>
                                            <span className="font-black text-emerald-600 text-sm shrink-0">+{c.duration_days}天</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* 右列：购买渠道 */}
                <div className="space-y-4">
                    {(hasWechatQr || hasXhsQr) && (
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-1.5">
                                <Icons.ShoppingBag size={16} className="text-orange-500" />
                                购买渠道
                            </h3>
                            <div className={`grid ${hasWechatQr && hasXhsQr ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                                {hasWechatQr && (
                                    <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                                        <div className="flex items-center justify-center gap-1 mb-2">
                                            <div className="w-5 h-5 bg-emerald-500 rounded-md flex items-center justify-center">
                                                <Icons.MessageCircle size={11} className="text-white" />
                                            </div>
                                            <span className="text-xs font-black text-emerald-700">微信客服</span>
                                        </div>
                                        <div className="bg-white rounded-xl p-2 inline-block border border-emerald-100">
                                            <img src={qrSettings.wechat_qr} alt="微信客服" className="w-28 h-28 object-contain" />
                                        </div>
                                        <p className="text-[11px] text-emerald-600 font-bold mt-2">扫码咨询 · 付款获取激活码</p>
                                    </div>
                                )}
                                {hasXhsQr && (
                                    <div className="bg-rose-50 rounded-xl p-3 text-center border border-rose-100">
                                        <div className="flex items-center justify-center gap-1 mb-2">
                                            <div className="w-5 h-5 bg-rose-500 rounded-md flex items-center justify-center">
                                                <Icons.BookOpen size={11} className="text-white" />
                                            </div>
                                            <span className="text-xs font-black text-rose-700">小红书购买</span>
                                        </div>
                                        <div className="bg-white rounded-xl p-2 inline-block border border-rose-100">
                                            <img src={qrSettings.xiaohongshu_qr} alt="小红书购买" className="w-28 h-28 object-contain" />
                                        </div>
                                        <p className="text-[11px] text-rose-600 font-bold mt-2">关注账号 · 私信购买</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 购买流程 */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-2.5">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">购买流程</div>
                        {[
                            { icon: <Icons.Camera size={14} />, text: '扫描二维码联系客服' },
                            { icon: <Icons.Wallet size={14} />, text: '选择方案完成付款' },
                            { icon: <Icons.Key size={14} />, text: '收到专属激活码' },
                            { icon: <Icons.CheckCircle size={14} />, text: '输入激活码完成续费' },
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 shadow-sm">
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
