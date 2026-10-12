import './culture-section.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Culture & Environment ("Built Around Engineering Excellence")
 * Sequential 3D Scroll-Driven Card Convergence Experience.
 *
 * Sequence:
 * 1. Initial: Section locks smoothly, heading visible, cards hidden behind scene.
 * 2. First Scroll: Center Card ("Modern Technical Stack") emerges forward from 3D depth.
 * 3. Second Scroll: Left Card ("High-Performance Proximity") emerges from behind center -> left.
 * 4. Third Scroll: Right Card ("End-to-End Ownership") emerges from behind center -> right.
 * 5. Final: All 3 cards settled in desktop 3-card balanced composition, section releases cleanly.
 */
export function initCultureSection() {
  const track = document.getElementById('careers-overview');
  if (!track) return;

  const stage = track.querySelector('.culture-stage');
  if (!stage) return;

  const head = track.querySelector('.culture-head');
  const cardCenter = track.querySelector('.culture-card.card-center');
  const cardLeft = track.querySelector('.culture-card.card-left');
  const cardRight = track.querySelector('.culture-card.card-right');
  const allCards = [cardLeft, cardCenter, cardRight].filter(Boolean);

  if (!cardCenter || !cardLeft || !cardRight) return;

  const sweepCenter = cardCenter.querySelector('.card-border-sweep');
  const sweepLeft = cardLeft.querySelector('.card-border-sweep');
  const sweepRight = cardRight.querySelector('.card-border-sweep');

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) {
    if (head) gsap.set(head, { opacity: 1, y: 0, filter: 'none' });
    gsap.set(allCards, {
      opacity: 1,
      x: 0,
      y: 0,
      z: 0,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      filter: 'none'
    });
    return;
  }

  const mm = gsap.matchMedia();

  // Desktop (>= 961px: Pinned 3D Stage with Sequential Reveal)
  mm.add('(min-width: 961px)', () => {
    // 1. Initial State before scroll
    if (head) {
      gsap.set(head, { opacity: 0, y: 24, filter: 'blur(6px)' });
    }

    // Center card: deep behind in 3D space, tilted slightly back
    gsap.set(cardCenter, {
      opacity: 0,
      scale: 0.82,
      y: 80,
      z: -150,
      rotateX: 8,
      filter: 'blur(8px)',
      transformOrigin: 'center center'
    });

    // Left card: tucked behind center card
    gsap.set(cardLeft, {
      opacity: 0,
      x: 100,
      y: 0,
      z: -120,
      scale: 0.88,
      filter: 'blur(6px)',
      transformOrigin: 'center center'
    });

    // Right card: tucked behind center card
    gsap.set(cardRight, {
      opacity: 0,
      x: -100,
      y: 0,
      z: -120,
      scale: 0.88,
      filter: 'blur(6px)',
      transformOrigin: 'center center'
    });

    // Border sweeps initial
    if (sweepCenter) gsap.set(sweepCenter, { opacity: 0, x: '-100%' });
    if (sweepLeft) gsap.set(sweepLeft, { opacity: 0, x: '-100%' });
    if (sweepRight) gsap.set(sweepRight, { opacity: 0, x: '-100%' });

    // 2. Master Scrub Timeline pinned to viewport
    const scrollDistance = 1700; // Ample scroll distance for distinct, controlled reveal stages
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: track,
        start: 'top top',
        end: `+=${scrollDistance}`,
        pin: stage,
        pinSpacing: true,
        scrub: 0.85,
        invalidateOnRefresh: true
      }
    });

    // Phase 0: Heading reveal (0.00 -> 0.12)
    if (head) {
      tl.to(head, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.12,
        ease: 'power2.out'
      }, 0);
    }

    // Phase 1: FIRST SCROLL — Center Card emerges from 3D depth (0.12 -> 0.38)
    tl.to(cardCenter, {
      opacity: 1,
      scale: 1,
      y: 0,
      z: 0,
      rotateX: 0,
      filter: 'blur(0px)',
      duration: 0.26,
      ease: 'power2.out'
    }, 0.12);

    if (sweepCenter) {
      tl.fromTo(sweepCenter,
        { opacity: 0, x: '-100%' },
        { opacity: 1, x: '100%', duration: 0.2, ease: 'power1.inOut' },
        0.16
      ).to(sweepCenter, { opacity: 0, duration: 0.05 }, 0.36);
    }

    // Brief Hold on Center Card (0.38 -> 0.44)
    tl.to({}, { duration: 0.06 }, 0.38);

    // Phase 2: SECOND SCROLL — Left Card emerges from behind center -> left (0.44 -> 0.68)
    tl.to(cardLeft, {
      opacity: 1,
      x: 0,
      y: 0,
      z: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.24,
      ease: 'power2.out'
    }, 0.44);

    if (sweepLeft) {
      tl.fromTo(sweepLeft,
        { opacity: 0, x: '-100%' },
        { opacity: 1, x: '100%', duration: 0.2, ease: 'power1.inOut' },
        0.48
      ).to(sweepLeft, { opacity: 0, duration: 0.05 }, 0.66);
    }

    // Brief Hold on Center + Left (0.68 -> 0.74)
    tl.to({}, { duration: 0.06 }, 0.68);

    // Phase 3: THIRD SCROLL — Right Card emerges from behind center -> right (0.74 -> 0.94)
    tl.to(cardRight, {
      opacity: 1,
      x: 0,
      y: 0,
      z: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.2,
      ease: 'power2.out'
    }, 0.74);

    if (sweepRight) {
      tl.fromTo(sweepRight,
        { opacity: 0, x: '-100%' },
        { opacity: 1, x: '100%', duration: 0.18, ease: 'power1.inOut' },
        0.76
      ).to(sweepRight, { opacity: 0, duration: 0.05 }, 0.92);
    }

    // Phase 4: Final State Hold (0.94 -> 1.00)
    // All 3 cards stable, crisp, and aligned. Pin releases smoothly after 1.00!
    tl.to({}, { duration: 0.06 }, 0.94);
  });

  // Mobile & Tablet (< 960px: Natural vertical flow with sequential reveal)
  mm.add('(max-width: 960px)', () => {
    if (head) {
      gsap.fromTo(head,
        { opacity: 0, y: 20, filter: 'blur(4px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          ease: 'power2.out',
          scrollTrigger: {
            trigger: head,
            start: 'top 85%',
            end: 'top 60%',
            scrub: 0.8
          }
        }
      );
    }

    // Sequential reveal for mobile: Center -> Left -> Right as cards enter view
    const mobileOrder = [cardCenter, cardLeft, cardRight];
    mobileOrder.forEach((card) => {
      gsap.fromTo(card,
        {
          opacity: 0,
          y: 50,
          scale: 0.94,
          filter: 'blur(6px)'
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            end: 'top 65%',
            scrub: 0.8
          }
        }
      );
    });
  });
}
