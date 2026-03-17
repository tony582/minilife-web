import React from 'react';

export const CelebrationModal = ({ data, onClose }) => {
    if (!data) return null;
    const isPositive = data.type === 'positive';
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-simple-fade">
            <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 text-center relative overflow-hidden shadow-2xl animate-scale-up border-[3px] border-white/50">
                <div className={`absolute top-0 left-0 right-0 h-40 opacity-20 blur-3xl ${isPositive ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-28 h-28 rounded-[2rem] flex items-center justify-center text-6xl mb-6 shadow-inner ${isPositive ? 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-500' : 'bg-gradient-to-br from-amber-50 to-orange-50 text-orange-500'}`}>
                        {isPositive ? '✨' : '🛡️'}
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-3">{isPositive ? '打卡成功！' : '勇敢坦白！'}</h2>
                    <p className="text-base text-slate-500 mb-8 leading-relaxed font-bold bg-slate-50 p-4 rounded-2xl">"{data.message}"</p>

                    <div className={`text-4xl font-black mb-8 flex items-baseline justify-center gap-1 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : '-'}{Math.abs(data.task.reward)} <span className="text-sm font-bold text-slate-400">家庭币</span>
                    </div>

                    <button type="button" onClick={onClose} className={`w-full py-4 rounded-2xl text-white font-black text-lg shadow-lg active:scale-95 transition-all outline-none ${isPositive ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-emerald-500/30 hover:shadow-emerald-500/50' : 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-orange-500/30 hover:shadow-orange-500/50'}`}>
                        {isPositive ? '继续保持' : '我知道了'}
                    </button>
                </div>
            </div>
        </div>
    );
};
