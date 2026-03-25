import React from 'react';
import { Icons } from '../../utils/Icons';
import { Scanner } from '@yudiel/react-qr-scanner';

export const QrScannerModal = ({ context }) => {
    const {
        showQrScanner, setShowQrScanner,
        handleVerifyOrder
    } = context;

    if (!showQrScanner) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl relative overflow-hidden animate-spring-up p-6">
                <button onClick={() => setShowQrScanner(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full hover:bg-slate-100 transition-colors z-10"><Icons.X size={20} /></button>
                <div className="text-center mb-4 mt-2">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3"><Icons.Activity size={32} /></div>
                    <h2 className="text-xl font-black text-slate-800">核销二维码扫描</h2>
                    <p className="text-sm text-slate-500 mt-1">请让孩子出示兑换后的二维码</p>
                </div>
                <div className="rounded-2xl overflow-hidden bg-slate-100 border-4 border-slate-50 relative aspect-square flex items-center justify-center">
                    <Scanner
                        onScan={(result) => result && result.length > 0 && handleVerifyOrder(result[0].rawValue)}
                        onError={(error) => console.log(error?.message)}
                        components={{ audio: false }}
                        allowMultiple={true}
                        scanDelay={1000}
                    />
                </div>
                <p className="text-xs text-slate-400 text-center mt-4">如果无法唤起摄像头，请使用列表侧的"一键手动核销"</p>
            </div>
        </div>
    );
};
