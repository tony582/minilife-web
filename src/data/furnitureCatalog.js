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
    { id: 'food',     name: '食品',   emoji: '🍽' },
    { id: 'decor',    name: '装饰',   emoji: '🖼' },
];

// Default placement for each furniture type (% of room container)
const PLACEMENTS = {
    bed:           { bottom: '50.240%', left: '39.808%', width: '21.484%', zIndex: 7 },
    shelf:         { bottom: '34.686%', left: '5.224%',  width: '17.000%', zIndex: 2 },
    tower3:        { bottom: '54.000%', left: '70.000%', width: '15.000%', zIndex: 5 },
    tower_stair:   { bottom: '55.000%', left: '10.000%', width: '18.000%', zIndex: 4 },
    post:          { bottom: '62.000%', left: '55.000%', width: '8.000%',  zIndex: 3 },
    scratcher:     { bottom: '48.000%', left: '25.000%', width: '9.000%',  zIndex: 4 },
    chair:         { bottom: '46.000%', left: '45.000%', width: '10.000%', zIndex: 6 },
    plant_tree:    { bottom: '42.196%', left: '21.620%', width: '10.000%', zIndex: 2 },
    plant_desk:    { bottom: '50.468%', left: '13.554%', width: '4.500%',  zIndex: 3 },
    window_curtain:{ bottom: '52.315%', left: '17.719%', width: '22.000%', zIndex: 1 },
    window_blind:  { bottom: '55.000%', left: '60.000%', width: '18.000%', zIndex: 1 },
    window_frame:  { bottom: '55.000%', left: '60.000%', width: '10.000%', zIndex: 1 },

    pendant_heart: { bottom: '72.000%', left: '40.000%', width: '5.000%',  zIndex: 1 },

    ball:          { bottom: '50.232%', left: '62.266%', width: '3.320%',  zIndex: 5 },
    ball_2:        { bottom: '44.860%', left: '49.239%', width: '3.320%',  zIndex: 9 },
    toy_bowtie:    { bottom: '42.000%', left: '75.000%', width: '5.000%',  zIndex: 6 },
    cube:          { bottom: '40.000%', left: '30.000%', width: '3.500%',  zIndex: 8 },
    catfood_small: { bottom: '43.000%', left: '82.000%', width: '5.000%',  zIndex: 4 },
    catfood_large: { bottom: '41.000%', left: '82.000%', width: '7.000%',  zIndex: 4 },
    catcan:        { bottom: '41.000%', left: '50.000%', width: '3.500%',  zIndex: 7 },
    painting_plant: { bottom: '60.000%', left: '48.000%', width: '8.000%',  zIndex: 1 },
    painting_stripe:{ bottom: '60.000%', left: '48.000%', width: '8.000%',  zIndex: 1 },
    painting_swirl: { bottom: '60.000%', left: '48.000%', width: '8.000%',  zIndex: 1 },
    bowl_food:     { bottom: '20.195%', left: '55.285%', width: '8.398%',  zIndex: 11 },
    litter:        { bottom: '30.000%', left: '72.000%', width: '10.000%', zIndex: 5 },
    mouse_toy:     { bottom: '42.000%', left: '58.000%', width: '4.000%',  zIndex: 6 },
    painting_wall: { bottom: '60.000%', left: '48.000%', width: '10.000%', zIndex: 1 },
};


// Bowl color variants — empty src + full src pairs
export const BOWL_VARIANTS = [
    { empty: '/pets/furniture/bowl_blue_empty.png',   treat: '/pets/furniture/bowl_blue_treats.png',   kibble: '/pets/furniture/bowl_blue_kibble.png',   label: '蓝色' },
    { empty: '/pets/furniture/bowl_beige_empty.png',  treat: '/pets/furniture/bowl_beige_treats.png',  kibble: '/pets/furniture/bowl_beige_kibble.png',   label: '米色' },
    { empty: '/pets/furniture/bowl_brown_empty.png',  treat: '/pets/furniture/bowl_brown_treats.png',  kibble: '/pets/furniture/bowl_brown_kibble.png',  label: '棕色' },
    { empty: '/pets/furniture/bowl_gray_empty.png',   treat: '/pets/furniture/bowl_gray_treats.png',   kibble: '/pets/furniture/bowl_gray_kibble.png',   label: '灰色' },
    { empty: '/pets/furniture/bowl_purple_empty.png', treat: '/pets/furniture/bowl_purple_treats.png', kibble: '/pets/furniture/bowl_purple_kibble.png', label: '紫色' },
    { empty: '/pets/furniture/bowl_sage_empty.png',   treat: '/pets/furniture/bowl_sage_treats.png',   kibble: '/pets/furniture/bowl_sage_kibble.png',   label: '绿色' },
];

