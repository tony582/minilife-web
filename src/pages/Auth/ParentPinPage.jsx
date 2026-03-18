import React from 'react';
import { useToast } from '../../hooks/useToast';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons } from '../../utils/Icons';

export const ParentPinPage = () => {
    const { notify } = useToast();
    const { changeAppState, pinInput, setPinInput, parentSettings } = useUIContext();

    const handlePinClick = (num) => {
        if (pinInput.length < 4) {
            const newVal = pinInput + num;
            setPinInput(newVal);
            if (newVal.length === 4) {
                if (newVal === parentSettings.pinCode) {
                    setPinInput('');
                    changeAppState('parent_app');
                } else {
                    notify("家长密码错误！", "error");
                    setPinInput('');
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 animate-fade-in">
            <button onClick={() => { changeAppState('profiles'); setPinInput(''); }} className="absolute top-8 left-8 text-slate-400 flex items-center gap-2 hover:text-white"><Icons.ChevronLeft size={20} /> 返回角色选择</button>
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-6"><Icons.Lock size={32} /></div>
            <h2 className="text-white text-2xl font-black mb-8">输入家长 PIN 码</h2>
            <div className="flex gap-4 mb-12">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={`w-5 h-5 rounded-full ${i < pinInput.length ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-[280px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <button key={n} onClick={() => handlePinClick(n)} className="w-20 h-20 bg-slate-800 rounded-full text-white text-3xl font-bold hover:bg-slate-700 transition-colors flex items-center justify-center">{n}</button>
                ))}
                <div className="w-20 h-20"></div>
                <button onClick={() => handlePinClick(0)} className="w-20 h-20 bg-slate-800 rounded-full text-white text-3xl font-bold hover:bg-slate-700 transition-colors flex items-center justify-center">0</button>
                <button onClick={() => setPinInput(pinInput.slice(0, -1))} className="w-20 h-20 text-slate-400 flex items-center justify-center hover:text-white transition-colors"><Icons.X size={28} /></button>
            </div>
        </div>
    );
};
