import React, { createContext, useContext, useState, useRef } from 'react';

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
    // App-level navigation state (shared across all components)
    const [appState, setAppState] = useState(localStorage.getItem('minilife_appState') || 'profiles');
    const changeAppState = (newState) => {
        setAppState(newState);
        localStorage.setItem('minilife_appState', newState);
    };

    // 任务列表控制 (Parent)
    // Parent header settings dropdown
    const [showParentSettingsDropdown, setShowParentSettingsDropdown] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [showSecurityParamsModal, setShowSecurityParamsModal] = useState(false);

    // Other missing UI filtering states
    const [kidTab, setKidTab] = useState('study'); // 'study', 'habit', 'shop', 'wealth', 'profile'
    const [kidShopTab, setKidShopTab] = useState('mall');
    const [parentTab, setParentTab] = useState('tasks');
    const [parentKidFilter, setParentKidFilter] = useState('all');
    const [currentViewDate, setCurrentViewDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [monthViewDate, setMonthViewDate] = useState(new Date());
    const [parentSettings, setParentSettings] = useState({ pinEnabled: false, pinCode: '1234' });

    const [historyFilter, setHistoryFilter] = useState('all'); // 'all', 'income', 'expense'
    const [showLevelModal, setShowLevelModal] = useState(false);
    const [celebrationData, setCelebrationData] = useState(null);
    const [showPenaltyModal, setShowPenaltyModal] = useState(false);
    const [penaltyTaskContext, setPenaltyTaskContext] = useState(null);
    const [penaltySelectedKidIds, setPenaltySelectedKidIds] = useState([]);

    // Missing Modal States found
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewOrderId, setReviewOrderId] = useState(null);
    const [showShopConfirmModal, setShowShopConfirmModal] = useState(false);
    const [shopTargetItem, setShopTargetItem] = useState(null);
    const [qrModalValue, setQrModalValue] = useState(null);

    // 弹窗状态
    const [taskToSubmit, setTaskToSubmit] = useState(null);
    const [taskIdToEdit, setTaskIdToEdit] = useState(null);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferForm, setTransferForm] = useState({ amount: '', target: 'vault' });
    const [previewImageIndex, setPreviewImageIndex] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showAddPlanModal, setShowAddPlanModal] = useState(false);
    const [showAddKidModal, setShowAddKidModal] = useState(false);
    const [newKidForm, setNewKidForm] = useState({ name: '', gender: 'boy', avatar: '' });
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [showQrScanner, setShowQrScanner] = useState(false);
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
    
    // Timer states
    const [showTimerModal, setShowTimerModal] = useState(false);
    const [timerTargetId, setTimerTargetId] = useState(null);
    const [timerMode, setTimerMode] = useState('select'); // 'select' | 'forward' | 'countdown' | 'pomodoro'
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerTotalSeconds, setTimerTotalSeconds] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerPaused, setTimerPaused] = useState(false);
    const [pomodoroSession, setPomodoroSession] = useState(1);
    const [pomodoroIsBreak, setPomodoroIsBreak] = useState(false);

    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [showParentPinModal, setShowParentPinModal] = useState(false);
    const [showKidSwitcher, setShowKidSwitcher] = useState(false);
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

    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewTask, setPreviewTask] = useState(null);
    const [showImagePreviewModal, setShowImagePreviewModal] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);
    const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

    const uiState = {
        appState, changeAppState,
        kidTab, setKidTab, kidShopTab, setKidShopTab, parentTab, setParentTab, parentKidFilter, setParentKidFilter,
        currentViewDate, setCurrentViewDate, selectedDate, setSelectedDate, monthViewDate, setMonthViewDate,
        parentSettings, setParentSettings,
        showParentSettingsDropdown, setShowParentSettingsDropdown, showSettingsModal, setShowSettingsModal,
        showSubscriptionModal, setShowSubscriptionModal, showSecurityParamsModal, setShowSecurityParamsModal,
        historyFilter, setHistoryFilter, showLevelModal, setShowLevelModal,
        celebrationData, setCelebrationData, showPenaltyModal, setShowPenaltyModal, penaltyTaskContext, setPenaltyTaskContext,
        penaltySelectedKidIds, setPenaltySelectedKidIds, showReviewModal, setShowReviewModal, reviewOrderId, setReviewOrderId,
        showShopConfirmModal, setShowShopConfirmModal, shopTargetItem, setShopTargetItem, qrModalValue, setQrModalValue,
        taskToSubmit, setTaskToSubmit, taskIdToEdit, setTaskIdToEdit, showTransferModal, setShowTransferModal, transferForm, setTransferForm,
        previewImageIndex, setPreviewImageIndex, selectedOrder, setSelectedOrder, showAddPlanModal, setShowAddPlanModal,
        showAddKidModal, setShowAddKidModal, newKidForm, setNewKidForm, showAddItemModal, setShowAddItemModal, showQrScanner, setShowQrScanner,
        showLevelRules, setShowLevelRules,
        editingTask, setEditingTask, deleteConfirmTask, setDeleteConfirmTask, mallSortByPrice, setMallSortByPrice,
        orderSortByPrice, setOrderSortByPrice, orderFilterStatus, setOrderFilterStatus, kidCheckoutItem, setKidCheckoutItem,
        showAvatarPickerModal, setShowAvatarPickerModal, pendingAvatar, setPendingAvatar, pointActionTimings, setPointActionTimings,
        showEmotionalReminderModal, setShowEmotionalReminderModal, emotionalCooldownSeconds, setEmotionalCooldownSeconds,
        showRewardModal, setShowRewardModal, showRejectModal, setShowRejectModal, rejectingTaskInfo, setRejectingTaskInfo,
        rejectReason, setRejectReason, showTransactionHistoryModal, setShowTransactionHistoryModal, transactionHistoryFilterTime, setTransactionHistoryFilterTime,
        transactionHistoryStartDate, setTransactionHistoryStartDate, transactionHistoryEndDate, setTransactionHistoryEndDate,
        transactionHistoryFilterType, setTransactionHistoryFilterType, showTimerModal, setShowTimerModal, timerTargetId, setTimerTargetId,
        timerMode, setTimerMode, timerSeconds, setTimerSeconds, timerTotalSeconds, setTimerTotalSeconds, isTimerRunning, setIsTimerRunning,
        timerPaused, setTimerPaused, pomodoroSession, setPomodoroSession, pomodoroIsBreak, setPomodoroIsBreak,
        showCalendarModal, setShowCalendarModal, showParentPinModal, setShowParentPinModal, showKidSwitcher, setShowKidSwitcher,
        showInterestDetailsModal, setShowInterestDetailsModal, quickCompleteTask, setQuickCompleteTask, qcTimeMode, setQcTimeMode,
        qcHours, setQcHours, qcMinutes, setQcMinutes, qcSeconds, setQcSeconds, qcStartTime, setQcStartTime, qcEndTime, setQcEndTime,
        qcNote, setQcNote, qcAttachments, setQcAttachments, pinInput, setPinInput, reviewStars, setReviewStars, reviewComment, setReviewComment,
        newItem, setNewItem, planType, setPlanType, lastSavedEndTime, setLastSavedEndTime, planForm, setPlanForm,
        showPreviewModal, setShowPreviewModal, previewTask, setPreviewTask, showImagePreviewModal, setShowImagePreviewModal,
        previewImages, setPreviewImages, currentPreviewIndex, setCurrentPreviewIndex
    };

    return <UIContext.Provider value={uiState}>{children}</UIContext.Provider>;
};

export const useUIContext = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUIContext must be used within a UIProvider');
    return context;
};
