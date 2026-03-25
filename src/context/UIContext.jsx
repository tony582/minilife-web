import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useModalStore } from '../stores/modalStore';
import { useTimerStore } from '../stores/timerStore';
import { useFormStore } from '../stores/formStore';
import { useNavigationStore } from '../stores/navigationStore';

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
    // App-level navigation — derived from URL path via react-router-dom
    const navigate = useNavigate();
    const location = useLocation();

    const appState = useMemo(() => {
        const path = location.pathname;
        if (path.startsWith('/kid')) return 'kid_app';
        if (path.startsWith('/parent/pin')) return 'parent_pin';
        if (path.startsWith('/parent')) return 'parent_app';
        if (path.startsWith('/admin')) return 'admin';
        if (path.startsWith('/login')) return 'login';
        if (path.startsWith('/expired')) return 'expired';
        return 'profiles';
    }, [location.pathname]);

    const changeAppState = useCallback((newState) => {
        const routeMap = {
            'profiles': '/',
            'parent_pin': '/parent/pin',
            'parent_app': '/parent',
            'kid_app': '/kid',
            'admin': '/admin',
            'login': '/login',
            'expired': '/expired',
        };
        navigate(routeMap[newState] || '/');
    }, [navigate]);

    // Read all Zustand stores (adapter layer for backward compatibility)
    const modalState = useModalStore();
    const timerState = useTimerStore();
    const formState = useFormStore();
    const navState = useNavigationStore();

    // Merge all states into one object (same API as before)
    const uiState = useMemo(() => ({
        appState, changeAppState,
        ...navState,
        ...modalState,
        ...timerState,
        ...formState,
    }), [appState, changeAppState, navState, modalState, timerState, formState]);

    return <UIContext.Provider value={uiState}>{children}</UIContext.Provider>;
};

export const useUIContext = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUIContext must be used within a UIProvider');
    return context;
};
