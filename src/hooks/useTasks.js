import { apiFetch } from '../api/client';
import { getLevelReq } from '../utils/levelUtils';

// Helper function to get weekly completion count
export const getWeeklyCompletionCount = (task, kidId, currentDStr) => {
    const currentDt = new Date(currentDStr);
    const day = currentDt.getDay() || 7;
    const weekStartDt = new Date(currentDt);
    weekStartDt.setDate(currentDt.getDate() - day + 1);
    weekStartDt.setHours(0, 0, 0, 0);

    const weekEndDt = new Date(weekStartDt);
    weekEndDt.setDate(weekStartDt.getDate() + 6);
    weekEndDt.setHours(23, 59, 59, 999);

    let weeklyCount = 0;
    const hist = task.history || {};
    Object.keys(hist).forEach(dStr => {
        const histDt = new Date(dStr);
        if (histDt >= weekStartDt && histDt <= weekEndDt) {
            let entry = task.kidId === 'all' ? hist[dStr]?.[kidId] : hist[dStr];
            if (entry) {
                if (Array.isArray(entry)) {
                    weeklyCount += entry.filter(e => e.status === 'completed' || e.status === 'pending_approval' || e.status === 'in_progress').length;
                } else if (entry.status === 'completed' || entry.status === 'pending_approval' || entry.status === 'in_progress') {
                    weeklyCount += (entry.count || 1);
                }
            }
        }
    });
    return weeklyCount;
};

