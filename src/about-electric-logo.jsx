import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ElectricLogo from './electric-logo/ElectricLogo.jsx';

export function AboutHeroElectricBackground() {
  const stageRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    let animId;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;
    let targetScrollProgress = 0;
    let currentScrollProgress = 0;

    const onMouseMove = (e) => {
      const hero = stageRef.current?.closest('.about-hero') || stageRef.current;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      // 3D tilt responding to cursor movement
      targetTiltX = -y * 16; // Pitch in degrees
      targetTiltY = x * 20;  // Yaw in degrees
    };

    const onMouseLeave = () => {
      targetTiltX = 0;
      targetTiltY = 0;
    };

    const onScroll = () => {
      const hero = stageRef.current?.closest('.about-hero');
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const heroHeight = rect.height || window.innerHeight;
      // scrollProgress: 0 when hero is fully visible at top, progresses as user scrolls down
      const scrolled = Math.max(0, -rect.top);
      targetScrollProgress = Math.min(1.5, scrolled / (heroHeight * 0.9));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    onScroll();

    const loop = () => {
      // Smooth 60fps physics lerp for 3D motion
      currentTiltX += (targetTiltX - currentTiltX) * 0.08;
      currentTiltY += (targetTiltY - currentTiltY) * 0.08;
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.08;

      if (cardRef.current) {
        // 3D perspective transforms driven by scroll position
        const scrollPitch = currentScrollProgress * 28;     // 3D pitch backward into horizon
        const scrollZ = -currentScrollProgress * 260;       // Recess deep into 3D screen space
        const scrollY = currentScrollProgress * 150;        // 3D parallax depth lag
        const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
        const baseOpacity = isMobile ? 0.72 : 0.88;
        const baseScale = isMobile ? 0.85 : 1.0;
        const scrollScale = Math.max(0.55, baseScale - currentScrollProgress * 0.18);
        const scrollOpacity = Math.max(0, baseOpacity * (1 - Math.pow(currentScrollProgress, 1.5) * 1.15));

        const totalRotX = scrollPitch + currentTiltX;
        const totalRotY = currentTiltY;

        cardRef.current.style.transform = `translate3d(0px, ${scrollY.toFixed(1)}px, ${scrollZ.toFixed(1)}px) rotateX(${totalRotX.toFixed(2)}deg) rotateY(${totalRotY.toFixed(2)}deg) scale(${scrollScale.toFixed(3)})`;
        cardRef.current.style.opacity = scrollOpacity.toFixed(3);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="about-hero-3d-stage"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        perspective: '1200px',
        perspectiveOrigin: '50% 50%',
        overflow: 'hidden',
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1
      }}
    >
      <div
        ref={cardRef}
        className="about-hero-3d-card"
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '960px',
          maxHeight: '720px',
          position: 'relative',
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ElectricLogo
          src="/logo.png"
          color="#ffffff"
          glowColor="#ffffff"
          scale={0.7}
          strands={4}
          bend={0.6}
          crackle={1.5}
          arcs={1}
          speed={2.5}
          interactive
        />
      </div>
    </div>
  );
}

export function initAboutElectricLogo() {
  const rootElement = document.getElementById('about-electric-logo-root');
  if (!rootElement) return;

  if (rootElement.dataset.mounted === 'true') return;
  rootElement.dataset.mounted = 'true';

  const root = createRoot(rootElement);
  root.render(<AboutHeroElectricBackground />);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutElectricLogo);
  } else {
    initAboutElectricLogo();
  }
}
