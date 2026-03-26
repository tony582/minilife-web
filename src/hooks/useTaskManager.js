import { useRef } from 'react';
import { useAuthContext } from '../context/AuthContext.jsx';
import { useDataContext } from '../context/DataContext.jsx';
import { useUIContext } from '../context/UIContext.jsx';
import { getLevelTier, getLevelReq } from '../utils/levelUtils';
import { getCategoryGradient, getIconForCategory } from '../utils/categoryUtils';
import { apiFetch } from '../api/client';
import { isTaskDueOnDate } from '../utils/taskUtils';

let globalAudioCtx = null;

export const useTaskManager = (authC, dataC, uiC) => {
    
    
    
    const context = { ...authC, ...dataC, ...uiC };
    const { 
        activeKidId, kids, setKids, tasks, setTasks, transactions, setTransactions, notify, 
        pauseSync, resumeSync,
        setTimerTargetId, setTimerTotalSeconds, setTimerMode, setIsTimerRunning, setTimerPaused,
        setTimerSeconds, setPomodoroSession, setPomodoroIsBreak,
        setShowTimerModal, setDeleteConfirmTask, setTaskToSubmit, setCelebrationData, 
        setQuickCompleteTask, setQcTimeMode, setQcHours, setQcMinutes, setQcSeconds, 
        setQcStartTime, setQcEndTime, setQcNote, setQcAttachments, qcTimeMode, qcHours, 
        qcMinutes, qcSeconds, qcStartTime, qcEndTime, quickCompleteTask, qcNote, qcAttachments, 
        editingTask, setEditingTask, planType, planForm, setShowAddPlanModal, setPlanForm, planFormErrors, setPlanFormErrors,
        setLastSavedEndTime, lastSavedEndTime, selectedDate, taskToSubmit,
        setShowPenaltyModal, setPenaltyTaskContext, setPenaltySelectedKidIds, setShowRewardModal, 
        setShowRejectModal, setRejectCode, setRejectingTaskInfo, setCelebrateKids, 
        setShowPreviewModal, setPreviewTask
    } = context;

    // Loading guard to prevent double-tap submissions
    const isSubmittingRef = useRef(false);

    const updateActiveKid = (updates) => {
        setKids(prevKids => prevKids.map(k => k.id === activeKidId ? { ...k, ...updates } : k));
    };

    // 任务列表控制
// 任务列表控制 (Student)
// Helper function to get weekly completion count
const getWeeklyCompletionCount = (task, kidId, currentDStr) => {
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
          weeklyCount += entry.count || 1;
        }
      }
    }
  });
  return weeklyCount;
};
// === 额外约束检查: N次任务防刷限制 ===

    // === 额外约束检查: N次任务防刷限制 ===
const checkPeriodLimits = (task, kidId, selectedDStr) => {
  if (!task) return {
    canSubmit: true
  };
  // Ensure habits are always checked for daily/weekly limits
  if (task.type === 'habit') {
    const hist = task.history || {};
    const entry = task.kidId === 'all' ? hist[selectedDStr]?.[kidId] : hist[selectedDStr];
    const todayCount = entry?.count || (entry?.status === 'completed' ? 1 : 0);
    if (task.habitType === 'daily_once' && todayCount >= 1) {
      return {
        canSubmit: false,
        reason: '今天已经完整打过卡啦！'
      };
    }
    const maxPerDay = task.periodMaxPerDay || 3;
    if (task.habitType === 'multiple') {
      if (task.periodMaxType === 'weekly') {
        const weekCount = getWeeklyCompletionCount(task, kidId, selectedDStr);
        if (weekCount >= maxPerDay) {
          return {
            canSubmit: false,
            reason: `本周已达最高上限(${maxPerDay}次)啦！`
          };
        }
      } else {
        // Default to 'daily'
        if (todayCount >= maxPerDay) {
          return {
            canSubmit: false,
            reason: `今天已达上限(${maxPerDay}次)啦！`
          };
        }
      }
    }
  }
  if (!task.repeatConfig) return {
    canSubmit: true
  };
  const rc = task.repeatConfig;
  if (!rc.type.includes('_1') && !rc.type.includes('_n')) return {
    canSubmit: true
  };
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
    return {
      canSubmit: true
    };
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
    return {
      canSubmit: false,
      reason: `本周期已达成目标(${rc.periodTargetCount}次)啦！`
    };
  }
  if (todayCompletions >= rc.periodMaxPerDay) {
    return {
      canSubmit: false,
      reason: `今天已达上限(${rc.periodMaxPerDay}次)啦，改天再做吧～`
    };
  }
  return {
    canSubmit: true
  };
};

    const handleAttemptSubmit = async task => {
  const limits = checkPeriodLimits(task, activeKidId, selectedDate);
  if (!limits.canSubmit) return notify(limits.reason, 'error');
  if (task.type === 'habit') {
    try {
      const hist = task.history || {};
      let newHistory = JSON.parse(JSON.stringify(hist));
      const newRecord = {
        status: 'completed',
        attemptId: `attempt_${Date.now()}_${activeKidId}_${Math.random().toString(36).substr(2, 5)}`
      };
      if (task.kidId === 'all') {
        if (!newHistory[selectedDate]) newHistory[selectedDate] = {};
        if (!newHistory[selectedDate][activeKidId]) newHistory[selectedDate][activeKidId] = [];
        if (!Array.isArray(newHistory[selectedDate][activeKidId])) {
          if (newHistory[selectedDate][activeKidId].status) newHistory[selectedDate][activeKidId] = [newHistory[selectedDate][activeKidId]];else newHistory[selectedDate][activeKidId] = [];
        }
        newHistory[selectedDate][activeKidId].push(newRecord);
      } else {
        if (!newHistory[selectedDate]) newHistory[selectedDate] = [];
        if (!Array.isArray(newHistory[selectedDate])) {
          if (newHistory[selectedDate].status) newHistory[selectedDate] = [newHistory[selectedDate]];else newHistory[selectedDate] = [];
        }
        newHistory[selectedDate].push(newRecord);
      }
      // Optimistic UI updates
      setTasks(prev => prev.map(t => t.id === task.id ? {
        ...t,
        history: newHistory
      } : t));
      // Use atomic server-side reward to avoid stale closure reads
      const expDiff = Math.ceil((task.reward || 0) * 1.5);
      if (task.reward !== 0) {
        const rewardRes = await apiFetch(`/api/kids/${activeKidId}/reward`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coins: task.reward, exp: expDiff })
        });
        if (rewardRes.ok) {
          const rewardData = await rewardRes.json();
          setKids(prev => prev.map(k => k.id === activeKidId ? {
            ...k,
            balances: { ...k.balances, spend: rewardData.spend },
            exp: rewardData.exp,
            level: rewardData.level
          } : k));
        }
      }
      if (task.reward !== 0) {
        setTransactions(prev => [{
          id: `trans_${Date.now()}_coin`,
          kidId: activeKidId,
          type: task.reward > 0 ? 'income' : 'expense',
          amount: Math.abs(task.reward || 0),
          title: `记录成长: ${task.title}`,
          date: new Date().toISOString(),
          category: 'habit'
        }, {
          id: `trans_${Date.now()}_exp`,
          kidId: activeKidId,
          type: task.reward > 0 ? 'income' : 'expense',
          amount: Math.ceil(Math.abs(task.reward || 0) * 1.5),
          title: `记录成长: ${task.title}`,
          date: new Date().toISOString(),
          category: 'habit'
        }, ...prev]);
      }
      playSuccessSound();
      if (task.reward > 0) {
        const messages = ["太棒了！你的坚持让家庭财富又增加啦！🌟", "自律的你，正在闪闪发光！✨", "一个小小的习惯，成就大大的未来！🚀", "付出总有回报，金币+1！💰", "保持良好的习惯，你是全家的骄傲！🏅"];
        setCelebrationData({
          task,
          message: messages[Math.floor(Math.random() * messages.length)],
          type: 'positive'
        });
      } else if (task.reward < 0) {
        const messages = ["诚实是金！即使扣分，你的坦白也值得欣赏！🛡️", "知错能改，善莫大焉，下次一定能做好！💪", "勇敢承认错误，你已经赢了第一步！✨"];
        setCelebrationData({
          task,
          message: messages[Math.floor(Math.random() * messages.length)],
          type: 'negative'
        });
      } else {
        notify("打卡成功！", "success");
      }
      // Background network sync
      apiFetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          history: newHistory
        })
      }).catch(e => console.error(e));
      if (task.reward !== 0) {
        apiFetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            kidId: activeKidId,
            type: task.reward > 0 ? 'income' : 'expense',
            amount: Math.abs(task.reward || 0),
            title: `记录成长: ${task.title}`,
            date: new Date().toISOString(),
            category: 'habit'
          })
        }).catch(e => console.error(e));
        apiFetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            kidId: activeKidId,
            type: task.reward > 0 ? 'income' : 'expense',
            amount: Math.ceil(Math.abs(task.reward || 0) * 1.5),
            title: `记录成长: ${task.title}`,
            date: new Date().toISOString(),
            category: 'habit'
          })
        }).catch(e => console.error(e));
      }
    } catch (e) {
      notify("网络请求失败", "error");
    }
  } else {
    setTaskToSubmit(task);
  }
};
// === 全局方法 ===

    // === 全局方法 ===
