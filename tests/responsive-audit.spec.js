import { test, expect } from '@playwright/test';

const pagesToTest = [
  { path: '/', name: 'Single Page Site' },
  { path: '/privacy', name: 'Privacy Policy' },
  { path: '/terms', name: 'Terms of Service' },
];

// Old multi-page URLs are now sections of the homepage
const sections = ['about', 'services', 'corporate-training', 'it-services', 'digital-marketing', 'training-placement', 'careers', 'cta'];
const moved = {
  '/about': 'about', '/services': 'services', '/corporate-training': 'corporate-training', '/it-services': 'it-services',
  '/digital-marketing': 'digital-marketing', '/hr-services': 'training-placement', '/careers': 'careers', '/contact': 'cta',
};

test.describe('Full-Site Responsive & UI Integrity Audit', () => {
  for (const pageInfo of pagesToTest) {
    test(`Page [${pageInfo.name}] loads with zero overflow and zero severe console errors`, async ({ page }) => {
      const consoleErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(pageInfo.path, { waitUntil: 'domcontentloaded' });

      // Verify core landmarks
      await expect(page.locator('#header')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();

      // SEO basics: one H1, unique title, description, self-referencing canonical
      await expect(page.locator('h1')).toHaveCount(1);
      expect((await page.title()).length).toBeGreaterThan(10);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{50,}/);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toMatch(/^https:\/\/monarchsoftwares\.com\//);

      // Verify zero horizontal overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1;
      });
      expect(overflow, `Page ${pageInfo.name} must not have horizontal overflow`).toBeFalsy();

      // Filter known harmless resource/suspension errors
      const severeErrors = consoleErrors.filter(
        (err) =>
          !err.includes('favicon') &&
          !err.includes('status of 404') &&
          !err.includes('ERR_NETWORK_IO_SUSPENDED')
      );
      expect(severeErrors, `Page ${pageInfo.name} should have no severe console errors`).toEqual([]);
    });
  }

  test('Landing page contact form elements exist and function', async ({ page }) => {
    await page.goto('/');

    const contactForm = page.locator('#contact-form');
    await expect(contactForm).toBeAttached();

    const nameInput = page.locator('#contact-name');
    await expect(nameInput).toBeAttached();

    const emailInput = page.locator('#contact-email');
    await expect(emailInput).toBeAttached();
  });

  test('Homepage contains every merged section exactly once', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    for (const id of sections) await expect(page.locator(`section#${id}`)).toHaveCount(1);
  });

  for (const [oldPath, id] of Object.entries(moved)) {
    test(`Old URL ${oldPath} redirects to /#${id}`, async ({ page }) => {
      await page.goto(oldPath, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(new RegExp(`/#${id}$`));
    });
  }

  test('Contact form validates required fields before sending', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#contact-form').evaluate((f) => f.requestSubmit());
    await expect(page.locator('#form-result')).toContainText('required fields');
    for (const id of ['#contact-name', '#contact-email', '#contact-company', '#contact-service', '#contact-message']) {
      await expect(page.locator(id)).toBeAttached();
    }
  });
});
