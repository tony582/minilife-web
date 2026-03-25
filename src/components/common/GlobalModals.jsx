import React, { useState, useEffect, useRef } from 'react';
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
import { CelebrationModal } from '../modals/CelebrationModal';
import { DeleteConfirmModal } from '../modals/DeleteConfirmModal';
import { SettingsModals } from '../modals/SettingsModals';
import { CalendarModal } from '../modals/CalendarModal';
import { EmotionalReminderModal } from '../modals/EmotionalReminderModal';
import { PenaltyModal } from '../modals/PenaltyModal';
import { RewardModal } from '../modals/RewardModal';
import { TaskSubmitModal } from '../modals/TaskSubmitModal';
import { TransferModal } from '../modals/TransferModal';
import { ReviewModal } from '../modals/ReviewModal';
import { RejectModal } from '../modals/RejectModal';
import { TimerModal } from '../modals/TimerModal';
import { QuickCompleteModal } from '../modals/QuickCompleteModal';
import { ShopConfirmModal } from '../modals/ShopConfirmModal';
import { TransactionHistoryModal } from '../modals/TransactionHistoryModal';
import { ImagePreviewModal } from '../modals/ImagePreviewModal';
import { QrZoomModal } from '../modals/QrZoomModal';
import { QrScannerModal } from '../modals/QrScannerModal';
import { AddItemModal } from '../modals/AddItemModal';
import { AddKidModal } from '../modals/AddKidModal';
import { KidPreviewModal } from '../modals/KidPreviewModal';
import { AddPlanModal } from '../modals/AddPlanModal';


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
        openQuickComplete, handleQcQuickDuration, handleQcFileUpload, handleQuickComplete, handleSavePlan, submitReview, handleSaveNewItem, confirmReceipt, checkPeriodLimits, playSuccessSound, handleVerifyOrder, handleApproveTask
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

    // ═══ TIMER: Refs for current values (avoid stale closures) ═══
    const timerTargetIdRef = useRef(timerTargetId);
    const timerModeRef = useRef(timerMode);
    const timerSecondsRef = useRef(timerSeconds);
    const timerTotalSecondsRef = useRef(timerTotalSeconds);
    const timerPausedRef = useRef(timerPaused);
    const pomodoroSessionRef = useRef(pomodoroSession);
    const pomodoroIsBreakRef = useRef(pomodoroIsBreak);
    useEffect(() => { timerTargetIdRef.current = timerTargetId; }, [timerTargetId]);
    useEffect(() => { timerModeRef.current = timerMode; }, [timerMode]);
    useEffect(() => { timerSecondsRef.current = timerSeconds; }, [timerSeconds]);
    useEffect(() => { timerTotalSecondsRef.current = timerTotalSeconds; }, [timerTotalSeconds]);
    useEffect(() => { timerPausedRef.current = timerPaused; }, [timerPaused]);
    useEffect(() => { pomodoroSessionRef.current = pomodoroSession; }, [pomodoroSession]);
    useEffect(() => { pomodoroIsBreakRef.current = pomodoroIsBreak; }, [pomodoroIsBreak]);

    // ═══ TIMER: localStorage persistence ═══
    const TIMER_KEY = 'minilife_timer_state';
    useEffect(() => {
        // Only auto-save when modal is visible, running, and the mode has actually been started
        if (isTimerRunning && timerTargetId && showTimerModal && timerMode !== 'select') {
            localStorage.setItem(TIMER_KEY, JSON.stringify({
                taskId: timerTargetId, mode: timerMode, seconds: timerSeconds,
                totalSeconds: timerTotalSeconds, running: true, paused: timerPaused,
                pomodoroSession, pomodoroIsBreak, savedAt: Date.now()
            }));
        }
    }, [timerSeconds, isTimerRunning, timerPaused, timerMode, timerTargetId, showTimerModal]);

    // ═══ TIMER: NO auto-restore on mount ═══
    // Saved state is only checked when user clicks a task's "开始计时" button
    // (handled by handleStartTask in useTaskManager.js)

    const clearTimerState = () => {
        localStorage.removeItem(TIMER_KEY);
        setIsTimerRunning(false);
        setTimerPaused(false);
        setTimerMode('select');
        setTimerSeconds(0);
        setPomodoroSession(1);
        setPomodoroIsBreak(false);
        setShowTimerModal(false);
        setShowTimerLeaveConfirm(false);
    };

    const [showTimerLeaveConfirm, setShowTimerLeaveConfirm] = useState(false);

    const handleTimerBack = () => {
        if (isTimerRunning) {
            setTimerPaused(true);
            setShowTimerLeaveConfirm(true);
        } else {
            clearTimerState();
        }
    };

    const handleTimerSaveAndLeave = () => {
        // Read from refs to avoid stale closures
        try {
            localStorage.setItem(TIMER_KEY, JSON.stringify({
                taskId: timerTargetIdRef.current,
                mode: timerModeRef.current,
                seconds: timerSecondsRef.current,
                totalSeconds: timerTotalSecondsRef.current,
                running: true, paused: true,
                pomodoroSession: pomodoroSessionRef.current,
                pomodoroIsBreak: pomodoroIsBreakRef.current,
                savedAt: Date.now()
            }));
        } catch (e) { /* ignore */ }
        // Close the modal and stop timer
        setShowTimerLeaveConfirm(false);
        setShowTimerModal(false);
        setIsTimerRunning(false);
        setTimerPaused(true);
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

    const confirmRejectTask = async () => {
        if (!rejectingTaskInfo) return;
        await handleRejectTask(rejectingTaskInfo.task, rejectingTaskInfo.dateStr, rejectingTaskInfo.kidId, rejectReason);
        setShowRejectModal(false);
        setRejectingTaskInfo(null);
        setRejectReason('');
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

    // === 视图页面组件 ===
    const renderParentSettingsModals = () => {
        return <SettingsModals context={context} />;
    };

    const _DEAD_CODE_REMOVED = true; // Settings/Subscription/Security modals extracted to SettingsModals.jsx
    if (false) { // Dead code block — kept as no-op to preserve line mapping for debugging
        return (
            <>
                {false && (
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
            {/* Task Delete Confirmation Modal — Extracted */}
            <DeleteConfirmModal
                deleteConfirmTask={deleteConfirmTask}
                setDeleteConfirmTask={setDeleteConfirmTask}
                handleDeleteTask={handleDeleteTask}
            />

            <TaskSubmitModal context={context} />
            <QuickCompleteModal context={context} />
            <KidPreviewModal context={context} />
            <TransferModal context={context} />
            <ReviewModal context={context} />
            <AddItemModal context={context} />
            <AddPlanModal context={context} />
            <TimerModal context={context} />
            <CalendarModal context={context} />
            <AddKidModal context={context} />
            <PenaltyModal context={context} />
            <RewardModal context={context} />
            <EmotionalReminderModal context={context} />
            <RejectModal context={context} />
            <QrScannerModal context={context} />
            <ShopConfirmModal context={context} />
            <QrZoomModal context={context} />
            <TransactionHistoryModal context={context} />
            <ImagePreviewModal context={context} />
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

            {/* ═══ Celebration Modal — Extracted ═══ */}
            <CelebrationModal
                celebrationData={celebrationData}
                setCelebrationData={setCelebrationData}
            />
        </>
    );
};
