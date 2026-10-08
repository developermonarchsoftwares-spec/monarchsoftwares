/**
 * Numerical Counter Animation Engine
 * Animates statistics smoothly using GSAP and ScrollTrigger when entering viewport.
 * Avoids repeat triggers on scroll; respects prefers-reduced-motion.
 */

export function initCounters(gsap, ScrollTrigger) {
    if (!gsap || !ScrollTrigger) return;

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Find all stat numbers
    const statElements = Array.from(document.querySelectorAll(
        '.stat-counter, [data-counter], .glow-card > div[style*="font-size: 2.5rem"][style*="margin-bottom: 0.5rem"]'
    ));

    statElements.forEach(el => {
        if (el.dataset.counterInitialized) return;
        el.dataset.counterInitialized = 'true';

        const originalText = el.textContent.trim();

        // Parse numerical part and suffix
        // Matches e.g. "50+", "500+", "10M+", "92%", "3.2x", "60%", "340%", "14 days", "25+"
        const match = originalText.match(/^([0-9.]+)\s*(.*)$/);
        if (!match) return;

        const targetValue = parseFloat(match[1]);
        const suffix = match[2] ? (match[2].startsWith(' ') ? match[2] : match[2]) : '';
        const hasDecimals = match[1].includes('.');
        const decimalPlaces = hasDecimals ? match[1].split('.')[1].length : 0;

        if (isNaN(targetValue)) return;

        if (isReduced) {
            el.textContent = originalText;
            return;
        }

        // Set initial state
        const state = { value: 0 };
        el.textContent = (0).toFixed(decimalPlaces) + suffix;

        ScrollTrigger.create({
            trigger: el,
            start: 'top 88%',
            once: true,
            onEnter: () => {
                gsap.to(state, {
                    value: targetValue,
                    duration: 1.6,
                    ease: 'power2.out',
                    onUpdate: () => {
                        const formatted = state.value.toFixed(decimalPlaces);
                        el.textContent = formatted + suffix;
                    },
                    onComplete: () => {
                        el.textContent = originalText;
                    }
                });
            }
        });
    });
}

