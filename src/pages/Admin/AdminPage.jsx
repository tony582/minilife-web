import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useDataContext } from '../../context/DataContext.jsx';
import { useToast } from '../../hooks/useToast';
import { Icons } from '../../utils/Icons';
import { apiFetch } from '../../api/client';

const PROVIDERS = [
    { id: 'gemini', name: 'Google Gemini', color: '#4285F4', icon: '✨', models: ['gemini-2.0-flash', 'gemini-2.0-pro', 'gemini-1.5-flash'] },
    { id: 'deepseek', name: 'DeepSeek', color: '#5B6EF5', icon: '🔮', models: ['deepseek-chat', 'deepseek-reasoner'] },
    { id: 'qwen', name: '通义千问', color: '#FF6A00', icon: '🤖', models: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-vl-plus', 'qwen-vl-max'] },
    { id: 'custom', name: '自定义 (OpenAI兼容)', color: '#10B981', icon: '⚙️', models: [] },
];

export const AdminPage = () => {
    const { user, handleLogout } = useAuthContext();
    const { adminUsers, adminCodes, setAdminCodes, adminTab, setAdminTab, adminAiConfig, setAdminAiConfig, adminAiUsage, setAdminAiUsage } = useDataContext();
    const { notifications, notify } = useToast();

    // Local state for AI config editing
    const [editingConfig, setEditingConfig] = useState(null);
    const [showApiKey, setShowApiKey] = useState(false);
    const [editingQuotaUserId, setEditingQuotaUserId] = useState(null);
    const [editingQuotaValue, setEditingQuotaValue] = useState('');

    const generateCodes = async (days) => {
        try {
            const res = await apiFetch(`/api/admin/codes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 5, duration_days: days })
            });
            const data = await res.json();
            setAdminCodes(prev => [...(data.codes || []).map(c => ({ code: c, duration_days: days, status: 'active' })), ...prev]);
            notify(`成功生成5个${days}天激活码！`, 'success');
        } catch (e) {
            notify('生成失败', 'error');
        }
    };

    const saveAiConfig = async () => {
        if (!editingConfig) return;
        try {
            const res = await apiFetch('/api/admin/ai-config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingConfig)
            });
            if (!res.ok) throw new Error('保存失败');
            setAdminAiConfig(editingConfig);
            setEditingConfig(null);
            notify('AI 配置已保存', 'success');
            // Refresh usage data
            apiFetch('/api/admin/ai-usage').then(r => r.json()).then(setAdminAiUsage).catch(() => {});
        } catch (e) {
            notify('保存失败', 'error');
        }
    };

    const updateUserQuota = async (userId, quota) => {
        try {
            await apiFetch(`/api/admin/users/${userId}/ai-quota`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quota: quota === '' || quota === null ? null : parseInt(quota) })
            });
            setAdminAiUsage(prev => prev.map(u => u.id === userId ? {
                ...u,
                ai_quota: quota === '' || quota === null ? null : parseInt(quota),
                quota: quota === '' || quota === null ? (adminAiConfig?.default_quota || 50) : parseInt(quota),
                remaining: (quota === '' || quota === null ? (adminAiConfig?.default_quota || 50) : parseInt(quota)) - u.used_this_month
            } : u));
            setEditingQuotaUserId(null);
            notify('配额已更新', 'success');
        } catch (e) {
            notify('更新失败', 'error');
        }
    };

    const currentConfig = editingConfig || adminAiConfig || {};
    const currentProvider = PROVIDERS.find(p => p.id === currentConfig.provider) || PROVIDERS[0];

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
            <div className="bg-white border-b border-slate-200 px-8 flex gap-8">
                <button onClick={() => setAdminTab('users')} className={`py-4 font-black border-b-2 ${adminTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>👥 用户管理 ({adminUsers.length})</button>
                <button onClick={() => setAdminTab('codes')} className={`py-4 font-black border-b-2 ${adminTab === 'codes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>🏷️ 激活码管理 ({adminCodes.length})</button>
                <button onClick={() => setAdminTab('ai')} className={`py-4 font-black border-b-2 ${adminTab === 'ai' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>🤖 AI 管理</button>
            </div>

            {/* Admin Content */}
            <div className="p-8 flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* ═══ USERS TAB ═══ */}
                    {adminTab === 'users' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="text-xl font-black flex items-center gap-2 text-slate-800"><Icons.Users size={20} className="text-indigo-500" /> 注册用户列表</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4 font-bold uppercase">ID</th>
                                            <th className="px-6 py-4 font-bold uppercase">Email</th>
                                            <th className="px-6 py-4 font-bold uppercase">角色</th>
                                            <th className="px-6 py-4 font-bold uppercase">注册时间</th>
                                            <th className="px-6 py-4 font-bold uppercase">订阅到期时间</th>
                                            <th className="px-6 py-4 font-bold uppercase">状态</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {adminUsers.map(u => {
                                            const isExpired = new Date(u.sub_end_date) < new Date() && u.role !== 'admin';
                                            return (
                                                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{u.id}</td>
                                                    <td className="px-6 py-4 font-bold text-slate-800">{u.email}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">{new Date(u.created_at).toLocaleString()}</td>
                                                    <td className={`px-6 py-4 font-bold ${isExpired ? 'text-red-500' : 'text-emerald-600'}`}>{new Date(u.sub_end_date).toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        {isExpired ? <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded-md text-xs">已过期 (拦截)</span> :
                                                            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md text-xs">正常使用中</span>}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ═══ CODES TAB ═══ */}
                    {adminTab === 'codes' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h2 className="text-xl font-black flex items-center gap-2 text-slate-800"><Icons.Tag size={20} className="text-rose-500" /> 发行激活码</h2>
                                </div>
                                <div className="p-6 flex gap-4 flex-wrap">
                                    <button onClick={() => generateCodes(30)} className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl font-black hover:bg-indigo-100 transition-colors border border-indigo-200 shadow-sm">生成5个 (30天体验卡)</button>
                                    <button onClick={() => generateCodes(365)} className="bg-purple-50 text-purple-600 px-6 py-3 rounded-2xl font-black hover:bg-purple-100 transition-colors border border-purple-200 shadow-sm">生成5个 (365天年卡)</button>
                                    <button onClick={() => generateCodes(9999)} className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl font-black hover:bg-emerald-100 transition-colors border border-emerald-200 shadow-sm">生成5个 (永久买断版卡)</button>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <h2 className="text-xl font-black text-slate-800">激活码库存与核销记录</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                            <tr>
                                                <th className="px-6 py-4 font-bold uppercase">激活码 (Code)</th>
                                                <th className="px-6 py-4 font-bold uppercase">时长 (天)</th>
                                                <th className="px-6 py-4 font-bold uppercase">状态</th>
                                                <th className="px-6 py-4 font-bold uppercase">使用者 ID</th>
                                                <th className="px-6 py-4 font-bold uppercase">核销时间</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {adminCodes.map(c => (
                                                <tr key={c.code} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono font-black text-lg tracking-wider text-indigo-700">{c.code}</td>
                                                    <td className="px-6 py-4 font-bold text-slate-600">+{c.duration_days}</td>
                                                    <td className="px-6 py-4">
                                                        {c.status === 'active' ? <span className="text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg font-black text-xs border border-emerald-200 shadow-sm">全新待发放</span> :
                                                            <span className="text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg font-bold text-xs">已核销</span>}
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{c.used_by || '-'}</td>
                                                    <td className="px-6 py-4 text-slate-500">{c.used_at ? new Date(c.used_at).toLocaleString() : '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ AI TAB ═══ */}
                    {adminTab === 'ai' && (
                        <div className="space-y-6 animate-fade-in">

                            {/* AI Config Card */}
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
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
                                                <button
                                                    key={p.id}
                                                    disabled={!editingConfig}
                                                    onClick={() => setEditingConfig(prev => ({ ...prev, provider: p.id, model_name: p.models[0] || '', base_url: '' }))}
                                                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                                                        currentConfig.provider === p.id
                                                            ? 'border-indigo-400 bg-indigo-50 shadow-md'
                                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                                    } ${!editingConfig ? 'cursor-default' : 'cursor-pointer'}`}>
                                                    <div className="text-2xl mb-1">{p.icon}</div>
                                                    <div className="font-black text-sm text-slate-800">{p.name}</div>
                                                    {currentConfig.provider === p.id && (
                                                        <div className="text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full inline-block" style={{ background: p.color + '20', color: p.color }}>当前使用</div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* API Key + Model */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">API Key</label>
                                            <div className="relative">
                                                <input
                                                    type={showApiKey ? 'text' : 'password'}
                                                    value={editingConfig ? editingConfig.api_key : (currentConfig.api_key || '')}
                                                    onChange={e => editingConfig && setEditingConfig(prev => ({ ...prev, api_key: e.target.value }))}
                                                    disabled={!editingConfig}
                                                    placeholder="填写你的 API Key"
                                                    className="w-full rounded-xl px-4 py-3 outline-none font-mono text-sm border border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white transition-all disabled:opacity-60 pr-20"
                                                />
                                                <button onClick={() => setShowApiKey(!showApiKey)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-300 transition-colors">
                                                    {showApiKey ? '隐藏' : '显示'}
                                                </button>
                                            </div>
                                            {!currentConfig.api_key && !editingConfig && (
                                                <div className="text-[11px] font-bold mt-1.5 text-amber-600">⚠️ 未配置 Key，AI 功能将使用模拟数据</div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">模型</label>
                                            {currentProvider.models.length > 0 ? (
                                                <select
                                                    value={editingConfig ? editingConfig.model_name : (currentConfig.model_name || '')}
                                                    onChange={e => editingConfig && setEditingConfig(prev => ({ ...prev, model_name: e.target.value }))}
                                                    disabled={!editingConfig}
                                                    className="w-full rounded-xl px-4 py-3 outline-none font-bold text-sm border border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white transition-all disabled:opacity-60">
                                                    {currentProvider.models.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                            ) : (
                                                <input
                                                    value={editingConfig ? editingConfig.model_name : (currentConfig.model_name || '')}
                                                    onChange={e => editingConfig && setEditingConfig(prev => ({ ...prev, model_name: e.target.value }))}
                                                    disabled={!editingConfig}
                                                    placeholder="例如: gpt-4o-mini"
                                                    className="w-full rounded-xl px-4 py-3 outline-none font-bold text-sm border border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white transition-all disabled:opacity-60"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Base URL (for custom providers) */}
                                    {(currentConfig.provider === 'custom' || currentConfig.provider === 'deepseek' || currentConfig.provider === 'qwen') && (
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">API Base URL</label>
                                            <input
                                                value={editingConfig ? editingConfig.base_url : (currentConfig.base_url || '')}
                                                onChange={e => editingConfig && setEditingConfig(prev => ({ ...prev, base_url: e.target.value }))}
                                                disabled={!editingConfig}
                                                placeholder={currentConfig.provider === 'deepseek' ? 'https://api.deepseek.com/v1 (可留空使用默认)' : currentConfig.provider === 'qwen' ? 'https://dashscope.aliyuncs.com/compatible-mode/v1 (可留空使用默认)' : 'https://your-api-endpoint.com/v1'}
                                                className="w-full rounded-xl px-4 py-3 outline-none font-mono text-sm border border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white transition-all disabled:opacity-60"
                                            />
                                        </div>
                                    )}

                                    {/* Global Quota */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">全局默认配额 (次/月)</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                value={editingConfig ? editingConfig.default_quota : (currentConfig.default_quota || 50)}
                                                onChange={e => editingConfig && setEditingConfig(prev => ({ ...prev, default_quota: parseInt(e.target.value) || 0 }))}
                                                disabled={!editingConfig}
                                                className="w-32 rounded-xl px-4 py-3 outline-none font-black text-lg border border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white transition-all disabled:opacity-60 text-center"
                                            />
                                            <span className="text-sm font-bold text-slate-500">次/月/用户</span>
                                            <span className="text-xs text-slate-400 font-bold">（每次 AI 排课消耗 1 次配额）</span>
                                        </div>
                                    </div>

                                    {/* Status Summary */}
                                    {adminAiConfig && (
                                        <div className="rounded-2xl p-4 flex items-center gap-4 flex-wrap" style={{ background: currentConfig.api_key ? '#ECFDF5' : '#FEF3C7', border: currentConfig.api_key ? '1px solid #A7F3D0' : '1px solid #FDE68A' }}>
                                            <div className="text-2xl">{currentConfig.api_key ? '✅' : '⚠️'}</div>
                                            <div>
                                                <div className="font-black text-sm" style={{ color: currentConfig.api_key ? '#065F46' : '#92400E' }}>
                                                    {currentConfig.api_key ? `${currentProvider.name} 已配置` : '未配置 API Key'}
                                                </div>
                                                <div className="text-xs font-bold mt-0.5" style={{ color: currentConfig.api_key ? '#047857' : '#B45309' }}>
                                                    {currentConfig.api_key
                                                        ? `模型: ${currentConfig.model_name} · 配额: ${currentConfig.default_quota}次/月`
                                                        : '当前使用模拟数据，配置 Key 后即可启用真实 AI'}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* User AI Usage */}
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">📊 用户 AI 用量</h2>
                                        <div className="text-xs font-bold text-slate-500 mt-1">当月用量统计 · 可为单个用户设置自定义配额</div>
                                    </div>
                                    <button
                                        onClick={() => apiFetch('/api/admin/ai-usage').then(r => r.json()).then(setAdminAiUsage).then(() => notify('已刷新', 'success')).catch(() => {})}
                                        className="bg-white text-slate-600 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition-colors border border-slate-200 text-sm">
                                        🔄 刷新
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                            <tr>
                                                <th className="px-6 py-4 font-bold uppercase">用户</th>
                                                <th className="px-6 py-4 font-bold uppercase text-center">本月已用</th>
                                                <th className="px-6 py-4 font-bold uppercase text-center">配额</th>
                                                <th className="px-6 py-4 font-bold uppercase text-center">剩余</th>
                                                <th className="px-6 py-4 font-bold uppercase text-center">用量条</th>
                                                <th className="px-6 py-4 font-bold uppercase text-center">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {adminAiUsage.length === 0 && (
                                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">暂无用户数据</td></tr>
                                            )}
                                            {adminAiUsage.map(u => {
                                                const pct = u.quota > 0 ? Math.min(100, (u.used_this_month / u.quota) * 100) : 0;
                                                const barColor = pct >= 90 ? '#EF4444' : pct >= 60 ? '#F59E0B' : '#10B981';
                                                return (
                                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-800">{u.email}</div>
                                                            <div className="text-[10px] font-mono text-slate-400">{u.id}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-black text-lg text-slate-700">{u.used_this_month}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            {editingQuotaUserId === u.id ? (
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <input
                                                                        type="number"
                                                                        value={editingQuotaValue}
                                                                        onChange={e => setEditingQuotaValue(e.target.value)}
                                                                        className="w-16 rounded-lg px-2 py-1 text-center font-bold text-sm border border-indigo-300 outline-none"
                                                                        placeholder={String(adminAiConfig?.default_quota || 50)}
                                                                        autoFocus
                                                                    />
                                                                    <button onClick={() => updateUserQuota(u.id, editingQuotaValue)}
                                                                        className="text-emerald-600 font-bold text-xs px-2 py-1 bg-emerald-50 rounded-lg hover:bg-emerald-100">✓</button>
                                                                    <button onClick={() => { updateUserQuota(u.id, null); }}
                                                                        className="text-slate-400 font-bold text-[10px] px-2 py-1 bg-slate-50 rounded-lg hover:bg-slate-100">默认</button>
                                                                </div>
                                                            ) : (
                                                                <span className="font-bold text-slate-600">
                                                                    {u.quota}
                                                                    {u.ai_quota !== null && <span className="text-[10px] text-indigo-500 font-bold ml-1">(自定义)</span>}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`font-black text-lg ${u.remaining <= 0 ? 'text-red-500' : u.remaining <= 10 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                                                {u.remaining}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                                <div className="h-full rounded-full transition-all duration-500"
                                                                    style={{ width: `${pct}%`, background: barColor }} />
                                                            </div>
                                                            <div className="text-[10px] font-bold text-slate-400 mt-1 text-center">{Math.round(pct)}%</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <button
                                                                onClick={() => { setEditingQuotaUserId(u.id); setEditingQuotaValue(u.ai_quota !== null ? String(u.ai_quota) : ''); }}
                                                                className="text-indigo-600 font-bold text-xs px-3 py-1.5 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200">
                                                                调整配额
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Notifications overlay for admin */}
            <div className="fixed top-4 right-4 z-[200] space-y-2 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-xl shadow-xl flex items-center gap-3 animate-slide-in pointer-events-auto ${n.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : n.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {n.type === 'success' ? <Icons.CheckCircle size={24} /> : <Icons.AlertCircle size={24} />}
                        <span className="font-bold">{n.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
