import React from 'react';
import { createRoot } from 'react-dom/client';
import { ServiceCardSwapSection, IT_SERVICES_CARDS, initAllServiceSecondSections } from './customized-training.jsx';

export { IT_SERVICES_CARDS };

export function WebMobileCardSwapSection() {
  return <ServiceCardSwapSection trackId="web-mobile-apps" cards={IT_SERVICES_CARDS} />;
}

export function initWebMobileCardSwap() {
  const mountEl = document.getElementById('web-mobile-cardswap-mount');
  if (!mountEl || mountEl.dataset.mounted === 'true') return;
  mountEl.dataset.mounted = 'true';
  const root = createRoot(mountEl);
  root.render(<WebMobileCardSwapSection />);
}