const getTaskStatusOnDate = (t, date, kidId) => {
    let historyObj = {};
    if (typeof t.history === 'string') {
      try { historyObj = JSON.parse(t.history || '{}'); } catch (e) { }
    } else {
      historyObj = t.history || {};
    }

    if (t.kidId === 'all') {
      return historyObj[date] && historyObj[date][kidId] ? historyObj[date][kidId].status : 'todo';
    } else {
      return historyObj[date] ? historyObj[date].status : 'todo';
    }
  };

  const getIncompleteStudyTasksCount = (dateStr) => {
    let myTasks = tasks.filter(t => (t.kidId === activeKidId || t.kidId === 'all') && t.type === 'study' && isTaskDueOnDate(t, dateStr));
    let total = myTasks.length;
    let count = myTasks.filter(t => {
      const st = getTaskStatusOnDate(t, dateStr, activeKidId);
      return st === 'todo' || st === 'in_progress' || st === 'failed';
    }).length;
    return { count, total };
  };

    const getTaskTimeSpent = (t, date, kidId) => {
  if (!t?.history) return null;
  if (t.kidId === 'all') return t.history[date]?.[kidId]?.timeSpent;
  return t.history[date]?.timeSpent;
};

    const playSuccessSound = () => {
  try {
    // Use a globally cached AudioContext to prevent severe main-thread freezing and memory leaks
    if (!window.AudioContext && !window.webkitAudioContext) return;
    if (!globalAudioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      globalAudioCtx = new AudioCtxClass();
    }
    const ctx = globalAudioCtx;
    if (ctx.state === 'suspended') {
      ctx.resume(); // Force wake on iOS
    }
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = 'sine';
    const now = ctx.currentTime;
    // Bright cheerful chime (C5 -> C6 sweep)
    oscillator.frequency.setValueAtTime(523.25, now);
    oscillator.frequency.exponentialRampToValueAtTime(1046.50, now + 0.1);
    gainNode.gain.setValueAtTime(0.5, now); // Start loud
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3); // Fade out quickly
    oscillator.start(now);
    oscillator.stop(now + 0.3);
    // Don't close the global context! Let it persist for subsequent plays
  } catch (e) {
    console.error("Audio playback failed:", e);
  }
};

    const handleStartTask = id => {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const limits = checkPeriodLimits(task, activeKidId, selectedDate);
  if (!limits.canSubmit) return notify(limits.reason, 'error');

  // Check for saved timer state in localStorage
  const TIMER_KEY = 'minilife_timer_state';
  try {
    const saved = JSON.parse(localStorage.getItem(TIMER_KEY));
    if (saved && saved.taskId === id && saved.running) {
      // Resume saved timer
      const elapsed = Math.floor((Date.now() - saved.savedAt) / 1000);
      let restoredSeconds = saved.seconds;
      if (!saved.paused) {
        if (saved.mode === 'forward') restoredSeconds += elapsed;
        else restoredSeconds = Math.max(0, restoredSeconds - elapsed);
      }
      setTimerTargetId(id);
      setTimerMode(saved.mode);
      setTimerSeconds(restoredSeconds);
      setTimerTotalSeconds(saved.totalSeconds);
      setIsTimerRunning(true);
      setTimerPaused(saved.paused);
      setPomodoroSession(saved.pomodoroSession || 1);
      setPomodoroIsBreak(saved.pomodoroIsBreak || false);
      setShowTimerModal(true);
      return;
    }
  } catch (e) { /* ignore */ }

  // Fresh start — clear any stale saved state and fully reset ALL timer state
  try { localStorage.removeItem(TIMER_KEY); } catch (e) { /* ignore */ }
  setTimerTargetId(id);
  setTimerSeconds(0);
  setPomodoroSession(1);
  setPomodoroIsBreak(false);
  let secs = 900; // default 15min
  if (task && task.timeStr) {
    // Time range: "17:00-18:00" → calculate difference
    const rangeMatch = task.timeStr.match(/(\d{1,2}:\d{2})\s*(?:-|~|到|至)\s*(\d{1,2}:\d{2})/);
    // Duration: "30分钟" or "30min"
    const minMatch = task.timeStr.match(/(\d+)\s*(?:分钟|min|m)/);
    // Duration: "1小时" or "1.5小时"
    const hrMatch = task.timeStr.match(/(\d+(?:\.\d+)?)\s*(?:小时|hour|hr|h|个钟)/);
    if (rangeMatch) {
      const [sH, sM] = rangeMatch[1].split(':').map(Number);
      const [eH, eM] = rangeMatch[2].split(':').map(Number);
      let diffMins = eH * 60 + eM - (sH * 60 + sM);
      if (diffMins < 0) diffMins += 24 * 60;
      if (diffMins > 0) secs = diffMins * 60;
    } else if (minMatch) {
      const m = parseInt(minMatch[1]);
      if (m > 0) secs = m * 60;
    } else if (hrMatch) {
      const totalM = Math.round(parseFloat(hrMatch[1]) * 60);
      if (totalM > 0) secs = totalM * 60;
    }
  }
  setTimerTotalSeconds(secs);
  setTimerMode('select');
  setIsTimerRunning(false);
  setTimerPaused(false);
  setShowTimerModal(true);
};

    const handleDeleteTask = async id => {
  try {
    await apiFetch(`/api/tasks/${id}`, {
      method: 'DELETE'
    });
    setTasks(prev => prev.filter(t => t.id !== id));
    setDeleteConfirmTask(null);
    notify('任务已删除', 'success');
  } catch (e) {
    console.error(e);
    notify('删除失败', 'error');
  }
};

    const confirmSubmitTask = async () => {
  if (!taskToSubmit) return;
  playSuccessSound(); // Fire exactly on click to bypass iOS async suspensions
  // Construct payload specifically based on whether history is 1D or 2D (unified)
  const histUpdate = {
    status: 'pending_approval',
    submittedAt: Date.now()
  };
  let newHistory = {
    ...(taskToSubmit.history || {})
  };
  if (taskToSubmit.kidId === 'all') {
    newHistory[selectedDate] = {
      ...(newHistory[selectedDate] || {}),
      [activeKidId]: histUpdate
    };
  } else {
    newHistory[selectedDate] = histUpdate;
  }
  try {
    await apiFetch(`/api/tasks/${taskToSubmit.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        history: newHistory
      })
    });
    setTasks(prev => prev.map(t => t.id === taskToSubmit.id ? {
      ...t,
      history: newHistory
    } : t));
    setTaskToSubmit(null);
    // Clear any saved timer state for this task
    try { localStorage.removeItem('minilife_timer_state'); } catch (e) { /* ignore */ }
    // S4: Random encouragement on quick-complete submission
    const quickEncouragements = [
      '提交成功！等待家长审核中，你真棒！🌟',
      '做得好！已提交审核，继续保持！💪',
      '任务已提交！家长审核后就能获得奖励哦！✨',
      '很棒！又完成了一个任务，等审核结果吧！🎯',
    ];
    notify(quickEncouragements[Math.floor(Math.random() * quickEncouragements.length)], 'success');
  } catch (e) {
    notify("网络请求失败", "error");
  }
};

    const openQuickComplete = task => {
  const limits = checkPeriodLimits(task, activeKidId, selectedDate);
  if (!limits.canSubmit) return notify(limits.reason, 'error');
  setQuickCompleteTask(task);
  let dHours = 0;
  let dMinutes = 0;
  let sTime = '';
  const now = new Date();
  const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  let defaultMode = 'duration';
  if (task.timeStr) {
    // Check for range pattern HH:mm ~ HH:mm
    const rangeMatch = task.timeStr.match(/(\d{1,2}:\d{2})\s*(?:-|~|到|至)\s*(\d{1,2}:\d{2})/);
    // Check for duration pattern like 30分钟, 1小时, 1.5小时
    const minMatch = task.timeStr.match(/(\d+)\s*(?:分钟|min|m)/);
    const hrMatch = task.timeStr.match(/(\d+(?:\.\d+)?)\s*(?:小时|hour|hr|h|个钟)/);
    if (rangeMatch) {
      const [sH, sM] = rangeMatch[1].split(':').map(Number);
      const [eH, eM] = rangeMatch[2].split(':').map(Number);
      let diffMins = eH * 60 + eM - (sH * 60 + sM);
      if (diffMins < 0) diffMins += 24 * 60; // Handle cross-midnight logic if necessary
      // Subtract duration from now to get actual logical start time
      const startRealDate = new Date(now.getTime() - diffMins * 60000);
      sTime = `${String(startRealDate.getHours()).padStart(2, '0')}:${String(startRealDate.getMinutes()).padStart(2, '0')}`;
      dHours = Math.floor(diffMins / 60);
      dMinutes = diffMins % 60;
      defaultMode = 'actual';
    } else if (minMatch || hrMatch) {
      let totalM = 0;
      if (minMatch) {
        totalM = parseInt(minMatch[1]);
      } else if (hrMatch) {
        totalM = Math.round(parseFloat(hrMatch[1]) * 60);
      }
      dHours = Math.floor(totalM / 60);
      dMinutes = totalM % 60;
      // Calculate Logical Start Time = End Time (Now) - Target Duration
      const startRealDate = new Date(now.getTime() - totalM * 60000);
      sTime = `${String(startRealDate.getHours()).padStart(2, '0')}:${String(startRealDate.getMinutes()).padStart(2, '0')}`;
      defaultMode = 'duration';
    } else {
      // Check if it's just a single time like 20:00 (no endpoint known, fallback)
      const timeMatch = task.timeStr.match(/(\d{1,2}:\d{2})/);
      if (timeMatch) {
        sTime = timeMatch[1].padStart(5, '0');
        defaultMode = 'actual';
      }
    }
  }
  // If coming from timer, override duration with timer-recorded time
  if (task._timerTimeSpent) {
    const timerMinMatch = task._timerTimeSpent.match(/(\d+)\s*分钟/);
    if (timerMinMatch) {
      const totalM = parseInt(timerMinMatch[1]);
      dHours = Math.floor(totalM / 60);
      dMinutes = totalM % 60;
      defaultMode = 'duration';
      // Calculate start time from timer duration
      const startRealDate = new Date(now.getTime() - totalM * 60000);
      sTime = `${String(startRealDate.getHours()).padStart(2, '0')}:${String(startRealDate.getMinutes()).padStart(2, '0')}`;
    }
  }
  setQcTimeMode(defaultMode);
  setQcHours(dHours);
  setQcMinutes(dMinutes);
  setQcSeconds(0);
  setQcStartTime(sTime);
  setQcEndTime(nowStr);
  setQcNote('');
  setQcAttachments([]);
};

    const handleQcQuickDuration = totalMinutes => {
  setQcHours(Math.floor(totalMinutes / 60));
  setQcMinutes(totalMinutes % 60);
  setQcSeconds(0);
};

    const handleQcFileUpload = e => {
  const files = Array.from(e.target.files);
  if (qcAttachments.length + files.length > 5) {
    notify('最多上传5个附件', 'error');
    return;
  }
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => {
      setQcAttachments(prev => [...prev, {
        name: file.name,
        type: file.type,
        data: ev.target.result,
        size: file.size
      }]);
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
};
// 快速完成功能

    // 快速完成功能 
const handleQuickComplete = async () => {
  // Prevent duplicate submissions
  if (isSubmittingRef.current) return;
  if (qcTimeMode === 'actual' && (!qcStartTime || !qcEndTime)) {
    return notify('请填写完整的起止时间', 'error');
  }
  isSubmittingRef.current = true;
  playSuccessSound(); // Fire exactly on click to bypass iOS async suspensions
  let spentStr = '';
  if (qcTimeMode === 'duration') {
    if (qcHours === 0 && qcMinutes === 0 && qcSeconds === 0) return notify('请填写耗时', 'error');
    spentStr = `${qcHours > 0 ? qcHours + '小时' : ''}${qcMinutes > 0 ? qcMinutes + '分钟' : ''}${qcSeconds > 0 ? qcSeconds + '秒' : ''}`;
  } else {
    spentStr = `${qcStartTime} ~ ${qcEndTime}`;
  }
  const taskToSubmit = quickCompleteTask;
  if (!taskToSubmit) return;

  // Check if already completed/pending for this kid on this date
  const existingEntry = taskToSubmit.kidId === 'all'
    ? taskToSubmit.history?.[selectedDate]?.[activeKidId]
    : taskToSubmit.history?.[selectedDate];
  if (existingEntry && (existingEntry.status === 'completed' || existingEntry.status === 'pending_approval')) {
    setQuickCompleteTask(null);
    return notify(existingEntry.status === 'completed' ? '该任务今天已完成，无需重复提交' : '该任务已提交等待审核中', 'error');
  }

  // Auto-approve logic check
  const isAutoApprove = taskToSubmit.requireApproval === false;
  const finalStatus = isAutoApprove ? 'completed' : 'pending_approval';

  // Construct payload specifically based on whether history is 1D or 2D (unified)
  const histUpdate = {
    status: finalStatus,
    timeSpent: spentStr,
    note: qcNote,
    attachments: qcAttachments,
    submittedAt: Date.now(),
    auditLog: [
      ...((taskToSubmit.history?.[selectedDate]?.[activeKidId]?.auditLog) || (taskToSubmit.history?.[selectedDate]?.auditLog) || []),
      { action: 'submitted', timestamp: Date.now(), detail: `用时: ${spentStr}` }
    ]
  };
  let newHistory = {
    ...(taskToSubmit.history || {})
  };
  if (taskToSubmit.kidId === 'all') {
    newHistory[selectedDate] = {
      ...(newHistory[selectedDate] || {}),
      [activeKidId]: histUpdate
    };
  } else {
    newHistory[selectedDate] = histUpdate;
  }
  pauseSync(); // Prevent SSE refetch from overwriting in-flight balance updates

  // Optimistic UI update: update local state IMMEDIATELY so the button
  // changes to "待审批" without waiting for the server round-trip.
  const oldHistory = taskToSubmit.history;
  setTasks(prev => prev.map(t => t.id === taskToSubmit.id ? {
    ...t,
    history: newHistory
  } : t));
  setQuickCompleteTask(null); // Close modal immediately

  try {
    const putRes = await apiFetch(`/api/tasks/${taskToSubmit.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        history: newHistory
      })
    });

    if (isAutoApprove && taskToSubmit.reward > 0) {
      // Instantly generate transaction and family coins
      const newTrans = {
        id: `trans_${Date.now()}`,
        kidId: activeKidId,
        type: 'income',
        amount: taskToSubmit.reward || 0,
        title: `完成: ${taskToSubmit.title}`,
        date: new Date().toISOString(),
        category: 'task'
      };

      const transRes = await apiFetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrans)
      });

      setTransactions(prev => [newTrans, ...prev]);

      // Use atomic server-side reward to avoid stale closure reads
      const expGained = Math.ceil(taskToSubmit.reward * 1.5);

      const rewardRes = await apiFetch(`/api/kids/${activeKidId}/reward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins: taskToSubmit.reward, exp: expGained })
      });
      
      if (rewardRes.ok) {
        const rewardData = await rewardRes.json();

        // Update React state with server-returned values (always fresh)
        setKids(prev => prev.map(k => k.id === activeKidId ? {
          ...k,
          balances: { ...k.balances, spend: rewardData.spend },
          exp: rewardData.exp,
          level: rewardData.level
        } : k));
        
        // Check for level-up
        const oldKid = kids.find(k => k.id === activeKidId);
        if (oldKid && rewardData.level > oldKid.level) {
          notify(`太棒了！${oldKid.name} 升到了 Lv.${rewardData.level}！`, "success");
        }
        
        // S4: Random encouragement message on task completion
        const encouragements = [
          `太棒了！获得 ${taskToSubmit.reward} 家庭币！继续加油！🎉`,
          `完成得真棒！+${taskToSubmit.reward} 家庭币！你是最棒的！⭐`,
          `又完成一个任务！+${taskToSubmit.reward} 家庭币！离目标更近了！🚀`,
          `厉害！+${taskToSubmit.reward} 家庭币！坚持就是胜利！💪`,
          `好样的！+${taskToSubmit.reward} 家庭币 +${expGained} 经验！🌟`,
          `任务达成！+${taskToSubmit.reward} 家庭币！你的努力值得表扬！👏`,
        ];
        notify(encouragements[Math.floor(Math.random() * encouragements.length)], 'success');
      } else {

        notify('奖励发放失败，请重试', 'error');
      }
    } else {

      // S4: Random encouragement for pending approval
      const pendingEncouragements = [
        '已提交审核！坚持打卡的你真了不起！🌈',
        '提交成功！等家长审核后就能拿到家庭币了！💰',
        '做得好！已提交给家长，很快就有奖励啦！⭐',
        '任务已提交！你的努力不会白费的！🎊',
      ];
      notify(pendingEncouragements[Math.floor(Math.random() * pendingEncouragements.length)], 'success');
    }
  } catch (e) {
    // Rollback the optimistic update
    setTasks(prev => prev.map(t => t.id === taskToSubmit.id ? {
      ...t,
      history: oldHistory
    } : t));
    notify('提交失败', 'error');
  } finally {

    isSubmittingRef.current = false;
    resumeSync(); // Always unlock SSE sync
  }
};

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
    await apiFetch(`/api/kids/${kidId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        level: newLevel,
        exp: newExp
      })
    });
    setKids(prevKids => prevKids.map(k => k.id === kidId ? {
      ...k,
      exp: newExp,
      level: newLevel
    } : k));
  } catch (e) {
    notify("网络请求失败", "error");
  }
};

    const handleMarkHabitComplete = async (task, date) => {
  pauseSync(); // Prevent SSE refetch from overwriting in-flight balance updates
  try {
    await apiFetch(`/api/tasks/${task.id}/history`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        date,
        status: 'completed'
      })
    });
    setTasks(prev => prev.map(t => {
      if (t.id === task.id) {
        let dateHist = t.history?.[date] || [];
        if (!Array.isArray(dateHist)) {
          dateHist = dateHist.status ? [dateHist] : [];
        }
        const newEntry = {
          status: 'completed',
          attemptId: `kid_attempt_${Date.now()}`
        };
        const newHist = {
          ...(t.history || {}),
          [date]: [...dateHist, newEntry]
        };
        return {
          ...t,
          history: newHist
        };
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
        await apiFetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newTrans)
        });
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
        await apiFetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(expTrans)
        });
        setTransactions([newTrans, expTrans, ...transactions]);

        // Use atomic server-side reward to avoid stale closure reads
        const rewardRes = await apiFetch(`/api/kids/${task.kidId}/reward`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coins: task.reward, exp: expGained })
        });
        if (rewardRes.ok) {
          const rewardData = await rewardRes.json();
          setKids(prev => prev.map(k => k.id === task.kidId ? {
            ...k,
            balances: { ...k.balances, spend: rewardData.spend },
            exp: rewardData.exp,
            level: rewardData.level
          } : k));
          if (rewardData.level > targetKid.level) {
            notify(`太棒了！${targetKid.name} 升到了 Lv.${rewardData.level}！`, "success");
          }
        }
        notify(`打卡成功！已奖励 ${targetKid.name} ${task.reward} 家庭币 和 ${expGained} 经验！`, "success");
      } else {
        // Penalty: Deduct EXP and Coins atomically
        const absPenalty = Math.abs(task.reward);
        const expPenalty = Math.ceil(absPenalty * 1.5);

        const rewardRes = await apiFetch(`/api/kids/${task.kidId}/reward`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coins: task.reward, exp: -expPenalty })
        });
        if (rewardRes.ok) {
          const rewardData = await rewardRes.json();
          setKids(prev => prev.map(k => k.id === task.kidId ? {
            ...k,
            balances: { ...k.balances, spend: rewardData.spend },
            exp: rewardData.exp,
            level: rewardData.level
          } : k));
        }

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
        await apiFetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(refundTrans)
        });
        await apiFetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(expRefundTrans)
        });
        setTransactions(prev => [refundTrans, expRefundTrans, ...prev]);
        notify(`已扣除 ${targetKid.name} ${absPenalty} 家庭币和 ${expPenalty} 经验。`, "error");
      }
    }
  } catch (e) {
    notify("网络请求失败", "error");
  } finally {
    resumeSync(); // Always unlock SSE sync
  }
};

    const handleRejectTask = async (task, dateStr, kidId, reason = '') => {
  try {
    const oldHistory = task.history && task.history[dateStr] && task.history[dateStr][kidId] ? task.history[dateStr][kidId] : {};
    // Revert state -> 'failed' instead of 'todo' so it stays logged but child can restart
    const histUpdates = {
      ...task.history
    };
    if (!histUpdates[dateStr]) histUpdates[dateStr] = {};
    histUpdates[dateStr] = {
      ...histUpdates[dateStr],
      [kidId]: {
        ...oldHistory,
        status: 'failed',
        rejectFeedback: reason,
        rejectedAt: Date.now(),
        auditLog: [
          ...(oldHistory.auditLog || []),
          { action: 'rejected', timestamp: Date.now(), detail: reason || '未说明原因' }
        ]
      }
    };
    await apiFetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        history: histUpdates
      })
    });
    setTasks(prev => prev.map(t => t.id === task.id ? {
      ...t,
      history: histUpdates
    } : t));
    // Reverse reward/penalty if was previously completed
    if (oldHistory.status === 'completed') {
      const isStudy = task.type === 'study';
      let absReward = Math.abs(task.reward || 0);
      if (isStudy && absReward > 0) {
        // Study task reversal: deduct coins atomically
        const rewardRes = await apiFetch(`/api/kids/${kidId}/reward`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coins: -absReward, exp: 0 })
        });
        if (rewardRes.ok) {
          const rewardData = await rewardRes.json();
          setKids(prev => prev.map(k => String(k.id) === String(kidId) ? {
            ...k,
            balances: { ...k.balances, spend: rewardData.spend },
            exp: rewardData.exp,
            level: rewardData.level
          } : k));
        }
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
          await apiFetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(refundTrans)
          });
          setTransactions([refundTrans, ...transactions]);
      } else if (!isStudy) {
        const absReward = Math.abs(task.reward || 0);
        if (task.reward > 0) {
            // Reverse positive habit: Deduct Coins & EXP atomically
            const expDeduct = -Math.ceil(absReward * 1.5);
            const rewardRes = await apiFetch(`/api/kids/${kidId}/reward`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ coins: -absReward, exp: expDeduct })
            });
            if (rewardRes.ok) {
              const rewardData = await rewardRes.json();
              setKids(prev => prev.map(k => String(k.id) === String(kidId) ? {
                ...k,
                balances: { ...k.balances, spend: rewardData.spend },
                exp: rewardData.exp,
                level: rewardData.level
              } : k));
            }
            // Negative reversed transactions
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
            await apiFetch('/api/transactions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(refundTrans)
            });
            await apiFetch('/api/transactions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(expRefundTrans)
            });
            setTransactions([refundTrans, expRefundTrans, ...transactions]);
          } else {
            // Reverse penalty: Refund Coins & EXP atomically
            const expRefund = Math.ceil(absReward * 1.5);
            const rewardRes = await apiFetch(`/api/kids/${kidId}/reward`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ coins: absReward, exp: expRefund })
            });
            if (rewardRes.ok) {
              const rewardData = await rewardRes.json();
              setKids(prev => prev.map(k => String(k.id) === String(kidId) ? {
                ...k,
                balances: { ...k.balances, spend: rewardData.spend },
                exp: rewardData.exp,
                level: rewardData.level
              } : k));
            }
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
            await apiFetch('/api/transactions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(refundTrans)
            });
            await apiFetch('/api/transactions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(expRefundTrans)
            });
            setTransactions([refundTrans, expRefundTrans, ...transactions]);
          }
        }
      }
    if (editingTask && editingTask.id === task.id) {
      setEditingTask({
        ...task,
        history: histUpdates
      });
    }
    notify(oldHistory.status === 'completed' ? "已打回为不达标状态，并撤回相关奖励！" : "已打回为不达标状态", "success");
  } catch (e) {
    console.error(e);
    notify("操作失败", "error");
  }
};

    const handleApproveTask = async (task, date, actualKidId) => {
  pauseSync(); // Prevent SSE refetch from overwriting in-flight balance updates
  try {
    // Write to Transaction Table First
    const newTrans = {
      id: `trans_${Date.now()}`,
      kidId: actualKidId,
      // Note: must use actualKidId in case of unified 'all' tasks
      type: 'income',
      amount: task.reward || 0,
      title: `完成: ${task.title}`,
      date: new Date().toISOString(),
      category: 'task'
    };
    if (task.reward > 0) {
      await apiFetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTrans)
      });
      setTransactions([newTrans, ...transactions]);
    }
    // Then Update Task History
    const histUpdate = {
      status: 'completed',
      approvedAt: Date.now(),
      auditLog: [
        ...((task.history?.[date]?.[actualKidId]?.auditLog) || (task.history?.[date]?.auditLog) || []),
        { action: 'approved', timestamp: Date.now() }
      ]
    };
    let newHistory = {
      ...(task.history || {})
    };
    if (task.kidId === 'all') {
      newHistory[date] = {
        ...(newHistory[date] || {}),
        [actualKidId]: {
          ...(newHistory[date]?.[actualKidId] || {}),
          ...histUpdate
        }
      };
    } else {
      newHistory[date] = {
        ...(newHistory[date] || {}),
        ...histUpdate
      };
    }
    await apiFetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        history: newHistory
      })
    });
    setTasks(prev => prev.map(t => t.id === task.id ? {
      ...t,
      history: newHistory
    } : t));
    // Increase Balances & EXP
    const kid = kids.find(k => k.id === actualKidId);
    if (kid && task.reward > 0) {
      const newBals = {
        ...kid.balances,
        spend: kid.balances.spend + task.reward
      };
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
      await apiFetch(`/api/kids/${actualKidId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          balances: newBals,
          exp: newExp,
          level: newLevel
        })
      });
      setKids(prevKids => prevKids.map(k => k.id === actualKidId ? {
        ...k,
        balances: newBals,
        exp: newExp,
        level: newLevel
      } : k));
      notify(`已审批！奖励 ${task.reward} 家庭币和 ${expGained} 经验值！`, "success");
    }
  } catch (e) {
    notify("网络请求失败", "error");
  } finally {
    resumeSync(); // Always unlock SSE sync
  }
};

    const handleApproveAllTasks = async approvalsList => {
  if (!approvalsList || approvalsList.length === 0) return;
  pauseSync(); // Prevent SSE refetch from overwriting in-flight balance updates
  try {
    const timestamp = Date.now();
    let newTransactions = [];
    let kidRewardTotals = {}; // Map of kidId -> total reward
    let taskUpdates = {}; // Map of taskId -> newHistory
    // 1. Process all approvals logically
    for (let i = 0; i < approvalsList.length; i++) {
      const {
        task,
        date,
        actualKidId
      } = approvalsList[i];
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
        taskUpdates[task.id] = {
          ...(task.history || {})
        };
      }
      const histUpdate = {
        status: 'completed'
      };
      if (task.kidId === 'all') {
        taskUpdates[task.id][date] = {
          ...(taskUpdates[task.id][date] || {}),
          [actualKidId]: {
            ...(taskUpdates[task.id][date]?.[actualKidId] || {}),
            ...histUpdate
          }
        };
      } else {
        taskUpdates[task.id][date] = {
          ...(taskUpdates[task.id][date] || {}),
          ...histUpdate
        };
      }
    }
    // 2. Execute Backend Calls
    const promises = [];
    // Post transactions
    for (const trans of newTransactions) {
      promises.push(apiFetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(trans)
      }));
    }
    // Update tasks
    for (const taskId in taskUpdates) {
      promises.push(apiFetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          history: taskUpdates[taskId]
        })
      }));
    }
    // Update kids balances and EXP
    for (const kidId in kidRewardTotals) {
      const kid = kids.find(k => k.id === kidId);
      if (kid) {
        const newBals = {
          ...kid.balances,
          spend: kid.balances.spend + kidRewardTotals[kidId]
        };
        const totalExpGained = Math.ceil(kidRewardTotals[kidId] * 1.5);
        let newExp = kid.exp + totalExpGained;
        let newLevel = kid.level;
        while (newExp >= getLevelReq(newLevel)) {
          newExp -= getLevelReq(newLevel);
          newLevel++;
        }
        promises.push(apiFetch(`/api/kids/${kidId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            balances: newBals,
            exp: newExp,
            level: newLevel
          })
        }));
      }
    }
    await Promise.all(promises);
    // 3. Update React State Bulk
    if (newTransactions.length > 0) {
      setTransactions(prev => [...newTransactions, ...prev]);
    }
    setTasks(prevTasks => prevTasks.map(t => {
      if (taskUpdates[t.id]) {
        return {
          ...t,
          history: taskUpdates[t.id]
        };
      }
      return t;
    }));
    // Update kids state locally (don't refetch from server to avoid race conditions)
    setKids(prevKids => prevKids.map(k => {
      if (kidRewardTotals[k.id]) {
        const totalReward = kidRewardTotals[k.id];
        const totalExpGained = Math.ceil(totalReward * 1.5);
        let newExp = k.exp + totalExpGained;
        let newLevel = k.level;
        while (newExp >= getLevelReq(newLevel)) {
          newExp -= getLevelReq(newLevel);
          newLevel++;
        }
        return {
          ...k,
          balances: { ...k.balances, spend: k.balances.spend + totalReward },
          exp: newExp,
          level: newLevel
        };
      }
      return k;
    }));
    notify(`一键审批完成！共计发放了 ${Object.values(kidRewardTotals).reduce((a, b) => a + b, 0) || 0} 家庭币。`, "success");
  } catch (e) {
    notify("批量审批网络请求部分失败，请刷新页面查看最新状态", "error");
    console.error(e);
  } finally {
    resumeSync(); // Always unlock SSE sync
  }
};

    // Check on load when kids data is present
