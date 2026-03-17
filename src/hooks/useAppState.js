import { useState } from 'react';

export const useAppState = () => {
    const [appState, setAppState] = useState(localStorage.getItem('minilife_appState') || 'profiles');

    const changeAppState = (newState) => {
        setAppState(newState);
        localStorage.setItem('minilife_appState', newState);
    };

    return { appState, changeAppState };
};
