import { getSpiritForm, isSpiritMaxStar } from './spiritUtils';

// ── 新等级公式 (平滑递增) ──
// EXP_needed(level) = 80 + (level - 1) × 20
// Lv.1=80, Lv.5=160, Lv.10=260, Lv.15=360, Lv.20=460, Lv.30=660
export const getLevelReq = (level) => 80 + (Math.max(1, level) - 1) * 20;

// ── 段位信息 (兼容旧代码接口) ──
// 从精灵形态推导段位，保持 getLevelTier 接口不变
export const getLevelTier = (level) => {
    const form = getSpiritForm(level);
    const maxStar = isSpiritMaxStar(level);
    return {
        title: maxStar ? '满星精灵' : form.name,
        emoji: maxStar ? '🌟' : form.emoji,
        bg: maxStar ? 'from-yellow-300 via-rose-400 to-fuchsia-500' : form.bg,
        color: `text-[${form.color}]`,
        form, // 附带完整形态对象
    };
};
