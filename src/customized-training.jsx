import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CardSwap, { Card } from './CardSwap.jsx';
import './customized-training.css';

gsap.registerPlugin(ScrollTrigger);

// =============================================================================
// SERVICE CARDS DATA ACROSS ALL 4 SERVICE PAGES
// =============================================================================

export const CORPORATE_TRAINING_CARDS = [
  {
    id: '01',
    num: '01',
    title: 'Curriculum Design',
    desc: 'We collaborate with your leadership to create training content that meets your goals — for example a new technology adoption, leadership development, or digital marketing skills.'
  },
  {
    id: '02',
    num: '02',
    title: 'Hands-on Learning',
    desc: 'Trainees work on live projects and case studies, not just lectures. This project-based approach helps skills become immediately applicable.'
  },
  {
    id: '03',
    num: '03',
    title: 'Flexible Delivery',
    desc: 'Choose from onsite workshops, virtual classrooms, or blended learning. Sessions can be one-off seminars or multi-week bootcamps, depending on need.'
  },
  {
    id: '04',
    num: '04',
    title: 'Progress Tracking',
    desc: 'Pre- and post-training assessments gauge improvement, and we provide reports on trainee performance to help verify learning outcomes.'
  }
];

export const IT_SERVICES_CARDS = [
  {
    id: '01',
    num: '01',
    title: 'Full-Stack Development',
    desc: 'We design and build custom web applications using modern frameworks such as Next.js, React, and Node.js. Sites are responsive, SEO-optimized, and can include analytics integration for conversion tracking.'
  },
  {
    id: '02',
    num: '02',
    title: 'Native & Cross-Platform Apps',
    desc: 'Our mobile solutions cover iOS, Android, and cross-platform (React Native/Flutter). From consumer apps to internal tools, we handle everything from ideation through App Store and Play Store deployment and support.'
  },
  {
    id: '03',
    num: '03',
    title: 'Progressive Web Apps',
    desc: 'For startups and businesses needing speed-to-market, we deliver PWAs that behave like native apps on mobile and desktop.'
  }
];

export const DIGITAL_MARKETING_CARDS = [
  {
    id: '01',
    num: '01',
    title: 'Technical SEO',
    desc: 'We begin with a thorough audit covering site speed, Core Web Vitals, schema, and link structure. Fixing these foundations helps your site stay crawl-friendly and compete in search results.'
  },
  {
    id: '02',
    num: '02',
    title: 'Content Strategy',
    desc: 'Keyword research mapped to buyer intent drives our editorial plan. We create blogs, guides, and landing pages tailored to your audience, focused on valuable topics that attract qualified traffic.'
  },
  {
    id: '03',
    num: '03',
    title: 'Backlink Building',
    desc: 'We pursue high-quality backlinks through outreach and partnerships, building your authority and search visibility over time.'
  }
];

export const TRAINING_PLACEMENT_CARDS = [
  {
    id: '01',
    num: '01',
    title: 'Hands-On Curriculum',
    desc: 'We teach industry-relevant skills — full-stack development, AI & ML, digital marketing, HR operations — through practical projects. Graduates don\'t just have certificates; they have code and campaigns to show.'
  },
  {
    id: '02',
    num: '02',
    title: 'Mentorship',
    desc: 'Learners receive guidance and feedback from working professionals. This personalized support helps accelerate learning and build confidence.'
  },
  {
    id: '03',
    num: '03',
    title: 'Structured Progress',
    desc: 'Programs start with fundamentals and build toward advanced projects, with regular assessments to check mastery at each stage. Contact us for current program and batch details.'
  }
];

// Backwards-compatibility alias for Service Page 1
export const TRAINING_CARDS = CORPORATE_TRAINING_CARDS;

// =============================================================================
// REUSABLE MASTER SERVICE CARD SWAP COMPONENT (FROM SERVICE PAGE 1)
// =============================================================================

