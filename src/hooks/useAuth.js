import { useState } from 'react';
import { apiFetch, API_BASE } from '../api/client';

export const useAuth = (notify, changeAppState) => {
    const [token, setToken] = useState(localStorage.getItem('minilife_token'));
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
    const [authForm, setAuthForm] = useState({ email: '', password: '' });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [activationCode, setActivationCode] = useState('');

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
        handleAuth, handleLogout
    };
};
