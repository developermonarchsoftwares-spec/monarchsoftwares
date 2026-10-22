import './masked-heading.css';

/**
 * MaskedHeading Component
 * Renders a refined headline where monochrome video/image background shines through text,
 * maintaining the exact brand font style ('Space Grotesk', font-weight 900, tracked letter spacing).
 */
export class MaskedHeading {
    constructor(elementOrProps, props = {}) {
        let containerElement = null;
        let config = {};

        if (typeof elementOrProps === 'string') {
            containerElement = document.querySelector(elementOrProps);
            config = props;
        } else if (elementOrProps instanceof HTMLElement) {
            containerElement = elementOrProps;
            config = props;
        } else if (typeof elementOrProps === 'object' && elementOrProps !== null) {
            config = elementOrProps;
        }

        this.text = config.text || (containerElement ? containerElement.getAttribute('text') || containerElement.textContent.trim() : 'MONARCH');
        this.mediaType = config.mediaType || (config.src && config.src.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'video');
        this.src = config.src || '/reel.mp4';
        this.poster = config.poster || '/reel-poster.jpg';
        this.fillScale = config.fillScale !== undefined ? parseFloat(config.fillScale) : 1.3;
        this.parallax = config.parallax !== undefined ? parseFloat(config.parallax) : 34;
        this.reveal = config.reveal || 'wipe';
        this.trigger = config.trigger || 'view';
        this.monochrome = config.monochrome !== undefined ? config.monochrome : true;

        this.uniqueId = 'masked-heading-' + Math.random().toString(36).substr(2, 9);
        this.element = containerElement || document.createElement('div');
        
        this.init();
    }

    init() {
        this.render();
        this.setupParallax();
        this.setupReveal();
        this.setupVideoFallback();
    }

    render() {
        this.element.className = `masked-heading-wrapper ${this.element.className || ''}`.trim();
        this.element.setAttribute('data-reveal', this.reveal);
        this.element.setAttribute('data-trigger', this.trigger);

        const svgId = `clip-${this.uniqueId}`;
        const scaleVal = this.fillScale;

        // Bounding box setup matching Space Grotesk 900 tracking
        const approxCharWidth = 52;
        const fontKw = Math.max(540, this.text.length * approxCharWidth);
        const fontVh = 90;
        const fontSizeVal = '58';

        const monochromeStyle = this.monochrome ? 'filter: grayscale(100%) contrast(130%) brightness(115%);' : '';

        let mediaHTML = '';
        if (this.mediaType === 'video') {
            mediaHTML = `
                <video 
                    class="masked-heading-media masked-heading-video" 
                    src="${this.src}" 
                    ${this.poster ? `poster="${this.poster}"` : ''} 
                    autoplay loop muted playsinline 
                    style="transform: scale(${scaleVal}); ${monochromeStyle}"
                ></video>
                <canvas class="masked-heading-canvas-fallback" style="display:none; position:absolute; inset:0; width:100%; height:100%; object-fit:cover; ${monochromeStyle}"></canvas>
            `;
        } else {
            mediaHTML = `
                <img 
                    class="masked-heading-media" 
                    src="${this.src}" 
                    alt="${this.escapeHtml(this.text)}" 
                    style="transform: scale(${scaleVal}); ${monochromeStyle}"
                />
            `;
        }

        this.element.innerHTML = `
            <div class="masked-heading-inner" style="max-width: 560px; margin: 0 auto;">
                <svg class="masked-heading-svg" viewBox="0 0 ${fontKw} ${fontVh}" preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <clipPath id="${svgId}">
                            <text 
                                x="50%" 
                                y="54%" 
                                text-anchor="middle" 
                                dominant-baseline="central" 
                                font-family="Sora, Inter, system-ui, sans-serif"
                                font-weight="900"
                                font-size="${fontSizeVal}"
                                letter-spacing="0.5em"
                            >${this.escapeHtml(this.text)}</text>
                        </clipPath>
                    </defs>
                    <g clip-path="url(#${svgId})">
                        <foreignObject x="-20%" y="-20%" width="140%" height="140%">
                            <div style="width: 100%; height: 100%; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #050505;">
                                ${mediaHTML}
                            </div>
                        </foreignObject>
                    </g>
                </svg>
            </div>
        `;

        this.mediaEl = this.element.querySelector('.masked-heading-media');
        this.innerEl = this.element.querySelector('.masked-heading-inner');
        this.videoEl = this.element.querySelector('.masked-heading-video');
        this.canvasFallback = this.element.querySelector('.masked-heading-canvas-fallback');
    }

    escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    setupVideoFallback() {
        if (!this.videoEl) return;

        const startCanvasAnimation = () => {
            if (!this.canvasFallback) return;
            this.canvasFallback.style.display = 'block';
            if (this.videoEl) this.videoEl.style.display = 'none';

            const canvas = this.canvasFallback;
            const ctx = canvas.getContext('2d');
            let t = 0;

            const renderCanvas = () => {
                canvas.width = 600;
                canvas.height = 240;
                t += 0.025;

                // Sleek Monochrome Silver Metallic Flow Gradient
                const grad = ctx.createLinearGradient(
                    Math.cos(t) * 300 + 300,
                    Math.sin(t) * 120 + 120,
                    Math.sin(t * 0.7) * 300 + 300,
                    Math.cos(t * 0.7) * 120 + 120
                );
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.3, '#d8d8d8');
                grad.addColorStop(0.65, '#777777');
                grad.addColorStop(1, '#181818');

                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                requestAnimationFrame(renderCanvas);
            };

            renderCanvas();
        };

        this.videoEl.addEventListener('error', startCanvasAnimation);
        
        const playPromise = this.videoEl.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                if (this.poster) {
                    this.videoEl.style.backgroundImage = `url(${this.poster})`;
                    this.videoEl.style.backgroundSize = 'cover';
                }
                startCanvasAnimation();
            });
        }
    }

    setupParallax() {
        if (!this.mediaEl || this.parallax <= 0) return;

        let mouseX = 0;
        let mouseY = 0;
        let scrollYOffset = 0;
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;
        let isHovered = false;

        const maxOffset = this.parallax;
        const scaleVal = this.fillScale;

        const container = this.element;
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            isHovered = true;
        }, { passive: true });

        container.addEventListener('mouseleave', () => {
            isHovered = false;
        });

        const updateScroll = () => {
            const rect = container.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            if (rect.top < viewportHeight && rect.bottom > 0) {
                const centerOffset = (rect.top + rect.height / 2 - viewportHeight / 2) / (viewportHeight / 2);
                scrollYOffset = centerOffset * (maxOffset * 0.5);
            }
        };

        window.addEventListener('scroll', updateScroll, { passive: true });
        updateScroll();

        const animate = () => {
            if (isHovered) {
                targetX = mouseX * maxOffset;
                targetY = mouseY * maxOffset + scrollYOffset;
            } else {
                targetX = 0;
                targetY = scrollYOffset;
            }

            currentX += (targetX - currentX) * 0.08;
            currentY += (targetY - currentY) * 0.08;

            const monochromeFilter = this.monochrome ? 'grayscale(100%) contrast(130%) brightness(115%)' : '';

            if (this.mediaEl) {
                this.mediaEl.style.transform = `scale(${scaleVal}) translate3d(${currentX}px, ${currentY}px, 0)`;
                if (monochromeFilter) this.mediaEl.style.filter = monochromeFilter;
            }
            if (this.canvasFallback && this.canvasFallback.style.display !== 'none') {
                this.canvasFallback.style.transform = `scale(${scaleVal}) translate3d(${currentX}px, ${currentY}px, 0)`;
                if (monochromeFilter) this.canvasFallback.style.filter = monochromeFilter;
            }

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    setupReveal() {
        if (this.trigger === 'load') {
            setTimeout(() => {
                this.element.classList.add('is-revealed');
            }, 100);
            return;
        }

        if (window.ScrollTrigger && window.gsap && this.innerEl) {
            window.gsap.to(this.element, {
                scrollTrigger: {
                    trigger: this.element,
                    start: 'top 88%',
                    onEnter: () => this.element.classList.add('is-revealed'),
                    once: true
                }
            });
        } else {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.element.classList.add('is-revealed');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });

            observer.observe(this.element);
        }
    }
}

export default function createMaskedHeading(props = {}) {
    const instance = new MaskedHeading(props);
    return instance.element;
}

export function initMaskedHeadings() {
    document.querySelectorAll('[data-masked-heading]').forEach(el => {
        const text = el.getAttribute('text') || el.dataset.text || el.textContent.trim();
        const mediaType = el.getAttribute('mediaType') || el.dataset.mediaType || 'video';
        const src = el.getAttribute('src') || el.dataset.src || '/reel.mp4';
        const poster = el.getAttribute('poster') || el.dataset.poster || '/reel-poster.jpg';
        const fillScale = el.getAttribute('fillScale') || el.dataset.fillScale || 1.3;
        const parallax = el.getAttribute('parallax') || el.dataset.parallax || 34;
        const reveal = el.getAttribute('reveal') || el.dataset.reveal || 'wipe';
        const trigger = el.getAttribute('trigger') || el.dataset.trigger || 'view';
        const monochrome = el.getAttribute('monochrome') !== 'false';

        new MaskedHeading(el, {
            text,
            mediaType,
            src,
            poster,
            fillScale,
            parallax,
            reveal,
            trigger,
            monochrome
        });
    });
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMaskedHeadings);
    } else {
        initMaskedHeadings();
    }
}