export function ServiceCardSwapSection({ trackId, cards }) {
  const cardSwapRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: 390,
    height: 250,
    dx: 60,
    dy: 38,
    dz: 60
  });

  useEffect(() => {
    const updateDimensions = () => {
      const w = window.innerWidth;
      if (w < 480) {
        setDimensions({
          width: Math.min(310, w - 48),
          height: 240,
          dx: 22,
          dy: 20,
          dz: 35
        });
      } else if (w < 768) {
        setDimensions({
          width: 340,
          height: 245,
          dx: 30,
          dy: 26,
          dz: 42
        });
      } else if (w < 1100) {
        setDimensions({
          width: 360,
          height: 245,
          dx: 45,
          dy: 32,
          dz: 50
        });
      } else {
        setDimensions({
          width: 390,
          height: 250,
          dx: 60,
          dy: 38,
          dz: 60
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const track = document.getElementById(trackId);
    const stage = track?.querySelector('.customized-training-stage');
    if (!track || !stage) return;

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      if (cardSwapRef.current) {
        cardSwapRef.current.setProgress(0);
      }
      return;
    }

    const isMobile = window.innerWidth <= 768;
    const pinDistance = isMobile ? 1400 : 2200;

    // Create GSAP ScrollTrigger timeline matching Service Page 1
    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: `+=${pinDistance}`,
      pin: stage,
      pinSpacing: true,
      scrub: 0.85,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (cardSwapRef.current) {
          cardSwapRef.current.setProgress(self.progress);
        }
      }
    });

    return () => {
      st.kill();
    };
  }, [trackId]);

  return (
    <div ref={containerRef} className="customized-cardswap-wrapper">
      <CardSwap
        ref={cardSwapRef}
        scrollControlled={true}
        scrollProgress={0}
        autoplay={false}
        draggable={false}
        width={dimensions.width}
        height={dimensions.height}
        cardDistance={dimensions.dx}
        verticalDistance={dimensions.dy}
        depth={dimensions.dz}
        skewAmount={4}
        visibleCards={cards.length}
        cardRadius={16}
        dim={0.55}
        theme="dark"
        className="customized-training-cardswap"
      >
        {cards.map((card) => (
          <Card key={card.id}>
            <div className="card-swap-item">
              <div className="card-swap-head">
                <span className="card-swap-num">{card.num}</span>
                <span className="card-swap-badge-dot" aria-hidden="true" />
              </div>
              <h3 className="card-swap-title">{card.title}</h3>
              <p className="card-swap-desc">{card.desc}</p>
            </div>
          </Card>
        ))}
      </CardSwap>
    </div>
  );
}

// Service Page 1 Component
export function TrainingCardSwapSection() {
  return <ServiceCardSwapSection trackId="customized-training" cards={CORPORATE_TRAINING_CARDS} />;
}

// =============================================================================
// INITIALIZERS
// =============================================================================

export function initAllServiceSecondSections() {
  // Service Page 1: Corporate Training
  const mount1 = document.getElementById('customized-training-mount');
  if (mount1 && mount1.dataset.mounted !== 'true') {
    mount1.dataset.mounted = 'true';
    const root1 = createRoot(mount1);
    root1.render(<ServiceCardSwapSection trackId="customized-training" cards={CORPORATE_TRAINING_CARDS} />);
  }

  // Service Page 2: IT Services
  const mount2 = document.getElementById('web-mobile-cardswap-mount');
  if (mount2 && mount2.dataset.mounted !== 'true') {
    mount2.dataset.mounted = 'true';
    const root2 = createRoot(mount2);
    root2.render(<ServiceCardSwapSection trackId="web-mobile-apps" cards={IT_SERVICES_CARDS} />);
  }

  // Service Page 3: Digital Marketing
  const mount3 = document.getElementById('digital-marketing-cardswap-mount');
  if (mount3 && mount3.dataset.mounted !== 'true') {
    mount3.dataset.mounted = 'true';
    const root3 = createRoot(mount3);
    root3.render(<ServiceCardSwapSection trackId="seo-content-marketing" cards={DIGITAL_MARKETING_CARDS} />);
  }

  // Service Page 4: IT Training & Placement
  const mount4 = document.getElementById('training-placement-cardswap-mount');
  if (mount4 && mount4.dataset.mounted !== 'true') {
    mount4.dataset.mounted = 'true';
    const root4 = createRoot(mount4);
    root4.render(<ServiceCardSwapSection trackId="comprehensive-training" cards={TRAINING_PLACEMENT_CARDS} />);
  }
}

export function initCustomizedTrainingCardSwap() {
  initAllServiceSecondSections();
}
