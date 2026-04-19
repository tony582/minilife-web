import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useDataContext } from '../../context/DataContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons } from '../../utils/Icons';

import { isSameDay } from '../../utils/dateUtils';
import useOnClickOutside from '../../hooks/useOnClickOutside';

const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
    accent: '#7C5CFC', accentHot: '#6344E0', accentSoft: '#EDE9FE',
    orange: '#FF8C42', teal: '#4ECDC4',
    coral: '#FF6B6B', green: '#10B981', pink: '#EC4899', purple: '#8B5CF6',
    textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
    dropShadow: '0 20px 50px rgba(27,46,75,0.12)',
};

const countBought = (orders, kidId, item) => {
    const pb = item.periodMaxType || 'lifetime';
    return orders.filter(o => {
        if (String(o.kidId) !== String(kidId) || o.itemName !== item.name) return false;
        if (!o.date) return true;
        const od = new Date(o.date), td = new Date();
        if (pb === 'daily') return isSameDay(od, td);
        if (pb === 'weekly') {
            const gw = d => { const x = new Date(d.getTime()); x.setHours(0,0,0,0); x.setDate(x.getDate()+3-(x.getDay()+6)%7); const w1 = new Date(x.getFullYear(),0,4); return 1+Math.round(((x.getTime()-w1.getTime())/864e5-3+(w1.getDay()+6)%7)/7); };
            return od.getFullYear() === td.getFullYear() && gw(od) === gw(td);
        }
        if (pb === 'monthly') return od.getFullYear() === td.getFullYear() && od.getMonth() === td.getMonth();
        return true;
    }).length;
};

/* ═══════════════════════════════════════════
   小红书/Pinterest style waterfall card
   Image fills top naturally; clean minimal info below
   ═══════════════════════════════════════════ */
