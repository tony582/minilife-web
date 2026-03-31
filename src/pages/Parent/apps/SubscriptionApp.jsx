import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../context/AuthContext.jsx';
import { useDataContext } from '../../../context/DataContext.jsx';
import { useToast } from '../../../hooks/useToast';
import { apiFetch, safeJsonOr } from '../../../api/client';
import { Icons } from '../../../utils/Icons';

/**
 * SubscriptionApp - 订阅与激活
 * 查看账号信息、兑换激活码、查看兑换历史、客服/购买二维码
 */
export const SubscriptionApp = () => {
    const { user, setUser } = useAuthContext();
    const { usedCodes, setUsedCodes } = useDataContext();
    const [settingsCode, setSettingsCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [qrSettings, setQrSettings] = useState({});
    const { notify } = useToast();

    // Load QR code settings
    useEffect(() => {
        apiFetch('/api/settings/public')
            .then(r => r.ok ? r.json() : {})
            .then(d => setQrSettings(d))
            .catch(() => {});
    }, []);

    const handleRedeem = async () => {
        if (!settingsCode || submitting) return;
        setSubmitting(true);
        try {
            const res = await apiFetch('/api/redeem-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: settingsCode }),
            });
            const ct = res.headers.get('content-type') || '';
            if (!ct.includes('application/json')) { notify('服务器响应异常，请稍后重试', 'error'); setSubmitting(false); return; }
            const data = await res.json();
            if (!res.ok) { notify(data.error || "兑换失败", 'error'); setSubmitting(false); return; }
            notify("🎉 兑换成功！", 'success');
            setUser(prev => ({ ...prev, sub_end_date: data.new_sub_end_date }));
            setSettingsCode('');
            apiFetch('/api/me/codes').then(r => safeJsonOr(r, [])).then(d => d && setUsedCodes(d)).catch(console.error);
        } catch (err) {
            notify("网络错误", "error");
        }
        setSubmitting(false);
    };

    const isExpired = user?.sub_end_date && new Date(user.sub_end_date) < new Date();
    const daysLeft = user?.sub_end_date
        ? Math.max(0, Math.ceil((new Date(user.sub_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null;
    const hasWechatQr = qrSettings.wechat_qr;
    const hasXhsQr = qrSettings.xiaohongshu_qr;

    return (
        <div className="space-y-5">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Icons.Award size={22} className="text-orange-500" /> 我的订阅体验
            </h2>

            {/* ─── 账号 & 订阅状态 ─── */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-400 mb-0.5">当前账号</div>
                        <div className="font-black text-slate-800">{user?.email}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-black ${isExpired ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'}`}>
                        {isExpired ? '已到期' : '使用中'}
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-400 mb-0.5">服务有效期至</div>
                        <div className={`font-black text-lg ${isExpired ? 'text-rose-500' : 'text-emerald-600'}`}>
                            {user?.sub_end_date ? new Date(user.sub_end_date).toLocaleDateString() : '永久有效'}
                        </div>
                    </div>
                    {!isExpired && daysLeft !== null && (
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-400 mb-0.5">剩余</div>
                            <div className={`font-black text-lg ${daysLeft <= 7 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                {daysLeft} 天
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── 兑换码输入 ─── */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 mb-3">
                    <Icons.Key size={16} className="text-amber-500" />
                    输入兑换码续费
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={settingsCode}
                        onChange={e => setSettingsCode(e.target.value.toUpperCase())}
                        className="flex-1 bg-slate-50 border-2 border-slate-200 p-3 rounded-xl font-black text-slate-800 tracking-wider outline-none focus:border-orange-400 uppercase placeholder:text-slate-300 placeholder:font-bold"
                        placeholder="ACT-XXXXXX"
                    />
                    <button
                        onClick={handleRedeem}
                        disabled={submitting}
                        className="px-6 rounded-xl font-bold shadow-md transition-all shrink-0 disabled:opacity-60 text-white"
                        style={{ background: 'linear-gradient(135deg, #FF8C42, #FFB347)', boxShadow: '0 4px 12px rgba(255,140,66,0.3)' }}
                    >
                        {submitting ? '...' : '兑换'}
                    </button>
                </div>
            </div>

            {/* ─── 客服与购买 ─── */}
            {(hasWechatQr || hasXhsQr) && (
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                        <Icons.ShoppingBag size={16} className="text-orange-500" />
                        获取兑换码
                    </h3>
                    <div className={`grid ${hasWechatQr && hasXhsQr ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                        {hasWechatQr && (
                            <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    <span className="text-sm">💬</span>
                                    <span className="text-xs font-black text-emerald-700">微信客服</span>
                                </div>
                                <div className="bg-white rounded-lg p-1.5 mx-auto inline-block">
                                    <img src={qrSettings.wechat_qr} alt="微信客服" className="w-32 h-32 object-contain" />
                                </div>
                                <p className="text-[10px] text-emerald-600 font-bold mt-2">扫码添加客服购买</p>
                            </div>
                        )}
                        {hasXhsQr && (
                            <div className="bg-rose-50 rounded-xl p-4 text-center border border-rose-100">
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    <span className="text-sm">📕</span>
                                    <span className="text-xs font-black text-rose-700">小红书购买</span>
                                </div>
                                <div className="bg-white rounded-lg p-1.5 mx-auto inline-block">
                                    <img src={qrSettings.xiaohongshu_qr} alt="小红书购买" className="w-32 h-32 object-contain" />
                                </div>
                                <p className="text-[10px] text-rose-600 font-bold mt-2">扫码在小红书购买</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── 兑换历史 ─── */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
                    <Icons.Clock size={16} className="text-slate-400" />
                    兑换历史记录
                </h3>
                {usedCodes.length === 0 ? (
                    <div className="text-center py-6">
                        <div className="text-3xl mb-2">📋</div>
                        <div className="text-sm font-bold text-slate-400">暂无兑换记录</div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {usedCodes.map(c => (
                            <div key={c.code} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 text-sm tracking-widest">{c.code}</div>
                                <div className="text-right">
                                    <span className="font-black text-emerald-600 block text-sm">+{c.duration_days} 天</span>
                                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{new Date(c.used_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
