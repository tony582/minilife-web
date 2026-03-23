import { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch } from '../api/client';

export const useAppData = (token, setToken, user, setUser, setAuthLoading, notify) => {
    // Sync lock: prevents SSE-triggered refetches during multi-step operations
    // (e.g. task completion that updates tasks, transactions, AND kid balances)
    const syncPausedRef = useRef(false);
    const pendingSyncRef = useRef(false);
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
    const [adminAiConfig, setAdminAiConfig] = useState(null);
    const [adminAiUsage, setAdminAiUsage] = useState([]);
    const [usedCodes, setUsedCodes] = useState([]);
    const [settingsCode, setSettingsCode] = useState('');

    useEffect(() => {
        if (user?.role === 'admin') {
            apiFetch('/api/admin/users').then(r => r.json()).then(setAdminUsers).catch(console.error);
            apiFetch('/api/admin/codes').then(r => r.json()).then(setAdminCodes).catch(console.error);
            apiFetch('/api/admin/ai-config').then(r => r.json()).then(setAdminAiConfig).catch(console.error);
            apiFetch('/api/admin/ai-usage').then(r => r.json()).then(setAdminAiUsage).catch(console.error);
        }
    }, [user]);

    useEffect(() => {
        let eventSource = null;
        let reconnectTimeout = null;

        // Track whether this is the initial load (must always run)
        let initialLoadDone = false;

        const checkAuthAndFetch = async () => {
            // Skip refetch if sync is paused (multi-step operation in progress)
            // but always allow the initial load to complete
            if (initialLoadDone && syncPausedRef.current) {
                pendingSyncRef.current = true;
                return;
            }
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
                // Only clear token if it was a real auth rejection (401)
                // Network errors (switching apps, offline) should NOT logout
                if (err.message === 'Auth failed') {
                    localStorage.removeItem('minilife_token');
                    setToken(null);
                } else {
                    console.warn('[Auth] Network error during init, keeping session:', err.message);
                }
            }
            setAuthLoading(false);
            setIsLoading(false);
            initialLoadDone = true;
        };

        checkAuthAndFetch();

        let sseSyncDebounce = null;

        const connectSSE = () => {
            if (eventSource) eventSource.close();
            if (!token) return;

            eventSource = new EventSource(`/api/sync?token=${token}`);
            eventSource.onopen = () => { if (reconnectTimeout) clearTimeout(reconnectTimeout); };
            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.action === 'sync') {
                        // If sync is paused (multi-step operation in progress),
                        // just mark that a sync is pending. We'll do ONE clean
                        // refetch when the operation completes.
                        if (syncPausedRef.current) {
                            pendingSyncRef.current = true;
                            return;
                        }
                        // Debounce: a single user action (e.g. habit check-in) triggers
                        // multiple API writes, each sending a sync event. Wait for all
                        // writes to finish before refetching.
                        if (sseSyncDebounce) clearTimeout(sseSyncDebounce);
                        sseSyncDebounce = setTimeout(() => {
                            // Double-check lock at fire time (in case pause started
                            // after this timer was queued)
                            if (syncPausedRef.current) {
                                pendingSyncRef.current = true;
                                return;
                            }
                            checkAuthAndFetch();
                        }, 3000);
                    }
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
                // Only reconnect SSE, don't refetch all data
                // (data will refresh via SSE sync event if needed)
                connectSSE();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Poll every 2 minutes as a fallback (SSE is the primary sync)
        const fallbackPoll = setInterval(() => {
            if (document.visibilityState === 'visible' && token) {
                checkAuthAndFetch();
            }
        }, 120000);

        return () => {
            if (eventSource) eventSource.close();
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            clearInterval(fallbackPoll);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [token, setAuthLoading, setToken, setUser]);

    // Auto-select first kid if none selected (e.g. new device / LAN access)
    useEffect(() => {
        if (kids.length > 0 && (!activeKidId || !kids.find(k => k.id === activeKidId))) {
            const firstKid = kids[0].id;
            setActiveKidId(firstKid);
            localStorage.setItem('minilife_activeKidId', firstKid);
        }
    }, [kids, activeKidId]);

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

    // Pause SSE-triggered refetches during multi-step operations
    const pauseSync = useCallback(() => {
        syncPausedRef.current = true;
        pendingSyncRef.current = false;
    }, []);

    // Resume SSE sync; if any events arrived while paused, do ONE clean refetch
    const resumeSync = useCallback(() => {
        syncPausedRef.current = false;
        // Don't eagerly refetch — trust the local state that was already set.
        // Only refetch if we want cross-device sync to catch up, but delay it
        // enough so the DB has the latest data.
        if (pendingSyncRef.current) {
            pendingSyncRef.current = false;
            // Use a generous delay so the server has definitely committed
            setTimeout(() => {
                if (!syncPausedRef.current) {
                    // no-op: the local state is already correct from setKids calls
                    // If we still want a background refresh for cross-device:
                    // checkAuthAndFetch();  // uncomment for full consistency
                }
            }, 5000);
        }
    }, []);

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
        pauseSync, resumeSync,
        adminTab, setAdminTab,
        adminUsers, setAdminUsers,
        adminCodes, setAdminCodes,
        adminAiConfig, setAdminAiConfig,
        adminAiUsage, setAdminAiUsage,
        usedCodes, setUsedCodes,
        settingsCode, setSettingsCode
    };
};