const WaterfallCard = ({ item, balance, orders, activeKidId, onBuy, idx }) => {
    const canAfford = balance >= item.price;
    const bc = countBought(orders, activeKidId, item);
    const isMulti = item.type === 'multiple';
    const maxN = item.maxExchanges || 1;
    const reachedLimit = isMulti && bc >= maxN;
    const deficit = item.price - balance;
    const pb = item.periodMaxType || 'lifetime';
    const periodLabel = pb === 'daily' ? '日' : pb === 'weekly' ? '周' : pb === 'monthly' ? '月' : '';
    const isCharity = item.walletTarget === 'give';

    // Vary emoji background height to create waterfall effect
    const heights = ['140px', '170px', '130px', '190px', '150px', '160px'];
    const emojiH = heights[idx % heights.length];

    // Soft pastel backgrounds for emoji items
    const pastels = [
        'linear-gradient(160deg, #FFF5EB 0%, #FFE0C2 100%)',
        'linear-gradient(160deg, #EDE9FE 0%, #DDD6FE 100%)',
        'linear-gradient(160deg, #E0F2FE 0%, #BAE6FD 100%)',
        'linear-gradient(160deg, #FCE7F3 0%, #FBCFE8 100%)',
        'linear-gradient(160deg, #ECFCCB 0%, #D9F99D 100%)',
        'linear-gradient(160deg, #FEF3C7 0%, #FDE68A 100%)',
    ];

    return (
        <div className="break-inside-avoid mb-2.5">
            <div className="overflow-hidden transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                style={{ background: C.bgCard, borderRadius: '12px 12px 4px 4px', boxShadow: '0 1px 4px rgba(27,46,75,0.04)' }}
                onClick={() => !reachedLimit && canAfford && onBuy(item)}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,46,75,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(27,46,75,0.04)'}>

                {/* Image */}
                <div className="relative overflow-hidden">
                    {item.image ? (
                        <img src={item.image} alt={item.name}
                            className="w-full object-cover block"
                            style={{ maxHeight: '240px' }}
                            onError={e => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />
                    ) : null}
                    <div className={`w-full flex items-center justify-center ${item.image ? 'hidden' : ''}`}
                        style={{ height: emojiH, background: pastels[idx % pastels.length] }}>
                        <span className="text-5xl sm:text-6xl drop-shadow-md">{item.iconEmoji}</span>
                    </div>

                    {/* Tag overlay — top left */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg text-white backdrop-blur-sm"
                            style={{ background: item.type === 'single' ? 'rgba(255,140,66,0.85)' : item.type === 'multiple' ? 'rgba(78,205,196,0.85)' : 'rgba(139,92,246,0.85)' }}>
                            {item.type === 'single' ? '单次' : item.type === 'multiple' ? '多次' : '特权'}
                        </span>
                        {isMulti && !reachedLimit && (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm"
                                style={{ background: 'rgba(255,255,255,0.9)', color: C.teal }}>
                                {periodLabel ? `${periodLabel}限 ` : ''}{bc}/{maxN}
                            </span>
                        )}
                    </div>

                    {/* Sold-out overlay */}
                    {reachedLimit && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full" style={{ background: C.bgMuted }}>
                                <Icons.CheckCircle size={16} style={{ color: C.textSoft }} />
                                <span className="text-sm font-black" style={{ color: C.textSoft }}>已兑完</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Card footer — XHS style: name, then price row */}
                <div className="px-3 pt-2.5 pb-3">
                    <h3 className="font-bold text-[13px] leading-snug line-clamp-2 mb-1.5" style={{ color: C.textPrimary }}>
                        {item.name}
                    </h3>
                    {item.desc && (
                        <p className="text-[11px] leading-relaxed line-clamp-1 mb-2" style={{ color: C.textMuted }}>{item.desc}</p>
                    )}

                    {/* Price + action row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            {isCharity
                                ? <Icons.Heart size={16} className="fill-pink-500 text-pink-500" />
                                : <Icons.Star size={16} className="fill-yellow-500 text-yellow-500" />}
                            <span className="font-black text-base" style={{ color: isCharity ? C.pink : C.accent }}>{item.price}</span>
                        </div>
                        {reachedLimit ? null : canAfford ? (
                            <button onClick={e => { e.stopPropagation(); onBuy(item); }}
                                className="px-3 py-1 rounded-lg text-[11px] font-bold text-white transition-all active:scale-95"
                                style={{ background: C.accent }}>
                                兑换
                            </button>
                        ) : (
                            <span className="text-[10px] font-bold" style={{ color: C.textMuted }}>
                                还差{deficit}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export const KidShopTab = () => {
    const { kidShopTab, setKidShopTab, mallSortByPrice, setMallSortByPrice, setShopTargetItem, setShowShopConfirmModal } = useUIContext();
    const { inventory, orders, kids, activeKidId } = useDataContext();
    const activeKid = kids.find(k => k.id === activeKidId);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [typeFilter, setTypeFilter] = useState('all');
    const [showAllHistory, setShowAllHistory] = useState(false);
    const toolbarRef = useRef();
    useOnClickOutside(toolbarRef, () => { setShowFilterDropdown(false); setShowSortDropdown(false); });

    if (!activeKid) return null;

    const myOrders = orders.filter(o => String(o.kidId) === String(activeKidId));
    const balance = activeKid.balances?.spend || 0;
    const isOrders = kidShopTab === 'orders';

    const filteredItems = useMemo(() => {
        let items = [...inventory];
        if (searchKeyword) {
            const kw = searchKeyword.toLowerCase();
            items = items.filter(i => i.name.toLowerCase().includes(kw) || (i.desc && i.desc.toLowerCase().includes(kw)));
        }
        if (typeFilter === 'affordable') items = items.filter(i => { const bc = countBought(orders, activeKidId, i); if (i.type === 'multiple' && bc >= (i.maxExchanges || 1)) return false; return balance >= i.price; });
        else if (typeFilter === 'single') items = items.filter(i => i.type === 'single');
        else if (typeFilter === 'multiple') items = items.filter(i => i.type === 'multiple');
        else if (typeFilter === 'privilege') items = items.filter(i => i.type === 'privilege');
        if (mallSortByPrice === 'asc') items.sort((a, b) => a.price - b.price);
        else if (mallSortByPrice === 'desc') items.sort((a, b) => b.price - a.price);
        return items;
    }, [inventory, typeFilter, searchKeyword, mallSortByPrice, orders, activeKidId, balance]);

    const handleBuyItem = (item) => { setShopTargetItem(item); setShowShopConfirmModal(true); };

    return (
        <div className="animate-fade-in -mx-4 md:-mx-8 px-0 pb-10 overflow-hidden" style={{ background: C.bg, minHeight: '100vh' }}>
          <div className="max-w-5xl mx-auto">

            {/* ═══ Hero with blob decorations ═══ */}
            <div className="relative overflow-hidden pb-4 px-4">
                <div className="absolute -top-32 -left-20 w-56 h-56 rounded-full opacity-15 z-0" style={{ background: C.accent }}></div>
                <div className="absolute -top-20 -left-12 w-40 h-40 rounded-full opacity-10 z-0" style={{ background: '#A78BFA' }}></div>
                <div className="absolute -top-16 right-8 w-24 h-24 rounded-full opacity-8 z-0" style={{ background: C.pink }}></div>

                <div className="relative z-10 flex items-center justify-between mb-5">
                    <div>
                        <h1 className="text-2xl font-black" style={{ color: C.textPrimary }}>奖品橱窗</h1>
                        <p className="text-sm font-bold mt-0.5" style={{ color: C.textSoft }}>完成任务赚金币，兑换心愿奖品</p>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-black"
                        style={{ background: C.bgCard, color: C.textPrimary, boxShadow: '0 1px 6px rgba(27,46,75,0.06)' }}>
                        <Icons.Star size={16} className="fill-yellow-500 text-yellow-500" />
                        <span>{balance.toLocaleString()}</span>
                    </div>
                </div>

                {/* ═══ Segmented Control ═══ */}
                <div className="relative z-10 rounded-2xl p-1 mb-2 grid grid-cols-2 gap-1" style={{ background: C.bgLight }}>
                    <button onClick={() => setKidShopTab('browse')}
                        className="py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all"
                        style={{ background: !isOrders ? C.bgCard : 'transparent', color: !isOrders ? C.accent : C.textMuted,
                            boxShadow: !isOrders ? '0 1px 4px rgba(0,0,0,0.06)' : 'none' }}>
                        <Icons.ShoppingBag size={14} /> 奖品橱窗
                    </button>
                    <button onClick={() => setKidShopTab('orders')}
                        className="py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all relative"
                        style={{ background: isOrders ? C.bgCard : 'transparent', color: isOrders ? C.accent : C.textMuted,
                            boxShadow: isOrders ? '0 1px 4px rgba(0,0,0,0.06)' : 'none' }}>
                        <Icons.Package size={14} /> 兑换记录
                    </button>
                </div>
            </div>

            <div className="px-4 relative z-10">

            {!isOrders ? (
                <>
                    {/* ═══ Toolbar ═══ */}
                    <div className="flex items-center gap-2 mb-3 relative z-30" ref={toolbarRef}>
                        <div className="relative flex-1 min-w-0">
                            <Icons.Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: C.textMuted }} />
                            <input type="text" placeholder="搜索..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}
                                className="w-full text-xs font-bold rounded-xl pl-8 pr-7 py-2 focus:outline-none border-none"
                                style={{ background: C.bgCard, color: C.textPrimary, caretColor: C.accent }} />
                            {searchKeyword && <button onClick={() => setSearchKeyword('')} className="absolute inset-y-0 right-0 pr-2.5 flex items-center" style={{ color: C.textMuted }}><Icons.X size={12} /></button>}
                        </div>
                        {/* Filter */}
                        <div className="relative">
                            <button onClick={() => { setShowFilterDropdown(!showFilterDropdown); setShowSortDropdown(false); }}
                                className="w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-lg flex items-center justify-center transition-all"
                                style={{ background: showFilterDropdown || typeFilter !== 'all' ? C.accent : C.bgCard, color: showFilterDropdown || typeFilter !== 'all' ? '#fff' : C.textSoft }}>
                                <Icons.Filter size={14} /><span className="hidden sm:inline ml-1 text-xs font-bold">筛选</span>
                            </button>
                            {showFilterDropdown && (
                                <div className="absolute top-full right-0 mt-1.5 w-40 rounded-xl py-1.5 z-[999] animate-fade-in" style={{ background: C.bgCard, boxShadow: C.dropShadow }}>
                                    {[{ id: 'all', label: '全部', icon: Icons.LayoutGrid }, { id: 'affordable', label: '我能兑换', icon: Icons.Sparkles }, { id: 'single', label: '单次', icon: Icons.Star }, { id: 'multiple', label: '多次', icon: Icons.RefreshCw }, { id: 'privilege', label: '特权', icon: Icons.Award }].map(f => (
                                        <button key={f.id} onClick={() => { setTypeFilter(f.id); setShowFilterDropdown(false); }}
                                            className="w-full text-left px-3 py-2 text-xs font-bold flex items-center gap-2 transition-colors"
                                            style={{ color: typeFilter === f.id ? C.accent : C.textSoft, background: typeFilter === f.id ? `${C.accent}12` : 'transparent' }}>
                                            <f.icon size={13} /> {f.label}
                                            {typeFilter === f.id && <Icons.Check size={11} className="ml-auto" style={{ color: C.accent }} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Sort */}
                        <div className="relative">
                            <button onClick={() => { setShowSortDropdown(!showSortDropdown); setShowFilterDropdown(false); }}
                                className="w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-lg flex items-center justify-center transition-all"
                                style={{ background: showSortDropdown || mallSortByPrice !== 'none' ? C.accent : C.bgCard, color: showSortDropdown || mallSortByPrice !== 'none' ? '#fff' : C.textSoft }}>
                                <Icons.ArrowUpDown size={14} /><span className="hidden sm:inline ml-1 text-xs font-bold">排序</span>
                            </button>
                            {showSortDropdown && (
                                <div className="absolute top-full right-0 mt-1.5 w-36 rounded-xl py-1.5 z-[999] animate-fade-in" style={{ background: C.bgCard, boxShadow: C.dropShadow }}>
                                    {[{ id: 'none', label: '推荐', icon: Icons.List }, { id: 'asc', label: '价格↑', icon: Icons.TrendingUp }, { id: 'desc', label: '价格↓', icon: Icons.TrendingDown }].map(o => (
                                        <button key={o.id} onClick={() => { setMallSortByPrice(o.id); setShowSortDropdown(false); }}
                                            className="w-full text-left px-3 py-2 text-xs font-bold flex items-center gap-2 transition-colors"
                                            style={{ color: mallSortByPrice === o.id ? C.accent : C.textSoft, background: mallSortByPrice === o.id ? `${C.accent}12` : 'transparent' }}>
                                            <o.icon size={13} /> {o.label}
                                            {mallSortByPrice === o.id && <Icons.Check size={11} className="ml-auto" style={{ color: C.accent }} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ═══ 小红书-style Waterfall Grid (CSS columns) ═══ */}
                    {filteredItems.length === 0 ? (
                        <div className="text-center rounded-2xl py-16 px-6" style={{ background: C.bgCard }}>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                                style={{ background: typeFilter === 'affordable' ? `${C.orange}18` : `${C.accent}18` }}>
                                {typeFilter === 'affordable'
                                    ? <Icons.Sparkles size={26} style={{ color: C.orange }} />
                                    : <Icons.Search size={26} style={{ color: C.accent }} />}
                            </div>
                            <div className="text-sm font-black mb-1" style={{ color: C.textPrimary }}>
                                {typeFilter === 'affordable' ? '还差一点点！' : searchKeyword ? '没找到' : '暂无商品'}
                            </div>
                            <div className="text-xs font-bold" style={{ color: C.textMuted }}>
                                {typeFilter === 'affordable' ? '攒攒金币，很快就能兑换啦' : searchKeyword ? `"${searchKeyword}" 不在橱窗里` : '家长还没上架奖品哦'}
                            </div>
                        </div>
                    ) : (
                        <div style={{ columnWidth: '165px', columnGap: '10px' }}>
                            {filteredItems.map((item, idx) => (
                                <WaterfallCard key={item.id} item={item} idx={idx} balance={balance} orders={orders} activeKidId={activeKidId} onBuy={handleBuyItem} />
                            ))}
                        </div>
                    )}
                </>
            ) : (
                /* ═══ 兑换记录 ═══ */
                (() => {
                    if (myOrders.length === 0) return (
                        <div className="text-center rounded-2xl py-14" style={{ background: C.bgCard }}>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                                style={{ background: `${C.purple}18` }}>
                                <Icons.Package size={26} style={{ color: C.purple }} />
                            </div>
                            <div className="text-sm font-black mb-1" style={{ color: C.textPrimary }}>还没有兑换记录</div>
                            <div className="text-xs font-bold" style={{ color: C.textMuted }}>完成任务赚金币，去橱窗挑奖品吧</div>
                        </div>
                    );

                    // Group by day
                    const sorted = [...myOrders].sort((a, b) => new Date(b.date) - new Date(a.date));
                    const today = new Date(); today.setHours(0,0,0,0);
                    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
                    const groups = {};
                    sorted.forEach(o => {
                        const d = new Date(o.date); d.setHours(0,0,0,0);
                        const key = d.getTime();
                        let label;
                        if (key === today.getTime()) label = '今天';
                        else if (key === yesterday.getTime()) label = '昨天';
                        else label = d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
                        if (!groups[key]) groups[key] = { label, items: [] };
                        groups[key].items.push(o);
                    });
                    const groupKeys = Object.keys(groups).sort((a, b) => b - a);

                    // Limit visible records to first 5, then "查看更多"
                    const MAX_VISIBLE = 5;
                    const totalSpent = myOrders.reduce((s, o) => s + (o.price || 0), 0);
                    const totalCount = sorted.length;
                    const hasMore = totalCount > MAX_VISIBLE && !showAllHistory;

                    // Build visible groups (cap items)
                    let remaining = showAllHistory ? Infinity : MAX_VISIBLE;
                    const visibleGroups = [];
                    for (const key of groupKeys) {
                        if (remaining <= 0) break;
                        const g = groups[key];
                        const items = g.items.slice(0, remaining);
                        visibleGroups.push({ key, label: g.label, items });
                        remaining -= items.length;
                    }

                    return (
                        <div>
                            {/* Summary */}
                            <div className="rounded-2xl p-4 mb-4 flex items-center justify-between" style={{ background: C.bgCard }}>
                                <div>
                                    <div className="text-[10px] font-bold mb-0.5" style={{ color: C.textMuted }}>累计兑换</div>
                                    <div className="text-lg font-black" style={{ color: C.textPrimary }}>{myOrders.length} 次</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold mb-0.5" style={{ color: C.textMuted }}>累计消耗</div>
                                    <div className="flex items-center gap-1 justify-end">
                                        <Icons.Star size={14} className="fill-yellow-500 text-yellow-500" />
                                        <span className="text-lg font-black" style={{ color: C.accent }}>{totalSpent}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Day groups */}
                            {visibleGroups.map(g => (
                                    <div key={g.key} className="mb-3">
                                        <div className="text-[11px] font-bold mb-1.5 px-1" style={{ color: C.textMuted }}>{g.label}</div>
                                        <div className="space-y-1.5">
                                            {g.items.map(o => {
                                                const matchItem = inventory.find(i => String(i.id) === String(o.itemId));
                                                return (
                                                    <div key={o.id} className="rounded-xl p-3 flex gap-3 items-center" style={{ background: C.bgCard }}>
                                                        <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden flex items-center justify-center text-base" style={{ background: C.accentSoft }}>
                                                        {matchItem?.image
                                            ? <img src={matchItem.image} alt="" className="w-full h-full object-cover" />
                                            : matchItem?.iconEmoji
                                                ? <span className="text-base">{matchItem.iconEmoji}</span>
                                                : <Icons.Gift size={18} style={{ color: C.accent }} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-xs truncate" style={{ color: C.textPrimary }}>{o.itemName}</div>
                                                            <div className="text-[10px] font-medium" style={{ color: C.textMuted }}>
                                                                {new Date(o.date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0 flex items-center gap-1">
                                                            <Icons.Star size={11} className="fill-yellow-500 text-yellow-500" />
                                                            <span className="text-sm font-black" style={{ color: C.accent }}>-{o.price}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                            ))}

                            {/* 查看更多 */}
                            {hasMore && (
                                <button onClick={() => setShowAllHistory(true)}
                                    className="w-full py-3 rounded-xl text-xs font-bold transition-all"
                                    style={{ background: C.bgCard, color: C.accent }}>
                                    查看更多（还有 {totalCount - MAX_VISIBLE} 条记录）
                                </button>
                            )}
                        </div>
                    );
                })()
            )}
            </div>

          </div>
        </div>
    );
};
