/**
 * PremiumCursor
 * Smooth dot + ring cursor. Touch devices and reduced-motion are skipped.
 */
export class PremiumCursor {
    constructor() {
        if (window.matchMedia('(pointer: coarse)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        this._mx = -200; this._my = -200;  // mouse position
        this._rx = -200; this._ry = -200;  // ring lerped position
        this._alive = false;
        this._raf = null;

        this._build();
        this._bind();
        this._tick();
    }

    _build() {
        document.documentElement.classList.add('has-cursor');
        this.dot  = this._el('cursor-dot');
        this.ring = this._el('cursor-ring');
        document.body.append(this.dot, this.ring);
    }

    _el(cls) {
        const d = document.createElement('div');
        d.className = cls;
        return d;
    }

    _bind() {
        window.addEventListener('mousemove', e => {
            this._mx = e.clientX;
            this._my = e.clientY;
            if (!this._alive) {
                this._rx = e.clientX;
                this._ry = e.clientY;
                this._alive = true;
                this.dot.style.opacity = this.ring.style.opacity = '1';
            }
        }, { passive: true });

        const sel = 'a, button, .btn, .glow-card, .float-btn, label, [role="button"]';
        document.addEventListener('mouseover', e => {
            if (e.target.closest(sel)) this.ring.classList.add('ring-hover');
        });
        document.addEventListener('mouseout', e => {
            if (e.target.closest(sel)) this.ring.classList.remove('ring-hover');
        });

        document.addEventListener('mousedown', () => this.ring.classList.add('ring-press'));
        document.addEventListener('mouseup',   () => this.ring.classList.remove('ring-press'));
        document.addEventListener('mouseleave', () => { this.dot.style.opacity = this.ring.style.opacity = '0'; });
        document.addEventListener('mouseenter', () => {
            if (this._alive) { this.dot.style.opacity = this.ring.style.opacity = '1'; }
        });
    }

    _tick() {
        // Dot: instant; Ring: lerp at 10% per frame (~60 fps)
        const lerp = (a, b, t) => a + (b - a) * t;

        const loop = () => {
            this._rx = lerp(this._rx, this._mx, 0.1);
            this._ry = lerp(this._ry, this._my, 0.1);

            this.dot.style.transform  = `translate(${this._mx}px,${this._my}px) translate(-50%,-50%)`;
            this.ring.style.transform = `translate(${this._rx}px,${this._ry}px) translate(-50%,-50%)`;

            this._raf = requestAnimationFrame(loop);
        };
        this._raf = requestAnimationFrame(loop);
    }

    destroy() {
        cancelAnimationFrame(this._raf);
        document.documentElement.classList.remove('has-cursor');
        this.dot?.remove();
        this.ring?.remove();
    }
}
