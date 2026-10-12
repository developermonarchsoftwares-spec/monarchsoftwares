import './trainer-deployment.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
if (typeof window !== 'undefined') {
  window.ScrollTrigger = ScrollTrigger;
  window.gsap = gsap;
}

/**
 * Standardized Scroll-Based Progressive Reveal for 3rd Service Section
 * Master Reference: Service Page 1 ("On-Demand Trainer Deployment")
 * Applied consistently to all 4 Service Pages.
 */
function initSingleThirdSectionScroll(track) {
  if (!track) return;

  const stage = track.querySelector('.trainer-deployment-stage');
  const label = track.querySelector('.trainer-step-label');
  const heading = track.querySelector('.trainer-step-heading');
  const cards = Array.from(track.querySelectorAll('.trainer-card'));

  if (!cards.length) return;

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) {
    if (label) gsap.set(label, { opacity: 1, y: 0, filter: 'none' });
    if (heading) gsap.set(heading, { opacity: 1, y: 0, filter: 'none' });
    gsap.set(cards, { opacity: 1, y: 0, scale: 1, filter: 'none' });
    return;
  }

  const mm = gsap.matchMedia();

  // Desktop & Tablet (>= 769px: Pinned Cinematic Scene)
  mm.add('(min-width: 769px)', () => {
    // 1. Initial State: Label and heading slightly faded, cards hidden/subtle
    if (label) {
      gsap.set(label, { opacity: 0.2, y: 15, filter: 'blur(4px)' });
    }
    if (heading) {
      gsap.set(heading, { opacity: 0.2, y: 20, filter: 'blur(5px)' });
    }

    cards.forEach((card) => {
      gsap.set(card, {
        opacity: 0,
        y: 60,
        scale: 0.94,
        filter: 'blur(8px)'
      });
    });

    // 2. Scrubbed Timeline with Pinned Section
    const scrollDistance = 1500; // Dedicated scroll distance for controlled reveal
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: track,
        start: 'top top',
        end: `+=${scrollDistance}`,
        pin: stage || track,
        pinSpacing: true,
        scrub: 0.75,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    // STEP 1: Label smoothly appears (0.00 -> 0.12)
    if (label) {
      tl.to(label, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.12,
        ease: 'power2.out'
      }, 0);
    }

    // STEP 2: Heading reveals (0.10 -> 0.22)
    if (heading) {
      tl.to(heading, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.12,
        ease: 'power2.out'
      }, 0.10);
    }

    // Brief breath (0.22 -> 0.26)
    tl.to({}, { duration: 0.04 }, 0.22);

    // Dynamic sequential reveal for cards across 0.26 -> 0.85
    const cardStartTime = 0.26;
    const cardEndTime = 0.85;
    const count = cards.length;
    const stepDuration = (cardEndTime - cardStartTime) / count;

    cards.forEach((card, i) => {
      const startAt = cardStartTime + i * stepDuration;
      tl.to(card, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: Math.min(0.14, stepDuration * 0.95),
        ease: 'power2.out'
      }, startAt);
    });

    // Final hold: All cards settled & crisp before release (0.85 -> 1.00)
    tl.to({}, { duration: 0.15 }, 0.85);
  });

  // Mobile (<= 768px: Scroll-controlled sequential reveal as user scrolls)
  mm.add('(max-width: 768px)', () => {
    if (label) {
      gsap.fromTo(label,
        { opacity: 0.2, y: 15, filter: 'blur(4px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          ease: 'power2.out',
          scrollTrigger: {
            trigger: label,
            start: 'top 85%',
            end: 'top 65%',
            scrub: 0.7
          }
        }
      );
    }

    if (heading) {
      gsap.fromTo(heading,
        { opacity: 0.2, y: 20, filter: 'blur(5px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          ease: 'power2.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 85%',
            end: 'top 65%',
            scrub: 0.7
          }
        }
      );
    }

    cards.forEach((card) => {
      gsap.fromTo(card,
        {
          opacity: 0,
          y: 60,
          scale: 0.94,
          filter: 'blur(8px)'
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
            end: 'top 60%',
            scrub: 0.7
          }
        }
      );
    });
  });
}

export function initTrainerDeploymentScroll() {
  const tracks = Array.from(document.querySelectorAll('.trainer-deployment-track'));
  if (!tracks.length) return;

  tracks.forEach((track) => {
    initSingleThirdSectionScroll(track);
  });

  // Ensure ScrollTrigger updates after React components & dynamic layouts mount
  requestAnimationFrame(() => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  });
  setTimeout(() => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }, 250);
  setTimeout(() => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }, 800);
}

export const initAllServiceThirdSections = initTrainerDeploymentScroll;
