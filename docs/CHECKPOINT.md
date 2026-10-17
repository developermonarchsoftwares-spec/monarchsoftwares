# Monarch Softwares - Checkpoint

Running record of what has been built and changed in this project. Update it at the end of each work session.
Last updated: 2026-10-17 (after comet revert).

## 1. Project at a glance

- Vite multi-page site (vanilla JS modules, GSAP + ScrollTrigger, Lenis smooth scroll, Three.js, some React "islands").
- Pages: `index.html` (single-page home with every section), four service pages (`corporate-training`, `it-services`,
  `digital-marketing`, `training-placement`), `privacy`, `terms`.
- Old page URLs (about, careers, contact...) redirect to `/#section` (see `vercel.json`).
- Run: `npm run dev` (Vite, port 5173, or the next free port). Build: `npm run build`. Preview: `npm run preview` (port 4173).
- Crawler: `npm run crawl` (local preview, port 4173) and `npm run crawl:live` (production). Runner is `scripts/crawl.mjs`,
  always with `--no-cache`. The SiteOne Crawler binary lives in `tools/siteone-crawler/` (git-ignored; Windows x64, v2.5.1).

## 2. Git state

- Remotes: `poorani` (04Poorani/Monarchy), `monarch-spec` (developermonarchsoftwares-spec/monarchsoftwares),
  `origin`, `new-origin`.
- Latest local commit: `9b9846d` (scroll reveals, star background, footer redesign, Core Principles sizing, checkpoint doc).
  Earlier pushed commit: `e5f8dbf`. Check `git log monarch-spec/main` for what is on the remote.
- **Everything below marked "uncommitted" is in the working tree but not committed or pushed yet.**
- Pushing to `monarch-spec` needs the owner account for that repo. This machine's saved GitHub login is `04Poorani`
  (no write access there). Working command:
  `git -c credential.useHttpPath=true -c credential.https://github.com/developermonarchsoftwares-spec/monarchsoftwares.git.username=developermonarchsoftwares-spec push monarch-spec main`
- Never commit: `.claude/`, `.agents/`, `scratch/`, `test-results/`, `tmp/`, `tools/`, screenshot PNGs in the repo root.

## 3. What has been built (by area)

### Home / careers sections
- **Single page**: all former pages merged into `index.html`, nav anchors scroll to sections (Lenis).
- **Navbar active state**: driven by the section in view (Home / Services / Careers / About / Contact); mobile menu order matches.
  Code: `src/main.js` (`updateActiveNav`).
- **Why Monarch**: dark "deep space" glass cards, purple half-circle (`.why-planet`, full width, low dome on desktop). `src/why-section.css/js`.
- **Careers hero** (`src/career-hero.js/css`): pinned, scroll-scrubbed reveal (label, heading word by word, description, CTA).
- **Culture section**, **Open Positions** (`src/open-positions-3d.js/css`): one pinned 3D scene scrubbed by scroll (rock falls, breaks,
  particles form the Monarch logo, rings draw, three planets, camera visits each job card, final overview). Three.js is lazy-loaded
  from `src/main.js` (CSS is imported statically so the track height exists before other pins measure).
- **Hiring process**, **Mission & Vision**, **Why Work With Us** (`src/why-work-scroll.js`, now pinned and scrubbed:
  label + heading, then three cards one by one).
- **Core Principles** (`src/principles-scroll.js/css`): pinned horizontal scroll of the principle cards (the 3D cylinder / liquid-paper
  version is NOT in the files at present; an earlier version was reverted). Card and grid sizes were reduced (uncommitted CSS change).
- **About hero** (`src/about-hero-scroll.js`): pinned; the emblem starts bright (soft white glow, opacity 0.85) and dims with
  scroll to a subtle background emblem while label, heading, description rise in. Heading is larger and white.
- **Star background** (`src/space-stars.js`): slow white falling/twinkling stars, fixed to the screen (background stays still while
  content scrolls), shown from the Why section's exit to the end of Our Hiring Process. Overlay canvases inside the Careers hero and
  the Open Positions stage (their own opaque black backgrounds would hide it). Static with reduced motion.

### Service pages
- **4th section** (Enterprise Solutions / Why Choose Monarch / Social Media & Branding / Benefits of Our Approach):
  class `section-scroll-cards`, pinned scroll-scrubbed reveal in `src/service-cards-scroll.js`.
