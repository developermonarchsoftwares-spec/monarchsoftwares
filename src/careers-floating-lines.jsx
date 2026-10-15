import { createRoot } from 'react-dom/client';
import FloatingLines from './floating-lines/FloatingLines.jsx';

/**
 * React Bits <FloatingLines /> as the background of the Careers area (#careers).
 * Fixed click-through canvas sitting behind page content.
 * Pre-rendered with intro={false} so WebGL shaders compile immediately on startup.
 * Early trigger begins as soon as the user scrolls from "Why Monarch Softwares" toward Careers.
 */
const first = document.getElementById('careers');

if (first) {
    const layer = document.createElement('div');
    layer.id = 'careers-floating-lines';
    layer.setAttribute('aria-hidden', 'true');
    document.body.prepend(layer);
    const root = createRoot(layer);
    let shown = false;

    // Pre-mount immediately so WebGL context and shaders are warm and ready with zero latency
    root.render(
        <FloatingLines
            linesGradient={['#eeebef', '#ffffff']}
            enabledWaves={['top', 'middle', 'bottom']}
            lineCount={10}
            lineDistance={6}
            bendStrength={-0.5}
            scrollSpeed={0.004}
            interactive
            clickSwirl
            intro={false}
        />
    );

    const setVisibility = (inRange) => {
        if (inRange === shown) return;
        shown = inRange;
        layer.classList.toggle('is-on', inRange);
        document.body.classList.toggle('has-careers-lines', inRange);
    };

    let ticking = false;
    const update = () => {
        ticking = false;
        const target = first.closest('.pin-spacer') || first;
        const a = target.getBoundingClientRect();
        const vh = window.innerHeight;
        // Early trigger: starts immediately when scrolling from the previous section toward Careers
        const leadMargin = Math.min(vh * 0.4, 350);
        const inRange = a.top < (vh + leadMargin) && a.bottom > -leadMargin;
        setVisibility(inRange);
    };

    const requestUpdate = () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    };

    // IntersectionObserver with early rootMargin for immediate compositor-level detection
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    setVisibility(true);
                } else {
                    requestUpdate();
                }
            }
        }, {
            root: null,
            rootMargin: '350px 0px 250px 0px',
            threshold: 0
        });
        observer.observe(first);
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    update();
}

