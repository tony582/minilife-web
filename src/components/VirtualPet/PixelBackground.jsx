import React, { useMemo } from 'react';

// ─── Sky configs per time phase ───────────────────────────────────────────────
const TIME_BG = {
    dawn: {
        sky: 'linear-gradient(to bottom, #1A0540 0%, #7B2D8B 30%, #E8602A 65%, #FAC26E 100%)',
        stars: 6,
        sun: { right: '22%', top: '80%', color: '#FDB45E', glow: '#FFCA80', size: 10 },
        moon: null,
        clouds: [{ x: 8, y: 20, s: 2.2 }, { x: 62, y: 30, s: 1.6 }],
        cloudColor: 'rgba(255,200,170,0.85)',
        cityColor: '#150330',
        lightColor: 'rgba(255,180,80,0.7)',
        horizonGlow: 'rgba(250,140,50,0.35)',
    },
    day: {
        sky: 'linear-gradient(to bottom, #2E9FE8 0%, #70C8F4 55%, #C0E8FF 100%)',
        stars: 0,
        sun: { right: '15%', top: '14%', color: '#FFE030', glow: '#FFF080', size: 14 },
        moon: null,
        clouds: [{ x: 6, y: 14, s: 2.8 }, { x: 50, y: 8, s: 2.2 }, { x: 74, y: 24, s: 1.8 }],
        cloudColor: 'rgba(255,255,255,0.95)',
        cityColor: '#3A7A36',
        lightColor: null,
        horizonGlow: null,
    },
    dusk: {
        sky: 'linear-gradient(to bottom, #100830 0%, #5A1E80 28%, #C84010 60%, #F46A28 100%)',
        stars: 10,
        sun: { right: '18%', top: '88%', color: '#FF5010', glow: '#FF8840', size: 10 },
        moon: null,
        clouds: [{ x: 12, y: 30, s: 2.0 }, { x: 65, y: 20, s: 1.5 }],
        cloudColor: 'rgba(255,150,80,0.6)',
        cityColor: '#1A0830',
        lightColor: 'rgba(255,140,50,0.7)',
        horizonGlow: 'rgba(248,100,40,0.45)',
    },
    night: {
        sky: 'linear-gradient(to bottom, #04080F 0%, #070E24 45%, #0A1438 100%)',
        stars: 38,
        sun: null,
        moon: { x: 70, y: 10, full: true },
        clouds: [],
        cloudColor: 'transparent',
        cityColor: '#030610',
        lightColor: 'rgba(60,100,255,0.5)',
        horizonGlow: null,
    },
    lateNight: {
        sky: 'linear-gradient(to bottom, #010203 0%, #040810 48%, #060C1C 100%)',
        stars: 60,
        sun: null,
        moon: { x: 55, y: 7, full: false },
        clouds: [],
        cloudColor: 'transparent',
        cityColor: '#010207',
        lightColor: 'rgba(30,60,200,0.4)',
        horizonGlow: null,
    },
};

// Pixel city building silhouette layout (x%, w%, h% within silhouette band)
const BUILDINGS = [
    { x: 0,  w: 9,  h: 70 },
    { x: 9,  w: 7,  h: 45 },
    { x: 16, w: 5,  h: 58 },
    { x: 21, w: 12, h: 90, antenna: true },
    { x: 33, w: 6,  h: 50 },
    { x: 39, w: 9,  h: 65 },
    { x: 48, w: 5,  h: 42 },
    { x: 53, w: 11, h: 80, antenna: true },
    { x: 64, w: 7,  h: 55 },
    { x: 71, w: 8,  h: 45 },
    { x: 79, w: 13, h: 72 },
    { x: 92, w: 8,  h: 52 },
];

