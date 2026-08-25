import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollStack Engine
 * Stacks service cards with 100% opaque alternating Black & White styling.
 * Uses CSS sticky positioning + GSAP ScrollTrigger for 3D depth scale effect.
 */
export class ScrollStack {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) return;

        this.options = {
            cardSelector: '.scroll-stack-item, .service-card-box',
            baseTopOffset: options.baseTopOffset || 130,
            cardOffsetStep: options.cardOffsetStep || 20,
            ...options
        };

        this.items = Array.from(this.container.querySelectorAll(this.options.cardSelector));
        if (this.items.length < 2) return;

        this.init();
    }

    init() {
        this.container.classList.add('scroll-stack');

        this.items.forEach((item, index) => {
            item.classList.add('scroll-stack-item');

            // Force opacity 1 and remove initial reveal transform inline glitches
            item.style.opacity = '1';
            item.style.transform = 'none';

            // Apply alternating Black & White card classes
            if (!item.classList.contains('card-black') && !item.classList.contains('card-white')) {
                if (index % 2 === 0) {
                    item.classList.add('card-black');
                } else {
                    item.classList.add('card-white');
                }
            }

            // Ensure icon container badge exists
            const iconWrap = item.querySelector('div > div:first-child');
            if (iconWrap && !iconWrap.classList.contains('icon-badge')) {
                iconWrap.classList.add('icon-badge');
            }

            // Ensure label capability tag exists
            const tagSpan = item.querySelector('div > span');
            if (tagSpan && !tagSpan.classList.contains('capability-tag')) {
                tagSpan.classList.add('capability-tag');
            }

            // Set sticky top position step
            const topOffset = this.options.baseTopOffset + index * this.options.cardOffsetStep;
            item.style.position = 'sticky';
            item.style.top = `${topOffset}px`;
            item.style.zIndex = (index + 10).toString();

            // Set margin-bottom to create scroll distance before the next card stacks
            if (index < this.items.length - 1) {
                item.style.marginBottom = '6rem';
            } else {
                item.style.marginBottom = '2rem';
            }

            // GSAP ScrollTrigger to scale down current card when next card stacks over it
            if (index < this.items.length - 1) {
                const nextItem = this.items[index + 1];

                gsap.to(item, {
                    scale: 0.95 - index * 0.005,
                    filter: 'brightness(0.9)',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: nextItem,
                        start: `top ${topOffset + 180}px`,
                        end: `top ${topOffset + 40}px`,
                        scrub: true,
                        invalidateOnRefresh: true
                    }
                });
            }
        });
    }
}

export function initScrollStack() {
    const containers = document.querySelectorAll('[data-scroll-stack], .service-cards-container');
    const instances = [];
    containers.forEach((container) => {
        instances.push(new ScrollStack(container));
    });
    return instances;
}

export default ScrollStack;
