import React from 'react';
import { Icons } from '../../utils/Icons';

/**
 * TimerModal — Full-screen timer with 3 modes (正计时/倒计时/番茄钟)
 * Receives the full GlobalModals `context` as a prop.
 */
export const TimerModal = ({ context }) => {
    const {
        showTimerModal, timerTargetId, tasks,
        timerSeconds, timerTotalSeconds, timerMode, setTimerMode,
        isTimerRunning, setIsTimerRunning,
        timerPaused, setTimerPaused,
        setTimerSeconds, setTimerTotalSeconds,
        pomodoroSession, setPomodoroSession,
        pomodoroIsBreak, setPomodoroIsBreak,
        showTimerLeaveConfirm, setShowTimerLeaveConfirm,
        handleTimerBack, handleTimerSaveAndLeave, clearTimerState,
        playSuccessSound, openQuickComplete,
        setPreviewImages, setPreviewImageIndex, setShowImagePreviewModal,
    } = context;

    if (!showTimerModal) return null;
    const task = tasks.find(t => t.id === timerTargetId);
    if (!task) return null;

    const hrs = Math.floor(timerSeconds / 3600);
    const mins = Math.floor((timerSeconds % 3600) / 60);
    const secs = timerSeconds % 60;

    const getElapsedSeconds = () => {
        if (timerMode === 'forward') return timerSeconds;
        if (timerMode === 'countdown') return timerTotalSeconds - timerSeconds;
        const completedWork = Math.max(0, pomodoroSession - 1) * 25 * 60;
        const currentWork = pomodoroIsBreak ? 0 : (25 * 60 - timerSeconds);
        return completedWork + currentWork;
    };

    const finishTimer = () => {
        const elapsedSec = getElapsedSeconds();
        const spentMins = Math.max(1, Math.round(elapsedSec / 60));
        const modeLabel = timerMode === 'forward' ? '正计时' : timerMode === 'countdown' ? '倒计时' : '番茄钟';
        const spentStr = `${spentMins} 分钟(${modeLabel})`;
        const taskCopy = { ...task, _timerTimeSpent: spentStr };
        try {
            localStorage.setItem('minilife_timer_state', JSON.stringify({
                taskId: timerTargetId, mode: timerMode, seconds: timerSeconds,
                totalSeconds: timerTotalSeconds, running: true, paused: true,
                pomodoroSession, pomodoroIsBreak, savedAt: Date.now()
            }));
        } catch (e) { /* ignore */ }
        clearTimerState();
        playSuccessSound();
        openQuickComplete(taskCopy);
    };

    const skipPomodoroStage = () => {
        playSuccessSound();
        if (pomodoroIsBreak) {
            setPomodoroIsBreak(false);
            setPomodoroSession(s => s + 1);
            setTimerSeconds(25 * 60);
        } else {
            setPomodoroIsBreak(true);
            const breakMins = (pomodoroSession % 4 === 0) ? 15 : 5;
            setTimerSeconds(breakMins * 60);
        }
    };

    /* ── Flat SVG icons ── */
    const FI = {
        clock: (s=16,c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><circle cx="12" cy="12" r="10" opacity=".15"/><circle cx="12" cy="12" r="10" fill="none" stroke={c} strokeWidth="2"/><path d="M12 6v6l4 2" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none"/></svg>,
        hourglass: (s=16,c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M6 2h12v4l-4 4 4 4v4H6v-4l4-4-4-4V2zm2 2v3l4 4 4-4V4H8zm0 16h8v-3l-4-4-4 4v3z" opacity=".85"/></svg>,
        tomato: (s=16,c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M12 4c-1 0-2 .5-2 .5S9 3 8 3s-1.5 1-1.5 1S4 5 4 9c0 5.5 3.5 11 8 11s8-5.5 8-11c0-4-2.5-5-2.5-5S17 3 16 3s-2 1.5-2 1.5S13 4 12 4z" opacity=".85"/></svg>,
        arrowLeft: (s=18,c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
        close: (s=18,c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
        play: (s=18,c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M8 5v14l11-7z"/></svg>,
        pause: (s=18,c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>,
        check: (s=16,c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
        skip: (s=16,c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M5 4v16l10-8z"/><rect x="17" y="4" width="3" height="16" rx="1"/></svg>,
        save: (s=16,c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM7 3v5h8V3M7 14h10v7H7z" opacity=".85"/></svg>,
        cup: (s=16,c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M5 8h12v4c0 3.3-2.7 6-6 6s-6-2.7-6-6V8zm12 1h2a2 2 0 010 4h-2V9zM6 20h10" opacity=".85"/></svg>,
        flame: (s=16,c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M12 2c0 4-4 6-4 10a6 6 0 0012 0c0-4-4-6-4-10-1 2-3 3-4 3s-3-1-4-3 4-4 4 0z" opacity=".85"/></svg>,
        clipboard: (s=14,c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2m1-2h6a1 1 0 011 1v1a1 1 0 01-1 1H9a1 1 0 01-1-1V3a1 1 0 011-1z" opacity=".85"/></svg>,
    };

    /* ── Color themes ── */
    const themes = {
        forward: { bg: '#EDF6FF', card: '#D6EBFF', ring: '#38BDF8', ringGlow: 'rgba(56,189,248,0.3)', textMain: '#1B4D7A', textSub: '#7EADD4', btnBg: '#38BDF8' },
        countdown: { bg: '#F3EDFF', card: '#E8DEFF', ring: '#A855F7', ringGlow: 'rgba(168,85,247,0.3)', textMain: '#3B1B6E', textSub: '#B39AD8', btnBg: '#A855F7' },
        pomodoro: pomodoroIsBreak
            ? { bg: '#E8FAF5', card: '#D0F5EB', ring: '#2DD4BF', ringGlow: 'rgba(45,212,191,0.3)', textMain: '#134E4A', textSub: '#7EC4B3', btnBg: '#2DD4BF' }
            : { bg: '#FFE8EC', card: '#FFD4DC', ring: '#FB7185', ringGlow: 'rgba(251,113,133,0.3)', textMain: '#5C1A28', textSub: '#D48A95', btnBg: '#FB7185' },
    };
    const activeMode = timerMode === 'select' ? 'forward' : timerMode;
    const theme = themes[activeMode] || themes.forward;
    const isRunning = isTimerRunning && timerMode !== 'select';
    const canSwitchMode = !isRunning;

    /* ── Progress calc ── */
    const ringTotal = activeMode === 'forward' ? Math.max(timerSeconds, 1)
        : activeMode === 'countdown' ? timerTotalSeconds
        : (pomodoroIsBreak ? (pomodoroSession % 4 === 0 ? 900 : 300) : 1500);
    const progress = !isRunning ? 0
        : activeMode === 'forward' ? 1
        : ringTotal > 0 ? (1 - timerSeconds / ringTotal) : 0;

    const displaySeconds = isRunning ? timerSeconds
        : activeMode === 'countdown' ? (timerTotalSeconds || 900)
        : activeMode === 'pomodoro' ? 1500
        : 0;
    const dHrs = Math.floor(displaySeconds / 3600);
    const dMins = Math.floor((displaySeconds % 3600) / 60);
    const dSecs = displaySeconds % 60;

    const taskTimeStr = task.timeStr || '';
    const taskDesc = task.desc || task.standards || '';
    const taskAttachments = task.attachments || [];

    const startMode = (mode) => {
        if (mode === 'forward') { setTimerMode('forward'); setTimerSeconds(0); setIsTimerRunning(true); setTimerPaused(false); }
        else if (mode === 'countdown') { setTimerMode('countdown'); setTimerSeconds(timerTotalSeconds || 900); setIsTimerRunning(true); setTimerPaused(false); }
        else { setTimerMode('pomodoro'); setTimerSeconds(25 * 60); setPomodoroSession(1); setPomodoroIsBreak(false); setIsTimerRunning(true); setTimerPaused(false); }
    };

    const switchTab = (mode) => { if (!canSwitchMode) return; setTimerMode(mode); };

    const modeTabs = [
        { id: 'forward', label: '正计时', icon: (s,c) => FI.clock(s,c) },
        { id: 'countdown', label: '倒计时', icon: (s,c) => FI.hourglass(s,c) },
        { id: 'pomodoro', label: '番茄钟', icon: (s,c) => FI.tomato(s,c) },
    ];

    return (
        <div className="fixed inset-0 flex items-center justify-center overflow-hidden animate-fade-in" style={{ zIndex: 9999 }}>
            <div className="absolute inset-0 hidden md:block" style={{ background: 'rgba(27,46,75,0.3)', backdropFilter: 'blur(8px)' }} />
            <div className="absolute inset-0 md:hidden" style={{ background: theme.bg }} />

            {/* Leave confirmation */}
            {showTimerLeaveConfirm && (() => {
                const eSec = getElapsedSeconds();
                const eM = Math.floor(eSec / 60); const eS = eSec % 60;
                return (
                    <div className="absolute inset-0 z-30 flex items-center justify-center p-6" style={{ background: 'rgba(27,46,75,0.3)', backdropFilter: 'blur(12px)' }}>
                        <div className="w-full max-w-xs rounded-3xl p-6 text-center animate-fade-in"
                            style={{ background: '#FFFFFF', border: '1px solid #F0EBE1', boxShadow: '0 20px 60px rgba(27,46,75,0.15)' }}>
                            <div className="mb-3" style={{ color: theme.ring }}>{FI.pause(40, theme.ring)}</div>
                            <h3 className="text-base font-black mb-0.5" style={{ color: '#1B2E4B' }}>暂停学习</h3>
                            <p className="text-xs mb-5" style={{ color: '#9CAABE' }}>已学习 {eM > 0 ? `${eM}分` : ''}{eS}秒</p>
                            <div className="space-y-2.5">
                                <button onClick={() => setShowTimerLeaveConfirm(false)}
                                    className="w-full py-3.5 rounded-2xl font-black text-sm transition-all active:scale-[0.97]"
                                    style={{ background: theme.ring, color: '#FFFFFF', boxShadow: `0 4px 15px ${theme.ringGlow}` }}>
                                    <span className="inline-flex items-center gap-1.5">{FI.play(14,'#fff')} 继续学习</span>
                                </button>
                                <button onClick={handleTimerSaveAndLeave}
                                    className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.97]"
                                    style={{ background: '#F0EBE1', color: '#5A6E8A' }}>
                                    <span className="inline-flex items-center gap-1.5">{FI.save(14,'#5A6E8A')} 保存并离开</span>
                                </button>
                                <button onClick={clearTimerState}
                                    className="w-full py-2 font-bold text-[11px] transition-all"
                                    style={{ color: '#D0C9BD' }}>
                                    放弃本次
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <div className="relative z-10 w-full h-full md:h-auto md:max-h-[90vh] md:max-w-lg flex flex-col md:rounded-3xl overflow-hidden transition-colors duration-500"
                style={{ background: theme.bg, boxShadow: '0 20px 60px rgba(27,46,75,0.15)' }}>

                {/* Top bar */}
                <div className="shrink-0 px-5 pt-4 pb-2 flex items-center justify-between"
                    style={{ paddingTop: 'max(env(safe-area-inset-top, 16px), 16px)' }}>
                    <button onClick={handleTimerBack}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                        style={{ background: `${theme.ring}18`, color: theme.textMain }}>
                        {FI.arrowLeft(18, theme.textMain)}
                    </button>
                    <h2 className="font-black text-sm" style={{ color: theme.textMain }}>{task.title}</h2>
                    <button onClick={() => clearTimerState()}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                        style={{ background: `${theme.ring}18`, color: theme.textMain }}>
                        {FI.close(18, theme.textMain)}
                    </button>
                </div>

                {/* Mode tabs */}
                <div className="shrink-0 mx-5 mt-2 mb-4 rounded-2xl p-1.5 flex gap-1" style={{ background: `${theme.ring}12` }}>
                    {modeTabs.map(tab => {
                        const isActive = activeMode === tab.id;
                        return (
                            <button key={tab.id} onClick={() => switchTab(tab.id)} disabled={!canSwitchMode}
                                className={`flex-1 py-2.5 px-2 rounded-xl font-black text-xs transition-all ${canSwitchMode ? 'active:scale-[0.96]' : ''}`}
                                style={{
                                    background: isActive ? '#FFFFFF' : 'transparent',
                                    color: isActive ? theme.textMain : `${theme.textMain}60`,
                                    boxShadow: isActive ? `0 2px 8px ${theme.ringGlow}` : 'none',
                                    opacity: !canSwitchMode && !isActive ? 0.4 : 1,
                                }}>
                                <span className="inline-flex items-center gap-1">{tab.icon(13, isActive ? theme.textMain : `${theme.textMain}60`)} {tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Main content */}
                <div className="flex-1 overflow-y-auto flex flex-col items-center px-6 min-h-0">
                    <div className="w-full rounded-3xl p-6 flex flex-col items-center mb-4 transition-colors duration-500" style={{ background: theme.card }}>
                        {activeMode === 'pomodoro' && isRunning && (
                            <div className="text-sm font-black mb-2 flex items-center gap-1.5" style={{ color: theme.textMain }}>
                                {pomodoroIsBreak ? FI.cup(16, theme.textMain) : FI.flame(16, theme.textMain)}
                                {pomodoroIsBreak ? '休息时间' : '专注时间'}
                            </div>
                        )}
                        {activeMode === 'pomodoro' && (
                            <div className="flex items-center justify-center gap-2 mb-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="w-3.5 h-3.5 rounded-full transition-all duration-500" style={{
                                        background: isRunning && i < pomodoroSession - (pomodoroIsBreak ? 0 : 1) ? theme.ring
                                            : isRunning && i === pomodoroSession - (pomodoroIsBreak ? 0 : 1) ? `${theme.ring}50` : `${theme.ring}25`,
                                        boxShadow: isRunning && i < pomodoroSession - (pomodoroIsBreak ? 0 : 1) ? `0 0 6px ${theme.ringGlow}` : 'none',
                                    }} />
                                ))}
                            </div>
                        )}
                        <div className="font-black tracking-tight" style={{
                            color: theme.textMain,
                            fontSize: dHrs > 0 ? 52 : 72,
                            fontFamily: "'SF Mono', 'Menlo', 'Courier New', monospace",
                            letterSpacing: '-0.02em',
                            lineHeight: 1,
                        }}>
                            {dHrs > 0 ? `${String(dHrs).padStart(2,'0')}:` : ''}
                            {String(dMins).padStart(2, '0')}:{String(dSecs).padStart(2, '0')}
                        </div>
                        {isRunning && (
                            <div className="mt-3 flex items-center gap-2">
                                <span className="text-xs font-bold" style={{ color: `${theme.textMain}80` }}>
                                    {activeMode === 'pomodoro' ? `第 ${pomodoroSession} 轮` : (activeMode === 'forward' ? '已学习' : '剩余')}
                                </span>
                                {timerPaused && (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse" style={{ background: '#FFFFFF', color: theme.ring }}>已暂停</span>
                                )}
                            </div>
                        )}
                        {isRunning && activeMode !== 'forward' && (
                            <div className="w-full mt-4">
                                <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: `${theme.ring}20` }}>
                                    <div className="h-full rounded-full transition-all duration-1000 ease-linear"
                                        style={{ width: `${Math.min(100, progress * 100)}%`, background: theme.ring, boxShadow: `0 0 8px ${theme.ringGlow}` }} />
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => { if (!isRunning) { startMode(activeMode); } else { setTimerPaused(!timerPaused); } }}
                            className="mt-5 w-full max-w-[240px] py-4 rounded-2xl font-black text-lg uppercase tracking-wider transition-all active:scale-[0.95]"
                            style={{ background: '#FFFFFF', color: theme.btnBg, boxShadow: `0 6px 20px ${theme.ringGlow}`, letterSpacing: '0.15em' }}>
                            {!isRunning ? 'START' : timerPaused ? <span className="inline-flex items-center gap-1.5">{FI.play(18, theme.btnBg)} 继续</span> : <span className="inline-flex items-center gap-1.5">{FI.pause(18, theme.btnBg)} 暂停</span>}
                        </button>
                    </div>

                    {isRunning && activeMode === 'pomodoro' && (
                        <button onClick={skipPomodoroStage}
                            className="mb-3 py-2 px-6 rounded-xl font-bold text-sm transition-all active:scale-[0.97]"
                            style={{ background: `${theme.ring}12`, color: theme.textSub }}>
                            <span className="inline-flex items-center gap-1">{FI.skip(14, theme.textSub)} 跳过{pomodoroIsBreak ? '休息' : '专注'}</span>
                        </button>
                    )}

                    <div className="flex items-center gap-3 mb-3 mt-1 w-full max-w-sm">
                        <div className="flex-1 h-px" style={{ background: `${theme.ring}20` }} />
                        <span className="text-xs font-bold" style={{ color: theme.textSub }}>
                            <span className="inline-flex items-center gap-1">{FI.clipboard(12, theme.textSub)} {task.category || '任务详情'}</span>
                        </span>
                        <div className="flex-1 h-px" style={{ background: `${theme.ring}20` }} />
                    </div>

                    <div className="w-full max-w-sm rounded-2xl p-4 mb-4" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                        <h3 className="font-black text-sm mb-1" style={{ color: '#1B2E4B' }}>{task.title}</h3>
                        {taskTimeStr && <p className="text-xs flex items-center gap-1 mb-1" style={{ color: '#9CAABE' }}>{FI.clock(12,'#9CAABE')} {taskTimeStr}</p>}
                        {taskDesc && <p className="text-sm leading-relaxed whitespace-pre-wrap mt-1" style={{ color: '#5A6E8A' }}>{taskDesc}</p>}
                        {taskAttachments.length > 0 && (
                            <div className="flex gap-2 mt-3 flex-wrap">
                                {taskAttachments.map((att, i) => {
                                    const src = typeof att === 'string' ? att : (att.data || att.url || '');
                                    return src ? (
                                        <img key={i} src={src} className="w-16 h-16 rounded-xl object-cover cursor-pointer hover:scale-105 transition-all"
                                            style={{ border: '2px solid #FFE8D0' }}
                                            onClick={() => { setPreviewImages(taskAttachments.map(a => typeof a === 'string' ? a : (a.data || a.url || ''))); setPreviewImageIndex(i); setShowImagePreviewModal(true); }} />
                                    ) : null;
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                {isRunning && (
                    <div className="shrink-0 px-5 py-3"
                        style={{ borderTop: `1px solid ${theme.ring}15`, paddingBottom: 'max(0.75rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))' }}>
                        <button onClick={finishTimer}
                            className="w-full py-3.5 rounded-2xl font-black text-sm transition-all active:scale-[0.97]"
                            style={{ background: '#E8F5E9', color: '#4CAF50', border: '1px solid #C8E6C9' }}>
                            <span className="inline-flex items-center gap-1.5">{FI.check(16,'#4CAF50')} 完成学习</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
