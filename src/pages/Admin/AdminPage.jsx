import React, { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useDataContext } from '../../context/DataContext.jsx';
import { useToast } from '../../hooks/useToast';
import { Icons } from '../../utils/Icons';
import { apiFetch, safeJson, safeJsonOr } from '../../api/client';

const PROVIDERS = [
    { id: 'gemini', name: 'Google Gemini', color: '#4285F4', icon: '✨', models: ['gemini-2.0-flash', 'gemini-2.0-pro', 'gemini-1.5-flash'] },
    { id: 'deepseek', name: 'DeepSeek', color: '#5B6EF5', icon: '🔮', models: ['deepseek-chat', 'deepseek-reasoner'] },
    { id: 'qwen', name: '通义千问', color: '#FF6A00', icon: '🤖', models: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-vl-plus', 'qwen-vl-max'] },
    { id: 'custom', name: '自定义 (OpenAI兼容)', color: '#10B981', icon: '⚙️', models: [] },
];

// ═══════════════════════════════════════════════════
// KPI CARD COMPONENT
// ═══════════════════════════════════════════════════
const KpiCard = ({ icon, label, value, sub, color = 'indigo' }) => {
    const colors = {
        indigo: 'from-indigo-500 to-indigo-600',
        emerald: 'from-emerald-500 to-emerald-600',
        amber: 'from-amber-500 to-amber-600',
        rose: 'from-rose-500 to-rose-600',
        purple: 'from-purple-500 to-purple-600',
        sky: 'from-sky-500 to-sky-600',
    };
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white text-xl shadow-sm`}>{icon}</div>
            <div>
                <div className="text-2xl font-black text-slate-800">{value ?? '...'}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</div>
                {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════
// MINI BAR CHART (pure CSS)
// ═══════════════════════════════════════════════════
const MiniBarChart = ({ data, label, color = '#6366F1' }) => {
    if (!data || data.length === 0) return <div className="text-sm text-slate-400 py-8 text-center">暂无数据</div>;
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{label}</div>
            <div className="flex items-end gap-1 h-32">
                {data.slice(-14).map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="text-[10px] font-bold text-slate-400">{d.count || ''}</div>
                        <div
                            className="w-full rounded-t-md transition-all"
                            style={{ height: `${Math.max((d.count / max) * 100, 4)}%`, backgroundColor: color, opacity: 0.8 }}
                        />
                        <div className="text-[9px] text-slate-400 truncate w-full text-center">{d.date?.slice(5)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const AdminPage = () => {
    const { user, handleLogout } = useAuthContext();
    const { adminUsers, setAdminUsers, adminCodes, setAdminCodes, adminTab, setAdminTab, adminAiConfig, setAdminAiConfig, adminAiUsage, setAdminAiUsage } = useDataContext();
    const { notifications, notify } = useToast();

    // Dashboard state
    const [stats, setStats] = useState(null);
    const [growth, setGrowth] = useState(null);
    const [expiring, setExpiring] = useState([]);

    // User management state
    const [userSearch, setUserSearch] = useState('');
    const [userFilter, setUserFilter] = useState('all'); // all, active, expired, banned
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [showSubModal, setShowSubModal] = useState(null);
    const [subDate, setSubDate] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [tempPassword, setTempPassword] = useState(null);

    // Code management state
    const [customDays, setCustomDays] = useState('');
    const [codeSearch, setCodeSearch] = useState('');

    // AI state
    const [editingConfig, setEditingConfig] = useState(null);
    const [showApiKey, setShowApiKey] = useState(false);
    const [editingQuotaUserId, setEditingQuotaUserId] = useState(null);
    const [editingQuotaValue, setEditingQuotaValue] = useState('');

    // ═══ LOAD DASHBOARD DATA ═══
    const loadDashboard = useCallback(() => {
        apiFetch('/api/admin/stats/overview').then(r => safeJsonOr(r, null)).then(d => d && setStats(d)).catch(console.error);
        apiFetch('/api/admin/stats/growth?days=30').then(r => safeJsonOr(r, null)).then(d => d && setGrowth(d)).catch(console.error);
        apiFetch('/api/admin/stats/expiring').then(r => safeJsonOr(r, [])).then(d => d && setExpiring(d)).catch(console.error);
    }, []);

    useEffect(() => {
        if (adminTab === 'dashboard') loadDashboard();
    }, [adminTab, loadDashboard]);

    // ═══ USER ACTIONS ═══
    const refreshUsers = () => {
        apiFetch('/api/admin/users').then(r => safeJsonOr(r, [])).then(d => d && setAdminUsers(d)).catch(console.error);
    };

    const toggleBan = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
        try {
            const res = await apiFetch(`/api/admin/users/${userId}/status`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await safeJson(res);
            if (data.error) return notify(data.error, 'error');
            notify(newStatus === 'banned' ? '用户已禁用' : '用户已启用', 'success');
            refreshUsers();
        } catch { notify('操作失败', 'error'); }
    };

    const adjustSubscription = async (userId) => {
        if (!subDate) return;
        try {
            await apiFetch(`/api/admin/users/${userId}/subscription`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sub_end_date: new Date(subDate).toISOString() })
            });
            notify('订阅时间已更新', 'success');
            setShowSubModal(null);
            refreshUsers();
        } catch { notify('操作失败', 'error'); }
    };

    const resetPassword = async (userId) => {
        try {
            const res = await apiFetch(`/api/admin/users/${userId}/reset-password`, { method: 'POST' });
            const data = await safeJson(res);
            if (data.error) return notify(data.error, 'error');
            setTempPassword(data.tempPassword);
            notify('密码已重置', 'success');
        } catch { notify('操作失败', 'error'); }
    };

    const deleteUser = async (userId) => {
        try {
            const res = await apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
            const data = await safeJson(res);
            if (data.error) return notify(data.error, 'error');
            notify('用户已删除', 'success');
            setShowDeleteConfirm(null);
            setSelectedUser(null);
            refreshUsers();
        } catch { notify('操作失败', 'error'); }
    };

    const loadUserDetails = async (userId) => {
        setSelectedUser(userId);
        const data = await apiFetch(`/api/admin/users/${userId}/details`).then(r => safeJsonOr(r, null));
        setUserDetails(data);
    };

    // ═══ CODE ACTIONS ═══
    const generateCodes = async (days) => {
        try {
            const res = await apiFetch(`/api/admin/codes`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 5, duration_days: days })
            });
            const data = await safeJson(res);
            if (data.error) { notify(data.error, 'error'); return; }
            setAdminCodes(prev => [...(data.codes || []).map(c => ({ code: c, duration_days: days, status: 'active', created_at: new Date().toISOString() })), ...prev]);
            notify(`成功生成5个${days}天激活码！`, 'success');
        } catch { notify('生成失败', 'error'); }
    };

    const revokeCode = async (code) => {
        try {
            const res = await apiFetch(`/api/admin/codes/${code}/revoke`, { method: 'PUT' });
            const data = await safeJson(res);
            if (data.error) return notify(data.error, 'error');
            setAdminCodes(prev => prev.map(c => c.code === code ? { ...c, status: 'revoked' } : c));
            notify('激活码已作废', 'success');
        } catch { notify('操作失败', 'error'); }
    };

    const deleteCode = async (code) => {
        try {
            const res = await apiFetch(`/api/admin/codes/${code}`, { method: 'DELETE' });
            const data = await safeJson(res);
            if (data.error) return notify(data.error, 'error');
            setAdminCodes(prev => prev.filter(c => c.code !== code));
            notify('激活码已删除', 'success');
        } catch { notify('操作失败', 'error'); }
    };

    const exportCodes = () => {
        const activeCodes = adminCodes.filter(c => c.status === 'active');
        if (activeCodes.length === 0) return notify('没有可导出的未使用激活码', 'error');
        const csv = 'Code,Duration(Days),Created\n' + activeCodes.map(c => `${c.code},${c.duration_days},${c.created_at || ''}`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `minilife_codes_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
        notify(`已导出 ${activeCodes.length} 个激活码`, 'success');
    };

    // ═══ AI CONFIG ═══
    const saveAiConfig = async () => {
        if (!editingConfig) return;
        try {
            const res = await apiFetch('/api/admin/ai-config', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingConfig)
            });
            if (!res.ok) throw new Error();
            setAdminAiConfig(editingConfig);
            setEditingConfig(null);
            notify('AI 配置已保存', 'success');
            apiFetch('/api/admin/ai-usage').then(r => safeJsonOr(r, [])).then(d => d && setAdminAiUsage(d)).catch(() => {});
        } catch { notify('保存失败', 'error'); }
    };

    const updateUserQuota = async (userId, quota) => {
        try {
            await apiFetch(`/api/admin/users/${userId}/ai-quota`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quota: quota === '' || quota === null ? null : parseInt(quota) })
            });
            setAdminAiUsage(prev => prev.map(u => u.id === userId ? {
                ...u, ai_quota: quota === '' || quota === null ? null : parseInt(quota),
                quota: quota === '' || quota === null ? (adminAiConfig?.default_quota || 50) : parseInt(quota),
                remaining: (quota === '' || quota === null ? (adminAiConfig?.default_quota || 50) : parseInt(quota)) - u.used_this_month
            } : u));
            setEditingQuotaUserId(null);
            notify('配额已更新', 'success');
        } catch { notify('更新失败', 'error'); }
    };

    const currentConfig = editingConfig || adminAiConfig || {};
    const currentProvider = PROVIDERS.find(p => p.id === currentConfig.provider) || PROVIDERS[0];

    // ═══ FILTERED USERS ═══
    const now = new Date();
    const filteredUsers = (adminUsers || []).filter(u => {
        if (u.role === 'admin') return true;
        if (userSearch && !u.email.toLowerCase().includes(userSearch.toLowerCase()) && !u.id.includes(userSearch)) return false;
        if (userFilter === 'active') return new Date(u.sub_end_date) > now && u.status !== 'banned';
        if (userFilter === 'expired') return new Date(u.sub_end_date) <= now;
        if (userFilter === 'banned') return u.status === 'banned';
        return true;
    });

    // ═══ FILTERED CODES ═══
    const filteredCodes = (adminCodes || []).filter(c => {
        if (codeSearch && !c.code.toLowerCase().includes(codeSearch.toLowerCase())) return false;
        return true;
    });

    const TABS = [
        { id: 'dashboard', icon: '📊', label: '数据看板' },
        { id: 'users', icon: '👥', label: `用户管理 (${adminUsers?.length || 0})` },
        { id: 'codes', icon: '🏷️', label: `激活码 (${adminCodes?.length || 0})` },
        { id: 'ai', icon: '🤖', label: 'AI 管理' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
            {/* Admin Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center shadow-lg z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
                        <Icons.Lock size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">MiniLife · SaaS Admin平台</h1>
                        <div className="text-xs text-indigo-200 font-bold">{user.email} (超级管理员)</div>
                    </div>
                </div>
                <button onClick={handleLogout} className="bg-slate-800 text-slate-300 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 shadow-sm flex items-center gap-2">
                    退出登录
                </button>
            </div>

            {/* Admin Tabs */}
            <div className="bg-white border-b border-slate-200 px-8 flex gap-6 overflow-x-auto">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setAdminTab(t.id)}
                        className={`py-4 font-black border-b-2 whitespace-nowrap transition-colors ${adminTab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Admin Content */}
            <div className="p-8 flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* ═══════════════════════════════════════ */}
                    {/* ═══ DASHBOARD TAB ═══ */}
                    {/* ═══════════════════════════════════════ */}
                    {adminTab === 'dashboard' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* KPI Row */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <KpiCard icon="👥" label="总用户" value={stats?.totalUsers} color="indigo" />
                                <KpiCard icon="✅" label="活跃订阅" value={stats?.activeSubscriptions} color="emerald" />
                                <KpiCard icon="📈" label="本月新增" value={stats?.newThisMonth} color="sky" />
                                <KpiCard icon="🔑" label="今日登录" value={stats?.todayLogins} color="purple" />
                                <KpiCard icon="🤖" label="本月AI调用" value={stats?.aiCallsThisMonth} color="amber" />
                            </div>

                            {/* Secondary KPIs */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <KpiCard icon="⏰" label="已过期" value={stats?.expiredUsers} color="rose" />
                                <KpiCard icon="🚫" label="已禁用" value={stats?.bannedUsers} color="rose" />
                                <KpiCard icon="🏷️" label="激活码总数" value={stats?.totalCodes} color="indigo" />
                                <KpiCard icon="🆕" label="未使用码" value={stats?.unusedCodes} color="emerald" />
                            </div>

                            {/* Charts Row */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <MiniBarChart data={growth?.registrations} label="📈 用户注册趋势 (近30天)" color="#6366F1" />
                                </div>
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <MiniBarChart data={growth?.dau} label="👥 每日活跃用户 (DAU)" color="#10B981" />
                                </div>
                            </div>

                            {/* Expiring Soon */}
                            {expiring.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6">
                                    <div className="text-sm font-black text-amber-600 mb-3">⚠️ 7天内到期用户 ({expiring.length}人)</div>
                                    <div className="space-y-2">
                                        {expiring.map(u => (
                                            <div key={u.id} className="flex justify-between items-center text-sm bg-amber-50 px-4 py-2 rounded-xl">
                                                <span className="font-bold text-slate-700">{u.email}</span>
                                                <span className="text-amber-600 font-bold">{new Date(u.sub_end_date).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Refresh button */}
                            <button onClick={loadDashboard} className="bg-white text-slate-600 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm text-sm">
                                🔄 刷新数据
                            </button>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════ */}
                    {/* ═══ USERS TAB ═══ */}
                    {/* ═══════════════════════════════════════ */}
                    {adminTab === 'users' && (
                        <div className="space-y-4 animate-fade-in">
                            {/* Search & Filter Bar */}
                            <div className="flex flex-wrap gap-3 items-center">
                                <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                                    placeholder="🔍 搜索邮箱或用户ID..."
                                    className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                                {['all', 'active', 'expired', 'banned'].map(f => (
                                    <button key={f} onClick={() => setUserFilter(f)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${userFilter === f ? 'bg-indigo-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                                        {{ all: '全部', active: '活跃', expired: '过期', banned: '禁用' }[f]}
                                    </button>
                                ))}
                            </div>

                            {/* Users Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                            <tr>
                                                <th className="px-4 py-3 font-bold">邮箱</th>
                                                <th className="px-4 py-3 font-bold">状态</th>
                                                <th className="px-4 py-3 font-bold">订阅到期</th>
                                                <th className="px-4 py-3 font-bold">注册时间</th>
                                                <th className="px-4 py-3 font-bold text-right">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredUsers.map(u => {
                                                const isExpired = new Date(u.sub_end_date) < now && u.role !== 'admin';
                                                const isBanned = u.status === 'banned';
                                                return (
                                                    <tr key={u.id} className={`hover:bg-slate-50/50 transition-colors ${isBanned ? 'opacity-60' : ''}`}>
                                                        <td className="px-4 py-3">
                                                            <div className="font-bold text-slate-800">{u.email}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono">{u.id}</div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {u.role === 'admin' ? <span className="px-2 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-700">管理员</span> :
                                                                isBanned ? <span className="px-2 py-1 rounded-md text-xs font-bold bg-red-100 text-red-600">已禁用</span> :
                                                                    isExpired ? <span className="px-2 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-600">已过期</span> :
                                                                        <span className="px-2 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-600">活跃</span>}
                                                        </td>
                                                        <td className={`px-4 py-3 font-bold text-sm ${isExpired ? 'text-red-500' : 'text-emerald-600'}`}>
                                                            {u.role === 'admin' ? '∞' : new Date(u.sub_end_date).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            {u.role !== 'admin' && (
                                                                <div className="flex gap-1.5 justify-end flex-wrap">
                                                                    <button onClick={() => loadUserDetails(u.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">📋 详情</button>
                                                                    <button onClick={() => { setShowSubModal(u.id); setSubDate(u.sub_end_date?.split('T')[0] || ''); }} className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">📅 调整</button>
                                                                    <button onClick={() => toggleBan(u.id, u.status)} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${isBanned ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                                                                        {isBanned ? '✅ 解封' : '🚫 禁用'}
                                                                    </button>
                                                                    <button onClick={() => resetPassword(u.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors">🔑 重置密码</button>
                                                                    <button onClick={() => setShowDeleteConfirm(u.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors">🗑 删除</button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* User Details Drawer */}
                            {selectedUser && userDetails && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-fade-in">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-black text-lg text-slate-800">📋 用户详情</h3>
                                        <button onClick={() => { setSelectedUser(null); setUserDetails(null); }} className="text-slate-400 hover:text-slate-600">✕</button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-slate-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-black text-indigo-600">{userDetails.kids?.length || 0}</div>
                                            <div className="text-xs font-bold text-slate-500">孩子数量</div>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-black text-emerald-600">{userDetails.taskCount}</div>
                                            <div className="text-xs font-bold text-slate-500">任务数</div>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-black text-amber-600">{userDetails.transactionCount}</div>
                                            <div className="text-xs font-bold text-slate-500">交易数</div>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-black text-purple-600">{userDetails.loginCount}</div>
                                            <div className="text-xs font-bold text-slate-500">登录次数</div>
                                        </div>
                                    </div>
                                    {userDetails.lastLogin && (
                                        <div className="text-xs text-slate-500 mt-3">最后登录: {new Date(userDetails.lastLogin).toLocaleString()}</div>
                                    )}
                                    {userDetails.kids?.length > 0 && (
                                        <div className="mt-4">
                                            <div className="text-xs font-bold text-slate-500 mb-2">孩子列表:</div>
                                            <div className="flex flex-wrap gap-2">
                                                {userDetails.kids.map(k => (
                                                    <div key={k.id} className="bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700">
                                                        {k.name} (Lv.{k.level} · {k.balance_spend}币)
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══════════════════════════════════════ */}
                    {/* ═══ CODES TAB ═══ */}
                    {/* ═══════════════════════════════════════ */}
                    {adminTab === 'codes' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Generate Section */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <h2 className="text-xl font-black flex items-center gap-2 text-slate-800"><Icons.Tag size={20} className="text-rose-500" /> 发行激活码</h2>
                                </div>
                                <div className="p-6 flex gap-3 flex-wrap items-center">
                                    <button onClick={() => generateCodes(30)} className="bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-xl font-black hover:bg-indigo-100 transition-colors border border-indigo-200 shadow-sm text-sm">30天体验卡 ×5</button>
                                    <button onClick={() => generateCodes(365)} className="bg-purple-50 text-purple-600 px-5 py-2.5 rounded-xl font-black hover:bg-purple-100 transition-colors border border-purple-200 shadow-sm text-sm">365天年卡 ×5</button>
                                    <button onClick={() => generateCodes(9999)} className="bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-xl font-black hover:bg-emerald-100 transition-colors border border-emerald-200 shadow-sm text-sm">永久版 ×5</button>
                                    <div className="flex items-center gap-2">
                                        <input value={customDays} onChange={e => setCustomDays(e.target.value)} type="number" placeholder="自定义天数"
                                            className="w-28 px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                                        <button onClick={() => { if (customDays > 0) generateCodes(parseInt(customDays)); }} disabled={!customDays || customDays <= 0}
                                            className="bg-slate-800 text-white px-5 py-2.5 rounded-xl font-black hover:bg-slate-700 transition-colors shadow-sm text-sm disabled:opacity-40">生成 ×5</button>
                                    </div>
                                    <button onClick={exportCodes} className="ml-auto bg-white text-slate-600 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm text-sm">📥 导出CSV</button>
                                </div>
                            </div>

                            {/* Codes Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                    <h2 className="text-lg font-black text-slate-800">激活码库存与核销记录</h2>
                                    <input value={codeSearch} onChange={e => setCodeSearch(e.target.value)} placeholder="🔍 搜索激活码..."
                                        className="w-60 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                                </div>
                                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 font-bold">激活码</th>
                                                <th className="px-4 py-3 font-bold">时长</th>
                                                <th className="px-4 py-3 font-bold">状态</th>
                                                <th className="px-4 py-3 font-bold">使用者</th>
                                                <th className="px-4 py-3 font-bold">时间</th>
                                                <th className="px-4 py-3 font-bold text-right">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredCodes.map(c => (
                                                <tr key={c.code} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-3 font-mono font-bold text-indigo-700">{c.code}</td>
                                                    <td className="px-4 py-3 font-bold text-slate-600">+{c.duration_days}天</td>
                                                    <td className="px-4 py-3">
                                                        {c.status === 'active' ? <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold text-xs border border-emerald-200">待发放</span> :
                                                            c.status === 'revoked' ? <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg font-bold text-xs border border-amber-200">已作废</span> :
                                                                <span className="text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg font-bold text-xs">已核销</span>}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{c.used_by || '-'}</td>
                                                    <td className="px-4 py-3 text-slate-500 text-xs">{c.used_at ? new Date(c.used_at).toLocaleString() : c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        {c.status === 'active' && (
                                                            <div className="flex gap-1.5 justify-end">
                                                                <button onClick={() => revokeCode(c.code)} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors">作废</button>
                                                                <button onClick={() => deleteCode(c.code)} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors">删除</button>
                                                            </div>
                                                        )}
                                                        {c.status === 'revoked' && (
                                                            <button onClick={() => deleteCode(c.code)} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors">删除</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════ */}
                    {/* ═══ AI TAB ═══ */}
                    {/* ═══════════════════════════════════════ */}
                    {adminTab === 'ai' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* AI Config Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex justify-between items-center">
                                    <h2 className="text-xl font-black flex items-center gap-2 text-slate-800">✨ AI 服务配置</h2>
                                    {!editingConfig ? (
                                        <button onClick={() => setEditingConfig({ ...(adminAiConfig || { provider: 'gemini', api_key: '', model_name: 'gemini-2.0-flash', base_url: '', default_quota: 50 }) })}
                                            className="bg-indigo-500 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-600 transition-colors shadow-sm text-sm">
                                            编辑配置
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingConfig(null)} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm">取消</button>
                                            <button onClick={saveAiConfig} className="bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-sm text-sm">💾 保存</button>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 space-y-6">
                                    {/* Provider Selection */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">AI 供应商</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {PROVIDERS.map(p => (
                                                <button key={p.id} onClick={() => editingConfig && setEditingConfig({ ...editingConfig, provider: p.id, model_name: p.models[0] || '' })}
                                                    className={`p-4 rounded-xl border-2 transition-all text-left ${currentConfig.provider === p.id ? 'border-indigo-400 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'} ${!editingConfig ? 'cursor-default' : ''}`}>
                                                    <div className="text-xl mb-1">{p.icon}</div>
                                                    <div className="text-sm font-black" style={{ color: p.color }}>{p.name}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Model */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">模型</label>
                                        {currentProvider.models.length > 0 ? (
                                            <div className="flex gap-2 flex-wrap">
                                                {currentProvider.models.map(m => (
                                                    <button key={m} onClick={() => editingConfig && setEditingConfig({ ...editingConfig, model_name: m })}
                                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentConfig.model_name === m ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} ${!editingConfig ? 'cursor-default' : ''}`}>
                                                        {m}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <input value={currentConfig.model_name || ''} readOnly={!editingConfig}
                                                onChange={e => editingConfig && setEditingConfig({ ...editingConfig, model_name: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                placeholder="模型名称 (如 gpt-4o)" />
                                        )}
                                    </div>
                                    {/* API Key */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">API Key</label>
                                        <div className="flex gap-2">
                                            <input type={showApiKey ? 'text' : 'password'} value={currentConfig.api_key || ''} readOnly={!editingConfig}
                                                onChange={e => editingConfig && setEditingConfig({ ...editingConfig, api_key: e.target.value })}
                                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="sk-..." />
                                            <button onClick={() => setShowApiKey(!showApiKey)} className="bg-slate-100 px-3 rounded-xl text-sm">{showApiKey ? '🙈' : '👁'}</button>
                                        </div>
                                    </div>
                                    {/* Base URL (for custom) */}
                                    {currentConfig.provider === 'custom' && (
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Base URL</label>
                                            <input value={currentConfig.base_url || ''} readOnly={!editingConfig}
                                                onChange={e => editingConfig && setEditingConfig({ ...editingConfig, base_url: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                placeholder="https://api.example.com/v1" />
                                        </div>
                                    )}
                                    {/* Quota */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">默认月配额 (每用户)</label>
                                        <input type="number" value={currentConfig.default_quota || 50} readOnly={!editingConfig}
                                            onChange={e => editingConfig && setEditingConfig({ ...editingConfig, default_quota: parseInt(e.target.value) || 50 })}
                                            className="w-32 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                                    </div>
                                </div>
                            </div>

                            {/* AI Usage Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <div>
                                        <h2 className="text-xl font-black flex items-center gap-2 text-slate-800">📊 用量统计</h2>
                                        <div className="text-xs font-bold text-slate-500 mt-1">当月用量统计 · 可为单个用户设置自定义配额</div>
                                    </div>
                                    <button onClick={() => apiFetch('/api/admin/ai-usage').then(r => safeJsonOr(r, [])).then(d => d && setAdminAiUsage(d)).then(() => notify('已刷新', 'success')).catch(() => {})}
                                        className="bg-white text-slate-600 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition-colors border border-slate-200 text-sm">
                                        🔄 刷新
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                            <tr>
                                                <th className="px-6 py-4 font-bold">邮箱</th>
                                                <th className="px-6 py-4 font-bold">本月用量</th>
                                                <th className="px-6 py-4 font-bold">配额</th>
                                                <th className="px-6 py-4 font-bold">剩余</th>
                                                <th className="px-6 py-4 font-bold">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(adminAiUsage || []).map(u => (
                                                <tr key={u.id} className="hover:bg-slate-50/50">
                                                    <td className="px-6 py-4 font-bold text-slate-800">{u.email}</td>
                                                    <td className="px-6 py-4">{u.used_this_month}</td>
                                                    <td className="px-6 py-4">
                                                        {editingQuotaUserId === u.id ? (
                                                            <div className="flex gap-1 items-center">
                                                                <input type="number" value={editingQuotaValue} onChange={e => setEditingQuotaValue(e.target.value)}
                                                                    className="w-20 px-2 py-1 rounded-lg border border-indigo-300 text-sm" placeholder="默认" />
                                                                <button onClick={() => updateUserQuota(u.id, editingQuotaValue)} className="text-emerald-500 font-bold text-xs">✓</button>
                                                                <button onClick={() => setEditingQuotaUserId(null)} className="text-slate-400 text-xs">✕</button>
                                                            </div>
                                                        ) : (
                                                            <span className={u.ai_quota !== null ? 'text-indigo-600 font-bold' : 'text-slate-400'}>{u.quota} {u.ai_quota !== null && '(自定义)'}</span>
                                                        )}
                                                    </td>
                                                    <td className={`px-6 py-4 font-bold ${u.remaining <= 0 ? 'text-red-500' : u.remaining <= 10 ? 'text-amber-500' : 'text-emerald-600'}`}>{u.remaining}</td>
                                                    <td className="px-6 py-4">
                                                        <button onClick={() => { setEditingQuotaUserId(u.id); setEditingQuotaValue(u.ai_quota !== null ? String(u.ai_quota) : ''); }}
                                                            className="text-indigo-500 font-bold text-xs hover:text-indigo-700">调整配额</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ MODALS ═══ */}

            {/* Subscription Adjustment Modal */}
            {showSubModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowSubModal(null)}>
                    <div className="bg-white rounded-2xl p-6 w-[380px] shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="font-black text-lg mb-4">📅 调整订阅到期时间</h3>
                        <input type="date" value={subDate} onChange={e => setSubDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold mb-4" />
                        <div className="flex gap-2 mb-3">
                            {[30, 90, 365].map(d => (
                                <button key={d} onClick={() => { const dt = new Date(); dt.setDate(dt.getDate() + d); setSubDate(dt.toISOString().split('T')[0]); }}
                                    className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">+{d}天</button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowSubModal(null)} className="flex-1 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">取消</button>
                            <button onClick={() => adjustSubscription(showSubModal)} className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors shadow-sm">确认修改</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="bg-white rounded-2xl p-6 w-[380px] shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="font-black text-lg mb-2 text-red-600">⚠️ 确认删除用户</h3>
                        <p className="text-sm text-slate-600 mb-4">此操作将永久删除该用户及其所有关联数据（孩子、任务、交易记录等），不可恢复！</p>
                        <div className="flex gap-2">
                            <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">取消</button>
                            <button onClick={() => deleteUser(showDeleteConfirm)} className="flex-1 py-2.5 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm">确认删除</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Temp Password Display Modal */}
            {tempPassword && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setTempPassword(null)}>
                    <div className="bg-white rounded-2xl p-6 w-[380px] shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="font-black text-lg mb-2">🔑 密码已重置</h3>
                        <p className="text-sm text-slate-600 mb-3">临时密码（请告知用户并建议修改）:</p>
                        <div className="bg-slate-100 rounded-xl p-4 font-mono text-xl text-center font-black text-indigo-700 select-all">{tempPassword}</div>
                        <button onClick={() => { navigator.clipboard?.writeText(tempPassword); notify('已复制', 'success'); }} className="w-full mt-3 py-2.5 rounded-xl font-bold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors shadow-sm">📋 复制密码</button>
                        <button onClick={() => setTempPassword(null)} className="w-full mt-2 py-2 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">关闭</button>
                    </div>
                </div>
            )}

            {/* Toast */}
            <div className="fixed top-4 right-4 z-[9999] space-y-2">
                {notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 rounded-xl shadow-lg font-bold text-sm animate-slide-in ${n.type === 'error' ? 'bg-red-500 text-white' : n.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-sky-500 text-white'}`}>
                        {n.message}
                    </div>
                ))}
            </div>
        </div>
    );
};
