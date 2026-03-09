import React, { useState, useEffect, useRef } from 'react';

// === 1. 纯净内联 SVG 图标库 ===
const IconWrapper = ({ size = 24, className = "", children }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{children}</svg>
);

const Icons = {
    Home: (p) => <IconWrapper {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></IconWrapper>,
    AlertCircle: (p) => <IconWrapper {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></IconWrapper>,
    Wallet: (p) => <IconWrapper {...p}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></IconWrapper>,
    PiggyBank: (p) => <IconWrapper {...p}><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z" /><path d="M2 9v1c0 1.1.9 2 2 2h1" /><path d="M16 11h.01" /></IconWrapper>,
    Heart: (p) => <IconWrapper {...p}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></IconWrapper>,
    Star: ({ size = 24, className = "", fill = "none" }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    ShieldCheck: (p) => <IconWrapper {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.5 0 4.5 1 6 2a1 1 0 0 1 1 1v7z" /><path d="m9 12 2 2 4-4" /></IconWrapper>,
    BookOpen: (p) => <IconWrapper {...p}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></IconWrapper>,
    ArrowRight: (p) => <IconWrapper {...p}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></IconWrapper>,
    CheckCircle: (p) => <IconWrapper {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></IconWrapper>,
    CheckSquare: (p) => <IconWrapper {...p}><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></IconWrapper>,
    Clock: (p) => <IconWrapper {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></IconWrapper>,
    TrendingUp: (p) => <IconWrapper {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></IconWrapper>,
    TrendingDown: (p) => <IconWrapper {...p}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></IconWrapper>,
    Lock: (p) => <IconWrapper {...p}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></IconWrapper>,
    Award: (p) => <IconWrapper {...p}><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></IconWrapper>,
    Bell: (p) => <IconWrapper {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></IconWrapper>,
    Info: (p) => <IconWrapper {...p}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></IconWrapper>,
    X: (p) => <IconWrapper {...p}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></IconWrapper>,
    ShoppingBag: (p) => <IconWrapper {...p}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><line x1="3" x2="21" y1="6" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></IconWrapper>,
    Package: (p) => <IconWrapper {...p}><path d="M16.5 9.4 7.5 4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" x2="12" y1="22.08" y2="12" /></IconWrapper>,
    ChevronLeft: (p) => <IconWrapper {...p}><path d="m15 18-6-6 6-6" /></IconWrapper>,
    ChevronRight: (p) => <IconWrapper {...p}><path d="m9 18 6-6-6-6" /></IconWrapper>,
    ChevronDown: (p) => <IconWrapper {...p}><path d="m6 9 6 6 6-6" /></IconWrapper>,
    Plus: (p) => <IconWrapper {...p}><path d="M5 12h14" /><path d="M12 5v14" /></IconWrapper>,
    Trash2: (p) => <IconWrapper {...p}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></IconWrapper>,
    Settings: (p) => <IconWrapper {...p}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></IconWrapper>,
    Users: (p) => <IconWrapper {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></IconWrapper>,
    LogOut: (p) => <IconWrapper {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></IconWrapper>,
    Play: (p) => <IconWrapper {...p}><polygon points="5 3 19 12 5 21 5 3" /></IconWrapper>,
    Check: (p) => <IconWrapper {...p}><polyline points="20 6 9 17 4 12" /></IconWrapper>,
    Calendar: (p) => <IconWrapper {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></IconWrapper>,
    Eye: (p) => <IconWrapper {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></IconWrapper>,
    Filter: (p) => <IconWrapper {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></IconWrapper>,
    SortAsc: (p) => <IconWrapper {...p}><path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4" /></IconWrapper>,
    LayoutGrid: (p) => <IconWrapper {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></IconWrapper>,
    Wrench: (p) => <IconWrapper {...p}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></IconWrapper>,
    RefreshCw: (p) => <IconWrapper {...p}><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></IconWrapper>,
    Upload: (p) => <IconWrapper {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></IconWrapper>,
    Save: (p) => <IconWrapper {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></IconWrapper>,
    Image: (p) => <IconWrapper {...p}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></IconWrapper>,
    FileText: (p) => <IconWrapper {...p}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></IconWrapper>,
    // Star duplicate removed
    StarFilled: (p) => <IconWrapper {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></IconWrapper>,
    Tag: (p) => <IconWrapper {...p}><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><path d="M7 7h.01" /></IconWrapper>,
    Paperclip: (p) => <IconWrapper {...p}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></IconWrapper>,
    List: (p) => <IconWrapper {...p}><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></IconWrapper>,
    Pause: (p) => <IconWrapper {...p}><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></IconWrapper>,
    Edit3: (p) => <IconWrapper {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></IconWrapper>
};

// 图标渲染辅助方法
const renderIcon = (name, size = 20, className = "") => {
    const IconCmp = Icons[name] || Icons.Star;
    return <IconCmp size={size} className={className} />;
};

// === 日期处理工具 ===
const formatDate = (date) => {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
};

const getDisplayDateArray = (baseDate) => {
    const d = new Date(baseDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 调整以周一为一周的第一天
    const monday = new Date(d.setDate(diff));

    const weekDays = [];
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const dotsArray = ['text-orange-500', 'transparent', 'transparent', 'text-blue-400', 'text-green-500', 'text-green-500', 'text-green-500']; // 仅为了保留原先的点样式，实际可以根据有无任务计算

    for (let i = 0; i < 7; i++) {
        const current = new Date(monday);
        current.setDate(monday.getDate() + i);
        weekDays.push({
            d: dayNames[i],
            dateObj: current,
            dateStr: formatDate(current),
            displayDate: `${current.getMonth() + 1}/${current.getDate()}`,
            dot: dotsArray[i]
        });
    }
    return weekDays;
};

const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return [d.getUTCFullYear(), weekNo];
};

const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // 调整为周一为每周第一天

    // 填充前面的空白天数
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        days.push({ day: prevMonthDays - i, isCurrentMonth: false, dateStr: formatDate(new Date(year, month - 1, prevMonthDays - i)) });
    }

    // 填充当月天数
    const numDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= numDays; i++) {
        days.push({ day: i, isCurrentMonth: true, dateStr: formatDate(new Date(year, month, i)) });
    }

    // 填充后面的空白天数补齐为42天（6周）
    let nextMonthDay = 1;
    while (days.length < 42) {
        days.push({ day: nextMonthDay++, isCurrentMonth: false, dateStr: formatDate(new Date(year, month + 1, nextMonthDay - 1)) });
    }
    return days;
};


const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem('minilife_token');
    if (token) {
        options.headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
    }
    const res = await fetch(`${API_BASE}${url}`, options);
    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('minilife_token');
        window.location.reload();
    }
    return res;
};

export default function App() {
    // === 全局状态 ===

    const [token, setToken] = useState(localStorage.getItem('minilife_token'));
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
    const [authForm, setAuthForm] = useState({ email: '', password: '' });
    const [activationCode, setActivationCode] = useState('');

    const [appState, setAppState] = useState('profiles'); // 'profiles' | 'parent_pin' | 'kid_app' | 'parent_app'
    const [notifications, setNotifications] = useState([]);
    const handleAuth = async (e) => {
        e.preventDefault();
        try {
            const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authForm)
            });

            let data;
            try {
                data = await res.json();
            } catch (jsonErr) {
                return notify(`服务器错误 (${res.status}): ${res.statusText}`, 'error');
            }

            if (!res.ok) return notify(data.error || "登录失败", 'error');

            localStorage.setItem('minilife_token', data.token);
            setToken(data.token);
            setUser(data.user);
            notify(authMode === 'login' ? '欢迎回来' : '注册成功！赠送3天免费体验', 'success');
        } catch (err) {
            notify("网络连接失败，请检查服务是否运行", "error");
        }
    };

    const handleRedeem = async (e) => {
        e.preventDefault();
        try {
            const res = await apiFetch('/api/redeem-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: activationCode })
            });
            const data = await res.json();
            if (!res.ok) return notify(data.error || "兑换失败", 'error');
            notify("兑换成功！感谢您的支持", 'success');
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            notify("网络错误", "error");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('minilife_token');
        setToken(null);
        setUser(null);
        // setAppMode('auth'); removed, state automatically handles no token
    };

    const generateCodes = async (days) => {
        const res = await apiFetch('/api/admin/codes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ duration_days: days, count: 5 })
        });
        const data = await res.json();
        if (res.ok) {
            notify(`成功生成 ${data.codes.length} 个兑换码`, 'success');
            apiFetch('/api/admin/codes').then(r => r.json()).then(setAdminCodes).catch(console.error);
        } else {
            notify(data.error, 'error');
        }
    };


    const [kids, setKids] = useState([]);
    const [activeKidId, setActiveKidId] = useState('kid_1');
    const [parentSettings, setParentSettings] = useState({ pinEnabled: true, pinCode: '1234' });

    // 任务数据
    const [tasks, setTasks] = useState([]);

    const [inventory, setInventory] = useState([]);
    const [orders, setOrders] = useState([]);
    const [transactions, setTransactions] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    // Admin State
    const [adminTab, setAdminTab] = useState('users'); // 'users' | 'codes'
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

                // Check trial/subscription
                const now = new Date();
                const subEnd = new Date(userData.sub_end_date);
                if (subEnd < now && userData.role !== 'admin') {
                    // Expired
                    setAuthLoading(false);
                    setIsLoading(false);
                    return;
                }

                // Load app data
                const safeJson = async (r) => {
                    if (!r.ok) {
                        try { const text = await r.text(); console.error("API Error", r.status, text); } catch (e) { }
                        return [];
                    }
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
    }, [token]);

    // Dummy out the old fetchData so it doesn't run or crash
    useEffect(() => {
        const fetchDataHidden = async () => {
            try {
                const [kidsRes, tasksRes, invRes, ordersRes, transRes] = await Promise.all([
                    apiFetch('/api/kids').then(r => r.json()),
                    apiFetch('/api/tasks').then(r => r.json()),
                    apiFetch('/api/inventory').then(r => r.json()),
                    apiFetch('/api/orders').then(r => r.json()),
                    apiFetch('/api/transactions').then(r => r.json())
                ]);
                setKids(kidsRes);
                setTasks(tasksRes);
                setInventory(invRes);
                setOrders(ordersRes);
                setTransactions(transRes);
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setIsLoading(false);
            }
        };
        // fetchDataHidden();
    }, []);



    // UI 控制状态
    const [kidTab, setKidTab] = useState('study');
    const [kidShopTab, setKidShopTab] = useState('browse');
    const [parentTab, setParentTab] = useState('tasks');
    const [parentKidFilter, setParentKidFilter] = useState('all');

    // 日期控制状态
    const [currentViewDate, setCurrentViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
    const [monthViewDate, setMonthViewDate] = useState(new Date());

    // 任务列表控制
    const [taskFilter, setTaskFilter] = useState([]); // Array for multi-select
    const [taskStatusFilter, setTaskStatusFilter] = useState('all'); // 'all' | 'completed' | 'incomplete'
    const [taskSort, setTaskSort] = useState('default');
    const [taskLayout, setTaskLayout] = useState('list');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    // 弹窗状态
    const [taskToSubmit, setTaskToSubmit] = useState(null);
    const [taskIdToEdit, setTaskIdToEdit] = useState(null);

    // Dynamic Categories helper
    const defaultCategories = ['技能', '运动', '语文', '数学', '英语', '艺术', '科学', '生活', '其他'];
    const allCategories = Array.from(new Set([...defaultCategories, ...tasks.filter(t => t.type === 'study' && t.category).map(t => t.category)]));

    const getCategoryColor = (cat) => {
        const colors = {
            '技能': 'bg-blue-50 text-blue-600 border-blue-200', '运动': 'bg-orange-50 text-orange-600 border-orange-200',
            '语文': 'bg-emerald-50 text-emerald-600 border-emerald-200', '数学': 'bg-indigo-50 text-indigo-600 border-indigo-200',
            '英语': 'bg-purple-50 text-purple-600 border-purple-200', '艺术': 'bg-pink-50 text-pink-600 border-pink-200',
            '科学': 'bg-cyan-50 text-cyan-600 border-cyan-200', '生活': 'bg-amber-50 text-amber-600 border-amber-200',
            '其他': 'bg-slate-50 text-slate-600 border-slate-200'
        };
        if (colors[cat]) return colors[cat];
        let hash = 0;
        for (let i = 0; i < (cat || '').length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
        const dynamicColors = ['bg-rose-50 text-rose-600 border-rose-200', 'bg-lime-50 text-lime-600 border-lime-200', 'bg-teal-50 text-teal-600 border-teal-200', 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200', 'bg-sky-50 text-sky-600 border-sky-200'];
        return dynamicColors[Math.abs(hash) % dynamicColors.length];
    };

    const getCategoryGradient = (cat) => {
        const gradients = {
            '技能': 'from-blue-400 to-blue-500', '运动': 'from-orange-400 to-orange-500', '语文': 'from-emerald-400 to-emerald-500',
            '数学': 'from-indigo-400 to-indigo-500', '英语': 'from-purple-400 to-purple-500', '艺术': 'from-pink-400 to-pink-500',
            '科学': 'from-cyan-400 to-cyan-500', '生活': 'from-amber-400 to-amber-500', '其他': 'from-slate-400 to-slate-500'
        };
        if (gradients[cat]) return gradients[cat];
        let hash = 0; for (let i = 0; i < (cat || '').length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
        const dynamicGradients = ['from-rose-400 to-rose-500', 'from-lime-400 to-lime-500', 'from-teal-400 to-teal-500', 'from-fuchsia-400 to-fuchsia-500', 'from-sky-400 to-sky-500'];
        return dynamicGradients[Math.abs(hash) % dynamicGradients.length];
    };

    // Derived states
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferForm, setTransferForm] = useState({ amount: '', target: 'vault' });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showAddPlanModal, setShowAddPlanModal] = useState(false);
    const [showAddKidModal, setShowAddKidModal] = useState(false);
    const [newKidForm, setNewKidForm] = useState({ name: '', gender: 'boy', avatar: '' });
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [showLevelRules, setShowLevelRules] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [deleteConfirmTask, setDeleteConfirmTask] = useState(null);

    const [showTimerModal, setShowTimerModal] = useState(false);
    const [timerTargetId, setTimerTargetId] = useState(null);
    const [timerMode, setTimerMode] = useState('select'); // 'select' | 'forward' | 'countdown' | 'pomodoro'
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerTotalSeconds, setTimerTotalSeconds] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerPaused, setTimerPaused] = useState(false);
    const [pomodoroSession, setPomodoroSession] = useState(1);
    const [pomodoroIsBreak, setPomodoroIsBreak] = useState(false);
    const timerRef = useRef(null);

    // 全局计时器引擎
    useEffect(() => {
        if (!showTimerModal || !isTimerRunning || timerPaused) return;

        const intervalId = setInterval(() => {
            setTimerSeconds(prev => {
                if (timerMode === 'countdown') {
                    if (prev <= 1) {
                        setIsTimerRunning(false);
                        playSuccessSound();
                        notify("倒计时结束，任务完成！", "success");
                        return 0;
                    }
                    return prev - 1;
                } else if (timerMode === 'forward') {
                    return prev + 1;
                }
                return prev;
            });
        }, 1000);


        return () => clearInterval(intervalId);
    }, [showTimerModal, isTimerRunning, timerPaused, timerMode]);

    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [showParentPinModal, setShowParentPinModal] = useState(false);
    const [showKidSwitcher, setShowKidSwitcher] = useState(false);

    // 快速完成弹窗状态
    const [quickCompleteTask, setQuickCompleteTask] = useState(null);
    const [qcTimeMode, setQcTimeMode] = useState('duration'); // 'duration' | 'actual'
    const [qcHours, setQcHours] = useState(0);
    const [qcMinutes, setQcMinutes] = useState(0);
    const [qcSeconds, setQcSeconds] = useState(0);
    const [qcStartTime, setQcStartTime] = useState('');
    const [qcEndTime, setQcEndTime] = useState('');
    const [qcNote, setQcNote] = useState('');
    const [qcAttachments, setQcAttachments] = useState([]);

    // 表单状态
    const [pinInput, setPinInput] = useState('');
    const [reviewStars, setReviewStars] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [newItem, setNewItem] = useState({ name: '', desc: '', price: '', iconEmoji: '🧸', type: 'single' });
    const [planType, setPlanType] = useState('study');
    const [planForm, setPlanForm] = useState({
        targetKid: 'all', category: '技能', title: '', desc: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        repeatType: 'today', // 'today' | 'daily' | 'weekly_custom' | 'biweekly_custom' | 'ebbinghaus' | 'weekly_1' | 'biweekly_1' | 'monthly_1' | 'every_week_1' | 'every_biweek_1' | 'every_month_1'
        weeklyDays: [1, 2, 3, 4, 5], // 1=Mon, 7=Sun
        ebbStrength: 'normal',
        periodDaysType: 'any', // 'any' | 'workdays' | 'weekends' | 'custom'
        periodCustomDays: [1, 2, 3, 4, 5],
        periodTargetCount: 1,
        periodMaxPerDay: 1,
        timeSetting: 'none', // 'none' | 'range' | 'duration'
        startTime: '', endTime: '', durationPreset: 25,
        pointRule: 'default', // 'default' | 'custom'
        reward: '', iconEmoji: '📚',
        habitColor: 'from-blue-400 to-blue-500',
        habitType: 'daily_once', // 'daily_once' | 'multiple'
        attachments: []
    });

    // 核心日期匹配逻辑
    // 核心日期匹配逻辑
    const isTaskDueOnDate = (task, dateStr) => {
        if (!task) return false;

        // 行为习惯暂时不过滤日期，除非未来专门改造
        if (task.type === 'habit') return true;

        const currentDt = new Date(dateStr);
        let jsDay = currentDt.getDay(); // 0 is Sunday, 1 is Monday...
        const d = jsDay === 0 ? 7 : jsDay; // Convert to 1=Mon ... 7=Sun

        // ================= V2: Advanced repeatConfig Algorithm =================
        if (task.repeatConfig) {
            const rc = task.repeatConfig;

            // 1. Boundary Checks
            if (task.startDate && dateStr < task.startDate) return false;
            if (rc.endDate && dateStr > rc.endDate) return false;

            // 2. Type-specific Resolution
            if (rc.type === 'today') {
                return task.dates?.includes(dateStr);
            }

            if (rc.type === 'daily') {
                return true;
            }

            if (rc.type === 'weekly_custom') {
                return rc.weeklyDays?.includes(d);
            }

            if (rc.type === 'biweekly_custom') {
                if (!rc.weeklyDays?.includes(d)) return false;
                const msPerDay = 24 * 60 * 60 * 1000;
                const startDt = new Date(task.startDate);
                // Calculate weeks elapsed since start date
                // Align startDt to the same day-of-week it started on, then find weeks diff
                const diffDays = Math.floor((currentDt - startDt) / msPerDay);
                const elapsedWeeks = Math.floor((diffDays + (startDt.getDay() === 0 ? 6 : startDt.getDay() - 1)) / 7);
                return elapsedWeeks % 2 === 0; // Only match even weeks matching start week
            }

            if (rc.type === 'ebbinghaus') {
                const msPerDay = 24 * 60 * 60 * 1000;
                const startDt = new Date(task.startDate);
                const diffDays = Math.floor((currentDt - startDt) / msPerDay);

                let sequence = [];
                if (rc.ebbStrength === 'normal') sequence = [0, 1, 2, 4, 7, 15, 30];
                else if (rc.ebbStrength === 'gentle') sequence = [0, 2, 6, 13, 29];
                else if (rc.ebbStrength === 'exam') sequence = [0, 1, 2, 4, 6, 9, 13];
                else if (rc.ebbStrength === 'enhanced') sequence = [0, 1, 2, 3, 4, 6, 9, 14, 29];

                return sequence.includes(diffDays);
            }

            // --- N-times per Period (N次等区间任务) ---
            // N次任务的核心在于：只要在被允许的日子（periodDaysType），并且当前周期的完成量没达标，就应该显示。
            // 目前 UI 上为了不造成混乱，把 "N次任务" 直接视作为每天在 "allowedDays" 内都显示
            // 我们将在组件内部计算这周是否已完成上限。此处 isTaskDueOnDate 仅返回“这一天是否合法候选日”。
            if (rc.type.includes('_1') || rc.type.includes('_n')) {
                // Determine if today is an allowed day for the period
                if (rc.periodDaysType === 'any') return true;
                if (rc.periodDaysType === 'workdays') return d >= 1 && d <= 5;
                if (rc.periodDaysType === 'weekends') return d === 6 || d === 7;
                if (rc.periodDaysType === 'custom') return rc.periodCustomDays?.includes(d);
                return true;
            }

            return false;
        }

        // ================= V1: Legacy Fallback =================
        if (task.frequency === '每天') return true;
        if (task.frequency === '仅当天') return task.dates?.includes(dateStr);
        if (task.frequency === '每周一至周五') return d >= 1 && d <= 5;
        if (task.frequency === '每周六、周日') return d === 6 || d === 7;

        if (task.startDate && dateStr >= task.startDate) {
            const msPerDay = 24 * 60 * 60 * 1000;
            const startDt = new Date(task.startDate);
            const diffDays = Math.floor((currentDt - startDt) / msPerDay);

            if (task.frequency === '每周一次') return diffDays % 7 === 0;
            if (task.frequency === '每双周') return diffDays % 14 === 0;
            if (task.frequency === '艾宾浩斯记忆法') return [0, 1, 2, 4, 7, 15, 30].includes(diffDays);
        }

        return task.dates?.includes(dateStr) || false;
    };

    // 预览弹窗状态 (Kid App)
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewTask, setPreviewTask] = useState(null);

    // === 额外约束检查: N次任务防刷限制 ===
    const checkPeriodLimits = (task, kidId, selectedDStr) => {
        if (!task) return { canSubmit: true };

        // Ensure habits are always checked for daily limits
        if (task.type === 'habit') {
            const hist = task.history || {};
            const entry = task.kidId === 'all' ? hist[selectedDStr]?.[kidId] : hist[selectedDStr];
            const todayCount = entry?.count || (entry?.status === 'completed' ? 1 : 0);

            if (task.habitType === 'daily_once' && todayCount >= 1) {
                return { canSubmit: false, reason: '今天已经完整打过卡啦！' };
            }
            if (task.habitType === 'multiple' && task.periodMaxPerDay && todayCount >= task.periodMaxPerDay) {
                return { canSubmit: false, reason: `今天已达上限(${task.periodMaxPerDay}次)啦！` };
            }
        }

        if (!task.repeatConfig) return { canSubmit: true };
        const rc = task.repeatConfig;
        if (!rc.type.includes('_1') && !rc.type.includes('_n')) return { canSubmit: true };

        const currentDt = new Date(selectedDStr);
        let periodStartDt, periodEndDt;

        if (rc.type.includes('week')) {
            const day = currentDt.getDay() || 7;
            periodStartDt = new Date(currentDt);
            periodStartDt.setDate(currentDt.getDate() - day + 1);
            periodStartDt.setHours(0, 0, 0, 0);

            periodEndDt = new Date(periodStartDt);
            periodEndDt.setDate(periodStartDt.getDate() + 6);
            periodEndDt.setHours(23, 59, 59, 999);
        } else if (rc.type.includes('month')) {
            periodStartDt = new Date(currentDt.getFullYear(), currentDt.getMonth(), 1);
            periodEndDt = new Date(currentDt.getFullYear(), currentDt.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        if (!periodStartDt) {
            return { canSubmit: true };
        }

        let periodCompletions = 0;
        let todayCompletions = 0;

        const hist = task.history || {};
        Object.keys(hist).forEach(dStr => {
            const histDt = new Date(dStr);
            if (histDt >= periodStartDt && histDt <= periodEndDt) {
                const entry = task.kidId === 'all' ? hist[dStr]?.[kidId] : hist[dStr];
                if (entry && (entry.status === 'completed' || entry.status === 'pending_approval' || entry.status === 'in_progress')) {
                    const count = entry.count || 1;
                    periodCompletions += count;
                    if (dStr === selectedDStr) todayCompletions += count;
                }
            }
        });

        if (periodCompletions >= rc.periodTargetCount) {
            return { canSubmit: false, reason: `本周期已达成目标(${rc.periodTargetCount}次)啦！` };
        }
        if (todayCompletions >= rc.periodMaxPerDay) {
            return { canSubmit: false, reason: `今天已达上限(${rc.periodMaxPerDay}次)啦，改天再做吧～` };
        }

        return { canSubmit: true };
    };

    const handleAttemptSubmit = async (task) => {
        const limits = checkPeriodLimits(task, activeKidId, selectedDate);
        if (!limits.canSubmit) return notify(limits.reason, 'error');

        if (task.type === 'habit') {
            try {
                const hist = task.history || {};
                const entry = task.kidId === 'all' ? hist[selectedDate]?.[activeKidId] : hist[selectedDate];
                const newCount = (entry?.count || 0) + 1;

                const histUpdate = { status: 'completed', count: newCount, timeSpent: 0 };
                let newHistory = { ...hist };

                if (task.kidId === 'all') {
                    newHistory[selectedDate] = { ...(newHistory[selectedDate] || {}), [activeKidId]: histUpdate };
                } else {
                    newHistory[selectedDate] = histUpdate;
                }

                await apiFetch(`/api/tasks/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: newHistory }) });
                setTasks(tasks.map(t => t.id === task.id ? { ...t, history: newHistory } : t));

                // Instantly create transaction if kidId matches
                const newTrans = {
                    id: `trans_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    kidId: activeKidId,
                    type: task.reward > 0 ? 'income' : 'expense',
                    amount: Math.abs(task.reward || 0),
                    title: `记录成长: ${task.title}`,
                    date: new Date().toISOString(),
                    category: 'habit'
                };

                if (task.reward !== 0) {
                    await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTrans) });
                    setTransactions(prev => [newTrans, ...prev]);
                }

                // Actually update kid EXP locally and backend
                const targetKid = kids.find(k => k.id === activeKidId);
                if (targetKid) {
                    const newExp = Math.max(0, targetKid.exp + (task.reward || 0));
                    await updateActiveKid({ exp: newExp });
                }

                playSuccessSound();
                if (task.reward > 0) notify(`打卡成功！获得 ${task.reward} 经验值！`, "success");
                else if (task.reward < 0) notify(`打卡成功！扣除 ${Math.abs(task.reward)} 经验值。`, "error");
                else notify("打卡成功！", "success");

            } catch (e) {
                notify("网络请求失败", "error");
            }
        } else {
            setTaskToSubmit(task);
        }
    };

    // === 全局方法 ===
    const getTaskStatusOnDate = (t, date, kidId) => {
        if (!t?.history) return 'todo';
        if (t.kidId === 'all') {
            return t.history[date]?.[kidId]?.status || 'todo';
        }
        return t.history[date]?.status || 'todo';
    };

    const getTaskTimeSpent = (t, date, kidId) => {
        if (!t?.history) return null;
        if (t.kidId === 'all') return t.history[date]?.[kidId]?.timeSpent;
        return t.history[date]?.timeSpent;
    };

    const notify = (msg, type = 'info') => {
        const id = Date.now();
        setNotifications(p => [...p, { id, msg, type }]);
        setTimeout(() => setNotifications(p => p.filter(n => n.id !== id)), 3000);
    };

    const playSuccessSound = () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); // C6
            gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
        } catch (e) { }
    };

    const updateActiveKid = async (updates) => {
        try {
            await apiFetch(`/api/kids/${activeKidId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates)
            });
            setKids(kids.map(k => k.id === activeKidId ? { ...k, ...updates } : k));
        } catch (e) { console.error(e); notify("网络请求失败", "error"); }
    };

    const getLevelReq = (level) => level * 100;

    const handleStartTask = (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const limits = checkPeriodLimits(task, activeKidId, selectedDate);
        if (!limits.canSubmit) return notify(limits.reason, 'error');

        setTimerTargetId(id);

        let secs = 900;
        if (task && task.timeStr && task.timeStr.includes('分钟')) {
            const m = parseInt(task.timeStr);
            if (!isNaN(m)) secs = m * 60;
        }

        setTimerTotalSeconds(secs);
        setTimerMode('select');
        setIsTimerRunning(false);
        setTimerPaused(false);
        setShowTimerModal(true);
    };

    const handleDeleteTask = async (id) => {
        try {
            await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
            setTasks(tasks.filter(t => t.id !== id));
            setDeleteConfirmTask(null);
            notify('任务已删除', 'success');
        } catch (e) {
            console.error(e);
            notify('删除失败', 'error');
        }
    };


    const confirmSubmitTask = async () => {
        if (!taskToSubmit) return;

        // Construct payload specifically based on whether history is 1D or 2D (unified)
        const histUpdate = { status: 'pending_approval' };
        let newHistory = { ...(taskToSubmit.history || {}) };

        if (taskToSubmit.kidId === 'all') {
            newHistory[selectedDate] = { ...(newHistory[selectedDate] || {}), [activeKidId]: histUpdate };
        } else {
            newHistory[selectedDate] = histUpdate;
        }

        try {
            await apiFetch(`/api/tasks/${taskToSubmit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: newHistory })
            });

            setTasks(tasks.map(t => t.id === taskToSubmit.id ? { ...t, history: newHistory } : t));
            setTaskToSubmit(null);
            playSuccessSound();
            notify("已快速完成并提交！等待家长审核。", "success");
        } catch (e) { notify("网络请求失败", "error"); }
    };

    const openQuickComplete = (task) => {
        const limits = checkPeriodLimits(task, activeKidId, selectedDate);
        if (!limits.canSubmit) return notify(limits.reason, 'error');

        setQuickCompleteTask(task);
        setQcTimeMode('duration');
        setQcHours(0);
        setQcMinutes(0);
        setQcSeconds(0);
        setQcStartTime('');
        const now = new Date();
        setQcEndTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
        setQcNote('');
        setQcAttachments([]);
    };

    const handleQcQuickDuration = (totalMinutes) => {
        setQcHours(Math.floor(totalMinutes / 60));
        setQcMinutes(totalMinutes % 60);
        setQcSeconds(0);
    };

    const handleQcFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (qcAttachments.length + files.length > 5) {
            notify('最多上传5个附件', 'error');
            return;
        }
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setQcAttachments(prev => [...prev, { name: file.name, type: file.type, data: ev.target.result, size: file.size }]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    // 快速完成功能 
    const handleQuickComplete = async () => {
        if (qcTimeMode === 'actual' && (!qcStartTime || !qcEndTime)) {
            return notify('请填写完整的起止时间', 'error');
        }

        let spentStr = '';
        if (qcTimeMode === 'duration') {
            if (qcHours === 0 && qcMinutes === 0 && qcSeconds === 0) return notify('请填写耗时', 'error');
            spentStr = `${qcHours > 0 ? qcHours + '小时' : ''}${qcMinutes > 0 ? qcMinutes + '分钟' : ''}${qcSeconds > 0 ? qcSeconds + '秒' : ''}`;
        } else {
            spentStr = `${qcStartTime} ~ ${qcEndTime}`;
        }

        const taskToSubmit = quickCompleteTask;
        if (!taskToSubmit) return;

        // Construct payload specifically based on whether history is 1D or 2D (unified)
        const histUpdate = { status: 'pending_approval', timeSpent: spentStr, note: qcNote, attachments: qcAttachments };
        let newHistory = { ...(taskToSubmit.history || {}) };

        if (taskToSubmit.kidId === 'all') {
            newHistory[selectedDate] = { ...(newHistory[selectedDate] || {}), [activeKidId]: histUpdate };
        } else {
            newHistory[selectedDate] = histUpdate;
        }

        try {
            await apiFetch(`/api/tasks/${taskToSubmit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: newHistory })
            });

            setTasks(tasks.map(t => t.id === taskToSubmit.id ? { ...t, history: newHistory } : t));

            setQuickCompleteTask(null);
            notify('已提交审核，等待家长发放家庭币哦！', 'success');
        } catch (e) {
            notify('提交失败', 'error');
        }
    };

    const handleExpChange = async (kidId, expChange) => {
        const kid = kids.find(k => k.id === kidId);
        if (!kid) return;
        let newExp = kid.exp + expChange;
        let newLevel = kid.level;
        while (newExp >= getLevelReq(newLevel)) {
            newExp -= getLevelReq(newLevel);
            newLevel++;
            notify(`太棒了！${kid.name} 升到了 Lv.${newLevel}！`, "success");
        }
        while (newExp < 0 && newLevel > 1) {
            newLevel--;
            newExp += getLevelReq(newLevel);
            notify(`注意！${kid.name} 降到了 Lv.${newLevel}。`, "error");
        }
        if (newExp < 0 && newLevel === 1) newExp = 0;

        try {
            await apiFetch(`/api/kids/${kidId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ level: newLevel, exp: newExp }) });
            setKids(prevKids => prevKids.map(k => k.id === kidId ? { ...k, exp: newExp, level: newLevel } : k));
        } catch (e) { notify("网络请求失败", "error"); }
    };

    const handleMarkHabitComplete = async (task, date) => {
        try {
            await apiFetch(`/api/tasks/${task.id}/history`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date, status: 'completed' }) });
            setTasks(tasks.map(t => t.id === task.id ? { ...t, history: { ...(t.history || {}), [date]: { ...(t.history?.[date] || {}), status: 'completed' } } } : t));

            const targetKid = kids.find(k => k.id === task.kidId);
            if (!targetKid) return;

            if (task.type === 'habit') {
                await handleExpChange(task.kidId, task.reward);
                if (task.reward > 0) notify(`已奖励 ${targetKid.name} ${task.reward} 经验！`, "success");
                else notify(`已扣除 ${targetKid.name} ${Math.abs(task.reward)} 经验。`, "error");
            }
        } catch (e) { notify("网络请求失败", "error"); }
    };

    const handleApproveTask = async (task, date, actualKidId) => {
        try {
            // Write to Transaction Table First
            const newTrans = {
                id: `trans_${Date.now()}`,
                kidId: actualKidId, // Note: must use actualKidId in case of unified 'all' tasks
                type: 'income',
                amount: task.reward || 0,
                title: `完成: ${task.title}`,
                date: new Date().toISOString(),
                category: 'task'
            };
            if (task.reward > 0) {
                await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTrans) });
                setTransactions([newTrans, ...transactions]);
            }

            // Then Update Task History
            const histUpdate = { status: 'completed' };
            let newHistory = { ...(task.history || {}) };

            if (task.kidId === 'all') {
                newHistory[date] = { ...(newHistory[date] || {}), [actualKidId]: { ...(newHistory[date]?.[actualKidId] || {}), ...histUpdate } };
            } else {
                newHistory[date] = { ...(newHistory[date] || {}), ...histUpdate };
            }

            await apiFetch(`/api/tasks/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: newHistory }) });
            setTasks(tasks.map(t => t.id === task.id ? { ...t, history: newHistory } : t));

            // Increase Balances
            const kid = kids.find(k => k.id === actualKidId);
            if (kid) {
                const newBals = { ...kid.balances, spend: kid.balances.spend + (task.reward || 0) };
                await updateActiveKid({ balances: newBals });
                notify(`已审批！奖励 ${task.reward} 家庭币发放到钱包。`, "success");
            }
        } catch (e) { notify("网络请求失败", "error"); }
    };

    const confirmTransfer = async () => {
        const amount = parseInt(transferForm.amount);
        const activeKid = kids.find(k => k.id === activeKidId);
        if (!amount || amount <= 0 || amount > activeKid.balances.spend) {
            return notify("请输入有效的划转金额！", "error");
        }

        try {
            const newSpend = activeKid.balances.spend - amount;
            let newVault = { ...activeKid.vault };
            let newBalances = { ...activeKid.balances, spend: newSpend };

            if (transferForm.target === 'vault') {
                newVault.lockedAmount += amount;
                // Dynamically update projected return based on level (5% base + 1% per level)
                const apy = 5 + activeKid.level;
                newVault.projectedReturn = Math.floor(newVault.lockedAmount * (apy / 100));
            } else if (transferForm.target === 'give') {
                newBalances.give += amount;
            }

            // Sync with backend
            await apiFetch(`/api/kids/${activeKidId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ balances: newBalances, vault: newVault })
            });

            setKids(kids.map(k => k.id === activeKidId ? { ...k, balances: newBalances, vault: newVault } : k));
            setShowTransferModal(false);
            setTransferForm({ amount: '', target: 'vault' });
            notify(`成功划转 ${amount} 家庭币！`, "success");
        } catch (e) { notify("网络请求失败", "error"); }
    };

    const buyItem = async (item) => {
        const activeKid = kids.find(k => k.id === activeKidId);
        if (activeKid.balances.spend < item.price) return notify(`钱不够，去“赚家庭币”赚点吧！`, 'error');

        if (item.type === 'single') {
            const hasBought = orders.some(o => o.kidId === activeKidId && o.itemName === item.name);
            if (hasBought) return notify("此愿望/商品仅可兑换一次，你已经兑换过啦！", "error");
        }

        const newOrder = { id: `ORD-${Math.floor(Math.random() * 10000)}`, kidId: activeKidId, itemName: item.name, price: item.price, status: 'shipping', date: new Date().toLocaleDateString(), rating: 0, comment: "" };
        try {
            await apiFetch(`/api/kids/${activeKidId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ balances: { ...activeKid.balances, spend: activeKid.balances.spend - item.price } }) });
            await apiFetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newOrder) });

            // Record Transaction
            const newTrans = {
                id: `trans_${Date.now()}`,
                kidId: activeKidId,
                type: 'expense',
                amount: item.price,
                title: `兑换: ${item.name}`,
                date: new Date().toISOString(),
                category: 'wish'
            };
            await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTrans) });
            setTransactions([newTrans, ...transactions]);

            setKids(kids.map(k => k.id === activeKidId ? { ...k, balances: { ...k.balances, spend: k.balances.spend - item.price } } : k));
            setOrders([newOrder, ...orders]);
            notify(`下单成功！等待发货。`, "success");
        } catch (e) { notify("网络请求失败", "error"); }
    };

    const handleSavePlan = async () => {
        if (!planForm.title && !planForm.targetKid) return notify("请填写完整信息", "error"); // Basic check

        // Reward parsing
        let rewardNum = parseInt(planForm.reward) || 0;
        if (planType === 'study' && planForm.pointRule !== 'custom') {
            rewardNum = 10; // Default system rule fallback for study
        }

        // Color and Frequency
        let color = "from-blue-400 to-blue-500";
        let frequency = "每天";
        let timeStr = "--:--";

        if (planType === 'study') {
            // Study Plan Logistics
            color = getCategoryGradient(planForm.category);

            const freqMap = {
                'today': '仅当天',
                'daily': '每天',
                'weekly_custom': '每周',
                'biweekly_custom': '每双周',
                'ebbinghaus': '艾宾浩斯',
                'weekly_1': '本周1次',
                'biweekly_1': '本双周1次',
                'monthly_1': '本月1次',
                'every_week_1': '每周1次',
                'every_biweek_1': '每双周1次',
                'every_month_1': '每月1次'
            };
            if (freqMap[planForm.repeatType]) frequency = freqMap[planForm.repeatType];
            else frequency = planForm.repeatType;

            if (planForm.timeSetting === 'range' && planForm.startTime && planForm.endTime) {
                timeStr = `${planForm.startTime}-${planForm.endTime}`;
            } else if (planForm.timeSetting === 'duration' && planForm.durationPreset) {
                timeStr = `${planForm.durationPreset}分钟`;
            }
        } else {
            // Habit Logistics
            color = planForm.habitColor;
            frequency = planForm.habitType === 'daily_once' ? '每日一次' : '多次记录';
        }

        // === EDIT MODE: Update existing task ===
        if (editingTask) {
            const updates = {
                title: planForm.title,
                reward: planType === 'habit' && rewardNum < 0 ? rewardNum : Math.abs(rewardNum),
                category: planType === 'study' ? planForm.category : "行为",
                catColor: color,
                frequency: frequency, // V1 fallback
                repeatConfig: planType === 'study' ? {
                    type: planForm.repeatType,
                    endDate: planForm.endDate || null,
                    weeklyDays: planForm.weeklyDays,
                    ebbStrength: planForm.ebbStrength,
                    periodDaysType: planForm.periodDaysType,
                    periodCustomDays: planForm.periodCustomDays,
                    periodTargetCount: Number(planForm.periodTargetCount),
                    periodMaxPerDay: Number(planForm.periodMaxPerDay)
                } : null, // V2 explicit config
                timeStr: timeStr,
                standards: planForm.desc || "按要求完成",
                iconEmoji: planForm.iconEmoji,
            };
            try {
                await apiFetch(`/api/tasks/${editingTask.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                });
                setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...updates } : t));
                setShowAddPlanModal(false);
                setEditingTask(null);
                notify('任务已更新', 'success');
            } catch (e) {
                console.error(e);
                notify('保存失败', 'error');
            }
            return;
        }

        // === CREATE MODE: Create new tasks ===
        let newTasks = [];
        const baseTask = {
            id: Date.now().toString(),
            title: planForm.title, desc: planForm.desc,
            reward: planType === 'habit' && rewardNum < 0 ? rewardNum : Math.abs(rewardNum),
            type: planType, status: 'todo', iconEmoji: planForm.iconEmoji, standards: planForm.desc || "按要求完成",
            category: planType === 'study' ? planForm.category : "行为",
            catColor: color,
            frequency: frequency, timeStr: timeStr,
            startDate: planForm.startDate,
            pointRule: planForm.pointRule,
            habitType: planForm.habitType,
            attachments: planForm.attachments || [],
            dates: planForm.repeatType === 'today' || planForm.repeatType === '仅当天' ? [planForm.startDate] : [],
            repeatConfig: planType === 'study' ? {
                type: planForm.repeatType,
                endDate: planForm.endDate || null,
                weeklyDays: planForm.weeklyDays,
                ebbStrength: planForm.ebbStrength,
                periodDaysType: planForm.periodDaysType,
                periodCustomDays: planForm.periodCustomDays,
                periodTargetCount: Number(planForm.periodTargetCount),
                periodMaxPerDay: Number(planForm.periodMaxPerDay)
            } : null,
            history: {} // History will now store { date: { kidId: { status } } }
        };

        if (planForm.targetKid === 'all') {
            // Unify logic: DB has one task, kidId = 'all'
            newTasks = [{ ...baseTask, kidId: 'all' }];
        } else {
            // Assign localized task as per usual for single selection
            newTasks = [{ ...baseTask, kidId: planForm.targetKid }];
        }

        try {
            await Promise.all(newTasks.map(task =>
                apiFetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task) })
            ));
            setTasks([...tasks, ...newTasks]);
            setShowAddPlanModal(false);
            setPlanForm({
                targetKid: 'all', category: '技能', title: '', desc: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                repeatType: 'today', timeSetting: 'none',
                weeklyDays: [1, 2, 3, 4, 5], ebbStrength: 'normal',
                periodDaysType: 'any', periodCustomDays: [1, 2, 3, 4, 5],
                periodTargetCount: 1, periodMaxPerDay: 1,
                startTime: '', endTime: '', durationPreset: 25,
                pointRule: 'default', reward: '', iconEmoji: '📚',
                habitColor: 'from-blue-400 to-blue-500', habitType: 'daily_once',
                attachments: []
            });
            notify(`成功创建了新的${planType === 'study' ? '计划' : '习惯'}！`, "success");
        } catch (e) { notify("网络请求失败", "error"); }
    };

    const handlePinClick = (num) => {
        if (pinInput.length < 4) {
            const newPin = pinInput + num;
            setPinInput(newPin);
            if (newPin.length === 4) {
                if (newPin === parentSettings.pinCode) {
                    setTimeout(() => {
                        setAppState('parent_app');
                        setPinInput('');
                        setShowParentPinModal(false);
                    }, 200);
                } else {
                    notify("密码错误", "error");
                    setTimeout(() => setPinInput(''), 400);
                }
            }
        }
    };

    const openParentFromKid = () => {
        if (parentSettings.pinEnabled) {
            setPinInput('');
            setShowParentPinModal(true);
        } else {
            setAppState('parent_app');
        }
    };

    const switchKid = (kidId) => {
        setActiveKidId(kidId);
        setShowKidSwitcher(false);
        setKidTab('study');
    };

    const confirmReceipt = async (orderId) => {
        try {
            await apiFetch(`/ api / orders / ${orderId} `, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'received' }) });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'received' } : o));
            notify("签收成功！快去评价一下吧。", "success");
        } catch (e) { notify("网络请求失败", "error"); }
    };

    const submitReview = async (orderId, stars, text) => {
        try {
            await apiFetch(`/ api / orders / ${orderId} `, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'completed', rating: stars, comment: text }) });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'completed', rating: stars, comment: text } : o));
            setSelectedOrder(null);
            setReviewStars(5);
            setReviewComment("");
            notify("评价完成，感谢反馈！", "success");
        } catch (e) { notify("网络请求失败", "error"); }
    };

    const handleSaveNewItem = async () => {
        if (!newItem.name || !newItem.price) return notify("请填写名称和需要星数", "error");

        if (newItem.id) {
            try {
                const updated = { ...newItem, price: parseInt(newItem.price) };
                await apiFetch(`/ api / inventory / ${newItem.id} `, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
                setInventory(inventory.map(i => i.id === newItem.id ? updated : i));
                setShowAddItemModal(false);
                setNewItem({ name: '', desc: '', price: '', iconEmoji: '🧸', type: 'single' });
                notify("商品修改成功！", "success");
            } catch (e) { notify("网络请求失败", "error"); }
        } else {
            const addedItem = { id: Date.now().toString(), ...newItem, price: parseInt(newItem.price) };
            try {
                await apiFetch('/api/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(addedItem) });
                setInventory([...inventory, addedItem]);
                setShowAddItemModal(false);
                setNewItem({ name: '', desc: '', price: '', iconEmoji: '🧸', type: 'single' });
                notify("商品上架成功！", "success");
            } catch (e) { notify("网络请求失败", "error"); }
        }
    };
    // === 弹窗渲染函数 (彻底修复 ReferenceError) ===
    const renderTimerModal = () => {
        if (!showTimerModal) return null;
        const task = tasks.find(t => t.id === timerTargetId);
        if (!task) return null;

        const hrs = Math.floor(timerSeconds / 3600);
        const mins = Math.floor((timerSeconds % 3600) / 60);
        const secs = timerSeconds % 60;

        const finishTimer = async () => {
            try {
                // Determine actual time spent based on mode
                let spentStr = '';
                if (timerMode === 'forward') {
                    const spentMins = Math.max(1, Math.round(timerSeconds / 60));
                    spentStr = `${spentMins} 分钟(正数)`;
                } else if (timerMode === 'countdown') {
                    const elapsed = timerTotalSeconds - timerSeconds;
                    const spentMins = Math.max(1, Math.round(elapsed / 60));
                    spentStr = `${spentMins} 分钟(倒数)`;
                }

                const histUpdate = { status: 'in_progress', timeSpent: spentStr };
                let newHistory = { ...(task.history || {}) };

                if (task.kidId === 'all') {
                    newHistory[selectedDate] = { ...(newHistory[selectedDate] || {}), [activeKidId]: histUpdate };
                } else {
                    newHistory[selectedDate] = histUpdate;
                }

                await apiFetch(`/api/tasks/${task.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ history: newHistory })
                });

                setTasks(tasks.map(t => t.id === task.id ? { ...t, history: newHistory } : t));
                setShowTimerModal(false);
                setIsTimerRunning(false);
                playSuccessSound();
                notify(`太棒了！你完成了【${task.title}】的计时，快去提交验收吧。`, "success");
            } catch (e) {
                notify("网络请求失败", "error");
            }
        };

        return (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in z-[110]">
                <div className="bg-white/10 w-full max-w-sm rounded-[2rem] p-8 mt-[-10vh] text-center border border-white/20 shadow-2xl">
                    <div className="text-white/60 font-bold mb-2">{timerMode === 'select' ? '选择计时方式' : (timerPaused ? '计时暂停中' : '正在专注进行')}</div>
                    <h2 className="text-3xl font-black text-white mb-8">{task.title}</h2>

                    {timerMode === 'select' ? (
                        <div className="flex flex-col gap-4 mb-4">
                            <button onClick={() => { setTimerMode('forward'); setTimerSeconds(0); setIsTimerRunning(true); }} className="w-full py-4 text-white font-black bg-blue-500 rounded-2xl shadow-lg hover:bg-blue-600 hover:scale-105 transition-all outline-none flex items-center justify-center gap-2">
                                <Icons.TrendingUp size={20} /> 正数计时
                            </button>
                            <button onClick={() => { setTimerMode('countdown'); setTimerSeconds(timerTotalSeconds); setIsTimerRunning(true); }} className="w-full py-4 text-white font-black bg-indigo-500 rounded-2xl shadow-lg hover:bg-indigo-600 hover:scale-105 transition-all outline-none flex items-center justify-center gap-2">
                                <Icons.Clock size={20} /> 倒数计时
                            </button>
                            <div className="text-white/50 text-xs mt-2 px-4">倒数计时将根据该任务配置的估计时间进行倒计时，如果没有设置时间则默认15分钟。</div>
                            <button onClick={() => setShowTimerModal(false)} className="mt-4 w-full py-3 text-white/50 font-bold hover:text-white/80 transition-colors">取消</button>
                        </div>
                    ) : (
                        <>
                            <div className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tighter mb-10 drop-shadow-xl flex justify-center gap-2 items-center">
                                {hrs > 0 && (
                                    <>
                                        <span className="bg-white/20 p-3 sm:p-4 rounded-3xl min-w-[70px] sm:min-w-[90px]">{String(hrs).padStart(2, '0')}</span>
                                        <span className="text-white/50 pt-2">:</span>
                                    </>
                                )}
                                <span className="bg-white/20 p-3 sm:p-4 rounded-3xl min-w-[70px] sm:min-w-[90px]">{String(mins).padStart(2, '0')}</span>
                                <span className="text-white/50 pt-2">:</span>
                                <span className="bg-white/20 p-3 sm:p-4 rounded-3xl min-w-[70px] sm:min-w-[90px]">{String(secs).padStart(2, '0')}</span>
                            </div>
                            <button onClick={() => setTimerPaused(!timerPaused)} className="w-full mb-4 py-4 text-white/90 font-bold bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all focus:outline-none flex justify-center items-center gap-2">
                                {timerPaused ? <><Icons.Play size={20} /> 继续计时</> : <><Icons.Pause size={20} /> 暂停计时</>}
                            </button>
                            <div className="flex gap-4">
                                <button onClick={() => { setIsTimerRunning(false); setShowTimerModal(false); }} className="flex-1 py-4 text-red-300 font-bold bg-white/10 rounded-2xl hover:bg-red-500/20 backdrop-blur-sm transition-all">
                                    放弃
                                </button>
                                <button onClick={finishTimer} className="flex-[2] py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/50 hover:bg-emerald-400 hover:scale-105 transition-all outline-none">
                                    完成打卡！
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderCalendarModal = () => {
        if (!showCalendarModal) return null;

        const changeMonth = (offset) => {
            const newDate = new Date(monthViewDate);
            newDate.setMonth(newDate.getMonth() + offset);
            setMonthViewDate(newDate);
        };

        const handleDayClick = (dateStr) => {
            setSelectedDate(dateStr);
            setCurrentViewDate(new Date(dateStr)); // 跳转当周
            setShowCalendarModal(false);
        };

        return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in">
                <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden zoom-in transition-all duration-300 transform">
                    <div className="p-4 sm:p-6">
                        <div className="flex justify-between items-center mb-6 px-1 sm:px-2">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.Calendar size={24} className="text-indigo-500" /> 全月总览</h3>
                            <button onClick={() => setShowCalendarModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"><Icons.X size={20} /></button>
                        </div>

                        <div className="flex items-center justify-between mb-4 sm:mb-6 px-2 sm:px-4 py-2 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                            <button onClick={() => changeMonth(-1)} className="p-2 text-indigo-600 hover:bg-white shadow-sm hover:shadow rounded-full transition-all"><Icons.ChevronLeft size={20} /></button>
                            <div className="font-bold text-lg text-slate-800 tracking-wide drop-shadow-sm">
                                {monthViewDate.getFullYear()}年 <span className="text-indigo-600">{monthViewDate.getMonth() + 1}月</span>
                            </div>
                            <button onClick={() => changeMonth(1)} className="p-2 text-indigo-600 hover:bg-white shadow-sm hover:shadow rounded-full transition-all"><Icons.ChevronRight size={20} /></button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center mb-2 px-1 sm:px-2">
                            {['一', '二', '三', '四', '五', '六', '日'].map((d, idx) => (
                                <div key={d} className={`text-xs font-bold py-2 ${idx >= 5 ? 'text-rose-400' : 'text-slate-400'}`}>{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 px-1 sm:px-2">
                            {getDaysInMonth(monthViewDate.getFullYear(), monthViewDate.getMonth()).map((dayObj, i) => {
                                const isSelected = dayObj.dateStr === selectedDate;
                                const isToday = dayObj.dateStr === formatDate(new Date());

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleDayClick(dayObj.dateStr)}
                                        className={`
                                            aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all relative
                                            ${!dayObj.isCurrentMonth ? 'text-slate-300 pointer-events-none scale-95 opacity-50' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer hover:scale-105 active:scale-95'}
                                            ${isSelected && dayObj.isCurrentMonth ? '!bg-indigo-600 !text-white shadow-lg shadow-indigo-600/40 scale-105 z-10' : ''}
                                            ${isToday && !isSelected && dayObj.isCurrentMonth ? '!bg-yellow-400 !text-yellow-900 shadow-sm' : ''}
                                        `}
                                    >
                                        {dayObj.day}
                                        {isToday && !isSelected && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-600 animate-pulse"></div>}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-6 sm:mt-8 pt-4 border-t border-slate-100 flex justify-end px-1 sm:px-2">
                            <button
                                onClick={() => { setMonthViewDate(new Date()); handleDayClick(formatDate(new Date())); }}
                                className="px-5 py-2.5 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center gap-2 border border-slate-200"
                            >
                                <Icons.RefreshCw size={16} className="text-slate-400" /> 回到今天
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderTaskSubmitModal = () => {
        if (!taskToSubmit) return null;
        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl text-left">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4"><Icons.CheckSquare size={24} /></div>
                    <h2 className="text-xl font-black text-slate-800 mb-2">提交验收确认</h2>
                    <p className="text-sm text-slate-500 mb-4">在提交给家长审核前，请确认你是否达到了以下标准：</p>
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-6">
                        <h3 className="font-bold text-slate-700 text-sm mb-1">【{taskToSubmit.title}】</h3>
                        <p className="text-slate-600 text-sm">{taskToSubmit.standards}</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setTaskToSubmit(null)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200">还没做好</button>
                        <button onClick={confirmSubmitTask} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700">我确认达标</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderQuickCompleteModal = () => {
        if (!quickCompleteTask) return null;
        const t = quickCompleteTask;
        const totalMins = qcHours * 60 + qcMinutes + Math.round(qcSeconds / 60);
        const totalDisplay = totalMins >= 60 ? `${Math.floor(totalMins / 60)}小时${totalMins % 60 > 0 ? totalMins % 60 + '分钟' : ''}` : `${totalMins}分钟`;

        return (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl text-left max-h-[90vh] overflow-y-auto">
                    {/* 头部 */}
                    <div className="sticky top-0 bg-white z-10 p-6 pb-4 border-b border-slate-100 rounded-t-[2rem]">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                    <Icons.CheckCircle size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-800">完成任务</h2>
                                    <p className="text-sm text-slate-400 font-bold">{t.title}</p>
                                </div>
                            </div>
                            <button onClick={() => setQuickCompleteTask(null)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors">
                                <Icons.X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 pt-4 space-y-5">
                        {/* 任务信息卡 */}
                        <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[11px] font-black px-2.5 py-1 rounded-full text-white ${getCategoryColor(t.category || '任务')}`}>
                                    {t.category || '任务'}
                                </span>
                                <span className="text-xs text-slate-400 font-bold">{selectedDate}</span>
                            </div>
                            <div className="font-black text-slate-800 text-lg">{t.title}</div>
                            {t.standards && <p className="text-xs text-slate-500 mt-1">{t.standards}</p>}
                        </div>

                        {/* 耗时设置 */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Icons.Clock size={16} className="text-slate-500" />
                                <span className="font-black text-slate-700 text-sm">耗时记录</span>
                            </div>

                            {/* Tab 切换 */}
                            <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
                                <button
                                    onClick={() => setQcTimeMode('duration')}
                                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${qcTimeMode === 'duration' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    输入时长
                                </button>
                                <button
                                    onClick={() => setQcTimeMode('actual')}
                                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${qcTimeMode === 'actual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    实际时间
                                </button>
                            </div>

                            {qcTimeMode === 'duration' ? (
                                <div>
                                    {/* 时/分/秒输入 */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex-1">
                                            <label className="text-[11px] font-bold text-slate-400 block mb-1 text-center">小时</label>
                                            <input type="number" min="0" max="23" value={qcHours} onChange={e => setQcHours(Math.max(0, parseInt(e.target.value) || 0))}
                                                className="w-full text-center text-2xl font-black text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl py-3 outline-none focus:border-indigo-400 transition-colors" />
                                        </div>
                                        <span className="text-2xl font-black text-slate-300 mt-5">:</span>
                                        <div className="flex-1">
                                            <label className="text-[11px] font-bold text-slate-400 block mb-1 text-center">分钟</label>
                                            <input type="number" min="0" max="59" value={qcMinutes} onChange={e => setQcMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                                                className="w-full text-center text-2xl font-black text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl py-3 outline-none focus:border-indigo-400 transition-colors" />
                                        </div>
                                        <span className="text-2xl font-black text-slate-300 mt-5">:</span>
                                        <div className="flex-1">
                                            <label className="text-[11px] font-bold text-slate-400 block mb-1 text-center">秒</label>
                                            <input type="number" min="0" max="59" value={qcSeconds} onChange={e => setQcSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                                                className="w-full text-center text-2xl font-black text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl py-3 outline-none focus:border-indigo-400 transition-colors" />
                                        </div>
                                    </div>

                                    {/* 总计 */}
                                    <div className="text-center bg-indigo-50 rounded-xl py-2 mb-4 border border-indigo-100">
                                        <span className="text-sm font-bold text-indigo-600">总计: {totalDisplay}</span>
                                    </div>

                                    {/* 快捷时长 */}
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 mb-2 block">常用时长</span>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[{ label: '15分钟', val: 15 }, { label: '30分钟', val: 30 }, { label: '45分钟', val: 45 }, { label: '1小时', val: 60 }, { label: '1.5小时', val: 90 }, { label: '2小时', val: 120 }].map(opt => (
                                                <button key={opt.val} onClick={() => handleQcQuickDuration(opt.val)}
                                                    className={`py-2.5 text-sm font-bold rounded-full border-2 transition-all
                                                        ${totalMins === opt.val ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">开始时间</label>
                                        <div className="relative">
                                            <input type="time" value={qcStartTime} onChange={e => setQcStartTime(e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 font-bold text-slate-700 outline-none focus:border-indigo-400 transition-colors" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">结束时间</label>
                                        <div className="relative">
                                            <input type="time" value={qcEndTime} onChange={e => setQcEndTime(e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 font-bold text-slate-700 outline-none focus:border-indigo-400 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 学习备注 */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Icons.FileText size={16} className="text-slate-500" />
                                <span className="font-bold text-slate-700 text-sm">学习备注</span>
                                <span className="text-xs text-slate-400">(可选)</span>
                            </div>
                            <textarea
                                value={qcNote}
                                onChange={e => setQcNote(e.target.value)}
                                placeholder="记录学习心得或笔记..."
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-4 text-sm text-slate-700 outline-none focus:border-indigo-400 transition-colors resize-none h-24 placeholder:text-slate-300"
                            />
                        </div>

                        {/* 附件上传 */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Icons.Image size={16} className="text-slate-500" />
                                <span className="font-bold text-slate-700 text-sm">完成证据</span>
                                <span className="text-xs text-slate-400">(可选，最多5个)</span>
                            </div>

                            {/* 已上传的预览 */}
                            {qcAttachments.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {qcAttachments.map((att, idx) => (
                                        <div key={idx} className="relative group">
                                            {att.type.startsWith('image/') ? (
                                                <img src={att.data} alt={att.name} className="w-full aspect-square object-cover rounded-xl border-2 border-slate-200" />
                                            ) : (
                                                <div className="w-full aspect-square bg-slate-100 rounded-xl border-2 border-slate-200 flex flex-col items-center justify-center p-1">
                                                    <Icons.FileText size={20} className="text-slate-400" />
                                                    <span className="text-[9px] text-slate-400 truncate w-full text-center mt-1">{att.name}</span>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setQcAttachments(prev => prev.filter((_, i) => i !== idx))}
                                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                            >
                                                <Icons.X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 上传区 */}
                            {qcAttachments.length < 5 && (
                                <label className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-2 group-hover:bg-indigo-100 transition-colors">
                                        <Icons.Upload size={20} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">点击上传图片或文件</span>
                                    <span className="text-[11px] text-slate-300 mt-1">支持图片、音频、视频</span>
                                    <input type="file" multiple accept="image/*,audio/*,video/*" onChange={handleQcFileUpload} className="hidden" />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* 底部按钮 */}
                    <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 flex gap-3 rounded-b-[2rem]">
                        <button onClick={() => setQuickCompleteTask(null)} className="flex-1 py-3.5 text-slate-600 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                            <Icons.X size={16} /> 取消
                        </button>
                        <button onClick={handleQuickComplete} className="flex-[2] py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-black rounded-xl shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-green-600 transition-all flex items-center justify-center gap-2">
                            <Icons.CheckCircle size={18} /> 确认完成
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderTransferModal = () => {
        if (!showTransferModal) return null;
        const activeKid = kids.find(k => k.id === activeKidId);
        if (!activeKid) return null;

        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl text-left">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.RefreshCw className="text-indigo-500" /> 资金手动划转</h2>
                        <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors"><Icons.X size={20} /></button>
                    </div>

                    <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl mb-6 font-bold text-center border border-indigo-100">
                        日常消费钱包余额：<span className="text-2xl font-black">{activeKid.balances.spend}</span> 家庭币
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">转入到哪里？</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setTransferForm({ ...transferForm, target: 'vault' })} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${transferForm.target === 'vault' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-inner' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                                    <Icons.Lock size={24} />
                                    <span className="font-bold">时光金库 (储蓄)</span>
                                </button>
                                <button onClick={() => setTransferForm({ ...transferForm, target: 'give' })} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${transferForm.target === 'give' ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-inner' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                                    <Icons.Heart size={24} />
                                    <span className="font-bold">公益基金</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">划转金额</label>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <button onClick={() => setTransferForm({ ...transferForm, amount: 10 })} className="py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">+ 10</button>
                                <button onClick={() => setTransferForm({ ...transferForm, amount: 50 })} className="py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">+ 50</button>
                                <button onClick={() => setTransferForm({ ...transferForm, amount: activeKid.balances.spend })} className="py-2 bg-slate-100 text-indigo-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">全部余额</button>
                            </div>
                            <div className="relative">
                                <input type="number" value={transferForm.amount} onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })} placeholder="输入数字" className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl text-lg font-bold outline-none focus:border-indigo-500 transition-colors" />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">家庭币</span>
                            </div>
                        </div>
                    </div>

                    <button onClick={confirmTransfer} className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all hover:-translate-y-0.5 mt-2">
                        确认划转
                    </button>
                </div>
            </div>
        );
    };

    const renderReviewModal = () => {
        if (!selectedOrder) return null;
        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl text-left">
                    <h2 className="text-xl font-black text-slate-800 mb-2">订单评价</h2>
                    <p className="text-slate-500 text-sm mb-6">收到“{selectedOrder.itemName}”了吗？给个真实反馈吧！</p>
                    <div className="flex justify-center gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map(s => (
                            <button key={s} onClick={() => setReviewStars(s)} className={`p-1 transition-all ${s <= reviewStars ? 'text-yellow-400 scale-110' : 'text-slate-200'}`}><Icons.Star size={36} fill={s <= reviewStars ? 'currentColor' : 'none'} /></button>
                        ))}
                    </div>
                    <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="写下你的真实感受吧..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 h-28 resize-none mb-6" />
                    <div className="flex gap-3">
                        <button onClick={() => setSelectedOrder(null)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200">暂不评价</button>
                        <button onClick={() => submitReview(selectedOrder.id, reviewStars, reviewComment || "默认好评！")} className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">提交评价</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderAddItemModal = () => {
        const emojis = ['🧸', '🎮', '🍔', '🍭', '🎢', '✈️', '📱', '📚', '🛡️', '🎟️'];
        if (!showAddItemModal) return null;

        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in overflow-y-auto py-10">
                <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl text-left overflow-hidden mt-auto mb-auto">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 flex justify-between items-center text-white">
                        <h2 className="text-xl font-black flex items-center gap-2"><Icons.Plus size={20} /> 添加我的愿望/商品</h2>
                        <button onClick={() => setShowAddItemModal(false)} className="hover:bg-white/20 p-1 rounded-lg"><Icons.X size={20} /></button>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">选择图标</label>
                            <div className="bg-purple-50 rounded-2xl p-4 flex flex-wrap gap-3 justify-center border border-purple-100">
                                {emojis.map(e => (
                                    <button key={e} onClick={() => setNewItem({ ...newItem, iconEmoji: e })} className={`text-3xl p-2 rounded-xl transition-all ${newItem.iconEmoji === e ? 'bg-white shadow-md scale-110' : 'hover:scale-110 opacity-70'}`}>
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">愿望名称 *</label>
                            <input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="例如：乐高积木、游乐园门票..." className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-purple-500 font-medium" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">详细描述 (可选)</label>
                            <textarea value={newItem.desc} onChange={e => setNewItem({ ...newItem, desc: e.target.value })} placeholder="描述一下这个愿望的细节..." className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-purple-500 text-sm h-20 resize-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">需要多少家庭币？ *</label>
                            <input type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-purple-500 font-black text-lg mb-3" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">重复兑换设置 <Icons.Info size={14} className="text-slate-400" /></label>
                            <div className="grid grid-cols-3 gap-3">
                                <button onClick={() => setNewItem({ ...newItem, type: 'single' })} className={`p-3 rounded-xl border-2 text-center transition-all ${newItem.type === 'single' ? 'border-purple-500 bg-purple-50' : 'border-slate-100 hover:border-slate-200'}`}>
                                    <div className="font-bold text-slate-800 text-sm">单次</div>
                                </button>
                                <button onClick={() => setNewItem({ ...newItem, type: 'multiple' })} className={`p-3 rounded-xl border-2 text-center transition-all ${newItem.type === 'multiple' ? 'border-purple-500 bg-purple-50' : 'border-slate-100 hover:border-slate-200'}`}>
                                    <div className="font-bold text-slate-800 text-sm">多次</div>
                                </button>
                                <button onClick={() => setNewItem({ ...newItem, type: 'unlimited' })} className={`p-3 rounded-xl border-2 text-center transition-all ${newItem.type === 'unlimited' ? 'border-purple-500 bg-purple-50' : 'border-slate-100 hover:border-slate-200'}`}>
                                    <div className="font-bold text-slate-800 text-sm">永久</div>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-100 flex gap-4 bg-slate-50">
                        <button onClick={() => setShowAddItemModal(false)} className="flex-1 py-3 text-slate-500 font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-100">取消</button>
                        <button onClick={handleSaveNewItem} className="flex-[2] py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700">确认添加愿望</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderKidPreviewModal = () => {
        if (!showPreviewModal || !previewTask) return null;

        // Extract history specific to activeKidId
        let kidHistory = {};
        if (previewTask.kidId === 'all') {
            Object.entries(previewTask.history || {}).forEach(([date, dateObj]) => {
                if (dateObj[activeKidId]) {
                    kidHistory[date] = dateObj[activeKidId];
                }
            });
        } else {
            kidHistory = previewTask.history || {};
        }

        const historyEntries = Object.entries(kidHistory).filter(([d, h]) => h?.status === 'completed').sort((a, b) => b[0].localeCompare(a[0]));
        const totalCompleted = historyEntries.length;
        const totalEarned = historyEntries.length * (previewTask.reward > 0 ? previewTask.reward : 0);

        // Calculate streak
        let currentStreak = 0;
        let checkDate = new Date();
        const todayStr = formatDate(checkDate);
        let activeCheckDate = new Date();

        if (kidHistory[todayStr]?.status === 'completed') {
            currentStreak++;
            activeCheckDate.setDate(activeCheckDate.getDate() - 1);
        } else {
            const yDate = new Date();
            yDate.setDate(yDate.getDate() - 1);
            if (kidHistory[formatDate(yDate)]?.status === 'completed') {
                currentStreak++;
                activeCheckDate = yDate;
                activeCheckDate.setDate(activeCheckDate.getDate() - 1);
            }
        }

        while (currentStreak > 0) {
            const dStr = formatDate(activeCheckDate);
            if (kidHistory[dStr]?.status === 'completed') {
                currentStreak++;
                activeCheckDate.setDate(activeCheckDate.getDate() - 1);
            } else {
                break;
            }
        }

        return (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
                <div className="bg-white w-full max-w-md rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden my-auto max-h-[90vh] flex flex-col">
                    {/* Header Decoration */}
                    <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-br ${getCategoryGradient(previewTask.category || '计划任务')} opacity-20`}></div>
                    <div className="absolute top-4 right-4 z-50">
                        <button onClick={() => { setShowPreviewModal(false); setPreviewTask(null); }} className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all shadow cursor-pointer relative">
                            <Icons.X size={20} />
                        </button>
                    </div>

                    <div className="relative z-10 pt-4 flex flex-col items-center text-center shrink-0">
                        <div className={`w-24 h-24 rounded-[2rem] bg-gradient-to-br ${getCategoryGradient(previewTask.category || '计划任务')} flex items-center justify-center text-5xl shadow-xl border-4 border-white mb-4 -rotate-3`}>
                            {previewTask.iconEmoji || renderIcon(previewTask.iconName, 50)}
                        </div>
                        <div className="text-sm font-black text-indigo-500 mb-1 bg-indigo-50 px-3 py-1 rounded-full">{previewTask.category || '计划任务'}</div>
                        <h2 className="text-2xl font-black text-slate-800 mb-6">{previewTask.title}</h2>
                    </div>

                    <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6">
                        {/* Task Information Card */}
                        <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left space-y-4 mb-6">
                            {/* 任务类型与频次 */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Icons.RefreshCw size={16} /></div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 mb-0.5">任务类型与频次</div>
                                    <div className="text-sm font-black text-slate-700">
                                        {previewTask.type === 'habit' ? '我的成长' : '学习计划'} • {previewTask.frequency || '每天'}
                                    </div>
                                </div>
                            </div>

                            {(previewTask.timeStr && previewTask.timeStr !== '--:--') && (
                                <div className="flex items-start gap-3 border-t border-slate-200 pt-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Icons.Clock size={16} /></div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 mb-0.5">时间要求</div>
                                        <div className="text-sm font-black text-slate-700">{previewTask.timeStr}</div>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3 border-t border-slate-200 pt-3">
                                <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0"><Icons.Star size={16} fill="currentColor" /></div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 mb-0.5">奖励规则</div>
                                    <div className="text-sm font-black text-slate-700">
                                        {previewTask.pointRule === 'custom' ? `固定得 ${previewTask.reward} ${previewTask.type === 'habit' ? '经验' : '家庭币'}` : `系统自动计算 (${previewTask.reward} ${previewTask.type === 'habit' ? '经验' : '家庭币'})`}
                                    </div>
                                </div>
                            </div>
                            {previewTask.desc && (
                                <div className="flex items-start gap-3 border-t border-slate-200 pt-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"><Icons.FileText size={16} /></div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 mb-0.5">家长寄语/任务要求</div>
                                        <div className="text-sm font-medium text-slate-600 leading-relaxed">{previewTask.desc}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 历史完成信息记录 */}
                        <div className="w-full text-left">
                            <div className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center"><Icons.TrendingUp size={14} /></div>
                                历史完成记录
                            </div>
                            <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm mb-4">
                                <div className="flex flex-col items-center flex-1">
                                    <span className="text-2xl font-black text-slate-800">{totalCompleted}</span>
                                    <span className="text-[10px] font-bold text-slate-400 mt-1">累计完成(次)</span>
                                </div>
                                <div className="w-px h-10 bg-slate-100"></div>
                                <div className="flex flex-col items-center flex-1">
                                    <span className="text-2xl font-black text-emerald-500">{currentStreak}</span>
                                    <span className="text-[10px] font-bold text-slate-400 mt-1">当前连续(天)</span>
                                </div>
                                <div className="w-px h-10 bg-slate-100"></div>
                                <div className="flex flex-col items-center flex-1">
                                    <span className="text-2xl font-black text-orange-500">{totalEarned}</span>
                                    <span className="text-[10px] font-bold text-slate-400 mt-1">累计获得</span>
                                </div>
                            </div>

                            {historyEntries.length > 0 && (
                                <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors list-none">
                                        <div className="flex items-center gap-2">
                                            <Icons.List size={16} className="text-slate-400" />
                                            <span className="text-sm font-bold text-slate-700">展开历史打卡记录</span>
                                        </div>
                                        <Icons.ChevronDown size={16} className="text-slate-400 group-open:-rotate-180 transition-transform duration-300" />
                                    </summary>
                                    <div className="border-t border-slate-100 p-0 flex flex-col hide-scrollbar max-h-48 overflow-y-auto bg-slate-50/50">
                                        {historyEntries.map(([date, record]) => (
                                            <div key={date} className="px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-white transition-colors">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-sm text-slate-800">{date}</span>
                                                    <span className="text-xs text-slate-500 flex items-center gap-1"><Icons.Clock size={12} />{record.timeSpent || '瞬间完成'}</span>
                                                </div>
                                                {record.note && (
                                                    <p className="text-xs text-slate-600 bg-slate-100/50 p-2 rounded-lg mt-2 border border-slate-200">
                                                        <span className="font-bold">打卡备注：</span>{record.note}
                                                    </p>
                                                )}
                                                {record.attachmentCount > 0 && (
                                                    <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded">
                                                        <Icons.Paperclip size={12} /> {record.attachmentCount} 个附件 (已归档)
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            )}
                        </div>
                    </div>

                    <div className="relative z-10 shrink-0 mt-4">
                        {(() => {
                            const pStatus = getTaskStatusOnDate(previewTask, selectedDate, activeKidId);
                            return (
                                <>
                                    {pStatus === 'todo' && (
                                        <div className="flex gap-3 w-full">
                                            <button onClick={() => { setShowPreviewModal(false); setPreviewTask(null); openQuickComplete(previewTask); }} className="flex-1 bg-slate-100 text-slate-600 rounded-2xl py-4 font-black hover:bg-slate-200 transition-colors">
                                                <Icons.Check className="inline-block mr-1" size={18} /> 快速打卡
                                            </button>
                                            <button onClick={() => { setShowPreviewModal(false); setPreviewTask(null); handleStartTask(previewTask.id); }} className="flex-[2] bg-blue-600 text-white rounded-2xl py-4 font-black shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02] transition-all">
                                                <Icons.Play className="inline-block mr-1 text-blue-200" size={18} fill="currentColor" /> 开始计时
                                            </button>
                                        </div>
                                    )}
                                    {pStatus === 'in_progress' && (
                                        <button onClick={() => { setShowPreviewModal(false); setPreviewTask(null); handleAttemptSubmit(previewTask); }} className="w-full bg-indigo-100 text-indigo-700 rounded-2xl py-4 font-black flex items-center justify-center gap-2 hover:bg-indigo-200 transition-colors">
                                            <Icons.CheckSquare size={20} /> 提交验收
                                        </button>
                                    )}
                                    {pStatus === 'pending_approval' && (
                                        <div className="w-full bg-orange-50 text-orange-600 border border-orange-200 rounded-2xl py-4 font-black flex items-center justify-center gap-2 cursor-not-allowed">
                                            <Icons.Clock size={20} /> 待家长审核发放奖励...
                                        </div>
                                    )}
                                    {pStatus === 'completed' && (
                                        <div className="w-full bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl py-4 font-black flex items-center justify-center gap-2 cursor-not-allowed">
                                            <Icons.CheckCircle size={20} /> 此任务已完成
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>
        );
    };

    const renderAddPlanModal = () => {
        if (!showAddPlanModal) return null;

        // Define color themes for habits
        const habitColors = [
            'from-blue-400 to-blue-500', 'from-indigo-400 to-indigo-500', 'from-purple-400 to-purple-500',
            'from-fuchsia-400 to-fuchsia-500', 'from-rose-400 to-rose-500', 'from-red-400 to-red-500',
            'from-orange-400 to-orange-500', 'from-amber-400 to-amber-500', 'from-green-400 to-green-500',
            'from-emerald-400 to-emerald-500', 'from-teal-400 to-teal-500', 'from-cyan-400 to-cyan-500'
        ];

        const studyEmojis = ['📚', '✏️', '📝', '🧮', '🔬', '💻', '🧠', '🎧', '🎨', '🎵'];
        const habitEmojis = ['⭐', '⏰', '🛏️', '🧹', '🏃', '🍎', '🥛', '🚫', '📱', '🎮'];

        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in overflow-y-auto pt-10 pb-20">
                <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl text-left overflow-hidden mt-auto mb-auto border border-white/20">

                    {/* Header */}
                    <div className="bg-white p-6 flex justify-between items-center border-b border-slate-100 relative z-30 shadow-sm">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                {editingTask ? (planType === 'study' ? '✨ 编辑任务' : '✨ 编辑成长记录') : (planType === 'study' ? '新建任务' : '记录成长')}
                            </h2>
                            <div className="text-slate-500 text-sm mt-1 font-medium">
                                {editingTask ? '修改任务信息后点击保存' : (planType === 'study' ? '布置任务，让孩子赚取家庭币' : '创建成长记录，设置经验奖励')}
                            </div>
                        </div>
                        <button onClick={() => { setShowAddPlanModal(false); setEditingTask(null); }} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-all"><Icons.X size={24} /></button>
                    </div>

                    <div className="p-6 md:p-8 space-y-6 md:space-y-8 bg-slate-50/50 h-[65vh] overflow-y-auto custom-scrollbar relative z-10">
                        {/* --- STUDY PLAN FORM --- */}

                        {/* --- STUDY PLAN FORM --- */}
                        {planType === 'study' && (
                            <div className="space-y-6 animate-fade-in relative z-0">
                                {/* Basic Info */}
                                <div>
                                    <label className="block text-sm font-black text-slate-800 mb-2">指派给谁 <span className="text-red-500">*</span></label>
                                    <select value={planForm.targetKid} onChange={e => setPlanForm({ ...planForm, targetKid: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500 font-bold text-slate-700 transition-colors appearance-none">
                                        <option value="all">👥 全部孩子</option>
                                        {kids.map(k => <option key={k.id} value={k.id}>{k.avatar} {k.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-slate-800 mb-2">任务类型 <span className="text-red-500">*</span></label>
                                    <select value={planForm.category} onChange={e => {
                                        if (e.target.value === '__NEW__') {
                                            const custom = window.prompt("请输入新任务分类名称 (最长6个字符)：");
                                            if (custom && custom.trim()) setPlanForm({ ...planForm, category: custom.trim().substring(0, 6) });
                                        } else {
                                            setPlanForm({ ...planForm, category: e.target.value });
                                        }
                                    }} className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500 font-bold text-slate-700 transition-colors appearance-none">
                                        {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        {(!allCategories.includes(planForm.category) && planForm.category && planForm.category !== '__NEW__') && <option value={planForm.category}>{planForm.category}</option>}
                                        <option value="__NEW__">➕ 自定义新分类...</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-slate-800 mb-2">任务名称 <span className="text-red-500">*</span></label>
                                    <input value={planForm.title} onChange={e => setPlanForm({ ...planForm, title: e.target.value })} placeholder="例如：完成课后练习题、练字30分钟..." className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500 font-bold text-slate-800 transition-all text-lg" />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-slate-800 mb-2">任务说明 (可选)</label>
                                    <textarea value={planForm.desc} onChange={e => setPlanForm({ ...planForm, desc: e.target.value })} placeholder="补充一些具体要求或鼓励的话..." className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500 text-slate-700 transition-all min-h-[100px] resize-y" />
                                </div>

                                <div className="pt-4 border-t border-slate-200">
                                    <label className="block text-sm font-black text-slate-800 mb-3 flex items-center gap-2"><Icons.Star size={18} className="text-indigo-500" /> 选择任务图标</label>
                                    <div className="bg-white rounded-2xl p-4 flex flex-wrap gap-2 justify-center border border-slate-200">
                                        {studyEmojis.map(e => (
                                            <button key={e} onClick={() => setPlanForm({ ...planForm, iconEmoji: e })} className={`text-4xl p-2 rounded-2xl transition-all ${planForm.iconEmoji === e ? 'bg-slate-50 shadow-md scale-110 ring-2 ring-blue-500' : 'hover:scale-110 opacity-60 grayscale hover:grayscale-0'}`}>{e}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- BEHAVIOR HABIT FORM --- */}
                        {planType === 'habit' && (
                            <div className="space-y-6 animate-fade-in relative z-0">
                                {/* Visual Preview Row */}
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Left: Fields */}
                                    <div className="flex-[2] space-y-6">
                                        <div>
                                            <label className="block text-sm font-black text-slate-800 mb-2">指派给谁 <span className="text-red-500">*</span></label>
                                            <select value={planForm.targetKid} onChange={e => setPlanForm({ ...planForm, targetKid: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-emerald-500 font-bold text-slate-700 transition-colors appearance-none">
                                                <option value="all">👥 全部孩子</option>
                                                {kids.map(k => <option key={k.id} value={k.id}>{k.avatar} {k.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-black text-slate-800 mb-2">习惯名称 <span className="text-red-500">*</span></label>
                                            <input value={planForm.title} onChange={e => setPlanForm({ ...planForm, title: e.target.value })} placeholder="例如：早起、不玩手机、自己整理书包" className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-emerald-500 font-bold text-slate-800 transition-all text-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-black text-slate-800 mb-2">习惯说明 (可选)</label>
                                            <textarea value={planForm.desc} onChange={e => setPlanForm({ ...planForm, desc: e.target.value })} placeholder="描述这个习惯的具体标准..." className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-emerald-500 text-slate-700 transition-all min-h-[100px] resize-y" />
                                        </div>
                                    </div>

                                    {/* Right: Live Preview */}
                                    <div className="flex-1">
                                        <label className="block text-sm font-black text-slate-800 mb-2 invisible hidden md:block">预览</label>
                                        <div className={`w-full h-[180px] md:h-full min-h-[220px] rounded-3xl bg-gradient-to-br ${planForm.habitColor} p-6 flex flex-col items-center justify-center text-white shadow-xl relative overflow-hidden group transition-all duration-500`}>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform"></div>
                                            <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform flex items-center justify-center bg-white/20 w-24 h-24 rounded-full backdrop-blur-sm shadow-inner">
                                                {planForm.iconEmoji}
                                            </div>
                                            <div className="font-black text-xl text-center leading-tight drop-shadow-md">{planForm.title || '习惯名称'}</div>
                                            <div className="text-white/80 text-xs font-bold mt-2 bg-black/10 px-3 py-1 rounded-full backdrop-blur-md">
                                                {planForm.habitType === 'daily_once' ? '每日一次' : '多次记录'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Icon & Color Selectors */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                    <div>
                                        <label className="block text-sm font-black text-slate-800 mb-3">选择图标</label>
                                        <div className="bg-slate-50 rounded-2xl p-3 flex flex-wrap gap-2 border border-slate-100 h-[170px] content-start overflow-y-auto custom-scrollbar">
                                            {habitEmojis.map(e => (
                                                <button key={e} onClick={() => setPlanForm({ ...planForm, iconEmoji: e })} className={`text-3xl p-2 rounded-xl transition-all ${planForm.iconEmoji === e ? 'bg-white shadow-md scale-110 ring-2 ring-emerald-500' : 'hover:scale-110 opacity-60 grayscale hover:grayscale-0'}`}>{e}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-slate-800 mb-3">主题颜色</label>
                                        <div className="bg-slate-50 rounded-2xl p-4 flex flex-wrap gap-4 border border-slate-100 h-[170px] content-start overflow-y-auto custom-scrollbar">
                                            {habitColors.map(color => (
                                                <button key={color} onClick={() => setPlanForm({ ...planForm, habitColor: color })}
                                                    className={`w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br ${color} transition-all relative overflow-hidden group 
                                                    ${planForm.habitColor === color ? 'ring-4 ring-offset-2 ring-slate-800 scale-95 shadow-inner' : 'hover:scale-105 shadow-sm'}`}>
                                                    {planForm.habitColor === color && <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white"><Icons.Check size={20} className="font-black" /></div>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section 2: Repeat & Time */}
                        {planType === 'study' && (
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-black text-slate-800 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"><Icons.RefreshCw size={18} /></div>
                                        任务类型 <span className="text-red-500">*</span>
                                    </label>
                                    <select value={planForm.repeatType} onChange={e => setPlanForm({ ...planForm, repeatType: e.target.value })} className="w-full border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-blue-500 font-bold text-slate-700 hover:border-slate-300 transition-colors appearance-none bg-white">
                                        <option value="today">仅当天 ({planForm.startDate})</option>
                                        <option value="daily">每天</option>
                                        <option value="weekly_custom">每周(自定义)</option>
                                        <option value="biweekly_custom">每双周(自定义)</option>
                                        <option value="ebbinghaus">艾宾浩斯</option>
                                        <option value="weekly_1">本周1次 🗓️ 跨日任务</option>
                                        <option value="biweekly_1">本双周1次 🗓️ 跨日任务</option>
                                        <option value="monthly_1">本月1次 🗓️ 跨日任务</option>
                                        <option value="every_week_1">每周1次 🗓️ 跨日任务</option>
                                        <option value="every_biweek_1">每双周1次 🗓️ 跨日任务</option>
                                        <option value="every_month_1">每月1次 🗓️ 跨日任务</option>
                                    </select>
                                    <div className="mt-3 bg-blue-50 text-blue-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2 border border-blue-100">
                                        <Icons.Info size={16} /> 选择任务的重复周期和类型。
                                    </div>

                                    {/* Dynamic Sub-configs based on Repeat Type */}
                                    <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                                        {/* Date range for all Except Today where it's just StartDate */}
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-slate-600 mb-2">开始日期</label>
                                                <input type="date" value={planForm.startDate} onChange={e => setPlanForm({ ...planForm, startDate: e.target.value })} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 font-bold bg-white text-slate-700" />
                                            </div>
                                            {planForm.repeatType !== 'today' && (
                                                <div className="flex-1">
                                                    <label className="block text-xs font-bold text-slate-600 mb-2">结束日期 <span className="text-slate-400 font-normal">(可选)</span></label>
                                                    <input type="date" value={planForm.endDate} onChange={e => setPlanForm({ ...planForm, endDate: e.target.value })} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 font-bold bg-white text-slate-700" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Weekly & Bi-weekly Literal Days selector */}
                                        {(planForm.repeatType === 'weekly_custom' || planForm.repeatType === 'biweekly_custom') && (
                                            <div className="animate-fade-in bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <div className="flex justify-between items-center mb-3">
                                                    <label className="text-xs font-bold text-slate-600">在以下星期几重复？</label>
                                                    <div className="flex gap-2 text-xs">
                                                        <button onClick={() => setPlanForm({ ...planForm, weeklyDays: [1, 2, 3, 4, 5] })} className="text-blue-600 bg-blue-100/50 px-2 py-1 rounded hover:bg-blue-100">工作日</button>
                                                        <button onClick={() => setPlanForm({ ...planForm, weeklyDays: [6, 7] })} className="text-orange-600 bg-orange-100/50 px-2 py-1 rounded hover:bg-orange-100">周末</button>
                                                        <button onClick={() => setPlanForm({ ...planForm, weeklyDays: [1, 2, 3, 4, 5, 6, 7] })} className="text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded hover:bg-emerald-100">每天</button>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between">
                                                    {[{ d: 1, l: '一' }, { d: 2, l: '二' }, { d: 3, l: '三' }, { d: 4, l: '四' }, { d: 5, l: '五' }, { d: 6, l: '六' }, { d: 7, l: '日' }].map(w => {
                                                        const isSelected = planForm.weeklyDays?.includes(w.d);
                                                        return (
                                                            <button key={w.d} onClick={() => {
                                                                const newDays = isSelected ? planForm.weeklyDays.filter(d => d !== w.d) : [...(planForm.weeklyDays || []), w.d];
                                                                setPlanForm({ ...planForm, weeklyDays: newDays });
                                                            }} className={`w-10 h-10 rounded-full font-bold transition-all shadow-sm flex items-center justify-center text-sm ${isSelected ? 'bg-blue-600 text-white shadow-blue-600/30' : 'bg-white text-slate-500 hover:border-blue-400 border border-slate-200'}`}>
                                                                {w.l}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Ebbinghaus Config */}
                                        {planForm.repeatType === 'ebbinghaus' && (
                                            <div className="animate-fade-in bg-purple-50 p-4 rounded-2xl border border-purple-100">
                                                <label className="block text-xs font-bold text-purple-800 mb-3">复习强度</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[{ v: 'gentle', l: '温柔强度', d: '第1,3,7,14,30天' }, { v: 'normal', l: '一般强度', d: '第1,2,4,7,15,30天' }, { v: 'exam', l: '考前强度', d: '第1,2,3,5,7,10,14天' }, { v: 'enhanced', l: '增强模式', d: '密集的9次复习' }].map(eb => (
                                                        <button key={eb.v} onClick={() => setPlanForm({ ...planForm, ebbStrength: eb.v })} className={`p-3 rounded-xl border-2 text-left transition-all ${planForm.ebbStrength === eb.v ? 'border-purple-500 bg-white shadow-sm ring-2 ring-purple-500/20' : 'border-transparent bg-white/50 hover:bg-white text-slate-500'}`}>
                                                            <div className={`font-bold text-sm mb-1 ${planForm.ebbStrength === eb.v ? 'text-purple-700' : 'text-slate-600'}`}>{eb.l}</div>
                                                            <div className="text-[10px] leading-tight opacity-70">{eb.d}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* N-times Period Goals */}
                                        {(planForm.repeatType.includes('_1') || planForm.repeatType.includes('_n')) && (
                                            <div className="animate-fade-in bg-orange-50/50 p-4 rounded-2xl border border-orange-100 space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-2">该周期内需完成几次？</label>
                                                        <input type="number" min="1" max="99" value={planForm.periodTargetCount} onChange={e => setPlanForm({ ...planForm, periodTargetCount: Math.max(1, parseInt(e.target.value) || 1) })} className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-orange-500 font-bold bg-white text-orange-700" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-2">每次奖励上限次数 <span className="opacity-50">(防刷)</span></label>
                                                        <input type="number" min="1" max="10" value={planForm.periodMaxPerDay} onChange={e => setPlanForm({ ...planForm, periodMaxPerDay: Math.max(1, parseInt(e.target.value) || 1) })} className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-orange-500 font-bold bg-white text-orange-700" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 mb-2">允许执行的日期限制</label>
                                                    <select value={planForm.periodDaysType} onChange={e => setPlanForm({ ...planForm, periodDaysType: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-orange-500 font-bold text-slate-700 appearance-none">
                                                        <option value="any">⏳ 任意时间都可以完成</option>
                                                        <option value="workdays">💼 仅限工作日完成</option>
                                                        <option value="weekends">🎉 仅限周末完成</option>
                                                        <option value="custom">⚙️ 自定义每周哪几天</option>
                                                    </select>
                                                    {planForm.periodDaysType === 'custom' && (
                                                        <div className="flex justify-between mt-3 bg-white p-2 rounded-xl border border-slate-100">
                                                            {[{ d: 1, l: '一' }, { d: 2, l: '二' }, { d: 3, l: '三' }, { d: 4, l: '四' }, { d: 5, l: '五' }, { d: 6, l: '六' }, { d: 7, l: '日' }].map(w => {
                                                                const isSelected = planForm.periodCustomDays?.includes(w.d);
                                                                return (
                                                                    <button key={w.d} onClick={() => {
                                                                        const newDays = isSelected ? planForm.periodCustomDays.filter(d => d !== w.d) : [...(planForm.periodCustomDays || []), w.d];
                                                                        setPlanForm({ ...planForm, periodCustomDays: newDays });
                                                                    }} className={`w-8 h-8 rounded-full font-bold transition-all flex items-center justify-center text-xs ${isSelected ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                                                                        {w.l}
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-black text-slate-800 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Icons.Clock size={18} /></div>
                                        任务时间配置 <span className="text-slate-400 font-normal text-xs">(可选)</span>
                                    </label>
                                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-full mb-4">
                                        <button onClick={() => setPlanForm({ ...planForm, timeSetting: planForm.timeSetting === 'range' ? 'none' : 'range' })} className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${planForm.timeSetting === 'range' ? 'bg-white shadow text-blue-600 border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                                            <Icons.Clock size={16} /> 指定时间段
                                        </button>
                                        <button onClick={() => setPlanForm({ ...planForm, timeSetting: planForm.timeSetting === 'duration' ? 'none' : 'duration' })} className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${planForm.timeSetting === 'duration' ? 'bg-white shadow text-blue-600 border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                                            <Icons.Settings size={16} /> 要求时长
                                        </button>
                                    </div>

                                    {planForm.timeSetting === 'range' && (
                                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 animate-fade-in">
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-bold text-slate-600 mb-2">开始时间</label>
                                                    <input type="time" value={planForm.startTime} onChange={e => setPlanForm({ ...planForm, startTime: e.target.value })} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 font-bold bg-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-xs font-bold text-slate-600 mb-2">结束时间</label>
                                                    <input type="time" value={planForm.endTime} onChange={e => setPlanForm({ ...planForm, endTime: e.target.value })} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 font-bold bg-white" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {planForm.timeSetting === 'duration' && (
                                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 animate-fade-in border-2 border-emerald-200">
                                            <div className="grid grid-cols-4 gap-2">
                                                {[5, 10, 15, 20, 30, 45, 60, 90].map(m => (
                                                    <button key={m} onClick={() => setPlanForm({ ...planForm, durationPreset: m })} className={`py-2 rounded-xl text-sm font-bold transition-all ${planForm.durationPreset === m ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-white border border-emerald-100 text-emerald-700 hover:bg-emerald-100'}`}>
                                                        {m}分钟
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Conditional Section: Frequency (Habits only, as repetition is handled globally above) */}
                        {planType === 'habit' && (
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <label className="block text-sm font-black text-slate-800 mb-3"><Icons.RefreshCw size={16} className="inline mr-1 text-emerald-500" /> 打卡频率限制 <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setPlanForm({ ...planForm, habitType: 'daily_once' })} className={`p-4 rounded-2xl border-2 text-left transition-all ${planForm.habitType === 'daily_once' ? 'border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-400'}`}>
                                        <div className={`font-black tracking-wide text-lg mb-1 ${planForm.habitType === 'daily_once' ? 'text-emerald-700' : 'text-slate-600'}`}>每日一次</div>
                                        <div className="text-xs font-medium opacity-80 leading-relaxed">适合阅读、早睡等每天只需达成一次的习惯。</div>
                                    </button>
                                    <button onClick={() => setPlanForm({ ...planForm, habitType: 'multiple' })} className={`p-4 rounded-2xl border-2 text-left transition-all ${planForm.habitType === 'multiple' ? 'border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-400'}`}>
                                        <div className={`font-black tracking-wide text-lg mb-1 ${planForm.habitType === 'multiple' ? 'text-emerald-700' : 'text-slate-600'}`}>多次记录</div>
                                        <div className="text-xs font-medium opacity-80 leading-relaxed">适合喝水、控制脾气等多发情况，可累计奖惩。</div>
                                    </button>
                                </div>
                                {planForm.habitType === 'multiple' && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
                                        <label className="block text-xs font-bold text-slate-600 mb-2">每日最高允许记录次数 <span className="text-slate-400 font-normal">(防过度打卡)</span></label>
                                        <input type="number" min="1" max="99" value={planForm.periodMaxPerDay || 3} onChange={e => setPlanForm({ ...planForm, periodMaxPerDay: Math.max(1, parseInt(e.target.value) || 1) })} className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-emerald-500 font-bold bg-slate-50 text-emerald-700" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reward/Points Settings */}
                        <div className={`p-6 rounded-3xl border shadow-sm ${planType === 'study' ? 'bg-yellow-50 border-yellow-200' : 'bg-indigo-50 border-indigo-200'}`}>
                            <label className={`block text-sm font-black mb-3 ${planType === 'study' ? 'text-yellow-800' : 'text-indigo-800'}`}>
                                <Icons.Star size={18} className="inline mr-1 mb-1" />
                                {planType === 'study' ? '金币奖励设定' : '经验值奖惩设定'}
                            </label>

                            {planType === 'study' ? (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="bg-white rounded-2xl border border-yellow-200 p-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-yellow-50 transition-colors" onClick={() => setPlanForm({ ...planForm, pointRule: planForm.pointRule === 'custom' ? 'default' : 'custom' })}>
                                        <div>
                                            <div className="font-black text-slate-800">自定义金币奖励</div>
                                            <div className="text-xs text-slate-500 mt-0.5">关闭则使用系统规则自动计算奖励</div>
                                        </div>
                                        <div className={`w-14 h-8 rounded-full p-1 transition-colors ${planForm.pointRule === 'custom' ? 'bg-yellow-500' : 'bg-slate-300'}`}>
                                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${planForm.pointRule === 'custom' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                    </div>

                                    {planForm.pointRule === 'custom' && (
                                        <div className="relative animate-fade-in mt-4">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-yellow-500 font-black text-xl">⭐</div>
                                            <input type="number" value={planForm.reward} onChange={e => setPlanForm({ ...planForm, reward: e.target.value })} placeholder="输入完成可获得的金币数" className="w-full bg-white border-2 border-yellow-200 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-yellow-500 font-black text-2xl text-yellow-700 shadow-inner" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500 font-black text-xl">EXP</div>
                                        <input type="number" value={planForm.reward} onChange={e => setPlanForm({ ...planForm, reward: e.target.value })} placeholder="输入经验值 (可填负数表示扣除)" className="w-full bg-white border-2 border-indigo-200 rounded-2xl py-5 pl-16 pr-6 outline-none focus:border-indigo-500 font-black text-2xl text-indigo-700 shadow-inner placeholder:text-base placeholder:font-medium" />
                                    </div>
                                    <div className="text-xs text-indigo-600/70 font-bold px-2">填写正数表示奖励经验，填写负数 (如 -10) 表示违反习惯的惩罚。</div>
                                </div>
                            )}
                        </div>

                        {/* Attachments */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <label className="block text-sm font-black text-slate-800 mb-3"><Icons.Paperclip size={16} className="inline mr-1 text-slate-500" /> 参考附件 (可选)</label>
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer">
                                <Icons.Upload size={28} className="mb-2 text-slate-300" />
                                <div className="font-bold text-slate-600 text-sm">点击上传参考图片/文档</div>
                            </div>
                        </div>

                    </div>
                    {/* Footer Actions */}
                    <div className="p-6 md:p-8 border-t border-slate-100 flex gap-4 bg-white sticky bottom-0 border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                        <button onClick={() => { setShowAddPlanModal(false); setEditingTask(null); }} className="flex-1 py-4 text-slate-600 font-black bg-white border-2 border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all">取消</button>
                        <button onClick={handleSavePlan} className="flex-[2] flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02] transition-all">
                            <Icons.Save size={20} /> {editingTask ? '保存修改' : '保存计划'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // === 视图页面组件 ===
    const renderProfileSelection = () => (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 animate-fade-in relative">
            <div className="absolute top-8 left-8 flex items-center gap-2 text-white/50">
                <Icons.Award size={28} /> <span className="font-black text-xl tracking-widest">MiniLife</span>
            </div>
            <h1 className="text-white text-3xl font-black mb-12">是谁在使用呢？</h1>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 max-w-3xl">
                {kids.map(k => (
                    <div key={k.id} onClick={() => { setActiveKidId(k.id); setAppState('kid_app'); setKidTab('study'); }} className="group cursor-pointer flex flex-col items-center">
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-6xl shadow-xl group-hover:scale-105 group-hover:ring-4 ring-white/50 transition-all">
                            {k.avatar}
                        </div>
                        <span className="text-slate-300 mt-4 text-xl font-bold group-hover:text-white transition-colors">{k.name}</span>
                    </div>
                ))}
            </div>
            <button onClick={() => parentSettings.pinEnabled ? setAppState('parent_pin') : setAppState('parent_app')} className="absolute bottom-10 flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 px-6 py-3 rounded-full font-bold">
                <Icons.Settings size={18} /> 家长管理入口
            </button>
        </div>
    );

    const renderParentPinScreen = () => (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 animate-fade-in">
            <button onClick={() => { setAppState('profiles'); setPinInput(''); }} className="absolute top-8 left-8 text-slate-400 flex items-center gap-2 hover:text-white"><Icons.ChevronLeft size={20} /> 返回角色选择</button>
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-6"><Icons.Lock size={32} /></div>
            <h2 className="text-white text-2xl font-black mb-8">输入家长 PIN 码</h2>
            <div className="flex gap-4 mb-12">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={`w-5 h-5 rounded-full ${i < pinInput.length ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-[280px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <button key={n} onClick={() => handlePinClick(n)} className="w-20 h-20 bg-slate-800 rounded-full text-white text-3xl font-bold hover:bg-slate-700 transition-colors flex items-center justify-center">{n}</button>
                ))}
                <div className="w-20 h-20"></div>
                <button onClick={() => handlePinClick(0)} className="w-20 h-20 bg-slate-800 rounded-full text-white text-3xl font-bold hover:bg-slate-700 transition-colors flex items-center justify-center">0</button>
                <button onClick={() => setPinInput(pinInput.slice(0, -1))} className="w-20 h-20 text-slate-400 flex items-center justify-center hover:text-white transition-colors"><Icons.X size={28} /></button>
            </div>
        </div>
    );
    const renderStudyTab = () => {
        let myTasks = tasks.filter(t => (t.kidId === activeKidId || t.kidId === 'all') && t.type === 'study' && isTaskDueOnDate(t, selectedDate));

        if (Array.isArray(taskFilter) && taskFilter.length > 0) {
            myTasks = myTasks.filter(t => taskFilter.includes(t.category));
        }

        const getDailyStatus = (t) => getTaskStatusOnDate(t, selectedDate, activeKidId);

        if (taskStatusFilter === 'completed') {
            myTasks = myTasks.filter(t => getDailyStatus(t) === 'completed');
        } else if (taskStatusFilter === 'incomplete') {
            myTasks = myTasks.filter(t => getDailyStatus(t) !== 'completed');
        }

        const sortedTasks = [...myTasks];
        if (taskSort === 'reward_desc') {
            sortedTasks.sort((a, b) => b.reward - a.reward);
        } else if (taskSort === 'reward_asc') {
            sortedTasks.sort((a, b) => a.reward - b.reward);
        }
        myTasks = sortedTasks;

        return (
            <div className="animate-fade-in">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-8 mx-4">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="flex items-center gap-2 text-indigo-600 font-black text-lg">
                            <Icons.Calendar size={20} />
                            {getWeekNumber(currentViewDate)[0]}年{currentViewDate.getMonth() + 1}月第{getWeekNumber(currentViewDate)[1]}周
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => { const d = new Date(currentViewDate); d.setDate(d.getDate() - 7); setCurrentViewDate(d); }}
                                className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors bg-indigo-50/50"
                            >
                                <Icons.ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => { setCurrentViewDate(new Date()); setSelectedDate(formatDate(new Date())); }}
                                className="bg-yellow-400 text-yellow-900 px-5 py-2 rounded-full font-black text-sm hover:bg-yellow-500 transition-colors shadow-sm"
                            >
                                今天
                            </button>
                            <button
                                onClick={() => { const d = new Date(currentViewDate); d.setDate(d.getDate() + 7); setCurrentViewDate(d); }}
                                className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors bg-indigo-50/50"
                            >
                                <Icons.ChevronRight size={20} />
                            </button>
                            <button onClick={() => setShowCalendarModal(true)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors ml-2 bg-slate-50">
                                <Icons.Calendar size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 pt-2 pb-2">
                        {getDisplayDateArray(currentViewDate).map((day, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(day.dateStr)}
                                className={`flex flex-col items-center py-4 rounded-2xl transition-all
                                    ${selectedDate === day.dateStr ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 -translate-y-1' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}
                                `}
                            >
                                <span className={`text-xs font-bold mb-2 ${selectedDate === day.dateStr ? 'text-indigo-200' : 'text-slate-400'}`}>{day.d}</span>
                                <span className="text-xl font-black">{day.displayDate.split('/')[1]}</span>
                                <div className={`w-1.5 h-1.5 rounded-full mt-2 ${selectedDate === day.dateStr ? 'bg-white' : (day.dateStr === formatDate(new Date()) ? 'bg-orange-500' : 'bg-transparent')}`}></div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4 px-2">
                    <div className="text-xl font-black text-slate-800 border-l-4 border-green-500 pl-3">今日任务</div>
                    <div className="hidden sm:flex items-center gap-4 text-slate-500 text-sm font-bold relative z-20">
                        {/* 科目多选下拉 */}
                        <div className="relative">
                            <button
                                onClick={() => { setShowFilterDropdown(!showFilterDropdown); setShowStatusDropdown(false); }}
                                className={`flex items-center gap-1 hover:text-indigo-600 transition-colors ${Array.isArray(taskFilter) && taskFilter.length > 0 ? 'text-indigo-600' : ''}`}
                            >
                                {(Array.isArray(taskFilter) ? taskFilter.length : 0) === 0 ? '全部科目' : `已选 ${taskFilter.length} 科`} <Icons.ChevronDown size={14} className={`transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showFilterDropdown && (
                                <div className="absolute top-full mt-2 w-40 bg-white border border-slate-100 shadow-xl rounded-2xl py-2 z-50 animate-fade-in right-0 sm:left-0 sm:right-auto">
                                    {allCategories.map(cat => (
                                        <label key={cat} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer w-full transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                                                checked={Array.isArray(taskFilter) && taskFilter.includes(cat)}
                                                onChange={(e) => {
                                                    const currentFilter = Array.isArray(taskFilter) ? taskFilter : [];
                                                    if (e.target.checked) setTaskFilter([...currentFilter, cat]);
                                                    else setTaskFilter(currentFilter.filter(c => c !== cat));
                                                }}
                                            />
                                            <span className="text-slate-700 font-bold">{cat}</span>
                                        </label>
                                    ))}
                                    <div className="border-t border-slate-100 mt-1 pt-1">
                                        <button
                                            onClick={() => setTaskFilter([])}
                                            className="w-full text-center py-2 text-xs text-slate-400 hover:text-indigo-600 font-bold transition-colors"
                                        >
                                            清除选择
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 状态筛选下拉 */}
                        <div className="relative">
                            <button
                                onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowFilterDropdown(false); }}
                                className={`flex items-center gap-1 hover:text-indigo-600 transition-colors ${taskStatusFilter !== 'all' ? 'text-indigo-600' : ''}`}
                            >
                                {taskStatusFilter === 'all' ? '全部状态' : (taskStatusFilter === 'completed' ? '已完成' : '未完成')} <Icons.ChevronDown size={14} className={`transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showStatusDropdown && (
                                <div className="absolute top-full mt-2 w-32 bg-white border border-slate-100 shadow-xl rounded-2xl py-2 z-50 animate-fade-in right-0 sm:left-0 sm:right-auto">
                                    <button onClick={() => { setTaskStatusFilter('all'); setShowStatusDropdown(false); }} className={`w-full text-left px-4 py-2 hover:bg-slate-50 font-bold transition-colors ${taskStatusFilter === 'all' ? 'text-indigo-600' : 'text-slate-700'}`}>全部状态</button>
                                    <button onClick={() => { setTaskStatusFilter('incomplete'); setShowStatusDropdown(false); }} className={`w-full text-left px-4 py-2 hover:bg-slate-50 font-bold transition-colors ${taskStatusFilter === 'incomplete' ? 'text-indigo-600' : 'text-slate-700'}`}>未完成</button>
                                    <button onClick={() => { setTaskStatusFilter('completed'); setShowStatusDropdown(false); }} className={`w-full text-left px-4 py-2 hover:bg-slate-50 font-bold transition-colors ${taskStatusFilter === 'completed' ? 'text-indigo-600' : 'text-slate-700'}`}>已完成</button>
                                </div>
                            )}
                        </div>

                        <div className="w-px h-4 bg-slate-200"></div>

                        <select value={taskSort} onChange={e => setTaskSort(e.target.value)} className="bg-transparent outline-none cursor-pointer hover:text-indigo-600 appearance-none text-center">
                            <option value="default">默认排序 ▼</option>
                            <option value="reward_desc">奖励从高到低</option>
                            <option value="reward_asc">奖励从低到高</option>
                        </select>
                        <button onClick={() => setTaskLayout(l => l === 'list' ? 'grid' : 'list')} className="flex items-center gap-1 hover:text-indigo-600"><Icons.LayoutGrid size={14} /> 布局</button>
                        <button className="flex items-center gap-1 hover:text-indigo-600"><Icons.Settings size={14} /> 管理</button>
                    </div>
                </div>

                <div className={taskLayout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                    {myTasks.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 font-bold bg-white rounded-2xl border border-slate-100 shadow-sm md:col-span-2">这一天没有安排任务哦~</div>
                    ) : myTasks.map(t => (
                        <div key={t.id} className="flex bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow h-28 group relative">
                            <div onClick={() => { setPreviewTask(t); setShowPreviewModal(true); }} className={`w-20 bg-gradient-to-b ${getCategoryGradient(t.category || '计划')} flex flex-col items-center justify-center text-white p-2 cursor-pointer group-hover:brightness-110 transition-all`}>
                                {renderIcon(t.iconName, 28)}
                                <span className={`text-[10px] font-bold mt-2 ${getCategoryColor(t.category || '计划')}`}>{t.category || '计划'}</span>
                            </div>
                            <div className="flex-1 p-4 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-black text-slate-800 text-lg">{t.title}</span>
                                    <span className="bg-blue-50 text-blue-500 text-[10px] font-black px-2 py-0.5 rounded-full">{t.frequency || '每天'}</span>
                                </div>
                                <div className="text-slate-400 text-xs flex items-center gap-1 font-bold mb-2">
                                    <Icons.Clock size={12} /> {t.timeStr || '--:--'}
                                </div>
                                <div className="text-yellow-500 text-sm font-black flex items-center gap-1">
                                    {t.reward} <Icons.Star size={14} fill="currentColor" />
                                </div>
                            </div>
                            <div className="w-36 p-4 flex flex-col justify-center gap-2 border-l border-slate-50 bg-slate-50/50">
                                <button onClick={() => { setPreviewTask(t); setShowPreviewModal(true); }} className="absolute inset-0 opacity-0 cursor-pointer" style={{ width: 'calc(100% - 9rem)' }} aria-label="查看任务详情"></button>
                                {getDailyStatus(t) === 'todo' && (
                                    <>
                                        <button onClick={() => openQuickComplete(t)} className="w-full bg-blue-600 text-white rounded-full py-1.5 text-xs font-bold shadow-md hover:bg-blue-700 flex items-center justify-center gap-1">
                                            <Icons.Check size={14} /> 快速完成
                                        </button>
                                        <button onClick={() => handleStartTask(t.id)} className="w-full bg-green-50 text-green-600 border border-green-200 rounded-full py-1.5 text-xs font-bold hover:bg-green-100 flex items-center justify-center gap-1">
                                            <Icons.Play size={14} /> 开始计时
                                        </button>
                                    </>
                                )}
                                {getDailyStatus(t) === 'in_progress' && (
                                    <button onClick={() => handleAttemptSubmit(t)} className="w-full bg-indigo-100 text-indigo-700 rounded-full py-2 text-xs font-bold flex items-center justify-center gap-1">
                                        <Icons.Check size={14} /> 第一步：确认达标
                                    </button>
                                )}
                                {getDailyStatus(t) === 'pending_approval' && (
                                    <span className="w-full text-center text-xs font-bold text-orange-500 bg-orange-50 rounded-full py-2 flex items-center justify-center gap-1">
                                        <Icons.Clock size={14} /> 待审核
                                    </span>
                                )}
                                {getDailyStatus(t) === 'completed' && (
                                    <span className="w-full text-center text-xs font-bold text-emerald-500 bg-emerald-50 rounded-full py-2 flex items-center justify-center gap-1">
                                        <Icons.CheckCircle size={14} /> 已完成
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderKidApp = () => {
        const activeKid = kids.find(k => k.id === activeKidId);
        if (!activeKid) return null;
        const myTasks = tasks.filter(t => t.kidId === activeKidId || t.kidId === 'all');
        const myOrders = orders.filter(o => o.kidId === activeKidId);
        const nextLevelExp = getLevelReq(activeKid.level);

        return (
            <div className="min-h-screen bg-[#f4f7f9] font-sans pb-24 text-left animate-fade-in">
                <div className="bg-white border-b border-slate-100 px-4 md:px-8 py-3 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white"><Icons.Award size={18} /></div>
                        <span className="font-black text-xl text-slate-800 tracking-tight">MiniLife</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* 孩子切换器 */}
                        <div className="relative">
                            <button
                                onClick={() => setShowKidSwitcher(!showKidSwitcher)}
                                className="flex items-center gap-2 bg-slate-50 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
                            >
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-lg">{activeKid.avatar}</div>
                                <span className="text-sm font-bold text-slate-700">{activeKid.name}</span>
                                <Icons.ChevronRight size={14} className={`text-slate-400 transition-transform ${showKidSwitcher ? 'rotate-90' : ''}`} />
                            </button>
                            {showKidSwitcher && (
                                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 min-w-[160px] z-50 animate-fade-in">
                                    {kids.map(k => (
                                        <button
                                            key={k.id}
                                            onClick={() => switchKid(k.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left ${k.id === activeKidId ? 'bg-indigo-50' : ''
                                                }`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xl">{k.avatar}</div>
                                            <span className={`font-bold text-sm ${k.id === activeKidId ? 'text-indigo-600' : 'text-slate-700'}`}>{k.name}</span>
                                            {k.id === activeKidId && <Icons.Check size={14} className="text-indigo-500 ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 家长入口 */}
                        <button
                            onClick={openParentFromKid}
                            className="flex items-center gap-1.5 text-sm font-bold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-200"
                        >
                            <Icons.Lock size={14} /> 家长
                        </button>
                    </div>
                </div>

                {/* 内联 PIN 码弹窗 */}
                {showParentPinModal && (
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-slate-800/90 w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl border border-white/10">
                            <button onClick={() => { setShowParentPinModal(false); setPinInput(''); }} className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                                <Icons.X size={20} />
                            </button>
                            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center text-slate-400 mb-4 mx-auto">
                                <Icons.Lock size={28} />
                            </div>
                            <h2 className="text-white text-xl font-black mb-6">输入家长 PIN 码</h2>
                            <div className="flex gap-3 justify-center mb-8">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className={`w-4 h-4 rounded-full transition-all ${i < pinInput.length ? 'bg-indigo-500 scale-110' : 'bg-slate-600'}`}></div>
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                    <button key={n} onClick={() => handlePinClick(n)} className="w-16 h-16 bg-slate-700 rounded-2xl text-white text-2xl font-bold hover:bg-slate-600 transition-colors flex items-center justify-center">{n}</button>
                                ))}
                                <div className="w-16 h-16"></div>
                                <button onClick={() => handlePinClick(0)} className="w-16 h-16 bg-slate-700 rounded-2xl text-white text-2xl font-bold hover:bg-slate-600 transition-colors flex items-center justify-center">0</button>
                                <button onClick={() => setPinInput(pinInput.slice(0, -1))} className="w-16 h-16 text-slate-400 flex items-center justify-center hover:text-white transition-colors rounded-2xl hover:bg-slate-700">
                                    <Icons.X size={22} />
                                </button>
                            </div>
                            <button onClick={() => { setShowParentPinModal(false); setPinInput(''); }} className="mt-6 text-slate-500 hover:text-slate-300 text-sm font-bold transition-colors">取消</button>
                        </div>
                    </div>
                )}

                <div className="bg-white border-b border-slate-100 p-5 md:p-8">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-4xl shadow-inner border border-white">{activeKid.avatar}</div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-800">早上好，{activeKid.name}！</h1>
                                <p className="text-slate-500 text-sm mt-0.5">今天也要元气满满地学习和养成好习惯哦。</p>
                            </div>
                        </div>

                        <button onClick={() => setShowLevelRules(true)} className="w-full md:w-auto bg-slate-50 px-5 py-3.5 rounded-2xl border border-slate-100 flex items-center gap-3 hover:bg-indigo-50 transition-colors text-left shadow-sm">
                            <div className="bg-yellow-100 p-2.5 rounded-xl text-yellow-500"><Icons.Star size={20} fill="currentColor" /></div>
                            <div className="flex-1 min-w-[150px]">
                                <div className="text-xs text-slate-500 font-bold flex items-center gap-1 mb-1.5">探索等级 Lv.{activeKid.level} <Icons.Info size={12} /></div>
                                <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-yellow-400" style={{ width: `${Math.max(0, (activeKid.exp / nextLevelExp) * 100)}%` }}></div></div>
                                <span className="text-xs font-black text-slate-700 w-12 text-right">{activeKid.exp}/{nextLevelExp}</span>
                            </div>
                        </button>
                    </div>

                    <div className="max-w-5xl mx-auto mt-6 flex overflow-x-auto hide-scrollbar gap-3 pb-1">
                        {[
                            { id: 'study', icon: <Icons.BookOpen size={18} />, label: "赚家庭币" },
                            { id: 'habit', icon: <Icons.ShieldCheck size={18} />, label: "习惯养成" },
                            { id: 'wealth', icon: <Icons.Wallet size={18} />, label: "财富中心" },
                            { id: 'shop', icon: <Icons.ShoppingBag size={18} />, label: "家庭超市" }
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setKidTab(tab.id)} className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm whitespace-nowrap transition-all shadow-sm ${kidTab === tab.id ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}>
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="max-w-5xl mx-auto p-4 md:p-8">
                    {kidTab === 'study' && renderStudyTab()}

                    {kidTab === 'habit' && (
                        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 animate-fade-in">
                            <div className="mb-6 border-b border-slate-100 pb-4">
                                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.ShieldCheck className="text-yellow-500" /> 习惯养成区</h2>
                                <p className="text-slate-500 text-sm mt-1">好习惯加经验助你升级，坏习惯会扣经验导致降级哦！</p>
                            </div>
                            <div className="space-y-4">
                                {myTasks.filter(t => t.type === 'habit').map(t => (
                                    <div key={t.id} className={`p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${t.reward < 0 ? 'hover:border-red-200' : 'hover:border-emerald-200'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-sm border border-slate-100">{t.iconEmoji || renderIcon(t.iconName, 24)}</div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-lg">{t.title}</div>
                                                <div className={`text-xs font-black flex items-center gap-1 mt-1 w-fit px-2 py-0.5 rounded ${t.reward < 0 ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}>
                                                    {t.reward > 0 ? `+${t.reward} 经验值` : `扣 ${Math.abs(t.reward)} 经验值`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            {t.reward < 0 ? (
                                                <span className="text-xs text-slate-400 font-bold bg-slate-100 px-3 py-2 rounded-xl inline-block">⚠️ 触犯会被家长直接扣分</span>
                                            ) : (
                                                <>
                                                    {(() => {
                                                        const entry = t.kidId === 'all' ? t.history?.[selectedDate]?.[activeKidId] : t.history?.[selectedDate];
                                                        const count = entry?.count || (entry?.status === 'completed' ? 1 : 0);
                                                        const isDailyOnce = t.habitType === 'daily_once';
                                                        const isMaxedOut = t.habitType === 'multiple' && t.periodMaxPerDay && count >= t.periodMaxPerDay;

                                                        if ((isDailyOnce && count >= 1) || isMaxedOut) {
                                                            return <span className="text-sm font-bold text-slate-400 bg-slate-100 px-4 py-2.5 rounded-xl flex items-center gap-1 justify-center overflow-hidden"><Icons.CheckCircle size={16} /> 已记录 {count > 1 ? `(${count})` : ''}</span>;
                                                        } else {
                                                            return (
                                                                <button onClick={() => handleAttemptSubmit(t)} className="w-full md:w-auto px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 flex items-center gap-2 justify-center transition-all">
                                                                    去打卡 {count > 0 && <span className="bg-emerald-100 text-emerald-600 font-black text-[11px] px-2 py-0.5 rounded-full">{count}次</span>}
                                                                </button>
                                                            );
                                                        }
                                                    })()}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Habit Transaction History */}
                            <div className="bg-slate-50 rounded-2xl border border-slate-100 mt-8 overflow-hidden">
                                <div className="border-b border-slate-100 p-5">
                                    <h3 className="font-black text-slate-700 text-sm flex items-center gap-2"><Icons.List size={16} className="text-slate-400" /> 近期明细记录</h3>
                                </div>
                                <div className="p-5">
                                    {transactions.filter(t => t.kidId === activeKidId && t.category === 'habit').length === 0 && <div className="text-center text-slate-400 text-xs py-4">暂无打卡记录</div>}
                                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                        {transactions.filter(t => t.kidId === activeKidId && t.category === 'habit').slice(0, 30).map(item => (
                                            <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border ${item.type === 'income' ? 'bg-emerald-50/50 border-emerald-100/50' : 'bg-red-50/50 border-red-100/50'}`}>
                                                <div>
                                                    <div className="font-bold text-slate-700 text-sm">{item.title}</div>
                                                    <div className="text-xs text-slate-400 mt-0.5">{new Date(item.date).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                                <div className={`font-black tracking-wide ${item.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>{item.type === 'income' ? '+' : '-'}{item.amount} EXP</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {kidTab === 'wealth' && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 ml-2 mb-4">我的财富分配</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                                        <Icons.Wallet size={120} className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform" />
                                        <div className="text-blue-100 font-bold mb-2">日常消费钱包</div>
                                        <div className="text-5xl font-black mb-6">{activeKid.balances.spend} <span className="text-lg">家庭币</span></div>
                                        <button onClick={() => setKidTab('shop')} className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md py-3 rounded-xl text-sm font-black transition-all">去超市花钱</button>
                                    </div>
                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group flex flex-col justify-between">
                                        <div>
                                            <Icons.Heart size={80} className="absolute -right-4 -bottom-4 opacity-5 text-rose-500 group-hover:scale-110 transition-transform" />
                                            <div className="text-rose-600 font-bold mb-1">爱心公益基金</div>
                                            <div className="text-3xl font-black text-rose-800 mb-2">{activeKid.balances.give} 家庭币</div>
                                            <p className="text-xs text-slate-400 leading-relaxed">用来给家人买礼物或捐献爱心。</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-black text-slate-800 ml-2 mb-4 mt-6">时光金库 (定存生息)</h2>
                                <div className="bg-slate-900 rounded-[2rem] p-6 md:p-8 text-white relative shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 overflow-hidden">
                                    <div className="absolute right-0 bottom-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20"></div>
                                    <div className="z-10 w-full md:w-auto">
                                        <div className="flex items-center gap-2 mb-2"><Icons.Lock className="text-emerald-400" size={18} /> <span className="font-bold text-slate-300">金库内锁定的总储蓄</span></div>
                                        <div className="text-4xl font-black text-white">{activeKid.vault.lockedAmount} <span className="text-lg text-slate-400 font-bold">家庭币</span></div>
                                        <div className="mt-4 bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-black relative group cursor-help">
                                                Lv.{activeKid.level}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1 bg-slate-800 text-xs rounded text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">你的等级决定了你的收益率！</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-400 font-bold mb-1">专属年化收益率 <span className="text-emerald-400">{5 + activeKid.level}%</span></div>
                                                <div className="text-xl font-black text-yellow-400">+{Math.floor(activeKid.vault.lockedAmount * ((5 + activeKid.level) / 100))} 家庭币 <span className="text-xs text-slate-500 font-bold font-normal">预期利息</span></div>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowTransferModal(true)} className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 px-8 py-4 rounded-2xl font-black text-lg transition-transform hover:scale-105 shadow-lg shadow-emerald-900 z-10 flex items-center justify-center gap-2">
                                        <Icons.RefreshCw size={20} /> 资金手动划转
                                    </button>
                                </div>
                            </div>

                            {/* Kid Transaction History */}
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="border-b border-slate-100 p-6 bg-slate-50/50">
                                    <h3 className="font-black text-slate-800 text-lg flex items-center gap-2"><Icons.List size={18} className="text-slate-500" /> 近期交易明细</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    {/* Income List */}
                                    <div className="p-6 md:border-r border-slate-100">
                                        <h4 className="font-black text-slate-700 mb-4 flex items-center gap-2 text-sm"><Icons.TrendingUp size={16} className="text-emerald-500" /> 赚取金币</h4>
                                        {transactions.filter(t => t.kidId === activeKidId && t.type === 'income' && t.category !== 'habit').length === 0 && <div className="text-center text-slate-400 text-sm py-8">暂无收入记录</div>}
                                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                                            {transactions.filter(t => t.kidId === activeKidId && t.type === 'income' && t.category !== 'habit').slice(0, 20).map(item => (
                                                <div key={item.id} className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl">
                                                    <div>
                                                        <div className="font-bold text-slate-700 text-sm">{item.title}</div>
                                                        <div className="text-xs text-slate-400 mt-0.5">{new Date(item.date).toLocaleDateString()}</div>
                                                    </div>
                                                    <div className="font-black text-emerald-600">+{item.amount} 家庭币</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Expense List */}
                                    <div className="p-6 border-t md:border-t-0 border-slate-100">
                                        <h4 className="font-black text-slate-700 mb-4 flex items-center gap-2 text-sm"><Icons.ShoppingBag size={16} className="text-red-500" /> 超市消费</h4>
                                        {transactions.filter(t => t.kidId === activeKidId && t.type === 'expense' && t.category !== 'habit').length === 0 && <div className="text-center text-slate-400 text-sm py-8">暂无消费记录</div>}
                                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                                            {transactions.filter(t => t.kidId === activeKidId && t.type === 'expense' && t.category !== 'habit').slice(0, 20).map(item => (
                                                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl">
                                                    <div>
                                                        <div className="font-bold text-slate-700 text-sm">{item.title}</div>
                                                        <div className="text-xs text-slate-400 mt-0.5">{new Date(item.date).toLocaleDateString()}</div>
                                                    </div>
                                                    <div className="font-black text-red-500">-{item.amount} 家庭币</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {kidTab === 'shop' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-100 max-w-sm mx-auto">
                                <button onClick={() => setKidShopTab('browse')} className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${kidShopTab === 'browse' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>官方货架区</button>
                                <div className="w-px h-6 bg-slate-200 mx-1 self-center"></div>
                                <button onClick={() => setKidShopTab('orders')} className={`flex-1 py-2.5 rounded-xl font-black text-sm relative transition-all ${kidShopTab === 'orders' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                                    我的订单
                                    {myOrders.filter(o => o.status === 'shipping').length > 0 && <span className="absolute top-2 right-8 w-2 h-2 bg-red-500 rounded-full"></span>}
                                </button>
                            </div>

                            {kidShopTab === 'browse' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {inventory.map(item => (
                                        <div key={item.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all p-6 flex flex-col group">
                                            <div className="h-32 bg-slate-50 rounded-2xl flex items-center justify-center text-6xl mb-5">{item.iconEmoji}</div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-black text-slate-800 text-lg line-clamp-1">{item.name}</h3>
                                            </div>
                                            <p className="text-slate-400 text-xs mb-6 flex-1 line-clamp-2">{item.desc}</p>
                                            <div className="flex justify-between items-end mt-auto border-t border-slate-50 pt-5">
                                                <div>
                                                    <div className="text-[10px] text-slate-400 font-bold mb-1">{item.type === 'single' ? '单次兑换' : item.type === 'multiple' ? '多次兑换' : '永久有效'}</div>
                                                    <span className="text-2xl font-black text-indigo-600">{item.price} <span className="text-sm">家庭币</span></span>
                                                </div>
                                                <button onClick={() => buyItem(item)} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-black shadow-md">购买</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myOrders.length === 0 ? (
                                        <div className="text-center py-20 bg-white rounded-[2rem] shadow-sm border border-slate-100">
                                            <Icons.ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
                                            <p className="text-slate-400 font-bold">还没有买过东西，快去货架上看看吧~</p>
                                        </div>
                                    ) : myOrders.map(o => (
                                        <div key={o.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm hover:border-indigo-100 transition-colors">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner"><Icons.Package size={32} /></div>
                                                <div>
                                                    <div className="font-black text-slate-800 text-lg">{o.itemName}</div>
                                                    <div className="text-xs text-slate-400 font-mono mt-1 bg-slate-50 px-2 py-1 rounded inline-block">单号: {o.id} | {o.date}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 self-end md:self-auto">
                                                <span className="font-bold text-slate-500 mr-2">实付 <span className="text-indigo-600 font-black text-lg">{o.price}</span> 家庭币</span>
                                                {o.status === 'shipping' && <button onClick={() => confirmReceipt(o.id)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-md shadow-indigo-200 hover:bg-indigo-700 animate-pulse">确认收货</button>}
                                                {o.status === 'received' && <button onClick={() => setSelectedOrder(o)} className="bg-white border-2 border-indigo-600 text-indigo-600 px-6 py-2 rounded-xl text-sm font-black hover:bg-indigo-50">马上评价</button>}
                                                {o.status === 'completed' && <span className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-1 border border-slate-100">已评价 <Icons.Star size={14} className="text-yellow-400" fill="currentColor" />{o.rating}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };
    const renderParentApp = () => (
        <div className="min-h-screen bg-[#f4f7f9] font-sans pb-24 text-left animate-fade-in">
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white"><Icons.Award size={24} /></div>
                    <span className="font-black text-xl text-white tracking-tight">MiniLife 家庭版</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setAppState('profiles')} className="text-sm font-bold text-slate-400 bg-slate-800 px-4 py-2 rounded-full hover:text-white transition-colors flex items-center gap-1">
                        返回选人
                    </button>
                    <button onClick={handleLogout} className="text-sm font-bold text-rose-400 bg-slate-800 px-4 py-2 rounded-full hover:bg-rose-500 hover:text-white border border-slate-700/50 hover:border-transparent transition-all flex items-center gap-1 shadow-sm">
                        <Icons.LogOut size={16} /> 注销登录
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-4 md:p-8">
                <div className="flex gap-4 border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
                    <button onClick={() => setParentTab('tasks')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'tasks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>📋 学习计划</button>
                    <button onClick={() => setParentTab('plans')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'plans' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>🌿 我的成长</button>
                    <button onClick={() => setParentTab('wealth')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'wealth' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>💰 财富中心</button>
                    <button onClick={() => setParentTab('shop_manage')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'shop_manage' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>愿望超市配置</button>
                    <button onClick={() => setParentTab('settings')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'settings' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>家庭与安全设置</button>
                </div>

                {parentTab === 'tasks' && (
                    <div className="animate-fade-in">
                        {/* Week Calendar — same style as Kid Dashboard */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-6">
                            <div className="flex items-center justify-between mb-8 px-2">
                                <div className="flex items-center gap-2 text-indigo-600 font-black text-lg">
                                    <Icons.Calendar size={20} />
                                    {getWeekNumber(currentViewDate)[0]}年{currentViewDate.getMonth() + 1}月第{getWeekNumber(currentViewDate)[1]}周
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => { const d = new Date(currentViewDate); d.setDate(d.getDate() - 7); setCurrentViewDate(d); }} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors bg-indigo-50/50">
                                        <Icons.ChevronLeft size={20} />
                                    </button>
                                    <button onClick={() => { setCurrentViewDate(new Date()); setSelectedDate(formatDate(new Date())); }} className="bg-yellow-400 text-yellow-900 px-5 py-2 rounded-full font-black text-sm hover:bg-yellow-500 transition-colors shadow-sm">
                                        今天
                                    </button>
                                    <button onClick={() => { const d = new Date(currentViewDate); d.setDate(d.getDate() + 7); setCurrentViewDate(d); }} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors bg-indigo-50/50">
                                        <Icons.ChevronRight size={20} />
                                    </button>
                                    <button onClick={() => setShowCalendarModal(true)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors ml-2 bg-slate-50">
                                        <Icons.Calendar size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-2 pt-2 pb-2">
                                {getDisplayDateArray(currentViewDate).map((day, i) => (
                                    <button key={i} onClick={() => setSelectedDate(day.dateStr)}
                                        className={`flex flex-col items-center py-4 rounded-2xl transition-all
                                            ${selectedDate === day.dateStr ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 -translate-y-1' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}
                                        `}>
                                        <span className={`text-xs font-bold mb-2 ${selectedDate === day.dateStr ? 'text-indigo-200' : 'text-slate-400'}`}>{day.d}</span>
                                        <span className="text-xl font-black">{day.displayDate.split('/')[1]}</span>
                                        <div className={`w-1.5 h-1.5 rounded-full mt-2 ${selectedDate === day.dateStr ? 'bg-white' : (day.dateStr === formatDate(new Date()) ? 'bg-orange-500' : 'bg-transparent')}`}></div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Bar: Kid Filter + New Plan */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="text-xl font-black text-slate-800 border-l-4 border-indigo-500 pl-3">当日任务总览</div>
                                <div className="flex items-center bg-white rounded-full border border-slate-200 shadow-sm overflow-hidden">
                                    <button onClick={() => setParentKidFilter('all')} className={`px-4 py-2 text-xs font-bold transition-all ${parentKidFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>全部</button>
                                    {kids.map(k => (
                                        <button key={k.id} onClick={() => setParentKidFilter(k.id)} className={`px-4 py-2 text-xs font-bold transition-all ${parentKidFilter === k.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                                            {k.avatar} {k.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => {
                                setEditingTask(null);
                                setPlanType('study');
                                setPlanForm({ targetKid: parentKidFilter === 'all' ? 'all' : parentKidFilter, category: '技能', title: '', desc: '', startDate: new Date().toISOString().split('T')[0], endDate: '', repeatType: 'today', weeklyDays: [1, 2, 3, 4, 5], ebbStrength: 'normal', periodDaysType: 'any', periodCustomDays: [1, 2, 3, 4, 5], periodTargetCount: 1, periodMaxPerDay: 1, timeSetting: 'none', startTime: '', endTime: '', durationPreset: 25, pointRule: 'default', reward: '', iconEmoji: '📚', habitColor: 'from-blue-400 to-blue-500', habitType: 'daily_once', attachments: [] });
                                setShowAddPlanModal(true);
                            }} className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:scale-105">
                                <Icons.Plus size={18} /> 新建计划
                            </button>
                        </div>

                        {/* Pending Approvals Banner */}
                        {(() => {
                            const pendingApprovals = tasks.flatMap(t => {
                                if (t.type !== 'study') return [];
                                const historyObj = typeof t.history === 'string' ? JSON.parse(t.history || '{}') : (t.history || {});

                                const approvals = [];
                                Object.entries(historyObj).forEach(([date, hr]) => {
                                    if (t.kidId === 'all') {
                                        // 2D unified logic
                                        Object.entries(hr || {}).forEach(([kId, kResult]) => {
                                            if (kId !== 'status' && kResult?.status === 'pending_approval') {
                                                approvals.push({ task: t, date, record: kResult, actualKidId: kId });
                                            }
                                        });
                                    } else {
                                        // Legacy 1D logic
                                        if (hr?.status === 'pending_approval') {
                                            approvals.push({ task: t, date, record: hr, actualKidId: t.kidId });
                                        }
                                    }
                                });
                                return approvals;
                            });

                            if (pendingApprovals.length === 0) return null;
                            return (
                                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6">
                                    <h3 className="font-black text-orange-700 mb-3 flex items-center gap-2">
                                        <Icons.Bell size={18} /> 待审核验收 <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingApprovals.length}</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {pendingApprovals.map(({ task: t, date, actualKidId }) => {
                                            const kidInfo = kids.find(k => k.id === actualKidId);
                                            return (
                                                <div key={`${t.id}-${date}`} className="flex items-center justify-between bg-white rounded-xl p-4 border border-orange-100 shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-2xl">{t.iconEmoji || '📚'}</div>
                                                        <div>
                                                            <div className="font-black text-slate-800">{t.title}</div>
                                                            <div className="text-xs text-slate-500">{kidInfo?.avatar} {kidInfo?.name} · {date}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-black text-indigo-600 text-sm">{t.reward > 0 ? '+' : ''}{t.reward} 家庭币</span>
                                                        <button onClick={() => handleApproveTask(t, date, actualKidId)} className="px-5 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-transform hover:scale-105">
                                                            ✅ 审批通过
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Task Cards Grid */}
                        {(() => {
                            let parentTasks = tasks.filter(t => t.type === 'study' && isTaskDueOnDate(t, selectedDate));
                            if (parentKidFilter !== 'all') {
                                parentTasks = parentTasks.filter(t => t.kidId === parentKidFilter || t.kidId === 'all');
                            }
                            const getDailyStatus = (t) => getTaskStatusOnDate(t, selectedDate, activeKidId);

                            if (parentTasks.length === 0) {
                                return <div className="text-center py-16 text-slate-400 font-bold bg-white rounded-2xl border border-slate-100 shadow-sm">这一天没有安排学习计划哦~</div>;
                            }

                            return (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {parentTasks.map(t => {
                                        // For Parent view UI display trick: if KidId === 'all', randomly select the first active kid to show avatar or generic '全部孩子'
                                        let displayKidId = t.kidId;
                                        if (t.kidId === 'all') displayKidId = parentKidFilter === 'all' ? 'all' : parentKidFilter;

                                        const kidInfo = displayKidId === 'all' ? { name: '全部孩子', avatar: '👥' } : kids.find(k => k.id === displayKidId);
                                        const status = getTaskStatusOnDate(t, selectedDate, displayKidId === 'all' ? kids[0]?.id : displayKidId);
                                        return (
                                            <div key={t.id} className="flex bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow h-28 group relative">
                                                <div className={`w-20 bg-gradient-to-b ${getCategoryGradient(t.category || '计划')} flex flex-col items-center justify-center text-white p-2`}>
                                                    {renderIcon(t.iconName, 28)}
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${getCategoryColor(t.category || '计划')}`}>{t.category || '计划'}</span>
                                                </div>
                                                <div className="flex-1 p-4 flex flex-col justify-center">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-black text-slate-800 text-lg">{t.title}</span>
                                                        <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded">{kidInfo?.avatar} {kidInfo?.name}</span>
                                                    </div>
                                                    <div className="text-slate-400 text-xs flex items-center gap-1 font-bold mb-1">
                                                        <Icons.Clock size={12} /> {t.timeStr || '--:--'}
                                                        <span className="ml-2 bg-blue-50 text-blue-500 text-[10px] font-black px-2 py-0.5 rounded-full">{t.frequency || '每天'}</span>
                                                    </div>
                                                    <div className="text-yellow-500 text-sm font-black flex items-center gap-1">
                                                        {t.reward} <Icons.Star size={14} fill="currentColor" />
                                                    </div>
                                                </div>
                                                <div className="w-36 p-3 flex flex-col justify-center gap-2 border-l border-slate-50 bg-slate-50/50">
                                                    {status === 'todo' && (
                                                        <>
                                                            <button onClick={() => {
                                                                setEditingTask(t);
                                                                setPlanType(t.type || 'study');
                                                                setPlanForm({
                                                                    targetKid: t.kidId,
                                                                    category: t.category || '技能',
                                                                    title: t.title,
                                                                    desc: t.standards || t.desc || '',
                                                                    startDate: t.startDate || new Date().toISOString().split('T')[0],
                                                                    endDate: t.repeatConfig?.endDate || '',
                                                                    repeatType: t.repeatConfig?.type || (t.frequency === '仅当天' ? 'today' : (t.frequency === '每周一至周五' ? 'weekly_custom' : 'daily')),
                                                                    weeklyDays: t.repeatConfig?.weeklyDays || [1, 2, 3, 4, 5],
                                                                    ebbStrength: t.repeatConfig?.ebbStrength || 'normal',
                                                                    periodDaysType: t.repeatConfig?.periodDaysType || 'any',
                                                                    periodCustomDays: t.repeatConfig?.periodCustomDays || [1, 2, 3, 4, 5],
                                                                    periodTargetCount: t.repeatConfig?.periodTargetCount || 1,
                                                                    periodMaxPerDay: t.repeatConfig?.periodMaxPerDay || 1,
                                                                    timeSetting: t.timeStr && t.timeStr !== '--:--' ? (t.timeStr.includes('-') ? 'range' : 'duration') : 'none',
                                                                    startTime: t.timeStr && t.timeStr.includes('-') ? t.timeStr.split('-')[0] : '',
                                                                    endTime: t.timeStr && t.timeStr.includes('-') ? t.timeStr.split('-')[1] : '',
                                                                    durationPreset: t.timeStr && t.timeStr.includes('分钟') ? parseInt(t.timeStr) : 25,
                                                                    pointRule: (t.pointRule && t.pointRule === 'custom') || (t.type === 'habit') ? 'custom' : 'default',
                                                                    reward: String(t.reward || ''),
                                                                    iconEmoji: t.iconEmoji || '📚',
                                                                    habitColor: t.catColor || 'from-blue-400 to-blue-500',
                                                                    habitType: t.habitType || 'daily_once',
                                                                    attachments: t.attachments || []
                                                                });
                                                                setShowAddPlanModal(true);
                                                            }} className="w-full bg-blue-50 text-blue-600 border border-blue-200 rounded-full py-1.5 text-xs font-bold hover:bg-blue-100 flex items-center justify-center gap-1 transition-colors">
                                                                <Icons.Edit3 size={14} /> 编辑
                                                            </button>
                                                            <button onClick={() => setDeleteConfirmTask(t)} className="w-full bg-red-50 text-red-500 border border-red-200 rounded-full py-1.5 text-xs font-bold hover:bg-red-100 flex items-center justify-center gap-1 transition-colors">
                                                                <Icons.Trash2 size={14} /> 删除
                                                            </button>
                                                        </>
                                                    )}
                                                    {status === 'pending_approval' && (
                                                        <button onClick={() => handleApproveTask(t, selectedDate)} className="w-full bg-emerald-500 text-white rounded-full py-2 text-xs font-bold shadow-md hover:bg-emerald-600 flex items-center justify-center gap-1 transition-all">
                                                            <Icons.CheckCircle size={14} /> 审批通过
                                                        </button>
                                                    )}
                                                    {status === 'in_progress' && (
                                                        <span className="w-full text-center text-xs font-bold text-blue-500 bg-blue-50 rounded-full py-2 flex items-center justify-center gap-1">
                                                            <Icons.Play size={14} /> 进行中
                                                        </span>
                                                    )}
                                                    {status === 'completed' && (
                                                        <span className="w-full text-center text-xs font-bold text-emerald-500 bg-emerald-50 rounded-full py-2 flex items-center justify-center gap-1">
                                                            <Icons.CheckCircle size={14} /> 已完成
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}                    </div>
                )}

                {parentTab === 'plans' && (
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-slate-100 bg-emerald-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="font-black text-slate-800 text-xl">🌿 记录成长管理</h2>
                                <p className="text-sm text-slate-500 mt-1">设置正向行为奖励或惩罚规则，引导孩子长期成长</p>
                            </div>
                            <button onClick={() => {
                                setEditingTask(null);
                                setPlanType('habit');
                                setPlanForm({ targetKid: 'all', category: '技能', title: '', desc: '', startDate: new Date().toISOString().split('T')[0], endDate: '', repeatType: 'today', weeklyDays: [1, 2, 3, 4, 5], ebbStrength: 'normal', periodDaysType: 'any', periodCustomDays: [1, 2, 3, 4, 5], periodTargetCount: 1, periodMaxPerDay: 1, timeSetting: 'none', startTime: '', endTime: '', durationPreset: 25, pointRule: 'default', reward: '', iconEmoji: '📚', habitColor: 'from-blue-400 to-blue-500', habitType: 'daily_once', attachments: [] });
                                setShowAddPlanModal(true);
                            }} className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:bg-emerald-700">
                                <Icons.Plus size={18} /> 新建习惯
                            </button>
                        </div>

                        <div className="p-6">
                            <h3 className="font-bold text-slate-800 mb-4 text-lg">当前生效的习惯规则</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tasks.filter(t => t.type === 'habit').map(t => {
                                    const kName = t.kidId === 'all' ? '全部孩子' : (kids.find(k => k.id === t.kidId)?.name || '未知');
                                    return (
                                        <div key={t.id} className="p-4 border border-slate-100 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
                                            <div className="flex items-start gap-3 mb-4">
                                                <div className="text-3xl bg-slate-50 rounded-xl p-2">{t.iconEmoji || '🛡️'}</div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-black text-slate-800">{t.title}</h4>
                                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{kName} 的习惯</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.standards}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                                                <span className={`text-sm font-black ${t.reward < 0 ? 'text-red-500' : 'text-yellow-600'}`}>
                                                    {t.reward > 0 ? '+' : ''}{t.reward} EXP
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {t.reward < 0 && <button onClick={() => {
                                                        handleExpChange(t.kidId, t.reward);
                                                        notify(`已记录惩罚，扣除 ${kName} ${Math.abs(t.reward)} 经验值！`, "error");
                                                    }} className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">记录扣分</button>}
                                                    <button onClick={() => {
                                                        setPlanType(t.type || 'habit');
                                                        setPlanForm({
                                                            targetKid: t.kidId,
                                                            category: t.category || '记录成长',
                                                            title: t.title,
                                                            desc: t.standards || t.desc || '',
                                                            startDate: t.startDate || new Date().toISOString().split('T')[0],
                                                            repeatType: '每天',
                                                            pointRule: (t.pointRule && t.pointRule === 'custom') || (t.type === 'habit') ? 'custom' : 'default',
                                                            reward: String(t.reward || ''),
                                                            iconEmoji: t.iconEmoji || '⭐',
                                                            habitColor: t.catColor || t.habitColor || 'from-blue-400 to-blue-500',
                                                            habitType: t.habitType || 'daily_once',
                                                            periodMaxPerDay: t.periodMaxPerDay || 3
                                                        });
                                                        setShowAddPlanModal(true);
                                                        setEditingTask(t);
                                                    }} className="text-slate-400 hover:text-emerald-500 p-2 transition-colors"><Icons.Edit3 size={16} /></button>
                                                    <button onClick={() => setDeleteConfirmTask(t)} className="text-slate-400 hover:text-red-500 p-2 transition-colors"><Icons.Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {tasks.filter(t => t.type === 'habit').length === 0 && (
                                    <div className="md:col-span-2 text-center py-16 text-slate-400 font-bold">暂无成长记录，点击上方按钮创建一个吧~</div>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-4 text-base flex items-center gap-2"><Icons.List size={16} className="text-slate-400" /> 近期习惯打卡明细 (Exp)</h3>
                                {transactions.filter(t => t.category === 'habit').length === 0 && <div className="text-center text-slate-400 text-sm py-8 bg-slate-50 rounded-2xl">暂无打卡明细</div>}
                                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                                    {transactions.filter(t => t.category === 'habit').slice(0, 40).map(item => {
                                        const kName = kids.find(k => k.id === item.kidId)?.name || '未知';
                                        return (
                                            <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border ${item.type === 'income' ? 'bg-emerald-50/30 border-emerald-100/50' : 'bg-red-50/30 border-red-100/50'}`}>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs bg-white border border-slate-200 shadow-sm font-bold text-slate-600 px-2 py-0.5 rounded-md">{kName}</span>
                                                        <div className="font-bold text-slate-700 text-sm">{item.title}</div>
                                                    </div>
                                                    <div className="text-xs text-slate-400">{new Date(item.date).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                                <div className={`font-black text-lg tracking-wide ${item.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>{item.type === 'income' ? '+' : '-'}{item.amount} EXP</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {parentTab === 'wealth' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="text-xl font-black text-slate-800 border-l-4 border-amber-500 pl-3">💰 全家财富总览</div>
                        </div>

                        {/* Per-kid Financial Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {kids.map(k => {
                                const total = (k.balances.spend || 0) + (k.balances.save || 0) + (k.balances.give || 0) + (k.vault?.lockedAmount || 0);
                                const pctSpend = total > 0 ? Math.round(((k.balances.spend || 0) / total) * 100) : 0;
                                const pctSave = total > 0 ? Math.round(((k.balances.save || 0) / total) * 100) : 0;
                                const pctGive = total > 0 ? Math.round(((k.balances.give || 0) / total) * 100) : 0;
                                const pctVault = total > 0 ? Math.round(((k.vault?.lockedAmount || 0) / total) * 100) : 0;

                                // Build income/expense history from transactions (exclude Habit logs)
                                const kidTrans = transactions.filter(t => t.kidId === k.id && t.category !== 'habit');
                                const incomeHistory = kidTrans.filter(t => t.type === 'income');
                                const expenseHistory = kidTrans.filter(t => t.type === 'expense');

                                return (
                                    <div key={k.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                                        {/* Header */}
                                        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 p-6">
                                            <div className="flex items-center gap-3">
                                                <span className="text-4xl">{k.avatar}</span>
                                                <div>
                                                    <div className="font-black text-white text-xl">{k.name}</div>
                                                    <div className="text-yellow-100 text-sm font-bold">Lv.{k.level} · 总资产 {total} 家庭币</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Balances Grid */}
                                        <div className="grid grid-cols-2 gap-4 p-6">
                                            <div className="bg-indigo-50 rounded-2xl p-4 text-center border border-indigo-100">
                                                <div className="text-xs font-bold text-indigo-500 mb-1">💳 活期钱包</div>
                                                <div className="text-2xl font-black text-indigo-600">{k.balances.spend}</div>
                                                <div className="text-[10px] text-indigo-400 font-bold">可消费</div>
                                            </div>
                                            {/* Removed duplicated Savings card */}
                                            <div className="bg-rose-50 rounded-2xl p-4 text-center border border-rose-100">
                                                <div className="text-xs font-bold text-rose-500 mb-1">💝 公益基金</div>
                                                <div className="text-2xl font-black text-rose-600">{k.balances.give}</div>
                                                <div className="text-[10px] text-rose-400 font-bold">爱心捐赠</div>
                                            </div>
                                            <div className="bg-slate-800 rounded-2xl p-4 text-center border border-slate-700">
                                                <div className="text-xs font-bold text-yellow-400 mb-1">🔒 时光金库</div>
                                                <div className="text-2xl font-black text-white">{k.vault?.lockedAmount || 0}</div>
                                                <div className="text-[10px] text-slate-400 font-bold">预期收益 +{k.vault?.projectedReturn || 0}</div>
                                            </div>
                                        </div>

                                        {/* Distribution Bar */}
                                        <div className="px-6 pb-4">
                                            <div className="text-xs font-bold text-slate-500 mb-2">财富分配比例</div>
                                            <div className="flex h-4 rounded-full overflow-hidden bg-slate-100">
                                                {pctSpend > 0 && <div style={{ width: `${pctSpend}%` }} className="bg-indigo-500 transition-all" title={`活期 ${pctSpend}%`}></div>}
                                                {pctSave > 0 && <div style={{ width: `${pctSave}%` }} className="bg-purple-500 transition-all" title={`储蓄 ${pctSave}%`}></div>}
                                                {pctGive > 0 && <div style={{ width: `${pctGive}%` }} className="bg-rose-500 transition-all" title={`公益 ${pctGive}%`}></div>}
                                                {pctVault > 0 && <div style={{ width: `${pctVault}%` }} className="bg-slate-700 transition-all" title={`金库 ${pctVault}%`}></div>}
                                            </div>
                                            <div className="flex gap-4 mt-2 text-[10px] font-bold">
                                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> 活期 {pctSpend}%</span>
                                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> 储蓄 {pctSave}%</span>
                                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> 公益 {pctGive}%</span>
                                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-700"></span> 金库 {pctVault}%</span>
                                            </div>
                                        </div>

                                        {/* Income History */}
                                        <div className="border-t border-slate-100 p-6">
                                            <h4 className="font-black text-slate-700 mb-3 flex items-center gap-2 text-sm"><Icons.TrendingUp size={16} className="text-emerald-500" /> 收入明细</h4>
                                            {incomeHistory.length === 0 && <div className="text-center text-slate-400 text-sm py-4">暂无收入记录</div>}
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {incomeHistory.slice(0, 10).map((item, idx) => (
                                                    <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-emerald-50/50 rounded-xl text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-emerald-500 font-bold">+</span>
                                                            <span className="font-bold text-slate-700">{item.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-black text-emerald-600">+{item.amount} 家庭币</span>
                                                            <span className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Expense History */}
                                        <div className="border-t border-slate-100 p-6 pt-4">
                                            <h4 className="font-black text-slate-700 mb-3 flex items-center gap-2 text-sm"><Icons.ShoppingBag size={16} className="text-red-500" /> 消费明细</h4>
                                            {expenseHistory.length === 0 && <div className="text-center text-slate-400 text-sm py-4">暂无消费记录</div>}
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {expenseHistory.slice(0, 10).map((item, idx) => (
                                                    <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-red-50/50 rounded-xl text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-red-500 font-bold">-</span>
                                                            <span className="font-bold text-slate-700">{item.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-black text-red-500">-{item.amount} 家庭币</span>
                                                            <span className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {parentTab === 'shop_manage' && (
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-slate-100 bg-purple-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="font-black text-slate-800 text-xl">家庭超市货架配置</h2>
                                <p className="text-sm text-slate-500 mt-1">设置吸引人的奖励，激发孩子的动力</p>
                            </div>
                            <button onClick={() => setShowAddItemModal(true)} className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-200 hover:opacity-90">
                                <Icons.Plus size={18} /> 添加愿望商品
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm min-w-[600px]">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider w-20">图标</th>
                                        <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider">商品/愿望信息</th>
                                        <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider">兑换规则</th>
                                        <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider">定价</th>
                                        <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {inventory.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-3xl bg-slate-100 w-12 h-12 flex items-center justify-center rounded-xl">{item.iconEmoji}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-black text-slate-800 text-base">{item.name}</div>
                                                <div className="text-xs text-slate-400 mt-1 max-w-[200px] truncate">{item.desc}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-slate-600 bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-300">
                                                    {item.type === 'single' ? '单次兑换' : item.type === 'multiple' ? '多次兑换' : '无限次'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-black text-base">{item.price} 家庭币</span>
                                            </td>
                                            <td className="px-6 py-4 flex justify-end gap-2 mt-1">
                                                <button onClick={() => { setNewItem({ ...item, price: item.price.toString() }); setShowAddItemModal(true); }} className="hover:text-indigo-600 bg-white shadow-sm border border-slate-200 p-2.5 rounded-xl transition-colors"><Icons.Settings size={18} /></button>
                                                <button onClick={async () => {
                                                    if (!window.confirm(`确定要下架商品 【${item.name}】 吗？`)) return;
                                                    try {
                                                        await apiFetch(`/api/inventory/${item.id}`, { method: 'DELETE' });
                                                        setInventory(inventory.filter(i => i.id !== item.id));
                                                        notify("商品已下架", "success");
                                                    } catch (e) { notify("网络下架失败", "error"); }
                                                }} className="hover:text-rose-500 bg-white shadow-sm border border-slate-200 p-2.5 rounded-xl transition-colors"><Icons.Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {parentTab === 'settings' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700"><Icons.Lock size={20} /></div>
                                <h2 className="text-xl font-black text-slate-800">后台安全锁</h2>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-slate-800">开启家长密码锁</div>
                                        <div className="text-xs text-slate-500 mt-1">防止孩子私自进入后台修改数据</div>
                                    </div>
                                    <button onClick={() => setParentSettings(p => ({ ...p, pinEnabled: !p.pinEnabled }))} className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors ${parentSettings.pinEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                        <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${parentSettings.pinEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                                {parentSettings.pinEnabled && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">修改 4 位密码 (默认1234)</label>
                                        <input type="text" maxLength={4} value={parentSettings.pinCode} onChange={e => setParentSettings(p => ({ ...p, pinCode: e.target.value.replace(/\D/g, '') }))} className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl font-mono text-xl tracking-[1em] outline-none focus:border-indigo-500" />
                                    </div>
                                )}
                                <button onClick={() => notify("安全设置已保存", "success")} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black">保存安全设置</button>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500"><Icons.Award size={20} /></div>
                                <h2 className="text-xl font-black text-slate-800">我的订阅体验</h2>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="text-sm font-bold text-slate-500 mb-1">当前账号</div>
                                    <div className="font-black text-slate-800">{user?.email}</div>
                                    <div className="mt-3 text-sm font-bold text-slate-500 mb-1">服务有效期至</div>
                                    <div className={`font-black ${new Date(user?.sub_end_date) < new Date() ? 'text-rose-500' : 'text-emerald-600'}`}>
                                        {user?.sub_end_date ? new Date(user.sub_end_date).toLocaleDateString() : '永久有效'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">输入兑换码续费</label>
                                    <div className="flex gap-2">
                                        <input type="text" value={settingsCode} onChange={e => setSettingsCode(e.target.value.toUpperCase())} className="flex-1 bg-white border-2 border-slate-200 p-3 rounded-xl font-black text-slate-800 tracking-wider outline-none focus:border-rose-500 uppercase placeholder:text-slate-300 placeholder:font-bold" placeholder="ACT-XXXXXX" />
                                        <button onClick={async () => {
                                            if (!settingsCode) return;
                                            try {
                                                const res = await apiFetch('/api/redeem-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: settingsCode }) });
                                                const data = await res.json();
                                                if (!res.ok) return notify(data.error || "兑换失败", 'error');
                                                notify("兑换成功！", 'success');
                                                setUser(prev => ({ ...prev, sub_end_date: data.new_sub_end_date }));
                                                setSettingsCode('');
                                                apiFetch('/api/me/codes').then(r => r.json()).then(setUsedCodes).catch(console.error);
                                            } catch (err) { notify("网络错误", "error"); }
                                        }} className="bg-rose-500 text-white px-6 rounded-xl font-bold shadow-md shadow-rose-200 hover:bg-rose-600 transition-colors">兑换</button>
                                    </div>
                                </div>
                                {usedCodes.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-sm font-black text-slate-700 mb-3 border-b border-slate-100 pb-2">兑换历史记录</h3>
                                        <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                            {usedCodes.map(c => (
                                                <div key={c.code} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs shadow-sm">
                                                    <div className="font-mono font-bold text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">{c.code}</div>
                                                    <div className="text-right">
                                                        <span className="font-black text-emerald-600 block">+{c.duration_days} 天</span>
                                                        <span className="text-[10px] text-slate-400 font-bold">{new Date(c.used_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700"><Icons.Users size={20} /></div>
                                <h2 className="text-xl font-black text-slate-800">孩子资料管理</h2>
                            </div>
                            <div className="space-y-4 mb-6">
                                {kids.map(k => (
                                    <div key={k.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex gap-4 items-center">
                                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-4xl shadow-sm border border-slate-200">
                                            {k.avatar}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-black text-slate-800 text-lg">{k.name}</div>
                                            <div className="text-xs font-bold text-slate-400">Lv.{k.level} · 学力 {k.exp}</div>
                                        </div>
                                        <button onClick={() => {
                                            const boyAvatars = ['👦', '🧑‍🚀', '🦸‍♂️', '🕵️‍♂️', '👼'];
                                            const gender = boyAvatars.includes(k.avatar) ? 'boy' : 'girl';
                                            setNewKidForm({ id: k.id, name: k.name, gender, avatar: k.avatar });
                                            setShowAddKidModal(true);
                                        }} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
                                            <Icons.Edit3 size={18} />
                                        </button>
                                        <button onClick={async () => {
                                            if (window.confirm(`确定要删除 ${k.name} 吗？与该孩子相关的所有任务、订单和记录都将被删除！此操作无法撤销。`)) {
                                                try {
                                                    await apiFetch(`/api/kids/${k.id}`, { method: 'DELETE' });
                                                    setKids(kids.filter(kid => kid.id !== k.id));
                                                    notify(`${k.name} 已被删除`, "success");
                                                } catch (e) { notify("删除失败", "error"); }
                                            }
                                        }} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
                                            <Icons.Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center">
                                <button onClick={() => {
                                    setNewKidForm({ id: null, name: '', gender: 'boy', avatar: '👦' });
                                    setShowAddKidModal(true);
                                }} className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 border-2 border-dashed border-slate-300">添加家庭成员 +</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    if (authLoading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-indigo-300 animate-pulse">加载中...</div>;
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="bg-slate-50 p-8 text-center border-b border-slate-100">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl mx-auto flex items-center justify-center text-white mb-4 shadow-xl">
                            <Icons.Home size={40} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800">MiniLife 家庭版</h1>
                        <p className="text-slate-500 font-bold mt-2">{authMode === 'login' ? '欢迎回来，管理大大小小的事迹' : '注册即享 3 天全功能免费体验'}</p>
                    </div>
                    <form onSubmit={handleAuth} className="p-8 space-y-6">
                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-2">邮箱</label>
                            <input required type="email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-indigo-500 font-bold text-slate-800 transition-colors" placeholder="name@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-2">密码</label>
                            <input required type="password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-indigo-500 font-bold text-slate-800 transition-colors" placeholder="••••••••" />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">
                            {authMode === 'login' ? '登 录' : '注 册 并 试 用'}
                        </button>
                    </form>
                    <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
                        <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-indigo-600 font-bold hover:underline">
                            {authMode === 'login' ? '没有账号？免费注册' : '已有账号？直接登录'}
                        </button>
                    </div>
                </div>
                {/* Notifications overlay needed for auth page too */}
                <div className="fixed top-4 right-4 z-50 space-y-2">
                    {notifications.map(n => (
                        <div key={n.id} className={`p-4 rounded-xl shadow-xl flex items-center gap-3 animate-slide-in ${n.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                            {n.type === 'success' ? <Icons.CheckCircle size={24} /> : <Icons.AlertCircle size={24} />}
                            <span className="font-bold">{n.msg}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (user && new Date(user.sub_end_date) < new Date() && user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 to-orange-500"></div>
                    <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full mx-auto flex items-center justify-center mb-6">
                        <Icons.Lock size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 mb-2">服务已到期</h1>
                    <p className="text-slate-500 font-bold mb-8">您的试用或订阅服务已到期，请购买兑换码以继续使用 MiniLife 的全部功能。</p>

                    <form onSubmit={handleRedeem} className="space-y-4">
                        <input required type="text" value={activationCode} onChange={e => setActivationCode(e.target.value.toUpperCase())} className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-center tracking-widest outline-none focus:border-rose-500 font-black text-slate-800 text-xl transition-colors uppercase" placeholder="ACT-XXXXXX" />
                        <button type="submit" className="w-full bg-rose-600 text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 transition-colors">验证兑换码</button>
                    </form>
                    <div className="mt-8 text-sm font-bold text-slate-400">
                        <button onClick={handleLogout} className="hover:text-slate-600 underline">退出登录</button>
                    </div>
                </div>
                {/* Notifications */}
                <div className="fixed top-4 right-4 z-50 space-y-2">
                    {notifications.map(n => (
                        <div key={n.id} className={`p-4 rounded-xl shadow-xl flex items-center gap-3 animate-slide-in ${n.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                            {n.type === 'success' ? <Icons.CheckCircle size={24} /> : <Icons.AlertCircle size={24} />}
                            <span className="font-bold">{n.msg}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (user?.role === 'admin') {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
                {/* Admin Header */}
                <div className="bg-slate-900 text-white p-6 flex justify-between items-center shadow-lg z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
                            <Icons.Lock size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">MiniLife · SaaS Admin平台</h1>
                            <div className="text-xs text-indigo-200 font-bold">{user.email} (超级管理员)</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="bg-slate-800 text-slate-300 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 shadow-sm flex items-center gap-2">
                        退出登录
                    </button>
                </div>

                {/* Admin Tabs */}
                <div className="bg-white border-b border-slate-200 px-8 flex gap-8">
                    <button onClick={() => setAdminTab('users')} className={`py-4 font-black border-b-2 font-bold ${adminTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>用户管理 ({adminUsers.length})</button>
                    <button onClick={() => setAdminTab('codes')} className={`py-4 font-black border-b-2 font-bold ${adminTab === 'codes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>激活码管理 ({adminCodes.length})</button>
                </div>

                {/* Admin Content */}
                <div className="p-8 flex-1 overflow-auto">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {adminTab === 'users' && (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <h2 className="text-xl font-black flex items-center gap-2 text-slate-800"><Icons.Users size={20} className="text-indigo-500" /> 注册用户列表</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                            <tr>
                                                <th className="px-6 py-4 font-bold uppercase">ID</th>
                                                <th className="px-6 py-4 font-bold uppercase">Email</th>
                                                <th className="px-6 py-4 font-bold uppercase">角色</th>
                                                <th className="px-6 py-4 font-bold uppercase">注册时间</th>
                                                <th className="px-6 py-4 font-bold uppercase">订阅到期时间</th>
                                                <th className="px-6 py-4 font-bold uppercase">状态</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {adminUsers.map(u => {
                                                const isExpired = new Date(u.sub_end_date) < new Date() && u.role !== 'admin';
                                                return (
                                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{u.id}</td>
                                                        <td className="px-6 py-4 font-bold text-slate-800">{u.email}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600">{new Date(u.created_at).toLocaleString()}</td>
                                                        <td className={`px-6 py-4 font-bold ${isExpired ? 'text-red-500' : 'text-emerald-600'}`}>{new Date(u.sub_end_date).toLocaleString()}</td>
                                                        <td className="px-6 py-4">
                                                            {isExpired ? <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded-md text-xs">已过期 (拦截)</span> :
                                                                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md text-xs">正常使用中</span>}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {adminTab === 'codes' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                        <h2 className="text-xl font-black flex items-center gap-2 text-slate-800"><Icons.Tag size={20} className="text-rose-500" /> 发行激活码</h2>
                                    </div>
                                    <div className="p-6 flex gap-4">
                                        <button onClick={() => generateCodes(30)} className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl font-black hover:bg-indigo-100 transition-colors border border-indigo-200 shadow-sm flex items-center gap-2">生成5个 (30天体验卡)</button>
                                        <button onClick={() => generateCodes(365)} className="bg-purple-50 text-purple-600 px-6 py-3 rounded-2xl font-black hover:bg-purple-100 transition-colors border border-purple-200 shadow-sm flex items-center gap-2">生成5个 (365天年卡)</button>
                                        <button onClick={() => generateCodes(9999)} className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl font-black hover:bg-emerald-100 transition-colors border border-emerald-200 shadow-sm flex items-center gap-2">生成5个 (永久买断版卡)</button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                        <h2 className="text-xl font-black text-slate-800">激活码库存与核销记录</h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                                <tr>
                                                    <th className="px-6 py-4 font-bold uppercase">激活码 (Code)</th>
                                                    <th className="px-6 py-4 font-bold uppercase">时长 (天)</th>
                                                    <th className="px-6 py-4 font-bold uppercase">状态</th>
                                                    <th className="px-6 py-4 font-bold uppercase">使用者 ID</th>
                                                    <th className="px-6 py-4 font-bold uppercase">核销时间</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {adminCodes.map(c => (
                                                    <tr key={c.code} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-mono font-black text-lg tracking-wider text-indigo-700">{c.code}</td>
                                                        <td className="px-6 py-4 font-bold text-slate-600">+{c.duration_days}</td>
                                                        <td className="px-6 py-4">
                                                            {c.status === 'active' ? <span className="text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg font-black text-xs border border-emerald-200 shadow-sm">全新待发放</span> :
                                                                <span className="text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg font-bold text-xs">已核销</span>}
                                                        </td>
                                                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{c.used_by || '-'}</td>
                                                        <td className="px-6 py-4 text-slate-500">{c.used_at ? new Date(c.used_at).toLocaleString() : '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notifications overlay for admin */}
                <div className="fixed top-4 right-4 z-[200] space-y-2 pointer-events-none">
                    {notifications.map(n => (
                        <div key={n.id} className={`p-4 rounded-xl shadow-xl flex items-center gap-3 animate-slide-in pointer-events-auto ${n.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                            {n.type === 'success' ? <Icons.CheckCircle size={24} /> : <Icons.AlertCircle size={24} />}
                            <span className="font-bold">{n.message}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // === 主返回 ===
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-bold text-xl">加载中...</div>;
    }

    return (
        <div className="font-sans selection:bg-indigo-100">
            {appState === 'profiles' && renderProfileSelection()}
            {appState === 'parent_pin' && renderParentPinScreen()}
            {appState === 'kid_app' && renderKidApp()}
            {appState === 'parent_app' && renderParentApp()}

            <div className="fixed top-24 right-6 z-[200] space-y-3 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className={`px-6 py-4 rounded-2xl shadow-xl animate-bounce-in text-white text-sm font-bold flex items-center gap-2 pointer-events-auto ${n.type === 'error' ? 'bg-rose-500' : n.type === 'info' ? 'bg-slate-800' : 'bg-emerald-500'}`}>
                        <Icons.Bell size={18} /> {n.msg}
                    </div>
                ))}
            </div>

            {renderTaskSubmitModal()}
            {renderQuickCompleteModal()}
            {renderKidPreviewModal()}
            {renderTransferModal()}
            {renderReviewModal()}
            {renderAddItemModal()}
            {renderAddPlanModal()}
            {renderTimerModal()}
            {renderCalendarModal()}


            {/* Add Kid Modal */}
            {showAddKidModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-bounce-in">
                        <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center relative">
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.Users size={24} className="text-indigo-500" /> {newKidForm.id ? '编辑家庭成员' : '添加家庭成员'}</h2>
                            <button onClick={() => setShowAddKidModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white w-8 h-8 rounded-full shadow-sm flex items-center justify-center"><Icons.X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">宝贝的小名 / 昵称</label>
                                <input
                                    type="text"
                                    value={newKidForm.name}
                                    onChange={e => setNewKidForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="例如：小明、芳芳"
                                    className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 transition-colors"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">选择性别</label>
                                <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                                    <button
                                        onClick={() => setNewKidForm(f => ({ ...f, gender: 'boy', avatar: '👦' }))}
                                        className={`flex-1 py-3 font-black text-sm rounded-lg transition-all flex items-center justify-center gap-2 ${newKidForm.gender === 'boy' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        👦 男孩
                                    </button>
                                    <button
                                        onClick={() => setNewKidForm(f => ({ ...f, gender: 'girl', avatar: '👧' }))}
                                        className={`flex-1 py-3 font-black text-sm rounded-lg transition-all flex items-center justify-center gap-2 ${newKidForm.gender === 'girl' ? 'bg-white text-pink-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        👧 女孩
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">挑选一个专属可爱头像</label>
                                <div className="grid grid-cols-5 gap-3">
                                    {(newKidForm.gender === 'boy' ? ['👦', '🧑‍🚀', '🦸‍♂️', '🕵️‍♂️', '👼'] : ['👧', '👩‍🚀', '🦸‍♀️', '🧚‍♀️', '🧜‍♀️']).map(avatar => (
                                        <button
                                            key={avatar}
                                            onClick={() => setNewKidForm(f => ({ ...f, avatar }))}
                                            className={`aspect-square text-3xl flex items-center justify-center rounded-2xl transition-all ${newKidForm.avatar === avatar ? (newKidForm.gender === 'boy' ? 'bg-blue-100 border-2 border-blue-400 scale-110 shadow-sm' : 'bg-pink-100 border-2 border-pink-400 scale-110 shadow-sm') : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100 grayscale hover:grayscale-0'}`}
                                        >
                                            {avatar}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-6 border-t border-slate-100 flex gap-4">
                            <button onClick={() => setShowAddKidModal(false)} className="flex-[1] bg-white text-slate-600 font-bold py-4 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50">取消</button>
                            <button onClick={async () => {
                                if (!newKidForm.name.trim()) return notify("请输入孩子名字", "error");
                                if (!newKidForm.avatar) return notify("请选择一个头像", "error");

                                if (newKidForm.id) {
                                    try {
                                        await apiFetch(`/api/kids/${newKidForm.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newKidForm.name.trim(), avatar: newKidForm.avatar }) });
                                        setKids(kids.map(k => k.id === newKidForm.id ? { ...k, name: newKidForm.name.trim(), avatar: newKidForm.avatar } : k));
                                        notify("资料已保存更新！", "success");
                                        setShowAddKidModal(false);
                                    } catch (err) { notify("保存失败", "error"); }
                                } else {
                                    const newKid = { id: `kid_${Date.now()}`, name: newKidForm.name.trim(), avatar: newKidForm.avatar };
                                    try {
                                        await apiFetch('/api/kids', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newKid) });
                                        setKids([...kids, { ...newKid, level: 1, exp: 0, balances: { spend: 0, save: 0, give: 0 }, vault: { lockedAmount: 0, projectedReturn: 0 } }]);
                                        notify("家庭新成员添加成功！", "success");
                                        setShowAddKidModal(false);
                                    } catch (err) { notify("添加失败", "error"); }
                                }
                            }} className={`flex-[2] text-white font-black py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] ${newKidForm.gender === 'boy' ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-200' : 'bg-pink-500 hover:bg-pink-600 shadow-pink-200'}`}>
                                {newKidForm.id ? '保存修改' : '确定添加'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteConfirmTask && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl text-center p-8 animate-bounce-in">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                            <Icons.Trash2 size={28} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 mb-2">确认删除</h2>
                        <p className="text-slate-500 text-sm mb-2">你确定要删除以下任务吗？</p>
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                            <div className="font-black text-slate-800 text-lg">{deleteConfirmTask.title}</div>
                            <div className="text-xs text-slate-500 mt-1">删除后无法恢复，历史记录也会一并清除</div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirmTask(null)} className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">取消</button>
                            <button onClick={() => handleDeleteTask(deleteConfirmTask.id)} className="flex-1 py-3 bg-red-500 text-white font-black rounded-xl shadow-lg shadow-red-200 hover:bg-red-600 transition-all hover:scale-[1.02]">确认删除</button>
                        </div>
                    </div>
                </div>
            )}

            {showLevelRules && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl text-left relative">
                        <button onClick={() => setShowLevelRules(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><Icons.X size={20} /></button>
                        <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2"><Icons.Award className="text-yellow-500" size={24} /> 等级系统说明</h2>
                        <div className="space-y-4 text-sm text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <p><span className="font-bold text-slate-800">🚀 如何升级：</span><br />完成【习惯养成】区的任务即可获得经验值 (EXP)。经验存满自动升至下一级。</p>
                            <p><span className="font-bold text-slate-800">⚠️ 保级与降级警告：</span><br />如果有不良习惯（例如超时玩手机），家长会记录扣分。如果当前等级的 EXP 被扣至 0 以下，将会触发<span className="text-red-500 font-bold">降级惩罚</span>！</p>
                            <p><span className="font-bold text-slate-800">💎 等级特权：</span><br />等级越高，时光金库的利息加成越高，解锁的高级愿望也越多。</p>
                        </div>
                        <button onClick={() => setShowLevelRules(false)} className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">我明白了，努力升级！</button>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.9); } 60% { opacity: 1; transform: scale(1.05); } 100% { transform: scale(1); } }
        .animate-bounce-in { animation: bounceIn 0.3s forwards; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
        </div>
    );
}
