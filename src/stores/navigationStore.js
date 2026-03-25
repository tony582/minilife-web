import { create } from 'zustand';

const today = () => new Date().toISOString().split('T')[0];

export const useNavigationStore = create((set) => ({
    // Tab navigation
    kidTab: 'study', // 'study' | 'habit' | 'shop' | 'wealth' | 'profile'
    setKidTab: (v) => set({ kidTab: v }),
    kidShopTab: 'mall',
    setKidShopTab: (v) => set({ kidShopTab: v }),
    parentTab: 'tasks',
    setParentTab: (v) => set({ parentTab: v }),

    // Filters
    parentKidFilter: 'all',
    setParentKidFilter: (v) => set({ parentKidFilter: v }),
    historyFilter: 'all',
    setHistoryFilter: (v) => set({ historyFilter: v }),
    mallSortByPrice: 'none',
    setMallSortByPrice: (v) => set({ mallSortByPrice: v }),
    orderSortByPrice: 'none',
    setOrderSortByPrice: (v) => set({ orderSortByPrice: v }),
    orderFilterStatus: 'all',
    setOrderFilterStatus: (v) => set({ orderFilterStatus: v }),

    // Date navigation
    currentViewDate: today(),
    setCurrentViewDate: (v) => set({ currentViewDate: v }),
    selectedDate: today(),
    setSelectedDate: (v) => set({ selectedDate: v }),
    monthViewDate: new Date(),
    setMonthViewDate: (v) => set({ monthViewDate: v }),

    // Parent settings
    parentSettings: { pinEnabled: false, pinCode: '1234' },
    setParentSettings: (v) => set({ parentSettings: v }),
}));
