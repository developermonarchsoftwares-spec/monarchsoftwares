/**
 * Slow white starfield behind the Careers area: from just below the "Why Monarch Softwares?" half-circle to the end
 * of "Our Hiring Process".
 *
 * The field is fixed to the SCREEN: the background stays put while the page content scrolls over it. Stars drift
 * down slowly, twinkle, fade in near the top of the screen and out near the bottom, then respawn at the top.
 * It only shows while that range of the page is on screen (the opaque Why section hides it above the half-circle's
 * exit). Pure white, no trails, no colour. Pauses when off screen or the tab is hidden; static with
 * prefers-reduced-motion.
 */
export function initSpaceStars() {
    const why = document.getElementById('why');
    const end = document.getElementById('hiring-process');
    if (!why || !end) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = document.createElement('canvas');
    canvas.id = 'space-stars';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');

    // Some sections paint their own opaque black background (the Open Positions 3D stage, the Careers hero), which
    // would hide the fixed layer behind them. The same field is drawn on a small overlay canvas inside each of
    // them: above their background, below their content.
    const overlays = ['.op-stage', '#careers'].map((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const c = document.createElement('canvas');
        c.className = 'space-stars-ov';
        c.setAttribute('aria-hidden', 'true');
        el.appendChild(c);
        return { el, c, x: c.getContext('2d'), w: 0, h: 0 };
    }).filter(Boolean);

    let W = 0, H = 0, dpr = 1;              // viewport size
    let top = 0, bottom = 0, span = 0;       // field range in document coordinates
    let stars = [];
    let builtW = 0;
    let on = false, raf = 0, last = 0;

    // small seeded RNG so the field is stable between resizes
    let seed = 20261016;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

    const measure = () => {
        const w = document.documentElement.clientWidth, h = window.innerHeight;
        const sy = window.scrollY;
        const nTop = Math.round(why.getBoundingClientRect().bottom + sy);       // right below the half-circle
        const nBottom = Math.round(end.getBoundingClientRect().bottom + sy);   // end of the hiring process
        const resized = w !== W || h !== H;
        W = w; H = h;
        top = nTop; bottom = nBottom; span = Math.max(1, bottom - top);
        if (!stars.length || resized) build();
        if (resized) {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
    };

    const build = () => {
        const count = Math.min(900, Math.max(60, Math.round((W * H) / (W < 760 ? 7500 : 9000))));
        stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: rnd() * W,
                y: rnd() * H,                                      // screen space: the field never scrolls with the page
                r: 0.55 + Math.pow(rnd(), 2.0) * 1.35,             // mostly tiny, a few larger
                a: 0.45 + rnd() * 0.55,                            // base brightness
                v: 5 + rnd() * 14,                                 // px / second, slow
                f: 0.35 + rnd() * 1.1,                             // twinkle rate (Hz)
                p: rnd() * Math.PI * 2                              // twinkle phase
            });
        }
    };

    const smooth = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };

    const drawOn = (c, offY, w, h, now, fade = 0) => {
        c.clearRect(0, 0, w, h);
        const t = now / 1000;
        c.fillStyle = '#ffffff';
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            const y = s.y - offY;                                   // same screen position on every surface
            if (y < -8 || y > h + 8) continue;
            // fade in near the top of the screen and out near the bottom
            const edge = smooth(s.y / (H * 0.1)) * smooth((H - s.y) / (H * 0.18));
            const tw = reduce ? 1 : 0.68 + 0.32 * Math.sin(t * s.f * 6.2832 + s.p);
            // stars never touch the edge of an overlay canvas: a star cut in half by the canvas edge (or a stale, stretched bitmap) shows up as a thin dashed line
            const soft = fade ? smooth(y / fade) * smooth((h - y) / fade) : 1;
            const al = s.a * edge * tw * soft;
            if (al < 0.01) continue;
            c.globalAlpha = al * 0.16;                              // soft glow
            c.beginPath(); c.arc(s.x, y, s.r * 3.2, 0, 6.2832); c.fill();
            c.globalAlpha = al;                                     // core
            c.beginPath(); c.arc(s.x, y, s.r, 0, 6.2832); c.fill();
        }
        c.globalAlpha = 1;
    };

    const draw = (now) => {
        drawOn(ctx, 0, W, H, now);
        for (const o of overlays) {
            const r = o.el.getBoundingClientRect();
            if (r.bottom <= 0 || r.top >= H) continue;
            const w = Math.round(r.width), h = Math.round(r.height);
            // a host that is momentarily collapsed (pin / layout changes) must not show a squashed copy of the field
            if (h < 200 || w < 300) { o.c.style.visibility = 'hidden'; continue; }
            o.c.style.visibility = '';
            if (w !== o.w || h !== o.h) {
                o.w = w; o.h = h; o.c.width = Math.round(w * dpr); o.c.height = Math.round(h * dpr); o.x.setTransform(dpr, 0, 0, dpr, 0, 0);
                o.c.style.width = w + 'px'; o.c.style.height = h + 'px';   // displayed size always equals the drawn size: never stretched
            }
            drawOn(o.x, r.top, w, h, now, 28);
        }
    };

    const step = (now) => {
        raf = requestAnimationFrame(step);
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
        last = now;
        if (!reduce) {
            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                s.y += s.v * dt;
                if (s.y > H) { s.y = -rnd() * 20; s.x = rnd() * W; }   // respawn at the top of the screen
            }
        }
        draw(now);
    };

    const setOn = (v) => {
        if (v === on) return;
        on = v;
        canvas.classList.toggle('is-on', v);
        document.body.classList.toggle('has-stars-bg', v);         // lets the black <html> show through behind the page
        if (v && !document.hidden) { last = 0; raf = requestAnimationFrame(step); }
        else { cancelAnimationFrame(raf); raf = 0; }
    };

    const check = () => {
        const sy = window.scrollY;
        setOn(sy + H > top && sy < bottom && !document.hidden);
        if (on && reduce) draw(performance.now());
    };

    let lastMeasure = 0;
    const onScroll = () => {
        const n = performance.now();
        if (n - lastMeasure > 800) { lastMeasure = n; measure(); }   // layout can shift (pins, lazy images)
        check();
    };

    measure(); check();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { measure(); check(); });
    window.addEventListener('load', () => { measure(); check(); });
    document.addEventListener('visibilitychange', check);
    if (window.ResizeObserver) new ResizeObserver(() => { measure(); check(); }).observe(document.body);
}
