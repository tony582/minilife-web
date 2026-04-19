import React from 'react';
import { useToast } from '../../hooks/useToast';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons } from '../../utils/Icons';

export const ParentPinPage = () => {
    const { notify } = useToast();
    const { changeAppState, pinInput, setPinInput, parentSettings } = useUIContext();

    const handlePinInput = (num) => {
        if (pinInput.length >= 4) return;
        const newVal = pinInput + num;
        if (newVal.length === 4) {
            // Check PIN — side effects OUTSIDE setState
            if (newVal === parentSettings?.pinCode) {
                setPinInput('');
                changeAppState('parent_app');
            } else {
                setPinInput('');
                notify('家长密码错误！', 'error');
            }
        } else {
            setPinInput(newVal);
        }
    };

    const handleDelete = () => setPinInput(pinInput.slice(0, -1));

    // touch-action: manipulation removes iOS 300ms click delay WITHOUT any onPointerDown tricks
    const btnStyle = {
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: 'pointer',
    };

    return (
        <div className="min-h-[100dvh] bg-slate-900 flex flex-col items-center justify-center animate-fade-in"
            style={{ padding: 'max(1.5rem, env(safe-area-inset-top)) 1.5rem max(1.5rem, env(safe-area-inset-bottom))' }}>

            {/* Back */}
            <button
                onClick={() => { changeAppState('profiles'); setPinInput(''); }}
                className="absolute top-0 left-0 text-slate-400 flex items-center gap-1.5 hover:text-white transition-colors"
                style={{ ...btnStyle, padding: 'max(1.5rem, env(safe-area-inset-top)) 1.5rem 1rem' }}>
                <Icons.ChevronLeft size={20} />
                <span className="text-sm font-semibold">返回</span>
            </button>

            {/* Lock icon */}
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-5">
                <Icons.Lock size={28} />
            </div>

            <h2 className="text-white text-xl font-black mb-8">输入家长 PIN 码</h2>

            {/* Dot indicators */}
            <div className="flex gap-5 mb-10">
                {[...Array(4)].map((_, i) => (
                    <div key={i}
                        className="w-4 h-4 rounded-full transition-all duration-200"
                        style={{
                            background: i < pinInput.length ? '#6366F1' : '#334155',
                            transform: i < pinInput.length ? 'scale(1.25)' : 'scale(1)',
                        }} />
                ))}
            </div>

            {/* Numpad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: 12 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <button key={n}
                        onClick={() => handlePinInput(String(n))}
                        style={{ ...btnStyle, width: 72, height: 72 }}
                        className="flex items-center justify-center rounded-full bg-slate-800 text-white text-2xl font-bold active:bg-indigo-700 transition-colors">
                        {n}
                    </button>
                ))}
                <div style={{ width: 72, height: 72 }} />
                <button
                    onClick={() => handlePinInput('0')}
                    style={{ ...btnStyle, width: 72, height: 72 }}
                    className="flex items-center justify-center rounded-full bg-slate-800 text-white text-2xl font-bold active:bg-indigo-700 transition-colors">
                    0
                </button>
                <button
                    onClick={handleDelete}
                    style={{ ...btnStyle, width: 72, height: 72 }}
                    className="flex items-center justify-center rounded-full text-slate-400 active:text-white transition-colors">
                    <Icons.X size={24} />
                </button>
            </div>
        </div>
    );
};
