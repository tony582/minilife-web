import { useState, useRef, useEffect, useCallback } from 'react';
import { apiFetch, API_BASE } from '../api/client';

export const useAuth = (notify, changeAppState) => {
    const [token, setToken] = useState(localStorage.getItem('minilife_token'));
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
    const [authForm, setAuthForm] = useState({ email: '', password: '' });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [activationCode, setActivationCode] = useState('');

    // Forgot password states
    const [resetStep, setResetStep] = useState(0); // 0=hidden, 1=email, 2=code, 3=newPassword
    const [resetEmail, setResetEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [resetNewPassword, setResetNewPassword] = useState('');
    const [resetConfirmPassword, setResetConfirmPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const cooldownRef = useRef(null);

    // Cooldown timer
    useEffect(() => {
        if (cooldown > 0) {
            cooldownRef.current = setTimeout(() => setCooldown(c => c - 1), 1000);
            return () => clearTimeout(cooldownRef.current);
        }
    }, [cooldown]);

    const startForgotPassword = useCallback(() => {
        setResetStep(1);
        setResetEmail('');
        setResetCode('');
        setResetNewPassword('');
        setResetConfirmPassword('');
    }, []);

    const cancelForgotPassword = useCallback(() => {
        setResetStep(0);
    }, []);

    // Step 1: Send verification code
    const sendResetCodeHandler = useCallback(async () => {
        if (!resetEmail) return notify('请输入邮箱', 'error');
        setResetLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail })
            });
            const data = await res.json();
            if (!res.ok) return notify(data.error, 'error');
            notify('验证码已发送到邮箱，请查收 📧', 'success');
            setResetStep(2);
            setCooldown(60);
        } catch { notify('网络错误', 'error'); }
        finally { setResetLoading(false); }
    }, [resetEmail, notify]);

    // Step 2: Verify code
    const verifyResetCodeHandler = useCallback(async () => {
        if (!resetCode) return notify('请输入验证码', 'error');
        setResetLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/verify-reset-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail, code: resetCode })
            });
            const data = await res.json();
            if (!res.ok) return notify(data.error, 'error');
            setResetStep(3);
        } catch { notify('网络错误', 'error'); }
        finally { setResetLoading(false); }
    }, [resetEmail, resetCode, notify]);

    // Step 3: Set new password
    const resetPasswordHandler = useCallback(async () => {
        if (!resetNewPassword) return notify('请输入新密码', 'error');
        if (resetNewPassword.length < 6) return notify('密码至少6位', 'error');
        if (resetNewPassword !== resetConfirmPassword) return notify('两次密码不一致', 'error');
        setResetLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail, code: resetCode, newPassword: resetNewPassword })
            });
            const data = await res.json();
            if (!res.ok) return notify(data.error, 'error');
            notify('密码重置成功！请登录 🎉', 'success');
            setResetStep(0);
            setAuthMode('login');
            setAuthForm({ email: resetEmail, password: '' });
        } catch { notify('网络错误', 'error'); }
        finally { setResetLoading(false); }
    }, [resetEmail, resetCode, resetNewPassword, resetConfirmPassword, notify, setAuthMode, setAuthForm]);

    const handleAuth = async (e) => {
        e.preventDefault();

        if (authMode === 'register' && authForm.password !== confirmPassword) {
            return notify('两次输入的密码不一致，请重新确认', 'error');
        }

        try {
            const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authForm)
            });

            let data;
            try {
                data = await res.json();
            } catch (jsonErr) {
                return notify(`服务器错误 (${res.status}): ${res.statusText}`, 'error');
            }

            if (!res.ok) return notify(data.error || "登录失败", 'error');

            localStorage.setItem('minilife_token', data.token);
            setToken(data.token);
            setUser(data.user);
            notify(authMode === 'login' ? '欢迎回来' : '注册成功！赠送3天免费体验', 'success');
        } catch (err) {
            notify("网络连接失败，请检查服务是否运行", "error");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('minilife_token');
        localStorage.removeItem('minilife_activeKidId');
        setToken(null);
        setUser(null);
        if (changeAppState) changeAppState('profiles');
    };

    return {
        token, setToken,
        user, setUser,
        authLoading, setAuthLoading,
        authMode, setAuthMode,
        authForm, setAuthForm,
        confirmPassword, setConfirmPassword,
        activationCode, setActivationCode,
        handleAuth, handleLogout,
        // Forgot password
        resetStep, resetEmail, setResetEmail,
        resetCode, setResetCode,
        resetNewPassword, setResetNewPassword,
        resetConfirmPassword, setResetConfirmPassword,
        resetLoading, cooldown,
        startForgotPassword, cancelForgotPassword,
        sendResetCode: sendResetCodeHandler,
        verifyResetCode: verifyResetCodeHandler,
        resetPassword: resetPasswordHandler,
    };
};
