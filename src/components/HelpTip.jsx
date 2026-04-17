import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../utils/Icons';

/**
 * HelpTip — 小问号帮助提示气泡
 * 
 * Usage:
 *   <HelpTip title="宝箱是什么？" content="完成任务和习惯打卡..." />
 *   <HelpTip title="..." content="..." emoji="🎁" />
 */

const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1',
    textPrimary: '#1B2E4B', textMuted: '#9CAABE',
    teal: '#4ECDC4', orange: '#FF8C42', purple: '#8B5CF6',
};

export const HelpTip = ({ title, content, emoji, size = 16, color, steps }) => {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            {/* Small ? button */}
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                className="inline-flex items-center justify-center rounded-full transition-all active:scale-90 hover:scale-110 flex-shrink-0"
                style={{
                    width: size + 4,
                    height: size + 4,
                    background: `${color || C.teal}15`,
                    color: color || C.teal,
                    border: `1px solid ${color || C.teal}30`,
                }}
                aria-label="帮助"
            >
                <Icons.HelpCircle size={size - 2} />
            </button>

            {/* Modal overlay directly rendered to body to avoid overflow hidden trapping */}
            {open && mounted && createPortal(
                <div
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-6 animate-fade-in"
                    style={{ background: 'rgba(27,46,75,0.3)', backdropFilter: 'blur(6px)' }}
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="relative max-w-sm w-full rounded-3xl overflow-hidden"
                        style={{
                            background: C.bgCard,
                            boxShadow: '0 25px 60px rgba(27,46,75,0.15)',
                            animation: 'helpBounceIn 0.35s ease-out forwards',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-6 pt-6 pb-4 flex items-start gap-3">
                            {emoji && <div className="text-3xl flex-shrink-0 mt-0.5">{emoji}</div>}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-black mb-0.5" style={{ color: C.textPrimary }}>
                                    {title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
                                style={{ background: C.bgLight, color: C.textMuted }}
                            >
                                <Icons.X size={16} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-6 pb-2">
                            {typeof content === 'string' ? (
                                <p className="text-sm font-medium leading-relaxed" style={{ color: '#5A6E8A' }}>
                                    {content}
                                </p>
                            ) : content}
                        </div>

                        {/* Steps guide */}
                        {steps && steps.length > 0 && (
                            <div className="px-6 pb-2 pt-2 space-y-2.5">
                                {steps.map((step, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 mt-0.5"
                                            style={{ background: color || C.teal }}
                                        >
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {step.emoji && <span className="mr-1">{step.emoji}</span>}
                                            <span className="text-xs font-bold" style={{ color: C.textPrimary }}>
                                                {step.title}
                                            </span>
                                            {step.desc && (
                                                <p className="text-[11px] font-medium mt-0.5" style={{ color: C.textMuted }}>
                                                    {step.desc}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="px-6 pt-3 pb-5">
                            <button
                                onClick={() => setOpen(false)}
                                className="w-full py-2.5 rounded-xl text-sm font-black text-white transition-all active:scale-[0.98]"
                                style={{ background: `linear-gradient(135deg, ${color || C.teal}, ${color || C.teal}DD)` }}
                            >
                                我知道了
                            </button>
                        </div>
                    </div>

                    <style>{`
                        @keyframes helpBounceIn {
                            0% { transform: scale(0.85) translateY(20px); opacity: 0; }
                            60% { transform: scale(1.02) translateY(-2px); opacity: 1; }
                            100% { transform: scale(1) translateY(0); opacity: 1; }
                        }
                    `}</style>
                </div>,
                document.body
            )}
        </>
    );
};

// ══════════════════════════════════
// Pre-defined help content library
// ══════════════════════════════════

export const HELP = {
    spirit: {
        title: '守护精灵是什么？',
        emoji: '🌱',
        color: '#10B981',
        content: '每个小朋友都有一只专属的守护精灵！完成学习任务和习惯打卡就能获得星尘（经验值），喂养精灵让它成长进化！',
        steps: [
            { emoji: '📚', title: '完成学习任务', desc: '每完成一个任务，就能获得星尘奖励' },
            { emoji: '🎯', title: '坚持习惯打卡', desc: '每天打卡也能获得星尘哦' },
            { emoji: '⬆️', title: '积累星尘升级', desc: '星尘攒够了就能升级，精灵也会慢慢进化' },
            { emoji: '✨', title: '精灵进化变强', desc: '精灵会从幼芽 → 成长 → 成熟 → 究极进化！' },
        ],
    },
    chest: {
        title: '宝箱怎么获得？',
        emoji: '🎁',
        color: '#D97706',
        content: '只要坚持每天打卡完成任务，累计打卡天数达到目标就能开启宝箱，获得额外的星尘奖励！',
        steps: [
            { emoji: '🟫', title: '铜宝箱 — 累计 3 天', desc: '刚开始的小奖励，10~30 星尘' },
            { emoji: '⬜', title: '银宝箱 — 累计 7 天', desc: '坚持一周！30~80 星尘' },
            { emoji: '🟨', title: '金宝箱 — 累计 14 天', desc: '两周了，真厉害！80~200 星尘' },
            { emoji: '🌈', title: '彩虹宝箱 — 累计 30 天', desc: '坚持一个月！200~500 星尘大奖' },
        ],
    },
    season: {
        title: '学期进度是什么？',
        emoji: '📚',
        color: '#EC4899',
        content: '学期进度条显示当前学期的时间进度，让你知道这个学期还剩多少天，加油冲刺吧！',
        steps: [
            { emoji: '🌸', title: '春季学期', desc: '2月~6月' },
            { emoji: '🌊', title: '暑假', desc: '7月~8月' },
            { emoji: '🍂', title: '秋季学期', desc: '9月~次年1月' },
            { emoji: '❄️', title: '寒假', desc: '1月~2月' },
        ],
    },
    stardust: {
        title: '星尘是什么？',
        emoji: '✨',
        color: '#4ECDC4',
        content: '星尘就是经验值！完成学习任务和习惯打卡都能获得星尘，用来喂养你的守护精灵，让它成长进化。',
        steps: [
            { emoji: '📚', title: '学习任务', desc: '完成爸爸妈妈布置的学习任务获得星尘' },
            { emoji: '🎯', title: '习惯打卡', desc: '每天坚持好习惯也能获得星尘' },
            { emoji: '🎁', title: '宝箱奖励', desc: '累计打卡开宝箱还能获得额外星尘' },
            { emoji: '⬆️', title: '升级精灵', desc: '星尘攒够自动升级，精灵也会进化' },
        ],
    },
    evolution: {
        title: '精灵怎么进化？',
        emoji: '🐉',
        color: '#8B5CF6',
        content: '精灵有 5 个进化阶段，每个阶段都有不同的特权加成！等级越高，精灵越强大哦！',
        steps: [
            { emoji: '🌱', title: '幼芽期 (Lv.1~5)', desc: '刚破壳的小精灵，跟着你一起冒险' },
            { emoji: '🐣', title: '成长期 (Lv.6~12)', desc: '利息+1%，每日+1家庭币' },
            { emoji: '🦊', title: '成熟期 (Lv.13~20)', desc: '利息+2%，每日+2，商城95折' },
            { emoji: '🐉', title: '究极进化 (Lv.21~30)', desc: '利息+5%，每日+3，商城90折' },
        ],
    },
    achievement: {
        title: '成就勋章怎么获得？',
        emoji: '🏆',
        color: '#F59E0B',
        content: '成就勋章是对你努力的认可！完成各种目标就能解锁对应的勋章，一共有 40 枚等你收集！',
        steps: [
            { emoji: '📚', title: '学习勋章 (6枚)', desc: '完成学习任务解锁' },
            { emoji: '🎯', title: '习惯勋章 (7枚)', desc: '坚持习惯打卡解锁' },
            { emoji: '💰', title: '理财勋章 (8枚)', desc: '赚钱存钱消费解锁' },
            { emoji: '⭐', title: '成长勋章 (7枚)', desc: '精灵升级解锁' },
            { emoji: '🎁', title: '收集勋章 (7枚)', desc: '开宝箱、精灵进化解锁' },
            { emoji: '📊', title: '纪录勋章 (5枚)', desc: '打破个人纪录解锁' },
        ],
    },
    almanac: {
        title: '精灵图鉴怎么玩？',
        emoji: '📖',
        color: '#FF8C42',
        content: '图鉴会记录你遇到过的所有精灵形态！等级越高解锁越多，试试集齐全部精灵吧！',
        steps: [
            { emoji: '🔓', title: '升级解锁', desc: '达到对应等级就能解锁新精灵' },
            { emoji: '❓', title: '神秘形态', desc: '未解锁的精灵会显示为"???"' },
            { emoji: '🌟', title: '满星精灵', desc: '达到 Lv.30 解锁最强形态' },
            { emoji: '🎁', title: '宝箱收集', desc: '累计打卡获得宝箱也记录在图鉴中' },
        ],
    },
    wealth: {
        title: '家庭币是什么？',
        emoji: <Icons.Star size={28} style={{ color: '#FFD93D', fill: '#FFD93D' }} />,
        color: '#FF8C42',
        content: '家庭币是你完成学习任务和习惯打卡获得的奖励！可以存起来赚取利息，或者在家庭超市里兑换心仪的商品！',
        steps: [
            { emoji: <Icons.BookOpen size={13} style={{ color: '#FF8C42', verticalAlign: '-2px', display: 'inline-block' }} />, title: '完成任务赚币', desc: '每完成一个日常任务就能获得家庭币' },
            { emoji: <Icons.Wallet size={13} style={{ color: '#4ECDC4', verticalAlign: '-2px', display: 'inline-block' }} />, title: '存进金库生息', desc: '星尘等级越高，每周利息加成越丰厚' },
            { emoji: <Icons.ShoppingBag size={13} style={{ color: '#F472B6', verticalAlign: '-2px', display: 'inline-block' }} />, title: '去超市兑换', desc: '攒够余额就可以去家庭超市兑换专属奖励' },
        ],
    },
    interest: {
        title: '利息是怎么算出的？',
        emoji: <Icons.TrendingUp size={28} style={{ color: '#4ECDC4' }} />,
        color: '#4ECDC4',
        content: '存放在财富中心的家庭币余额会自动为你产生利息，不需要你进行任何额外操作！',
        steps: [
            { emoji: <Icons.Activity size={13} style={{ color: '#10B981', verticalAlign: '-2px', display: 'inline-block' }} />, title: '自动生息', desc: '每天躺着也能赚家庭币，余额自动计算利息' },
            { emoji: <Icons.TrendingUp size={13} style={{ color: '#3B82F6', verticalAlign: '-2px', display: 'inline-block' }} />, title: '基础利率', desc: '由父母为你设定的固定周利率（比如每周2%）' },
            { emoji: <Icons.Sparkles size={13} style={{ color: '#EC4899', verticalAlign: '-2px', display: 'inline-block' }} />, title: '星尘等级加成', desc: '个人星尘等级越高，额外的利息加成越多' },
            { emoji: <Icons.Calendar size={13} style={{ color: '#F59E0B', verticalAlign: '-2px', display: 'inline-block' }} />, title: '周末收益发放', desc: '每周结算日的零点，利息会自动存入你的账户' },
        ],
    },
};
