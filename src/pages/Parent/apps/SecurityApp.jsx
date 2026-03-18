import React from 'react';
import { useUIContext } from '../../../context/UIContext.jsx';
import { useToast } from '../../../hooks/useToast';
import { Icons } from '../../../utils/Icons';

/**
 * SecurityApp - 后台安全锁
 * 开启/关闭家长密码锁，修改 PIN 码
 */
export const SecurityApp = () => {
    const { parentSettings, setParentSettings } = useUIContext();
    const { notify } = useToast();

    const handleSave = () => {
        notify("安全设置已保存", "success");
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Icons.Lock size={22} className="text-slate-600" /> 后台安全锁
            </h2>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                {/* 开关 */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-bold text-slate-800">开启家长密码锁</div>
                        <div className="text-xs text-slate-500 mt-1">防止孩子私自进入后台修改数据</div>
                    </div>
                    <button
                        onClick={() => setParentSettings(p => ({ ...p, pinEnabled: !p.pinEnabled }))}
                        className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors ${parentSettings.pinEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${parentSettings.pinEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>

                {/* PIN 输入 */}
                {parentSettings.pinEnabled && (
                    <div className="animate-fade-in">
                        <label className="block text-sm font-bold text-slate-700 mb-2">修改 4 位密码 (默认1234)</label>
                        <input
                            type="text"
                            maxLength={4}
                            value={parentSettings.pinCode}
                            onChange={e => setParentSettings(p => ({ ...p, pinCode: e.target.value.replace(/\D/g, '') }))}
                            className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl font-mono text-xl tracking-[1em] outline-none focus:border-indigo-500 text-center"
                        />
                    </div>
                )}

                {/* 保存 */}
                <button onClick={handleSave} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-colors shadow-lg active:scale-[0.98]">
                    完成设定
                </button>
            </div>
        </div>
    );
};
