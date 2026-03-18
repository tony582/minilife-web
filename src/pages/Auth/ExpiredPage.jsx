import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Icons } from '../../utils/Icons';

export const ExpiredPage = () => {
    const {
        activationCode,
        setActivationCode,
        handleRedeem,
        handleLogout,
        notifications
    } = useAppContext();

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 to-orange-500"></div>
                <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full mx-auto flex items-center justify-center mb-6">
                    <Icons.Lock size={40} />
                </div>
                <h1 className="text-3xl font-black text-slate-800 mb-2">服务已到期</h1>
                <p className="text-slate-500 font-bold mb-8">您的试用或订阅服务已到期，请购买兑换码以继续使用 MiniLife 的全部功能。</p>

                <form onSubmit={handleRedeem} className="space-y-4">
                    <input required type="text" value={activationCode} onChange={e => setActivationCode(e.target.value.toUpperCase())} className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-center tracking-widest outline-none focus:border-rose-500 font-black text-slate-800 text-xl transition-colors uppercase" placeholder="ACT-XXXXXX" />
                    <button type="submit" className="w-full bg-rose-600 text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 transition-colors">验证兑换码</button>
                </form>
                <div className="mt-8 text-sm font-bold text-slate-400">
                    <button onClick={handleLogout} className="hover:text-slate-600 underline">退出登录</button>
                </div>
            </div>
            {/* Notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {notifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-xl shadow-xl flex items-center gap-3 animate-slide-in ${n.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {n.type === 'success' ? <Icons.CheckCircle size={24} /> : <Icons.AlertCircle size={24} />}
                        <span className="font-bold">{n.msg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
