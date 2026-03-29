import React from 'react';
import { Icons } from '../../utils/Icons';

export const CelebrationModal = ({ celebrationData, setCelebrationData }) => {
    if (!celebrationData) return null;

    // ── Spirit evolution celebration ──
    if (celebrationData.type === 'spirit_evolution') {
        const { kidName, oldForm, newForm, newLevel } = celebrationData;
        setTimeout(() => setCelebrationData(null), 5000);

        return (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 animate-fade-in"
                style={{ background: 'rgba(10,10,30,0.6)', backdropFilter: 'blur(12px)' }}
                onClick={() => setCelebrationData(null)}>

                {/* Sparkle particles */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="absolute rounded-full"
                        style={{
                            width: `${3 + Math.random() * 5}px`,
                            height: `${3 + Math.random() * 5}px`,
                            background: ['#FFD93D', '#FF8C42', '#A78BFA', '#60A5FA', '#4ECDC4', '#EC4899'][i % 6],
                            top: `${5 + Math.random() * 90}%`,
                            left: `${5 + Math.random() * 90}%`,
                            animation: `sparkleParticle ${1 + Math.random() * 2}s ease-in-out infinite ${Math.random() * 2}s`,
                            opacity: 0,
                        }} />
                ))}

                <div className="relative max-w-sm w-full rounded-3xl p-8 text-center"
                    style={{
                        background: `linear-gradient(135deg, #1a1a2e, #16213e)`,
                        boxShadow: `0 0 60px ${newForm.glow}, 0 25px 60px rgba(0,0,0,0.3)`,
                        animation: 'evolveCard 0.6s ease-out forwards',
                    }}
                    onClick={e => e.stopPropagation()}>

                    {/* Background glow */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                        <div className="absolute top-[-50%] left-[-20%] w-[140%] h-[140%] rounded-full opacity-20"
                            style={{ background: `radial-gradient(circle, ${newForm.color}, transparent 60%)` }}></div>
                    </div>

                    <div className="relative z-10">
                        {/* Evolution transition */}
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="text-4xl opacity-40 line-through decoration-2"
                                style={{ textDecorationColor: 'rgba(255,255,255,0.3)' }}>
                                {oldForm.emoji}
                            </div>
                            <div className="text-white/30 text-xl animate-pulse">→</div>
                            <div className="text-6xl" style={{
                                animation: 'spiritEvolve 1s ease-out forwards',
                                filter: `drop-shadow(0 0 20px ${newForm.glow})`,
                            }}>
                                {newForm.emoji}
                            </div>
                        </div>

                        <div className="text-2xl font-black text-white mb-1"
                            style={{ textShadow: `0 0 20px ${newForm.glow}` }}>
                            ✨ 精灵进化了！
                        </div>
                        <div className="text-base font-black mb-1" style={{ color: newForm.color }}>
                            {newForm.name}
                        </div>
                        <div className="text-sm font-bold mb-4 text-white/50">
                            {kidName} 的精灵达到了 Lv.{newLevel}！
                        </div>
                        <div className="text-xs font-bold text-white/40 mb-4 px-4 leading-relaxed">
                            {newForm.desc}
                        </div>

                        {/* New privileges */}
                        <div className="flex justify-center gap-2 flex-wrap mb-4">
                            {newForm.interestBonus > 0 && (
                                <span className="text-[10px] font-black px-3 py-1.5 rounded-full"
                                    style={{ background: 'rgba(78,205,196,0.15)', color: '#4ECDC4' }}>
                                    💰 利息 +{newForm.interestBonus}%
                                </span>
                            )}
                            {newForm.dailyBonus > 0 && (
                                <span className="text-[10px] font-black px-3 py-1.5 rounded-full"
                                    style={{ background: 'rgba(255,140,66,0.15)', color: '#FF8C42' }}>
                                    🪙 每日 +{newForm.dailyBonus}
                                </span>
                            )}
                            {newForm.shopDiscount > 0 && (
                                <span className="text-[10px] font-black px-3 py-1.5 rounded-full"
                                    style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}>
                                    🏷 {100 - newForm.shopDiscount}折
                                </span>
                            )}
                        </div>

                        <div className="text-[10px] font-bold text-white/25">
                            点击任意位置关闭
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes sparkleParticle {
                        0%, 100% { opacity: 0; transform: scale(0) translateY(0); }
                        50% { opacity: 0.8; transform: scale(1) translateY(-20px); }
                    }
                    @keyframes evolveCard {
                        0% { transform: scale(0.8); opacity: 0; }
                        50% { transform: scale(1.05); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes spiritEvolve {
                        0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
                        50% { transform: scale(1.3) rotate(5deg); opacity: 1; }
                        100% { transform: scale(1) rotate(0deg); opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    // ── Original celebration (positive/negative rewards) ──
    const isPositive = celebrationData.type === 'positive';
    const accent = isPositive ? '#4ECDC4' : '#FF6B6B';
    const bgGradient = isPositive
        ? 'linear-gradient(135deg, #E0FFF9 0%, #F0FFF4 100%)'
        : 'linear-gradient(135deg, #FFF0F0 0%, #FFF5F5 100%)';
    const emoji = isPositive ? '🎉' : '🛡️';
    const reward = celebrationData.task?.reward || 0;
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
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full opacity-30" style={{ background: accent, filter: 'blur(30px)' }}></div>
                <div className="text-6xl mb-4">{emoji}</div>
                <div className="text-xl font-black mb-2" style={{ color: '#1B2E4B' }}>
                    {isPositive ? '太棒了！' : '勇于坦白！'}
                </div>
                <div className="text-sm font-bold mb-4 leading-relaxed px-2" style={{ color: '#5A6E8A' }}>
                    {celebrationData.message}
                </div>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-base"
                    style={{ background: `${accent}20`, color: accent }}>
                    {isPositive ? (
                        <><Icons.TrendingUp size={18} /> +{Math.abs(reward)} 家庭币</>
                    ) : (
                        <><Icons.TrendingDown size={18} /> -{Math.abs(reward)} 家庭币</>
                    )}
                </div>
                <div className="mt-4 text-[10px] font-bold" style={{ color: '#9CAABE' }}>
                    点击任意位置关闭
                </div>
            </div>
        </div>
    );
};
