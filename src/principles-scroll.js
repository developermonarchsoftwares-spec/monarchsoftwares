import './principles-scroll.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Core Principles — Smooth, Continuous Horizontal Storytelling Experience
 *
 * - Vertical scrolling is converted into smooth horizontal translation.
 * - Section is pinned to the viewport on desktop and tablet.
 * - Absolutely NO snapping, NO carousel jumping, NO timeouts.
 * - Continuous interpolation of active cards, images, and progress indicator.
 * - Symmetrically reverses when scrolling upward.
 * - Dynamic scroll distance calculation based on track scrollWidth.
 */
export function initPrinciplesScroll() {
  const section = document.getElementById('core-principles');
  if (!section) return;

  const track = document.getElementById('principles-track');
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.principle-card'));
  if (!cards.length) return;

  const progressFill = document.getElementById('principles-progress-fill');
  const counterEl = document.getElementById('principles-counter');
  const nodes = Array.from(section.querySelectorAll('.principles-node'));
  const galaxyBg = document.getElementById('galaxy-bg');

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) {
    cards.forEach((card) => {
      card.style.transform = 'none';
      card.style.opacity = '1';
      const img = card.querySelector('.principle-media img');
      if (img) {
        img.style.transform = 'none';
        img.style.opacity = '1';
      }
    });
    return;
  }

  const mm = gsap.matchMedia();

  // Desktop & Tablet (Pinned Horizontal Experience)
  mm.add('(min-width: 769px)', () => {
    // Ensure section heading is always clear and rock-solid on desktop
    const head = section.querySelector('.principles-head');
    if (head) {
      gsap.set(head, { opacity: 1, y: 0, filter: 'none' });
    }

    // Calculates how far the track needs to travel left so the last card aligns nicely
    const getScrollDistance = () => {
      return track.scrollWidth - window.innerWidth;
    };

    /**
     * Smoothly and continuously interpolate card scale & opacity based on its
     * distance from the center of the viewport.
     */
    const updateCardInterpolation = () => {
      const viewportCenter = window.innerWidth / 2;
      const viewportWidth = window.innerWidth;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distFromCenter = Math.abs(cardCenter - viewportCenter);

        // Normalized distance: 0 = dead center, 1 = ~80% of viewport width away
        const normDist = Math.min(distFromCenter / (viewportWidth * 0.8), 1);

        // Continuous interpolation:
        // Center: scale 1.0, opacity 1.0
        // Nearby/Peeking: scale ~0.985, opacity ~0.80
        // Farther: scale ~0.97, opacity ~0.65
        const cardScale = 1 - normDist * 0.03;
        const cardOpacity = 1 - normDist * 0.35;

        card.style.transform = `scale(${cardScale.toFixed(4)})`;
        card.style.opacity = cardOpacity.toFixed(4);

        // Subtle image scale & opacity
        const img = card.querySelector('.principle-media img');
        if (img) {
          const imgScale = 1 - normDist * 0.02;
          const imgOpacity = 1 - normDist * 0.2;
          img.style.transform = `scale(${imgScale.toFixed(4)})`;
          img.style.opacity = imgOpacity.toFixed(4);
        }
      });
    };

    /**
     * Update progress fill bar, active indicator nodes, and counter smoothly.
     */
    const updateProgressUI = (progress) => {
      // Smooth continuous progress bar fill (0% -> 100%)
      if (progressFill) {
        progressFill.style.width = `${(progress * 100).toFixed(2)}%`;
      }

      // Smooth counter transition (01 / 04 -> 04 / 04)
      const currentNum = Math.min(4, Math.max(1, Math.round(progress * 3) + 1));
      if (counterEl) {
        counterEl.textContent = `0${currentNum} / 04`;
      }

      // Indicator nodes illumination
      nodes.forEach((node, i) => {
        const targetProgress = i / (nodes.length - 1 || 1);
        const dist = Math.abs(progress - targetProgress);
        if (dist <= 0.16) {
          node.classList.add('principles-node--active');
        } else {
          node.classList.remove('principles-node--active');
        }
      });
    };

    // Initialize first state
    updateCardInterpolation();
    updateProgressUI(0);

    // Main Horizontal Pinned ScrollTrigger
    const horizontalTween = gsap.to(track, {
      x: () => -getScrollDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${Math.round(getScrollDistance() * 1.15)}`,
        scrub: 1, // Fluid, natural scrub value
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          updateCardInterpolation();
          updateProgressUI(self.progress);

          // Subtle starfield parallax during horizontal scroll
          if (galaxyBg) {
            gsap.set(galaxyBg, { x: -30 * self.progress });
          }
        },
      },
    });

    return () => {
      if (horizontalTween.scrollTrigger) {
        horizontalTween.scrollTrigger.kill();
      }
      horizontalTween.kill();

      cards.forEach((card) => {
        card.style.transform = '';
        card.style.opacity = '';
        const img = card.querySelector('.principle-media img');
        if (img) {
          img.style.transform = '';
          img.style.opacity = '';
        }
      });
      track.style.transform = '';
      if (galaxyBg) {
        galaxyBg.style.transform = '';
      }
    };
  });

  // Mobile (Vertical Accessible Flow)
  mm.add('(max-width: 768px)', () => {
    cards.forEach((card) => {
      gsap.fromTo(
        card,
        { opacity: 0.25, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });
  });

  // Ensure exact dimensions once images are loaded
  cards.forEach((card) => {
    const img = card.querySelector('.principle-media img');
    if (img && !img.complete) {
      img.addEventListener('load', () => ScrollTrigger.refresh());
    }
  });
}
