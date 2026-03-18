import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const { notifications, notify, setNotifications } = useToast();
    const authState = useAuth(notify, null);

    const value = {
        ...authState,
        notifications,
        notify,
        setNotifications
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
    return context;
};
