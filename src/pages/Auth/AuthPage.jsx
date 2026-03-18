import React from 'react';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useToast } from '../../hooks/useToast';
import { Icons } from '../../utils/Icons';

export const AuthPage = () => {
    const {
        authMode,
        setAuthMode,
        authForm,
        setAuthForm,
        confirmPassword,
        setConfirmPassword,
        handleAuth,
    } = useAuthContext();
    const { notifications } = useToast();

    const themeSettings = authMode === 'login'
        ? {
            title: '欢迎回航',
            subtitle: '继续记录这段关于爱与成长的奇妙旅程...',
            btnText: '登 录',
            btnClass: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-indigo-500/30'
        }
        : {
            title: '开启 MiniLife',
            subtitle: '为孩子搭建一座充满成就感与回忆的城堡',
            btnText: '注 册 并 试 用',
            btnClass: 'bg-gradient-to-r from-orange-400 to-rose-500 hover:from-orange-300 hover:to-rose-400 shadow-orange-500/30'
        };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
            {/* Lush Dribbble-style Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-orange-50 z-0"></div>

            {/* Floating animated blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300/30 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-300/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="w-full max-w-[420px] bg-white/70 backdrop-blur-3xl border border-white shadow-2xl rounded-[2.5rem] p-6 md:p-10 relative z-10 transition-all duration-500 ease-out">

                {/* Header with App Logo */}
                <div className="text-center mb-5">
                    <img src="/minilife_logo_transparent.png?v=2" alt="MiniLife" className="w-20 h-20 md:w-28 md:h-28 mx-auto mb-2 drop-shadow-xl animate-float" />
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{themeSettings.title}</h1>
                    <p className="text-slate-500 font-bold mt-2 text-xs md:text-sm leading-relaxed max-w-[280px] mx-auto">{themeSettings.subtitle}</p>
                </div>

                {/* Mode Switcher */}
                <div className="flex bg-slate-200/50 p-1 rounded-xl mb-5 shadow-inner backdrop-blur-sm">
                    <button
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className={`flex-1 py-2 text-[13px] md:text-sm rounded-lg font-black transition-all duration-300 ${authMode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >欢迎登录</button>
                    <button
                        type="button"
                        onClick={() => setAuthMode('register')}
                        className={`flex-1 py-2 text-[13px] md:text-sm rounded-lg font-black transition-all duration-300 ${authMode === 'register' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >注册账号</button>
                </div>

                <form onSubmit={handleAuth} className="space-y-3 md:space-y-5">
                    <div className="space-y-1">
                        <label className="pl-1 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">Email 账号</label>
                        <input required type="email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                            className="w-full bg-white/60 border-2 border-white focus:border-indigo-300 focus:bg-white rounded-xl md:rounded-2xl p-3 md:p-4 outline-none font-bold text-slate-800 transition-all shadow-inner placeholder:text-slate-300"
                            placeholder="name@example.com" />
                    </div>
                    <div className="space-y-1">
                        <label className="pl-1 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">安全密码</label>
                        <input required type="password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                            className="w-full bg-white/60 border-2 border-white focus:border-indigo-300 focus:bg-white rounded-xl md:rounded-2xl p-3 md:p-4 outline-none font-bold text-slate-800 transition-all shadow-inner placeholder:text-slate-300"
                            placeholder="••••••••" />
                    </div>

                    {/* Conditional Confirm Password */}
                    {authMode === 'register' && (
                        <div className="space-y-1 animate-slide-in">
                            <label className="pl-1 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">确认密码</label>
                            <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full bg-white/60 border-2 border-white focus:border-orange-300 focus:bg-white rounded-xl md:rounded-2xl p-3 md:p-4 outline-none font-bold text-slate-800 transition-all shadow-inner placeholder:text-slate-300"
                                placeholder="再次输入密码" />
                        </div>
                    )}

                    <div className="pt-2 md:pt-4">
                        <button type="submit" className={`w-full text-white font-black text-[15px] md:text-[17px] py-3.5 md:py-4 rounded-xl md:rounded-2xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 ${themeSettings.btnClass}`}>
                            {themeSettings.btnText}
                        </button>
                    </div>
                </form>
            </div>

            {/* Notifications overlay needed for auth page too */}
            <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-xl shadow-xl flex items-center gap-3 animate-slide-in pointer-events-auto backdrop-blur-md ${n.type === 'success' ? 'bg-emerald-50/90 text-emerald-700 border border-emerald-200' : 'bg-rose-50/90 text-rose-700 border border-rose-200'}`}>
                        {n.type === 'success' ? <Icons.CheckCircle size={24} /> : <Icons.AlertCircle size={24} />}
                        <span className="font-bold text-sm tracking-wide">{n.msg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
