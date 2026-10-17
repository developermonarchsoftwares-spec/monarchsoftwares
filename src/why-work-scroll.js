import './why-work-scroll.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * "Why Work With Us?" - Slow, Sequential Scroll-Scrubbed Reveal
 *
 * The section is pinned and one scrubbed timeline reveals it:
 *   label + heading, then Card 01, Card 02, Card 03 one after another (each opacity / y / x / scale / blur),
 *   then a short hold before the pin releases.
 * It reverses on upward scroll and pauses at the exact frame when scrolling stops.
 */
export function initWhyWorkScroll() {
  const section = document.getElementById('why-work');
  if (!section) return;

  const cards = Array.from(section.querySelectorAll('.why-work-card'));
  if (cards.length < 3) return;

  const [card1, card2, card3] = cards;

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) {
    gsap.set([card1, card2, card3], {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      filter: 'blur(0px)',
    });
    return;
  }

  const head = section.querySelector('.content-head');
  const headParts = head ? Array.from(head.children) : [];

  // Initial state: heading hidden and slightly low; cards as before (hidden, offset, blurred)
  gsap.set(headParts, { opacity: 0, y: 24 });
  gsap.set([card1, card2, card3], {
    opacity: 0,
    y: 40,
    x: -30,
    scale: 0.96,
    filter: 'blur(5px)',
  });

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // The section pins and ONE scrubbed timeline plays the whole reveal: nothing autoplays, it holds when scrolling
  // stops and reverses when scrolling up.
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => '+=' + Math.round(window.innerHeight * (isMobile ? 2.2 : 2.6)),
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  const revealConfig = {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
    duration: 20,
    ease: 'power2.out',
  };

  // 0-16: label + heading;  16-100: the three cards one after another (previous cards stay in place);  then hold
  tl.to(headParts, { opacity: 1, y: 0, duration: 14, stagger: 6 }, 0);
  tl.to(card1, revealConfig, 16);
  tl.to(card2, revealConfig, 40);
  tl.to(card3, revealConfig, 64);
  tl.to({}, { duration: 16 }, 88);
}
