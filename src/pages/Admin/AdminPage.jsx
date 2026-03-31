import React, { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useDataContext } from '../../context/DataContext.jsx';
import { useToast } from '../../hooks/useToast';
import { Icons } from '../../utils/Icons';
import { apiFetch, safeJson, safeJsonOr } from '../../api/client';

const PROVIDERS = [
    { id: 'gemini', name: 'Google Gemini', color: '#4285F4', models: ['gemini-2.0-flash', 'gemini-2.0-pro', 'gemini-1.5-flash'] },
    { id: 'deepseek', name: 'DeepSeek', color: '#5B6EF5', models: ['deepseek-chat', 'deepseek-reasoner'] },
    { id: 'qwen', name: '通义千问', color: '#FF6A00', models: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-vl-plus', 'qwen-vl-max'] },
    { id: 'custom', name: '自定义 (OpenAI兼容)', color: '#10B981', models: [] },
];

/* ───── Flat KPI Card ───── */
const KpiCard = ({ icon: Icon, label, value, color = '#6366F1' }) => (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '14' }}>
            <Icon size={18} style={{ color }} />
        </div>
        <div className="min-w-0">
            <div className="text-xl font-extrabold text-slate-800 leading-tight">{value ?? '–'}</div>
            <div className="text-[11px] font-semibold text-slate-400 tracking-wide">{label}</div>
        </div>
    </div>
);

