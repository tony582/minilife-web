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
import { AvatarPickerModal } from '../modals/AvatarPickerModal';


export const GlobalModals = () => {
    const authC = useAuthContext();
    const dataC = useDataContext();
    const uiC = useUIContext();
    const toastC = useToast();
    const taskM = useTaskManager(authC, dataC, uiC);
    const shopM = useShopManager(authC, dataC, uiC);
    const baseContext = { ...authC, ...dataC, ...uiC, ...taskM, ...shopM, ...toastC, getCategoryGradient, getCategoryColor, getIconForCategory, allCategories, getCatHexColor, AvatarDisplay, renderIcon, getLevelReq, getLevelTier, formatDate, isSameDay, getDaysInMonth };
    const {
        activeKidId, setActiveKidId, kidTab, setKidTab, kidShopTab, setKidShopTab, parentTab, setParentTab, parentKidFilter, setParentKidFilter, currentViewDate, setCurrentViewDate, selectedDate, setSelectedDate, monthViewDate, setMonthViewDate, showParentSettingsDropdown, setShowParentSettingsDropdown, showSettingsModal, setShowSettingsModal, showSubscriptionModal, setShowSubscriptionModal, showSecurityParamsModal, setShowSecurityParamsModal, taskToSubmit, setTaskToSubmit, taskIdToEdit, setTaskIdToEdit, showTransferModal, setShowTransferModal, transferForm, setTransferForm, previewImageIndex, setPreviewImageIndex, selectedOrder, setSelectedOrder, showAddPlanModal, setShowAddPlanModal, showAddKidModal, setShowAddKidModal, newKidForm, setNewKidForm, showAddItemModal, setShowAddItemModal, showQrScanner, setShowQrScanner, historyFilter, setHistoryFilter, showLevelRules, setShowLevelRules, editingTask, setEditingTask, deleteConfirmTask, setDeleteConfirmTask, mallSortByPrice, setMallSortByPrice, orderSortByPrice, setOrderSortByPrice, orderFilterStatus, setOrderFilterStatus, kidCheckoutItem, setKidCheckoutItem, showAvatarPickerModal, setShowAvatarPickerModal, showPenaltyModal, setShowPenaltyModal, penaltyTaskContext, setPenaltyTaskContext, penaltySelectedKidIds, setPenaltySelectedKidIds, showReviewModal, setShowReviewModal, reviewOrderId, setReviewOrderId, showShopConfirmModal, setShowShopConfirmModal, shopTargetItem, setShopTargetItem, qrModalValue, setQrModalValue, showLevelModal, setShowLevelModal, pendingAvatar, setPendingAvatar, pointActionTimings, setPointActionTimings, showEmotionalReminderModal, setShowEmotionalReminderModal, emotionalCooldownSeconds, setEmotionalCooldownSeconds, showRewardModal, setShowRewardModal, showRejectModal, setShowRejectModal, rejectingTaskInfo, setRejectingTaskInfo, rejectReason, setRejectReason, showTransactionHistoryModal, setShowTransactionHistoryModal, transactionHistoryKidId, setTransactionHistoryKidId, transactionHistoryFilterTime, setTransactionHistoryFilterTime, transactionHistoryStartDate, setTransactionHistoryStartDate, transactionHistoryEndDate, setTransactionHistoryEndDate, transactionHistoryFilterType, setTransactionHistoryFilterType, showTimerModal, setShowTimerModal, timerTargetId, setTimerTargetId, timerMode, setTimerMode, timerSeconds, setTimerSeconds, timerTotalSeconds, setTimerTotalSeconds, isTimerRunning, setIsTimerRunning, timerPaused, setTimerPaused, pomodoroSession, setPomodoroSession, pomodoroIsBreak, setPomodoroIsBreak, showCalendarModal, setShowCalendarModal, showParentPinModal, setShowParentPinModal, showKidSwitcher, setShowKidSwitcher, showInterestDetailsModal, setShowInterestDetailsModal, quickCompleteTask, setQuickCompleteTask, qcTimeMode, setQcTimeMode, qcHours, setQcHours, qcMinutes, setQcMinutes, qcSeconds, setQcSeconds, qcStartTime, setQcStartTime, qcEndTime, setQcEndTime, qcNote, setQcNote, qcAttachments, setQcAttachments, pinInput, setPinInput, reviewStars, setReviewStars, reviewComment, setReviewComment, newItem, setNewItem, planType, setPlanType, lastSavedEndTime, setLastSavedEndTime, planForm, setPlanForm, planFormErrors, setPlanFormErrors, parentSettings, setParentSettings, celebrationData, setCelebrationData, showPreviewModal, setShowPreviewModal, previewTask, setPreviewTask, showImagePreviewModal, setShowImagePreviewModal, previewImages, setPreviewImages, currentPreviewIndex, setCurrentPreviewIndex, notifications, notify, setNotifications, appState, changeAppState, token, setToken, user, setUser, authLoading, setAuthLoading, authMode, setAuthMode, authForm, setAuthForm, confirmPassword, setConfirmPassword, activationCode, setActivationCode, handleAuth, handleLogout, kids, setKids, tasks, setTasks, inventory, setInventory, orders, setOrders, transactions, setTransactions, isLoading, setIsLoading, adminTab, setAdminTab, adminUsers, setAdminUsers, adminCodes, setAdminCodes, usedCodes, setUsedCodes, settingsCode, setSettingsCode, changeActiveKid, updateActiveKid, updateKidData, handleExpChange, getTaskStatusOnDate, getTaskTimeSpent, handleDeleteTask, handleAttemptSubmit, handleMarkHabitComplete, handleRejectTask, handleStartTask, confirmSubmitTask, confirmTransfer, buyItem, getIncompleteStudyTasksCount,
        openQuickComplete, handleQcQuickDuration, handleQcFileUpload, handleQuickComplete, handleSavePlan, submitReview, handleSaveNewItem, confirmReceipt, checkPeriodLimits, playSuccessSound, handleVerifyOrder, handleApproveTask, handleSkipTask, handleStopRecurring
    } = baseContext;

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
        // Single kid: close preview and return to list
        if (kids.length <= 1 || (rejectingTaskInfo.task && rejectingTaskInfo.task.kidId !== 'all')) {
            setShowPreviewModal(false);
            setPreviewTask(null);
        }
    };

    const confirmPenalty = async () => {
        if (!penaltyTaskContext || penaltySelectedKidIds.length === 0) return;

        const penalty = Math.abs(penaltyTaskContext.reward);
        let kidsUpdated = false;

        let newHist = JSON.parse(JSON.stringify(penaltyTaskContext.history || {}));
        const todayStr = formatDate(new Date());

        for (const targetKidId of penaltySelectedKidIds) {
            const targetKid = kids.find(k => k.id === targetKidId);
            if (!targetKid) continue;

            // Enforce limit check for manual parental deductions
            const kidTodayData = penaltyTaskContext.kidId === 'all' ? (newHist[todayStr]?.[targetKidId] || {}) : (newHist[todayStr] || {});

            const maxAllowed = penaltyTaskContext.periodMaxPerDay || penaltyTaskContext.maxPerDay || 1;
            const attemptsToday = Array.isArray(kidTodayData) ? kidTodayData.length : (kidTodayData.status ? 1 : 0);

            if (attemptsToday >= maxAllowed) {
                notify(`${targetKid.name} 的此项记录今日已达上限，无法继续扣除。`, "warning");
                continue;
            }

            kidsUpdated = true;

            // 1. Atomic balance update (server reads current balance, avoids stale reads)
            const expDiff = -Math.ceil(penalty * 1.5);
            try {
                const rewardRes = await apiFetch(`/api/kids/${targetKid.id}/reward`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ coins: -penalty, exp: expDiff })
                });
                if (rewardRes.ok) {
                    const ct = rewardRes.headers.get('content-type') || '';
                    if (ct.includes('application/json')) {
                        const data = await rewardRes.json();
                        setKids(prevKids => prevKids.map(k => k.id === targetKid.id ? { ...k, balances: { ...k.balances, spend: data.spend }, exp: data.exp, level: data.level } : k));
                    }
                }
            } catch (e) {
                console.error('Penalty reward error:', e);
                notify(`扣除 ${targetKid.name} 金币失败，请重试`, "error");
                continue;
            }

            // 2. Post transaction
            const refundTrans = { id: `trans_${Date.now()}_penalty_${targetKid.id}`, kidId: targetKid.id, type: 'expense', amount: penalty, title: `手动惩罚: ${penaltyTaskContext.title}`, date: new Date().toISOString(), category: 'habit' };
            try {
                await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(refundTrans) });
            } catch (e) { console.error('Transaction post error:', e); }
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
        }

        if (kidsUpdated) {
            try {
                await apiFetch(`/api/tasks/${penaltyTaskContext.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: newHist }) });
            } catch (e) { console.error('History update error:', e); }
            setTasks(prev => prev.map(t => t.id === penaltyTaskContext.id ? { ...t, history: newHist } : t));
            setShowPenaltyModal(false);
            setPenaltyTaskContext(null);
        }
    };

    const confirmReward = async () => {
        if (!penaltyTaskContext || penaltySelectedKidIds.length === 0) return;

        const reward = Math.abs(penaltyTaskContext.reward);
        let kidsUpdated = false;

        let newHist = JSON.parse(JSON.stringify(penaltyTaskContext.history || {}));
        const todayStr = formatDate(new Date());

        for (const targetKidId of penaltySelectedKidIds) {
            const targetKid = kids.find(k => k.id === targetKidId);
            if (!targetKid) continue;

            // Enforce limit check
            const kidTodayData = penaltyTaskContext.kidId === 'all' ? (newHist[todayStr]?.[targetKidId] || {}) : (newHist[todayStr] || {});

            const maxAllowed = penaltyTaskContext.periodMaxPerDay || penaltyTaskContext.maxPerDay || 1;
            const attemptsToday = Array.isArray(kidTodayData) ? kidTodayData.length : (kidTodayData.status ? 1 : 0);

            if (attemptsToday >= maxAllowed) {
                notify(`${targetKid.name} 的此项记录今日已达上限，无法继续加分。`, "warning");
                continue;
            }

            kidsUpdated = true;

            // 1. Atomic balance update (server reads current balance)
            const expDiff = Math.ceil(reward * 1.5);
            try {
                const rewardRes = await apiFetch(`/api/kids/${targetKid.id}/reward`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ coins: reward, exp: expDiff })
                });
                if (rewardRes.ok) {
                    const ct = rewardRes.headers.get('content-type') || '';
                    if (ct.includes('application/json')) {
                        const data = await rewardRes.json();
                        setKids(prevKids => prevKids.map(k => k.id === targetKid.id ? { ...k, balances: { ...k.balances, spend: data.spend }, exp: data.exp, level: data.level } : k));
                    }
                }
            } catch (e) {
                console.error('Reward error:', e);
                notify(`给予 ${targetKid.name} 金币失败，请重试`, "error");
                continue;
            }

            // 2. Post transaction
            const rewardTrans = { id: `trans_${Date.now()}_reward_${targetKid.id}`, kidId: targetKid.id, type: 'income', amount: reward, title: `奖励加分: ${penaltyTaskContext.title}`, date: new Date().toISOString(), category: 'habit' };
            try {
                await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rewardTrans) });
            } catch (e) { console.error('Transaction post error:', e); }
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
                    else newHist[todayStr] = []
                }
                newHist[todayStr].push(newRecord);
            }
        }

        if (kidsUpdated) {
            try {
                await apiFetch(`/api/tasks/${penaltyTaskContext.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: newHist }) });
            } catch (e) { console.error('History update error:', e); }
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
        // Zustand set() does NOT support updater functions — read current value directly
        const current = Array.isArray(penaltySelectedKidIds) ? penaltySelectedKidIds : [];
        const next = current.includes(kidId)
            ? current.filter(id => id !== kidId)
            : [...current, kidId];
        setPenaltySelectedKidIds(next);
    };

    // Handle countdown timer for Emotional Modal
    useEffect(() => {
        let timer;
        if (showEmotionalReminderModal && emotionalCooldownSeconds > 0) {
            timer = setInterval(() => {
                // Zustand set() does NOT support updater functions
                const current = typeof emotionalCooldownSeconds === 'number' ? emotionalCooldownSeconds : 0;
                setEmotionalCooldownSeconds(current - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [showEmotionalReminderModal, emotionalCooldownSeconds]);

    // Build FULL context AFTER all local functions are defined
    const context = {
        ...baseContext,
        // Timer local functions
        showTimerLeaveConfirm, setShowTimerLeaveConfirm,
        clearTimerState, handleTimerBack, handleTimerSaveAndLeave,
        // Shop local functions
        handleBuyItem, handleConfirmBuy,
        // Reject/Penalty/Reward local functions
        confirmRejectTask, confirmPenalty, confirmReward, toggleKidSelectionPenalty,
    };

    return (
        <>
            {/* Task Delete Confirmation Modal — Extracted */}
            <DeleteConfirmModal
                deleteConfirmTask={deleteConfirmTask}
                setDeleteConfirmTask={setDeleteConfirmTask}
                handleDeleteTask={handleDeleteTask}
                handleSkipTask={handleSkipTask}
                handleStopRecurring={handleStopRecurring}
                selectedDate={selectedDate}
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
            <SettingsModals context={context} />
            <AvatarPickerModal context={context} />

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
