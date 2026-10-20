import './principles-scroll.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Core Principles - scroll-driven "Product Stage".
 *
 * A port of the Framer "Product Stage" component (marketplace listing; its code module is ProductFocusCarousel) onto the existing
 * principle cards, with the carousel's index driven by scroll instead of clicks / autoplay.
 *
 * Behaviour taken from the reference component's source:
 *   - one card is the focus (scale 1, centred, on top); the others are tucked to its sides at inactiveScale 0.75 and shrink a further
 *     15% per step (0.6375 for a neighbour, 0.525 two steps away)
 *   - a neighbour sits at x = card width * 0.85 + gap * (1 - |step| * 0.2) (so cards two steps away tuck closer, behind the neighbour),
 *     stacking order 10 - |step|, cards more than one step away are blurred 2px, cards beyond two steps are not shown
 *   - portrait cards (380 x 520 on desktop, 280 x 380 on mobile, gap 40, radius 24) with the image full-bleed, a dark gradient over the
 *     lower 60% and the text overlaid at the bottom; only the focused card shows its detail
 * Here the "active index" is a continuous number computed from scroll progress, so every card glides between those states.
 *
 * Scroll sequence (one pinned, scrubbed timeline):
 *   0.00 - 0.12  heading alone, centred
 *   0.12 - 0.26  heading lifts away, the stage fades up and principle 01 takes focus
 *   0.22 - 0.85  focus moves 01 -> 02 -> 03 -> 04 -> 01 (the loop: card 01 comes back in from the right right after 04)
 *   0.85 - 1.00  rest on 01, then the pin releases; the next downward scroll continues to the next section
 * Scrolling up plays it backwards. Reduced motion keeps the plain stacked cards.
 */
// progress windows of the four focus changes: 01->02, 02->03, 03->04 and 04->01 (the loop: card 01 returns from the right after card 04)
const STEPS = [[0.28, 0.385], [0.435, 0.54], [0.59, 0.695], [0.745, 0.85]];
const ENTER = [0.10, 0.22];                                   // heading -> stage

