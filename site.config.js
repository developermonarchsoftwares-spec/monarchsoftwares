/**
 * Single source of truth for the public site URL (preferred host: www).
 * HTML pages, sitemap.xml, robots.txt and llms.txt use the %SITE_URL% placeholder;
 * the `site-url` plugin in vite.config.js replaces it at dev-serve and build time.
 * The apex host (monarchsoftwares.com) redirects to www at the hosting/DNS level.
 */
export const SITE_URL = 'https://www.monarchsoftwares.com';

/** Replace every %SITE_URL% placeholder in a string. */
export const withSiteUrl = (text) => text.replace(/%SITE_URL%/g, SITE_URL);
