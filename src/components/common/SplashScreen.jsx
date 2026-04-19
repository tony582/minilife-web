import React, { useEffect, useState } from 'react';

/**
 * MiniLife SplashScreen
 * Shown while authLoading || isLoading is true.
 * Matches brand: Indigo-Purple gradient, warm orange accent, 让成长看得见 tagline.
 */
export const SplashScreen = () => {
    const [dots, setDots] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setDots(d => (d + 1) % 5), 500);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #0f3460 100%)' }}>

            {/* ── Floating ambient orbs ───────────────────────────────── */}
            <div style={{
                position: 'absolute', width: 340, height: 340,
                borderRadius: '50%', top: '-80px', left: '-80px',
                background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
                animation: 'floatA 6s ease-in-out infinite',
            }} />
            <div style={{
                position: 'absolute', width: 260, height: 260,
                borderRadius: '50%', bottom: '-60px', right: '-40px',
                background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
                animation: 'floatB 8s ease-in-out infinite',
            }} />
            <div style={{
                position: 'absolute', width: 180, height: 180,
                borderRadius: '50%', top: '40%', right: '10%',
                background: 'radial-gradient(circle, rgba(255,140,66,0.15) 0%, transparent 70%)',
                animation: 'floatC 5s ease-in-out infinite',
            }} />

            {/* ── Logo ────────────────────────────────────────────────── */}
            <div style={{ position: 'relative', marginBottom: 28 }}>
                {/* Glow ring */}
                <div style={{
                    position: 'absolute', inset: -12,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)',
                    animation: 'pulse 2.4s ease-in-out infinite',
                }} />
                <img
                    src="/minilife_logo.png"
                    alt="MiniLife"
                    style={{
                        width: 88, height: 88,
                        borderRadius: 24,
                        boxShadow: '0 8px 40px rgba(99,102,241,0.5)',
                        position: 'relative',
                        animation: 'logoFloat 3s ease-in-out infinite',
                    }}
                />
            </div>

            {/* ── Brand name ──────────────────────────────────────────── */}
            <div style={{
                fontWeight: 900, fontSize: 36, letterSpacing: '-0.5px',
                background: 'linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 40%, #818cf8 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: 8,
            }}>
                MiniLife
            </div>

            {/* ── Tagline ─────────────────────────────────────────────── */}
            <div style={{
                color: 'rgba(255,255,255,0.35)',
                fontSize: 13, letterSpacing: '0.18em',
                fontWeight: 500, marginBottom: 52,
            }}>
                让成长看得见 · Make Growth Visible
            </div>

            {/* ── Wave-dot loader ──────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{
                        width: 10, height: 10,
                        borderRadius: '50%',
                        background: i < dots
                            ? 'linear-gradient(135deg, #FF8C42, #FFB347)'
                            : 'rgba(255,255,255,0.2)',
                        transform: i < dots ? 'scale(1.3)' : 'scale(1)',
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        boxShadow: i < dots ? '0 0 8px rgba(255,140,66,0.6)' : 'none',
                    }} />
                ))}
            </div>

            {/* ── Keyframe animations (inline) ────────────────────────── */}
            <style>{`
                @keyframes floatA {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50%       { transform: translate(30px, 20px) scale(1.05); }
                }
                @keyframes floatB {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50%       { transform: translate(-20px, -30px) scale(1.08); }
                }
                @keyframes floatC {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50%       { transform: translate(15px, -20px) scale(0.95); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50%       { opacity: 1;   transform: scale(1.12); }
                }
                @keyframes logoFloat {
                    0%, 100% { transform: translateY(0px); }
                    50%       { transform: translateY(-6px); }
                }
            `}</style>
        </div>
    );
};
