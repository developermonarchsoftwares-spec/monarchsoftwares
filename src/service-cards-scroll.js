import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * 4th section of the four service pages (Enterprise Solutions / Why Choose Monarch / Social Media & Branding /
 * Benefits of Our Approach): a scroll-scrubbed reveal.
 * The section pins in the middle of the screen and ONE scrubbed timeline brings in the label and heading, then the
 * three cards one after another (fade, rise, settle, blur clears). Nothing autoplays: it holds when scrolling stops,
 * reverses when scrolling up, and releases after a short hold. Reduced motion shows everything immediately.
 */
export function initServiceCardsScroll() {
    const section = document.querySelector('.section-scroll-cards');
    if (!section) return;
    const head = section.querySelector('.content-head');
    const headParts = head ? Array.from(head.children) : [];
    const cards = Array.from(section.querySelectorAll('.content-card'));
    if (!cards.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.set(headParts, { opacity: 0, y: 24 });
    gsap.set(cards, { opacity: 0, y: 44, scale: 0.96, filter: 'blur(5px)' });

    const mobile = () => window.innerWidth < 760;
    const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
            trigger: section,
            start: 'center center',
            end: () => '+=' + Math.round(window.innerHeight * (mobile() ? 1.8 : 2.2)),
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true
        }
    });

    const reveal = { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 20, ease: 'power2.out' };
    tl.to(headParts, { opacity: 1, y: 0, duration: 14, stagger: 6 }, 0);
    cards.forEach((card, i) => tl.to(card, reveal, 16 + i * 24));
    tl.to({}, { duration: 14 }, 16 + cards.length * 24);
}
