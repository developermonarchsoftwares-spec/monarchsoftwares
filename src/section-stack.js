import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * SectionStack Engine
 * Stacks every section on the site like a 3D deck of cards as you scroll.
 * 
 * - Each section receives an increasing z-index so subsequent sections stack on top.
 * - Solid pitch-black canvas with luminous top border and deep drop-shadow.
 * - Sections with height <= window.innerHeight pin at "top top".
 * - Sections with height > window.innerHeight scroll through completely, then pin at "bottom bottom".
 * - While the next section slides up over the current section, the current section
 *   undergoes a subtle 3D scale-down (1 -> 0.95) and brightness reduction (1 -> 0.65)
 *   receding into the background.
 */
export function initSectionStack() {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) return;

    // Collect all direct sections in <main> plus the <footer>
    const sectionElements = gsap.utils.toArray('main > section, footer.footer-editorial');
    if (sectionElements.length < 2) return;

    // Apply baseline stacking styles
    sectionElements.forEach((sec, index) => {
        sec.style.position = 'relative';
        sec.style.zIndex = (index + 5).toString();
        sec.style.backgroundColor = '#000000';
        sec.style.willChange = 'transform, filter';

        // Add visual card separation for all sections following Hero
        if (index > 0) {
            sec.classList.add('stacked-card-section');
        }
    });

    // Create stacking ScrollTriggers for each section
    sectionElements.forEach((sec, index) => {
        if (index === sectionElements.length - 1) return; // Last element (footer) doesn't need to pin for another section
        const nextSec = sectionElements[index + 1];


        // Pin the current section while the next section slides up to cover it
        ScrollTrigger.create({
            trigger: sec,
            start: () => {
                const isTaller = sec.offsetHeight > window.innerHeight;
                return isTaller ? 'bottom bottom' : 'top top';
            },
            endTrigger: nextSec,
            end: 'top top',
            pin: true,
            pinSpacing: false,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                // When next section enters and slides over current section,
                // scale down and dim current section for authentic 3D card depth
                const p = self.progress;
                const scale = 1 - p * 0.05; // scales from 1.0 to 0.95
                const brightness = 1 - p * 0.35; // dims from 1.0 to 0.65
                const isTaller = sec.offsetHeight > window.innerHeight;
                const transformOrigin = isTaller ? 'center bottom' : 'center top';

                gsap.set(sec, {
                    scale: scale,
                    filter: `brightness(${brightness})`,
                    transformOrigin: transformOrigin
                });
            },
            onLeave: () => {
                // Reset when completely scrolled past
                gsap.set(sec, {
                    scale: 0.95,
                    filter: 'brightness(0.65)'
                });
            },
            onLeaveBack: () => {
                // Reset when scrolled back to normal
                gsap.set(sec, {
                    scale: 1,
                    filter: 'brightness(1)'
                });
            }
        });
    });

    // Handle viewport resize recalculations
    ScrollTrigger.addEventListener('refreshInit', () => {
        sectionElements.forEach((sec) => {
            sec.style.transform = 'none';
            sec.style.filter = 'none';
        });
    });
}
