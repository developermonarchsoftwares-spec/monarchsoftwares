import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * About hero - scroll-scrubbed logo reveal, then the copy one line at a time.
 * ONE pinned, scrubbed GSAP timeline (nothing autoplays; it holds when scrolling stops, reverses when scrolling up):
 *    0     the glowing ElectricLogo starts bright with a softer white glow
 *    6–68  opacity, glow and brightness dim together (scroll-linked, reversible) to a subtle background emblem
 *   30–74  label, heading, description rise in one after another over it
 *   74–100 hold, then the pin releases
 */
export function initAboutHeroScroll() {
    const hero = document.querySelector('#about .about-hero');
    const bg = hero && hero.querySelector('.about-hero-bg');
    const content = hero && hero.querySelector('.about-hero-content');
    if (!hero || !bg || !content) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tag = content.querySelector('.tag-mono');
    const label = tag && tag.parentElement;
    const heading = content.querySelector('h2');
    const desc = content.querySelector('p');

    // Starts bright with a strong white glow; scrolling dims it to a subtle background emblem while the copy appears.
    const BRIGHT = 'drop-shadow(0 0 22px rgba(255,255,255,0.6)) drop-shadow(0 0 8px rgba(255,255,255,0.45)) brightness(1.02)';
    const SUBTLE = 'drop-shadow(0 0 6px rgba(255,255,255,0.18)) drop-shadow(0 0 2px rgba(255,255,255,0.1)) brightness(0.7)';
    gsap.set(bg, { opacity: 0.85, filter: BRIGHT });
    gsap.set([label, heading, desc].filter(Boolean), { opacity: 0, y: 28 });

    const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: () => '+=' + Math.round(window.innerHeight * (window.innerWidth < 760 ? 2.6 : 3)),
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true
        }
    });

    // One continuous, reversible dim: opacity, glow and brightness move together with scroll
    tl.to(bg, { opacity: 0.22, filter: SUBTLE, duration: 62 }, 6);
    if (label) tl.to(label, { opacity: 1, y: 0, duration: 14 }, 30);
    if (heading) tl.to(heading, { opacity: 1, y: 0, duration: 16 }, 42);
    if (desc) tl.to(desc, { opacity: 1, y: 0, duration: 16 }, 58);
    tl.to({}, { duration: 26 }, 74);
}
