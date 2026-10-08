import { createRoot } from 'react-dom/client';
import Galaxy from './galaxy/Galaxy.jsx';

/**
 * Site-wide background: the React Bits <Galaxy /> mounted once as a fixed layer at the very bottom
 * of the stacking order (below the existing backgrounds, animations and content).
 * The layer is `pointer-events: none`, so window-level mouse movement is forwarded to it to keep
 * the component's mouse interaction / repulsion working without blocking any clicks.
 */
if (!document.getElementById('galaxy-bg')) {
    const host = document.createElement('div');
    host.id = 'galaxy-bg';
    host.setAttribute('aria-hidden', 'true');
    document.body.prepend(host);

    createRoot(host).render(
        <Galaxy
            mouseRepulsion={true}
            mouseInteraction={true}
            density={0.8}
            glowIntensity={0.15}
            saturation={0}
            hueShift={0}
            twinkleIntensity={0.1}
            starSpeed={0.2}
            speed={0.4}
            rotationSpeed={0.03}
        />
    );

    const layer = () => host.querySelector('.galaxy-container');
    window.addEventListener('mousemove', (e) => {
        layer()?.dispatchEvent(new MouseEvent('mousemove', { clientX: e.clientX, clientY: e.clientY }));
    }, { passive: true });
    document.addEventListener('mouseleave', () => layer()?.dispatchEvent(new MouseEvent('mouseleave')));
}