// === 额外约束检查: N次任务防刷限制 ===
export const checkPeriodLimits = (task, kidId, selectedDStr) => {
    if (!task) return { canSubmit: true };

    // Ensure habits are always checked for daily/weekly limits
    if (task.type === 'habit') {
        const hist = task.history || {};
        const entry = task.kidId === 'all' ? hist[selectedDStr]?.[kidId] : hist[selectedDStr];
        const todayCount = entry?.count || (entry?.status === 'completed' ? 1 : 0);

        if (task.habitType === 'daily_once' && todayCount >= 1) {
            return { canSubmit: false, reason: '今天已经完整打过卡啦！' };
        }
        const maxPerDay = task.periodMaxPerDay || 3;
        if (task.habitType === 'multiple') {
            if (task.periodMaxType === 'weekly') {
                const weekCount = getWeeklyCompletionCount(task, kidId, selectedDStr);
                if (weekCount >= maxPerDay) {
                    return { canSubmit: false, reason: `本周已达最高上限(${maxPerDay}次)啦！` };
                }
            } else {
                // Default to 'daily'
                if (todayCount >= maxPerDay) {
                    return { canSubmit: false, reason: `今天已达上限(${maxPerDay}次)啦！` };
                }
            }
        }
    }

    if (!task.repeatConfig) return { canSubmit: true };
    const rc = task.repeatConfig;
    if (!rc.type.includes('_1') && !rc.type.includes('_n')) return { canSubmit: true };

    const currentDt = new Date(selectedDStr);
    let periodStartDt, periodEndDt;

    if (rc.type.includes('week')) {
        const day = currentDt.getDay() || 7;
        periodStartDt = new Date(currentDt);
        periodStartDt.setDate(currentDt.getDate() - day + 1);
        periodStartDt.setHours(0, 0, 0, 0);

        periodEndDt = new Date(periodStartDt);
        periodEndDt.setDate(periodStartDt.getDate() + 6);
        periodEndDt.setHours(23, 59, 59, 999);
    } else if (rc.type.includes('month')) {
        periodStartDt = new Date(currentDt.getFullYear(), currentDt.getMonth(), 1);
        periodEndDt = new Date(currentDt.getFullYear(), currentDt.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    if (!periodStartDt) {
        return { canSubmit: true };
    }

    let periodCompletions = 0;
    let todayCompletions = 0;

    const hist = task.history || {};
    Object.keys(hist).forEach(dStr => {
        const histDt = new Date(dStr);
        if (histDt >= periodStartDt && histDt <= periodEndDt) {
            const entry = task.kidId === 'all' ? hist[dStr]?.[kidId] : hist[dStr];
            if (entry && (entry.status === 'completed' || entry.status === 'pending_approval' || entry.status === 'in_progress')) {
                const count = entry.count || 1;
                periodCompletions += count;
                if (dStr === selectedDStr) todayCompletions += count;
            }
        }
    });

    if (periodCompletions >= rc.periodTargetCount) {
        return { canSubmit: false, reason: `本周期已达成目标(${rc.periodTargetCount}次)啦！` };
    }
    if (todayCompletions >= rc.periodMaxPerDay) {
        return { canSubmit: false, reason: `今天已达上限(${rc.periodMaxPerDay}次)啦，改天再做吧～` };
    }

    return { canSubmit: true };
};

export const useTasks = (tasks, setTasks, kids, setKids, transactions, setTransactions, notify, playSuccessSound, setCelebrationData) => {

    const handleExpChange = async (kidId, expChange) => {
        const kid = kids.find(k => k.id === kidId);
        if (!kid) return;
        let newExp = kid.exp + expChange;
        let newLevel = kid.level;
        while (newExp >= getLevelReq(newLevel)) {
            newExp -= getLevelReq(newLevel);
            newLevel++;
            notify(`太棒了！${kid.name} 升到了 Lv.${newLevel}！`, "success");
        }
        while (newExp < 0 && newLevel > 1) {
            newLevel--;
            newExp += getLevelReq(newLevel);
            notify(`注意！${kid.name} 降到了 Lv.${newLevel}。`, "error");
        }
        if (newExp < 0 && newLevel === 1) newExp = 0;

        try {
            await apiFetch(`/api/kids/${kidId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ level: newLevel, exp: newExp }) });
            setKids(prevKids => prevKids.map(k => k.id === kidId ? { ...k, exp: newExp, level: newLevel } : k));
        } catch (e) { notify("网络请求失败", "error"); }
    };

    const getTaskStatusOnDate = (t, date, kidId) => {
        if (!t?.history) return 'todo';
        let entry = t.kidId === 'all' ? t.history[date]?.[kidId] : t.history[date];
        if (!entry) return 'todo';
        return Array.isArray(entry) ? (entry.length > 0 ? entry[0].status : 'todo') : (entry.status || 'todo');
    };

    const getTaskTimeSpent = (t, date, kidId) => {
        if (!t?.history) return null;
        if (t.kidId === 'all') return t.history[date]?.[kidId]?.timeSpent;
        return t.history[date]?.timeSpent;
    };

    const handleDeleteTask = async (id, setDeleteConfirmTask) => {
        try {
            await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
            setTasks(prev => prev.filter(t => t.id !== id));
            setDeleteConfirmTask(null);
            notify('任务已删除', 'success');
        } catch (e) {
            console.error(e);
            notify('删除失败', 'error');
        }
    };

    const handleAttemptSubmit = async (task, activeKidId, selectedDate, setTaskToSubmit) => {
        const limits = checkPeriodLimits(task, activeKidId, selectedDate);
        if (!limits.canSubmit) return notify(limits.reason, 'error');

        if (task.type === 'habit') {
            try {
                const hist = task.history || {};
                let newHistory = JSON.parse(JSON.stringify(hist));
                const newRecord = { status: 'completed', attemptId: `attempt_${Date.now()}_${activeKidId}_${Math.random().toString(36).substr(2, 5)}` };

                if (task.kidId === 'all') {
                    if (!newHistory[selectedDate]) newHistory[selectedDate] = {};
                    if (!newHistory[selectedDate][activeKidId]) newHistory[selectedDate][activeKidId] = [];
                    if (!Array.isArray(newHistory[selectedDate][activeKidId])) {
                        if (newHistory[selectedDate][activeKidId].status) newHistory[selectedDate][activeKidId] = [newHistory[selectedDate][activeKidId]];
                        else newHistory[selectedDate][activeKidId] = [];
                    }
                    newHistory[selectedDate][activeKidId].push(newRecord);
                } else {
                    if (!newHistory[selectedDate]) newHistory[selectedDate] = [];
                    if (!Array.isArray(newHistory[selectedDate])) {
                        if (newHistory[selectedDate].status) newHistory[selectedDate] = [newHistory[selectedDate]];
                        else newHistory[selectedDate] = [];
                    }
                    newHistory[selectedDate].push(newRecord);
                }
                // Optimistic UI updates
                setTasks(prev => prev.map(t => t.id === task.id ? { ...t, history: newHistory } : t));

                const targetKid = kids.find(k => k.id === activeKidId);
                let newExp = targetKid ? targetKid.exp : 0;
                let newBals = targetKid ? { ...targetKid.balances } : {};

                if (targetKid) {
                    const expDiff = Math.ceil((task.reward || 0) * 1.5);
                    newExp = Math.max(0, targetKid.exp + expDiff);
                    newBals = { ...targetKid.balances, spend: Math.max(0, targetKid.balances.spend + (task.reward || 0)) };
                    setKids(prev => prev.map(k => k.id === activeKidId ? { ...k, exp: newExp, balances: newBals } : k));
                }

                if (task.reward !== 0) {
                    setTransactions(prev => [
                        { id: `trans_${Date.now()}_coin`, kidId: activeKidId, type: task.reward > 0 ? 'income' : 'expense', amount: Math.abs(task.reward || 0), title: `记录成长: ${task.title}`, date: new Date().toISOString(), category: 'habit' },
                        { id: `trans_${Date.now()}_exp`, kidId: activeKidId, type: task.reward > 0 ? 'income' : 'expense', amount: Math.ceil(Math.abs(task.reward || 0) * 1.5), title: `记录成长: ${task.title}`, date: new Date().toISOString(), category: 'habit' },
                        ...prev
                    ]);
                }

                playSuccessSound();
                if (task.reward > 0) {
                    const messages = ["太棒了！你的坚持让家庭财富又增加啦！🌟", "自律的你，正在闪闪发光！✨", "一个小小的习惯，成就大大的未来！🚀", "付出总有回报，金币+1！💰", "保持良好的习惯，你是全家的骄傲！🏅"];
                    setCelebrationData({ task, message: messages[Math.floor(Math.random() * messages.length)], type: 'positive' });
                } else if (task.reward < 0) {
                    const messages = ["诚实是金！即使扣分，你的坦白也值得欣赏！🛡️", "知错能改，善莫大焉，下次一定能做好！💪", "勇敢承认错误，你已经赢了第一步！✨"];
                    setCelebrationData({ task, message: messages[Math.floor(Math.random() * messages.length)], type: 'negative' });
                } else {
                    notify("打卡成功！", "success");
                }

                // Await network sync to prevent poll from fetching stale data
                await apiFetch(`/api/tasks/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: newHistory }) });

                if (task.reward !== 0) {
                    await Promise.all([
                        apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kidId: activeKidId, type: task.reward > 0 ? 'income' : 'expense', amount: Math.abs(task.reward || 0), title: `记录成长: ${task.title}`, date: new Date().toISOString(), category: 'habit' }) }),
                        apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kidId: activeKidId, type: task.reward > 0 ? 'income' : 'expense', amount: Math.ceil(Math.abs(task.reward || 0) * 1.5), title: `记录成长: ${task.title}`, date: new Date().toISOString(), category: 'habit' }) })
                    ]);
                }

                if (targetKid) {
                    await apiFetch(`/api/kids/${activeKidId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ exp: newExp, balances: newBals }) });
                }

            } catch (e) {
                notify("网络请求失败", "error");
            }
        } else {
            setTaskToSubmit(task);
        }
    };

    const handleMarkHabitComplete = async (task, date) => {
        try {
            await apiFetch(`/api/tasks/${task.id}/history`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date, status: 'completed' }) });
            setTasks(prev => prev.map(t => {
                if (t.id === task.id) {
                    let dateHist = t.history?.[date] || [];
                    if (!Array.isArray(dateHist)) {
                        dateHist = dateHist.status ? [dateHist] : [];
                    }
                    const newEntry = { status: 'completed', attemptId: `kid_attempt_${Date.now()}` };
                    const newHist = { ...(t.history || {}), [date]: [...dateHist, newEntry] };
                    return { ...t, history: newHist };
                }
                return t;
            }));

            const targetKid = kids.find(k => k.id === task.kidId);
            if (!targetKid) return;

            if (task.type === 'habit') {
                if (task.reward > 0) {
                    // 1. Give Family Coins & Transaction (For Wealth Center)
                    const newTrans = {
                        id: `trans_${Date.now()}`,
                        kidId: task.kidId,
                        type: 'income',
                        amount: task.reward || 0,
                        title: `完成记录: ${task.title}`,
                        date: new Date().toISOString(),
                        category: 'habit'
                    };
                    await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTrans) });

                    const expGained = Math.ceil((task.reward || 0) * 1.5);
                    // 2. Give EXP & Transaction (For Growth Footprints)
                    const expTrans = {
                        id: `trans_${Date.now()}_exp`,
                        kidId: task.kidId,
                        type: 'income',
                        amount: expGained,
                        title: `完成记录: ${task.title}`,
                        date: new Date().toISOString(),
                        category: 'habit'
                    };
                    await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expTrans) });

                    setTransactions([newTrans, expTrans, ...transactions]);

                    const newBals = { ...targetKid.balances, spend: targetKid.balances.spend + task.reward };
                    await apiFetch(`/api/kids/${targetKid.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ balances: newBals }) });
                    setKids(prev => prev.map(k => k.id === targetKid.id ? { ...k, balances: newBals } : k));

                    await handleExpChange(task.kidId, expGained);

                    notify(`打卡成功！已奖励 ${targetKid.name} ${task.reward} 家庭币 和 ${expGained} 经验！`, "success");
                } else {
                    // Penalty: Deduct EXP and Coins
                    const absPenalty = Math.abs(task.reward);
                    const newBals = { ...targetKid.balances, spend: Math.max(0, targetKid.balances.spend - absPenalty) };
                    await apiFetch(`/api/kids/${targetKid.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ balances: newBals }) });
                    setKids(prev => prev.map(k => k.id === targetKid.id ? { ...k, balances: newBals } : k));

                    const expPenalty = Math.ceil(absPenalty * 1.5);

                    const refundTrans = {
                        id: `trans_${Date.now()}_penalty`,
                        kidId: task.kidId,
                        type: 'expense',
                        amount: absPenalty,
                        title: `违规扣分: ${task.title}`,
                        date: new Date().toISOString(),
                        category: 'habit'
                    };
                    const expRefundTrans = {
                        id: `trans_${Date.now()}_penalty_exp`,
                        kidId: task.kidId,
                        type: 'expense',
                        amount: expPenalty,
                        title: `违规扣分: ${task.title}`,
                        date: new Date().toISOString(),
                        category: 'habit'
                    };
                    await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(refundTrans) });
                    await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expRefundTrans) });
                    setTransactions(prev => [refundTrans, expRefundTrans, ...prev]);

                    await handleExpChange(task.kidId, -expPenalty);

                    notify(`已扣除 ${targetKid.name} ${absPenalty} 家庭币和 ${expPenalty} 经验。`, "error");
                }
            }
        } catch (e) { notify("网络请求失败", "error"); }
    };

    const handleRejectTask = async (task, dateStr, kidId, reason = '', editingTask, setEditingTask) => {
        try {
            const oldHistory = task.history && task.history[dateStr] && task.history[dateStr][kidId] ? task.history[dateStr][kidId] : {};

            // Revert state -> 'failed' instead of 'todo' so it stays logged but child can restart
            const histUpdates = { ...task.history };
            if (!histUpdates[dateStr]) histUpdates[dateStr] = {};
            histUpdates[dateStr] = {
                ...histUpdates[dateStr],
                [kidId]: { ...oldHistory, status: 'failed', rejectFeedback: reason } // preserve timeSpent and current note, add feedback
            };

            await apiFetch(`/api/tasks/${task.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: histUpdates })
            });

            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, history: histUpdates } : t));

            // Reverse reward/penalty if was previously completed
            if (oldHistory.status === 'completed') {
                const isStudy = task.type === 'study';
                let absReward = Math.abs(task.reward || 0);

                if (isStudy && absReward > 0) {
                    const targetKid = kids.find(k => String(k.id) === String(kidId));
                    if (targetKid) {
                        const newBal = Math.max(0, targetKid.balances.spend - absReward);

                        await apiFetch(`/api/kids/${kidId}`, {
                            method: 'PUT', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ balances: { ...targetKid.balances, spend: newBal } })
                        });
                        setKids(prev => prev.map(k => String(k.id) === String(kidId) ? { ...k, balances: { ...k.balances, spend: newBal } } : k));

                        // Create negative transaction to balance ledger
                        const refundTrans = {
                            id: `trans_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                            kidId: kidId,
                            type: 'expense',
                            amount: absReward,
                            title: `未达标撤回: ${task.title}`,
                            date: new Date().toISOString(),
                            category: 'task'
                        };
                        await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(refundTrans) });
                        setTransactions([refundTrans, ...transactions]);
                    }
                } else if (!isStudy) {
                    const absReward = Math.abs(task.reward || 0);
                    const targetKid = kids.find(k => String(k.id) === String(kidId));
                    if (targetKid) {
                        if (task.reward > 0) {
                            // Reverse positive habit logic: Deduct Coins & EXP
                            const newBal = Math.max(0, targetKid.balances.spend - absReward);
                            const newExp = Math.max(0, targetKid.exp - Math.ceil(absReward * 1.5));

                            await apiFetch(`/api/kids/${kidId}`, {
                                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ balances: { ...targetKid.balances, spend: newBal }, exp: newExp })
                            });
                            setKids(prev => prev.map(k => String(k.id) === String(kidId) ? { ...k, balances: { ...k.balances, spend: newBal }, exp: newExp } : k));

                            // Negative reversed transaction
                            const refundTrans = {
                                id: `trans_${Date.now()}_reversed_coin`,
                                kidId: kidId,
                                type: 'expense',
                                amount: absReward,
                                title: `违规撤回记录: ${task.title}`,
                                date: new Date().toISOString(),
                                category: 'task'
                            };
                            const expRefundTrans = {
                                id: `trans_${Date.now()}_reversed_exp`,
                                kidId: kidId,
                                type: 'expense',
                                amount: Math.ceil(absReward * 1.5),
                                title: `违规撤回记录: ${task.title}`,
                                date: new Date().toISOString(),
                                category: 'habit'
                            };
                            await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(refundTrans) });
                            await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expRefundTrans) });
                            setTransactions([refundTrans, expRefundTrans, ...transactions]);
                        } else {
                            // Reverse penalty: Refund Coins & EXP
                            const newBal = targetKid.balances.spend + absReward;
                            const newExp = targetKid.exp + Math.ceil(absReward * 1.5);

                            await apiFetch(`/api/kids/${kidId}`, {
                                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ balances: { ...targetKid.balances, spend: newBal }, exp: newExp })
                            });
                            setKids(prev => prev.map(k => String(k.id) === String(kidId) ? { ...k, balances: { ...k.balances, spend: newBal }, exp: newExp } : k));

                            // Positive refund transaction
                            const refundTrans = {
                                id: `trans_${Date.now()}_refund_coin`,
                                kidId: kidId,
                                type: 'income',
                                amount: absReward,
                                title: `补偿撤销扣分: ${task.title}`,
                                date: new Date().toISOString(),
                                category: 'task'
                            };
                            const expRefundTrans = {
                                id: `trans_${Date.now()}_refund_exp`,
                                kidId: kidId,
                                type: 'income',
                                amount: Math.ceil(absReward * 1.5),
                                title: `补偿撤销扣分: ${task.title}`,
                                date: new Date().toISOString(),
                                category: 'habit'
                            };
                            await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(refundTrans) });
                            await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expRefundTrans) });
                            setTransactions([refundTrans, expRefundTrans, ...transactions]);
                        }
                    }
                }
            } 

            if (editingTask && editingTask.id === task.id) {
                if (setEditingTask) setEditingTask({ ...task, history: histUpdates });
            }

            notify(oldHistory.status === 'completed' ? "已打回为不达标状态，并撤回相关奖励！" : "已打回为不达标状态", "success");
        } catch (e) {
            console.error(e);
            notify("操作失败", "error");
        }
    };

    const handleApproveTask = async (task, date, actualKidId) => {
        try {
            // Write to Transaction Table First
            const newTrans = {
                id: `trans_${Date.now()}`,
                kidId: actualKidId, // Note: must use actualKidId in case of unified 'all' tasks
                type: 'income',
                amount: task.reward || 0,
                title: `完成: ${task.title}`,
                date: new Date().toISOString(),
                category: 'task'
            };
            if (task.reward > 0) {
                await apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTrans) });
                setTransactions([newTrans, ...transactions]);
            }

            // Then Update Task History
            const histUpdate = { status: 'completed' };
            let newHistory = { ...(task.history || {}) };

            if (task.kidId === 'all') {
                newHistory[date] = { ...(newHistory[date] || {}), [actualKidId]: { ...(newHistory[date]?.[actualKidId] || {}), ...histUpdate } };
            } else {
                newHistory[date] = { ...(newHistory[date] || {}), ...histUpdate };
            }

            await apiFetch(`/api/tasks/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: newHistory }) });
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, history: newHistory } : t));

            // Increase Balances & EXP
            const kid = kids.find(k => k.id === actualKidId);
            if (kid && task.reward > 0) {
                const newBals = { ...kid.balances, spend: kid.balances.spend + task.reward };

                // NEW DUAL REWARDS LOGIC: Parent Approval gives EXP
                const expGained = Math.ceil(task.reward * 1.5);
                let newExp = kid.exp + expGained;
                let newLevel = kid.level;

                // Manual fast-forward level loop for combined backend call
                while (newExp >= getLevelReq(newLevel)) {
                    newExp -= getLevelReq(newLevel);
                    newLevel++;
                    notify(`太棒了！${kid.name} 升到了 Lv.${newLevel}！`, "success");
                }

                await apiFetch(`/api/kids/${actualKidId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ balances: newBals, exp: newExp, level: newLevel }) });
                setKids(prevKids => prevKids.map(k => k.id === actualKidId ? { ...k, balances: newBals, exp: newExp, level: newLevel } : k));

                notify(`已审批！奖励 ${task.reward} 家庭币和 ${expGained} 经验值！`, "success");
            }
        } catch (e) { notify("网络请求失败", "error"); }
    };

    const handleApproveAllTasks = async (approvalsList) => {
        if (!approvalsList || approvalsList.length === 0) return;

        try {
            const timestamp = Date.now();
            let newTransactions = [];
            let kidRewardTotals = {}; // Map of kidId -> total reward
            let taskUpdates = {}; // Map of taskId -> newHistory

            // 1. Process all approvals logically
            for (let i = 0; i < approvalsList.length; i++) {
                const { task, date, actualKidId } = approvalsList[i];

                // Track rewards per kid
                if (task.reward > 0) {
                    kidRewardTotals[actualKidId] = (kidRewardTotals[actualKidId] || 0) + task.reward;
                    newTransactions.push({
                        id: `trans_${timestamp}_${i}`,
                        kidId: actualKidId,
                        type: 'income',
                        amount: task.reward || 0,
                        title: `完成: ${task.title}`,
                        date: new Date().toISOString(),
                        category: 'task'
                    });
                }

                // Compile task history updates
                if (!taskUpdates[task.id]) {
                    taskUpdates[task.id] = { ...(task.history || {}) };
                }
                const histUpdate = { status: 'completed' };
                if (task.kidId === 'all') {
                    taskUpdates[task.id][date] = { ...(taskUpdates[task.id][date] || {}), [actualKidId]: { ...(taskUpdates[task.id][date]?.[actualKidId] || {}), ...histUpdate } };
                } else {
                    taskUpdates[task.id][date] = { ...(taskUpdates[task.id][date] || {}), ...histUpdate };
                }
            }

            // 2. Execute Backend Calls
            const promises = [];
            // Post transactions
            for (const trans of newTransactions) {
                promises.push(apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(trans) }));
            }
            // Update tasks
            for (const taskId in taskUpdates) {
                promises.push(apiFetch(`/api/tasks/${taskId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: taskUpdates[taskId] }) }));
            }
            // Update kids balances and EXP
            for (const kidId in kidRewardTotals) {
                const kid = kids.find(k => k.id === kidId);
                if (kid) {
                    const newBals = { ...kid.balances, spend: kid.balances.spend + kidRewardTotals[kidId] };

                    const totalExpGained = Math.ceil(kidRewardTotals[kidId] * 1.5);
                    let newExp = kid.exp + totalExpGained;
                    let newLevel = kid.level;

                    while (newExp >= getLevelReq(newLevel)) {
                        newExp -= getLevelReq(newLevel);
                        newLevel++;
                    }

                    promises.push(apiFetch(`/api/kids/${kidId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ balances: newBals, exp: newExp, level: newLevel }) }));
                }
            }

            await Promise.all(promises);

            // 3. Update React State Bulk
            if (newTransactions.length > 0) {
                setTransactions(prev => [...newTransactions, ...prev]);
            }

            setTasks(prevTasks => prevTasks.map(t => {
                if (taskUpdates[t.id]) {
                    return { ...t, history: taskUpdates[t.id] };
                }
                return t;
            }));

            apiFetch('/api/kids').then(r => r.json()).then(setKids).catch(console.error); // Reload kids to get fresh balances across the board
            notify(`一键审批完成！共计发放了 ${Object.values(kidRewardTotals).reduce((a, b) => a + b, 0) || 0} 家庭币。`, "success");

        } catch (e) {
            notify("批量审批网络请求部分失败，请刷新页面查看最新状态", "error");
            console.error(e);
        }
    };

    return {
        handleExpChange,
        getTaskStatusOnDate,
        getTaskTimeSpent,
        handleDeleteTask,
        handleAttemptSubmit,
        handleMarkHabitComplete,
        handleRejectTask,
        handleApproveTask,
        handleApproveAllTasks
    };
};
