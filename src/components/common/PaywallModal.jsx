import React, { useState, useEffect } from 'react';
import { Icons } from '../../utils/Icons';
import { apiFetch } from '../../api/client';
import { useToast } from '../../hooks/useToast';

/**
 * PaywallModal - 续费弹窗
 * 当到期用户尝试执行写操作时弹出
 */
export const PaywallModal = ({ visible, onClose }) => {
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [qrSettings, setQrSettings] = useState({});
    const { notify } = useToast();

    useEffect(() => {
        if (visible) {
            apiFetch('/api/settings/public')
                .then(r => r.ok ? r.json() : {})
                .then(d => setQrSettings(d))
                .catch(() => {});
        }
    }, [visible]);

    const handleRedeem = async (e) => {
        e.preventDefault();
        if (!code.trim() || submitting) return;
        setSubmitting(true);
        try {
            const res = await apiFetch('/api/redeem-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });
            const ct = res.headers.get('content-type') || '';
            if (!ct.includes('application/json')) { notify('服务器响应异常', 'error'); setSubmitting(false); return; }
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || '激活失败');
            notify('🎉 激活成功！', 'success');
            setCode('');
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            notify(err.message, 'error');
            setSubmitting(false);
        }
    };

    if (!visible) return null;

    const hasWechatQr = qrSettings.wechat_qr;
    const hasXhsQr = qrSettings.xiaohongshu_qr;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Header gradient */}
                <div className="h-2" style={{ background: 'linear-gradient(135deg, #FF8C42, #FFB347)' }} />

                <div className="p-6 space-y-5">
                    {/* Title */}
                    <div className="text-center">
                        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #FF8C42, #FFB347)', boxShadow: '0 6px 16px rgba(255,140,66,0.3)' }}>
                            <span className="text-2xl">🌟</span>
                        </div>
                        <h2 className="text-lg font-black text-slate-800">续费后即可使用此功能</h2>
                        <p className="text-sm text-slate-500 font-bold mt-1">您的试用期已结束，续费解锁全部功能</p>
                    </div>

                    {/* QR Codes */}
                    {(hasWechatQr || hasXhsQr) && (
                        <div className={`grid ${hasWechatQr && hasXhsQr ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                            {hasWechatQr && (
                                <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                                    <div className="flex items-center justify-center gap-1 mb-1.5">
                                        <span className="text-sm">💬</span>
                                        <span className="text-[11px] font-black text-emerald-700">微信客服</span>
                                    </div>
                                    <div className="bg-white rounded-lg p-1 inline-block">
                                        <img src={qrSettings.wechat_qr} alt="微信客服" className="w-24 h-24 object-contain" />
                                    </div>
                                </div>
                            )}
                            {hasXhsQr && (
                                <div className="bg-rose-50 rounded-xl p-3 text-center border border-rose-100">
                                    <div className="flex items-center justify-center gap-1 mb-1.5">
                                        <span className="text-sm">📕</span>
                                        <span className="text-[11px] font-black text-rose-700">小红书购买</span>
                                    </div>
                                    <div className="bg-white rounded-lg p-1 inline-block">
                                        <img src={qrSettings.xiaohongshu_qr} alt="小红书" className="w-24 h-24 object-contain" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Activation Code */}
                    <form onSubmit={handleRedeem} className="space-y-2.5">
                        <div className="text-xs font-black text-slate-600 flex items-center gap-1">
                            <Icons.Key size={13} /> 已有兑换码？
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                                className="flex-1 bg-slate-50 border-2 border-slate-200 p-2.5 rounded-xl text-center tracking-widest outline-none focus:border-orange-400 font-black text-slate-800 uppercase text-sm"
                                placeholder="ACT-XXXXXX"
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-5 rounded-xl font-bold text-sm text-white shrink-0 disabled:opacity-60 transition-all"
                                style={{ background: 'linear-gradient(135deg, #FF8C42, #FFB347)' }}
                            >
                                {submitting ? '...' : '激活'}
                            </button>
                        </div>
                    </form>

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        稍后再说
                    </button>
                </div>
            </div>
        </div>
    );
};
