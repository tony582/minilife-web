import React from 'react';
import { Icons } from '../../utils/Icons';
import { QRCodeSVG } from 'qrcode.react';

export const QrZoomModal = ({ context }) => {
    const { qrModalValue, setQrModalValue } = context;

    if (!qrModalValue) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[300] flex items-center justify-center p-4 animate-fade-in" onClick={() => setQrModalValue(null)}>
            <div className="bg-white p-8 rounded-[3rem] shadow-2xl flex flex-col items-center transform transition-all scale-100 animate-bounce-in" onClick={e => e.stopPropagation()}>
                <div className="text-slate-500 font-bold mb-6 text-sm">出示给父母扫码核销</div>
                <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-100 shadow-inner">
                    <QRCodeSVG value={qrModalValue} size={240} level="H" fgColor="#334155" />
                </div>
                <div className="mt-8 text-xl font-black text-indigo-600 tracking-widest font-mono bg-indigo-50 px-6 py-2 rounded-xl">
                    {qrModalValue}
                </div>
                <button onClick={() => setQrModalValue(null)} className="mt-8 w-14 h-14 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-200 hover:text-slate-800 transition-colors">
                    <Icons.X size={24} />
                </button>
            </div>
        </div>
    );
};
