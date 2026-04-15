// ═══════════════════════════════════════════════
// petConstants.js — 纯数据常量（从 VirtualPetDashboard 提取）
// ═══════════════════════════════════════════════

// ── 系统像素图标 ──
export const SYSTEM_ICONS = {
    sun: {
        palette: { '#': '#f59e0b', 'o': '#fcd34d' },
        grid: [
            " # # ",
            "#ooo#",
            " ooo ",
            "#ooo#",
            " # # "
        ]
    },
    moon: {
        palette: { '#': '#475569', 'o': '#cbd5e1' },
        grid: [
            "  ## ",
            " #o# ",
            "  o# ",
            " #o# ",
            "  ## "
        ]
    },
    backpack: {
        palette: { 'o': '#451a03', 'x': '#f59e0b', '-': '#d97706', '=': '#fbbf24' },
        grid: [
            "  ooo  ",
            " oxxxo ",
            "oxxxxxo",
            "ox---xo",
            "ox-=-xo",
            "oxxxxxo",
            " ooooo "
        ]
    },
    shop: {
        palette: { 'o': '#1a1a1a', 'r': '#ef4444', 'w': '#fca5a5', 'y': '#fef08a', 'd': '#cbd5e1' },
        grid: [
            "  ooo  ",
            " orrro ",
            "orwrror",
            "ooooooo",
            "oydydyo",
            "oydydyo",
            "ooooooo"
        ]
    },
    decorate: {
        palette: { 'o': '#1e293b', 'b': '#3b82f6', 'w': '#94a3b8', '-': '#64748b' },
        grid: [
            "    ooo",
            "   oboo",
            "  obooo",
            " ooow  ",
            " o-w   ",
            " o-    ",
            "oo     "
        ]
    },
    check: {
        palette: { 'o': '#14532d', 'g': '#22c55e' },
        grid: [
            "       ",
            "     og",
            "    ogg",
            " ogoggg",
            " oggggo",
            "  oggo ",
            "   oo  "
        ]
    }
};

// ── 昼夜时段定义 ──
export const TIME_PHASES = {
    dawn:      { sky: 'bg-gradient-to-b from-orange-300 to-amber-200', windowBg: 'bg-orange-200', label: '清晨', greeting: '早安主人！新的一天开始啦~' },
    day:       { sky: 'bg-[#93c5fd]', windowBg: 'bg-[#38bdf8]', label: '白天', greeting: null },
    dusk:      { sky: 'bg-gradient-to-b from-purple-400 to-orange-300', windowBg: 'bg-orange-400', label: '黄昏', greeting: null },
    night:     { sky: 'bg-gradient-to-b from-indigo-900 to-slate-800', windowBg: 'bg-indigo-950', label: '夜晚', greeting: null },
    lateNight: { sky: 'bg-gradient-to-b from-slate-950 to-slate-900', windowBg: 'bg-slate-950', label: '深夜', greeting: '太晚了，该睡觉啦 Zzz' },
};

// ── 获取当前时段 ──
export const getTimePhase = () => {
    const h = new Date().getHours();
    if (h >= 6 && h < 8) return 'dawn';
    if (h >= 8 && h < 17) return 'day';
    if (h >= 17 && h < 19) return 'dusk';
    if (h >= 19 && h < 22) return 'night';
    return 'lateNight';
};

// ── 5个动作卡片像素图标 ──
export const getActionCards = (isSick, isSleeping, activeScene) => [
    { 
        id: 'feed', label: '大餐', bg: isSick?'bg-gray-300':'bg-[#FF90E8]',
        grid: ["          ", "  XX  XX  ", " XBBXXBBX ", " XBBBBBBX ", " XXRRRRXX ", "  XRRRRX  ", " XBBBBBBX ", " XBBXXBBX ", "  XX  XX  ", "          "],
        palette: { 'X': '#111827', 'B': '#f3f4f6', 'R': '#ef4444' }
    },
    { 
        id: 'clean', label: '扫除', bg: activeScene !== 'home' ? 'bg-gray-300' : 'bg-[#fcd34d]',
        grid: ["   XXXXX  ", "  XYYYYYX ", "  XXYYYXX ", "   XXXXX  ", "  XWWWWWX ", "  XXWWWXX ", "  XXXXXXX ", "   X   X  ", "          ", "          "],
        palette: { 'X': '#111827', 'Y': '#fbbf24', 'W': '#f97316' }
    },
    { 
        id: 'bathe', label: '洗浴', bg: 'bg-[#3BCECD]',
        grid: ["   XXXX   ", "  XWWWWX  ", " XXWWWWXX ", " X      X ", " XYYYYYYX ", " XXYYYYXX ", "  XXXXXX  ", "          ", "          ", "          "],
        palette: { 'X': '#111827', 'W': '#bae6fd', 'Y': '#e0f2fe' }
    },
    { 
        id: 'heal', label: '看病', bg: isSick ? 'bg-[#ff7b7b] animate-bounce' : 'bg-gray-300',
        grid: ["    XX    ", "   XRRX   ", "  XRRRXX  ", " XRRRXXWX ", " XXRXXWWWX", "  XXWWWXX ", "   XWWX   ", "    XX    ", "          ", "          "],
        palette: { 'X': '#111827', 'R': '#ef4444', 'W': '#ffffff' }
    },
    { 
        id: 'sleep', label: isSleeping ? '唤醒' : '关灯', bg: 'bg-[#8B5CF6] text-white',
        grid: ["  XXX     ", " XYYYX    ", " XYXX     ", " XYYX     ", " XYYX ZZZ ", " XYYX   Z ", "  XYYX Z  ", "  XYYYX   ", "   XXX    ", "          "],
        palette: { 'X': '#111827', 'Y': '#facc15', 'Z': '#d1d5db' }
    }
];

