import React, { useState } from 'react';
import { useDataContext } from '../../context/DataContext.jsx';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { useShopManager } from '../../hooks/useShopManager';
import { useToast } from '../../hooks/useToast';
import { Icons } from '../../utils/Icons';
import { apiFetch } from '../../api/client';

const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
    accent: '#7C5CFC', accentHot: '#6344E0', accentSoft: '#EDE9FE',
    teal: '#4ECDC4', coral: '#FF6B6B', green: '#10B981', pink: '#EC4899',
    textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
};

const pastels = [
    'linear-gradient(160deg, #FFF5EB 0%, #FFE0C2 100%)',
    'linear-gradient(160deg, #EDE9FE 0%, #DDD6FE 100%)',
    'linear-gradient(160deg, #E0F2FE 0%, #BAE6FD 100%)',
    'linear-gradient(160deg, #FCE7F3 0%, #FBCFE8 100%)',
    'linear-gradient(160deg, #ECFCCB 0%, #D9F99D 100%)',
    'linear-gradient(160deg, #FEF3C7 0%, #FDE68A 100%)',
];

/* ─── Inventory Card (parent admin) ─── */
const ShopItemCard = ({ item, idx, onEdit, onDelete }) => {
    const isCharity = item.walletTarget === 'give';
    const heights = ['140px', '170px', '130px', '190px', '150px', '160px'];
    const emojiH = heights[idx % heights.length];

    return (
        <div className="break-inside-avoid mb-2.5">
            <div className="overflow-hidden transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
                style={{ background: C.bgCard, borderRadius: '12px 12px 4px 4px', boxShadow: '0 1px 4px rgba(27,46,75,0.04)' }}
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

                    {/* Tag overlay */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg text-white backdrop-blur-sm"
                            style={{ background: item.type === 'single' ? 'rgba(124,92,252,0.85)' : item.type === 'multiple' ? 'rgba(78,205,196,0.85)' : 'rgba(139,92,246,0.85)' }}>
                            {item.type === 'single' ? '单次' : item.type === 'multiple' ? '多次' : '特权'}
                        </span>
                    </div>
                </div>

                {/* Card footer */}
                <div className="px-3 pt-2.5 pb-3">
                    <h3 className="font-bold text-[13px] leading-snug line-clamp-2 mb-1" style={{ color: C.textPrimary }}>
                        {item.name}
                    </h3>
                    {item.desc && (
                        <p className="text-[11px] leading-relaxed line-clamp-1 mb-1.5" style={{ color: C.textMuted }}>{item.desc}</p>
                    )}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            {isCharity
                                ? <Icons.Heart size={14} className="fill-pink-500 text-pink-500" />
                                : <Icons.Star size={14} className="fill-yellow-500 text-yellow-500" />}
                            <span className="font-black text-sm" style={{ color: isCharity ? C.pink : C.accent }}>{item.price}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={e => { e.stopPropagation(); onEdit(item); }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
                                style={{ background: C.accentSoft }}>
                                <Icons.Settings size={12} style={{ color: C.accent }} />
                            </button>
                            <button onClick={e => { e.stopPropagation(); onDelete(item); }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
                                style={{ background: '#FEE2E2' }}>
                                <Icons.Trash2 size={12} style={{ color: C.coral }} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ParentShopTab = () => {
    const authC = useAuthContext();
    const dataC = useDataContext();
    const uiC = useUIContext();
    const { kids, orders, inventory, setInventory, setOrders } = dataC;
    const { setShowAddItemModal, setNewItem } = uiC;
    const { notify } = useToast();
    const { handleVerifyOrder } = useShopManager(authC, dataC, uiC);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [activeTab, setActiveTab] = useState('inventory');
    const [filterKid, setFilterKid] = useState('all');
    const [showAllHistory, setShowAllHistory] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [revokeTarget, setRevokeTarget] = useState(null);

    const filteredItems = inventory.filter(item =>
        !searchKeyword || item.name.toLowerCase().includes(searchKeyword.toLowerCase()) || (item.desc && item.desc.toLowerCase().includes(searchKeyword.toLowerCase()))
    );

    const handleEdit = (item) => {
        setNewItem({ ...item, price: item.price.toString() });
        setShowAddItemModal(true);
    };

    const handleDelete = (item) => setDeleteTarget(item);

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await apiFetch(`/api/inventory/${deleteTarget.id}`, { method: 'DELETE' });
            setInventory(inventory.filter(i => i.id !== deleteTarget.id));
            notify("商品已下架", "success");
        } catch (e) { notify("下架失败", "error"); }
        setDeleteTarget(null);
    };

    const confirmRevoke = async () => {
        if (!revokeTarget) return;
        try {
            await apiFetch(`/api/orders/${revokeTarget.id}`, { method: 'DELETE' });
            setOrders(orders.filter(o => o.id !== revokeTarget.id));
            // Refund the balance
            const kid = kids.find(k => String(k.id) === String(revokeTarget.kidId));
            if (kid) {
                const newBal = (kid.balances?.spend || 0) + (revokeTarget.price || 0);
                await apiFetch(`/api/kids/${kid.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ balances: { ...kid.balances, spend: newBal } }) }).catch(() => {});
            }
            notify("已撤销并退回金币", "success");
        } catch (e) { notify("撤销失败", "error"); }
        setRevokeTarget(null);
    };

    /* ─── Exchange History ─── */
    const renderHistory = () => {
        const filtered = orders
            .filter(o => filterKid === 'all' || String(o.kidId) === String(filterKid))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        const totalSpent = filtered.reduce((s, o) => s + (o.price || 0), 0);

        // Kid filter pills — always visible
        const kidFilterPills = kids.length > 1 ? (
            <div className="flex gap-1.5 mb-3 flex-wrap">
                <button onClick={() => { setFilterKid('all'); setShowAllHistory(false); }}
                    className="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                    style={{ background: filterKid === 'all' ? C.accent : C.bgCard, color: filterKid === 'all' ? '#fff' : C.textMuted }}>
                    全部
                </button>
                {kids.map(k => (
                    <button key={k.id} onClick={() => { setFilterKid(k.id); setShowAllHistory(false); }}
                        className="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                        style={{ background: filterKid === k.id ? C.accent : C.bgCard, color: filterKid === k.id ? '#fff' : C.textMuted }}>
                        {k.name}
                    </button>
                ))}
            </div>
        ) : null;

        if (filtered.length === 0) return (
            <div>
                {kidFilterPills}
                <div className="text-center rounded-2xl py-14" style={{ background: C.bgCard }}>
                    <div className="text-3xl mb-1.5">📋</div>
                    <div className="text-xs font-bold" style={{ color: C.textMuted }}>暂无兑换记录</div>
                </div>
            </div>
        );

        // Group by day
        const today = new Date(); today.setHours(0,0,0,0);
        const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
        const groups = {};
        filtered.forEach(o => {
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

        const MAX_VISIBLE = 8;
        const totalCount = filtered.length;
        const hasMore = totalCount > MAX_VISIBLE && !showAllHistory;
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
                        <div className="text-[10px] font-bold mb-0.5" style={{ color: C.textMuted }}>总兑换次数</div>
                        <div className="text-lg font-black" style={{ color: C.textPrimary }}>{filtered.length} 次</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-bold mb-0.5" style={{ color: C.textMuted }}>总消耗金币</div>
                        <div className="flex items-center gap-1 justify-end">
                            <Icons.Star size={14} className="fill-yellow-500 text-yellow-500" />
                            <span className="text-lg font-black" style={{ color: C.accent }}>{totalSpent}</span>
                        </div>
                    </div>
                </div>

                {kidFilterPills}

                {/* Day groups */}
                {visibleGroups.map(g => (
                    <div key={g.key} className="mb-3">
                        <div className="text-[11px] font-bold mb-1.5 px-1" style={{ color: C.textMuted }}>{g.label}</div>
                        <div className="space-y-1.5">
                            {g.items.map(o => {
                                const kid = kids.find(k => String(k.id) === String(o.kidId));
                                const matchItem = inventory.find(i => String(i.id) === String(o.itemId));
                                return (
                                    <div key={o.id} className="rounded-xl p-3 flex gap-3 items-center" style={{ background: C.bgCard }}>
                                        <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden flex items-center justify-center text-base" style={{ background: C.accentSoft }}>
                                            {matchItem?.image ? <img src={matchItem.image} alt="" className="w-full h-full object-cover" /> : <span>{matchItem?.iconEmoji || '🎁'}</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="font-bold text-xs truncate" style={{ color: C.textPrimary }}>{o.itemName}</span>
                                                {kids.length > 1 && kid && (
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: C.accentSoft, color: C.accent }}>
                                                        {kid.name}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] font-medium" style={{ color: C.textMuted }}>
                                                {new Date(o.date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div className="shrink-0 flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <Icons.Star size={11} className="fill-yellow-500 text-yellow-500" />
                                                <span className="text-sm font-black" style={{ color: C.accent }}>-{o.price}</span>
                                            </div>
                                            <button onClick={() => setRevokeTarget(o)}
                                                className="text-[10px] font-bold px-2 py-1 rounded-lg transition-all active:scale-95"
                                                style={{ background: '#FEE2E2', color: C.coral }}>
                                                撤销
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {hasMore && (
                    <button onClick={() => setShowAllHistory(true)}
                        className="w-full py-3 rounded-xl text-xs font-bold transition-all"
                        style={{ background: C.bgCard, color: C.accent }}>
                        查看更多（还有 {totalCount - MAX_VISIBLE} 条记录）
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="animate-fade-in -mx-4 md:-mx-8 px-0 pb-10" style={{ background: C.bg, minHeight: '100vh' }}>
          <div className="max-w-5xl mx-auto">

            {/* Hero with blob decorations */}
            <div className="relative overflow-hidden pb-4 px-4">
                <div className="absolute -top-32 -left-20 w-56 h-56 rounded-full opacity-15" style={{ background: C.accent }}></div>
                <div className="absolute -top-20 -left-12 w-40 h-40 rounded-full opacity-10" style={{ background: '#A78BFA' }}></div>

                <div className="relative z-10">
                    <h1 className="text-2xl font-black" style={{ color: C.textPrimary }}>家庭超市</h1>
                    <p className="text-sm font-bold mt-0.5" style={{ color: C.textSoft }}>管理奖励商品，查看兑换记录</p>
                </div>
            </div>

            <div className="px-4">

                {/* Segmented control */}
                <div className="grid grid-cols-2 p-1 rounded-xl mb-4" style={{ background: C.bgLight }}>
                    <button onClick={() => setActiveTab('inventory')}
                        className="py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all"
                        style={{ background: activeTab === 'inventory' ? C.bgCard : 'transparent', color: activeTab === 'inventory' ? C.accent : C.textMuted,
                            boxShadow: activeTab === 'inventory' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none' }}>
                        <Icons.ShoppingBag size={14} /> 商品管理
                    </button>
                    <button onClick={() => setActiveTab('history')}
                        className="py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all"
                        style={{ background: activeTab === 'history' ? C.bgCard : 'transparent', color: activeTab === 'history' ? C.accent : C.textMuted,
                            boxShadow: activeTab === 'history' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none' }}>
                        <Icons.Package size={14} /> 兑换记录
                    </button>
                </div>

                {activeTab === 'inventory' ? (
                    <>
                        {/* Search + Add */}
                        <div className="flex gap-2 mb-4">
                            <div className="flex-1 relative">
                                <Icons.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textMuted }} />
                                <input type="text" placeholder="搜索商品..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}
                                    className="w-full text-xs font-bold rounded-xl pl-9 pr-3 py-2.5 border-none outline-none"
                                    style={{ background: C.bgCard, color: C.textPrimary, caretColor: C.accent }} />
                            </div>
                            <button onClick={() => setShowAddItemModal(true)}
                                className="px-4 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
                                style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accentHot})`, boxShadow: '0 4px 14px rgba(124,92,252,0.3)' }}>
                                <Icons.Plus size={14} /> 添加商品
                            </button>
                        </div>

                        {/* Inventory grid — waterfall */}
                        {filteredItems.length === 0 ? (
                            <div className="text-center rounded-2xl py-14" style={{ background: C.bgCard }}>
                                <div className="text-3xl mb-1.5">🛒</div>
                                <div className="text-xs font-bold" style={{ color: C.textMuted }}>
                                    {searchKeyword ? '没有匹配的商品' : '货架空空如也，快添加商品吧'}
                                </div>
                            </div>
                        ) : (
                            <div style={{ columnWidth: '165px', columnGap: '10px' }}>
                                {filteredItems.map((item, idx) => (
                                    <ShopItemCard key={item.id} item={item} idx={idx} onEdit={handleEdit} onDelete={handleDelete} />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    renderHistory()
                )}
            </div>

            {/* Delete confirm modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[25vh] p-4" style={{ background: 'rgba(27,46,75,0.4)', top: 0, left: 0, right: 0, bottom: 0 }}
                    onClick={() => setDeleteTarget(null)}>
                    <div className="rounded-2xl p-6 w-full max-w-xs text-center shadow-2xl" style={{ background: C.bg }}
                        onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 overflow-hidden flex items-center justify-center text-3xl"
                            style={{ background: C.accentSoft }}>
                            {deleteTarget.image
                                ? <img src={deleteTarget.image} alt="" className="w-full h-full object-cover" />
                                : <span>{deleteTarget.iconEmoji || '🎁'}</span>}
                        </div>
                        <div className="text-sm font-black mb-1" style={{ color: C.textPrimary }}>确定要下架吗？</div>
                        <div className="text-xs font-bold mb-5" style={{ color: C.textMuted }}>
                            【{deleteTarget.name}】将从货架移除
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-3 rounded-xl text-xs font-black transition-all active:scale-95"
                                style={{ background: C.bgLight, color: C.textSoft }}>
                                再想想
                            </button>
                            <button onClick={confirmDelete}
                                className="flex-1 py-3 rounded-xl text-xs font-black text-white transition-all active:scale-95"
                                style={{ background: C.coral, boxShadow: '0 4px 14px rgba(255,107,107,0.3)' }}>
                                确认下架
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Revoke confirm modal */}
            {revokeTarget && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[25vh] p-4" style={{ background: 'rgba(27,46,75,0.4)', top: 0, left: 0, right: 0, bottom: 0 }}
                    onClick={() => setRevokeTarget(null)}>
                    <div className="rounded-2xl p-6 w-full max-w-xs text-center shadow-2xl" style={{ background: C.bg }}
                        onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 overflow-hidden flex items-center justify-center text-3xl"
                            style={{ background: '#FEE2E2' }}>
                            ↩️
                        </div>
                        <div className="text-sm font-black mb-1" style={{ color: C.textPrimary }}>确定要撤销吗？</div>
                        <div className="text-xs font-bold mb-1" style={{ color: C.textMuted }}>
                            【{revokeTarget.itemName}】将被撤销
                        </div>
                        <div className="text-[11px] font-bold mb-5 flex items-center justify-center gap-1" style={{ color: C.accent }}>
                            <Icons.Star size={11} className="fill-yellow-500 text-yellow-500" />
                            {revokeTarget.price} 金币将退还给孩子
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setRevokeTarget(null)}
                                className="flex-1 py-3 rounded-xl text-xs font-black transition-all active:scale-95"
                                style={{ background: C.bgLight, color: C.textSoft }}>
                                取消
                            </button>
                            <button onClick={confirmRevoke}
                                className="flex-1 py-3 rounded-xl text-xs font-black text-white transition-all active:scale-95"
                                style={{ background: C.coral, boxShadow: '0 4px 14px rgba(255,107,107,0.3)' }}>
                                确认撤销
                            </button>
                        </div>
                    </div>
                </div>
            )}

          </div>
        </div>
    );
};
