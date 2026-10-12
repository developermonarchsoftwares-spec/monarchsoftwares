import './web-mobile-scroll.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Web & Mobile Applications
 * Premium Two-Column Cinematic Scroll Experience:
 * - Left side: Fixed sticky heading (40% width)
 * - Right side: Scroll-driven sequential states 01 -> 02 -> 03 (60% width)
 * - Pure Monochrome Black (#000000) & White (#ffffff) Aesthetics
 */
export function initWebMobileScroll() {
  const track = document.getElementById('web-mobile-apps');
  if (!track) return;

  const stage = track.querySelector('.web-mobile-stage');
  if (!stage) return;

  const stepItems = Array.from(track.querySelectorAll('.web-mobile-step-item'));
  if (stepItems.length < 3) return;

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) {
    stepItems.forEach((item) => {
      gsap.set(item, { opacity: 1, y: 0, scale: 1, filter: 'none', position: 'relative' });
    });
    return;
  }

  const mm = gsap.matchMedia();

  // Desktop (>= 961px: Two-column pinned scroll-driven sequence)
  mm.add('(min-width: 961px)', () => {
    // Initial state: hidden with exact requested values
    // INITIAL: opacity: 0, transform: translateY(50px), scale: 0.97, filter: blur(5px)
    stepItems.forEach((item) => {
      gsap.set(item, {
        opacity: 0,
        y: 50,
        scale: 0.97,
        filter: 'blur(5px)',
        transformOrigin: 'left center'
      });
    });

    const scrollDistance = 2400; // Generous distance for controlled 3-stage progression

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: track,
        start: 'top top',
        end: `+=${scrollDistance}`,
        pin: stage,
        pinSpacing: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          let activeIdx = 0;
          if (p >= 0.66) activeIdx = 2;
          else if (p >= 0.33) activeIdx = 1;
          else activeIdx = 0;

          stepItems.forEach((item, idx) => {
            if (idx === activeIdx) {
              item.classList.add('is-active');
            } else {
              item.classList.remove('is-active');
            }
          });
        }
      }
    });

    // -----------------------------------------------------------------
    // STATE 01: Full-Stack Development (0% - 33%)
    // -----------------------------------------------------------------
    // Enters: opacity 0->1, y 50->0, scale 0.97->1, filter blur(5px)->blur(0px)
    tl.to(stepItems[0], {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.10,
      ease: 'power2.out'
    }, 0.00);

    // Stays active and fully legible
    tl.to({}, { duration: 0.16 }, 0.10);

    // Exits: opacity 1->0, y 0->-40, scale 1->0.98, filter blur(0px)->blur(3px)
    tl.to(stepItems[0], {
      opacity: 0,
      y: -40,
      scale: 0.98,
      filter: 'blur(3px)',
      duration: 0.08,
      ease: 'power2.in'
    }, 0.26);

    // -----------------------------------------------------------------
    // STATE 02: Native & Cross-Platform Apps (33% - 66%)
    // -----------------------------------------------------------------
    // Enters with smooth overlap
    tl.to(stepItems[1], {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.10,
      ease: 'power2.out'
    }, 0.29);

    // Stays active and fully legible
    tl.to({}, { duration: 0.18 }, 0.39);

    // Exits
    tl.to(stepItems[1], {
      opacity: 0,
      y: -40,
      scale: 0.98,
      filter: 'blur(3px)',
      duration: 0.08,
      ease: 'power2.in'
    }, 0.57);

    // -----------------------------------------------------------------
    // STATE 03: Progressive Web Apps (66% - 100%)
    // -----------------------------------------------------------------
    // Enters with smooth overlap
    tl.to(stepItems[2], {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.10,
      ease: 'power2.out'
    }, 0.60);

    // Stays active through remainder
    tl.to({}, { duration: 0.24 }, 0.70);

    // Hold steady until end of pinned sequence (0.94 -> 1.00)
    tl.to({}, { duration: 0.06 }, 0.94);
  });

  // Mobile (< 960px: Single-column layout with sequential scroll reveal)
  mm.add('(max-width: 960px)', () => {
    stepItems.forEach((item) => {
      gsap.fromTo(item,
        {
          opacity: 0,
          y: 40,
          scale: 0.97,
          filter: 'blur(4px)'
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            end: 'top 60%',
            scrub: 0.8
          }
        }
      );
    });
  });
}
