import React, { useCallback } from 'react';
import { useSwipeBack } from '../../hooks/useSwipeBack';
import { Icons } from '../../utils/Icons';

export const AddItemModal = ({ context }) => {
    const {
        showAddItemModal, setShowAddItemModal,
        newItem, setNewItem,
        handleSaveNewItem,
        notify
    } = context;

    const emojis = ['🧸', '🎮', '🍔', '🍭', '🎢', '✈️', '📱', '📚', '🛡️', '🎟️', '❤️', '🎁'];
    const closeModal = useCallback(() => setShowAddItemModal(false), [setShowAddItemModal]);
    const { swipeRef, swipeHandlers } = useSwipeBack(closeModal, { enabled: showAddItemModal });

    if (!showAddItemModal) return null;

    const handleItemImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const maxFileSize = 5 * 1024 * 1024;
        if (file.size > maxFileSize) {
            notify("图片大小不能超过 5MB！", "error");
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 400;
                const MAX_HEIGHT = 400;
                let width = img.width;
                let height = img.height;
                if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
                else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const base64Str = canvas.toDataURL('image/jpeg', 0.85);
                setNewItem(prev => ({ ...prev, image: base64Str, iconEmoji: null }));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-fade-in overflow-y-auto pt-10 pb-20">
            <div ref={swipeRef} {...swipeHandlers}
                className="bg-white w-full max-w-sm sm:max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col mt-auto mb-auto border border-white/20 max-h-[85vh] sm:max-h-[90vh]">

                {/* Header */}
                <div className="bg-white p-4 sm:p-6 flex justify-between items-center text-slate-800 shrink-0 border-b border-slate-100 relative z-30 shadow-sm">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black mt-2 sm:mt-0 flex items-center gap-2">
                            {newItem.id ? '编辑愿望/商品' : '✨ 添加愿望/商品'}
                        </h2>
                        <div className="text-slate-500 text-sm mt-1 font-medium">配置可以供孩子兑换的奖励</div>
                    </div>
                    <button onClick={() => setShowAddItemModal(false)} className="bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 w-10 h-10 rounded-xl flex items-center justify-center transition-colors mt-2 sm:mt-0"><Icons.X size={20} /></button>
                </div>

                {/* Scrollable Content */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
                    {/* 1. 商品类型 */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">商品类型<span className="text-rose-500 ml-1">*</span></label>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-1">
                            <button onClick={() => setNewItem({ ...newItem, walletTarget: 'spend' })} className={`p-3 sm:p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${(newItem.walletTarget || 'spend') === 'spend' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-inner' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 bg-white'}`}>
                                <Icons.ShoppingBag size={18} />
                                <span className="font-bold text-xs sm:text-sm">普通商品 (零花钱)</span>
                            </button>
                            <button onClick={() => setNewItem({ ...newItem, walletTarget: 'give' })} className={`p-3 sm:p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${newItem.walletTarget === 'give' ? 'border-rose-400 bg-rose-50 text-rose-700 shadow-inner' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 bg-white'}`}>
                                <Icons.Heart size={18} />
                                <span className="font-bold text-xs sm:text-sm">公益愿望 (爱心基金)</span>
                            </button>
                        </div>
                        {newItem.walletTarget === 'give' && (
                            <div className="mt-2 p-3 sm:p-4 bg-rose-50/50 rounded-xl border border-rose-100 animate-slide-in">
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 sm:mb-3">这属于谁的愿望？</label>
                                <div className="flex flex-wrap gap-2">
                                    {['爸爸的愿望', '妈妈的愿望', '长辈的期盼', '爱心捐赠', '社会公益'].map(target => (
                                        <button key={target} onClick={() => setNewItem({ ...newItem, charityTarget: target })}
                                            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all border ${newItem.charityTarget === target ? 'bg-rose-500 text-white border-rose-500 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-rose-300 hover:text-rose-600'}`}>
                                            {target}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. 名称 */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">愿望名称<span className="text-rose-500 ml-1">*</span></label>
                        <input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="例如：乐高积木、游乐园门票..." className="w-full bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl px-4 py-3 sm:py-3.5 outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 font-medium transition-all text-sm mb-1" />
                    </div>

                    {/* 3. 价格 */}
                    <div>
                        <label className={`block text-sm font-bold mb-2 ${newItem.walletTarget === 'give' ? 'text-rose-700' : 'text-slate-700'}`}>
                            {newItem.walletTarget === 'give' ? '需要消耗多少爱心基金？' : '需要消耗多少家庭币？'}<span className="text-rose-500 ml-1">*</span>
                        </label>
                        <input type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} className={`w-full bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl px-4 py-3 sm:py-3.5 outline-none font-black text-lg sm:text-xl transition-all ${newItem.walletTarget === 'give' ? 'focus:ring-2 focus:ring-inset focus:ring-rose-500 text-rose-600' : 'focus:ring-2 focus:ring-inset focus:ring-yellow-500 text-yellow-600'}`} />
                    </div>

                    {/* 4. 图标/图片 */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-bold text-slate-700">商品图标 / 头像<span className="text-rose-500 ml-1">*</span></label>
                            {newItem.image && <span className="text-[10px] sm:text-xs font-bold text-indigo-500 bg-indigo-50 px-2 flex items-center h-6 rounded-md">自定义照片</span>}
                        </div>
                        <div className={`transition-opacity duration-300 ${newItem.image ? 'opacity-40 pointer-events-none' : 'opacity-100'} mb-2`}>
                            <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 flex flex-wrap gap-2 justify-center border border-slate-200/60 ring-1 ring-white inset-ring">
                                {emojis.map(e => (
                                    <button key={e} onClick={(ev) => { ev.preventDefault(); setNewItem({ ...newItem, iconEmoji: e, image: null }); }} className={`text-2xl sm:text-3xl w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl transition-all ${newItem.iconEmoji === e && !newItem.image ? 'bg-white shadow-md scale-110 ring-2 ring-indigo-400' : 'hover:scale-110 opacity-60 hover:opacity-100 grayscale-[0.2] hover:grayscale-0'}`}>
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {!newItem.image ? (
                            <label className="flex items-center justify-center w-full py-3 border-2 border-dashed border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all cursor-pointer group bg-white text-slate-400">
                                <div className="flex items-center justify-center gap-2">
                                    <Icons.Camera size={16} className="transition-colors" />
                                    <span className="text-xs sm:text-sm font-bold transition-colors">不想用默认图标？点击上传实物照片</span>
                                </div>
                                <input type="file" accept="image/*" onChange={handleItemImageUpload} className="hidden" />
                            </label>
                        ) : (
                            <div className="relative w-full h-32 sm:h-40 rounded-2xl overflow-hidden border border-slate-200 group shadow-sm">
                                <img src={newItem.image} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm">
                                    <label className="px-4 py-2 bg-white/20 hover:bg-white text-white hover:text-indigo-600 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-colors">
                                        更换照片
                                        <input type="file" accept="image/*" onChange={handleItemImageUpload} className="hidden" />
                                    </label>
                                    <button onClick={(e) => { e.preventDefault(); setNewItem({ ...newItem, image: null }); }} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-sm">
                                        删除，用回图标
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 5. 描述 */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">详细描述 <span className="text-slate-400 font-normal">(可选)</span></label>
                        <textarea value={newItem.desc} onChange={e => setNewItem({ ...newItem, desc: e.target.value })} placeholder="描述一下这个愿望的细节..." className="w-full bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl p-3 sm:p-4 outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-sm h-20 sm:h-24 resize-none transition-all placeholder:text-slate-400" />
                    </div>

                    {/* 6. 兑换设置 */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">兑换次数设置 <Icons.Info size={14} className="text-slate-400" /></label>
                        <div className="bg-slate-100 p-1 rounded-xl flex mb-1">
                            <button onClick={() => setNewItem({ ...newItem, type: 'single' })} className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all w-1/3 ${newItem.type === 'single' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>单场次</button>
                            <button onClick={() => setNewItem({ ...newItem, type: 'multiple', maxExchanges: newItem.maxExchanges || 1, periodMaxType: newItem.periodMaxType || 'daily' })} className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all w-1/3 ${newItem.type === 'multiple' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>多次</button>
                            <button onClick={() => setNewItem({ ...newItem, type: 'unlimited' })} className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all w-1/3 ${newItem.type === 'unlimited' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>永久</button>
                        </div>
                        {newItem.type === 'multiple' && (
                            <div className="mt-3 p-3 sm:p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 animate-slide-in space-y-3 sm:space-y-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-bold text-indigo-900/80 mb-2">限购周期</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[{ id: 'daily', label: '每天' }, { id: 'weekly', label: '每周' }, { id: 'monthly', label: '每月' }, { id: 'lifetime', label: '总共' }].map(period => (
                                            <button key={period.id} onClick={() => setNewItem({ ...newItem, periodMaxType: period.id })}
                                                className={`py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all border ${newItem.periodMaxType === period.id ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                                                {period.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-bold text-indigo-900/80 mb-2">该周期内最多可兑换几次？</label>
                                    <input type="number" min="1" value={newItem.maxExchanges || ''} onChange={e => setNewItem({ ...newItem, maxExchanges: parseInt(e.target.value) || 1 })}
                                        className="w-full bg-white border-0 ring-1 ring-inset ring-indigo-200 focus:ring-2 focus:ring-inset focus:ring-indigo-500 rounded-xl p-2.5 sm:p-3 outline-none font-black text-base sm:text-lg text-indigo-700 shadow-sm transition-all" />
                                    <p className="text-[10px] sm:text-xs text-indigo-400 mt-1.5 font-medium leading-relaxed">孩子在该周期内兑换满 {newItem.maxExchanges || 1} 次后，商品将暂时置灰不可通过购买。</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 sm:p-5 bg-white border-t border-slate-100 shrink-0 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
                    <div className="flex gap-2 sm:gap-3">
                        <button onClick={() => setShowAddItemModal(false)} className="w-[30%] sm:flex-1 py-3.5 sm:py-4 rounded-full sm:rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors text-sm sm:text-base">取消</button>
                        <button onClick={handleSaveNewItem} disabled={!newItem.name || !newItem.price || (!newItem.iconEmoji && !newItem.image)}
                            className="flex-1 py-3.5 sm:py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full sm:rounded-2xl font-black shadow-[0_8px_16px_-6px_rgba(79,70,229,0.4)] transition-all hover:shadow-[0_12px_20px_-8px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2 text-sm sm:text-base">
                            <Icons.Check size={20} strokeWidth={3} /> {newItem.id ? '保存修改' : '确认添加'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
