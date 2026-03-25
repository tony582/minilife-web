import { useRef, useCallback } from 'react';

/**
 * useSwipeBack — right-swipe gesture to close modals on mobile.
 *
 * Usage:
 *   const { swipeHandlers, swipeStyle } = useSwipeBack(onClose);
 *   <div {...swipeHandlers} style={{ ...swipeStyle, ...yourStyles }}>
 *
 * - Detects right-swipe starting from the left 40% of the screen
 * - The modal follows the finger in real-time (translateX)
 * - If swiped > 30% of screen width, closes on release
 * - Otherwise snaps back with a spring animation
 */
export const useSwipeBack = (onClose, { threshold = 0.3, enabled = true } = {}) => {
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const isTracking = useRef(false);
  const isHorizontal = useRef(null); // null = undecided, true = horizontal, false = vertical
  const elRef = useRef(null);

  const onTouchStart = useCallback((e) => {
    if (!enabled) return;
    const touch = e.touches[0];
    // Only activate if touch starts in the left 40% of screen
    if (touch.clientX > window.innerWidth * 0.4) return;
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    currentX.current = 0;
    isTracking.current = true;
    isHorizontal.current = null;
    // Remove transition during drag for real-time feel
    if (elRef.current) {
      elRef.current.style.transition = 'none';
    }
  }, [enabled]);

  const onTouchMove = useCallback((e) => {
    if (!isTracking.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;

    // Determine direction on first significant move
    if (isHorizontal.current === null) {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (absDx < 8 && absDy < 8) return; // Too small to decide
      isHorizontal.current = absDx > absDy * 1.2; // Must be clearly horizontal
      if (!isHorizontal.current) {
        isTracking.current = false;
        return;
      }
    }

    // Only track rightward movement
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
      elRef.current.style.opacity = `${1 - progress * 0.5}`;
    }

    // Prevent vertical scroll while swiping horizontally
    if (progress > 0.05) {
      e.preventDefault();
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!isTracking.current) return;
    isTracking.current = false;
    const dx = currentX.current;
    const screenW = window.innerWidth;
    const progress = dx / screenW;

    if (progress > threshold) {
      // Swipe past threshold — animate out and close
      if (elRef.current) {
        elRef.current.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
        elRef.current.style.transform = `translateX(${screenW}px)`;
        elRef.current.style.opacity = '0';
      }
      setTimeout(() => {
        onClose();
        // Reset styles after close
        if (elRef.current) {
          elRef.current.style.transition = '';
          elRef.current.style.transform = '';
          elRef.current.style.opacity = '';
        }
      }, 200);
    } else {
      // Snap back
      if (elRef.current) {
        elRef.current.style.transition = 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.25s ease';
        elRef.current.style.transform = 'translateX(0)';
        elRef.current.style.opacity = '1';
        // Clean up transition after animation
        setTimeout(() => {
          if (elRef.current) {
            elRef.current.style.transition = '';
          }
        }, 260);
      }
    }
    currentX.current = 0;
  }, [onClose, threshold]);

  const swipeRef = useCallback((node) => {
    elRef.current = node;
  }, []);

  return {
    swipeRef,
    swipeHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
};
