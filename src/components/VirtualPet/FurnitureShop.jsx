// ═══════════════════════════════════════════════════════════
// FurnitureShop.jsx — 家具商店（重构版 v2）
// ═══════════════════════════════════════════════════════════
import React, { useState } from 'react';
import {
    FURNITURE_CATALOG, FURNITURE_CATEGORIES,
    PRICE_TABLE, BOWL_VARIANTS, createFurnitureItem,
} from '../../data/furnitureCatalog';
import { FURNITURE_VARIANTS } from '../../data/roomConfig';
import { Icons } from '../../utils/Icons';

// ── Category accent colors ──────────────────────────────────
const CATEGORY_ACCENT = {
    all:      { bg: '#6366f1', text: '#fff' },
    bed:      { bg: '#f472b6', text: '#fff' },
    cattower: { bg: '#60a5fa', text: '#fff' },
    furniture:{ bg: '#34d399', text: '#fff' },
    plant:    { bg: '#4ade80', text: '#fff' },
    window:   { bg: '#a78bfa', text: '#fff' },
    toy:      { bg: '#fbbf24', text: '#1a1a1a' },
    food:     { bg: '#fb923c', text: '#fff' },
    decor:    { bg: '#e879f9', text: '#fff' },
};

export default function FurnitureShop({
    balance,
    onBuyFurniture,
    roomSkinIdx,
    totalRoomSkins,
    disabled,
    ownedCounts = {},
}) {
    const [activeCategory, setActiveCategory] = useState('all');
    const [confirmBuy, setConfirmBuy] = useState(null);

    const canAfford = (price) => balance >= price;

    const filtered = activeCategory === 'all'
        ? FURNITURE_CATALOG
        : FURNITURE_CATALOG.filter(i => i.category === activeCategory);

    const previewSrc = (item) => {
        if (item.isBowl) return BOWL_VARIANTS[0]?.empty;
        return FURNITURE_VARIANTS[item.id]?.[0];
    };

    return (
        <div className="flex flex-col h-full overflow-hidden relative" style={{ background: '#F4F4F0' }}>
            
            {/* ── Header: Balance ──────────────────────────── */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-2">
                <span className="text-sm font-black text-gray-500">
                    共 {filtered.length} 件商品
                </span>
                {/* Balance badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-black"
                    style={{ background: '#fff', border: '3px solid #1a1a1a', boxShadow: '3px 3px 0 #1a1a1a', color: '#1a1a1a' }}>
                    <Icons.StarFilled size={16} className="text-yellow-400 align-middle" style={{ filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.2))' }} />
                    <span className="leading-none tracking-tight pt-0.5">{balance.toLocaleString()}</span>
                </div>
            </div>

            {/* ── Category filter strip ───────────────────────────── */}
            <div className="flex-shrink-0 flex gap-2 px-4 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {FURNITURE_CATEGORIES.map(cat => {
                    const accent = CATEGORY_ACCENT[cat.id] ?? { bg: '#1a1a1a', text: '#fff' };
                    const isActive = activeCategory === cat.id;
                    return (
                        <button key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black transition-all"
                            style={{
                                background: isActive ? accent.bg : '#fff',
                                color:      isActive ? accent.text : '#888',
                                border: `3px solid ${isActive ? '#1a1a1a' : '#e0e0e0'}`,
                                boxShadow: isActive ? `2px 3px 0 #1a1a1a` : '0px 0px 0 #e8e8e8',
                                transform: isActive ? 'translateY(-2px)' : 'none',
                            }}
                        >
                            <span>{cat.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* ── Item grid (compact 2 columns) ───────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2" style={{ scrollbarWidth: 'thin' }}>
                <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                    {filtered.map(item => {
                        const affordable = canAfford(item.price);
                        const ownedCount = ownedCounts[item.id] || 0;
                        const owned = ownedCount > 0;
                        const imgSrc = previewSrc(item);

                        return (
                            <div
                                key={item.id}
                                className="relative flex flex-col p-3 rounded-2xl"
                                style={{
                                    background: '#fff',
                                    border: '3px solid #1a1a1a',
                                    boxShadow: '0 4px 0 #1a1a1a',
                                }}
                            >
                                {/* Owned Badge */}
                                {owned && (
                                    <div className="absolute -top-2.5 -right-2 bg-[#10b981] text-white text-[10px] font-black px-2 py-0.5 rounded-full border-[2.5px] border-[#1a1a1a] shadow-[1px_2px_0_#1a1a1a] z-10 whitespace-nowrap">
                                        已拥有 {ownedCount}
                                    </div>
                                )}

                                {/* Item image */}
                                <div className="w-full h-16 flex-shrink-0 flex items-center justify-center rounded-xl bg-gray-50 border-2 border-gray-200 mb-2">
                                    {imgSrc && (
                                        <img src={imgSrc} alt={item.name}
                                            style={{ imageRendering: 'pixelated', maxHeight: '48px', maxWidth: '48px', objectFit: 'contain' }} />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex flex-col flex-1 text-center">
                                    <div className="text-sm font-black leading-tight text-gray-900 tracking-tight mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                        {item.name}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-500 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                                        {FURNITURE_CATEGORIES.find(c => c.id === item.category)?.name || item.category}
                                    </div>

                                    <div className="mt-auto">
                                        <button
                                            disabled={!affordable}
                                            onClick={() => setConfirmBuy(item)}
                                            className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg font-black text-xs active:translate-y-0.5 active:shadow-none transition-all"
                                            style={{
                                                background: affordable ? '#FFE566' : '#e5e7eb',
                                                color: affordable ? '#1a1a1a' : '#9ca3af',
                                                border: '2px solid #1a1a1a',
                                                boxShadow: affordable ? '0 3px 0 #1a1a1a' : '0 3px 0 #9ca3af',
                                                cursor: affordable ? 'pointer' : 'not-allowed',
                                            }}
                                        >
                                            <span>{owned ? '再买' : '购买'}</span>
                                            <Icons.StarFilled size={12} className={`${affordable ? 'text-yellow-500' : 'text-gray-400'}`} />
                                            <span className="pt-0.5">{item.price}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Custom Confirm Modal ── */}
            {confirmBuy && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <div className="bg-[#fef9c3] w-[85%] max-w-sm border-[4px] border-gray-900 shadow-[8px_8px_0_#111827] p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight">确认购买</h3>
                            <button onClick={() => setConfirmBuy(null)} className="text-gray-500 hover:text-gray-900 active:translate-y-px">
                                <Icons.X size={20} strokeWidth={3} />
                            </button>
                        </div>
                        
                        <div className="flex flex-col items-center my-6">
                            <div className="w-20 h-20 bg-white rounded-2xl border-[3px] border-gray-900 flex items-center justify-center mb-3 shadow-[4px_4px_0_#1a1a1a]">
                                <img src={previewSrc(confirmBuy)} alt={confirmBuy.name} style={{ imageRendering: 'pixelated', maxHeight: '56px', maxWidth: '56px', objectFit: 'contain' }} />
                            </div>
                            <span className="text-xl font-black">{confirmBuy.name}</span>
                            <span className="text-sm font-bold text-gray-500 mt-1">
                                将花费 <span className="text-yellow-600 font-black">{confirmBuy.price} 颗</span> 星星币
                            </span>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setConfirmBuy(null)}
                                className="flex-1 py-3 font-black text-sm border-[3px] border-gray-900 bg-white hover:bg-gray-100 shadow-[2px_2px_0_#111827] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
                            >
                                我再想想
                            </button>
                            <button
                                onClick={() => {
                                    const newItem = createFurnitureItem(confirmBuy.id, {}, 0);
                                    onBuyFurniture(newItem, confirmBuy.price, confirmBuy.name);
                                    setConfirmBuy(null);
                                }}
                                className="flex-1 py-3 font-black text-sm border-[3px] border-gray-900 bg-[#10b981] text-white hover:bg-[#059669] shadow-[2px_2px_0_#111827] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
                            >
                                付款买下！
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