- Hero: grows with its copy on phones (`src/service-hero.css`).

### Footer (all 7 pages)
- Columns: Brand + social icons (WhatsApp, Phone, Email, LinkedIn, Instagram) | Company | Services | Get in Touch
  (phone, email, location with icons) | Google Map card on the far right.
- Map: dark card, 3:2, embed points at "Kovilpalayam, Tamil Nadu" (zoom 12, shows the locality outline); clicking opens the place page.
  Shorter on tablet (16:4.5) and phone (16:8).
- Three flat 1px lines (top of footer, above and below the watermark), full width.
- Footer logo aligns with the navbar logo (both at x=40 on desktop).
- Watermark: real text, one `<span>` per letter (`src/footer-warp.jsx`); dark `#111114` by default, only the hovered letter turns
  `#FFFFFF` (250ms). The old WarpText canvas ripple was removed for the footer.
- Responsive: phones (two link columns, full-width contact + map), tablets (760-959px), legal row clear of the WhatsApp button.

### Site-wide
- **Legal modal** (`src/legal.js`, `src/legal-modal.css`): Privacy Policy / Terms of Service open in a popup on the current page
  (text fetched from `privacy.html` / `terms.html`). Esc, X, Close, overlay click; scroll lock via Lenis.
- **Scrolling fixes**: Lenis stylesheet imported, valid Lenis options, `html.lenis` no native smooth-scroll.
- **Em dashes removed** from all source files (text uses a comma, colon, parentheses or period; comments use a hyphen).
- **Responsive audit** (7 pages, 320-1920px): no horizontal overflow found.

### SEO / AEO / GEO / performance
- `public/robots.txt`: allows search and named AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, ...), points to the sitemap.
- `public/sitemap.xml`: all 7 URLs. `public/llms.txt`: plain-text overview for AI systems (facts taken from the site only).
- Robots meta + Open Graph/Twitter + `WebPage` JSON-LD on Privacy and Terms; JSON-LD (Organization, WebSite, Service, FAQPage, Breadcrumb) was already present.
- Performance: Three.js lazy-loaded (non-3D pages dropped about 1.5 MB), home images and globe textures converted to WebP
  (originals kept), hidden honeypot checkbox given an `aria-label`, phone numbers as `tel:` links.
- Crawl result (local build): the "missing form label" and "page over the weight budget" warnings are resolved. Remaining warnings come
  from the preview server (no security/cache/compression headers), canonical pointing at the production host, skipped heading levels,
  and no AVIF images.

## 4. Known limits and things to check by hand

- Verification was done in headless Chromium (software WebGL) and the built-in browser pane, at widths 320-1920px.
  No real GPU, touch device or phone was used.
- A thin white line seen once at the bottom edge of the Careers hero while scrolling could not be reproduced; cause unknown.
- React Bits Pro "Luminous Type" is NOT installed: no `REACTBITS_LICENSE_KEY` on this machine and no `components.json` / Tailwind.
- Live site crawl (`crawl:live`) showed an older deployment; nothing from this checkpoint is deployed until pushed and built on Vercel.
- `vercel.json` sets HSTS, X-Frame-Options, nosniff, Referrer-Policy and cache headers. No Content-Security-Policy or Permissions-Policy yet.
- Sitemap and `llms.txt` list the home page as one URL (About, Careers, Contact are sections of it).
- Dev server: port 5173 is occupied by another process on this machine, so the dev server runs on 5174.

## 5. Uncommitted work at the time of this checkpoint

- `src/principles-scroll.css`: smaller Core Principles cards and narrower grid.
- Comet experiment on the Open Positions scene (replacing the falling rock) was tried and fully reverted; the scene is the original
  rock version from the last commit. Scratch patch scripts remain in `scratch/` (git-ignored).
- Open question: restore the Core Principles cylinder carousel? (needs a decision)

## 6. How to continue

1. `git status` and `git diff --stat`, review, then commit in logical groups.
2. `npm run build`, `npm run preview`, `npm run crawl` (expect the preview-server warnings listed above).
3. Push to the target remote (see section 2), deploy, then run `npm run crawl:live`.
4. Update this file.
