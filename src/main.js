// Import styles and core libraries
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import {
    createIcons,
    ArrowRight,
    Award,
    BarChart3,
    Briefcase,
    Check,
    ChevronDown,
    Clock,
    Code,
    Code2,
    Coffee,
    FileText,
    GitBranch,
    GitMerge,
    Layers,
    Mail,
    MapPin,
    Megaphone,
    MessageSquare,
    Monitor,
    Phone,
    Puzzle,
    Rocket,
    Send,
    Shield,
    ShieldCheck,
    Target,
    TrendingUp,
    Users,
    Video,
    X,
    Zap
} from 'lucide'

const icons = {
    ArrowRight,
    Award,
    BarChart3,
    Briefcase,
    Check,
    ChevronDown,
    Clock,
    Code,
    Code2,
    Coffee,
    FileText,
    GitBranch,
    GitMerge,
    Layers,
    Mail,
    MapPin,
    Megaphone,
    MessageSquare,
    Monitor,
    Phone,
    Puzzle,
    Rocket,
    Send,
    Shield,
    ShieldCheck,
    Target,
    TrendingUp,
    Users,
    Video,
    X,
    Zap
}

import './style.css'
import './border-glow.css'
import './premium.css'
import { Orb } from './orb.js'
import { Galaxy } from './galaxy.js'
import { Prism } from './prism.js'
import { Antigravity } from './antigravity.js'
import { initBorderGlow } from './border-glow.js'
import { initLegalModals } from './legal.js'
import { Particles } from './particles.js'
import { MaskedHeading, initMaskedHeadings } from './MaskedHeading.js'
import './particles.css'
import './jarvis.css'
import { Jarvis } from './jarvis.js'
import { PremiumCursor } from './cursor.js'
import ScrollStack, { initScrollStack } from './ScrollStack.js'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Expose globals for component access
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
window.Lenis = Lenis;
window.MaskedHeading = MaskedHeading;
window.initMaskedHeadings = initMaskedHeadings;
window.ScrollStack = ScrollStack;
window.initScrollStack = initScrollStack;
window.lucide = {
    createIcons: (opts) => createIcons({ icons, ...opts })
};

