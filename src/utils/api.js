// src/utils/api.js

export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem('minilife_token');
    if (token) {
        options.headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
    }
    const res = await fetch(`${API_BASE}${url}`, options);
    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('minilife_token');
        window.location.reload();
    }
    return res;
};
