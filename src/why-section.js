import './why-section.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initBorderGlow } from './border-glow.js';

/**
 * "Why Monarch Softwares?" — interaction layer (plain DOM + SVG + rAF, no extra libraries).
 *  - scroll reveal (heading, then cards staggered 150ms apart)
 *  - one glowing connector path through the four cards that adapts to the layout
 *    (horizontal wave on desktop, vertical flow on tablet / mobile) with a light travelling 01 -> 04
 *  - very subtle mouse parallax (orbs, path, moons, planet) and a glass-sheen that follows the cursor
 *  - everything pauses while the section is off-screen; reduced-motion shows the final state
 */
gsap.registerPlugin(ScrollTrigger);

export function initWhySection() {
    const section = document.getElementById('why');
    const track = document.getElementById('why-track');
    const svg = document.getElementById('why-path');
    const line = document.getElementById('why-line');
    const dot = document.getElementById('why-dot');
    const trail = document.getElementById('why-trail');
    if (!section || !track || !svg || !line) return;

    const cards = Array.from(track.querySelectorAll('.why-card'));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let visible = false;

    // ---- connector path --------------------------------------------------------
    let pathLen = 0;
    let lineFrac = 1; // how much of the connector is revealed (shared with the card reveal below)
    const buildPath = () => {
        const w = track.offsetWidth;
        const h = track.offsetHeight;
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        const horizontal = window.matchMedia('(min-width: 1100px)').matches;
        const box = (c) => ({ x: c.offsetLeft, y: c.offsetTop, w: c.offsetWidth, h: c.offsetHeight });
        const b = cards.map(box);
        let d = '';
        if (horizontal) {
            const mid = (r) => r.y + r.h * 0.55;
            let x = 0, y = mid(b[0]) + 70;
            d = `M ${x} ${y}`;
            b.forEach((r, i) => {
                const lx = r.x, rx = r.x + r.w, my = mid(r);
                const cx = (x + lx) / 2;
                d += ` C ${cx} ${y}, ${cx} ${my}, ${lx} ${my}`; // into the card's left edge
                d += ` L ${rx} ${my}`;                             // behind the glass
                x = rx; y = my;
            });
            d += ` C ${x + (w - x) / 2} ${y}, ${x + (w - x) / 2} ${y - 60}, ${w} ${y - 60}`;
        } else {
            const cxOf = (r) => r.x + r.w / 2;
            let x = cxOf(b[0]), y = 0;
            d = `M ${x} ${y}`;
            b.forEach((r) => {
                const tx = cxOf(r), ty = r.y, by = r.y + r.h;
                const my = (y + ty) / 2;
                d += ` C ${x} ${my}, ${tx} ${my}, ${tx} ${ty}`;
                d += ` L ${tx} ${by}`;
                x = tx; y = by;
            });
            d += ` L ${x} ${h}`;
        }
        line.setAttribute('d', d);
        pathLen = line.getTotalLength();
        line.style.strokeDasharray = `${pathLen}`;
        line.style.strokeDashoffset = String(pathLen * (1 - lineFrac));
        // gradient follows the path direction
        const grad = svg.querySelector('#why-grad');
        if (grad) {
            grad.setAttribute('gradientUnits', 'userSpaceOnUse');
            grad.setAttribute('x1', horizontal ? '0' : '0'); grad.setAttribute('y1', horizontal ? '0' : '0');
            grad.setAttribute('x2', horizontal ? String(w) : '0'); grad.setAttribute('y2', horizontal ? '0' : String(h));
        }
    };

    // ---- travelling light --------------------------------------------------------
    const isSmall = () => window.innerWidth < 640;
    let t0 = 0;
    const moveDot = (now) => {
        if (!pathLen) return;
        if (lineFrac < 0.005) { dot.style.opacity = 0; trail.style.opacity = 0; return; }
        const dur = isSmall() ? 12000 : 10000;
        const p = (((now - t0) % dur) / dur) * lineFrac; // the light only travels along the part that is revealed
        const pt = line.getPointAtLength(p * pathLen);
        const tp = line.getPointAtLength(Math.max(0, p - 0.012) * pathLen);
        dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
        trail.setAttribute('cx', tp.x); trail.setAttribute('cy', tp.y);
        const fade = p < 0.04 ? p / 0.04 : p > 0.96 ? (1 - p) / 0.04 : 1; // ease in / out at the ends
        dot.style.opacity = fade; trail.style.opacity = fade;
    };

    // ---- parallax + loop -------------------------------------------------------------
    let tx = 0, ty = 0, cx = 0, cy = 0;
    section.querySelectorAll('[data-depth]').forEach((el) => el.style.setProperty('--d', el.dataset.depth));
    section.querySelectorAll('.why-orb').forEach((el) => el.style.setProperty('--d', '12'));
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (finePointer && !reduce) {
        section.addEventListener('pointermove', (e) => {
            const r = section.getBoundingClientRect();
            tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
            ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        }, { passive: true });
        section.addEventListener('pointerleave', () => { tx = 0; ty = 0; });
    }
    cards.forEach((card) => {
        const glass = card.querySelector('.why-card__glass');
        initBorderGlow(glass); // same card surface as the service-pillar cards (#120F17 + BorderGlow edge)
        glass.addEventListener('pointermove', (e) => {
            const r = glass.getBoundingClientRect();
            glass.style.setProperty('--sx', `${((e.clientX - r.left) / r.width) * 100}%`);
            glass.style.setProperty('--sy', `${((e.clientY - r.top) / r.height) * 100}%`);
        }, { passive: true });
    });

    let raf = 0;
    const loop = (now) => {
        if (!visible) { raf = 0; return; }
        cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
        section.style.setProperty('--mx', cx.toFixed(4));
        section.style.setProperty('--my', cy.toFixed(4));
        if (!reduce) moveDot(now);
        raf = requestAnimationFrame(loop);
    };

    // ---- scroll-driven card reveal: 01, 02, 03, 04 are each powered up in turn by scroll progress ----
    // Cards never move; only opacity / scale / blur / brightness / glow change, and the whole thing is
    // scrubbed (reversible), not a timed fade.
    if (!reduce) {
        const dim = { opacity: 0, scale: 0.94, filter: 'blur(8px) brightness(0.5)', '--glow': 0.15 };
        const lit = { opacity: 1, scale: 1, filter: 'blur(0px) brightness(1)', '--glow': 1 };
        // ONE shared progress: the connector is drawn exactly as far as the cards are revealed
        // (mean reveal of the four cards), driven by the same scrubbed tweens, never by its own timer.
        const syncLine = () => {
            lineFrac = cards.reduce((sum, c) => sum + Number(gsap.getProperty(c, 'opacity')), 0) / cards.length;
            line.style.strokeDashoffset = String(pathLen * (1 - lineFrac));
        };
        const mm = gsap.matchMedia();
        mm.add('(min-width: 1100px)', () => {
            gsap.set(cards, dim);
            syncLine();
            const tl = gsap.timeline({
                defaults: { ease: 'power1.inOut' },
                onUpdate: syncLine,
                scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true }
            });
            cards.forEach((card, i) => tl.to(card, { ...lit, duration: 1 }, i));
            tl.set({}, {}, cards.length + 0.6); // hold the fully revealed state before the pin releases
            return () => { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); gsap.set(cards, { clearProps: 'opacity,scale,filter,transform,--glow' }); lineFrac = 1; line.style.strokeDashoffset = '0'; };
        });
        mm.add('(max-width: 1099px)', () => {
            const tls = cards.map((card) => {
                gsap.set(card, dim);
                return gsap.to(card, { ...lit, ease: 'none', onUpdate: syncLine, scrollTrigger: { trigger: card, start: 'top 90%', end: 'top 58%', scrub: 0.6 } });
            });
            syncLine();
            return () => { tls.forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); }); gsap.set(cards, { clearProps: 'opacity,scale,filter,transform,--glow' }); lineFrac = 1; line.style.strokeDashoffset = '0'; };
        });
    }

    // ---- visibility: reveal once, pause when off-screen ---------------------------------
    if (!reduce) section.classList.add('why-ready');
    const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
            visible = en.isIntersecting;
            section.classList.toggle('is-paused', !visible);
            if (visible) {
                section.classList.add('is-in');
                if (!t0) t0 = performance.now();
                if (!raf) raf = requestAnimationFrame(loop);
            }
        });
    }, { threshold: [0, 0.05] });
    io.observe(section);
    if (reduce) { section.classList.add('is-in'); dot.style.display = 'none'; trail.style.display = 'none'; }

    buildPath();
    let rt;
    const rebuild = () => { clearTimeout(rt); rt = setTimeout(buildPath, 120); };
    new ResizeObserver(rebuild).observe(track);
    window.addEventListener('load', buildPath);
}