// Initialize everything when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize ScrollStack cards
    initScrollStack();
    // Setup scroll progress bar and header scroll detection
    const header = document.getElementById('header');

    // Helper to calculate static document offset of elements (bypasses sticky bounds)
    const getStaticOffset = (element) => {
        let offset = 0;
        let el = element;
        while (el) {
            offset += el.offsetTop;
            el = el.offsetParent;
        }
        return offset;
    };

    // Update active nav link based on scroll position
    const updateActiveNavLink = () => {
        const scrollPos = window.scrollY + 120; // Offset for active trigger point
        const sections = [
            { id: '#', link: document.querySelector('.nav-links a[href="#"]') },
            { id: '#services', link: document.querySelector('.nav-links a[href="#services"]') },
            { id: '#careers', link: document.querySelector('.nav-links a[href="#careers"]') },
            { id: '#about', link: document.querySelector('.nav-links a[href="#about"]') },
            { id: '#contact', link: document.querySelector('.nav-links a[href="#contact"]') }
        ];

        let activeSection = sections[0];
        
        for (let i = 1; i < sections.length; i++) {
            const secEl = document.querySelector(sections[i].id);
            if (secEl) {
                const staticOffset = getStaticOffset(secEl);
                if (scrollPos >= staticOffset) {
                    activeSection = sections[i];
                }
            }
        }

        sections.forEach(sec => {
            if (sec.link) {
                if (sec === activeSection) {
                    sec.link.classList.add('active');
                } else {
                    sec.link.classList.remove('active');
                }
            }
        });
    };

    // Create scroll progress indicator
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    /**
     * 1. Initialize Lenis for Smooth Scrolling
     * Configures the duration, easing, and wheel behavior for a premium feel.
     */
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1.0,
        smooth: true
    });

    // Update progress bar and header state on scroll
    const updateScrollChrome = () => {
        const limit = lenis.limit;
        const pct = !limit || limit <= 0 ? 0 : Math.min(100, Math.max(0, (lenis.scroll / limit) * 100));
        progressBar.style.width = pct + '%';
        if (header) {
            if (lenis.scroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    };

    // High-Performance Background Video Engine (Full Homepage Span - Complete 100% Animation)
    const bgVideo = document.getElementById('scroll-bg-video');
    const homeSection = document.getElementById('page-home');

    if (bgVideo && homeSection) {
        bgVideo.muted = true;
        bgVideo.playsInline = true;
        
        let targetProgress = 0;
        let smoothProgress = 0;
        let isSeeking = false;
        let rafId = null;

        const updateVideoScrub = () => {
            const scrollY = lenis.scroll;
            const homeHeight = homeSection.offsetHeight || window.innerHeight;
            const maxHomeScroll = Math.max(100, homeHeight - window.innerHeight);

            // Map progress strictly 0.0 to 1.0 across the full height of #page-home
            targetProgress = Math.min(1, Math.max(0, scrollY / maxHomeScroll));

            // Visibility: 30% (0.30) across homepage; fades out cleanly past homepage
            if (scrollY > maxHomeScroll + 100) {
                bgVideo.style.opacity = '0';
            } else {
                const fadeOpacity = scrollY < maxHomeScroll ? 0.30 : Math.max(0, 0.30 * (1 - (scrollY - maxHomeScroll) / 100));
                bgVideo.style.opacity = fadeOpacity.toFixed(3);
            }

            if (bgVideo.duration && !isNaN(bgVideo.duration)) {
                // Smooth Lerp progress scrubbing
                smoothProgress += (targetProgress - smoothProgress) * 0.12;
                if (Math.abs(targetProgress - smoothProgress) < 0.001) {
                    smoothProgress = targetProgress;
                }

                const seekTime = smoothProgress * bgVideo.duration;

                if (!bgVideo.seeking && !isSeeking && Math.abs(bgVideo.currentTime - seekTime) > 0.01) {
                    isSeeking = true;
                    try {
                        bgVideo.currentTime = seekTime;
                    } catch (e) {
                        isSeeking = false;
                    }
                }
            }

            rafId = requestAnimationFrame(updateVideoScrub);
        };

        bgVideo.addEventListener('seeked', () => {
            isSeeking = false;
        });

        if (bgVideo.readyState >= 1) {
            rafId = requestAnimationFrame(updateVideoScrub);
        } else {
            bgVideo.addEventListener('loadedmetadata', () => {
                if (!rafId) rafId = requestAnimationFrame(updateVideoScrub);
            }, { once: true });
            bgVideo.addEventListener('canplay', () => {
                if (!rafId) rafId = requestAnimationFrame(updateVideoScrub);
            }, { once: true });
        }
    }

    lenis.on('scroll', () => {
        if (window.ScrollTrigger) {
            window.ScrollTrigger.update();
        }
        updateScrollChrome();
        updateActiveNavLink();
    });

    // Integration of Lenis with GSAP ticker for frame-perfect sync
    if (window.gsap) {
        window.gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        window.gsap.ticker.lagSmoothing(0);
    } else {
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    updateScrollChrome();

    // Handle Smooth Entrance Instantly
    document.body.classList.remove('loading');

    // Initialize BorderGlow on elements with .glow-card class
    document.querySelectorAll('.glow-card').forEach(card => {
        initBorderGlow(card, {
            animated: true,
            glowIntensity: 1.5,
            edgeSensitivity: 40,
            borderRadius: 20
        });
    });


    // Initialize Lucide Icons
    const initIcons = () => {
        try {
            createIcons({ icons });
        } catch (err) {
            console.error('Lucide icon initialization error:', err);
        }
    };
    initIcons();

    // GSAP ScrollTrigger Configuration and Proxy setup
    const scrollRoot = document.documentElement;

    if (window.gsap && window.ScrollTrigger) {
        window.gsap.registerPlugin(window.ScrollTrigger);
        document.body.classList.add('gsap-ready');

        /**
         * Link Lenis scroll position to GSAP ScrollTrigger
         * Enables frame-perfect scroll-based animations using the smooth scroll position.
         */
        ScrollTrigger.scrollerProxy(scrollRoot, {
            scrollTop(value) {
                if (arguments.length) {
                    lenis.scrollTo(value, { immediate: true });
                }
                return lenis.scroll;
            },
            getBoundingClientRect() {
                return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
            },
            pinType: scrollRoot.style.transform ? 'transform' : 'fixed'
        });

        window.ScrollTrigger.defaults({ scroller: scrollRoot });

        /**
         * Magnetic Buttons Utility
         * Adds a sophisticated "magnetic" attraction effect to primary buttons on hover.
         */
        document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
            let btnRafPending = false;
            btn.addEventListener('mousemove', (e) => {
                if (btnRafPending) return;
                btnRafPending = true;
                requestAnimationFrame(() => {
                    btnRafPending = false;
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    window.gsap.to(btn, {
                        x: x * 0.3,
                        y: y * 0.3,
                        duration: 0.6,
                        ease: 'power3.out',
                        overwrite: 'auto'
                    });
                });
            }, { passive: true });
            btn.addEventListener('mouseleave', () => {
                btnRafPending = false;
                window.gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.8,
                    ease: 'elastic.out(1, 0.3)',
                    overwrite: 'auto'
                });
            });
        });

        // Unified scroll reveals — skip headings nested inside .reveal; skip column wrappers handled by .story-grid stagger
        document.querySelectorAll('h1, h2, h3, .reveal').forEach((el) => {
            if (el.classList.contains('no-split') && el.closest('.hero')) {
                return;
            }
            const tag = el.tagName;
            if ((tag === 'H1' || tag === 'H2' || tag === 'H3') && el.closest('.reveal')) {
                return;
            }
            if (el.classList.contains('reveal') && el.parentElement && el.parentElement.classList.contains('story-grid')) {
                return;
            }
            if (el.classList.contains('reveal') && el.parentElement && el.parentElement.classList.contains('tech-section-inner')) {
                return;
            }
            if (el.classList.contains('reveal') && el.closest('.hero')) {
                return;
            }
            if (el.classList.contains('story-grid')) {
                return;
            }

            window.gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 92%',
                    toggleActions: 'play none none reverse',
                    once: true,
                    invalidateOnRefresh: true
                },
                y: 48,
                scale: 0.98,
                rotationX: -4,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
                clearProps: 'transform,opacity,visibility'
            });
        });

        // Hero Content Entrance Reveal
        window.gsap.from('.hero .reveal', {
            y: 30,
            opacity: 0,
            stagger: 0.15,
            duration: 1.2,
            ease: 'expo.out',
            delay: 0.2,
            clearProps: 'transform,opacity,visibility'
        });

        // Hero Visual Parallax and Mouse move
        const heroVisual = document.querySelector('.hero-visual img');
        if (heroVisual) {
            window.gsap.to(heroVisual, {
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                },
                y: 150,
                rotate: 5,
                scale: 1.1
            });

            let heroRafPending = false;
            document.addEventListener('mousemove', (e) => {
                if (heroRafPending) return;
                heroRafPending = true;
                requestAnimationFrame(() => {
                    heroRafPending = false;
                    const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
                    const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
                    window.gsap.to('.hero-visual', {
                        rotateX: yAxis,
                        rotateY: xAxis,
                        duration: 1,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });
                });
            }, { passive: true });
        }


        // --- Generalized Robot-Style Section Animations ---
        document.querySelectorAll('.tech-section').forEach((section, index) => {
            const robotImg = section.querySelector('.reveal-robot');
            const visualWrap = section.querySelector('.tech-visual');
            
            if (robotImg) {
                // Initial setup to avoid flash
                window.gsap.set(robotImg, { x: 140, opacity: 0, force3D: true });

                // Entrance animation linked to scroll
                window.gsap.to(robotImg, {
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 85%',
                        end: 'bottom 50%',
                        scrub: 1,
                        invalidateOnRefresh: true
                    },
                    x: 0,
                    opacity: 1,
                    ease: 'none'
                });
            }

            if (visualWrap) {
                // Entrance animation for the robot/asset
                const robotImg = visualWrap.querySelector('.reveal-robot');
                if (robotImg) {
                    window.gsap.from(robotImg, {
                        scrollTrigger: {
                            trigger: visualWrap,
                            start: "top 90%",
                            toggleActions: "play none none reverse"
                        },
                        y: 100,
                        scale: 0.8,
                        opacity: 0,
                        duration: 1.8,
                        ease: "expo.out"
                    });

                    // Continuous Floating idle animation
                    window.gsap.to(robotImg, {
                        y: -20,
                        duration: 3 + Math.random() * 2,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut"
                    });
                }

                // Framer-style Interactive 3D Tilt (Experimental)
                if (section.querySelector('[data-animation="framer"]')) {
                    const framerTarget = section.querySelector('[data-animation="framer"]');
                    const framerImg = framerTarget.querySelector('img');

                    let framerRafPending = false;
                    window.addEventListener('mousemove', (e) => {
                        if (framerRafPending) return;
                        framerRafPending = true;
                        requestAnimationFrame(() => {
                            framerRafPending = false;
                            const rect = framerTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left - rect.width / 2;
                            const y = e.clientY - rect.top - rect.height / 2;

                            if (Math.abs(x) < 500 && Math.abs(y) < 500) {
                                window.gsap.to(framerImg, {
                                    rotateY: x / 20,
                                    rotateX: -y / 20,
                                    x: x / 40,
                                    y: y / 40,
                                    duration: 1,
                                    ease: "power2.out",
                                    overwrite: 'auto'
                                });
                            }
                        });
                    }, { passive: true });

                    framerTarget.addEventListener('mouseleave', () => {
                        window.gsap.to(framerImg, {
                            rotateY: 0,
                            rotateX: 0,
                            x: 0,
                            y: 0,
                            duration: 1.5,
                            ease: "elastic.out(1, 0.3)"
                        });
                    });
                }
            }
        });

        window.gsap.utils.toArray('.story-grid, .tech-section-inner, .pillars-grid').forEach((grid) => {
            const cells = grid.querySelectorAll(':scope > *');
            cells.forEach((cell, index) => {
                const fromX = index === 0 ? -56 : 56;
                window.gsap.from(cell, {
                    scrollTrigger: {
                        trigger: grid,
                        start: 'top 86%',
                        once: true,
                        invalidateOnRefresh: true
                    },
                    x: fromX,
                    opacity: 0,
                    duration: 1.05,
                    delay: index * 0.1,
                    ease: 'power3.out',
                    clearProps: 'transform,opacity'
                });
            });
        });

        document.querySelectorAll('.process-timeline').forEach((row) => {
            const steps = row.querySelectorAll(':scope > *');
            if (steps.length === 0) {
                return;
            }
            window.gsap.from(steps, {
                scrollTrigger: {
                    trigger: row,
                    start: 'top 86%',
                    once: true,
                    invalidateOnRefresh: true
                },
                y: 44,
                opacity: 0,
                duration: 0.85,
                stagger: 0.09,
                ease: 'power3.out',
                clearProps: 'transform,opacity'
            });
        });

        // Global Card Hover Interactions (Lush Scale + Elevation)
        const cardsToAnimate = '.glow-card, .service-card, .why-item, .stack-card, .marquee-card, .testimonial-card, .process-step, .price-card';
        document.querySelectorAll(cardsToAnimate).forEach(card => {
            card.addEventListener('mouseenter', () => {
                window.gsap.to(card, {
                    y: -12,
                    scale: 1.02,
                    zIndex: 10,
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.05)',
                    duration: 0.4,
                    ease: 'power2.out'
                });
            });
            card.addEventListener('mouseleave', () => {
                window.gsap.to(card, {
                    y: 0,
                    scale: 1,
                    zIndex: 1,
                    boxShadow: 'none',
                    duration: 0.4,
                    ease: 'power2.out'
                });
            });
        });

        // Stacking deck animation (methodology section only — not services division cards)
        const stackCards = window.gsap.utils.toArray('.cards-stack-container .stack-card');
        if (stackCards.length > 0) {
            stackCards.forEach((card, index) => {
                if (index < stackCards.length - 1) {
                    window.gsap.to(card, {
                        scrollTrigger: {
                            trigger: stackCards[index + 1],
                            start: "top 90%", // Start scaling sooner
                            end: "top 120px", // Complete when it hits the stack top
                            scrub: 1, // More lag for smoother visibility
                            invalidateOnRefresh: true,
                        },
                        scale: 0.85, // More aggressive scale for visibility
                        opacity: 0.6, // Fades more to draw focus to the new top card
                        y: -50, // More upward movement
                        filter: "brightness(0.3) blur(2px)",
                        ease: "power2.inOut"
                    });
                }
            });
        }

    } else {
        // Fallback for Intersection Observer if GSAP is missing
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('reveal-hidden');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal-hidden').forEach(el => observer.observe(el));
    }

    // Background canvas effects disabled for clean background


    // Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
            const icon = mobileToggle.querySelector('.lucide');
            if (navLinks.classList.contains('mobile-active')) {
                if (icon) {
                    icon.setAttribute('data-lucide', 'x');
                }
                document.body.style.overflow = 'hidden';
            } else {
                if (icon) {
                    icon.setAttribute('data-lucide', 'menu');
                }
                document.body.style.overflow = '';
            }
            if (window.lucide) {
                window.lucide.createIcons();
            }
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('mobile-active');
                const icon = mobileToggle.querySelector('.lucide');
                if (icon) {
                    icon.setAttribute('data-lucide', 'menu');
                }
                document.body.style.overflow = '';
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || !href.startsWith('#')) {
                return;
            }
            
            e.preventDefault();
            
            let targetOffset = 0;
            if (href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    targetOffset = getStaticOffset(target);
                } else {
                    return;
                }
            }
            
            lenis.scrollTo(targetOffset, {
                offset: -90,
                duration: 1.35,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        });
    });

    // Form Handling
    const form = document.getElementById('contact-form');
    const result = document.getElementById('form-result');
    const submitBtn = document.getElementById('submit-btn');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Update UI
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span style="display:flex; align-items:center; gap:0.5rem;"><svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Sending...</span>';
            
            result.style.color = "var(--text-secondary)";
            result.innerHTML = "Processing your inquiry...";

            const formData = new FormData(form);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(async (response) => {
                let json = await response.json();
                if (response.status == 200) {
                    result.style.color = "#00ff88";
                    result.innerHTML = "Inquiry sent to Email! Redirecting to WhatsApp...";
                    
                    const name = object.name || '';
                    const email = object.email || '';
                    const service = object.service || '';
                    const message = object.message || '';
                    
                    const whatsappMsg = encodeURIComponent(`*New Inquiry from MONARCH Website*\n\n*Name:* ${name}\n*Email:* ${email}\n*Service:* ${service}\n*Message:* ${message}`);
                    const whatsappUrl = `https://wa.me/916385753874?text=${whatsappMsg}`;
                    
                    setTimeout(() => {
                        window.open(whatsappUrl, '_blank');
                        form.reset();
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Send Inquiry';
                    }, 1000);
                } else {
                    result.style.color = "#ff4444";
                    result.innerHTML = json.message || "Submission failed. Please try again.";
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Send Inquiry';
                }
            })
            .catch(error => {
                console.error(error);
                result.style.color = "#ff4444";
                result.innerHTML = "Network error. Please check your connection.";
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Send Inquiry';
            });
        });
    }

    // Legal Modals
    initLegalModals();
    // Interactive Cards Handler
    document.querySelectorAll('.service-card, .stack-card').forEach(card => {
        card.addEventListener('click', () => {
            const link = card.querySelector('a');
            if (link) link.click();
        });
    });

    // Mobile/Tablet dropdown toggle — matches CSS nav breakpoint (1024px)
    const NAV_MOBILE_MAX = 1024;

    const clearDesktopDropdownInlineStyles = () => {
        if (window.innerWidth > NAV_MOBILE_MAX) {
            document.querySelectorAll('.dropdown-menu').forEach((menu) => {
                menu.style.removeProperty('display');
            });
        }
    };

    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= NAV_MOBILE_MAX) {
                e.preventDefault();
                const menu = toggle.nextElementSibling;
                if (menu) {
                    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                }
            }
        });
    });

    // Setup and manage sticky stacking sections
    const updateStickyStack = () => {
        const sections = document.querySelectorAll('.stack-section');
        sections.forEach((section, index) => {
            section.style.zIndex = index + 1;

            // All sections are taller than the viewport — pin each at top:0
            // so each subsequent section slides overtop of the previous one.
            section.style.top = '0px';
            section.style.bottom = 'auto';
        });
    };

    updateStickyStack();

    // ─── Card-Stacking Scroll Effect ─────────────────────────────────────────
    // As the next .stack-section enters the viewport, the current one scales
    // down and dims — like flipping a physical card deck.
    const initCardStackEffect = () => {
        const stackSections = gsap.utils.toArray('.stack-section');
        if (stackSections.length < 2) return;

        stackSections.forEach((section, i) => {
            if (i === stackSections.length - 1) return; // last section: nothing slides over it

            // ── Idempotency guard: skip if already initialised ──────────────
            if (section.querySelector(':scope > .stack-section-inner')) return;

            const nextSection = stackSections[i + 1];

            // Wrap all original children in an inner div.
            // We animate THIS wrapper (not the sticky root) to avoid
            // browser bugs where transform on a sticky element breaks layout.
            const inner = document.createElement('div');
            inner.className = 'stack-section-inner';
            // Only set non-height layout props inline — height is auto (natural content height)
            inner.style.cssText = [
                'width:100%',
                'position:relative',
                'transform-origin:top center',
                'will-change:transform'
            ].join(';');

            // Move all existing children into the inner wrapper
            while (section.firstChild) {
                inner.appendChild(section.firstChild);
            }
            section.appendChild(inner);

            // Semi-transparent black overlay — fades in as the next card covers this one.
            // z-index:20 keeps it below the fixed nav (z-index:100).
            const overlay = document.createElement('div');
            overlay.className = 'stack-overlay';
            overlay.style.cssText = [
                'position:absolute',
                'inset:0',
                'background:#000',
                'opacity:0',
                'pointer-events:none',
                'z-index:20'
            ].join(';');
            inner.appendChild(overlay);

            // Scrub timeline: current section shrinks + darkens while next slides in.
            // Explicit scroller set so this works regardless of ScrollTrigger.defaults order.
            gsap.timeline({
                scrollTrigger: {
                    trigger: nextSection,
                    scroller: document.documentElement, // explicit — Lenis proxy target
                    start: 'top bottom',  // next card's top enters viewport bottom
                    end: 'top top',       // next card's top reaches viewport top
                    scrub: 0.8,
                    invalidateOnRefresh: true
                }
            })
            .to(inner, { scale: 0.9, ease: 'none' }, 0)
            .to(overlay, { opacity: 0.5, ease: 'none' }, 0);
        });
        // NOTE: No ScrollTrigger.refresh() here — the window 'load' handler
        // already calls it after all initialisation is complete.
    };

    initCardStackEffect();
    updateActiveNavLink();

    // ─── Premium Animations ───────────────────────────────────────────────────
    const initPremiumAnimations = () => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // 1. Custom cursor (desktop only)
        if (!reduced && !window.matchMedia('(pointer: coarse)').matches) {
            new PremiumCursor();
        }

        // Ambient background effects disabled


        // 3. Button: ripple on click + arrow icon nudge
        document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
            // Add arrow icon if button doesn't already have one from Lucide
            if (!btn.querySelector('[data-lucide="arrow-right"]') && !btn.querySelector('.btn-arrow-icon')) {
                const arrow = document.createElement('i');
                arrow.className = 'btn-arrow-icon';
                arrow.textContent = '→';
                btn.appendChild(arrow);
            }

            // Ripple
            btn.addEventListener('click', e => {
                const r = btn.getBoundingClientRect();
                const size = Math.max(r.width, r.height) * 2.2;
                const ripple = document.createElement('span');
                ripple.className = 'btn-ripple';
                ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px;`;
                btn.appendChild(ripple);
                setTimeout(() => ripple.remove(), 700);
            });
        });

        // 4. 3D card tilt on hover
        if (!reduced) {
            document.querySelectorAll('.glow-card').forEach(card => {
                let tRaf = null;
                card.addEventListener('mousemove', e => {
                    if (tRaf) return;
                    tRaf = requestAnimationFrame(() => {
                        tRaf = null;
                        const rect = card.getBoundingClientRect();
                        const cx = rect.left + rect.width  / 2;
                        const cy = rect.top  + rect.height / 2;
                        const rx = ((e.clientY - cy) / (rect.height / 2)) * -5;
                        const ry = ((e.clientX - cx) / (rect.width  / 2)) *  5;
                        gsap.to(card, { rotateX: rx, rotateY: ry, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
                    });
                }, { passive: true });
                card.addEventListener('mouseleave', () => {
                    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'expo.out', overwrite: 'auto' });
                });
            });
        }

        // 5. Heading mask reveal (clip-path, lines slide up from bottom)
        if (!reduced && window.ScrollTrigger) {
            document.querySelectorAll('.section-header h2, .section-title').forEach(el => {
                if (el.closest('.hero') || el.dataset.maskInit) return;
                el.dataset.maskInit = '1';

                // Wrap element for overflow clip
                const mask = document.createElement('div');
                mask.className = 'heading-mask';
                el.parentNode.insertBefore(mask, el);
                mask.appendChild(el);

                gsap.from(el, {
                    scrollTrigger: {
                        trigger: mask,
                        start: 'top 90%',
                        once: true,
                        scroller: document.documentElement
                    },
                    yPercent: 110,
                    duration: 0.85,
                    ease: 'expo.out',
                    clearProps: 'transform'
                });
            });
        }

        // 6. Image parallax + reveal
        if (!reduced && window.ScrollTrigger) {
            document.querySelectorAll('.tech-visual img, .story-block img, .service-img-wrapper img').forEach(img => {
                const wrap = img.closest('.service-img-wrapper, .tech-visual, .story-block div');
                if (!wrap || wrap.dataset.imgInit) return;
                wrap.dataset.imgInit = '1';

                // Clip reveal: wipe from bottom
                gsap.fromTo(img,
                    { clipPath: 'inset(100% 0 0 0)', scale: 1.15 },
                    {
                        clipPath: 'inset(0% 0 0 0)', scale: 1,
                        duration: 1.1, ease: 'expo.out',
                        scrollTrigger: {
                            trigger: wrap,
                            start: 'top 85%',
                            once: true,
                            scroller: document.documentElement
                        }
                    }
                );

                // Subtle scroll parallax
                gsap.to(img, {
                    yPercent: -8,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: wrap,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1.2,
                        scroller: document.documentElement
                    }
                });
            });
        }

        // 7. Staggered card grid reveals (more cinematic than plain fade)
        if (!reduced && window.ScrollTrigger) {
            document.querySelectorAll(
                '[style*="grid-template-columns: repeat(3"], [style*="grid-template-columns: repeat(2"]'
            ).forEach(grid => {
                if (grid.dataset.gridInit) return;
                grid.dataset.gridInit = '1';
                const cards = grid.querySelectorAll(':scope > *');
                if (!cards.length) return;
                gsap.from(cards, {
                    scrollTrigger: {
                        trigger: grid,
                        start: 'top 88%',
                        once: true,
                        scroller: document.documentElement
                    },
                    y: 50, opacity: 0, scale: 0.96,
                    duration: 0.7,
                    stagger: { each: 0.08, from: 'start' },
                    ease: 'expo.out',
                    clearProps: 'transform,opacity'
                });
            });
        }
    };

    initPremiumAnimations();
    if (typeof initGlobalParticles === 'function') {
        initGlobalParticles();
    }

    clearDesktopDropdownInlineStyles();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateStickyStack();
            updateActiveNavLink();
            clearDesktopDropdownInlineStyles();
            if (typeof lenis.resize === 'function') {
                lenis.resize();
            }
            if (window.ScrollTrigger) {
                window.ScrollTrigger.refresh();
            }
            updateScrollChrome();
        }, 150);
    });

    window.addEventListener('load', () => {
        updateStickyStack();
        updateActiveNavLink();
        if (window.ScrollTrigger) {
            window.ScrollTrigger.refresh();
        }
        if (typeof lenis.resize === 'function') {
            lenis.resize();
        }
        updateScrollChrome();
    });

    requestAnimationFrame(() => {
        if (window.ScrollTrigger) {
            window.ScrollTrigger.refresh();
        }
    });
});
