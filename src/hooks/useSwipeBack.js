import { useRef, useCallback, useEffect } from 'react';

/**
 * useSwipeBack — right-swipe gesture to close modals on mobile.
 *
 * Usage:
 *   const { swipeRef, swipeHandlers } = useSwipeBack(onClose);
 *   <div ref={swipeRef} {...swipeHandlers} style={yourStyles}>
 *
 * - Detects right-swipe starting from 30px–40% of the screen
 *   (avoids the browser's own edge-swipe zone)
 * - The modal follows the finger in real-time (translateX)
 * - If swiped > 30% of screen width, closes on release
 * - Otherwise snaps back with a spring animation
 * - Uses touch-action CSS + preventDefault to block browser back-navigation
 */
export const useSwipeBack = (onClose, { threshold = 0.3, enabled = true } = {}) => {
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const isTracking = useRef(false);
  const isHorizontal = useRef(null); // null = undecided, true = horizontal, false = vertical
  const elRef = useRef(null);

  // Attach a non-passive touchmove listener so we can preventDefault
  // (React's onTouchMove is passive by default, so preventDefault won't work)
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const handleTouchMove = (e) => {
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

      // Block browser back-swipe as soon as we confirm horizontal
      e.preventDefault();
      e.stopPropagation();

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
    };

    // { passive: false } is critical — allows preventDefault to work
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', handleTouchMove);
  }, []);

  const onTouchStart = useCallback((e) => {
    if (!enabled) return;
    const touch = e.touches[0];
    const x = touch.clientX;
    // Skip the leftmost 30px (browser edge-swipe zone) and anything past 40%
    if (x < 30 || x > window.innerWidth * 0.4) return;
    startX.current = x;
    startY.current = touch.clientY;
    currentX.current = 0;
    isTracking.current = true;
    isHorizontal.current = null;
    // Remove transition during drag for real-time feel
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
    // Add touch-action CSS to prevent browser horizontal gestures
    if (node) {
      node.style.touchAction = 'pan-y';
    }
  }, []);

  return {
    swipeRef,
    swipeHandlers: {
      onTouchStart,
      onTouchEnd,
      // Note: onTouchMove is handled via native addEventListener (non-passive)
      // so it's NOT in the React handlers here.
    },
  };
};
