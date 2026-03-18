import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useAppState } from '../hooks/useAppState';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Rely on global toast/app state if needed, or pass them in
    // Since AppState and Toast are used by Auth and Data, we could lift them up
    // But for separation, let's keep them here, or accept them as props.
    const { notifications, notify, setNotifications } = useToast();
    const { appState, changeAppState } = useAppState();

    const authState = useAuth(notify, changeAppState);

    const value = {
        ...authState,
        notifications,
        notify,
        setNotifications,
        appState,
        changeAppState
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
    return context;
};
