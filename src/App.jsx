import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

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
    ArrowLeft: (p) => <IconWrapper {...p}><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></IconWrapper>,
    ArrowUp: (p) => <IconWrapper {...p}><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></IconWrapper>,
    ArrowDown: (p) => <IconWrapper {...p}><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></IconWrapper>,
    CheckCircle: (p) => <IconWrapper {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></IconWrapper>,
    CheckSquare: (p) => <IconWrapper {...p}><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></IconWrapper>,
    Clock: (p) => <IconWrapper {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></IconWrapper>,
    TrendingUp: (p) => <IconWrapper {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></IconWrapper>,
    TrendingDown: (p) => <IconWrapper {...p}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></IconWrapper>,
    Lock: (p) => <IconWrapper {...p}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></IconWrapper>,
    Unlock: (p) => <IconWrapper {...p}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></IconWrapper>,
    Award: (p) => <IconWrapper {...p}><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></IconWrapper>,
    Gem: (p) => <IconWrapper {...p}><path d="M6 3h12l4 6-10 13L2 9Z" /><path d="M11 3 8 9l4 13" /><path d="M13 3l3 6-4 13" /></IconWrapper>,
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
    Settings: (p) => <IconWrapper {...p}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1-1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></IconWrapper>,
    Users: (p) => <IconWrapper {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></IconWrapper>,
    UserPlus: (p) => <IconWrapper {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></IconWrapper>,
    LogOut: (p) => <IconWrapper {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></IconWrapper>,
    LogIn: (p) => <IconWrapper {...p}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></IconWrapper>,
    Play: (p) => <IconWrapper {...p}><polygon points="5 3 19 12 5 21 5 3" /></IconWrapper>,
    Check: (p) => <IconWrapper {...p}><polyline points="20 6 9 17 4 12" /></IconWrapper>,
    Calendar: (p) => <IconWrapper {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></IconWrapper>,
    Activity: (p) => <IconWrapper {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></IconWrapper>,
    ArrowUpRight: (p) => <IconWrapper {...p}><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></IconWrapper>,
    Eye: (p) => <IconWrapper {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></IconWrapper>,
    Filter: (p) => <IconWrapper {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></IconWrapper>,
    SortAsc: (p) => <IconWrapper {...p}><path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4" /></IconWrapper>,
    LayoutGrid: (p) => <IconWrapper {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></IconWrapper>,
    Wrench: (p) => <IconWrapper {...p}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></IconWrapper>,
    RefreshCw: (p) => <IconWrapper {...p}><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></IconWrapper>,
    Upload: (p) => <IconWrapper {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></IconWrapper>,
    Target: (p) => <IconWrapper {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></IconWrapper>,
    Save: (p) => <IconWrapper {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></IconWrapper>,
    Image: (p) => <IconWrapper {...p}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></IconWrapper>,
    FileText: (p) => <IconWrapper {...p}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></IconWrapper>,
    // Star duplicate removed
    StarFilled: (p) => <IconWrapper {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></IconWrapper>,
    Tag: (p) => <IconWrapper {...p}><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><path d="M7 7h.01" /></IconWrapper>,
    Paperclip: (p) => <IconWrapper {...p}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></IconWrapper>,
    List: (p) => <IconWrapper {...p}><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></IconWrapper>,
    Pause: (p) => <IconWrapper {...p}><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></IconWrapper>,
    Edit3: (p) => <IconWrapper {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></IconWrapper>,
    GripVertical: (p) => <IconWrapper {...p}><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></IconWrapper>,
    // Newly Added Category Icons
    Calculator: (p) => <IconWrapper {...p}><rect width="16" height="20" x="4" y="2" rx="2" /><line x1="8" x2="16" y1="6" y2="6" /><line x1="16" x2="16" y1="14" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" /></IconWrapper>,
    MessageCircle: (p) => <IconWrapper {...p}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></IconWrapper>,
    Zap: (p) => <IconWrapper {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></IconWrapper>,
    FlaskConical: (p) => <IconWrapper {...p}><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" /><path d="M8.5 2h7" /><path d="M14 16H5.3" /></IconWrapper>,
    Leaf: (p) => <IconWrapper {...p}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 22 12 12" /></IconWrapper>,
    Hourglass: (p) => <IconWrapper {...p}><path d="M5 22h14" /><path d="M5 2h14" /><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" /><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" /></IconWrapper>,
    Globe: (p) => <IconWrapper {...p}><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></IconWrapper>,
    Landmark: (p) => <IconWrapper {...p}><line x1="3" x2="21" y1="22" y2="22" /><line x1="6" x2="6" y1="18" y2="11" /><line x1="10" x2="10" y1="18" y2="11" /><line x1="14" x2="14" y1="18" y2="11" /><line x1="18" x2="18" y1="18" y2="11" /><polygon points="12 2 20 7 4 7" /></IconWrapper>,
    Scale: (p) => <IconWrapper {...p}><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" /></IconWrapper>,
    Monitor: (p) => <IconWrapper {...p}><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></IconWrapper>,
    Dumbbell: (p) => <IconWrapper {...p}><path d="M14.4 14.4 9.6 9.6" /><path d="M18.65 21.35a2.12 2.12 0 0 1-2.99 0l-5.46-5.46a2.12 2.12 0 1 1 2.99-2.99l5.46 5.46a2.12 2.12 0 0 1 0 2.99z" /><path d="m2.65 9.65 5.46 5.46a2.12 2.12 0 1 1-2.99 2.99l-5.46-5.46a2.12 2.12 0 1 1 2.99-2.99z" /><path d="m9.3 5.3 5.4 5.4" /></IconWrapper>,
    Gamepad2: (p) => <IconWrapper {...p}><line x1="6" x2="10" y1="12" y2="12" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="15" x2="15.01" y1="13" y2="13" /><line x1="18" x2="18.01" y1="11" y2="11" /><rect width="20" height="12" x="2" y="6" rx="2" /></IconWrapper>,
    Palette: (p) => <IconWrapper {...p}><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></IconWrapper>,
    ShieldAlert: (p) => <IconWrapper {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.5 0 4.5 1 6 2a1 1 0 0 1 1 1v7z" /><path d="M12 8v4" /><path d="M12 16h.01" /></IconWrapper>,
    User: (p) => <IconWrapper {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></IconWrapper>
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

// === 钩子工具 ===
const useOnClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

// Removed HTML5 Base64 Audio Engine to prevent iOS Safari from hijacking the Dynamic Island / Lock Screen media player.
let globalAudioCtx = null;

const CelebrationModal = ({ data, onClose }) => {
    if (!data) return null;
    const isPositive = data.type === 'positive';
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-simple-fade">
            <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 text-center relative overflow-hidden shadow-2xl animate-scale-up border-[3px] border-white/50">
                <div className={`absolute top-0 left-0 right-0 h-40 opacity-20 blur-3xl ${isPositive ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-28 h-28 rounded-[2rem] flex items-center justify-center text-6xl mb-6 shadow-inner ${isPositive ? 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-500' : 'bg-gradient-to-br from-amber-50 to-orange-50 text-orange-500'}`}>
                        {isPositive ? '✨' : '🛡️'}
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-3">{isPositive ? '打卡成功！' : '勇敢坦白！'}</h2>
                    <p className="text-base text-slate-500 mb-8 leading-relaxed font-bold bg-slate-50 p-4 rounded-2xl">"{data.message}"</p>
                    
                    <div className={`text-4xl font-black mb-8 flex items-baseline justify-center gap-1 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : '-'}{Math.abs(data.task.reward)} <span className="text-sm font-bold text-slate-400">家庭币</span>
                    </div>
                    
                    <button type="button" onClick={onClose} className={`w-full py-4 rounded-2xl text-white font-black text-lg shadow-lg active:scale-95 transition-all outline-none ${isPositive ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-emerald-500/30 hover:shadow-emerald-500/50' : 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-orange-500/30 hover:shadow-orange-500/50'}`}>
                        {isPositive ? '继续保持' : '我知道了'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function App() {
    // === 全局状态 ===

    const [token, setToken] = useState(localStorage.getItem('minilife_token'));
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
    const [authForm, setAuthForm] = useState({ email: '', password: '' });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [activationCode, setActivationCode] = useState('');

    const [appState, setAppState] = useState(localStorage.getItem('minilife_appState') || 'profiles'); // 'profiles' | 'parent_pin' | 'kid_app' | 'parent_app'
    const [notifications, setNotifications] = useState([]);
    
    // Level Modal State
    const [showLevelModal, setShowLevelModal] = useState(false);
    const [historyFilter, setHistoryFilter] = useState('all'); // 'all', 'income', 'expense'
    const [habitCardFilter, setHabitCardFilter] = useState('all'); // 'all', 'income', 'expense', 'completed', 'pending'
    const [celebrationData, setCelebrationData] = useState(null);

    // State for Parental Manual Penalty Multi-Child Selection
    const [showPenaltyModal, setShowPenaltyModal] = useState(false);
    const [penaltyTaskContext, setPenaltyTaskContext] = useState(null);
    const [penaltySelectedKidIds, setPenaltySelectedKidIds] = useState([]);

    // Helper: Get Tier Title & Emoji Map based on Level
    const getLevelTier = (level) => {
        if (level < 10) return { title: '新手村学徒', emoji: '🌱', bg: 'from-green-400 to-emerald-500', color: 'text-emerald-500' };
        if (level < 20) return { title: '探索达人', emoji: '🧭', bg: 'from-blue-400 to-cyan-500', color: 'text-blue-500' };
        if (level < 30) return { title: '进阶骑士', emoji: '⚔️', bg: 'from-indigo-400 to-purple-500', color: 'text-indigo-500' };
        if (level < 40) return { title: '白银守卫', emoji: '🛡️', bg: 'from-slate-300 to-slate-500', color: 'text-slate-600' };
        if (level < 50) return { title: '黄金领主', emoji: '👑', bg: 'from-yellow-400 to-amber-500', color: 'text-amber-500' };
        return { title: '传说星耀', emoji: '🌟', bg: 'from-rose-400 to-fuchsia-600', color: 'text-rose-500' };
    };
    const handleAuth = async (e) => {
        e.preventDefault();
        
        if (authMode === 'register' && authForm.password !== confirmPassword) {
            return notify('两次输入的密码不一致，请重新确认', 'error');
        }

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
        localStorage.removeItem('minilife_appState');
        localStorage.removeItem('minilife_activeKidId');
        setToken(null);
        setUser(null);
        changeAppState('profiles');
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
    const [activeKidId, setActiveKidId] = useState(localStorage.getItem('minilife_activeKidId') || 'kid_1');
    const [parentSettings, setParentSettings] = useState({ pinEnabled: false, pinCode: '1234' });
    
    // --- State Persistence Wrappers ---
    const changeAppState = (newState) => {
        setAppState(newState);
        localStorage.setItem('minilife_appState', newState);
    };

    const changeActiveKid = (newKidId) => {
        setActiveKidId(newKidId);
        if (newKidId) localStorage.setItem('minilife_activeKidId', newKidId);
        else localStorage.removeItem('minilife_activeKidId');
    };

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

        // Server-Sent Events (SSE) Live Sync - Robust Mobile Reconnection
        let eventSource = null;
        let reconnectTimeout = null;

        const connectSSE = () => {
            if (eventSource) {
                eventSource.close();
            }
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
                // Exponential backoff or simple delay
                reconnectTimeout = setTimeout(connectSSE, 3000);
            };
        };

        if (token) connectSSE();

        // Auto-refresh and force reconnect when app comes back to foreground (PWA / Mobile Switch)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('App resumed, silently fetching fresh data and reconnecting sync...');
                checkAuthAndFetch();
                connectSSE();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleVisibilityChange);

        // Fallback Polling (15s) for stubborn iOS background thread sleeps
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
    // 任务列表控制 (Student)
    const [taskFilter, setTaskFilter] = useState([]); 
    const [taskStatusFilter, setTaskStatusFilter] = useState('all'); 
    const [taskSort, setTaskSort] = useState('default');
    
    // 任务列表控制 (Parent)
    const [parentTaskFilter, setParentTaskFilter] = useState([]);
    const [parentTaskStatusFilter, setParentTaskStatusFilter] = useState('all');
    const [parentTaskSort, setParentTaskSort] = useState('default');
    
    const [isReordering, setIsReordering] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    
    // Parent header settings dropdown
    const [showParentSettingsDropdown, setShowParentSettingsDropdown] = useState(false);
    
    const kidFilterRef = useRef();
    const kidSortRef = useRef();
    const parentFilterRef = useRef();
    const parentSortRef = useRef();
    const parentSettingsRef = useRef();
    
    useOnClickOutside(kidFilterRef, () => setShowFilterDropdown(false));
    useOnClickOutside(kidSortRef, () => setShowSortDropdown(false));
    useOnClickOutside(parentFilterRef, () => setShowFilterDropdown(false));
    useOnClickOutside(parentSortRef, () => setShowSortDropdown(false));
    useOnClickOutside(parentSettingsRef, () => setShowParentSettingsDropdown(false));

    // 弹窗状态
    const [taskToSubmit, setTaskToSubmit] = useState(null);
    const [taskIdToEdit, setTaskIdToEdit] = useState(null);

    // Dynamic Categories helper
    const defaultCategories = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '道德与法治', '信息技术', '体育运动', '娱乐', '兴趣班', '其他'];
    const allCategories = Array.from(new Set([...defaultCategories, ...tasks.filter(t => t.type === 'study' && t.category).map(t => t.category)]));

    const getCategoryColor = (cat) => {
        const colors = {
            '语文': 'bg-rose-50 text-rose-600 border-rose-200',
            '数学': 'bg-indigo-50 text-indigo-600 border-indigo-200',
            '英语': 'bg-sky-50 text-sky-600 border-sky-200',
            '物理': 'bg-amber-50 text-amber-600 border-amber-200',
            '化学': 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200',
            '生物': 'bg-emerald-50 text-emerald-600 border-emerald-200',
            '历史': 'bg-stone-50 text-stone-600 border-stone-200',
            '地理': 'bg-teal-50 text-teal-600 border-teal-200',
            '政治': 'bg-red-50 text-red-600 border-red-200',
            '道德与法治': 'bg-blue-50 text-blue-600 border-blue-200',
            '信息技术': 'bg-cyan-50 text-cyan-600 border-cyan-200',
            '体育运动': 'bg-orange-50 text-orange-600 border-orange-200',
            '娱乐': 'bg-yellow-50 text-yellow-600 border-yellow-200',
            '兴趣班': 'bg-pink-50 text-pink-600 border-pink-200',
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
            '语文': 'from-rose-500 to-rose-600',
            '数学': 'from-indigo-500 to-indigo-600',
            '英语': 'from-sky-500 to-sky-600',
            '物理': 'from-amber-500 to-amber-600',
            '化学': 'from-fuchsia-500 to-fuchsia-600',
            '生物': 'from-emerald-500 to-emerald-600',
            '历史': 'from-stone-500 to-stone-600',
            '地理': 'from-teal-500 to-teal-600',
            '政治': 'from-red-500 to-red-600',
            '道德与法治': 'from-blue-500 to-blue-600',
            '信息技术': 'from-cyan-500 to-cyan-600',
            '体育运动': 'from-orange-500 to-orange-600',
            '娱乐': 'from-yellow-500 to-yellow-600',
            '兴趣班': 'from-pink-500 to-pink-600',
            '其他': 'from-slate-500 to-slate-600'
        };
        if (gradients[cat]) return gradients[cat];
        let hash = 0; for (let i = 0; i < (cat || '').length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
        const dynamicGradients = ['from-rose-500 to-rose-600', 'from-lime-500 to-lime-600', 'from-teal-500 to-teal-600', 'from-fuchsia-500 to-fuchsia-600', 'from-sky-500 to-sky-600'];
        return dynamicGradients[Math.abs(hash) % dynamicGradients.length];
    };

    const getIconForCategory = (cat) => {
        const iconMap = {
            '语文': 'BookOpen', '数学': 'Calculator', '英语': 'MessageCircle',
            '物理': 'Zap', '化学': 'FlaskConical', '生物': 'Leaf',
            '历史': 'Hourglass', '地理': 'Globe', '政治': 'Landmark',
            '道德与法治': 'Scale', '信息技术': 'Monitor', '体育运动': 'Dumbbell',
            '娱乐': 'Gamepad2', '兴趣班': 'Palette'
        };
        return iconMap[cat] || 'Star';
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
    const [lastSavedEndTime, setLastSavedEndTime] = useState(''); // Record last used end time to chain tasks

    const [planForm, setPlanForm] = useState({
        targetKids: ['all'], category: '技能', title: '', desc: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        repeatType: 'today', // 'today' | 'daily' | 'weekly_custom' | 'biweekly_custom' | 'ebbinghaus' | 'weekly_1' | 'biweekly_1' | 'monthly_1' | 'every_week_1' | 'every_biweek_1' | 'every_month_1'
        weeklyDays: [1, 2, 3, 4, 5], // 1=Mon, 7=Sun
        ebbStrength: 'normal',
        periodDaysType: 'any', // 'any' | 'workdays' | 'weekends' | 'custom'
        periodCustomDays: [1, 2, 3, 4, 5],
        periodTargetCount: 1,
        periodMaxPerDay: 1,
        periodMaxType: 'daily', // 'daily' | 'weekly'
        timeSetting: 'range', // 'none' | 'range' | 'duration' - Default to range as requested
        startTime: '', endTime: '', durationPreset: 25,
        pointRule: 'default', // 'default' | 'custom'
        reward: '', iconEmoji: '📚',
        habitColor: 'from-blue-400 to-blue-500',
        habitType: 'daily_once', // 'daily_once' | 'multiple'
        attachments: [],
        requireApproval: true // True by default for tasks granting coins
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
    const [previewTask, setPreviewTask] = useState(null); // Full task object for preview
    
    // Image Preview Zoom Modal State
    const [showImagePreviewModal, setShowImagePreviewModal] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);
    const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

    // Helper function to get weekly completion count
    const getWeeklyCompletionCount = (task, kidId, currentDStr) => {
        const currentDt = new Date(currentDStr);
        const day = currentDt.getDay() || 7;
        const weekStartDt = new Date(currentDt);
        weekStartDt.setDate(currentDt.getDate() - day + 1);
        weekStartDt.setHours(0, 0, 0, 0);

        const weekEndDt = new Date(weekStartDt);
        weekEndDt.setDate(weekStartDt.getDate() + 6);
        weekEndDt.setHours(23, 59, 59, 999);

        let weeklyCount = 0;
        const hist = task.history || {};
        Object.keys(hist).forEach(dStr => {
            const histDt = new Date(dStr);
            if (histDt >= weekStartDt && histDt <= weekEndDt) {
                const entry = task.kidId === 'all' ? hist[dStr]?.[kidId] : hist[dStr];
                if (entry && (entry.status === 'completed' || entry.status === 'pending_approval' || entry.status === 'in_progress')) {
                    weeklyCount += (entry.count || 1);
                }
            }
        });
        return weeklyCount;
    };

    // === 额外约束检查: N次任务防刷限制 ===
    const checkPeriodLimits = (task, kidId, selectedDStr) => {
        if (!task) return { canSubmit: true };

        // Ensure habits are always checked for daily/weekly limits
        if (task.type === 'habit') {
            const hist = task.history || {};
            const entry = task.kidId === 'all' ? hist[selectedDStr]?.[kidId] : hist[selectedDStr];
            const todayCount = entry?.count || (entry?.status === 'completed' ? 1 : 0);

            if (task.habitType === 'daily_once' && todayCount >= 1) {
                return { canSubmit: false, reason: '今天已经完整打过卡啦！' };
            }
            const maxPerDay = task.periodMaxPerDay || 3;
            if (task.habitType === 'multiple') {
                if (task.periodMaxType === 'weekly') {
                    const weekCount = getWeeklyCompletionCount(task, kidId, selectedDStr);
                    if (weekCount >= maxPerDay) {
                        return { canSubmit: false, reason: `本周已达最高上限(${maxPerDay}次)啦！` };
                    }
                } else {
                    // Default to 'daily'
                    if (todayCount >= maxPerDay) {
                        return { canSubmit: false, reason: `今天已达上限(${maxPerDay}次)啦！` };
                    }
                }
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

                // Optimistic UI updates
                setTasks(tasks.map(t => t.id === task.id ? { ...t, history: newHistory } : t));

                const targetKid = kids.find(k => k.id === activeKidId);
                let newExp = targetKid ? targetKid.exp : 0;
                let newBals = targetKid ? { ...targetKid.balances } : {};
                
                if (targetKid) {
                    const expDiff = Math.ceil((task.reward || 0) * 1.5);
                    newExp = Math.max(0, targetKid.exp + expDiff);
                     newBals = { ...targetKid.balances, spend: Math.max(0, targetKid.balances.spend + (task.reward || 0)) };
                     setKids(kids.map(k => k.id === activeKidId ? { ...k, exp: newExp, balances: newBals } : k));
                }

                if (task.reward !== 0) {
                    setTransactions(prev => [
                        { id: `trans_${Date.now()}_coin`, kidId: activeKidId, type: task.reward > 0 ? 'income' : 'expense', amount: Math.abs(task.reward || 0), title: `记录成长: ${task.title}`, date: new Date().toISOString(), category: 'task' },
                        { id: `trans_${Date.now()}_exp`, kidId: activeKidId, type: task.reward > 0 ? 'income' : 'expense', amount: Math.ceil(Math.abs(task.reward || 0) * 1.5), title: `记录成长: ${task.title}`, date: new Date().toISOString(), category: 'habit' },
                        ...prev
                    ]);
                }

                playSuccessSound();
                if (task.reward > 0) {
                    const messages = ["太棒了！你的坚持让家庭财富又增加啦！🌟", "自律的你，正在闪闪发光！✨", "一个小小的习惯，成就大大的未来！🚀", "付出总有回报，金币+1！💰", "保持良好的习惯，你是全家的骄傲！🏅"];
                    setCelebrationData({ task, message: messages[Math.floor(Math.random() * messages.length)], type: 'positive' });
                } else if (task.reward < 0) {
                    const messages = ["诚实是金！即使扣分，你的坦白也值得欣赏！🛡️", "知错能改，善莫大焉，下次一定能做好！💪", "勇敢承认错误，你已经赢了第一步！✨"];
                    setCelebrationData({ task, message: messages[Math.floor(Math.random() * messages.length)], type: 'negative' });
                } else {
                    notify("打卡成功！", "success");
                }

                // Background network sync
                apiFetch(`/api/tasks/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: newHistory }) }).catch(e => console.error(e));
                
                if (task.reward !== 0) {
                    apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kidId: activeKidId, type: task.reward > 0 ? 'income' : 'expense', amount: Math.abs(task.reward || 0), title: `记录成长: ${task.title}`, date: new Date().toISOString(), category: 'task' }) }).catch(e => console.error(e));
                    apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kidId: activeKidId, type: task.reward > 0 ? 'income' : 'expense', amount: Math.ceil(Math.abs(task.reward || 0) * 1.5), title: `记录成长: ${task.title}`, date: new Date().toISOString(), category: 'habit' }) }).catch(e => console.error(e));
                }

                if (targetKid) {
                    apiFetch(`/api/kids/${activeKidId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ exp: newExp, balances: newBals }) }).catch(e => console.error(e));
                }

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
        const id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        setNotifications(p => [...p, { id, msg, type }]);
        setTimeout(() => setNotifications(p => p.filter(n => n.id !== id)), 3000);
    };

    const playSuccessSound = () => {
        try {
            // Use a globally cached AudioContext to prevent severe main-thread freezing and memory leaks
            if (!window.AudioContext && !window.webkitAudioContext) return;
            
            if (!globalAudioCtx) {
                const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
                globalAudioCtx = new AudioCtxClass();
            }
            const ctx = globalAudioCtx;
            if (ctx.state === 'suspended') {
                ctx.resume(); // Force wake on iOS
            }

            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.type = 'sine';
            const now = ctx.currentTime;
            
            // Bright cheerful chime (C5 -> C6 sweep)
            oscillator.frequency.setValueAtTime(523.25, now);
            oscillator.frequency.exponentialRampToValueAtTime(1046.50, now + 0.1);
            
            gainNode.gain.setValueAtTime(0.5, now); // Start loud
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3); // Fade out quickly
            
            oscillator.start(now);
            oscillator.stop(now + 0.3);
            
            // Don't close the global context! Let it persist for subsequent plays


        } catch (e) {
            console.error("Audio playback failed:", e);
        }
    };

    const updateActiveKid = async (updates) => {
        try {
            await apiFetch(`/api/kids/${activeKidId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates)
            });
            setKids(kids.map(k => k.id === activeKidId ? { ...k, ...updates } : k));
        } catch (e) { console.error(e); notify("网络请求失败", "error"); }
    };

    const updateKidData = async (targetKidId, updates) => {
        try {
            await apiFetch(`/api/kids/${targetKidId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates)
            });
            setKids(prevKids => prevKids.map(k => k.id === targetKidId ? { ...k, ...updates } : k));
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

        playSuccessSound(); // Fire exactly on click to bypass iOS async suspensions

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
            notify("已快速完成并提交！等待家长审核。", "success");
        } catch (e) { notify("网络请求失败", "error"); }
    };

    const openQuickComplete = (task) => {
        const limits = checkPeriodLimits(task, activeKidId, selectedDate);
        if (!limits.canSubmit) return notify(limits.reason, 'error');

        setQuickCompleteTask(task);

        let dHours = 0;
        let dMinutes = 0;
        let sTime = '';
        
        const now = new Date();
        const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        let defaultMode = 'duration';

        if (task.timeStr) {
            // Check for range pattern HH:mm ~ HH:mm
            const rangeMatch = task.timeStr.match(/(\d{1,2}:\d{2})\s*(?:-|~|到|至)\s*(\d{1,2}:\d{2})/);
            
            // Check for duration pattern like 30分钟, 1小时, 1.5小时
            const minMatch = task.timeStr.match(/(\d+)\s*(?:分钟|min|m)/);
            const hrMatch = task.timeStr.match(/(\d+(?:\.\d+)?)\s*(?:小时|hour|hr|h|个钟)/);

            if (rangeMatch) {
                const [sH, sM] = rangeMatch[1].split(':').map(Number);
                const [eH, eM] = rangeMatch[2].split(':').map(Number);
                let diffMins = (eH * 60 + eM) - (sH * 60 + sM);
                if (diffMins < 0) diffMins += 24 * 60; // Handle cross-midnight logic if necessary
                
                // Subtract duration from now to get actual logical start time
                const startRealDate = new Date(now.getTime() - diffMins * 60000);
                sTime = `${String(startRealDate.getHours()).padStart(2, '0')}:${String(startRealDate.getMinutes()).padStart(2, '0')}`;
                
                dHours = Math.floor(diffMins / 60);
                dMinutes = diffMins % 60;
                defaultMode = 'actual';
            } else if (minMatch || hrMatch) {
                let totalM = 0;
                if (minMatch) {
                    totalM = parseInt(minMatch[1]);
                } else if (hrMatch) {
                    totalM = Math.round(parseFloat(hrMatch[1]) * 60);
                }
                
                dHours = Math.floor(totalM / 60);
                dMinutes = totalM % 60;
                
                // Calculate Logical Start Time = End Time (Now) - Target Duration
                const startRealDate = new Date(now.getTime() - totalM * 60000);
                sTime = `${String(startRealDate.getHours()).padStart(2, '0')}:${String(startRealDate.getMinutes()).padStart(2, '0')}`;
                
                defaultMode = 'duration';
            } else {
                // Check if it's just a single time like 20:00 (no endpoint known, fallback)
                const timeMatch = task.timeStr.match(/(\d{1,2}:\d{2})/);
                if (timeMatch) {
                    sTime = timeMatch[1].padStart(5, '0');
                    defaultMode = 'actual';
                }
            }
        }

        setQcTimeMode(defaultMode);
        setQcHours(dHours);
        setQcMinutes(dMinutes);
        setQcSeconds(0);
        setQcStartTime(sTime);
        setQcEndTime(nowStr);
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
        
        playSuccessSound(); // Fire exactly on click to bypass iOS async suspensions

        let spentStr = '';
        if (qcTimeMode === 'duration') {
            if (qcHours === 0 && qcMinutes === 0 && qcSeconds === 0) return notify('请填写耗时', 'error');
            spentStr = `${qcHours > 0 ? qcHours + '小时' : ''}${qcMinutes > 0 ? qcMinutes + '分钟' : ''}${qcSeconds > 0 ? qcSeconds + '秒' : ''}`;
        } else {
            spentStr = `${qcStartTime} ~ ${qcEndTime}`;
        }

        const taskToSubmit = quickCompleteTask;
        if (!taskToSubmit) return;

        // Auto-approve logic check
        const isAutoApprove = taskToSubmit.requireApproval === false;
        const finalStatus = isAutoApprove ? 'completed' : 'pending_approval';

        // Construct payload specifically based on whether history is 1D or 2D (unified)
        const histUpdate = { status: finalStatus, timeSpent: spentStr, note: qcNote, attachments: qcAttachments };
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

            if (isAutoApprove && taskToSubmit.reward > 0) {
                // Instantly generate transaction and family coins
                const newTrans = {
                    id: `trans_${Date.now()}`,
                    kidId: activeKidId,
                    type: 'income',
                    amount: taskToSubmit.reward || 0,
                    title: `完成: ${taskToSubmit.title}`,
                    date: new Date().toISOString(),
                    category: 'task'
                };
                await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTrans) });
                setTransactions(prev => [newTrans, ...prev]);

                const targetKid = kids.find(k => k.id === activeKidId);
                if (targetKid) {
                    const newBals = { ...targetKid.balances, spend: targetKid.balances.spend + (taskToSubmit.reward || 0) };
                    await updateActiveKid({ balances: newBals });
                    
                    // NEW DUAL REWARDS LOGIC: Gain EXP on task completion
                    if (taskToSubmit.reward > 0) {
                        const expGained = Math.ceil(taskToSubmit.reward * 1.5);
                        await handleExpChange(activeKidId, expGained);
                        notify(`打卡成功！获得 ${taskToSubmit.reward} 家庭币 和 ${expGained} 经验值！`, 'success');
                        return; // Exit early to use combined notification
                    }
                }
                notify(`打卡成功！已自动发放 ${taskToSubmit.reward} 家庭币！`, 'success');
            } else {
                notify('已提交审核，等待家长发放家庭币哦！', 'success');
            }
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
                if (task.reward > 0) {
                    // 1. Give Family Coins & Transaction (For Wealth Center)
                    const newTrans = {
                        id: `trans_${Date.now()}`,
                        kidId: task.kidId,
                        type: 'income',
                        amount: task.reward || 0,
                        title: `完成记录: ${task.title}`,
                        date: new Date().toISOString(),
                        category: 'task'
                    };
                    await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTrans) });

                    const expGained = Math.ceil((task.reward || 0) * 1.5);
                    // 2. Give EXP & Transaction (For Growth Footprints)
                    const expTrans = {
                        id: `trans_${Date.now()}_exp`,
                        kidId: task.kidId,
                        type: 'income',
                        amount: expGained,
                        title: `完成记录: ${task.title}`,
                        date: new Date().toISOString(),
                        category: 'habit'
                    };
                    await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expTrans) });
                    
                    setTransactions([newTrans, expTrans, ...transactions]);

                    const newBals = { ...targetKid.balances, spend: targetKid.balances.spend + task.reward };
                    await updateActiveKid({ balances: newBals });

                    await handleExpChange(task.kidId, expGained);
                    
                    notify(`打卡成功！已奖励 ${targetKid.name} ${task.reward} 家庭币 和 ${expGained} 经验！`, "success");
                } else {
                    // Penalty: Deduct EXP and Coins
                    const absPenalty = Math.abs(task.reward);
                    const newBals = { ...targetKid.balances, spend: Math.max(0, targetKid.balances.spend - absPenalty) };
                    await updateActiveKid({ balances: newBals });
                    
                    const expPenalty = Math.ceil(absPenalty * 1.5);

                    const refundTrans = {
                        id: `trans_${Date.now()}_penalty`,
                        kidId: task.kidId,
                        type: 'expense',
                        amount: absPenalty,
                        title: `违规扣分: ${task.title}`,
                        date: new Date().toISOString(),
                        category: 'task'
                    };
                    const expRefundTrans = {
                        id: `trans_${Date.now()}_penalty_exp`,
                        kidId: task.kidId,
                        type: 'expense',
                        amount: expPenalty,
                        title: `违规扣分: ${task.title}`,
                        date: new Date().toISOString(),
                        category: 'habit'
                    };
                    await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(refundTrans) });
                    await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expRefundTrans) });
                    setTransactions(prev => [refundTrans, expRefundTrans, ...prev]);

                    await handleExpChange(task.kidId, -expPenalty);
                    
                    notify(`已扣除 ${targetKid.name} ${absPenalty} 家庭币和 ${expPenalty} 经验。`, "error");
                }
            }
        } catch (e) { notify("网络请求失败", "error"); }
    };

    const handleRejectTask = async (task, dateStr, kidId, reason = '') => {
        try {
            const oldHistory = task.history && task.history[dateStr] && task.history[dateStr][kidId] ? task.history[dateStr][kidId] : {};
            
            // Revert state -> 'failed' instead of 'todo' so it stays logged but child can restart
            const histUpdates = { ...task.history };
            if (!histUpdates[dateStr]) histUpdates[dateStr] = {};
            histUpdates[dateStr] = {
                ...histUpdates[dateStr],
                [kidId]: { ...oldHistory, status: 'failed', rejectFeedback: reason } // preserve timeSpent and current note, add feedback
            };

            await apiFetch(`/api/tasks/${task.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: histUpdates })
            });

            setTasks(tasks.map(t => t.id === task.id ? { ...t, history: histUpdates } : t));

            // Reverse reward/penalty if was previously completed
            if (oldHistory.status === 'completed') {
                const isStudy = task.type === 'study';
                let absReward = Math.abs(task.reward || 0);

                if (isStudy && absReward > 0) {
                    const targetKid = kids.find(k => String(k.id) === String(kidId));
                    if (targetKid) {
                        const newBal = Math.max(0, targetKid.balances.spend - absReward);
                        
                        await apiFetch(`/api/kids/${kidId}`, {
                            method: 'PUT', headers: { 'Content-Type': 'application/json' }, 
                            body: JSON.stringify({ balances: { ...targetKid.balances, spend: newBal } })
                        });
                        setKids(kids.map(k => String(k.id) === String(kidId) ? { ...k, balances: { ...k.balances, spend: newBal } } : k));
                        
                        // Create negative transaction to balance ledger
                        const refundTrans = {
                            id: `trans_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                            kidId: kidId,
                            type: 'expense',
                            amount: absReward,
                            title: `未达标撤回: ${task.title}`,
                            date: new Date().toISOString(),
                            category: 'task'
                        };
                        await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(refundTrans) });
                        setTransactions([refundTrans, ...transactions]);
                    }
                } else if (!isStudy) {
                    const absReward = Math.abs(task.reward || 0);
                    const targetKid = kids.find(k => String(k.id) === String(kidId));
                    if (targetKid) {
                        if (task.reward > 0) {
                            // Reverse positive habit logic: Deduct Coins & EXP
                            const newBal = Math.max(0, targetKid.balances.spend - absReward);
                            const newExp = Math.max(0, targetKid.exp - Math.ceil(absReward * 1.5));
                            
                            await apiFetch(`/api/kids/${kidId}`, {
                                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ balances: { ...targetKid.balances, spend: newBal }, exp: newExp })
                            });
                            setKids(kids.map(k => String(k.id) === String(kidId) ? { ...k, balances: { ...k.balances, spend: newBal }, exp: newExp } : k));
                            
                            // Negative reversed transaction
                            const refundTrans = {
                                id: `trans_${Date.now()}_reversed_coin`,
                                kidId: kidId,
                                type: 'expense',
                                amount: absReward,
                                title: `违规撤回记录: ${task.title}`,
                                date: new Date().toISOString(),
                                category: 'task'
                            };
                            const expRefundTrans = {
                                id: `trans_${Date.now()}_reversed_exp`,
                                kidId: kidId,
                                type: 'expense',
                                amount: Math.ceil(absReward * 1.5),
                                title: `违规撤回记录: ${task.title}`,
                                date: new Date().toISOString(),
                                category: 'habit'
                            };
                            await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(refundTrans) });
                            await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expRefundTrans) });
                            setTransactions([refundTrans, expRefundTrans, ...transactions]);
                        } else {
                            // Reverse penalty: Refund Coins & EXP
                            const newBal = targetKid.balances.spend + absReward;
                            const newExp = targetKid.exp + Math.ceil(absReward * 1.5);
                            
                            await apiFetch(`/api/kids/${kidId}`, {
                                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ balances: { ...targetKid.balances, spend: newBal }, exp: newExp })
                            });
                            setKids(kids.map(k => String(k.id) === String(kidId) ? { ...k, balances: { ...k.balances, spend: newBal }, exp: newExp } : k));
                            
                            // Positive refund transaction
                            const refundTrans = {
                                id: `trans_${Date.now()}_refund_coin`,
                                kidId: kidId,
                                type: 'income',
                                amount: absReward,
                                title: `补偿撤销扣分: ${task.title}`,
                                date: new Date().toISOString(),
                                category: 'task'
                            };
                            const expRefundTrans = {
                                id: `trans_${Date.now()}_refund_exp`,
                                kidId: kidId,
                                type: 'income',
                                amount: Math.ceil(absReward * 1.5),
                                title: `补偿撤销扣分: ${task.title}`,
                                date: new Date().toISOString(),
                                category: 'habit'
                            };
                            await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(refundTrans) });
                            await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expRefundTrans) });
                            setTransactions([refundTrans, expRefundTrans, ...transactions]);
                        }
                    }
                }
            } // ADDED MISSING CLOSING BRACE

            if (editingTask && editingTask.id === task.id) {
                setEditingTask({ ...task, history: histUpdates });
            }

            notify(oldHistory.status === 'completed' ? "已打回为不达标状态，并撤回相关奖励！" : "已打回为不达标状态", "success");
        } catch (e) {
            console.error(e);
            notify("操作失败", "error");
        }
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

            // Increase Balances & EXP
            const kid = kids.find(k => k.id === actualKidId);
            if (kid && task.reward > 0) {
                const newBals = { ...kid.balances, spend: kid.balances.spend + task.reward };
                
                // NEW DUAL REWARDS LOGIC: Parent Approval gives EXP
                const expGained = Math.ceil(task.reward * 1.5);
                let newExp = kid.exp + expGained;
                let newLevel = kid.level;
                
                // Manual fast-forward level loop for combined backend call
                while (newExp >= getLevelReq(newLevel)) {
                    newExp -= getLevelReq(newLevel);
                    newLevel++;
                    notify(`太棒了！${kid.name} 升到了 Lv.${newLevel}！`, "success");
                }
                
                await apiFetch(`/api/kids/${actualKidId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ balances: newBals, exp: newExp, level: newLevel }) });
                setKids(prevKids => prevKids.map(k => k.id === actualKidId ? { ...k, balances: newBals, exp: newExp, level: newLevel } : k));
                
                notify(`已审批！奖励 ${task.reward} 家庭币和 ${expGained} 经验值！`, "success");
            }
        } catch (e) { notify("网络请求失败", "error"); }
    };

    const handleApproveAllTasks = async (approvalsList) => {
        if (!approvalsList || approvalsList.length === 0) return;

        try {
            const timestamp = Date.now();
            let newTransactions = [];
            let kidRewardTotals = {}; // Map of kidId -> total reward
            let taskUpdates = {}; // Map of taskId -> newHistory

            // 1. Process all approvals logically
            for (let i = 0; i < approvalsList.length; i++) {
                const { task, date, actualKidId } = approvalsList[i];

                // Track rewards per kid
                if (task.reward > 0) {
                    kidRewardTotals[actualKidId] = (kidRewardTotals[actualKidId] || 0) + task.reward;
                    newTransactions.push({
                        id: `trans_${timestamp}_${i}`,
                        kidId: actualKidId,
                        type: 'income',
                        amount: task.reward || 0,
                        title: `完成: ${task.title}`,
                        date: new Date().toISOString(),
                        category: 'task'
                    });
                }

                // Compile task history updates
                if (!taskUpdates[task.id]) {
                    taskUpdates[task.id] = { ...(task.history || {}) };
                }
                const histUpdate = { status: 'completed' };
                if (task.kidId === 'all') {
                    taskUpdates[task.id][date] = { ...(taskUpdates[task.id][date] || {}), [actualKidId]: { ...(taskUpdates[task.id][date]?.[actualKidId] || {}), ...histUpdate } };
                } else {
                    taskUpdates[task.id][date] = { ...(taskUpdates[task.id][date] || {}), ...histUpdate };
                }
            }

            // 2. Execute Backend Calls
            const promises = [];
            // Post transactions
            for (const trans of newTransactions) {
                promises.push(apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(trans) }));
            }
            // Update tasks
            for (const taskId in taskUpdates) {
                promises.push(apiFetch(`/api/tasks/${taskId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: taskUpdates[taskId] }) }));
            }
            // Update kids balances and EXP
            for (const kidId in kidRewardTotals) {
                const kid = kids.find(k => k.id === kidId);
                if (kid) {
                    const newBals = { ...kid.balances, spend: kid.balances.spend + kidRewardTotals[kidId] };
                    
                    const totalExpGained = Math.ceil(kidRewardTotals[kidId] * 1.5);
                    let newExp = kid.exp + totalExpGained;
                    let newLevel = kid.level;
                    
                    while (newExp >= getLevelReq(newLevel)) {
                        newExp -= getLevelReq(newLevel);
                        newLevel++;
                    }
                    
                    promises.push(apiFetch(`/api/kids/${kidId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ balances: newBals, exp: newExp, level: newLevel }) }));
                }
            }

            await Promise.all(promises);

            // 3. Update React State Bulk
            if (newTransactions.length > 0) {
                setTransactions(prev => [...newTransactions, ...prev]);
            }

            setTasks(prevTasks => prevTasks.map(t => {
                if (taskUpdates[t.id]) {
                    return { ...t, history: taskUpdates[t.id] };
                }
                return t;
            }));

            apiFetch('/api/kids').then(r => r.json()).then(setKids).catch(console.error); // Reload kids to get fresh balances across the board
            notify(`一键审批完成！共计发放了 ${Object.values(kidRewardTotals).reduce((a, b) => a + b, 0) || 0} 家庭币。`, "success");

        } catch (e) {
            notify("批量审批网络请求部分失败，请刷新页面查看最新状态", "error");
            console.error(e);
        }
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

    const getDefaultTimeRange = () => {
        if (!lastSavedEndTime) return { start: "17:00", end: "18:00" };
        const [h, m] = lastSavedEndTime.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return { start: "17:00", end: "18:00" };
        const endH = (h + 1) % 24;
        return {
            start: lastSavedEndTime,
            end: `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        };
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
                'weekly_custom': '按周重复',
                'biweekly_custom': '按双周重复',
                'ebbinghaus': '记忆曲线',
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
            frequency = planForm.habitType === 'daily_once' ? '每日一次' : (planForm.periodMaxType === 'weekly' ? `每周 ${planForm.periodMaxPerDay} 次` : `每日 ${planForm.periodMaxPerDay} 次`);
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
                standards: planForm.desc || "",
                iconEmoji: planForm.iconEmoji,
                requireApproval: planForm.requireApproval,
                periodMaxPerDay: planType === 'habit' ? Number(planForm.periodMaxPerDay) : undefined,
                periodMaxType: planType === 'habit' ? planForm.periodMaxType : undefined
            };
            try {
                await apiFetch(`/api/tasks/${editingTask.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                });
                setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...updates } : t));
                if (planType === 'study' && planForm.timeSetting === 'range' && planForm.endTime) {
                    setLastSavedEndTime(planForm.endTime);
                }
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
            type: planType, status: 'todo', iconEmoji: planForm.iconEmoji, standards: planForm.desc || "",
            category: planType === 'study' ? planForm.category : "行为",
            catColor: color,
            frequency: frequency, timeStr: timeStr,
            startDate: planForm.startDate,
            pointRule: planForm.pointRule,
            habitType: planForm.habitType,
            attachments: planForm.attachments || [],
            requireApproval: planForm.requireApproval,
            periodMaxPerDay: planType === 'habit' ? Number(planForm.periodMaxPerDay) : undefined,
            periodMaxType: planType === 'habit' ? planForm.periodMaxType : undefined,
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

        if (!planForm.targetKids) planForm.targetKids = [planForm.targetKid || 'all'];
        
        if (planForm.targetKids.includes('all') || planForm.targetKids.length === kids.length) {
            // Unify logic: DB has one task, kidId = 'all'
            newTasks = [{ ...baseTask, kidId: 'all' }];
        } else {
            // Assign localized task as per usual for single/multiple selection
            newTasks = planForm.targetKids.map(id => ({ ...baseTask, kidId: id }));
        }

        try {
            await Promise.all(newTasks.map(task =>
                apiFetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task) })
            ));
            setTasks([...tasks, ...newTasks]);
            if (planType === 'study' && planForm.timeSetting === 'range' && planForm.endTime) {
                setLastSavedEndTime(planForm.endTime);
            }
            setShowAddPlanModal(false);
            setPlanForm({
                targetKids: ['all'], category: '技能', title: '', desc: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                repeatType: 'today', timeSetting: 'none',
                weeklyDays: [1, 2, 3, 4, 5], ebbStrength: 'normal',
                periodDaysType: 'any', periodCustomDays: [1, 2, 3, 4, 5],
                periodTargetCount: 1, periodMaxPerDay: 1,
                startTime: '', endTime: '', durationPreset: 25,
                pointRule: 'default', reward: '', iconEmoji: '📚', iconName: getIconForCategory('语文'),
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
                        changeAppState('parent_app');
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
            changeAppState('parent_app');
        }
    };

    const switchKid = (kidId) => {
        changeActiveKid(kidId);
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

    const getIncompleteStudyTasksCount = (dateStr) => {
        let count = 0;
        let total = 0;
        if (appState === 'kid_app') {
            const dailyTasks = tasks.filter(t => (t.kidId === activeKidId || t.kidId === 'all') && t.type === 'study' && isTaskDueOnDate(t, dateStr));
            count = dailyTasks.filter(t => getTaskStatusOnDate(t, dateStr, activeKidId) !== 'completed').length;
            total = dailyTasks.length;
        } else if (appState === 'parent_app') {
            const dailyTasks = tasks.filter(t => {
                if (parentKidFilter !== 'all' && t.kidId !== 'all' && t.kidId !== parentKidFilter) return false;
                return t.type === 'study' && isTaskDueOnDate(t, dateStr);
            });
            total = dailyTasks.length;
            dailyTasks.forEach(t => {
                if (parentKidFilter === 'all') {
                    const targetedKids = t.kidId === 'all' ? kids : [kids.find(k => k.id === t.kidId)].filter(Boolean);
                    targetedKids.forEach(k => {
                        if (getTaskStatusOnDate(t, dateStr, k.id) !== 'completed') count++;
                    });
                } else {
                    if (getTaskStatusOnDate(t, dateStr, parentKidFilter) !== 'completed') count++;
                }
            });
        }
        return { count, total };
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

                        <div className="flex items-center justify-between mb-4 sm:mb-6 px-1 sm:px-4 py-1.5 sm:py-2 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                            <button onClick={() => changeMonth(-1)} className="p-1 sm:p-2 text-indigo-600 hover:bg-white shadow-sm hover:shadow rounded-full transition-all"><Icons.ChevronLeft size={18} className="sm:w-[20px] sm:h-[20px]" /></button>
                            <div className="font-black text-lg sm:text-xl text-slate-800 tracking-wide drop-shadow-sm flex items-center gap-1">
                                {monthViewDate.getMonth() + 1} <span className="text-sm font-bold text-indigo-500">月</span>
                            </div>
                            <button onClick={() => changeMonth(1)} className="p-1 sm:p-2 text-indigo-600 hover:bg-white shadow-sm hover:shadow rounded-full transition-all"><Icons.ChevronRight size={18} className="sm:w-[20px] sm:h-[20px]" /></button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center mb-2 px-1 sm:px-2">
                            {['一', '二', '三', '四', '五', '六', '日'].map((d, idx) => (
                                <div key={d} className={`text-[10px] sm:text-xs font-bold py-1.5 sm:py-2 ${idx >= 5 ? 'text-rose-400' : 'text-slate-400'}`}>{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 px-1 sm:px-2">
                            {getDaysInMonth(monthViewDate.getFullYear(), monthViewDate.getMonth()).map((dayObj, i) => {
                                const isSelected = dayObj.dateStr === selectedDate;
                                const isToday = dayObj.dateStr === formatDate(new Date());
                                const { count, total } = getIncompleteStudyTasksCount(dayObj.dateStr);

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleDayClick(dayObj.dateStr)}
                                        className={`
                                                aspect-square flex flex-col items-center justify-center rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold transition-all relative pt-2
                                                ${!dayObj.isCurrentMonth ? 'text-slate-300 pointer-events-none scale-95 opacity-50' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer hover:scale-105 active:scale-95'}
                                                ${isSelected && dayObj.isCurrentMonth ? '!bg-indigo-600 !text-white shadow-lg shadow-indigo-600/40 scale-105 z-10' : ''}
                                                ${isToday && !isSelected && dayObj.isCurrentMonth ? '!bg-yellow-400 !text-yellow-900 shadow-sm' : ''}
                                            `}
                                    >
                                        <span className="mb-0.5">{dayObj.day}</span>
                                        <div className="h-3.5 flex items-center justify-center mb-1 w-full">
                                            {count > 0 && dayObj.isCurrentMonth ? (
                                                <span className={`text-[9px] font-bold px-[4px] py-[1px] leading-none rounded-full ${isSelected ? 'bg-indigo-400/50 text-white' : 'bg-red-100 text-red-600'}`}>
                                                    {count}
                                                </span>
                                            ) : (total > 0 && dayObj.isCurrentMonth ? (
                                                <span className={`text-[10px] ${isSelected ? 'text-indigo-300' : 'text-emerald-500'}`}><Icons.Check size={10} /></span>
                                            ) : null)}
                                        </div>
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
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pb-[5rem] md:pb-4 animate-fade-in">
                <div className="bg-white w-full max-w-sm rounded-[2rem] p-5 md:p-6 shadow-2xl text-left max-h-[75vh] md:max-h-[85vh] overflow-y-auto">
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
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pb-[5rem] md:pb-4 animate-fade-in">
                <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl text-left max-h-[75vh] md:max-h-[90vh] overflow-y-auto">
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
                                <div className={`px-4 py-1.5 rounded-full text-xs font-black shadow-inner flex items-center gap-1.5 float-right ${getCategoryColor(t.category || '计划').replace('text-', 'bg-').replace('600', '500')} text-white`}>
                                    {t.category || '任务'}
                                </div>
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
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 min-w-0">
                                        <label className="text-[11px] font-bold text-slate-500 mb-1 block text-center">开始时间</label>
                                        <input type="time" value={qcStartTime} onChange={e => setQcStartTime(e.target.value)}
                                            className="w-full box-border bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-1 text-center text-sm font-black text-slate-800 outline-none focus:border-indigo-400 transition-colors" />
                                    </div>
                                    <span className="text-slate-300 font-bold mt-5">-</span>
                                    <div className="flex-1 min-w-0">
                                        <label className="text-[11px] font-bold text-slate-500 mb-1 block text-center">结束时间</label>
                                        <input type="time" value={qcEndTime} onChange={e => setQcEndTime(e.target.value)}
                                            className="w-full box-border bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-1 text-center text-sm font-black text-slate-800 outline-none focus:border-indigo-400 transition-colors" />
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

    const renderImagePreviewModal = () => {
        if (!showImagePreviewModal || !previewImages || previewImages.length === 0) return null;

        const currentImg = previewImages[currentPreviewIndex];

        return (
            <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col animate-fade-in">
                {/* Header Toolbar */}
                <div className="flex items-center justify-between p-4 text-white/50 absolute top-0 left-0 right-0 z-10">
                    <div className="text-sm font-bold bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        {currentPreviewIndex + 1} / {previewImages.length}
                    </div>
                    <div className="flex gap-4">
                        <a 
                            href={currentImg.data || currentImg.url} 
                            download={currentImg.name || 'minilife-evidence.jpg'}
                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm cursor-pointer"
                            title="下载原始图片"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                        </a>
                        <button 
                            onClick={() => { setShowImagePreviewModal(false); setPreviewImages([]); }}
                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm"
                        >
                            <Icons.X size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 relative flex items-center justify-center overflow-hidden p-4 md:p-8 mt-16 md:mt-0">
                    {previewImages.length > 1 && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPreviewIndex(prev => (prev > 0 ? prev - 1 : previewImages.length - 1));
                            }}
                            className="absolute left-2 md:left-8 z-20 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all shadow-xl"
                        >
                            <Icons.ChevronLeft size={28} />
                        </button>
                    )}

                    <img 
                        src={currentImg.data || currentImg.url} 
                        alt={currentImg.name || "Evidence"} 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-300"
                    />

                    {previewImages.length > 1 && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPreviewIndex(prev => (prev < previewImages.length - 1 ? prev + 1 : 0));
                            }}
                            className="absolute right-2 md:right-8 z-20 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all shadow-xl"
                        >
                            <Icons.ChevronRight size={28} />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const confirmRejectTask = async () => {
        if (!rejectingTaskInfo) return;
        await handleRejectTask(rejectingTaskInfo.task, rejectingTaskInfo.dateStr, rejectingTaskInfo.kidId, rejectReason);
        setShowRejectModal(false);
        setRejectingTaskInfo(null);
        setRejectReason('');
    };

    const renderRejectModal = () => {
        if (!showRejectModal || !rejectingTaskInfo) return null;
        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl text-left">
                    <h2 className="text-xl font-black text-rose-600 mb-2">打回</h2>
                    <p className="text-slate-500 text-sm mb-6">觉得孩子完成的不够好？写下原因让Ta修改吧：</p>
                    <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="例如：字迹太潦草了，请重新写一遍..." className="w-full bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm font-medium outline-none focus:border-rose-400 focus:bg-white h-28 resize-none mb-6 placeholder:text-rose-300 transition-colors" />
                    <div className="flex gap-3">
                        <button onClick={() => { setShowRejectModal(false); setRejectingTaskInfo(null); setRejectReason(''); }} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200">取消</button>
                        <button onClick={confirmRejectTask} className="flex-[2] py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white font-black shadow-lg shadow-rose-500/30 rounded-xl hover:scale-105 transition-all">确认打回</button>
                    </div>
                </div>
            </div>
        );
    };



    const confirmPenalty = () => {
        if (!penaltyTaskContext || penaltySelectedKidIds.length === 0) return;
        
        const penalty = Math.abs(penaltyTaskContext.reward);
        let kidsUpdated = false;
        
        penaltySelectedKidIds.forEach(targetKidId => {
            const targetKid = kids.find(k => k.id === targetKidId);
            if (!targetKid) return;

            // Enforce limit check for manual parental deductions (same as kid attempts)
            const todayStr = formatDate(new Date());
            const kidHistory = penaltyTaskContext.history || {};
            const todayHist = kidHistory[todayStr] || {};
            const kidTodayData = penaltyTaskContext.kidId === 'all' ? (todayHist[targetKidId] || {}) : todayHist;
            
            // Check limit based on target kid, just to be safe they haven't maxed it
            const maxAllowed = penaltyTaskContext.maxPerDay || 1;
            const attemptsToday = Array.isArray(kidTodayData) ? kidTodayData.length : (kidTodayData.status ? 1 : 0);
            
            if (attemptsToday >= maxAllowed) {
                notify(`${targetKid.name} 的此项记录今日已达上限，无法继续扣除。`, "warning");
                return; // Skip this child, they reached the limit
            }

            kidsUpdated = true;
            
            // 1. Update balances
            const newBals = { ...targetKid.balances, spend: Math.max(0, targetKid.balances.spend - penalty) };
            const newExp = Math.max(0, targetKid.exp - Math.ceil(penalty * 1.5));
            apiFetch(`/api/kids/${targetKid.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ balances: newBals, exp: newExp }) });
            setKids(prevKids => prevKids.map(k => k.id === targetKid.id ? { ...k, balances: newBals, exp: newExp } : k));
            
            // 2. Post transaction
            const refundTrans = { id: `trans_${Date.now()}_penalty_${targetKid.id}`, kidId: targetKid.id, type: 'expense', amount: penalty, title: `手动惩罚: ${penaltyTaskContext.title}`, date: new Date().toISOString(), category: 'task' };
            apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(refundTrans) });
            setTransactions(prev => [refundTrans, ...prev]);
            notify(`已记录惩罚，扣除 ${targetKid.name} ${penalty} 家庭币！`, "error");

            // 3. Update Task history so next time it knows attemptsToday is incremented
            let newHist = { ...kidHistory };
            const newRecord = { status: 'completed', attemptId: `attempt_${Date.now()}_${targetKidId}` };
            
            if (penaltyTaskContext.kidId === 'all') {
                if (!newHist[todayStr]) newHist[todayStr] = {};
                if (!newHist[todayStr][targetKidId]) newHist[todayStr][targetKidId] = [];
                // If it was an object (old format without multi-record), convert to array logic or just push if array
                if (!Array.isArray(newHist[todayStr][targetKidId])) {
                     if (newHist[todayStr][targetKidId].status) newHist[todayStr][targetKidId] = [newHist[todayStr][targetKidId]];
                     else newHist[todayStr][targetKidId] = [];
                }
                newHist[todayStr][targetKidId].push(newRecord);
            } else {
                 if (!newHist[todayStr]) newHist[todayStr] = [];
                 if (!Array.isArray(newHist[todayStr])) {
                     if (newHist[todayStr].status) newHist[todayStr] = [newHist[todayStr]];
                     else newHist[todayStr] = [];
                 }
                 newHist[todayStr].push(newRecord);
            }
            apiFetch(`/api/tasks/${penaltyTaskContext.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: newHist }) });
            setTasks(prev => prev.map(t => t.id === penaltyTaskContext.id ? { ...t, history: newHist } : t));
        });
        
        if (kidsUpdated) {
            setShowPenaltyModal(false);
            setPenaltyTaskContext(null);
        }
    };

    const toggleKidSelectionPenalty = (kidId) => {
        setPenaltySelectedKidIds(prev => 
            prev.includes(kidId) ? prev.filter(id => id !== kidId) : [...prev, kidId]
        );
    };

    const renderPenaltyModal = () => {
        if (!showPenaltyModal || !penaltyTaskContext) return null;
        
        const availableKids = penaltyTaskContext.kidId === 'all' 
            ? kids 
            : kids.filter(k => k.id === penaltyTaskContext.kidId);

        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in pb-12">
                <div className="bg-white w-full max-w-sm rounded-[2rem] p-5 shadow-2xl text-left border-[3px] border-white/50">
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-2 text-2xl">
                            🚨
                        </div>
                        <h2 className="text-lg font-black text-slate-800">确认扣分对象</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 text-center">
                            请勾选要扣除 <span className="text-red-500 text-sm font-extrabold">{Math.abs(penaltyTaskContext.reward)}</span> 家庭币的孩子<br/>
                            <span className="text-[10px] text-slate-400 font-normal">(单据限制: {penaltyTaskContext.maxPerDay || 1}次/天)</span>
                        </p>
                    </div>

                    {availableKids.length > 1 && (
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-400">选择受罚对象 ({availableKids.length} 人)</span>
                            <button 
                                onClick={() => {
                                    if (penaltySelectedKidIds.length === availableKids.length) {
                                        setPenaltySelectedKidIds([]); // Deselect all
                                    } else {
                                        setPenaltySelectedKidIds(availableKids.map(k => k.id)); // Select all
                                    }
                                }}
                                className="text-xs font-black transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-transparent hover:border-slate-200 hover:bg-slate-50 active:bg-slate-100"
                                style={{ color: penaltySelectedKidIds.length === availableKids.length ? '#f43f5e' : '#64748b' }}
                            >
                                <Icons.CheckSquare size={14} />
                                {penaltySelectedKidIds.length === availableKids.length ? '取消全选' : '全部选中'}
                            </button>
                        </div>
                    )}

                    <div className="space-y-2.5 mb-5 max-h-[35vh] overflow-y-auto pr-1 custom-scrollbar">
                        {availableKids.map(k => {
                            const isSelected = penaltySelectedKidIds.includes(k.id);
                            return (
                                <button
                                    key={k.id}
                                    onClick={() => toggleKidSelectionPenalty(k.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-red-500 bg-red-50 shadow-inner' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-2xl border border-slate-200 shadow-sm shrink-0">
                                        {k.avatar}
                                    </div>
                                    <span className={`font-black text-left flex-1 ${isSelected ? 'text-red-700' : 'text-slate-700'}`}>{k.name}</span>
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isSelected ? 'border-red-500 bg-red-500' : 'border-slate-300'}`}>
                                        {isSelected && <Icons.Check size={14} className="text-white" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setShowPenaltyModal(false)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200">取消</button>
                        <button 
                            disabled={penaltySelectedKidIds.length === 0}
                            onClick={confirmPenalty} 
                            className="flex-[2] py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-black shadow-lg shadow-red-500/30 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            执行扣分
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderKidPreviewModal = () => {
        if (!showPreviewModal || !previewTask) return null;

        // Evaluate the correct kid context for parents viewing 'All Kids'
        let resolvedKidId = activeKidId;
        if (appState === 'parent_app' && activeKidId === 'all') {
            resolvedKidId = kids.length > 0 ? kids[0].id : activeKidId;
        }

        // Extract history specific to resolvedKidId
        let kidHistory = {};
        if (previewTask.kidId === 'all') {
            Object.entries(previewTask.history || {}).forEach(([date, dateObj]) => {
                if (dateObj[resolvedKidId]) {
                    kidHistory[date] = dateObj[resolvedKidId];
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
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 pb-[5rem] md:pb-4 animate-fade-in overflow-y-auto">
                <div className="bg-white w-full max-w-md rounded-[2rem] p-5 md:p-8 shadow-2xl relative overflow-hidden my-auto max-h-[75vh] md:max-h-[85vh] flex flex-col">
                    {/* Ultra-Compact Header */}
                    <div className="absolute top-3 right-3 z-50">
                        <button onClick={() => { setShowPreviewModal(false); setPreviewTask(null); }} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                            <Icons.X size={16} />
                        </button>
                    </div>

                    <div className="relative z-10 flex items-start gap-3 shrink-0 mb-4 pr-10 border-b border-slate-100 pb-4">
                        <div className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${getCategoryGradient(previewTask.category || '计划任务')} flex items-center justify-center ${previewTask.type === 'habit' ? 'text-2xl' : 'text-white'} shadow-sm`}>
                            {previewTask.type === 'habit'
                                ? (previewTask.iconEmoji || '⭐')
                                : renderIcon(previewTask.iconName || getIconForCategory(previewTask.category), previewTask.type === 'habit' ? 28 : 22)
                            }
                        </div>
                        <div className="flex flex-col min-w-0 pt-0.5 mt-[-2px]">
                            <div className="flex items-center mb-1">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${previewTask.type === 'habit' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {previewTask.category || '计划任务'}
                                </span>
                            </div>
                            <h2 className="text-base font-black text-slate-800 leading-tight line-clamp-2">{previewTask.title}</h2>
                        </div>
                    </div>

                    <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4 md:mb-6">
                        {/* Review Mode Overlay for Parents */}
                        {(appState === 'parent_app' && getTaskStatusOnDate(previewTask, selectedDate, resolvedKidId) === 'pending_approval') ? (
                            <div className="w-full text-left space-y-4 mb-6">
                                <div className="text-sm font-black text-rose-600 mb-2 flex items-center gap-2">
                                    <Icons.Clock size={16} /> 待审核验收
                                </div>
                                <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100 flex flex-col gap-3">
                                    {(() => {
                                        const hr = kidHistory[selectedDate];
                                        if (!hr) return <div className="text-slate-400 text-sm font-bold">暂无提交记录</div>;
                                        return (
                                            <>
                                                {hr.actualTimeStr && (
                                                    <div className="flex items-start gap-2 text-sm">
                                                        <span className="text-orange-400 mt-0.5"><Icons.Clock size={14}/></span>
                                                        <span className="font-bold text-slate-700">实际时间: <span className="text-orange-600 font-black tracking-wide ml-1">{hr.actualTimeStr}</span></span>
                                                    </div>
                                                )}
                                                {hr.actualDuration && (
                                                    <div className="flex items-start gap-2 text-sm">
                                                        <span className="text-orange-400 mt-0.5"><Icons.Play size={14} fill="currentColor"/></span>
                                                        <span className="font-bold text-slate-700">总耗时: <span className="text-orange-600 font-black tracking-wide ml-1">{hr.actualDuration}</span></span>
                                                    </div>
                                                )}
                                                {hr.note && (
                                                    <div className="flex items-start gap-2 text-sm">
                                                        <span className="text-orange-400 mt-0.5"><Icons.MessageCircle size={14}/></span>
                                                        <span className="font-bold text-slate-600 leading-relaxed bg-white px-3 py-2 rounded-xl border border-orange-100 w-full shadow-sm"><span className="text-slate-400 text-xs mr-2 block mb-1">孩子留言:</span>{hr.note}</span>
                                                    </div>
                                                )}
                                                {hr.attachments && hr.attachments.length > 0 && (
                                                    <div className="mt-2">
                                                        <span className="text-slate-400 text-xs font-bold mr-2 block mb-2">图片/视频证据:</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {hr.attachments.map((url, i) => (
                                                                <div key={i} onClick={(e) => { e.stopPropagation(); setPreviewImages(hr.attachments); setPreviewImageIndex(i); setShowImagePreviewModal(true); }} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md cursor-pointer hover:border-orange-300 hover:scale-105 transition-all">
                                                                    {(typeof url === 'string' && (url.endsWith('.mp4') || url.endsWith('.webm'))) ? (
                                                                        <video src={url} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <img src={typeof url === 'string' ? url : (url.url || url)} className="w-full h-full object-cover" alt="证据" />
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left space-y-4 mb-6">
                                {/* 执行频次 */}
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Icons.RefreshCw size={16} /></div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 mb-0.5">执行频次</div>
                                        <div className="text-sm font-black text-slate-700">
                                            {previewTask.frequency || '每天'}
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
                                            {previewTask.pointRule === 'custom' ? `固定得 ${previewTask.reward} ${previewTask.type === 'habit' ? '家庭币' : '家庭币'}` : `系统自动计算 (${previewTask.reward} ${previewTask.type === 'habit' ? '家庭币' : '家庭币'})`}
                                        </div>
                                    </div>
                                </div>
                                {/* 任务说明 */}
                                {(previewTask.desc || previewTask.standards) && (
                                    <div className="flex items-start gap-3 border-t border-slate-200 pt-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"><Icons.FileText size={16} /></div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 mb-0.5">任务说明</div>
                                            <div className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">{previewTask.desc || previewTask.standards}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

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
                                                {record.attachments && Array.isArray(record.attachments) && record.attachments.length > 0 ? (
                                                    <div className="mt-3 flex overflow-x-auto gap-2 pb-1 hide-scrollbar">
                                                        {record.attachments.map((att, idx) => (
                                                            <div 
                                                                key={idx} 
                                                                onClick={() => {
                                                                    setPreviewImages(record.attachments);
                                                                    setCurrentPreviewIndex(idx);
                                                                    setShowImagePreviewModal(true);
                                                                }}
                                                                className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all relative group"
                                                            >
                                                                <img src={att.data || att.url} alt="Evidence" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                                    <Icons.Eye size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    record.attachmentCount > 0 && (
                                                        <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded">
                                                            <Icons.Paperclip size={12} /> {record.attachmentCount} 个附件 (已归档或无预览)
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            )}
                        </div>
                    </div>

                    <div className="relative z-10 shrink-0 mt-4">
                        {/* Kid Controls */}
                        {appState === 'kid_app' && (() => {
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

                        {/* Parent Controls */}
                        {appState === 'parent_app' && (
                            <div className="flex gap-2 w-full mt-3 border-t border-slate-100 pt-4">
                                {getTaskStatusOnDate(previewTask, selectedDate, resolvedKidId) === 'pending_approval' ? (
                                    <>
                                        <button onClick={() => { setShowPreviewModal(false); setRejectingTaskInfo({task: previewTask, dateStr: selectedDate, kidId: resolvedKidId}); setShowRejectModal(true); }} className="flex-1 bg-rose-50 text-rose-600 rounded-xl py-4 font-black hover:bg-rose-100 active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-rose-200">
                                            <Icons.X size={18} strokeWidth={3} /> 打回
                                        </button>
                                        <button onClick={() => { setShowPreviewModal(false); setPreviewTask(null); handleApproveTask(previewTask, selectedDate, resolvedKidId); }} className="flex-[2] bg-emerald-500 text-white rounded-xl py-4 font-black shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-1.5">
                                            <Icons.Check size={20} strokeWidth={3} /> 确认通过
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => {
                                            setShowPreviewModal(false);
                                            setEditingTask(previewTask);
                                            setPlanType(previewTask.type || 'study');
                                            setPlanForm({
                                                targetKids: [previewTask.kidId || 'all'],
                                                category: previewTask.category || '技能',
                                                title: previewTask.title,
                                                desc: previewTask.standards || previewTask.desc || '',
                                                startDate: previewTask.startDate || new Date().toISOString().split('T')[0],
                                                endDate: previewTask.repeatConfig?.endDate || '',
                                                repeatType: previewTask.repeatConfig?.type || (previewTask.frequency === '仅当天' ? 'today' : (previewTask.frequency === '每周一至周五' ? 'weekly_custom' : 'daily')),
                                                weeklyDays: previewTask.repeatConfig?.weeklyDays || [1, 2, 3, 4, 5],
                                                ebbStrength: previewTask.repeatConfig?.ebbStrength || 'normal',
                                                periodDaysType: previewTask.repeatConfig?.periodDaysType || 'any',
                                                periodCustomDays: previewTask.repeatConfig?.periodCustomDays || [1, 2, 3, 4, 5],
                                                periodTargetCount: previewTask.repeatConfig?.periodTargetCount || 1,
                                                periodMaxPerDay: previewTask.repeatConfig?.periodMaxPerDay || 1,
                                                timeSetting: previewTask.timeStr && String(previewTask.timeStr) !== '--:--' ? (String(previewTask.timeStr).includes('-') ? 'range' : 'duration') : 'none',
                                                startTime: previewTask.timeStr && String(previewTask.timeStr).includes('-') ? String(previewTask.timeStr).split('-')[0] : '',
                                                endTime: previewTask.timeStr && String(previewTask.timeStr).includes('-') ? String(previewTask.timeStr).split('-')[1] : '',
                                                durationPreset: previewTask.timeStr && String(previewTask.timeStr).includes('分钟') ? parseInt(String(previewTask.timeStr)) : 25,
                                                pointRule: (previewTask.pointRule && previewTask.pointRule === 'custom') || (previewTask.type === 'habit') ? 'custom' : 'default',
                                                reward: String(previewTask.reward || ''),
                                                iconEmoji: previewTask.iconEmoji || '📚',
                                                habitColor: previewTask.catColor || 'from-blue-400 to-blue-500',
                                                habitType: previewTask.habitType || 'daily_once',
                                                attachments: previewTask.attachments || [],
                                                requireApproval: previewTask.requireApproval !== undefined ? previewTask.requireApproval : true
                                            });
                                            setShowAddPlanModal(true);
                                        }} className="flex-1 bg-blue-50 text-blue-600 rounded-xl py-3 font-bold hover:bg-blue-100 transition-colors flex justify-center items-center gap-1">
                                            <Icons.Edit3 size={14} /> 编辑
                                        </button>
                                        <button onClick={() => { setShowPreviewModal(false); setDeleteConfirmTask(previewTask); }} className="flex-1 bg-red-50 text-red-500 rounded-xl py-3 font-bold hover:bg-red-100 transition-colors flex justify-center items-center gap-1">
                                            <Icons.Trash2 size={14} /> 删除
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderAddPlanModal = () => {
        if (!showAddPlanModal) return null;

        try {
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
                    <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl text-left overflow-hidden mt-auto mb-auto border border-white/20 flex flex-col max-h-[85vh] sm:max-h-[90vh]">

                        {/* Header */}
                        <div className="bg-white p-4 md:p-6 flex justify-between items-center border-b border-slate-100 relative z-30 shadow-sm">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
                                    {editingTask ? (planType === 'study' ? '✨ 编辑任务' : '✨ 编辑成长记录') : (planType === 'study' ? '新建任务' : '记录成长')}
                                </h2>
                                <div className="text-slate-500 text-sm mt-1 font-medium">
                                    {editingTask ? '修改任务信息后点击保存' : (planType === 'study' ? '布置任务，让孩子赚取家庭币' : '创建成长记录，设置家庭币奖励')}
                                </div>
                            </div>
                            <button onClick={() => { setShowAddPlanModal(false); setEditingTask(null); }} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 md:p-2.5 rounded-xl transition-all"><Icons.X size={20} className="md:w-6 md:h-6" /></button>
                        </div>

                        <div className="p-4 md:p-8 space-y-4 md:space-y-8 bg-slate-50/50 flex-1 overflow-y-auto custom-scrollbar relative z-10 min-h-0">
                            {/* --- STUDY PLAN FORM --- */}

                            {/* --- STUDY PLAN FORM --- */}
                            {planType === 'study' && (
                                <div className="space-y-6 animate-fade-in relative z-0">
                                    {/* Basic Info */}
                                    <div>
                                        <label className="block text-sm font-black text-slate-800 mb-2">指派给谁 <span className="text-red-500">*</span></label>
                                        {/* Multi-select Buttons */}
                                        <div className="flex flex-wrap gap-2">
                                            <button 
                                                onClick={() => setPlanForm({ ...planForm, targetKids: ['all'] })}
                                                className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all flex items-center gap-1.5 ${(!planForm.targetKids || planForm.targetKids.includes('all')) ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}
                                            >
                                                👥 全部孩子
                                            </button>
                                            {kids.map(k => {
                                                const isSelected = (!planForm.targetKids || planForm.targetKids.includes('all')) || planForm.targetKids.includes(k.id);
                                                return (
                                                    <button 
                                                        key={k.id}
                                                        onClick={() => {
                                                            let newTargets = (!planForm.targetKids || planForm.targetKids.includes('all')) ? [] : [...planForm.targetKids];
                                                            if (newTargets.includes(k.id)) {
                                                                newTargets = newTargets.filter(id => id !== k.id);
                                                            } else {
                                                                newTargets.push(k.id);
                                                            }
                                                            if (newTargets.length === 0) newTargets = ['all'];
                                                            if (newTargets.length === kids.length && kids.length > 0) newTargets = ['all'];
                                                            setPlanForm({ ...planForm, targetKids: newTargets });
                                                        }}
                                                        className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all flex items-center gap-1.5 ${isSelected && (planForm.targetKids && !planForm.targetKids.includes('all')) ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' : ((!planForm.targetKids || planForm.targetKids.includes('all')) ? 'bg-blue-50 text-blue-400 border-blue-100' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300')}`}
                                                    >
                                                        <span className="text-base">{k.avatar}</span> {k.name}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-slate-800 mb-2">任务类型 <span className="text-red-500">*</span></label>
                                        <select value={planForm.category} onChange={e => {
                                            if (e.target.value === '__NEW__') {
                                                const custom = window.prompt("请输入新任务分类名称 (最长6个字符)：");
                                                if (custom && custom.trim()) {
                                                    const newCat = custom.trim().substring(0, 6);
                                                    setPlanForm({ ...planForm, category: newCat, iconName: getIconForCategory(newCat) });
                                                }
                                            } else {
                                                setPlanForm({ ...planForm, category: e.target.value, iconName: getIconForCategory(e.target.value) });
                                            }
                                        }} className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500 font-bold text-slate-700 transition-colors appearance-none">
                                            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                            {(!allCategories.includes(planForm.category) && planForm.category && planForm.category !== '__NEW__') && <option value={planForm.category}>{planForm.category}</option>}
                                            <option value="__NEW__">➕ 自定义新分类...</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-slate-800 mb-2">任务名称 <span className="text-red-500">*</span></label>
                                        <input value={planForm.title} onChange={e => setPlanForm({ ...planForm, title: e.target.value })} placeholder="例如：完成课后练习题、练字30分钟..." className="w-full bg-white border-2 border-slate-200 rounded-2xl p-3 md:p-4 outline-none focus:border-blue-500 font-bold text-slate-800 transition-all text-sm md:text-base placeholder:text-slate-400 placeholder:font-normal" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-slate-800 mb-2">任务说明 (可选)</label>
                                        <textarea value={planForm.desc} onChange={e => setPlanForm({ ...planForm, desc: e.target.value })} placeholder="补充一些具体要求或鼓励的话..." className="w-full bg-white border-2 border-slate-200 rounded-2xl p-3 md:p-4 outline-none focus:border-blue-500 text-slate-700 transition-all min-h-[80px] md:min-h-[100px] resize-y text-sm md:text-base placeholder:text-slate-400 placeholder:font-normal" />
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
                                                {/* Multi-select Buttons for Habit */}
                                                <div className="flex flex-wrap gap-2">
                                                    <button 
                                                        onClick={() => setPlanForm({ ...planForm, targetKids: ['all'] })}
                                                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all flex items-center gap-1.5 ${(!planForm.targetKids || planForm.targetKids.includes('all')) ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'}`}
                                                    >
                                                        👥 全部孩子
                                                    </button>
                                                    {kids.map(k => {
                                                        const isSelected = (!planForm.targetKids || planForm.targetKids.includes('all')) || planForm.targetKids.includes(k.id);
                                                        return (
                                                            <button 
                                                                key={k.id}
                                                                onClick={() => {
                                                                    let newTargets = (!planForm.targetKids || planForm.targetKids.includes('all')) ? [] : [...planForm.targetKids];
                                                                    if (newTargets.includes(k.id)) {
                                                                        newTargets = newTargets.filter(id => id !== k.id);
                                                                    } else {
                                                                        newTargets.push(k.id);
                                                                    }
                                                                    if (newTargets.length === 0) newTargets = ['all'];
                                                                    if (newTargets.length === kids.length && kids.length > 0) newTargets = ['all'];
                                                                    setPlanForm({ ...planForm, targetKids: newTargets });
                                                                }}
                                                                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all flex items-center gap-1.5 ${isSelected && (planForm.targetKids && !planForm.targetKids.includes('all')) ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20' : ((!planForm.targetKids || planForm.targetKids.includes('all')) ? 'bg-emerald-50 text-emerald-400 border-emerald-100' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300')}`}
                                                            >
                                                                <span className="text-base">{k.avatar}</span> {k.name}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-black text-slate-800 mb-2">习惯名称 <span className="text-red-500">*</span></label>
                                                <input value={planForm.title} onChange={e => setPlanForm({ ...planForm, title: e.target.value })} placeholder="例如：早起、不玩手机、自己整理书包" className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-emerald-500 font-bold text-slate-800 transition-all text-base placeholder:text-slate-400 placeholder:font-normal" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-black text-slate-800 mb-2">习惯说明 (可选)</label>
                                                <textarea value={planForm.desc} onChange={e => setPlanForm({ ...planForm, desc: e.target.value })} placeholder="描述这个习惯的具体标准..." className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-emerald-500 text-slate-700 transition-all min-h-[100px] resize-y text-base placeholder:text-slate-400 placeholder:font-normal" />
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
                                            <option value="weekly_custom">按周重复</option>
                                            <option value="biweekly_custom">按双周重复</option>
                                            <option value="ebbinghaus">记忆曲线 (艾宾浩斯)</option>
                                            <option value="weekly_1">本周完成1次</option>
                                            <option value="biweekly_1">本双周完成1次</option>
                                            <option value="monthly_1">本月完成1次</option>
                                            <option value="every_week_1">每周完成1次</option>
                                            <option value="every_biweek_1">每双周完成1次</option>
                                            <option value="every_month_1">每月完成1次</option>
                                        </select>
                                        <div className="mt-3 bg-blue-50 text-blue-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2 border border-blue-100">
                                            <Icons.Info size={16} /> 选择任务的重复周期和类型。
                                        </div>

                                        {/* Dynamic Sub-configs based on Repeat Type */}
                                        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                                            {/* Date range for all Except Today where it's just StartDate */}
                                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 overflow-hidden">
                                                <div className="flex-1 w-full min-w-0">
                                                    <label className="block text-xs font-bold text-slate-600 mb-2">开始日期</label>
                                                    <input type="date" value={planForm.startDate} onChange={e => setPlanForm({ ...planForm, startDate: e.target.value })} className="w-full box-border border-2 border-slate-200 rounded-xl p-2.5 md:p-3 outline-none focus:border-blue-500 font-bold bg-white text-slate-700 text-sm" />
                                                </div>
                                                {planForm.repeatType !== 'today' && (
                                                    <div className="flex-1 w-full min-w-0">
                                                        <label className="block text-xs font-bold text-slate-600 mb-2">结束日期 <span className="text-slate-400 font-normal">(可选)</span></label>
                                                        <input type="date" value={planForm.endDate} onChange={e => setPlanForm({ ...planForm, endDate: e.target.value })} className="w-full box-border border-2 border-slate-200 rounded-xl p-2.5 md:p-3 outline-none focus:border-blue-500 font-bold bg-white text-slate-700 text-sm" />
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
                                                    <div className="grid grid-cols-7 gap-1 mt-2">
                                                        {[{ d: 1, l: '一' }, { d: 2, l: '二' }, { d: 3, l: '三' }, { d: 4, l: '四' }, { d: 5, l: '五' }, { d: 6, l: '六' }, { d: 7, l: '日' }].map(w => {
                                                            const isSelected = planForm.weeklyDays?.includes(w.d);
                                                            return (
                                                                <button key={w.d} onClick={() => {
                                                                    const newDays = isSelected ? planForm.weeklyDays.filter(d => d !== w.d) : [...(planForm.weeklyDays || []), w.d];
                                                                    setPlanForm({ ...planForm, weeklyDays: newDays });
                                                                }} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold transition-all shadow-sm flex items-center justify-center text-xs sm:text-sm mx-auto ${isSelected ? 'bg-blue-600 text-white shadow-blue-600/30' : 'bg-white text-slate-500 hover:border-blue-400 border border-slate-200'}`}>
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
                                                        <select value={planForm.periodDaysType} onChange={e => setPlanForm({ ...planForm, periodDaysType: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 outline-none focus:border-orange-500 font-bold text-base text-slate-700 appearance-none">
                                                            <option value="any">⏳ 任意时间都可以完成</option>
                                                            <option value="workdays">💼 仅限工作日完成</option>
                                                            <option value="weekends">🎉 仅限周末完成</option>
                                                            <option value="custom">⚙️ 自定义每周哪几天</option>
                                                        </select>
                                                        {planForm.periodDaysType === 'custom' && (
                                                            <div className="grid grid-cols-7 gap-1 mt-3 bg-white p-2 rounded-xl border border-slate-100">
                                                                {[{ d: 1, l: '一' }, { d: 2, l: '二' }, { d: 3, l: '三' }, { d: 4, l: '四' }, { d: 5, l: '五' }, { d: 6, l: '六' }, { d: 7, l: '日' }].map(w => {
                                                                    const isSelected = planForm.periodCustomDays?.includes(w.d);
                                                                    return (
                                                                        <button key={w.d} onClick={() => {
                                                                            const newDays = isSelected ? planForm.periodCustomDays.filter(d => d !== w.d) : [...(planForm.periodCustomDays || []), w.d];
                                                                            setPlanForm({ ...planForm, periodCustomDays: newDays });
                                                                        }} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold transition-all flex items-center justify-center text-xs sm:text-sm mx-auto ${isSelected ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
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
                                            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 md:p-5 animate-fade-in">
                                                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 overflow-hidden">
                                                    <div className="flex-1 w-full min-w-0">
                                                        <label className="block text-xs font-bold text-slate-600 mb-2">开始时间</label>
                                                        <input type="time" value={planForm.startTime} onChange={e => setPlanForm({ ...planForm, startTime: e.target.value })} className="w-full box-border border-2 border-slate-200 rounded-xl p-2.5 md:p-3 outline-none focus:border-blue-500 font-bold bg-white text-sm" />
                                                    </div>
                                                    <div className="flex-1 w-full min-w-0">
                                                        <label className="block text-xs font-bold text-slate-600 mb-2">结束时间</label>
                                                        <input type="time" value={planForm.endTime} onChange={e => setPlanForm({ ...planForm, endTime: e.target.value })} className="w-full box-border border-2 border-slate-200 rounded-xl p-2.5 md:p-3 outline-none focus:border-blue-500 font-bold bg-white text-sm" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {planForm.timeSetting === 'duration' && (
                                            <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-5 animate-fade-in space-y-4">
                                                <div>
                                                    <span className="text-xs font-bold text-emerald-700 mb-3 block">常用时长</span>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {[{ label: '15分钟', val: 15 }, { label: '30分钟', val: 30 }, { label: '45分钟', val: 45 }, { label: '1小时', val: 60 }, { label: '1.5小时', val: 90 }, { label: '2小时', val: 120 }].map(opt => (
                                                            <button key={opt.val} onClick={() => setPlanForm({ ...planForm, durationPreset: opt.val })}
                                                                className={`py-2.5 text-sm font-bold rounded-full border-2 transition-all
                                                                ${planForm.durationPreset === opt.val ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-emerald-100 bg-white text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50'}`}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-emerald-700 mb-2 block">其它时长</span>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            placeholder="例如：25"
                                                            value={planForm.durationPreset || ''}
                                                            onChange={e => setPlanForm({ ...planForm, durationPreset: Math.max(0, parseInt(e.target.value) || 0) })}
                                                            className="flex-1 w-full min-w-0 border-2 border-emerald-200 rounded-xl p-3 outline-none focus:border-emerald-500 font-bold bg-white text-emerald-800"
                                                        />
                                                        <span className="font-bold text-emerald-600 shrink-0 whitespace-nowrap">分钟</span>
                                                    </div>
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
                                        <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 mb-2">最高记录次数限制周期</label>
                                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                                    <button onClick={() => setPlanForm({ ...planForm, periodMaxType: 'daily' })} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all outline-none ${planForm.periodMaxType === 'daily' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>每日限制</button>
                                                    <button onClick={() => setPlanForm({ ...planForm, periodMaxType: 'weekly' })} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all outline-none ${planForm.periodMaxType === 'weekly' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>每周限制</button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 mb-2">{planForm.periodMaxType === 'weekly' ? '每周' : '每日'}最高允许记录次数 <span className="text-slate-400 font-normal">(防过度打卡)</span></label>
                                                <input type="number" min="1" max="999" value={planForm.periodMaxPerDay || 3} onChange={e => setPlanForm({ ...planForm, periodMaxPerDay: Math.max(1, parseInt(e.target.value) || 1) })} className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-emerald-500 font-bold bg-slate-50 text-emerald-700" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reward/Points Settings */}
                            <div className={`p-6 rounded-3xl border shadow-sm ${planType === 'study' ? 'bg-yellow-50 border-yellow-200' : 'bg-indigo-50 border-indigo-200'}`}>
                                <label className={`block text-sm font-black mb-3 ${planType === 'study' ? 'text-yellow-800' : 'text-indigo-800'}`}>
                                    <Icons.Star size={18} className="inline mr-1 mb-1" />
                                    {planType === 'study' ? '金币奖励设定' : '家庭币奖惩设定'}
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
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 font-black text-xl">⭐</div>
                                                <input type="number" value={planForm.reward} onChange={e => setPlanForm({ ...planForm, reward: e.target.value })} placeholder="输入完成可获得的金币数" className="w-full bg-white border-2 border-yellow-200 rounded-2xl p-4 pl-12 pr-4 outline-none focus:border-yellow-500 font-black text-base text-yellow-700 shadow-inner placeholder:text-slate-400 placeholder:font-normal" />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 font-black text-base">币</div>
                                            <input type="number" value={planForm.reward} onChange={e => setPlanForm({ ...planForm, reward: e.target.value })} placeholder="输入家庭币 (可填负数)" className="w-full bg-white border-2 border-indigo-200 rounded-2xl p-4 pl-14 pr-4 outline-none focus:border-indigo-500 font-black text-base text-indigo-700 shadow-inner placeholder:text-slate-400 placeholder:font-normal" />
                                        </div>
                                        <div className="text-xs text-indigo-600/70 font-bold px-2">填写正数表示奖励家庭币，填写负数 (如 -10) 表示违反习惯的惩罚。<br/>(经验值会自动按 1.5 倍同步计算)</div>
                                    </div>
                                )}
                            </div>

                            {/* Standalone Require Approval Toggle */}
                            {planType === 'study' && (
                                <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between shadow-sm cursor-pointer hover:bg-slate-100 transition-colors gap-4" onClick={() => setPlanForm({ ...planForm, requireApproval: !planForm.requireApproval })}>
                                    <div>
                                        <div className="font-black text-slate-800 flex items-center gap-2">
                                            <Icons.ShieldCheck size={18} className="text-emerald-500" /> 打卡需要家长审核
                                        </div>
                                        <div className="text-sm font-medium text-slate-500 mt-1">关闭后，孩子打卡将跳过等待，系统直接发放奖励</div>
                                    </div>
                                    <div className={`w-14 h-8 rounded-full p-1 transition-colors flex-shrink-0 ${planForm.requireApproval ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${planForm.requireApproval ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </div>
                                </div>
                            )}


                            {/* Edit Track / History / Rejections */}
                            {
                                (() => {
                                    try {
                                        if (!editingTask || !editingTask.history || typeof editingTask.history !== 'object' || Array.isArray(editingTask.history) || Object.keys(editingTask.history).length === 0) {
                                            return null;
                                        }
                                        return (
                                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                                <div className="flex justify-between items-center mb-6">
                                                    <label className="text-sm font-black text-slate-800 flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                                            <Icons.Clock size={16} />
                                                        </div>
                                                        历史打卡记录与审核
                                                    </label>
                                                </div>

                                                <div className="space-y-8 pl-1 pr-3">
                                                    {Object.entries(editingTask.history).sort((a, b) => new Date(b[0]) - new Date(a[0])).map(([dateStr, kidRecords]) => {
                                                        if (!kidRecords || typeof kidRecords !== 'object' || Array.isArray(kidRecords)) return null;
                                                        return (
                                                            <div key={dateStr} className="relative animate-fade-in">
                                                                <div className="sticky top-0 z-20 py-1 mb-3">
                                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-500 shadow-sm border border-slate-100">
                                                                        <Icons.Calendar size={12} /> {dateStr}
                                                                    </span>
                                                                </div>
                                                            <div className="space-y-4">
                                                            {Object.entries(kidRecords).map(([kidId, record]) => {
                                                                if (!record || typeof record !== 'object') return null;
                                                                const kUser = kids.find(k => String(k.id) === String(kidId));
                                                                if (!kUser) return null;
                                                                return (
                                                                    <div key={kidId} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-sm relative animate-fade-in group">
                                                                        <div className="flex flex-col gap-3 py-1">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg">{kUser.avatar}</div>
                                                                                    <span className="font-bold text-sm text-slate-700">{kUser.name}</span>
                                                                                </div>
                                                                                <div>
                                                                                    {record.status === 'completed' && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">已完成</span>}
                                                                                    {record.status === 'pending' && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">待审核</span>}
                                                                                    {record.status === 'failed' && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">未达标</span>}
                                                                                    {record.status === 'todo' && <span className="px-2 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded">未完成</span>}
                                                                                </div>
                                                                            </div>
                                                                            {record.timeSpent > 0 && (
                                                                                <div className="text-xs text-slate-500">🕐 耗时: <span className="font-bold text-slate-700">{record.timeSpent} 分钟</span></div>
                                                                            )}
                                                                            <textarea
                                                                                value={record.note || ''}
                                                                                onChange={(e) => {
                                                                                    const newHist = { ...editingTask.history };
                                                                                    newHist[dateStr][kidId].note = e.target.value;
                                                                                    setEditingTask({ ...editingTask, history: newHist });
                                                                                }}
                                                                                placeholder="添加或修改打卡备注..."
                                                                                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 outline-none placeholder:text-slate-300 resize-none h-20"
                                                                            />
                                                                            {record.status !== 'todo' && record.status !== 'failed' && (
                                                                                <div className="flex justify-end mt-1">
                                                                                    <button onClick={() => handleRejectTask(editingTask, dateStr, kidId)} className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-100 transition-colors flex items-center gap-1">
                                                                                        <Icons.RefreshCw size={12} /> 设为未完成 (打回)
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                            </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    } catch (err) {
                                        console.error("Error rendering task history in modal:", err);
                                        return null;
                                    }
                                })()
                            }
                        </div>
                        {/* Footer Actions */}
                        <div className="p-4 md:p-6 border-t border-slate-100 flex gap-3 md:gap-4 bg-white sticky bottom-0 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                            <button onClick={() => { setShowAddPlanModal(false); setEditingTask(null); }} className="flex-1 py-3 md:py-4 text-sm md:text-base text-slate-600 font-black bg-white border-2 border-slate-200 rounded-xl md:rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all">取消</button>
                            <button onClick={handleSavePlan} className="flex-[2] flex items-center justify-center gap-2 py-3 md:py-4 text-sm md:text-base bg-blue-600 text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02] transition-all">
                                <Icons.Save size={18} className="md:w-5 md:h-5" /> {editingTask ? '保存修改' : '保存任务'}
                            </button>
                        </div>
                    </div>
                </div >
            );
        } catch (error) {
            console.error("FATAL ERROR IN renderAddPlanModal:", error);
            return (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl text-center shadow-xl relative z-[110] max-w-md w-full">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">哎呀，页面出错了！</h2>
                        <p className="text-red-600 mb-4 text-xs font-mono text-left bg-red-50 p-3 rounded-lg overflow-x-auto" id="crash-error-message">{error.message}</p>
                        <p className="text-slate-500 mb-4 text-[10px] font-mono text-left bg-slate-100 p-3 rounded-lg overflow-y-auto max-h-32" id="crash-error-stack">{error.stack}</p>
                        <button onClick={() => { setShowAddPlanModal(false); setEditingTask(null); }} className="bg-slate-800 text-white px-8 py-3 w-full rounded-xl font-bold hover:bg-slate-700 transition-colors">关闭即可恢复</button>
                    </div>
                </div>
            );
        }
    };

    const renderAddKidModal = () => {
        if (!showAddKidModal) return null;
        return (
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
        );
    };

    // === 视图页面组件 ===
    const renderProfileSelection = () => (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 animate-fade-in relative">
            <div className="absolute top-8 left-8 flex items-center gap-2 text-white/50">
                <img src="/minilife_logo.png" className="w-10 h-10 rounded-2xl shadow-sm" alt="MiniLife Logo" /> <span className="font-black text-2xl tracking-widest text-[#2c3e50]">MiniLife</span>
            </div>
            <h1 className="text-white text-3xl font-black mb-12">是谁在使用呢？</h1>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 max-w-3xl">
                {kids.map(k => (
                    <div key={k.id} onClick={() => { changeActiveKid(k.id); changeAppState('kid_app'); setKidTab('study'); }} className="group cursor-pointer flex flex-col items-center">
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-6xl shadow-xl group-hover:scale-105 group-hover:ring-4 ring-white/50 transition-all">
                            {k.avatar}
                        </div>
                        <span className="text-slate-300 mt-4 text-xl font-bold group-hover:text-white transition-colors">{k.name}</span>
                    </div>
                ))}

                {/* Add Kid Button (Netflix Style) */}
                <div onClick={() => { 
                    if (kids.length >= 5) {
                        return notify("目前最多支持添加5名家庭成员！", "warning");
                    }
                    changeActiveKid(null); 
                    setNewKidForm({ name: '', gender: 'boy', avatar: '👦', dob: '' }); 
                    setShowAddKidModal(true); 
                }} className="group cursor-pointer flex flex-col items-center">
                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-[2rem] border-4 border-dashed border-slate-700 bg-slate-800/50 flex items-center justify-center text-5xl text-slate-500 shadow-xl group-hover:scale-105 group-hover:border-slate-500 group-hover:text-slate-400 transition-all">
                        <Icons.Plus size={48} strokeWidth={3} />
                    </div>
                    <span className="text-slate-500 mt-4 text-xl font-bold group-hover:text-slate-400 transition-colors">添加小朋友</span>
                </div>
            </div>
            <button onClick={() => parentSettings.pinEnabled ? changeAppState('parent_pin') : changeAppState('parent_app')} className="absolute bottom-10 flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 px-6 py-3 rounded-full font-bold">
                <Icons.Settings size={18} /> 家长管理入口
            </button>
        </div>
    );

    const renderParentPinScreen = () => (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 animate-fade-in">
            <button onClick={() => { changeAppState('profiles'); setPinInput(''); }} className="absolute top-8 left-8 text-slate-400 flex items-center gap-2 hover:text-white"><Icons.ChevronLeft size={20} /> 返回角色选择</button>
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
            myTasks = myTasks.filter(t => taskFilter.includes(t.category || '计划'));
        }

        const getDailyStatus = (t) => getTaskStatusOnDate(t, selectedDate, activeKidId);

        if (taskStatusFilter === 'completed') {
            myTasks = myTasks.filter(t => getDailyStatus(t) === 'completed');
        } else if (taskStatusFilter === 'incomplete') {
            myTasks = myTasks.filter(t => getDailyStatus(t) !== 'completed');
        }

        const sortedTasks = [...myTasks];
        // Handle kid-friendly sort options
        switch (taskSort) {
            case 'time_asc':
                // Sort by time (shorter time first). Assuming t.reward correlates with expected time, or parse t.timePreset...
                sortedTasks.sort((a, b) => parseInt(a.timeStr || 0) - parseInt(b.timeStr || 0));
                break;
            case 'category':
                sortedTasks.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
                break;
            case 'status':
                sortedTasks.sort((a, b) => {
                    const statusOrder = { 'todo': 0, 'in_progress': 1, 'failed': 2, 'pending_approval': 3, 'completed': 4 };
                    return statusOrder[getDailyStatus(a)] - statusOrder[getDailyStatus(b)];
                });
                break;
            case 'created_desc':
                // Assuming ID dictates creation somewhat, or just fallback if no created field
                sortedTasks.sort((a, b) => (b.id < a.id ? -1 : 1));
                break;
            case 'reward_desc':
                sortedTasks.sort((a, b) => b.reward - a.reward);
                break;
            case 'reward_asc':
                sortedTasks.sort((a, b) => a.reward - b.reward);
                break;
            case 'default':
            default:
                // Sort by the new custom order first, then ID
                sortedTasks.sort((a, b) => {
                    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
                    return a.id.localeCompare(b.id);
                });
                break;
        }
        myTasks = sortedTasks;
        // Helper for reordering (via Drag/Drop or Mobile buttons)
        const handleReorderTask = (sourceIndex, targetIndex) => {
            if (sourceIndex === targetIndex || targetIndex < 0 || targetIndex >= myTasks.length) return;
            const updatedTasks = [...myTasks];
            const [removed] = updatedTasks.splice(sourceIndex, 1);
            updatedTasks.splice(targetIndex, 0, removed);
            
            // Assign new orders globally across identical day tasks
            updatedTasks.forEach((task, idx) => task.order = idx);
            
            // Update all backend tasks (optimistic UI update + API call)
            const newGlobalTasks = [...tasks];
            updatedTasks.forEach(task => {
                const globalIndex = newGlobalTasks.findIndex(g => g.id === task.id);
                if(globalIndex > -1) newGlobalTasks[globalIndex].order = task.order;
                apiFetch(`/api/tasks/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: task.order }) }).catch(console.error);
            });
            setTasks(newGlobalTasks);
        };

        return (
            <div className="animate-fade-in">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-8 mx-4">
                    <div className="flex items-center justify-between mb-6 px-1">
                        <div className="flex items-center text-indigo-600 font-black text-sm sm:text-lg">
                            第{getWeekNumber(currentViewDate)[1]}周
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-3">
                            <button
                                onClick={() => { const d = new Date(currentViewDate); d.setDate(d.getDate() - 7); setCurrentViewDate(d); }}
                                className="p-1 sm:p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors bg-indigo-50/50"
                            >
                                <Icons.ChevronLeft size={16} className="sm:w-[20px] sm:h-[20px]" />
                            </button>
                            <button
                                onClick={() => { setCurrentViewDate(new Date()); setSelectedDate(formatDate(new Date())); }}
                                className="bg-yellow-400 text-yellow-900 px-2.5 sm:px-5 py-1 sm:py-2 rounded-full font-black text-[11px] sm:text-sm hover:bg-yellow-500 transition-colors shadow-sm"
                            >
                                今天
                            </button>
                            <button
                                onClick={() => { const d = new Date(currentViewDate); d.setDate(d.getDate() + 7); setCurrentViewDate(d); }}
                                className="p-1 sm:p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors bg-indigo-50/50"
                            >
                                <Icons.ChevronRight size={16} className="sm:w-[20px] sm:h-[20px]" />
                            </button>
                            <button onClick={() => setShowCalendarModal(true)} className="p-1.5 sm:p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors bg-slate-50">
                                <Icons.Calendar size={16} className="sm:w-[20px] sm:h-[20px]" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 md:gap-2 pt-2 pb-2">
                        {getDisplayDateArray(currentViewDate).map((day, i) => {
                            const { count, total } = getIncompleteStudyTasksCount(day.dateStr);

                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(day.dateStr)}
                                    className={`flex flex-col items-center py-2 md:py-4 px-1 rounded-xl md:rounded-2xl transition-all
                                        ${selectedDate === day.dateStr ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 -translate-y-1' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}
                                    `}
                                >
                                    <span className={`text-[9px] md:text-xs font-bold mb-1 md:mb-2 whitespace-nowrap ${selectedDate === day.dateStr ? 'text-indigo-200' : 'text-slate-400'}`}>{day.d}</span>
                                    <span className="text-base sm:text-lg md:text-xl font-black">{day.displayDate.split('/')[1]}</span>
                                    <div className="mt-1.5 md:mt-2 h-3.5 flex items-center justify-center">
                                        {count > 0 ? (
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${selectedDate === day.dateStr ? 'bg-indigo-400/50 text-white' : 'bg-red-100 text-red-600'}`}>
                                                {count}
                                            </span>
                                        ) : (total > 0 ? (
                                            <span className={`text-[10px] ${selectedDate === day.dateStr ? 'text-indigo-300' : 'text-emerald-500'}`}><Icons.Check size={12} /></span>
                                        ) : (
                                            <div className={`w-1.5 h-1.5 rounded-full ${selectedDate === day.dateStr ? 'bg-white/30' : (day.dateStr === formatDate(new Date()) ? 'bg-orange-500' : 'bg-transparent')}`}></div>
                                        ))}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4 px-2">
                    <div className="text-xl font-black text-slate-800 border-l-4 border-green-500 pl-3 shrink-0">今日任务</div>
                    <div className="flex items-center justify-end gap-2 sm:gap-4 text-slate-500 text-xs sm:text-sm font-bold relative z-20 pb-2 sm:pb-0">
                        {/* 统一筛选下拉 (综合科目与状态) */}
                        <div className="relative shrink-0" ref={kidFilterRef}>
                            <button
                                onClick={() => { setShowFilterDropdown(!showFilterDropdown); setShowStatusDropdown(false); setShowSortDropdown(false); }}
                                className={`flex items-center justify-center gap-1.5 w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-full sm:rounded-none sm:bg-transparent transition-colors shadow-sm sm:shadow-none border sm:border-transparent ${showFilterDropdown || (Array.isArray(taskFilter) && taskFilter.length > 0) || taskStatusFilter !== 'all' ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'bg-white border-slate-200 hover:text-indigo-600'}`}
                            >
                                <Icons.Filter size={16} className="sm:w-[14px] sm:h-[14px]" />
                                <span className="hidden sm:inline">按条件筛选 {(Array.isArray(taskFilter) && taskFilter.length > 0) || taskStatusFilter !== 'all' ? '•' : ''}</span>
                                <Icons.ChevronDown size={14} className={`hidden sm:block transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showFilterDropdown && (
                                <div className="absolute top-full mt-2 w-56 transform -translate-x-1/2 left-1/2 sm:left-0 sm:translate-x-0 bg-white border border-slate-100 shadow-2xl rounded-2xl py-3 z-50 animate-fade-in origin-top">
                                    <div className="px-4 pb-2 mb-2 text-xs font-black text-slate-400 border-b border-slate-50 uppercase tracking-widest">任务状态</div>
                                    <div className="flex gap-2 px-4 mb-4">
                                        <button onClick={() => setTaskStatusFilter('all')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${taskStatusFilter === 'all' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>全部</button>
                                        <button onClick={() => setTaskStatusFilter('incomplete')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${taskStatusFilter === 'incomplete' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>未完成</button>
                                        <button onClick={() => setTaskStatusFilter('completed')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${taskStatusFilter === 'completed' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>已完成</button>
                                    </div>

                                    <div className="px-4 pb-2 mb-2 text-xs font-black text-slate-400 border-b border-slate-50 uppercase tracking-widest">任务科目</div>
                                    <div className="max-h-48 overflow-y-auto override-scroll">
                                        {Array.from(new Set(tasks.filter(t => (t.kidId === activeKidId || t.kidId === 'all') && t.type === 'study' && isTaskDueOnDate(t, selectedDate)).map(t => t.category).filter(Boolean))).map(cat => (
                                            <label key={cat} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer w-full transition-colors">
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
                                    </div>
                                    
                                    <div className="border-t border-slate-100 mt-2 pt-2 px-4 flex gap-2">
                                        <button onClick={() => { setTaskFilter([]); setTaskStatusFilter('all'); }} className="flex-1 text-center py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">重置</button>
                                        <button onClick={() => setShowFilterDropdown(false)} className="flex-1 text-center py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm shadow-indigo-200">完成</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-px h-4 bg-slate-200 shrink-0 hidden sm:block"></div>

                        {/* 排序选择器 */}
                        <div className="relative shrink-0 flex items-center justify-center group" ref={kidSortRef}>
                            <button 
                                onClick={() => { setShowSortDropdown(!showSortDropdown); setShowFilterDropdown(false); }}
                                className={`flex flex-row items-center justify-center gap-1.5 w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-full sm:rounded-none sm:bg-transparent bg-white shadow-sm sm:shadow-none border sm:border-transparent transition-colors cursor-pointer ${showSortDropdown || taskSort !== 'default' ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'text-slate-500 border-slate-200 hover:text-indigo-600'}`}
                            >
                                <Icons.SortAsc size={16} className="sm:w-[14px] sm:h-[14px]" />
                                <span className="hidden sm:inline font-bold text-sm text-[13px] sm:text-sm">
                                    {taskSort === 'default' && '默认顺序'}
                                    {taskSort === 'time_asc' && '最快完成的'}
                                    {taskSort === 'category' && '按科目分类'}
                                    {taskSort === 'status' && '按完成状态'}
                                    {taskSort === 'created_desc' && '最新添加的'}
                                    {taskSort === 'reward_desc' && '奖励最多的'}
                                </span>
                                <Icons.ChevronDown size={14} className={`hidden sm:block transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showSortDropdown && (
                                <div className="absolute top-full right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-[60] animate-fade-in origin-top">
                                    {[
                                        { id: 'default', label: '默认顺序' },
                                        { id: 'time_asc', label: '最快完成的' },
                                        { id: 'category', label: '按科目分类' },
                                        { id: 'status', label: '按完成状态' },
                                        { id: 'created_desc', label: '最新添加的' },
                                        { id: 'reward_desc', label: '奖励最多的' },
                                    ].map(option => (
                                        <button 
                                            key={option.id}
                                            onClick={() => { setTaskSort(option.id); setShowSortDropdown(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors flex flex-row items-center justify-between ${taskSort === option.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {option.label}
                                            {taskSort === option.id && <Icons.Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="w-px h-4 bg-slate-200 shrink-0 hidden sm:block"></div>

                        <button onClick={() => setIsReordering(!isReordering)} className={`shrink-0 flex items-center justify-center gap-1.5 w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-full sm:rounded-none sm:bg-transparent shadow-sm sm:shadow-none border sm:border-transparent transition-colors ${isReordering ? 'bg-indigo-600 text-white sm:text-indigo-600 sm:bg-transparent sm:border-transparent border-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600'}`}>
                            {isReordering ? <Icons.Check size={16} className="sm:w-[14px] sm:h-[14px]" /> : <Icons.List size={16} className="sm:w-[14px] sm:h-[14px]" />} 
                            <span className="hidden sm:inline">{isReordering ? '保存排序' : '自定义排序'}</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-4 px-4 sm:px-0">
                    {myTasks.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 font-bold bg-white rounded-2xl border border-slate-100 shadow-sm md:col-span-2">这一天没有安排任务哦~</div>
                    ) : myTasks.map((t, index) => (
                        <div 
                            key={t.id} 
                            draggable={isReordering}
                            onDragStart={(e) => { e.dataTransfer.setData('text/plain', index); e.currentTarget.classList.add('opacity-50'); }}
                            onDragEnd={(e) => { e.currentTarget.classList.remove('opacity-50'); }}
                            onDragOver={(e) => { e.preventDefault(); }}
                            onDrop={(e) => {
                                e.preventDefault();
                                const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                                handleReorderTask(sourceIndex, index);
                            }}
                            className={`bg-white rounded-[2rem] p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 group flex flex-col sm:flex-row gap-4 relative overflow-hidden ${isReordering ? 'cursor-move ring-2 ring-indigo-300' : ''}`}
                        >
                            {!isReordering && <button onClick={() => { setPreviewTask(t); setShowPreviewModal(true); }} className="absolute inset-0 z-0 cursor-pointer hidden sm:block" aria-label="查看任务详情"></button>}
                            
                            {isReordering && (
                                <>
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300 flex items-center justify-center p-2 z-10 hidden sm:flex">
                                        <Icons.GripVertical size={20} />
                                    </div>
                                    <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20 sm:hidden">
                                        <button onClick={(e) => { e.stopPropagation(); handleReorderTask(index, index - 1); }} disabled={index === 0} className="w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur hover:bg-slate-50 border border-slate-200/50 rounded-full text-slate-400 disabled:opacity-30 disabled:bg-slate-50 shadow-sm transition-all"><Icons.ChevronDown className="rotate-180" size={16}/></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleReorderTask(index, index + 1); }} disabled={index === myTasks.length - 1} className="w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur hover:bg-slate-50 border border-slate-200/50 rounded-full text-slate-400 disabled:opacity-30 disabled:bg-slate-50 shadow-sm transition-all"><Icons.ChevronDown size={16}/></button>
                                    </div>
                                </>
                            )}

                            {/* Left Section: Big Colorful Squircle Icon */}
                            <div onClick={() => { if(!isReordering){ setPreviewTask(t); setShowPreviewModal(true); } }} className={`flex z-10 sm:w-auto items-start gap-4 flex-1 ${!isReordering ? 'cursor-pointer' : ''} ${isReordering ? 'sm:ml-6' : ''}`}>
                                <div className={`w-16 h-16 shrink-0 rounded-[1.25rem] bg-gradient-to-br ${getCategoryGradient(t.category || '计划')} flex flex-col items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                                    {renderIcon(t.iconName || getIconForCategory(t.category), 26)}
                                    <span className={`text-[11px] font-black mt-1 text-center w-full line-clamp-1 opacity-90 tracking-wide`}>{t.category || '计划'}</span>
                                </div>
                                <div className="flex-1 flex flex-col pt-0.5 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5 w-full">
                                        <h3 className="font-black text-slate-800 text-lg md:text-xl leading-tight truncate">
                                            {t.title}
                                        </h3>
                                        {/* Frequency Pill (Moved next to Title) */}
                                        <div className="shrink-0 bg-indigo-50/80 text-indigo-500 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black tracking-wide border border-indigo-100/50">
                                            {t.frequency || '每天'}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 items-center">
                                        {/* Reward Pill */}
                                        <div className="bg-amber-100/80 text-amber-600 px-2 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 border border-amber-200/50">
                                            {t.reward} <Icons.Star size={10} fill="currentColor" />
                                        </div>
                                        {/* Time Pill */}
                                        <div className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 min-w-0">
                                            <Icons.Clock size={10} className="shrink-0" /> 
                                            <span className="truncate">{t.timeStr || '--:--'}</span>
                                        </div>
                                        {/* Running Timer Pill */}
                                        {getDailyStatus(t) === 'in_progress' && t.actualStartTime && (
                                            <div className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 animate-pulse border border-green-200 min-w-0">
                                                <Icons.Play size={10} fill="currentColor" className="shrink-0" /> 
                                                <span className="truncate whitespace-nowrap">{(Math.floor((new Date() - new Date(t.actualStartTime)) / 60000))}M</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right/Bottom Section: Juicy Actions */}
                            <div className="z-10 flex sm:flex-col justify-end sm:justify-center items-stretch gap-2 shrink-0 sm:w-36 mt-2 sm:mt-0">
                                {(getDailyStatus(t) === 'todo' || getDailyStatus(t) === 'failed') && (
                                    <>
                                        {t.durationPreset || t.timeSetting === 'range' ? (
                                            <button onClick={() => handleStartTask(t.id)} className="flex-1 bg-gradient-to-b from-green-400 to-green-500 shadow-lg shadow-green-500/30 text-white rounded-full py-3 px-4 text-sm font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1">
                                                <Icons.Play size={16} fill="currentColor" /> {getDailyStatus(t) === 'failed' ? '重新开始' : 'START'}
                                            </button>
                                        ) : (
                                            <button onClick={() => openQuickComplete(t)} className="flex-1 bg-gradient-to-b from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 text-white rounded-full py-3 px-4 text-sm font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1">
                                                <Icons.Check size={16} strokeWidth={3} /> {getDailyStatus(t) === 'failed' ? '重新提交' : '完成'}
                                            </button>
                                        )}
                                    </>
                                )}
                                {getDailyStatus(t) === 'in_progress' && (
                                    <button onClick={() => handleAttemptSubmit(t)} className="w-full bg-indigo-100 text-indigo-600 rounded-full py-3 px-4 text-xs font-black hover:bg-indigo-200 transition-colors flex items-center justify-center gap-1 border border-indigo-200/50">
                                        <Icons.Check size={14} strokeWidth={3} /> 确认达标
                                    </button>
                                )}
                                {getDailyStatus(t) === 'pending_approval' && (
                                    <div className="w-full text-center text-orange-500 bg-orange-50 rounded-full py-3 px-4 text-xs font-black flex items-center justify-center gap-1 border border-orange-200/50">
                                        <Icons.Clock size={14} /> 待审批
                                    </div>
                                )}
                                {getDailyStatus(t) === 'completed' && (
                                    <div className="w-full text-center text-emerald-500 bg-emerald-50 rounded-full py-3 px-4 text-xs font-black flex items-center justify-center gap-1 border border-emerald-200/50">
                                        <Icons.CheckCircle size={14} /> 已完成
                                    </div>
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
                        <img src="/minilife_logo.png" className="w-8 h-8 rounded-xl shadow-sm border border-slate-100/50" alt="Logo" /> <span className="font-black text-xl text-slate-800 tracking-tight">MiniLife</span>
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
                
                {/* 勋章与等级个人中心 Modal */}
                {showLevelModal && (
                    <div className="fixed inset-0 bg-[#f4f7f9] z-[200] flex flex-col animate-slide-up overflow-hidden">
                        {/* Header Gradient Area */}
                        <div className={`pt-12 pb-24 px-6 bg-gradient-to-br ${getLevelTier(activeKid.level).bg} relative overflow-hidden flex flex-col items-center text-white flex-shrink-0 rounded-b-[3rem] shadow-sm`}>
                            <button onClick={() => setShowLevelModal(false)} className="absolute top-6 left-6 bg-white/20 hover:bg-white/30 w-10 h-10 rounded-full flex items-center justify-center transition-colors backdrop-blur-md">
                                <Icons.ChevronLeft size={24} />
                            </button>
                            <div className="absolute top-6 text-lg font-black tracking-widest opacity-90 text-white/90">成长图鉴</div>
                            
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform -translate-x-20 translate-y-20 pointer-events-none"></div>
                            
                            <div className="mt-8 w-28 h-28 rounded-full bg-white/20 p-2 backdrop-blur-md shadow-xl relative z-10 mb-5 border border-white/30">
                                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-5xl">{activeKid.avatar}</div>
                                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full flex items-center justify-center font-black border-2 border-white shadow-md text-sm tracking-wider">
                                    Lv.{activeKid.level}
                                </div>
                            </div>
                            <h2 className="text-3xl font-black tracking-wide drop-shadow-md mb-2">{activeKid.name}</h2>
                            <div className="flex items-center gap-1.5 bg-white/20 px-4 py-1.5 rounded-full text-sm font-black backdrop-blur-sm shadow-inner border border-white/20 tracking-wider">
                                {getLevelTier(activeKid.level).emoji} {getLevelTier(activeKid.level).title}
                            </div>
                        </div>
                            
                            {/* Card Body Overlay */}
                            <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pt-6 pb-24 -mt-12 relative z-20">
                                
                                {/* Progress Bar */}
                                <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-6 relative hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                                    <div className="flex justify-between items-end mb-3">
                                        <span className="text-slate-500 font-bold text-sm tracking-wider">升级进度条</span>
                                        <div className="text-right">
                                            <div className="text-[10px] text-slate-400 font-bold mb-0.5">距离下一级还需要</div>
                                            <span className={`font-black text-2xl ${getLevelTier(activeKid.level).color}`}>
                                                {nextLevelExp - activeKid.exp} <span className="text-sm text-slate-400">EXP</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-5 bg-slate-50 rounded-full overflow-hidden shadow-inner relative border border-slate-100">
                                        <div 
                                            className={`h-full bg-gradient-to-r ${getLevelTier(activeKid.level).bg} relative shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)] transition-all duration-1000 ease-out`} 
                                            style={{ width: `${Math.max(0, (activeKid.exp / nextLevelExp) * 100)}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>Lv.{activeKid.level} ({activeKid.exp})</span>
                                        <span>Lv.{activeKid.level + 1} ({nextLevelExp})</span>
                                    </div>
                                </div>
                                
                                {/* Honor & Badges */}
                                <div className="mb-6">
                                    <h3 className="font-black text-slate-800 text-lg mb-4 flex items-center gap-2 pl-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-inner"><Icons.Award size={18} /></div> 
                                        我的成就勋章
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-white rounded-[1.5rem] p-4 flex flex-col items-center justify-center shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-slate-100 aspect-square text-center opacity-100">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-200 to-orange-400 flex items-center justify-center text-2xl shadow-inner mb-2 border-2 border-amber-100">🔥</div>
                                            <div className="text-[11px] font-black text-slate-700 tracking-wider">初出茅庐</div>
                                        </div>
                                        <div className="bg-white rounded-[1.5rem] p-4 flex flex-col items-center justify-center shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-slate-100 aspect-square text-center opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-300 to-purple-500 flex items-center justify-center text-2xl shadow-inner mb-2 border-2 border-indigo-100">⚡</div>
                                            <div className="text-[11px] font-black text-slate-800 tracking-wider">打卡7天</div>
                                        </div>
                                        <div className="bg-white rounded-[1.5rem] p-4 flex flex-col items-center justify-center shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-slate-100 aspect-square text-center opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-300 to-teal-500 flex items-center justify-center text-2xl shadow-inner mb-2 border-2 border-emerald-100">👑</div>
                                            <div className="text-[11px] font-black text-slate-800 tracking-wider">百变达人</div>
                                        </div>
                                    </div>
                                </div>
                                {/* Card: EXP History Log */}
                                <div className="mb-8">
                                    <h3 className="font-black text-slate-800 text-lg mb-4 flex items-center gap-2 pl-2">
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner"><Icons.Activity size={18} /></div> 
                                        近期经验获取
                                    </h3>
                                    <div className="bg-white rounded-[2rem] p-5 shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-slate-100 space-y-4">
                                        {transactions
                                            .filter(t => t.kidId === activeKid.id && t.type === 'income' && t.category === 'habit' && t.amount > 0)
                                            .slice(0, 5)
                                            .map((t, idx, arr) => (
                                            <div key={t.id} className={`flex items-center justify-between text-sm ${idx !== arr.length - 1 ? 'border-b border-slate-50 pb-4' : ''}`}>
                                                <div className="flex items-center gap-3 text-slate-700 font-bold truncate pr-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0 shadow-inner">
                                                        <Icons.ArrowUpRight size={18} strokeWidth={3} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="truncate tracking-wide">{t.title}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium tracking-wider">任务记录</span>
                                                    </div>
                                                </div>
                                                <div className="font-black text-emerald-500 text-lg flex-shrink-0 tracking-wider">
                                                    +{t.amount} EXP
                                                </div>
                                            </div>
                                        ))}
                                        {transactions.filter(t => t.kidId === activeKid.id && t.type === 'income' && t.category === 'habit' && t.amount > 0).length === 0 && (
                                            <div className="text-center py-8 flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-3 shadow-inner">
                                                    <Icons.Check size={32} />
                                                </div>
                                                <p className="text-sm text-slate-400 font-bold tracking-wider">还没有获取记录呢，快去完成任务吧！</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                    </div>
                )}

                <div className="bg-white border-b border-slate-100 p-5 md:p-8 hidden md:block">
                    <div className="max-w-5xl mx-auto">
                        <button 
                            onClick={() => setShowLevelModal(true)} 
                            className="w-full flex items-center justify-between bg-transparent hover:bg-slate-50/80 p-3 -mx-3 rounded-3xl transition-colors group text-left relative overflow-hidden"
                        >
                            <div className="flex items-center gap-5">
                                <div className="relative flex-shrink-0">
                                    {/* SVG Circular Progress Ring */}
                                    <svg className="absolute -inset-2 w-[calc(100%+1rem)] h-[calc(100%+1rem)] -rotate-90 pointer-events-none drop-shadow-sm" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="46" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                                        <circle 
                                            cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" 
                                            strokeLinecap="round"
                                            className={getLevelTier(activeKid.level).color}
                                            strokeDasharray="289.02"
                                            strokeDashoffset={289.02 - (289.02 * Math.max(0, activeKid.exp / nextLevelExp))}
                                        />
                                    </svg>
                                    <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-[40px] shadow-sm border-[4px] border-white relative z-10">{activeKid.avatar}</div>
                                </div>
                                <div>
                                    <h1 className="text-[22px] font-black text-slate-800 tracking-tight leading-tight">早上好，{activeKid.name}！</h1>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black text-white shadow-sm bg-gradient-to-r ${getLevelTier(activeKid.level).bg}`}>
                                            <span className="opacity-90 leading-none">{getLevelTier(activeKid.level).emoji}</span>
                                            <span className="leading-none tracking-wider">LV.{activeKid.level} {getLevelTier(activeKid.level).title}</span>
                                        </div>
                                        <span className="text-[12px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">{activeKid.exp} / {nextLevelExp} EXP</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-indigo-500 transition-colors shadow-sm border border-slate-100 flex-shrink-0 transform md:translate-x-0 translate-x-2 opacity-50 group-hover:opacity-100 group-hover:scale-110 active:scale-95">
                                <Icons.ChevronRight size={20} />
                            </div>
                        </button>
                    </div>

                    <div className="max-w-5xl mx-auto mt-6 hidden md:flex overflow-x-auto hide-scrollbar gap-3 pb-1">
                        {[
                            { id: 'study', icon: <Icons.BookOpen size={18} />, label: "赚家庭币" },
                            { id: 'habit', icon: <Icons.ShieldCheck size={18} />, label: "习惯养成" },
                            { id: 'wealth', icon: <Icons.Wallet size={18} />, label: "财富中心" },
                            { id: 'shop', icon: <Icons.ShoppingBag size={18} />, label: "家庭超市" }
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setKidTab(tab.id)} className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm whitespace-nowrap transition-all shadow-sm ${kidTab === tab.id ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}>
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="max-w-5xl mx-auto p-4 md:p-8 pb-28 md:pb-8">
                    {kidTab === 'study' && renderStudyTab()}

                    {kidTab === 'habit' && (() => {
                        const todayTransactions = transactions.filter(t => t.kidId === activeKidId && t.category === 'habit' && new Date(t.date).toDateString() === new Date().toDateString());
                        const todayEarned = todayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                        const todayDeducted = todayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

                        return (
                            <div className="space-y-6 animate-fade-in pb-10">
                                {/* --- Glassmorphic Hero Dashboard Area --- */}
                                <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-emerald-500/20 text-white relative overflow-hidden group min-h-[160px] flex items-center">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700 pointer-events-none"></div>
                                    <div className="absolute bottom-[-20%] left-[-10%] w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>
                                    <Icons.ShieldCheck size={140} className="absolute -right-6 -bottom-8 opacity-[0.08] rotate-12 group-hover:rotate-0 transition-transform duration-500 pointer-events-none" />
                                    
                                    <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div>
                                            <div className="flex items-center gap-2 bg-white/20 w-fit px-3.5 py-1.5 rounded-full text-sm font-black backdrop-blur-md border border-white/20 mb-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-emerald-50">
                                                <Icons.Star size={16} className="text-yellow-300 fill-yellow-300" /> 习惯决定未来
                                            </div>
                                            <h2 className="text-3xl md:text-4xl font-black drop-shadow-md flex items-center gap-2">
                                                习惯养成基地
                                            </h2>
                                        </div>
                                        
                                        {/* Daily Summary Stats */}
                                        <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/20 shadow-inner w-full md:w-auto mt-2 md:mt-0">
                                            <div className="text-center flex-1 md:flex-initial">
                                                <div className="text-[12px] font-black text-emerald-100 mb-1 tracking-widest">今日奖励</div>
                                                <div className="text-3xl font-black text-white drop-shadow-sm leading-none">+{todayEarned}</div>
                                            </div>
                                            <div className="w-px h-10 bg-white/20 rounded-full"></div>
                                            <div className="text-center flex-1 md:flex-initial">
                                                <div className="text-[12px] font-black text-emerald-100 mb-1 tracking-widest">今日扣除</div>
                                                <div className="text-3xl font-black text-yellow-300 drop-shadow-sm leading-none">-{todayDeducted}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* --- Chunky Habit Cards Grid --- */}
                                <div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 px-2">
                                        <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                            <span className="w-1.5 h-5 bg-emerald-500 rounded-full"></span>
                                            今日习惯打卡
                                        </h3>
                                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl w-full md:w-auto overflow-x-auto hide-scrollbar">
                                            {[
                                                { id: 'all', label: '全部' },
                                                { id: 'income', label: '好习惯' },
                                                { id: 'expense', label: '坏习惯' },
                                                { id: 'completed', label: '已打卡' },
                                                { id: 'pending', label: '未打卡' }
                                            ].map(filter => (
                                                <button 
                                                    key={filter.id} 
                                                    onClick={() => setHabitCardFilter(filter.id)} 
                                                    className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${habitCardFilter === filter.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    {filter.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                                        {myTasks.filter(t => t.type === 'habit').filter(t => {
                                            const entry = t.kidId === 'all' ? t.history?.[selectedDate]?.[activeKidId] : t.history?.[selectedDate];
                                            const count = entry?.count || (entry?.status === 'completed' ? 1 : 0);
                                            let currentLimitCount = count;
                                            if (t.habitType === 'multiple' && t.periodMaxType === 'weekly') currentLimitCount = getWeeklyCompletionCount(t, activeKidId, selectedDate);
                                            const maxPerDay = t.periodMaxPerDay || 3;
                                            const isDone = (t.habitType === 'daily_once' && count >= 1) || (t.habitType === 'multiple' && currentLimitCount >= maxPerDay);
                                            if (habitCardFilter === 'income') return t.reward >= 0;
                                            if (habitCardFilter === 'expense') return t.reward < 0;
                                            if (habitCardFilter === 'completed') return isDone;
                                            if (habitCardFilter === 'pending') return !isDone;
                                            return true;
                                        }).map(t => {
                                            const isNegative = t.reward < 0;
                                            const entry = t.kidId === 'all' ? t.history?.[selectedDate]?.[activeKidId] : t.history?.[selectedDate];
                                            const count = entry?.count || (entry?.status === 'completed' ? 1 : 0);
                                            let currentLimitCount = count;
                                            if (t.habitType === 'multiple' && t.periodMaxType === 'weekly') currentLimitCount = getWeeklyCompletionCount(t, activeKidId, selectedDate);
                                            const maxPerDay = t.periodMaxPerDay || 3;
                                            const isDailyOnce = t.habitType === 'daily_once';
                                            const isMaxedOut = t.habitType === 'multiple' && currentLimitCount >= maxPerDay;
                                            const isDone = (isDailyOnce && count >= 1) || isMaxedOut;

                                            return (
                                                <div key={t.id} className="bg-white p-5 rounded-[2rem] border border-slate-100/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all flex flex-col justify-between group">
                                                    <div className="flex items-start justify-between gap-3 mb-5">
                                                        <div className="flex items-start gap-4 flex-1">
                                                            {/* Squircle Icon Container */}
                                                            <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-300 ${isNegative ? 'bg-red-50 text-red-500' : `bg-gradient-to-br ${t.habitColor || 'from-emerald-400 to-teal-500'} text-white`}`}>
                                                                {t.iconEmoji || renderIcon(t.iconName, 26)}
                                                            </div>
                                                            <div className="flex-1 min-w-0 pt-0.5">
                                                                <h3 className="font-black text-slate-800 text-lg leading-tight mb-1.5 line-clamp-1">{t.title}</h3>
                                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide border ${isNegative ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                                    {isNegative ? `扣 ${Math.abs(t.reward)} 家庭币` : `+${t.reward} 家庭币`}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Visual Streak / Counters / Progress Bars */}
                                                        {(() => {
                                                            const displayMax = isDailyOnce ? 1 : (t.periodMaxPerDay || 3);
                                                            const displayCount = isDailyOnce ? (count >= 1 ? 1 : 0) : currentLimitCount;
                                                            const useProgressBar = displayMax > 7 || (t.habitType === 'multiple' && t.periodMaxType === 'weekly');
                                                            
                                                            if (useProgressBar) {
                                                                const labelPrefix = t.periodMaxType === 'weekly' ? '本周' : '今日';
                                                                return (
                                                                    <div className="flex flex-col items-end gap-1.5 mt-1 shrink-0 w-24">
                                                                        <span className="text-[10px] font-black text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{labelPrefix} {displayCount}/{displayMax}</span>
                                                                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                                                                            <div className={`h-full rounded-full transition-all duration-500 ease-out ${isNegative ? 'bg-gradient-to-r from-red-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`} style={{ width: `${Math.min(100, (displayCount / displayMax) * 100)}%` }}></div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            } else {
                                                                return (
                                                                    <div className="flex gap-1 shrink-0 bg-slate-50 p-1.5 rounded-full border border-slate-100/50 flex-wrap mt-1 justify-end max-w-[80px]">
                                                                        {Array.from({ length: displayMax }).map((_, i) => (
                                                                            <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < displayCount ? (isNegative ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]') : 'bg-slate-200 shadow-inner'}`} />
                                                                        ))}
                                                                    </div>
                                                                );
                                                            }
                                                        })()}
                                                    </div>

                                                    {/* Action Button Area */}
                                                    <div className="mt-auto border-t border-slate-50 pt-4">
                                                        {isDone ? (
                                                            isNegative ? (
                                                                <div className="w-full bg-red-50/50 border border-red-100/50 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-black text-red-500 shadow-inner">
                                                                    <Icons.ShieldAlert size={18} /> 
                                                                    已达记录上限 {count > 1 ? `(${count}次)` : ''}
                                                                </div>
                                                            ) : (
                                                                <div className="w-full bg-emerald-50/50 border border-emerald-100/50 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-black text-emerald-600 shadow-inner">
                                                                    <Icons.CheckCircle size={18} /> 
                                                                    今日已达标 {count > 1 ? `(${count}次)` : ''}
                                                                </div>
                                                            )
                                                        ) : isNegative ? (
                                                            <button type="button" onClick={() => handleAttemptSubmit(t)} className="relative overflow-hidden w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-black shadow-[0_8px_20px_rgba(245,158,11,0.3)] active:scale-[0.98] transition-all group/btn">
                                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                                                                <Icons.ShieldAlert size={16} className="relative z-10" /> 
                                                                <span className="relative z-10">我要坦白 (主动承认扣分)</span>
                                                            </button>
                                                        ) : (
                                                            <button type="button" onClick={() => handleAttemptSubmit(t)} className="relative overflow-hidden w-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-black shadow-[0_8px_20px_rgba(52,211,153,0.3)] active:scale-[0.98] transition-all group/btn">
                                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                                                                <Icons.Zap size={16} className="relative z-10" /> 
                                                                <span className="relative z-10">我要去打卡</span>
                                                                {count > 0 && <span className="relative z-10 bg-white/20 px-2 py-0.5 rounded-md text-[10px] ml-1 font-bold">已打卡 {count} 次</span>}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {myTasks.filter(t => t.type === 'habit').length === 0 && (
                                            <div className="md:col-span-2 bg-white rounded-[2rem] border-2 border-slate-100 border-dashed flex flex-col items-center justify-center py-12 shadow-sm">
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-3 grayscale opacity-50">🏃</div>
                                                <div className="text-slate-400 font-bold text-sm">家长还没有为你设置习惯哦</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* --- Habit Activity Log (Redesigned Timeline) --- */}
                                <div className="bg-white rounded-[2rem] border border-slate-100/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden relative">
                                    <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                                    
                                    <div className="p-5 sm:p-6 border-b border-slate-50 bg-white flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div>
                                            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner"><Icons.TrendingUp size={18} strokeWidth={2.5} /></div> 
                                                近期足迹明细
                                            </h3>
                                        </div>
                                        {/* Filter Chips */}
                                        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 p-1 rounded-2xl">
                                            <button onClick={() => setHistoryFilter('all')} className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${historyFilter === 'all' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>全部</button>
                                            <button onClick={() => setHistoryFilter('income')} className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${historyFilter === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>获得</button>
                                            <button onClick={() => setHistoryFilter('expense')} className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${historyFilter === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>扣分</button>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 sm:p-6 relative">
                                        {transactions.filter(t => t.kidId === activeKidId && t.category === 'habit' && (historyFilter === 'all' || t.type === historyFilter)).length === 0 ? (
                                            <div className="text-center text-slate-400 text-sm py-10 font-bold bg-slate-50 rounded-[1.5rem]">
                                                {historyFilter === 'all' ? '暂无足迹记录，快去完成第一个习惯吧！' : '没有相关类型的足迹记录。'}
                                            </div>
                                        ) : (
                                            <div className="space-y-4 max-h-[22rem] overflow-y-auto custom-scrollbar pr-2 relative">
                                                <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-slate-100 rounded-full z-0"></div>
                                                
                                                {transactions.filter(t => t.kidId === activeKidId && t.category === 'habit' && (historyFilter === 'all' || t.type === historyFilter)).slice(0, 30).map(item => {
                                                    const isIncome = item.type === 'income';
                                                    const displayAmount = isIncome ? `+${item.amount}` : `-${item.amount}`;
                                                    // Clean up legacy titles: Remove (Exp) and prefix "记录成长: "
                                                    const cleanTitle = item.title.replace(/\(Exp\)/i, '').replace(/^(记录成长[:：\s]*)+/u, '').trim();

                                                    return (
                                                        <div key={item.id} className="relative pl-12 group z-10 mb-4 last:mb-0">
                                                            {/* Timeline Dot */}
                                                            <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full border-2 border-white shadow-sm flex items-center justify-center ${isIncome ? 'bg-emerald-400' : 'bg-red-400'} z-20`}></div>

                                                            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                                                                isIncome ? 'bg-gradient-to-r from-emerald-50/50 to-emerald-50/10 border-emerald-100 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-100' 
                                                                         : 'bg-gradient-to-r from-red-50/50 to-red-50/10 border-red-100 hover:border-red-200 hover:shadow-md hover:shadow-red-100'
                                                            }`}>
                                                                <div className="flex-1 min-w-0 pr-4">
                                                                    <div className="font-black text-slate-700 text-sm line-clamp-2">{cleanTitle}</div>
                                                                    <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-1.5">
                                                                        <Icons.Clock size={10} />
                                                                        {new Date(item.date).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className={`shrink-0 font-black text-base sm:text-lg tracking-tight bg-white px-3 py-1.5 rounded-xl shadow-sm border whitespace-nowrap flex items-baseline gap-0.5 ${
                                                                    isIncome ? 'text-emerald-500 border-emerald-100/50' : 'text-red-500 border-red-100/50'
                                                                }`}>
                                                                    {displayAmount} <span className="text-[10px] font-bold text-slate-400">家庭币</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

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
            <div className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center sticky top-0 z-[110]">
                <div className="flex items-center gap-2 md:gap-3">
                    <button onClick={() => changeAppState('profiles')} className="group flex items-center gap-1.5 md:gap-2 text-slate-300 hover:text-white transition-colors bg-slate-800/80 hover:bg-slate-700/80 rounded-full px-3 py-1.5 md:px-4 md:py-2 border border-slate-700/50 hover:border-slate-600/50 shadow-sm backdrop-blur-sm">
                        <Icons.ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        <span className="font-bold text-xs md:text-sm">切换角色</span>
                    </button>
                    <div className="hidden sm:flex items-center gap-2.5 ml-1 pl-3 md:pl-4 border-l border-slate-800/80">
                        <img src="/minilife_logo.png" className="w-8 h-8 md:w-10 md:h-10 rounded-xl shadow-sm" alt="Logo" /> <span className="font-black text-lg md:text-xl text-white tracking-tight">MiniLife 家庭版</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4 relative" ref={parentSettingsRef}>
                    <button onClick={() => setShowParentSettingsDropdown(!showParentSettingsDropdown)} className={`relative flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full transition-all duration-300 group shadow-sm ${showParentSettingsDropdown ? 'bg-indigo-500 text-white shadow-indigo-500/30' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/50 hover:border-slate-600/50'}`}>
                        <Icons.Settings size={20} className={`transition-transform duration-500 ${showParentSettingsDropdown ? 'rotate-90' : 'group-hover:rotate-45'}`} />
                        {parentSettings.pinEnabled && <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>}
                    </button>

                    {showParentSettingsDropdown && (
                        <div className="absolute top-full right-0 mt-3 w-64 md:w-72 bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-2 z-[110] animate-fade-in origin-top-right overflow-hidden before:content-[''] before:absolute before:-top-2 before:right-6 before:w-4 before:h-4 before:bg-white before:rotate-45 before:border-l before:border-t before:border-slate-100">
                            
                            {/* App Identity Banner visible only in dropdown on mobile */}
                            <div className="sm:hidden px-4 py-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl mb-2 flex items-center gap-3 border border-purple-100/50">
                                <img src="/minilife_logo.png" className="w-9 h-9 rounded-xl shadow-sm border border-white" alt="Logo" /> <span className="font-black text-[15px] text-indigo-900 tracking-tight">MiniLife 家庭版</span>
                            </div>

                            <div className="flex flex-col gap-1 p-1">
                                <button onClick={() => { setShowParentSettingsDropdown(false); setShowSettingsModal(true); }} className="flex items-center gap-3 px-3 py-3 rounded-2xl text-left hover:bg-slate-50 transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-100 transition-all shrink-0"><Icons.Users size={18} /></div>
                                    <div>
                                        <div className="font-bold text-[15px] text-slate-800 group-hover:text-blue-600 transition-colors">孩子资料与基础管教</div>
                                        <div className="text-[11px] font-medium text-slate-400 mt-0.5">管理孩子名单、设定权限</div>
                                    </div>
                                    <Icons.ChevronRight size={14} className="ml-auto text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                                </button>
                                
                                <button onClick={() => { setShowParentSettingsDropdown(false); setShowSubscriptionModal(true); }} className="flex items-center gap-3 px-3 py-3 rounded-2xl text-left hover:bg-slate-50 transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-100 transition-all shrink-0"><Icons.Gem size={18} /></div>
                                    <div>
                                        <div className="font-bold text-[15px] text-slate-800 group-hover:text-purple-600 transition-colors">MiniLife 体验计划与订阅</div>
                                        <div className="text-[11px] font-medium text-slate-400 mt-0.5">解锁完整功能、激活码兑换</div>
                                    </div>
                                    <Icons.ChevronRight size={14} className="ml-auto text-slate-300 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
                                </button>
                                
                                <div className="h-px bg-slate-100 my-1 mx-2"></div>

                                <button onClick={() => { setShowParentSettingsDropdown(false); handleTogglePin(); }} className="flex items-center gap-3 px-3 py-3 rounded-2xl text-left hover:bg-slate-50 transition-colors group">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-all shrink-0 ${parentSettings.pinEnabled ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                                        {parentSettings.pinEnabled ? <Icons.Lock size={18} /> : <Icons.Unlock size={18} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-[15px] text-slate-800 flex items-center gap-2">
                                            后台安全锁 
                                            {parentSettings.pinEnabled ? <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] uppercase tracking-wider font-black rounded text-center">已开启</span> : <span className="px-1.5 py-0.5 bg-slate-200 text-slate-500 text-[9px] uppercase tracking-wider font-black rounded text-center">未开启</span>}
                                        </div>
                                        <div className="text-[11px] font-medium text-slate-400 mt-0.5">保护后台不被孩子误触</div>
                                    </div>
                                </button>
                            </div>
                            
                            <div className="p-2 border-t border-slate-100 mt-1 bg-slate-50/50 rounded-b-[22px]">
                                <button onClick={() => { setShowParentSettingsDropdown(false); handleLogout(); }} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-rose-500 font-bold hover:bg-rose-50 hover:text-rose-600 transition-colors">
                                    <Icons.LogOut size={16} /> 退回登录页
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-4 md:p-8">
                <div className="hidden md:flex gap-4 border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
                    <button onClick={() => setParentTab('tasks')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'tasks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>赚家庭币</button>
                    <button onClick={() => setParentTab('plans')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'plans' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>习惯养成</button>
                    <button onClick={() => setParentTab('wealth')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'wealth' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>财富中心</button>
                    <button onClick={() => setParentTab('shop_manage')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'shop_manage' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>家庭超市</button>
                    <button onClick={() => setParentTab('settings')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'settings' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>我的</button>
                </div>

                {parentTab === 'tasks' && (
                    <div className="animate-fade-in">
                        {/* Week Calendar — same style as Kid Dashboard */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-6">
                            <div className="flex items-center justify-between mb-6 px-1">
                                <div className="flex items-center text-indigo-600 font-black text-sm sm:text-lg">
                                    第{getWeekNumber(currentViewDate)[1]}周
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-3">
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <button onClick={() => { const d = new Date(currentViewDate); d.setDate(d.getDate() - 7); setCurrentViewDate(d); }} className="p-1 sm:p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors bg-indigo-50/50">
                                            <Icons.ChevronLeft size={16} className="sm:w-[20px] sm:h-[20px]" />
                                        </button>
                                        <button onClick={() => { setCurrentViewDate(new Date()); setSelectedDate(formatDate(new Date())); }} className="bg-yellow-400 text-yellow-900 px-2.5 sm:px-5 py-1 sm:py-2 rounded-full font-black text-[11px] sm:text-sm hover:bg-yellow-500 transition-colors shadow-sm">
                                            今天
                                        </button>
                                        <button onClick={() => { const d = new Date(currentViewDate); d.setDate(d.getDate() + 7); setCurrentViewDate(d); }} className="p-1 sm:p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors bg-indigo-50/50">
                                            <Icons.ChevronRight size={16} className="sm:w-[20px] sm:h-[20px]" />
                                        </button>
                                    </div>
                                    <button onClick={() => setShowCalendarModal(true)} className="p-1.5 sm:p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors bg-slate-50">
                                        <Icons.Calendar size={16} className="sm:w-[20px] sm:h-[20px]" />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1 md:gap-2 pt-2 pb-2">
                                {getDisplayDateArray(currentViewDate).map((day, i) => {
                                    const { count, total } = getIncompleteStudyTasksCount(day.dateStr);

                                    return (
                                        <button key={i} onClick={() => setSelectedDate(day.dateStr)}
                                            className={`flex flex-col items-center py-2 md:py-4 px-1 rounded-xl md:rounded-2xl transition-all
                                                ${selectedDate === day.dateStr ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 -translate-y-1' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}
                                            `}>
                                            <span className={`text-[9px] md:text-xs font-bold mb-1 md:mb-2 whitespace-nowrap ${selectedDate === day.dateStr ? 'text-indigo-200' : 'text-slate-400'}`}>{day.d}</span>
                                            <span className="text-base sm:text-lg md:text-xl font-black">{day.displayDate.split('/')[1]}</span>
                                            <div className="mt-1.5 md:mt-2 h-3.5 flex items-center justify-center">
                                                {count > 0 ? (
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${selectedDate === day.dateStr ? 'bg-indigo-400/50 text-white' : 'bg-red-100 text-red-600'}`}>
                                                        {count}
                                                    </span>
                                                ) : (total > 0 ? (
                                                    <span className={`text-[10px] ${selectedDate === day.dateStr ? 'text-indigo-300' : 'text-emerald-500'}`}><Icons.Check size={12} /></span>
                                                ) : (
                                                    <div className={`w-1.5 h-1.5 rounded-full ${selectedDate === day.dateStr ? 'bg-white/30' : (day.dateStr === formatDate(new Date()) ? 'bg-orange-500' : 'bg-transparent')}`}></div>
                                                ))}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Kid Filter Bar - NEW STANDALONE UI */}
                        {kids.length > 0 && (
                            <div className="flex overflow-x-auto hide-scrollbar gap-2 sm:gap-3 mb-6 py-2 px-2 -mx-2 snap-x">
                                <button 
                                    onClick={() => setParentKidFilter('all')} 
                                    className={`shrink-0 snap-start flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 rounded-2xl transition-all border ${parentKidFilter === 'all' ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_8px_20px_rgb(79,70,229,0.25)] ring-4 ring-indigo-600/20' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 shadow-sm'}`}
                                >
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-inner ${parentKidFilter === 'all' ? 'bg-white/20' : 'bg-slate-100'}`}>🌐</div>
                                    <div className="text-left font-black">
                                        <div className={`text-[9px] sm:text-xs mb-0.5 ${parentKidFilter === 'all' ? 'text-indigo-200' : 'text-slate-400'}`}>查看所有</div>
                                        <div className="text-xs sm:text-base leading-none">全部孩子</div>
                                    </div>
                                </button>
                                {kids.map(k => (
                                     <button 
                                        key={k.id} 
                                        onClick={() => setParentKidFilter(k.id)} 
                                        className={`shrink-0 snap-start flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 rounded-2xl transition-all border ${parentKidFilter === k.id ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_8px_20px_rgb(79,70,229,0.25)] ring-4 ring-indigo-600/20' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 shadow-sm'}`}
                                    >
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-inner ${parentKidFilter === k.id ? 'bg-white/20' : 'bg-slate-100'}`}>{k.avatar}</div>
                                        <div className="text-left font-black">
                                            <div className={`text-[9px] sm:text-xs mb-0.5 ${parentKidFilter === k.id ? 'text-indigo-200' : 'text-slate-400'}`}>查看待办</div>
                                            <div className="text-xs sm:text-base leading-none">{k.name}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Title & Action Bar */}
                        <div className="flex justify-between items-center mb-6 relative">
                            <div className="text-xl font-black text-slate-800 border-l-4 border-indigo-500 pl-3">当日任务总览</div>
                            <button onClick={() => {
                                const defaultTimes = getDefaultTimeRange();
                                setEditingTask(null);
                                setPlanType('study');
                                setPlanForm({ targetKids: parentKidFilter === 'all' ? ['all'] : [parentKidFilter], category: '语文', iconName: getIconForCategory('语文'), title: '', desc: '', startDate: new Date().toISOString().split('T')[0], endDate: '', repeatType: 'today', weeklyDays: [1, 2, 3, 4, 5], ebbStrength: 'normal', periodDaysType: 'any', periodCustomDays: [1, 2, 3, 4, 5], periodTargetCount: 1, periodMaxPerDay: 1, periodMaxType: 'daily', timeSetting: 'range', startTime: defaultTimes.start, endTime: defaultTimes.end, durationPreset: 25, pointRule: 'default', reward: '', iconEmoji: '📚', habitColor: 'from-blue-400 to-blue-500', habitType: 'daily_once', attachments: [] });
                                setShowAddPlanModal(true);
                            }} className="bg-blue-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-0.5">
                                <Icons.Plus size={18} /> <span className="hidden sm:inline">新建任务</span><span className="sm:hidden">新建</span>
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
                                            if (parentKidFilter !== 'all' && kId !== parentKidFilter) return;
                                            if (kId !== 'status' && kResult?.status === 'pending_approval') {
                                                approvals.push({ task: t, date, record: kResult, actualKidId: kId });
                                            }
                                        });
                                    } else {
                                        // Legacy 1D logic
                                        if (parentKidFilter !== 'all' && t.kidId !== parentKidFilter) return;
                                        if (hr?.status === 'pending_approval') {
                                            approvals.push({ task: t, date, record: hr, actualKidId: t.kidId });
                                        }
                                    }
                                });
                                return approvals;
                            });

                            if (pendingApprovals.length === 0) return null;
                            return (
                                <div className="bg-[#FFF8EE] border border-orange-100 rounded-[2rem] p-4 sm:p-6 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-extrabold text-orange-700 flex items-center gap-2 text-lg">
                                            <Icons.Bell size={20} className="text-orange-600" /> 待审核验收
                                            <span className="bg-orange-500 text-white text-xs px-2.5 py-1 rounded-full">{pendingApprovals.length}</span>
                                        </h3>
                                        <button
                                            onClick={() => handleApproveAllTasks(pendingApprovals)}
                                            className="text-xs font-black text-orange-600 bg-orange-100/80 hover:bg-orange-200 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                                        >
                                            <Icons.CheckCircle size={14} /> 一键全部通过
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {pendingApprovals.map(({ task: t, date, actualKidId, record }) => {
                                            const kidInfo = kids.find(k => k.id === actualKidId);
                                            return (
                                                <div
                                                    key={`${t.id}-${date}`}
                                                    onClick={() => { setSelectedDate(date); setPreviewTask(t); setShowPreviewModal(true); }}
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-transparent cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group"
                                                >
                                                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                                        <div className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${getCategoryGradient(t.category || '计划')} flex flex-col items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                                                            {renderIcon(t.iconName || getIconForCategory(t.category), 22)}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-slate-800 text-lg mb-1">{t.title}</div>
                                                            <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
                                                                <span className="bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">{kidInfo?.avatar} {kidInfo?.name}</span>
                                                                <span>·</span>
                                                                <span>{date}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-none border-slate-50">
                                                        <span className="font-black text-indigo-600 text-md whitespace-nowrap">{t.reward > 0 ? '+' : ''}{t.reward} 家庭币</span>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setSelectedDate(date); setPreviewTask(t); setShowPreviewModal(true); }}
                                                            className="shrink-0 px-4 sm:px-6 py-2.5 bg-[#00C875] text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-200/50 hover:bg-[#00b065] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                                        >
                                                            <Icons.Check size={16} strokeWidth={3} /> 去审核
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
                            const effectiveFilter = parentKidFilter; // Fix: Stop forcing kids[0].id when 'all' is selected
                            let parentTasks = tasks.filter(t => t.type === 'study' && isTaskDueOnDate(t, selectedDate));
                            if (effectiveFilter !== 'all') {
                                parentTasks = parentTasks.filter(t => t.kidId === effectiveFilter || t.kidId === 'all');
                            }

                            // Notice: We map to 'getTaskStatusOnDate' using the task's specific kidId when we are in 'all' view,
                            // or fallback to validating against kid[0] if the task itself is meant for 'all'.
                            // In real-world, a task for 'all' shouldn't exist as a generic state, 
                            // but we process the query keeping the exact kid in context.
                            const getDailyStatus = (t) => {
                                let queryKidId = effectiveFilter === 'all' ? (t.kidId === 'all' ? kids[0]?.id : t.kidId) : effectiveFilter;
                                return getTaskStatusOnDate(t, selectedDate, queryKidId);
                            };
                            
                            // Apply Subject Filters
                            if (parentTaskFilter.length > 0) {
                                parentTasks = parentTasks.filter(t => parentTaskFilter.includes(t.category || '计划'));
                            }
                            // Apply Status Filters
                            if (parentTaskStatusFilter !== 'all') {
                                parentTasks = parentTasks.filter(t => {
                                    const st = getDailyStatus(t);
                                    if (parentTaskStatusFilter === 'completed') return st === 'completed';
                                    if (parentTaskStatusFilter === 'pending') return st === 'pending_approval';
                                    if (parentTaskStatusFilter === 'incomplete') return st === 'todo' || st === 'in_progress' || st === 'failed';
                                    return true;
                                });
                            }

                            // Dynamic Categories for Filter Menu
                            const availableCategories = Array.from(new Set(tasks.filter(t => t.type === 'study' && isTaskDueOnDate(t, selectedDate) && (effectiveFilter === 'all' || t.kidId === effectiveFilter || t.kidId === 'all')).map(t => t.category || '计划'))).filter(Boolean);

                            // Apply Sorting
                            parentTasks.sort((a, b) => {
                                if (isReordering) return (a.order || 0) - (b.order || 0);

                                if (parentTaskSort === 'time_asc') {
                                    const getMins = t => t.timeStr && t.timeStr.includes('分钟') ? parseInt(t.timeStr) : 999;
                                    return getMins(a) - getMins(b);
                                }
                                if (parentTaskSort === 'category') return (a.category || '').localeCompare(b.category || '');
                                if (parentTaskSort === 'status') {
                                    const statusWeight = { completed: 3, pending_approval: 2, in_progress: 1, failed: 0, todo: 0 };
                                    return statusWeight[getDailyStatus(a)] - statusWeight[getDailyStatus(b)];
                                }
                                if (parentTaskSort === 'created_desc') return (b.createdAt || '').localeCompare(a.createdAt || '');
                                if (parentTaskSort === 'reward_desc') return (b.reward || 0) - (a.reward || 0);
                                return (a.order || 0) - (b.order || 0); // Default order fallback
                            });

                            const handleParentReorderTask = (sourceIndex, targetIndex) => {
                                if (sourceIndex === targetIndex || targetIndex < 0 || targetIndex >= parentTasks.length) return;
                                const updatedSubList = [...parentTasks];
                                const [removed] = updatedSubList.splice(sourceIndex, 1);
                                updatedSubList.splice(targetIndex, 0, removed);
                                
                                // Reassign order only for the specifically dragged tasks
                                updatedSubList.forEach((task, idx) => task.order = idx);
                                
                                const newGlobalTasks = [...tasks];
                                updatedSubList.forEach(task => {
                                    const globalIndex = newGlobalTasks.findIndex(g => g.id === task.id);
                                    if(globalIndex > -1) newGlobalTasks[globalIndex].order = task.order;
                                    apiFetch(`/api/tasks/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: task.order }) }).catch(console.error);
                                });
                                setTasks(newGlobalTasks);
                            };

                            return (
                                <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full pb-10">
                                    
                                    {/* Advanced Filter & Sort Bar (Copied from Kid Portal) */}
                                    <div className="flex items-center justify-between bg-slate-50 border-b border-slate-200 pt-2 pb-3 mb-4">
                                        <div className="flex items-center gap-2 md:gap-4 flex-1 relative">
                                            {/* Filtering Button */}
                                            <div className="relative shrink-0" ref={parentFilterRef}>
                                                <button onClick={() => { setShowFilterDropdown(!showFilterDropdown); setShowSortDropdown(false); }} className={`flex items-center justify-center gap-1.5 w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-full sm:rounded-none sm:bg-transparent shadow-sm sm:shadow-none border sm:border-transparent transition-colors ${parentTaskFilter.length > 0 || parentTaskStatusFilter !== 'all' ? 'bg-indigo-600 text-white sm:text-indigo-600 sm:bg-transparent sm:border-transparent border-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600'}`}>
                                                    <Icons.Filter size={16} className={`sm:w-[14px] sm:h-[14px] ${showFilterDropdown ? 'text-indigo-600 fill-indigo-100' : ''}`} /> 
                                                    <span className="hidden sm:inline font-bold text-sm">筛选</span>
                                                    {(parentTaskFilter.length > 0 || parentTaskStatusFilter !== 'all') && <span className="absolute -top-1 -right-1 sm:static sm:w-auto sm:text-xs bg-red-500 text-white text-[10px] min-w-[16px] h-4 flex items-center justify-center rounded-full sm:bg-indigo-100 sm:text-indigo-600 sm:px-2">{parentTaskFilter.length + (parentTaskStatusFilter !== 'all' ? 1 : 0)}</span>}
                                                </button>

                                                {/* Filter Dropdown */}
                                                {showFilterDropdown && (
                                                    <div className="absolute left-0 sm:left-auto mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-[60]">
                                                        <div className="px-3 py-2 text-xs font-black text-slate-400 border-b border-slate-50 mb-2">按状态</div>
                                                        <div className="grid grid-cols-2 gap-2 px-2">
                                                            <button onClick={() => setParentTaskStatusFilter('all')} className={`py-1.5 text-xs font-bold rounded-lg ${parentTaskStatusFilter === 'all' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>全部状态</button>
                                                            <button onClick={() => setParentTaskStatusFilter('incomplete')} className={`py-1.5 text-xs font-bold rounded-lg ${parentTaskStatusFilter === 'incomplete' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>未完成</button>
                                                            <button onClick={() => setParentTaskStatusFilter('pending')} className={`py-1.5 text-xs font-bold rounded-lg ${parentTaskStatusFilter === 'pending' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>待审核</button>
                                                            <button onClick={() => setParentTaskStatusFilter('completed')} className={`py-1.5 text-xs font-bold rounded-lg ${parentTaskStatusFilter === 'completed' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>已完成</button>
                                                        </div>

                                                        <div className="px-3 py-2 text-xs font-black text-slate-400 border-b border-slate-50 mt-2 mb-2">按科目 ({availableCategories.length})</div>
                                                        <div className="flex flex-col max-h-40 overflow-y-auto px-2 custom-scrollbar">
                                                            {availableCategories.map(cat => (
                                                                <label key={cat} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={parentTaskFilter.includes(cat)}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) setParentTaskFilter([...parentTaskFilter, cat]);
                                                                            else setParentTaskFilter(parentTaskFilter.filter(c => c !== cat));
                                                                        }}
                                                                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                                                    />
                                                                    <span className="text-slate-700 font-bold">{cat}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                        
                                                        <div className="border-t border-slate-100 mt-2 pt-2 px-4 flex gap-2">
                                                            <button onClick={() => { setParentTaskFilter([]); setParentTaskStatusFilter('all'); }} className="flex-1 text-center py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">重置</button>
                                                            <button onClick={() => setShowFilterDropdown(false)} className="flex-1 text-center py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm shadow-indigo-200">完成</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="w-px h-4 bg-slate-200 shrink-0 hidden sm:block"></div>

                                            {/* Sorting Selector */}
                                            <div className="relative shrink-0 flex items-center justify-center group" ref={parentSortRef}>
                                                <button 
                                                    onClick={() => { setShowSortDropdown(!showSortDropdown); setShowFilterDropdown(false); }}
                                                    className={`flex items-center justify-center flex-row gap-1.5 w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-full sm:rounded-none sm:bg-transparent bg-white shadow-sm sm:shadow-none border sm:border-transparent transition-colors cursor-pointer ${showSortDropdown || parentTaskSort !== 'default' ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'text-slate-500 border-slate-200 hover:text-indigo-600'}`}
                                                >
                                                    <Icons.SortAsc size={16} className="sm:w-[14px] sm:h-[14px]" />
                                                    <span className="hidden sm:inline font-bold text-[13px] sm:text-sm">
                                                        {parentTaskSort === 'default' && '默认顺序'}
                                                        {parentTaskSort === 'time_asc' && '最快完成的'}
                                                        {parentTaskSort === 'category' && '按科目分类'}
                                                        {parentTaskSort === 'status' && '按完成状态'}
                                                        {parentTaskSort === 'created_desc' && '最新添加的'}
                                                        {parentTaskSort === 'reward_desc' && '奖励最多的'}
                                                    </span>
                                                    <Icons.ChevronDown size={14} className={`hidden sm:block transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                                                </button>
                                                
                                                {showSortDropdown && (
                                                    <div className="absolute top-full right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-[60] animate-fade-in origin-top">
                                                        {[
                                                            { id: 'default', label: '默认顺序' },
                                                            { id: 'time_asc', label: '最快完成的' },
                                                            { id: 'category', label: '按科目分类' },
                                                            { id: 'status', label: '按完成状态' },
                                                            { id: 'created_desc', label: '最新添加的' },
                                                            { id: 'reward_desc', label: '奖励最多的' },
                                                        ].map(option => (
                                                            <button 
                                                                key={option.id}
                                                                onClick={() => { setParentTaskSort(option.id); setShowSortDropdown(false); }}
                                                                className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors flex flex-row items-center justify-between ${parentTaskSort === option.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                                            >
                                                                {option.label}
                                                                {parentTaskSort === option.id && <Icons.Check size={14} />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="w-px h-4 bg-slate-200 shrink-0 hidden sm:block"></div>

                                            {/* Reordering Toggle */}
                                            <button onClick={() => setIsReordering(!isReordering)} className={`shrink-0 flex items-center justify-center gap-1.5 w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-full sm:rounded-none sm:bg-transparent shadow-sm sm:shadow-none border sm:border-transparent transition-colors ${isReordering ? 'bg-indigo-600 text-white sm:text-indigo-600 sm:bg-transparent sm:border-transparent border-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600'}`}>
                                                {isReordering ? <Icons.Check size={16} className="sm:w-[14px] sm:h-[14px]" /> : <Icons.List size={16} className="sm:w-[14px] sm:h-[14px]" />} 
                                                <span className="hidden sm:inline font-bold text-sm">{isReordering ? '保存排序' : '自定义排序'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {parentTasks.length === 0 && <div className="text-center py-16 text-slate-400 font-bold bg-white rounded-2xl border border-slate-100 shadow-sm">没有找到符合条件的任务哦~</div>}



                                    {parentTasks.map((t, index) => {
                                        // For Parent view UI display trick: if KidId === 'all', randomly select the first active kid to show avatar or generic '全部孩子'
                                        let displayKidId = t.kidId;
                                        if (t.kidId === 'all') displayKidId = effectiveFilter === 'all' ? 'all' : effectiveFilter;

                                        const kidInfo = displayKidId === 'all' ? { name: '全部孩子', avatar: '👥' } : kids.find(k => k.id === displayKidId);
                                        const status = getDailyStatus(t);
                                        
                                        // Extract exact history record for evidence rendering
                                        const actualRenderKidId = displayKidId === 'all' ? kids[0]?.id : displayKidId;
                                        const hr = t.history?.[selectedDate]?.[actualRenderKidId];

                                        return (
                                            <div 
                                                key={t.id} 
                                                draggable={isReordering}
                                                onDragStart={(e) => { e.dataTransfer.setData('text/plain', index); e.currentTarget.classList.add('opacity-50'); }}
                                                onDragEnd={(e) => { e.currentTarget.classList.remove('opacity-50'); }}
                                                onDragOver={(e) => { e.preventDefault(); }}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                                                    handleParentReorderTask(sourceIndex, index);
                                                }}
                                                className={`bg-white rounded-[2rem] p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group flex flex-col sm:flex-row gap-4 relative overflow-hidden mb-4 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] ${status === 'completed' ? 'border-2 border-emerald-100 shadow-[0_8px_30px_rgba(16,185,129,0.06)]' : 'border border-slate-100/60'} ${isReordering ? 'cursor-move ring-2 ring-indigo-300' : ''}`}
                                            >
                                                {!isReordering && <button onClick={() => { setSelectedDate(selectedDate); setPreviewTask(t); setShowPreviewModal(true); }} className="absolute inset-0 z-0 cursor-pointer hidden sm:block" aria-label="查看任务详情"></button>}
                                                
                                                {isReordering && (
                                                    <>
                                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300 flex items-center justify-center p-2 z-10 hidden sm:flex">
                                                            <Icons.GripVertical size={20} />
                                                        </div>
                                                        <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20 sm:hidden">
                                                            <button onClick={(e) => { e.stopPropagation(); handleParentReorderTask(index, index - 1); }} disabled={index === 0} className="w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur hover:bg-slate-50 border border-slate-200/50 rounded-full text-slate-400 disabled:opacity-30 disabled:bg-slate-50 shadow-sm transition-all"><Icons.ChevronDown className="rotate-180" size={16}/></button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleParentReorderTask(index, index + 1); }} disabled={index === parentTasks.length - 1} className="w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur hover:bg-slate-50 border border-slate-200/50 rounded-full text-slate-400 disabled:opacity-30 disabled:bg-slate-50 shadow-sm transition-all"><Icons.ChevronDown size={16}/></button>
                                                        </div>
                                                    </>
                                                )}

                                                {/* Left Section: Big Colorful Squircle Icon */}
                                                <div onClick={() => { if(!isReordering) { setPreviewTask(t); setShowPreviewModal(true); } }} className={`flex z-10 sm:w-auto items-start gap-4 flex-1 ${!isReordering ? 'cursor-pointer' : ''} ${isReordering ? 'sm:ml-6' : ''}`}>
                                                    <div className={`w-16 h-16 shrink-0 rounded-[1.25rem] bg-gradient-to-br ${getCategoryGradient(t.category || '计划')} flex flex-col items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform duration-300 relative`}>
                                                        {renderIcon(t.iconName || getIconForCategory(t.category), 26)}
                                                        <span className={`text-[11px] font-black mt-1 text-center w-full line-clamp-1 opacity-90 tracking-wide`}>{t.category || '计划'}</span>
                                                        {/* Premium Checkmark Badge overlay for completed status */}
                                                        {status === 'completed' && (
                                                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                                                <div className="bg-emerald-500 rounded-full w-5 h-5 flex items-center justify-center text-white">
                                                                    <Icons.Check size={12} strokeWidth={4} />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 flex flex-col pt-0.5">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                            <h3 className={`font-black text-lg md:text-xl leading-tight line-clamp-2 ${status === 'completed' ? 'text-slate-400' : 'text-slate-800'}`}>{t.title}</h3>
                                                            <span className="bg-slate-100 text-slate-500 text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded whitespace-nowrap">{kidInfo?.avatar} {kidInfo?.name}</span>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2 items-center mt-2">
                                                            {/* Reward Pill */}
                                                            <div className="bg-amber-100/80 text-amber-600 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 border border-amber-200/50">
                                                                {t.reward} <Icons.Star size={12} fill="currentColor" />
                                                            </div>
                                                            {/* Time Pill */}
                                                            <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                                <Icons.Clock size={12} /> {t.timeStr || '--:--'}
                                                            </div>
                                                            {/* Frequency Pill */}
                                                            <div className="bg-indigo-50 text-indigo-500 px-2 py-1 rounded-full text-[10px] font-black tracking-wide">
                                                                {t.frequency || '每天'}
                                                            </div>
                                                            {status === 'completed' && (
                                                                <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-1 rounded-full text-[10px] font-black tracking-wide flex items-center gap-1">
                                                                    <Icons.CheckCircle size={10} /> 已完成
                                                                </div>
                                                            )}
                                                            {status === 'pending_approval' && (
                                                                <div className="bg-orange-50 text-orange-600 border border-orange-200 px-2 py-1 rounded-full text-[10px] font-black tracking-wide flex items-center gap-1">
                                                                    <Icons.Clock size={10} /> 待审批
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right/Bottom Section: Parent Actions */}
                                                <div className="z-10 flex sm:flex-col justify-end sm:justify-center items-stretch gap-2 shrink-0 sm:w-32 mt-2 sm:mt-0 relative">
                                                    {status === 'pending_approval' ? (
                                                        <button onClick={(e) => { e.stopPropagation(); setPreviewTask(t); setShowPreviewModal(true); }} className="flex-1 sm:flex-none bg-gradient-to-b from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-500/30 text-white rounded-xl py-3 sm:py-2 px-4 text-xs sm:text-sm font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-emerald-400/50">
                                                            <Icons.CheckCircle size={16} fill="currentColor" /> 去审核
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingTask(t);
                                                                setPlanType(t.type || 'study');
                                                                setPlanForm({
                                                                    targetKids: [t.kidId || 'all'],
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
                                                                    periodMaxType: t.periodMaxType || 'daily',
                                                                    timeSetting: t.timeStr && String(t.timeStr) !== '--:--' ? (String(t.timeStr).includes('-') ? 'range' : 'duration') : 'none',
                                                                    startTime: t.timeStr && String(t.timeStr).includes('-') ? String(t.timeStr).split('-')[0] : '',
                                                                    endTime: t.timeStr && String(t.timeStr).includes('-') ? String(t.timeStr).split('-')[1] : '',
                                                                    durationPreset: t.timeStr && String(t.timeStr).includes('分钟') ? parseInt(String(t.timeStr)) : 25,
                                                                    pointRule: (t.pointRule && t.pointRule === 'custom') || (t.type === 'habit') ? 'custom' : 'default',
                                                                    reward: String(t.reward || ''),
                                                                    iconEmoji: t.iconEmoji || '📚',
                                                                    habitColor: t.catColor || 'from-blue-400 to-blue-500',
                                                                    habitType: t.habitType || 'daily_once',
                                                                    attachments: t.attachments || [],
                                                                    requireApproval: t.requireApproval !== undefined ? t.requireApproval : true
                                                                });
                                                                setShowAddPlanModal(true);
                                                            }} className="flex-1 sm:flex-none bg-gradient-to-b from-blue-400 to-blue-500 shadow-lg shadow-blue-500/30 text-white rounded-full py-2 px-4 text-xs font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-blue-400/50">
                                                                <Icons.Edit3 size={14} fill="currentColor" /> 编辑
                                                            </button>
                                                            <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmTask(t); }} className="flex-1 sm:flex-none bg-gradient-to-b from-slate-100 to-slate-200 text-slate-500 rounded-full py-2 px-4 text-xs font-black hover:bg-slate-300 transition-colors flex items-center justify-center gap-1.5 border border-slate-200/50">
                                                                <Icons.Trash2 size={14} /> 删除
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                )}

                {parentTab === 'plans' && (
                    <div className="animate-fade-in space-y-6">
                        {/* Glassmorphic Hero Section */}
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-emerald-500/20 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
                            <div className="relative z-10 w-full sm:w-auto">
                                <h2 className="font-extrabold text-white text-2xl sm:text-3xl mb-2 flex items-center gap-3 drop-shadow-sm">
                                    <span className="bg-white/20 p-2 rounded-2xl backdrop-blur-sm border border-white/20 text-xl sm:text-2xl">🌱</span>
                                    习惯养成与成长
                                </h2>
                                <p className="text-emerald-50 text-sm sm:text-base font-medium opacity-90 max-w-sm">设置正向行为规范，引导孩子通过日常点滴积累家庭财富，培养好习惯。</p>
                            </div>
                            <button onClick={() => {
                                const defaultTimes = getDefaultTimeRange();
                                setEditingTask(null);
                                setPlanType('habit');
                                setPlanForm({ targetKids: ['all'], category: '语文', iconName: getIconForCategory('语文'), title: '', desc: '', startDate: new Date().toISOString().split('T')[0], endDate: '', repeatType: 'today', weeklyDays: [1, 2, 3, 4, 5], ebbStrength: 'normal', periodDaysType: 'any', periodCustomDays: [1, 2, 3, 4, 5], periodTargetCount: 1, periodMaxPerDay: 1, periodMaxType: 'daily', timeSetting: 'range', startTime: defaultTimes.start, endTime: defaultTimes.end, durationPreset: 25, pointRule: 'default', reward: '', iconEmoji: '📚', habitColor: 'from-blue-400 to-blue-500', habitType: 'daily_once', attachments: [] });
                                setShowAddPlanModal(true);
                            }} className="relative z-10 w-full sm:w-auto bg-white/95 backdrop-blur-sm text-emerald-700 px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl font-black text-base sm:text-lg transition-all hover:scale-105 hover:bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center gap-2 group">
                                <Icons.Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" /> 新建习惯规则
                            </button>
                        </div>

                        {/* Habit Rules Grid */}
                        <div>
                            <h3 className="font-black text-slate-800 mb-4 sm:mb-5 text-lg sm:text-xl flex items-center gap-2 px-2">
                                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                                当前生效的习惯规则
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                                {tasks.filter(t => t.type === 'habit').map(t => {
                                    const kName = t.kidId === 'all' ? '全部孩子' : (kids.find(k => k.id === t.kidId)?.name || '未知');
                                    return (
                                        <div key={t.id} className="bg-white p-5 rounded-[2rem] border border-slate-100/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all flex flex-col justify-between group">
                                            <div className="flex items-start gap-4 mb-5">
                                                <div className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${t.habitColor || 'from-emerald-400 to-teal-500'} flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                                                    {t.iconEmoji || '🛡️'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 mb-1">
                                                        <h4 className="font-black text-slate-800 text-lg line-clamp-1">{t.title}</h4>
                                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-bold whitespace-nowrap w-fit">{kName} 专属</span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">{t.standards || t.desc}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
                                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-black tracking-wide ${t.reward < 0 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                                    {t.reward > 0 ? '+' : ''}{t.reward} 家庭币
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {t.reward < 0 && (() => {
                                                        const todayStr = formatDate(new Date());
                                                        const kidHistory = t.history || {};
                                                        const todayHist = kidHistory[todayStr] || {};
                                                        const maxAllowed = t.maxPerDay || 1;
                                                        
                                                        // Check if ALL assigned kids are maxed out
                                                        const targetKids = t.kidId === 'all' ? kids : kids.filter(k => k.id === t.kidId);
                                                        let allMaxed = true;
                                                        
                                                        for (const k of targetKids) {
                                                            const kidTodayData = t.kidId === 'all' ? (todayHist[k.id] || {}) : todayHist;
                                                            const attemptsToday = Array.isArray(kidTodayData) ? kidTodayData.length : (kidTodayData.status ? 1 : 0);
                                                            if (attemptsToday < maxAllowed) {
                                                                allMaxed = false;
                                                                break;
                                                            }
                                                        }

                                                        if (allMaxed && targetKids.length > 0) {
                                                            return (
                                                                <button disabled className="bg-slate-100 text-slate-400 px-3 py-1.5 rounded-xl text-xs font-black border border-slate-200 cursor-not-allowed">
                                                                    已达记录上限
                                                                </button>
                                                            );
                                                        }

                                                        return (
                                                            <button onClick={() => {
                                                                setPenaltyTaskContext(t);
                                                                if (t.kidId !== 'all') {
                                                                    setPenaltySelectedKidIds([t.kidId]);
                                                                } else if (kids.length === 1) {
                                                                    setPenaltySelectedKidIds([kids[0].id]);
                                                                } else {
                                                                    setPenaltySelectedKidIds([]);
                                                                }
                                                                setShowPenaltyModal(true);
                                                            }} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-xl text-xs font-black transition-all border border-red-100 hover:border-transparent">记录扣分</button>
                                                        );
                                                    })()}
                                                    
                                                    <button onClick={() => {
                                                        setPlanType(t.type || 'habit');
                                                        setPlanForm({
                                                            targetKids: [t.kidId || 'all'],
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
                                                            periodMaxPerDay: t.periodMaxPerDay || 3,
                                                            periodMaxType: t.periodMaxType || 'daily'
                                                        });
                                                        setShowAddPlanModal(true);
                                                        setEditingTask(t);
                                                    }} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-500 hover:text-white hover:shadow-md hover:shadow-blue-200 transition-all"><Icons.Edit3 size={16} /></button>
                                                    
                                                    <button onClick={() => setDeleteConfirmTask(t)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white hover:shadow-md hover:shadow-rose-200 transition-all"><Icons.Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {tasks.filter(t => t.type === 'habit').length === 0 && (
                                    <div className="md:col-span-2 bg-white rounded-[2rem] border-2 border-slate-100 border-dashed flex flex-col items-center justify-center py-16 sm:py-20 shadow-sm">
                                        <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-4xl mb-4 grayscale opacity-60">🌱</div>
                                        <div className="text-slate-400 font-bold text-base sm:text-lg">暂无习惯规则，点击上方新建吧~</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Habit Transactions Feed */}
                        <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100/80 overflow-hidden relative">
                            {/* Decorative Top Banner */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                            
                            <div className="p-5 sm:p-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <div>
                                    <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner"><Icons.TrendingUp size={18} strokeWidth={2.5} /></div> 
                                        近期成长轨迹
                                    </h3>
                                    <p className="text-xs text-slate-400 font-bold mt-1 ml-10">此处仅展示习惯打卡的家庭币收支记录</p>
                                </div>
                            </div>
                            
                            <div className="p-4 sm:p-6 relative">
                                {transactions.filter(t => t.category === 'habit').length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 font-bold bg-slate-50 rounded-[1.5rem]">还没有产生打卡记录哦~</div>
                                ) : (
                                    <div className="space-y-4 max-h-[28rem] overflow-y-auto custom-scrollbar pr-2 relative">
                                        {/* Global Timeline Track */}
                                        <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-slate-100 rounded-full z-0"></div>
                                        
                                        {transactions.filter(t => t.category === 'habit').slice(0, 40).map(item => {
                                            const kName = kids.find(k => k.id === item.kidId)?.name || '未知';
                                            const isIncome = item.type === 'income';
                                            
                                            // Handle cases where older backend versions logged 'EXP' into title or amounts
                                            const displayAmount = isIncome ? `+${item.amount}` : `-${item.amount}`;
                                            const cleanTitle = item.title.replace(/\(Exp\)/i, '').trim();
                                            
                                            return (
                                                <div key={item.id} className="relative pl-12 group z-10">
                                                    {/* Timeline Dot */}
                                                    <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full border-2 border-white shadow-sm flex items-center justify-center ${isIncome ? 'bg-emerald-400' : 'bg-red-400'} z-20`}></div>

                                                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                                                        isIncome ? 'bg-gradient-to-r from-emerald-50/50 to-emerald-50/10 border-emerald-100 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-100' 
                                                                 : 'bg-gradient-to-r from-red-50/50 to-red-50/10 border-red-100 hover:border-red-200 hover:shadow-md hover:shadow-red-100'
                                                    }`}>
                                                        <div className="mb-2 sm:mb-0">
                                                            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                                                                <span className="text-[10px] bg-white border border-slate-200 shadow-sm font-black text-slate-600 px-2.5 py-1 rounded-lg tracking-wider">{kName}</span>
                                                                <div className="font-black text-slate-700 text-sm sm:text-[15px]">{cleanTitle}</div>
                                                            </div>
                                                            <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mt-2">
                                                                <div className="bg-slate-100 p-1 rounded-md"><Icons.Clock size={10} /></div>
                                                                {new Date(item.date).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-end">
                                                            <div className={`font-black text-lg tracking-tight bg-white px-4 py-2 rounded-xl shadow-sm border ${
                                                                isIncome ? 'text-emerald-500 border-emerald-100/50' : 'text-red-500 border-red-100/50'
                                                            }`}>
                                                                {displayAmount} <span className="text-[11px] font-bold text-slate-400 ml-0.5">币</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
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

                        {/* Child Growth Profile Management Card */}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-8 shadow-sm border border-indigo-400/30 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="flex items-center gap-3 mb-6 border-b border-indigo-400/30 pb-4 relative z-10">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-sm"><Icons.Star size={20} /></div>
                                <h2 className="text-xl font-black text-white">儿童成长图鉴管理</h2>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <p className="text-indigo-100 text-sm leading-relaxed font-medium">配置儿童的等级称号、升级所需经验值以及专属头像框。等级系统能极大提升孩子的打卡动力。</p>
                                <button onClick={() => setShowLevelModal(true)} className="w-full bg-white text-indigo-600 py-3.5 rounded-xl font-black hover:bg-slate-50 transition-colors shadow-lg shadow-indigo-900/20 active:scale-[0.98] flex items-center justify-center gap-2 group-hover:shadow-xl group-hover:shadow-indigo-900/30">
                                    进入图鉴配置中心 <Icons.ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700"><Icons.Users size={20} /></div>
                                <h2 className="text-xl font-black text-slate-800">孩子资料管理 <span className="text-sm font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md ml-1">{kids.length}/5人</span></h2>
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
                                <button onClick={() => {
                                    if (kids.length >= 5) {
                                        return notify("目前最多支持添加5名家庭成员！", "warning");
                                    }
                                    setNewKidForm({ id: null, name: '', gender: 'boy', avatar: '👦' });
                                    setShowAddKidModal(true);
                                }} className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 border-2 border-dashed border-slate-300 transition-colors flex items-center justify-center gap-2">
                                    <Icons.Plus size={18} className="text-slate-400"/> 添加家庭成员 
                                </button>
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
        const themeSettings = authMode === 'login'
            ? {
                title: '欢迎回航',
                subtitle: '继续记录这段关于爱与成长的奇妙旅程...',
                btnText: '登 录',
                btnClass: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-indigo-500/30'
            }
            : {
                title: '开启 MiniLife',
                subtitle: '为孩子搭建一座充满成就感与回忆的城堡',
                btnText: '注 册 并 试 用',
                btnClass: 'bg-gradient-to-r from-orange-400 to-rose-500 hover:from-orange-300 hover:to-rose-400 shadow-orange-500/30'
            };

        return (
            <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
                {/* Lush Dribbble-style Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-orange-50 z-0"></div>
                
                {/* Floating animated blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300/30 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-300/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="w-full max-w-[420px] bg-white/70 backdrop-blur-3xl border border-white shadow-2xl rounded-[2.5rem] p-6 md:p-10 relative z-10 transition-all duration-500 ease-out">
                    
                    {/* Header with App Logo */}
                    <div className="text-center mb-5">
                        <img src="/minilife_logo_transparent.png?v=2" alt="MiniLife" className="w-20 h-20 md:w-28 md:h-28 mx-auto mb-2 drop-shadow-xl animate-float" />
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{themeSettings.title}</h1>
                        <p className="text-slate-500 font-bold mt-2 text-xs md:text-sm leading-relaxed max-w-[280px] mx-auto">{themeSettings.subtitle}</p>
                    </div>

                    {/* Mode Switcher */}
                    <div className="flex bg-slate-200/50 p-1 rounded-xl mb-5 shadow-inner backdrop-blur-sm">
                        <button
                            type="button"
                            onClick={() => setAuthMode('login')}
                            className={`flex-1 py-2 text-[13px] md:text-sm rounded-lg font-black transition-all duration-300 ${authMode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >欢迎登录</button>
                        <button
                            type="button"
                            onClick={() => setAuthMode('register')}
                            className={`flex-1 py-2 text-[13px] md:text-sm rounded-lg font-black transition-all duration-300 ${authMode === 'register' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >注册账号</button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-3 md:space-y-5">
                        <div className="space-y-1">
                            <label className="pl-1 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">Email 账号</label>
                            <input required type="email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} 
                                className="w-full bg-white/60 border-2 border-white focus:border-indigo-300 focus:bg-white rounded-xl md:rounded-2xl p-3 md:p-4 outline-none font-bold text-slate-800 transition-all shadow-inner placeholder:text-slate-300" 
                                placeholder="name@example.com" />
                        </div>
                        <div className="space-y-1">
                            <label className="pl-1 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">安全密码</label>
                            <input required type="password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} 
                                className="w-full bg-white/60 border-2 border-white focus:border-indigo-300 focus:bg-white rounded-xl md:rounded-2xl p-3 md:p-4 outline-none font-bold text-slate-800 transition-all shadow-inner placeholder:text-slate-300" 
                                placeholder="••••••••" />
                        </div>
                        
                        {/* Conditional Confirm Password */}
                        {authMode === 'register' && (
                            <div className="space-y-1 animate-slide-in">
                                <label className="pl-1 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">确认密码</label>
                                <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} 
                                    className="w-full bg-white/60 border-2 border-white focus:border-orange-300 focus:bg-white rounded-xl md:rounded-2xl p-3 md:p-4 outline-none font-bold text-slate-800 transition-all shadow-inner placeholder:text-slate-300" 
                                    placeholder="再次输入密码" />
                            </div>
                        )}

                        <div className="pt-2 md:pt-4">
                            <button type="submit" className={`w-full text-white font-black text-[15px] md:text-[17px] py-3.5 md:py-4 rounded-xl md:rounded-2xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 ${themeSettings.btnClass}`}>
                                {themeSettings.btnText}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Notifications overlay needed for auth page too */}
                <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
                    {notifications.map(n => (
                        <div key={n.id} className={`p-4 rounded-xl shadow-xl flex items-center gap-3 animate-slide-in pointer-events-auto backdrop-blur-md ${n.type === 'success' ? 'bg-emerald-50/90 text-emerald-700 border border-emerald-200' : 'bg-rose-50/90 text-rose-700 border border-rose-200'}`}>
                            {n.type === 'success' ? <Icons.CheckCircle size={24} /> : <Icons.AlertCircle size={24} />}
                            <span className="font-bold text-sm tracking-wide">{n.msg}</span>
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

    // CelebrationModal has been correctly moved outside the App component body.

    // --- Mobile Bottom Navigation Portal ---
    const renderMobileNavigationBar = () => {
        if (appState !== 'kid_app' && appState !== 'parent_app') return null;
        
        const isParent = appState === 'parent_app';
        
        const mobileTabs = isParent ? [
            { id: 'tasks', label: '赚家庭币', icon: <Icons.Target size={22} strokeWidth={2.5} /> },
            { id: 'plans', label: '习惯养成', icon: <Icons.CheckSquare size={22} strokeWidth={2.5} /> },
            { id: 'wealth', label: '财富中心', icon: <Icons.Landmark size={22} strokeWidth={2.5} /> },
            { id: 'shop_manage', label: '家庭超市', icon: <Icons.ShoppingBag size={22} strokeWidth={2.5} /> },
            { id: 'settings', label: '我的', icon: <Icons.User size={22} strokeWidth={2.5} /> }
        ] : [
            { id: 'study', label: '赚家庭币', icon: <Icons.BookOpen size={22} strokeWidth={2.5} /> },
            { id: 'habit', label: '习惯养成', icon: <Icons.ShieldCheck size={22} strokeWidth={2.5} /> },
            { id: 'wealth', label: '财富中心', icon: <Icons.Wallet size={22} strokeWidth={2.5} /> },
            { id: 'shop', label: '家庭超市', icon: <Icons.ShoppingBag size={22} strokeWidth={2.5} /> },
            { id: 'profile', label: '我的', icon: <Icons.User size={22} strokeWidth={2.5} /> }
        ];

        return createPortal(
            <nav className="fixed bottom-0 left-0 right-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] z-[9999] md:hidden shadow-[0_-10px_20px_rgb(0,0,0,0.03)]" style={{ position: 'fixed', bottom: 0, isolation: 'isolate', transform: 'none' }}>
                {mobileTabs.map(tab => {
                    const isActive = isParent ? parentTab === tab.id : (tab.id === 'profile' ? showLevelModal : (!showLevelModal && kidTab === tab.id));
                    return (
                        <button 
                            key={tab.id} 
                            onClick={() => {
                                if (isParent) {
                                    setParentTab(tab.id);
                                } else {
                                    if (tab.id === 'profile') {
                                        setShowLevelModal(true);
                                    } else {
                                        setKidTab(tab.id);
                                        setShowLevelModal(false);
                                    }
                                }
                            }}
                        className={`flex flex-col items-center justify-center w-full py-1 gap-1 transition-all ${isActive ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <div className={`relative flex items-center justify-center transition-all ${isActive ? 'bg-indigo-50 w-12 h-8 rounded-full' : 'h-8'}`}>
                            {tab.icon}
                        </div>
                        <span className={`text-[10px] font-black tracking-wider transition-all ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                            {tab.label}
                        </span>
                    </button>
                );
                })}
            </nav>,
            document.body
        );
    };

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

            {/* Mobile Bottom Navigation Rendered via Portal */}
            {renderMobileNavigationBar()}

            <div className="fixed top-24 right-6 z-[200] space-y-3 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className={`px-6 py-4 rounded-2xl shadow-xl animate-bounce-in text-white text-sm font-bold flex items-center justify-between gap-4 pointer-events-auto ${n.type === 'error' ? 'bg-rose-500' : n.type === 'info' ? 'bg-slate-800' : 'bg-emerald-500'}`}>
                        <div className="flex items-center gap-2">
                            <Icons.Bell size={18} /> {n.msg}
                        </div>
                        <button onClick={() => setNotifications(p => p.filter(x => x.id !== n.id))} className="opacity-70 hover:opacity-100 transition-opacity flex-shrink-0">
                            <Icons.X size={16} />
                        </button>
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
            {renderAddKidModal()}
            {renderPenaltyModal()}
            
            <CelebrationModal data={celebrationData} onClose={() => setCelebrationData(null)} />

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

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes simpleFade { from { opacity: 0; } to { opacity: 1; } }
        .animate-simple-fade { animation: simpleFade 0.2s ease-out forwards; }
        @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.9); } 60% { opacity: 1; transform: scale(1.05); } 100% { transform: scale(1); } }
        .animate-bounce-in { animation: bounceIn 0.3s forwards; }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        .animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes bounceCustom { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-20px);} 60% {transform: translateY(-10px);} }
        .animate-bounce-custom { animation: bounceCustom 1s ease infinite; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
        </div>
    );
}
