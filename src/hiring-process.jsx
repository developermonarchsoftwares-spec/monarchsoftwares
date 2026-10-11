import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DepthCarousel from './depth-carousel/DepthCarousel.jsx';
import './hiring-process.css';

gsap.registerPlugin(ScrollTrigger);

const HIRING_STAGES = [
  {
    stage: 'STAGE 01',
    num: '01 / 04',
    title: 'Profile Review',
    desc: 'Review of your past projects, GitHub repositories, and practical engineering experience.',
    status: 'Initial Evaluation'
  },
  {
    stage: 'STAGE 02',
    num: '02 / 04',
    title: 'Technical Call',
    desc: 'A 30-minute conversation with an engineering lead covering architecture decisions and system tradeoffs.',
    status: 'Architecture & Systems'
  },
  {
    stage: 'STAGE 03',
    num: '03 / 04',
    title: 'Practical Task',
    desc: 'A focused real-world coding exercise focused on clean structure, readability, and documentation.',
    status: 'Hands-on Execution'
  },
  {
    stage: 'STAGE 04',
    num: '04 / 04',
    title: 'Final Offer',
    desc: 'Clear offer letter with transparent compensation, role expectations, and start date.',
    status: 'Welcome to Team'
  }
];

export function HiringProcessCarousel() {
  const carouselRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: 520,
    height: 370,
    depth: 310,
    spread: 120,
    tilt: 20,
    perspective: 1500,
    visibleCards: 3,
    blur: 6,
    falloff: 0.18
  });
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    const checkMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsReduced(checkMotion);

    const updateResponsiveDims = () => {
      const w = window.innerWidth;
      if (w >= 1600) {
        // 1920px Desktop — Spacious, luxurious depth
        setDimensions({
          width: 540,
          height: 380,
          depth: 320,
          spread: 125,
          tilt: 20,
          perspective: 1550,
          visibleCards: 3,
          blur: 6,
          falloff: 0.18
        });
      } else if (w >= 1280) {
        // 1440px Desktop
        setDimensions({
          width: 500,
          height: 360,
          depth: 300,
          spread: 115,
          tilt: 19,
          perspective: 1500,
          visibleCards: 3,
          blur: 6,
          falloff: 0.18
        });
      } else if (w >= 1024) {
        // Laptop screens
        setDimensions({
          width: 460,
          height: 350,
          depth: 280,
          spread: 105,
          tilt: 18,
          perspective: 1450,
          visibleCards: 3,
          blur: 5,
          falloff: 0.18
        });
      } else if (w >= 769) {
        // Tablets
        setDimensions({
          width: 400,
          height: 330,
          depth: 220,
          spread: 80,
          tilt: 16,
          perspective: 1350,
          visibleCards: 3,
          blur: 5,
          falloff: 0.2
        });
      } else {
        // Mobile screens
        const cardW = Math.min(w - 40, 340);
        setDimensions({
          width: cardW,
          height: 320,
          depth: 130,
          spread: 45,
          tilt: 12,
          perspective: 1200,
          visibleCards: 2,
          blur: 4,
          falloff: 0.22
        });
      }
    };

    updateResponsiveDims();
    window.addEventListener('resize', updateResponsiveDims);
    return () => window.removeEventListener('resize', updateResponsiveDims);
  }, []);

  useEffect(() => {
    if (isReduced) return;
    const section = document.getElementById('hiring-process');
    if (!section) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const scrollDistance = isMobile ? '+=1500' : '+=2000';

    // Sticky / Pin container while user scrubs through the 4 stages
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: scrollDistance,
      pin: true,
      scrub: 1, // Fluid scrub for slow, cinematic easing
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        // Piecewise smooth mapping for 4 stages (indices 0, 1, 2, 3):
        // 0.00 - 0.08: stay on 0 (initial focus hold)
        // 0.08 - 0.36: 0 -> 1 (Stage 1 moves back, Stage 2 steps to center)
        // 0.36 - 0.64: 1 -> 2 (Stage 2 moves back, Stage 3 steps to center)
        // 0.64 - 0.92: 2 -> 3 (Stage 3 moves back, Stage 4 steps to center)
        // 0.92 - 1.00: stay on 3 (final offer hold before cleanly unpinning)
        let targetPos = 0;
        if (p <= 0.08) {
          targetPos = 0;
        } else if (p >= 0.92) {
          targetPos = 3;
        } else if (p < 0.36) {
          targetPos = (p - 0.08) / 0.28;
        } else if (p < 0.64) {
          targetPos = 1 + (p - 0.36) / 0.28;
        } else {
          targetPos = 2 + (p - 0.64) / 0.28;
        }

        if (carouselRef.current) {
          carouselRef.current.setPosition(targetPos);
        }
      }
    });

    return () => {
      trigger.kill();
    };
  }, [isReduced]);

  if (isReduced) {
    return (
      <div className="hiring-process-fallback-grid">
        {HIRING_STAGES.map((item, i) => (
          <div key={i} className="hiring-process-card" data-border-glow>
            <div className="hiring-card-top">
              <span className="tag-mono hiring-card-stage">{item.stage}</span>
              <span className="hiring-card-number">{item.num}</span>
            </div>
            <div className="hiring-card-body">
              <h4 className="hiring-card-title">{item.title}</h4>
              <p className="hiring-card-desc">{item.desc}</p>
            </div>
            <div className="hiring-card-footer">
              <div className="hiring-card-status">
                <span className="hiring-card-indicator-dot" />
                <span>{item.status}</span>
              </div>
            </div>
            <div className="hiring-card-accent-line" aria-hidden="true" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="hiring-carousel-mount">
      <DepthCarousel
        ref={carouselRef}
        items={HIRING_STAGES}
        cardWidth={dimensions.width}
        cardHeight={dimensions.height}
        radius={20}
        depth={dimensions.depth}
        spread={dimensions.spread}
        tilt={dimensions.tilt}
        tiltDirection="right"
        perspective={dimensions.perspective}
        visibleCards={dimensions.visibleCards}
        falloff={dimensions.falloff}
        blur={dimensions.blur}
        loop={false}
        autoplay={false}
        showControls={false}
        showIndicators={true}
        renderCard={(item, index, { isActive }) => (
          <div className="hiring-process-card" data-border-glow>
            <div className="hiring-card-top">
              <span className="tag-mono hiring-card-stage">{item.stage}</span>
              <span className="hiring-card-number">{item.num}</span>
            </div>
            <div className="hiring-card-body">
              <h4 className="hiring-card-title">{item.title}</h4>
              <p className="hiring-card-desc">{item.desc}</p>
            </div>
            <div className="hiring-card-footer">
              <div className="hiring-card-status">
                <span className="hiring-card-indicator-dot" />
                <span>{item.status}</span>
              </div>
            </div>
            <div className="hiring-card-accent-line" aria-hidden="true" />
          </div>
        )}
      />
    </div>
  );
}

export function initHiringProcessCarousel() {
  const mountEl = document.getElementById('hiring-process-root');
  if (!mountEl) return;
  if (mountEl.dataset.mounted === 'true') return;
  mountEl.dataset.mounted = 'true';

  const root = createRoot(mountEl);
  root.render(<HiringProcessCarousel />);
}
