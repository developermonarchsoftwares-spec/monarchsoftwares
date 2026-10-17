import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Challenge section - fully scroll-scrubbed reveal.
 *
 * One normalized scroll progress (0 -> 1) drives every element, in both directions:
 *   label -> heading -> paragraphs -> button, plus the 3D image coming down from above.
 * Desktop: the section is a tall track with a sticky 100vh stage, so the content stays
 * put while the reveal plays and the next section later slides over it.
 * Small screens / short viewports: same timeline over the natural flow (no sticky stage).
 */
export function initChallengeScroll() {
    const section = document.getElementById('positioning');
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const label = section.querySelector('.challenge-label');
    const heading = section.querySelector('.challenge-heading');
    const paras = section.querySelectorAll('.challenge-paras p');
    const button = section.querySelector('.challenge-cta');
    const media = section.querySelector('.challenge-media');
    if (!label || !heading || !button || !media) return;

    const mm = gsap.matchMedia();

    const build = (scrollTriggerVars) => {
        const textFrom = { opacity: 0, y: 36 };
        const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { scrub: true, invalidateOnRefresh: true, ...scrollTriggerVars } });

        // Image: starts above, tilted back, slightly smaller and faint -> settles into place.
        tl.fromTo(media,
            { yPercent: -16, rotateX: -32, scale: 0.94, opacity: 0.15, transformPerspective: 1400, transformOrigin: '50% 0%' },
            { yPercent: 0, rotateX: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.05);

        // Text: strictly sequential windows on the same progress.
        tl.fromTo(label, textFrom, { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.2);
        tl.fromTo(heading, textFrom, { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' }, 0.38);
        paras.forEach((p, i) => {
            tl.fromTo(p, textFrom, { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.58 + i * 0.1);
        });
        tl.fromTo(button, textFrom, { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.84);
        // Pad the timeline to exactly 1 so progress maps 1:1 onto the scroll range.
        tl.set({}, {}, 1);
        return tl;
    };

    mm.add('(min-width: 861px) and (min-height: 640px)', () => {
        const tl = build({
            trigger: section,
            start: 'top 85%',
            end: () => 'top top-=' + Math.round(window.innerHeight * 0.9)
        });
        return () => tl.scrollTrigger && tl.scrollTrigger.kill();
    });

    mm.add('(max-width: 860px), (max-height: 639px)', () => {
        const tl = build({ trigger: section, start: 'top 80%', end: 'top 10%' });
        return () => tl.scrollTrigger && tl.scrollTrigger.kill();
    });
}