const handleSavePlan = async () => {
  // P8: Field-level validation with specific error indicators
  const errors = {};
  if (!planForm.title || !planForm.title.trim()) {
    errors.title = '请填写任务名称';
  }

  // P7: Time validation — end time must be after start time
  if (planType === 'study' && planForm.timeSetting === 'range' && planForm.startTime && planForm.endTime) {
    if (planForm.endTime <= planForm.startTime) {
      errors.time = '结束时间不能早于或等于开始时间';
    }
  }

  if (Object.keys(errors).length > 0) {
    setPlanFormErrors(errors);
    // Show first error as toast too
    const firstError = Object.values(errors)[0];
    notify(firstError, 'error');
    // Scroll to first errored field
    setTimeout(() => {
      const el = document.querySelector('[data-field-error]');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    return;
  }
  setPlanFormErrors({}); // Clear errors on successful validation

  // P5: Reward parsing — default to 5 when custom is on but value is empty
  let rewardNum = planForm.reward !== '' && planForm.reward !== undefined ? parseInt(planForm.reward) : 0;
  if (isNaN(rewardNum)) rewardNum = 0;
  if (planType === 'study' && planForm.pointRule === 'custom' && rewardNum === 0 && (planForm.reward === '' || planForm.reward === undefined)) {
    rewardNum = 5; // Default custom reward
  }
  if (planType === 'study' && planForm.pointRule !== 'custom') {
    rewardNum = 10; // Default system rule fallback for study
  }
  // Color and Frequency
  let color = "from-blue-400 to-blue-500";
  let frequency = "每天";
  let timeStr = "--:--";
  if (planType === 'study') {
    // Study Plan Logistics
    color = getCategoryGradient(planForm.category);
    const freqMap = {
      'today': '仅当天',
      'daily': '每天',
      'weekly_custom': '按周重复',
      'biweekly_custom': '按双周重复',
      'ebbinghaus': '记忆曲线',
      'weekly_1': '本周1次',
      'biweekly_1': '本双周1次',
      'monthly_1': '本月1次',
      'every_week_1': '每周1次',
      'every_biweek_1': '每双周1次',
      'every_month_1': '每月1次'
    };
    if (freqMap[planForm.repeatType]) frequency = freqMap[planForm.repeatType];else frequency = planForm.repeatType;
    if (planForm.timeSetting === 'range' && planForm.startTime && planForm.endTime) {
      timeStr = `${planForm.startTime}-${planForm.endTime}`;
    } else if (planForm.timeSetting === 'duration' && planForm.durationPreset) {
      timeStr = `${planForm.durationPreset}分钟`;
    }
  } else {
    // Habit Logistics
    color = planForm.habitColor;
    frequency = planForm.habitType === 'daily_once' ? '每日一次' : planForm.periodMaxType === 'weekly' ? `每周 ${planForm.periodMaxPerDay} 次` : `每日 ${planForm.periodMaxPerDay} 次`;
    // Set the reward sign based on habitRewardType
    if (planForm.habitRewardType === 'penalty') {
      rewardNum = -Math.abs(rewardNum);
    } else {
      rewardNum = Math.abs(rewardNum);
    }
  }
  // === EDIT MODE: Update existing task ===
  if (editingTask) {
    const updates = {
      title: planForm.title,
      reward: planType === 'habit' ? rewardNum : Math.abs(rewardNum),
      category: planType === 'study' ? planForm.category : "行为",
      catColor: color,
      frequency: frequency,
      // V1 fallback
      repeatConfig: planType === 'study' ? {
        type: planForm.repeatType,
        endDate: planForm.endDate || null,
        weeklyDays: planForm.weeklyDays,
        ebbStrength: planForm.ebbStrength,
        periodDaysType: planForm.periodDaysType,
        periodCustomDays: planForm.periodCustomDays,
        periodTargetCount: Number(planForm.periodTargetCount),
        periodMaxPerDay: Number(planForm.periodMaxPerDay)
      } : null,
      // V2 explicit config
      timeStr: timeStr,
      standards: planForm.desc || "",
      iconEmoji: planForm.iconEmoji,
      requireApproval: planForm.requireApproval,
      attachments: planForm.attachments || [],
      periodMaxPerDay: planType === 'habit' ? Number(planForm.periodMaxPerDay) : undefined,
      periodMaxType: planType === 'habit' ? planForm.periodMaxType : undefined,
      pointRule: planForm.pointRule || 'default'
    };
    try {
      await apiFetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      setTasks(prev => prev.map(t => t.id === editingTask.id ? {
        ...t,
        ...updates
      } : t));
      if (planType === 'study' && planForm.timeSetting === 'range' && planForm.endTime) {
        setLastSavedEndTime(planForm.endTime);
      }
      setShowAddPlanModal(false);
      setEditingTask(null);
      notify('任务已更新', 'success');
    } catch (e) {
      console.error(e);
      notify('保存失败', 'error');
    }
    return;
  }
  // === CREATE MODE: Create new tasks ===
  let newTasks = [];
  const maxOrder = tasks.reduce((max, t) => Math.max(max, t.order ?? 0), 0);
  const baseTask = {
    id: Date.now().toString(),
    order: maxOrder + 1,
    title: planForm.title,
    desc: planForm.desc,
    reward: planType === 'habit' ? rewardNum : Math.abs(rewardNum),
    type: planType,
    status: 'todo',
    iconEmoji: planForm.iconEmoji,
    standards: planForm.desc || "",
    category: planType === 'study' ? planForm.category : "行为",
    catColor: color,
    frequency: frequency,
    timeStr: timeStr,
    startDate: planForm.startDate,
    pointRule: planForm.pointRule,
    habitType: planForm.habitType,
    attachments: planForm.attachments || [],
    requireApproval: planForm.requireApproval,
    periodMaxPerDay: planType === 'habit' ? Number(planForm.periodMaxPerDay) : undefined,
    periodMaxType: planType === 'habit' ? planForm.periodMaxType : undefined,
    dates: planForm.repeatType === 'today' || planForm.repeatType === '仅当天' ? [planForm.startDate] : [],
    repeatConfig: planType === 'study' ? {
      type: planForm.repeatType,
      endDate: planForm.endDate || null,
      weeklyDays: planForm.weeklyDays,
      ebbStrength: planForm.ebbStrength,
      periodDaysType: planForm.periodDaysType,
      periodCustomDays: planForm.periodCustomDays,
      periodTargetCount: Number(planForm.periodTargetCount),
      periodMaxPerDay: Number(planForm.periodMaxPerDay)
    } : null,
    history: {} // History will now store { date: { kidId: { status } } }
  };
  if (!planForm.targetKids) planForm.targetKids = [planForm.targetKid || 'all'];
  if (planForm.targetKids.includes('all') || planForm.targetKids.length === kids.length) {
    // Unify logic: DB has one task, kidId = 'all'
    newTasks = [{
      ...baseTask,
      kidId: 'all'
    }];
  } else {
    // Assign localized task as per usual for single/multiple selection
    newTasks = planForm.targetKids.map(id => ({
      ...baseTask,
      kidId: id
    }));
  }
  try {
    await Promise.all(newTasks.map(task => apiFetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(task)
    })));
    setTasks(prev => [...prev, ...newTasks]);
    if (planType === 'study' && planForm.timeSetting === 'range' && planForm.endTime) {
      setLastSavedEndTime(planForm.endTime);
    }
    setShowAddPlanModal(false);
    setPlanForm({
      targetKids: ['all'],
      category: '技能',
      title: '',
      desc: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      repeatType: 'today',
      timeSetting: 'none',
      weeklyDays: [1, 2, 3, 4, 5],
      ebbStrength: 'normal',
      periodDaysType: 'any',
      periodCustomDays: [1, 2, 3, 4, 5],
      periodTargetCount: 1,
      periodMaxPerDay: 1,
      startTime: '',
      endTime: '',
      durationPreset: 25,
      pointRule: 'default',
      reward: '',
      iconEmoji: '📚',
      iconName: getIconForCategory('语文'),
      habitColor: 'from-blue-400 to-blue-500',
      habitType: 'daily_once',
      attachments: []
    });
    notify(`成功创建了新的${planType === 'study' ? '计划' : '习惯'}！`, "success");
  } catch (e) {
    notify("网络请求失败", "error");
  }
};

    return {
        getWeeklyCompletionCount,
        checkPeriodLimits,
        handleAttemptSubmit,
        getTaskStatusOnDate,
        getTaskTimeSpent,
        handleStartTask,
        handleDeleteTask,
        confirmSubmitTask,
        openQuickComplete,
        handleQcQuickDuration,
        handleQcFileUpload,
        handleQuickComplete,
        handleExpChange,
        handleMarkHabitComplete,
        handleRejectTask,
        handleApproveTask,
        handleApproveAllTasks,
        handleSavePlan,
        playSuccessSound,
        getIncompleteStudyTasksCount
    };
};
