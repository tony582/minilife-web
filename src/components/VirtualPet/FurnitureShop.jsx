// ═══════════════════════════════════════════════════════════
// FurnitureShop.jsx — 装饰模式底部商店面板
// ═══════════════════════════════════════════════════════════
import React, { useState, useRef } from 'react';
import { FURNITURE_CATALOG, FURNITURE_CATEGORIES, PRICE_TABLE, createFurnitureItem } from '../../data/furnitureCatalog';
import { FURNITURE_VARIANTS } from '../../data/roomConfig';

export default function FurnitureShop({
    balance,           // current coin balance
    onBuyFurniture,    // (furnitureItem, price, name) => void
    roomSkinIdx,       // current room skin index (for display only)
    totalRoomSkins,    // total available room skins
    disabled,          // locked state
}) {
    const [activeCategory, setActiveCategory] = useState('all');
    const tabsRef = useRef(null);

    const filtered = activeCategory === 'all'
        ? FURNITURE_CATALOG
        : FURNITURE_CATALOG.filter(item => item.category === activeCategory);

    const canAfford = (price) => balance >= price;

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">

            {/* Handle */}
            <div className="flex-shrink-0 flex items-center justify-center pt-1.5 pb-1">
                <div className="w-8 h-1 bg-slate-200 rounded-full" />
            </div>

            {/* Header: Hint + Balance */}
            <div className="flex-shrink-0 flex items-center gap-3 px-4 pb-2.5">
                {/* Room skin hint */}
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 border border-orange-100">
                    <span className="text-base">🎨</span>
                    <div className="text-left leading-tight">
                        <div className="text-[10px] font-black text-orange-700">换墙色</div>
                        <div className="text-[9px] text-orange-500">点击房间背景 · 50币/次</div>
                    </div>
                    <div className="text-[9px] text-slate-400 ml-auto">
                        {roomSkinIdx + 1}/{totalRoomSkins}
                    </div>
                </div>

                {/* Balance display */}
                <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="text-base">🪙</span>
                    <div className="text-right">
                        <div className="text-[9px] font-bold text-amber-600 leading-none">余额</div>
                        <div className="text-sm font-black text-amber-700 leading-none">{balance.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Category tabs */}
            <div ref={tabsRef}
                className="flex-shrink-0 flex gap-1.5 px-3 pb-2.5 overflow-x-auto hide-scrollbar"
            >
                {FURNITURE_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                            activeCategory === cat.id
                                ? 'bg-orange-400 text-white shadow-md scale-105'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <span>{cat.emoji}</span>
                        <span>{cat.name}</span>
                    </button>
                ))}
            </div>

            {/* Furniture grid */}
            <div className="flex-1 overflow-y-auto px-3 pb-4">
                <div className="grid grid-cols-3 gap-2">
                    {filtered.map(item => {
                        const preview = FURNITURE_VARIANTS[item.id]?.[0];
                        const affordable = canAfford(item.price);
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (!affordable || disabled) return;
                                    const newItem = createFurnitureItem(item.id);
                                    onBuyFurniture(newItem, item.price, item.name);
                                }}
                                disabled={!affordable || disabled}
                                className={`flex flex-col items-center p-2.5 rounded-2xl border-2 transition-all active:scale-95 ${
                                    affordable && !disabled
                                        ? 'border-slate-100 bg-white hover:border-orange-300 hover:shadow-md hover:shadow-orange-100/50'
                                        : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                                }`}
                            >
                                {/* Preview image */}
                                <div className="w-full aspect-square flex items-center justify-center mb-1.5 relative">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt={item.name}
                                            className="max-w-full max-h-full object-contain"
                                            style={{ imageRendering: 'pixelated', maxHeight: '56px' }}
                                        />
                                    ) : (
                                        <span className="text-3xl">{item.emoji}</span>
                                    )}
                                    {/* Color variants badge */}
                                    {(FURNITURE_VARIANTS[item.id]?.length ?? 0) > 1 && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 rounded-full
                                            flex items-center justify-center text-[8px] text-white font-black">
                                            {FURNITURE_VARIANTS[item.id].length}
                                        </div>
                                    )}
                                </div>
                                {/* Name */}
                                <span className="text-[10px] font-bold text-slate-700 text-center leading-tight mb-1">
                                    {item.name}
                                </span>
                                {/* Price */}
                                <div className={`text-[10px] font-black flex items-center gap-0.5 ${
                                    affordable ? 'text-orange-500' : 'text-slate-400'
                                }`}>
                                    🪙 {item.price}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
