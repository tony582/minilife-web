import React from 'react';
import { Icons } from '../../utils/Icons';

/**
 * AppGrid - 通用应用卡片网格组件
 * 
 * @param {Array} apps - 应用列表
 *   { id, icon, label, desc?, color, bgColor, onClick, badge? }
 */
export const AppGrid = ({ apps }) => {
    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
            {apps.map(app => (
                <button
                    key={app.id}
                    onClick={app.onClick}
                    className="group flex flex-col items-center gap-2.5 p-4 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all active:scale-95 text-center relative overflow-hidden"
                >
                    {/* Background glow */}
                    <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${app.bgColor || 'bg-indigo-100'}`}></div>

                    {/* Icon */}
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 relative z-10 ${app.bgColor || 'bg-indigo-50'} ${app.color || 'text-indigo-600'}`}>
                        {app.icon}
                    </div>

                    {/* Label */}
                    <div className="relative z-10">
                        <div className="font-bold text-xs sm:text-sm text-slate-700 group-hover:text-slate-900 transition-colors leading-tight">
                            {app.label}
                        </div>
                        {app.desc && (
                            <div className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">{app.desc}</div>
                        )}
                    </div>

                    {/* Badge */}
                    {app.badge && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] uppercase tracking-wider font-black rounded">
                            {app.badge}
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
};
