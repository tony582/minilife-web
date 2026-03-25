import { create } from 'zustand';

export const useTimerStore = create((set, get) => ({
    showTimerModal: false,
    setShowTimerModal: (v) => set({ showTimerModal: v }),
    timerTargetId: null,
    setTimerTargetId: (v) => set({ timerTargetId: v }),
    timerMode: 'select', // 'select' | 'forward' | 'countdown' | 'pomodoro'
    setTimerMode: (v) => set({ timerMode: v }),
    timerSeconds: 0,
    setTimerSeconds: (v) => set({ timerSeconds: typeof v === 'function' ? v(get().timerSeconds) : v }),
    timerTotalSeconds: 0,
    setTimerTotalSeconds: (v) => set({ timerTotalSeconds: v }),
    isTimerRunning: false,
    setIsTimerRunning: (v) => set({ isTimerRunning: v }),
    timerPaused: false,
    setTimerPaused: (v) => set({ timerPaused: v }),
    pomodoroSession: 1,
    setPomodoroSession: (v) => set({ pomodoroSession: typeof v === 'function' ? v(get().pomodoroSession) : v }),
    pomodoroIsBreak: false,
    setPomodoroIsBreak: (v) => set({ pomodoroIsBreak: v }),

    // Reset timer to initial state
    resetTimer: () => set({
        timerMode: 'select',
        timerSeconds: 0,
        timerTotalSeconds: 0,
        isTimerRunning: false,
        timerPaused: false,
        pomodoroSession: 1,
        pomodoroIsBreak: false,
    }),
}));
