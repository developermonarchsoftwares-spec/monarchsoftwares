# Monarch Softwares - Checkpoint

Running record of what has been built and changed in this project. Update it at the end of each work session.
Last updated: 2026-10-27.

## 1. Project at a glance

- Vite multi-page site (vanilla JS modules, GSAP + ScrollTrigger, Lenis smooth scroll, Three.js, some React "islands").
- Pages: `index.html` (single-page home with every section), four service pages (`corporate-training`, `it-services`,
  `digital-marketing`, `training-placement`), `privacy`, `terms`.
- Old page URLs (about, careers, contact...) redirect to `/#section` (see `vercel.json`).
- Serverless endpoint: `api/contact.js` (Vercel function, see "Contact form").
- Typography: Inter (body / UI) and Sora (display headings), loaded by the `@import` at the top of `src/style.css`.
  Font variables: `--font-sans`, `--font-mono` (Inter) and `--font-headline` (Sora, falls back to Inter).
- Run: `npm run dev` (Vite, port 5173, or the next free port). Build: `npm run build`. Preview: `npm run preview` (port 4173).
  `vite preview` does NOT serve `/api/*`; to test the contact endpoint locally use a small Node server that calls `api/contact.js`.
- Crawler: `npm run crawl` (local preview, port 4173) and `npm run crawl:live` (production). Runner is `scripts/crawl.mjs`,
  always with `--no-cache`. The SiteOne Crawler binary lives in `tools/siteone-crawler/` (git-ignored; Windows x64, v2.5.1).

## 2. Git state

- Remotes: `poorani` (04Poorani/Monarchy), `monarch-spec` (developermonarchsoftwares-spec/monarchsoftwares),
  `origin`, `new-origin`.
- Latest commit, pushed to `monarch-spec/main`: `10d2ab0` "fix: mobile responsiveness for hiring process and open positions 3D
  sections" (authored by `04poorani`, not by the assistant; not reviewed on a real phone).
- Recent history on `monarch-spec/main` (newest first):
  `10d2ab0` hiring / Open Positions phone layout, `d8d2799` hamburger drawer on every page + phone overlap fixes,
  `81e2213` CAPTCHA + `/api/contact` + new images + footer watermark fit, `9699cef` Inter + Sora and one-line headings,
  `163548b` Enroll button external link, `6e1e536` asteroid stone, Core Principles stage loop, BorderGlow + card hover,
  `df17292` Core Principles sizing + earlier checkpoint, `9b9846d` scroll reveals, stars, footer redesign.
- **Uncommitted at the time of this update:** `src/style.css` (16px form fields on touch devices) and this file.
- Pushing to `monarch-spec` needs the owner account for that repo. This machine's saved GitHub login is `04Poorani`
  (no write access there). Working command:
  `git -c credential.useHttpPath=true -c credential.https://github.com/developermonarchsoftwares-spec/monarchsoftwares.git.username=developermonarchsoftwares-spec push monarch-spec main`
- Never commit: `.claude/`, `.agents/`, `scratch/`, `test-results/`, `tmp/`, `tools/`, screenshot PNGs in the repo root, and
  `src/assets/about-team-puzzle.png` (1 MB, no longer used).

## 3. What has been built (by area)

- **Single page & Clean URL routing (zero hashtag navigation)**: all former pages merged into `index.html`, nav anchors scroll to sections (Lenis). All section navigation uses clean, route-based URLs without any `#` in the search bar: Home (`/home`), Services (`/home/services`), Careers (`/home/careers`), About (`/home/about`), and Contact (`/home/contact`). Replaced all `#cta`, `#about`, `#careers`, `#services` across desktop nav, mobile drawer, hero CTAs, Apply Now buttons, and footers across all 7 pages. Direct requests and refreshes to `/home` and `/home/*` rewrite to `/index.html` via `vercel.json` (`/home/(.*)`) and `vite.config.js` (`normalized.startsWith('/home/')`) with HTTP 200. Direct access to any section route automatically scrolls to its corresponding section (`#services`, `#careers`, `#about`, `#cta`). Browser back/forward navigation (`popstate`) smoothly updates scroll position across routes. Any legacy hash URLs (`#cta`, `#careers`, `#about`, `#services`, `#home`) automatically convert to their clean route via `history.replaceState`.
- **Navbar active state**: driven by the section in view (Home / Services / Careers / About / Contact). `src/main.js` (`updateActiveNav`), recognizing clean routes for all navbar items.
  Desktop link row is vertically aligned (all five labels share one centre line, see the block at the end of `src/style.css`).