export const FURNITURE_CATALOG = [
    // ── 床铺 ──────────────────────────────────────────────────────────
    { id: 'bed',            name: '猫咪爱床',   category: 'bed',       price: 150, emoji: '🛏' },
    // ── 猫爬架 ────────────────────────────────────────────────────────
    { id: 'tower3',         name: '三层猫爬架', category: 'cattower',  price: 180, emoji: '🗼' },
    { id: 'tower_stair',    name: '楼梯猫爬架', category: 'cattower',  price: 160, emoji: '🪜' },
    { id: 'post',           name: '猫抓柱',     category: 'cattower',  price: 80,  emoji: '🏛' },
    { id: 'scratcher',      name: '双环磨爪器', category: 'cattower',  price: 100, emoji: '⭕' },
    // ── 家具 ──────────────────────────────────────────────────────────
    { id: 'shelf',          name: '双层书架',   category: 'furniture', price: 120, emoji: '📚' },
    { id: 'chair',          name: '小椅子',     category: 'furniture', price: 60,  emoji: '🪑' },
    // ── 植物 ──────────────────────────────────────────────────────────
    { id: 'plant_tree',     name: '落地绿植',   category: 'plant',     price: 80,  emoji: '🌳' },
    { id: 'plant_desk',     name: '桌面小盆栽', category: 'plant',     price: 40,  emoji: '🪴' },
    // ── 窗户 ──────────────────────────────────────────────────────────
    { id: 'window_curtain', name: '窗帘',       category: 'window',    price: 100, emoji: '🪟' },
    { id: 'window_blind',   name: '百叶窗',     category: 'window',    price: 80,  emoji: '🔲' },
    { id: 'window_frame',   name: '彩色窗框',   category: 'window',    price: 90,  emoji: '🪟' },
    // ── 玩具 ──────────────────────────────────────────────────────────
    { id: 'ball',           name: '毛线球',     category: 'toy',       price: 30,  emoji: '🧶' },
    { id: 'ball_2',         name: '绒线球',     category: 'toy',       price: 30,  emoji: '🟠' },
    { id: 'toy_bowtie',     name: '蝴蝶结玩具', category: 'toy',       price: 40,  emoji: '🎀' },
    { id: 'cube',           name: '魔方',       category: 'toy',       price: 35,  emoji: '🎲' },
    // ── 食品 ──────────────────────────────────────────────────────────────────
    { id: 'bowl_food',      name: '猫咪饭碗',   category: 'food',      price: 60,  emoji: '🍽',  isBowl: true },
    { id: 'catfood_small',  name: '小包猫粮',   category: 'food',      price: 30,  emoji: '🍖' },
    { id: 'catfood_large',  name: '大包猫粮',   category: 'food',      price: 50,  emoji: '🍖' },
    { id: 'catcan',         name: '猫罐头',     category: 'food',      price: 35,  emoji: '🥫' },
    // ── 装饰 ──
    { id: 'pendant_heart',  name: '爱心挂件',   category: 'decor',     price: 50,  emoji: '💕' },
    { id: 'painting_plant', name: '挂画(绿植)',   category: 'decor',     price: 80,  emoji: '🖼' },
    { id: 'painting_stripe',name: '挂画(线条)',   category: 'decor',     price: 80,  emoji: '🖼' },
    { id: 'painting_swirl', name: '挂画(漩涡)',   category: 'decor',     price: 80,  emoji: '🖼' },
    // ── 新增 ──
    { id: 'litter',         name: '猫砂盆',     category: 'furniture', price: 70,  emoji: '🚽' },
    { id: 'mouse_toy',      name: '小老鼠玩具', category: 'toy',       price: 25,  emoji: '🐭' },
];


// ── Price lookup ──────────────────────────────────────────────────────────────
export const PRICE_TABLE = Object.fromEntries(
    FURNITURE_CATALOG.map(item => [item.id, item.price])
);

// Cost to change room skin
export const SKIN_CHANGE_COST = 10;
export const ROOM_SKIN_COST   = 50;

// ── Create a new furniture item from catalog ──────────────────────────────────
// selectedVariantIdx: for items with color variants, which index to use
export function createFurnitureItem(catalogId, overrides = {}, selectedVariantIdx = 0) {
    const placement = PLACEMENTS[catalogId] || { bottom: '45%', left: '40%', width: '12%', zIndex: 5 };

    // Special handling for bowl_food (has empty + full paired variants)
    if (catalogId === 'bowl_food') {
        const variant = BOWL_VARIANTS[selectedVariantIdx] ?? BOWL_VARIANTS[0];
        return {
            id:          `bowl_food_${Date.now()}`,
            type:        'bowl_food',
            src:         variant.empty,
            srcKibble:   variant.kibble,
            srcTreat:    variant.treat,
            interactive: true,
            style:       { ...placement },
            zIndex:      placement.zIndex,
            skinIdx:     selectedVariantIdx,
            ...overrides,
        };
    }

    const variants = FURNITURE_VARIANTS[catalogId] || [];
    const src      = variants[selectedVariantIdx] ?? variants[0] ?? '';
    return {
        id:      `${catalogId}_${Date.now()}`,
        type:    catalogId,
        src,
        style:   { ...placement },
        zIndex:  placement.zIndex,
        skinIdx: selectedVariantIdx,
        ...overrides,
    };
}
