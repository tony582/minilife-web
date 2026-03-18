import React from 'react';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useDataContext } from '../../context/DataContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { useToast } from '../../hooks/useToast';
import { Icons } from '../../utils/Icons';

export const AdminPage = () => {
    const { user, handleLogout } = useAuthContext();
    const { adminUsers, adminCodes, setAdminCodes } = useDataContext();
    const { adminTab, setAdminTab } = useUIContext();
    const { notifications } = useToast();

    // Since `generateCodes` is isolated, we need to import apiFetch or reconstruct it if needed, 
    // or just assume we should import `apiFetch` from context or api/client.
    // For now, I'll pull `apiFetch` from DataContext.
    const { apiFetch } = useDataContext();
    const { notify } = useToast();

    const generateCodes = async (days) => {
        try {
            const data = await apiFetch(`/api/admin/codes/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 5, duration_days: days })
            });
            setAdminCodes(prev => [...data.codes, ...prev]);
            notify(`成功生成5个${days}天激活码！`, 'success');
        } catch (e) {
            notify('生成失败', 'error');
        }
    };

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
                <button onClick={() => setAdminTab('users')} className={`py-4 font-black border-b-2 font-bold ${adminTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>用户管理 ({adminUsers.length})</button>
                <button onClick={() => setAdminTab('codes')} className={`py-4 font-black border-b-2 font-bold ${adminTab === 'codes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>激活码管理 ({adminCodes.length})</button>
            </div>

            {/* Admin Content */}
            <div className="p-8 flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto space-y-6">

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

                    {adminTab === 'codes' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h2 className="text-xl font-black flex items-center gap-2 text-slate-800"><Icons.Tag size={20} className="text-rose-500" /> 发行激活码</h2>
                                </div>
                                <div className="p-6 flex gap-4">
                                    <button onClick={() => generateCodes(30)} className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl font-black hover:bg-indigo-100 transition-colors border border-indigo-200 shadow-sm flex items-center gap-2">生成5个 (30天体验卡)</button>
                                    <button onClick={() => generateCodes(365)} className="bg-purple-50 text-purple-600 px-6 py-3 rounded-2xl font-black hover:bg-purple-100 transition-colors border border-purple-200 shadow-sm flex items-center gap-2">生成5个 (365天年卡)</button>
                                    <button onClick={() => generateCodes(9999)} className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl font-black hover:bg-emerald-100 transition-colors border border-emerald-200 shadow-sm flex items-center gap-2">生成5个 (永久买断版卡)</button>
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
                </div>
            </div>

            {/* Notifications overlay for admin */}
            <div className="fixed top-4 right-4 z-[200] space-y-2 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-xl shadow-xl flex items-center gap-3 animate-slide-in pointer-events-auto ${n.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {n.type === 'success' ? <Icons.CheckCircle size={24} /> : <Icons.AlertCircle size={24} />}
                        <span className="font-bold">{n.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
