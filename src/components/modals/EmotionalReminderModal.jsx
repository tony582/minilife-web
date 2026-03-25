import React, { useState, useEffect } from 'react';
import { Icons } from '../../utils/Icons';

export const EmotionalReminderModal = ({ context }) => {
    const {
        showEmotionalReminderModal, setShowEmotionalReminderModal,
        emotionalCooldownSeconds, setEmotionalCooldownSeconds
    } = context;

    // Handle countdown timer
    useEffect(() => {
        let timer;
        if (showEmotionalReminderModal && emotionalCooldownSeconds > 0) {
            timer = setInterval(() => {
                setEmotionalCooldownSeconds(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [showEmotionalReminderModal, emotionalCooldownSeconds]);

    if (!showEmotionalReminderModal) return null;

    const isAnger = typeof showEmotionalReminderModal === 'object' && showEmotionalReminderModal.type === 'anger';
    const modalBg = isAnger ? "bg-gradient-to-br from-rose-50 to-orange-50" : "bg-gradient-to-br from-indigo-50 to-sky-50";
    const iconBg = isAnger ? "from-rose-100 to-orange-100 border-rose-200 text-rose-500" : "from-indigo-100 to-sky-100 border-indigo-200 text-indigo-500";
    const quoteColor = isAnger ? "text-rose-700/80" : "text-indigo-700/80";
    const btnClass = emotionalCooldownSeconds > 0
        ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
        : "bg-slate-800 text-white shadow-xl shadow-slate-800/20 hover:scale-[1.02] active:scale-95";

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in pb-12">
            <div className={`w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center border-[4px] border-white/60 relative overflow-hidden isolate ${modalBg}`}>
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/40 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/40 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2"></div>

                <div className={`w-20 h-20 bg-gradient-to-br ${iconBg} rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-[3px] opacity-90 ${isAnger ? 'animate-pulse' : ''}`}>
                    {isAnger ? <Icons.Wind size={36} strokeWidth={2.5} /> : <Icons.Coffee size={36} strokeWidth={2.5} />}
                </div>

                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-snug font-serif">
                    {isAnger ? "深呼吸..." : "慢慢来..."}
                </h2>

                <div className="mt-6 relative">
                    <Icons.Quote size={40} className={`absolute -top-4 -left-2 opacity-10 ${quoteColor} -z-10`} />
                    <p className="text-[15px] font-medium text-slate-600 leading-relaxed text-justify px-2 relative z-10 text-pretty">
                        {isAnger
                            ? "也许此刻您感到生气和失望。但教育是一场漫长的修行，请试着给彼此一点时间，放下这一刻的严厉。\n\n也许，一个拥抱，一句鼓励，能让改变悄然发生。🌱"
                            : "连续的点击可能让孩子无所适从。陪伴的意义不仅在奖惩，多给孩子一些纯粹的关怀与鼓励吧。✨"
                        }
                    </p>
                </div>

                <button
                    disabled={emotionalCooldownSeconds > 0}
                    onClick={() => setShowEmotionalReminderModal(false)}
                    className={`w-full mt-8 py-4 rounded-2xl font-black transition-all duration-300 outline-none flex items-center justify-center gap-2 ${btnClass}`}
                >
                    {emotionalCooldownSeconds > 0 ? (
                        <><Icons.Hourglass size={18} className="animate-spin-slow" /> 等待 {emotionalCooldownSeconds}s</>
                    ) : (
                        isAnger ? "我冷静下来了" : "我知道了"
                    )}
                </button>
                {!emotionalCooldownSeconds && isAnger && <p className="text-[11px] text-slate-400 mt-3 font-bold">倒计时结束，您可以关闭窗口</p>}
            </div>
        </div>
    );
};
