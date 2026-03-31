import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useToast } from '../../hooks/useToast';
import { apiFetch } from '../../api/client';
import { Icons } from '../../utils/Icons';

export const ExpiredPage = () => {
    const { handleLogout, user } = useAuthContext();
    const { notify, notifications } = useToast();
    const [activationCode, setActivationCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [qrSettings, setQrSettings] = useState({});

    // Load QR code settings (public endpoint, no auth needed)
    useEffect(() => {
        apiFetch('/api/settings/public')
            .then(r => r.ok ? r.json() : {})
            .then(d => setQrSettings(d))
            .catch(() => {});
    }, []);

    const handleRedeem = async (e) => {
        e.preventDefault();
        if (!activationCode.trim() || submitting) return;
        setSubmitting(true);
        try {
            const res = await apiFetch('/api/redeem-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: activationCode }),
            });
            const ct = res.headers.get('content-type') || '';
            if (!ct.includes('application/json')) {
                notify('服务器响应异常，请稍后重试', 'error');
                setSubmitting(false);
                return;
            }
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || '激活失败');

            notify('🎉 激活成功，欢迎回来！', 'success');
            setActivationCode('');
            setTimeout(() => window.location.reload(), 1200);
        } catch (error) {
            notify(error.message, 'error');
            setSubmitting(false);
        }
    };

    const hasWechatQr = qrSettings.wechat_qr;
    const hasXhsQr = qrSettings.xiaohongshu_qr;

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{
            background: 'linear-gradient(160deg, #FFF8F0 0%, #FFF3E6 30%, #FFE8D6 70%, #FFDCC8 100%)',
        }}>
            <div className="w-full max-w-md space-y-5">
                {/* ─── Header ─── */}
                <div className="text-center pt-2">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #FF8C42, #FFB347)', boxShadow: '0 8px 24px rgba(255,140,66,0.3)' }}>
                        <span className="text-4xl">🌱</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 mb-1">免费试用已结束</h1>
                    <p className="text-sm font-bold text-slate-500">
                        感谢你体验 MiniLife！
                        <br />
                        续费后即可继续使用全部功能
                    </p>
                </div>

                {/* ─── 获取兑换码 ─── */}
                {(hasWechatQr || hasXhsQr) && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                                <Icons.ShoppingBag size={14} className="text-orange-600" />
                            </div>
                            <h2 className="text-sm font-black text-slate-800">获取兑换码</h2>
                        </div>
                        <div className={`grid ${hasWechatQr && hasXhsQr ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                            {hasWechatQr && (
                                <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                                    <div className="flex items-center justify-center gap-1 mb-2">
                                        <span className="text-base">💬</span>
                                        <span className="text-xs font-black text-emerald-700">微信客服</span>
                                    </div>
                                    <div className="bg-white rounded-lg p-1.5 mx-auto inline-block">
                                        <img
                                            src={qrSettings.wechat_qr}
                                            alt="微信客服二维码"
                                            className="w-28 h-28 object-contain"
                                        />
                                    </div>
                                    <p className="text-[10px] text-emerald-600 font-bold mt-2">扫码添加客服购买</p>
                                </div>
                            )}
                            {hasXhsQr && (
                                <div className="bg-rose-50 rounded-xl p-4 text-center border border-rose-100">
                                    <div className="flex items-center justify-center gap-1 mb-2">
                                        <span className="text-base">📕</span>
                                        <span className="text-xs font-black text-rose-700">小红书购买</span>
                                    </div>
                                    <div className="bg-white rounded-lg p-1.5 mx-auto inline-block">
                                        <img
                                            src={qrSettings.xiaohongshu_qr}
                                            alt="小红书二维码"
                                            className="w-28 h-28 object-contain"
                                        />
                                    </div>
                                    <p className="text-[10px] text-rose-600 font-bold mt-2">扫码在小红书购买</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── 兑换码输入 ─── */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Icons.Key size={14} className="text-amber-600" />
                        </div>
                        <h2 className="text-sm font-black text-slate-800">已有兑换码？</h2>
                    </div>
                    <form onSubmit={handleRedeem} className="space-y-3">
                        <input
                            required
                            type="text"
                            value={activationCode}
                            onChange={e => setActivationCode(e.target.value.toUpperCase())}
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3.5 text-center tracking-[0.2em] outline-none focus:border-orange-400 font-black text-slate-800 text-lg transition-colors uppercase"
                            placeholder="ACT-XXXXXX"
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full font-black text-base py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-60"
                            style={{
                                background: 'linear-gradient(135deg, #FF8C42, #FFB347)',
                                color: 'white',
                                boxShadow: '0 6px 20px rgba(255,140,66,0.35)',
                            }}
                        >
                            {submitting ? '验证中...' : '✨ 立即激活'}
                        </button>
                    </form>
                </div>

                {/* ─── 账号信息 ─── */}
                <div className="bg-white/60 rounded-2xl p-4 border border-orange-100/50">
                    <div className="flex items-center justify-between text-xs">
                        <div className="text-slate-500 font-bold">
                            <Icons.User size={12} className="inline mr-1" />
                            {user?.email}
                        </div>
                        <div className="text-rose-400 font-bold">
                            已于 {user?.sub_end_date ? new Date(user.sub_end_date).toLocaleDateString() : '–'} 到期
                        </div>
                    </div>
                </div>

                {/* ─── 退出登录 ─── */}
                <div className="text-center pb-4">
                    <button
                        onClick={handleLogout}
                        className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        退出登录
                    </button>
                </div>
            </div>

            {/* Toast Notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {notifications.map(n => (
                    <div key={n.id} className={`px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-in text-sm font-bold ${n.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {n.type === 'success' ? <Icons.CheckCircle size={20} /> : <Icons.AlertCircle size={20} />}
                        <span>{n.msg}</span>
                    </div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.9) translateY(-8px); } 60% { opacity: 1; transform: scale(1.02); } 100% { transform: scale(1) translateY(0); } }
                .animate-bounce-in { animation: bounceIn 0.35s ease-out forwards; }
            ` }} />
        </div>
    );
};