// ── 成长阶段图标 ──
export const STAGE_ICONS = [
    { grid: ["          ", "  XX  XX  ", " XXXX XXXX", "  XX  XX  ", "   XXXX   ", "  XXXXXX  ", "  XXXXXX  ", "   XXXX   ", "    XX    ", "          "], palette: { 'X': '#111827' } },
    { grid: ["          ", "    XX    ", "   XXXX   ", " XXWYYWXX ", "  XYYYYX  ", "  XYYYYX  ", " XXWYYWXX ", "   XXXX   ", "    XX    ", "          "], palette: { 'X': '#111827', 'Y': '#facc15', 'W': '#ffffff' } },
    { grid: ["          ", "  XX  XX  ", " XRRX XRRX", " XRRRXRRRX", " XRRRRRRRX", "  XRRRRRX ", "   XRRRX  ", "    XRX   ", "     X    ", "          "], palette: { 'X': '#111827', 'R': '#f472b6' } },
    { grid: ["          ", " XXXXXXXX ", " XYWWWWYX ", "  XYYYYX  ", "   XYYX   ", "   XXXX   ", "  XYYYYX  ", " XXXXXXXX ", "          ", "          "], palette: { 'X': '#111827', 'Y': '#facc15', 'W': '#e5e7eb' } },
    { grid: ["          ", " X  X  X  ", " XWXXXWX  ", " XYWYWYX  ", " XYYYYYX  ", " XYYYYYX  ", "  XXXXX   ", "          ", "          ", "          "], palette: { 'X': '#111827', 'W': '#ffffff', 'Y': '#facc15' } }
];

// ── 便便图标 ──
export const POOP_ICON = {
    grid: ["   XX   ", "  XBBX  ", " XBBBBX ", " XBBBBX ", "XBBBBBBX", " XXXXXX "],
    palette: { 'X': '#451a03', 'B': '#92400e' } 
};

// ── 场景指示器图标 ──
export const MINI_ZONE_ICONS = {
    home: {
        grid: ["   XX   ", "  XWWX  ", " XWWWWX ", " XXXXXX ", "  XWWX  ", "  X  X  "],
        palette: { 'X': '#111827', 'W': '#fcd34d' }
    },
    bath: {
        grid: ["   XX   ", "  XWWX  ", "  XWWX  ", " XWWWWX ", " XWWWWX ", "  XXXX  "],
        palette: { 'X': '#111827', 'W': '#38bdf8' }
    },
    hospital: {
        grid: ["   XX   ", "   XX   ", " XXXXXX ", " XXXXXX ", "   XX   ", "   XX   "],
        palette: { 'X': '#ef4444' }
    },
    sleep: {
        grid: ["   XXX  ", "  XX    ", "  XX    ", "  XX    ", "   XXX  ", "        "],
        palette: { 'X': '#facc15' }
    },
    alert: {
        grid: ["  XX  ", "  XX  ", "  XX  ", "      ", "  XX  ", "      "],
        palette: { 'X': '#ffffff' }
    }
};

// ── 场景道具图标 ──
export const SCENE_PROPS = {
    bowlEmpty: {
        grid: [
            "            ",
            "            ",
            "            ",
            "            ",
            "  XXXXXXXX  ",
            " XXWWWWWWXX ",
            " XWWWWWWWWX ",
            "  XXXXXXXX  "
        ],
        palette: { 'X': '#111827', 'W': '#e5e7eb', 'M': '#b91c1c' }
    },
    bowlFull: {
        grid: [
            "            ",
            "    MMMM    ",
            "   MMMMMM   ",
            "  MMMMMMMM  ",
            "  XXXXXXXX  ",
            " XXWWWWWWXX ",
            " XWWWWWWWWX ",
            "  XXXXXXXX  "
        ],
        palette: { 'X': '#111827', 'W': '#e5e7eb', 'M': '#b91c1c' }
    },
    litterBox: {
        grid: ["          ", " XXXXXXXX ", "XBWWWWWWBX", "XWYYYYYYWX", "XWYYYYYYWX", " XXXXXXXX "],
        palette: { 'X': '#111827', 'B': '#3b82f6', 'W': '#60a5fa', 'Y': '#fef08a' }
    },
    foodBag: {
        grid: ["  XXXX  ", " XYYYYX ", "XYyyyyYX", "XYyyyyYX", "XYYYXYYX", "XYYXYYYX", "XXXXXXXX"],
        palette: { 'X': '#111827', 'Y': '#fb923c', 'y': '#fdba74' }
    },
    medicalCross: {
        grid: ["   XX   ", "   XX   ", " XXXXXX ", " XXXXXX ", "   XX   ", "   XX   "],
        palette: { 'X': '#22c55e' }
    },
    showerHead: {
        grid: ["  XXXX  ", " XXWWXX ", "XXWWWWXX", "  XXXX  ", "  XXXX  "],
        palette: { 'X': '#94a3b8', 'W': '#f1f5f9' } 
    }
};
