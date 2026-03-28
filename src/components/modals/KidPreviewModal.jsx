import React, { useState, useEffect, useCallback } from 'react';
import { useSwipeBack } from '../../hooks/useSwipeBack';
import { Icons } from '../../utils/Icons';
import { renderHabitIcon } from '../../utils/habitIcons';
import { getPeriodProgress } from '../../utils/taskUtils';

export const KidPreviewModal = ({ context }) => {
    const {
        showPreviewModal, setShowPreviewModal,
        previewTask, setPreviewTask,
        activeKidId, setActiveKidId, appState, parentKidFilter,
        kids, tasks, selectedDate, formatDate,
        getTaskStatusOnDate, getCatHexColor,
        renderIcon, getIconForCategory,
        setPreviewImages, setPreviewImageIndex, setShowImagePreviewModal,
        setCurrentPreviewIndex,
        setRejectingTaskInfo, setShowRejectModal,
        handleApproveTask,
        setEditingTask, setPlanType, setPlanForm, setShowAddPlanModal,
        setDeleteConfirmTask,
        openQuickComplete, handleStartTask, handleAttemptSubmit,
        AvatarDisplay
    } = context;

    // Local state for kid selection override (parent multi-kid review)
    const [overrideKidId, setOverrideKidId] = useState(null);

    // Reset override when modal opens with new task
    useEffect(() => {
        setOverrideKidId(null);
    }, [previewTask?.id, showPreviewModal]);

    const closeModal = useCallback(() => { setShowPreviewModal(false); setPreviewTask(null); }, [setShowPreviewModal, setPreviewTask]);
    const { swipeRef, swipeHandlers } = useSwipeBack(closeModal, { enabled: showPreviewModal && !!previewTask });

    if (!showPreviewModal || !previewTask) return null;

    // Use live task data from tasks array so status updates after approval
    const liveTask = tasks?.find(t => t.id === previewTask.id) || previewTask;

    // P1: Resolve the correct kid context for the preview modal.
    let resolvedKidId = activeKidId;
    if (appState === 'parent_app') {
        if (overrideKidId) {
            // User explicitly selected a kid via the switcher
            resolvedKidId = overrideKidId;
        } else if (previewTask._previewKidId) {
            resolvedKidId = previewTask._previewKidId;
        } else if (parentKidFilter && parentKidFilter !== 'all') {
            resolvedKidId = parentKidFilter;
        } else if (previewTask.kidId === 'all' && kids.length > 0) {
            const pendingKid = kids.find(k => getTaskStatusOnDate(liveTask, selectedDate, k.id) === 'pending_approval');
            const progressKid = kids.find(k => getTaskStatusOnDate(liveTask, selectedDate, k.id) === 'in_progress');
            const completedKid = kids.find(k => getTaskStatusOnDate(liveTask, selectedDate, k.id) === 'completed');
            resolvedKidId = (pendingKid || progressKid || completedKid || kids[0]).id;
        } else if (previewTask.kidId && previewTask.kidId !== 'all') {
            resolvedKidId = previewTask.kidId;
        } else {
            resolvedKidId = kids.length > 0 ? kids[0].id : activeKidId;
        }
    }

    // For parent multi-kid tasks: compute per-kid statuses
    const isMultiKidParent = appState === 'parent_app' && previewTask.kidId === 'all' && kids.length > 1;
    const kidStatuses = isMultiKidParent ? kids.map(k => ({
        ...k,
        status: getTaskStatusOnDate(liveTask, selectedDate, k.id)
    })) : [];

    // Extract history specific to resolvedKidId
    let kidHistory = {};
    if (previewTask.kidId === 'all') {
        Object.entries(previewTask.history || {}).forEach(([date, dateObj]) => {
            if (dateObj[resolvedKidId]) {
                kidHistory[date] = dateObj[resolvedKidId];
            }
        });
    } else {
        kidHistory = previewTask.history || {};
    }

    const historyEntries = Object.entries(kidHistory).filter(([d, h]) => h?.status === 'completed').sort((a, b) => b[0].localeCompare(a[0]));
    const totalCompleted = historyEntries.length;
    const totalEarned = historyEntries.length * (previewTask.reward > 0 ? previewTask.reward : 0);

    // Calculate streak
    let currentStreak = 0;
    let checkDate = new Date();
    const todayStr = formatDate(checkDate);
    let activeCheckDate = new Date();

    if (kidHistory[todayStr]?.status === 'completed') {
        currentStreak++;
        activeCheckDate.setDate(activeCheckDate.getDate() - 1);
    } else {
        const yDate = new Date();
        yDate.setDate(yDate.getDate() - 1);
        if (kidHistory[formatDate(yDate)]?.status === 'completed') {
            currentStreak++;
            activeCheckDate = yDate;
            activeCheckDate.setDate(activeCheckDate.getDate() - 1);
        }
    }

    while (currentStreak > 0) {
        const dStr = formatDate(activeCheckDate);
        if (kidHistory[dStr]?.status === 'completed') {
            currentStreak++;
            activeCheckDate.setDate(activeCheckDate.getDate() - 1);
        } else {
            break;
        }
    }

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-6 animate-fade-in"
            style={{ background: 'rgba(27,46,75,0.3)', backdropFilter: 'blur(8px)' }}
            onClick={() => { setShowPreviewModal(false); setPreviewTask(null); }}>
            <div ref={swipeRef} {...swipeHandlers}
                className="w-full h-full md:h-auto md:max-h-[85vh] md:max-w-lg flex flex-col md:rounded-3xl overflow-hidden animate-bounce-in"
                style={{ background: '#FBF7F0' }}
                onClick={e => e.stopPropagation()}>

                {/* — Header — */}
                <div className="shrink-0 px-5 py-4 flex items-center justify-between"
                    style={{ background: '#FFFFFF', borderBottom: '1px solid #F0EBE1' }}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center shadow-sm ${previewTask.type === 'habit' && previewTask.habitColor ? `bg-gradient-to-br ${previewTask.habitColor}` : ''}`}
                            style={{ 
                                ...(previewTask.type !== 'habit' ? { background: (previewTask.catColor && !previewTask.catColor.includes('from-') ? previewTask.catColor : null) || getCatHexColor(previewTask.category || '计划任务') } : (!previewTask.habitColor ? { background: '#4ECDC418' } : {})),
                                color: previewTask.type === 'habit' ? (previewTask.habitColor ? '#fff' : '#4ECDC4') : '#fff'
                            }}>
                            {previewTask.type === 'habit'
                                ? renderHabitIcon(previewTask.iconEmoji, '⭐', 20)
                                : renderIcon(previewTask.iconName || getIconForCategory(previewTask.category), 20)
                            }
                        </div>
                        <div>
                            <h2 className="font-black text-base" style={{ color: '#1B2E4B' }}>{previewTask.title}</h2>
                            <div className="text-[11px] font-bold mt-0.5" style={{ color: '#9CAABE' }}>{previewTask.category || '计划任务'}</div>
                        </div>
                    </div>
                    <button onClick={() => { setShowPreviewModal(false); setPreviewTask(null); }}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                        style={{ background: '#F0EBE1', color: '#9CAABE' }}>
                        <Icons.X size={18} />
                    </button>
                </div>

                {/* — Scrollable Body — */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
                    {/* Multi-kid status bar (parent side, all-kids tasks only) */}
                    {isMultiKidParent && (
                        <div className="rounded-2xl p-3" style={{ background: '#fff', border: '1px solid #E8E0D4' }}>
                            <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#9CAABE' }}>👨‍👩‍👧‍👦 各孩子状态 · 点击切换</div>
                            <div className="flex flex-wrap gap-2">
                                {kidStatuses.map(k => {
                                    const isActive = k.id === resolvedKidId;
                                    const statusConfig = {
                                        'pending_approval': { label: '待审核', bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA' },
                                        'completed': { label: '已完成', bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
                                        'in_progress': { label: '进行中', bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
                                        'failed': { label: '被打回', bg: '#FFF0F0', color: '#EF4444', border: '#FECACA' },
                                        'todo': { label: '未完成', bg: '#F8FAFC', color: '#94A3B8', border: '#E2E8F0' },
                                    };
                                    const sc = statusConfig[k.status] || statusConfig['todo'];
                                    return (
                                        <button key={k.id} onClick={() => setOverrideKidId(k.id)}
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                                            style={{
                                                background: isActive ? sc.color : sc.bg,
                                                color: isActive ? '#fff' : sc.color,
                                                border: `2px solid ${isActive ? sc.color : sc.border}`,
                                                boxShadow: isActive ? `0 2px 8px ${sc.color}30` : 'none'
                                            }}>
                                            <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center text-[10px] shrink-0"
                                                style={{ background: isActive ? 'rgba(255,255,255,0.3)' : '#fff' }}>
                                                <AvatarDisplay avatar={k.avatar} />
                                            </div>
                                            {k.name}
                                            <span className="text-[9px] opacity-80">· {sc.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Review Mode Overlay for Parents */}
                    {(appState === 'parent_app' && getTaskStatusOnDate(liveTask, selectedDate, resolvedKidId) === 'pending_approval') ? (
                        <div className="w-full text-left space-y-4">
                            {(() => {
                                const hr = kidHistory[selectedDate] || {};
                                return (
                                    <div className="bg-white rounded-2xl p-5 shadow-sm space-y-6" style={{ border: '1px solid #E8E0D4' }}>
                                        {/* Who submitted */}
                                        {(() => {
                                            const kidInfo = kids.find(k => k.id === resolvedKidId);
                                            return kidInfo ? (
                                                <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid #F0EBE1' }}>
                                                    <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-lg ring-2 ring-orange-100" style={{ background: '#FFF7ED' }}>
                                                        <AvatarDisplay avatar={kidInfo.avatar} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black" style={{ color: '#1B2E4B' }}>{kidInfo.name} 提交了这项任务</div>
                                                        <div className="text-[10px] font-bold" style={{ color: '#9CAABE' }}>等待家长审核</div>
                                                    </div>
                                                </div>
                                            ) : null;
                                        })()}
                                        {/* Header */}
                                        <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid #F0EBE1' }}>
                                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">验收对比</div>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 font-bold text-[11px] border border-orange-100">
                                                <Icons.Star size={12} fill="currentColor" />
                                                奖励 {previewTask.reward} 金币
                                            </div>
                                        </div>

                                        {/* Time Comparison */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mb-1.5 uppercase">
                                                    <Icons.Target size={12} /> 计划时间
                                                </div>
                                                <div className="text-base font-black text-slate-700">{previewTask.timeStr || '--:--'}</div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-400 mb-1.5 uppercase">
                                                    <Icons.CheckCircle size={12} /> 实际提交
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-base font-black text-orange-600">{hr.timeSpent || hr.actualDuration || '已完成'}</span>
                                                    {hr.submittedAt && (
                                                        <span className="text-[10px] text-slate-400 font-medium">({new Date(hr.submittedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })})</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-px w-full bg-slate-50"></div>

                                        {/* Content Comparison */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase">🎯 任务要求</div>
                                                <div className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                    {previewTask.desc || previewTask.standards || '无附加说明'}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase">✍️ 学习备注</div>
                                                    <div className="text-[13px] text-slate-700 leading-relaxed">
                                                        {hr.note || <span className="text-slate-300 italic">无留言</span>}
                                                    </div>
                                                </div>
                                                {hr.attachments && hr.attachments.length > 0 && (
                                                    <div>
                                                        <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase">📸 完成证据</div>
                                                        <div className="flex flex-wrap gap-2 pt-1">
                                                            {hr.attachments.map((att, i) => {
                                                                const src = typeof att === 'string' ? att : (att.data || att.url || '');
                                                                const isVideo = (typeof att === 'string' && (att.endsWith('.mp4') || att.endsWith('.webm'))) || (att.type && att.type.startsWith('video/'));
                                                                return (
                                                                    <div key={i} onClick={(e) => { e.stopPropagation(); setPreviewImages(hr.attachments.map(a => typeof a === 'string' ? a : (a.data || a.url || ''))); setPreviewImageIndex(i); setShowImagePreviewModal(true); }} className="relative w-14 h-14 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md hover:scale-105 transition-all ring-1 ring-slate-200">
                                                                        {isVideo ? (
                                                                            <video src={src} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <img src={src} className="w-full h-full object-cover" alt="证据" />
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Audit Trail */}
                            {(() => {
                                const hr = kidHistory[selectedDate];
                                const log = hr?.auditLog;
                                if (!log || log.length === 0) return null;
                                const actionMap = {
                                    submitted: { label: '提交审核', color: '#3B82F6', icon: '📤' },
                                    rejected: { label: '被打回', color: '#EF4444', icon: '↩️' },
                                    approved: { label: '审核通过', color: '#22C55E', icon: '✅' },
                                };
                                return (
                                    <div className="rounded-2xl p-4" style={{ background: '#FAFAF8', border: '1px solid #F0EBE1' }}>
                                        <div className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#9CAABE' }}>📜 审核记录</div>
                                        <div className="space-y-0">
                                            {log.map((entry, i) => {
                                                const info = actionMap[entry.action] || { label: entry.action, color: '#9CAABE', icon: '•' };
                                                const time = new Date(entry.timestamp);
                                                return (
                                                    <div key={i} className="flex items-start gap-3 relative">
                                                        {i < log.length - 1 && <div className="absolute left-[9px] top-5 bottom-0 w-px" style={{ background: '#E8E0D4' }} />}
                                                        <div className="w-[19px] h-[19px] rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] z-10 border-2 border-white" style={{ background: info.color + '20', color: info.color }}>{info.icon}</div>
                                                        <div className="flex-1 pb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-black" style={{ color: info.color }}>{info.label}</span>
                                                                <span className="text-[10px] text-slate-400">{time.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })} {time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                            {entry.detail && <div className="text-[11px] text-slate-500 mt-0.5">{entry.detail}</div>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    ) : (
                        <>
                            {/* ═══ Rejection Feedback Banner (student-side) ═══ */}
                            {appState === 'kid_app' && getTaskStatusOnDate(liveTask, selectedDate, activeKidId) === 'failed' && (() => {
                                const hist = previewTask?.history || {};
                                const entry = previewTask?.kidId === 'all'
                                    ? hist[selectedDate]?.[activeKidId]
                                    : hist[selectedDate];
                                const feedback = entry?.rejectFeedback;
                                const auditLog = entry?.auditLog;
                                if (!feedback && (!auditLog || auditLog.length === 0)) return null;
                                return (
                                    <div className="rounded-2xl p-4 space-y-3" style={{ background: '#FFF5F5', border: '1.5px solid #FECACA' }}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm" style={{ background: '#FEE2E2' }}>↩️</div>
                                            <label className="text-xs font-black" style={{ color: '#DC2626' }}>任务被打回</label>
                                        </div>
                                        {feedback && (
                                            <div className="rounded-xl p-3" style={{ background: '#FFFFFF', border: '1px solid #FECACA' }}>
                                                <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#9CAABE' }}>家长反馈</div>
                                                <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap" style={{ color: '#DC2626' }}>
                                                    {feedback}
                                                </div>
                                            </div>
                                        )}
                                        {/* Show previous submission details if available */}
                                        {entry?.note && (
                                            <div className="rounded-xl p-3" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                                                <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#9CAABE' }}>你上次提交的备注</div>
                                                <div className="text-xs leading-relaxed" style={{ color: '#5A6E8A' }}>{entry.note}</div>
                                            </div>
                                        )}
                                        {/* Mini audit trail */}
                                        {auditLog && auditLog.length > 0 && (
                                            <div className="rounded-xl p-3" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                                                <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#9CAABE' }}>📜 审核记录</div>
                                                <div className="space-y-1.5">
                                                    {auditLog.map((log, i) => {
                                                        const actionMap = {
                                                            submitted: { label: '提交审核', color: '#3B82F6', icon: '📤' },
                                                            rejected: { label: '被打回', color: '#EF4444', icon: '↩️' },
                                                            approved: { label: '审核通过', color: '#22C55E', icon: '✅' },
                                                        };
                                                        const info = actionMap[log.action] || { label: log.action, color: '#9CAABE', icon: '•' };
                                                        const time = new Date(log.timestamp);
                                                        return (
                                                            <div key={i} className="flex items-center gap-2 text-[11px]">
                                                                <span>{info.icon}</span>
                                                                <span className="font-bold" style={{ color: info.color }}>{info.label}</span>
                                                                <span style={{ color: '#9CAABE' }}>{time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                                {log.detail && <span style={{ color: '#5A6E8A' }}>· {log.detail}</span>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* 任务说明 */}
                            {(previewTask.desc || previewTask.standards) && (
                                <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#9CAABE' }}>📋 任务说明</label>
                                    <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap" style={{ color: '#5A6E8A' }}>{previewTask.desc || previewTask.standards}</div>
                                </div>
                            )}

                            {/* 任务附件 */}
                            {previewTask.attachments && previewTask.attachments.length > 0 && (
                                <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#9CAABE' }}>📎 参考附件</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {previewTask.attachments.map((att, i) => {
                                            const src = typeof att === 'string' ? att : (att.data || att.url || '');
                                            return src ? (
                                                <img key={i} src={src} className="w-16 h-16 rounded-xl object-cover cursor-pointer hover:scale-105 transition-all"
                                                    style={{ border: '2px solid #FFE8D0' }}
                                                    onClick={() => { setPreviewImages(previewTask.attachments.map(a => typeof a === 'string' ? a : (a.data || a.url || ''))); setPreviewImageIndex(i); setShowImagePreviewModal(true); }} />
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* 周期进度 (period tasks only) */}
                            {(() => {
                                const ppModal = getPeriodProgress(previewTask, resolvedKidId, selectedDate);
                                if (!ppModal) return null;
                                const rc = previewTask.repeatConfig || {};
                                const daysTypeLabel = rc.periodDaysType === 'workdays' ? '工作日执行' : rc.periodDaysType === 'weekends' ? '周末执行' : rc.periodDaysType === 'custom' ? '指定日执行' : '每天可执行';
                                return (
                                    <div className="rounded-2xl p-4" style={{ background: ppModal.periodDone ? '#F0FDF4' : '#FFFFFF', border: `1px solid ${ppModal.periodDone ? '#BBF7D0' : '#F0EBE1'}` }}>
                                        <label className="text-[11px] font-bold uppercase tracking-wider block mb-3" style={{ color: '#9CAABE' }}>📊 {ppModal.periodLabel}进度</label>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-lg font-black" style={{ color: ppModal.periodDone ? '#059669' : '#FF8C42' }}>
                                                {ppModal.periodCompletions}/{ppModal.periodTarget}次
                                            </span>
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: ppModal.periodDone ? '#D1FAE5' : '#FFF7ED', color: ppModal.periodDone ? '#059669' : '#EA580C' }}>
                                                {ppModal.periodDone ? '✓ 已达标' : `还差${ppModal.periodTarget - ppModal.periodCompletions}次`}
                                            </span>
                                        </div>
                                        <div className="w-full h-3 rounded-full overflow-hidden mb-2" style={{ background: ppModal.periodDone ? '#A7F3D0' : '#FF8C4218' }}>
                                            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, ppModal.periodCompletions / ppModal.periodTarget * 100)}%`, background: ppModal.periodDone ? '#10B981' : '#FF8C42' }}></div>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] font-bold" style={{ color: '#9CAABE' }}>
                                            <span>今日已完成 {ppModal.todayCount}/{ppModal.dailyMax}次</span>
                                            <span>{daysTypeLabel}</span>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* 任务详情 */}
                            <div className="rounded-2xl p-4 space-y-3" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                                <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: '#9CAABE' }}>任务详情</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#E8F5E9' }}><Icons.RefreshCw size={14} className="text-emerald-600" /></div>
                                    <div>
                                        <div className="text-[10px] font-bold" style={{ color: '#9CAABE' }}>执行频次</div>
                                        <div className="text-sm font-black" style={{ color: '#1B2E4B' }}>{previewTask.frequency || '每天'}</div>
                                    </div>
                                </div>
                                {(previewTask.timeStr && previewTask.timeStr !== '--:--') && (
                                    <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid #F0EBE1' }}>
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#E3F2FD' }}><Icons.Clock size={14} className="text-blue-600" /></div>
                                        <div>
                                            <div className="text-[10px] font-bold" style={{ color: '#9CAABE' }}>时间要求</div>
                                            <div className="text-sm font-black" style={{ color: '#1B2E4B' }}>{previewTask.timeStr}</div>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid #F0EBE1' }}>
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FFF8E1' }}><Icons.Star size={14} className="text-yellow-600" fill="currentColor" /></div>
                                    <div>
                                        <div className="text-[10px] font-bold" style={{ color: '#9CAABE' }}>奖励</div>
                                        <div className="text-sm font-black" style={{ color: '#1B2E4B' }}>{previewTask.reward} 家庭币</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* 历史完成记录 */}
                    <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                        <label className="text-[11px] font-bold uppercase tracking-wider mb-3 block" style={{ color: '#9CAABE' }}>历史完成</label>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex flex-col items-center flex-1">
                                <span className="text-xl font-black" style={{ color: '#1B2E4B' }}>{totalCompleted}</span>
                                <span className="text-[10px] font-bold" style={{ color: '#9CAABE' }}>完成(次)</span>
                            </div>
                            <div className="w-px h-8" style={{ background: '#F0EBE1' }}></div>
                            <div className="flex flex-col items-center flex-1">
                                <span className="text-xl font-black text-emerald-500">{currentStreak}</span>
                                <span className="text-[10px] font-bold" style={{ color: '#9CAABE' }}>连续(天)</span>
                            </div>
                            <div className="w-px h-8" style={{ background: '#F0EBE1' }}></div>
                            <div className="flex flex-col items-center flex-1">
                                <span className="text-xl font-black" style={{ color: '#FF8C42' }}>{totalEarned}</span>
                                <span className="text-[10px] font-bold" style={{ color: '#9CAABE' }}>累计获得</span>
                            </div>
                        </div>

                        {historyEntries.length > 0 && (
                            <details className="group rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden" style={{ background: '#FBF7F0', border: '1px solid #F0EBE1' }}>
                                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer transition-colors list-none">
                                    <div className="flex items-center gap-2">
                                        <Icons.List size={14} style={{ color: '#9CAABE' }} />
                                        <span className="text-xs font-bold" style={{ color: '#5A6E8A' }}>展开历史打卡记录</span>
                                    </div>
                                    <Icons.ChevronDown size={14} className="group-open:-rotate-180 transition-transform duration-300" style={{ color: '#9CAABE' }} />
                                </summary>
                                <div className="p-0 flex flex-col max-h-48 overflow-y-auto" style={{ borderTop: '1px solid #F0EBE1' }}>
                                    {historyEntries.map(([date, record]) => (
                                        <div key={date} className="px-4 py-3" style={{ borderBottom: '1px solid #F0EBE1' }}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-sm" style={{ color: '#1B2E4B' }}>{date}</span>
                                                <span className="text-xs flex items-center gap-1" style={{ color: '#9CAABE' }}><Icons.Clock size={12} />{record.timeSpent || '瞬间完成'}</span>
                                            </div>
                                            {record.note && (
                                                <p className="text-xs p-2 rounded-lg mt-2" style={{ color: '#5A6E8A', background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                                                    <span className="font-bold">打卡备注：</span>{record.note}
                                                </p>
                                            )}
                                            {record.attachments && Array.isArray(record.attachments) && record.attachments.length > 0 ? (
                                                <div className="mt-3 flex overflow-x-auto gap-2 pb-1 hide-scrollbar">
                                                    {record.attachments.map((att, idx) => (
                                                        <div key={idx}
                                                            onClick={() => { setPreviewImages(record.attachments.map(a => typeof a === 'string' ? a : (a.data || a.url || ''))); setCurrentPreviewIndex(idx); setShowImagePreviewModal(true); }}
                                                            className="w-16 h-16 shrink-0 rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-all"
                                                            style={{ border: '1px solid #F0EBE1' }}>
                                                            <img src={att.data || att.url} alt="Evidence" className="w-full h-full object-cover" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                record.attachmentCount > 0 && (
                                                    <div className="mt-2 flex items-center gap-1 text-xs w-fit px-2 py-1 rounded" style={{ color: '#5A6E8A', background: '#FBF7F0' }}>
                                                        <Icons.Paperclip size={12} /> {record.attachmentCount} 个附件
                                                    </div>
                                                )
                                            )}

                                            {/* Audit Trail in History */}
                                            {record.auditLog && record.auditLog.length > 0 && (
                                                <div className="mt-3 pt-3" style={{ borderTop: '1px dashed #E8E0D4' }}>
                                                    <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#9CAABE' }}>审核记录</div>
                                                    <div className="space-y-0 pl-1">
                                                        {record.auditLog.map((entry, i) => {
                                                            const actionMap = {
                                                                submitted: { label: '提交审核', color: '#3B82F6', icon: '📤' },
                                                                rejected: { label: '被打回', color: '#EF4444', icon: '↩️' },
                                                                approved: { label: '审核通过', color: '#22C55E', icon: '✅' },
                                                            };
                                                            const info = actionMap[entry.action] || { label: entry.action, color: '#9CAABE', icon: '•' };
                                                            const time = new Date(entry.timestamp);
                                                            return (
                                                                <div key={i} className="flex items-start gap-2.5 relative">
                                                                    {i < record.auditLog.length - 1 && <div className="absolute left-[7px] top-4 bottom-[-4px] w-px" style={{ background: '#E8E0D4' }} />}
                                                                    <div className="w-[15px] h-[15px] rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[8px] z-10 border border-white" style={{ background: info.color + '20', color: info.color }}>{info.icon}</div>
                                                                    <div className="flex-1 pb-2">
                                                                        <div className="flex items-center gap-1.5 align-baseline">
                                                                            <span className="text-[11px] font-bold" style={{ color: info.color }}>{info.label}</span>
                                                                            <span className="text-[9px]" style={{ color: '#9CAABE' }}>{time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                                        </div>
                                                                        {entry.detail && <div className="text-[10px] mt-0.5" style={{ color: '#5A6E8A' }}>{entry.detail}</div>}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </details>
                        )}
                    </div>
                </div>

                {/* — Footer — */}
                <div className="shrink-0 px-5 py-4 flex gap-3" style={{ background: '#FFFFFF', borderTop: '1px solid #F0EBE1', paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))' }}>
                    {/* Kid Controls */}
                    {appState === 'kid_app' && (() => {
                        const pStatus = getTaskStatusOnDate(liveTask, selectedDate, activeKidId);
                        let hasSavedTimer = false;
                        try {
                            const saved = JSON.parse(localStorage.getItem('minilife_timer_state'));
                            if (saved && saved.taskId === previewTask.id && saved.running) hasSavedTimer = true;
                        } catch (e) {}
                        return (
                            <>
                                {(() => {
                                    // For period tasks: allow continuing even when today's status is 'completed'
                                    const ppFooter = getPeriodProgress(previewTask, activeKidId, selectedDate);

                                    // Option C: Period done but rejected → show re-submit button
                                    if (ppFooter?.periodDone && ppFooter?.periodFailed) {
                                        return (
                                            <>
                                                {(() => {
                                                    const hist = previewTask?.history || {};
                                                    const entry = previewTask?.kidId === 'all'
                                                        ? hist[selectedDate]?.[activeKidId]
                                                        : hist[selectedDate];
                                                    const feedback = entry?.rejectFeedback;
                                                    return feedback ? (
                                                        <div className="w-full mb-2 px-3 py-2 rounded-xl text-xs" style={{ background: '#FFF3E8', color: '#E65100', border: '1px solid #FFE0B2' }}>
                                                            <span className="font-bold">家长反馈：</span>{feedback}
                                                        </div>
                                                    ) : null;
                                                })()}
                                                <button onClick={() => { const t = previewTask; setShowPreviewModal(false); setPreviewTask(null); setTimeout(() => openQuickComplete(t), 50); }}
                                                    className="w-full py-3 rounded-xl text-sm font-black text-white transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                                    style={{ background: '#FF8C42', boxShadow: '0 4px 15px rgba(255,140,66,0.35)' }}>
                                                    <Icons.RefreshCw size={16} /> 重新提交审核
                                                </button>
                                            </>
                                        );
                                    }

                                    const canStillAct = ppFooter && !ppFooter.periodDone && !ppFooter.todayMaxed;
                                    const showActionBtns = pStatus === 'todo' || pStatus === 'failed' || (canStillAct && pStatus === 'completed');
                                    return (
                                        <>
                                        {showActionBtns && (
                                            <>
                                                {pStatus === 'failed' && (() => {
                                                    const hist = previewTask?.history || {};
                                                    const entry = previewTask?.kidId === 'all'
                                                        ? hist[selectedDate]?.[activeKidId]
                                                        : hist[selectedDate];
                                                    const feedback = entry?.rejectFeedback;
                                                    return feedback ? (
                                                        <div className="w-full mb-2 px-3 py-2 rounded-xl text-xs" style={{ background: '#FFF3E8', color: '#E65100', border: '1px solid #FFE0B2' }}>
                                                            <span className="font-bold">家长反馈：</span>{feedback}
                                                        </div>
                                                    ) : null;
                                                })()}
                                                <button onClick={() => { const t = previewTask; setShowPreviewModal(false); setPreviewTask(null); setTimeout(() => openQuickComplete(t), 50); }}
                                                    className="flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                                    style={{ background: '#F0EBE1', color: '#5A6E8A' }}>
                                                    <Icons.Check size={16} /> 快速打卡
                                                </button>
                                                <button onClick={() => { const tid = previewTask.id; setShowPreviewModal(false); setPreviewTask(null); setTimeout(() => handleStartTask(tid), 50); }}
                                                    className="flex-[2] py-3 rounded-xl text-sm font-black text-white transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                                    style={{ background: hasSavedTimer ? '#3B82F6' : '#FF8C42', boxShadow: hasSavedTimer ? '0 4px 15px rgba(59,130,246,0.3)' : '0 4px 15px rgba(255,140,66,0.35)' }}>
                                                    <Icons.Play size={16} fill="currentColor" /> {pStatus === 'failed' ? '重新计时' : (hasSavedTimer ? '继续计时' : '开始计时')}
                                                </button>
                                            </>
                                        )}
                                        {!showActionBtns && pStatus === 'in_progress' && (
                                            <>
                                                {hasSavedTimer && (
                                                    <button onClick={() => { setShowPreviewModal(false); setPreviewTask(null); handleStartTask(previewTask.id); }}
                                                        className="flex-1 py-3 rounded-xl text-sm font-black text-white transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                                        style={{ background: '#3B82F6', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}>
                                                        <Icons.Play size={16} fill="currentColor" /> 继续计时
                                                    </button>
                                                )}
                                                <button onClick={() => { setShowPreviewModal(false); setPreviewTask(null); handleAttemptSubmit(previewTask); }}
                                                    className={`${hasSavedTimer ? 'flex-1' : 'w-full'} py-3 rounded-xl text-sm font-black transition-all active:scale-95 flex items-center justify-center gap-1.5`}
                                                    style={{ background: '#E8EAF6', color: '#3F51B5' }}>
                                                    <Icons.CheckSquare size={16} /> 提交验收
                                                </button>
                                            </>
                                        )}
                                        {!showActionBtns && pStatus === 'pending_approval' && (
                                            <div className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 cursor-not-allowed"
                                                style={{ background: '#FFF3E8', color: '#FF8C42', border: '1px solid #FFE8D0' }}>
                                                <Icons.Clock size={16} /> 待家长审核发放奖励...
                                            </div>
                                        )}
                                        {!showActionBtns && pStatus === 'completed' && (
                                            ppFooter && ppFooter.todayMaxed && !ppFooter.periodDone ? (
                                                <div className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 cursor-not-allowed"
                                                    style={{ background: '#F3F4F6', color: '#9CA3AF', border: '1px solid #E5E7EB' }}>
                                                    <Icons.Clock size={16} /> 今日已达上限，明天继续
                                                </div>
                                            ) : (
                                                <div className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 cursor-not-allowed"
                                                    style={{ background: '#E8F5E9', color: '#4CAF50', border: '1px solid #C8E6C9' }}>
                                                    <Icons.CheckCircle size={16} /> 此任务已完成
                                                </div>
                                            )
                                        )}
                                        </>
                                    );
                                })()}
                            </>
                        );
                    })()}

                    {/* Parent Controls */}
                    {appState === 'parent_app' && (() => {
                        const currentKidStatus = getTaskStatusOnDate(liveTask, selectedDate, resolvedKidId);
                        const currentKidInfo = kids.find(k => k.id === resolvedKidId);
                        return (
                            <>
                                {currentKidStatus === 'pending_approval' ? (
                                    <>
                                        <button onClick={() => { setRejectingTaskInfo({ task: previewTask, dateStr: selectedDate, kidId: resolvedKidId }); setShowRejectModal(true); }}
                                            className="flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                            style={{ background: '#FFF0F0', color: '#EF4444', border: '1px solid #FECACA' }}>
                                            <Icons.X size={16} strokeWidth={3} /> 打回
                                        </button>
                                        <button onClick={async () => {
                                            await handleApproveTask(previewTask, selectedDate, resolvedKidId);
                                            if (!isMultiKidParent) { setShowPreviewModal(false); setPreviewTask(null); }
                                        }}
                                            className="flex-[2] py-3 rounded-xl text-sm font-black text-white transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                            style={{ background: '#4ECDC4', boxShadow: '0 4px 15px rgba(78,205,196,0.35)' }}>
                                            <Icons.Check size={16} strokeWidth={3} /> 确认通过{isMultiKidParent && currentKidInfo ? ` (${currentKidInfo.name})` : ''}
                                        </button>
                                    </>
                                ) : (() => {
                                    const ppParent = getPeriodProgress(previewTask, resolvedKidId, selectedDate);
                                    const canParentComplete = currentKidStatus === 'todo' || currentKidStatus === 'failed'
                                        || (ppParent && !ppParent.periodDone && !ppParent.todayMaxed && currentKidStatus === 'completed');
                                    return canParentComplete;
                                })() ? (
                                    <>
                                        <button onClick={() => {
                                            const t = { ...previewTask, requireApproval: false };
                                            setActiveKidId(resolvedKidId);
                                            setShowPreviewModal(false);
                                            setPreviewTask(null);
                                            setTimeout(() => openQuickComplete(t), 50);
                                        }}
                                            className="flex-[2] py-3 rounded-xl text-sm font-black text-white transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                            style={{ background: '#4ECDC4', boxShadow: '0 4px 15px rgba(78,205,196,0.35)' }}>
                                            <Icons.Check size={16} strokeWidth={3} /> 帮{currentKidInfo?.name || '孩子'}完成
                                        </button>
                                        <button onClick={() => {
                                            const t = previewTask;
                                            setShowPreviewModal(false);
                                            setPreviewTask(null);
                                            setTimeout(() => {
                                                setEditingTask(t);
                                                setPlanType(t.type || 'study');
                                                setPlanForm({
                                                    targetKids: [t.kidId || 'all'],
                                                    category: t.category || '技能',
                                                    iconName: t.iconName || '',
                                                    title: t.title,
                                                    desc: t.standards || t.desc || '',
                                                    startDate: t.startDate || new Date().toISOString().split('T')[0],
                                                    endDate: t.repeatConfig?.endDate || '',
                                                    repeatType: t.repeatConfig?.type || (t.frequency === '仅当天' ? 'today' : (t.frequency === '每周一至周五' ? 'weekly_custom' : 'daily')),
                                                    weeklyDays: t.repeatConfig?.weeklyDays || [1, 2, 3, 4, 5],
                                                    ebbStrength: t.repeatConfig?.ebbStrength || 'normal',
                                                    periodDaysType: t.repeatConfig?.periodDaysType || 'any',
                                                    periodCustomDays: t.repeatConfig?.periodCustomDays || [1, 2, 3, 4, 5],
                                                    periodTargetCount: t.repeatConfig?.periodTargetCount || 1,
                                                    periodMaxPerDay: t.repeatConfig?.periodMaxPerDay || 1,
                                                    timeSetting: t.timeStr && String(t.timeStr) !== '--:--' ? (String(t.timeStr).includes('-') ? 'range' : 'duration') : 'none',
                                                    startTime: t.timeStr && String(t.timeStr).includes('-') ? String(t.timeStr).split('-')[0] : '',
                                                    endTime: t.timeStr && String(t.timeStr).includes('-') ? String(t.timeStr).split('-')[1] : '',
                                                    durationPreset: t.timeStr && String(t.timeStr).includes('分钟') ? parseInt(String(t.timeStr)) : 25,
                                                    pointRule: (t.pointRule && t.pointRule === 'custom') || (t.type === 'habit') ? 'custom' : 'default',
                                                    reward: String(t.reward ?? ''),
                                                    iconEmoji: t.iconEmoji || '📚',
                                                    habitColor: t.catColor || 'from-blue-400 to-blue-500',
                                                    habitType: t.habitType || 'daily_once',
                                                    attachments: t.attachments || [],
                                                    requireApproval: t.requireApproval !== undefined ? t.requireApproval : true
                                                });
                                                setShowAddPlanModal(true);
                                            }, 50);
                                        }} className="flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                            style={{ background: '#E3F2FD', color: '#2196F3' }}>
                                            <Icons.Edit3 size={14} /> 编辑
                                        </button>
                                        <button onClick={() => { setShowPreviewModal(false); setPreviewTask(null); setDeleteConfirmTask(previewTask); }}
                                            className="py-3 px-4 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                            style={{ background: '#FFF0F0', color: '#EF4444' }}>
                                            <Icons.Trash2 size={14} /> 删除
                                        </button>
                                    </>
                                ) : currentKidStatus === 'completed' ? (
                                    <>
                                        <button onClick={() => {
                                            const t = previewTask;
                                            setShowPreviewModal(false);
                                            setPreviewTask(null);
                                            setTimeout(() => {
                                                setEditingTask(t);
                                                setPlanType(t.type || 'study');
                                                setPlanForm({
                                                    targetKids: [t.kidId || 'all'],
                                                    category: t.category || '技能',
                                                    iconName: t.iconName || '',
                                                    title: t.title,
                                                    desc: t.standards || t.desc || '',
                                                    startDate: t.startDate || new Date().toISOString().split('T')[0],
                                                    endDate: t.repeatConfig?.endDate || '',
                                                    repeatType: t.repeatConfig?.type || (t.frequency === '仅当天' ? 'today' : (t.frequency === '每周一至周五' ? 'weekly_custom' : 'daily')),
                                                    weeklyDays: t.repeatConfig?.weeklyDays || [1, 2, 3, 4, 5],
                                                    ebbStrength: t.repeatConfig?.ebbStrength || 'normal',
                                                    periodDaysType: t.repeatConfig?.periodDaysType || 'any',
                                                    periodCustomDays: t.repeatConfig?.periodCustomDays || [1, 2, 3, 4, 5],
                                                    periodTargetCount: t.repeatConfig?.periodTargetCount || 1,
                                                    periodMaxPerDay: t.repeatConfig?.periodMaxPerDay || 1,
                                                    timeSetting: t.timeStr && String(t.timeStr) !== '--:--' ? (String(t.timeStr).includes('-') ? 'range' : 'duration') : 'none',
                                                    startTime: t.timeStr && String(t.timeStr).includes('-') ? String(t.timeStr).split('-')[0] : '',
                                                    endTime: t.timeStr && String(t.timeStr).includes('-') ? String(t.timeStr).split('-')[1] : '',
                                                    durationPreset: t.timeStr && String(t.timeStr).includes('分钟') ? parseInt(String(t.timeStr)) : 25,
                                                    pointRule: (t.pointRule && t.pointRule === 'custom') || (t.type === 'habit') ? 'custom' : 'default',
                                                    reward: String(t.reward ?? ''),
                                                    iconEmoji: t.iconEmoji || '📚',
                                                    habitColor: t.catColor || 'from-blue-400 to-blue-500',
                                                    habitType: t.habitType || 'daily_once',
                                                    attachments: t.attachments || [],
                                                    requireApproval: t.requireApproval !== undefined ? t.requireApproval : true
                                                });
                                                setShowAddPlanModal(true);
                                            }, 50);
                                        }} className="flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                            style={{ background: '#E3F2FD', color: '#2196F3' }}>
                                            <Icons.Edit3 size={14} /> 编辑
                                        </button>
                                        <button onClick={() => { setShowPreviewModal(false); setDeleteConfirmTask(previewTask); }}
                                            className="flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                            style={{ background: '#FFF0F0', color: '#EF4444' }}>
                                            <Icons.Trash2 size={14} /> 删除
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => {
                                            const t = previewTask;
                                            setShowPreviewModal(false);
                                            setPreviewTask(null);
                                            setTimeout(() => {
                                                setEditingTask(t);
                                                setPlanType(t.type || 'study');
                                                setPlanForm({
                                                    targetKids: [t.kidId || 'all'],
                                                    category: t.category || '技能',
                                                    iconName: t.iconName || '',
                                                    title: t.title,
                                                    desc: t.standards || t.desc || '',
                                                    startDate: t.startDate || new Date().toISOString().split('T')[0],
                                                    endDate: t.repeatConfig?.endDate || '',
                                                    repeatType: t.repeatConfig?.type || (t.frequency === '仅当天' ? 'today' : (t.frequency === '每周一至周五' ? 'weekly_custom' : 'daily')),
                                                    weeklyDays: t.repeatConfig?.weeklyDays || [1, 2, 3, 4, 5],
                                                    ebbStrength: t.repeatConfig?.ebbStrength || 'normal',
                                                    periodDaysType: t.repeatConfig?.periodDaysType || 'any',
                                                    periodCustomDays: t.repeatConfig?.periodCustomDays || [1, 2, 3, 4, 5],
                                                    periodTargetCount: t.repeatConfig?.periodTargetCount || 1,
                                                    periodMaxPerDay: t.repeatConfig?.periodMaxPerDay || 1,
                                                    timeSetting: t.timeStr && String(t.timeStr) !== '--:--' ? (String(t.timeStr).includes('-') ? 'range' : 'duration') : 'none',
                                                    startTime: t.timeStr && String(t.timeStr).includes('-') ? String(t.timeStr).split('-')[0] : '',
                                                    endTime: t.timeStr && String(t.timeStr).includes('-') ? String(t.timeStr).split('-')[1] : '',
                                                    durationPreset: t.timeStr && String(t.timeStr).includes('分钟') ? parseInt(String(t.timeStr)) : 25,
                                                    pointRule: (t.pointRule && t.pointRule === 'custom') || (t.type === 'habit') ? 'custom' : 'default',
                                                    reward: String(t.reward ?? ''),
                                                    iconEmoji: t.iconEmoji || '📚',
                                                    habitColor: t.catColor || 'from-blue-400 to-blue-500',
                                                    habitType: t.habitType || 'daily_once',
                                                    attachments: t.attachments || [],
                                                    requireApproval: t.requireApproval !== undefined ? t.requireApproval : true
                                                });
                                                setShowAddPlanModal(true);
                                            }, 50);
                                        }} className="flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                            style={{ background: '#E3F2FD', color: '#2196F3' }}>
                                            <Icons.Edit3 size={14} /> 编辑
                                        </button>
                                        <button onClick={() => { setShowPreviewModal(false); setDeleteConfirmTask(previewTask); }}
                                            className="flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                            style={{ background: '#FFF0F0', color: '#EF4444' }}>
                                            <Icons.Trash2 size={14} /> 删除
                                        </button>
                                    </>
                                )}
                            </>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};
