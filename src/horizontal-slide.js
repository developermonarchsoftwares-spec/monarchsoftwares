import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Horizontal slide-over between: Why Monarch -> About -> Corporate Training.
 *
 * While the incoming section's top travels one viewport (bottom -> top of the screen), the section keeps
 * its place at the top of the screen and slides in from the RIGHT over the previous one, which is held
 * still. Everything is driven by that single scrubbed scroll progress, so scrolling up reverses it
 * (the section slides back out to the right and the previous one is revealed again).
 *
 *   incoming: translateX (1-p)*100vw   +  translateY -(1-p)*vh   (cancels its normal upward travel)
 *   previous: translateY  p*vh                                    (cancels its upward scroll => frozen)
 *
 * Plain translate transforms only; the page stays vertically scrollable and nothing is position: fixed.
 */
export function initHorizontalSlide() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const secs = ['why', 'about', 'corporate-training'].map((id) => document.getElementById(id));
    if (secs.some((s) => !s)) return;

    secs.forEach((s, i) => {
        s.style.position = 'relative';
        if (i > 0) s.style.zIndex = String(10 + i); // incoming section always above the one before it
    });

    const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2); // gentle in-out, no overshoot
    const clearState = (el) => {
        el.style.transform = '';
        el.style.opacity = '';
        el.style.visibility = '';
        el.style.removeProperty('background-color');
    };

    const apply = (prev, next, p) => {
        const vh = window.innerHeight;
        if (p <= 0) {
            // before the transition: the incoming section waits off-screen to the right
            next.style.transform = `translate3d(100vw, ${-vh}px, 0)`;
            next.style.setProperty('background-color', '#000', 'important');
            clearState(prev);
            return;
        }
        if (p >= 1) {
            // after: incoming is in place, the covered section is out of the way
            clearState(next);
            prev.style.transform = '';
            prev.style.opacity = '0';
            prev.style.visibility = 'hidden';
            return;
        }
        // during: incoming slides right -> left over the frozen previous section
        const e = ease(p);
        next.style.transform = `translate3d(${(1 - e) * 100}vw, ${-(1 - p) * vh}px, 0)`;
        // solid while it covers the previous section, melting into the transparent (Galaxy) background at the end
        const a = p < 0.9 ? 1 : (1 - p) / 0.1;
        next.style.setProperty('background-color', `rgba(0,0,0,${a})`, 'important');
        prev.style.visibility = '';
        prev.style.transform = `translate3d(0, ${p * vh}px, 0)`;
        prev.style.opacity = String(p < 0.9 ? 1 : (1 - p) / 0.1);
    };

    const triggers = [];
    for (let i = 1; i < secs.length; i++) {
        const prev = secs[i - 1];
        const next = secs[i];
        triggers.push(ScrollTrigger.create({
            trigger: next,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => apply(prev, next, self.progress),
            onRefresh: (self) => apply(prev, next, self.progress)
        }));
    }

    // ScrollTrigger measures layout on refresh: drop the transforms first so measurements are not skewed.
    ScrollTrigger.addEventListener('refreshInit', () => secs.forEach((s) => { s.style.transform = ''; }));
}
