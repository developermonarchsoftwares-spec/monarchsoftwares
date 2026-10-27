import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollFloat from './ScrollFloat.jsx';
import './hiring-process.css';

gsap.registerPlugin(ScrollTrigger);

const HIRING_STAGES = [
  {
    num: '01 / 04',
    numCode: '01',
    title: 'Profile Review',
    desc: 'Review of your past projects, GitHub repositories, and practical engineering experience.',
    category: 'INITIAL EVALUATION',
    timelineTitle: 'Profile Review'
  },
  {
    num: '02 / 04',
    numCode: '02',
    title: 'Technical Interview',
    desc: 'Live coding and problem solving assessment with our engineering team.',
    category: 'TECHNICAL ROUND',
    timelineTitle: 'Technical Interview'
  },
  {
    num: '03 / 04',
    numCode: '03',
    title: 'Team Discussion',
    desc: 'Meet our team and discuss projects, culture, and mutual expectations.',
    category: 'COLLABORATION',
    timelineTitle: 'Team Discussion'
  },
  {
    num: '04 / 04',
    numCode: '04',
    title: 'Offer',
    desc: 'Final discussion and offer rollout for successful candidates.',
    category: 'WELCOME TO THE TEAM',
    timelineTitle: 'Offer'
  }
];

export function HiringProcessSection() {
  const stageElRef = useRef(null);
  const stageRefs = useRef([]);
  const metaLineRefs = useRef([]);
  const timelineItemsRef = useRef([]);
  const progressLineRef = useRef(null);
  const scrollTriggerInstance = useRef(null);

  useEffect(() => {
    const stageEl = stageElRef.current;
    if (!stageEl) return;

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      if (stageRefs.current[0]) {
        gsap.set(stageRefs.current[0], { opacity: 1, y: 0, filter: 'none' });
      }
      return;
    }

    const isMobile = window.matchMedia('(max-width: 960px)').matches;
    const scrollDistance = isMobile ? 1800 : 2400;

    // Initial state
    gsap.set(stageRefs.current[0], { opacity: 1, y: 0, filter: 'blur(0px)' });
    gsap.set(metaLineRefs.current[0], { scaleX: 1 });
    const chars0 = stageRefs.current[0]?.querySelectorAll('.char');
    if (chars0) {
      gsap.set(chars0, { opacity: 1, yPercent: 0, scaleY: 1, scaleX: 1 });
    }

    // Stages 1, 2, 3 start hidden behind the scene
    for (let i = 1; i < HIRING_STAGES.length; i++) {
      if (stageRefs.current[i]) {
        gsap.set(stageRefs.current[i], { opacity: 0, y: 40, filter: 'blur(6px)' });
      }
      if (metaLineRefs.current[i]) {
        gsap.set(metaLineRefs.current[i], { scaleX: 0 });
      }
      const chars = stageRefs.current[i]?.querySelectorAll('.char');
      if (chars) {
        gsap.set(chars, { opacity: 0, yPercent: 100, scaleY: 2.0, scaleX: 0.8 });
      }
    }

    if (progressLineRef.current) {
      gsap.set(progressLineRef.current, { height: '0%' });
    }

    let prevActiveIndex = -1;

    // Master Scrubbed Timeline pinned to viewport
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stageEl,
        start: 'top top',
        end: `+=${scrollDistance}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.85,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          let activeIndex = 0;
          if (p >= 0.75) activeIndex = 3;
          else if (p >= 0.50) activeIndex = 2;
          else if (p >= 0.25) activeIndex = 1;
          else activeIndex = 0;

          // CUMULATIVE TIMELINE PROGRESS:
          // Once a step becomes active, it stays active for all idx <= activeIndex!
          timelineItemsRef.current.forEach((item, idx) => {
            if (!item) return;
            const isCompletedOrActive = idx <= activeIndex;
            const isCurrent = idx === activeIndex;

            if (isCompletedOrActive) {
              item.classList.add('is-active');
              // Trigger ripple pulse once when newly activated moving forward
              if (idx === activeIndex && activeIndex > prevActiveIndex) {
                item.classList.add('just-activated');
                setTimeout(() => {
                  if (item) item.classList.remove('just-activated');
                }, 650);
              }
            } else {
              item.classList.remove('is-active');
              item.classList.remove('just-activated');
            }

            if (isCurrent) {
              item.classList.add('is-current');
            } else {
              item.classList.remove('is-current');
            }
          });

          prevActiveIndex = activeIndex;

          stageRefs.current.forEach((panel, idx) => {
            if (panel) {
              if (idx === activeIndex) {
                panel.classList.add('is-active');
              } else {
                panel.classList.remove('is-active');
              }
            }
          });
        }
      }
    });

    scrollTriggerInstance.current = tl.scrollTrigger;

    // Timeline connecting line: progressively illuminates segments 01 -> 02 -> 03 -> 04
    if (progressLineRef.current) {
      tl.fromTo(progressLineRef.current,
        { height: '0%' },
        { height: '100%', ease: 'none', duration: 0.75 },
        0
      );
    }


    // -------------------------------------------------------------
    // TRANSITION 1: Stage 01 exits -> Stage 02 enters (around 0.25)
    // -------------------------------------------------------------
    // Stage 01 exits (0.19 -> 0.25)
    tl.to(stageRefs.current[0], {
      opacity: 0,
      y: -30,
      filter: 'blur(4px)',
      duration: 0.06,
      ease: 'power2.in'
    }, 0.19);
    tl.to(metaLineRefs.current[0], { scaleX: 0, duration: 0.05 }, 0.19);

    // Stage 02 enters (0.24 -> 0.32)
    const chars1 = stageRefs.current[1]?.querySelectorAll('.char');
    tl.to(stageRefs.current[1], {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.08,
      ease: 'power2.out'
    }, 0.24);
    if (chars1 && chars1.length) {
      tl.to(chars1, {
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        stagger: 0.003,
        duration: 0.06,
        ease: 'back.out(1.8)'
      }, 0.24);
    }
    tl.to(metaLineRefs.current[1], {
      scaleX: 1,
      duration: 0.06,
      ease: 'power2.out'
    }, 0.26);

    // -------------------------------------------------------------
    // TRANSITION 2: Stage 02 exits -> Stage 03 enters (around 0.50)
    // -------------------------------------------------------------
    // Stage 02 exits (0.44 -> 0.50)
    tl.to(stageRefs.current[1], {
      opacity: 0,
      y: -30,
      filter: 'blur(4px)',
      duration: 0.06,
      ease: 'power2.in'
    }, 0.44);
    tl.to(metaLineRefs.current[1], { scaleX: 0, duration: 0.05 }, 0.44);

    // Stage 03 enters (0.49 -> 0.57)
    const chars2 = stageRefs.current[2]?.querySelectorAll('.char');
    tl.to(stageRefs.current[2], {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.08,
      ease: 'power2.out'
    }, 0.49);
    if (chars2 && chars2.length) {
      tl.to(chars2, {
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        stagger: 0.003,
        duration: 0.06,
        ease: 'back.out(1.8)'
      }, 0.49);
    }
    tl.to(metaLineRefs.current[2], {
      scaleX: 1,
      duration: 0.06,
      ease: 'power2.out'
    }, 0.51);

    // -------------------------------------------------------------
    // TRANSITION 3: Stage 03 exits -> Stage 04 enters (around 0.75)
    // -------------------------------------------------------------
    // Stage 03 exits (0.69 -> 0.75)
    tl.to(stageRefs.current[2], {
      opacity: 0,
      y: -30,
      filter: 'blur(4px)',
      duration: 0.06,
      ease: 'power2.in'
    }, 0.69);
    tl.to(metaLineRefs.current[2], { scaleX: 0, duration: 0.05 }, 0.69);

    // Stage 04 enters (0.74 -> 0.82)
    const chars3 = stageRefs.current[3]?.querySelectorAll('.char');
    tl.to(stageRefs.current[3], {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.08,
      ease: 'power2.out'
    }, 0.74);
    if (chars3 && chars3.length) {
      tl.to(chars3, {
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        stagger: 0.003,
        duration: 0.06,
        ease: 'back.out(1.8)'
      }, 0.74);
    }
    tl.to(metaLineRefs.current[3], {
      scaleX: 1,
      duration: 0.06,
      ease: 'power2.out'
    }, 0.76);

    // Stage 04 stays solid through 1.00 before cleanly unpinning
    tl.to({}, { duration: 0.18 }, 0.82);

    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    if (window.lenis && typeof window.lenis.resize === 'function') {
      window.lenis.resize();
    }

    return () => {
      tl.kill();
      if (scrollTriggerInstance.current) {
        scrollTriggerInstance.current.kill();
      }
    };
  }, []);

  const handleTimelineClick = (index) => {
    if (!scrollTriggerInstance.current) return;
    const st = scrollTriggerInstance.current;
    const progressTargets = [0.05, 0.35, 0.62, 0.88];
    const targetY = st.start + (st.end - st.start) * progressTargets[index];
    if (window.lenis) {
      window.lenis.scrollTo(targetY);
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  return (
    <div className="hiring-cinematic-stage" ref={stageElRef}>
      {/* 2. Header: Upper-Center, clean and compact */}
      <div className="hiring-header-wrap">
        <span className="tag-mono hiring-header-tag">OUR HIRING PROCESS</span>
        <h3 className="hiring-header-title">Our Hiring Process.</h3>
        <p className="hiring-header-desc">
          We respect your time. Our technical interview cycle is transparent and designed to give you an answer within two weeks.
        </p>
      </div>

      {/* 3. Main Two-Column Cinematic Body */}
      <div className="hiring-cinematic-body">
        {/* LEFT COLUMN: Large Process Content */}
        <div className="hiring-left-col">
          <div className="hiring-stages-viewport">
            {HIRING_STAGES.map((stage, idx) => (
              <div
                key={idx}
                className={`hiring-stage-panel ${idx === 0 ? 'is-active' : ''}`}
                ref={(el) => (stageRefs.current[idx] = el)}
              >
                <span className="hiring-stage-num">{stage.num}</span>

                <ScrollFloat as="h2" containerClassName="hiring-stage-title">
                  {stage.title}
                </ScrollFloat>

                <div className="hiring-stage-divider" aria-hidden="true" />

                <p className="hiring-stage-desc">{stage.desc}</p>

                <div className="hiring-stage-meta">
                  <span className="hiring-meta-dot" aria-hidden="true" />
                  <span>{stage.category}</span>
                  <span
                    className="hiring-meta-line"
                    ref={(el) => (metaLineRefs.current[idx] = el)}
                    aria-hidden="true"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Fixed Vertical Timeline */}
        <div className="hiring-right-col">
          <div className="hiring-timeline" aria-label="Hiring Process Stages">
            <div className="hiring-timeline-track" aria-hidden="true" />
            <div className="hiring-timeline-progress" ref={progressLineRef} aria-hidden="true" />

            {HIRING_STAGES.map((stage, idx) => (
              <div
                key={idx}
                className={`hiring-timeline-item ${idx === 0 ? 'is-active' : ''}`}
                ref={(el) => (timelineItemsRef.current[idx] = el)}
                onClick={() => handleTimelineClick(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleTimelineClick(idx);
                }}
              >
                <div className="hiring-timeline-node">
                  <span className="hiring-timeline-dot" />
                </div>
                <div className="hiring-timeline-info">
                  <span className="hiring-timeline-num">{stage.numCode}</span>
                  <span className="hiring-timeline-title">{stage.timelineTitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Keep backward compatible export for main.js
export function initHiringProcessCarousel() {
  const mountEl = document.getElementById('hiring-process-root');
  if (!mountEl) return;
  if (mountEl.dataset.mounted === 'true') return;
  mountEl.dataset.mounted = 'true';

  const root = createRoot(mountEl);
  root.render(<HiringProcessSection />);
}
