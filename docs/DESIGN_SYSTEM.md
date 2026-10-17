# MONARCH SOFTWARES - DESIGN SYSTEM & INTELLIGENCE WORKFLOW

> **Standard:** Apple Pro / Framer / Trion-Grade Minimalist Monochrome  
> **Philosophy:** *Inspiration, Not Cloning.* Restrained elegance, intentional whitespace, mathematical scale, and purposeful interaction.

---

## 1. Design Intelligence Workflow

Every UI/UX feature or page creation must follow this 11-stage process before writing production code:

```
DESIGN RESEARCH
      ↓
UI REFERENCE COLLECTION (Inspo / Mobbin / Figma)
      ↓
DESIGN SYSTEM ANALYSIS (Tokens / Component Map)
      ↓
WIREFRAME & INFORMATION HIERARCHY
      ↓
VISUAL COMPOSITION & SPACING MODEL
      ↓
IMPLEMENTATION (Semantic Markup / Clean Architecture)
      ↓
BROWSER INSPECTION (DevTools / Console / DOM)
      ↓
RESPONSIVE TESTING (Desktop, Tablet, Mobile)
      ↓
AUTOMATED PLAYWRIGHT AUDIT (Tests, Layout Overflow, Errors)
      ↓
MICRO-INTERACTION POLISH (GSAP, Magnetic, Spotlight)
      ↓
FINAL REVIEW & VERIFICATION
```

