/**
 * Floating Cursor Preview (Awwwards / Trion interactive discipline inspector)
 * Floating preview card with smooth spring lag tracking cursor on service item hovers.
 */
import gsap from 'gsap';

export function initFloatingPreview() {
    // Disabled: floating thumbnail preview on service hover removed per user request
    const floatCard = document.getElementById('floating-service-preview');
    if (floatCard) {
        floatCard.remove();
    }
}

