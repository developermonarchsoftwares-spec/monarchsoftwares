/**
 * Hero robot: mouse-parallax tilt on top of the CSS float / glow-pulse animations.
 * Only runs for fine pointers and when the visitor has not asked for reduced motion;
 * everything else gets the static image (the float itself is also disabled in CSS).
 */
export function initHeroRobot(rootId = 'hero-robot') {
    const root = document.getElementById(rootId);
    if (!root) return;

    const canMove = window.matchMedia('(pointer: fine)').matches
        && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canMove) return;

    const hero = root.closest('.hero-editorial') || root;
    const MAX_SHIFT = 14; // px
    const MAX_TILT = 3.5; // deg
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;
    let visible = true;

    const apply = () => {
        frame = 0;
        current.x += (target.x - current.x) * 0.08;
        current.y += (target.y - current.y) * 0.08;
        root.style.setProperty('--robot-shift-x', `${(current.x * MAX_SHIFT).toFixed(2)}px`);
        root.style.setProperty('--robot-shift-y', `${(current.y * MAX_SHIFT * 0.6).toFixed(2)}px`);
        root.style.setProperty('--robot-tilt-y', `${(current.x * MAX_TILT).toFixed(2)}deg`);
        root.style.setProperty('--robot-tilt-x', `${(-current.y * MAX_TILT).toFixed(2)}deg`);
        if (Math.abs(target.x - current.x) > 0.001 || Math.abs(target.y - current.y) > 0.001) schedule();
    };
    const schedule = () => { if (!frame && visible) frame = requestAnimationFrame(apply); };

    const onMove = (e) => {
        const r = hero.getBoundingClientRect();
        target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        schedule();
    };
    const onLeave = () => { target.x = 0; target.y = 0; schedule(); };

    hero.addEventListener('pointermove', onMove, { passive: true });
    hero.addEventListener('pointerleave', onLeave, { passive: true });
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); }, { threshold: 0 }).observe(hero);
}
