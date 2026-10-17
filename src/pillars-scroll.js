import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Our Four Service Pillars - scroll-scrubbed zig-zag timeline.
 * Every row lights a node, draws a connector and grows a card out of the centre line
 * (01 left, 02 right, 03 left, 04 right), scrubbed by the row's own scroll position, so scrolling
 * back up retracts them in reverse. Desktop uses a tall, evenly spaced timeline; phones a vertical flow.
 */
const NODE_OFF = { backgroundColor: '#1d1d1f', borderColor: 'rgba(255,255,255,0.28)', scale: 1, boxShadow: '0 0 0 0 rgba(255,255,255,0), 0 0 0 rgba(255,255,255,0)' };
const NODE_ON = { backgroundColor: '#ffffff', borderColor: '#ffffff', scale: 1.5, boxShadow: '0 0 0 7px rgba(255,255,255,0.14), 0 0 26px rgba(255,255,255,0.65)' };
const NODE_DONE = { backgroundColor: '#8e8e93', borderColor: '#8e8e93', scale: 1.1, boxShadow: '0 0 0 0 rgba(255,255,255,0), 0 0 8px rgba(255,255,255,0.18)' };

export function initPillarsScroll() {
    const section = document.getElementById('services');
    const timeline = document.getElementById('pillars-timeline');
    if (!section || !timeline) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rows = gsap.utils.toArray('.pillar-row', timeline);
    const fill = timeline.querySelector('.pillars-line-fill');
    const parts = rows.map((row) => ({
        left: row.classList.contains('pillar-row--left'),
        node: row.querySelector('.pillar-node'),
        path: row.querySelector('.pillar-connector path'),
        card: row.querySelector('.pillar-card'),
        label: row.querySelector('.pillar-label')
    }));

    // Card travels in from the centre line: left cards start shifted right, right cards shifted left.
    const cardFrom = (left, dist) => ({ opacity: 0, x: left ? dist : -dist, scale: 0.9, filter: 'blur(6px)' });
    const cardTo = { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' };

    const mm = gsap.matchMedia();

    // Desktop: tall, evenly spaced timeline in normal flow; each row is scrubbed by its own scroll position.
    mm.add('(min-width: 861px) and (min-height: 560px)', () => {
        const triggers = [];
        gsap.set(parts.map((p) => p.node), NODE_OFF);
        gsap.set(parts.map((p) => p.label), { opacity: 0.35 });
        triggers.push(gsap.to(fill, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: timeline, start: 'top 65%', end: 'bottom 60%', scrub: true } }).scrollTrigger);
        parts.forEach((p, i) => {
            const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: rows[i], start: 'top 78%', end: 'center 42%', scrub: true } });
            tl.to(p.node, { ...NODE_ON, duration: 0.3, ease: 'power2.out' }, 0);
            tl.to(p.label, { opacity: 1, duration: 0.35 }, 0);
            tl.fromTo(p.path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4, ease: 'power1.inOut' }, 0.1);
            tl.fromTo(p.card, cardFrom(p.left, 90), { ...cardTo, duration: 0.6, ease: 'power2.out' }, 0.25);
            triggers.push(tl.scrollTrigger);
        });
        return () => {
            triggers.forEach((t) => t && t.kill());
            gsap.set([fill, ...parts.flatMap((p) => [p.node, p.path, p.card, p.label])], { clearProps: 'all' });
        };
    });

    mm.add('(max-width: 860px), (max-height: 559px)', () => {
        const triggers = [];
        gsap.set(parts.map((p) => p.node), NODE_OFF);
        triggers.push(gsap.to(fill, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: timeline, start: 'top 70%', end: 'bottom 60%', scrub: true } }).scrollTrigger);
        parts.forEach((p, i) => {
            const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: rows[i], start: 'top 72%', end: 'center 45%', scrub: true } });
            tl.to(p.node, { ...NODE_ON, duration: 0.3 }, 0);
            tl.fromTo(p.path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4 }, 0.1);
            tl.fromTo(p.card, cardFrom(p.left, 40), { ...cardTo, duration: 0.6 }, 0.25);
            triggers.push(tl.scrollTrigger);
        });
        return () => {
            triggers.forEach((t) => t && t.kill());
            gsap.set([fill, ...parts.flatMap((p) => [p.node, p.path, p.card])], { clearProps: 'all' });
        };
    });
}
