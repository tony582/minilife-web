import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

export const useAppData = (token, setToken, user, setUser, setAuthLoading, notify) => {
    const [kids, setKids] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [orders, setOrders] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeKidId, setActiveKidId] = useState(localStorage.getItem('minilife_activeKidId') || null);

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
        let eventSource = null;
        let reconnectTimeout = null;

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
                    if (!r.ok) {
                        try { const text = await r.text(); console.error("API Error", r.status, text); } catch (e) { }
                        return [];
                    }
                    return r.json();
                };

                const [kidsData, tasksData, invData, ordersData, transData, classesData] = await Promise.all([
                    apiFetch('/api/kids').then(safeJson),
                    apiFetch('/api/tasks').then(safeJson),
                    apiFetch('/api/inventory').then(safeJson),
                    apiFetch('/api/orders').then(safeJson),
                    apiFetch('/api/transactions').then(safeJson),
                    apiFetch('/api/classes').then(safeJson)
                ]);

                if (Array.isArray(kidsData)) setKids(kidsData);
                if (Array.isArray(tasksData)) setTasks(tasksData);
                if (Array.isArray(invData)) setInventory(invData);
                if (Array.isArray(ordersData)) setOrders(ordersData);
                if (Array.isArray(transData)) setTransactions(transData);
                if (Array.isArray(classesData)) setClasses(classesData);

                apiFetch('/api/me/codes').then(safeJson).then(setUsedCodes).catch(console.error);
            } catch (err) {
                localStorage.removeItem('minilife_token');
                setToken(null);
            }
            setAuthLoading(false);
            setIsLoading(false);
        };

        checkAuthAndFetch();

        const connectSSE = () => {
            if (eventSource) eventSource.close();
            if (!token) return;

            eventSource = new EventSource(`/api/sync?token=${token}`);
            eventSource.onopen = () => { if (reconnectTimeout) clearTimeout(reconnectTimeout); };
            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.action === 'sync') checkAuthAndFetch();
                } catch (err) {}
            };
            eventSource.onerror = () => {
                eventSource.close();
                reconnectTimeout = setTimeout(connectSSE, 3000);
            };
        };

        if (token) connectSSE();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
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
    }, [token, setAuthLoading, setToken, setUser]);

    // === Kid Management Functions ===
    const changeActiveKid = (newKidId) => {
        setActiveKidId(newKidId);
        if (newKidId) localStorage.setItem('minilife_activeKidId', newKidId);
        else localStorage.removeItem('minilife_activeKidId');
    };

    const updateActiveKid = async (updates) => {
        try {
            await apiFetch(`/api/kids/${activeKidId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates)
            });
            setKids(prev => prev.map(k => k.id === activeKidId ? { ...k, ...updates } : k));
        } catch (e) {
            console.error(e);
            if (notify) notify('网络请求失败', 'error');
        }
    };

    const updateKidData = async (targetKidId, updates) => {
        try {
            await apiFetch(`/api/kids/${targetKidId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates)
            });
            setKids(prev => prev.map(k => k.id === targetKidId ? { ...k, ...updates } : k));
        } catch (e) {
            console.error(e);
            if (notify) notify('网络请求失败', 'error');
        }
    };

    return {
        kids, setKids,
        tasks, setTasks,
        inventory, setInventory,
        orders, setOrders,
        transactions, setTransactions,
        classes, setClasses,
        isLoading, setIsLoading,
        activeKidId, setActiveKidId,
        changeActiveKid,
        updateActiveKid,
        updateKidData,
        adminTab, setAdminTab,
        adminUsers, setAdminUsers,
        adminCodes, setAdminCodes,
        usedCodes, setUsedCodes,
        settingsCode, setSettingsCode
    };
};
