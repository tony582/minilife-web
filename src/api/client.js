export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem('minilife_token');
    if (token) {
        options.headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
    }
    try {
        const res = await fetch(`${API_BASE}${url}`, options);
        // Only auto-logout on 401 from /api/me (genuine token expiry)
        // Don't logout on 403 (could be permission issue) or network errors
        if (res.status === 401 && url === '/api/me') {
            localStorage.removeItem('minilife_token');
            window.location.reload();
        }
        return res;
    } catch (err) {
        // Network error (offline, switching apps, WiFi reconnecting)
        // Don't clear token — just throw so caller can handle
        console.warn('[apiFetch] Network error:', url, err.message);
        throw err;
    }
};

/** Safely parse JSON from a response — returns { error: '...' } if not JSON */
export const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
        return { error: '服务器响应异常，请稍后重试' };
    }
    try {
        return await res.json();
    } catch {
        return { error: '服务器响应异常' };
    }
};
