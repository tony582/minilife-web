import React from 'react';
import { useAuthContext } from '../../context/AuthContext.jsx';
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
        notifications,
        // Forgot password
        resetStep, resetEmail, setResetEmail,
        resetCode, setResetCode,
        resetNewPassword, setResetNewPassword,
        resetConfirmPassword, setResetConfirmPassword,
        resetLoading, cooldown,
        startForgotPassword, cancelForgotPassword,
        sendResetCode, verifyResetCode, resetPassword,
    } = useAuthContext();

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

    const inputClass = "w-full bg-white/60 border-2 border-white focus:border-indigo-300 focus:bg-white rounded-xl md:rounded-2xl p-3 md:p-4 outline-none font-bold text-slate-800 transition-all shadow-inner placeholder:text-slate-300";

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Lush Dribbble-style Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-orange-50 z-0"></div>

            {/* Floating animated blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300/30 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-300/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="w-full max-w-[420px] bg-white/70 backdrop-blur-3xl border border-white shadow-2xl rounded-[2.5rem] p-6 md:p-10 relative z-10 transition-all duration-500 ease-out">

                {/* ═══ Forgot Password Overlay ═══ */}
                {resetStep > 0 && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-xl rounded-[2.5rem] z-20 flex flex-col p-6 md:p-10 animate-slide-in">
                        <button onClick={cancelForgotPassword} className="self-start text-slate-400 hover:text-slate-600 transition-colors mb-4">
                            <Icons.ArrowLeft size={20} /> <span className="text-sm font-bold ml-1">返回登录</span>
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                {resetStep === 1 ? <Icons.Bell size={28} className="text-indigo-500" /> :
                                 resetStep === 2 ? <Icons.ShieldCheck size={28} className="text-indigo-500" /> :
                                 <Icons.Lock size={28} className="text-emerald-500" />}
                            </div>
                            <h2 className="text-xl font-black text-slate-800">
                                {resetStep === 1 ? '找回密码' : resetStep === 2 ? '输入验证码' : '设置新密码'}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                {resetStep === 1 ? '输入注册邮箱，我们会发送验证码' :
                                 resetStep === 2 ? `验证码已发送至 ${resetEmail}` :
                                 '请设置一个新的登录密码'}
                            </p>
                        </div>

                        <div className="space-y-4 flex-1">
                            {/* Step 1: Enter email */}
                            {resetStep === 1 && (
                                <>
                                    <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                                        className={inputClass} placeholder="name@example.com" autoFocus
                                        onKeyDown={e => e.key === 'Enter' && sendResetCode()} />
                                    <button onClick={sendResetCode} disabled={resetLoading}
                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black py-3.5 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100">
                                        {resetLoading ? '发送中...' : '发送验证码'}
                                    </button>
                                </>
                            )}

                            {/* Step 2: Enter code */}
                            {resetStep === 2 && (
                                <>
                                    <input type="text" inputMode="numeric" maxLength={6} value={resetCode}
                                        onChange={e => setResetCode(e.target.value.replace(/\D/g, ''))}
                                        className={`${inputClass} text-center text-2xl tracking-[0.5em]`}
                                        placeholder="000000" autoFocus
                                        onKeyDown={e => e.key === 'Enter' && verifyResetCode()} />
                                    <button onClick={verifyResetCode} disabled={resetLoading}
                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black py-3.5 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100">
                                        {resetLoading ? '验证中...' : '验证'}
                                    </button>
                                    <button onClick={sendResetCode} disabled={cooldown > 0 || resetLoading}
                                        className="w-full text-sm font-bold text-slate-400 hover:text-indigo-500 transition-colors disabled:opacity-40">
                                        {cooldown > 0 ? `${cooldown}秒后可重新发送` : '重新发送验证码'}
                                    </button>
                                </>
                            )}

                            {/* Step 3: New password */}
                            {resetStep === 3 && (
                                <>
                                    <input type="password" value={resetNewPassword}
                                        onChange={e => setResetNewPassword(e.target.value)}
                                        className={inputClass} placeholder="新密码（至少6位）" autoFocus
                                        onKeyDown={e => e.key === 'Enter' && document.getElementById('confirm-pw')?.focus()} />
                                    <input id="confirm-pw" type="password" value={resetConfirmPassword}
                                        onChange={e => setResetConfirmPassword(e.target.value)}
                                        className={inputClass} placeholder="确认新密码"
                                        onKeyDown={e => e.key === 'Enter' && resetPassword()} />
                                    <button onClick={resetPassword} disabled={resetLoading}
                                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black py-3.5 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100">
                                        {resetLoading ? '重置中...' : '重置密码'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

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
                            className={inputClass} placeholder="name@example.com" />
                    </div>
                    <div className="space-y-1">
                        <label className="pl-1 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">安全密码</label>
                        <input required type="password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                            className={inputClass} placeholder="••••••••" />
                    </div>

                    {/* Forgot password link - only show in login mode */}
                    {authMode === 'login' && (
                        <div className="text-right -mt-1">
                            <button type="button" onClick={startForgotPassword}
                                className="text-xs font-bold text-slate-400 hover:text-indigo-500 transition-colors">
                                忘记密码？
                            </button>
                        </div>
                    )}

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

            {/* Install Guide Link */}
            <div className="w-full max-w-[420px] text-center mt-4 relative z-10">
                <a href="/install-guide.html" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-indigo-500 transition-colors">
                    <span>📲</span> 安装 MiniLife 到桌面，体验更佳
                </a>
            </div>

            {/* Notifications overlay needed for auth page too */}
            <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-xl shadow-xl flex items-center gap-3 animate-slide-in pointer-events-auto backdrop-blur-md ${n.type === 'success' ? 'bg-emerald-50/90 text-emerald-700 border border-emerald-200' : 'bg-rose-50/90 text-rose-700 border border-rose-200'}`}>
                        {n.type === 'success' ? <Icons.CheckCircle size={24} /> : <Icons.AlertCircle size={24} />}
                        <span className="font-bold text-sm tracking-wide">{n.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
