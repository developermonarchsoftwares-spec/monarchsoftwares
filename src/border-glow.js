/**
 * BorderGlow — Official React Bits <BorderGlow /> implementation (JS + CSS variant,
 * https://reactbits.dev/r/BorderGlow-JS-CSS.json).
 *
 * Provides site-wide reusable BorderGlow that integrates seamlessly onto all grid cards
 * across the website while strictly preserving existing layouts, spacing, content,
 * card dimensions, scroll reveal animations, and border-radii.
 */
import './border-glow.css';

function parseHSL(hslStr) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

function buildGlowVars(glowColor, intensity) {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
  const vars = {};
  for (let i = 0; i < opacities.length; i++) {
    vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`;
  }
  return vars;
}

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const GRADIENT_KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors) {
  const vars = {};
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    vars[GRADIENT_KEYS[i]] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`;
  }
  vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`;
  return vars;
}

function isLightColor(color) {
  const value = color.trim().replace('#', '');
  if (!/^[\da-f]{3}([\da-f]{3})?$/i.test(value)) return false;
  const hex = value.length === 3 ? value.split('').map((char) => char + char).join('') : value;
  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  return red * 0.2126 + green * 0.7152 + blue * 0.0722 > 180;
}

function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
function easeInCubic(x) { return x * x * x; }

function animateValue({ start = 0, end = 100, duration = 1000, delay = 0, ease = easeOutCubic, onUpdate, onEnd }) {
  const t0 = performance.now() + delay;
  function tick() {
    const elapsed = performance.now() - t0;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) requestAnimationFrame(tick);
    else if (onEnd) onEnd();
  }
  setTimeout(() => requestAnimationFrame(tick), delay);
}

/** Official React Bits BorderGlow configuration requested for this site */
export const BORDER_GLOW_CONFIG = {
  edgeSensitivity: 10,
  glowColor: '40 80 80',
  backgroundColor: '#120F17',
  borderRadius: 40,
  glowRadius: 31,
  glowIntensity: 2.5,
  coneSpread: 16,
  animated: true,
  colors: ['#c084fc', '#f472b6', '#38bdf8'],
  fillOpacity: 0.5
};

/**
 * Apply BorderGlow to an existing element in place (the element becomes the
 * `.border-glow-card`, preserving its existing layout, dimensions, and DOM hierarchy).
 */
export function initBorderGlow(element, options = {}) {
  if (!element || element.classList.contains('border-glow-card')) return;

  const {
    edgeSensitivity, glowColor, backgroundColor, borderRadius, glowRadius,
    glowIntensity, coneSpread, animated, colors, fillOpacity, keepStyle
  } = { ...BORDER_GLOW_CONFIG, ...options };

  // Preserve existing border-radius if the card already has a specific shape
  const computedRadius = getComputedStyle(element).borderRadius;
  let finalRadius = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;
  if (computedRadius && computedRadius !== '0px' && computedRadius !== '40px' && !options.borderRadius) {
    finalRadius = computedRadius;
  }

  // Preserve original layout display (grid, flex, block, etc.)
  const originalDisplay = getComputedStyle(element).display;

  const styles = {
    '--card-bg': backgroundColor,
    '--edge-sensitivity': edgeSensitivity,
    '--border-radius': finalRadius,
    '--glow-padding': `${glowRadius}px`,
    '--cone-spread': coneSpread,
    '--fill-opacity': fillOpacity,
    ...buildGlowVars(glowColor, glowIntensity),
    ...buildGradientVars(colors)
  };
  for (const [key, value] of Object.entries(styles)) element.style.setProperty(key, value);

  element.classList.add('border-glow-card', keepStyle ? 'bg-keep' : 'bg-host');
  if (isLightColor(backgroundColor)) element.classList.add('border-glow-card--light');
  if (originalDisplay && originalDisplay !== 'none') element.style.display = originalDisplay;

  // <span class="edge-light"/> + <div class="border-glow-inner">children</div>
  const edge = document.createElement('span');
  edge.className = 'edge-light';
  edge.setAttribute('aria-hidden', 'true');
  const inner = document.createElement('div');
  inner.className = 'border-glow-inner';
  while (element.firstChild) inner.appendChild(element.firstChild);
  element.appendChild(edge);
  element.appendChild(inner);

  const getCenterOfElement = (el) => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  };

  const getEdgeProximity = (el, x, y) => {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    let kx = Infinity;
    let ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  };

  const getCursorAngle = (el, x, y) => {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    const radians = Math.atan2(dy, dx);
    let degrees = radians * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  };

  element.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    element.style.setProperty('--edge-proximity', `${(getEdgeProximity(element, x, y) * 100).toFixed(3)}`);
    element.style.setProperty('--cursor-angle', `${getCursorAngle(element, x, y).toFixed(3)}deg`);
  });

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (animated && !isReducedMotion) {
    const angleStart = 110;
    const angleEnd = 465;
    element.classList.add('sweep-active');
    element.style.setProperty('--cursor-angle', `${angleStart}deg`);

    animateValue({ duration: 500, onUpdate: (v) => element.style.setProperty('--edge-proximity', v) });
    animateValue({ ease: easeInCubic, duration: 1500, end: 50, onUpdate: (v) => {
      element.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`);
    } });
    animateValue({ ease: easeOutCubic, delay: 1500, duration: 2250, start: 50, end: 100, onUpdate: (v) => {
      element.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`);
    } });
    animateValue({ ease: easeInCubic, delay: 2500, duration: 1500, start: 100, end: 0,
      onUpdate: (v) => element.style.setProperty('--edge-proximity', v),
      onEnd: () => element.classList.remove('sweep-active')
    });
  }
}

/** Every bordered card / grid item across the entire website */
export const BORDER_GLOW_SELECTOR = [
  '[data-border-glow]',
  '.content-card',          // service grids, about grids, mission/vision cards
  '.pillar-card',           // homepage service pillars
  '.principle-card',        // Core Principles cards
  '.job-card',              // Career open positions cards
  '.stat-box',              // "Why Monarch" cards
  '.faq-item',              // FAQ cards
  '.project-card',          // Project/portfolio grids
  '.tech-matrix-card',      // Technology cards
  '.service-preview-card',  // Service preview cards
  '.about-image-card',      // About visual cards
  '.climax-form-wrap',      // Inquiry form card
  '#contact-form-card',     // Contact page form card
  '.content-grid > div'     // Any card inside content grids across all pages
].join(',');

export function initAllBorderGlow(root = document) {
  root.querySelectorAll(BORDER_GLOW_SELECTOR).forEach((el) => initBorderGlow(el));
}
