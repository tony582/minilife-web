import { create } from 'zustand';

export const useModalStore = create((set) => ({
    // Parent settings
    showParentSettingsDropdown: false,
    setShowParentSettingsDropdown: (v) => set({ showParentSettingsDropdown: v }),
    showSettingsModal: false,
    setShowSettingsModal: (v) => set({ showSettingsModal: v }),
    showSubscriptionModal: false,
    setShowSubscriptionModal: (v) => set({ showSubscriptionModal: v }),
    showSecurityParamsModal: false,
    setShowSecurityParamsModal: (v) => set({ showSecurityParamsModal: v }),

    // Level & celebration
    showLevelModal: false,
    setShowLevelModal: (v) => set({ showLevelModal: v }),
    celebrationData: null,
    setCelebrationData: (v) => set({ celebrationData: v }),
    showLevelRules: false,
    setShowLevelRules: (v) => set({ showLevelRules: v }),

    // Penalty
    showPenaltyModal: false,
    setShowPenaltyModal: (v) => set({ showPenaltyModal: v }),
    penaltyTaskContext: null,
    setPenaltyTaskContext: (v) => set({ penaltyTaskContext: v }),
    penaltySelectedKidIds: [],
    setPenaltySelectedKidIds: (v) => set({ penaltySelectedKidIds: v }),

    // Review
    showReviewModal: false,
    setShowReviewModal: (v) => set({ showReviewModal: v }),
    reviewOrderId: null,
    setReviewOrderId: (v) => set({ reviewOrderId: v }),

    // Shop confirm
    showShopConfirmModal: false,
    setShowShopConfirmModal: (v) => set({ showShopConfirmModal: v }),
    shopTargetItem: null,
    setShopTargetItem: (v) => set({ shopTargetItem: v }),

    // QR
    qrModalValue: null,
    setQrModalValue: (v) => set({ qrModalValue: v }),
    showQrScanner: false,
    setShowQrScanner: (v) => set({ showQrScanner: v }),

    // Task modals
    taskToSubmit: null,
    setTaskToSubmit: (v) => set({ taskToSubmit: v }),
    taskIdToEdit: null,
    setTaskIdToEdit: (v) => set({ taskIdToEdit: v }),
    editingTask: null,
    setEditingTask: (v) => set({ editingTask: v }),
    deleteConfirmTask: null,
    setDeleteConfirmTask: (v) => set({ deleteConfirmTask: v }),

    // Transfer
    showTransferModal: false,
    setShowTransferModal: (v) => set({ showTransferModal: v }),

    // Image preview
    showImagePreviewModal: false,
    setShowImagePreviewModal: (v) => set({ showImagePreviewModal: v }),
    previewImages: [],
    setPreviewImages: (v) => set({ previewImages: v }),
    currentPreviewIndex: 0,
    setCurrentPreviewIndex: (v) => set({ currentPreviewIndex: v }),
    previewImageIndex: 0,
    setPreviewImageIndex: (v) => set({ previewImageIndex: v }),

    // Order
    selectedOrder: null,
    setSelectedOrder: (v) => set({ selectedOrder: v }),

    // Add plan / AI
    showAddPlanModal: false,
    setShowAddPlanModal: (v) => set({ showAddPlanModal: v }),
    showAiTaskCreator: false,
    setShowAiTaskCreator: (v) => set({ showAiTaskCreator: v }),

    // Add kid
    showAddKidModal: false,
    setShowAddKidModal: (v) => set({ showAddKidModal: v }),

    // Add item
    showAddItemModal: false,
    setShowAddItemModal: (v) => set({ showAddItemModal: v }),

    // Avatar picker
    showAvatarPickerModal: false,
    setShowAvatarPickerModal: (v) => set({ showAvatarPickerModal: v }),
    pendingAvatar: '',
    setPendingAvatar: (v) => set({ pendingAvatar: v }),

    // Emotional reminder
    showEmotionalReminderModal: false,
    setShowEmotionalReminderModal: (v) => set({ showEmotionalReminderModal: v }),
    emotionalCooldownSeconds: 0,
    setEmotionalCooldownSeconds: (v) => set({ emotionalCooldownSeconds: v }),
    pointActionTimings: [],
    setPointActionTimings: (v) => set({ pointActionTimings: v }),

    // Reward
    showRewardModal: false,
    setShowRewardModal: (v) => set({ showRewardModal: v }),

    // Reject
    showRejectModal: false,
    setShowRejectModal: (v) => set({ showRejectModal: v }),
    rejectingTaskInfo: null,
    setRejectingTaskInfo: (v) => set({ rejectingTaskInfo: v }),
    rejectReason: '',
    setRejectReason: (v) => set({ rejectReason: v }),

    // Transaction history
    showTransactionHistoryModal: false,
    setShowTransactionHistoryModal: (v) => set({ showTransactionHistoryModal: v }),
    transactionHistoryKidId: null,
    setTransactionHistoryKidId: (v) => set({ transactionHistoryKidId: v }),
    transactionHistoryFilterTime: 'all',
    setTransactionHistoryFilterTime: (v) => set({ transactionHistoryFilterTime: v }),
    transactionHistoryStartDate: '',
    setTransactionHistoryStartDate: (v) => set({ transactionHistoryStartDate: v }),
    transactionHistoryEndDate: '',
    setTransactionHistoryEndDate: (v) => set({ transactionHistoryEndDate: v }),
    transactionHistoryFilterType: 'all',
    setTransactionHistoryFilterType: (v) => set({ transactionHistoryFilterType: v }),

    // Calendar / Pin / Kid switcher / Interest
    showCalendarModal: false,
    setShowCalendarModal: (v) => set({ showCalendarModal: v }),
    showParentPinModal: false,
    setShowParentPinModal: (v) => set({ showParentPinModal: v }),
    showKidSwitcher: false,
    setShowKidSwitcher: (v) => set({ showKidSwitcher: v }),
    showInterestDetailsModal: false,
    setShowInterestDetailsModal: (v) => set({ showInterestDetailsModal: v }),

    // Preview task
    showPreviewModal: false,
    setShowPreviewModal: (v) => set({ showPreviewModal: v }),
    previewTask: null,
    setPreviewTask: (v) => set({ previewTask: v }),

    // Kid checkout
    kidCheckoutItem: null,
    setKidCheckoutItem: (v) => set({ kidCheckoutItem: v }),
}));
