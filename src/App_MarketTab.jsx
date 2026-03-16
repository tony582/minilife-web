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
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-6">
                                        {[...inventory].filter(item => {
                                            if (mallSortByPrice === 'available') {
                                                const isMultiple = item.type === 'multiple';
                                                const maxAllowed = item.maxExchanges || 1;
                                                const periodBase = item.periodMaxType || 'lifetime';
                                                const boughtCount = orders.filter(o => {
                                                    if (o.kidId !== activeKidId || o.itemName !== item.name) return false;
                                                    if (!o.date) return true; // Legacy fallback
                                                    const orderDate = new Date(o.date);
                                                    const today = new Date();
                                                    if (periodBase === 'daily') return isSameDay(orderDate, today);
                                                    if (periodBase === 'weekly') {
                                                        const getWeek = (d) => {
                                                            const date = new Date(d.getTime());
                                                            date.setHours(0,0,0,0);
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
                                                return !reachedLimit && ((activeKid.balances[walletToCheck] || 0) >= item.price);
                                            }
                                            return true;
                                        }).sort((a,b) => {
                                            if (mallSortByPrice === 'asc') return a.price - b.price;
                                            if (mallSortByPrice === 'desc' || mallSortByPrice === 'available') return b.price - a.price;
                                            return 0;
                                        }).map(item => (
                                            <div key={item.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all flex flex-col group cursor-pointer relative">
                                            {/* Top Banner/Badge */}
                                            <div className="absolute top-3 inset-x-3 flex justify-between items-start z-10 pointer-events-none">
                                                <div className={`text-[10px] font-black px-2 py-1 rounded-lg backdrop-blur-md shadow-sm border ${item.type === 'single' ? 'bg-orange-500/90 text-white border-orange-400' : item.type === 'multiple' ? 'bg-blue-500/90 text-white border-blue-400' : 'bg-purple-500/90 text-white border-purple-400'}`}>
                                                    {item.type === 'single' ? '单次兑换' : item.type === 'multiple' ? '多次兑换' : '永久特权'}
                                                </div>
                                            </div>

                                            {/* Image Area (Icon) */}
                                            <div className={`h-40 sm:h-48 flex items-center justify-center text-7xl sm:text-8xl relative overflow-hidden bg-gradient-to-br ${item.walletTarget === 'give' ? 'from-rose-100 to-pink-200' : item.type === 'privilege' ? 'from-purple-100 to-fuchsia-200' : 'from-indigo-50 to-blue-100'}`}>
                                                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
                                                <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover relative z-10 transform group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                                                ) : null}
                                                <div className={`transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 drop-shadow-xl relative z-10 ${item.image ? 'hidden' : ''}`}>
                                                    {item.iconEmoji}
                                                </div>
                                            </div>

                                            {/* Details Area */}
                                            <div className="p-3 sm:p-5 flex flex-col flex-1 bg-white">
                                                <h3 className="font-black text-slate-800 text-base sm:text-lg line-clamp-2 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                                                <p className="text-slate-400 text-xs sm:text-sm mb-4 flex-1 line-clamp-2 leading-relaxed">{item.desc}</p>
                                                
                                                <div className={`mt-auto pt-2.5 pb-2.5 px-3 sm:px-4 ${item.walletTarget === 'give' ? 'bg-rose-50 border border-rose-200 shadow-inner rounded-2xl mx-1 mb-1' : 'border-t border-slate-50'}`}>
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex flex-col flex-1 min-w-0 pr-1">
                                                            <span className={`text-[10px] font-bold mb-0.5 truncate ${item.walletTarget === 'give' ? 'text-rose-500' : 'text-slate-400'}`}>{item.walletTarget === 'give' ? (item.charityTarget ? `💖 ${item.charityTarget}` : '需要消耗') : '售价'}</span>
                                                            <div className={`flex items-baseline gap-1 mt-0.5 ${item.walletTarget === 'give' ? 'text-rose-600' : 'text-yellow-500'}`}>
                                                                {item.walletTarget === 'give' ? <Icons.Heart size={14} className="fill-rose-500 text-rose-500" /> : <Icons.Star size={14} className="fill-yellow-500 text-yellow-500" />}
                                                                <span className="text-lg sm:text-2xl font-black tracking-tight leading-none">{item.price}</span>
                                                            </div>
                                                        </div>
                                                        {(() => {
                                                            const isMultiple = item.type === 'multiple';
                                                            const maxAllowed = item.maxExchanges || 1;
                                                            const periodBase = item.periodMaxType || 'lifetime';
                                                            const boughtCount = orders.filter(o => {
                                                                if (o.kidId !== activeKidId || o.itemName !== item.name) return false;
                                                                if (!o.date) return true;
                                                                const orderDate = new Date(o.date);
                                                                const today = new Date();
                                                                if (periodBase === 'daily') return isSameDay(orderDate, today);
                                                                if (periodBase === 'weekly') {
                                                                    const getWeek = (d) => {
                                                                        const date = new Date(d.getTime());
                                                                        date.setHours(0,0,0,0);
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
                                                                                                        <button disabled className={`px-4 h-10 sm:h-12 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm cursor-not-allowed ${item.walletTarget === 'give' ? 'bg-rose-100 text-rose-300' : 'bg-slate-100 text-slate-400'}`}>
                                                                                                            已达上限
                                                                                                        </button>
                                                                                                    );
                                                                                                }

                                                                                                return (
                                                                                                    <button 
                                                                                                        onClick={(e) => { e.stopPropagation(); handleBuyItem(item); }}
                                                                                                        className={`px-4 h-10 sm:h-12 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex-shrink-0 ${item.walletTarget === 'give' ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200' : 'bg-[#FF6B6B] hover:bg-[#ff5252] text-white shadow-[#FF6B6B]/20'}`}
                                                                                                    >
                                                                                                        兑换
                                                                                                    </button>
                                                                                                );
                                                                                            })()}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                                                                <div className="flex justify-between items-center mb-4 sm:mb-6">
                                                                    <h3 className="font-black text-slate-800 text-lg flex items-center gap-2"><Icons.Package size={18} className="text-slate-500" /> 我的订单</h3>
                                                                </div>
                                                                {orders.filter(o => o.kidId === activeKidId && (orderFilterStatus === 'all' || o.status === orderFilterStatus)).length === 0 ? (
                                                                    <div className="text-center text-slate-400 font-bold py-12 bg-slate-50 rounded-2xl">
                                                                        <Icons.FileText size={32} className="mx-auto mb-3 opacity-20" />
                                                                        暂无相关订单
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                                                                        {orders.filter(o => o.kidId === activeKidId && (orderFilterStatus === 'all' || o.status === orderFilterStatus))
                                                                            .sort((a,b) => {
                                                                                if (orderSortByDate === 'desc') return new Date(b.date) - new Date(a.date);
                                                                                return new Date(a.date) - new Date(b.date);
                                                                            })
                                                                            .map(o => (
                                                                            <div key={o.id} className="bg-slate-50 border border-slate-100 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-all">
                                                                                <div>
                                                                                    <div className="flex items-center gap-3 mb-2">
                                                                                        <div className="font-black text-slate-800 text-base">{o.itemName}</div>
                                                                                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${o.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                                                            {o.status === 'completed' ? '已核销' : '待核销'}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                                                                        <span className="flex items-center gap-1"><Icons.Clock size={12} /> {new Date(o.date).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                                                                        <span className="text-indigo-500">花费 {o.price} 币</span>
                                                                                        {o.status === 'shipping' && <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded ml-2 select-all flex items-center gap-1"><Icons.Key size={10} /> {o.redeemCode || o.id.replace('ORD-','')}</span>}
                                                                                    </div>
                                                                                </div>
                                                                                {o.status === 'completed' && !o.rating && (
                                                                                    <button onClick={() => { setReviewOrderId(o.id); setReviewStars(5); setReviewComment(""); setShowReviewModal(true); }} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 shrink-0">
                                                                                        评价晒单
                                                                                    </button>
                                                                                )}
                                                                                {o.status === 'completed' && o.rating > 0 && (
                                                                                    <div className="flex items-center gap-1 text-yellow-400 shrink-0">
                                                                                        {[...Array(5)].map((_, i) => <Icons.Star key={i} size={14} className={i < o.rating ? 'fill-yellow-400' : 'text-slate-200'} />)}
                                                                                    </div>
                                                                                )}

                                                                            </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };
    // --------------------------------------------------------------------------------
    // 7. Render App Skeleton (Bottom Navigation, Global Frame)
    // --------------------------------------------------------------------------------
    const renderParentApp = () => (
        <div className="min-h-screen bg-[#f4f7f9] font-sans pb-24 text-left animate-fade-in">
            <div className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center sticky top-0 z-[110]">
