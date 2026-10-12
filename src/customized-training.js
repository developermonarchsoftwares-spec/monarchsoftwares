import './customized-training.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Customized Training Programs
 * Two-Column Scroll-Driven Cinematic Experience:
 * - Left side: Fixed sticky heading
 * - Right side: Sequentially revealed 4 editorial states (01 -> 02 -> 03 -> 04)
 */
export function initCustomizedTraining() {
  const track = document.getElementById('customized-training');
  if (!track) return;

  const stage = track.querySelector('.customized-training-stage');
  if (!stage) return;

  const stepItems = Array.from(track.querySelectorAll('.customized-step-item'));
  if (stepItems.length < 4) return;

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) {
    stepItems.forEach((item) => {
      gsap.set(item, { opacity: 1, y: 0, scale: 1, filter: 'none', position: 'relative' });
    });
    return;
  }

  const mm = gsap.matchMedia();

  // Desktop (>= 961px: Two-column pinned scroll sequence)
  mm.add('(min-width: 961px)', () => {
    // 1. Initial State: Right side is initially empty/dark
    stepItems.forEach((item) => {
      gsap.set(item, {
        opacity: 0,
        y: 50,
        scale: 0.94,
        filter: 'blur(8px)',
        transformOrigin: 'center center'
      });
    });

    const scrollDistance = 2400; // Generous scroll track for distinct 4-stage progression

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: track,
        start: 'top top',
        end: `+=${scrollDistance}`,
        pin: stage,
        pinSpacing: true,
        scrub: 0.85,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          let currentStep = -1;
          if (p >= 0.78) currentStep = 3;
          else if (p >= 0.52) currentStep = 2;
          else if (p >= 0.27) currentStep = 1;
          else if (p >= 0.04) currentStep = 0;

          stepItems.forEach((item, idx) => {
            if (idx === currentStep) {
              item.classList.add('is-active');
            } else {
              item.classList.remove('is-active');
            }
          });
        }
      }
    });

    // -------------------------------------------------------------
    // STAGE 01: Curriculum Design (0.04 -> 0.28)
    // -------------------------------------------------------------
    tl.to(stepItems[0], {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.12,
      ease: 'power2.out'
    }, 0.04);

    // Hold steady
    tl.to({}, { duration: 0.08 }, 0.16);

    // Step 01 exits
    tl.to(stepItems[0], {
      opacity: 0,
      y: -35,
      scale: 0.97,
      filter: 'blur(6px)',
      duration: 0.06,
      ease: 'power2.in'
    }, 0.24);

    // -------------------------------------------------------------
    // STAGE 02: Hands-on Learning (0.28 -> 0.53)
    // -------------------------------------------------------------
    tl.to(stepItems[1], {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.12,
      ease: 'power2.out'
    }, 0.28);

    // Hold steady
    tl.to({}, { duration: 0.09 }, 0.40);

    // Step 02 exits
    tl.to(stepItems[1], {
      opacity: 0,
      y: -35,
      scale: 0.97,
      filter: 'blur(6px)',
      duration: 0.06,
      ease: 'power2.in'
    }, 0.49);

    // -------------------------------------------------------------
    // STAGE 03: Flexible Delivery (0.53 -> 0.78)
    // -------------------------------------------------------------
    tl.to(stepItems[2], {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.12,
      ease: 'power2.out'
    }, 0.53);

    // Hold steady
    tl.to({}, { duration: 0.09 }, 0.65);

    // Step 03 exits
    tl.to(stepItems[2], {
      opacity: 0,
      y: -35,
      scale: 0.97,
      filter: 'blur(6px)',
      duration: 0.06,
      ease: 'power2.in'
    }, 0.74);

    // -------------------------------------------------------------
    // STAGE 04: Progress Tracking (0.78 -> 1.00)
    // -------------------------------------------------------------
    tl.to(stepItems[3], {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.12,
      ease: 'power2.out'
    }, 0.78);

    // Holds until end of pinned sequence (0.90 -> 1.00)
    tl.to({}, { duration: 0.10 }, 0.90);
  });

  // Mobile / Small Tablet (< 960px: Stack layout with sequential scroll reveal)
  mm.add('(max-width: 960px)', () => {
    stepItems.forEach((item) => {
      gsap.fromTo(item,
        {
          opacity: 0,
          y: 40,
          scale: 0.96,
          filter: 'blur(6px)'
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