/* ───── Flat Bar Chart (CSS) ───── */
const BarChart = ({ data, label, color = '#6366F1' }) => {
    if (!data?.length) return <div className="text-sm text-slate-400 py-8 text-center">暂无数据</div>;
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div>
            <div className="text-xs font-semibold text-slate-500 mb-3">{label}</div>
            <div className="flex items-end gap-[3px] h-28">
                {data.slice(-14).map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <div className="text-[9px] font-bold text-slate-400">{d.count || ''}</div>
                        <div className="w-full rounded-sm" style={{ height: `${Math.max((d.count / max) * 100, 3)}%`, backgroundColor: color, opacity: 0.75 }} />
                        <div className="text-[8px] text-slate-400 truncate w-full text-center">{d.date?.slice(5)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ───── Flat Pill Badge ───── */
const Badge = ({ children, variant = 'default' }) => {
    const styles = {
        default: 'bg-slate-100 text-slate-600',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        warning: 'bg-amber-50 text-amber-700 border border-amber-200',
        danger: 'bg-red-50 text-red-600 border border-red-200',
        info: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
        purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    };
    return <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${styles[variant]}`}>{children}</span>;
};

/* ───── Flat Action Button ───── */
const ActionBtn = ({ onClick, children, variant = 'default', className = '' }) => {
    const styles = {
        default: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
        danger: 'bg-red-50 text-red-600 hover:bg-red-100',
        success: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
        warning: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
    };
    return <button onClick={onClick} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${styles[variant]} ${className}`}>{children}</button>;
};

export const AdminPage = () => {
    const { user, handleLogout } = useAuthContext();
    const { adminUsers, setAdminUsers, adminCodes, setAdminCodes, adminTab, setAdminTab, adminAiConfig, setAdminAiConfig, adminAiUsage, setAdminAiUsage } = useDataContext();
    const { notifications, notify } = useToast();

    const [stats, setStats] = useState(null);
    const [growth, setGrowth] = useState(null);
    const [expiring, setExpiring] = useState([]);
    const [activity, setActivity] = useState([]);
    const [funnel, setFunnel] = useState(null);
    const [health, setHealth] = useState(null);
    const [userSearch, setUserSearch] = useState('');
    const [userFilter, setUserFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [showSubModal, setShowSubModal] = useState(null);
    const [subDate, setSubDate] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [tempPassword, setTempPassword] = useState(null);
    const [customDays, setCustomDays] = useState('');
    const [codeSearch, setCodeSearch] = useState('');
    const [editingConfig, setEditingConfig] = useState(null);
    const [showApiKey, setShowApiKey] = useState(false);
    const [editingQuotaUserId, setEditingQuotaUserId] = useState(null);
    const [editingQuotaValue, setEditingQuotaValue] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [appSettings, setAppSettings] = useState({});
    const [editingTrialDays, setEditingTrialDays] = useState('');
    const [uploadingQr, setUploadingQr] = useState(null);

    const loadDashboard = useCallback(() => {
        apiFetch('/api/admin/stats/overview').then(r => safeJsonOr(r, null)).then(d => d && setStats(d));
        apiFetch('/api/admin/stats/growth?days=30').then(r => safeJsonOr(r, null)).then(d => d && setGrowth(d));
        apiFetch('/api/admin/stats/expiring').then(r => safeJsonOr(r, [])).then(d => d && setExpiring(d));
        apiFetch('/api/admin/stats/recent-activity').then(r => safeJsonOr(r, [])).then(d => d && setActivity(d));
        apiFetch('/api/admin/stats/funnel').then(r => safeJsonOr(r, null)).then(d => d && setFunnel(d));
        apiFetch('/api/admin/stats/system-health').then(r => safeJsonOr(r, null)).then(d => d && setHealth(d));
    }, []);
    useEffect(() => { if (adminTab === 'dashboard') loadDashboard(); }, [adminTab, loadDashboard]);

    const loadSettings = useCallback(() => {
        apiFetch('/api/admin/settings').then(r => safeJsonOr(r, {})).then(d => {
            if (d) { setAppSettings(d); setEditingTrialDays(d.trial_days || '3'); }
        });
    }, []);
    useEffect(() => { if (adminTab === 'settings') loadSettings(); }, [adminTab, loadSettings]);

    const saveTrialDays = async () => {
        const val = parseInt(editingTrialDays);
        if (!val || val < 1) return notify('请输入有效天数', 'error');
        try {
            await apiFetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trial_days: String(val) }) });
            setAppSettings(prev => ({ ...prev, trial_days: String(val) }));
            notify('试用天数已更新', 'success');
        } catch { notify('保存失败', 'error'); }
    };

    const handleQrUpload = async (type) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setUploadingQr(type);
            try {
                const formData = new FormData();
                formData.append('qr', file);
                const res = await apiFetch(`/api/admin/settings/upload-qr?type=${type}`, { method: 'POST', body: formData });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setAppSettings(prev => ({ ...prev, [type]: data.path }));
                notify('上传成功', 'success');
            } catch (err) { notify(err.message || '上传失败', 'error'); }
            setUploadingQr(null);
        };
        input.click();
    };

    const refreshUsers = () => apiFetch('/api/admin/users').then(r => safeJsonOr(r, [])).then(d => d && setAdminUsers(d));

    const toggleBan = async (userId, currentStatus) => {
        const s = currentStatus === 'banned' ? 'active' : 'banned';
        try {
            const d = await apiFetch(`/api/admin/users/${userId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: s }) }).then(r => safeJson(r));
            if (d.error) return notify(d.error, 'error');
            notify(s === 'banned' ? '已禁用' : '已启用', 'success'); refreshUsers();
        } catch { notify('操作失败', 'error'); }
    };
    const adjustSubscription = async (userId) => {
        if (!subDate) return;
        try { await apiFetch(`/api/admin/users/${userId}/subscription`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sub_end_date: new Date(subDate).toISOString() }) }); notify('已更新', 'success'); setShowSubModal(null); refreshUsers(); } catch { notify('失败', 'error'); }
    };
    const resetPassword = async (userId) => {
        try { const d = await apiFetch(`/api/admin/users/${userId}/reset-password`, { method: 'POST' }).then(r => safeJson(r)); if (d.error) return notify(d.error, 'error'); setTempPassword(d.tempPassword); notify('已重置', 'success'); } catch { notify('失败', 'error'); }
    };
    const deleteUser = async (userId) => {
        try { const d = await apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' }).then(r => safeJson(r)); if (d.error) return notify(d.error, 'error'); notify('已删除', 'success'); setShowDeleteConfirm(null); setSelectedUser(null); refreshUsers(); } catch { notify('失败', 'error'); }
    };
    const loadUserDetails = async (userId) => {
        setSelectedUser(userId);
        const d = await apiFetch(`/api/admin/users/${userId}/details`).then(r => safeJsonOr(r, null));
        setUserDetails(d);
    };
    const generateCodes = async (days) => {
        try { const d = await apiFetch('/api/admin/codes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ count: 5, duration_days: days }) }).then(r => safeJson(r)); if (d.error) return notify(d.error, 'error'); setAdminCodes(prev => [...(d.codes || []).map(c => ({ code: c, duration_days: days, status: 'active', created_at: new Date().toISOString() })), ...prev]); notify(`已生成 5 个 ${days}天码`, 'success'); } catch { notify('失败', 'error'); }
    };
    const revokeCode = async (code) => { try { const d = await apiFetch(`/api/admin/codes/${code}/revoke`, { method: 'PUT' }).then(r => safeJson(r)); if (d.error) return notify(d.error, 'error'); setAdminCodes(prev => prev.map(c => c.code === code ? { ...c, status: 'revoked' } : c)); notify('已作废', 'success'); } catch { notify('失败', 'error'); } };
    const deleteCode = async (code) => { try { const d = await apiFetch(`/api/admin/codes/${code}`, { method: 'DELETE' }).then(r => safeJson(r)); if (d.error) return notify(d.error, 'error'); setAdminCodes(prev => prev.filter(c => c.code !== code)); notify('已删除', 'success'); } catch { notify('失败', 'error'); } };
    const exportCodes = () => { const a = adminCodes.filter(c => c.status === 'active'); if (!a.length) return notify('无可导出码', 'error'); const csv = 'Code,Days,Created\n' + a.map(c => `${c.code},${c.duration_days},${c.created_at || ''}`).join('\n'); const b = new Blob([csv], { type: 'text/csv' }); const u = URL.createObjectURL(b); const el = document.createElement('a'); el.href = u; el.download = `codes_${new Date().toISOString().split('T')[0]}.csv`; el.click(); URL.revokeObjectURL(u); notify(`已导出 ${a.length} 个`, 'success'); };

    const saveAiConfig = async () => {
        if (!editingConfig) return;
        try { const r = await apiFetch('/api/admin/ai-config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingConfig) }); if (!r.ok) throw 0; setAdminAiConfig(editingConfig); setEditingConfig(null); notify('已保存', 'success'); apiFetch('/api/admin/ai-usage').then(r => safeJsonOr(r, [])).then(d => d && setAdminAiUsage(d)); } catch { notify('失败', 'error'); }
    };
    const updateUserQuota = async (userId, quota) => {
        try { await apiFetch(`/api/admin/users/${userId}/ai-quota`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quota: quota === '' || quota === null ? null : parseInt(quota) }) }); setAdminAiUsage(prev => prev.map(u => u.id === userId ? { ...u, ai_quota: quota === '' ? null : parseInt(quota), quota: quota === '' ? (adminAiConfig?.default_quota || 50) : parseInt(quota), remaining: (quota === '' ? (adminAiConfig?.default_quota || 50) : parseInt(quota)) - u.used_this_month } : u)); setEditingQuotaUserId(null); notify('已更新', 'success'); } catch { notify('失败', 'error'); }
    };

    const cc = editingConfig || adminAiConfig || {};
    const cp = PROVIDERS.find(p => p.id === cc.provider) || PROVIDERS[0];
    const now = new Date();

    const filteredUsers = (adminUsers || []).filter(u => {
        if (u.role === 'admin') return true;
        if (userSearch && !u.email.toLowerCase().includes(userSearch.toLowerCase()) && !u.id.includes(userSearch)) return false;
        if (userFilter === 'active') return new Date(u.sub_end_date) > now && u.status !== 'banned';
        if (userFilter === 'expired') return new Date(u.sub_end_date) <= now;
        if (userFilter === 'banned') return u.status === 'banned';
        return true;
    });
    const filteredCodes = (adminCodes || []).filter(c => !codeSearch || c.code.toLowerCase().includes(codeSearch.toLowerCase()));

    const TABS = [
        { id: 'dashboard', Icon: Icons.Activity, label: '数据看板' },
        { id: 'users', Icon: Icons.Users, label: `用户 (${adminUsers?.length || 0})` },
        { id: 'codes', Icon: Icons.Tag, label: `激活码 (${adminCodes?.length || 0})` },
        { id: 'ai', Icon: Icons.Sparkles, label: 'AI 管理' },
        { id: 'settings', Icon: Icons.Settings, label: '设置' },
    ];

    return (
        <div className="min-h-screen bg-[#f8f9fb] text-slate-800 flex flex-col">
            {/* ─── Header ─── */}
            <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Icons.ShieldCheck size={16} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-base md:text-lg font-extrabold text-slate-800 leading-tight">MiniLife Admin</h1>
                        <div className="text-[10px] text-slate-400 font-medium hidden sm:block">{user.email}</div>
                    </div>
                </div>
                {/* Mobile hamburger */}
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100">
                    <Icons.List size={20} />
                </button>
                <button onClick={handleLogout} className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                    <Icons.LogOut size={16} /> 退出
                </button>
            </div>

            {/* ─── Tabs (desktop: horizontal bar, mobile: dropdown) ─── */}
            <div className="bg-white border-b border-slate-200 px-4 md:px-8">
                {/* Desktop tabs */}
                <div className="hidden md:flex gap-1">
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setAdminTab(t.id)}
                            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${adminTab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                            <t.Icon size={15} /> {t.label}
                        </button>
                    ))}
                </div>
                {/* Mobile tabs */}
                <div className="flex md:hidden overflow-x-auto gap-0 -mx-1 scrollbar-hide">
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => { setAdminTab(t.id); setMobileMenuOpen(false); }}
                            className={`flex items-center gap-1 px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap ${adminTab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}>
                            <t.Icon size={13} /> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile menu overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 space-y-1">
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-500 py-2">
                        <Icons.LogOut size={16} /> 退出登录
                    </button>
                </div>
            )}

            {/* ─── Content ─── */}
            <div className="p-4 md:p-8 flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto space-y-5">

                    {/* ═══ DASHBOARD ═══ */}
                    {adminTab === 'dashboard' && (
                        <div className="space-y-5 animate-fade-in">
                            {/* ── Section: 核心指标 ── */}
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">核心指标</div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                <KpiCard icon={Icons.Users} label="总用户" value={stats?.totalUsers} color="#6366F1" />
                                <KpiCard icon={Icons.CheckCircle} label="活跃订阅" value={stats?.activeSubscriptions} color="#10B981" />
                                <KpiCard icon={Icons.TrendingUp} label="本月新增" value={stats?.newThisMonth} color="#0EA5E9" />
                                <KpiCard icon={Icons.LogIn} label="今日登录" value={stats?.todayLogins} color="#8B5CF6" />
                                <KpiCard icon={Icons.Sparkles} label="AI调用/月" value={stats?.aiCallsThisMonth} color="#F59E0B" />
                            </div>

                            {/* ── Section: 订阅转化漏斗 + 关键洞察 ── */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Funnel */}
                                <div className="bg-white rounded-xl border border-slate-200/80 p-5">
                                    <div className="text-xs font-semibold text-slate-500 mb-4">订阅转化漏斗</div>
                                    {funnel && (() => {
                                        const max = Math.max(funnel.registered, 1);
                                        const steps = [
                                            { label: '注册用户', value: funnel.registered, color: '#6366F1' },
                                            { label: '活跃订阅', value: funnel.active, color: '#10B981' },
                                            { label: '已付费', value: funnel.paidUsers, color: '#8B5CF6' },
                                            { label: '已过期', value: funnel.expired, color: '#EF4444' },
                                        ];
                                        return (
                                            <div className="space-y-2.5">
                                                {steps.map((s, i) => (
                                                    <div key={i}>
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="font-semibold text-slate-600">{s.label}</span>
                                                            <span className="font-bold" style={{ color: s.color }}>{s.value}</span>
                                                        </div>
                                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max((s.value / max) * 100, 2)}%`, backgroundColor: s.color }} />
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="text-[11px] text-slate-400 mt-2">转化率: <span className="font-bold text-indigo-600">{stats?.conversionRate || 0}%</span> (注册→付费)</div>
                                            </div>
                                        );
                                    })()}
                                    {!funnel && <div className="text-sm text-slate-400 py-4 text-center">加载中...</div>}
                                </div>

                                {/* Key Insights */}
                                <div className="bg-white rounded-xl border border-slate-200/80 p-5">
                                    <div className="text-xs font-semibold text-slate-500 mb-4">关键洞察</div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0"><Icons.TrendingUp size={15} className="text-indigo-600" /></div>
                                            <div><div className="text-xs font-semibold text-slate-700">本周新增 {stats?.newThisWeek ?? '–'} 人</div><div className="text-[10px] text-slate-400">近7天活跃 {stats?.weekLogins ?? '–'} 人</div></div>
                                        </div>
                                        <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0"><Icons.Award size={15} className="text-purple-600" /></div>
                                            <div><div className="text-xs font-semibold text-slate-700">最活跃用户</div><div className="text-[10px] text-slate-400">{stats?.mostActiveUser || '–'} ({stats?.mostActiveLogins || 0}次登录)</div></div>
                                        </div>
                                        <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0"><Icons.Target size={15} className="text-amber-600" /></div>
                                            <div><div className="text-xs font-semibold text-slate-700">人均任务 {stats?.avgTasksPerUser ?? '–'}</div><div className="text-[10px] text-slate-400">已用激活码 {stats?.usedCodes ?? '–'} / {stats?.totalCodes ?? '–'}</div></div>
                                        </div>
                                        <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0"><Icons.ShieldAlert size={15} className="text-red-500" /></div>
                                            <div><div className="text-xs font-semibold text-slate-700">过期 {stats?.expiredUsers ?? '–'} · 禁用 {stats?.bannedUsers ?? '–'}</div><div className="text-[10px] text-slate-400">未使用激活码 {stats?.unusedCodes ?? '–'} 个</div></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Section: 平台数据 ── */}
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">平台使用数据</div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                <KpiCard icon={Icons.Users} label="孩子总数" value={stats?.totalKids} color="#6366F1" />
                                <KpiCard icon={Icons.CheckSquare} label="任务总数" value={stats?.totalTasks} color="#10B981" />
                                <KpiCard icon={Icons.ArrowRightLeft} label="交易总数" value={stats?.totalTransactions} color="#F59E0B" />
                                <KpiCard icon={Icons.ShoppingBag} label="订单总数" value={stats?.totalOrders} color="#EF4444" />
                                <KpiCard icon={Icons.GraduationCap} label="兴趣班" value={stats?.totalClasses} color="#8B5CF6" />
                                <KpiCard icon={Icons.Tag} label="激活码库存" value={stats?.unusedCodes} color="#0EA5E9" />
                            </div>

                            {/* ── Section: 趋势图 ── */}
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">趋势分析</div>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-white rounded-xl border border-slate-200/80 p-5">
                                    <BarChart data={growth?.registrations} label="用户注册 · 近30天" color="#6366F1" />
                                </div>
                                <div className="bg-white rounded-xl border border-slate-200/80 p-5">
                                    <BarChart data={growth?.dau} label="DAU · 每日活跃" color="#10B981" />
                                </div>
                                <div className="bg-white rounded-xl border border-slate-200/80 p-5">
                                    <BarChart data={growth?.aiDaily} label="AI 调用量 · 近30天" color="#F59E0B" />
                                </div>
                            </div>

                            {/* ── Section: 活动动态 + 到期预警 ── */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Recent Activity */}
                                <div className="bg-white rounded-xl border border-slate-200/80 p-5">
                                    <div className="text-xs font-semibold text-slate-500 mb-3">最近动态</div>
                                    {activity.length === 0 && <div className="text-sm text-slate-400 py-4 text-center">暂无记录</div>}
                                    <div className="space-y-1.5 max-h-56 overflow-y-auto">
                                        {activity.map((a, i) => {
                                            const icons = { login: Icons.LogIn, register: Icons.UserPlus, redeem: Icons.Key };
                                            const colors = { login: '#6366F1', register: '#10B981', redeem: '#F59E0B' };
                                            const labels = { login: '登录', register: '注册', redeem: '兑换激活码' };
                                            const Icon = icons[a.type] || Icons.Activity;
                                            const ago = (() => {
                                                const diff = (Date.now() - new Date(a.time).getTime()) / 1000;
                                                if (diff < 60) return '刚刚';
                                                if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
                                                if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
                                                return `${Math.floor(diff / 86400)}天前`;
                                            })();
                                            return (
                                                <div key={i} className="flex items-center gap-2.5 py-1.5">
                                                    <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors[a.type] + '14' }}>
                                                        <Icon size={12} style={{ color: colors[a.type] }} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <span className="text-xs font-semibold text-slate-700 truncate block">{a.email}</span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 flex-shrink-0">{labels[a.type]}</span>
                                                    <span className="text-[10px] text-slate-400 flex-shrink-0 w-14 text-right">{ago}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Expiring + Code Status */}
                                <div className="space-y-4">
                                    {expiring.length > 0 && (
                                        <div className="bg-white rounded-xl border border-amber-200 p-4">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-2"><Icons.AlertCircle size={13} /> 7天内到期 ({expiring.length}人)</div>
                                            <div className="space-y-1 max-h-32 overflow-y-auto">{expiring.map(u => (
                                                <div key={u.id} className="flex justify-between items-center text-xs bg-amber-50 px-3 py-1.5 rounded-md">
                                                    <span className="font-semibold text-slate-700 truncate">{u.email}</span>
                                                    <span className="text-amber-600 font-semibold flex-shrink-0 ml-2">{new Date(u.sub_end_date).toLocaleDateString()}</span>
                                                </div>
                                            ))}</div>
                                        </div>
                                    )}
                                    {expiring.length === 0 && (
                                        <div className="bg-white rounded-xl border border-emerald-200 p-4">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><Icons.CheckCircle size={13} /> 暂无即将到期用户</div>
                                        </div>
                                    )}
                                    <div className="bg-white rounded-xl border border-slate-200/80 p-4">
                                        <div className="text-xs font-semibold text-slate-500 mb-3">激活码概览</div>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="bg-emerald-50 rounded-lg p-2.5"><div className="text-lg font-extrabold text-emerald-700">{stats?.unusedCodes ?? '–'}</div><div className="text-[10px] text-emerald-600 font-semibold">待发放</div></div>
                                            <div className="bg-slate-100 rounded-lg p-2.5"><div className="text-lg font-extrabold text-slate-600">{stats?.usedCodes ?? '–'}</div><div className="text-[10px] text-slate-500 font-semibold">已核销</div></div>
                                            <div className="bg-indigo-50 rounded-lg p-2.5"><div className="text-lg font-extrabold text-indigo-700">{stats?.totalCodes ?? '–'}</div><div className="text-[10px] text-indigo-600 font-semibold">总计</div></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <ActionBtn onClick={loadDashboard} variant="default"><Icons.RefreshCw size={12} className="inline mr-1" />刷新数据</ActionBtn>

                            {/* ── Section: 系统监控 ── */}
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">系统状态监控</div>
                            {health && (
                                <div className="grid md:grid-cols-3 gap-4">
                                    {/* Server Info */}
                                    <div className="bg-white rounded-xl border border-slate-200/80 p-5">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3"><Icons.Monitor size={13} /> 服务器信息</div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs"><span className="text-slate-500">运行时长</span><span className="font-bold text-emerald-600">{health.server?.uptimeFormatted}</span></div>
                                            <div className="flex justify-between text-xs"><span className="text-slate-500">Node.js</span><span className="font-semibold text-slate-700">{health.server?.nodeVersion}</span></div>
                                            <div className="flex justify-between text-xs"><span className="text-slate-500">平台</span><span className="font-semibold text-slate-700">{health.server?.platform} / {health.server?.arch}</span></div>
                                            <div className="flex justify-between text-xs"><span className="text-slate-500">PID</span><span className="font-mono text-slate-500">{health.server?.pid}</span></div>
                                            <div className="flex justify-between text-xs"><span className="text-slate-500">启动时间</span><span className="text-slate-500">{health.server?.startedAt ? new Date(health.server.startedAt).toLocaleString() : '–'}</span></div>
                                        </div>
                                    </div>

                                    {/* Memory */}
                                    <div className="bg-white rounded-xl border border-slate-200/80 p-5">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3"><Icons.Activity size={13} /> 内存使用</div>
                                        <div className="space-y-3">
                                            {/* Process memory */}
                                            <div>
                                                <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">进程 RSS</span><span className="font-semibold text-slate-700">{health.memory?.rssFormatted}</span></div>
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min((health.memory?.rss / (health.os?.totalMemory || 1)) * 100, 100)}%` }} /></div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">堆内存</span><span className="font-semibold text-slate-700">{health.memory?.heapUsedFormatted} / {health.memory?.heapTotalFormatted}</span></div>
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-purple-500" style={{ width: `${Math.min((health.memory?.heapUsed / (health.memory?.heapTotal || 1)) * 100, 100)}%` }} /></div>
                                            </div>
                                            {/* OS memory */}
                                            <div className="pt-1 border-t border-slate-100">
                                                <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">系统内存</span><span className={`font-semibold ${(health.os?.memoryUsagePercent || 0) > 80 ? 'text-red-500' : 'text-emerald-600'}`}>{health.os?.usedMemoryFormatted} / {health.os?.totalMemoryFormatted} ({health.os?.memoryUsagePercent}%)</span></div>
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${(health.os?.memoryUsagePercent || 0) > 80 ? 'bg-red-500' : (health.os?.memoryUsagePercent || 0) > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${health.os?.memoryUsagePercent || 0}%` }} /></div>
                                            </div>
                                            <div className="flex justify-between text-xs"><span className="text-slate-500">CPU 核心</span><span className="font-semibold text-slate-700">{health.os?.cpuCores}核</span></div>
                                            <div className="flex justify-between text-xs"><span className="text-slate-500">负载均值</span><span className="font-mono text-slate-500">{health.os?.loadAvg?.map(v => v.toFixed(2)).join(' / ')}</span></div>
                                        </div>
                                    </div>

                                    {/* Database */}
                                    <div className="bg-white rounded-xl border border-slate-200/80 p-5">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3"><Icons.Landmark size={13} /> 数据库</div>
                                        <div className="flex items-center gap-2.5 mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center"><Icons.Landmark size={18} className="text-indigo-600" /></div>
                                            <div><div className="text-lg font-extrabold text-slate-800">{health.database?.sizeFormatted}</div><div className="text-[10px] text-slate-400">SQLite 数据库大小</div></div>
                                        </div>
                                        <div className="space-y-1 max-h-40 overflow-y-auto">
                                            {health.database?.tables && Object.entries(health.database.tables).map(([name, count]) => (
                                                <div key={name} className="flex justify-between text-xs py-0.5">
                                                    <span className="text-slate-500 font-mono">{name}</span>
                                                    <span className="font-semibold text-slate-700">{count >= 0 ? count : '–'} 行</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between text-xs mt-2 pt-2 border-t border-slate-100"><span className="text-slate-500">主机名</span><span className="font-mono text-slate-500">{health.os?.hostname}</span></div>
                                    </div>
                                </div>
                            )}
                            {!health && <div className="text-sm text-slate-400 text-center py-4">加载系统状态...</div>}
                        </div>
                    )}

                    {/* ═══ USERS ═══ */}
                    {adminTab === 'users' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                                <div className="relative flex-1">
                                    <Icons.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="搜索邮箱或ID..." className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-400" />
                                </div>
                                <div className="flex gap-1.5 overflow-x-auto">
                                    {[['all','全部'],['active','活跃'],['expired','过期'],['banned','禁用']].map(([k,v]) => (
                                        <button key={k} onClick={() => setUserFilter(k)} className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${userFilter === k ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>{v}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                                {/* Desktop table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs"><tr>
                                            <th className="text-left px-4 py-2.5 font-semibold">邮箱</th><th className="text-left px-4 py-2.5 font-semibold">状态</th><th className="text-left px-4 py-2.5 font-semibold">到期</th><th className="text-left px-4 py-2.5 font-semibold">注册</th><th className="text-right px-4 py-2.5 font-semibold">操作</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredUsers.map(u => { const isExp = new Date(u.sub_end_date) < now && u.role !== 'admin'; const isBan = u.status === 'banned'; return (
                                                <tr key={u.id} className={`hover:bg-slate-50/70 ${isBan ? 'opacity-50' : ''}`}>
                                                    <td className="px-4 py-2.5"><div className="font-semibold text-slate-800 text-sm">{u.email}</div><div className="text-[10px] text-slate-400 font-mono">{u.id}</div></td>
                                                    <td className="px-4 py-2.5">{u.role === 'admin' ? <Badge variant="purple">管理员</Badge> : isBan ? <Badge variant="danger">禁用</Badge> : isExp ? <Badge variant="warning">过期</Badge> : <Badge variant="success">活跃</Badge>}</td>
                                                    <td className={`px-4 py-2.5 text-xs font-semibold ${isExp ? 'text-red-500' : 'text-emerald-600'}`}>{u.role === 'admin' ? '∞' : new Date(u.sub_end_date).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2.5 text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2.5 text-right">{u.role !== 'admin' && (
                                                        <div className="flex gap-1 justify-end flex-wrap">
                                                            <ActionBtn onClick={() => loadUserDetails(u.id)}>详情</ActionBtn>
                                                            <ActionBtn onClick={() => { setShowSubModal(u.id); setSubDate(u.sub_end_date?.split('T')[0] || ''); }} variant="default">调整</ActionBtn>
                                                            <ActionBtn onClick={() => toggleBan(u.id, u.status)} variant={isBan ? 'success' : 'warning'}>{isBan ? '解封' : '禁用'}</ActionBtn>
                                                            <ActionBtn onClick={() => resetPassword(u.id)} variant="default">重置密码</ActionBtn>
                                                            <ActionBtn onClick={() => setShowDeleteConfirm(u.id)} variant="danger">删除</ActionBtn>
                                                        </div>
                                                    )}</td>
                                                </tr>); })}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Mobile cards */}
                                <div className="md:hidden divide-y divide-slate-100">
                                    {filteredUsers.map(u => { const isExp = new Date(u.sub_end_date) < now && u.role !== 'admin'; const isBan = u.status === 'banned'; return (
                                        <div key={u.id} className={`p-4 ${isBan ? 'opacity-50' : ''}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="min-w-0"><div className="font-semibold text-sm text-slate-800 truncate">{u.email}</div><div className="text-[10px] text-slate-400 font-mono">{u.id}</div></div>
                                                {u.role === 'admin' ? <Badge variant="purple">管理员</Badge> : isBan ? <Badge variant="danger">禁用</Badge> : isExp ? <Badge variant="warning">过期</Badge> : <Badge variant="success">活跃</Badge>}
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500 mb-2.5">
                                                <span>到期: <span className={isExp ? 'text-red-500 font-semibold' : 'text-emerald-600 font-semibold'}>{u.role === 'admin' ? '∞' : new Date(u.sub_end_date).toLocaleDateString()}</span></span>
                                                <span>{new Date(u.created_at).toLocaleDateString()}</span>
                                            </div>
                                            {u.role !== 'admin' && <div className="flex gap-1.5 flex-wrap">
                                                <ActionBtn onClick={() => loadUserDetails(u.id)}>详情</ActionBtn>
                                                <ActionBtn onClick={() => { setShowSubModal(u.id); setSubDate(u.sub_end_date?.split('T')[0] || ''); }}>调整</ActionBtn>
                                                <ActionBtn onClick={() => toggleBan(u.id, u.status)} variant={isBan ? 'success' : 'warning'}>{isBan ? '解封' : '禁用'}</ActionBtn>
                                                <ActionBtn onClick={() => resetPassword(u.id)}>重置密码</ActionBtn>
                                                <ActionBtn onClick={() => setShowDeleteConfirm(u.id)} variant="danger">删除</ActionBtn>
                                            </div>}
                                        </div>); })}
                                </div>
                            </div>
                            {selectedUser && userDetails && (
                                <div className="bg-white rounded-xl border border-slate-200/80 p-4 animate-fade-in">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-1.5"><Icons.FileText size={14} /> 用户详情</h3>
                                        <button onClick={() => { setSelectedUser(null); setUserDetails(null); }} className="text-slate-400 hover:text-slate-600"><Icons.X size={16} /></button>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[['孩子', userDetails.kids?.length || 0, '#6366F1'], ['任务', userDetails.taskCount, '#10B981'], ['交易', userDetails.transactionCount, '#F59E0B'], ['登录', userDetails.loginCount, '#8B5CF6']].map(([l, v, c]) => (
                                            <div key={l} className="bg-slate-50 rounded-lg p-3 text-center">
                                                <div className="text-lg font-extrabold" style={{ color: c }}>{v}</div>
                                                <div className="text-[10px] font-semibold text-slate-400">{l}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {userDetails.lastLogin && <div className="text-[11px] text-slate-500 mt-2">最后登录: {new Date(userDetails.lastLogin).toLocaleString()}</div>}
                                    {userDetails.kids?.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{userDetails.kids.map(k => <Badge key={k.id} variant="info">{k.name} Lv.{k.level} · {k.balance_spend}币</Badge>)}</div>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ CODES ═══ */}
                    {adminTab === 'codes' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-white rounded-xl border border-slate-200/80 p-4">
                                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 mb-3"><Icons.Tag size={15} /> 发行激活码</div>
                                <div className="flex gap-2 flex-wrap items-center">
                                    <ActionBtn onClick={() => generateCodes(30)} variant="default">30天 ×5</ActionBtn>
                                    <ActionBtn onClick={() => generateCodes(365)} variant="default">365天 ×5</ActionBtn>
                                    <ActionBtn onClick={() => generateCodes(9999)} variant="default">永久 ×5</ActionBtn>
                                    <div className="flex items-center gap-1.5">
                                        <input value={customDays} onChange={e => setCustomDays(e.target.value)} type="number" placeholder="天数" className="w-20 px-2 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:border-indigo-400" />
                                        <ActionBtn onClick={() => customDays > 0 && generateCodes(parseInt(customDays))} variant="primary">生成</ActionBtn>
                                    </div>
                                    <ActionBtn onClick={exportCodes} variant="default" className="ml-auto"><Icons.Download size={12} className="inline mr-0.5" />导出CSV</ActionBtn>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                                <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                                    <span className="text-sm font-semibold text-slate-800">库存与核销记录</span>
                                    <div className="relative"><Icons.Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={codeSearch} onChange={e => setCodeSearch(e.target.value)} placeholder="搜索码..." className="pl-7 pr-2 py-1.5 w-40 rounded-md border border-slate-200 text-xs focus:outline-none focus:border-indigo-400" /></div>
                                </div>
                                {/* Desktop code table */}
                                <div className="hidden md:block overflow-x-auto max-h-[420px] overflow-y-auto">
                                    <table className="w-full text-sm"><thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 sticky top-0"><tr>
                                        <th className="text-left px-4 py-2.5 font-semibold">激活码</th><th className="text-left px-4 py-2.5 font-semibold">时长</th><th className="text-left px-4 py-2.5 font-semibold">状态</th><th className="text-left px-4 py-2.5 font-semibold">使用者</th><th className="text-left px-4 py-2.5 font-semibold">时间</th><th className="text-right px-4 py-2.5 font-semibold">操作</th>
                                    </tr></thead><tbody className="divide-y divide-slate-100">
                                        {filteredCodes.map(c => (<tr key={c.code} className="hover:bg-slate-50/70">
                                            <td className="px-4 py-2 font-mono text-xs font-semibold text-indigo-700">{c.code}</td>
                                            <td className="px-4 py-2 text-xs font-semibold text-slate-600">+{c.duration_days}天</td>
                                            <td className="px-4 py-2">{c.status === 'active' ? <Badge variant="success">待发放</Badge> : c.status === 'revoked' ? <Badge variant="warning">已作废</Badge> : <Badge>已核销</Badge>}</td>
                                            <td className="px-4 py-2 text-xs text-slate-600" title={c.used_by || ''}>{c.used_by_email || c.used_by || '–'}</td>
                                            <td className="px-4 py-2 text-xs text-slate-500">{c.used_at ? new Date(c.used_at).toLocaleString() : c.created_at ? new Date(c.created_at).toLocaleDateString() : '–'}</td>
                                            <td className="px-4 py-2 text-right">{c.status === 'active' && <div className="flex gap-1 justify-end"><ActionBtn onClick={() => revokeCode(c.code)} variant="warning">作废</ActionBtn><ActionBtn onClick={() => deleteCode(c.code)} variant="danger">删除</ActionBtn></div>}{c.status === 'revoked' && <ActionBtn onClick={() => deleteCode(c.code)} variant="danger">删除</ActionBtn>}</td>
                                        </tr>))}
                                    </tbody></table>
                                </div>
                                {/* Mobile code cards */}
                                <div className="md:hidden divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
                                    {filteredCodes.map(c => (<div key={c.code} className="p-3">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="font-mono text-xs font-semibold text-indigo-700">{c.code}</span>
                                            {c.status === 'active' ? <Badge variant="success">待发放</Badge> : c.status === 'revoked' ? <Badge variant="warning">已作废</Badge> : <Badge>已核销</Badge>}
                                        </div>
                                        <div className="flex justify-between text-[11px] text-slate-500 mb-2">
                                            <span>+{c.duration_days}天</span>
                                            <span>{c.used_by_email || c.used_by ? `${c.used_by_email || c.used_by}` : c.created_at ? new Date(c.created_at).toLocaleDateString() : '–'}</span>
                                        </div>
                                        {(c.status === 'active' || c.status === 'revoked') && <div className="flex gap-1.5">
                                            {c.status === 'active' && <ActionBtn onClick={() => revokeCode(c.code)} variant="warning">作废</ActionBtn>}
                                            <ActionBtn onClick={() => deleteCode(c.code)} variant="danger">删除</ActionBtn>
                                        </div>}
                                    </div>))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ AI ═══ */}
                    {adminTab === 'ai' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-white rounded-xl border border-slate-200/80">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800"><Icons.Sparkles size={15} /> AI 服务配置</div>
                                    {!editingConfig ? (<ActionBtn onClick={() => setEditingConfig({ ...(adminAiConfig || { provider: 'gemini', api_key: '', model_name: 'gemini-2.0-flash', base_url: '', default_quota: 50 }) })} variant="primary">编辑</ActionBtn>
                                    ) : (<div className="flex gap-1.5"><ActionBtn onClick={() => setEditingConfig(null)}>取消</ActionBtn><ActionBtn onClick={saveAiConfig} variant="primary">保存</ActionBtn></div>)}
                                </div>
                                <div className="p-4 space-y-5">
                                    <div><div className="text-xs font-semibold text-slate-500 mb-2">供应商</div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{PROVIDERS.map(p => (
                                            <button key={p.id} onClick={() => editingConfig && setEditingConfig({ ...editingConfig, provider: p.id, model_name: p.models[0] || '' })}
                                                className={`p-3 rounded-lg border text-left transition-colors text-xs ${cc.provider === p.id ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'} ${!editingConfig ? 'cursor-default' : ''}`}>
                                                <div className="font-semibold" style={{ color: p.color }}>{p.name}</div>
                                            </button>
                                        ))}</div>
                                    </div>
                                    <div><div className="text-xs font-semibold text-slate-500 mb-2">模型</div>
                                        {cp.models.length > 0 ? <div className="flex gap-1.5 flex-wrap">{cp.models.map(m => (
                                            <button key={m} onClick={() => editingConfig && setEditingConfig({ ...editingConfig, model_name: m })}
                                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${cc.model_name === m ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} ${!editingConfig ? 'cursor-default' : ''}`}>{m}</button>
                                        ))}</div> : <input value={cc.model_name || ''} readOnly={!editingConfig} onChange={e => editingConfig && setEditingConfig({ ...editingConfig, model_name: e.target.value })} className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:outline-none focus:border-indigo-400" placeholder="模型名称" />}
                                    </div>
                                    <div><div className="text-xs font-semibold text-slate-500 mb-2">API Key</div>
                                        <div className="flex gap-1.5"><input type={showApiKey ? 'text' : 'password'} value={cc.api_key || ''} readOnly={!editingConfig} onChange={e => editingConfig && setEditingConfig({ ...editingConfig, api_key: e.target.value })} className="flex-1 px-3 py-2 rounded-md border border-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-400" placeholder="sk-..." /><button onClick={() => setShowApiKey(!showApiKey)} className="px-2 rounded-md bg-slate-100 text-xs"><Icons.Eye size={14} /></button></div>
                                    </div>
                                    {cc.provider === 'custom' && <div><div className="text-xs font-semibold text-slate-500 mb-2">Base URL</div><input value={cc.base_url || ''} readOnly={!editingConfig} onChange={e => editingConfig && setEditingConfig({ ...editingConfig, base_url: e.target.value })} className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:outline-none focus:border-indigo-400" placeholder="https://api.example.com/v1" /></div>}
                                    <div><div className="text-xs font-semibold text-slate-500 mb-2">默认月配额</div><input type="number" value={cc.default_quota || 50} readOnly={!editingConfig} onChange={e => editingConfig && setEditingConfig({ ...editingConfig, default_quota: parseInt(e.target.value) || 50 })} className="w-24 px-3 py-2 rounded-md border border-slate-200 text-xs focus:outline-none focus:border-indigo-400" /></div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200/80">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                    <div className="text-sm font-semibold text-slate-800">用量统计</div>
                                    <ActionBtn onClick={() => apiFetch('/api/admin/ai-usage').then(r => safeJsonOr(r, [])).then(d => d && setAdminAiUsage(d))}><Icons.RefreshCw size={12} className="inline mr-0.5" />刷新</ActionBtn>
                                </div>
                                {/* Desktop AI table */}
                                <div className="hidden md:block overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500"><tr>
                                    <th className="text-left px-4 py-2.5 font-semibold">邮箱</th><th className="text-left px-4 py-2.5 font-semibold">用量</th><th className="text-left px-4 py-2.5 font-semibold">配额</th><th className="text-left px-4 py-2.5 font-semibold">剩余</th><th className="text-left px-4 py-2.5 font-semibold">操作</th>
                                </tr></thead><tbody className="divide-y divide-slate-100">
                                    {(adminAiUsage || []).map(u => (<tr key={u.id} className="hover:bg-slate-50/70">
                                        <td className="px-4 py-2.5 font-semibold text-sm text-slate-800">{u.email}</td>
                                        <td className="px-4 py-2.5 text-xs">{u.used_this_month}</td>
                                        <td className="px-4 py-2.5">{editingQuotaUserId === u.id ? <div className="flex gap-1 items-center"><input type="number" value={editingQuotaValue} onChange={e => setEditingQuotaValue(e.target.value)} className="w-16 px-2 py-1 rounded border border-indigo-300 text-xs" placeholder="默认" /><button onClick={() => updateUserQuota(u.id, editingQuotaValue)} className="text-emerald-600 text-xs font-bold">✓</button><button onClick={() => setEditingQuotaUserId(null)} className="text-slate-400 text-xs">✕</button></div> : <span className={`text-xs ${u.ai_quota !== null ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}>{u.quota}{u.ai_quota !== null && ' (自定义)'}</span>}</td>
                                        <td className={`px-4 py-2.5 text-xs font-semibold ${u.remaining <= 0 ? 'text-red-500' : u.remaining <= 10 ? 'text-amber-500' : 'text-emerald-600'}`}>{u.remaining}</td>
                                        <td className="px-4 py-2.5"><ActionBtn onClick={() => { setEditingQuotaUserId(u.id); setEditingQuotaValue(u.ai_quota !== null ? String(u.ai_quota) : ''); }}>调整</ActionBtn></td>
                                    </tr>))}
                                </tbody></table></div>
                                {/* Mobile AI cards */}
                                <div className="md:hidden divide-y divide-slate-100">
                                    {(adminAiUsage || []).map(u => (<div key={u.id} className="p-3">
                                        <div className="font-semibold text-sm text-slate-800 truncate mb-1">{u.email}</div>
                                        <div className="flex gap-3 text-xs text-slate-500 mb-2">
                                            <span>用量: {u.used_this_month}</span>
                                            <span>配额: {u.quota}</span>
                                            <span className={`font-semibold ${u.remaining <= 0 ? 'text-red-500' : 'text-emerald-600'}`}>剩余: {u.remaining}</span>
                                        </div>
                                        <ActionBtn onClick={() => { setEditingQuotaUserId(u.id); setEditingQuotaValue(u.ai_quota !== null ? String(u.ai_quota) : ''); }}>调整配额</ActionBtn>
                                    </div>))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ SETTINGS ═══ */}
                    {adminTab === 'settings' && (
                        <div className="space-y-4 animate-fade-in">
                            {/* Trial Days */}
                            <div className="bg-white rounded-xl border border-slate-200/80 p-5">
                                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 mb-4"><Icons.Clock size={15} /> 试用期配置</div>
                                <div className="flex items-center gap-3">
                                    <div>
                                        <div className="text-xs font-semibold text-slate-500 mb-1.5">新用户免费试用天数</div>
                                        <div className="flex items-center gap-2">
                                            <input type="number" min="1" max="365" value={editingTrialDays} onChange={e => setEditingTrialDays(e.target.value)} className="w-24 px-3 py-2 rounded-md border border-slate-200 text-sm font-bold focus:outline-none focus:border-indigo-400" />
                                            <span className="text-sm text-slate-500 font-semibold">天</span>
                                            <ActionBtn onClick={saveTrialDays} variant="primary">保存</ActionBtn>
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-1">修改后仅对新注册用户生效</div>
                                    </div>
                                </div>
                            </div>

                            {/* QR Codes */}
                            <div className="bg-white rounded-xl border border-slate-200/80 p-5">
                                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 mb-4"><Icons.Image size={15} /> 二维码管理</div>
                                <p className="text-xs text-slate-500 mb-4">二维码将显示在到期页面和「我的订阅体验」中，引导用户续费。</p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* WeChat QR */}
                                    <div className="border border-slate-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-1.5"><span>💬</span><span className="text-xs font-semibold text-slate-700">微信客服二维码</span></div>
                                            <ActionBtn onClick={() => handleQrUpload('wechat_qr')} variant={appSettings.wechat_qr ? 'default' : 'primary'} className={uploadingQr === 'wechat_qr' ? 'opacity-50 pointer-events-none' : ''}>
                                                {uploadingQr === 'wechat_qr' ? '上传中...' : appSettings.wechat_qr ? '更换' : '上传'}
                                            </ActionBtn>
                                        </div>
                                        {appSettings.wechat_qr ? (
                                            <div className="bg-slate-50 rounded-lg p-3 text-center">
                                                <img src={appSettings.wechat_qr} alt="微信客服" className="w-36 h-36 object-contain mx-auto rounded" />
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 rounded-lg p-6 text-center">
                                                <Icons.Image size={32} className="text-slate-300 mx-auto mb-2" />
                                                <div className="text-xs text-slate-400 font-semibold">暂未上传</div>
                                            </div>
                                        )}
                                    </div>
                                    {/* Xiaohongshu QR */}
                                    <div className="border border-slate-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-1.5"><span>📕</span><span className="text-xs font-semibold text-slate-700">小红书购买二维码</span></div>
                                            <ActionBtn onClick={() => handleQrUpload('xiaohongshu_qr')} variant={appSettings.xiaohongshu_qr ? 'default' : 'primary'} className={uploadingQr === 'xiaohongshu_qr' ? 'opacity-50 pointer-events-none' : ''}>
                                                {uploadingQr === 'xiaohongshu_qr' ? '上传中...' : appSettings.xiaohongshu_qr ? '更换' : '上传'}
                                            </ActionBtn>
                                        </div>
                                        {appSettings.xiaohongshu_qr ? (
                                            <div className="bg-slate-50 rounded-lg p-3 text-center">
                                                <img src={appSettings.xiaohongshu_qr} alt="小红书购买" className="w-36 h-36 object-contain mx-auto rounded" />
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 rounded-lg p-6 text-center">
                                                <Icons.Image size={32} className="text-slate-300 mx-auto mb-2" />
                                                <div className="text-xs text-slate-400 font-semibold">暂未上传</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Modals ─── */}
            {showSubModal && (<div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowSubModal(null)}><div className="bg-white rounded-xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5"><Icons.Calendar size={14} /> 调整订阅到期时间</h3>
                <input type="date" value={subDate} onChange={e => setSubDate(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm mb-3 focus:outline-none focus:border-indigo-400" />
                <div className="flex gap-1.5 mb-3">{[30,90,365].map(d => (<button key={d} onClick={() => { const dt = new Date(); dt.setDate(dt.getDate() + d); setSubDate(dt.toISOString().split('T')[0]); }} className="flex-1 px-2 py-1.5 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 transition-colors">+{d}天</button>))}</div>
                <div className="flex gap-2"><button onClick={() => setShowSubModal(null)} className="flex-1 py-2 rounded-md text-sm font-semibold bg-slate-100 hover:bg-slate-200 transition-colors">取消</button><button onClick={() => adjustSubscription(showSubModal)} className="flex-1 py-2 rounded-md text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">确认</button></div>
            </div></div>)}

            {showDeleteConfirm && (<div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(null)}><div className="bg-white rounded-xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="font-semibold text-sm mb-1 text-red-600 flex items-center gap-1.5"><Icons.AlertCircle size={14} /> 确认删除用户</h3>
                <p className="text-xs text-slate-500 mb-4">将永久删除该用户及所有关联数据，不可恢复。</p>
                <div className="flex gap-2"><button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2 rounded-md text-sm font-semibold bg-slate-100 hover:bg-slate-200">取消</button><button onClick={() => deleteUser(showDeleteConfirm)} className="flex-1 py-2 rounded-md text-sm font-semibold bg-red-500 text-white hover:bg-red-600">确认删除</button></div>
            </div></div>)}

            {tempPassword && (<div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setTempPassword(null)}><div className="bg-white rounded-xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5"><Icons.Key size={14} /> 密码已重置</h3>
                <p className="text-xs text-slate-500 mb-2">临时密码（请告知用户）:</p>
                <div className="bg-slate-100 rounded-md p-3 font-mono text-lg text-center font-bold text-indigo-700 select-all">{tempPassword}</div>
                <button onClick={() => { navigator.clipboard?.writeText(tempPassword); notify('已复制', 'success'); }} className="w-full mt-3 py-2 rounded-md text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">复制密码</button>
                <button onClick={() => setTempPassword(null)} className="w-full mt-1.5 py-1.5 rounded-md text-sm font-semibold bg-slate-100 hover:bg-slate-200">关闭</button>
            </div></div>)}

            {/* Toast */}
            <div className="fixed top-3 right-3 z-[9999] space-y-1.5">
                {notifications.map(n => (
                    <div key={n.id} className={`px-3 py-2 rounded-lg text-xs font-semibold ${n.type === 'error' ? 'bg-red-600 text-white' : n.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'}`}>{n.message}</div>
                ))}
            </div>
        </div>
    );
};
