import './mission-vision.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Our Mission & Vision - Scroll-Progress Driven Cinematic Sequential Reveal
 *
 * Sequence tied 1:1 to scroll progress:
 * 1. Heading Reveal (0% -> 22%): Fades in and slides smoothly upward into place.
 * 2. Main Horizontal White Line (20% -> 35%): Expands smoothly from center outward.
 * 3. Small Vertical Connector (35% -> 45%): Grows downward from center of line with a glowing node.
 * 4. Mission Card Reveal (45% -> 65%): Emerges first (opacity, translateY, scale, blur-to-sharp).
 * 5. Vision Card Reveal (65% -> 85%): Emerges sequentially after Mission card.
 * 6. Final Position (85% -> 100%): All elements stable in place.
 *
 * Reverse scrolls smoothly in exact reverse order.
 * Respects prefers-reduced-motion.
 */
export function initMissionVisionScroll() {
  const mvSection = document.getElementById('mission-vision');
  if (!mvSection) return;

  const heading = mvSection.querySelector('.mv-head');
  const bridgeLine = mvSection.querySelector('.mv-bridge-line');
  const bridgeConnector = mvSection.querySelector('.mv-bridge-connector');
  const bridgeNode = mvSection.querySelector('.mv-bridge-node');
  const missionCard = mvSection.querySelector('.mv-card--mission') || mvSection.querySelectorAll('.mv-card')[0];
  const visionCard = mvSection.querySelector('.mv-card--vision') || mvSection.querySelectorAll('.mv-card')[1];

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) {
    if (heading) gsap.set(heading, { opacity: 1, y: 0 });
    if (bridgeLine) gsap.set(bridgeLine, { scaleX: 1, opacity: 1 });
    if (bridgeConnector) gsap.set(bridgeConnector, { scaleY: 1 });
    if (bridgeNode) gsap.set(bridgeNode, { scale: 1, opacity: 1 });
    if (missionCard) gsap.set(missionCard, { opacity: 1, y: 0, scale: 1, filter: 'none' });
    if (visionCard) gsap.set(visionCard, { opacity: 1, y: 0, scale: 1, filter: 'none' });
    return;
  }

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const cardY = isMobile ? 32 : 60;
  const headY = isMobile ? 22 : 36;

  // Set initial states before scroll enters
  if (heading) gsap.set(heading, { opacity: 0, y: headY });
  if (bridgeLine) gsap.set(bridgeLine, { scaleX: 0, opacity: 0, transformOrigin: 'center center' });
  if (bridgeConnector) gsap.set(bridgeConnector, { scaleY: 0, transformOrigin: 'top center' });
  if (bridgeNode) gsap.set(bridgeNode, { scale: 0, opacity: 0 });
  if (missionCard) gsap.set(missionCard, { opacity: 0, y: cardY, scale: 0.94, filter: 'blur(6px)' });
  if (visionCard) gsap.set(visionCard, { opacity: 0, y: cardY, scale: 0.94, filter: 'blur(6px)' });

  // Scroll-progress scrubbed timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: mvSection,
      start: 'top 85%',
      end: 'bottom 65%',
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });

  // 1. Heading Reveal (0% -> 22%)
  if (heading) {
    tl.to(heading, {
      opacity: 1,
      y: 0,
      duration: 0.22,
      ease: 'none',
    }, 0);
  }

  // 2. Main Horizontal White Line (20% -> 35%) - begins as heading hits ~75% opacity
  if (bridgeLine) {
    tl.to(bridgeLine, {
      scaleX: 1,
      opacity: 1,
      duration: 0.15,
      ease: 'none',
    }, 0.20);
  }

  // 3. Small Vertical Line / Connector (35% -> 45%)
  if (bridgeConnector) {
    tl.to(bridgeConnector, {
      scaleY: 1,
      duration: 0.10,
      ease: 'none',
    }, 0.35);
  }

  // Subtle glowing node at end of connector
  if (bridgeNode) {
    tl.to(bridgeNode, {
      scale: 1,
      opacity: 1,
      duration: 0.06,
      ease: 'none',
    }, 0.39);
  }

  // 4. Mission Card Reveal (45% -> 65%)
  if (missionCard) {
    tl.to(missionCard, {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.20,
      ease: 'none',
    }, 0.45);
  }

  // 5. Vision Card Reveal (65% -> 85%) - only AFTER Mission card has substantially appeared
  if (visionCard) {
    tl.to(visionCard, {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.20,
      ease: 'none',
    }, 0.65);
  }

  // 6. Hold buffer (85% -> 100%) - everything reached final stable position
  tl.to({}, { duration: 0.15 }, 0.85);
}
