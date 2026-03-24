import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useDataContext } from '../../context/DataContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { useToast } from '../../hooks/useToast';
import { useTaskManager } from '../../hooks/useTaskManager';
import { useShopManager } from '../../hooks/useShopManager';
import { Icons, AvatarDisplay, renderIcon } from '../../utils/Icons';
import { getLevelReq, getLevelTier } from '../../utils/levelUtils';
import { isSameDay, getDaysInMonth, formatDate } from '../../utils/dateUtils';
import { getCategoryGradient, getCategoryColor, getIconForCategory, allCategories, getCatHexColor } from '../../utils/categoryUtils';
import { apiFetch } from '../../api/client';
import AiPlanCreator from './AiPlanCreator';


export const GlobalModals = () => {
    const authC = useAuthContext();
    const dataC = useDataContext();
    const uiC = useUIContext();
    const toastC = useToast();
    const taskM = useTaskManager(authC, dataC, uiC);
    const shopM = useShopManager(authC, dataC, uiC);
    const context = { ...authC, ...dataC, ...uiC, ...taskM, ...shopM, ...toastC };
    const {
        activeKidId, setActiveKidId, kidTab, setKidTab, kidShopTab, setKidShopTab, parentTab, setParentTab, parentKidFilter, setParentKidFilter, currentViewDate, setCurrentViewDate, selectedDate, setSelectedDate, monthViewDate, setMonthViewDate, showParentSettingsDropdown, setShowParentSettingsDropdown, showSettingsModal, setShowSettingsModal, showSubscriptionModal, setShowSubscriptionModal, showSecurityParamsModal, setShowSecurityParamsModal, taskToSubmit, setTaskToSubmit, taskIdToEdit, setTaskIdToEdit, showTransferModal, setShowTransferModal, transferForm, setTransferForm, previewImageIndex, setPreviewImageIndex, selectedOrder, setSelectedOrder, showAddPlanModal, setShowAddPlanModal, showAddKidModal, setShowAddKidModal, newKidForm, setNewKidForm, showAddItemModal, setShowAddItemModal, showQrScanner, setShowQrScanner, historyFilter, setHistoryFilter, showLevelRules, setShowLevelRules, editingTask, setEditingTask, deleteConfirmTask, setDeleteConfirmTask, mallSortByPrice, setMallSortByPrice, orderSortByPrice, setOrderSortByPrice, orderFilterStatus, setOrderFilterStatus, kidCheckoutItem, setKidCheckoutItem, showAvatarPickerModal, setShowAvatarPickerModal, showPenaltyModal, setShowPenaltyModal, penaltyTaskContext, setPenaltyTaskContext, penaltySelectedKidIds, setPenaltySelectedKidIds, showReviewModal, setShowReviewModal, reviewOrderId, setReviewOrderId, showShopConfirmModal, setShowShopConfirmModal, shopTargetItem, setShopTargetItem, qrModalValue, setQrModalValue, showLevelModal, setShowLevelModal, pendingAvatar, setPendingAvatar, pointActionTimings, setPointActionTimings, showEmotionalReminderModal, setShowEmotionalReminderModal, emotionalCooldownSeconds, setEmotionalCooldownSeconds, showRewardModal, setShowRewardModal, showRejectModal, setShowRejectModal, rejectingTaskInfo, setRejectingTaskInfo, rejectReason, setRejectReason, showTransactionHistoryModal, setShowTransactionHistoryModal, transactionHistoryKidId, setTransactionHistoryKidId, transactionHistoryFilterTime, setTransactionHistoryFilterTime, transactionHistoryStartDate, setTransactionHistoryStartDate, transactionHistoryEndDate, setTransactionHistoryEndDate, transactionHistoryFilterType, setTransactionHistoryFilterType, showTimerModal, setShowTimerModal, timerTargetId, setTimerTargetId, timerMode, setTimerMode, timerSeconds, setTimerSeconds, timerTotalSeconds, setTimerTotalSeconds, isTimerRunning, setIsTimerRunning, timerPaused, setTimerPaused, pomodoroSession, setPomodoroSession, pomodoroIsBreak, setPomodoroIsBreak, showCalendarModal, setShowCalendarModal, showParentPinModal, setShowParentPinModal, showKidSwitcher, setShowKidSwitcher, showInterestDetailsModal, setShowInterestDetailsModal, quickCompleteTask, setQuickCompleteTask, qcTimeMode, setQcTimeMode, qcHours, setQcHours, qcMinutes, setQcMinutes, qcSeconds, setQcSeconds, qcStartTime, setQcStartTime, qcEndTime, setQcEndTime, qcNote, setQcNote, qcAttachments, setQcAttachments, pinInput, setPinInput, reviewStars, setReviewStars, reviewComment, setReviewComment, newItem, setNewItem, planType, setPlanType, lastSavedEndTime, setLastSavedEndTime, planForm, setPlanForm, planFormErrors, setPlanFormErrors, parentSettings, setParentSettings, celebrationData, setCelebrationData, showPreviewModal, setShowPreviewModal, previewTask, setPreviewTask, showImagePreviewModal, setShowImagePreviewModal, previewImages, setPreviewImages, currentPreviewIndex, setCurrentPreviewIndex, notifications, notify, setNotifications, appState, changeAppState, token, setToken, user, setUser, authLoading, setAuthLoading, authMode, setAuthMode, authForm, setAuthForm, confirmPassword, setConfirmPassword, activationCode, setActivationCode, handleAuth, handleLogout, kids, setKids, tasks, setTasks, inventory, setInventory, orders, setOrders, transactions, setTransactions, isLoading, setIsLoading, adminTab, setAdminTab, adminUsers, setAdminUsers, adminCodes, setAdminCodes, usedCodes, setUsedCodes, settingsCode, setSettingsCode, changeActiveKid, updateActiveKid, updateKidData, handleExpChange, getTaskStatusOnDate, getTaskTimeSpent, handleDeleteTask, handleAttemptSubmit, handleMarkHabitComplete, handleRejectTask, handleStartTask, confirmSubmitTask, confirmTransfer, buyItem, getIncompleteStudyTasksCount,
        openQuickComplete, handleQcQuickDuration, handleQcFileUpload, handleQuickComplete, handleSavePlan, submitReview, handleSaveNewItem, confirmReceipt, checkPeriodLimits, playSuccessSound, handleVerifyOrder
    } = context;

    const activeKid = kids.find(k => k.id === activeKidId);
    const { showAiTaskCreator, setShowAiTaskCreator } = uiC;
    
    // ═══ TIMER: Tick interval ═══
    useEffect(() => {
        if (!isTimerRunning || timerPaused) return;
        const interval = setInterval(() => {
            if (timerMode === 'forward') {
                setTimerSeconds(s => s + 1);
            } else if (timerMode === 'countdown') {
                setTimerSeconds(s => {
                    if (s <= 1) {
                        clearInterval(interval);
                        playSuccessSound();
                        return 0;
                    }
                    return s - 1;
                });
            } else if (timerMode === 'pomodoro') {
                setTimerSeconds(s => {
                    if (s <= 1) {
                        // Auto-switch work/break
                        playSuccessSound();
                        if (pomodoroIsBreak) {
                            // Break ended → next work session
                            setPomodoroIsBreak(false);
                            setPomodoroSession(ps => ps + 1);
                            return 25 * 60;
                        } else {
                            // Work ended → break (5min, or 15min after 4th)
                            setPomodoroIsBreak(true);
                            const breakMins = (pomodoroSession % 4 === 0) ? 15 : 5;
                            return breakMins * 60;
                        }
                    }
                    return s - 1;
                });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isTimerRunning, timerPaused, timerMode, pomodoroIsBreak, pomodoroSession]);

    // ═══ TIMER: localStorage persistence ═══
    const TIMER_KEY = 'minilife_timer_state';
    useEffect(() => {
        if (isTimerRunning && timerTargetId) {
            localStorage.setItem(TIMER_KEY, JSON.stringify({
                taskId: timerTargetId, mode: timerMode, seconds: timerSeconds,
                totalSeconds: timerTotalSeconds, running: isTimerRunning, paused: timerPaused,
                pomodoroSession, pomodoroIsBreak, savedAt: Date.now()
            }));
        }
    }, [timerSeconds, isTimerRunning, timerPaused, timerMode, timerTargetId]);

    // ═══ TIMER: Restore on mount ═══
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(TIMER_KEY));
            if (saved && saved.taskId && saved.running) {
                const task = tasks.find(t => t.id === saved.taskId);
                if (task) {
                    // Calculate elapsed time while away
                    const elapsed = Math.floor((Date.now() - saved.savedAt) / 1000);
                    let restoredSeconds = saved.seconds;
                    if (!saved.paused) {
                        if (saved.mode === 'forward') restoredSeconds += elapsed;
                        else restoredSeconds = Math.max(0, restoredSeconds - elapsed);
                    }
                    setTimerTargetId(saved.taskId);
                    setTimerMode(saved.mode);
                    setTimerSeconds(restoredSeconds);
                    setTimerTotalSeconds(saved.totalSeconds);
                    setIsTimerRunning(true);
                    setTimerPaused(saved.paused);
                    setPomodoroSession(saved.pomodoroSession || 1);
                    setPomodoroIsBreak(saved.pomodoroIsBreak || false);
                    setShowTimerModal(true);
                }
            }
        } catch (e) { /* ignore */ }
    }, []);

    const clearTimerState = () => {
        localStorage.removeItem(TIMER_KEY);
        setIsTimerRunning(false);
        setTimerPaused(false);
        setTimerMode('select');
        setTimerSeconds(0);
        setPomodoroSession(1);
        setPomodoroIsBreak(false);
        setShowTimerModal(false);
    };

    const [showTimerLeaveConfirm, setShowTimerLeaveConfirm] = useState(false);

    const handleTimerBack = () => {
        if (isTimerRunning && timerMode !== 'select') {
            setShowTimerLeaveConfirm(true);
        } else {
            clearTimerState();
        }
    };

    const handleTimerSaveAndLeave = () => {
        // Save state to localStorage (already happens via useEffect) and close modal
        // Timer pauses but state is preserved for "继续计时"
        setTimerPaused(true);
        setShowTimerLeaveConfirm(false);
        setShowTimerModal(false);
    };

    const renderTimerModal = () => {
        if (!showTimerModal) return null;
        const task = tasks.find(t => t.id === timerTargetId);
        if (!task) return null;

        const hrs = Math.floor(timerSeconds / 3600);
        const mins = Math.floor((timerSeconds % 3600) / 60);
        const secs = timerSeconds % 60;

        const getElapsedSeconds = () => {
            if (timerMode === 'forward') return timerSeconds;
            if (timerMode === 'countdown') return timerTotalSeconds - timerSeconds;
            const completedWork = Math.max(0, pomodoroSession - 1) * 25 * 60;
            const currentWork = pomodoroIsBreak ? 0 : (25 * 60 - timerSeconds);
            return completedWork + currentWork;
        };

        const finishTimer = () => {
            const elapsedSec = getElapsedSeconds();
            const spentMins = Math.max(1, Math.round(elapsedSec / 60));
            const modeLabel = timerMode === 'forward' ? '正计时' : timerMode === 'countdown' ? '倒计时' : '番茄钟';
            const spentStr = `${spentMins} 分钟(${modeLabel})`;
            const taskCopy = { ...task, _timerTimeSpent: spentStr };

            // Save state to localStorage so if user cancels QC, they can resume via "继续计时"
            try {
                localStorage.setItem('minilife_timer_state', JSON.stringify({
                    taskId: timerTargetId, mode: timerMode, seconds: timerSeconds,
                    totalSeconds: timerTotalSeconds, running: true, paused: true,
                    pomodoroSession, pomodoroIsBreak, savedAt: Date.now()
                }));
            } catch (e) { /* ignore */ }

            clearTimerState();
            playSuccessSound();
            openQuickComplete(taskCopy);
        };

        const skipPomodoroStage = () => {
            playSuccessSound();
            if (pomodoroIsBreak) {
                setPomodoroIsBreak(false);
                setPomodoroSession(s => s + 1);
                setTimerSeconds(25 * 60);
            } else {
                setPomodoroIsBreak(true);
                const breakMins = (pomodoroSession % 4 === 0) ? 15 : 5;
                setTimerSeconds(breakMins * 60);
            }
        };

        /* ── Original color themes (warm amber + teal, NOT xiaodaka blue/purple/orange) ── */
        const themes = {
            select: { bg: '#0F172A', accent: '#94A3B8' },
            forward: { bg: '#0F1B2D', accent: '#F59E0B', glow: 'rgba(245,158,11,0.15)', ring: '#F59E0B' },
            countdown: { bg: '#1A0F2E', accent: '#A78BFA', glow: 'rgba(167,139,250,0.15)', ring: '#A78BFA' },
            pomodoro: pomodoroIsBreak
                ? { bg: '#0F2922', accent: '#34D399', glow: 'rgba(52,211,153,0.15)', ring: '#34D399' }
                : { bg: '#1C1017', accent: '#FB7185', glow: 'rgba(251,113,133,0.15)', ring: '#FB7185' },
        };
        const theme = themes[timerMode] || themes.select;

        /* ── Progress ring ── */
        const showRing = timerMode !== 'select';
        const ringTotal = timerMode === 'forward' ? Math.max(timerSeconds, 1)
            : timerMode === 'countdown' ? timerTotalSeconds
            : (pomodoroIsBreak ? (pomodoroSession % 4 === 0 ? 900 : 300) : 1500);
        const ringProgress = showRing && ringTotal > 0
            ? (timerMode === 'forward' ? 1 : 1 - (timerSeconds / ringTotal))
            : 0;
        const ringR = 120;
        const ringC = 2 * Math.PI * ringR;
        const ringOff = ringC * (1 - Math.min(1, Math.max(0, ringProgress)));

        /* ── Task info ── */
        const taskTimeStr = task.timeStr || '';
        const taskDesc = task.description || '';

        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center animate-fade-in overflow-hidden"
                style={{ background: theme.bg, zIndex: 9999, paddingTop: 'max(env(safe-area-inset-top), 12px)', paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>

                {/* Subtle ambient light */}
                {timerMode !== 'select' && (
                    <div className="absolute inset-0 pointer-events-none" style={{
                        background: `radial-gradient(ellipse 600px 400px at 50% 30%, ${theme.glow}, transparent)`
                    }} />
                )}

                {/* ── Leave confirmation (original glassmorphism dark design) ── */}
                {showTimerLeaveConfirm && (() => {
                    const eSec = getElapsedSeconds();
                    const eM = Math.floor(eSec / 60); const eS = eSec % 60;
                    return (
                        <div className="absolute inset-0 z-30 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)' }}>
                            <div className="w-full max-w-xs rounded-3xl p-6 text-center animate-fade-in"
                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)' }}>
                                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                                    style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                                    <Icons.Clock size={24} className="text-amber-400" />
                                </div>
                                <h3 className="text-lg font-black text-white mb-1">暂停计时</h3>
                                <p className="text-white/40 text-xs mb-4">已学习 {eM > 0 ? `${eM}分` : ''}{eS}秒</p>

                                <div className="space-y-2.5">
                                    <button onClick={() => setShowTimerLeaveConfirm(false)}
                                        className="w-full py-3.5 rounded-2xl font-black text-sm transition-all active:scale-[0.97]"
                                        style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.3)', color: '#FBBF24' }}>
                                        继续学习
                                    </button>
                                    <button onClick={handleTimerSaveAndLeave}
                                        className="w-full py-3.5 rounded-2xl font-black text-sm transition-all active:scale-[0.97]"
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                                        保存进度并离开
                                    </button>
                                    <button onClick={clearTimerState}
                                        className="w-full py-2.5 text-white/20 font-bold text-xs hover:text-red-400/60 transition-all">
                                        放弃本次计时
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                <div className="relative w-full max-w-md px-5 text-center flex-1 flex flex-col justify-center overflow-hidden">

                    {/* ══════ MODE SELECTION ══════ */}
                    {timerMode === 'select' ? (
                        <div className="animate-fade-in">
                            {/* Close button */}
                            <button onClick={() => { clearTimerState(); }}
                                className="absolute top-2 right-2 w-10 h-10 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition-all">
                                <Icons.X size={20} />
                            </button>

                            {/* Task info card */}
                            <div className="rounded-2xl p-4 mb-6 text-left"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <h3 className="text-white font-black text-lg mb-1">{task.title}</h3>
                                {taskTimeStr && (
                                    <div className="flex items-center gap-1.5 text-white/40 text-xs">
                                        <Icons.Clock size={12} /> <span>{taskTimeStr}</span>
                                    </div>
                                )}
                                {taskDesc && <p className="text-white/30 text-xs mt-2 line-clamp-2">{taskDesc}</p>}
                            </div>

                            <p className="text-white/40 text-xs mb-4">选择计时模式</p>

                            <div className="space-y-2.5">
                                {[
                                    { id: 'forward', IconComp: Icons.TrendingUp, title: '正计时', desc: '自由学习，不限时间', color: '#F59E0B' },
                                    { id: 'countdown', IconComp: Icons.Timer, title: '倒计时', desc: `目标 ${Math.round((timerTotalSeconds || 900) / 60)} 分钟`, color: '#A78BFA' },
                                    { id: 'pomodoro', IconComp: Icons.Target, title: '番茄钟', desc: '25分钟专注 + 5分钟休息', color: '#FB7185' },
                                ].map(m => (
                                    <button key={m.id}
                                        onClick={() => {
                                            if (m.id === 'forward') { setTimerMode('forward'); setTimerSeconds(0); setIsTimerRunning(true); }
                                            else if (m.id === 'countdown') { setTimerMode('countdown'); setTimerSeconds(timerTotalSeconds || 900); setIsTimerRunning(true); }
                                            else { setTimerMode('pomodoro'); setTimerSeconds(25 * 60); setPomodoroSession(1); setPomodoroIsBreak(false); setIsTimerRunning(true); }
                                        }}
                                        className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-[0.97] border"
                                        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ background: `${m.color}18`, border: `1px solid ${m.color}30` }}>
                                            <m.IconComp size={20} style={{ color: m.color }} />
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <div className="text-white font-black text-sm">{m.title}</div>
                                            <div className="text-white/30 text-[11px] truncate">{m.desc}</div>
                                        </div>
                                        <Icons.ChevronRight size={16} className="text-white/20 shrink-0" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* ══════ TIMER RUNNING ══════ */
                        <div className="animate-fade-in">
                            {/* Mode badge */}
                            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-3"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <span className={`w-2 h-2 rounded-full ${timerPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`}></span>
                                <span className="text-white/50 text-xs font-bold">
                                    {timerMode === 'pomodoro'
                                        ? (pomodoroIsBreak ? `休息中 · 第${pomodoroSession}轮` : `专注中 · 第${pomodoroSession}个番茄`)
                                        : (timerMode === 'forward' ? '正计时' : '倒计时')}
                                </span>
                                {timerPaused && <span className="text-amber-400/80 text-[10px] font-bold">已暂停</span>}
                            </div>

                            {/* Task title + info */}
                            <h2 className="text-lg font-black text-white/90 mb-1">{task.title}</h2>
                            {taskTimeStr && <p className="text-white/30 text-xs mb-4">{taskTimeStr}</p>}

                            {/* ── Circular timer display ── */}
                            <div className="relative mx-auto mb-5" style={{ width: 240, height: 240 }}>
                                {/* Progress ring */}
                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 260 260">
                                    <circle cx="130" cy="130" r={ringR} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                                    <circle cx="130" cy="130" r={ringR} fill="none" stroke={theme.ring} strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeDasharray={ringC}
                                        strokeDashoffset={ringOff}
                                        className="transition-all duration-1000 ease-linear"
                                        style={{ filter: `drop-shadow(0 0 6px ${theme.ring}50)` }}
                                    />
                                </svg>
                                {/* Time digits inside ring */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-white font-black tracking-wider" style={{ fontSize: 44, fontFamily: "'SF Mono', 'Menlo', 'Courier New', monospace" }}>
                                        {String(hrs).padStart(2, '0')}
                                        <span className="text-white/30 mx-0.5">:</span>
                                        {String(mins).padStart(2, '0')}
                                        <span className="text-white/30 mx-0.5">:</span>
                                        {String(secs).padStart(2, '0')}
                                    </div>
                                    {timerMode === 'forward' && (
                                        <span className="text-white/20 text-[10px] font-bold mt-1 tracking-widest">ELAPSED</span>
                                    )}
                                    {timerMode === 'countdown' && (
                                        <span className="text-white/20 text-[10px] font-bold mt-1 tracking-widest">REMAINING</span>
                                    )}
                                </div>
                            </div>

                            {/* Pomodoro session dots */}
                            {timerMode === 'pomodoro' && (
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i < pomodoroSession - (pomodoroIsBreak ? 0 : 1)
                                            ? 'bg-emerald-400 shadow-lg shadow-emerald-400/40'
                                            : i === pomodoroSession - (pomodoroIsBreak ? 0 : 1)
                                                ? `border-2 ${pomodoroIsBreak ? 'border-emerald-400 bg-emerald-400/30' : 'border-rose-400 bg-rose-400/30'}`
                                                : 'bg-white/10'}`}></div>
                                    ))}
                                    <span className="text-white/25 text-[10px] font-bold ml-1">
                                        {pomodoroIsBreak ? '休息' : `${pomodoroSession}/4`}
                                    </span>
                                </div>
                            )}

                            {/* ── Controls ── */}
                            <div className="space-y-2.5 max-w-xs mx-auto">
                                {/* Primary: Pause / Resume */}
                                <button onClick={() => setTimerPaused(!timerPaused)}
                                    className="w-full py-4 font-black rounded-2xl transition-all active:scale-[0.97] flex items-center justify-center gap-2.5 text-base"
                                    style={{
                                        background: timerPaused ? `${theme.ring}20` : 'rgba(255,255,255,0.06)',
                                        border: `1px solid ${timerPaused ? `${theme.ring}40` : 'rgba(255,255,255,0.1)'}`,
                                        color: timerPaused ? theme.ring : 'rgba(255,255,255,0.6)',
                                    }}>
                                    {timerPaused ? <><Icons.Play size={20} /> 继续</> : <><Icons.Pause size={20} /> 暂停</>}
                                </button>

                                {/* Secondary: Finish */}
                                <button onClick={finishTimer}
                                    className="w-full py-4 font-black rounded-2xl transition-all active:scale-[0.97] flex items-center justify-center gap-2.5 text-base"
                                    style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', color: '#34D399' }}>
                                    <Icons.CheckCircle size={20} /> 完成学习
                                </button>

                                {/* Skip (pomodoro only) */}
                                {timerMode === 'pomodoro' && (
                                    <button onClick={skipPomodoroStage}
                                        className="w-full py-3 text-white/30 font-bold rounded-2xl hover:text-white/50 transition-all text-sm flex items-center justify-center gap-2">
                                        <Icons.SkipForward size={16} /> 跳过{pomodoroIsBreak ? '休息' : '学习'}
                                    </button>
                                )}

                                {/* Back (triggers leave confirm) */}
                                <button onClick={handleTimerBack}
                                    className="w-full py-3 font-bold rounded-2xl text-sm flex items-center justify-center gap-1.5 transition-all"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>
                                    <Icons.ArrowLeft size={16} /> 返回
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderCalendarModal = () => {
        if (!showCalendarModal) return null;

        const changeMonth = (offset) => {
            const newDate = new Date(monthViewDate);
            newDate.setMonth(newDate.getMonth() + offset);
            setMonthViewDate(newDate);
        };

        const handleDayClick = (dateStr) => {
            setSelectedDate(dateStr);
            setCurrentViewDate(new Date(dateStr)); // 跳转当周
            setShowCalendarModal(false);
        };

        return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in">
                <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden zoom-in transition-all duration-300 transform">
                    <div className="p-4 sm:p-6">
                        <div className="flex justify-between items-center mb-6 px-1 sm:px-2">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.Calendar size={24} className="text-indigo-500" /> 全月总览</h3>
                            <button onClick={() => setShowCalendarModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"><Icons.X size={20} /></button>
                        </div>

                        <div className="flex items-center justify-between mb-4 sm:mb-6 px-1 sm:px-4 py-1.5 sm:py-2 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                            <button onClick={() => changeMonth(-1)} className="p-1 sm:p-2 text-indigo-600 hover:bg-white shadow-sm hover:shadow rounded-full transition-all"><Icons.ChevronLeft size={18} className="sm:w-[20px] sm:h-[20px]" /></button>
                            <div className="font-black text-lg sm:text-xl text-slate-800 tracking-wide drop-shadow-sm flex items-center gap-1">
                                {monthViewDate.getMonth() + 1} <span className="text-sm font-bold text-indigo-500">月</span>
                            </div>
                            <button onClick={() => changeMonth(1)} className="p-1 sm:p-2 text-indigo-600 hover:bg-white shadow-sm hover:shadow rounded-full transition-all"><Icons.ChevronRight size={18} className="sm:w-[20px] sm:h-[20px]" /></button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center mb-2 px-1 sm:px-2">
                            {['一', '二', '三', '四', '五', '六', '日'].map((d, idx) => (
                                <div key={d} className={`text-[10px] sm:text-xs font-bold py-1.5 sm:py-2 ${idx >= 5 ? 'text-rose-400' : 'text-slate-400'}`}>{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 px-1 sm:px-2">
                            {getDaysInMonth(monthViewDate.getFullYear(), monthViewDate.getMonth()).map((dayObj, i) => {
                                const isSelected = dayObj.dateStr === selectedDate;
                                const isToday = dayObj.dateStr === formatDate(new Date());
                                const { count, total } = getIncompleteStudyTasksCount(dayObj.dateStr);

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleDayClick(dayObj.dateStr)}
                                        className={`
                                                aspect-square flex flex-col items-center justify-center rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold transition-all relative pt-2
                                                ${!dayObj.isCurrentMonth ? 'text-slate-300 pointer-events-none scale-95 opacity-50' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer hover:scale-105 active:scale-95'}
                                                ${isSelected && dayObj.isCurrentMonth ? '!bg-indigo-600 !text-white shadow-lg shadow-indigo-600/40 scale-105 z-10' : ''}
                                                ${isToday && !isSelected && dayObj.isCurrentMonth ? '!bg-yellow-400 !text-yellow-900 shadow-sm' : ''}
                                            `}
                                    >
                                        <span className="mb-0.5">{dayObj.day}</span>
                                        <div className="h-3.5 flex items-center justify-center mb-1 w-full">
                                            {count > 0 && dayObj.isCurrentMonth ? (
                                                <span className={`text-[9px] font-bold px-[4px] py-[1px] leading-none rounded-full ${isSelected ? 'bg-indigo-400/50 text-white' : 'bg-red-100 text-red-600'}`}>
                                                    {count}
                                                </span>
                                            ) : (total > 0 && dayObj.isCurrentMonth ? (
                                                <span className={`text-[10px] ${isSelected ? 'text-indigo-300' : 'text-emerald-500'}`}><Icons.Check size={10} /></span>
                                            ) : null)}
                                        </div>
                                        {isToday && !isSelected && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-600 animate-pulse"></div>}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-6 sm:mt-8 pt-4 border-t border-slate-100 flex justify-end px-1 sm:px-2">
                            <button
                                onClick={() => { setMonthViewDate(new Date()); handleDayClick(formatDate(new Date())); }}
                                className="px-5 py-2.5 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center gap-2 border border-slate-200"
                            >
                                <Icons.RefreshCw size={16} className="text-slate-400" /> 回到今天
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderTaskSubmitModal = () => {
        if (!taskToSubmit) return null;
        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pb-[5rem] md:pb-4 animate-fade-in">
                <div className="bg-white w-full max-w-sm rounded-[2rem] p-5 md:p-6 shadow-2xl text-left max-h-[75vh] md:max-h-[85vh] overflow-y-auto">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4"><Icons.CheckSquare size={24} /></div>
                    <h2 className="text-xl font-black text-slate-800 mb-2">提交验收确认</h2>
                    <p className="text-sm text-slate-500 mb-4">在提交给家长审核前，请确认你是否达到了以下标准：</p>
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-6">
                        <h3 className="font-bold text-slate-700 text-sm mb-1">【{taskToSubmit.title}】</h3>
                        <p className="text-slate-600 text-sm">{taskToSubmit.standards}</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setTaskToSubmit(null)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200">还没做好</button>
                        <button onClick={confirmSubmitTask} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700">我确认达标</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderQuickCompleteModal = () => {
        if (!quickCompleteTask) return null;
        const t = quickCompleteTask;
        const totalMins = qcHours * 60 + qcMinutes + Math.round(qcSeconds / 60);
        const totalDisplay = totalMins >= 60 ? `${Math.floor(totalMins / 60)}小时${totalMins % 60 > 0 ? totalMins % 60 + '分钟' : ''}` : `${totalMins}分钟`;

        return (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pb-[5rem] md:pb-4 animate-fade-in">
                <div className="w-full max-w-md rounded-[2rem] shadow-2xl text-left max-h-[75vh] md:max-h-[90vh] overflow-y-auto" style={{ background: '#FBF7F0' }}>
                    {/* 头部 */}
                    <div className="sticky top-0 z-10 p-6 pb-4 rounded-t-[2rem]" style={{ background: '#FBF7F0', borderBottom: '1px solid #F0EBE1' }}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ background: '#FF8C42', boxShadow: '0 4px 14px rgba(255,140,66,0.3)' }}>
                                    <Icons.CheckCircle size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black" style={{ color: '#1B2E4B' }}>完成任务</h2>
                                    <p className="text-sm font-bold" style={{ color: '#5A6E8A' }}>{t.title}</p>
                                </div>
                            </div>
                            <button onClick={() => setQuickCompleteTask(null)} className="p-1 rounded-full transition-colors" style={{ color: '#9CAABE' }}>
                                <Icons.X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 pt-4 space-y-5">
                        {/* 任务信息卡 */}
                        <div className="p-4 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: '#FF8C42' }}>
                                    {t.category || '任务'}
                                </div>
                                <span className="text-xs font-bold" style={{ color: '#9CAABE' }}>{selectedDate}</span>
                            </div>
                            <div className="font-black text-lg" style={{ color: '#1B2E4B' }}>{t.title}</div>
                            {t.standards && <p className="text-xs mt-1" style={{ color: '#5A6E8A' }}>{t.standards}</p>}
                        </div>

                        {/* 耗时设置 */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Icons.Clock size={16} className="text-slate-500" />
                                <span className="font-black text-slate-700 text-sm">耗时记录</span>
                            </div>

                            {/* Tab 切换 */}
                            <div className="flex rounded-xl p-1 mb-4" style={{ background: '#F0EBE1' }}>
                                <button
                                    onClick={() => setQcTimeMode('duration')}
                                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${qcTimeMode === 'duration' ? 'shadow-sm' : ''}`}
                                    style={qcTimeMode === 'duration' ? { background: '#fff', color: '#FF8C42' } : { color: '#5A6E8A' }}
                                >
                                    输入时长
                                </button>
                                <button
                                    onClick={() => setQcTimeMode('actual')}
                                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${qcTimeMode === 'actual' ? 'shadow-sm' : ''}`}
                                    style={qcTimeMode === 'actual' ? { background: '#fff', color: '#FF8C42' } : { color: '#5A6E8A' }}
                                >
                                    实际时间
                                </button>
                            </div>

                            {qcTimeMode === 'duration' ? (
                                <div>
                                    {/* 时/分/秒输入 */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex-1">
                                            <label className="text-[11px] font-bold text-slate-400 block mb-1 text-center">小时</label>
                                            <input type="number" min="0" max="23" value={qcHours} onChange={e => setQcHours(Math.max(0, parseInt(e.target.value) || 0))}
                                                className="w-full text-center text-2xl font-black text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl py-3 outline-none focus:border-indigo-400 transition-colors" />
                                        </div>
                                        <span className="text-2xl font-black text-slate-300 mt-5">:</span>
                                        <div className="flex-1">
                                            <label className="text-[11px] font-bold text-slate-400 block mb-1 text-center">分钟</label>
                                            <input type="number" min="0" max="59" value={qcMinutes} onChange={e => setQcMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                                                className="w-full text-center text-2xl font-black text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl py-3 outline-none focus:border-indigo-400 transition-colors" />
                                        </div>
                                        <span className="text-2xl font-black text-slate-300 mt-5">:</span>
                                        <div className="flex-1">
                                            <label className="text-[11px] font-bold text-slate-400 block mb-1 text-center">秒</label>
                                            <input type="number" min="0" max="59" value={qcSeconds} onChange={e => setQcSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                                                className="w-full text-center text-2xl font-black text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl py-3 outline-none focus:border-indigo-400 transition-colors" />
                                        </div>
                                    </div>

                                    {/* 总计 */}
                                    <div className="text-center rounded-xl py-2 mb-4" style={{ background: '#FF8C4215', border: '1px solid #FF8C4230' }}>
                                        <span className="text-sm font-bold" style={{ color: '#FF8C42' }}>总计: {totalDisplay}</span>
                                    </div>

                                    {/* 快捷时长 */}
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 mb-2 block">常用时长</span>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[{ label: '15分钟', val: 15 }, { label: '30分钟', val: 30 }, { label: '45分钟', val: 45 }, { label: '1小时', val: 60 }, { label: '1.5小时', val: 90 }, { label: '2小时', val: 120 }].map(opt => (
                                                <button key={opt.val} onClick={() => handleQcQuickDuration(opt.val)}
                                                    className={`py-2.5 text-sm font-bold rounded-full border-2 transition-all
                                                        ${totalMins === opt.val ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 min-w-0">
                                        <label className="text-[11px] font-bold text-slate-500 mb-1 block text-center">开始时间</label>
                                        <input type="time" value={qcStartTime} onChange={e => setQcStartTime(e.target.value)}
                                            className="w-full box-border bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-1 text-center text-sm font-black text-slate-800 outline-none focus:border-indigo-400 transition-colors" />
                                    </div>
                                    <span className="text-slate-300 font-bold mt-5">-</span>
                                    <div className="flex-1 min-w-0">
                                        <label className="text-[11px] font-bold text-slate-500 mb-1 block text-center">结束时间</label>
                                        <input type="time" value={qcEndTime} onChange={e => setQcEndTime(e.target.value)}
                                            className="w-full box-border bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-1 text-center text-sm font-black text-slate-800 outline-none focus:border-indigo-400 transition-colors" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 学习备注 */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Icons.FileText size={16} className="text-slate-500" />
                                <span className="font-bold text-slate-700 text-sm">学习备注</span>
                                <span className="text-xs text-slate-400">(可选)</span>
                            </div>
                            <textarea
                                value={qcNote}
                                onChange={e => setQcNote(e.target.value)}
                                placeholder="记录学习心得或笔记..."
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-4 text-sm text-slate-700 outline-none focus:border-indigo-400 transition-colors resize-none h-24 placeholder:text-slate-300"
                            />
                        </div>

                        {/* 附件上传 */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Icons.Image size={16} className="text-slate-500" />
                                <span className="font-bold text-slate-700 text-sm">完成证据</span>
                                <span className="text-xs text-slate-400">(可选，最多5个)</span>
                            </div>

                            {/* 已上传的预览 */}
                            {qcAttachments.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {qcAttachments.map((att, idx) => (
                                        <div key={idx} className="relative group">
                                            {att.type.startsWith('image/') ? (
                                                <img src={att.data} alt={att.name} className="w-full aspect-square object-cover rounded-xl border-2 border-slate-200" />
                                            ) : (
                                                <div className="w-full aspect-square bg-slate-100 rounded-xl border-2 border-slate-200 flex flex-col items-center justify-center p-1">
                                                    <Icons.FileText size={20} className="text-slate-400" />
                                                    <span className="text-[9px] text-slate-400 truncate w-full text-center mt-1">{att.name}</span>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setQcAttachments(prev => prev.filter((_, i) => i !== idx))}
                                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                            >
                                                <Icons.X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 上传区 */}
                            {qcAttachments.length < 5 && (
                                <label className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-2 group-hover:bg-indigo-100 transition-colors">
                                        <Icons.Upload size={20} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">点击上传图片或文件</span>
                                    <span className="text-[11px] text-slate-300 mt-1">支持图片、音频、视频</span>
                                    <input type="file" multiple accept="image/*,audio/*,video/*" onChange={handleQcFileUpload} className="hidden" />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* 底部按钮 */}
                    <div className="sticky bottom-0 p-4 flex gap-3 rounded-b-[2rem]" style={{ background: '#FBF7F0', borderTop: '1px solid #F0EBE1' }}>
                        <button onClick={() => setQuickCompleteTask(null)} className="flex-1 py-3.5 font-bold rounded-xl transition-colors flex items-center justify-center gap-2" style={{ background: '#F0EBE1', color: '#5A6E8A' }}>
                            <Icons.X size={16} /> 取消
                        </button>
                        <button onClick={handleQuickComplete} className="flex-[2] py-3.5 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95" style={{ background: '#FF8C42', boxShadow: '0 4px 14px rgba(255,140,66,0.3)' }}>
                            <Icons.CheckCircle size={18} /> 确认完成
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handleBuyItem = (item) => {
        setShopTargetItem(item);
        setShowShopConfirmModal(true);
    };

    const handleConfirmBuy = async () => {
        if (!shopTargetItem) return;
        const item = shopTargetItem;
        const walletType = item.walletTarget === 'give' ? 'give' : 'spend';
        const price = item.price;
        const activeKid = kids.find(k => String(k.id) === String(activeKidId));

        if (!activeKid || (activeKid.balances[walletType] || 0) < price) {
            notify("余额不足！", "error");
            setShowShopConfirmModal(false);
            return;
        }

        try {
            // Deduct balance
            const newBal = activeKid.balances[walletType] - price;
            await apiFetch(`/api/kids/${activeKidId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ balances: { ...activeKid.balances, [walletType]: newBal } })
            });

            // Create Order
            const newOrder = {
                id: `order_${Date.now()}`,
                kidId: activeKidId,
                itemId: item.id,
                itemName: item.name,
                price: price,
                date: new Date().toISOString(),
                status: 'shipping', // pending parent approval/fulfillment
                type: item.type, // single, multiple, privilege
                walletUsed: walletType
            };
            await apiFetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newOrder) });

            // Create Transaction Record
            const newTrans = {
                id: `trans_${Date.now()}`,
                kidId: activeKidId,
                type: 'expense',
                amount: price,
                title: `兑换商品: ${item.name}`,
                date: new Date().toISOString(),
                category: 'shop'
            };
            await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTrans) });

            // Update local state
            setKids(kids.map(k => String(k.id) === String(activeKidId) ? { ...k, balances: { ...k.balances, [walletType]: newBal } } : k));
            setOrders([...orders, newOrder]);
            setTransactions([newTrans, ...transactions]);

            notify("兑换成功！在我的订单中查看", "success");
            setShowShopConfirmModal(false);
            setShopTargetItem(null);

            // Switch to orders tab to see it
            setKidShopTab('orders');

        } catch (e) {
            console.error(e);
            notify("兑换失败，请重试", "error");
        }
    };

    const renderShopConfirmModal = () => {
        if (!showShopConfirmModal || !shopTargetItem) return null;
        const item = shopTargetItem;
        const isGive = item.walletTarget === 'give';
        const activeKid = kids.find(k => String(k.id) === String(activeKidId));
        const currentBalance = activeKid ? (activeKid.balances?.[isGive ? 'give' : 'spend'] || activeKid.balances?.spend || 0) : 0;

        // Compute exchange info
        const typeLabel = item.type === 'single' ? '单次兑换' : item.type === 'multiple' ? '多次兑换' : '永久特权';
        const isMulti = item.type === 'multiple';
        const maxN = item.maxExchanges || 1;
        const pb = item.periodMaxType || 'lifetime';
        const periodMap = { daily: '每日', weekly: '每周', monthly: '每月', lifetime: '总计' };
        const periodLabel = periodMap[pb] || '总计';
        // Count bought
        const bc = orders.filter(o => {
            if (String(o.kidId) !== String(activeKidId) || o.itemName !== item.name) return false;
            if (!o.date) return true;
            const od = new Date(o.date), td = new Date();
            if (pb === 'daily') return od.toDateString() === td.toDateString();
            if (pb === 'weekly') { const s = d => { const x = new Date(d); x.setHours(0,0,0,0); x.setDate(x.getDate()-x.getDay()); return x.getTime(); }; return s(od) === s(td); }
            if (pb === 'monthly') return od.getFullYear() === td.getFullYear() && od.getMonth() === td.getMonth();
            return true;
        }).length;

        const remainingAfter = currentBalance - item.price;

        return (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowShopConfirmModal(false)}>
                <div className="w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl" style={{ background: '#FBF7F0' }} onClick={e => e.stopPropagation()}>

                    {/* Hero area — large item showcase */}
                    <div className="relative pt-10 pb-5 flex flex-col items-center"
                        style={{ background: isGive ? 'linear-gradient(180deg, #FFF0F6 0%, #FBF7F0 100%)' : 'linear-gradient(180deg, #F0ECFF 0%, #FBF7F0 100%)' }}>
                        {/* Close button */}
                        <button onClick={() => setShowShopConfirmModal(false)} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.06)' }}>
                            <Icons.X size={14} style={{ color: '#9CAABE' }} />
                        </button>
                        <div className="w-28 h-28 rounded-3xl bg-white shadow-lg flex items-center justify-center text-6xl mb-4" style={{ border: '3px solid white' }}>
                            {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover rounded-2xl" /> : item.iconEmoji}
                        </div>
                        <h2 className="text-xl font-black text-center px-6" style={{ color: '#1B2E4B' }}>{item.name}</h2>
                        <p className="text-sm font-bold mt-1" style={{ color: '#9CAABE' }}>想要兑换这个吗？</p>
                    </div>

                    <div className="px-5 pb-5">
                        {/* Info pills in a row */}
                        <div className="flex flex-wrap gap-1.5 mb-3 justify-center">
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                                style={{ background: item.type === 'single' ? '#F0ECFF' : item.type === 'multiple' ? '#E8FBF8' : '#F3EEFF', color: item.type === 'single' ? '#7C5CFC' : item.type === 'multiple' ? '#4ECDC4' : '#8B5CF6' }}>
                                {item.type === 'single' ? '🎫 单次' : item.type === 'multiple' ? '🔄 多次' : '👑 特权'}
                            </span>
                            {isMulti && (
                                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                                    style={{ background: bc >= maxN ? '#FEE2E2' : '#F0ECFF', color: bc >= maxN ? '#FF6B6B' : '#7C5CFC' }}>
                                    {periodLabel}已兑 {bc}/{maxN}
                                </span>
                            )}
                            {item.desc && (
                                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ background: '#F0EBE1', color: '#5A6E8A' }}>
                                    {item.desc.length > 12 ? item.desc.slice(0, 12) + '...' : item.desc}
                                </span>
                            )}
                        </div>

                        {/* Big price card */}
                        <div className="rounded-2xl p-4 mb-3 text-center" style={{ background: 'white' }}>
                            <div className="flex items-center justify-center gap-2 mb-1">
                                {isGive ? <Icons.Heart size={22} className="fill-pink-500 text-pink-500" /> : <Icons.Star size={22} className="fill-yellow-500 text-yellow-500" />}
                                <span className="text-3xl font-black" style={{ color: isGive ? '#EC4899' : '#7C5CFC' }}>{item.price}</span>
                            </div>
                            <div className="text-[11px] font-bold" style={{ color: '#9CAABE' }}>
                                余额 {currentBalance} → 兑换后剩 <span style={{ color: remainingAfter >= 0 ? '#10B981' : '#FF6B6B' }}>{remainingAfter}</span>
                            </div>
                        </div>

                        {/* Fun action buttons */}
                        <button onClick={handleConfirmBuy}
                            className="w-full py-3.5 rounded-2xl font-black text-base text-white transition-all active:scale-95 mb-2"
                            style={{ background: isGive ? 'linear-gradient(135deg, #EC4899, #DB2777)' : 'linear-gradient(135deg, #7C5CFC, #6344E0)', boxShadow: isGive ? '0 4px 14px rgba(236,72,153,0.35)' : '0 4px 14px rgba(124,92,252,0.35)' }}>
                            🎉 我要兑换！
                        </button>
                        <button onClick={() => setShowShopConfirmModal(false)}
                            className="w-full py-2.5 rounded-2xl font-bold text-xs transition-all"
                            style={{ color: '#9CAABE' }}>
                            再想想
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderQrZoomModal = () => {
        if (!qrModalValue) return null;
        return (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[300] flex items-center justify-center p-4 animate-fade-in" onClick={() => setQrModalValue(null)}>
                <div className="bg-white p-8 rounded-[3rem] shadow-2xl flex flex-col items-center transform transition-all scale-100 animate-bounce-in" onClick={e => e.stopPropagation()}>
                    <div className="text-slate-500 font-bold mb-6 text-sm">出示给父母扫码核销</div>
                    <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-100 shadow-inner">
                        <QRCodeSVG value={qrModalValue} size={240} level="H" fgColor="#334155" />
                    </div>
                    <div className="mt-8 text-xl font-black text-indigo-600 tracking-widest font-mono bg-indigo-50 px-6 py-2 rounded-xl">
                        {qrModalValue}
                    </div>
                    <button onClick={() => setQrModalValue(null)} className="mt-8 w-14 h-14 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-200 hover:text-slate-800 transition-colors">
                        <Icons.X size={24} />
                    </button>
                </div>
            </div>
        );
    };

    const renderTransactionHistoryModal = () => {
        if (!showTransactionHistoryModal) return null;

        // Theme constants matching KidWealthTab
        const _C = {
            bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
            orange: '#FF8C42', teal: '#4ECDC4', coral: '#FF6B6B', green: '#10B981',
            textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
        };

        // Use specific kid ID if set (from parent wealth tab), otherwise active kid
        const modalKidId = transactionHistoryKidId || activeKidId;
        const modalKid = kids.find(k => k.id === modalKidId);

        // Transaction icon/color mapping
        const _txMeta = (item) => {
            if (item.category === 'interest' || item.title?.includes('利息') || item.title?.includes('生息'))
                return { icon: 'Sparkles', color: _C.teal, label: '利息' };
            if (item.category === 'charity' || item.category === 'give' || item.title?.includes('爱心') || item.title?.includes('公益') || item.title?.includes('捐'))
                return { icon: 'Heart', color: '#EC4899', label: '爱心' };
            if (item.category === 'purchase' || item.category === 'shop')
                return { icon: 'ShoppingBag', color: _C.coral, label: '兑换' };
            if (item.type === 'income')
                return { icon: 'TrendingUp', color: _C.green, label: '收入' };
            return { icon: 'ShoppingBag', color: _C.coral, label: '消费' };
        };

        let filteredTrans = transactions.filter(t => t.kidId === modalKidId && t.category !== 'habit');

        // Apply Time Filter
        const now = new Date();
        if (transactionHistoryFilterTime !== 'all' && transactionHistoryFilterTime !== 'custom') {
            const days = parseInt(transactionHistoryFilterTime, 10);
            const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
            filteredTrans = filteredTrans.filter(t => new Date(t.date) >= cutoff);
        } else if (transactionHistoryFilterTime === 'custom' && transactionHistoryStartDate && transactionHistoryEndDate) {
            const start = new Date(transactionHistoryStartDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(transactionHistoryEndDate);
            end.setHours(23, 59, 59, 999);
            filteredTrans = filteredTrans.filter(t => {
                const d = new Date(t.date);
                return d >= start && d <= end;
            });
        }

        // Apply Type Filter
        if (transactionHistoryFilterType !== 'all') {
            filteredTrans = filteredTrans.filter(t => t.type === transactionHistoryFilterType);
        }

        // Calculate Statistics
        const totalIncome = filteredTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpense = filteredTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
        const netChange = totalIncome - totalExpense;

        // Group by Date
        const groupedTrans = filteredTrans.reduce((acc, t) => {
            const dStr = new Date(t.date).toLocaleDateString();
            if (!acc[dStr]) acc[dStr] = [];
            acc[dStr].push(t);
            return acc;
        }, {});
        const sortedDates = Object.keys(groupedTrans).sort((a, b) => new Date(b) - new Date(a));

        // Time range label
        const rangeLabels = { 'all': '全部', '7': '近7天', '30': '近30天', '90': '近90天', 'custom': '自定义' };

        return (
            <div className="fixed inset-0 z-[300] flex items-end md:items-center justify-center animate-fade-in" onClick={() => { setShowTransactionHistoryModal(false); setTransactionHistoryKidId(null); }}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

                {/* Panel: mobile=full-screen, md+=centered floating card */}
                <div className="relative w-full h-full md:w-[640px] md:h-auto md:max-h-[85vh] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden" style={{ background: _C.bg }} onClick={e => e.stopPropagation()}>

                    {/* ═══ Header ═══ */}
                    <div className="px-5 py-4 flex items-center justify-between shrink-0" style={{ background: _C.bgCard, borderBottom: `1px solid ${_C.bgLight}` }}>
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${_C.orange}12` }}>
                                <Icons.List size={16} style={{ color: _C.orange }} />
                            </div>
                            <div>
                                <h2 className="font-black text-base" style={{ color: _C.textPrimary }}>{modalKid ? `${modalKid.name}的交易记录` : '交易记录'}</h2>
                                <div className="text-[10px] font-bold" style={{ color: _C.textMuted }}>查看你的家庭币收支明细</div>
                            </div>
                        </div>
                        <button onClick={() => { setShowTransactionHistoryModal(false); setTransactionHistoryKidId(null); }}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
                            style={{ background: _C.bgLight, color: _C.textMuted }}>
                            <Icons.X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-4 space-y-3.5">

                            {/* ═══ 4-Stat Summary Grid ═══ */}
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { label: '时段获得', value: totalIncome, color: _C.green, icon: 'TrendingUp', prefix: '+' },
                                    { label: '时段消费', value: totalExpense, color: _C.coral, icon: 'ShoppingBag', prefix: '-' },
                                    { label: '净变化', value: netChange, color: _C.teal, icon: 'Activity', prefix: netChange >= 0 ? '+' : '' },
                                    { label: '记录条数', value: filteredTrans.length, color: _C.orange, icon: 'Clock', prefix: '' },
                                ].map((s, i) => {
                                    const IC = Icons[s.icon] || Icons.Star;
                                    return (
                                        <div key={i} className="rounded-2xl p-3 text-center" style={{ background: _C.bgCard, border: `1px solid ${_C.bgLight}` }}>
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5" style={{ background: `${s.color}10` }}>
                                                <IC size={13} style={{ color: s.color }} />
                                            </div>
                                            <div className="text-[9px] font-bold mb-0.5" style={{ color: _C.textMuted }}>{s.label}</div>
                                            <div className="text-xs font-black" style={{ color: s.color }}>{s.prefix}{s.value.toLocaleString()}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ═══ Filters ═══ */}
                            <div className="rounded-2xl p-4" style={{ background: _C.bgCard, border: `1px solid ${_C.bgLight}` }}>
                                <div className="text-[10px] font-bold mb-2" style={{ color: _C.textMuted }}>统计时段</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        { id: 'all', label: '全部' },
                                        { id: '7', label: '近7天' },
                                        { id: '30', label: '近30天' },
                                        { id: '90', label: '近90天' },
                                        { id: 'custom', label: '自定义' }
                                    ].map(f => (
                                        <button key={f.id} onClick={() => setTransactionHistoryFilterTime(f.id)}
                                            className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                                            style={{
                                                background: transactionHistoryFilterTime === f.id ? _C.orange : _C.bg,
                                                color: transactionHistoryFilterTime === f.id ? '#fff' : _C.textMuted,
                                            }}>
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                                {transactionHistoryFilterTime === 'custom' && (
                                    <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl" style={{ background: _C.bg, border: `1px solid ${_C.bgLight}` }}>
                                        <input type="date" value={transactionHistoryStartDate} onChange={e => setTransactionHistoryStartDate(e.target.value)}
                                            className="flex-1 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none"
                                            style={{ background: _C.bgCard, border: `1px solid ${_C.bgLight}`, color: _C.textPrimary }} />
                                        <span className="text-xs font-bold" style={{ color: _C.textMuted }}>至</span>
                                        <input type="date" value={transactionHistoryEndDate} onChange={e => setTransactionHistoryEndDate(e.target.value)}
                                            className="flex-1 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none"
                                            style={{ background: _C.bgCard, border: `1px solid ${_C.bgLight}`, color: _C.textPrimary }} />
                                    </div>
                                )}

                                <div className="text-[10px] font-bold mt-3 mb-2" style={{ color: _C.textMuted }}>交易类型</div>
                                <div className="flex gap-1.5">
                                    {[
                                        { id: 'all', label: '全部记录' },
                                        { id: 'income', label: '收入' },
                                        { id: 'expense', label: '支出' },
                                    ].map(f => (
                                        <button key={f.id} onClick={() => setTransactionHistoryFilterType(f.id)}
                                            className="flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                                            style={{
                                                background: transactionHistoryFilterType === f.id ? _C.orange : _C.bg,
                                                color: transactionHistoryFilterType === f.id ? '#fff' : _C.textMuted,
                                            }}>
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ═══ Flat Transaction List — date dividers, no nested cards ═══ */}
                            {sortedDates.length === 0 ? (
                                <div className="text-center py-14 rounded-2xl" style={{ background: _C.bgCard, border: `1px solid ${_C.bgLight}` }}>
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: _C.bg }}>
                                        <Icons.Wallet size={24} style={{ color: _C.textMuted }} />
                                    </div>
                                    <div className="text-sm font-black" style={{ color: _C.textSoft }}>暂无交易记录</div>
                                    <div className="text-[11px] font-bold mt-1" style={{ color: _C.textMuted }}>调整筛选条件试试</div>
                                </div>
                            ) : (
                                <div className="pb-6">
                                    {sortedDates.map(dateStr => {
                                        const dailyIncome = groupedTrans[dateStr].filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
                                        const dailyExpense = groupedTrans[dateStr].filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
                                        const isToday = new Date(dateStr).toDateString() === now.toDateString();

                                        return (
                                            <React.Fragment key={dateStr}>
                                                {/* Simple date divider — not a card */}
                                                <div className="flex items-center justify-between px-1 pt-4 pb-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[11px] font-black" style={{ color: _C.textSoft }}>{dateStr}</span>
                                                        {isToday && (
                                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md" style={{ background: `${_C.orange}12`, color: _C.orange }}>今天</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-black">
                                                        {dailyIncome > 0 && <span style={{ color: _C.green }}>+{dailyIncome.toLocaleString()}</span>}
                                                        {dailyExpense > 0 && <span style={{ color: _C.coral }}>-{dailyExpense.toLocaleString()}</span>}
                                                    </div>
                                                </div>

                                                {/* Flat items — directly on bg, no wrapper card */}
                                                {groupedTrans[dateStr].map((item, idx) => {
                                                    const isIncome = item.type === 'income';
                                                    const meta = _txMeta(item);
                                                    const IconCmp = Icons[meta.icon] || Icons.Star;
                                                    return (
                                                        <div key={item.id || `tx-${idx}`}
                                                            className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-1"
                                                            style={{ background: _C.bgCard }}>
                                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                                                    style={{ background: `${meta.color}10` }}>
                                                                    <IconCmp size={15} style={{ color: meta.color }} />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="font-bold text-xs leading-tight truncate" style={{ color: _C.textPrimary }}>
                                                                        {item.title}
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                                                                            style={{ background: `${meta.color}08`, color: meta.color }}>
                                                                            {meta.label}
                                                                        </span>
                                                                        <span className="text-[9px] font-bold" style={{ color: _C.textMuted }}>
                                                                            {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="font-black text-sm shrink-0 ml-3" style={{ color: isIncome ? _C.green : _C.textPrimary }}>
                                                                {isIncome ? '+' : '-'}{Number(item.amount).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderTransferModal = () => {
        if (!showTransferModal) return null;
        const activeKid = kids.find(k => k.id === activeKidId);
        if (!activeKid) return null;

        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl text-left">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.RefreshCw className="text-indigo-500" /> 资金手动划转</h2>
                        <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors"><Icons.X size={20} /></button>
                    </div>

                    <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl mb-6 font-bold text-center border border-indigo-100">
                        日常消费钱包余额：<span className="text-2xl font-black">{activeKid.balances.spend}</span> 家庭币
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">转入到哪里？</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setTransferForm({ ...transferForm, target: 'vault' })} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${transferForm.target === 'vault' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-inner' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                                    <Icons.Lock size={24} />
                                    <span className="font-bold">时光金库 (储蓄)</span>
                                </button>
                                <button onClick={() => setTransferForm({ ...transferForm, target: 'give' })} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${transferForm.target === 'give' ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-inner' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                                    <Icons.Heart size={24} />
                                    <span className="font-bold">公益基金</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">划转金额</label>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <button onClick={() => setTransferForm({ ...transferForm, amount: 10 })} className="py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">+ 10</button>
                                <button onClick={() => setTransferForm({ ...transferForm, amount: 50 })} className="py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">+ 50</button>
                                <button onClick={() => setTransferForm({ ...transferForm, amount: activeKid.balances.spend })} className="py-2 bg-slate-100 text-indigo-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">全部余额</button>
                            </div>
                            <div className="relative">
                                <input type="number" value={transferForm.amount} onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })} placeholder="输入数字" className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl text-lg font-bold outline-none focus:border-indigo-500 transition-colors" />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">家庭币</span>
                            </div>
                        </div>
                    </div>

                    <button onClick={confirmTransfer} className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all hover:-translate-y-0.5 mt-2">
                        确认划转
                    </button>
                </div>
            </div>
        );
    };

    const renderReviewModal = () => {
        if (!selectedOrder) return null;
        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl text-left">
                    <h2 className="text-xl font-black text-slate-800 mb-2">订单评价</h2>
                    <p className="text-slate-500 text-sm mb-6">收到“{selectedOrder.itemName}”了吗？给个真实反馈吧！</p>
                    <div className="flex justify-center gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map(s => (
                            <button key={s} onClick={() => setReviewStars(s)} className={`p-1 transition-all ${s <= reviewStars ? 'text-yellow-400 scale-110' : 'text-slate-200'}`}><Icons.Star size={36} fill={s <= reviewStars ? 'currentColor' : 'none'} /></button>
                        ))}
                    </div>
                    <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="写下你的真实感受吧..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 h-28 resize-none mb-6" />
                    <div className="flex gap-3">
                        <button onClick={() => setSelectedOrder(null)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200">暂不评价</button>
                        <button onClick={() => submitReview(selectedOrder.id, reviewStars, reviewComment || "默认好评！")} className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">提交评价</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderQrScannerModal = () => {
        if (!showQrScanner) return null;
        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl relative overflow-hidden animate-spring-up p-6">
                    <button onClick={() => setShowQrScanner(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full hover:bg-slate-100 transition-colors z-10"><Icons.X size={20} /></button>
                    <div className="text-center mb-4 mt-2">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3"><Icons.Activity size={32} /></div>
                        <h2 className="text-xl font-black text-slate-800">核销二维码扫描</h2>
                        <p className="text-sm text-slate-500 mt-1">请让孩子出示兑换后的二维码</p>
                    </div>
                    <div className="rounded-2xl overflow-hidden bg-slate-100 border-4 border-slate-50 relative aspect-square flex items-center justify-center">
                        <Scanner
                            onScan={(result) => result && result.length > 0 && handleVerifyOrder(result[0].rawValue)}
                            onError={(error) => console.log(error?.message)}
                            components={{ audio: false }}
                            allowMultiple={true}
                            scanDelay={1000}
                        />
                    </div>
                    <p className="text-xs text-slate-400 text-center mt-4">如果无法唤起摄像头，请使用列表侧的“一键手动核销”</p>
                </div>
            </div>
        );
    };

    const renderAddItemModal = () => {
        const emojis = ['🧸', '🎮', '🍔', '🍭', '🎢', '✈️', '📱', '📚', '🛡️', '🎟️', '❤️', '🎁'];
        if (!showAddItemModal) return null;

        const handleItemImageUpload = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const maxFileSize = 5 * 1024 * 1024; // 5MB limit
            if (file.size > maxFileSize) {
                notify("图片大小不能超过 5MB！", "error");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 400;
                    const MAX_HEIGHT = 400;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const base64Str = canvas.toDataURL('image/jpeg', 0.85);

                    setNewItem(prev => ({ ...prev, image: base64Str, iconEmoji: null }));
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        };

        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-fade-in overflow-y-auto pt-10 pb-20">
                <div className="bg-white w-full max-w-sm sm:max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col mt-auto mb-auto border border-white/20 max-h-[85vh] sm:max-h-[90vh]">
                    
                    {/* Header */}
                    <div className="bg-white p-4 sm:p-6 flex justify-between items-center text-slate-800 shrink-0 border-b border-slate-100 relative z-30 shadow-sm">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black mt-2 sm:mt-0 flex items-center gap-2">
                                {newItem.id ? '编辑愿望/商品' : '✨ 添加愿望/商品'}
                            </h2>
                            <div className="text-slate-500 text-sm mt-1 font-medium">配置可以供孩子兑换的奖励</div>
                        </div>
                        <button onClick={() => setShowAddItemModal(false)} className="bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 w-10 h-10 rounded-xl flex items-center justify-center transition-colors mt-2 sm:mt-0"><Icons.X size={20} /></button>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
                        {/* 1. 商品类型 (最先选择) */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">商品类型<span className="text-rose-500 ml-1">*</span></label>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-1">
                                <button onClick={() => setNewItem({ ...newItem, walletTarget: 'spend' })} className={`p-3 sm:p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${(newItem.walletTarget || 'spend') === 'spend' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-inner' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 bg-white'}`}>
                                    <Icons.ShoppingBag size={18} />
                                    <span className="font-bold text-xs sm:text-sm">普通商品 (零花钱)</span>
                                </button>
                                <button onClick={() => setNewItem({ ...newItem, walletTarget: 'give' })} className={`p-3 sm:p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${newItem.walletTarget === 'give' ? 'border-rose-400 bg-rose-50 text-rose-700 shadow-inner' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 bg-white'}`}>
                                    <Icons.Heart size={18} />
                                    <span className="font-bold text-xs sm:text-sm">公益愿望 (爱心基金)</span>
                                </button>
                            </div>
                            {newItem.walletTarget === 'give' && (
                                <div className="mt-2 p-3 sm:p-4 bg-rose-50/50 rounded-xl border border-rose-100 animate-slide-in">
                                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 sm:mb-3">这属于谁的愿望？</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['爸爸的愿望', '妈妈的愿望', '长辈的期盼', '爱心捐赠', '社会公益'].map(target => (
                                            <button
                                                key={target}
                                                onClick={() => setNewItem({ ...newItem, charityTarget: target })}
                                                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all border ${newItem.charityTarget === target ? 'bg-rose-500 text-white border-rose-500 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-rose-300 hover:text-rose-600'}`}
                                            >
                                                {target}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. 愿望名称 */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">愿望名称<span className="text-rose-500 ml-1">*</span></label>
                            <div className="relative">
                                <input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="例如：乐高积木、游乐园门票..." className="w-full bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl px-4 py-3 sm:py-3.5 outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 font-medium transition-all text-sm mb-1" />
                            </div>
                        </div>

                        {/* 3. 需要多少钱 */}
                        <div>
                            <label className={`block text-sm font-bold mb-2 ${newItem.walletTarget === 'give' ? 'text-rose-700' : 'text-slate-700'}`}>
                                {newItem.walletTarget === 'give' ? '需要消耗多少爱心基金？' : '需要消耗多少家庭币？'}<span className="text-rose-500 ml-1">*</span>
                            </label>
                            <input type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} className={`w-full bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl px-4 py-3 sm:py-3.5 outline-none font-black text-lg sm:text-xl transition-all ${newItem.walletTarget === 'give' ? 'focus:ring-2 focus:ring-inset focus:ring-rose-500 text-rose-600' : 'focus:ring-2 focus:ring-inset focus:ring-yellow-500 text-yellow-600'}`} />
                        </div>

                        {/* 4. 图片/图标 */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-slate-700">商品图标 / 头像<span className="text-rose-500 ml-1">*</span></label>
                                {newItem.image && <span className="text-[10px] sm:text-xs font-bold text-indigo-500 bg-indigo-50 px-2 flex items-center h-6 rounded-md">自定义照片</span>}
                            </div>

                            <div className={`transition-opacity duration-300 ${newItem.image ? 'opacity-40 pointer-events-none' : 'opacity-100'} mb-2`}>
                                <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 flex flex-wrap gap-2 justify-center border border-slate-200/60 ring-1 ring-white inset-ring">
                                    {emojis.map(e => (
                                        <button key={e} onClick={(ev) => { ev.preventDefault(); setNewItem({ ...newItem, iconEmoji: e, image: null }); }} className={`text-2xl sm:text-3xl w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl transition-all ${newItem.iconEmoji === e && !newItem.image ? 'bg-white shadow-md scale-110 ring-2 ring-indigo-400' : 'hover:scale-110 opacity-60 hover:opacity-100 grayscale-[0.2] hover:grayscale-0'}`}>
                                            {e}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {!newItem.image ? (
                                <label className="flex items-center justify-center w-full py-3 border-2 border-dashed border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all cursor-pointer group bg-white text-slate-400">
                                    <div className="flex items-center justify-center gap-2">
                                        <Icons.Camera size={16} className="transition-colors" />
                                        <span className="text-xs sm:text-sm font-bold transition-colors">不想用默认图标？点击上传实物照片</span>
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleItemImageUpload} className="hidden" />
                                </label>
                            ) : (
                                <div className="relative w-full h-32 sm:h-40 rounded-2xl overflow-hidden border border-slate-200 group shadow-sm">
                                    <img src={newItem.image} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm">
                                        <label className="px-4 py-2 bg-white/20 hover:bg-white text-white hover:text-indigo-600 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-colors">
                                            更换照片
                                            <input type="file" accept="image/*" onChange={handleItemImageUpload} className="hidden" />
                                        </label>
                                        <button onClick={(e) => { e.preventDefault(); setNewItem({ ...newItem, image: null }); }} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-sm">
                                            删除，用回图标
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 5. 详细描述 (可选) */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">详细描述 <span className="text-slate-400 font-normal">(可选)</span></label>
                            <textarea value={newItem.desc} onChange={e => setNewItem({ ...newItem, desc: e.target.value })} placeholder="描述一下这个愿望的细节..." className="w-full bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl p-3 sm:p-4 outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-sm h-20 sm:h-24 resize-none transition-all placeholder:text-slate-400" />
                        </div>

                        {/* 6. 重复兑换设置 */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">兑换次数设置 <Icons.Info size={14} className="text-slate-400" /></label>
                            <div className="bg-slate-100 p-1 rounded-xl flex mb-1">
                                <button onClick={() => setNewItem({ ...newItem, type: 'single' })} className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all w-1/3 ${newItem.type === 'single' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    单场次
                                </button>
                                <button onClick={() => setNewItem({ ...newItem, type: 'multiple', maxExchanges: newItem.maxExchanges || 1, periodMaxType: newItem.periodMaxType || 'daily' })} className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all w-1/3 ${newItem.type === 'multiple' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    多次
                                </button>
                                <button onClick={() => setNewItem({ ...newItem, type: 'unlimited' })} className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all w-1/3 ${newItem.type === 'unlimited' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    永久
                                </button>
                            </div>
                            {newItem.type === 'multiple' && (
                                <div className="mt-3 p-3 sm:p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 animate-slide-in space-y-3 sm:space-y-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-bold text-indigo-900/80 mb-2">限购周期</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                { id: 'daily', label: '每天' },
                                                { id: 'weekly', label: '每周' },
                                                { id: 'monthly', label: '每月' },
                                                { id: 'lifetime', label: '总共' }
                                            ].map(period => (
                                                <button
                                                    key={period.id}
                                                    onClick={() => setNewItem({ ...newItem, periodMaxType: period.id })}
                                                    className={`py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all border ${newItem.periodMaxType === period.id ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                                >
                                                    {period.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-bold text-indigo-900/80 mb-2">该周期内最多可兑换几次？</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={newItem.maxExchanges || ''}
                                            onChange={e => setNewItem({ ...newItem, maxExchanges: parseInt(e.target.value) || 1 })}
                                            className="w-full bg-white border-0 ring-1 ring-inset ring-indigo-200 focus:ring-2 focus:ring-inset focus:ring-indigo-500 rounded-xl p-2.5 sm:p-3 outline-none font-black text-base sm:text-lg text-indigo-700 shadow-sm transition-all"
                                        />
                                        <p className="text-[10px] sm:text-xs text-indigo-400 mt-1.5 font-medium leading-relaxed">孩子在该周期内兑换满 {newItem.maxExchanges || 1} 次后，商品将暂时置灰不可通过购买。</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div> {/* End Scrollable Content */}

                    {/* Fixed Footer */}
                    <div className="p-3 sm:p-5 bg-white border-t border-slate-100 shrink-0 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
                        <div className="flex gap-2 sm:gap-3">
                            <button onClick={() => setShowAddItemModal(false)} className="w-[30%] sm:flex-1 py-3.5 sm:py-4 rounded-full sm:rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors text-sm sm:text-base">取消</button>
                            <button
                                onClick={handleSaveNewItem}
                                disabled={!newItem.name || !newItem.price || (!newItem.iconEmoji && !newItem.image)}
                                className="flex-1 py-3.5 sm:py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full sm:rounded-2xl font-black shadow-[0_8px_16px_-6px_rgba(79,70,229,0.4)] transition-all hover:shadow-[0_12px_20px_-8px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                <Icons.Check size={20} strokeWidth={3} /> {newItem.id ? '保存修改' : '确认添加'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderImagePreviewModal = () => {
        if (!showImagePreviewModal || !previewImages || previewImages.length === 0) return null;

        const currentImg = previewImages[currentPreviewIndex];

        return (
            <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col animate-fade-in">
                {/* Header Toolbar */}
                <div className="flex items-center justify-between p-4 text-white/50 absolute top-0 left-0 right-0 z-10">
                    <div className="text-sm font-bold bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        {currentPreviewIndex + 1} / {previewImages.length}
                    </div>
                    <div className="flex gap-4">
                        <a
                            href={currentImg.data || currentImg.url}
                            download={currentImg.name || 'minilife-evidence.jpg'}
                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm cursor-pointer"
                            title="下载原始图片"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                        </a>
                        <button
                            onClick={() => { setShowImagePreviewModal(false); setPreviewImages([]); }}
                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm"
                        >
                            <Icons.X size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 relative flex items-center justify-center overflow-hidden p-4 md:p-8 mt-16 md:mt-0">
                    {previewImages.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPreviewIndex(prev => (prev > 0 ? prev - 1 : previewImages.length - 1));
                            }}
                            className="absolute left-2 md:left-8 z-20 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all shadow-xl"
                        >
                            <Icons.ChevronLeft size={28} />
                        </button>
                    )}

                    <img
                        src={currentImg.data || currentImg.url}
                        alt={currentImg.name || "Evidence"}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-300"
                    />

                    {previewImages.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPreviewIndex(prev => (prev < previewImages.length - 1 ? prev + 1 : 0));
                            }}
                            className="absolute right-2 md:right-8 z-20 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all shadow-xl"
                        >
                            <Icons.ChevronRight size={28} />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const confirmRejectTask = async () => {
        if (!rejectingTaskInfo) return;
        await handleRejectTask(rejectingTaskInfo.task, rejectingTaskInfo.dateStr, rejectingTaskInfo.kidId, rejectReason);
        setShowRejectModal(false);
        setRejectingTaskInfo(null);
        setRejectReason('');
    };

    const renderRejectModal = () => {
        if (!showRejectModal || !rejectingTaskInfo) return null;
        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl text-left">
                    <h2 className="text-xl font-black text-rose-600 mb-2">打回</h2>
                    <p className="text-slate-500 text-sm mb-6">觉得孩子完成的不够好？写下原因让Ta修改吧：</p>
                    <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="例如：字迹太潦草了，请重新写一遍..." className="w-full bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm font-medium outline-none focus:border-rose-400 focus:bg-white h-28 resize-none mb-6 placeholder:text-rose-300 transition-colors" />
                    <div className="flex gap-3">
                        <button onClick={() => { setShowRejectModal(false); setRejectingTaskInfo(null); setRejectReason(''); }} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200">取消</button>
                        <button onClick={confirmRejectTask} className="flex-[2] py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white font-black shadow-lg shadow-rose-500/30 rounded-xl hover:scale-105 transition-all">确认打回</button>
                    </div>
                </div>
            </div>
        );
    };



    const confirmPenalty = () => {
        if (!penaltyTaskContext || penaltySelectedKidIds.length === 0) return;

        const penalty = Math.abs(penaltyTaskContext.reward);
        let kidsUpdated = false;

        let newHist = JSON.parse(JSON.stringify(penaltyTaskContext.history || {}));
        const todayStr = formatDate(new Date());

        penaltySelectedKidIds.forEach(targetKidId => {
            const targetKid = kids.find(k => k.id === targetKidId);
            if (!targetKid) return;

            // Enforce limit check for manual parental deductions
            const kidTodayData = penaltyTaskContext.kidId === 'all' ? (newHist[todayStr]?.[targetKidId] || {}) : (newHist[todayStr] || {});

            const maxAllowed = penaltyTaskContext.periodMaxPerDay || penaltyTaskContext.maxPerDay || 1;
            const attemptsToday = Array.isArray(kidTodayData) ? kidTodayData.length : (kidTodayData.status ? 1 : 0);

            if (attemptsToday >= maxAllowed) {
                notify(`${targetKid.name} 的此项记录今日已达上限，无法继续扣除。`, "warning");
                return; // Skip this child, they reached the limit
            }

            kidsUpdated = true;

            // 1. Update balances
            const newBals = { ...targetKid.balances, spend: Math.max(0, targetKid.balances.spend - penalty) };
            const newExp = Math.max(0, targetKid.exp - Math.ceil(penalty * 1.5));
            apiFetch(`/api/kids/${targetKid.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ balances: newBals, exp: newExp }) });
            setKids(prevKids => prevKids.map(k => k.id === targetKid.id ? { ...k, balances: newBals, exp: newExp } : k));

            // 2. Post transaction
            const refundTrans = { id: `trans_${Date.now()}_penalty_${targetKid.id}`, kidId: targetKid.id, type: 'expense', amount: penalty, title: `手动惩罚: ${penaltyTaskContext.title}`, date: new Date().toISOString(), category: 'habit' };
            apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(refundTrans) });
            setTransactions(prev => [refundTrans, ...prev]);
            notify(`已记录惩罚，扣除 ${targetKid.name} ${penalty} 家庭币！`, "error");

            // 3. Update Task history locally in newHist so next iter sees it
            const newRecord = { status: 'completed', attemptId: `attempt_${Date.now()}_${targetKidId}_${Math.random().toString(36).substr(2, 5)}` };

            if (penaltyTaskContext.kidId === 'all') {
                if (!newHist[todayStr]) newHist[todayStr] = {};
                if (!newHist[todayStr][targetKidId]) newHist[todayStr][targetKidId] = [];
                if (!Array.isArray(newHist[todayStr][targetKidId])) {
                    if (newHist[todayStr][targetKidId].status) newHist[todayStr][targetKidId] = [newHist[todayStr][targetKidId]];
                    else newHist[todayStr][targetKidId] = [];
                }
                newHist[todayStr][targetKidId].push(newRecord);
            } else {
                if (!newHist[todayStr]) newHist[todayStr] = [];
                if (!Array.isArray(newHist[todayStr])) {
                    if (newHist[todayStr].status) newHist[todayStr] = [newHist[todayStr]];
                    else newHist[todayStr] = [];
                }
                newHist[todayStr].push(newRecord);
            }
        });

        if (kidsUpdated) {
            apiFetch(`/api/tasks/${penaltyTaskContext.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: newHist }) });
            setTasks(prev => prev.map(t => t.id === penaltyTaskContext.id ? { ...t, history: newHist } : t));
            setShowPenaltyModal(false);
            setPenaltyTaskContext(null);
        }
    };

    const confirmReward = () => {
        if (!penaltyTaskContext || penaltySelectedKidIds.length === 0) return;

        const reward = Math.abs(penaltyTaskContext.reward);
        let kidsUpdated = false;

        let newHist = JSON.parse(JSON.stringify(penaltyTaskContext.history || {}));
        const todayStr = formatDate(new Date());

        penaltySelectedKidIds.forEach(targetKidId => {
            const targetKid = kids.find(k => k.id === targetKidId);
            if (!targetKid) return;

            // Enforce limit check
            const kidTodayData = penaltyTaskContext.kidId === 'all' ? (newHist[todayStr]?.[targetKidId] || {}) : (newHist[todayStr] || {});

            const maxAllowed = penaltyTaskContext.periodMaxPerDay || penaltyTaskContext.maxPerDay || 1;
            const attemptsToday = Array.isArray(kidTodayData) ? kidTodayData.length : (kidTodayData.status ? 1 : 0);

            if (attemptsToday >= maxAllowed) {
                notify(`${targetKid.name} 的此项记录今日已达上限，无法继续加分。`, "warning");
                return;
            }

            kidsUpdated = true;

            // 1. Update balances
            const newBals = { ...targetKid.balances, spend: targetKid.balances.spend + reward };
            const newExp = targetKid.exp + Math.ceil(reward * 1.5);
            apiFetch(`/api/kids/${targetKid.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ balances: newBals, exp: newExp }) });
            setKids(prevKids => prevKids.map(k => k.id === targetKid.id ? { ...k, balances: newBals, exp: newExp } : k));

            // 2. Post transaction
            const rewardTrans = { id: `trans_${Date.now()}_reward_${targetKid.id}`, kidId: targetKid.id, type: 'income', amount: reward, title: `奖励加分: ${penaltyTaskContext.title}`, date: new Date().toISOString(), category: 'habit' };
            apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rewardTrans) });
            setTransactions(prev => [rewardTrans, ...prev]);
            notify(`已记录奖励，给予 ${targetKid.name} ${reward} 家庭币！`, "success");

            // 3. Update Task history
            const newRecord = { status: 'completed', attemptId: `attempt_${Date.now()}_${targetKidId}_${Math.random().toString(36).substr(2, 5)}` };

            if (penaltyTaskContext.kidId === 'all') {
                if (!newHist[todayStr]) newHist[todayStr] = {};
                if (!newHist[todayStr][targetKidId]) newHist[todayStr][targetKidId] = [];
                if (!Array.isArray(newHist[todayStr][targetKidId])) {
                    if (newHist[todayStr][targetKidId].status) newHist[todayStr][targetKidId] = [newHist[todayStr][targetKidId]];
                    else newHist[todayStr][targetKidId] = [];
                }
                newHist[todayStr][targetKidId].push(newRecord);
            } else {
                if (!newHist[todayStr]) newHist[todayStr] = [];
                if (!Array.isArray(newHist[todayStr])) {
                    if (newHist[todayStr].status) newHist[todayStr] = [newHist[todayStr]];
                    else newHist[todayStr] = [];
                }
                newHist[todayStr].push(newRecord);
            }
        });

        if (kidsUpdated) {
            apiFetch(`/api/tasks/${penaltyTaskContext.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: newHist }) });
            setTasks(prev => prev.map(t => t.id === penaltyTaskContext.id ? { ...t, history: newHist } : t));
            setShowRewardModal(false);
            setPenaltyTaskContext(null);
        }
    };

    const toggleKidSelectionPenalty = (kidId) => {
        if (!penaltyTaskContext) return;
        const requiredCoins = Math.abs(penaltyTaskContext.reward);
        const kUser = kids.find(k => k.id === kidId);
        if (kUser && kUser.balances.spend < requiredCoins) {
            notify(`${kUser.name} 的可用金币不足 ${requiredCoins} 枚，无法扣除`, "warning");
            return;
        }
        setPenaltySelectedKidIds(prev =>
            prev.includes(kidId) ? prev.filter(id => id !== kidId) : [...prev, kidId]
        );
    };

    const renderPenaltyModal = () => {
        if (!showPenaltyModal || !penaltyTaskContext) return null;

        const availableKids = penaltyTaskContext.kidId === 'all'
            ? kids
            : kids.filter(k => k.id === penaltyTaskContext.kidId);

        const eligibleKids = availableKids.filter(k => k.balances.spend >= Math.abs(penaltyTaskContext.reward));

        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in pb-12">
                <div className="bg-white w-full max-w-sm rounded-[2rem] p-5 shadow-2xl text-left border-[3px] border-white/50">
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-2 text-2xl">
                            🚨
                        </div>
                        <h2 className="text-lg font-black text-slate-800">确认扣分对象</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 text-center">
                            请勾选要扣除 <span className="text-red-500 text-sm font-extrabold">{Math.abs(penaltyTaskContext.reward)}</span> 家庭币的孩子<br />
                            <span className="text-[10px] text-slate-400 font-normal">(单据限制: {penaltyTaskContext.periodMaxPerDay || penaltyTaskContext.maxPerDay || 1}次/天)</span>
                        </p>
                    </div>

                    {availableKids.length > 1 && (
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-400">选择受罚对象 ({availableKids.length} 人)</span>
                            <button
                                onClick={() => {
                                    if (penaltySelectedKidIds.length === eligibleKids.length && eligibleKids.length > 0) {
                                        setPenaltySelectedKidIds([]); // Deselect all
                                    } else {
                                        setPenaltySelectedKidIds(eligibleKids.map(k => k.id)); // Select all eligible
                                    }
                                }}
                                disabled={eligibleKids.length === 0}
                                className="text-xs font-black transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-transparent hover:border-slate-200 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ color: penaltySelectedKidIds.length === eligibleKids.length && eligibleKids.length > 0 ? '#f43f5e' : '#64748b' }}
                            >
                                <Icons.CheckSquare size={14} />
                                {penaltySelectedKidIds.length === eligibleKids.length && eligibleKids.length > 0 ? '取消全选' : '选中可用'}
                            </button>
                        </div>
                    )}

                    <div className="space-y-2.5 mb-5 max-h-[35vh] overflow-y-auto pr-1 custom-scrollbar">
                        {availableKids.map(k => {
                            const isSelected = penaltySelectedKidIds.includes(k.id);
                            const requiredCoins = Math.abs(penaltyTaskContext.reward);
                            const isShort = k.balances.spend < requiredCoins;
                            return (
                                <button
                                    key={k.id}
                                    onClick={() => toggleKidSelectionPenalty(k.id)}
                                    disabled={isShort}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-red-500 bg-red-50 shadow-inner' : (isShort ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed' : 'border-slate-100 hover:border-slate-200 bg-white')}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl border ${isShort ? 'bg-slate-200 border-slate-300 opacity-50 grayscale' : 'bg-slate-100 border-slate-200 shadow-sm'} shrink-0 overflow-hidden`}>
                                        <AvatarDisplay avatar={k.avatar} />
                                    </div>
                                    <div className="flex-1 flex flex-col items-start -mt-0.5">
                                        <span className={`font-black text-left ${isSelected ? 'text-red-700' : (isShort ? 'text-slate-400' : 'text-slate-700')}`}>{k.name}</span>
                                        {isShort && <span className="text-[10px] font-bold text-red-400 bg-red-50 px-1.5 py-0.5 rounded mt-0.5">余额不足 ({k.balances.spend}枚)</span>}
                                    </div>
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isSelected ? 'border-red-500 bg-red-500' : 'border-slate-300'}`}>
                                        {isSelected && <Icons.Check size={14} className="text-white" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setShowPenaltyModal(false)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200">取消</button>
                        <button
                            disabled={penaltySelectedKidIds.length === 0}
                            onClick={confirmPenalty}
                            className="flex-[2] py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-black shadow-lg shadow-red-500/30 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            执行扣分
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderRewardModal = () => {
        if (!showRewardModal || !penaltyTaskContext) return null;

        const availableKids = penaltyTaskContext.kidId === 'all'
            ? kids
            : kids.filter(k => k.id === penaltyTaskContext.kidId);

        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in pb-12">
                <div className="bg-white w-full max-w-sm rounded-[2rem] p-5 shadow-2xl text-left border-[3px] border-white/50">
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2 text-2xl">
                            🌟
                        </div>
                        <h2 className="text-lg font-black text-slate-800">确认加分对象</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 text-center">
                            请勾选要给予奖励 <span className="text-yellow-500 text-sm font-extrabold flex inline-flex items-center gap-0.5"><Icons.Star size={14} className="fill-yellow-500" />{Math.abs(penaltyTaskContext.reward)}</span> 的孩子<br />
                            <span className="text-[10px] text-slate-400 font-normal">(单据限制: {penaltyTaskContext.maxPerDay || 1}次/天)</span>
                        </p>
                    </div>

                    {availableKids.length > 1 && (
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-400">选择奖励对象 ({availableKids.length} 人)</span>
                            <button
                                onClick={() => {
                                    if (penaltySelectedKidIds.length === availableKids.length) {
                                        setPenaltySelectedKidIds([]); // Deselect all
                                    } else {
                                        setPenaltySelectedKidIds(availableKids.map(k => k.id)); // Select all
                                    }
                                }}
                                className="text-xs font-black transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-transparent hover:border-slate-200 hover:bg-slate-50 active:bg-slate-100"
                                style={{ color: penaltySelectedKidIds.length === availableKids.length ? '#10b981' : '#64748b' }}
                            >
                                <Icons.CheckSquare size={14} />
                                {penaltySelectedKidIds.length === availableKids.length ? '取消全选' : '全部选中'}
                            </button>
                        </div>
                    )}

                    <div className="space-y-2.5 mb-5 max-h-[35vh] overflow-y-auto pr-1 custom-scrollbar">
                        {availableKids.map(k => {
                            const isSelected = penaltySelectedKidIds.includes(k.id);
                            return (
                                <button
                                    key={k.id}
                                    onClick={() => toggleKidSelectionPenalty(k.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50 shadow-inner' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-2xl border border-slate-200 shadow-sm shrink-0 overflow-hidden">
                                        <AvatarDisplay avatar={k.avatar} />
                                    </div>
                                    <span className={`font-black text-left flex-1 ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>{k.name}</span>
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                                        {isSelected && <Icons.Check size={14} className="text-white" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setShowRewardModal(false)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200">取消</button>
                        <button
                            disabled={penaltySelectedKidIds.length === 0}
                            onClick={confirmReward}
                            className="flex-[2] py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-lg shadow-emerald-500/30 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            执行奖励
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Handle countdown timer for Emotional Modal
    useEffect(() => {
        let timer;
        if (showEmotionalReminderModal && emotionalCooldownSeconds > 0) {
            timer = setInterval(() => {
                setEmotionalCooldownSeconds(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [showEmotionalReminderModal, emotionalCooldownSeconds]);

    const renderEmotionalReminderModal = () => {
        if (!showEmotionalReminderModal) return null;

        const isAnger = typeof showEmotionalReminderModal === 'object' && showEmotionalReminderModal.type === 'anger';
        const modalBg = isAnger ? "bg-gradient-to-br from-rose-50 to-orange-50" : "bg-gradient-to-br from-indigo-50 to-sky-50";
        const iconBg = isAnger ? "from-rose-100 to-orange-100 border-rose-200 text-rose-500" : "from-indigo-100 to-sky-100 border-indigo-200 text-indigo-500";
        const quoteColor = isAnger ? "text-rose-700/80" : "text-indigo-700/80";
        const btnClass = emotionalCooldownSeconds > 0
            ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            : "bg-slate-800 text-white shadow-xl shadow-slate-800/20 hover:scale-[1.02] active:scale-95";

        return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in pb-12">
                <div className={`w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center border-[4px] border-white/60 relative overflow-hidden isolate ${modalBg}`}>
                    {/* Decorative blobs */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/40 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/40 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2"></div>

                    <div className={`w-20 h-20 bg-gradient-to-br ${iconBg} rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-[3px] opacity-90 ${isAnger ? 'animate-pulse' : ''}`}>
                        {isAnger ? <Icons.Wind size={36} strokeWidth={2.5} /> : <Icons.Coffee size={36} strokeWidth={2.5} />}
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-snug font-serif">
                        {isAnger ? "深呼吸..." : "慢慢来..."}
                    </h2>

                    <div className="mt-6 relative">
                        <Icons.Quote size={40} className={`absolute -top-4 -left-2 opacity-10 ${quoteColor} -z-10`} />
                        <p className="text-[15px] font-medium text-slate-600 leading-relaxed text-justify px-2 relative z-10 text-pretty">
                            {isAnger
                                ? "也许此刻您感到生气和失望。但教育是一场漫长的修行，请试着给彼此一点时间，放下这一刻的严厉。\n\n也许，一个拥抱，一句鼓励，能让改变悄然发生。🌱"
                                : "连续的点击可能让孩子无所适从。陪伴的意义不仅在奖惩，多给孩子一些纯粹的关怀与鼓励吧。✨"
                            }
                        </p>
                    </div>

                    <button
                        disabled={emotionalCooldownSeconds > 0}
                        onClick={() => setShowEmotionalReminderModal(false)}
                        className={`w-full mt-8 py-4 rounded-2xl font-black transition-all duration-300 outline-none flex items-center justify-center gap-2 ${btnClass}`}
                    >
                        {emotionalCooldownSeconds > 0 ? (
                            <><Icons.Hourglass size={18} className="animate-spin-slow" /> 等待 {emotionalCooldownSeconds}s</>
                        ) : (
                            isAnger ? "我冷静下来了" : "我知道了"
                        )}
                    </button>
                    {!emotionalCooldownSeconds && isAnger && <p className="text-[11px] text-slate-400 mt-3 font-bold">倒计时结束，您可以关闭窗口</p>}
                </div>
            </div>
        );
    };

    const renderKidPreviewModal = () => {
        if (!showPreviewModal || !previewTask) return null;

        // P1: Resolve the correct kid context for the preview modal.
        // Priority: _previewKidId (from 待审核 panel) > parentKidFilter > smart detect > fallback
        let resolvedKidId = activeKidId;
        if (appState === 'parent_app') {
            if (previewTask._previewKidId) {
                // Explicitly passed from 待审核 panel click
                resolvedKidId = previewTask._previewKidId;
            } else if (parentKidFilter && parentKidFilter !== 'all') {
                // Parent is filtering by a specific kid
                resolvedKidId = parentKidFilter;
            } else if (previewTask.kidId === 'all' && kids.length > 0) {
                // Smart detect: find the most relevant kid
                const pendingKid = kids.find(k => getTaskStatusOnDate(previewTask, selectedDate, k.id) === 'pending_approval');
                const progressKid = kids.find(k => getTaskStatusOnDate(previewTask, selectedDate, k.id) === 'in_progress');
                const completedKid = kids.find(k => getTaskStatusOnDate(previewTask, selectedDate, k.id) === 'completed');
                resolvedKidId = (pendingKid || progressKid || completedKid || kids[0]).id;
            } else if (previewTask.kidId && previewTask.kidId !== 'all') {
                resolvedKidId = previewTask.kidId;
            } else {
                resolvedKidId = kids.length > 0 ? kids[0].id : activeKidId;
            }
        }

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
            <div className="fixed inset-0 backdrop-blur-md z-[100] flex items-center justify-center p-4 pb-[5rem] md:pb-4 animate-fade-in overflow-y-auto" style={{ background: 'rgba(27,46,75,0.5)' }}>
                <div className="w-full max-w-md rounded-[2rem] p-5 md:p-8 shadow-2xl relative overflow-hidden my-auto max-h-[75vh] md:max-h-[85vh] flex flex-col" style={{ background: '#FBF7F0' }}>
                    {/* Ultra-Compact Header */}
                    <div className="absolute top-3 right-3 z-50">
                        <button onClick={() => { setShowPreviewModal(false); setPreviewTask(null); }} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: '#F0EBE1', color: '#5A6E8A' }}>
                            <Icons.X size={16} />
                        </button>
                    </div>

                    <div className="relative z-10 flex items-start gap-3 shrink-0 mb-4 pr-10 pb-4" style={{ borderBottom: '1px solid #F0EBE1' }}>
                        <div className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${getCategoryGradient(previewTask.category || '计划任务')} flex items-center justify-center ${previewTask.type === 'habit' ? 'text-2xl' : 'text-white'} shadow-sm`}>
                            {previewTask.type === 'habit'
                                ? (previewTask.iconEmoji || '⭐')
                                : renderIcon(previewTask.iconName || getIconForCategory(previewTask.category), previewTask.type === 'habit' ? 28 : 22)
                            }
                        </div>
                        <div className="flex flex-col min-w-0 pt-0.5 mt-[-2px]">
                            <div className="flex items-center mb-1">
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: '#FF8C42' }}>
                                    {previewTask.category || '计划任务'}
                                </span>
                            </div>
                            <h2 className="text-base font-black leading-tight line-clamp-2" style={{ color: '#1B2E4B' }}>{previewTask.title}</h2>
                        </div>
                    </div>

                    <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4 md:mb-6">
                        {/* Review Mode Overlay for Parents */}
                        {(appState === 'parent_app' && getTaskStatusOnDate(previewTask, selectedDate, resolvedKidId) === 'pending_approval') ? (
                            <div className="w-full text-left space-y-4 mb-6">
                                <div className="text-sm font-black text-rose-600 mb-2 flex items-center gap-2">
                                    <Icons.Clock size={16} /> 待审核验收
                                </div>
                                <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100 flex flex-col gap-3">
                                    {(() => {
                                        const hr = kidHistory[selectedDate];
                                        if (!hr) return <div className="text-slate-400 text-sm font-bold">暂无提交记录</div>;
                                        return (
                                            <>
                                                {hr.actualTimeStr && (
                                                    <div className="flex items-start gap-2 text-sm">
                                                        <span className="text-orange-400 mt-0.5"><Icons.Clock size={14} /></span>
                                                        <span className="font-bold text-slate-700">实际时间: <span className="text-orange-600 font-black tracking-wide ml-1">{hr.actualTimeStr}</span></span>
                                                    </div>
                                                )}
                                                {hr.actualDuration && (
                                                    <div className="flex items-start gap-2 text-sm">
                                                        <span className="text-orange-400 mt-0.5"><Icons.Play size={14} fill="currentColor" /></span>
                                                        <span className="font-bold text-slate-700">总耗时: <span className="text-orange-600 font-black tracking-wide ml-1">{hr.actualDuration}</span></span>
                                                    </div>
                                                )}
                                                {hr.note && (
                                                    <div className="flex items-start gap-2 text-sm">
                                                        <span className="text-orange-400 mt-0.5"><Icons.MessageCircle size={14} /></span>
                                                        <span className="font-bold text-slate-600 leading-relaxed bg-white px-3 py-2 rounded-xl border border-orange-100 w-full shadow-sm"><span className="text-slate-400 text-xs mr-2 block mb-1">孩子留言:</span>{hr.note}</span>
                                                    </div>
                                                )}
                                                {hr.attachments && hr.attachments.length > 0 && (
                                                    <div className="mt-2">
                                                        <span className="text-slate-400 text-xs font-bold mr-2 block mb-2">图片/视频证据:</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {hr.attachments.map((att, i) => {
                                                                const src = typeof att === 'string' ? att : (att.data || att.url || '');
                                                                const isVideo = (typeof att === 'string' && (att.endsWith('.mp4') || att.endsWith('.webm'))) || (att.type && att.type.startsWith('video/'));
                                                                return (
                                                                <div key={i} onClick={(e) => { e.stopPropagation(); setPreviewImages(hr.attachments.map(a => typeof a === 'string' ? a : (a.data || a.url || ''))); setPreviewImageIndex(i); setShowImagePreviewModal(true); }} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md cursor-pointer hover:border-orange-300 hover:scale-105 transition-all">
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
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full rounded-2xl p-4 text-left space-y-4 mb-6" style={{ background: '#fff', border: '1px solid #F0EBE1' }}>
                                {/* S1: 任务说明放最上面 — 最重要的信息 */}
                                {(previewTask.desc || previewTask.standards) && (
                                    <div className="rounded-xl p-3" style={{ background: '#FFF8F0', border: '1px solid #FFE8D0' }}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0"><Icons.FileText size={13} /></div>
                                            <div className="text-xs font-black" style={{ color: '#FF8C42' }}>任务说明</div>
                                        </div>
                                        <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap pl-8" style={{ color: '#5A6E8A' }}>{previewTask.desc || previewTask.standards}</div>
                                    </div>
                                )}
                                {/* 执行频次 */}
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Icons.RefreshCw size={16} /></div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 mb-0.5">执行频次</div>
                                        <div className="text-sm font-black text-slate-700">
                                            {previewTask.frequency || '每天'}
                                        </div>
                                    </div>
                                </div>

                                {(previewTask.timeStr && previewTask.timeStr !== '--:--') && (
                                    <div className="flex items-start gap-3 border-t border-slate-200 pt-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Icons.Clock size={16} /></div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 mb-0.5">时间要求</div>
                                            <div className="text-sm font-black text-slate-700">{previewTask.timeStr}</div>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-start gap-3 border-t border-slate-200 pt-3">
                                    <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0"><Icons.Star size={16} fill="currentColor" /></div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 mb-0.5">奖励规则</div>
                                        <div className="text-sm font-black text-slate-700">
                                            {previewTask.pointRule === 'custom' ? `固定得 ${previewTask.reward} ${previewTask.type === 'habit' ? '家庭币' : '家庭币'}` : `系统自动计算 (${previewTask.reward} ${previewTask.type === 'habit' ? '家庭币' : '家庭币'})`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 历史完成信息记录 */}
                        <div className="w-full text-left">
                            <div className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center"><Icons.TrendingUp size={14} /></div>
                                历史完成记录
                            </div>
                            <div className="rounded-2xl p-4 flex items-center justify-between mb-4" style={{ background: '#fff', border: '1px solid #F0EBE1' }}>
                                <div className="flex flex-col items-center flex-1">
                                    <span className="text-2xl font-black text-slate-800">{totalCompleted}</span>
                                    <span className="text-[10px] font-bold text-slate-400 mt-1">累计完成(次)</span>
                                </div>
                                <div className="w-px h-10 bg-slate-100"></div>
                                <div className="flex flex-col items-center flex-1">
                                    <span className="text-2xl font-black text-emerald-500">{currentStreak}</span>
                                    <span className="text-[10px] font-bold text-slate-400 mt-1">当前连续(天)</span>
                                </div>
                                <div className="w-px h-10 bg-slate-100"></div>
                                <div className="flex flex-col items-center flex-1">
                                    <span className="text-2xl font-black text-orange-500">{totalEarned}</span>
                                    <span className="text-[10px] font-bold text-slate-400 mt-1">累计获得</span>
                                </div>
                            </div>

                            {historyEntries.length > 0 && (
                                <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors list-none">
                                        <div className="flex items-center gap-2">
                                            <Icons.List size={16} className="text-slate-400" />
                                            <span className="text-sm font-bold text-slate-700">展开历史打卡记录</span>
                                        </div>
                                        <Icons.ChevronDown size={16} className="text-slate-400 group-open:-rotate-180 transition-transform duration-300" />
                                    </summary>
                                    <div className="border-t border-slate-100 p-0 flex flex-col hide-scrollbar max-h-48 overflow-y-auto bg-slate-50/50">
                                        {historyEntries.map(([date, record]) => (
                                            <div key={date} className="px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-white transition-colors">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-sm text-slate-800">{date}</span>
                                                    <span className="text-xs text-slate-500 flex items-center gap-1"><Icons.Clock size={12} />{record.timeSpent || '瞬间完成'}</span>
                                                </div>
                                                {record.note && (
                                                    <p className="text-xs text-slate-600 bg-slate-100/50 p-2 rounded-lg mt-2 border border-slate-200">
                                                        <span className="font-bold">打卡备注：</span>{record.note}
                                                    </p>
                                                )}
                                                {record.attachments && Array.isArray(record.attachments) && record.attachments.length > 0 ? (
                                                    <div className="mt-3 flex overflow-x-auto gap-2 pb-1 hide-scrollbar">
                                                        {record.attachments.map((att, idx) => (
                                                            <div
                                                                key={idx}
                                                                onClick={() => {
                                                                    setPreviewImages(record.attachments.map(a => typeof a === 'string' ? a : (a.data || a.url || '')));
                                                                    setCurrentPreviewIndex(idx);
                                                                    setShowImagePreviewModal(true);
                                                                }}
                                                                className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all relative group"
                                                            >
                                                                <img src={att.data || att.url} alt="Evidence" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                                    <Icons.Eye size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    record.attachmentCount > 0 && (
                                                        <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded">
                                                            <Icons.Paperclip size={12} /> {record.attachmentCount} 个附件 (已归档或无预览)
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            )}
                        </div>
                    </div>

                    <div className="relative z-10 shrink-0 mt-4">
                        {/* Kid Controls */}
                        {appState === 'kid_app' && (() => {
                            const pStatus = getTaskStatusOnDate(previewTask, selectedDate, activeKidId);
                            // Check if there's a saved timer for this task
                            let hasSavedTimer = false;
                            try {
                                const saved = JSON.parse(localStorage.getItem('minilife_timer_state'));
                                if (saved && saved.taskId === previewTask.id && saved.running) hasSavedTimer = true;
                            } catch (e) {}
                            return (
                                <>
                                    {pStatus === 'todo' && (
                                        <div className="flex gap-3 w-full">
                                            <button onClick={() => { setShowPreviewModal(false); setPreviewTask(null); openQuickComplete(previewTask); }} className="flex-1 rounded-2xl py-4 font-black transition-colors flex items-center justify-center gap-1" style={{ background: '#F0EBE1', color: '#5A6E8A' }}>
                                                <Icons.Check className="inline-block mr-1" size={18} /> 快速打卡
                                            </button>
                                            <button onClick={() => { setShowPreviewModal(false); setPreviewTask(null); handleStartTask(previewTask.id); }} className="flex-[2] text-white rounded-2xl py-4 font-black transition-all active:scale-95 flex items-center justify-center gap-1" style={{ background: hasSavedTimer ? '#3B82F6' : '#FF8C42', boxShadow: hasSavedTimer ? '0 4px 14px rgba(59,130,246,0.3)' : '0 4px 14px rgba(255,140,66,0.3)' }}>
                                                <Icons.Play className="inline-block mr-1" size={18} fill="currentColor" /> {hasSavedTimer ? '继续计时' : '开始计时'}
                                            </button>
                                        </div>
                                    )}
                                    {pStatus === 'in_progress' && (
                                        <div className="flex gap-3 w-full">
                                            {hasSavedTimer && (
                                                <button onClick={() => { setShowPreviewModal(false); setPreviewTask(null); handleStartTask(previewTask.id); }} className="flex-1 text-white rounded-2xl py-4 font-black transition-all active:scale-95 flex items-center justify-center gap-1" style={{ background: '#3B82F6', boxShadow: '0 4px 14px rgba(59,130,246,0.3)' }}>
                                                    <Icons.Play className="inline-block mr-1" size={18} fill="currentColor" /> 继续计时
                                                </button>
                                            )}
                                            <button onClick={() => { setShowPreviewModal(false); setPreviewTask(null); handleAttemptSubmit(previewTask); }} className={`${hasSavedTimer ? 'flex-1' : 'w-full'} bg-indigo-100 text-indigo-700 rounded-2xl py-4 font-black flex items-center justify-center gap-2 hover:bg-indigo-200 transition-colors`}>
                                                <Icons.CheckSquare size={20} /> 提交验收
                                            </button>
                                        </div>
                                    )}
                                    {pStatus === 'pending_approval' && (
                                        <div className="w-full bg-orange-50 text-orange-600 border border-orange-200 rounded-2xl py-4 font-black flex items-center justify-center gap-2 cursor-not-allowed">
                                            <Icons.Clock size={20} /> 待家长审核发放奖励...
                                        </div>
                                    )}
                                    {pStatus === 'completed' && (
                                        <div className="w-full bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl py-4 font-black flex items-center justify-center gap-2 cursor-not-allowed">
                                            <Icons.CheckCircle size={20} /> 此任务已完成
                                        </div>
                                    )}
                                </>
                            );
                        })()}

                        {/* Parent Controls */}
                        {appState === 'parent_app' && (
                            <div className="flex gap-2 w-full mt-3 border-t border-slate-100 pt-4">
                                {getTaskStatusOnDate(previewTask, selectedDate, resolvedKidId) === 'pending_approval' ? (
                                    <>
                                        <button onClick={() => { setShowPreviewModal(false); setRejectingTaskInfo({ task: previewTask, dateStr: selectedDate, kidId: resolvedKidId }); setShowRejectModal(true); }} className="flex-1 bg-rose-50 text-rose-600 rounded-xl py-4 font-black hover:bg-rose-100 active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-rose-200">
                                            <Icons.X size={18} strokeWidth={3} /> 打回
                                        </button>
                                        <button onClick={async () => { const t = previewTask; const d = selectedDate; const k = resolvedKidId; setShowPreviewModal(false); setPreviewTask(null); await handleApproveTask(t, d, k); }} className="flex-[2] bg-emerald-500 text-white rounded-xl py-4 font-black shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-1.5">
                                            <Icons.Check size={20} strokeWidth={3} /> 确认通过
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => {
                                            setShowPreviewModal(false);
                                            setEditingTask(previewTask);
                                            setPlanType(previewTask.type || 'study');
                                            setPlanForm({
                                                targetKids: [previewTask.kidId || 'all'],
                                                category: previewTask.category || '技能',
                                                title: previewTask.title,
                                                desc: previewTask.standards || previewTask.desc || '',
                                                startDate: previewTask.startDate || new Date().toISOString().split('T')[0],
                                                endDate: previewTask.repeatConfig?.endDate || '',
                                                repeatType: previewTask.repeatConfig?.type || (previewTask.frequency === '仅当天' ? 'today' : (previewTask.frequency === '每周一至周五' ? 'weekly_custom' : 'daily')),
                                                weeklyDays: previewTask.repeatConfig?.weeklyDays || [1, 2, 3, 4, 5],
                                                ebbStrength: previewTask.repeatConfig?.ebbStrength || 'normal',
                                                periodDaysType: previewTask.repeatConfig?.periodDaysType || 'any',
                                                periodCustomDays: previewTask.repeatConfig?.periodCustomDays || [1, 2, 3, 4, 5],
                                                periodTargetCount: previewTask.repeatConfig?.periodTargetCount || 1,
                                                periodMaxPerDay: previewTask.repeatConfig?.periodMaxPerDay || 1,
                                                timeSetting: previewTask.timeStr && String(previewTask.timeStr) !== '--:--' ? (String(previewTask.timeStr).includes('-') ? 'range' : 'duration') : 'none',
                                                startTime: previewTask.timeStr && String(previewTask.timeStr).includes('-') ? String(previewTask.timeStr).split('-')[0] : '',
                                                endTime: previewTask.timeStr && String(previewTask.timeStr).includes('-') ? String(previewTask.timeStr).split('-')[1] : '',
                                                durationPreset: previewTask.timeStr && String(previewTask.timeStr).includes('分钟') ? parseInt(String(previewTask.timeStr)) : 25,
                                                pointRule: (previewTask.pointRule && previewTask.pointRule === 'custom') || (previewTask.type === 'habit') ? 'custom' : 'default',
                                                reward: String(previewTask.reward ?? ''),
                                                iconEmoji: previewTask.iconEmoji || '📚',
                                                habitColor: previewTask.catColor || 'from-blue-400 to-blue-500',
                                                habitType: previewTask.habitType || 'daily_once',
                                                attachments: previewTask.attachments || [],
                                                requireApproval: previewTask.requireApproval !== undefined ? previewTask.requireApproval : true
                                            });
                                            setShowAddPlanModal(true);
                                        }} className="flex-1 bg-blue-50 text-blue-600 rounded-xl py-3 font-bold hover:bg-blue-100 transition-colors flex justify-center items-center gap-1">
                                            <Icons.Edit3 size={14} /> 编辑
                                        </button>
                                        <button onClick={() => { setShowPreviewModal(false); setDeleteConfirmTask(previewTask); }} className="flex-1 bg-red-50 text-red-500 rounded-xl py-3 font-bold hover:bg-red-100 transition-colors flex justify-center items-center gap-1">
                                            <Icons.Trash2 size={14} /> 删除
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderAddPlanModal = () => {
        if (!showAddPlanModal) return null;

        try {
            // Define color themes for habits
            const habitColors = [
                'from-blue-400 to-blue-500', 'from-indigo-400 to-indigo-500', 'from-purple-400 to-purple-500',
                'from-fuchsia-400 to-fuchsia-500', 'from-rose-400 to-rose-500', 'from-red-400 to-red-500',
                'from-orange-400 to-orange-500', 'from-amber-400 to-amber-500', 'from-green-400 to-green-500',
                'from-emerald-400 to-emerald-500', 'from-teal-400 to-teal-500', 'from-cyan-400 to-cyan-500'
            ];

            const studyEmojis = ['📚', '✏️', '📝', '🧮', '🔬', '💻', '🧠', '🎧', '🎨', '🎵'];
            const habitEmojis = ['⭐', '⏰', '🛏️', '🧹', '🏃', '🍎', '🥛', '🚫', '📱', '🎮'];

            return (
                planType === 'habit' ? (
                /* ═══ HABIT MODAL — full-screen mobile, warm Headspace style ═══ */
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-6 animate-fade-in"
                    style={{ background: 'rgba(27,46,75,0.3)', backdropFilter: 'blur(8px)' }}
                    onClick={() => { setShowAddPlanModal(false); setEditingTask(null); }}>
                    <div className="w-full h-full md:h-auto md:max-h-[85vh] md:max-w-lg flex flex-col md:rounded-3xl overflow-hidden animate-bounce-in"
                        style={{ background: '#FBF7F0' }}
                        onClick={e => e.stopPropagation()}>

                        {/* — Header — */}
                        <div className="shrink-0 px-5 py-4 flex items-center justify-between"
                            style={{ background: '#FFFFFF', borderBottom: '1px solid #F0EBE1' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                    style={{ background: '#4ECDC418', color: '#4ECDC4' }}>🌱</div>
                                <div>
                                    <h2 className="font-black text-base" style={{ color: '#1B2E4B' }}>
                                        {editingTask ? '编辑习惯' : '新建习惯'}
                                    </h2>
                                    <div className="text-[11px] font-bold mt-0.5" style={{ color: '#9CAABE' }}>
                                        {editingTask ? '修改后点击保存' : '培养好习惯，纠正坏习惯'}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => { setShowAddPlanModal(false); setEditingTask(null); }}
                                className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                                style={{ background: '#F0EBE1', color: '#9CAABE' }}>
                                <Icons.X size={18} />
                            </button>
                        </div>

                        {/* — Scrollable Body — */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">

                            {/* Section: 习惯名称 */}
                            <div data-field-error={planFormErrors?.title ? 'title' : undefined}>
                                <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: planFormErrors?.title ? '#EF4444' : '#9CAABE' }}>习惯名称 {planFormErrors?.title && <span className="text-red-500 normal-case">— {planFormErrors.title}</span>}</label>
                                <input
                                    value={planForm.title}
                                    onChange={e => { setPlanForm({ ...planForm, title: e.target.value }); if (planFormErrors?.title) setPlanFormErrors(prev => ({ ...prev, title: undefined })); }}
                                    placeholder="例如：早起、阅读、不玩手机"
                                    className={`w-full rounded-xl px-4 py-3 outline-none font-bold text-base transition-all ${planFormErrors?.title ? 'animate-shake' : ''}`}
                                    style={{ background: '#FFFFFF', border: `1.5px solid ${planFormErrors?.title ? '#EF4444' : '#F0EBE1'}`, color: '#1B2E4B' }}
                                    onFocus={e => e.target.style.borderColor = planFormErrors?.title ? '#EF4444' : '#4ECDC4'}
                                    onBlur={e => e.target.style.borderColor = planFormErrors?.title ? '#EF4444' : '#F0EBE1'}
                                />
                            </div>

                            {/* Section: 外观 — Icon + Color + Preview grouped */}
                            <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                                {/* Live Preview */}
                                <div className={`rounded-2xl bg-gradient-to-br ${planForm.habitColor} p-4 flex items-center gap-3 text-white mb-4 relative overflow-hidden`}
                                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-x-6 -translate-y-6"></div>
                                    <div className="text-3xl flex items-center justify-center bg-white/20 w-14 h-14 rounded-2xl backdrop-blur-sm shrink-0 relative z-10">
                                        {planForm.iconEmoji}
                                    </div>
                                    <div className="flex-1 min-w-0 relative z-10">
                                        <div className="font-black text-base leading-tight truncate">{planForm.title || '习惯名称'}</div>
                                        <div className="text-white/70 text-[11px] font-bold mt-0.5">
                                            {planForm.habitType === 'daily_once' ? '每日打卡' : '多次记录'} · {planForm.habitRewardType === 'penalty' ? '坏习惯' : '好习惯'}
                                        </div>
                                    </div>
                                </div>

                                {/* Icon Picker */}
                                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#9CAABE' }}>选择图标</label>
                                <div className="flex flex-wrap gap-1.5 pb-2 mb-3">
                                    {habitEmojis.map(e => (
                                        <button key={e} onClick={() => setPlanForm({ ...planForm, iconEmoji: e })}
                                            className={`text-xl p-2 rounded-xl transition-all ${planForm.iconEmoji === e ? 'bg-white shadow-md scale-110' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                                            style={planForm.iconEmoji === e ? { boxShadow: '0 0 0 2px #4ECDC4' } : {}}>{e}</button>
                                    ))}
                                </div>

                                {/* Color Picker */}
                                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#9CAABE' }}>主题颜色</label>
                                <div className="flex flex-wrap gap-2 pb-1">
                                    {habitColors.map(color => (
                                        <button key={color} onClick={() => setPlanForm({ ...planForm, habitColor: color })}
                                            className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} transition-all relative overflow-hidden
                                            ${planForm.habitColor === color ? 'scale-110 ring-2 ring-offset-2' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                                            style={planForm.habitColor === color ? { ringColor: '#1B2E4B' } : {}}>
                                            {planForm.habitColor === color && <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white"><Icons.Check size={14} /></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Section: 指派给谁 (hidden when only one kid) */}
                            {kids.length > 1 && (
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#9CAABE' }}>指派给谁</label>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setPlanForm({ ...planForm, targetKids: ['all'] })}
                                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                                        style={(!planForm.targetKids || planForm.targetKids.includes('all'))
                                            ? { background: '#4ECDC4', color: '#fff', boxShadow: '0 2px 8px rgba(78,205,196,0.3)' }
                                            : { background: '#F0EBE1', color: '#5A6E8A' }}>
                                        👥 全部
                                    </button>
                                    {kids.map(k => {
                                        const isSelected = (!planForm.targetKids || planForm.targetKids.includes('all')) || planForm.targetKids.includes(k.id);
                                        return (
                                            <button key={k.id}
                                                onClick={() => {
                                                    let nt = (!planForm.targetKids || planForm.targetKids.includes('all')) ? [] : [...planForm.targetKids];
                                                    if (nt.includes(k.id)) { nt = nt.filter(id => id !== k.id); } else { nt.push(k.id); }
                                                    if (nt.length === 0) nt = ['all'];
                                                    if (nt.length === kids.length && kids.length > 0) nt = ['all'];
                                                    setPlanForm({ ...planForm, targetKids: nt });
                                                }}
                                                className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                                                style={isSelected && planForm.targetKids && !planForm.targetKids.includes('all')
                                                    ? { background: '#4ECDC4', color: '#fff', boxShadow: '0 2px 8px rgba(78,205,196,0.3)' }
                                                    : (!planForm.targetKids || planForm.targetKids.includes('all'))
                                                        ? { background: 'rgba(78,205,196,0.1)', color: '#4ECDC4' }
                                                        : { background: '#F0EBE1', color: '#5A6E8A' }}>
                                                <div className="w-5 h-5 rounded-full overflow-hidden shrink-0"><AvatarDisplay avatar={k.avatar} /></div>
                                                <span className="truncate">{k.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            )}

                            {/* Section: 好坏习惯 + 频率 + 金币 — grouped */}
                            <div className="rounded-2xl p-4 space-y-4" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>

                                {/* 好/坏习惯 */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#9CAABE' }}>习惯类型</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => setPlanForm({ ...planForm, habitRewardType: 'reward' })}
                                            className="flex-1 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-1.5 active:scale-95"
                                            style={planForm.habitRewardType === 'reward'
                                                ? { background: '#4ECDC4', color: '#fff', boxShadow: '0 2px 10px rgba(78,205,196,0.3)' }
                                                : { background: '#F0EBE1', color: '#5A6E8A' }}>
                                            <Icons.ThumbsUp size={14} /> 好习惯
                                        </button>
                                        <button onClick={() => setPlanForm({ ...planForm, habitRewardType: 'penalty' })}
                                            className="flex-1 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-1.5 active:scale-95"
                                            style={planForm.habitRewardType === 'penalty'
                                                ? { background: '#FF6B6B', color: '#fff', boxShadow: '0 2px 10px rgba(255,107,107,0.3)' }
                                                : { background: '#F0EBE1', color: '#5A6E8A' }}>
                                            <Icons.ThumbsDown size={14} /> 坏习惯
                                        </button>
                                    </div>
                                </div>

                                {/* 频率 */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#9CAABE' }}>打卡频率</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => setPlanForm({ ...planForm, habitType: 'daily_once' })}
                                            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                                            style={planForm.habitType === 'daily_once'
                                                ? { background: 'rgba(78,205,196,0.12)', color: '#2BA8A0', boxShadow: 'inset 0 0 0 1.5px rgba(78,205,196,0.3)' }
                                                : { background: '#F0EBE1', color: '#5A6E8A' }}>
                                            每日一次
                                        </button>
                                        <button onClick={() => setPlanForm({ ...planForm, habitType: 'multiple' })}
                                            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                                            style={planForm.habitType === 'multiple'
                                                ? { background: 'rgba(78,205,196,0.12)', color: '#2BA8A0', boxShadow: 'inset 0 0 0 1.5px rgba(78,205,196,0.3)' }
                                                : { background: '#F0EBE1', color: '#5A6E8A' }}>
                                            多次记录
                                        </button>
                                    </div>
                                </div>

                                {/* 多次记录 — 上限设置 */}
                                {planForm.habitType === 'multiple' && (
                                    <div className="space-y-3 pt-1 animate-fade-in">
                                        <div className="flex gap-2">
                                            <button onClick={() => setPlanForm({ ...planForm, periodMaxType: 'daily' })}
                                                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                                                style={planForm.periodMaxType === 'daily'
                                                    ? { background: 'rgba(78,205,196,0.12)', color: '#2BA8A0', boxShadow: 'inset 0 0 0 1.5px rgba(78,205,196,0.3)' }
                                                    : { background: '#F0EBE1', color: '#5A6E8A' }}>
                                                每日上限
                                            </button>
                                            <button onClick={() => setPlanForm({ ...planForm, periodMaxType: 'weekly' })}
                                                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                                                style={planForm.periodMaxType === 'weekly'
                                                    ? { background: 'rgba(78,205,196,0.12)', color: '#2BA8A0', boxShadow: 'inset 0 0 0 1.5px rgba(78,205,196,0.3)' }
                                                    : { background: '#F0EBE1', color: '#5A6E8A' }}>
                                                每周上限
                                            </button>
                                        </div>
                                        {/* Stepper: 最多次数 */}
                                        <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: '#fff', border: '1px solid #F0EBE1' }}>
                                            <span className="text-sm font-bold" style={{ color: '#1B2E4B' }}>最多打卡次数</span>
                                            <div className="flex items-center gap-0">
                                                <button onClick={() => setPlanForm({ ...planForm, periodMaxPerDay: Math.max(2, (planForm.periodMaxPerDay || 3) - 1) })}
                                                    className="w-9 h-9 rounded-l-xl flex items-center justify-center text-lg font-bold transition-all active:scale-90"
                                                    style={{ background: '#F0EBE1', color: '#5A6E8A' }}>−</button>
                                                <div className="w-12 h-9 flex items-center justify-center text-base font-black"
                                                    style={{ background: '#FBF7F0', color: '#1B2E4B', borderTop: '1px solid #F0EBE1', borderBottom: '1px solid #F0EBE1' }}>
                                                    {planForm.periodMaxPerDay || 3}
                                                </div>
                                                <button onClick={() => setPlanForm({ ...planForm, periodMaxPerDay: Math.min(99, (planForm.periodMaxPerDay || 3) + 1) })}
                                                    className="w-9 h-9 rounded-r-xl flex items-center justify-center text-lg font-bold transition-all active:scale-90"
                                                    style={{ background: '#4ECDC4', color: '#fff' }}>+</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 金币奖惩 — full width stepper */}
                                <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: '#fff', border: '1px solid #F0EBE1' }}>
                                    <span className="text-sm font-bold" style={{ color: '#1B2E4B' }}>
                                        每次{planForm.habitRewardType === 'penalty' ? '扣' : '奖'} ⭐ 家庭币
                                    </span>
                                    <div className="flex items-center gap-0">
                                        <button onClick={() => setPlanForm({ ...planForm, reward: Math.max(0, (parseInt(planForm.reward) || 5) - 1).toString() })}
                                            className="w-9 h-9 rounded-l-xl flex items-center justify-center text-lg font-bold transition-all active:scale-90"
                                            style={{ background: '#F0EBE1', color: '#5A6E8A' }}>−</button>
                                        <div className="w-12 h-9 flex items-center justify-center text-base font-black"
                                            style={{ background: '#FBF7F0', color: '#1B2E4B', borderTop: '1px solid #F0EBE1', borderBottom: '1px solid #F0EBE1' }}>
                                            {Math.abs(planForm.reward || 5)}
                                        </div>
                                        <button onClick={() => setPlanForm({ ...planForm, reward: ((parseInt(planForm.reward) || 5) + 1).toString() })}
                                            className="w-9 h-9 rounded-r-xl flex items-center justify-center text-lg font-bold transition-all active:scale-90"
                                            style={{ background: '#4ECDC4', color: '#fff' }}>+</button>
                                    </div>
                                </div>
                            </div>


                            {/* Section: History (edit mode only) */}
                            {(() => {
                                try {
                                    if (!editingTask || !editingTask.history || typeof editingTask.history !== 'object' || Array.isArray(editingTask.history) || Object.keys(editingTask.history).length === 0) return null;
                                    const allEntries = [];
                                    Object.entries(editingTask.history).sort((a, b) => new Date(b[0]) - new Date(a[0])).forEach(([dateStr, kidRecords]) => {
                                        if (!kidRecords || typeof kidRecords !== 'object' || Array.isArray(kidRecords)) return;
                                        Object.entries(kidRecords).forEach(([kidId, record]) => {
                                            if (!record || typeof record !== 'object') return;
                                            const kUser = kids.find(k => String(k.id) === String(kidId));
                                            if (kUser) allEntries.push({ dateStr, kidId, record, kUser });
                                        });
                                    });
                                    if (allEntries.length === 0) return null;
                                    const statusMap = { completed: { label: '✅' }, pending: { label: '⏳' }, pending_approval: { label: '⏳' }, failed: { label: '❌' }, todo: { label: '⬜' } };
                                    return (
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#9CAABE' }}>
                                                <Icons.Clock size={12} /> 打卡记录 · {allEntries.length}条
                                            </label>
                                            <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                                                <div className="max-h-[160px] overflow-y-auto">
                                                    {allEntries.map((e, idx) => {
                                                        const s = statusMap[e.record.status] || statusMap.todo;
                                                        return (
                                                            <div key={`${e.dateStr}-${e.kidId}-${idx}`}
                                                                className="flex items-center gap-2 px-3.5 py-2.5 text-xs"
                                                                style={idx < allEntries.length - 1 ? { borderBottom: '1px solid #F0EBE1' } : {}}>
                                                                <span className="font-mono font-bold shrink-0" style={{ color: '#9CAABE' }}>{e.dateStr.slice(5)}</span>
                                                                <span className="font-bold truncate" style={{ color: '#1B2E4B' }}>{e.kUser.name}</span>
                                                                <span className="ml-auto shrink-0">{s.label}</span>
                                                                {e.record.status !== 'todo' && e.record.status !== 'failed' && (
                                                                    <button onClick={() => handleRejectTask(editingTask, e.dateStr, e.kidId)}
                                                                        className="text-[10px] font-bold px-2 py-1 rounded-lg transition-all active:scale-90 shrink-0"
                                                                        style={{ background: 'rgba(255,107,107,0.1)', color: '#FF6B6B' }}>打回</button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } catch (err) { return null; }
                            })()}
                        </div>

                        {/* — Footer — */}
                        <div className="shrink-0 px-5 py-4 pb-8 md:pb-4 flex gap-3" style={{ background: '#FFFFFF', borderTop: '1px solid #F0EBE1', paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))' }}>
                            <button onClick={() => { setShowAddPlanModal(false); setEditingTask(null); }}
                                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                                style={{ background: '#F0EBE1', color: '#5A6E8A' }}>
                                取消
                            </button>
                            <button onClick={handleSavePlan}
                                className="flex-[2] py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-1.5 transition-all active:scale-95"
                                style={{ background: '#4ECDC4', boxShadow: '0 4px 15px rgba(78,205,196,0.35)' }}>
                                <Icons.Save size={16} /> {editingTask ? '保存修改' : '保存习惯'}
                            </button>
                        </div>
                    </div>
                </div>
                ) : (
                /* ═══ STUDY TASK MODAL — warm Headspace style (matches habit) ═══ */
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-6 animate-fade-in"
                    style={{ background: 'rgba(27,46,75,0.3)', backdropFilter: 'blur(8px)' }}
                    onClick={() => { setShowAddPlanModal(false); setEditingTask(null); }}>
                    <div className="w-full h-full md:h-auto md:max-h-[85vh] md:max-w-lg flex flex-col md:rounded-3xl overflow-hidden animate-bounce-in"
                        style={{ background: '#FBF7F0' }}
                        onClick={e => e.stopPropagation()}>

                        {/* — Header — */}
                        <div className="shrink-0 px-5 py-4 flex items-center justify-between"
                            style={{ background: '#FFFFFF', borderBottom: '1px solid #F0EBE1' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                    style={{ background: '#FF8C4218', color: '#FF8C42' }}>📝</div>
                                <div>
                                    <h2 className="font-black text-base" style={{ color: '#1B2E4B' }}>
                                        {editingTask ? '编辑任务' : '新建任务'}
                                    </h2>
                                    <div className="text-[11px] font-bold mt-0.5" style={{ color: '#9CAABE' }}>
                                        {editingTask ? '修改后点击保存' : '布置任务，让孩子赚取家庭币'}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => { setShowAddPlanModal(false); setEditingTask(null); }}
                                className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                                style={{ background: '#F0EBE1', color: '#9CAABE' }}>
                                <Icons.X size={18} />
                            </button>
                        </div>

                        {/* — Scrollable Body — */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">


                            {planType === 'study' && (
                                <div className="space-y-5 animate-fade-in relative z-0">

                                    {/* 任务名称 */}
                                    <div data-field-error={planFormErrors?.title ? 'title' : undefined}>
                                        <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: planFormErrors?.title ? '#EF4444' : '#9CAABE' }}>任务名称 {planFormErrors?.title && <span className="text-red-500 normal-case">— {planFormErrors.title}</span>}</label>
                                        <input
                                            value={planForm.title}
                                            onChange={e => { setPlanForm({ ...planForm, title: e.target.value }); if (planFormErrors?.title) setPlanFormErrors(prev => ({ ...prev, title: undefined })); }}
                                            placeholder="例如：练字30分钟、阅读打卡"
                                            className={`w-full rounded-xl px-4 py-3 outline-none font-bold text-base transition-all ${planFormErrors?.title ? 'animate-shake' : ''}`}
                                            style={{ background: '#FFFFFF', border: `1.5px solid ${planFormErrors?.title ? '#EF4444' : '#F0EBE1'}`, color: '#1B2E4B' }}
                                            onFocus={e => e.target.style.borderColor = planFormErrors?.title ? '#EF4444' : '#FF8C42'}
                                            onBlur={e => e.target.style.borderColor = planFormErrors?.title ? '#EF4444' : '#F0EBE1'}
                                        />
                                    </div>

                                    {/* 任务说明 */}
                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#9CAABE' }}>任务说明 <span style={{ color: '#C0C8D4' }}>(可选)</span></label>
                                        <textarea
                                            value={planForm.desc}
                                            onChange={e => setPlanForm({ ...planForm, desc: e.target.value })}
                                            placeholder="描述任务的具体要求或标准..."
                                            className="w-full rounded-xl px-4 py-3 outline-none font-bold text-sm transition-all resize-y min-h-[70px]"
                                            style={{ background: '#FFFFFF', border: '1.5px solid #F0EBE1', color: '#1B2E4B' }}
                                            onFocus={e => e.target.style.borderColor = '#FF8C42'}
                                            onBlur={e => e.target.style.borderColor = '#F0EBE1'}
                                        />
                                    </div>

                                    {/* 指派给谁 (hidden when only one kid) */}
                                    {kids.length > 1 && (
                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#9CAABE' }}>指派给谁</label>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => setPlanForm({ ...planForm, targetKids: ['all'] })}
                                                className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 active:scale-95"
                                                style={(!planForm.targetKids || planForm.targetKids.includes('all'))
                                                    ? { background: '#FF8C42', color: '#fff', boxShadow: '0 4px 14px rgba(255,140,66,0.3)' }
                                                    : { background: '#fff', color: '#5A6E8A', border: '1.5px solid #F0EBE1' }}
                                            >
                                                👥 全部
                                            </button>
                                            {kids.map(k => {
                                                const isSelected = (!planForm.targetKids || planForm.targetKids.includes('all')) || planForm.targetKids.includes(k.id);
                                                const isExplicit = isSelected && (planForm.targetKids && !planForm.targetKids.includes('all'));
                                                return (
                                                    <button
                                                        key={k.id}
                                                        onClick={() => {
                                                            let newTargets = (!planForm.targetKids || planForm.targetKids.includes('all')) ? [] : [...planForm.targetKids];
                                                            if (newTargets.includes(k.id)) {
                                                                newTargets = newTargets.filter(id => id !== k.id);
                                                            } else {
                                                                newTargets.push(k.id);
                                                            }
                                                            if (newTargets.length === 0) newTargets = ['all'];
                                                            if (newTargets.length === kids.length && kids.length > 0) newTargets = ['all'];
                                                            setPlanForm({ ...planForm, targetKids: newTargets });
                                                        }}
                                                        className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 active:scale-95"
                                                        style={isExplicit
                                                            ? { background: '#FF8C42', color: '#fff', boxShadow: '0 4px 14px rgba(255,140,66,0.3)' }
                                                            : ((!planForm.targetKids || planForm.targetKids.includes('all'))
                                                                ? { background: '#FFF3E8', color: '#FF8C42', border: '1.5px solid #FFD4AD' }
                                                                : { background: '#fff', color: '#5A6E8A', border: '1.5px solid #F0EBE1' })}
                                                    >
                                                        <div className="w-5 h-5 flex flex-shrink-0 items-center justify-center rounded-full overflow-hidden"><AvatarDisplay avatar={k.avatar} /></div> <span className="truncate">{k.name}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    )}

                                    {/* 分类 — P9 enhanced with inline custom category input */}
                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#9CAABE' }}>分类</label>
                                        {/* Category chip grid */}
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {[...allCategories, ...(parentSettings.customCategories || []).filter(c => !allCategories.includes(c))].map(c => (
                                                <button key={c}
                                                    onClick={() => setPlanForm({ ...planForm, category: c, iconName: getIconForCategory(c) })}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${planForm.category === c
                                                        ? 'text-white shadow-md scale-105'
                                                        : 'bg-white hover:shadow-sm active:scale-95'
                                                    }`}
                                                    style={planForm.category === c
                                                        ? { background: getCatHexColor(c), borderColor: getCatHexColor(c) }
                                                        : { borderColor: '#F0EBE1', color: '#5A6E8A' }
                                                    }
                                                >
                                                    {c}
                                                    {/* Show delete badge for custom categories */}
                                                    {(parentSettings.customCategories || []).includes(c) && planForm.category !== c && (
                                                        <span onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm(`删除自定义分类"${c}"？`)) {
                                                                setParentSettings(prev => ({
                                                                    ...prev,
                                                                    customCategories: (prev.customCategories || []).filter(cc => cc !== c)
                                                                }));
                                                            }
                                                        }} className="ml-1 text-slate-300 hover:text-red-400 inline-flex items-center">×</span>
                                                    )}
                                                </button>
                                            ))}
                                            {/* Add custom category button/input */}
                                            {planForm._addingCategory ? (
                                                <div className="flex items-center gap-1 animate-fade-in">
                                                    <input
                                                        autoFocus
                                                        value={planForm._newCategoryName || ''}
                                                        onChange={e => setPlanForm({ ...planForm, _newCategoryName: e.target.value.substring(0, 6) })}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter' && planForm._newCategoryName?.trim()) {
                                                                const newCat = planForm._newCategoryName.trim();
                                                                setParentSettings(prev => ({
                                                                    ...prev,
                                                                    customCategories: [...new Set([...(prev.customCategories || []), newCat])]
                                                                }));
                                                                setPlanForm({ ...planForm, category: newCat, iconName: getIconForCategory(newCat), _addingCategory: false, _newCategoryName: '' });
                                                            } else if (e.key === 'Escape') {
                                                                setPlanForm({ ...planForm, _addingCategory: false, _newCategoryName: '' });
                                                            }
                                                        }}
                                                        onBlur={() => {
                                                            if (planForm._newCategoryName?.trim()) {
                                                                const newCat = planForm._newCategoryName.trim();
                                                                setParentSettings(prev => ({
                                                                    ...prev,
                                                                    customCategories: [...new Set([...(prev.customCategories || []), newCat])]
                                                                }));
                                                                setPlanForm({ ...planForm, category: newCat, iconName: getIconForCategory(newCat), _addingCategory: false, _newCategoryName: '' });
                                                            } else {
                                                                setPlanForm({ ...planForm, _addingCategory: false, _newCategoryName: '' });
                                                            }
                                                        }}
                                                        placeholder="输入分类名"
                                                        className="w-20 rounded-full px-3 py-1.5 text-xs font-bold outline-none"
                                                        style={{ border: '1.5px solid #FF8C42', color: '#1B2E4B' }}
                                                    />
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setPlanForm({ ...planForm, _addingCategory: true, _newCategoryName: '' })}
                                                    className="px-3 py-1.5 rounded-full text-xs font-bold border border-dashed transition-all hover:border-orange-300 hover:text-orange-500 active:scale-95"
                                                    style={{ borderColor: '#D0C9BD', color: '#9CAABE' }}
                                                >
                                                    ➕ 自定义
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            )}


                            {/* 任务安排 */}
                            {planType === 'study' && (
                                <div className="rounded-2xl p-4 space-y-4" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider mb-3 block" style={{ color: '#9CAABE' }}>任务安排</label>

                                        {/* Quick Chips for Repeat Type */}
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {[
                                                { v: 'today', l: '仅今天', d: '只在今天出现一次' },
                                                { v: 'daily', l: '每天', d: '每天都需要完成' },
                                                { v: 'weekly_custom', l: '每周固定', d: '选择每周哪几天执行' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.v}
                                                    onClick={() => setPlanForm({ ...planForm, repeatType: opt.v })}
                                                    className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                                                    style={planForm.repeatType === opt.v
                                                        ? { background: '#FF8C42', color: '#fff', boxShadow: '0 4px 14px rgba(255,140,66,0.3)' }
                                                        : { background: '#FBF7F0', color: '#5A6E8A', border: '1.5px solid #F0EBE1' }}
                                                >
                                                    {opt.l}
                                                </button>
                                            ))}
                                            <select
                                                value={!['today', 'daily', 'weekly_custom'].includes(planForm.repeatType) ? planForm.repeatType : ''}
                                                onChange={e => { if (e.target.value) setPlanForm({ ...planForm, repeatType: e.target.value }) }}
                                                className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all outline-none appearance-none"
                                                style={!['today', 'daily', 'weekly_custom'].includes(planForm.repeatType)
                                                    ? { background: '#FF8C42', color: '#fff', boxShadow: '0 4px 14px rgba(255,140,66,0.3)' }
                                                    : { background: '#FBF7F0', color: '#5A6E8A', border: '1.5px solid #F0EBE1' }}
                                            >
                                                <option value="" disabled>更多安排...</option>
                                                <option value="biweekly_custom">隔周重复（按双周）</option>
                                                <option value="ebbinghaus">记忆曲线（艾宾浩斯）</option>
                                                <option value="weekly_1">本周内完成（可选次数）</option>
                                                <option value="biweekly_1">本双周内完成（可选次数）</option>
                                                <option value="monthly_1">本月内完成（可选次数）</option>
                                                <option value="every_week_1">每周循环完成（可选次数）</option>
                                                <option value="every_biweek_1">每双周循环完成（可选次数）</option>
                                                <option value="every_month_1">每月循环完成（可选次数）</option>
                                            </select>
                                        </div>
                                        {/* P3: 安排说明小字 */}
                                        <div className="text-[11px] font-medium mb-1 px-1" style={{ color: '#9CAABE' }}>
                                            {planForm.repeatType === 'today' && '📌 任务仅在今天出现，完成后不再重复'}
                                            {planForm.repeatType === 'daily' && '🔁 任务会每天出现，直到设定的结束日期'}
                                            {planForm.repeatType === 'weekly_custom' && '📅 选择每周的固定日期来执行此任务'}
                                            {planForm.repeatType === 'biweekly_custom' && '📅 每隔一周执行，适合交替安排的任务'}
                                            {planForm.repeatType === 'ebbinghaus' && '🧠 按遗忘曲线安排复习，适合记忆类任务'}
                                            {planForm.repeatType?.includes('weekly_1') && '🎯 在本周的任意时间完成指定次数'}
                                            {planForm.repeatType?.includes('biweekly_1') && '🎯 在本双周内的任意时间完成指定次数'}
                                            {planForm.repeatType?.includes('monthly_1') && '🎯 在本月内的任意时间完成指定次数'}
                                            {planForm.repeatType?.includes('every_week_1') && '🔄 每周循环，在每周内完成指定次数'}
                                            {planForm.repeatType?.includes('every_biweek_1') && '🔄 每双周循环，在每个双周内完成指定次数'}
                                            {planForm.repeatType?.includes('every_month_1') && '🔄 每月循环，在每月内完成指定次数'}
                                        </div>

                                        {/* Dynamic Sub-configs based on Repeat Type */}
                                        <div className="mt-3 space-y-4">
                                            {/* Date range */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="w-full min-w-0">
                                                    <label className="text-[10px] font-bold mb-1.5 block" style={{ color: '#9CAABE' }}>开始日期</label>
                                                    <input type="date" value={planForm.startDate} onChange={e => setPlanForm({ ...planForm, startDate: e.target.value })}
                                                        className="w-full box-border rounded-xl px-3 py-2.5 outline-none font-bold text-xs appearance-none"
                                                        style={{ background: '#FBF7F0', border: '1.5px solid #F0EBE1', color: '#1B2E4B' }} />
                                                </div>
                                                {planForm.repeatType !== 'today' && (
                                                    <div className="w-full min-w-0">
                                                        <label className="text-[10px] font-bold mb-1.5 block" style={{ color: '#9CAABE' }}>结束日期 <span style={{ color: '#C0C8D4' }}>(可选)</span></label>
                                                        <input type="date" value={planForm.endDate} onChange={e => setPlanForm({ ...planForm, endDate: e.target.value })}
                                                            className="w-full box-border rounded-xl px-3 py-2.5 outline-none font-bold text-xs appearance-none"
                                                            style={{ background: '#FBF7F0', border: '1.5px solid #F0EBE1', color: '#1B2E4B' }} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Weekly & Bi-weekly Literal Days selector */}
                                            {(planForm.repeatType === 'weekly_custom' || planForm.repeatType === 'biweekly_custom') && (
                                                <div className="animate-fade-in bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <label className="text-xs font-bold text-slate-600">在以下星期几重复？</label>
                                                        <div className="flex gap-2 text-xs">
                                                            <button onClick={() => setPlanForm({ ...planForm, weeklyDays: [1, 2, 3, 4, 5] })} className="text-blue-600 bg-blue-100/50 px-2 py-1 rounded hover:bg-blue-100">工作日</button>
                                                            <button onClick={() => setPlanForm({ ...planForm, weeklyDays: [6, 7] })} className="text-orange-600 bg-orange-100/50 px-2 py-1 rounded hover:bg-orange-100">周末</button>
                                                            <button onClick={() => setPlanForm({ ...planForm, weeklyDays: [1, 2, 3, 4, 5, 6, 7] })} className="text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded hover:bg-emerald-100">每天</button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-7 gap-1 mt-2">
                                                        {[{ d: 1, l: '一' }, { d: 2, l: '二' }, { d: 3, l: '三' }, { d: 4, l: '四' }, { d: 5, l: '五' }, { d: 6, l: '六' }, { d: 7, l: '日' }].map(w => {
                                                            const isSelected = planForm.weeklyDays?.includes(w.d);
                                                            return (
                                                                <button key={w.d} onClick={() => {
                                                                    const newDays = isSelected ? planForm.weeklyDays.filter(d => d !== w.d) : [...(planForm.weeklyDays || []), w.d];
                                                                    setPlanForm({ ...planForm, weeklyDays: newDays });
                                                                }} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold transition-all shadow-sm flex items-center justify-center text-xs sm:text-sm mx-auto ${isSelected ? 'bg-blue-600 text-white shadow-blue-600/30' : 'bg-white text-slate-500 hover:border-blue-400 border border-slate-200'}`}>
                                                                    {w.l}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Ebbinghaus Config */}
                                            {planForm.repeatType === 'ebbinghaus' && (
                                                <div className="animate-fade-in bg-purple-50 p-4 rounded-2xl border border-purple-100">
                                                    <label className="block text-xs font-bold text-purple-800 mb-3">复习强度</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {[{ v: 'gentle', l: '温柔强度', d: '第1,3,7,14,30天' }, { v: 'normal', l: '一般强度', d: '第1,2,4,7,15,30天' }, { v: 'exam', l: '考前强度', d: '第1,2,3,5,7,10,14天' }, { v: 'enhanced', l: '增强模式', d: '密集的9次复习' }].map(eb => (
                                                            <button key={eb.v} onClick={() => setPlanForm({ ...planForm, ebbStrength: eb.v })} className={`p-3 rounded-xl border-2 text-left transition-all ${planForm.ebbStrength === eb.v ? 'border-purple-500 bg-white shadow-sm ring-2 ring-purple-500/20' : 'border-transparent bg-white/50 hover:bg-white text-slate-500'}`}>
                                                                <div className={`font-bold text-sm mb-1 ${planForm.ebbStrength === eb.v ? 'text-purple-700' : 'text-slate-600'}`}>{eb.l}</div>
                                                                <div className="text-[10px] leading-tight opacity-70">{eb.d}</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* N-times Period Goals */}
                                            {(planForm.repeatType.includes('_1') || planForm.repeatType.includes('_n')) && (
                                                <div className="animate-fade-in bg-orange-50/50 p-4 rounded-2xl border border-orange-100 space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-600 mb-2">该周期内需完成几次？</label>
                                                            <input type="number" min="1" max="99" value={planForm.periodTargetCount} onChange={e => setPlanForm({ ...planForm, periodTargetCount: Math.max(1, parseInt(e.target.value) || 1) })} className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-orange-500 font-bold bg-white text-orange-700" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-600 mb-2">每次奖励上限次数 <span className="opacity-50">(防刷)</span></label>
                                                            <input type="number" min="1" max="10" value={planForm.periodMaxPerDay} onChange={e => setPlanForm({ ...planForm, periodMaxPerDay: Math.max(1, parseInt(e.target.value) || 1) })} className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-orange-500 font-bold bg-white text-orange-700" />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-2">允许执行的日期限制</label>
                                                        <select value={planForm.periodDaysType} onChange={e => setPlanForm({ ...planForm, periodDaysType: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-orange-500 font-bold text-base text-slate-700 appearance-none">
                                                            <option value="any">⏳ 任意时间都可以完成</option>
                                                            <option value="workdays">💼 仅限工作日完成</option>
                                                            <option value="weekends">🎉 仅限周末完成</option>
                                                            <option value="custom">⚙️ 自定义每周哪几天</option>
                                                        </select>
                                                        {planForm.periodDaysType === 'custom' && (
                                                            <div className="grid grid-cols-7 gap-1 mt-3 bg-white p-2 rounded-xl border border-slate-100">
                                                                {[{ d: 1, l: '一' }, { d: 2, l: '二' }, { d: 3, l: '三' }, { d: 4, l: '四' }, { d: 5, l: '五' }, { d: 6, l: '六' }, { d: 7, l: '日' }].map(w => {
                                                                    const isSelected = planForm.periodCustomDays?.includes(w.d);
                                                                    return (
                                                                        <button key={w.d} onClick={() => {
                                                                            const newDays = isSelected ? planForm.periodCustomDays.filter(d => d !== w.d) : [...(planForm.periodCustomDays || []), w.d];
                                                                            setPlanForm({ ...planForm, periodCustomDays: newDays });
                                                                        }} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold transition-all flex items-center justify-center text-xs sm:text-sm mx-auto ${isSelected ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                                                                            {w.l}
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Advanced Time Configuration Toggle */}
                                    <div className="pt-2">
                                        {planForm.timeSetting === 'none' ? (
                                            <button
                                                onClick={() => setPlanForm({ ...planForm, timeSetting: 'range' })}
                                                className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-bold hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Icons.Plus size={18} /> 添加具体时间要求 (可选)
                                            </button>
                                        ) : (
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4 animate-fade-in relative">
                                                <button
                                                    onClick={() => setPlanForm({ ...planForm, timeSetting: 'none', startTime: '', endTime: '', durationPreset: null })}
                                                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-white transition-colors"
                                                    title="移除时间要求"
                                                >
                                                    <Icons.Trash2 size={16} />
                                                </button>

                                                <label className="flex items-center gap-2 text-sm font-black text-slate-800">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Icons.Clock size={16} /></div>
                                                    时间要求
                                                </label>

                                                <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 w-full mb-2">
                                                    <button onClick={() => setPlanForm({ ...planForm, timeSetting: 'range' })} className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${planForm.timeSetting === 'range' ? 'bg-blue-600 shadow text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                                                        指定时段
                                                    </button>
                                                    <button onClick={() => setPlanForm({ ...planForm, timeSetting: 'duration' })} className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${planForm.timeSetting === 'duration' ? 'bg-emerald-500 shadow text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                                                        要求时长
                                                    </button>
                                                </div>

                                                {planForm.timeSetting === 'range' && (
                                                    <div className="animate-fade-in" data-field-error={planFormErrors?.time ? 'time' : undefined}>
                                                        {planFormErrors?.time && <div className="text-xs font-bold text-red-500 mb-2 flex items-center gap-1">⚠️ {planFormErrors.time}</div>}
                                                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                                                            <div className="w-full min-w-0">
                                                                <label className="block text-xs font-bold mb-2 truncate" style={{ color: planFormErrors?.time ? '#EF4444' : '#475569' }}>开始时间</label>
                                                                <input type="time" value={planForm.startTime} onChange={e => { setPlanForm({ ...planForm, startTime: e.target.value }); if (planFormErrors?.time) setPlanFormErrors(prev => ({ ...prev, time: undefined })); }} className={`w-full box-border rounded-xl px-2 py-2.5 outline-none focus:border-blue-500 font-bold bg-white text-xs sm:text-sm appearance-none ${planFormErrors?.time ? 'animate-shake' : ''}`} style={{ border: `2px solid ${planFormErrors?.time ? '#EF4444' : '#e2e8f0'}` }} />
                                                            </div>
                                                            <div className="w-full min-w-0">
                                                                <label className="block text-xs font-bold mb-2 truncate" style={{ color: planFormErrors?.time ? '#EF4444' : '#475569' }}>结束时间</label>
                                                                <input type="time" value={planForm.endTime} onChange={e => { setPlanForm({ ...planForm, endTime: e.target.value }); if (planFormErrors?.time) setPlanFormErrors(prev => ({ ...prev, time: undefined })); }} className={`w-full box-border rounded-xl px-2 py-2.5 outline-none focus:border-blue-500 font-bold bg-white text-xs sm:text-sm appearance-none ${planFormErrors?.time ? 'animate-shake' : ''}`} style={{ border: `2px solid ${planFormErrors?.time ? '#EF4444' : '#e2e8f0'}` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {planForm.timeSetting === 'duration' && (
                                                    <div className="animate-fade-in space-y-4 pt-2">
                                                        <div>
                                                            <span className="text-xs font-bold text-emerald-700 mb-3 block">常用时长</span>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {[{ label: '15分钟', val: 15 }, { label: '30分钟', val: 30 }, { label: '45分钟', val: 45 }, { label: '1小时', val: 60 }, { label: '1.5小时', val: 90 }, { label: '2小时', val: 120 }].map(opt => (
                                                                    <button key={opt.val} onClick={() => setPlanForm({ ...planForm, durationPreset: opt.val })}
                                                                        className={`py-2 text-xs font-bold rounded-lg border-2 transition-all
                                                                ${planForm.durationPreset === opt.val ? 'border-emerald-500 bg-white text-emerald-600 shadow-sm' : 'border-transparent bg-slate-200/50 text-slate-600 hover:bg-slate-200'}`}
                                                                    >
                                                                        {opt.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-bold text-emerald-700 mb-2 block">自定义其它时长</span>
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    placeholder="例如：25"
                                                                    value={planForm.durationPreset || ''}
                                                                    onChange={e => setPlanForm({ ...planForm, durationPreset: Math.max(0, parseInt(e.target.value) || 0) })}
                                                                    className="flex-1 w-full min-w-0 border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-500 font-bold bg-white text-emerald-800"
                                                                />
                                                                <span className="font-bold text-emerald-600 shrink-0 whitespace-nowrap">分钟</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}


                            {/* 奖励与审核 */}
                            {planType === 'study' && (
                                <div className="rounded-2xl p-4 space-y-4" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#9CAABE' }}>奖励与审核</label>

                                    {/* Custom Reward Toggle */}
                                    <div className="flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer transition-all active:scale-[0.98]"
                                        style={{ background: '#FBF7F0', border: '1px solid #F0EBE1' }}
                                        onClick={() => setPlanForm({ ...planForm, pointRule: planForm.pointRule === 'custom' ? 'default' : 'custom' })}>
                                        <div className="flex-1 pr-4">
                                            <div className="font-bold text-sm" style={{ color: '#1B2E4B' }}>自定义家庭币奖励</div>
                                            <div className="text-[11px] mt-0.5" style={{ color: '#9CAABE' }}>关闭则自动计算</div>
                                        </div>
                                        <div className="w-11 h-6 rounded-full p-0.5 transition-colors flex-shrink-0"
                                            style={{ background: planForm.pointRule === 'custom' ? '#FF8C42' : '#D1D5DB' }}>
                                            <div className="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform"
                                                style={{ transform: planForm.pointRule === 'custom' ? 'translateX(20px)' : 'translateX(0)' }}></div>
                                        </div>
                                    </div>

                                    {/* Stepper for reward */}
                                    {planForm.pointRule === 'custom' && (
                                        <div className="flex items-center justify-between rounded-xl px-4 py-3 animate-fade-in"
                                            style={{ background: '#FBF7F0', border: '1px solid #F0EBE1' }}>
                                            <span className="text-sm font-bold" style={{ color: '#1B2E4B' }}>
                                                完成奖励 ⭐ 家庭币
                                            </span>
                                            <div className="flex items-center gap-0">
                                                <button onClick={() => setPlanForm({ ...planForm, reward: Math.max(0, (parseInt(planForm.reward) || 5) - 1).toString() })}
                                                    className="w-9 h-9 rounded-l-xl flex items-center justify-center font-black text-lg transition-all active:scale-90"
                                                    style={{ background: '#F0EBE1', color: '#5A6E8A' }}>−</button>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="999"
                                                    value={planForm.reward === '' ? 5 : planForm.reward}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        if (val === '') { setPlanForm({ ...planForm, reward: '' }); return; }
                                                        const num = Math.max(0, Math.min(999, parseInt(val) || 0));
                                                        setPlanForm({ ...planForm, reward: num.toString() });
                                                    }}
                                                    onBlur={e => { if (e.target.value === '' || isNaN(parseInt(e.target.value))) setPlanForm({ ...planForm, reward: '5' }); }}
                                                    className="w-14 h-9 text-center font-black text-lg outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    style={{ background: '#fff', color: '#FF8C42', borderTop: '1px solid #F0EBE1', borderBottom: '1px solid #F0EBE1' }}
                                                />
                                                <button onClick={() => setPlanForm({ ...planForm, reward: ((parseInt(planForm.reward) || 5) + 1).toString() })}
                                                    className="w-9 h-9 rounded-r-xl flex items-center justify-center font-black text-lg transition-all active:scale-90"
                                                    style={{ background: '#FF8C42', color: '#fff' }}>+</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Require Approval Toggle */}
                                    <div className="flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer transition-all active:scale-[0.98]"
                                        style={{ background: '#FBF7F0', border: '1px solid #F0EBE1' }}
                                        onClick={() => setPlanForm({ ...planForm, requireApproval: !planForm.requireApproval })}>
                                        <div className="flex-1 pr-4">
                                            <div className="font-bold text-sm" style={{ color: '#1B2E4B' }}>打卡需家长审核</div>
                                            <div className="text-[11px] mt-0.5" style={{ color: '#9CAABE' }}>关闭后孩子打卡直接发放奖励</div>
                                        </div>
                                        <div className="w-11 h-6 rounded-full p-0.5 transition-colors flex-shrink-0"
                                            style={{ background: planForm.requireApproval ? '#FF8C42' : '#D1D5DB' }}>
                                            <div className="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform"
                                                style={{ transform: planForm.requireApproval ? 'translateX(20px)' : 'translateX(0)' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                        {/* — Footer — */}
                        <div className="shrink-0 px-5 py-4 flex gap-3"
                            style={{ background: '#FFFFFF', borderTop: '1px solid #F0EBE1', paddingBottom: 'max(1rem, env(safe-area-inset-bottom) + 0.5rem)' }}>
                            <button onClick={() => { setShowAddPlanModal(false); setEditingTask(null); }}
                                className="flex-1 py-3 rounded-xl font-black text-sm transition-all active:scale-95"
                                style={{ background: '#F0EBE1', color: '#5A6E8A' }}>
                                取消
                            </button>
                            <button onClick={handleSavePlan}
                                className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white transition-all active:scale-95"
                                style={{ background: '#FF8C42', boxShadow: '0 4px 15px rgba(255,140,66,0.35)' }}>
                                <Icons.Save size={16} /> {editingTask ? '保存修改' : '保存任务'}
                            </button>
                        </div>
                    </div>
                </div>
                )
            );
        } catch (error) {
            console.error("FATAL ERROR IN renderAddPlanModal:", error);
            return (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl text-center shadow-xl relative z-[110] max-w-md w-full">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">哎呀，页面出错了！</h2>
                        <p className="text-red-600 mb-4 text-xs font-mono text-left bg-red-50 p-3 rounded-lg overflow-x-auto" id="crash-error-message">{error.message}</p>
                        <p className="text-slate-500 mb-4 text-[10px] font-mono text-left bg-slate-100 p-3 rounded-lg overflow-y-auto max-h-32" id="crash-error-stack">{error.stack}</p>
                        <button onClick={() => { setShowAddPlanModal(false); setEditingTask(null); }} className="bg-slate-800 text-white px-8 py-3 w-full rounded-xl font-bold hover:bg-slate-700 transition-colors">关闭即可恢复</button>
                    </div>
                </div>
            );
        }
    };

    const renderAddKidModal = () => {
        if (!showAddKidModal) return null;
        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-bounce-in">
                    <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center relative">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.Users size={24} className="text-indigo-500" /> {newKidForm.id ? '编辑家庭成员' : '添加家庭成员'}</h2>
                        <button onClick={() => setShowAddKidModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white w-8 h-8 rounded-full shadow-sm flex items-center justify-center"><Icons.X size={18} /></button>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">宝贝的小名 / 昵称</label>
                            <input
                                type="text"
                                value={newKidForm.name}
                                onChange={e => setNewKidForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="例如：小明、芳芳"
                                className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 transition-colors"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">选择性别</label>
                            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                                <button
                                    onClick={() => setNewKidForm(f => ({ ...f, gender: 'boy', avatar: '👦' }))}
                                    className={`flex-1 py-3 font-black text-sm rounded-lg transition-all flex items-center justify-center gap-2 ${newKidForm.gender === 'boy' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    👦 男孩
                                </button>
                                <button
                                    onClick={() => setNewKidForm(f => ({ ...f, gender: 'girl', avatar: '👧' }))}
                                    className={`flex-1 py-3 font-black text-sm rounded-lg transition-all flex items-center justify-center gap-2 ${newKidForm.gender === 'girl' ? 'bg-white text-pink-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    👧 女孩
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">挑选一个专属可爱头像</label>
                            <div className="grid grid-cols-5 gap-3">
                                {(newKidForm.gender === 'boy' ? ['👦', '🧑‍🚀', '🦸‍♂️', '🕵️‍♂️', '👼'] : ['👧', '👩‍🚀', '🦸‍♀️', '🧚‍♀️', '🧜‍♀️']).map(avatar => (
                                    <button
                                        key={avatar}
                                        onClick={() => setNewKidForm(f => ({ ...f, avatar }))}
                                        className={`aspect-square text-3xl flex items-center justify-center rounded-2xl transition-all ${newKidForm.avatar === avatar ? (newKidForm.gender === 'boy' ? 'bg-blue-100 border-2 border-blue-400 scale-110 shadow-sm' : 'bg-pink-100 border-2 border-pink-400 scale-110 shadow-sm') : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100 grayscale hover:grayscale-0'}`}
                                    >
                                        {avatar}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-6 border-t border-slate-100 flex gap-4">
                        <button onClick={() => setShowAddKidModal(false)} className="flex-[1] bg-white text-slate-600 font-bold py-4 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50">取消</button>
                        <button onClick={async () => {
                            if (!newKidForm.name.trim()) return notify("请输入孩子名字", "error");
                            if (!newKidForm.avatar) return notify("请选择一个头像", "error");

                            if (newKidForm.id) {
                                try {
                                    await apiFetch(`/api/kids/${newKidForm.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newKidForm.name.trim(), avatar: newKidForm.avatar }) });
                                    setKids(kids.map(k => k.id === newKidForm.id ? { ...k, name: newKidForm.name.trim(), avatar: newKidForm.avatar } : k));
                                    notify("资料已保存更新！", "success");
                                    setShowAddKidModal(false);
                                } catch (err) { notify("保存失败", "error"); }
                            } else {
                                const newKid = { id: `kid_${Date.now()}`, name: newKidForm.name.trim(), avatar: newKidForm.avatar };
                                try {
                                    await apiFetch('/api/kids', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newKid) });
                                    setKids([...kids, { ...newKid, level: 1, exp: 0, balances: { spend: 0, save: 0, give: 0 }, vault: { lockedAmount: 0, projectedReturn: 0 } }]);
                                    notify("家庭新成员添加成功！", "success");
                                    setShowAddKidModal(false);
                                } catch (err) { notify("添加失败", "error"); }
                            }
                        }} className={`flex-[2] text-white font-black py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] ${newKidForm.gender === 'boy' ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-200' : 'bg-pink-500 hover:bg-pink-600 shadow-pink-200'}`}>
                            {newKidForm.id ? '保存修改' : '确定添加'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // === 视图页面组件 ===
    const renderParentSettingsModals = () => {
        return (
            <>
                {/* Child Management Modal */}
                {showSettingsModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[200] animate-fade-in">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
                                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.Users size={22} className="text-indigo-500" /> 孩子资料管理</h2>
                                <button onClick={() => setShowSettingsModal(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"><Icons.X size={18} /></button>
                            </div>
                            <div className="p-6 overflow-y-auto overflow-x-hidden relative flex-1">
                                <div className="space-y-4 mb-6">
                                    {kids.map(k => (
                                        <div key={k.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex gap-4 items-center">
                                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-4xl shadow-sm border border-slate-200 shrink-0">
                                                <AvatarDisplay avatar={k.avatar} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-black text-slate-800 text-lg truncate">{k.name}</div>
                                                <div className="text-xs font-bold text-slate-400">Lv.{k.level} · 学力 {k.exp}</div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button onClick={() => {
                                                    const boyAvatars = ['👦', '🧑‍🚀', '🦸‍♂️', '🕵️‍♂️', '👼'];
                                                    const gender = boyAvatars.includes(k.avatar) ? 'boy' : 'girl';
                                                    setNewKidForm({ id: k.id, name: k.name, gender, avatar: k.avatar });
                                                    setShowAddKidModal(true);
                                                }} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
                                                    <Icons.Edit3 size={18} />
                                                </button>
                                                <button onClick={async () => {
                                                    if (window.confirm(`确定要删除 ${k.name} 吗？与该孩子相关的所有任务、订单和记录都将被删除！此操作无法撤销。`)) {
                                                        try {
                                                            await apiFetch(`/api/kids/${k.id}`, { method: 'DELETE' });
                                                            setKids(kids.filter(kid => kid.id !== k.id));
                                                            notify(`${k.name} 已被删除`, "success");
                                                        } catch (e) { notify("删除失败", "error"); }
                                                    }
                                                }} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
                                                    <Icons.Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => {
                                    if (kids.length >= 5) {
                                        return notify("目前最多支持添加5名家庭成员！", "warning");
                                    }
                                    setNewKidForm({ id: null, name: '', gender: 'boy', avatar: '👦' });
                                    setShowAddKidModal(true);
                                }} className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 border-2 border-dashed border-slate-300 transition-colors flex items-center justify-center gap-2">
                                    <Icons.Plus size={18} className="text-slate-400" /> 添加家庭成员
                                </button>
                                
                                {/* Child Growth Profile Management integrated block */}
                                <div className="mt-8 pt-8 border-t border-slate-100">
                                   <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-md text-white relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                                        <div className="flex items-center gap-3 mb-4 relative z-10">
                                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-sm"><Icons.Star size={20} /></div>
                                            <h2 className="text-lg font-black text-white">儿童成长图鉴配置</h2>
                                        </div>
                                        <div className="space-y-4 relative z-10">
                                            <p className="text-indigo-100 text-xs leading-relaxed font-medium">配置儿童的等级称号、升级所需经验值以及专属头像框。等级系统能极大提升孩子的打卡动力。</p>
                                            <button onClick={() => { setShowSettingsModal(false); setShowLevelModal(true); }} className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black hover:bg-slate-50 transition-colors shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">
                                                进入图鉴配置中心 <Icons.ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Subscription Modal */}
                {showSubscriptionModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[200] animate-fade-in">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
                                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.Award size={22} className="text-rose-500" /> 我的订阅体验</h2>
                                <button onClick={() => setShowSubscriptionModal(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"><Icons.X size={18} /></button>
                            </div>
                            <div className="p-6 overflow-y-auto relative flex-1">
                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <div className="text-sm font-bold text-slate-500 mb-1">当前账号</div>
                                        <div className="font-black text-slate-800 text-lg">{user?.email}</div>
                                        <div className="mt-4 text-sm font-bold text-slate-500 mb-1">服务有效期至</div>
                                        <div className={`font-black text-lg ${new Date(user?.sub_end_date) < new Date() ? 'text-rose-500' : 'text-emerald-600'}`}>
                                            {user?.sub_end_date ? new Date(user.sub_end_date).toLocaleDateString() : '永久有效'}
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">输入兑换码续费</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={settingsCode} onChange={e => setSettingsCode(e.target.value.toUpperCase())} className="flex-1 bg-white border-2 border-slate-200 p-3 rounded-xl font-black text-slate-800 tracking-wider outline-none focus:border-rose-500 uppercase placeholder:text-slate-300 placeholder:font-bold" placeholder="ACT-XXXXXX" />
                                            <button onClick={async () => {
                                                if (!settingsCode) return;
                                                try {
                                                    const res = await apiFetch('/api/redeem-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: settingsCode }) });
                                                    const data = await res.json();
                                                    if (!res.ok) return notify(data.error || "兑换失败", 'error');
                                                    notify("兑换成功！", 'success');
                                                    setUser(prev => ({ ...prev, sub_end_date: data.new_sub_end_date }));
                                                    setSettingsCode('');
                                                    apiFetch('/api/me/codes').then(r => r.json()).then(setUsedCodes).catch(console.error);
                                                } catch (err) { notify("网络错误", "error"); }
                                            }} className="bg-rose-500 text-white px-6 rounded-xl font-bold shadow-md shadow-rose-200 hover:bg-rose-600 transition-colors shrink-0">兑换卡密</button>
                                        </div>
                                    </div>
                                    {usedCodes.length > 0 && (
                                        <div className="mt-6 pt-6 border-t border-slate-100">
                                            <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-2"><Icons.Clock size={16}/> 兑换历史记录</h3>
                                            <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                                {usedCodes.map(c => (
                                                    <div key={c.code} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
                                                        <div className="font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 text-sm tracking-widest">{c.code}</div>
                                                        <div className="text-right">
                                                            <span className="font-black text-emerald-600 block text-sm">+{c.duration_days} 天</span>
                                                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{new Date(c.used_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security PIN Modal */}
                {showSecurityParamsModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[200] animate-fade-in">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
                                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.Lock size={22} className="text-slate-600" /> 后台安全锁</h2>
                                <button onClick={() => setShowSecurityParamsModal(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"><Icons.X size={18} /></button>
                            </div>
                            <div className="p-6 overflow-y-auto relative flex-1">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-slate-800">开启家长密码锁</div>
                                            <div className="text-xs text-slate-500 mt-1">防止孩子私自进入后台修改数据</div>
                                        </div>
                                        <button onClick={() => setParentSettings(p => ({ ...p, pinEnabled: !p.pinEnabled }))} className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors ${parentSettings.pinEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${parentSettings.pinEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </button>
                                    </div>
                                    {parentSettings.pinEnabled && (
                                        <div className="animate-fade-in">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">修改 4 位密码 (默认1234)</label>
                                            <input type="text" maxLength={4} value={parentSettings.pinCode} onChange={e => setParentSettings(p => ({ ...p, pinCode: e.target.value.replace(/\D/g, '') }))} className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl font-mono text-xl tracking-[1em] outline-none focus:border-indigo-500 text-center" />
                                        </div>
                                    )}
                                    <button onClick={() => { setShowSecurityParamsModal(false); notify("安全设置已保存", "success"); }} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-colors shadow-lg active:scale-[0.98]">完成设定</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    };

    // CelebrationModal has been correctly moved outside the App component body.
    return (
        <>
            {/* Task Delete Confirmation Modal */}
            {deleteConfirmTask && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={() => setDeleteConfirmTask(null)}>
                    <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl animate-scale-in border border-slate-100" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                                <Icons.Trash2 size={24} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800 mb-2">确认删除任务？</h3>
                            <p className="text-sm font-bold text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100 w-full word-break">
                                {deleteConfirmTask.title}
                            </p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setDeleteConfirmTask(null)}
                                    className="flex-1 py-3.5 rounded-2xl font-bold transition-all text-slate-600 bg-slate-100 hover:bg-slate-200">
                                    取消
                                </button>
                                <button onClick={() => handleDeleteTask(deleteConfirmTask.id)}
                                    className="flex-1 py-3.5 rounded-2xl font-bold transition-all text-white bg-red-500 shadow-lg shadow-red-500/30 hover:bg-red-600 active:scale-95">
                                    确定删除
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {renderTaskSubmitModal()}
            {renderQuickCompleteModal()}
            {renderKidPreviewModal()}
            {renderTransferModal()}
            {renderReviewModal()}
            {renderAddItemModal()}
            {renderAddPlanModal()}
            {renderTimerModal()}
            {renderCalendarModal()}
            {renderAddKidModal()}
            {renderPenaltyModal()}
            {renderRewardModal()}
            {renderEmotionalReminderModal()}
            {renderRejectModal()}
            {renderQrScannerModal()}
            {renderShopConfirmModal()}
            {renderQrZoomModal()}
            {renderTransactionHistoryModal()}
            {renderImagePreviewModal && renderImagePreviewModal()}
            {renderParentSettingsModals()}

            {/* ═══ AI Task Creator ═══ */}
            <AiPlanCreator
                isOpen={showAiTaskCreator}
                onClose={() => setShowAiTaskCreator(false)}
                kids={kids}
                planForm={planForm}
                setPlanForm={setPlanForm}
                setTasks={setTasks}
                notify={notify}
                setShowAddPlanModal={setShowAddPlanModal}
            />

            {/* ═══ Celebration Modal (Habit check-in feedback) ═══ */}
            {celebrationData && (() => {
                const isPositive = celebrationData.type === 'positive';
                const accent = isPositive ? '#4ECDC4' : '#FF6B6B';
                const bgGradient = isPositive
                    ? 'linear-gradient(135deg, #E0FFF9 0%, #F0FFF4 100%)'
                    : 'linear-gradient(135deg, #FFF0F0 0%, #FFF5F5 100%)';
                const emoji = isPositive ? '🎉' : '🛡️';
                const reward = celebrationData.task?.reward || 0;
                // Auto-dismiss after 3 seconds
                setTimeout(() => setCelebrationData(null), 3000);
                return (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 animate-fade-in"
                        style={{ background: 'rgba(27,46,75,0.25)', backdropFilter: 'blur(8px)' }}
                        onClick={() => setCelebrationData(null)}>
                        {/* Confetti particles */}
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="absolute w-2 h-2 rounded-full animate-bounce"
                                style={{
                                    background: [accent, '#FFD93D', '#FF8C42', '#A78BFA', '#60A5FA'][i % 5],
                                    top: `${10 + Math.random() * 30}%`,
                                    left: `${10 + Math.random() * 80}%`,
                                    animationDelay: `${i * 0.1}s`,
                                    animationDuration: `${0.6 + Math.random() * 0.8}s`,
                                    opacity: 0.7,
                                }} />
                        ))}
                        <div className="relative max-w-sm w-full rounded-3xl p-8 text-center animate-bounce-in"
                            style={{ background: bgGradient, boxShadow: `0 25px 60px ${accent}30` }}
                            onClick={e => e.stopPropagation()}>
                            {/* Top glow */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full opacity-30" style={{ background: accent, filter: 'blur(30px)' }}></div>

                            <div className="text-6xl mb-4">{emoji}</div>
                            <div className="text-xl font-black mb-2" style={{ color: '#1B2E4B' }}>
                                {isPositive ? '太棒了！' : '勇于坦白！'}
                            </div>
                            <div className="text-sm font-bold mb-4 leading-relaxed px-2" style={{ color: '#5A6E8A' }}>
                                {celebrationData.message}
                            </div>

                            {/* Reward badge */}
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-base"
                                style={{ background: `${accent}20`, color: accent }}>
                                {isPositive ? (
                                    <><Icons.TrendingUp size={18} /> +{Math.abs(reward)} 家庭币</>
                                ) : (
                                    <><Icons.TrendingDown size={18} /> -{Math.abs(reward)} 家庭币</>
                                )}
                            </div>

                            {/* Dismiss hint */}
                            <div className="mt-4 text-[10px] font-bold" style={{ color: '#9CAABE' }}>
                                点击任意位置关闭
                            </div>
                        </div>
                    </div>
                );
            })()}
        </>
    );
};
