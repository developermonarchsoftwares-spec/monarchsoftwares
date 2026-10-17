import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ShapeGrid from './ShapeGrid';
import gsap from 'gsap';
import './service-hero.css';

/**
 * ServiceHeroBackground - React Bits ShapeGrid filling the entire hero section
 * Continuous slow-motion diagonal animation with zero scroll dependency
 */
export function ServiceHeroBackground() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div
      className="service-hero-grid-canvas-wrap"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        zIndex: 1
      }}
    >
      <ShapeGrid
        shape="square"
        direction="diagonal"
        lineColor="#2a2734"
        hoverColor="#ffffff"
        hoverFillColor="#ffffff"
        fillOpacity={0.15}
        cellSize={isMobile ? 48 : 40}
        speed={0.5}
        tiltX={0}
        tiltY={0}
        rainbow={false}
        fade={0.85}
        intro={true}
      />
    </div>
  );
}

/**
 * Initializes ShapeGrid mounting and one-time page load entrance animation
 * (Completely disconnected from scroll)
 */
export function initServiceHero() {
  const heroSections = document.querySelectorAll('.service-hero');
  if (!heroSections.length) return;

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  heroSections.forEach((hero) => {
    // 1. Mount React Bits ShapeGrid into full-screen hero background
    const bgContainer = hero.querySelector('.service-hero-bg');
    if (bgContainer && bgContainer.dataset.mounted !== 'true') {
      bgContainer.dataset.mounted = 'true';
      const root = createRoot(bgContainer);
      root.render(<ServiceHeroBackground />);
    }

    const tag = hero.querySelector('.service-hero-tag');
    const heading = hero.querySelector('.service-hero-heading');
    const desc = hero.querySelector('.service-hero-desc');
    const actions = hero.querySelector('.service-hero-actions');

    if (isReducedMotion) {
      if (tag) gsap.set(tag, { opacity: 1, y: 0 });
      if (heading) gsap.set(heading, { opacity: 1, y: 0, filter: 'blur(0px)' });
      if (desc) gsap.set(desc, { opacity: 1, y: 0, filter: 'blur(0px)' });
      if (actions) gsap.set(actions, { opacity: 1, y: 0 });
      return;
    }

    // Initial state: hidden with subtle vertical offset and blur
    if (tag) gsap.set(tag, { opacity: 0, y: 20 });
    if (heading) gsap.set(heading, { opacity: 0, y: 30, filter: 'blur(8px)' });
    if (desc) gsap.set(desc, { opacity: 0, y: 24, filter: 'blur(6px)' });
    if (actions) gsap.set(actions, { opacity: 0, y: 18 });

    // One-time entrance animation on page load (pure time-based, NO scroll dependencies)
    const tl = gsap.timeline({ delay: 0.15 });

    if (tag) {
      tl.to(tag, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: 'power3.out'
      }, 0);
    }

    if (heading) {
      // Step 1: Hero heading appears smoothly
      tl.to(heading, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.85,
        ease: 'power3.out'
      }, 0.15);
    }

    if (desc) {
      // Step 2: Supporting description appears slightly delayed
      tl.to(desc, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'power3.out'
      }, 0.45);
    }

    if (actions) {
      // Step 3: CTA/button appears slightly delayed after description
      tl.to(actions, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: 'power3.out'
      }, 0.75);
    }
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServiceHero);
  } else {
    initServiceHero();
  }
}
