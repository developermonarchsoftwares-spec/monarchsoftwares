import React, { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ElectricLogo from './electric-logo/ElectricLogo.jsx';

export function AboutHeroElectricBackground() {
  const stageRef = useRef(null);
  const cardRef = useRef(null);

  // Ensure no scroll-driven draw progress is applied: the logo renders in its normal static state.
  if (typeof window !== 'undefined') window.__aboutLogoDrawProgress = undefined;

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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.8
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
