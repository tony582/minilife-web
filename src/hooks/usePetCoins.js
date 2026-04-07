// ═══════════════════════════════════════════════════════════
// usePetCoins — 家庭币扣除/退款 hook
// ═══════════════════════════════════════════════════════════
import { useCallback } from 'react';
import { useDataContext } from '../context/DataContext';
import { apiFetch } from '../api/client';

// 🛠 DEV_MODE: set true to get unlimited coins for testing
const DEV_MODE = true;

export function usePetCoins(kidId) {
    const { kids, setKids } = useDataContext();
    const kid = kids.find(k => k.id === kidId);
    const balance = DEV_MODE ? 999999 : (kid?.balances?.spend ?? 0);

    // ── Optimistically deduct from local state + persist ─────────────
    const spendCoins = useCallback(async (amount, description = '房间装饰') => {
        if (!kid) return { ok: false, reason: 'kid_not_found' };
        if (!DEV_MODE && balance < amount) return { ok: false, reason: 'insufficient', balance, required: amount };

        const newBalance = balance - amount;

        // Optimistic update
        setKids(prev => prev.map(k =>
            k.id === kidId
                ? { ...k, balances: { ...k.balances, spend: newBalance } }
                : k
        ));

        try {
            await apiFetch(`/api/kids/${kidId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ balances: { spend: newBalance } }),
            });
            // Log transaction (fire and forget)
            apiFetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id:       `pet_${kidId}_${Date.now()}`,
                    kidId,
                    type:     'expense',
                    amount:   -amount,
                    title:    description,
                    category: 'pet',
                    date:     new Date().toISOString().split('T')[0],
                }),
            }).catch(() => {});
            return { ok: true, newBalance };
        } catch (e) {
            // Rollback on failure
            setKids(prev => prev.map(k =>
                k.id === kidId
                    ? { ...k, balances: { ...k.balances, spend: balance } }
                    : k
            ));
            return { ok: false, reason: 'api_error' };
        }
    }, [kid, kidId, balance, setKids]);

    // ── Refund coins (e.g. furniture removal) ────────────────────────
    const refundCoins = useCallback(async (amount, description = '移除装饰退款') => {
        if (!kid) return { ok: false };
        const newBalance = balance + amount;
        setKids(prev => prev.map(k =>
            k.id === kidId
                ? { ...k, balances: { ...k.balances, spend: newBalance } }
                : k
        ));
        try {
            await apiFetch(`/api/kids/${kidId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ balances: { spend: newBalance } }),
            });
            return { ok: true, newBalance };
        } catch (e) {
            setKids(prev => prev.map(k =>
                k.id === kidId
                    ? { ...k, balances: { ...k.balances, spend: balance } }
                    : k
            ));
            return { ok: false };
        }
    }, [kid, kidId, balance, setKids]);

    return { balance, spendCoins, refundCoins };
}
