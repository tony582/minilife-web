/**
 * useFileUpload — XHR-based upload hook with real progress tracking.
 *
 * Returns:
 *   uploadFile(file, { onProgress }) → Promise<{url, name, type, size} | null>
 */
import { useState, useCallback } from 'react';

/**
 * Upload a single file via XHR so we get upload progress events.
 * @param {File} file
 * @param {{ onProgress?: (pct: number) => void, onError?: (msg: string) => void }} opts
 * @returns {Promise<{url,name,type,size}|null>}
 */
export const uploadFile = (file, { onProgress, onError } = {}) => {
    return new Promise((resolve) => {
        const token = localStorage.getItem('minilife_token');
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();

        // Real upload progress
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const pct = Math.round((e.loaded / e.total) * 100);
                onProgress?.(pct);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch {
                    onError?.('服务器返回格式错误');
                    resolve(null);
                }
            } else {
                let msg = `上传失败 (${xhr.status})`;
                try { msg = JSON.parse(xhr.responseText)?.error || msg; } catch { /* ignore */ }
                onError?.(msg);
                resolve(null);
            }
        };

        xhr.onerror = () => {
            onError?.('网络错误，上传失败');
            resolve(null);
        };

        xhr.open('POST', '/api/upload');
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
    });
};

/**
 * Hook to manage multiple concurrent uploads with progress state.
 *
 * Usage:
 *   const { uploadProgress, enqueueUpload } = useFileUpload();
 *
 *   // uploadProgress: { [tempId]: 0-100 }
 *   // enqueueUpload(file) → { tempId, promise }
 */
export const useFileUpload = () => {
    const [uploadProgress, setUploadProgress] = useState({}); // { tempId: 0-100 }

    const enqueueUpload = useCallback((file) => {
        const tempId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        setUploadProgress(prev => ({ ...prev, [tempId]: 0 }));

        const promise = uploadFile(file, {
            onProgress: (pct) => {
                setUploadProgress(prev => ({ ...prev, [tempId]: pct }));
            },
            onError: () => {
                setUploadProgress(prev => { const n = { ...prev }; delete n[tempId]; return n; });
            },
        }).then(result => {
            setUploadProgress(prev => { const n = { ...prev }; delete n[tempId]; return n; });
            return result;
        });

        return { tempId, promise };
    }, []);

    return { uploadProgress, enqueueUpload };
};
