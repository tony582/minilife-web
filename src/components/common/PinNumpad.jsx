import React, { useState } from 'react';
import { Icons } from '../../utils/Icons';

/**
 * PinNumpad — shared PIN input UI
 *
 * Props:
 *   pinCode    {string}    — the correct 4-digit PIN to match against
 *   onSuccess  {function}  — called when PIN matches
 *   onCancel   {function}  — called when user taps ✕ / back
 *   dark       {boolean}   — true = dark glass style (modal), false = full dark bg (page)
 */
export const PinNumpad = ({ pinCode, onSuccess, onCancel, dark = false }) => {
    const [input, setInput] = useState('');
    const [shake, setShake]   = useState(false);

    const handleDigit = (d) => {
        if (input.length >= 4) return;
        const next = input + d;
        if (next.length === 4) {
            if (next === String(pinCode)) {
                setInput('');
                onSuccess?.();
            } else {
                setShake(true);
                setTimeout(() => { setShake(false); setInput(''); }, 500);
            }
        } else {
            setInput(next);
        }
    };

    const btnStyle = {
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: 'pointer',
    };

    const digitBg   = dark ? 'rgba(255,255,255,0.08)' : '#1E293B';
    const digitHover = dark ? 'rgba(99,102,241,0.35)' : '#3730A3';

    return (
        <div className="flex flex-col items-center">
            {/* Dot indicators */}
            <div className={`flex gap-4 mb-8 ${shake ? 'animate-shake' : ''}`}>
                {[...Array(4)].map((_, i) => (
                    <div key={i}
                        className="w-4 h-4 rounded-full transition-all duration-200"
                        style={{
                            background: i < input.length
                                ? (shake ? '#EF4444' : '#6366F1')
                                : (dark ? 'rgba(255,255,255,0.15)' : '#334155'),
                            transform: i < input.length ? 'scale(1.25)' : 'scale(1)',
                            boxShadow: i < input.length && !shake ? '0 0 8px rgba(99,102,241,0.6)' : 'none',
                        }} />
                ))}
            </div>

            {/* Numpad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: 10 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <button key={n}
                        onClick={() => handleDigit(String(n))}
                        style={{ ...btnStyle, width: 72, height: 64, background: digitBg, borderRadius: 16 }}
                        onPointerDown={e => e.currentTarget.style.background = digitHover}
                        onPointerUp={e   => e.currentTarget.style.background = digitBg}
                        onPointerLeave={e => e.currentTarget.style.background = digitBg}
                        className="text-white text-2xl font-bold flex items-center justify-center transition-colors">
                        {n}
                    </button>
                ))}
                {/* Cancel / back */}
                <button onClick={() => onCancel?.()}
                    style={{ ...btnStyle, width: 72, height: 64, borderRadius: 16 }}
                    className="text-slate-400 flex items-center justify-center hover:text-white transition-colors">
                    <Icons.ChevronLeft size={22} />
                </button>
                {/* 0 */}
                <button onClick={() => handleDigit('0')}
                    style={{ ...btnStyle, width: 72, height: 64, background: digitBg, borderRadius: 16 }}
                    onPointerDown={e => e.currentTarget.style.background = digitHover}
                    onPointerUp={e   => e.currentTarget.style.background = digitBg}
                    onPointerLeave={e => e.currentTarget.style.background = digitBg}
                    className="text-white text-2xl font-bold flex items-center justify-center transition-colors">
                    0
                </button>
                {/* Backspace */}
                <button onClick={() => setInput(p => p.slice(0, -1))}
                    style={{ ...btnStyle, width: 72, height: 64, borderRadius: 16 }}
                    className="text-slate-400 flex items-center justify-center hover:text-white transition-colors">
                    <Icons.X size={22} />
                </button>
            </div>
        </div>
    );
};
