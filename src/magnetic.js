/**
 * Magnetic Element Physics (Awwwards / Trion style)
 * Buttons, pills, and interactive elements smoothly gravitate toward the cursor when hovered.
 */
import gsap from 'gsap';

export function initMagneticElements(selector = '.float-btn, .nav-links > li > a, .service-item') {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return; // Ignore on touch

    const elements = document.querySelectorAll(selector);

    elements.forEach((el) => {
        // Exclude buttons, dropdown items, and menus from magnetic physics
        // Buttons use isolated CSS transitions so other animations continue uninterrupted
        if (el.classList.contains('btn') || el.closest('.btn') || el.closest('.dropdown-menu') || el.classList.contains('dropdown-item')) return;

        const strength = el.classList.contains('btn') ? 0.35 : 0.2;
        const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = (e.clientX - centerX) * strength;
            const deltaY = (e.clientY - centerY) * strength;

            xTo(deltaX);
            yTo(deltaY);
        });

        el.addEventListener('mouseleave', () => {
            xTo(0);
            yTo(0);
        });
    });
}
