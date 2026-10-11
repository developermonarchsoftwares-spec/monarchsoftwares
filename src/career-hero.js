import './career-hero.css';

/**
 * Career Hero Section
 * Static layout initialized with full visibility and zero scroll triggers.
 */
export function initCareerHero() {
  const heroSection = document.getElementById('careers');
  if (!heroSection) return;

  const heroContainer = heroSection.querySelector('.career-hero-container');
  if (heroContainer) {
    heroContainer.style.opacity = '1';
    heroContainer.style.transform = 'none';
  }
}
