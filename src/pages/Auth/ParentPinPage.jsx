import React from 'react';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons } from '../../utils/Icons';
import { PinNumpad } from '../../components/common/PinNumpad.jsx';

export const ParentPinPage = () => {
    const { changeAppState, setPinInput, parentSettings } = useUIContext();

    return (
        <div className="min-h-[100dvh] bg-slate-900 flex flex-col items-center justify-center animate-fade-in"
            style={{ padding: 'max(1.5rem, env(safe-area-inset-top)) 1.5rem max(1.5rem, env(safe-area-inset-bottom))' }}>

            {/* Lock icon */}
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <Icons.Lock size={28} />
            </div>
            <h2 className="text-white text-xl font-black mb-8">输入家长 PIN 码</h2>

            <PinNumpad
                pinCode={parentSettings?.pinCode}
                onSuccess={() => { setPinInput(''); changeAppState('parent_app'); }}
                onCancel={() => { setPinInput(''); changeAppState('profiles'); }}
                dark={false}
            />
        </div>
    );
};
