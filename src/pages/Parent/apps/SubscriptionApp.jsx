import React, { useState } from 'react';
import { useAuthContext } from '../../../context/AuthContext.jsx';
import { useDataContext } from '../../../context/DataContext.jsx';
import { useUIContext } from '../../../context/UIContext.jsx';
import { useToast } from '../../../hooks/useToast';
import { apiFetch } from '../../../api/client';
import { Icons } from '../../../utils/Icons';

/**
 * SubscriptionApp - 订阅与激活
 * 查看账号信息、兑换激活码、查看兑换历史
 */
export const SubscriptionApp = () => {
    const { user, setUser } = useAuthContext();
    const { usedCodes, setUsedCodes } = useDataContext();
    const [settingsCode, setSettingsCode] = useState('');
    const { notify } = useToast();

    const handleRedeem = async () => {
        if (!settingsCode) return;
        try {
            const res = await apiFetch('/api/redeem-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: settingsCode }),
            });
            const ct = res.headers.get('content-type') || '';
            if (!ct.includes('application/json')) {
                return notify("服务器响应异常，请稍后重试", 'error');
            }
            const data = await res.json();
            if (!res.ok) return notify(data.error || "兑换失败", 'error');
            notify("兑换成功！", 'success');
            setUser(prev => ({ ...prev, sub_end_date: data.new_sub_end_date }));
            setSettingsCode('');
            apiFetch('/api/me/codes').then(r => r.json()).then(setUsedCodes).catch(console.error);
        } catch (err) {
            notify("网络错误", "error");
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Icons.Award size={22} className="text-rose-500" /> 我的订阅体验
            </h2>

            {/* 账号信息 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-sm font-bold text-slate-500 mb-1">当前账号</div>
                <div className="font-black text-slate-800 text-lg">{user?.email}</div>
                <div className="mt-4 text-sm font-bold text-slate-500 mb-1">服务有效期至</div>
                <div className={`font-black text-lg ${new Date(user?.sub_end_date) < new Date() ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {user?.sub_end_date ? new Date(user.sub_end_date).toLocaleDateString() : '永久有效'}
                </div>
            </div>

            {/* 兑换码输入 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <label className="block text-sm font-bold text-slate-700 mb-2">输入兑换码续费</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={settingsCode}
                        onChange={e => setSettingsCode(e.target.value.toUpperCase())}
                        className="flex-1 bg-slate-50 border-2 border-slate-200 p-3 rounded-xl font-black text-slate-800 tracking-wider outline-none focus:border-rose-500 uppercase placeholder:text-slate-300 placeholder:font-bold"
                        placeholder="ACT-XXXXXX"
                    />
                    <button onClick={handleRedeem} className="bg-rose-500 text-white px-6 rounded-xl font-bold shadow-md shadow-rose-200 hover:bg-rose-600 transition-colors shrink-0">
                        兑换卡密
                    </button>
                </div>
            </div>

            {/* 兑换历史 */}
            {usedCodes.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-2"><Icons.Clock size={16} /> 兑换历史记录</h3>
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
                </div>
            )}
        </div>
    );
};
