import React, { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Reorderable list with smooth "squeeze open" insertion animation.
 * 
 * Strategy: keep DOM order stable, use a CSS-animated gap placeholder
 * at the insertion point. No array reordering during drag = no flicker.
 *
 * Desktop: HTML5 drag-and-drop with custom dragImage
 * Mobile: long-press to initiate touch drag with floating clone
 * 
 * IMPORTANT: Touch event listeners are added via native addEventListener
 * with { passive: false } so that preventDefault() actually blocks
 * the browser's native scroll during touch drag.
 */
export const ReorderableList = ({ items, onReorder, renderItem, keyExtractor }) => {
    const [dragIdx, setDragIdx] = useState(null);
    const [insertIdx, setInsertIdx] = useState(null);
    const containerRef = useRef(null);
    const itemHeightRef = useRef(64);

    // All mutable touch state in a single ref to avoid stale closures
    const stateRef = useRef({
        active: false,
        timer: null,
        clone: null,
        startY: 0,
        cloneStartTop: 0,
        dragIdx: null,
        insertIdx: null,
        rects: [],
    });

    // Keep stateRef in sync with React state
    useEffect(() => { stateRef.current.dragIdx = dragIdx; }, [dragIdx]);
    useEffect(() => { stateRef.current.insertIdx = insertIdx; }, [insertIdx]);

    // Measure item rects
    const captureRects = useCallback(() => {
        if (!containerRef.current) return;
        const children = containerRef.current.querySelectorAll('[data-ri]');
        const rects = [];
        children.forEach(el => {
            const r = el.getBoundingClientRect();
            rects.push({ top: r.top, bottom: r.bottom, mid: r.top + r.height / 2, height: r.height });
        });
        stateRef.current.rects = rects;
        if (rects.length > 0) itemHeightRef.current = rects[0].height;
        return rects;
    }, []);

    // ============ DESKTOP HTML5 DRAG ============
    const handleDragStart = useCallback((e, index) => {
        setDragIdx(index);
        setInsertIdx(index);

        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const dragImage = el.cloneNode(true);
        dragImage.style.cssText = `
            position: absolute; top: -9999px; left: -9999px;
            width: ${rect.width}px;
            box-shadow: 0 16px 48px rgba(0,0,0,0.15);
            border-radius: 0.75rem; background: white;
            opacity: 0.95; transform: scale(1.02);
        `;
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, rect.width / 2, rect.height / 2);
        e.dataTransfer.effectAllowed = 'move';
        requestAnimationFrame(() => setTimeout(() => dragImage.remove(), 100));
        captureRects();
    }, [captureRects]);

    const handleDragOver = useCallback((e) => {
        const curDragIdx = stateRef.current.dragIdx;
        if (curDragIdx === null) return; // Don't interfere with normal scrolling
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const rects = stateRef.current.rects;
        if (!rects.length) return;
        const clientY = e.clientY;

        // Auto-scroll the scrollable container on desktop drag
        const scrollEl = containerRef.current?.closest('.overflow-y-auto');
        if (scrollEl) {
            const sr = scrollEl.getBoundingClientRect();
            if (clientY < sr.top + 50) scrollEl.scrollTop -= 8;
            else if (clientY > sr.bottom - 50) scrollEl.scrollTop += 8;
        }

        let newInsert = curDragIdx;
        for (let i = 0; i < rects.length; i++) {
            if (clientY < rects[i].mid) { newInsert = i; break; }
            newInsert = i + 1;
        }
        if (newInsert === curDragIdx || newInsert === curDragIdx + 1) newInsert = curDragIdx;
        setInsertIdx(newInsert);
    }, []);

    const handleDragEnd = useCallback(() => {
        const s = stateRef.current;
        if (s.dragIdx !== null && s.insertIdx !== null && s.insertIdx !== s.dragIdx && s.insertIdx !== s.dragIdx + 1) {
            const targetIdx = s.insertIdx > s.dragIdx ? s.insertIdx - 1 : s.insertIdx;
            onReorder(s.dragIdx, targetIdx);
        }
        setDragIdx(null);
        setInsertIdx(null);
    }, [onReorder]);

    // ============ TOUCH DRAG (native event listeners) ============
    // These are registered via useEffect with { passive: false } so
    // preventDefault() actually prevents the browser scroll.

    const touchStartHandler = useCallback((e) => {
        // Find which item was touched
        const itemEl = e.target.closest('[data-ri]');
        if (!itemEl) return;
        const index = parseInt(itemEl.getAttribute('data-ri'), 10);

        const s = stateRef.current;
        s.startY = e.touches[0].clientY;
        s.active = false;

        s.timer = setTimeout(() => {
            s.active = true;
            s.dragIdx = index;
            s.insertIdx = index;
            setDragIdx(index);
            setInsertIdx(index);
            captureRects();

            // Create floating clone
            const rect = itemEl.getBoundingClientRect();
            const clone = itemEl.cloneNode(true);
            clone.style.cssText = `
                position: fixed; left: ${rect.left}px; top: ${rect.top}px;
                width: ${rect.width}px; height: ${rect.height}px;
                z-index: 9999; pointer-events: none;
                box-shadow: 0 20px 60px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.1);
                border-radius: 0.75rem; opacity: 0.95;
                transform: scale(1.02); background: white;
            `;
            document.body.appendChild(clone);
            s.clone = clone;
            s.cloneStartTop = rect.top;

            if (navigator.vibrate) navigator.vibrate(25);
        }, 200);
    }, [captureRects]);

    const touchMoveHandler = useCallback((e) => {
        const s = stateRef.current;
        if (!s.active) {
            // Cancel long-press if finger moved too much
            if (Math.abs(e.touches[0].clientY - s.startY) > 8) {
                clearTimeout(s.timer);
            }
            return;
        }

        // *** THIS is the key line — must be non-passive to work ***
        e.preventDefault();

        const clientY = e.touches[0].clientY;
        const dy = clientY - s.startY;

        // Move clone
        if (s.clone) {
            s.clone.style.top = `${s.cloneStartTop + dy}px`;
        }

        // Auto-scroll the modal body
        const scrollEl = containerRef.current?.closest('.overflow-y-auto');
        if (scrollEl) {
            const sr = scrollEl.getBoundingClientRect();
            if (clientY < sr.top + 50) scrollEl.scrollTop -= 6;
            else if (clientY > sr.bottom - 50) scrollEl.scrollTop += 6;
        }

        // Calculate insert position
        const rects = s.rects;
        const curDragIdx = s.dragIdx;
        let newInsert = curDragIdx;
        for (let i = 0; i < rects.length; i++) {
            if (clientY < rects[i].mid) { newInsert = i; break; }
            newInsert = i + 1;
        }
        if (newInsert === curDragIdx || newInsert === curDragIdx + 1) newInsert = curDragIdx;
        s.insertIdx = newInsert;
        setInsertIdx(newInsert);
    }, []);

    const touchEndHandler = useCallback(() => {
        const s = stateRef.current;
        clearTimeout(s.timer);
        if (s.clone) { s.clone.remove(); s.clone = null; }

        if (s.active && s.dragIdx !== null && s.insertIdx !== null && s.insertIdx !== s.dragIdx && s.insertIdx !== s.dragIdx + 1) {
            const targetIdx = s.insertIdx > s.dragIdx ? s.insertIdx - 1 : s.insertIdx;
            onReorder(s.dragIdx, targetIdx);
        }

        s.active = false;
        s.dragIdx = null;
        s.insertIdx = null;
        setDragIdx(null);
        setInsertIdx(null);
    }, [onReorder]);

    // Register native touch + dragover listeners with { passive: false }
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener('touchstart', touchStartHandler, { passive: true });
        el.addEventListener('touchmove', touchMoveHandler, { passive: false });
        el.addEventListener('touchend', touchEndHandler, { passive: true });
        el.addEventListener('touchcancel', touchEndHandler, { passive: true });
        el.addEventListener('dragover', handleDragOver, { passive: false });
        return () => {
            el.removeEventListener('touchstart', touchStartHandler);
            el.removeEventListener('touchmove', touchMoveHandler);
            el.removeEventListener('touchend', touchEndHandler);
            el.removeEventListener('touchcancel', touchEndHandler);
            el.removeEventListener('dragover', handleDragOver);
        };
    }, [touchStartHandler, touchMoveHandler, touchEndHandler, handleDragOver]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            const s = stateRef.current;
            clearTimeout(s.timer);
            if (s.clone) s.clone.remove();
        };
    }, []);

    const isDragging = dragIdx !== null;
    const showGap = isDragging && insertIdx !== null && insertIdx !== dragIdx && insertIdx !== dragIdx + 1;
    const gapHeight = itemHeightRef.current + 10;

    return (
        <div
            ref={containerRef}
            style={isDragging ? { touchAction: 'none' } : undefined}
        >
            {items.map((item, index) => {
                const key = keyExtractor(item);
                const isBeingDragged = dragIdx === index;
                const gapBefore = showGap && insertIdx === index;
                const gapAfter = showGap && index === items.length - 1 && insertIdx === items.length;

                return (
                    <React.Fragment key={key}>
                        {gapBefore && (
                            <div
                                className="overflow-hidden transition-all duration-200 ease-out"
                                style={{ height: gapHeight }}
                            >
                                <div className="flex items-center gap-2 px-4 h-full">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-sm shadow-indigo-300"></div>
                                    <div className="flex-1 h-[2px] bg-indigo-400 rounded-full"></div>
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-sm shadow-indigo-300"></div>
                                </div>
                            </div>
                        )}

                        <div
                            data-ri={index}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`mb-2.5 transition-all duration-200 ease-out ${
                                isBeingDragged
                                    ? 'opacity-30 scale-[0.97] ring-2 ring-indigo-200 rounded-xl'
                                    : ''
                            }`}
                        >
                            {renderItem(item, index, isBeingDragged)}
                        </div>

                        {gapAfter && (
                            <div
                                className="overflow-hidden transition-all duration-200 ease-out"
                                style={{ height: gapHeight }}
                            >
                                <div className="flex items-center gap-2 px-4 h-full">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-sm shadow-indigo-300"></div>
                                    <div className="flex-1 h-[2px] bg-indigo-400 rounded-full"></div>
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-sm shadow-indigo-300"></div>
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};
