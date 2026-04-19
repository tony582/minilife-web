import React, { useCallback } from 'react';
import { useToast } from '../../hooks/useToast';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons } from '../../utils/Icons';

export const ParentPinPage = () => {
    const { notify } = useToast();
    const { changeAppState, pinInput, setPinInput, parentSettings } = useUIContext();

    const handlePinInput = useCallback((num) => {
        setPinInput(prev => {
            if (prev.length >= 4) return prev;
            const newVal = prev + num;
            if (newVal.length === 4) {
                if (newVal === parentSettings?.pinCode) {
                    changeAppState('parent_app');
                    return '';
                } else {
                    notify('家长密码错误！', 'error');
                    return '';
                }
            }
            return newVal;
        });
    }, [parentSettings, changeAppState, notify, setPinInput]);

    const handleDelete = useCallback(() => {
        setPinInput(prev => prev.slice(0, -1));
    }, [setPinInput]);

    // onPointerDown fires immediately on iOS (no 300ms click delay)
    const btnProps = (action) => ({
        onPointerDown: (e) => { e.preventDefault(); action(); },
        style: {
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            userSelect: 'none',
            WebkitUserSelect: 'none',
        }
    });

    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    return (
        <div className="min-h-[100dvh] bg-slate-900 flex flex-col items-center justify-center animate-fade-in"
            style={{ padding: 'max(1.5rem, env(safe-area-inset-top)) 1.5rem max(1.5rem, env(safe-area-inset-bottom))' }}>

            {/* Back button */}
            <button
                {...btnProps(() => { changeAppState('profiles'); setPinInput(''); })}
                className="absolute top-0 left-0 text-slate-400 flex items-center gap-1.5 hover:text-white transition-colors"
                style={{
                    ...btnProps(() => {}).style,
                    padding: 'max(1.5rem, env(safe-area-inset-top)) 1.5rem 1rem',
                    top: 0, left: 0,
                }}>
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
                        style={{ background: i < pinInput.length ? '#6366F1' : '#334155', transform: i < pinInput.length ? 'scale(1.2)' : 'scale(1)' }} />
                ))}
            </div>

            {/* Numpad — sized to fit any phone safely */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: '12px' }}>
                {digits.map(n => (
                    <button key={n}
                        {...btnProps(() => handlePinInput(String(n)))}
                        className="flex items-center justify-center rounded-full bg-slate-800 text-white text-2xl font-bold active:bg-slate-600 transition-colors"
                        style={{ ...btnProps(() => {}).style, width: 72, height: 72 }}>
                        {n}
                    </button>
                ))}

                {/* Empty cell */}
                <div style={{ width: 72, height: 72 }} />

                {/* 0 */}
                <button
                    {...btnProps(() => handlePinInput('0'))}
                    className="flex items-center justify-center rounded-full bg-slate-800 text-white text-2xl font-bold active:bg-slate-600 transition-colors"
                    style={{ ...btnProps(() => {}).style, width: 72, height: 72 }}>
                    0
                </button>

                {/* Delete */}
                <button
                    {...btnProps(handleDelete)}
                    className="flex items-center justify-center rounded-full text-slate-400 active:text-white transition-colors"
                    style={{ ...btnProps(() => {}).style, width: 72, height: 72 }}>
                    <Icons.X size={24} />
                </button>
            </div>
        </div>
    );
};