- **Hero** (`src/hero-canvas.js`): Earth globe in the right area (desktop position x = 125, tablet 78, phone centred and dimmed to 62%
  so the copy stays readable). First headline line "BUILD, HIRE, AND GROW" stays on one line from 1025px.
- **Challenge section** (second section): image is the domino illustration (`src/assets/growth-challenge-dominoes.webp`).
- **Why Monarch**: dark glass cards, purple half-circle. `src/why-section.css/js`. Title stays on one line from 900px. The cards'
  sheen layer inherits the card radius through the BorderGlow wrapper (fixed a square patch at the corners).
- **Careers hero** (`src/career-hero.js/css`): pinned, scroll-scrubbed reveal.
- **Open Positions** (`src/open-positions-3d.js/css`): one pinned 3D scene scrubbed by scroll. A stone falls, breaks, particles
  form the Monarch logo, rings draw, three planets, camera visits each job card, final overview.
  - The falling stone is an irregular asteroid (generator `genRock`, photo texture `public/rock-tex.webp` + normal map
    `public/rock-nrm.webp`, triplanar projected). The break fragments use the same generator in three grey tones.
  - Planets and rings are the original look (realistic planet textures, orbiting, ring variants and the comet were tried and reverted).
  - Phone layout / hiring phone layout: commit `10d2ab0` (authored by `04poorani`).
  - Camera matrices: a known weakness of the original code is that card placement projects planets with the previous frame's camera
    matrices, so after a jump the cards can occasionally stay in the wrong place. An attempted fix (`camera.updateMatrixWorld()` after
    `lookAt`) was reverted; check whether `10d2ab0` covers it before touching it again.
  - Footnote: only `contact@monarchsoftwares.com` is clickable via `mailto:`, with the surrounding sentence ("Send your portfolio or GitHub profile to ... &rarr;") remaining plain text.
- **Hiring process** (`src/hiring-process.jsx/css`): header clears the fixed navbar; big step titles stay on one line from 1025px.
- **Mission & Vision**, **Why Work With Us** (pinned, scrubbed).
- **Core Principles** (`src/principles-scroll.js/css`): scroll-driven "Product Stage", a port of the Framer Product Stage
  (ProductFocusCarousel) mechanics. Portrait cards (image on the top half, text below), centre card in focus (scale 1), neighbours at 0.75 /
  0.6375 with a 2px blur two steps out. Sequence: heading alone, then 01 -> 02 -> 03 -> 04 -> 01 (the loop), then the pin releases.
  Reduced motion shows the plain stacked cards. All four cards have their own new picture (`src/assets/principle-*.webp`: 01 colour puzzle table,
  02 four-people illustration, 03 puzzle light bulb, 04 handshake). The cylinder carousel and the book flip versions were tried and reverted.
  - Mobile responsiveness (`<=768px`): card positioning, sizing, spacing, and empty space corrected. Centered vertically on the mobile viewport (`top: 50% !important` with negative margin `calc(var(--ps-h, 440px) * -0.5) 0 0 calc(var(--ps-w, 320px) * -0.5)`) to eliminate high positioning caused by touch device `(pointer: coarse)` overrides, completely removing the excessive empty gap and preventing the image from getting cut off under the navbar. Sized proportionally (`clamp(270px, 82vw, 340px)` with `maxH` clearing the top nav and bottom navigation), clean 50/50 media/content split, centered heading entrance with safe horizontal padding (`clamp(1.85rem, 7.5vw, 2.4rem)`), and progress indicator (`01 / 04`, track line, 4 step nodes) positioned at `clamp(5.4rem, 10vh, 6.2rem)` with width `clamp(120px, 34vw, 170px)` to guarantee zero overlap with the WhatsApp floating button across all mobile viewport widths (320px–430px). Preserves all step sequencing, card focus/scale styling, and animations. Desktop and tablet layouts untouched.
- **About hero** (`src/about-hero-scroll.js`): pinned; the emblem dims while the copy rises in. Title "The Growth Company" stays on one line
  from 769px. The "Growth Company" text block uses `src/assets/about-growth-company.webp` (circle of chairs with one yellow chair).
- **Star background** (`src/space-stars.js`): slow white falling/twinkling stars, fixed to the screen, shown from the Why section's exit
  to the end of Our Hiring Process, with overlay canvases inside the Careers hero and the Open Positions stage. A hardening change
  (hide collapsed hosts, soften edges) is in the code; the thin line seen under the Careers hero was never reproduced, so it is
  unconfirmed whether it fixed anything.

