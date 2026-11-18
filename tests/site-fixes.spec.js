import { test, expect } from '@playwright/test';
import { SITE_URL, withSiteUrl } from '../site.config.js';
import { screen } from '../api/contact.js';

const servicePages = ['/corporate-training', '/it-services', '/digital-marketing', '/training-placement'];

test.describe('Site URL helper (single preferred host)', () => {
  test('SITE_URL is the https www host with no trailing slash', () => {
    expect(SITE_URL).toBe('https://www.monarchsoftwares.com');
  });

  test('withSiteUrl replaces every placeholder and leaves other text alone', () => {
    expect(withSiteUrl('%SITE_URL%/a %SITE_URL%/b')).toBe(`${SITE_URL}/a ${SITE_URL}/b`);
    expect(withSiteUrl('no placeholder here')).toBe('no placeholder here');
    expect(withSiteUrl('')).toBe('');
  });

  for (const file of ['/sitemap.xml', '/robots.txt', '/llms.txt']) {
    test(`${file} is served with the www host and no leftover placeholder`, async ({ request }) => {
      const body = await (await request.get(file)).text();
      expect(body).not.toContain('%SITE_URL%');
      expect(body).not.toMatch(/https?:\/\/monarchsoftwares\.com/);
      expect(body).toContain(SITE_URL);
    });
  }
});

test.describe('Structured data', () => {
  for (const path of ['/', ...servicePages, '/privacy', '/terms']) {
    test(`${path}: JSON-LD parses, uses the www host and has no FAQPage`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(blocks.length).toBeGreaterThan(0);
      for (const block of blocks) {
        expect(() => JSON.parse(block)).not.toThrow();
        expect(block).not.toContain('FAQPage');
        expect(block).not.toMatch(/https?:\/\/monarchsoftwares\.com/);
      }
    });
  }
});

test.describe('404 page', () => {
  test('unknown URL returns 404 with the branded page', async ({ page }) => {
    const res = await page.goto('/nonexistent-page-xyz', { waitUntil: 'domcontentloaded' });
    expect(res.status()).toBe(404);
    await expect(page.locator('#header')).toBeVisible();
    await expect(page.locator('footer')).toBeAttached();
    await expect(page.locator('main a[href="/"]').first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText('NOT_FOUND');
  });
});

test.describe('Apply Now and contact form', () => {
  test('a role in the URL pre-selects the topic and pre-fills the message', async ({ page }) => {
    await page.goto('/?role=Technical%20Talent%20Recruiter#cta', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#contact-service')).toHaveValue('Other');
    await expect(page.locator('#contact-message')).toHaveValue('I would like to apply for the Technical Talent Recruiter role.');
  });

  test('no role in the URL leaves the form empty', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#contact-service')).toHaveValue('');
    await expect(page.locator('#contact-message')).toHaveValue('');
  });

  test('every Apply Now link carries a role and points at the contact section', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const hrefs = await page.locator('a:has-text("Apply Now")').evaluateAll((links) => links.map((a) => a.getAttribute('href')));
    expect(hrefs).toHaveLength(3);
    for (const href of hrefs) expect(href).toMatch(/^\/\?role=[^#]+#cta$/);
  });

  test('server screening: honeypot is rejected silently, a normal inquiry passes', () => {
    const now = Date.now();
    const inquiry = { name: 'Test Visitor', email: 'visitor@example.com', company: 'Example Co', service: 'Other', message: 'I would like to apply for the Technical Talent Recruiter role.', _ts: now - 10000 };
    expect(screen(inquiry, now).ok).toBe(true);
    expect(screen({ ...inquiry, hp_url: 'http://spam.example' }, now)).toMatchObject({ ok: false, silent: true });
    expect(screen({ ...inquiry, botcheck: 'on' }, now)).toMatchObject({ ok: false, silent: true });
    expect(screen({ ...inquiry, _ts: now - 500 }, now)).toMatchObject({ ok: false, status: 400 });
  });

  test('honeypot fields are hidden from assistive technology and keyboard', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const trap = page.locator('#contact-form input[name="hp_url"]');
    await expect(trap).toHaveAttribute('tabindex', '-1');
    await expect(trap).toHaveAttribute('autocomplete', 'off');
    await expect(trap).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('#contact-form input[name="botcheck"]')).toBeHidden();
  });
});

test.describe('Skip link and nav highlight', () => {
  test('skip link is the first focusable element and targets <main>', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop Chrome', 'Keyboard navigation is a desktop check');
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Tab');
    const skip = page.locator('.skip-link');
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    expect(await skip.getAttribute('href')).toBe('#main-content');
    expect(await page.locator('#main-content').evaluate((el) => el.tagName)).toBe('MAIN');
  });

  test('Contact is the active nav item at the bottom of the page', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop Chrome', 'The desktop nav bar is hidden on small screens');
    await page.goto('/', { waitUntil: 'load' });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(page.locator('.nav-links > li > a.active')).toHaveText(/contact/i);
  });
});