export function initPrinciplesScroll() {
  const section = document.getElementById('core-principles');
  if (!section) return;
  const pin = section.querySelector('.principles-pin-container');
  const head = section.querySelector('.principles-head');
  const viewport = section.querySelector('.principles-viewport');
  const track = document.getElementById('principles-track');
  if (!pin || !head || !viewport || !track) return;
  const cards = Array.from(track.querySelectorAll('.principle-card'));
  if (!cards.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;   // reduced motion: plain stacked cards (CSS)

  const progressFill = document.getElementById('principles-progress-fill');
  const counterEl = document.getElementById('principles-counter');
  const nodes = Array.from(section.querySelectorAll('.principles-node'));

  const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const N = cards.length;

  // ---- reference constants (activeScale 1, inactiveScale .75, gap 40) ----
  const ACTIVE = 1, INACTIVE = 0.75, GAP = 40;

  let cw = 380, ch = 520;
  const layout = () => {
    const W = window.innerWidth, H = window.innerHeight, mobile = W < 769;
    // reference sizes: 380x520 desktop, 280x380 mobile; scaled up on big screens, kept inside the viewport
    const ratio = mobile ? 380 / 280 : 520 / 380;
    let w = mobile ? Math.min(300, W * 0.74) : Math.min(460, Math.max(340, W * 0.24));
    let h = w * ratio;
    const maxH = H * (mobile ? 0.62 : 0.66);
    if (h > maxH) { h = maxH; w = h / ratio; }
    cw = w; ch = h;
    section.style.setProperty('--ps-w', `${w.toFixed(1)}px`);
    section.style.setProperty('--ps-h', `${h.toFixed(1)}px`);
  };

  section.classList.add('is-stage');
  cards.forEach((c, i) => c.setAttribute('data-ps-index', String(i)));

  /** the reference's per-card style as a continuous function of the (fractional) step `d` from the focus */
  const styleFor = (d, gap) => {
    d = ((((d + N / 2) % N) + N) % N) - N / 2;   // circular distance: the cards form a loop, so after card 04 card 01 arrives from the right
    const ad = Math.abs(d), dir = d < 0 ? -1 : 1;
    const x1 = cw * 0.85 + gap * 0.8;   // one step away
    let x, scale;
    if (ad <= 1) { x = d * x1; scale = lerp(ACTIVE, INACTIVE * 0.85, ad); }
    else { x = dir * (cw * 0.85 + gap * (1 - ad * 0.2)); scale = INACTIVE * (1 - ad * 0.15); }
    const blur = Math.min(1, Math.max(0, ad - 1)) * 2;                         // > 1 step away: 2px blur
    const z = Math.round((10 - ad) * 10);
    const vis = 1 - smooth((ad - 1.4) / 0.6);                                   // not shown beyond two steps (fades out before the loop's far side, so nothing ever pops)
    const focus = 1 - Math.min(1, ad);                                          // 1 on the focused card, 0 at one step or more
    return { x, scale: Math.max(0.2, scale), blur, z, vis, focus };
  };

  const activeAt = (p) => {   // continuous focus index 0..N-1 with a rest on each card
    let a = 0;
    STEPS.forEach(([s, e]) => { a += smooth((p - s) / (e - s)); });
    return a;   // 0 .. N (N = back on card 01 after the loop)
  };

  const proxy = { p: 0 };
  const render = () => {
    const p = proxy.p;
    const a = activeAt(p);
    const enter = smooth((p - ENTER[0]) / (ENTER[1] - ENTER[0]));
    const gap = GAP * (cw / 380);

    // heading: centred and alone first, then it lifts away as the stage comes in
    head.style.setProperty('--ps-head-o', (1 - smooth(enter * 1.4)).toFixed(3));
    head.style.setProperty('--ps-head-y', `${(-enter * 56).toFixed(1)}px`);
    head.style.setProperty('--ps-head-s', (1 - enter * 0.06).toFixed(4));

    cards.forEach((card, i) => {
      const st = styleFor(i - a, gap);
      const o = st.vis * enter;
      const y = (1 - enter) * 90 + (1 - st.focus) * 10;                          // rises into place while entering; neighbours sit slightly lower
      card.style.setProperty('--x', `${st.x.toFixed(1)}px`);
      card.style.setProperty('--y', `${y.toFixed(1)}px`);
      card.style.setProperty('--s', (st.scale * (0.9 + 0.1 * enter)).toFixed(4));
      card.style.setProperty('--b', `${st.blur.toFixed(2)}px`);
      card.style.setProperty('--o', o.toFixed(3));
      card.style.setProperty('--f', st.focus.toFixed(3));                          // drives the detail text + dimming
      card.style.zIndex = String(st.z);
      card.style.pointerEvents = st.focus > 0.5 && o > 0.5 ? 'auto' : 'none';
    });

    const current = enter < 0.35 ? 0 : (Math.round(a) % N) + 1;
    if (progressFill) progressFill.style.width = `${(p * 100).toFixed(2)}%`;
    if (counterEl) counterEl.textContent = `0${current} / 0${N}`;
    nodes.forEach((node, i) => node.classList.toggle('principles-node--active', current > 0 && i === current - 1));
  };

  layout();
  render();

  const tween = gsap.to(proxy, {
    p: 1,
    ease: 'none',
    onUpdate: render,
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * (window.innerWidth < 769 ? 5.2 : 5.8))}`,
      scrub: 0.7,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
  const onRefresh = () => { layout(); render(); };
  ScrollTrigger.addEventListener('refreshInit', layout);
  ScrollTrigger.addEventListener('refresh', onRefresh);

  cards.forEach((card) => {
    const img = card.querySelector('.principle-media img');
    if (img && !img.complete) img.addEventListener('load', () => ScrollTrigger.refresh());
  });

  return () => {
    tween.scrollTrigger && tween.scrollTrigger.kill();
    tween.kill();
    ScrollTrigger.removeEventListener('refreshInit', layout);
    ScrollTrigger.removeEventListener('refresh', onRefresh);
    section.classList.remove('is-stage');
  };
}
