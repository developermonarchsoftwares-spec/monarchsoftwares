/**
 * Monarch Softwares - Flagship Award-Winning Interactive Experience
 * (Inspired by trion.com, Awwwards Site of the Day, Framer & Apple Pro)
 * 
 * - 3D Interactive WebGL Topographical Wave Horizon (Three.js)
 * - Magnetic Physics on Action Buttons & Navigation Pills
 * - Specular Card Spotlight & 3D Tilt Dynamics (Linear / Raycast style)
 * - Floating Interactive Thumbnail Tooltip for Disciplines
 * - 3D Card-Stacking Scroll Showcase for Selected Case Studies
 * - Kinetic Split Masked Headline Typography
 * - Animated Metric Counters with Easing
 * - Lenis 60fps Momentum Scrolling + GSAP ScrollTrigger Integration
 * - Pure Monochrome Black (#000000) & White (#ffffff) Aesthetics
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import './style.css';
import { initSpaceStars } from './space-stars.js';
import './open-positions-3d.css'; // static: the Open Positions track height must exist before later ScrollTrigger pins measure the page
import { initLegalModals } from './legal.js';
import { initMagneticElements } from './magnetic.js';
import { initCardSpotlight } from './spotlight.js';
import { initFloatingPreview } from './floating-preview.js';
import { initCanvasText } from './canvas-text.js';
import { initSectionStack } from './section-stack.js';
import { initAllBorderGlow } from './border-glow.js';
import { initChallengeScroll } from './challenge-scroll.js';
import { initWhySection } from './why-section.js';
import { initPillarsScroll } from './pillars-scroll.js';
import { initMissionVisionScroll } from './mission-vision.js';
import { initPrinciplesScroll } from './principles-scroll.js';
import { initWhyWorkScroll } from './why-work-scroll.js';
import { initCareerHero } from './career-hero.js';
import { initAboutHeroScroll } from './about-hero-scroll.js';
import { initHiringProcessCarousel } from './hiring-process.jsx';
import { initCultureSection } from './culture-section.js';
import './service-hero.css';
import { initServiceHero } from './service-hero.jsx';
import { initCustomizedTrainingCardSwap, initAllServiceSecondSections } from './customized-training.jsx';
import { initHoverFAQ } from './faq.js';
import { initWebMobileCardSwap } from './web-mobile-cardswap.jsx';
import { initTrainerDeploymentScroll } from './trainer-deployment.js';
import { initServiceCardsScroll } from './service-cards-scroll.js';

gsap.registerPlugin(ScrollTrigger);

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scroll Progress Bar (Pure White)
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    const header = document.getElementById('header');

    // 2. Lenis 60fps Smooth Scrolling Engine
    const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 0.95,
        smoothWheel: true,   // Lenis 1.x option names (the old `smooth` / `smoothTouch` were ignored)
        syncTouch: false     // touch devices keep native scrolling
    });
    window.lenis = lenis;

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);


    const onScrollUpdate = () => {
        const limit = lenis.limit || (document.documentElement.scrollHeight - window.innerHeight);
        const pct = limit <= 0 ? 0 : Math.min(100, Math.max(0, (lenis.scroll / limit) * 100));
        progressBar.style.width = `${pct}%`;

        if (header) {
            if (lenis.scroll > 40) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    };

    lenis.on('scroll', () => {
        ScrollTrigger.update();
        onScrollUpdate();
        updateActiveNav();
    });
    onScrollUpdate();

    // 3. Smooth Anchor Link Scrolling (for hash links on the same page)
    const getTargetScrollTop = (element) => {
        if (!element || element.id === 'hero' || element.tagName === 'BODY') return 0;
        if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.create) {
            ScrollTrigger.sort();
            const st = ScrollTrigger.create({ trigger: element, start: 'top 80px' });
            const pos = st.start;
            st.kill();
            return pos + 80;
        }
        return element.getBoundingClientRect().top + lenis.scroll;
    };

    const updateDropdownActive = () => {
        const hash = window.location.hash;
        document.querySelectorAll('.dropdown-item').forEach((a) => {
            const href = a.getAttribute('href');
            if (hash && (href === hash || href === '/' + hash)) {
                a.setAttribute('aria-current', 'page');
            } else {
                a.removeAttribute('aria-current');
            }
        });
    };
    window.addEventListener('hashchange', updateDropdownActive);
    updateDropdownActive();

    const onHome = window.location.pathname === '/' || window.location.pathname === '/index.html';
    document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            let hash = this.getAttribute('href');
            if (hash && hash.startsWith('/#')) {
                if (!onHome) return; // other pages navigate normally
                hash = hash.slice(1);
            }
            if (!hash || hash === '#') return;

            const target = document.querySelector(hash);
            if (!target) return;

            e.preventDefault();
            if (history.pushState) {
                history.pushState(null, '', hash);
                updateDropdownActive();
            }
            if (this.blur) this.blur();

            const targetTop = getTargetScrollTop(target);
            lenis.scrollTo(Math.max(0, targetTop - 80), {
                duration: 1.1,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        });
    });

    // 4. Active Nav Link Indicator - one item active, driven by the section currently in view.
    //    Home covers everything above #services; "Why Monarch" belongs to Services; Careers runs until Contact.
    const homeLink = document.querySelector('.nav-links > li > a[href="/"]');
    const navAnchors = Array.from(document.querySelectorAll('.nav-links > li > a[href^="#"]'));
    const navSections = [
        { link: homeLink, el: document.getElementById('hero') },
        ...navAnchors.map((a) => ({ link: a, el: document.querySelector(a.getAttribute('href')) })),
        { link: navAnchors.find((a) => a.getAttribute('href') === '#services'), el: document.getElementById('why') }
    ].filter((x) => x.link && x.el);
    const updateActiveNav = () => {
        if (!navSections.length) return;
        const scrollPosition = window.scrollY + 140;
        let current = homeLink, best = -Infinity;
        navSections.forEach(({ link, el }) => {
            const top = el.getBoundingClientRect().top + window.scrollY;
            if (scrollPosition >= top && top > best) { best = top; current = link; }
        });
        [homeLink, ...navAnchors].forEach((a) => {
            if (!a) return;
            a.classList.toggle('active', a === current);
            if (a === current) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
        });
    };
    updateActiveNav();
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    window.addEventListener('resize', updateActiveNav);

    // 5. Initialize 3D WebGL Digital Horizon in Hero
    // Three.js (~1.4 MB) is only needed by the home page's globe and Open Positions scene: load it on demand so
    // every other page (and the first HTML payload) stays light. Both modules are no-ops without their markup.
    if (document.getElementById('hero-canvas-container')) import('./hero-canvas.js').then((m) => m.initHeroCanvas('hero-canvas-container'));

    // 7. Initialize Magnetic Action Elements (buttons use isolated CSS transitions)
    initMagneticElements('.float-btn, .nav-links > li > a, .service-item');

    // 8. Initialize Specular Card Spotlights & 3D Tilt
    initCardSpotlight('.project-card, .tech-matrix-card, .service-preview-card, .stat-box, .test-mini-card, .about-image-card');

    // BorderGlow (official React Bits effect) on every bordered card / grid item
    initAllBorderGlow();

    // 9. Initialize Floating Thumbnail Preview on Services
    initFloatingPreview();

    // 9b. Initialize CanvasText Wave Effect
    initCanvasText('.canvas-text-mount');

    // 10. Interactive Disciplines / Services Stage Switcher
    const serviceItems = document.querySelectorAll('.service-item');
    const previewTag = document.getElementById('preview-tag');
    const previewTimeline = document.getElementById('preview-timeline');
    const previewHeadline = document.getElementById('preview-headline');
    const previewDesc = document.getElementById('preview-desc');
    const previewCaps = document.getElementById('preview-caps');
    const previewLink = document.getElementById('preview-link');

    if (serviceItems.length > 0 && previewHeadline) {
        serviceItems.forEach((item, index) => {
            const activateService = () => {
                serviceItems.forEach((si) => si.classList.remove('active'));
                item.classList.add('active');

                const title = item.getAttribute('data-title') || '';
                const desc = item.getAttribute('data-desc') || '';
                const caps = item.getAttribute('data-caps') || '';
                const timeline = item.getAttribute('data-timeline') || '';
                const href = item.getAttribute('data-href') || '';
                const idxStr = String(index + 1).padStart(2, '0');

                if (previewTag) previewTag.textContent = `SERVICE ${idxStr}`;
                if (previewLink && href) previewLink.setAttribute('href', href);
                if (previewTimeline) previewTimeline.textContent = timeline;

                if (!isReducedMotion) {
                    gsap.fromTo(
                        [previewHeadline, previewDesc, previewCaps],
                        { opacity: 0.2, y: 6 },
                        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.04 }
                    );
                }

                if (previewHeadline) previewHeadline.textContent = title;
                if (previewDesc) previewDesc.textContent = desc;

                if (previewCaps) {
                    previewCaps.innerHTML = '';
                    const capsArray = caps.split(',').map((c) => c.trim()).filter(Boolean);
                    capsArray.forEach((cap) => {
                        const pill = document.createElement('span');
                        pill.className = 'cap-pill';
                        pill.textContent = cap;
                        previewCaps.appendChild(pill);
                    });
                }
            };

            item.addEventListener('mouseenter', activateService);
            item.addEventListener('click', activateService);
        });
    }

    // 11. Kinetic Masked Typography Entrance
    if (!isReducedMotion) {
        const headlineTexts = document.querySelectorAll('.hero-headline-text');
        if (headlineTexts.length > 0) {
            gsap.fromTo(headlineTexts,
                { yPercent: 110, opacity: 0 },
                {
                    yPercent: 0,
                    opacity: 1,
                    duration: 1.1,
                    ease: 'power3.out',
                    stagger: 0.12,
                    delay: 0.2
                }
            );
        }
    }

    // 12. 3D Card Stack Pin Showcase for Selected Work (Framer / Trion style)
    const initCardStackShowcase = () => {
        if (isReducedMotion) return;
        const projectCards = gsap.utils.toArray('.project-card');
        if (projectCards.length < 2) return;

        projectCards.forEach((card, i) => {
            if (i === projectCards.length - 1) return; // Don't scale last card

            ScrollTrigger.create({
                trigger: card,
                start: 'top 12%',
                endTrigger: projectCards[i + 1],
                end: 'top 12%',
                pin: true,
                pinSpacing: false,
                scrub: true,
                onUpdate: (self) => {
                    const progress = self.progress;
                    const scale = 1 - progress * 0.08;
                    const opacity = 1 - progress * 0.45;
                    const blur = progress * 6;

                    gsap.set(card, {
                        scale: scale,
                        opacity: opacity,
                        filter: `blur(${blur}px)`,
                        transformOrigin: 'center top'
                    });
                }
            });
        });
    };
    initCardStackShowcase();

    // 12b. Global Section Stacking Engine (Every section stacks like cards)
    // initSectionStack(); // slide-over card stacking disabled so the Galaxy background can show through the sections
    initSpaceStars();
    initChallengeScroll();
    initPillarsScroll();
    initWhySection();
    initAboutHeroScroll();
    initCareerHero();
    if (document.getElementById('positions')) import('./open-positions-3d.js').then((m) => { m.initOpenPositions(); ScrollTrigger.refresh(); });
    initCultureSection();
    initHiringProcessCarousel();
    initMissionVisionScroll();
    initPrinciplesScroll();
    initWhyWorkScroll();
    initServiceHero();
    initAllServiceSecondSections();
    initTrainerDeploymentScroll();
    initServiceCardsScroll();
    initHoverFAQ();

    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    if (typeof lenis.resize === 'function') lenis.resize();

    // 12c. 3D Flip Down Scroll Animation for Selected Work & About Images
    const initWorkImageFlipDown = () => {
        if (isReducedMotion) return;
        const mediaWraps = document.querySelectorAll('.project-media-wrap, .about-image-card');
        if (!mediaWraps.length) return;

        mediaWraps.forEach((wrap) => {
            gsap.fromTo(wrap,
                {
                    rotateX: -45,
                    opacity: 0.25,
                    y: -30,
                    transformPerspective: 1200,
                    transformOrigin: 'center top'
                },
                {
                    rotateX: 0,
                    opacity: 1,
                    y: 0,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: wrap,
                        start: 'top 92%',
                        end: 'top 55%',
                        scrub: 0.8,
                        invalidateOnRefresh: true
                    }
                }
            );
        });
    };
    initWorkImageFlipDown();

    // 13. Animated Counter Tickers for Commitments / Numbers
    const initCounters = () => {
        const statBoxes = document.querySelectorAll('.stat-box');
        if (!statBoxes.length || isReducedMotion) return;

        statBoxes.forEach((box) => {
            const numEl = box.querySelector('.stat-giant-num');
            if (!numEl) return;
            const targetText = numEl.textContent.trim();
            const targetVal = parseInt(targetText, 10);
            if (isNaN(targetVal)) return;

            ScrollTrigger.create({
                trigger: box,
                start: 'top 85%',
                once: true,
                onEnter: () => {
                    const obj = { val: 0 };
                    gsap.to(obj, {
                        val: targetVal,
                        duration: 1.4,
                        ease: 'power2.out',
                        onUpdate: () => {
                            numEl.textContent = String(Math.floor(obj.val)).padStart(2, '0');
                        }
                    });
                }
            });
        });
    };
    initCounters();

    // 14. Mobile Navigation Drawer & Subpage Menu
    const mobileToggle = document.getElementById('mobile-toggle') || document.querySelector('.mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            if (mobileDrawer) {
                const willOpen = !mobileDrawer.classList.contains('active');
                mobileDrawer.classList.toggle('active', willOpen);
                mobileDrawer.setAttribute('aria-hidden', String(!willOpen));
                document.body.style.overflow = willOpen ? 'hidden' : '';
            } else if (navLinks) {
                const willOpen = !navLinks.classList.contains('mobile-active');
                navLinks.classList.toggle('mobile-active', willOpen);
                document.body.style.overflow = willOpen ? 'hidden' : '';
            }
        });

        if (mobileDrawer) {
            mobileDrawer.querySelectorAll('a').forEach((link) => {
                link.addEventListener('click', () => {
                    mobileDrawer.classList.remove('active');
                    mobileDrawer.setAttribute('aria-hidden', 'true');
                    document.body.style.overflow = '';
                });
            });
        }

        if (navLinks) {
            navLinks.querySelectorAll('a').forEach((link) => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('mobile-active');
                    document.body.style.overflow = '';
                });
            });
        }
    }

    // 15. Restrained ScrollTrigger Section Reveals
    if (!isReducedMotion) {
        document.querySelectorAll('.reveal').forEach((el) => {
            gsap.fromTo(el,
                { y: 20, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 90%',
                        once: true,
                        invalidateOnRefresh: true
                    },
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power2.out',
                    clearProps: 'transform,opacity'
                }
            );
        });
    }

    // 16. Dynamic Section Header Lines
    document.querySelectorAll('.section-editorial-header').forEach((hdr) => {
        if (!hdr.querySelector('.header-line-bar')) {
            const bar = document.createElement('div');
            bar.className = 'header-line-bar';
            hdr.appendChild(bar);
        }

        ScrollTrigger.create({
            trigger: hdr,
            start: 'top 88%',
            once: true,
            onEnter: () => {
                hdr.classList.add('line-expanded');
            }
        });
    });

    // 17. Manifesto Letter Animation (Show one by one on scroll up, hide on scroll down)
    const initManifestoWordScrub = () => {
        const manifesto = document.querySelector('.positioning-manifesto');
        if (!manifesto) return;

        if (!manifesto.dataset.splitDone) {
            manifesto.dataset.splitDone = 'true';
            const childNodes = Array.from(manifesto.childNodes);
            manifesto.innerHTML = '';

            childNodes.forEach((node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const words = node.textContent.trim().split(/\s+/).filter(Boolean);
                    words.forEach((w) => {
                        const wordSpan = document.createElement('span');
                        wordSpan.className = 'manifesto-word';
                        Array.from(w).forEach((char) => {
                            const charSpan = document.createElement('span');
                            charSpan.className = 'scrub-char';
                            charSpan.textContent = char;
                            wordSpan.appendChild(charSpan);
                        });
                        manifesto.appendChild(wordSpan);
                    });
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const isAccent = node.classList.contains('accent-text') || node.classList.contains('gradient-text');
                    const words = node.textContent.trim().split(/\s+/).filter(Boolean);
                    words.forEach((w) => {
                        const wordSpan = document.createElement('span');
                        wordSpan.className = isAccent ? 'manifesto-word accent-text' : 'manifesto-word';
                        Array.from(w).forEach((char) => {
                            const charSpan = document.createElement('span');
                            charSpan.className = 'scrub-char';
                            charSpan.textContent = char;
                            wordSpan.appendChild(charSpan);
                        });
                        manifesto.appendChild(wordSpan);
                    });
                }
            });
        }

        const scrubChars = manifesto.querySelectorAll('.scrub-char');
        if (!scrubChars.length) return;

        if (isReducedMotion) {
            scrubChars.forEach((c) => { c.style.opacity = '1'; });
            return;
        }

        // Letter-by-letter scrub:
        // As you scroll down into the next section, letters hide one by one.
        // While scrolling upwards, letters show one by one.
        ScrollTrigger.create({
            trigger: '#positioning',
            start: () => {
                const posSec = document.getElementById('positioning');
                return (posSec && posSec.offsetHeight > window.innerHeight) ? 'bottom bottom' : 'top top';
            },
            endTrigger: '#services',
            end: 'top top',
            scrub: 0.6,
            invalidateOnRefresh: true,
            animation: gsap.fromTo(scrubChars,
                { opacity: 1, y: 0 },
                {
                    opacity: 0,
                    y: -6,
                    stagger: 0.012,
                    ease: 'power1.inOut'
                }
            )
        });
    };
    initManifestoWordScrub();

    // 18. Process Timeline Scroll-Driven Progress Track
    const initProcessTimeline = () => {
        const timelineWrap = document.querySelector('.process-timeline-wrap');
        const pBar = document.querySelector('.process-progress-bar');
        const steps = document.querySelectorAll('.process-step');
        if (!timelineWrap || !pBar || !steps.length) return;

        if (isReducedMotion) {
            pBar.style.width = '100%';
            steps.forEach((s) => s.classList.add('step-active'));
            return;
        }

        ScrollTrigger.create({
            trigger: timelineWrap,
            start: 'top 80%',
            end: 'bottom 60%',
            scrub: 0.6,
            onUpdate: (self) => {
                const progress = Math.min(100, Math.max(0, self.progress * 100));
                pBar.style.width = `${progress}%`;

                const stepThreshold = 100 / steps.length;
                steps.forEach((step, idx) => {
                    if (progress >= idx * stepThreshold) {
                        step.classList.add('step-active');
                    } else {
                        step.classList.remove('step-active');
                    }
                });
            }
        });
    };
    initProcessTimeline();

    // 19. Contact Form Pipeline & WhatsApp Integration
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-result');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Client-side validation (form uses novalidate so messages are consistent)
            if (!contactForm.checkValidity()) {
                const firstInvalid = contactForm.querySelector(':invalid');
                if (formStatus) {
                    formStatus.style.color = '#e5e5ea';
                    formStatus.textContent = 'Please complete all required fields with a valid email address.';
                }
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <span style="display:inline-flex; align-items:center; gap:0.5rem;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                            <path d="M12 2a10 10 0 0 1 10 10"></path>
                        </svg>
                        Sending Inquiry...
                    </span>`;
            }

            if (formStatus) {
                formStatus.style.color = 'var(--text-secondary)';
                formStatus.innerHTML = 'Sending your inquiry...';
            }

            const formData = new FormData(contactForm);
            const dataObj = Object.fromEntries(formData);
            const jsonBody = JSON.stringify(dataObj);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: jsonBody
            })
            .then(async (res) => {
                const resJson = await res.json();
                if (res.status === 200) {
                    if (formStatus) {
                        formStatus.style.color = '#ffffff';
                        formStatus.innerHTML = 'Inquiry received. Thank you. We aim to reply within 24 hours.';
                    }

                    const name = dataObj.name || '';
                    const email = dataObj.email || '';
                    const company = dataObj.company || '';
                    const service = dataObj.service || '';
                    const message = dataObj.message || '';

                    const waText = encodeURIComponent(
                        `*New Inquiry: MONARCH SOFTWARES*\n\n` +
                        `*Name:* ${name}\n` +
                        `*Email:* ${email}\n` +
                        `*Company:* ${company}\n` +
                        `*Topic:* ${service}\n` +
                        `*Message:* ${message}`
                    );
                    const waUrl = `https://wa.me/916385753874?text=${waText}`;

                    contactForm.reset();
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Inquiry Sent ✓';
                        setTimeout(() => {
                            submitBtn.innerHTML = submitBtn.dataset.label || 'Send Inquiry →';
                        }, 3500);
                    }

                    if (formStatus) {
                        formStatus.innerHTML = `Inquiry received. <a href="${waUrl}" target="_blank" rel="noopener" style="text-decoration:underline; font-weight:600; color:#ffffff;">Click here to also chat on WhatsApp &rarr;</a>`;
                    }
                } else {
                    if (formStatus) {
                        formStatus.style.color = '#e5e5ea';
                        formStatus.innerHTML = resJson.message || 'Submission failed. Please email contact@monarchsoftwares.com';
                    }
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Retry Sending Inquiry';
                    }
                }
            })
            .catch((err) => {
                console.error('Contact form submission error:', err);
                if (formStatus) {
                    formStatus.style.color = '#e5e5ea';
                    formStatus.innerHTML = 'Network error. Reach us directly at contact@monarchsoftwares.com';
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = submitBtn.dataset.label || 'Send Inquiry →';
                }
            });
        });
    }

    // Mark the current page in the services dropdown
    document.querySelectorAll('.dropdown-item').forEach((a) => {
        if (a.getAttribute('href') === window.location.pathname.replace(/\.html$/, '')) a.setAttribute('aria-current', 'page');
    });

    // Footer wordmark rendered with the React Bits WarpText (loaded on demand)
    if (document.querySelector('.footer-wordmark__stage')) {
        import('./footer-warp.jsx').then((m) => m.initFooterWarp?.());
    }

    // 20. Legal Modals
    initLegalModals();

    // 21. Window Resize & Refresh Management
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (typeof lenis.resize === 'function') lenis.resize();
            ScrollTrigger.refresh();
            onScrollUpdate();
            updateActiveNav();
        }, 150);
    });

    window.addEventListener('load', () => {
        if (typeof lenis.resize === 'function') lenis.resize();
        ScrollTrigger.refresh();
        onScrollUpdate();
        updateActiveNav();

        // Arriving with a section hash (e.g. from an old page URL redirect): scroll to that section.
        if (onHome && window.location.hash.length > 1) {
            const handleHashLanding = () => {
                const target = document.querySelector(window.location.hash);
                if (target) {
                    ScrollTrigger.sort();
                    ScrollTrigger.refresh();
                    if (typeof lenis.resize === 'function') lenis.resize();
                    const targetTop = getTargetScrollTop(target);
                    lenis.scrollTo(Math.max(0, targetTop - 80), { immediate: true });
                }
            };
            setTimeout(handleHashLanding, 150);
            setTimeout(handleHashLanding, 600);
        }
    });
});
