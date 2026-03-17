import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

export const useAppData = (token, setToken, user, setUser, setAuthLoading) => {
    const [kids, setKids] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [orders, setOrders] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [adminTab, setAdminTab] = useState('users');
    const [adminUsers, setAdminUsers] = useState([]);
    const [adminCodes, setAdminCodes] = useState([]);
    const [usedCodes, setUsedCodes] = useState([]);
    const [settingsCode, setSettingsCode] = useState('');

    useEffect(() => {
        if (user?.role === 'admin') {
            apiFetch('/api/admin/users').then(r => r.json()).then(setAdminUsers).catch(console.error);
            apiFetch('/api/admin/codes').then(r => r.json()).then(setAdminCodes).catch(console.error);
        }
    }, [user]);

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            if (!token) {
                setAuthLoading(false);
                setIsLoading(false);
                return;
            }
            try {
                const userRes = await apiFetch('/api/me');
                if (!userRes.ok) throw new Error('Auth failed');
                const userData = await userRes.json();
                setUser(userData);

                const now = new Date();
                const subEnd = new Date(userData.sub_end_date);
                if (subEnd < now && userData.role !== 'admin') {
                    setAuthLoading(false);
                    setIsLoading(false);
                    return;
                }

                const safeJson = async (r) => {
                    if (!r.ok) return [];
                    return r.json();
                };

                const [kidsData, tasksData, invData, ordersData, transData] = await Promise.all([
                    apiFetch('/api/kids').then(safeJson),
                    apiFetch('/api/tasks').then(safeJson),
                    apiFetch('/api/inventory').then(safeJson),
                    apiFetch('/api/orders').then(safeJson),
                    apiFetch('/api/transactions').then(safeJson)
                ]);

                if (Array.isArray(kidsData)) setKids(kidsData);
                if (Array.isArray(tasksData)) setTasks(tasksData);
                if (Array.isArray(invData)) setInventory(invData);
                if (Array.isArray(ordersData)) setOrders(ordersData);
                if (Array.isArray(transData)) setTransactions(transData);

                apiFetch('/api/me/codes').then(safeJson).then(setUsedCodes).catch(console.error);
            } catch (err) {
                console.error(err);
                localStorage.removeItem('minilife_token');
                setToken(null);
            }
            setAuthLoading(false);
            setIsLoading(false);
        };

        checkAuthAndFetch();

        let eventSource = null;
        let reconnectTimeout = null;

        const connectSSE = () => {
            if (eventSource) eventSource.close();
            if (!token) return;

            console.log('Live Sync: Establishing connection...');
            eventSource = new EventSource(`/api/sync?token=${token}`);

            eventSource.onopen = () => {
                console.log('Live Sync Connected');
                if (reconnectTimeout) clearTimeout(reconnectTimeout);
            };

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.action === 'sync') {
                        console.log('Live Sync: Server update detected, fetching new data...');
                        checkAuthAndFetch();
                    }
                } catch (err) {
                    console.error('SSE Payload Error:', err);
                }
            };

            eventSource.onerror = (err) => {
                console.error('Live Sync connection lost, reconnecting...', err);
                eventSource.close();
                reconnectTimeout = setTimeout(connectSSE, 3000);
            };
        };

        if (token) connectSSE();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('App resumed, silently fetching fresh data and reconnecting sync...');
                checkAuthAndFetch();
                connectSSE();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleVisibilityChange);

        const fallbackPoll = setInterval(() => {
            if (document.visibilityState === 'visible' && token) {
                checkAuthAndFetch();
            }
        }, 15000);

        return () => {
            if (eventSource) eventSource.close();
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            clearInterval(fallbackPoll);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleVisibilityChange);
        };
    }, [token, setToken, setUser, setAuthLoading]);

    return {
        kids, setKids,
        tasks, setTasks,
        inventory, setInventory,
        orders, setOrders,
        transactions, setTransactions,
        isLoading, setIsLoading,
        adminTab, setAdminTab,
        adminUsers, setAdminUsers,
        adminCodes, setAdminCodes,
        usedCodes, setUsedCodes,
        settingsCode, setSettingsCode
    };
};