### Service pages
- **4th section**: class `section-scroll-cards`, pinned scroll-scrubbed reveal in `src/service-cards-scroll.js`.
- Hero grows with its copy on phones (`src/service-hero.css`).
- IT Training & Placement: "Enroll in a Training Program" opens `https://www.monarchplacements.in/` in a new tab
  (`target="_blank" rel="noopener noreferrer"`); "Hire Trained Candidates" still goes to `/#cta`.

### Cards: BorderGlow and hover
- Every grid card is wrapped in place by the static BorderGlow script (`src/border-glow.js`, one config for all cards:
  edge sensitivity 14, glow `40 80 80`, background `#0e0918`, radius 37 (only a fallback, cards keep their own), glow radius 13,
  intensity 0.8, cone spread 45, animated, colours `#c084fc #f472b6 #38bdf8`). The React source in `components/ui/BorderGlow.*` is the exact
  registry file and is not imported by the site.
- Shared monochrome hover (end of `src/border-glow.css`): lift through `top` (GSAP owns `translate`), 1.2% scale, brighter edge, top shade,
  title to white, arrow nudge, image zoom. Excluded: contact form card, FAQ items, Why cards (own lift), Core Principles (no lift).
  Touch devices get no hover change; reduced motion removes movement.
- The wrapper `.border-glow-inner` passes its radius to children (`border-radius: inherit`).

### Contact form
- Client-side typing CAPTCHA removed: the form relies on standard client-side HTML5 validation, honeypot field `hp_url`, form fill timing check (`_ts`), plus backend bot screening and rate limiting in `api/contact.js`.
- Form card alignment (`#cta .climax-content`): desktop grid alignment set to `align-items: center` (from `start`), centering the form card vertically against the left content column so the main statement "READY TO GROW? LET'S TALK." and form heading "Send Us an Inquiry" share the same horizontal baseline (255px on 1440px desktop) and the card is balanced with equal top and bottom clearance.
- Submission goes through `api/contact.js` in production (`import.meta.env.DEV` posts straight to Web3Forms). The endpoint:
  POST + JSON only, Origin/Referer check, honeypot field `hp_url`, form-age check (`_ts`, min 3s), field validation and length limits,
  spam screening (HTML, more than 2 links, spam phrases, junk), rate limit per hashed IP of 3 inquiries / 10 min and 8 / day (only inquiries
  that pass screening count) plus 20 raw requests / 10 min. Then it forwards to Web3Forms.
  - Env vars (Vercel): `WEB3FORMS_ACCESS_KEY` (read server-side; falls back to the key in the form), `UPSTASH_REDIS_REST_URL` +
    `UPSTASH_REDIS_REST_TOKEN` (shared counters across instances; without them it is per-instance memory), `CONTACT_ALLOWED_HOSTS`,
    `RATE_LIMIT_SALT`.
  - TODO for real protection: the Web3Forms access key is still in `index.html`; set the env var, rotate the key, remove the hidden field.
    For stronger bot protection use Cloudflare Turnstile with a server-side token check (needs a Cloudflare account).
- Tested with a mocked Web3Forms: 5 enquiries from one browser -> first 3 accepted, 4th and 5th answered 429 with the retry message.

### Footer (all 7 pages)
- Columns: Brand + social icons | Company | Services | Get in Touch | Google Map card; three flat 1px lines; logo aligned with the navbar.
- Watermark: real text, one `<span>` per letter (`src/footer-warp.jsx`); dark by default, the hovered letter turns white. Per-pair extra
  spacing (FT, TW, ES). The font size is fitted by the measured rendered width, including the last letter's ink overhang, so the final
  "S" is no longer clipped (verified 320-1920px).
- Responsive: phones (two link columns, full-width contact + map), tablets, legal row clear of the WhatsApp button.

### Mobile navigation and responsiveness
- Every page has the same full-screen drawer (`#mobile-drawer`): Home, Services (expandable list of the four service pages, opens and marks
  the current page by itself), Careers, About, Contact, the "Book a Free Strategy Call" button and contact details. Header + menu button
  stay above it and turn into an X; Esc, link taps and resizing above 1024px close it; the drawer scrolls on short screens
  (landscape) and is `display: none` from 1025px. Before this, the menu button did nothing on the service and legal pages.
