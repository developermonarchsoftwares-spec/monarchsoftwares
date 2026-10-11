import './why-work-scroll.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * "Why Work With Us?" — Slow, Sequential Scroll-Scrubbed Reveal
 *
 * Sequence directly mapped to one continuous scroll interaction:
 * - Before scrolling (Initial State):
 *     opacity: 0, translateY: 40px, translateX: -30px, scale: 0.96, blur: 5px
 * - 0% to 30% Scroll:
 *     Card 01 slowly reveals (opacity 0 -> 1, y: 40 -> 0, x: -30 -> 0, scale: 0.96 -> 1, blur: 5px -> 0)
 * - 30% to 60% Scroll:
 *     Card 02 slowly reveals; Card 01 remains fully visible & stable
 * - 60% to 90% Scroll:
 *     Card 03 slowly reveals; Cards 01 & 02 remain fully visible & stable
 * - 90% to 100% Scroll:
 *     Hold all three cards fully visible
 *
 * Symmetrically reverses on upward scroll:
 *   Card 03 reverses first -> then Card 02 -> then Card 01
 * Pauses immediately at exact scroll frame when user stops scrolling.
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

  // Initial State: opacity: 0, translateY: 40px, translateX: -30px, scale: 0.96, blur: 5px
  gsap.set([card1, card2, card3], {
    opacity: 0,
    y: 40,
    x: -30,
    scale: 0.96,
    filter: 'blur(5px)',
  });

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const scrollRange = isMobile ? '+=550' : '+=700';

  // Single sequential timeline mapped to scroll progress
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 70%',
      end: scrollRange,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });

  const revealConfig = {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
    duration: 1.2,
    ease: 'power2.out',
  };

  // 0% – 30% scroll: Card 01 slowly reveals
  tl.to(card1, revealConfig, 0);

  // 30% – 60% scroll: Card 02 slowly reveals (Card 01 remains stable)
  tl.to(card2, revealConfig, 1.2);

  // 60% – 90% scroll: Card 03 slowly reveals (Card 01 and Card 02 remain stable)
  tl.to(card3, revealConfig, 2.4);

  // 90% – 100% scroll: Hold window where all 3 cards stay fully visible (duration: 0.4 -> total = 4.0)
  tl.to({}, { duration: 0.4 }, 3.6);
}
