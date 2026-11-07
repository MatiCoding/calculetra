import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Tile } from '../../domain/cifras/typesCifras';

const DRAG_THRESHOLD = 6;   // How far the pointer has to move before a press becomes a drag.
const EDGE = 70;    // Near the top or bottom edge of the screen, the page scrolls while dragging.
const SCROLL_SPEED = 12;

type Press = { tile: Tile; startX: number; startY: number; offsetX: number; offsetY: number };
export type Drag = Press & { x: number; y: number; overId: number | null };

// The id of the tree leaf under the pointer, if there is one.
function leafAt(x: number, y: number): number | null {
    const leaf = document.elementFromPoint(x, y)?.closest('[data-leaf]');
    return leaf ? Number(leaf.getAttribute('data-leaf')) : null;
}

// Drags a tile from the board and drops it onto a leaf of the tree.
export function useDragToSwap(onDrop: (oldTileId: number, newTileId: number) => void) {
    const [drag, setDrag] = useState<Drag | null>(null);
    const press = useRef<Press | null>(null);
    const dragRef = useRef<Drag | null>(null);
    const justDragged = useRef(false);
    const onDropRef = useRef(onDrop);

    useEffect(() => {
        onDropRef.current = onDrop;
    });

    function update(next: Drag | null) {
        dragRef.current = next;
        setDrag(next);
    }

    useEffect(() => {
        function onMove(event: PointerEvent) {
            const current = press.current;
            if (current === null) {
                return;
            }
            const distance = Math.hypot(event.clientX - current.startX, event.clientY - current.startY);
            if (dragRef.current === null && distance < DRAG_THRESHOLD) {
                return;
            }
            update({ ...current, x: event.clientX, y: event.clientY, overId: leafAt(event.clientX, event.clientY) });
        }

        function onUp() {
            const dropped = dragRef.current;
            press.current = null;
            update(null);
            if (dropped === null) {
                return;
            }
            justDragged.current = true; // The click that comes after the drag must not select the tile.
            setTimeout(() => {
                justDragged.current = false;
            });
            if (dropped.overId !== null) {
                onDropRef.current(dropped.overId, dropped.tile.id);
            }
        }

        function onCancel() {
            press.current = null;
            update(null);
        }

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onCancel);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onCancel);
        };
    }, []);

    const dragging = drag !== null;
    useEffect(() => {
        if (!dragging) {
            return;
        }
        let frame = requestAnimationFrame(function scroll() {
            const current = dragRef.current;
            if (current !== null) {
                const direction = current.y > window.innerHeight - EDGE ? 1 : current.y < EDGE ? -1 : 0;
                if (direction !== 0) {
                    window.scrollBy(0, direction * SCROLL_SPEED);
                    const overId = leafAt(current.x, current.y);    // The page moved under the pointer, so the leaf under it may be another one.
                    if (overId !== current.overId) {
                        update({ ...current, overId });
                    }
                }
            }
            frame = requestAnimationFrame(scroll);
        });
        return () => cancelAnimationFrame(frame);
    }, [dragging]);

    function startPress(event: ReactPointerEvent<HTMLElement>, tile: Tile) {
        const rect = event.currentTarget.getBoundingClientRect();
        press.current = {
            tile,
            startX: event.clientX,
            startY: event.clientY,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top,
        };
    }

    // True right after a drag, so the click that follows can be ignored.
    function wasDragged() {
        return justDragged.current;
    }

    return { drag, startPress, wasDragged };
}