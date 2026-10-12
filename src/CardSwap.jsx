'use client';

import React, {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef
} from 'react';
import './CardSwap.css';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const THEMES = {
  dark: {
    '--swap-tile': 'linear-gradient(165deg, #18181c 0%, #0d0d10 100%)',
    '--swap-tile-edge': 'rgba(255, 255, 255, 0.08)',
    '--swap-tile-highlight': 'rgba(255, 255, 255, 0.14)',
    '--swap-shadow': '0 30px 60px -24px rgba(0, 0, 0, 0.85), 0 10px 24px -12px rgba(0, 0, 0, 0.6)',
    '--swap-media-edge': 'rgba(255, 255, 255, 0.06)',
    '--swap-ink': '#f4f4f5',
    '--swap-badge': 'rgba(255, 255, 255, 0.08)',
    '--swap-shade': '#050507'
  },
  light: {
    '--swap-tile': 'linear-gradient(180deg, #ffffff 0%, #f6f6f8 100%)',
    '--swap-tile-edge': 'rgba(24, 24, 27, 0.08)',
    '--swap-tile-highlight': 'rgba(255, 255, 255, 1)',
    '--swap-shadow': '0 30px 60px -28px rgba(24, 24, 27, 0.35), 0 10px 24px -14px rgba(24, 24, 27, 0.2)',
    '--swap-media-edge': 'rgba(24, 24, 27, 0.06)',
    '--swap-ink': '#27272a',
    '--swap-badge': 'rgba(24, 24, 27, 0.05)',
    '--swap-shade': '#ffffff'
  }
};

