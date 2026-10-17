/**
 * Custom cursor removed - native browser cursor restored globally across the entire website.
 */
export function initPrecisionCursor() {
    const cursor = document.getElementById('precision-cursor');
    const ring = document.getElementById('precision-cursor-ring');
    if (cursor) cursor.remove();
    if (ring) ring.remove();
}
