// ═══════════════════════════════════════════════════════════
// furnitureCatalog.js — 可购买家具目录 + 价格
// ═══════════════════════════════════════════════════════════
import { FURNITURE_VARIANTS } from './roomConfig';

export const ROOM_UNLOCK_COSTS = [0, 500, 1500, 3000]; // index = room number

export const FURNITURE_CATEGORIES = [
    { id: 'all',      name: '全部',   emoji: '🏠' },
    { id: 'bed',      name: '床铺',   emoji: '🛏' },
    { id: 'cattower', name: '猫爬架', emoji: '🐾' },
    { id: 'furniture',name: '家具',   emoji: '🪑' },
    { id: 'plant',    name: '植物',   emoji: '🌿' },
    { id: 'window',   name: '窗户',   emoji: '🪟' },
    { id: 'toy',      name: '玩具',   emoji: '🧶' },
    { id: 'food',     name: '食品',   emoji: '🍖' },
    { id: 'decor',    name: '装饰',   emoji: '🖼' },
];

// Default placement for each furniture type (% of room container)
const PLACEMENTS = {
    bed:           { bottom: '50.240%', left: '39.808%', width: '21.484%', zIndex: 7 },
    shelf:         { bottom: '34.686%', left: '5.224%',  width: '17.000%', zIndex: 2 },
    bookshelf:     { bottom: '33.674%', left: '78.904%', width: '12.500%', zIndex: 10 },
    tower3:        { bottom: '54.000%', left: '70.000%', width: '15.000%', zIndex: 5 },
    tower_stair:   { bottom: '55.000%', left: '10.000%', width: '18.000%', zIndex: 4 },
    post:          { bottom: '62.000%', left: '55.000%', width: '8.000%',  zIndex: 3 },
    scratcher:     { bottom: '48.000%', left: '25.000%', width: '9.000%',  zIndex: 4 },
    chair:         { bottom: '46.000%', left: '45.000%', width: '10.000%', zIndex: 6 },
    plant_tree:    { bottom: '42.196%', left: '21.620%', width: '10.000%', zIndex: 2 },
    plant_desk:    { bottom: '50.468%', left: '13.554%', width: '4.500%',  zIndex: 3 },
    window_curtain:{ bottom: '52.315%', left: '17.719%', width: '22.000%', zIndex: 1 },
    window_blind:  { bottom: '55.000%', left: '60.000%', width: '18.000%', zIndex: 1 },
    frame_art:     { bottom: '39.748%', left: '69.819%', width: '10.742%', zIndex: 1 },
    pendant_heart: { bottom: '72.000%', left: '40.000%', width: '5.000%',  zIndex: 1 },
    ball:          { bottom: '50.232%', left: '62.266%', width: '3.320%',  zIndex: 5 },
    ball_2:        { bottom: '44.860%', left: '49.239%', width: '3.320%',  zIndex: 9 },
    toy_bowtie:    { bottom: '42.000%', left: '75.000%', width: '5.000%',  zIndex: 6 },
    cube:          { bottom: '40.000%', left: '30.000%', width: '3.500%',  zIndex: 8 },
    catfood:       { bottom: '43.000%', left: '82.000%', width: '7.000%',  zIndex: 4 },
    catcan:        { bottom: '41.000%', left: '50.000%', width: '3.500%',  zIndex: 7 },
    painting_plant:{ bottom: '60.000%', left: '48.000%', width: '8.000%',  zIndex: 1 },
};

export const FURNITURE_CATALOG = [
    // ── 床铺 ──────────────────────────────────────────────────────────
    { id: 'bed',           name: '猫咪爱床',     category: 'bed',      price: 150, emoji: '🛏' },
    // ── 猫爬架 ────────────────────────────────────────────────────────
    { id: 'tower3',        name: '三层猫爬架',   category: 'cattower', price: 180, emoji: '🗼' },
    { id: 'tower_stair',   name: '楼梯猫爬架',   category: 'cattower', price: 160, emoji: '🪜' },
    { id: 'post',          name: '猫爬柱',        category: 'cattower', price: 80,  emoji: '🏛' },
    { id: 'scratcher',     name: '双环磨爪器',   category: 'cattower', price: 100, emoji: '⭕' },
    // ── 家具 ──────────────────────────────────────────────────────────
    { id: 'shelf',         name: '双层书架',      category: 'furniture', price: 120, emoji: '📚' },
    { id: 'bookshelf',     name: '多格书架',      category: 'furniture', price: 120, emoji: '📖' },
    { id: 'chair',         name: '小椅子',        category: 'furniture', price: 60,  emoji: '🪑' },
    // ── 植物 ──────────────────────────────────────────────────────────
    { id: 'plant_tree',    name: '落地大植物',    category: 'plant',    price: 80,  emoji: '🌳' },
    { id: 'plant_desk',    name: '桌面小植物',    category: 'plant',    price: 40,  emoji: '🪴' },
    // ── 窗户 ──────────────────────────────────────────────────────────
    { id: 'window_curtain',name: '窗帘窗户',      category: 'window',   price: 100, emoji: '🪟' },
    { id: 'window_blind',  name: '百叶窗户',      category: 'window',   price: 80,  emoji: '🔲' },
    // ── 玩具 ──────────────────────────────────────────────────────────
    { id: 'ball',          name: '毛线球',        category: 'toy',      price: 30,  emoji: '🧶' },
    { id: 'ball_2',        name: '绒线球',        category: 'toy',      price: 30,  emoji: '🟠' },
    { id: 'toy_bowtie',    name: '蝴蝶结玩具',   category: 'toy',      price: 40,  emoji: '🎀' },
    { id: 'cube',          name: '小魔方',        category: 'toy',      price: 35,  emoji: '🎲' },
    // ── 食品 ──────────────────────────────────────────────────────────
    { id: 'catfood',       name: '猫粮袋',        category: 'food',     price: 50,  emoji: '🍖' },
    { id: 'catcan',        name: '猫罐头',        category: 'food',     price: 35,  emoji: '🥫' },
    // ── 装饰 ──────────────────────────────────────────────────────────
    { id: 'frame_art',     name: '装饰相框',      category: 'decor',    price: 70,  emoji: '🖼' },
    { id: 'pendant_heart', name: '爱心挂件',      category: 'decor',    price: 50,  emoji: '💕' },
    { id: 'painting_plant',name: '植物壁画',      category: 'decor',    price: 80,  emoji: '🎨' },
];

// ── Price lookup ──────────────────────────────────────────────────────────────
export const PRICE_TABLE = Object.fromEntries(
    FURNITURE_CATALOG.map(item => [item.id, item.price])
);

// Cost to change room skin or furniture color
export const SKIN_CHANGE_COST = 10;    // furniture color change
export const ROOM_SKIN_COST   = 50;    // room background color change

// ── Create a new furniture item from catalog ──────────────────────────────────
export function createFurnitureItem(catalogId, overrides = {}) {
    const placement = PLACEMENTS[catalogId] || { bottom: '45%', left: '40%', width: '12%', zIndex: 5 };
    const variants  = FURNITURE_VARIANTS[catalogId] || [];
    const src       = variants[0] || '';
    return {
        id:      `${catalogId}_${Date.now()}`,   // unique instance ID
        type:    catalogId,
        src,
        style:   { ...placement },
        zIndex:  placement.zIndex,
        skinIdx: 0,
        ...overrides,
    };
}
