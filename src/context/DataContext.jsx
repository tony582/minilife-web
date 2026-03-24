import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { useAuthContext } from './AuthContext';
import { useToast } from '../hooks/useToast';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    const { token, setToken, user, setUser, setAuthLoading } = useAuthContext();
    const toastState = useToast();
    const dataState = useAppData(token, setToken, user, setUser, setAuthLoading, toastState.notify);

    return <DataContext.Provider value={{ ...dataState, ...toastState }}>{children}</DataContext.Provider>;
};

export const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useDataContext must be used within a DataProvider');
    return context;
};
