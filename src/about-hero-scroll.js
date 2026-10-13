import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * About hero — scroll-scrubbed logo reveal, then the copy one line at a time.
 * ONE pinned, scrubbed GSAP timeline (nothing autoplays; it holds when scrolling stops, reverses when scrolling up):
 *    0–36  the existing glowing ElectricLogo fades + scales in at the centre
 *   36–44  hold on the completed logo (it, and its electric glow, stay for the rest of the sequence)
 *   44–62  label → 62–78 heading → 78–94 description (each fade + subtle rise)
 *   94–106 hold, then the pin releases
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

    gsap.set(bg, { opacity: 0, scale: 0.82, transformOrigin: '50% 50%' });
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

    tl.to(bg, { opacity: 1, scale: 1, duration: 36 }, 0);
    if (label) tl.to(label, { opacity: 1, y: 0, duration: 16 }, 42);
    if (heading) tl.to(heading, { opacity: 1, y: 0, duration: 16 }, 56);
    if (desc) tl.to(desc, { opacity: 1, y: 0, duration: 16 }, 68);
    tl.to({}, { duration: 18 }, 84);
}
