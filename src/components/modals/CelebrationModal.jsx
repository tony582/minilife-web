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

    // ── Spirit graduation celebration ──
    if (celebrationData.type === 'spirit_graduation') {
        const { kidName, graduatedSpirit, generation } = celebrationData;
        setTimeout(() => setCelebrationData(null), 8000);

        return (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" onClick={() => setCelebrationData(null)}>
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/90 via-indigo-900/85 to-black/90 backdrop-blur-xl"></div>
                <div className="relative text-center max-w-sm animate-pop-in">
                    {/* Floating emojis */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ height: '400px', top: '-100px' }}>
                        {['🎓', '🌟', '🎉', '✨', '🐉', '🥚', '🎊'].map((e, i) => (
                            <div key={i} className="absolute text-3xl animate-float"
                                style={{
                                    left: `${10 + i * 14}%`,
                                    animationDelay: `${i * 0.3}s`,
                                    animationDuration: `${3 + Math.random() * 2}s`,
                                    top: `${20 + Math.sin(i) * 30}%`,
                                }}>
                                {e}
                            </div>
                        ))}
                    </div>

                    {/* Main content */}
                    <div className="text-6xl mb-4">🎓</div>
                    <h2 className="text-2xl font-black text-white mb-2">
                        精灵毕业啦！
                    </h2>
                    <p className="text-lg text-amber-200 font-bold mb-4">
                        {kidName} 的第 {generation} 只精灵长大成人了！
                    </p>

                    {/* Graduated spirit card */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 mb-4 border border-white/20">
                        <div className="text-4xl mb-2">🐉👑</div>
                        <div className="text-white font-black text-lg">{graduatedSpirit.name}</div>
                        <div className="text-amber-300 text-sm font-bold">Lv.{graduatedSpirit.level} · 满星毕业</div>
                        <div className="text-white/50 text-xs mt-1">已加入精灵伙伴栏</div>
                    </div>

                    {/* New egg */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <div className="text-3xl mb-1">🥚✨</div>
                        <div className="text-white font-bold text-sm">新的精灵蛋已孵化！</div>
                        <div className="text-white/50 text-xs">第 {generation + 1} 只精灵的冒险即将开始...</div>
                    </div>

                    <p className="text-white/40 text-xs mt-5 animate-pulse">点击任意处关闭</p>
                </div>
                <style>{`
                    @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; } 50% { transform: translateY(-30px) rotate(10deg); opacity: 1; } }
                    .animate-float { animation: float 3s ease-in-out infinite; }
                `}</style>
            </div>
        );
    }

    // ── Chest open celebration ──
    if (celebrationData.type === 'chest_open') {
        const { kidName, chest, reward } = celebrationData;
        setTimeout(() => setCelebrationData(null), 6000);

        return (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 animate-fade-in"
                style={{ background: 'rgba(10,10,30,0.7)', backdropFilter: 'blur(12px)' }}
                onClick={() => setCelebrationData(null)}>

                {/* Gold sparkle particles */}
                {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="absolute rounded-full"
                        style={{
                            width: `${2 + Math.random() * 6}px`,
                            height: `${2 + Math.random() * 6}px`,
                            background: ['#FFD93D', '#FBBF24', '#F59E0B', '#D97706', '#FF8C42', '#4ECDC4'][i % 6],
                            top: `${20 + Math.random() * 60}%`,
                            left: `${10 + Math.random() * 80}%`,
                            animation: `chestSparkle ${0.8 + Math.random() * 1.5}s ease-in-out infinite ${Math.random() * 1.5}s`,
                            opacity: 0,
                        }} />
                ))}

                <div className="relative max-w-sm w-full rounded-3xl p-8 text-center"
                    style={{
                        background: `linear-gradient(135deg, #1a1a2e, #16213e)`,
                        boxShadow: `0 0 80px ${chest.glow}, 0 25px 60px rgba(0,0,0,0.4)`,
                        animation: 'chestCardAppear 0.6s ease-out forwards',
                    }}
                    onClick={e => e.stopPropagation()}>

                    {/* Radial glow */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                        <div className="absolute top-[-40%] left-[-20%] w-[140%] h-[140%] rounded-full opacity-30"
                            style={{ background: `radial-gradient(circle, ${chest.color || '#FBBF24'}, transparent 60%)` }}></div>
                    </div>

                    <div className="relative z-10">
                        {/* Chest emoji with shake animation */}
                        <div className="text-7xl mb-4" style={{
                            animation: 'chestShake 0.8s ease-in-out 0.3s, chestOpen 0.5s ease-out 1.1s forwards',
                        }}>
                            {chest.emoji}
                        </div>

                        {/* Light burst */}
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full"
                            style={{
                                background: `radial-gradient(circle, rgba(255,215,0,0.4), transparent 70%)`,
                                animation: 'lightBurst 0.6s ease-out 1.3s forwards',
                                opacity: 0,
                                transform: 'scale(0)',
                            }}></div>

                        <div className="text-2xl font-black text-white mb-1"
                            style={{ textShadow: `0 0 20px ${chest.glow}`, animation: 'fadeInUp 0.5s ease-out 1.5s both' }}>
                            🎁 {chest.name}开启！
                        </div>
                        <div className="text-sm font-bold mb-5 text-white/50"
                            style={{ animation: 'fadeInUp 0.5s ease-out 1.7s both' }}>
                            {kidName} 累计打卡达成 {chest.condition}
                        </div>

                        {/* Reward display */}
                        <div className="flex justify-center gap-3 mb-4" style={{ animation: 'fadeInUp 0.5s ease-out 1.9s both' }}>
                            <div className="rounded-2xl px-6 py-3"
                                style={{ background: 'rgba(78,205,196,0.15)', border: '1px solid rgba(78,205,196,0.2)' }}>
                                <div className="text-2xl font-black" style={{ color: '#4ECDC4' }}>
                                    +{reward.dust} ✨
                                </div>
                                <div className="text-[9px] font-bold text-white/40 mt-1">星尘奖励</div>
                            </div>
                        </div>

                        <div className="text-[10px] font-bold text-white/25">
                            点击任意位置关闭
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes chestSparkle {
                        0%, 100% { opacity: 0; transform: scale(0) translateY(0); }
                        50% { opacity: 0.9; transform: scale(1.2) translateY(-15px); }
                    }
                    @keyframes chestCardAppear {
                        0% { transform: scale(0.7); opacity: 0; }
                        60% { transform: scale(1.05); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes chestShake {
                        0%, 100% { transform: rotate(0deg); }
                        15% { transform: rotate(-8deg); }
                        30% { transform: rotate(8deg); }
                        45% { transform: rotate(-6deg); }
                        60% { transform: rotate(6deg); }
                        75% { transform: rotate(-3deg); }
                        90% { transform: rotate(3deg); }
                    }
                    @keyframes chestOpen {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.3); }
                        100% { transform: scale(1.1); }
                    }
                    @keyframes lightBurst {
                        0% { opacity: 0; transform: translate(-50%, 0) scale(0); }
                        50% { opacity: 0.8; transform: translate(-50%, 0) scale(1.5); }
                        100% { opacity: 0; transform: translate(-50%, 0) scale(2); }
                    }
                    @keyframes fadeInUp {
                        0% { opacity: 0; transform: translateY(15px); }
                        100% { opacity: 1; transform: translateY(0); }
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
