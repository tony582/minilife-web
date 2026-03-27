export const isTaskDueOnDate = (task, dateStr) => {
    if (!task) return false;

    // 行为习惯暂时不过滤日期，除非未来专门改造
    if (task.type === 'habit') return true;

    const currentDt = new Date(dateStr);
    let jsDay = currentDt.getDay(); // 0 is Sunday, 1 is Monday...
    const d = jsDay === 0 ? 7 : jsDay; // Convert to 1=Mon ... 7=Sun

    // ================= V2: Advanced repeatConfig Algorithm =================
    if (task.repeatConfig) {
        const rc = task.repeatConfig;

        // 1. Boundary Checks
        // Skip startDate check for period tasks — they use their period window instead
        const isPeriod = rc.type?.includes('_1') || rc.type?.includes('_n');
        if (!isPeriod && task.startDate && dateStr < task.startDate) return false;
        if (rc.endDate && dateStr > rc.endDate) return false;

        // 2. Type-specific Resolution
        if (rc.type === 'today') {
            return task.dates?.includes(dateStr);
        }

        if (rc.type === 'daily') {
            return true;
        }

        if (rc.type === 'weekly_custom') {
            return rc.weeklyDays?.includes(d);
        }

        if (rc.type === 'biweekly_custom') {
            if (!rc.weeklyDays?.includes(d)) return false;
            const msPerDay = 24 * 60 * 60 * 1000;
            const startDt = new Date(task.startDate);
            // Calculate weeks elapsed since start date
            // Align startDt to the same day-of-week it started on, then find weeks diff
            const diffDays = Math.floor((currentDt - startDt) / msPerDay);
            const elapsedWeeks = Math.floor((diffDays + (startDt.getDay() === 0 ? 6 : startDt.getDay() - 1)) / 7);
            return elapsedWeeks % 2 === 0; // Only match even weeks matching start week
        }

        if (rc.type === 'ebbinghaus') {
            const msPerDay = 24 * 60 * 60 * 1000;
            const startDt = new Date(task.startDate);
            const diffDays = Math.floor((currentDt - startDt) / msPerDay);

            let sequence = [];
            if (rc.ebbStrength === 'normal') sequence = [0, 1, 2, 4, 7, 15, 30];
            else if (rc.ebbStrength === 'gentle') sequence = [0, 2, 6, 13, 29];
            else if (rc.ebbStrength === 'exam') sequence = [0, 1, 2, 4, 6, 9, 13];
            else if (rc.ebbStrength === 'enhanced') sequence = [0, 1, 2, 3, 4, 6, 9, 14, 29];

            return sequence.includes(diffDays);
        }

        // --- N-times per Period (N次等区间任务) ---
        // N次任务的核心在于：只要在被允许的日子（periodDaysType），并且当前周期的完成量没达标，就应该显示。
        // 目前 UI 上为了不造成混乱，把 "N次任务" 直接视作为每天在 "allowedDays" 内都显示
        // 我们将在组件内部计算这周是否已完成上限。此处 isTaskDueOnDate 仅返回“这一天是否合法候选日”。
        if (rc.type.includes('_1') || rc.type.includes('_n')) {
            // Determine if today is an allowed day for the period
            if (rc.periodDaysType === 'any') return true;
            if (rc.periodDaysType === 'workdays') return d >= 1 && d <= 5;
            if (rc.periodDaysType === 'weekends') return d === 6 || d === 7;
            if (rc.periodDaysType === 'custom') return rc.periodCustomDays?.includes(d);
            return true;
        }

        return false;
    }

    // ================= V1: Legacy Fallback =================
    // Still check endDate from repeatConfig if it was set by handleStopRecurring
    if (task.repeatConfig?.endDate && dateStr > task.repeatConfig.endDate) return false;
    if (task.frequency === '每天') return true;
    if (task.frequency === '仅当天') return task.dates?.includes(dateStr);
    if (task.frequency === '每周一至周五') return d >= 1 && d <= 5;
    if (task.frequency === '每周六、周日') return d === 6 || d === 7;

    if (task.startDate && dateStr >= task.startDate) {
        const msPerDay = 24 * 60 * 60 * 1000;
        const startDt = new Date(task.startDate);
        const diffDays = Math.floor((currentDt - startDt) / msPerDay);

        if (task.frequency === '每周一次') return diffDays % 7 === 0;
        if (task.frequency === '每双周') return diffDays % 14 === 0;
        if (task.frequency === '艾宾浩斯记忆法') return [0, 1, 2, 4, 7, 15, 30].includes(diffDays);
    }

    return task.dates?.includes(dateStr) || false;
};

