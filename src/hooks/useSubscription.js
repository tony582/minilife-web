/**
 * useSubscription - 订阅状态检查 hook
 * 
 * Usage:
 *   const { isExpired, guardAction } = useSubscription();
 *   
 *   const handleAddTask = () => {
 *     if (guardAction()) return; // blocked if expired, paywall shown
 *     // ... normal logic
 *   };
 */
export const useSubscription = () => {
    const isExpired = window.__minilife_isExpired?.() ?? false;

    /** 
     * Call before any write operation.
     * Returns true if blocked (expired), false if OK to proceed.
     */
    const guardAction = () => {
        if (isExpired) {
            window.__minilife_showPaywall?.();
            return true; // blocked
        }
        return false; // OK
    };

    return { isExpired, guardAction };
};
