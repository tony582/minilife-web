/**
 * MiniLife Frontend Error Reporter
 * Captures unhandled errors and sends them to the monitoring API.
 */

const ERROR_ENDPOINT = '/api/monitor/report-error';
const THROTTLE_MS = 10 * 1000; // Max 1 report per 10s for same error
const recentErrors = new Map();

function reportError(message, stack, extra = {}) {
    // Throttle duplicate errors
    const key = message?.substring(0, 100);
    if (recentErrors.has(key)) return;
    recentErrors.set(key, true);
    setTimeout(() => recentErrors.delete(key), THROTTLE_MS);

    const token = localStorage.getItem('minilife_token');
    const payload = {
        message: message || 'Unknown error',
        stack: stack || '',
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: '', // Will be filled by server from token
        extra,
    };

    // Use sendBeacon for reliability (works even during page unload)
    if (navigator.sendBeacon && !token) {
        navigator.sendBeacon(ERROR_ENDPOINT, JSON.stringify(payload));
    } else {
        fetch(ERROR_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
            keepalive: true, // Survives page navigation
        }).catch(() => {}); // Silently fail — we're already in an error state
    }
}

/**
 * Initialize global error handlers.
 * Call this once at app startup (e.g., in main.jsx).
 */
export function initErrorReporter() {
    // 1. Unhandled JS errors
    window.addEventListener('error', (event) => {
        // Ignore script loading errors (CORS, ad blockers, etc.)
        if (event.target && event.target !== window) return;
        reportError(
            event.message,
            event.error?.stack || `at ${event.filename}:${event.lineno}:${event.colno}`,
            { type: 'window.onerror' }
        );
    });

    // 2. Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason;
        reportError(
            error?.message || String(error),
            error?.stack || '',
            { type: 'unhandledrejection' }
        );
    });

    // 3. Fetch API errors (monkey-patch)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        try {
            const response = await originalFetch(...args);
            // Report 5xx server errors
            if (response.status >= 500) {
                const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
                // Don't report errors from the error reporting endpoint itself
                if (!url.includes('report-error') && !url.includes('health')) {
                    reportError(
                        `HTTP ${response.status} on ${response.url}`,
                        '',
                        { type: 'fetch_5xx', status: response.status, url }
                    );
                }
            }
            return response;
        } catch (err) {
            // Network errors (offline, CORS, etc.)
            const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
            if (!url.includes('report-error')) {
                reportError(
                    `Fetch failed: ${err.message}`,
                    err.stack,
                    { type: 'fetch_network', url }
                );
            }
            throw err;
        }
    };

    console.log('[MiniLife] Error reporter initialized.');
}

export { reportError };
