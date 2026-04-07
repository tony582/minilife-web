// ═══════════════════════════════════════════════════════════
// itemsCatalog.js — Consumable items for the pet room system
// Minecraft-style: items are purchased from shop, stored in
// chest (库存), dragged to hotbar, then used on pet.
// ═══════════════════════════════════════════════════════════

export const ITEMS_CATALOG = [
    {
        id: 'food',
        emoji: '🍗',
        src: '/pets/furniture/catfood_small.png',
        label: '脆脆粮',
        price: 15,
        effect: { satiety: 25 },
        desc: '倒入饭盆，诱惑干饭 +25',
        color: '#FF8C42',
        colorBg: '#FFF3EB',
    },
    {
        id: 'catcan',
        emoji: '🐟',
        src: '/pets/furniture/can_tan.png',
        label: '大罐头',
        price: 40,
        effect: { satiety: 60 },
        desc: '豪华全屏海鲜大餐 +60',
        color: '#60A5FA',
        colorBg: '#EFF6FF',
    },
    {
        id: 'soap',
        emoji: '🧼',
        src: '/pets/furniture/litter_white.png',
        label: '香草浴',
        price: 25,
        effect: { clean: 40 },
        desc: '洗香香，清洁度+40',
        color: '#3BCECD',
        colorBg: '#E0FAFA',
    },
    {
        id: 'broom',
        emoji: '🧹',
        src: '/pets/furniture/litter_tan.png',
        label: '换猫砂',
        price: 20,
        effect: { poop: true },
        desc: '一键清理房间猫砂与脏污',
        color: '#84CC16',
        colorBg: '#F7FEE7',
    },
    {
        id: 'yarn',
        emoji: '🧶',
        src: '/pets/furniture/ball.png',
        label: '毛线球',
        price: 30,
        effect: { mood: 40 },
        desc: '天降玩具，飞扑狂欢 +40',
        color: '#a855f7',
        colorBg: '#f3e8ff',
    },
    {
        id: 'medicine',
        emoji: '🏥',
        label: '宠物医院',
        price: 80,
        effect: { sick: false, mood: -10, clean: 100 },
        desc: '带猫咪看病，恢复健康状态',
        color: '#F43F5E',
        colorBg: '#FFF1F2',
        pixelGrid: {
            palette: { r: '#EF4444', w: '#FFFFFF', b: '#111827', g: '#e5e7eb' },
            layout: [
                '.bbbbb.',
                '.bwwwb.',
                '.bwrwb.',
                '.brrrb.',
                '.bwrwb.',
                '.bgggb.',
                '.bbbbb.'
            ]
        }
    },
];

// FIXED core tools timeline
export const FIXED_TOOLBAR = ['food', 'catcan', 'soap', 'broom', 'yarn', 'medicine'];


// Default empty consumables state
export const DEFAULT_CONSUMABLES = FIXED_TOOLBAR.reduce((acc, current) => ({ ...acc, [current]: 0 }), {});

// Default hotbar is now fixed
export const DEFAULT_HOTBAR = [...FIXED_TOOLBAR];

// Look up item by id
export const getItem = (id) => ITEMS_CATALOG.find(i => i.id === id) ?? null;

// How many hearts to show (0–5) based on overall health
export const getHearts = (satiety, clean, mood) => {
    const avg = (satiety + clean + mood) / 3;
    return Math.round(avg / 20); // 0–5
};
