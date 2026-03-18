import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Icons } from '../../utils/Icons';
import { apiFetch } from '../../api/client';

// Simple AvatarDisplay component (we can extract this fully later)
const AvatarDisplay = ({ avatar, className = '' }) => {
    if (!avatar) return <Icons.User className={`w-full h-full text-slate-300 p-2 ${className}`} />;
    if (avatar.type === 'emoji') {
        return <div className={`w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-indigo-50 leading-none to-purple-50 ${className}`}>{avatar.value || avatar.url}</div>;
    }
    return <img src={avatar.url || avatar.value} alt="avatar" className={`w-full h-full object-cover ${className}`} />;
};

export const ParentShopTab = () => {
    const {
        kids,
        orders,
        inventory, setInventory,
        searchShopKeyword, setSearchShopKeyword,
        setShowAddItemModal, setNewItem,
        orderHistoryFilterKid, setOrderHistoryFilterKid,
        orderHistoryFilterTime, setOrderHistoryFilterTime,
        setShowQrScanner,
        notify,
        handleVerifyOrder
    } = useAppContext();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Parent Fulfilling Orders Section */}
            {orders.filter(o => o.status === 'shipping').length > 0 && (
                <div className="bg-white rounded-[2rem] shadow-sm border border-orange-200 overflow-hidden">
                    <div className="p-6 border-b border-orange-100 bg-orange-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600"><Icons.CheckSquare size={20} /></div>
                            <div>
                                <h2 className="font-black text-slate-800 text-lg">核销中心 - 待处理兑换</h2>
                                <p className="text-xs text-slate-500 mt-0.5">请扫描孩子的二维码，或手动点击一键核销</p>
                            </div>
                        </div>
                        <button onClick={() => setShowQrScanner(true)} className="w-full sm:w-auto px-6 py-3 bg-indigo-500 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                            <Icons.Eye size={18} /> 打开扫码摄像头
                        </button>
                    </div>
                    <div className="p-4 sm:p-6 bg-white space-y-4">
                        {orders.filter(o => o.status === 'shipping').map(o => {
                            const kid = kids.find(k => k.id === o.kidId);
                            return (
                                <div key={o.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-slate-100 overflow-hidden shrink-0"><AvatarDisplay avatar={kid?.avatar} /></div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-slate-800">{kid?.name}</span>
                                                <span className="text-xs text-slate-400">待核销</span>
                                            </div>
                                            <div className="font-black text-indigo-600 text-lg mt-0.5">{o.itemName}</div>
                                            <div className="text-[10px] text-slate-400 font-mono mt-1">单号: {o.id} | 核销码: <span className="text-slate-600 font-bold max-w-[80px] truncate inline-block align-bottom">{o.redeemCode || 'N/A'}</span></div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleVerifyOrder(o.id)}
                                        className="w-full md:w-auto px-6 py-3 bg-slate-800 text-white rounded-xl text-sm font-black shadow-lg shadow-slate-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Icons.Check size={18} /> 一键手动核销
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Existing Inventory Grid */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-purple-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                        <h2 className="font-black text-slate-800 text-xl">家庭超市货架配置</h2>
                        <p className="text-sm text-slate-500 mt-1">设置吸引人的奖励，激发孩子的动力</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64 shrink-0">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icons.Search size={16} className="text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="搜索商品名称..."
                                value={searchShopKeyword}
                                onChange={(e) => setSearchShopKeyword(e.target.value)}
                                className="w-full bg-white border border-slate-200 text-sm font-bold rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                            />
                            {searchShopKeyword && (
                                <button onClick={() => setSearchShopKeyword('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                                    <Icons.X size={14} />
                                </button>
                            )}
                        </div>
                        <button onClick={() => setShowAddItemModal(true)} className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-200 hover:scale-105 active:scale-95 transition-all whitespace-nowrap">
                            <Icons.Plus size={18} /> 添加愿望商品
                        </button>
                    </div>
                </div>
                <div className="p-4 sm:p-6 bg-slate-50/50">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                        {inventory.filter(item => !searchShopKeyword || item.name.toLowerCase().includes(searchShopKeyword.toLowerCase()) || (item.desc && item.desc.toLowerCase().includes(searchShopKeyword.toLowerCase()))).length === 0 ? (
                            <div className="col-span-full bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
                                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner"><Icons.SearchX size={28} /></div>
                                <div className="text-slate-500 font-bold mb-1">未找到相关商品</div>
                                <div className="text-slate-400 text-sm">尝试更换搜索词或添加新商品吧</div>
                            </div>
                        ) : (
                            inventory.filter(item => !searchShopKeyword || item.name.toLowerCase().includes(searchShopKeyword.toLowerCase()) || (item.desc && item.desc.toLowerCase().includes(searchShopKeyword.toLowerCase()))).map(item => (
                                <div key={item.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all flex flex-col group relative">
                                    {/* Top Banner/Badge */}
                                    <div className="absolute top-3 inset-x-3 flex justify-between items-start z-10 pointer-events-none">
                                        <div className={`text-[10px] font-black px-2 py-1 rounded-lg backdrop-blur-md shadow-sm border ${item.type === 'single' ? 'bg-orange-500/90 text-white border-orange-400' : item.type === 'multiple' ? 'bg-blue-500/90 text-white border-blue-400' : 'bg-purple-500/90 text-white border-purple-400'}`}>
                                            {item.type === 'single' ? '单次兑换' : item.type === 'multiple' ? '多次兑换' : '永久特权'}
                                        </div>
                                    </div>

                                    {/* Image Area (Icon) */}
                                    <div className={`h-32 sm:h-40 flex items-center justify-center text-6xl sm:text-7xl relative overflow-hidden bg-gradient-to-br ${item.walletTarget === 'give' ? 'from-rose-50 to-pink-100' : item.type === 'privilege' ? 'from-purple-50 to-fuchsia-100' : 'from-indigo-50 to-blue-50'}`}>
                                        <div className="absolute inset-0 bg-white/40 transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-700"></div>
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover relative z-10 transform group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                                        ) : null}
                                        <div className={`transform group-hover:scale-110 transition-transform duration-500 drop-shadow-md relative z-10 ${item.image ? 'hidden' : ''}`}>
                                            {item.iconEmoji}
                                        </div>
                                    </div>

                                    {/* Details Area */}
                                    <div className="p-4 sm:p-5 flex flex-col flex-1 bg-white">
                                        <h3 className="font-black text-slate-800 text-sm sm:text-base line-clamp-2 leading-tight mb-2 group-hover:text-purple-600 transition-colors">{item.name}</h3>
                                        <p className="text-slate-400 text-[11px] sm:text-xs mb-4 flex-1 line-clamp-2 leading-relaxed">{item.desc}</p>

                                        <div className="flex justify-between items-end mt-auto pt-3 border-t border-slate-50">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-slate-400 font-bold mb-0.5">{item.walletTarget === 'give' ? (item.charityTarget ? `❤️ ${item.charityTarget}` : '爱心基金') : '定价'}</span>
                                                <div className={`flex items-baseline gap-1 ${item.walletTarget === 'give' ? 'text-rose-500' : 'text-slate-700'}`}>
                                                    {item.walletTarget === 'give' && <Icons.Heart size={12} className="fill-rose-500" />}
                                                    <span className="text-lg sm:text-xl font-black tracking-tight">{item.price}</span>
                                                    <span className="text-[9px] sm:text-[10px] font-bold">{item.walletTarget === 'give' ? '' : '家庭币'}</span>
                                                </div>
                                            </div>

                                            {/* Admin Actions */}
                                            <div className="flex items-center gap-1.5 opacity-100 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setNewItem({ ...item, price: item.price.toString() }); setShowAddItemModal(true); }} className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-xl flex items-center justify-center transition-colors">
                                                    <Icons.Settings size={16} className="sm:w-5 sm:h-5" />
                                                </button>
                                                <button onClick={async () => {
                                                    if (!window.confirm(`确定要下架商品 【${item.name}】 吗？`)) return;
                                                    try {
                                                        await apiFetch(`/api/inventory/${item.id}`, { method: 'DELETE' });
                                                        setInventory(inventory.filter(i => i.id !== item.id));
                                                        notify("商品已下架", "success");
                                                    } catch (e) { notify("网络下架失败", "error"); }
                                                }} className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-rose-500 rounded-xl flex items-center justify-center transition-colors">
                                                    <Icons.Trash2 size={16} className="sm:w-5 sm:h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )))}
                        {inventory.filter(item => !searchShopKeyword || item.name.toLowerCase().includes(searchShopKeyword.toLowerCase()) || (item.desc && item.desc.toLowerCase().includes(searchShopKeyword.toLowerCase()))).length === 0 && (
                            <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-5 bg-white rounded-[2rem] border-2 border-slate-100 border-dashed flex flex-col items-center justify-center py-12 shadow-sm">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-3 grayscale opacity-50">🛒</div>
                                <div className="text-slate-400 font-bold text-sm">货架空空如也，快添加一些商品吧</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Order History Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mt-6">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500"><Icons.Clock size={20} /></div>
                        <div>
                            <h2 className="font-black text-slate-800 text-lg">兑换记录明细</h2>
                            <p className="text-xs text-slate-500 mt-0.5">查看孩子们的历史兑换及核销记录</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <select
                            value={orderHistoryFilterKid}
                            onChange={(e) => setOrderHistoryFilterKid(e.target.value)}
                            className="bg-white border text-sm font-bold border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 min-w-[120px]"
                        >
                            <option value="all">全部孩子</option>
                            {kids.map(k => (
                                <option key={k.id} value={k.id}>{k.name}</option>
                            ))}
                        </select>
                        <select
                            value={orderHistoryFilterTime}
                            onChange={(e) => setOrderHistoryFilterTime(e.target.value)}
                            className="bg-white border text-sm font-bold border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 min-w-[120px]"
                        >
                            <option value="7">最近 7 天</option>
                            <option value="30">最近 30 天</option>
                            <option value="all">全部时间</option>
                        </select>
                    </div>
                </div>
                <div className="p-4 sm:p-6 bg-white space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {(() => {
                        const filteredOrders = orders.filter(o => {
                            if (o.status !== 'completed') return false;
                            if (orderHistoryFilterKid !== 'all' && o.kidId !== orderHistoryFilterKid) return false;

                            if (orderHistoryFilterTime !== 'all') {
                                const daysNum = parseInt(orderHistoryFilterTime);
                                const orderDate = new Date(o.date);
                                const diffTime = Math.abs(new Date() - orderDate);
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                if (diffDays > daysNum) return false;
                            }
                            return true;
                        });

                        if (filteredOrders.length === 0) {
                            return (
                                <div className="text-center py-10">
                                    <Icons.FileText size={48} className="mx-auto text-slate-200 mb-3" />
                                    <p className="text-slate-400 font-bold text-sm">没有匹配的兑换记录</p>
                                </div>
                            );
                        }

                        return filteredOrders.map(o => {
                            const kid = kids.find(k => k.id === o.kidId);
                            return (
                                <div key={o.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-100 overflow-hidden shrink-0"><AvatarDisplay avatar={kid?.avatar} /></div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-700 text-sm">{kid?.name}</span>
                                                <span className="text-xs text-slate-400">核销了</span>
                                            </div>
                                            <div className="font-black text-slate-800">{o.itemName}</div>
                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{o.date}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 border-t md:border-t-0 border-slate-200 pt-3 md:pt-0">
                                        <div className="flex flex-col text-right">
                                            <span className="text-[10px] text-slate-400 font-bold mb-0.5">花费</span>
                                            <span className="font-black text-rose-500">{o.price} 金币</span>
                                        </div>
                                        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100 flex items-center gap-1 min-w-max">
                                            <Icons.CheckCircle size={12} /> 已核销
                                        </div>
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>
            </div>
        </div>
    );
};
