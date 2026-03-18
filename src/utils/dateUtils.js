export const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
};

export const formatDate = (date) => {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
};

export const getDisplayDateArray = (baseDate) => {
    const d = new Date(baseDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 调整以周一为一周的第一天
    const monday = new Date(d.setDate(diff));

    const weekDays = [];
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const dotsArray = ['text-orange-500', 'transparent', 'transparent', 'text-blue-400', 'text-green-500', 'text-green-500', 'text-green-500']; // 仅为了保留原先的点样式，实际可以根据有无任务计算

    for (let i = 0; i < 7; i++) {
        const current = new Date(monday);
        current.setDate(monday.getDate() + i);
        weekDays.push({
            d: dayNames[i],
            dateObj: current,
            dateStr: formatDate(current),
            displayDate: `${current.getMonth() + 1}/${current.getDate()}`,
            dot: dotsArray[i]
        });
    }
    return weekDays;
};

export const getWeekNumber = (d) => {
    // Ensure d is a Date object
    if (!(d instanceof Date)) {
        d = new Date(d);
    }
    // Create a copy to avoid mutating the original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return [d.getUTCFullYear(), weekNo];
};

export const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // 调整为周一为每周第一天

    // 填充前面的空白天数
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        days.push({ day: prevMonthDays - i, isCurrentMonth: false, dateStr: formatDate(new Date(year, month - 1, prevMonthDays - i)) });
    }

    // 填充当月天数
    const numDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= numDays; i++) {
        days.push({ day: i, isCurrentMonth: true, dateStr: formatDate(new Date(year, month, i)) });
    }

    // 填充后面的空白天数补齐为42天（6周）
    let nextMonthDay = 1;
    while (days.length < 42) {
        days.push({ day: nextMonthDay++, isCurrentMonth: false, dateStr: formatDate(new Date(year, month + 1, nextMonthDay - 1)) });
    }
    return days;
};
