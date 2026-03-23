import React from 'react';
import {
    DndContext,
    closestCenter,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * A single sortable item wrapper.
 */
const SortableItem = ({ id, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
        zIndex: isDragging ? 999 : 'auto',
        marginBottom: '0.625rem',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
};

/**
 * Reorderable list using @dnd-kit.
 * Works on both desktop (pointer) and mobile (touch) with proper scroll support.
 *
 * Props:
 * - items: array of items
 * - onReorder: (fromIndex, toIndex) => void
 * - renderItem: (item, index, isDragging) => ReactNode
 * - keyExtractor: (item) => string | number
 */
export const ReorderableList = ({ items, onReorder, renderItem, keyExtractor }) => {
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 500, tolerance: 15 },
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex(item => String(keyExtractor(item)) === String(active.id));
        const newIndex = items.findIndex(item => String(keyExtractor(item)) === String(over.id));

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            onReorder(oldIndex, newIndex);
        }
    };

    const itemIds = items.map(item => String(keyExtractor(item)));

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                {items.map((item, index) => (
                    <SortableItem key={keyExtractor(item)} id={String(keyExtractor(item))}>
                        {renderItem(item, index, false)}
                    </SortableItem>
                ))}
            </SortableContext>
        </DndContext>
    );
};
