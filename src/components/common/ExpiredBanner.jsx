import React from 'react';
import { Icons } from '../../utils/Icons';

/**
 * ExpiredBanner - 到期提醒横幅
 * 显示在页面顶部，引导用户续费
 */
export const ExpiredBanner = ({ onRenew }) => {
    return (
        <div
            className="sticky top-0 z-50 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white cursor-pointer select-none"
            style={{
                background: 'linear-gradient(135deg, #FF6B35, #FF8C42, #FFB347)',
                boxShadow: '0 2px 12px rgba(255,140,66,0.3)',
            }}
            onClick={onRenew}
        >
            <Icons.AlertCircle size={14} />
            <span>试用期已结束，部分功能受限</span>
            <span className="bg-white/25 px-2.5 py-0.5 rounded-full text-[11px] font-black backdrop-blur-sm">
                立即续费 →
            </span>
        </div>
    );
};
