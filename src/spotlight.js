/**
 * Specular Card Spotlight & 3D Tilt Physics (Linear / Raycast / Trion style)
 * Dynamically tracks cursor coordinates across card borders, providing luminous monochrome edge beams.
 */
import gsap from 'gsap';

export function initCardSpotlight(cardSelector = '.project-card, .tech-matrix-card, .service-preview-card, .stat-box, .test-mini-card, .about-image-card') {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return; // Desktop mouse only

    const cards = document.querySelectorAll(cardSelector);

    cards.forEach((card) => {
        // Prepare card for spotlight
        card.classList.add('spotlight-card');

        let isHovered = false;

        card.addEventListener('mouseenter', () => {
            isHovered = true;
        });

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            // Subtle 3D Perspective Tilt on larger showcase cards
            if (card.classList.contains('project-card') || card.classList.contains('tech-matrix-card')) {
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -4;
                const rotateY = ((x - centerX) / centerX) * 4;

                gsap.to(card, {
                    rotateX: rotateX,
                    rotateY: rotateY,
                    transformPerspective: 1200,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });

        card.addEventListener('mouseleave', () => {
            isHovered = false;
            if (card.classList.contains('project-card') || card.classList.contains('tech-matrix-card')) {
                gsap.to(card, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.6,
                    ease: 'elastic.out(1, 0.6)'
                });
            }
        });
    });
}