- Phone overlap fixes: hero globe dimmed, Core Principles progress dots lifted above the WhatsApp button, Hiring Process text clear of it.
- Touch devices (`hover: none` and `pointer: coarse`): contact form fields and the chatbot input are 16px so iPhones do not zoom on focus.
- Audits (headless Chromium with phone emulation): home, four service pages and privacy at 360, 375, 412, 430, 600, 820, 1180px, plus
  landscape phones and large tablets: no horizontal overflow anywhere.

### Site-wide
- **Legal modal** (`src/legal.js`, `src/legal-modal.css`): Privacy Policy / Terms of Service open in a popup.
- **Scrolling fixes**: Lenis stylesheet imported, valid Lenis options, `html.lenis` no native smooth-scroll.
- **Em dashes removed** from all source files (text uses a comma, colon, parentheses or period; comments use a hyphen).
- **Page title**: the home page tab reads "Monarch Softwares". Service and legal pages keep their descriptive titles.
- The browser's cross-document fade (`@view-transition { navigation: auto; }` in `src/style.css`) is on.
- Tried and reverted (not in the code): white curtain / column page transition, scroll shutter + horizontal section transitions,
  Apple Dock navigation animation, Redaction font, comet in place of the stone, dust tunnel, planet orbit / realistic planets.

### SEO / AEO / GEO / performance
- `public/robots.txt` (search + named AI crawlers, sitemap), `public/sitemap.xml` (7 URLs), `public/llms.txt`.
- Robots meta + Open Graph/Twitter + `WebPage` JSON-LD on Privacy and Terms; JSON-LD (Organization, WebSite, Service, FAQPage, Breadcrumb) on the rest.
- Performance: Three.js lazy-loaded, home images and globe textures as WebP, honeypot checkbox `aria-label`, `tel:` links.
- Crawl result (local build): remaining warnings come from the preview server (no security/cache/compression headers), canonical
  pointing at the production host, skipped heading levels, and no AVIF images.

## 4. Known limits and things to check by hand

- Verification was done in headless Chromium (software WebGL) and the built-in browser pane. No real GPU, iPhone, Android phone or tablet
  was used, so iOS Safari specifics (address bar, notch / safe areas, `100vh`) are untested.
- Bot protection on the contact form uses the honeypot field, fill timing, rate limiting and spam screening in `api/contact.js`; stronger automated protection can use Cloudflare Turnstile if needed.
- `api/contact.js` is untested on Vercel itself (tested with a local Node harness and a mocked Web3Forms).
- Open Positions on very narrow phones (320px): the job cards in the final overview are small.
- Several headings are forced onto one line on desktop; below 1025 / 900 / 769px (per heading) they wrap as before.
- React Bits Pro "Luminous Type" is NOT installed: no `REACTBITS_LICENSE_KEY` and no `components.json` / Tailwind.
- Live site crawl (`crawl:live`) showed an older deployment; nothing here is live until it is built on Vercel.
- `vercel.json` sets HSTS, X-Frame-Options, nosniff, Referrer-Policy and cache headers. No Content-Security-Policy or Permissions-Policy yet.
- Lint (`eslint`) cannot run: the project has no migrated ESLint config. The build is the only automated check.
- Sitemap and `llms.txt` list the home page as one URL (About, Careers, Contact are sections of it).

## 5. Uncommitted work at the time of this checkpoint

- `index.html`: Open Positions footnote updated so only `contact@monarchsoftwares.com` is clickable (`mailto:`) while the rest of the sentence remains plain text.
- `src/style.css`: Adjusted Contact Form vertical alignment (`#cta .climax-content`) to `align-items: center` for balanced desktop two-column alignment with the content.
- `index.html`, `src/main.js`, `src/style.css`: Removed CAPTCHA option and associated styling/logic from Contact Form.
- `src/principles-scroll.js`, `src/principles-scroll.css`: Mobile layout & vertical centering fixes for Core Principles carousel.
- `vercel.json`, `vite.config.js`, `src/main.js`, `index.html`, and service/legal pages: Removed hashtags (`#`) across pages and browser search bar. Implemented clean route-based navigation for all sections (`/home`, `/home/services`, `/home/careers`, `/home/about`, `/home/contact`), with server rewrites, automatic hash-to-route conversion, direct route navigation/refresh with section auto-scroll, popstate back/forward transitions, and clean link targets.
- `docs/CHECKPOINT.md`: this update.

## 6. How to continue

1. `git status` and `git diff --stat`, review, then commit in logical groups.
2. `npm run build`, `npm run preview`, `npm run crawl` (expect the preview-server warnings listed above).
3. Push to the target remote (see section 2), deploy, set the Vercel env vars for the contact endpoint, then run `npm run crawl:live`.
4. Update this file.
