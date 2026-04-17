import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../../utils/Icons';
import { apiFetch, safeJsonOr } from '../../api/client';

/* ───── Status Dot ───── */
const StatusDot = ({ ok }) => (
    <span className={`inline-block w-2.5 h-2.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-red-500'}`}
        style={{ boxShadow: ok ? '0 0 6px rgba(16,185,129,0.5)' : '0 0 6px rgba(239,68,68,0.5)' }} />
);

/* ───── Severity Badge ───── */
const SeverityBadge = ({ level }) => {
    const map = {
        error: 'bg-red-100 text-red-700 border-red-200',
        warning: 'bg-amber-100 text-amber-700 border-amber-200',
        info: 'bg-blue-100 text-blue-700 border-blue-200',
        frontend: 'bg-purple-100 text-purple-700 border-purple-200',
        backend: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${map[level] || map.info}`}>{level?.toUpperCase()}</span>;
};

export const MonitorTab = ({ notify }) => {
    const [health, setHealth] = useState(null);
    const [anomalies, setAnomalies] = useState(null);
    const [errors, setErrors] = useState([]);
    const [loadingHealth, setLoadingHealth] = useState(false);
    const [loadingAnomaly, setLoadingAnomaly] = useState(false);
    const [loadingErrors, setLoadingErrors] = useState(false);
    const [alertEmail, setAlertEmail] = useState('');
    const [autoCheckHour, setAutoCheckHour] = useState(9);

    // ── Health Check ──
    const fetchHealth = useCallback(async () => {
        setLoadingHealth(true);
        try {
            const res = await fetch('/api/monitor/health');
            const data = await res.json();
            setHealth(data);
        } catch (e) {
            setHealth({ status: 'unreachable', server: 'error', database: 'unknown' });
        }
        setLoadingHealth(false);
    }, []);

    // ── Anomaly Check ──
    const fetchAnomalies = useCallback(async () => {
        setLoadingAnomaly(true);
        try {
            const res = await apiFetch('/api/monitor/anomaly-check');
            const data = await safeJsonOr(res, { anomalies: [] });
            setAnomalies(data);
        } catch (e) {
            notify?.('异常检查失败: ' + e.message, 'error');
        }
        setLoadingAnomaly(false);
    }, []);

    // ── Error Logs ──
    const fetchErrors = useCallback(async () => {
        setLoadingErrors(true);
        try {
            const res = await apiFetch('/api/monitor/errors');
            const data = await safeJsonOr(res, []);
            setErrors(Array.isArray(data) ? data : []);
        } catch (e) {
            setErrors([]);
        }
        setLoadingErrors(false);
    }, []);

    useEffect(() => {
        fetchHealth();
        fetchAnomalies();
        fetchErrors();
    }, []);

    const uptimeStr = (s) => {
        if (!s) return '–';
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    return (
        <div className="space-y-5">
            {/* ════════ Health Check Panel ════════ */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Icons.Activity size={16} className="text-emerald-600" />
                        系统健康状态
                    </h3>
                    <button onClick={fetchHealth} disabled={loadingHealth}
                        className="px-3 py-1.5 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50">
                        {loadingHealth ? '检查中...' : '⟳ 刷新'}
                    </button>
                </div>
                {health ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                            <StatusDot ok={health.status === 'healthy'} />
                            <div>
                                <div className="text-[11px] text-slate-400 font-semibold">总体状态</div>
                                <div className={`text-sm font-bold ${health.status === 'healthy' ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {health.status === 'healthy' ? '✓ 健康' : '✗ 异常'}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                            <StatusDot ok={health.server === 'ok'} />
                            <div>
                                <div className="text-[11px] text-slate-400 font-semibold">服务器</div>
                                <div className="text-sm font-bold text-slate-700">{health.server === 'ok' ? '正常' : '异常'}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                            <StatusDot ok={health.database === 'ok'} />
                            <div>
                                <div className="text-[11px] text-slate-400 font-semibold">数据库</div>
                                <div className="text-sm font-bold text-slate-700">{health.database === 'ok' ? '正常' : '异常'}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                            <Icons.Clock size={14} className="text-indigo-500" />
                            <div>
                                <div className="text-[11px] text-slate-400 font-semibold">运行时间</div>
                                <div className="text-sm font-bold text-slate-700">{uptimeStr(health.uptime)}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-slate-400 text-center py-6">加载中...</div>
                )}
                {health?.timestamp && (
                    <div className="text-[10px] text-slate-400 mt-3 text-right">
                        最后检查: {new Date(health.timestamp).toLocaleString('zh-CN')}
                    </div>
                )}
            </div>

            {/* ════════ Anomaly Detection Panel ════════ */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Icons.ShieldAlert size={16} className="text-amber-600" />
                        业务异常检测
                    </h3>
                    <button onClick={fetchAnomalies} disabled={loadingAnomaly}
                        className="px-3 py-1.5 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50">
                        {loadingAnomaly ? '检测中...' : '⟳ 立即检测'}
                    </button>
                </div>
                {anomalies ? (
                    anomalies.healthy ? (
                        <div className="text-center py-8">
                            <div className="text-3xl mb-2">✅</div>
                            <div className="text-sm font-semibold text-emerald-600">一切正常，未发现异常</div>
                            <div className="text-[10px] text-slate-400 mt-1">
                                检查时间: {new Date(anomalies.checkedAt).toLocaleString('zh-CN')}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {anomalies.anomalies?.map((a, i) => (
                                <div key={i} className="border border-amber-200 bg-amber-50/50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-amber-800">⚠ {a.label}</span>
                                        {a.count && <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">{a.count} 条</span>}
                                    </div>
                                    {a.samples && (
                                        <div className="space-y-1">
                                            {a.samples.map((s, j) => (
                                                <div key={j} className="text-[11px] text-slate-600 font-mono bg-white/60 rounded px-2 py-1 truncate">
                                                    {JSON.stringify(s).substring(0, 120)}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {a.error && <div className="text-[11px] text-red-600">{a.error}</div>}
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="text-sm text-slate-400 text-center py-6">加载中...</div>
                )}
            </div>

            {/* ════════ Error Logs Panel ════════ */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Icons.ShieldAlert size={16} className="text-red-500" />
                        错误日志
                        {errors.length > 0 && (
                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded">
                                {errors.length}
                            </span>
                        )}
                    </h3>
                    <button onClick={fetchErrors} disabled={loadingErrors}
                        className="px-3 py-1.5 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50">
                        {loadingErrors ? '加载中...' : '⟳ 刷新'}
                    </button>
                </div>
                {errors.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-3xl mb-2">🎉</div>
                        <div className="text-sm font-semibold text-slate-500">暂无错误记录</div>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {errors.map((err, i) => (
                            <div key={err.id || i} className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                    <SeverityBadge level={err.source} />
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        {err.createdAt ? new Date(err.createdAt).toLocaleString('zh-CN') : ''}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">{err.id}</span>
                                </div>
                                <div className="text-xs font-semibold text-slate-800 break-all">{err.message}</div>
                                {err.url && <div className="text-[10px] text-slate-400 mt-1 truncate">URL: {err.url}</div>}
                                {err.stack && (
                                    <details className="mt-1.5">
                                        <summary className="text-[10px] text-indigo-500 cursor-pointer font-semibold">查看堆栈</summary>
                                        <pre className="text-[10px] text-slate-500 mt-1 p-2 bg-slate-50 rounded overflow-auto max-h-32 font-mono whitespace-pre-wrap">
                                            {err.stack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ════════ Monitoring Configuration ════════ */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                    <Icons.Settings size={16} className="text-slate-500" />
                    监控配置
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[11px] font-semibold text-slate-500 mb-1 block">告警邮箱</label>
                        <div className="text-xs text-slate-400 mb-1.5">错误和异常时发送通知到此邮箱</div>
                        <div className="flex gap-2">
                            <input value={alertEmail} onChange={e => setAlertEmail(e.target.value)}
                                placeholder="使用 .env ALERT_EMAIL 配置"
                                className="flex-1 px-3 py-2 text-xs rounded-md border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] font-semibold text-slate-500 mb-1 block">每日自动巡检</label>
                        <div className="text-xs text-slate-400 mb-1.5">每天自动运行异常检测并发送报告</div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-600">每天</span>
                            <input type="number" min={0} max={23} value={autoCheckHour}
                                onChange={e => setAutoCheckHour(parseInt(e.target.value) || 9)}
                                className="w-16 px-2 py-1.5 text-xs rounded-md border border-slate-200 bg-slate-50 text-center" />
                            <span className="text-xs text-slate-600">点执行</span>
                            <StatusDot ok={true} />
                            <span className="text-[10px] text-emerald-600 font-semibold">已启用</span>
                        </div>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                    <div className="text-[11px] font-semibold text-indigo-700 mb-1">💡 UptimeRobot 配置</div>
                    <div className="text-[11px] text-indigo-600">
                        在 <a href="https://uptimerobot.com" target="_blank" rel="noopener" className="underline font-semibold">UptimeRobot</a> 中添加 HTTP(s) 监控，URL 填：
                    </div>
                    <code className="text-[11px] bg-white px-2 py-1 rounded border border-indigo-200 mt-1 block font-mono text-indigo-800 select-all">
                        {window.location.origin}/api/monitor/health
                    </code>
                </div>
            </div>
        </div>
    );
};
