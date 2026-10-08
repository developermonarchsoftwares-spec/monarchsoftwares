/**
 * Smooth Interactive Precision Cursor (Awwwards / Apple Pro style)
 * Precision dot + responsive ambient glow ring with magnetic hover states.
 */
import gsap from 'gsap';

export function initPrecisionCursor() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return; // Ignore on touch

    // Create cursor elements
    let cursor = document.getElementById('precision-cursor');
    let ring = document.getElementById('precision-cursor-ring');

    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = 'precision-cursor';
        cursor.className = 'precision-cursor-dot';
        document.body.appendChild(cursor);
    }

    if (!ring) {
        ring = document.createElement('div');
        ring.id = 'precision-cursor-ring';
        ring.className = 'precision-cursor-ring';
        document.body.appendChild(ring);
    }

    // Set initial position offscreen
    gsap.set([cursor, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

    const dotX = gsap.quickTo(cursor, 'x', { duration: 0.12, ease: 'power2.out' });
    const dotY = gsap.quickTo(cursor, 'y', { duration: 0.12, ease: 'power2.out' });

    const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });

    let isVisible = false;

    window.addEventListener('mousemove', (e) => {
        if (!isVisible) {
            gsap.to([cursor, ring], { opacity: 1, duration: 0.3 });
            isVisible = true;
        }
        dotX(e.clientX);
        dotY(e.clientY);
        ringX(e.clientX);
        ringY(e.clientY);
    });

    window.addEventListener('mouseleave', () => {
        gsap.to([cursor, ring], { opacity: 0, duration: 0.25 });
        isVisible = false;
    });

    // Hover interactions
    const interactiveTargets = 'a, button, input, select, textarea, .service-item, .project-card, .tech-matrix-card';

    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest(interactiveTargets);
        if (target) {
            cursor.classList.add('cursor-hover');
            ring.classList.add('ring-hover');
        } else {
            cursor.classList.remove('cursor-hover');
            ring.classList.remove('ring-hover');
        }
    });
}
