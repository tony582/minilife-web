import React, { useState } from 'react';
import { useDataContext } from '../../context/DataContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons } from '../../utils/Icons';
import { QRCodeSVG } from 'qrcode.react';
import { isSameDay } from '../../utils/dateUtils';

export const KidShopTab = () => {
    const { kidShopTab, setKidShopTab, mallSortByPrice, setMallSortByPrice, orderFilterStatus, setOrderFilterStatus, orderSortByPrice, setOrderSortByPrice, setShopTargetItem, setShowShopConfirmModal, setQrModalValue, setReviewOrderId, setReviewStars, setReviewComment, setShowReviewModal } = useUIContext();
    const { inventory, orders, kids, activeKidId } = useDataContext();
    const activeKid = kids.find(k => k.id === activeKidId);

    const [searchKidShopKeyword, setSearchKidShopKeyword] = useState('');

    if (!activeKid) return null;

    const myOrders = orders.filter(o => String(o.kidId) === String(activeKidId));

    const handleBuyItem = (item) => {
        setShopTargetItem(item);
        setShowShopConfirmModal(true);
    };

    return (
        <div className="animate-fade-in space-y-4 sm:space-y-6 pb-10">

            {/* Wallet Balances Mini-Dashboard */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 flex items-center justify-between relative z-10 w-full mb-2">
                <div className="flex-1 border-r border-slate-100">
                    <div className="text-[10px] sm:text-xs font-bold text-slate-400 mb-1">日常消费</div>
                    <div className="flex items-center gap-1.5 text-yellow-500">
                        <Icons.Star size={16} className="fill-yellow-500" />
                        <span className="font-black text-xl sm:text-3xl tracking-tight leading-none text-slate-800">{activeKid.balances?.spend || 0}</span>
                    </div>
                </div>
                <div className="flex-1 pl-4 sm:pl-5">
                    <div className="text-[10px] sm:text-xs font-bold text-slate-400 mb-1">爱心公益</div>
                    <div className="flex items-center gap-1.5 text-rose-500">
                        <Icons.Heart size={16} className="fill-rose-500" />
                        <span className="font-black text-xl sm:text-3xl tracking-tight leading-none text-slate-800">{activeKid.balances?.give || 0}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-3 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 w-full mb-6">
                <div className="flex bg-slate-50 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto whitespace-nowrap hide-scrollbar snap-x">
                    <button onClick={() => setKidShopTab('browse')} className={`flex-1 sm:px-6 py-2.5 px-4 rounded-xl font-black text-sm transition-all snap-center shrink-0 ${kidShopTab === 'browse' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>官方货架区</button>
                    <button onClick={() => setKidShopTab('orders')} className={`flex-1 sm:px-6 py-2.5 px-4 rounded-xl font-black text-sm relative transition-all snap-center shrink-0 ${kidShopTab === 'orders' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        我的订单
                        {myOrders.filter(o => o.status === 'shipping').length > 0 && <span className="absolute top-2 right-2 sm:right-4 w-2 h-2 bg-red-500 rounded-full"></span>}
                    </button>
                </div>

                <div className="flex items-center gap-2 sm:w-auto w-full overflow-x-auto whitespace-nowrap hide-scrollbar">
                    {kidShopTab === 'browse' && (
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl w-full shrink-0">
                            <Icons.Filter size={16} className="text-slate-400" />
                            <select
                                value={mallSortByPrice}
                                onChange={(e) => setMallSortByPrice(e.target.value)}
                                className="bg-transparent text-slate-700 font-bold text-sm outline-none cursor-pointer w-full"
                            >
                                <option value="none">推荐排序</option>
                                <option value="asc">价格低到高</option>
                                <option value="desc">价格高到低</option>
                                <option value="available">可兑换的</option>
                            </select>
                        </div>
                    )}

                    {kidShopTab === 'orders' && (
                        <>
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl min-w-[120px] shrink-0">
                                <Icons.Filter size={14} className="text-slate-400" />
                                <select
                                    value={orderFilterStatus}
                                    onChange={(e) => setOrderFilterStatus(e.target.value)}
                                    className="bg-transparent text-slate-700 font-bold text-sm outline-none cursor-pointer w-full"
                                >
                                    <option value="all">全部状态</option>
                                    <option value="shipping">待核销</option>
                                    <option value="completed">已完成</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl min-w-[120px] shrink-0">
                                <Icons.SortAsc size={14} className="text-slate-400" />
                                <select
                                    value={orderSortByPrice}
                                    onChange={(e) => setOrderSortByPrice(e.target.value)}
                                    className="bg-transparent text-slate-700 font-bold text-sm outline-none cursor-pointer w-full"
                                >
                                    <option value="none">最新下单</option>
                                    <option value="desc">金额最高</option>
                                    <option value="asc">金额最低</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {kidShopTab === 'browse' ? (
                <div className="space-y-4">
                    <div className="relative mb-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Icons.Search size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder="搜索商品名称或描述..."
                            value={searchKidShopKeyword}
                            onChange={(e) => setSearchKidShopKeyword(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-sm font-bold rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                        />
                        {searchKidShopKeyword && (
                            <button onClick={() => setSearchKidShopKeyword('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                                <Icons.X size={14} />
                            </button>
                        )}
                    </div>
                    {inventory.filter(item => !searchKidShopKeyword || item.name.toLowerCase().includes(searchKidShopKeyword.toLowerCase()) || (item.desc && item.desc.toLowerCase().includes(searchKidShopKeyword.toLowerCase()))).length === 0 ? (
                        <div className="text-center bg-white rounded-3xl py-12 px-6 border-2 border-slate-100 border-dashed shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-3 mx-auto grayscale opacity-60">🛍️</div>
                            <div className="text-slate-400 font-bold mb-1">没有找到该商品哦</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-6">
                            {[...inventory]
                                .filter(item => !searchKidShopKeyword || item.name.toLowerCase().includes(searchKidShopKeyword.toLowerCase()) || (item.desc && item.desc.toLowerCase().includes(searchKidShopKeyword.toLowerCase())))
                                .filter(item => {
                                    if (mallSortByPrice === 'available') {
                                        const isMultiple = item.type === 'multiple';
                                        const maxAllowed = item.maxExchanges || 1;
                                        const periodBase = item.periodMaxType || 'lifetime';
                                        const boughtCount = orders.filter(o => {
                                            if (String(o.kidId) !== String(activeKidId) || o.itemName !== item.name) return false;
                                            if (!o.date) return true; // Legacy fallback
                                            const orderDate = new Date(o.date);
                                            const today = new Date();
                                            if (periodBase === 'daily') return isSameDay(orderDate, today);
                                            if (periodBase === 'weekly') {
                                                const getWeek = (d) => {
                                                    const date = new Date(d.getTime());
                                                    date.setHours(0, 0, 0, 0);
                                                    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
                                                    const week1 = new Date(date.getFullYear(), 0, 4);
                                                    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
                                                }
                                                return orderDate.getFullYear() === today.getFullYear() && getWeek(orderDate) === getWeek(today);
                                            }
                                            if (periodBase === 'monthly') return orderDate.getFullYear() === today.getFullYear() && orderDate.getMonth() === today.getMonth();
                                            return true; // lifetime
                                        }).length;
                                        const reachedLimit = isMultiple && boughtCount >= maxAllowed;
                                        const walletToCheck = item.walletTarget === 'give' ? 'give' : 'spend';
                                        return !reachedLimit && ((activeKid.balances?.[walletToCheck] || 0) >= item.price);
                                    }
                                    return true;
                                }).sort((a, b) => {
                                    if (mallSortByPrice === 'asc') return a.price - b.price;
                                    if (mallSortByPrice === 'desc' || mallSortByPrice === 'available') return b.price - a.price;
                                    return 0;
                                }).map(item => (
                                    <div key={item.id} className="bg-white rounded-[2rem] border-2 border-slate-100/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group cursor-pointer relative">
                                        {/* Image Area */}
                                        <div className={`h-40 sm:h-48 relative overflow-hidden rounded-t-[2rem] bg-gradient-to-br ${item.walletTarget === 'give' ? 'from-rose-100/80 to-pink-200/80' : item.type === 'privilege' ? 'from-fuchsia-100/80 to-purple-200/80' : 'from-blue-50 to-indigo-100/80'}`}>
                                            {/* Decorative Elements */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>

                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover relative z-10 transform group-hover:scale-110 transition-transform duration-700 ease-out" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                                            ) : null}
                                            <div className={`w-full h-full flex items-center justify-center text-7xl sm:text-8xl transform group-hover:scale-110 transition-transform duration-500 drop-shadow-lg relative z-10 ${item.image ? 'hidden' : ''}`}>
                                                {item.iconEmoji}
                                            </div>

                                            {/* Type Badge */}
                                            <div className="absolute top-3 left-3 z-20">
                                                <div className={`text-[10px] sm:text-xs font-black px-2.5 py-1 sm:py-1.5 rounded-xl shadow-sm border ${item.type === 'single' ? 'bg-orange-400 text-white border-orange-300' : item.type === 'multiple' ? 'bg-blue-500 text-white border-blue-400' : 'bg-purple-500 text-white border-purple-400'}`}>
                                                    {item.type === 'single' ? '单次兑换' : item.type === 'multiple' ? '多次兑换' : '永久特权'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details Area */}
                                        <div className="p-4 sm:p-5 flex flex-col flex-1 bg-white rounded-b-[2rem] relative">
                                            <h3 className="font-black text-slate-800 text-lg sm:text-xl line-clamp-1 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                                            <p className="text-slate-500 text-xs sm:text-sm mb-3 flex-1 line-clamp-2 leading-relaxed">{item.desc}</p>

                                            {(() => {
                                                const isMultiple = item.type === 'multiple';
                                                if (isMultiple && item.maxExchanges > 0) {
                                                    const periodBase = item.periodMaxType || 'lifetime';
                                                    const boughtCount = orders.filter(o => {
                                                        if (String(o.kidId) !== String(activeKidId) || o.itemName !== item.name) return false;
                                                        if (!o.date) return true;
                                                        const orderDate = new Date(o.date);
                                                        const today = new Date();
                                                        if (periodBase === 'daily') return isSameDay(orderDate, today);
                                                        if (periodBase === 'weekly') {
                                                            const getWeek = (d) => {
                                                                const date = new Date(d.getTime());
                                                                date.setHours(0, 0, 0, 0);
                                                                date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
                                                                const week1 = new Date(date.getFullYear(), 0, 4);
                                                                return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
                                                            }
                                                            return orderDate.getFullYear() === today.getFullYear() && getWeek(orderDate) === getWeek(today);
                                                        }
                                                        if (periodBase === 'monthly') return orderDate.getFullYear() === today.getFullYear() && orderDate.getMonth() === today.getMonth();
                                                        return true;
                                                    }).length;

                                                    const maxAllowed = item.maxExchanges || 1;
                                                    const remaining = Math.max(0, maxAllowed - boughtCount);

                                                    const periodText = periodBase === 'daily' ? '每日' : periodBase === 'weekly' ? '每周' : periodBase === 'monthly' ? '每月' : '总计';
                                                    const limitText = `${periodText}${maxAllowed}次`;

                                                    return (
                                                        <div className="flex items-center gap-1.5 mb-4 opacity-80">
                                                            <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                                                {limitText}
                                                            </div>
                                                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${remaining > 0 ? 'text-indigo-600 bg-indigo-50 border border-indigo-100' : 'text-rose-600 bg-rose-50 border border-rose-100'}`}>
                                                                剩 {remaining} 次
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return <div className="mb-4"></div>; // Spacer if no limits
                                            })()}

                                            <div className="mt-auto flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    {item.walletTarget === 'give' && item.charityTarget && (
                                                        <div className="text-[10px] font-bold text-rose-500 mb-1 opacity-80">
                                                            💖 {item.charityTarget}
                                                        </div>
                                                    )}
                                                    <div className={`flex items-baseline gap-1 ${item.walletTarget === 'give' ? 'text-rose-600' : 'text-slate-800'}`}>
                                                        {item.walletTarget === 'give' ? <Icons.Heart size={16} className="fill-rose-500 text-rose-500" /> : <Icons.Star size={18} className="fill-yellow-500 text-yellow-500" />}
                                                        <span className="font-black text-xl sm:text-2xl tracking-tighter leading-none">{item.price}</span>
                                                    </div>
                                                </div>
                                                {(() => {
                                                    const isMultiple = item.type === 'multiple';
                                                    const maxAllowed = item.maxExchanges || 1;
                                                    const periodBase = item.periodMaxType || 'lifetime';
                                                    const boughtCount = orders.filter(o => {
                                                        if (String(o.kidId) !== String(activeKidId) || o.itemName !== item.name) return false;
                                                        if (!o.date) return true;
                                                        const orderDate = new Date(o.date);
                                                        const today = new Date();
                                                        if (periodBase === 'daily') return isSameDay(orderDate, today);
                                                        if (periodBase === 'weekly') {
                                                            const getWeek = (d) => {
                                                                const date = new Date(d.getTime());
                                                                date.setHours(0, 0, 0, 0);
                                                                date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
                                                                const week1 = new Date(date.getFullYear(), 0, 4);
                                                                return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
                                                            }
                                                            return orderDate.getFullYear() === today.getFullYear() && getWeek(orderDate) === getWeek(today);
                                                        }
                                                        if (periodBase === 'monthly') return orderDate.getFullYear() === today.getFullYear() && orderDate.getMonth() === today.getMonth();
                                                        return true;
                                                    }).length;
                                                    const reachedLimit = isMultiple && boughtCount >= maxAllowed;

                                                    if (reachedLimit) {
                                                        return (
                                                            <button disabled className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-not-allowed bg-slate-100 text-slate-400 shrink-0">
                                                                <Icons.CheckCircle size={20} />
                                                            </button>
                                                        );
                                                    }

                                                    return (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleBuyItem(item); }}
                                                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-95 shrink-0 ${item.walletTarget === 'give' ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:-translate-y-0.5'}`}
                                                        >
                                                            <Icons.PlusCircle size={24} />
                                                        </button>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <h3 className="font-black text-slate-800 text-lg flex items-center gap-2"><Icons.Package size={18} className="text-slate-500" /> 我的订单</h3>
                    </div>
                    {myOrders.filter(o => (orderFilterStatus === 'all' || o.status === orderFilterStatus)).length === 0 ? (
                        <div className="text-center text-slate-400 font-bold py-16 bg-slate-50 rounded-[2rem] border border-slate-100/50">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icons.Package size={32} className="text-slate-300" />
                            </div>
                            暂无相关订单
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myOrders.filter(o => (orderFilterStatus === 'all' || o.status === orderFilterStatus))
                                .sort((a, b) => {
                                    if (orderSortByPrice === 'desc') return b.price - a.price;
                                    if (orderSortByPrice === 'asc') return a.price - b.price;
                                    return new Date(b.date) - new Date(a.date);
                                })
                                .map(o => {
                                    const matchingItem = inventory.find(i => String(i.id) === String(o.itemId)) || {
                                        image: null,
                                        iconEmoji: '🎁',
                                        desc: '未知商品详情'
                                    };
                                    const isGive = o.walletUsed === 'give';

                                    return (
                                        <div key={o.id} className="bg-white group p-4 sm:p-5 rounded-[2rem] flex flex-col sm:flex-row gap-4 sm:gap-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all border border-slate-100 relative overflow-hidden">
                                            {/* Background Accent */}
                                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -z-10 ${o.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>

                                            {/* Thumbnail/Icon */}
                                            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl shrink-0 overflow-hidden shadow-inner relative ${isGive ? 'bg-rose-50' : 'bg-indigo-50'}`}>
                                                {matchingItem.image ? (
                                                    <img src={matchingItem.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="drop-shadow-sm">{matchingItem.iconEmoji}</div>
                                                )}
                                            </div>

                                            {/* Content Details */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="flex items-center gap-3 mb-1.5 align-middle">
                                                    <h4 className="font-black text-slate-800 text-lg sm:text-xl truncate">{o.itemName}</h4>
                                                    <div className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-xl shadow-sm ${o.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-amber-200'}`}>
                                                        {o.status === 'completed' ? '已核销完成' : '等待父母核销'}
                                                    </div>
                                                </div>

                                                <p className="text-slate-500 text-xs sm:text-sm line-clamp-1 mb-3 pr-2">{matchingItem.desc}</p>

                                                <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs font-bold text-slate-400 mt-auto">
                                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl">
                                                        <Icons.Clock size={12} className="text-slate-400" />
                                                        {new Date(o.date).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-slate-500">消耗</span>
                                                        <span className={`font-black text-sm flex items-center gap-0.5 ${isGive ? 'text-rose-500' : 'text-yellow-500'}`}>
                                                            {isGive ? <Icons.Heart size={12} className="fill-rose-500" /> : <Icons.Star size={12} className="fill-yellow-500" />}
                                                            {o.price}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions / QR Code Area */}
                                            <div className="flex items-center justify-end sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100/50 shrink-0">
                                                {o.status === 'shipping' ? (
                                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                                        <div className="flex-1 sm:hidden">
                                                            <div className="text-xs font-bold text-slate-400 mb-0.5">出示给父母核销</div>
                                                            <div className="text-sm font-black text-indigo-600">点击放大二维码</div>
                                                        </div>
                                                        <div
                                                            className="bg-white p-1.5 border-2 border-indigo-100 rounded-xl shadow-sm shrink-0 cursor-pointer hover:scale-105 hover:shadow-md hover:border-indigo-300 transition-all active:scale-95 group/qr relative"
                                                            onClick={() => setQrModalValue(o.redeemCode || o.id)}
                                                        >
                                                            <QRCodeSVG value={o.redeemCode || o.id} size={52} level="H" fgColor="#4f46e5" />
                                                            <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center opacity-0 group-hover/qr:opacity-100 transition-opacity">
                                                                <Icons.PlusCircle size={24} className="text-indigo-600 drop-shadow-md" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full sm:w-auto flex justify-end">
                                                        {!o.rating ? (
                                                            <button onClick={() => { setReviewOrderId(o.id); setReviewStars(5); setReviewComment(""); setShowReviewModal(true); }} className="w-full sm:w-auto px-5 py-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-black text-sm rounded-xl transition-colors border border-slate-200 hover:border-indigo-200 text-center">
                                                                评价晒单
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100">
                                                                {[...Array(5)].map((_, i) => <Icons.Star key={i} size={16} className={i < o.rating ? 'fill-yellow-400 text-yellow-400' : 'text-yellow-200'} />)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
