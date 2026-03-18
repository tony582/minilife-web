import { useState } from 'react';
import { apiFetch } from '../api/client';

export const useKids = (kids, setKids, activeKidId, setActiveKidId, notify) => {

    const changeActiveKid = (newKidId) => {
        setActiveKidId(newKidId);
        if (newKidId) localStorage.setItem('minilife_activeKidId', newKidId);
        else localStorage.removeItem('minilife_activeKidId');
    };

    const activeKid = kids.find(k => String(k.id) === String(activeKidId)) || kids[0];

    const updateActiveKid = async (updates) => {
        try {
            await apiFetch(`/api/kids/${activeKidId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates)
            });
            setKids(kids.map(k => k.id === activeKidId ? { ...k, ...updates } : k));
        } catch (e) {
            console.error(e);
            notify("网络请求失败", "error");
        }
    };

    const updateKidData = async (targetKidId, updates) => {
        try {
            await apiFetch(`/api/kids/${targetKidId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates)
            });
            setKids(prevKids => prevKids.map(k => k.id === targetKidId ? { ...k, ...updates } : k));
        } catch (e) {
            console.error(e);
            notify("网络请求失败", "error");
        }
    };

    return {
        activeKid,
        changeActiveKid,
        updateActiveKid,
        updateKidData
    };
};
