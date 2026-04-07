import React, { useState, useMemo, useEffect } from 'react';
import { Icons } from '../../utils/Icons';
import { FURNITURE_CATALOG } from '../../data/furnitureCatalog';

const COLS = 3;

export default function BackpackModal({
    onClose,
    furnitureItems = [],          // global backpack unplaced furniture
    onPlaceFurniture,
}) {
    // ── Furniture Grouping ───────────────────────────────────────────────
    const groupedFurniture = useMemo(() => {
        const groups = {};
        for (const f of furnitureItems) {
            if (f.placed) continue;
            const key = `${f.type || f.id}_${f.src}`;
            if (!groups[key]) {
                groups[key] = { ...f, instances: [], groupKey: key };
            }
            groups[key].instances.push(f);
        }
        return Object.values(groups);
    }, [furnitureItems]);

    // ── Handlers ─────────────────────────────────────────────────────────
    const handleFurnitureClick = (group) => {
        onPlaceFurniture?.(group.instances[0]);
    };

    // ── Render Helpers ───────────────────────────────────────────────────
    const renderFurniture = () => {
        if (groupedFurniture.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 bg-white border-[3px] border-gray-900 rounded-xl shadow-[4px_4px_0_#111827] mx-2">
                    <span className="text-5xl opacity-80 mb-4 grayscale">📦</span>
                    <span className="text-sm font-black text-gray-900">家具库空空如也，去商店进点货吧！</span>
                </div>
            );
        }
        return (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: '12px' }}>
                {groupedFurniture.map((group) => {
                    const qty = group.instances.length;
                    const catalogItem = FURNITURE_CATALOG.find(i => i.id === (group.type || group.id));
                    const itemName = catalogItem?.name || group.label || group.type || '未命名家具';

                    return (
                        <button
                            key={group.groupKey}
                            onClick={() => handleFurnitureClick(group)}
                            className="relative flex flex-col items-stretch p-2.5 rounded-xl bg-white border-[3px] border-gray-900 shadow-[3px_3px_0_#111827] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[1px_1px_0_#111827] transition-all group"
                        >
                            <div className="w-full bg-[#f4f4f5] border-2 border-gray-900 rounded-lg aspect-square flex items-center justify-center relative mb-2">
                                <img
                                    src={group.src}
                                    alt={itemName}
                                    className="pointer-events-none group-hover:-translate-y-1 transition-transform drop-shadow-md"
                                    style={{
                                        imageRendering: 'pixelated',
                                        maxWidth: '70%',
                                        maxHeight: '70%',
                                        objectFit: 'contain',
                                    }}
                                />
                                <div className="absolute -top-0.5 -right-0.5 min-w-[22px] h-[22px] flex items-center justify-center text-[10px] font-black text-white bg-rose-500 border-b-2 border-l-2 border-gray-900 rounded-bl-lg rounded-tr-md px-1">
                                    x{qty}
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-black text-gray-900 leading-tight mb-2 truncate w-full text-center">
                                    {itemName}
                                </span>
                                <div className="text-[10px] font-black text-gray-900 bg-yellow-300 border-2 border-gray-900 rounded-full px-3 py-1 shadow-[1px_1px_0_#111827] active:scale-95 transition-transform">
                                    点击布置
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <div 
            className="fixed inset-0 z-[95] flex items-center justify-center p-0 md:p-6 pointer-events-auto"
            style={{ background: 'rgba(20, 20, 25, 0.6)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div 
                className="w-full h-full md:h-auto md:max-w-xl flex flex-col overflow-hidden transition-transform animate-slide-up-fast md:animate-pop-in bg-[#F4F4F0] md:border-[4px] border-gray-900 md:rounded-3xl shadow-2xl"
                style={{
                    maxHeight: typeof window !== 'undefined' && window.innerWidth >= 768 ? '85dvh' : '100%',
                }}
            >
                {/* ── Header ── */}
                <div className="flex-shrink-0 px-5 pt-safe pb-4 flex items-center justify-between border-b-[4px] border-gray-900 bg-white shadow-sm" style={{ paddingTop: 'max(env(safe-area-inset-top), 24px)' }}>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <span>🎒</span>
                        <span>我的仓库</span>
                    </h2>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 md:bg-white border-[2px] md:border-[3px] border-gray-900 shadow-[2px_2px_0_#111827] hover:bg-gray-200 md:hover:bg-gray-100 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all flex items-center justify-center text-gray-900"
                    >
                        <Icons.X size={20} strokeWidth={3} />
                    </button>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="flex-1 overflow-y-auto px-4 py-5 md:px-5 md:py-6 bg-[#e2e8f0] pb-safe-offset" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 100px)' }}>
                    {renderFurniture()}
                </div>
            </div>
        </div>
    );
}