### Pre-Coding Architecture Checklist
Before generating or modifying any UI:
1. **Information Hierarchy:** Define the primary action (1 per viewport) and secondary actions.
2. **User Goals:** What is the user trying to accomplish within 5 seconds of viewing?
3. **Content Hierarchy:** Display H1 → Section H2 → Sub-pillar H3 → Body Text → Meta Tag.
4. **Layout System:** Max container bounds, column structure, grid alignment.
5. **Spacing System:** Multiples of 4px/8px or fluid clamp values.
6. **Typography Scale:** Proportional fluid type scale using system sans-serif.
7. **Color Restraint:** Pure monochrome black (#000000) & white (#ffffff). Zero arbitrary tints.
8. **Responsive Strategy:** Fluid downscaling, mobile stacking, zero horizontal overflow.
9. **Component Architecture:** DRY, self-contained semantic blocks.
10. **Animation Purpose:** Every motion must guide attention or provide tactile physics feedback.

---

## 2. Design System Tokens & Specifications

### 2.1 Typography
Universal System Sans-Serif font stack:
```css
--font-sans: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

#### Hierarchy & Scale
| Role | Desktop Size | Mobile Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display H1** | `clamp(2.75rem, 6.5vw, 5.5rem)` | `2.5rem` | 800 | 0.98 | `-0.035em` |
| **Headline H2** | `clamp(1.75rem, 3.5vw, 2.75rem)` | `1.5rem` | 700 | 1.15 | `-0.025em` |
| **Title H3** | `1.3rem – 1.6rem` | `1.15rem` | 600 | 1.3 | `-0.015em` |
| **Pillar H4** | `1.05rem – 1.2rem` | `1.0rem` | 600 | 1.4 | `-0.01em` |
| **Body Regular** | `0.95rem – 1.05rem` | `0.9rem` | 400 | 1.65 | `0` |
| **Body Muted** | `0.85rem – 0.92rem` | `0.82rem` | 400 | 1.6 | `0` |
| **Mono / Tag** | `0.72rem – 0.78rem` | `0.7rem` | 600 | 1.0 | `0.12em` (Uppercase) |

---

### 2.2 Layout & Grid System
| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `--container-max` | `1200px` | Standard content layout boundary |
| `--container-wide` | `1400px` | Extended hero, showcases, mega-footer |
| `--gutter` | `clamp(1.25rem, 4vw, 3rem)` | Dynamic side padding preventing edge touching |
| `--section-space` | `clamp(6rem, 10vw, 10rem)` | Generous vertical negative space between sections |

#### Responsive Breakpoints
- **Desktop Standard:** `1200px+` (Full multi-column layouts)
- **Laptop / Small Desktop:** `992px – 1199px` (Adjusted column ratios)
- **Tablet:** `768px – 991px` (2-column grids, collapsed sticky preview stage)
- **Mobile Device:** `320px – 767px` (Single column stacking, full-width buttons, zero horizontal overflow)

---

### 2.3 Color Tokens (Strict Monochrome)
| Token | Hex Value | Application |
| :--- | :--- | :--- |
| `--bg-page` | `#000000` | Global canvas background (100% pitch black) |
| `--bg-card` | `#0c0c0c` | Elevated card surfaces, glass panels |
| `--bg-subtle` | `#121212` | Inputs, secondary hover states, badge fills |
| `--text-primary` | `#ffffff` | Primary headings, prominent copy, active links |
| `--text-secondary`| `#a1a1a6` | Body text, sub-descriptions, secondary navigation |
| `--text-tertiary` | `#666668` | Disclaimers, subtle hints, inactive counters |
| `--border` | `#222222` | Structural hairline borders (1px solid) |
| `--border-light` | `#181818` | Ultra-subtle nested dividers |
| `--accent` | `#ffffff` | Primary button fill, active indicators, highlights |
| `--accent-hover` | `#e5e5ea` | Hover state for solid white elements |

---

### 2.4 Component Architecture

#### Buttons
- **Primary Button (`.btn-primary`):** Solid `#ffffff` background, pitch black text (`#000000`), subtle border-radius (`4px` or `9999px` pill), physics-based magnetic attraction.
- **Outline Button (`.btn-outline`):** Transparent background, `1px solid #333333` border, white text, hover transitions to `#ffffff` background with `#000000` text.
- **Button Arrow (`.btn-arrow`):** Slides horizontally (`transform: translateX(4px)`) on hover.

#### Navigation
- Sticky/Fixed header with dynamic backdrop filter blur (`rgba(0, 0, 0, 0.85)`).
- Hairline bottom border appears on scroll (`lenis.scroll > 40`).
- Mobile hamburger toggle opens a zero-distraction fullscreen navigation drawer.

#### Cards & Surfaces
- Flat dark surface (`#0c0c0c`), razor-thin border (`#222222`).
- Integrated dynamic spotlight effect: tracks cursor `(--mouse-x, --mouse-y)` coordinates with a luminous specular highlight gradient.
- Optional 3D perspective tilt on hover for flagship case studies.

#### Forms & Inputs
- Dark inputs (`#0f0f10`), crisp light borders (`#222222`), accessible focus states (`#ffffff`).
- Inline feedback status indicators (`#form-result`) with distinct success and error typography.

---

### 2.5 Motion & Micro-Interactions

> **Rule:** Animation must be purposeful, tactile, and performant (60fps). Never add animation everywhere.

1. **Lenis Momentum Scrolling:** 60fps unified smooth scrolling engine synced to GSAP Ticker.
2. **Magnetic Physics:** Physics-based spring attraction on primary CTAs using GSAP `quickTo`.
3. **Specular Spotlight:** Coordinates-based radial gradient tracking on card surfaces.
4. **Masked Headline Reveals:** Lines split into parent masks and slide up cleanly on entrance.
5. **Scroll Progress:** 2px high-contrast hairline bar along viewport ceiling.
6. **Reduced Motion:** Mandatory `@media (prefers-reduced-motion: reduce)` override disabling all animations.

---

## 3. Premium UI Rules: What to Do & What to Avoid

### DO:
- Use strong visual hierarchy: one clear focal point per viewport.
- Respect intentional whitespace: give typography and components room to breathe.
- Keep typography crisp: high contrast, strict sans-serif hierarchy, restrained weights.
- Ensure accessible contrast: `#ffffff` and `#a1a1a6` against `#000000` far exceed WCAG AAA standards.
- Build mobile-first: every layout must gracefully fold down to 360px without horizontal scrollbars.
- Use realistic content: zero dummy lorem-ipsum placeholders; use real industry copy.

### AVOID:
- Generic AI dashboard templates and multicolored card decks.
- Excessive multi-color rainbow gradients and saturated button glows.
- Cluttered glassmorphism blur stacks that harm frame rates.
- Giant meaningless buzzwords without structured narrative backing.
- Arbitrary drop-shadows on dark backgrounds (use hairline borders and specular lighting instead).
- Copying external references 1:1 (*Inspiration, not cloning*).

---

## 4. Automated Design Review Loop (Playwright)

Before marking any UI task complete, run the automated suite:
```bash
npm test
```
The test suite verifies:
1. **Zero Uncaught Console Errors:** Verifies no JavaScript exceptions or broken runtime modules.
2. **Zero Horizontal Layout Overflow:** Asserts `document.documentElement.scrollWidth <= window.innerWidth`.
3. **Multi-Viewport Rendering:** Runs across Desktop (1440x900), Tablet (810x1080), and Mobile (390x844).
4. **Interactive Landmark Integrity:** Confirms navigation, form elements, and action targets are attached and accessible.
