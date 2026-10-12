/**
 * Hover-To-Expand FAQ Interaction
 * - Desktop: Hover reveals hidden answer, mouse leave collapses. Clicks disabled.
 * - Mobile / Touch: Tap expands/collapses.
 * - Accessible keyboard navigation & semantic structure.
 */

export function initHoverFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    // Keep native details element open so browser user-agent display:none does not block smooth CSS Grid transition
    if (item.tagName.toLowerCase() === 'details') {
      item.setAttribute('open', '');
    }

    // Ensure answer wrapper structure exists for smooth grid-template-rows transition
    let answerWrapper = item.querySelector('.faq-answer');
    if (!answerWrapper) {
      const p = item.querySelector('p');
      if (p) {
        answerWrapper = document.createElement('div');
        answerWrapper.className = 'faq-answer';
        const inner = document.createElement('div');
        inner.className = 'faq-answer-inner';
        p.parentNode.insertBefore(answerWrapper, p);
        inner.appendChild(p);
        answerWrapper.appendChild(inner);
      }
    }

    const summary = item.querySelector('summary, .faq-summary');
    if (!summary) return;

    // Handle clicks: prevent click on desktop, toggle on mobile
    summary.addEventListener('click', (e) => {
      const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
      if (!isTouch) {
        // Desktop mouse: disable click toggle completely (hover is the only trigger)
        e.preventDefault();
        summary.blur();
        return;
      }

      // Mobile touch: tap toggles card
      e.preventDefault();
      const isExpanded = item.classList.contains('is-expanded');

      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove('is-expanded');
          const otherSummary = other.querySelector('summary, .faq-summary');
          if (otherSummary) otherSummary.setAttribute('aria-expanded', 'false');
        }
      });

      if (isExpanded) {
        item.classList.remove('is-expanded');
        summary.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-expanded');
        summary.setAttribute('aria-expanded', 'true');
      }
    });

    // Handle clicks anywhere on the item for desktop
    item.addEventListener('click', (e) => {
      const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
      if (!isTouch) {
        if (document.activeElement && item.contains(document.activeElement)) {
          document.activeElement.blur();
        }
      }
    });

    // Keyboard accessibility: Enter or Space toggles card
    summary.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isExpanded = item.classList.toggle('is-expanded');
        summary.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      }
    });

    // Ensure state cleans up if mouse leaves
    item.addEventListener('mouseleave', () => {
      item.classList.remove('is-expanded');
      summary.setAttribute('aria-expanded', 'false');
      if (document.activeElement && item.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    });
  });

  // Tapping outside on mobile collapses open FAQ
  document.addEventListener('pointerdown', (e) => {
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (isTouch && !e.target.closest('.faq-item')) {
      faqItems.forEach((other) => {
        other.classList.remove('is-expanded');
        const otherSummary = other.querySelector('summary, .faq-summary');
        if (otherSummary) otherSummary.setAttribute('aria-expanded', 'false');
      });
    }
  });
}