/**
 * Calculate period progress for N-times-per-period tasks.
 * Returns null if the task is not a period task.
 */
export const getPeriodProgress = (task, kidId, dateStr) => {
    if (!task?.repeatConfig) return null;
    const rc = task.repeatConfig;
    if (!rc.type.includes('_1') && !rc.type.includes('_n')) return null;

    const currentDt = new Date(dateStr);
    let periodStartDt, periodEndDt, periodLabel;

    const isEvery = rc.type.includes('every_');
    if (rc.type.includes('month')) {
        periodStartDt = new Date(currentDt.getFullYear(), currentDt.getMonth(), 1);
        periodEndDt = new Date(currentDt.getFullYear(), currentDt.getMonth() + 1, 0, 23, 59, 59, 999);
        periodLabel = isEvery ? '每月' : '本月';
    } else if (rc.type.includes('biweek')) {
        // 本双周 = 固定14天窗口，两周共享同一个周期
        const day = currentDt.getDay() || 7;
        const thisMonday = new Date(currentDt);
        thisMonday.setDate(currentDt.getDate() - day + 1);
        thisMonday.setHours(0, 0, 0, 0);
        // Standard ISO week number: find Thursday of this week, count weeks from Jan 1
        const thu = new Date(thisMonday);
        thu.setDate(thisMonday.getDate() + 3); // Thursday
        const yearStart = new Date(thu.getFullYear(), 0, 1);
        const weekNum = Math.ceil((((thu - yearStart) / 86400000) + 1) / 7);
        // Odd week = biweek starts here; Even week = biweek started last Monday
        if (weekNum % 2 === 0) {
            periodStartDt = new Date(thisMonday);
            periodStartDt.setDate(thisMonday.getDate() - 7);
        } else {
            periodStartDt = new Date(thisMonday);
        }
        periodEndDt = new Date(periodStartDt);
        periodEndDt.setDate(periodStartDt.getDate() + 13);
        periodEndDt.setHours(23, 59, 59, 999);
        periodLabel = isEvery ? '每双周' : '本双周';
    } else {
        // weekly
        const day = currentDt.getDay() || 7;
        periodStartDt = new Date(currentDt);
        periodStartDt.setDate(currentDt.getDate() - day + 1);
        periodStartDt.setHours(0, 0, 0, 0);
        periodEndDt = new Date(periodStartDt);
        periodEndDt.setDate(periodStartDt.getDate() + 6);
        periodEndDt.setHours(23, 59, 59, 999);
        periodLabel = isEvery ? '每周' : '本周';
    }

    let periodCompletions = 0;
    let todayCount = 0;
    let periodFailed = false; // Track if any entry in period has failed status (for re-submit)
    const hist = task.history || {};
    Object.keys(hist).forEach(dStr => {
        const histDt = new Date(dStr);
        if (histDt >= periodStartDt && histDt <= periodEndDt) {
            const entry = task.kidId === 'all' ? hist[dStr]?.[kidId] : hist[dStr];
            if (entry && (entry.status === 'completed' || entry.status === 'pending_approval' || entry.status === 'failed')) {
                const count = entry.count || 1;
                periodCompletions += count;
                if (dStr === dateStr) todayCount += count;
                if (entry.status === 'failed') periodFailed = true;
            }
        }
    });

    const periodTarget = rc.periodTargetCount || 1;
    const dailyMax = rc.periodMaxPerDay || 1;
    const periodDone = periodCompletions >= periodTarget;
    const todayMaxed = todayCount >= dailyMax;

    return { periodCompletions, periodTarget, periodLabel, periodDone, todayCount, dailyMax, todayMaxed, periodFailed };
};
