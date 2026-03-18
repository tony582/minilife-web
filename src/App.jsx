import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Icons, renderIcon, AvatarDisplay } from './utils/Icons';
import { isSameDay, formatDate, getDisplayDateArray, getWeekNumber, getDaysInMonth } from './utils/dateUtils';
import { defaultCategories, getCategoryColor, getCategoryGradient, getIconForCategory } from './utils/categoryUtils';
import { CelebrationModal } from './components/common/CelebrationModal';
import { getLevelTier } from './utils/levelUtils';
import { apiFetch, API_BASE } from './api/client';
import { useToast } from './hooks/useToast';
import { useAppState } from './hooks/useAppState';
import { useAuth } from './hooks/useAuth';
import { useAppData } from './hooks/useAppData';
// === 钩子工具 ===
const useOnClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};
// Removed HTML5 Base64 Audio Engine to prevent iOS Safari from hijacking the Dynamic Island / Lock Screen media player.
let globalAudioCtx = null;
export default function App() {
    // === 全局状态 ===
    const { notifications, notify, setNotifications } = useToast();
    const { appState, changeAppState } = useAppState();
    const {
        token, setToken, user, setUser,
        authLoading, setAuthLoading,
        authMode, setAuthMode,
        authForm, setAuthForm,
        confirmPassword, setConfirmPassword,
        activationCode, setActivationCode,
        handleAuth, handleLogout
    } = useAuth(notify, changeAppState);
    const generateCodes = async (days) => {
        const res = await apiFetch('/api/admin/codes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ duration_days: days, count: 5 })
        });
        const data = await res.json();
        if (res.ok) {
            notify(`成功生成 ${data.codes.length} 个兑换码`, 'success');
            apiFetch('/api/admin/codes').then(r => r.json()).then(setAdminCodes).catch(console.error);
        } else {
            notify(data.error, 'error');
        }
    };
    const [activeKidId, setActiveKidId] = useState(localStorage.getItem('minilife_activeKidId') || 'kid_1');
    const [parentSettings, setParentSettings] = useState({ pinEnabled: false, pinCode: '1234' });
    const changeActiveKid = (newKidId) => {
        setActiveKidId(newKidId);
        if (newKidId) localStorage.setItem('minilife_activeKidId', newKidId);
        else localStorage.removeItem('minilife_activeKidId');
    };
    const {
        kids, setKids,
        tasks, setTasks,
        inventory, setInventory,
        orders, setOrders,
        transactions, setTransactions,
        isLoading, setIsLoading,
        adminTab, setAdminTab,
        adminUsers, setAdminUsers,
        adminCodes, setAdminCodes,
        usedCodes, setUsedCodes,
        settingsCode, setSettingsCode
    } = useAppData(token, setToken, user, setUser, setAuthLoading);
    // UI 控制状态
    const [kidTab, setKidTab] = useState('study');
    const [kidShopTab, setKidShopTab] = useState('browse');
    const [parentTab, setParentTab] = useState('tasks');
    const [parentKidFilter, setParentKidFilter] = useState('');
    useEffect(() => {
        if (kids.length > 0 && !parentKidFilter) {
            setParentKidFilter(kids[0].id);
        }
    }, [kids, parentKidFilter]);
    // 日期控制状态
    const [currentViewDate, setCurrentViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
    const [monthViewDate, setMonthViewDate] = useState(new Date());
    // 任务列表控制
    // 任务列表控制 (Student)
    const [taskFilter, setTaskFilter] = useState([]);
    const [taskStatusFilter, setTaskStatusFilter] = useState('all');
    const [taskSort, setTaskSort] = useState('default');
    // 任务列表控制 (Parent)
    const [parentTaskFilter, setParentTaskFilter] = useState([]);
    const [parentTaskStatusFilter, setParentTaskStatusFilter] = useState('all');
    const [parentTaskSort, setParentTaskSort] = useState('default');
    // 搜索状态
    const [searchPlanKeyword, setSearchPlanKeyword] = useState('');
    const [searchShopKeyword, setSearchShopKeyword] = useState('');
    const [searchKidTaskKeyword, setSearchKidTaskKeyword] = useState('');
    const [searchKidShopKeyword, setSearchKidShopKeyword] = useState('');
    const [searchKidHabitKeyword, setSearchKidHabitKeyword] = useState('');
    const [isReordering, setIsReordering] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    // Parent header settings dropdown
    const [showParentSettingsDropdown, setShowParentSettingsDropdown] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [showSecurityParamsModal, setShowSecurityParamsModal] = useState(false);
    // Other missing UI filtering states
    const [historyFilter, setHistoryFilter] = useState('all'); // 'all', 'income', 'expense'
    const [habitCardFilter, setHabitCardFilter] = useState('all'); // 'all', 'income', 'expense', 'completed', 'pending'
    const [showLevelModal, setShowLevelModal] = useState(false);
    const [celebrationData, setCelebrationData] = useState(null);
    const [showPenaltyModal, setShowPenaltyModal] = useState(false);
    const [penaltyTaskContext, setPenaltyTaskContext] = useState(null);
    const [penaltySelectedKidIds, setPenaltySelectedKidIds] = useState([]);
    const kidFilterRef = useRef();
    const kidSortRef = useRef();
    const parentFilterRef = useRef();
    const parentSortRef = useRef();
    const parentSettingsRef = useRef();
    useOnClickOutside(kidFilterRef, () => setShowFilterDropdown(false));
    useOnClickOutside(kidSortRef, () => setShowSortDropdown(false));
    useOnClickOutside(parentFilterRef, () => setShowFilterDropdown(false));
    useOnClickOutside(parentSortRef, () => setShowSortDropdown(false));
    useOnClickOutside(parentSettingsRef, () => setShowParentSettingsDropdown(false));
    // 弹窗状态
    const [taskToSubmit, setTaskToSubmit] = useState(null);
    const [taskIdToEdit, setTaskIdToEdit] = useState(null);
    // Dynamic Categories helper
    const allCategories = Array.from(new Set([...defaultCategories, ...tasks.filter(t => t.type === 'study' && t.category).map(t => t.category)]));
    // Derived states
    const activeKid = kids.find(k => String(k.id) === String(activeKidId)) || kids[0];
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferForm, setTransferForm] = useState({ amount: '', target: 'vault' });
    const [previewImageIndex, setPreviewImageIndex] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showAddPlanModal, setShowAddPlanModal] = useState(false);
    const [showAddKidModal, setShowAddKidModal] = useState(false);
    const [newKidForm, setNewKidForm] = useState({ name: '', gender: 'boy', avatar: '' });
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [showQrScanner, setShowQrScanner] = useState(false);
    const [orderHistoryFilterKid, setOrderHistoryFilterKid] = useState('all');
    const [orderHistoryFilterTime, setOrderHistoryFilterTime] = useState('7'); // '7', '30', 'all'
    const [showLevelRules, setShowLevelRules] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [deleteConfirmTask, setDeleteConfirmTask] = useState(null);
    const [mallSortByPrice, setMallSortByPrice] = useState('none');
    const [orderSortByPrice, setOrderSortByPrice] = useState('none');
    const [orderFilterStatus, setOrderFilterStatus] = useState('all');
    const [kidCheckoutItem, setKidCheckoutItem] = useState(null);
    const [showAvatarPickerModal, setShowAvatarPickerModal] = useState(false);
    const [pendingAvatar, setPendingAvatar] = useState('');
    // Rate Limiting & Emotional Reminder States
    const [pointActionTimings, setPointActionTimings] = useState([]);
    const [showEmotionalReminderModal, setShowEmotionalReminderModal] = useState(false);
    const [emotionalCooldownSeconds, setEmotionalCooldownSeconds] = useState(0);
    const [showRewardModal, setShowRewardModal] = useState(false);
    // Reject Task States
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingTaskInfo, setRejectingTaskInfo] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    // Transaction History Modal States
    const [showTransactionHistoryModal, setShowTransactionHistoryModal] = useState(false);
    const [transactionHistoryFilterTime, setTransactionHistoryFilterTime] = useState('all'); // 'all', '7', '30', '90', 'custom'
    const [transactionHistoryStartDate, setTransactionHistoryStartDate] = useState('');
    const [transactionHistoryEndDate, setTransactionHistoryEndDate] = useState('');
    const [transactionHistoryFilterType, setTransactionHistoryFilterType] = useState('all'); // 'all', 'income', 'expense'
    const [showTimerModal, setShowTimerModal] = useState(false);
    const [timerTargetId, setTimerTargetId] = useState(null);
    const [timerMode, setTimerMode] = useState('select'); // 'select' | 'forward' | 'countdown' | 'pomodoro'
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerTotalSeconds, setTimerTotalSeconds] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerPaused, setTimerPaused] = useState(false);
    const [pomodoroSession, setPomodoroSession] = useState(1);
    const [pomodoroIsBreak, setPomodoroIsBreak] = useState(false);
    const timerRef = useRef(null);
    // 全局计时器引擎
    useEffect(() => {
        if (!showTimerModal || !isTimerRunning || timerPaused) return;
        const intervalId = setInterval(() => {
            setTimerSeconds(prev => {
                if (timerMode === 'countdown') {
                    if (prev <= 1) {
                        setIsTimerRunning(false);
                        playSuccessSound();
                        notify("倒计时结束，任务完成！", "success");
                        return 0;
                    }
                    return prev - 1;
                } else if (timerMode === 'forward') {
                    return prev + 1;
                }
                return prev;
            });
        }, 1000);
        return () => clearInterval(intervalId);
    }, [showTimerModal, isTimerRunning, timerPaused, timerMode]);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [showParentPinModal, setShowParentPinModal] = useState(false);
    const [showKidSwitcher, setShowKidSwitcher] = useState(false);
    // 防止头像选择弹窗滚动
    useEffect(() => {
        if (showAvatarPickerModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [showAvatarPickerModal]);
    // Wealth & Interest State
    const [showInterestDetailsModal, setShowInterestDetailsModal] = useState(false);
    // 快速完成弹窗状态
    const [quickCompleteTask, setQuickCompleteTask] = useState(null);
    const [qcTimeMode, setQcTimeMode] = useState('duration'); // 'duration' | 'actual'
    const [qcHours, setQcHours] = useState(0);
    const [qcMinutes, setQcMinutes] = useState(0);
    const [qcSeconds, setQcSeconds] = useState(0);
    const [qcStartTime, setQcStartTime] = useState('');
    const [qcEndTime, setQcEndTime] = useState('');
    const [qcNote, setQcNote] = useState('');
    const [qcAttachments, setQcAttachments] = useState([]);
    // 表单状态
    const [pinInput, setPinInput] = useState('');
    const [reviewStars, setReviewStars] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [newItem, setNewItem] = useState({ name: '', desc: '', price: '', iconEmoji: '🧸', type: 'single', walletTarget: 'spend', charityTarget: '', maxExchanges: 1, periodMaxType: 'lifetime' });
    const [planType, setPlanType] = useState('study');
    const [lastSavedEndTime, setLastSavedEndTime] = useState(''); // Record last used end time to chain tasks
    const [planForm, setPlanForm] = useState({
        targetKids: ['all'], category: '技能', title: '', desc: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        repeatType: 'today', // 'today' | 'daily' | 'weekly_custom' | 'biweekly_custom' | 'ebbinghaus' | 'weekly_1' | 'biweekly_1' | 'monthly_1' | 'every_week_1' | 'every_biweek_1' | 'every_month_1'
        weeklyDays: [1, 2, 3, 4, 5], // 1=Mon, 7=Sun
        ebbStrength: 'normal',
        periodDaysType: 'any', // 'any' | 'workdays' | 'weekends' | 'custom'
        periodCustomDays: [1, 2, 3, 4, 5],
        periodTargetCount: 1,
        periodMaxPerDay: 1,
        periodMaxType: 'daily', // 'daily' | 'weekly'
        timeSetting: 'range', // 'none' | 'range' | 'duration' - Default to range as requested
        startTime: '', endTime: '', durationPreset: 25,
        pointRule: 'default', // 'default' | 'custom'
        reward: '', iconEmoji: '📚',
        habitColor: 'from-blue-400 to-blue-500',
        habitType: 'daily_once', // 'daily_once' | 'multiple'
        attachments: [],
        requireApproval: true // True by default for tasks granting coins
    });
    // 核心日期匹配逻辑
    // 核心日期匹配逻辑
    const isTaskDueOnDate = (task, dateStr) => {
        if (!task) return false;
        // 行为习惯暂时不过滤日期，除非未来专门改造
        if (task.type === 'habit') return true;
        const currentDt = new Date(dateStr);
        let jsDay = currentDt.getDay(); // 0 is Sunday, 1 is Monday...
        const d = jsDay === 0 ? 7 : jsDay; // Convert to 1=Mon ... 7=Sun
        // ================= V2: Advanced repeatConfig Algorithm =================
        if (task.repeatConfig) {
            const rc = task.repeatConfig;
            // 1. Boundary Checks
            if (task.startDate && dateStr < task.startDate) return false;
            if (rc.endDate && dateStr > rc.endDate) return false;
            // 2. Type-specific Resolution
            if (rc.type === 'today') {
                return task.dates?.includes(dateStr);
            }
            if (rc.type === 'daily') {
                return true;
            }
            if (rc.type === 'weekly_custom') {
                return rc.weeklyDays?.includes(d);
            }
            if (rc.type === 'biweekly_custom') {
                if (!rc.weeklyDays?.includes(d)) return false;
                const msPerDay = 24 * 60 * 60 * 1000;
                const startDt = new Date(task.startDate);
                // Calculate weeks elapsed since start date
                // Align startDt to the same day-of-week it started on, then find weeks diff
                const diffDays = Math.floor((currentDt - startDt) / msPerDay);
                const elapsedWeeks = Math.floor((diffDays + (startDt.getDay() === 0 ? 6 : startDt.getDay() - 1)) / 7);
                return elapsedWeeks % 2 === 0; // Only match even weeks matching start week
            }
            if (rc.type === 'ebbinghaus') {
                const msPerDay = 24 * 60 * 60 * 1000;
                const startDt = new Date(task.startDate);
                const diffDays = Math.floor((currentDt - startDt) / msPerDay);
                let sequence = [];
                if (rc.ebbStrength === 'normal') sequence = [0, 1, 2, 4, 7, 15, 30];
                else if (rc.ebbStrength === 'gentle') sequence = [0, 2, 6, 13, 29];
                else if (rc.ebbStrength === 'exam') sequence = [0, 1, 2, 4, 6, 9, 13];
                else if (rc.ebbStrength === 'enhanced') sequence = [0, 1, 2, 3, 4, 6, 9, 14, 29];
                return sequence.includes(diffDays);
            }
            // --- N-times per Period (N次等区间任务) ---
            // N次任务的核心在于：只要在被允许的日子（periodDaysType），并且当前周期的完成量没达标，就应该显示。
            // 目前 UI 上为了不造成混乱，把 "N次任务" 直接视作为每天在 "allowedDays" 内都显示
            // 我们将在组件内部计算这周是否已完成上限。此处 isTaskDueOnDate 仅返回“这一天是否合法候选日”。
            if (rc.type.includes('_1') || rc.type.includes('_n')) {
                // Determine if today is an allowed day for the period
                if (rc.periodDaysType === 'any') return true;
                if (rc.periodDaysType === 'workdays') return d >= 1 && d <= 5;
                if (rc.periodDaysType === 'weekends') return d === 6 || d === 7;
                if (rc.periodDaysType === 'custom') return rc.periodCustomDays?.includes(d);
                return true;
            }
            return false;
        }
        // ================= V1: Legacy Fallback =================
        if (task.frequency === '每天') return true;
        if (task.frequency === '仅当天') return task.dates?.includes(dateStr);
        if (task.frequency === '每周一至周五') return d >= 1 && d <= 5;
        if (task.frequency === '每周六、周日') return d === 6 || d === 7;
        if (task.startDate && dateStr >= task.startDate) {
            const msPerDay = 24 * 60 * 60 * 1000;
            const startDt = new Date(task.startDate);
            const diffDays = Math.floor((currentDt - startDt) / msPerDay);
            if (task.frequency === '每周一次') return diffDays % 7 === 0;
            if (task.frequency === '每双周') return diffDays % 14 === 0;
            if (task.frequency === '艾宾浩斯记忆法') return [0, 1, 2, 4, 7, 15, 30].includes(diffDays);
        }
        return task.dates?.includes(dateStr) || false;
    };
    // 预览弹窗状态 (Kid App)
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewTask, setPreviewTask] = useState(null); // Full task object for preview
    // Image Preview Zoom Modal State
    const [showImagePreviewModal, setShowImagePreviewModal] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);
    const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
    // Helper function to get weekly completion count
    const getWeeklyCompletionCount = (task, kidId, currentDStr) => {
        const currentDt = new Date(currentDStr);
        const day = currentDt.getDay() || 7;
        const weekStartDt = new Date(currentDt);
        weekStartDt.setDate(currentDt.getDate() - day + 1);
        weekStartDt.setHours(0, 0, 0, 0);
        const weekEndDt = new Date(weekStartDt);
        weekEndDt.setDate(weekStartDt.getDate() + 6);
        weekEndDt.setHours(23, 59, 59, 999);
        let weeklyCount = 0;
        const hist = task.history || {};
        Object.keys(hist).forEach(dStr => {
            const histDt = new Date(dStr);
            if (histDt >= weekStartDt && histDt <= weekEndDt) {
                let entry = task.kidId === 'all' ? hist[dStr]?.[kidId] : hist[dStr];
                if (entry) {
                    if (Array.isArray(entry)) {
                        weeklyCount += entry.filter(e => e.status === 'completed' || e.status === 'pending_approval' || e.status === 'in_progress').length;
                    } else if (entry.status === 'completed' || entry.status === 'pending_approval' || entry.status === 'in_progress') {
                        weeklyCount += (entry.count || 1);
                    }
                }
            }
        });
        return weeklyCount;
    };
    // === 额外约束检查: N次任务防刷限制 ===
    const checkPeriodLimits = (task, kidId, selectedDStr) => {
        if (!task) return { canSubmit: true };
        // Ensure habits are always checked for daily/weekly limits
        if (task.type === 'habit') {
            const hist = task.history || {};
            const entry = task.kidId === 'all' ? hist[selectedDStr]?.[kidId] : hist[selectedDStr];
            const todayCount = entry?.count || (entry?.status === 'completed' ? 1 : 0);
            if (task.habitType === 'daily_once' && todayCount >= 1) {
                return { canSubmit: false, reason: '今天已经完整打过卡啦！' };
            }
            const maxPerDay = task.periodMaxPerDay || 3;
            if (task.habitType === 'multiple') {
                if (task.periodMaxType === 'weekly') {
                    const weekCount = getWeeklyCompletionCount(task, kidId, selectedDStr);
                    if (weekCount >= maxPerDay) {
                        return { canSubmit: false, reason: `本周已达最高上限(${maxPerDay}次)啦！` };
                    }
                } else {
                    // Default to 'daily'
                    if (todayCount >= maxPerDay) {
                        return { canSubmit: false, reason: `今天已达上限(${maxPerDay}次)啦！` };
                    }
                }
            }
        }
        if (!task.repeatConfig) return { canSubmit: true };
        const rc = task.repeatConfig;
        if (!rc.type.includes('_1') && !rc.type.includes('_n')) return { canSubmit: true };
        const currentDt = new Date(selectedDStr);
        let periodStartDt, periodEndDt;
        if (rc.type.includes('week')) {
            const day = currentDt.getDay() || 7;
            periodStartDt = new Date(currentDt);
            periodStartDt.setDate(currentDt.getDate() - day + 1);
            periodStartDt.setHours(0, 0, 0, 0);
            periodEndDt = new Date(periodStartDt);
            periodEndDt.setDate(periodStartDt.getDate() + 6);
            periodEndDt.setHours(23, 59, 59, 999);
        } else if (rc.type.includes('month')) {
            periodStartDt = new Date(currentDt.getFullYear(), currentDt.getMonth(), 1);
            periodEndDt = new Date(currentDt.getFullYear(), currentDt.getMonth() + 1, 0, 23, 59, 59, 999);
        }
        if (!periodStartDt) {
            return { canSubmit: true };
        }
        let periodCompletions = 0;
        let todayCompletions = 0;
        const hist = task.history || {};
        Object.keys(hist).forEach(dStr => {
            const histDt = new Date(dStr);
            if (histDt >= periodStartDt && histDt <= periodEndDt) {
                const entry = task.kidId === 'all' ? hist[dStr]?.[kidId] : hist[dStr];
                if (entry && (entry.status === 'completed' || entry.status === 'pending_approval' || entry.status === 'in_progress')) {
                    const count = entry.count || 1;
                    periodCompletions += count;
                    if (dStr === selectedDStr) todayCompletions += count;
                }
            }
        });
        if (periodCompletions >= rc.periodTargetCount) {
            return { canSubmit: false, reason: `本周期已达成目标(${rc.periodTargetCount}次)啦！` };
        }
        if (todayCompletions >= rc.periodMaxPerDay) {
            return { canSubmit: false, reason: `今天已达上限(${rc.periodMaxPerDay}次)啦，改天再做吧～` };
        }
        return { canSubmit: true };
    };
    const handleAttemptSubmit = async (task) => {
        const limits = checkPeriodLimits(task, activeKidId, selectedDate);
        if (!limits.canSubmit) return notify(limits.reason, 'error');
        if (task.type === 'habit') {
            try {
                const hist = task.history || {};
                let newHistory = JSON.parse(JSON.stringify(hist));
                const newRecord = { status: 'completed', attemptId: `attempt_${Date.now()}_${activeKidId}_${Math.random().toString(36).substr(2, 5)}` };
                if (task.kidId === 'all') {
                    if (!newHistory[selectedDate]) newHistory[selectedDate] = {};
                    if (!newHistory[selectedDate][activeKidId]) newHistory[selectedDate][activeKidId] = [];
                    if (!Array.isArray(newHistory[selectedDate][activeKidId])) {
                        if (newHistory[selectedDate][activeKidId].status) newHistory[selectedDate][activeKidId] = [newHistory[selectedDate][activeKidId]];
                        else newHistory[selectedDate][activeKidId] = [];
                    }
                    newHistory[selectedDate][activeKidId].push(newRecord);
                } else {
                    if (!newHistory[selectedDate]) newHistory[selectedDate] = [];
                    if (!Array.isArray(newHistory[selectedDate])) {
                        if (newHistory[selectedDate].status) newHistory[selectedDate] = [newHistory[selectedDate]];
                        else newHistory[selectedDate] = [];
                    }
                    newHistory[selectedDate].push(newRecord);
                }
                // Optimistic UI updates
                setTasks(tasks.map(t => t.id === task.id ? { ...t, history: newHistory } : t));
                const targetKid = kids.find(k => k.id === activeKidId);
                let newExp = targetKid ? targetKid.exp : 0;
                let newBals = targetKid ? { ...targetKid.balances } : {};
                if (targetKid) {
                    const expDiff = Math.ceil((task.reward || 0) * 1.5);
                    newExp = Math.max(0, targetKid.exp + expDiff);
                    newBals = { ...targetKid.balances, spend: Math.max(0, targetKid.balances.spend + (task.reward || 0)) };
                    setKids(kids.map(k => k.id === activeKidId ? { ...k, exp: newExp, balances: newBals } : k));
                }
                if (task.reward !== 0) {
                    setTransactions(prev => [
                        { id: `trans_${Date.now()}_coin`, kidId: activeKidId, type: task.reward > 0 ? 'income' : 'expense', amount: Math.abs(task.reward || 0), title: `记录成长: ${task.title}`, date: new Date().toISOString(), category: 'habit' },
                        { id: `trans_${Date.now()}_exp`, kidId: activeKidId, type: task.reward > 0 ? 'income' : 'expense', amount: Math.ceil(Math.abs(task.reward || 0) * 1.5), title: `记录成长: ${task.title}`, date: new Date().toISOString(), category: 'habit' },
                        ...prev
                    ]);
                }
                playSuccessSound();
                if (task.reward > 0) {
                    const messages = ["太棒了！你的坚持让家庭财富又增加啦！🌟", "自律的你，正在闪闪发光！✨", "一个小小的习惯，成就大大的未来！🚀", "付出总有回报，金币+1！💰", "保持良好的习惯，你是全家的骄傲！🏅"];
                    setCelebrationData({ task, message: messages[Math.floor(Math.random() * messages.length)], type: 'positive' });
                } else if (task.reward < 0) {
                    const messages = ["诚实是金！即使扣分，你的坦白也值得欣赏！🛡️", "知错能改，善莫大焉，下次一定能做好！💪", "勇敢承认错误，你已经赢了第一步！✨"];
                    setCelebrationData({ task, message: messages[Math.floor(Math.random() * messages.length)], type: 'negative' });
                } else {
                    notify("打卡成功！", "success");
                }
                // Background network sync
                apiFetch(`/api/tasks/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: newHistory }) }).catch(e => console.error(e));
                if (task.reward !== 0) {
                    apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kidId: activeKidId, type: task.reward > 0 ? 'income' : 'expense', amount: Math.abs(task.reward || 0), title: `记录成长: ${task.title}`, date: new Date().toISOString(), category: 'habit' }) }).catch(e => console.error(e));
                    apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kidId: activeKidId, type: task.reward > 0 ? 'income' : 'expense', amount: Math.ceil(Math.abs(task.reward || 0) * 1.5), title: `记录成长: ${task.title}`, date: new Date().toISOString(), category: 'habit' }) }).catch(e => console.error(e));
                }
                if (targetKid) {
                    apiFetch(`/api/kids/${activeKidId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ exp: newExp, balances: newBals }) }).catch(e => console.error(e));
                }
            } catch (e) {
                notify("网络请求失败", "error");
            }
        } else {
            setTaskToSubmit(task);
        }
    };
    // === 全局方法 ===
    const getTaskStatusOnDate = (t, date, kidId) => {
        if (!t?.history) return 'todo';
        let entry = t.kidId === 'all' ? t.history[date]?.[kidId] : t.history[date];
        if (!entry) return 'todo';
        return Array.isArray(entry) ? (entry.length > 0 ? entry[0].status : 'todo') : (entry.status || 'todo');
    };
    const getTaskTimeSpent = (t, date, kidId) => {
        if (!t?.history) return null;
        if (t.kidId === 'all') return t.history[date]?.[kidId]?.timeSpent;
        return t.history[date]?.timeSpent;
    };
    const playSuccessSound = () => {
        try {
            // Use a globally cached AudioContext to prevent severe main-thread freezing and memory leaks
            if (!window.AudioContext && !window.webkitAudioContext) return;
            if (!globalAudioCtx) {
                const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
                globalAudioCtx = new AudioCtxClass();
            }
            const ctx = globalAudioCtx;
            if (ctx.state === 'suspended') {
                ctx.resume(); // Force wake on iOS
            }
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.type = 'sine';
            const now = ctx.currentTime;
            // Bright cheerful chime (C5 -> C6 sweep)
            oscillator.frequency.setValueAtTime(523.25, now);
            oscillator.frequency.exponentialRampToValueAtTime(1046.50, now + 0.1);
            gainNode.gain.setValueAtTime(0.5, now); // Start loud
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3); // Fade out quickly
            oscillator.start(now);
            oscillator.stop(now + 0.3);
            // Don't close the global context! Let it persist for subsequent plays
        } catch (e) {
            console.error("Audio playback failed:", e);
        }
    };
    const updateActiveKid = async (updates) => {
        try {
            await apiFetch(`/api/kids/${activeKidId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates)
            });
            setKids(kids.map(k => k.id === activeKidId ? { ...k, ...updates } : k));
        } catch (e) { console.error(e); notify("网络请求失败", "error"); }
    };
    const updateKidData = async (targetKidId, updates) => {
        try {
            await apiFetch(`/api/kids/${targetKidId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates)
            });
            setKids(prevKids => prevKids.map(k => k.id === targetKidId ? { ...k, ...updates } : k));
        } catch (e) { console.error(e); notify("网络请求失败", "error"); }
    };
    const getLevelReq = (level) => level * 100;
    const handleStartTask = (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        const limits = checkPeriodLimits(task, activeKidId, selectedDate);
        if (!limits.canSubmit) return notify(limits.reason, 'error');
        setTimerTargetId(id);
        let secs = 900;
        if (task && task.timeStr && task.timeStr.includes('分钟')) {
            const m = parseInt(task.timeStr);
            if (!isNaN(m)) secs = m * 60;
        }
        setTimerTotalSeconds(secs);
        setTimerMode('select');
        setIsTimerRunning(false);
        setTimerPaused(false);
        setShowTimerModal(true);
    };
    const handleDeleteTask = async (id) => {
        try {
            await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
            setTasks(tasks.filter(t => t.id !== id));
            setDeleteConfirmTask(null);
            notify('任务已删除', 'success');
        } catch (e) {
            console.error(e);
            notify('删除失败', 'error');
        }
    };
    const confirmSubmitTask = async () => {
        if (!taskToSubmit) return;
        playSuccessSound(); // Fire exactly on click to bypass iOS async suspensions
        // Construct payload specifically based on whether history is 1D or 2D (unified)
        const histUpdate = { status: 'pending_approval' };
        let newHistory = { ...(taskToSubmit.history || {}) };
        if (taskToSubmit.kidId === 'all') {
            newHistory[selectedDate] = { ...(newHistory[selectedDate] || {}), [activeKidId]: histUpdate };
        } else {
            newHistory[selectedDate] = histUpdate;
        }
        try {
            await apiFetch(`/api/tasks/${taskToSubmit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: newHistory })
            });
            setTasks(tasks.map(t => t.id === taskToSubmit.id ? { ...t, history: newHistory } : t));
            setTaskToSubmit(null);
            notify("已快速完成并提交！等待家长审核。", "success");
        } catch (e) { notify("网络请求失败", "error"); }
    };
    const openQuickComplete = (task) => {
        const limits = checkPeriodLimits(task, activeKidId, selectedDate);
        if (!limits.canSubmit) return notify(limits.reason, 'error');
        setQuickCompleteTask(task);
        let dHours = 0;
        let dMinutes = 0;
        let sTime = '';
        const now = new Date();
        const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        let defaultMode = 'duration';
        if (task.timeStr) {
            // Check for range pattern HH:mm ~ HH:mm
            const rangeMatch = task.timeStr.match(/(\d{1,2}:\d{2})\s*(?:-|~|到|至)\s*(\d{1,2}:\d{2})/);
            // Check for duration pattern like 30分钟, 1小时, 1.5小时
            const minMatch = task.timeStr.match(/(\d+)\s*(?:分钟|min|m)/);
            const hrMatch = task.timeStr.match(/(\d+(?:\.\d+)?)\s*(?:小时|hour|hr|h|个钟)/);
            if (rangeMatch) {
                const [sH, sM] = rangeMatch[1].split(':').map(Number);
                const [eH, eM] = rangeMatch[2].split(':').map(Number);
                let diffMins = (eH * 60 + eM) - (sH * 60 + sM);
                if (diffMins < 0) diffMins += 24 * 60; // Handle cross-midnight logic if necessary
                // Subtract duration from now to get actual logical start time
                const startRealDate = new Date(now.getTime() - diffMins * 60000);
                sTime = `${String(startRealDate.getHours()).padStart(2, '0')}:${String(startRealDate.getMinutes()).padStart(2, '0')}`;
                dHours = Math.floor(diffMins / 60);
                dMinutes = diffMins % 60;
                defaultMode = 'actual';
            } else if (minMatch || hrMatch) {
                let totalM = 0;
                if (minMatch) {
                    totalM = parseInt(minMatch[1]);
                } else if (hrMatch) {
                    totalM = Math.round(parseFloat(hrMatch[1]) * 60);
                }
                dHours = Math.floor(totalM / 60);
                dMinutes = totalM % 60;
                // Calculate Logical Start Time = End Time (Now) - Target Duration
                const startRealDate = new Date(now.getTime() - totalM * 60000);
                sTime = `${String(startRealDate.getHours()).padStart(2, '0')}:${String(startRealDate.getMinutes()).padStart(2, '0')}`;
                defaultMode = 'duration';
            } else {
                // Check if it's just a single time like 20:00 (no endpoint known, fallback)
                const timeMatch = task.timeStr.match(/(\d{1,2}:\d{2})/);
                if (timeMatch) {
                    sTime = timeMatch[1].padStart(5, '0');
                    defaultMode = 'actual';
                }
            }
        }
        setQcTimeMode(defaultMode);
        setQcHours(dHours);
        setQcMinutes(dMinutes);
        setQcSeconds(0);
        setQcStartTime(sTime);
        setQcEndTime(nowStr);
        setQcNote('');
        setQcAttachments([]);
    };
    const handleQcQuickDuration = (totalMinutes) => {
        setQcHours(Math.floor(totalMinutes / 60));
        setQcMinutes(totalMinutes % 60);
        setQcSeconds(0);
    };
    const handleQcFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (qcAttachments.length + files.length > 5) {
            notify('最多上传5个附件', 'error');
            return;
        }
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setQcAttachments(prev => [...prev, { name: file.name, type: file.type, data: ev.target.result, size: file.size }]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };
    // 快速完成功能 
    const handleQuickComplete = async () => {
        if (qcTimeMode === 'actual' && (!qcStartTime || !qcEndTime)) {
            return notify('请填写完整的起止时间', 'error');
        }
        playSuccessSound(); // Fire exactly on click to bypass iOS async suspensions
        let spentStr = '';
        if (qcTimeMode === 'duration') {
            if (qcHours === 0 && qcMinutes === 0 && qcSeconds === 0) return notify('请填写耗时', 'error');
            spentStr = `${qcHours > 0 ? qcHours + '小时' : ''}${qcMinutes > 0 ? qcMinutes + '分钟' : ''}${qcSeconds > 0 ? qcSeconds + '秒' : ''}`;
        } else {
            spentStr = `${qcStartTime} ~ ${qcEndTime}`;
        }
        const taskToSubmit = quickCompleteTask;
        if (!taskToSubmit) return;
        // Auto-approve logic check
        const isAutoApprove = taskToSubmit.requireApproval === false;
        const finalStatus = isAutoApprove ? 'completed' : 'pending_approval';
        // Construct payload specifically based on whether history is 1D or 2D (unified)
        const histUpdate = { status: finalStatus, timeSpent: spentStr, note: qcNote, attachments: qcAttachments };
        let newHistory = { ...(taskToSubmit.history || {}) };
        if (taskToSubmit.kidId === 'all') {
            newHistory[selectedDate] = { ...(newHistory[selectedDate] || {}), [activeKidId]: histUpdate };
        } else {
            newHistory[selectedDate] = histUpdate;
        }
        try {
            await apiFetch(`/api/tasks/${taskToSubmit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: newHistory })
            });
            setTasks(tasks.map(t => t.id === taskToSubmit.id ? { ...t, history: newHistory } : t));
            setQuickCompleteTask(null);
            if (isAutoApprove && taskToSubmit.reward > 0) {
                // Instantly generate transaction and family coins
                const newTrans = {
                    id: `trans_${Date.now()}`,
                    kidId: activeKidId,
                    type: 'income',
                    amount: taskToSubmit.reward || 0,
                    title: `完成: ${taskToSubmit.title}`,
                    date: new Date().toISOString(),
                    category: 'task'
                };
                await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTrans) });
                setTransactions(prev => [newTrans, ...prev]);
                const targetKid = kids.find(k => k.id === activeKidId);
                if (targetKid) {
                    const newBals = { ...targetKid.balances, spend: targetKid.balances.spend + (taskToSubmit.reward || 0) };
                    await updateActiveKid({ balances: newBals });
                    // NEW DUAL REWARDS LOGIC: Gain EXP on task completion
                    if (taskToSubmit.reward > 0) {
                        const expGained = Math.ceil(taskToSubmit.reward * 1.5);
                        await handleExpChange(activeKidId, expGained);
                        notify(`打卡成功！获得 ${taskToSubmit.reward} 家庭币 和 ${expGained} 经验值！`, 'success');
                        return; // Exit early to use combined notification
                    }
                }
                notify(`打卡成功！已自动发放 ${taskToSubmit.reward} 家庭币！`, 'success');
            } else {
                notify('已提交审核，等待家长发放家庭币哦！', 'success');
            }
        } catch (e) {
            notify('提交失败', 'error');
        }
    };
    const handleExpChange = async (kidId, expChange) => {
        const kid = kids.find(k => k.id === kidId);
        if (!kid) return;
        let newExp = kid.exp + expChange;
        let newLevel = kid.level;
        while (newExp >= getLevelReq(newLevel)) {
            newExp -= getLevelReq(newLevel);
            newLevel++;
            notify(`太棒了！${kid.name} 升到了 Lv.${newLevel}！`, "success");
        }
        while (newExp < 0 && newLevel > 1) {
            newLevel--;
            newExp += getLevelReq(newLevel);
            notify(`注意！${kid.name} 降到了 Lv.${newLevel}。`, "error");
        }
        if (newExp < 0 && newLevel === 1) newExp = 0;
        try {
            await apiFetch(`/api/kids/${kidId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ level: newLevel, exp: newExp }) });
            setKids(prevKids => prevKids.map(k => k.id === kidId ? { ...k, exp: newExp, level: newLevel } : k));
        } catch (e) { notify("网络请求失败", "error"); }
    };
    const handleMarkHabitComplete = async (task, date) => {
        try {
            await apiFetch(`/api/tasks/${task.id}/history`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date, status: 'completed' }) });
            setTasks(tasks.map(t => {
                if (t.id === task.id) {
                    let dateHist = t.history?.[date] || [];
                    if (!Array.isArray(dateHist)) {
                        dateHist = dateHist.status ? [dateHist] : [];
                    }
                    const newEntry = { status: 'completed', attemptId: `kid_attempt_${Date.now()}` };
                    const newHist = { ...(t.history || {}), [date]: [...dateHist, newEntry] };
                    return { ...t, history: newHist };
                }
                return t;
            }));
            const targetKid = kids.find(k => k.id === task.kidId);
            if (!targetKid) return;
            if (task.type === 'habit') {
                if (task.reward > 0) {
                    // 1. Give Family Coins & Transaction (For Wealth Center)
                    const newTrans = {
                        id: `trans_${Date.now()}`,
                        kidId: task.kidId,
                        type: 'income',
                        amount: task.reward || 0,
                        title: `完成记录: ${task.title}`,
                        date: new Date().toISOString(),
                        category: 'habit'
                    };
                    await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTrans) });
                    const expGained = Math.ceil((task.reward || 0) * 1.5);
                    // 2. Give EXP & Transaction (For Growth Footprints)
                    const expTrans = {
                        id: `trans_${Date.now()}_exp`,
                        kidId: task.kidId,
                        type: 'income',
                        amount: expGained,
                        title: `完成记录: ${task.title}`,
                        date: new Date().toISOString(),
                        category: 'habit'
                    };
                    await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expTrans) });
                    setTransactions([newTrans, expTrans, ...transactions]);
                    const newBals = { ...targetKid.balances, spend: targetKid.balances.spend + task.reward };
                    await updateActiveKid({ balances: newBals });
                    await handleExpChange(task.kidId, expGained);
                    notify(`打卡成功！已奖励 ${targetKid.name} ${task.reward} 家庭币 和 ${expGained} 经验！`, "success");
                } else {
                    // Penalty: Deduct EXP and Coins
                    const absPenalty = Math.abs(task.reward);
                    const newBals = { ...targetKid.balances, spend: Math.max(0, targetKid.balances.spend - absPenalty) };
                    await updateActiveKid({ balances: newBals });
                    const expPenalty = Math.ceil(absPenalty * 1.5);
                    const refundTrans = {
                        id: `trans_${Date.now()}_penalty`,
                        kidId: task.kidId,
                        type: 'expense',
                        amount: absPenalty,
                        title: `违规扣分: ${task.title}`,
                        date: new Date().toISOString(),
                        category: 'habit'
                    };
                    const expRefundTrans = {
                        id: `trans_${Date.now()}_penalty_exp`,
                        kidId: task.kidId,
                        type: 'expense',
                        amount: expPenalty,
                        title: `违规扣分: ${task.title}`,
                        date: new Date().toISOString(),
                        category: 'habit'
                    };
                    await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(refundTrans) });
                    await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expRefundTrans) });
                    setTransactions(prev => [refundTrans, expRefundTrans, ...prev]);
                    await handleExpChange(task.kidId, -expPenalty);
                    notify(`已扣除 ${targetKid.name} ${absPenalty} 家庭币和 ${expPenalty} 经验。`, "error");
                }
            }
        } catch (e) { notify("网络请求失败", "error"); }
    };
    const handleRejectTask = async (task, dateStr, kidId, reason = '') => {
        try {
            const oldHistory = task.history && task.history[dateStr] && task.history[dateStr][kidId] ? task.history[dateStr][kidId] : {};
            // Revert state -> 'failed' instead of 'todo' so it stays logged but child can restart
            const histUpdates = { ...task.history };
            if (!histUpdates[dateStr]) histUpdates[dateStr] = {};
            histUpdates[dateStr] = {
                ...histUpdates[dateStr],
                [kidId]: { ...oldHistory, status: 'failed', rejectFeedback: reason } // preserve timeSpent and current note, add feedback
            };
            await apiFetch(`/api/tasks/${task.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: histUpdates })
            });
            setTasks(tasks.map(t => t.id === task.id ? { ...t, history: histUpdates } : t));
            // Reverse reward/penalty if was previously completed
            if (oldHistory.status === 'completed') {
                const isStudy = task.type === 'study';
                let absReward = Math.abs(task.reward || 0);
                if (isStudy && absReward > 0) {
                    const targetKid = kids.find(k => String(k.id) === String(kidId));
                    if (targetKid) {
                        const newBal = Math.max(0, targetKid.balances.spend - absReward);
                        await apiFetch(`/api/kids/${kidId}`, {
                            method: 'PUT', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ balances: { ...targetKid.balances, spend: newBal } })
                        });
                        setKids(kids.map(k => String(k.id) === String(kidId) ? { ...k, balances: { ...k.balances, spend: newBal } } : k));
                        // Create negative transaction to balance ledger
                        const refundTrans = {
                            id: `trans_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                            kidId: kidId,
                            type: 'expense',
                            amount: absReward,
                            title: `未达标撤回: ${task.title}`,
                            date: new Date().toISOString(),
                            category: 'task'
                        };
                        await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(refundTrans) });
                        setTransactions([refundTrans, ...transactions]);
                    }
                } else if (!isStudy) {
                    const absReward = Math.abs(task.reward || 0);
                    const targetKid = kids.find(k => String(k.id) === String(kidId));
                    if (targetKid) {
                        if (task.reward > 0) {
                            // Reverse positive habit logic: Deduct Coins & EXP
                            const newBal = Math.max(0, targetKid.balances.spend - absReward);
                            const newExp = Math.max(0, targetKid.exp - Math.ceil(absReward * 1.5));
                            await apiFetch(`/api/kids/${kidId}`, {
                                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ balances: { ...targetKid.balances, spend: newBal }, exp: newExp })
                            });
                            setKids(kids.map(k => String(k.id) === String(kidId) ? { ...k, balances: { ...k.balances, spend: newBal }, exp: newExp } : k));
                            // Negative reversed transaction
                            const refundTrans = {
                                id: `trans_${Date.now()}_reversed_coin`,
                                kidId: kidId,
                                type: 'expense',
                                amount: absReward,
                                title: `违规撤回记录: ${task.title}`,
                                date: new Date().toISOString(),
                                category: 'task'
                            };
                            const expRefundTrans = {
                                id: `trans_${Date.now()}_reversed_exp`,
                                kidId: kidId,
                                type: 'expense',
                                amount: Math.ceil(absReward * 1.5),
                                title: `违规撤回记录: ${task.title}`,
                                date: new Date().toISOString(),
                                category: 'habit'
                            };
                            await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(refundTrans) });
                            await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expRefundTrans) });
                            setTransactions([refundTrans, expRefundTrans, ...transactions]);
                        } else {
                            // Reverse penalty: Refund Coins & EXP
                            const newBal = targetKid.balances.spend + absReward;
                            const newExp = targetKid.exp + Math.ceil(absReward * 1.5);
                            await apiFetch(`/api/kids/${kidId}`, {
                                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ balances: { ...targetKid.balances, spend: newBal }, exp: newExp })
                            });
                            setKids(kids.map(k => String(k.id) === String(kidId) ? { ...k, balances: { ...k.balances, spend: newBal }, exp: newExp } : k));
                            // Positive refund transaction
                            const refundTrans = {
                                id: `trans_${Date.now()}_refund_coin`,
                                kidId: kidId,
                                type: 'income',
                                amount: absReward,
                                title: `补偿撤销扣分: ${task.title}`,
                                date: new Date().toISOString(),
                                category: 'task'
                            };
                            const expRefundTrans = {
                                id: `trans_${Date.now()}_refund_exp`,
                                kidId: kidId,
                                type: 'income',
                                amount: Math.ceil(absReward * 1.5),
                                title: `补偿撤销扣分: ${task.title}`,
                                date: new Date().toISOString(),
                                category: 'habit'
                            };
                            await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(refundTrans) });
                            await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expRefundTrans) });
                            setTransactions([refundTrans, expRefundTrans, ...transactions]);
                        }
                    }
                }
            } // ADDED MISSING CLOSING BRACE
            if (editingTask && editingTask.id === task.id) {
                setEditingTask({ ...task, history: histUpdates });
            }
            notify(oldHistory.status === 'completed' ? "已打回为不达标状态，并撤回相关奖励！" : "已打回为不达标状态", "success");
        } catch (e) {
            console.error(e);
            notify("操作失败", "error");
        }
    };
    const handleApproveTask = async (task, date, actualKidId) => {
        try {
            // Write to Transaction Table First
            const newTrans = {
                id: `trans_${Date.now()}`,
                kidId: actualKidId, // Note: must use actualKidId in case of unified 'all' tasks
                type: 'income',
                amount: task.reward || 0,
                title: `完成: ${task.title}`,
                date: new Date().toISOString(),
                category: 'task'
            };
            if (task.reward > 0) {
                await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTrans) });
                setTransactions([newTrans, ...transactions]);
            }
            // Then Update Task History
            const histUpdate = { status: 'completed' };
            let newHistory = { ...(task.history || {}) };
            if (task.kidId === 'all') {
                newHistory[date] = { ...(newHistory[date] || {}), [actualKidId]: { ...(newHistory[date]?.[actualKidId] || {}), ...histUpdate } };
            } else {
                newHistory[date] = { ...(newHistory[date] || {}), ...histUpdate };
            }
            await apiFetch(`/api/tasks/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: newHistory }) });
            setTasks(tasks.map(t => t.id === task.id ? { ...t, history: newHistory } : t));
            // Increase Balances & EXP
            const kid = kids.find(k => k.id === actualKidId);
            if (kid && task.reward > 0) {
                const newBals = { ...kid.balances, spend: kid.balances.spend + task.reward };
                // NEW DUAL REWARDS LOGIC: Parent Approval gives EXP
                const expGained = Math.ceil(task.reward * 1.5);
                let newExp = kid.exp + expGained;
                let newLevel = kid.level;
                // Manual fast-forward level loop for combined backend call
                while (newExp >= getLevelReq(newLevel)) {
                    newExp -= getLevelReq(newLevel);
                    newLevel++;
                    notify(`太棒了！${kid.name} 升到了 Lv.${newLevel}！`, "success");
                }
                await apiFetch(`/api/kids/${actualKidId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ balances: newBals, exp: newExp, level: newLevel }) });
                setKids(prevKids => prevKids.map(k => k.id === actualKidId ? { ...k, balances: newBals, exp: newExp, level: newLevel } : k));
                notify(`已审批！奖励 ${task.reward} 家庭币和 ${expGained} 经验值！`, "success");
            }
        } catch (e) { notify("网络请求失败", "error"); }
    };
    const handleApproveAllTasks = async (approvalsList) => {
        if (!approvalsList || approvalsList.length === 0) return;
        try {
            const timestamp = Date.now();
            let newTransactions = [];
            let kidRewardTotals = {}; // Map of kidId -> total reward
            let taskUpdates = {}; // Map of taskId -> newHistory
            // 1. Process all approvals logically
            for (let i = 0; i < approvalsList.length; i++) {
                const { task, date, actualKidId } = approvalsList[i];
                // Track rewards per kid
                if (task.reward > 0) {
                    kidRewardTotals[actualKidId] = (kidRewardTotals[actualKidId] || 0) + task.reward;
                    newTransactions.push({
                        id: `trans_${timestamp}_${i}`,
                        kidId: actualKidId,
                        type: 'income',
                        amount: task.reward || 0,
                        title: `完成: ${task.title}`,
                        date: new Date().toISOString(),
                        category: 'task'
                    });
                }
                // Compile task history updates
                if (!taskUpdates[task.id]) {
                    taskUpdates[task.id] = { ...(task.history || {}) };
                }
                const histUpdate = { status: 'completed' };
                if (task.kidId === 'all') {
                    taskUpdates[task.id][date] = { ...(taskUpdates[task.id][date] || {}), [actualKidId]: { ...(taskUpdates[task.id][date]?.[actualKidId] || {}), ...histUpdate } };
                } else {
                    taskUpdates[task.id][date] = { ...(taskUpdates[task.id][date] || {}), ...histUpdate };
                }
            }
            // 2. Execute Backend Calls
            const promises = [];
            // Post transactions
            for (const trans of newTransactions) {
                promises.push(apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(trans) }));
            }
            // Update tasks
            for (const taskId in taskUpdates) {
                promises.push(apiFetch(`/api/tasks/${taskId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: taskUpdates[taskId] }) }));
            }
            // Update kids balances and EXP
            for (const kidId in kidRewardTotals) {
                const kid = kids.find(k => k.id === kidId);
                if (kid) {
                    const newBals = { ...kid.balances, spend: kid.balances.spend + kidRewardTotals[kidId] };
                    const totalExpGained = Math.ceil(kidRewardTotals[kidId] * 1.5);
                    let newExp = kid.exp + totalExpGained;
                    let newLevel = kid.level;
                    while (newExp >= getLevelReq(newLevel)) {
                        newExp -= getLevelReq(newLevel);
                        newLevel++;
                    }
                    promises.push(apiFetch(`/api/kids/${kidId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ balances: newBals, exp: newExp, level: newLevel }) }));
                }
            }
            await Promise.all(promises);
            // 3. Update React State Bulk
            if (newTransactions.length > 0) {
                setTransactions(prev => [...newTransactions, ...prev]);
            }
            setTasks(prevTasks => prevTasks.map(t => {
                if (taskUpdates[t.id]) {
                    return { ...t, history: taskUpdates[t.id] };
                }
                return t;
            }));
            apiFetch('/api/kids').then(r => r.json()).then(setKids).catch(console.error); // Reload kids to get fresh balances across the board
            notify(`一键审批完成！共计发放了 ${Object.values(kidRewardTotals).reduce((a, b) => a + b, 0) || 0} 家庭币。`, "success");
        } catch (e) {
            notify("批量审批网络请求部分失败，请刷新页面查看最新状态", "error");
            console.error(e);
        }
    };
    const confirmTransfer = async () => {
        const amount = parseInt(transferForm.amount);
        const activeKid = kids.find(k => k.id === activeKidId);
        if (!amount || amount <= 0 || amount > activeKid.balances.spend) {
            return notify("请输入有效的划转金额！", "error");
        }
        try {
            const newSpend = activeKid.balances.spend - amount;
            let newVault = { ...activeKid.vault };
            let newBalances = { ...activeKid.balances, spend: newSpend };
            if (transferForm.target === 'vault') {
                newVault.lockedAmount += amount;
                // Dynamically update projected return based on level (5% base + 1% per level)
                const apy = 5 + activeKid.level;
                newVault.projectedReturn = Math.floor(newVault.lockedAmount * (apy / 100));
            } else if (transferForm.target === 'give') {
                newBalances.give += amount;
            }
            // Sync with backend
            await apiFetch(`/api/kids/${activeKidId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ balances: newBalances, vault: newVault })
            });
            setKids(kids.map(k => k.id === activeKidId ? { ...k, balances: newBalances, vault: newVault } : k));
            setShowTransferModal(false);
            setTransferForm({ amount: '', target: 'vault' });
            notify(`成功划转 ${amount} 家庭币！`, "success");
        } catch (e) { notify("网络请求失败", "error"); }
    };
    const buyItem = async (item) => {
        const activeKid = kids.find(k => k.id === activeKidId);
        const targetWallet = item.walletTarget === 'give' ? 'give' : 'spend';
        const walletName = targetWallet === 'give' ? '爱心基金' : '零花钱';
        if ((activeKid.balances[targetWallet] || 0) < item.price) {
            notify(`${walletName}不够，去“学习任务”赚点吧！`, 'error');
            return false;
        }
        // Check limits per kid
        const kidOrders = orders.filter(o => o.kidId === activeKidId && o.itemId === item.id);
        if (item.type === 'single') {
            if (kidOrders.length >= 1) {
                notify("此愿望/商品仅可兑换一次，你已经兑换过啦！", "error");
                return false;
            }
        } else if (item.type === 'multiple') {
            const maxAllowed = item.maxExchanges || Infinity;
            if (kidOrders.length >= maxAllowed) {
                notify(`该商品最多兑换 ${maxAllowed} 次，你已达到上限！`, "error");
                return false;
            }
        }
        // Generate a unique 8-character redeem code
        const redeemCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        const newOrder = {
            id: `ORD-${Math.floor(Math.random() * 100000)}`,
            kidId: activeKidId,
            itemId: item.id,
            itemName: item.name,
            price: item.price,
            status: 'shipping',
            date: new Date().toLocaleDateString(),
            rating: 0,
            comment: "",
            redeemCode: redeemCode
        };
        try {
            const newBalances = { ...activeKid.balances, [targetWallet]: (activeKid.balances[targetWallet] || 0) - item.price };
            await apiFetch(`/api/kids/${activeKidId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ balances: newBalances }) });
            await apiFetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newOrder) });
            // Record Transaction
            const newTrans = {
                id: `trans_${Date.now()}`,
                kidId: activeKidId,
                type: 'expense',
                amount: item.price,
                title: `兑换: ${item.name}`,
                date: new Date().toISOString(),
                category: 'wish'
            };
            await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTrans) });
            // NOTE: We no longer delete single items globally from inventory so other kids can still buy them!
            setTransactions([newTrans, ...transactions]);
            // Optimistic Update
            setKids(kids.map(k => k.id === activeKidId ? { ...k, balances: newBalances } : k));
            setOrders([newOrder, ...orders]);
            notify(`下单成功！快去拿给爸爸妈妈核销吧！`, "success");
            return true;
        } catch (e) {
            notify("网络请求失败", "error");
            return false;
        }
    };
    const getDefaultTimeRange = () => {
        if (!lastSavedEndTime) return { start: "17:00", end: "18:00" };
        const [h, m] = lastSavedEndTime.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return { start: "17:00", end: "18:00" };
        const endH = (h + 1) % 24;
        return {
            start: lastSavedEndTime,
            end: `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        };
    };
    // --- DAILY INTEREST CALCULATION (TIME VAULT) ---
    useEffect(() => {
        if (!kids.length) return;
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        let needsUpdate = false;
        const promises = [];
        const newKids = [...kids];
        const newTransactions = [...transactions];
        newKids.forEach((kid, index) => {
            if (!kid.vault) kid.vault = { lockedAmount: 0, lastInterestDate: null, totalInterest: 0 };
            // Generate interest if the last interest date is not today, and vault has money
            if (kid.vault.lockedAmount > 0 && kid.vault.lastInterestDate !== todayStr) {
                // Calculate 1% daily interest, minimum 1 coin (because it's fun for kids)
                const dailyInterest = Math.max(1, Math.floor(kid.vault.lockedAmount * 0.01));
                kid.vault.lockedAmount += dailyInterest;
                kid.vault.totalInterest = (kid.vault.totalInterest || 0) + dailyInterest;
                kid.vault.lastInterestDate = todayStr;
                needsUpdate = true;
                // Log the interest as a transaction
                const interestTx = {
                    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    kidId: kid.id,
                    type: 'income',
                    amount: dailyInterest,
                    category: 'interest',
                    title: `✨ 时光金库自动生息 (+${dailyInterest}币)`,
                    date: now.toISOString(),
                };
                newTransactions.push(interestTx);
                promises.push(apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(interestTx) }));
                promises.push(apiFetch(`/api/kids/${kid.id}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ vault: kid.vault })
                }));
            }
        });
        if (needsUpdate) {
            setKids(newKids);
            setTransactions(newTransactions);
            Promise.all(promises).then(() => {
                if (appState === 'kid_app') {
                    notify("✨ 时光金库产生了新的利息收益！", "success");
                }
            }).catch(console.error);
        }
    }, [appState, kids.length]); // Check on load when kids data is present
    const handleSavePlan = async () => {
        if (!planForm.title && !planForm.targetKid) return notify("请填写完整信息", "error"); // Basic check
        // Reward parsing
        let rewardNum = parseInt(planForm.reward) || 0;
        if (planType === 'study' && planForm.pointRule !== 'custom') {
            rewardNum = 10; // Default system rule fallback for study
        }
        // Color and Frequency
        let color = "from-blue-400 to-blue-500";
        let frequency = "每天";
        let timeStr = "--:--";
        if (planType === 'study') {
            // Study Plan Logistics
            color = getCategoryGradient(planForm.category);
            const freqMap = {
                'today': '仅当天',
                'daily': '每天',
                'weekly_custom': '按周重复',
                'biweekly_custom': '按双周重复',
                'ebbinghaus': '记忆曲线',
                'weekly_1': '本周1次',
                'biweekly_1': '本双周1次',
                'monthly_1': '本月1次',
                'every_week_1': '每周1次',
                'every_biweek_1': '每双周1次',
                'every_month_1': '每月1次'
            };
            if (freqMap[planForm.repeatType]) frequency = freqMap[planForm.repeatType];
            else frequency = planForm.repeatType;
            if (planForm.timeSetting === 'range' && planForm.startTime && planForm.endTime) {
                timeStr = `${planForm.startTime}-${planForm.endTime}`;
            } else if (planForm.timeSetting === 'duration' && planForm.durationPreset) {
                timeStr = `${planForm.durationPreset}分钟`;
            }
        } else {
            // Habit Logistics
            color = planForm.habitColor;
            frequency = planForm.habitType === 'daily_once' ? '每日一次' : (planForm.periodMaxType === 'weekly' ? `每周 ${planForm.periodMaxPerDay} 次` : `每日 ${planForm.periodMaxPerDay} 次`);
            // Set the reward sign based on habitRewardType
            if (planForm.habitRewardType === 'penalty') {
                rewardNum = -Math.abs(rewardNum);
            } else {
                rewardNum = Math.abs(rewardNum);
            }
        }
        // === EDIT MODE: Update existing task ===
        if (editingTask) {
            const updates = {
                title: planForm.title,
                reward: planType === 'habit' ? rewardNum : Math.abs(rewardNum),
                category: planType === 'study' ? planForm.category : "行为",
                catColor: color,
                frequency: frequency, // V1 fallback
                repeatConfig: planType === 'study' ? {
                    type: planForm.repeatType,
                    endDate: planForm.endDate || null,
                    weeklyDays: planForm.weeklyDays,
                    ebbStrength: planForm.ebbStrength,
                    periodDaysType: planForm.periodDaysType,
                    periodCustomDays: planForm.periodCustomDays,
                    periodTargetCount: Number(planForm.periodTargetCount),
                    periodMaxPerDay: Number(planForm.periodMaxPerDay)
                } : null, // V2 explicit config
                timeStr: timeStr,
                standards: planForm.desc || "",
                iconEmoji: planForm.iconEmoji,
                requireApproval: planForm.requireApproval,
                periodMaxPerDay: planType === 'habit' ? Number(planForm.periodMaxPerDay) : undefined,
                periodMaxType: planType === 'habit' ? planForm.periodMaxType : undefined
            };
            try {
                await apiFetch(`/api/tasks/${editingTask.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                });
                setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...updates } : t));
                if (planType === 'study' && planForm.timeSetting === 'range' && planForm.endTime) {
                    setLastSavedEndTime(planForm.endTime);
                }
                setShowAddPlanModal(false);
                setEditingTask(null);
                notify('任务已更新', 'success');
            } catch (e) {
                console.error(e);
                notify('保存失败', 'error');
            }
            return;
        }
        // === CREATE MODE: Create new tasks ===
        let newTasks = [];
        const baseTask = {
            id: Date.now().toString(),
            title: planForm.title, desc: planForm.desc,
            reward: planType === 'habit' ? rewardNum : Math.abs(rewardNum),
            type: planType, status: 'todo', iconEmoji: planForm.iconEmoji, standards: planForm.desc || "",
            category: planType === 'study' ? planForm.category : "行为",
            catColor: color,
            frequency: frequency, timeStr: timeStr,
            startDate: planForm.startDate,
            pointRule: planForm.pointRule,
            habitType: planForm.habitType,
            attachments: planForm.attachments || [],
            requireApproval: planForm.requireApproval,
            periodMaxPerDay: planType === 'habit' ? Number(planForm.periodMaxPerDay) : undefined,
            periodMaxType: planType === 'habit' ? planForm.periodMaxType : undefined,
            dates: planForm.repeatType === 'today' || planForm.repeatType === '仅当天' ? [planForm.startDate] : [],
            repeatConfig: planType === 'study' ? {
                type: planForm.repeatType,
                endDate: planForm.endDate || null,
                weeklyDays: planForm.weeklyDays,
                ebbStrength: planForm.ebbStrength,
                periodDaysType: planForm.periodDaysType,
                periodCustomDays: planForm.periodCustomDays,
                periodTargetCount: Number(planForm.periodTargetCount),
                periodMaxPerDay: Number(planForm.periodMaxPerDay)
            } : null,
            history: {} // History will now store { date: { kidId: { status } } }
        };
        if (!planForm.targetKids) planForm.targetKids = [planForm.targetKid || 'all'];
        if (planForm.targetKids.includes('all') || planForm.targetKids.length === kids.length) {
            // Unify logic: DB has one task, kidId = 'all'
            newTasks = [{ ...baseTask, kidId: 'all' }];
        } else {
            // Assign localized task as per usual for single/multiple selection
            newTasks = planForm.targetKids.map(id => ({ ...baseTask, kidId: id }));
        }
        try {
            await Promise.all(newTasks.map(task =>
                apiFetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task) })
            ));
            setTasks([...tasks, ...newTasks]);
            if (planType === 'study' && planForm.timeSetting === 'range' && planForm.endTime) {
                setLastSavedEndTime(planForm.endTime);
            }
            setShowAddPlanModal(false);
            setPlanForm({
                targetKids: ['all'], category: '技能', title: '', desc: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                repeatType: 'today', timeSetting: 'none',
                weeklyDays: [1, 2, 3, 4, 5], ebbStrength: 'normal',
                periodDaysType: 'any', periodCustomDays: [1, 2, 3, 4, 5],
                periodTargetCount: 1, periodMaxPerDay: 1,
                startTime: '', endTime: '', durationPreset: 25,
                pointRule: 'default', reward: '', iconEmoji: '📚', iconName: getIconForCategory('语文'),
                habitColor: 'from-blue-400 to-blue-500', habitType: 'daily_once',
                attachments: []
            });
            notify(`成功创建了新的${planType === 'study' ? '计划' : '习惯'}！`, "success");
        } catch (e) { notify("网络请求失败", "error"); }
    };
    const handlePinClick = (num) => {
        if (pinInput.length < 4) {
            const newPin = pinInput + num;
            setPinInput(newPin);
            if (newPin.length === 4) {
                if (newPin === parentSettings.pinCode) {
                    setTimeout(() => {
                        changeAppState('parent_app');
                        setPinInput('');
                        setShowParentPinModal(false);
                    }, 200);
                } else {
                    notify("密码错误", "error");
                    setTimeout(() => setPinInput(''), 400);
                }
            }
        }
    };
    const openParentFromKid = () => {
        if (parentSettings.pinEnabled) {
            setPinInput('');
            setShowParentPinModal(true);
        } else {
            changeAppState('parent_app');
        }
    };
    const switchKid = (kidId) => {
        changeActiveKid(kidId);
        setShowKidSwitcher(false);
        setKidTab('study');
    };
    const confirmReceipt = async (orderId) => {
        try {
            await apiFetch(`/ api / orders / ${orderId} `, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'received' }) });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'received' } : o));
            notify("签收成功！快去评价一下吧。", "success");
        } catch (e) { notify("网络请求失败", "error"); }
    };
    const submitReview = async (orderId, stars, text) => {
        try {
            await apiFetch(`/ api / orders / ${orderId} `, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'completed', rating: stars, comment: text }) });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'completed', rating: stars, comment: text } : o));
            setSelectedOrder(null);
            setReviewStars(5);
            setReviewComment("");
            notify("评价完成，感谢反馈！", "success");
        } catch (e) { notify("网络请求失败", "error"); }
    };
    const handleSaveNewItem = async () => {
        if (!newItem.name || !newItem.price) return notify("请填写名称和需要星数", "error");
        if (newItem.id) {
            try {
                const updated = { ...newItem, price: parseInt(newItem.price) };
                await apiFetch(`/api/inventory/${newItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
                setInventory(inventory.map(i => i.id === newItem.id ? updated : i));
                setShowAddItemModal(false);
                setNewItem({ name: '', desc: '', price: '', iconEmoji: '🧸', type: 'single', walletTarget: 'spend', charityTarget: '', maxExchanges: 1, periodMaxType: 'lifetime' });
                notify("商品修改成功！", "success");
            } catch (e) { notify("网络请求失败", "error"); }
        } else {
            const addedItem = { id: Date.now().toString(), ...newItem, price: parseInt(newItem.price) };
            try {
                await apiFetch('/api/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(addedItem) });
                setInventory([...inventory, addedItem]);
                setShowAddItemModal(false);
                setNewItem({ name: '', desc: '', price: '', iconEmoji: '🧸', type: 'single', walletTarget: 'spend', charityTarget: '', maxExchanges: 1, periodMaxType: 'lifetime' });
                notify("商品上架成功！", "success");
            } catch (e) { notify("网络请求失败", "error"); }
        }
    };
    // === 弹窗渲染函数 (彻底修复 ReferenceError) ===
    // --- Mobile Bottom Navigation Portal ---
    const renderMobileNavigationBar = () => {
        if (appState !== 'kid_app' && appState !== 'parent_app') return null;
        const isParent = appState === 'parent_app';
        const mobileTabs = isParent ? [
            { id: 'tasks', label: '学习任务', icon: <Icons.Target size={22} strokeWidth={2.5} /> },
            { id: 'plans', label: '习惯养成', icon: <Icons.CheckSquare size={22} strokeWidth={2.5} /> },
            { id: 'wealth', label: '财富中心', icon: <Icons.Landmark size={22} strokeWidth={2.5} /> },
            { id: 'shop_manage', label: '家庭超市', icon: <Icons.ShoppingBag size={22} strokeWidth={2.5} /> },
            { id: 'settings', label: '我的宝贝', icon: <Icons.User size={22} strokeWidth={2.5} /> }
        ] : [
            { id: 'study', label: '学习任务', icon: <Icons.BookOpen size={22} strokeWidth={2.5} /> },
            { id: 'habit', label: '习惯养成', icon: <Icons.ShieldCheck size={22} strokeWidth={2.5} /> },
            { id: 'wealth', label: '财富中心', icon: <Icons.Wallet size={22} strokeWidth={2.5} /> },
            { id: 'shop', label: '家庭超市', icon: <Icons.ShoppingBag size={22} strokeWidth={2.5} /> },
            { id: 'profile', label: '我的', icon: <Icons.User size={22} strokeWidth={2.5} /> }
        ];
        return createPortal(
            <nav className="fixed bottom-0 left-0 right-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] z-[9999] md:hidden shadow-[0_-10px_20px_rgb(0,0,0,0.03)]" style={{ position: 'fixed', bottom: 0, isolation: 'isolate', transform: 'none' }}>
                {mobileTabs.map(tab => {
                    const isActive = isParent ? parentTab === tab.id : kidTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                if (isParent) {
                                    setParentTab(tab.id);
                                } else {
                                    setKidTab(tab.id);
                                }
                            }}
                            className={`flex flex-col items-center justify-center w-full py-1 gap-1 transition-all ${isActive ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <div className={`relative flex items-center justify-center transition-all ${isActive ? 'bg-indigo-50 w-12 h-8 rounded-full' : 'h-8'}`}>
                                {tab.icon}
                            </div>
                            <span className={`text-[10px] font-black tracking-wider transition-all ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </nav>,
            document.body
        );
    };
    // === 主返回 ===
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-bold text-xl">加载中...</div>;
    }
    const contextValue = { activeKidId, setActiveKidId, kidTab, setKidTab, kidShopTab, setKidShopTab, parentTab, setParentTab, parentKidFilter, setParentKidFilter, currentViewDate, setCurrentViewDate, selectedDate, setSelectedDate, monthViewDate, setMonthViewDate, taskFilter, setTaskFilter, taskStatusFilter, setTaskStatusFilter, taskSort, setTaskSort, parentTaskFilter, setParentTaskFilter, parentTaskStatusFilter, setParentTaskStatusFilter, parentTaskSort, setParentTaskSort, searchPlanKeyword, setSearchPlanKeyword, searchShopKeyword, setSearchShopKeyword, searchKidTaskKeyword, setSearchKidTaskKeyword, searchKidShopKeyword, setSearchKidShopKeyword, searchKidHabitKeyword, setSearchKidHabitKeyword, isReordering, setIsReordering, showFilterDropdown, setShowFilterDropdown, showStatusDropdown, setShowStatusDropdown, showSortDropdown, setShowSortDropdown, showParentSettingsDropdown, setShowParentSettingsDropdown, showSettingsModal, setShowSettingsModal, showSubscriptionModal, setShowSubscriptionModal, showSecurityParamsModal, setShowSecurityParamsModal, taskToSubmit, setTaskToSubmit, taskIdToEdit, setTaskIdToEdit, showTransferModal, setShowTransferModal, transferForm, setTransferForm, previewImageIndex, setPreviewImageIndex, selectedOrder, setSelectedOrder, showAddPlanModal, setShowAddPlanModal, showAddKidModal, setShowAddKidModal, newKidForm, setNewKidForm, showAddItemModal, setShowAddItemModal, showQrScanner, setShowQrScanner, orderHistoryFilterKid, setOrderHistoryFilterKid, orderHistoryFilterTime, setOrderHistoryFilterTime, historyFilter, setHistoryFilter, habitCardFilter, setHabitCardFilter, showLevelRules, setShowLevelRules, editingTask, setEditingTask, deleteConfirmTask, setDeleteConfirmTask, mallSortByPrice, setMallSortByPrice, orderSortByPrice, setOrderSortByPrice, orderFilterStatus, setOrderFilterStatus, kidCheckoutItem, setKidCheckoutItem, showAvatarPickerModal, setShowAvatarPickerModal, showPenaltyModal, setShowPenaltyModal, penaltyTaskContext, setPenaltyTaskContext, penaltySelectedKidIds, setPenaltySelectedKidIds, showReviewModal, setShowReviewModal, reviewOrderId, setReviewOrderId, showShopConfirmModal, setShowShopConfirmModal, shopTargetItem, setShopTargetItem, qrModalValue, setQrModalValue, showLevelModal, setShowLevelModal, pendingAvatar, setPendingAvatar, pointActionTimings, setPointActionTimings, showEmotionalReminderModal, setShowEmotionalReminderModal, emotionalCooldownSeconds, setEmotionalCooldownSeconds, showRewardModal, setShowRewardModal, showRejectModal, setShowRejectModal, rejectingTaskInfo, setRejectingTaskInfo, rejectReason, setRejectReason, showTransactionHistoryModal, setShowTransactionHistoryModal, transactionHistoryFilterTime, setTransactionHistoryFilterTime, transactionHistoryStartDate, setTransactionHistoryStartDate, transactionHistoryEndDate, setTransactionHistoryEndDate, transactionHistoryFilterType, setTransactionHistoryFilterType, showTimerModal, setShowTimerModal, timerTargetId, setTimerTargetId, timerMode, setTimerMode, timerSeconds, setTimerSeconds, timerTotalSeconds, setTimerTotalSeconds, isTimerRunning, setIsTimerRunning, timerPaused, setTimerPaused, pomodoroSession, setPomodoroSession, pomodoroIsBreak, setPomodoroIsBreak, showCalendarModal, setShowCalendarModal, showParentPinModal, setShowParentPinModal, showKidSwitcher, setShowKidSwitcher, showInterestDetailsModal, setShowInterestDetailsModal, quickCompleteTask, setQuickCompleteTask, qcTimeMode, setQcTimeMode, qcHours, setQcHours, qcMinutes, setQcMinutes, qcSeconds, setQcSeconds, qcStartTime, setQcStartTime, qcEndTime, setQcEndTime, qcNote, setQcNote, qcAttachments, setQcAttachments, pinInput, setPinInput, reviewStars, setReviewStars, reviewComment, setReviewComment, newItem, setNewItem, planType, setPlanType, lastSavedEndTime, setLastSavedEndTime, planForm, setPlanForm, parentSettings, setParentSettings, celebrationData, setCelebrationData, showPreviewModal, setShowPreviewModal, previewTask, setPreviewTask, showImagePreviewModal, setShowImagePreviewModal, previewImages, setPreviewImages, currentPreviewIndex, setCurrentPreviewIndex, notifications, notify, setNotifications, appState, changeAppState, token, setToken, user, setUser, authLoading, setAuthLoading, authMode, setAuthMode, authForm, setAuthForm, confirmPassword, setConfirmPassword, activationCode, setActivationCode, handleAuth, handleLogout, kids, setKids, tasks, setTasks, inventory, setInventory, orders, setOrders, transactions, setTransactions, isLoading, setIsLoading, adminTab, setAdminTab, adminUsers, setAdminUsers, adminCodes, setAdminCodes, usedCodes, setUsedCodes, settingsCode, setSettingsCode, activeKid, changeActiveKid, updateActiveKid, updateKidData, handleExpChange, getTaskStatusOnDate, getTaskTimeSpent, handleDeleteTask, handleAttemptSubmit, handleMarkHabitComplete, handleRejectTask, handleApproveTask, handleApproveAllTasks, handleStartTask, handleContinueTask, confirmSubmitTask, confirmTransfer, buyItem, handleRedeem, generateCodes, getIncompleteStudyTasksCount };
    return (
        <AppContext.Provider value={contextValue}>
            <div className="font-sans selection:bg-indigo-100">
            {appState === 'profiles' && <ProfileSelectionPage />}
            {appState === 'parent_pin' && <ParentPinPage />}
            {appState === 'kid_app' && <KidApp />}
            {appState === 'parent_app' && <ParentApp />}
            {/* Mobile Bottom Navigation Rendered via Portal */}
            {renderMobileNavigationBar()}
            <div className="fixed top-24 right-6 z-[200] space-y-3 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className={`px-6 py-4 rounded-2xl shadow-xl animate-bounce-in text-white text-sm font-bold flex items-center justify-between gap-4 pointer-events-auto ${n.type === 'error' ? 'bg-rose-500' : n.type === 'info' ? 'bg-slate-800' : 'bg-emerald-500'}`}>
                        <div className="flex items-center gap-2">
                            <Icons.Bell size={18} /> {n.msg}
                        </div>
                        <button onClick={() => setNotifications(p => p.filter(x => x.id !== n.id))} className="opacity-70 hover:opacity-100 transition-opacity flex-shrink-0">
                            <Icons.X size={16} />
                        </button>
                    </div>
                ))}
            </div>
            <GlobalModals />
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes simpleFade { from { opacity: 0; } to { opacity: 1; } }
        .animate-simple-fade { animation: simpleFade 0.2s ease-out forwards; }
        @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.9); } 60% { opacity: 1; transform: scale(1.05); } 100% { transform: scale(1); } }
        .animate-bounce-in { animation: bounceIn 0.3s forwards; }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        .animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes bounceCustom { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-20px);} 60% {transform: translateY(-10px);} }
        .animate-bounce-custom { animation: bounceCustom 1s ease infinite; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
            </div>
        </AppContext.Provider>
    );
}