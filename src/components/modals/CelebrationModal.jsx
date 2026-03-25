import React from 'react';
import { Icons } from '../../utils/Icons';

export const CelebrationModal = ({ celebrationData, setCelebrationData }) => {
    if (!celebrationData) return null;

    const isPositive = celebrationData.type === 'positive';
    const accent = isPositive ? '#4ECDC4' : '#FF6B6B';
    const bgGradient = isPositive
        ? 'linear-gradient(135deg, #E0FFF9 0%, #F0FFF4 100%)'
        : 'linear-gradient(135deg, #FFF0F0 0%, #FFF5F5 100%)';
    const emoji = isPositive ? '🎉' : '🛡️';
    const reward = celebrationData.task?.reward || 0;
    // Auto-dismiss after 3 seconds
    setTimeout(() => setCelebrationData(null), 3000);

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 animate-fade-in"
            style={{ background: 'rgba(27,46,75,0.25)', backdropFilter: 'blur(8px)' }}
            onClick={() => setCelebrationData(null)}>
            {/* Confetti particles */}
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="absolute w-2 h-2 rounded-full animate-bounce"
                    style={{
                        background: [accent, '#FFD93D', '#FF8C42', '#A78BFA', '#60A5FA'][i % 5],
                        top: `${10 + Math.random() * 30}%`,
                        left: `${10 + Math.random() * 80}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: `${0.6 + Math.random() * 0.8}s`,
                        opacity: 0.7,
                    }} />
            ))}
            <div className="relative max-w-sm w-full rounded-3xl p-8 text-center animate-bounce-in"
                style={{ background: bgGradient, boxShadow: `0 25px 60px ${accent}30` }}
                onClick={e => e.stopPropagation()}>
                {/* Top glow */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full opacity-30" style={{ background: accent, filter: 'blur(30px)' }}></div>

                <div className="text-6xl mb-4">{emoji}</div>
                <div className="text-xl font-black mb-2" style={{ color: '#1B2E4B' }}>
                    {isPositive ? '太棒了！' : '勇于坦白！'}
                </div>
                <div className="text-sm font-bold mb-4 leading-relaxed px-2" style={{ color: '#5A6E8A' }}>
                    {celebrationData.message}
                </div>

                {/* Reward badge */}
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-base"
                    style={{ background: `${accent}20`, color: accent }}>
                    {isPositive ? (
                        <><Icons.TrendingUp size={18} /> +{Math.abs(reward)} 家庭币</>
                    ) : (
                        <><Icons.TrendingDown size={18} /> -{Math.abs(reward)} 家庭币</>
                    )}
                </div>

                {/* Dismiss hint */}
                <div className="mt-4 text-[10px] font-bold" style={{ color: '#9CAABE' }}>
                    点击任意位置关闭
                </div>
            </div>
        </div>
    );
};
