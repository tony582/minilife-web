import { useRef, useCallback, useEffect } from 'react';

/**
 * useSwipeBack — right-swipe gesture to close modals on mobile.
 *
 * Two mechanisms:
 * 1. History API — pushes a fake history entry when modal is open.
 *    If the user triggers iOS/Android browser back (edge swipe or back button),
 *    it pops our entry and closes the modal instead of navigating.
 * 2. Touch swipe — detects right-swipe from the left 15–40% of screen
 *    with a follow-finger animation. Closes if swiped > 30%.
 */
export const useSwipeBack = (onClose, { threshold = 0.3, enabled = true } = {}) => {
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const isTracking = useRef(false);
  const isHorizontal = useRef(null);
  const elRef = useRef(null);
  const historyPushed = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // ─── History API: catch browser back gesture / back button ───
  useEffect(() => {
    if (!enabled) return;

    // Push a dummy history entry so back gesture closes the modal
    const modalId = 'modal-' + Date.now();
    history.pushState({ modalId }, '');
    historyPushed.current = true;

    const handlePopState = (e) => {
      // Browser went back — close the modal
      if (historyPushed.current) {
        historyPushed.current = false;
        onCloseRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Clean up: if modal closes normally (not via back), pop the fake entry
      if (historyPushed.current) {
        historyPushed.current = false;
        history.back();
      }
    };
  }, [enabled]);

  // ─── Touch swipe: follow-finger animation ───
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const handleTouchMove = (e) => {
      if (!isTracking.current) return;
      const touch = e.touches[0];
      const dx = touch.clientX - startX.current;
      const dy = touch.clientY - startY.current;

      if (isHorizontal.current === null) {
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        if (absDx < 10 && absDy < 10) return;
        isHorizontal.current = absDx > absDy * 1.5;
        if (!isHorizontal.current) {
          isTracking.current = false;
          return;
        }
      }

      e.preventDefault();
      e.stopPropagation();

      if (dx <= 0) {
        currentX.current = 0;
        if (elRef.current) {
          elRef.current.style.transform = 'translateX(0)';
          elRef.current.style.opacity = '1';
        }
        return;
      }

      currentX.current = dx;
      const progress = Math.min(dx / window.innerWidth, 1);

      if (elRef.current) {
        elRef.current.style.transform = `translateX(${dx}px)`;
        elRef.current.style.opacity = `${1 - progress * 0.4}`;
      }
    };

    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', handleTouchMove);
  }, []);

  const onTouchStart = useCallback((e) => {
    if (!enabled) return;
    const touch = e.touches[0];
    const x = touch.clientX;
    // Avoid browser edge zone (0–50px) and only allow left 40% of screen
    if (x < 50 || x > window.innerWidth * 0.4) return;
    startX.current = x;
    startY.current = touch.clientY;
    currentX.current = 0;
    isTracking.current = true;
    isHorizontal.current = null;
    if (elRef.current) {
      elRef.current.style.transition = 'none';
    }
  }, [enabled]);

  const onTouchEnd = useCallback(() => {
    if (!isTracking.current) return;
    isTracking.current = false;
    const dx = currentX.current;
    const screenW = window.innerWidth;
    const progress = dx / screenW;

    if (progress > threshold) {
      if (elRef.current) {
        elRef.current.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
        elRef.current.style.transform = `translateX(${screenW}px)`;
        elRef.current.style.opacity = '0';
      }
      setTimeout(() => {
        onCloseRef.current();
        if (elRef.current) {
          elRef.current.style.transition = '';
          elRef.current.style.transform = '';
          elRef.current.style.opacity = '';
        }
      }, 200);
    } else {
      if (elRef.current) {
        elRef.current.style.transition = 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.25s ease';
        elRef.current.style.transform = 'translateX(0)';
        elRef.current.style.opacity = '1';
        setTimeout(() => {
          if (elRef.current) {
            elRef.current.style.transition = '';
          }
        }, 260);
      }
    }
    currentX.current = 0;
  }, [threshold]);

  const swipeRef = useCallback((node) => {
    elRef.current = node;
    if (node) {
      node.style.touchAction = 'pan-y';
    }
  }, []);

  return {
    swipeRef,
    swipeHandlers: {
      onTouchStart,
      onTouchEnd,
    },
  };
};
