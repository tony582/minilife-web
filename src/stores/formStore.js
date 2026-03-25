import { create } from 'zustand';

const today = () => new Date().toISOString().split('T')[0];

const defaultPlanForm = {
    targetKids: ['all'], category: '技能', title: '', desc: '',
    startDate: today(),
    endDate: '',
    repeatType: 'today',
    weeklyDays: [1, 2, 3, 4, 5],
    ebbStrength: 'normal',
    periodDaysType: 'any',
    periodCustomDays: [1, 2, 3, 4, 5],
    periodTargetCount: 1,
    periodMaxPerDay: 1,
    periodMaxType: 'daily',
    timeSetting: 'range',
    startTime: '', endTime: '', durationPreset: 25,
    pointRule: 'default',
    reward: '', iconEmoji: '📚',
    habitColor: 'from-blue-400 to-blue-500',
    habitType: 'daily_once',
    attachments: [],
    requireApproval: true,
};

export const useFormStore = create((set) => ({
    // Transfer form
    transferForm: { amount: '', target: 'vault' },
    setTransferForm: (v) => set({ transferForm: v }),

    // New kid form
    newKidForm: { name: '', gender: 'boy', avatar: '' },
    setNewKidForm: (v) => set({ newKidForm: v }),

    // New item form
    newItem: { name: '', desc: '', price: '', iconEmoji: '🧸', type: 'single', walletTarget: 'spend', charityTarget: '', maxExchanges: 1, periodMaxType: 'lifetime' },
    setNewItem: (v) => set({ newItem: v }),

    // Plan form
    planType: 'study',
    setPlanType: (v) => set({ planType: v }),
    planFormErrors: {},
    setPlanFormErrors: (v) => set({ planFormErrors: v }),
    lastSavedEndTime: '',
    setLastSavedEndTime: (v) => set({ lastSavedEndTime: v }),
    planForm: { ...defaultPlanForm },
    setPlanForm: (v) => set({ planForm: v }),

    // Review form
    reviewStars: 5,
    setReviewStars: (v) => set({ reviewStars: v }),
    reviewComment: '',
    setReviewComment: (v) => set({ reviewComment: v }),

    // PIN input
    pinInput: '',
    setPinInput: (v) => set({ pinInput: v }),

    // Quick complete form
    quickCompleteTask: null,
    setQuickCompleteTask: (v) => set({ quickCompleteTask: v }),
    qcTimeMode: 'duration',
    setQcTimeMode: (v) => set({ qcTimeMode: v }),
    qcHours: 0,
    setQcHours: (v) => set({ qcHours: v }),
    qcMinutes: 0,
    setQcMinutes: (v) => set({ qcMinutes: v }),
    qcSeconds: 0,
    setQcSeconds: (v) => set({ qcSeconds: v }),
    qcStartTime: '',
    setQcStartTime: (v) => set({ qcStartTime: v }),
    qcEndTime: '',
    setQcEndTime: (v) => set({ qcEndTime: v }),
    qcNote: '',
    setQcNote: (v) => set({ qcNote: v }),
    qcAttachments: [],
    setQcAttachments: (v) => set({ qcAttachments: v }),

    // Reset plan form to defaults
    resetPlanForm: () => set({ planForm: { ...defaultPlanForm }, planFormErrors: {} }),
}));
