import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { useAuthContext } from './AuthContext';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    const { token, setToken, user, setUser, setAuthLoading } = useAuthContext();
    const dataState = useAppData(token, setToken, user, setUser, setAuthLoading);

    return <DataContext.Provider value={dataState}>{children}</DataContext.Provider>;
};

export const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useDataContext must be used within a DataProvider');
    return context;
};
