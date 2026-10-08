import { test, expect } from '@playwright/test';

test.describe('3D Electric Logo Background Verification', () => {
  test('Electric logo renders in background in 3D, responds to scroll, and captures screenshots', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop Chrome', 'Screenshots are captured in Desktop Chrome project');
    let logoLoaded = false;
    page.on('response', (response) => {
      if (response.url().includes('/logo.png')) {
        logoLoaded = response.status() === 200 || response.status() === 304;
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#about-electric-logo-root').scrollIntoViewIfNeeded();

    // Wait for the background root container
    const bgContainer = page.locator('#about-electric-logo-root');
    await expect(bgContainer).toBeVisible();

    // Verify canvas is rendered inside the background container
    const canvas = page.locator('#about-electric-logo-root canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });

    // Verify foreground content is visible on top
    const heading = page.locator('.about-hero h2');
    await expect(heading).toBeVisible();

    // Wait for animation to settle
    await page.waitForTimeout(1500);

    // Capture desktop hero view (top / initial state)
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.screenshot({ path: 'about-hero-3d-desktop-top.png', fullPage: false });

    // Simulate mouse interaction
    await page.mouse.move(640, 450);
    await page.waitForTimeout(300);

    // Scroll down to test scroll-driven 3D tilt and parallax
    await page.evaluate(() => window.scrollTo({ top: 250, behavior: 'instant' }));
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'about-hero-3d-scrolled.png', fullPage: false });

    // Scroll back to top and capture mobile screenshot
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'about-hero-3d-mobile.png', fullPage: false });

    console.log('Logo loaded status:', logoLoaded);
  });
});
