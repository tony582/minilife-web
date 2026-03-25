import React from 'react';
import { Icons } from '../../utils/Icons';

export const ShopConfirmModal = ({ context }) => {
    const {
        showShopConfirmModal, setShowShopConfirmModal,
        shopTargetItem,
        activeKidId, kids, orders,
        handleConfirmBuy,
    } = context;

    if (!showShopConfirmModal || !shopTargetItem) return null;
    const item = shopTargetItem;
    const isGive = item.walletTarget === 'give';
    const activeKid = kids.find(k => String(k.id) === String(activeKidId));
    const currentBalance = activeKid ? (activeKid.balances?.[isGive ? 'give' : 'spend'] || activeKid.balances?.spend || 0) : 0;

    const typeLabel = item.type === 'single' ? '单次兑换' : item.type === 'multiple' ? '多次兑换' : '永久特权';
    const isMulti = item.type === 'multiple';
    const maxN = item.maxExchanges || 1;
    const pb = item.periodMaxType || 'lifetime';
    const periodMap = { daily: '每日', weekly: '每周', monthly: '每月', lifetime: '总计' };
    const periodLabel = periodMap[pb] || '总计';
    const bc = orders.filter(o => {
        if (String(o.kidId) !== String(activeKidId) || o.itemName !== item.name) return false;
        if (!o.date) return true;
        const od = new Date(o.date), td = new Date();
        if (pb === 'daily') return od.toDateString() === td.toDateString();
        if (pb === 'weekly') { const s = d => { const x = new Date(d); x.setHours(0,0,0,0); x.setDate(x.getDate()-x.getDay()); return x.getTime(); }; return s(od) === s(td); }
        if (pb === 'monthly') return od.getFullYear() === td.getFullYear() && od.getMonth() === td.getMonth();
        return true;
    }).length;
    const remainingAfter = currentBalance - item.price;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowShopConfirmModal(false)}>
            <div className="w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl" style={{ background: '#FBF7F0' }} onClick={e => e.stopPropagation()}>
                <div className="relative pt-10 pb-5 flex flex-col items-center"
                    style={{ background: isGive ? 'linear-gradient(180deg, #FFF0F6 0%, #FBF7F0 100%)' : 'linear-gradient(180deg, #F0ECFF 0%, #FBF7F0 100%)' }}>
                    <button onClick={() => setShowShopConfirmModal(false)} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.06)' }}>
                        <Icons.X size={14} style={{ color: '#9CAABE' }} />
                    </button>
                    <div className="w-28 h-28 rounded-3xl bg-white shadow-lg flex items-center justify-center text-6xl mb-4" style={{ border: '3px solid white' }}>
                        {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover rounded-2xl" /> : item.iconEmoji}
                    </div>
                    <h2 className="text-xl font-black text-center px-6" style={{ color: '#1B2E4B' }}>{item.name}</h2>
                    <p className="text-sm font-bold mt-1" style={{ color: '#9CAABE' }}>想要兑换这个吗？</p>
                </div>

                <div className="px-5 pb-5">
                    <div className="flex flex-wrap gap-1.5 mb-3 justify-center">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                            style={{ background: item.type === 'single' ? '#F0ECFF' : item.type === 'multiple' ? '#E8FBF8' : '#F3EEFF', color: item.type === 'single' ? '#7C5CFC' : item.type === 'multiple' ? '#4ECDC4' : '#8B5CF6' }}>
                            {item.type === 'single' ? '🎫 单次' : item.type === 'multiple' ? '🔄 多次' : '👑 特权'}
                        </span>
                        {isMulti && (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                                style={{ background: bc >= maxN ? '#FEE2E2' : '#F0ECFF', color: bc >= maxN ? '#FF6B6B' : '#7C5CFC' }}>
                                {periodLabel}已兑 {bc}/{maxN}
                            </span>
                        )}
                        {item.desc && (
                            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ background: '#F0EBE1', color: '#5A6E8A' }}>
                                {item.desc.length > 12 ? item.desc.slice(0, 12) + '...' : item.desc}
                            </span>
                        )}
                    </div>

                    <div className="rounded-2xl p-4 mb-3 text-center" style={{ background: 'white' }}>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            {isGive ? <Icons.Heart size={22} className="fill-pink-500 text-pink-500" /> : <Icons.Star size={22} className="fill-yellow-500 text-yellow-500" />}
                            <span className="text-3xl font-black" style={{ color: isGive ? '#EC4899' : '#7C5CFC' }}>{item.price}</span>
                        </div>
                        <div className="text-[11px] font-bold" style={{ color: '#9CAABE' }}>
                            余额 {currentBalance} → 兑换后剩 <span style={{ color: remainingAfter >= 0 ? '#10B981' : '#FF6B6B' }}>{remainingAfter}</span>
                        </div>
                    </div>

                    <button onClick={handleConfirmBuy}
                        className="w-full py-3.5 rounded-2xl font-black text-base text-white transition-all active:scale-95 mb-2"
                        style={{ background: isGive ? 'linear-gradient(135deg, #EC4899, #DB2777)' : 'linear-gradient(135deg, #7C5CFC, #6344E0)', boxShadow: isGive ? '0 4px 14px rgba(236,72,153,0.35)' : '0 4px 14px rgba(124,92,252,0.35)' }}>
                        🎉 我要兑换！
                    </button>
                    <button onClick={() => setShowShopConfirmModal(false)}
                        className="w-full py-2.5 rounded-2xl font-bold text-xs transition-all" style={{ color: '#9CAABE' }}>
                        再想想
                    </button>
                </div>
            </div>
        </div>
    );
};