const PERSPECTIVE = 900;
const TAU = Math.PI * 2;
const STEP = 1 / 240;
const PAD = 32;
const AXES = ['x', 'y', 'z', 'r', 'p'];
const DOWN = { x: 0, y: 1 };

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const stackBounds = ({ width, height, cardDistance, verticalDistance, depth, skewAmount, visible, hoverSpread }) => {
  const slope = Math.tan((skewAmount * Math.PI) / 180);
  const spread = 1 + Math.max(0, hoverSpread);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < visible; i++) {
    const scale = PERSPECTIVE / (PERSPECTIVE + i * depth);
    for (const u of [-width / 2, width / 2]) {
      for (const v of [-height / 2, height / 2]) {
        const x = (i * cardDistance * spread + u) * scale;
        const y = (-i * verticalDistance * spread + v + u * slope) * scale;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return {
    width: Math.ceil(maxX - minX + PAD * 2),
    height: Math.ceil(maxY - minY + PAD * 2),
    originX: PAD - minX,
    originY: PAD - minY
  };
};

export const Card = forwardRef(({ customClass, className, children, ...rest }, ref) => (
  <div ref={ref} {...rest} className={['card-swap-card', customClass, className].filter(Boolean).join(' ')}>
    {children}
    <span className="card-swap-card-rim" aria-hidden="true" />
  </div>
));
Card.displayName = 'Card';

const ItemCard = ({ item }) => (
  <Card>
    <div className="card-swap-item">
      {(item.icon || item.title || item.num) && (
        <div className="card-swap-head">
          {item.num && <span className="card-swap-num">{item.num}</span>}
          {item.icon && <span className="card-swap-icon">{item.icon}</span>}
          <span className="card-swap-badge-dot" aria-hidden="true" />
        </div>
      )}
      {item.title && <h3 className="card-swap-title">{item.title}</h3>}
      {item.desc && <p className="card-swap-desc">{item.desc}</p>}
      {item.image && (
        <div className="card-swap-media">
          <img src={item.image} alt={item.alt ?? item.title ?? ''} draggable={false} />
        </div>
      )}
    </div>
  </Card>
);

const CardSwap = forwardRef(
  (
    {
      items,
      width = 420,
      height = 280,
      cardDistance = 55,
      verticalDistance = 45,
      depth = 70,
      skewAmount = 5,
      visibleCards = 5,
      delay = 4000,
      autoplay = false,
      pauseOnHover = true,
      draggable = false,
      speed = 1,
      bounce = 0.35,
      parallax = 0.4,
      hoverSpread = 0.1,
      dim = 0.55,
      cardRadius = 16,
      intro = false,
      theme = 'dark',
      scrollProgress = null,
      scrollControlled = false,
      onCardClick,
      onChange,
      className = '',
      children
    },
    ref
  ) => {
    const rootRef = useRef(null);
    const stageRef = useRef(null);
    const slotRefs = useRef([]);
    const shadeRefs = useRef([]);
    const apiRef = useRef(null);
    const settingsRef = useRef(null);

    const cards = useMemo(() => {
      const custom = Children.toArray(children).filter(isValidElement);
      if (custom.length) return custom;
      return (items?.length ? items : []).map((item, index) => (
        <ItemCard key={`${item.title ?? 'card'}-${index}`} item={item} />
      ));
    }, [children, items]);

    const count = cards.length;
    const cardWidth = Math.max(40, Number(width) || 420);
    const cardHeight = Math.max(40, Number(height) || 280);
    const visible = clamp(Math.round(visibleCards), 1, Math.max(1, count));

    const bounds = useMemo(
      () =>
        stackBounds({
          width: cardWidth,
          height: cardHeight,
          cardDistance,
          verticalDistance,
          depth: Math.max(0, depth),
          skewAmount,
          visible,
          hoverSpread
        }),
      [cardWidth, cardHeight, cardDistance, verticalDistance, depth, skewAmount, visible, hoverSpread]
    );

    settingsRef.current = {
      width: cardWidth,
      height: cardHeight,
      dx: cardDistance,
      dy: verticalDistance,
      dz: Math.max(0, depth),
      skew: skewAmount,
      visible,
      delay,
      autoplay,
      pauseOnHover,
      draggable,
      speed: clamp(speed, 0.1, 4),
      bounce: clamp(bounce, 0, 1),
      parallax: clamp(parallax, 0, 1),
      hoverSpread: Math.max(0, hoverSpread),
      dim: clamp(dim, 0, 1),
      bounds,
      scrollControlled,
      onCardClick,
      onChange
    };

    // Slot position calculator for slot k in the 3D stack
    const getSlotCoord = (k, s) => {
      const q = Math.min(k, s.visible);
      return {
        x: q * s.dx,
        y: -q * s.dy,
        z: -q * s.dz,
        scale: 1 - q * 0.04,
        opacity: q < s.visible ? 1 - q * 0.12 : 0,
        shade: (s.dim * (q / Math.max(1, s.visible - 1))),
        r: 0
      };
    };

    // Exit position for a card moving out of slot 0
    const getExitCoord = (s) => ({
      x: -s.width * 0.32,
      y: s.height * 0.45,
      z: 50,
      scale: 0.9,
      opacity: 0,
      shade: 0.7,
      r: -5
    });

    // Directly renders slots when controlled by scrollProgress
    const applyScrollProgress = (progress) => {
      if (!count || !stageRef.current) return;
      const s = settingsRef.current;
      const clampedP = clamp(progress, 0, 1);
      const totalSteps = Math.max(1, count - 1);
      const pTotal = clampedP * totalSteps;
      const curStep = Math.min(count - 2, Math.floor(pTotal));
      const frac = pTotal - curStep;

      // Active front index is curStep (or count - 1 if clamped at 1.0)
      const activeIdx = frac > 0.5 ? Math.min(count - 1, curStep + 1) : curStep;

      for (let i = 0; i < count; i++) {
        const el = slotRefs.current[i];
        const shade = shadeRefs.current[i];
        if (!el) continue;

        if (i < curStep) {
          // Cards that have already finished their exit
          const exit = getExitCoord(s);
          el.style.transform = `translate3d(${exit.x}px, ${exit.y}px, ${exit.z}px) rotate(${exit.r}deg) skewY(${s.skew}deg) scale(${exit.scale})`;
          el.style.opacity = '0';
          el.style.visibility = 'hidden';
          el.style.zIndex = '1';
          el.removeAttribute('data-front');
          if (shade) shade.style.opacity = '0.8';
        } else if (i === curStep) {
          // Card currently exiting from slot 0
          const s0 = getSlotCoord(0, s);
          const exit = getExitCoord(s);
          const x = s0.x + (exit.x - s0.x) * frac;
          const y = s0.y + (exit.y - s0.y) * frac;
          const z = s0.z + (exit.z - s0.z) * frac;
          const scale = s0.scale + (exit.scale - s0.scale) * frac;
          const opacity = Math.max(0, s0.opacity - frac * 1.15);
          const r = s0.r + (exit.r - s0.r) * frac;
          const shadeOp = s0.shade + (exit.shade - s0.shade) * frac;

          el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotate(${r.toFixed(2)}deg) skewY(${s.skew}deg) scale(${scale.toFixed(3)})`;
          el.style.opacity = opacity.toFixed(3);
          el.style.visibility = opacity <= 0.005 ? 'hidden' : 'visible';
          el.style.zIndex = frac < 0.4 ? '25' : '15';
          if (activeIdx === i) el.setAttribute('data-front', '');
          else el.removeAttribute('data-front');
          if (shade) shade.style.opacity = shadeOp.toFixed(3);
        } else {
          // Cards advancing forward in the stack
          // Their current slot is (i - curStep) -> moves towards (i - curStep - 1)
          const fromSlot = i - curStep;
          const toSlot = fromSlot - 1;
          const fromCoord = getSlotCoord(fromSlot, s);
          const toCoord = getSlotCoord(toSlot, s);

          const x = fromCoord.x + (toCoord.x - fromCoord.x) * frac;
          const y = fromCoord.y + (toCoord.y - fromCoord.y) * frac;
          const z = fromCoord.z + (toCoord.z - fromCoord.z) * frac;
          const scale = fromCoord.scale + (toCoord.scale - fromCoord.scale) * frac;
          const opacity = fromCoord.opacity + (toCoord.opacity - fromCoord.opacity) * frac;
          const shadeOp = fromCoord.shade + (toCoord.shade - fromCoord.shade) * frac;

          el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotate(0deg) skewY(${s.skew}deg) scale(${scale.toFixed(3)})`;
          el.style.opacity = opacity.toFixed(3);
          el.style.visibility = opacity <= 0.005 ? 'hidden' : 'visible';
          el.style.zIndex = String(20 - toSlot * 2);
          if (activeIdx === i) el.setAttribute('data-front', '');
          else el.removeAttribute('data-front');
          if (shade) shade.style.opacity = shadeOp.toFixed(3);
        }
      }

      s.onChange?.(activeIdx);
    };

    useImperativeHandle(
      ref,
      () => ({
        next: () => apiRef.current?.next(),
        prev: () => apiRef.current?.prev(),
        setProgress: (p) => applyScrollProgress(p)
      }),
      []
    );

    useIsomorphicLayoutEffect(() => {
      if (scrollControlled && typeof scrollProgress === 'number') {
        applyScrollProgress(scrollProgress);
      }
    }, [scrollProgress, scrollControlled]);

    useIsomorphicLayoutEffect(() => {
      const root = rootRef.current;
      const stage = stageRef.current;
      if (!root || !stage || !count) return undefined;
      const s0 = settingsRef.current;

      const fit = () => {
        const s = settingsRef.current;
        const w = root.clientWidth;
        const h = root.clientHeight;
        const scale = Math.min(1, w / s.bounds.width, h > 0 ? h / s.bounds.height : 1);
        stage.style.transform = `translate(-50%, -50%) scale(${scale > 0 ? scale.toFixed(4) : 1})`;
      };

      fit();
      const ox = s0.bounds.originX;
      const oy = s0.bounds.originY;
      stage.style.perspectiveOrigin = `${ox.toFixed(2)}px ${oy.toFixed(2)}px`;

      if (scrollControlled) {
        applyScrollProgress(typeof scrollProgress === 'number' ? scrollProgress : 0);
        const resizeObserver = new ResizeObserver(fit);
        resizeObserver.observe(root);
        return () => resizeObserver.disconnect();
      }

      // Default React Bits internal physics engine (when not scroll-driven)
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      const deck = Array.from({ length: count }, (_, index) => ({
        el: slotRefs.current[index],
        shade: shadeRefs.current[index],
        index,
        pos: index,
        from: index,
        hold: 0,
        nudge: 0,
        phase: 'rest',
        dir: { x: 0, y: 1 },
        tilt: 0,
        top: 0,
        under: false,
        x: 0,
        y: 0,
        z: 0,
        r: 0,
        p: 0,
        v: { x: 0, y: 0, z: 0, r: 0, p: 0 }
      }));

      const state = {
        order: deck.map(card => card.index),
        raf: 0,
        last: 0,
        timer: 0,
        queue: [],
        layers: 0,
        scale: 1,
        hovered: false,
        overCard: false,
        inView: true,
        drag: null,
        spread: 0,
        spreadV: 0,
        px: 0,
        py: 0,
        pvx: 0,
        pvy: 0,
        tx: 0,
        ty: 0,
        dragged: false,
        autoplay: s0.autoplay,
        delay: s0.delay
      };

      const slot = (position, s) => {
        const q = Math.min(position, s.visible);
        const spread = 1 + state.spread;
        return { x: q * s.dx * spread, y: -q * s.dy * spread, z: -q * s.dz, r: 0, p: q };
      };

      const clearance = (s, dir) => Math.abs(dir.x) * s.width + Math.abs(dir.y) * s.height + 12;

      const targetOf = (card, s, time) => {
        if (card.phase === 'exit') {
          const base = slot(0, s);
          const reach = clearance(s, card.dir) * 1.3;
          return { x: base.x + card.dir.x * reach, y: base.y + card.dir.y * reach, z: base.z, r: card.tilt, p: 0 };
        }
        if (card.phase === 'enter') {
          const base = slot(0, s);
          return { x: base.x, y: base.y + clearance(s, DOWN) * 1.3, z: base.z, r: 0, p: card.p };
        }
        const position = (time < card.hold ? card.from : card.pos) + card.nudge;
        return slot(Math.max(0, position), s);
      };

      const layerOf = card => {
        if (card.top) return 1000 + card.top;
        if (card.under) return 1;
        return 10 + (count - card.pos) * 2;
      };

      const write = (card, s) => {
        const { el, shade } = card;
        if (!el) return;
        el.style.transform = `translate3d(${card.x.toFixed(2)}px, ${card.y.toFixed(2)}px, ${card.z.toFixed(2)}px) rotate(${card.r.toFixed(3)}deg) skewY(${s.skew}deg)`;
        el.style.zIndex = String(layerOf(card));
        const fade = clamp(s.visible - card.p, 0, 1);
        el.style.opacity = fade < 1 ? fade.toFixed(3) : '';
        el.style.visibility = fade <= 0.001 ? 'hidden' : '';
        if (shade) {
          const depthT = clamp(card.p / Math.max(1, s.visible - 1), 0, 1);
          shade.style.opacity = (s.dim * 0.62 * depthT).toFixed(3);
        }
        if (card.pos === 0) el.setAttribute('data-front', '');
        else el.removeAttribute('data-front');
      };

      const integrate = (card, target, omega, zeta, dt) => {
        const k = omega * omega;
        const d = 2 * zeta * omega;
        const steps = Math.max(1, Math.ceil(dt / STEP));
        const h = dt / steps;
        for (let i = 0; i < steps; i++) {
          for (const axis of AXES) {
            const velocity = card.v[axis] + (k * (target[axis] - card[axis]) - d * card.v[axis]) * h;
            card.v[axis] = velocity;
            card[axis] += velocity * h;
          }
        }
      };

      const frame = time => {
        state.raf = 0;
        const s = settingsRef.current;
        const dt = state.last ? Math.min(0.05, (time - state.last) / 1000) : 1 / 60;
        state.last = time;
        const speed = s.speed;
        const restOmega = TAU * 1.7 * speed;
        const restZeta = reduce ? 1 : 1 - 0.72 * s.bounce;
        const exitOmega = TAU * 1.9 * speed;
        let busy = false;

        for (const card of deck) {
          const target = targetOf(card, s, time);
          const moving = card.phase === 'exit' || card.phase === 'enter';
          integrate(card, target, moving ? exitOmega : restOmega, moving ? 1 : restZeta, dt);
          if (card.phase === 'exit') {
            const base = slot(0, s);
            const travelled = (card.x - base.x) * card.dir.x + (card.y - base.y) * card.dir.y;
            if (travelled >= clearance(s, card.dir)) {
              card.phase = 'rest';
              card.top = 0;
              card.hold = 0;
            }
          } else if (card.phase === 'enter') {
            const base = slot(0, s);
            if (card.y - base.y >= clearance(s, DOWN)) {
              card.phase = 'rest';
              card.under = false;
              card.hold = 0;
            }
          }
          if (card.hold > time || card.phase !== 'rest') busy = true;
          for (const axis of AXES) {
            const limit = axis === 'p' ? 0.001 : 0.02;
            if (Math.abs(target[axis] - card[axis]) > limit || Math.abs(card.v[axis]) > limit) busy = true;
          }
          write(card, s);
        }

        if (busy) {
          state.raf = requestAnimationFrame(frame);
        } else {
          state.last = 0;
          for (const card of deck) {
            if (card.top && card.phase === 'rest') card.top = 0;
          }
        }
      };

      deck.forEach(card => {
        Object.assign(card, slot(card.pos, s0));
        write(card, s0);
      });

      const resizeObserver = new ResizeObserver(fit);
      resizeObserver.observe(root);

      return () => {
        cancelAnimationFrame(state.raf);
        resizeObserver.disconnect();
      };
    }, [count, scrollControlled]);

    const rootStyle = {
      ...(THEMES[theme] ?? THEMES.dark),
      '--swap-w': `${cardWidth}px`,
      '--swap-h': `${cardHeight}px`,
      '--swap-ox': `${bounds.originX}px`,
      '--swap-oy': `${bounds.originY}px`,
      '--swap-stage-w': `${bounds.width}px`,
      '--swap-stage-h': `${bounds.height}px`,
      '--swap-ratio': `${bounds.width} / ${bounds.height}`,
      '--swap-radius': `${Math.max(0, cardRadius)}px`
    };

    return (
      <div
        ref={rootRef}
        className={`card-swap${className ? ` ${className}` : ''}`}
        style={rootStyle}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Customized Training Cards"
      >
        <div className="card-swap-sizer" aria-hidden="true">
          <span />
        </div>
        <div ref={stageRef} className="card-swap-stage">
          {cards.map((card, index) => (
            <div
              key={index}
              ref={node => {
                slotRefs.current[index] = node;
              }}
              className="card-swap-slot"
              data-swap-index={index}
            >
              {card}
              <span
                ref={node => {
                  shadeRefs.current[index] = node;
                }}
                className="card-swap-shade"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
);
CardSwap.displayName = 'CardSwap';
export { CardSwap };
export default CardSwap;
