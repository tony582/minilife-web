import React from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../../utils/Icons';
import { SPIRIT_FORMS } from '../../utils/spiritUtils';

export const LevelPrivilegeModal = ({ isOpen, onClose, activeKid, currentForm }) => {
    if (!isOpen || !activeKid || !currentForm) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300" 
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="bg-white w-full max-w-sm md:max-w-md rounded-[2rem] shadow-2xl relative flex flex-col max-h-[85vh] z-10 animate-scale-up overflow-hidden">
                
                {/* Header */}
                <div className="pt-6 px-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                    <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                        <Icons.Award className="text-indigo-500" />
                        MiniLife 特权图鉴
                    </h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                        <Icons.X size={18} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/50 p-6">
                    
                    {/* Current Status Box */}
                    <div className="bg-white p-5 rounded-[1.5rem] border-2 border-indigo-100 shadow-sm mb-6 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full blur-xl opacity-60"></div>
                        <div className="text-xs font-bold text-indigo-400 tracking-wider mb-2 uppercase">我的当前等阶</div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner text-white">
                                <Icons.Star size={24} fill="currentColor" strokeWidth={1} />
                            </div>
                            <div className="flex flex-col">
                                <div className="text-xl font-black text-slate-800">
                                    Lv.{activeKid.level} {currentForm.name}
                                </div>
                                <div className="text-xs text-slate-500 font-medium tracking-wide mt-0.5">
                                    {currentForm.desc}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline of All Forms */}
                    <div className="space-y-4">
                        <h4 className="font-black text-slate-400 text-sm tracking-widest pl-2 mb-2 uppercase">全等级特权一览</h4>
                        
                        {SPIRIT_FORMS.map((form) => {
                            const isCurrent = currentForm.id === form.id;
                            const isLocked = activeKid.level < form.minLevel;
                            
                            // Decide icon based on id
                            let FormIcon = Icons.User;
                            if (form.id === 'egg') FormIcon = Icons.Star;
                            if (form.id === 'sprout') FormIcon = Icons.Leaf;
                            if (form.id === 'young') FormIcon = Icons.BookOpen;
                            if (form.id === 'mature') FormIcon = Icons.GraduationCap;
                            if (form.id === 'ultimate') FormIcon = Icons.Gem;

                            return (
                                <div key={form.id} className={`p-5 rounded-[1.5rem] transition-all bg-white shadow-[0_4px_15px_rgb(0,0,0,0.02)] border relative overflow-hidden ${
                                    isCurrent ? 'border-indigo-400 ring-2 ring-indigo-50' : 
                                    isLocked ? 'border-slate-100 opacity-60 grayscale' : 'border-slate-100'
                                }`}>
                                    {/* Icon Title row */}
                                    <div className="flex justify-between items-center mb-3">
                                        <div className={`font-black flex items-center gap-2.5 ${isLocked ? 'text-slate-500' : 'text-slate-800'}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-inner ${
                                                isCurrent ? 'bg-indigo-100 text-indigo-500' : 
                                                isLocked ? 'bg-slate-100 text-slate-400' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                <FormIcon size={16} strokeWidth={2.5} />
                                            </div>
                                            {form.name} <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 rounded-md py-0.5">Lv.{form.minLevel} 起</span>
                                        </div>
                                        {isCurrent && <span className="text-[10px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded-md tracking-wider">当前</span>}
                                        {isLocked && <Icons.Lock size={14} className="text-slate-300" />}
                                    </div>
                                    
                                    {/* Privileges Row */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {form.interestBonus > 0 && (
                                            <div className="text-[11px] bg-teal-50 border border-teal-100 text-teal-600 px-2 py-1 rounded-lg font-bold flex gap-1 items-center shadow-sm">
                                                <Icons.TrendingUp size={12}/> 利息加成 +{form.interestBonus}%
                                            </div>
                                        )}
                                        {form.dailyBonus > 0 && (
                                            <div className="text-[11px] bg-orange-50 border border-orange-100 text-orange-600 px-2 py-1 rounded-lg font-bold flex gap-1 items-center shadow-sm">
                                                <Icons.Sparkles size={12}/> 每日额外奖励 +{form.dailyBonus}
                                            </div>
                                        )}
                                        {form.shopDiscount > 0 && (
                                            <div className="text-[11px] bg-purple-50 border border-purple-100 text-purple-600 px-2 py-1 rounded-lg font-bold flex gap-1 items-center shadow-sm">
                                                <Icons.Tag size={12}/> 商城尊享 {100 - form.shopDiscount}折
                                            </div>
                                        )}
                                        {(form.interestBonus === 0 && form.dailyBonus === 0 && form.shopDiscount === 0) && (
                                            <div className="text-[11px] text-slate-400 font-bold px-1">继续努力，升级解锁特权！</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
