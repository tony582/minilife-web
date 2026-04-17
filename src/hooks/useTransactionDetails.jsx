import React from 'react';
import { useDataContext } from '../context/DataContext.jsx';
import { Icons, renderIcon } from '../utils/Icons';
import { renderHabitIcon } from '../utils/habitIcons';
import { getIconForCategory, getCatHexColor } from '../utils/categoryUtils.js';

// Shared brand colors for consistent transaction visualization
const C = {
    teal: '#4ECDC4',
    coral: '#FF6B6B',
    green: '#10B981',
    pink: '#EC4899',
    orange: '#FF8C42',
    purple: '#7C5CFC',
    petPink: '#F472B6',  // Pet-exclusive warm pink
    gray: '#9CA3AF'      // Default fallback
};

export const useTransactionDetails = () => {
    const { tasks, shopItems } = useDataContext();

    return (tx) => {
        const isIncome = tx.type === 'income';
        const absAmount = Math.abs(Number(tx.amount || 0));
        const amountStr = `${isIncome ? '+' : '-'}${absAmount.toLocaleString()}`;
        const amountColor = isIncome ? C.green : C.coral;

        // Strip ALL known prefixes to get clean task title for matching
        let cleanTitle = tx.title || '交易记录';
        cleanTitle = cleanTitle
            .replace(/^记录成长:\s*/, '')
            .replace(/^购买:\s*/, '')
            .replace(/^完成:\s*/, '')
            .replace(/^未达标撤回:\s*/, '')
            .replace(/^待审批:\s*/, '')
            .replace(/^打回:\s*/, '')
            .replace(/^手动惩罚:\s*/, '')
            .replace(/^手动奖励:\s*/, '')
            .replace(/^奖励加分:\s*/, '')
            .replace(/^兑换商品:\s*/, '')
            .replace(/^兑换:\s*/, '')
            .replace(/^违规撤回记录:\s*/, '');

        let meta = {
            title: cleanTitle,
            label: isIncome ? '收入' : '支出',
            color: isIncome ? C.green : C.coral,
            iconClass: 'Wallet',
            customIconNode: null,
        };

        // Determine category from tx.category + title prefix patterns
        const cat = tx.category;
        const rawTitle = tx.title || '';

        if (cat === 'interest' || cleanTitle.includes('利息') || cleanTitle.includes('生息') || rawTitle.startsWith('✨')) {
            meta.label = '利息';
            meta.color = C.teal;
            meta.iconClass = 'Sparkles';
        } else if (cat === 'charity' || cat === 'give' || cleanTitle.includes('爱心') || cleanTitle.includes('公益') || cleanTitle.includes('捐')) {
            meta.label = '爱心';
            meta.color = C.pink;
            meta.iconClass = 'Heart';
        } else if (cat === 'pet') {
            meta.label = '宠物';
            meta.color = C.petPink;
            meta.iconClass = 'PawPrint';
        } else if (
            cat === 'purchase' || cat === 'shop' || cat === 'wish' ||
            rawTitle.startsWith('购买:') || rawTitle.startsWith('兑换商品:') || rawTitle.startsWith('兑换:')
        ) {
            meta.label = '商店';
            meta.color = C.purple;
            meta.iconClass = 'ShoppingBag';
            // Match by taskId (itemId) first, fallback to name
            const shopItem = (tx.taskId && shopItems?.find(s => s.id === tx.taskId)) || shopItems?.find(s => s.name === cleanTitle);
            if (shopItem && shopItem.icon) {
                meta.customIconNode = renderHabitIcon(shopItem.icon, null, 20);
            }
        } else if (rawTitle.startsWith('手动惩罚:')) {
            meta.label = '惩罚';
            meta.color = C.coral;
            meta.iconClass = 'ShieldAlert';
            // Use taskId to find the originating habit task
            const matchedTask = tx.taskId && tasks?.find(tk => tk.id === tx.taskId);
            if (matchedTask && matchedTask.iconEmoji) {
                meta.customIconNode = renderHabitIcon(matchedTask.iconEmoji, null, 18);
            }
        } else if (rawTitle.startsWith('手动奖励:') || rawTitle.startsWith('奖励加分:')) {
            meta.label = '奖励';
            meta.color = C.green;
            meta.iconClass = 'Gift';
            const matchedTask = tx.taskId && tasks?.find(tk => tk.id === tx.taskId);
            if (matchedTask && matchedTask.iconEmoji) {
                meta.customIconNode = renderHabitIcon(matchedTask.iconEmoji, null, 18);
            }
        } else if (cat === 'task' || rawTitle.startsWith('完成:') || rawTitle.startsWith('未达标撤回:')) {
            meta.label = '任务';
            meta.color = C.orange;
            meta.iconClass = 'CheckCircle';
            const matchedTask = (tx.taskId && tasks?.find(tk => tk.id === tx.taskId)) || tasks?.find(tk => tk.title === cleanTitle);
            if (matchedTask && matchedTask.category) {
                meta.iconClass = getIconForCategory(matchedTask.category);
                // label color stays orange (unified task theme), icon uses category icon
            }
        } else if (cat === 'habit' || rawTitle.startsWith('记录成长:') || rawTitle.startsWith('违规撤回记录:')) {
            meta.label = '习惯';
            meta.color = C.teal;
            meta.iconClass = 'Target';
            const matchedTask = (tx.taskId && tasks?.find(tk => tk.id === tx.taskId)) || tasks?.find(tk => tk.title === cleanTitle);
            if (matchedTask) {
                if (matchedTask.type === 'study' || matchedTask.type === 'task') {
                    meta.label = '任务';
                    meta.color = C.orange;
                    meta.iconClass = 'CheckCircle';
                    if (matchedTask.category) {
                        meta.iconClass = getIconForCategory(matchedTask.category);
                        // label color stays orange (unified task theme)
                    }
                } else {
                    // Real habit — show its Phosphor/emoji icon
                    const habitIcon = renderHabitIcon(matchedTask.iconEmoji, null, 18);
                    if (habitIcon && typeof habitIcon !== 'string') meta.customIconNode = habitIcon;
                    else if (typeof habitIcon === 'string' && habitIcon.length <= 4) {
                        meta.customIconNode = <span style={{ fontSize: 18 }}>{habitIcon}</span>;
                    }
                }
            }
        }

        // Render icon: if customIconNode exists use it (emoji/phosphor), else use iconClass with color
        meta.renderIcon = (size = 17, styleOverrides = {}) => {
            if (meta.customIconNode) {
                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color, fontSize: size, ...styleOverrides }}>
                         {meta.customIconNode}
                    </div>
                );
            }
            const IconCmp = Icons[meta.iconClass] || Icons.Star;
            return <IconCmp size={size} style={{ color: meta.color, ...styleOverrides }} />;
        };

        return { ...meta, isIncome, absAmount, amountStr, amountColor, tx };
    };
};
