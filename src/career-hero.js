import './career-hero.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Career Hero Section — scroll-scrubbed sequential reveal over the FloatingLines background.
 * The hero is pinned and ONE scrubbed timeline reveals: label → heading (word by word) → description → CTA.
 * Nothing autoplays; the reveal holds when scrolling stops and reverses when scrolling up.
 * With reduced motion (or no GSAP target) the hero simply stays fully visible.
 */
export function initCareerHero() {
  const heroSection = document.getElementById('careers');
  if (!heroSection) return;

  const heroContainer = heroSection.querySelector('.career-hero-container');
  if (heroContainer) {
    heroContainer.style.opacity = '1';
    heroContainer.style.transform = 'none';
  }

  const badge = heroSection.querySelector('.career-hero-badge');
  const title = heroSection.querySelector('.career-hero-title');
  const desc = heroSection.querySelector('.career-hero-desc');
  const cta = heroSection.querySelector('.career-hero-cta');
  if (!badge || !title || !desc || !cta) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Heading: wrap each word (text is unchanged; screen readers still get the heading via aria-label)
  const text = title.textContent.trim();
  title.setAttribute('aria-label', text);
  title.textContent = '';
  const words = text.split(/\s+/).map((w, i, all) => {
    const s = document.createElement('span');
    s.textContent = w;
    s.setAttribute('aria-hidden', 'true');
    s.style.display = 'inline-block';
    title.appendChild(s);
    if (i < all.length - 1) title.appendChild(document.createTextNode(' '));
    return s;
  });

  const mobile = () => window.innerWidth < 760;
  gsap.set([badge, desc, cta], { opacity: 0, y: 24 });
  gsap.set(words, { opacity: 0, y: 36 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: heroSection,
      start: 'top top',
      end: () => '+=' + Math.round(window.innerHeight * (mobile() ? 1.6 : 2)),
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });

  tl.to(badge, { opacity: 1, y: 0, duration: 14 }, 0)
    .to(words, { opacity: 1, y: 0, duration: 22, stagger: 12 }, 12)
    .to(desc, { opacity: 1, y: 0, duration: 20 }, 48)
    .to(cta, { opacity: 1, y: 0, duration: 16 }, 70)
    .to({}, { duration: 14 }, 86);
}
