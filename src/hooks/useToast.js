import { useState } from 'react';

export const useToast = () => {
    const [notifications, setNotifications] = useState([]);

    const notify = (msg, type = 'info') => {
        const id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        setNotifications(p => [...p, { id, msg, type }]);
        setTimeout(() => setNotifications(p => p.filter(n => n.id !== id)), 3000);
    };

    return { notifications, notify, setNotifications };
};
