import { createRoot } from 'react-dom/client';
import FloatingLines from './floating-lines/FloatingLines.jsx';

/**
 * React Bits <FloatingLines /> as the background of the Careers area only
 * (the #careers hero section only). One fixed, click-through layer sitting behind the page content: it never
 * intercepts scroll or clicks, the component itself listens for pointer events on window (bend + click swirl).
 * It is mounted while any part of the Careers hero is on screen and unmounted otherwise, so other sections
 * pay no cost and never show it.
 */
const first = document.getElementById('careers');
const last = first;

if (first && last) {
    const layer = document.createElement('div');
    layer.id = 'careers-floating-lines';
    layer.setAttribute('aria-hidden', 'true');
    document.body.prepend(layer);
    const root = createRoot(layer);
    let shown = false;

    const lines = (
        <FloatingLines
            linesGradient={['#eeebef', '#ffffff']}
            enabledWaves={['top', 'middle', 'bottom']}
            lineCount={10}
            lineDistance={6}
            bendStrength={-0.5}
            scrollSpeed={0.004}
            interactive
            clickSwirl
        />
    );

    const update = () => {
        const a = first.getBoundingClientRect();
        const b = last.getBoundingClientRect();
        const vh = window.innerHeight;
        const inRange = a.top < vh && b.bottom > 0;
        if (inRange === shown) return;
        shown = inRange;
        layer.classList.toggle('is-on', inRange);
        document.body.classList.toggle('has-careers-lines', inRange); // let the black <html> show through so the layer behind the content is visible
        root.render(inRange ? lines : null);
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
}