// Deterministic "random" for stars
function makeStars(count) {
    let s = 12345;
    const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    return Array.from({ length: count }, () => ({
        x: rand() * 100,
        y: rand() * 62,
        size: rand() > 0.88 ? 2 : 1,
        alpha: 0.55 + rand() * 0.45,
        flicker: rand() > 0.7,
    }));
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Stars({ count }) {
    const stars = useMemo(() => makeStars(count), [count]);
    return (
        <div className="absolute inset-0 pointer-events-none">
            {stars.map((s, i) => (
                <div key={i} className={s.flicker ? 'animate-pulse' : ''}
                    style={{
                        position: 'absolute',
                        left: `${s.x}%`, top: `${s.y}%`,
                        width: s.size, height: s.size,
                        background: '#fff',
                        opacity: s.alpha,
                    }} />
            ))}
        </div>
    );
}

function PixelCloud({ x, y, s = 1, color }) {
    // 3×3 pixel cloud pattern (scaled)
    const px = 4 * s;
    return (
        <div className="absolute pointer-events-none" style={{ left: `${x}%`, top: `${y}%` }}>
            {/* Row 1 (top bump) */}
            <div style={{ position: 'absolute', left: px * 2, top: 0, width: px * 3, height: px, background: color }} />
            <div style={{ position: 'absolute', left: px * 5, top: 0, width: px * 2, height: px, background: color }} />
            {/* Row 2 */}
            <div style={{ position: 'absolute', left: 0, top: px, width: px, height: px, background: color }} />
            <div style={{ position: 'absolute', left: px, top: px, width: px * 8, height: px, background: color }} />
            {/* Row 3 (body) */}
            <div style={{ position: 'absolute', left: 0, top: px * 2, width: px * 9, height: px * 2, background: color }} />
            {/* invisible spacer to set bounding box */}
            <div style={{ width: px * 9, height: px * 4, opacity: 0 }} />
        </div>
    );
}

function PixelSun({ right, top, color, glow, size }) {
    return (
        <div className="absolute pointer-events-none" style={{ right, top, transform: 'translate(50%, -50%)' }}>
            {/* Glow halo */}
            <div style={{
                position: 'absolute',
                inset: -size,
                background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
                opacity: 0.7,
            }} />
            {/* Pixel sun body */}
            <div style={{
                width: size, height: size,
                background: color,
                boxShadow: `0 0 0 ${size / 2}px ${glow}40`,
                imageRendering: 'pixelated',
                position: 'relative',
            }} />
            {/* pixel "rays" — 4 small squares in cardinal directions */}
            {[[-size * 1.8, size * 0.4], [size * 1.4, size * 0.4], [size * 0.4, -size * 1.4], [size * 0.4, size * 1.8]].map(([rx, ry], i) => (
                <div key={i} style={{
                    position: 'absolute', top: ry, left: rx,
                    width: size / 2.5 | 0, height: size / 2.5 | 0,
                    background: glow, opacity: 0.85,
                }} />
            ))}
        </div>
    );
}

function PixelMoon({ x, y, full }) {
    return (
        <div className="absolute pointer-events-none" style={{ left: `${x}%`, top: `${y}%` }}>
            {full ? (
                // Full moon: bright square + glow
                <>
                    <div style={{
                        position: 'absolute', inset: -8,
                        background: 'radial-gradient(circle, rgba(230,220,160,0.35) 0%, transparent 70%)',
                    }} />
                    <div style={{ width: 12, height: 12, background: '#EEE0A0', imageRendering: 'pixelated', position: 'relative' }}>
                        {/* Moon craters (dark pixels) */}
                        <div style={{ position: 'absolute', left: 2, top: 3, width: 2, height: 2, background: 'rgba(0,0,0,0.15)' }} />
                        <div style={{ position: 'absolute', left: 7, top: 6, width: 2, height: 2, background: 'rgba(0,0,0,0.12)' }} />
                    </div>
                </>
            ) : (
                // Crescent: two overlapping squares
                <div style={{ position: 'relative', width: 10, height: 12 }}>
                    <div style={{ position: 'absolute', width: 10, height: 12, background: '#EEE0A0', imageRendering: 'pixelated' }} />
                    <div style={{ position: 'absolute', left: 4, top: -2, width: 10, height: 12, background: '#040810' }} />
                </div>
            )}
        </div>
    );
}

function CityLine({ color, lightColor }) {
    return (
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '28%' }}>
            {BUILDINGS.map((b, i) => (
                <div key={i} className="absolute bottom-0"
                    style={{ left: `${b.x}%`, width: `${b.w}%`, height: `${b.h}%`, background: color }}>
                    {/* Antenna */}
                    {b.antenna && (
                        <div style={{
                            position: 'absolute', top: '-15%', left: '45%',
                            width: '10%', height: '15%', background: color,
                        }} />
                    )}
                    {/* Windows (lit up at night) */}
                    {lightColor && Array.from({ length: 3 }).map((_, wi) => (
                        <div key={wi} style={{
                            position: 'absolute',
                            left: `${20 + wi * 25}%`, top: `${20 + (i % 3) * 20}%`,
                            width: '20%', height: '10%',
                            background: lightColor,
                        }} />
                    ))}
                </div>
            ))}
        </div>
    );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function PixelBackground({ timePhase = 'day' }) {
    const cfg = TIME_BG[timePhase] ?? TIME_BG.day;

    return (
        <div className="absolute inset-0 z-0 overflow-hidden select-none"
            style={{ background: cfg.sky, imageRendering: 'pixelated', opacity: 0.3 }}>

            {/* Horizon glow band */}
            {cfg.horizonGlow && (
                <div className="absolute left-0 right-0 pointer-events-none"
                    style={{
                        bottom: '26%', height: '20%',
                        background: `linear-gradient(to top, ${cfg.horizonGlow}, transparent)`,
                    }} />
            )}

            {/* Stars */}
            {cfg.stars > 0 && <Stars count={cfg.stars} />}

            {/* Sun */}
            {cfg.sun && <PixelSun {...cfg.sun} />}

            {/* Moon */}
            {cfg.moon && <PixelMoon x={cfg.moon.x} y={cfg.moon.y} full={cfg.moon.full} />}

            {/* Clouds */}
            {cfg.clouds.map((c, i) => (
                <PixelCloud key={i} x={c.x} y={c.y} s={c.s} color={cfg.cloudColor} />
            ))}

            {/* City silhouette */}
            <CityLine color={cfg.cityColor} lightColor={cfg.lightColor} />
        </div>
    );
}
