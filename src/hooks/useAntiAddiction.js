// ═══════════════════════════════════════════════════════════
// useAntiAddiction — daily pet interaction time limiter
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch } from '../api/client';

const DAILY_LIMIT_SECONDS = 15 * 60;       // 15 min default
const SESSION_WARN_SECONDS = 5 * 60;       // warn after 5 min continuous
const TASK_BONUS_SECONDS = 2 * 60;         // 2 min per completed task

export function useAntiAddiction(kidId, completedTasksToday = 0) {
    const [usedSeconds, setUsedSeconds] = useState(0);
    const [sessionSeconds, setSessionSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);  // currently in room?
    const [showWarning, setShowWarning] = useState(false);
    const sessionStartRef = useRef(null);
    const tickRef = useRef(null);

    const bonusSeconds = completedTasksToday * TASK_BONUS_SECONDS;
    const limitSeconds = DAILY_LIMIT_SECONDS + bonusSeconds;
    const remainingSeconds = Math.max(0, limitSeconds - usedSeconds);
    const isLocked = remainingSeconds <= 0;
    const warningThreshold = SESSION_WARN_SECONDS;

    // ── Load today's usage from API ──────────────────────────────────
    useEffect(() => {
        if (!kidId) return;
        apiFetch(`/api/pet/interaction/today?kidId=${kidId}`)
            .then(data => setUsedSeconds(data?.totalSeconds ?? 0))
            .catch(() => {});
    }, [kidId]);

    // ── Start tracking session ───────────────────────────────────────
    const startSession = useCallback(() => {
        if (isLocked) return false;
        sessionStartRef.current = Date.now();
        setSessionSeconds(0);
        setIsActive(true);
        setShowWarning(false);

        tickRef.current = setInterval(() => {
            setSessionSeconds(prev => {
                const next = prev + 1;
                if (next === warningThreshold) setShowWarning(true);
                return next;
            });
            setUsedSeconds(prev => prev + 1);
        }, 1000);

        return true;
    }, [isLocked, warningThreshold]);

    // ── End tracking session and persist ────────────────────────────
    const endSession = useCallback(async () => {
        clearInterval(tickRef.current);
        setIsActive(false);
        const duration = sessionStartRef.current
            ? Math.round((Date.now() - sessionStartRef.current) / 1000)
            : 0;
        sessionStartRef.current = null;
        setSessionSeconds(0);
        setShowWarning(false);

        if (duration > 0 && kidId) {
            try {
                await apiFetch('/api/pet/interaction', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ kidId, durationSeconds: duration }),
                });
            } catch (e) {
                console.error('[useAntiAddiction] persist failed:', e);
            }
        }
    }, [kidId]);

    // Cleanup on unmount
    useEffect(() => () => clearInterval(tickRef.current), []);

    const dismissWarning = useCallback(() => setShowWarning(false), []);

    return {
        usedSeconds,
        sessionSeconds,
        remainingSeconds,
        limitSeconds,
        bonusSeconds,
        isLocked,
        isActive,
        showWarning,
        startSession,
        endSession,
        dismissWarning,
        // Formatted helpers
        remainingLabel: formatTime(remainingSeconds),
        usedLabel: formatTime(usedSeconds),
        progressPct: Math.min(100, (usedSeconds / limitSeconds) * 100),
    };
}

function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}
