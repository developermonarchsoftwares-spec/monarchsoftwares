import './option-wheel.css';

export class OptionWheel {
  constructor(elementOrSelector, props = {}) {
    this.options = {
      items: props.items || ['Service 1', 'Service 2', 'Service 3'],
      defaultSelected: props.defaultSelected !== undefined ? props.defaultSelected : 0,
      textColor: props.textColor || '#a6a6a6',
      activeColor: props.activeColor || '#ffffff',
      side: props.side || 'left',
      fontSize: props.fontSize || 1.5,
      spacing: props.spacing || 1.4,
      curve: props.curve !== undefined ? props.curve : 1,
      tilt: props.tilt !== undefined ? props.tilt : 6,
      blur: props.blur !== undefined ? props.blur : 2,
      fade: props.fade !== undefined ? props.fade : 0.25,
      smoothing: props.smoothing || 200,
      inset: props.inset !== undefined ? props.inset : 80,
      loop: props.loop || false,
      draggable: props.draggable !== undefined ? props.draggable : true,
      soundUrl: props.soundUrl || '',
      soundVolume: props.soundVolume || 0.5,
      onChange: props.onChange || null
    };

    this.container = typeof elementOrSelector === 'string'
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;

    if (!this.container) {
      this.container = document.createElement('div');
      document.body.appendChild(this.container);
    }

    this.selectedIndex = this.options.defaultSelected;
    this.isDragging = false;
    this.startY = 0;
    this.currentY = 0;
    this.dragOffset = 0;
    this.audio = null;

    if (this.options.soundUrl) {
      try {
        this.audio = new Audio(this.options.soundUrl);
        this.audio.volume = this.options.soundVolume;
      } catch (e) {
        console.warn('Audio playback not supported:', e);
      }
    }

    this.init();
  }

  init() {
    this.container.classList.add('option-wheel-container', `side-${this.options.side}`);
    if (this.options.side === 'left') {
      this.container.style.left = `${this.options.inset}px`;
    } else {
      this.container.style.right = `${this.options.inset}px`;
    }

    this.viewport = document.createElement('div');
    this.viewport.className = 'option-wheel-viewport';

    this.track = document.createElement('div');
    this.track.className = 'option-wheel-track';

    this.viewport.appendChild(this.track);
    this.container.appendChild(this.viewport);

    this.renderItems();
    this.bindEvents();
    this.updateWheel(false);
  }

  renderItems() {
    this.track.innerHTML = '';
    this.itemElements = [];

    const itemHeight = this.getItemHeight();

    this.options.items.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = 'option-wheel-item';
      if (index === this.selectedIndex) el.classList.add('active');

      const label = typeof item === 'object' ? item.label : item;

      el.innerHTML = `
        <span class="item-dot"></span>
        <span class="item-text">${label}</span>
      `;

      el.style.fontSize = `${this.options.fontSize}rem`;
      el.style.top = `${index * itemHeight}px`;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectIndex(index);
      });

      this.track.appendChild(el);
      this.itemElements.push(el);
    });
  }

  getItemHeight() {
    return this.options.fontSize * 24 * this.options.spacing;
  }

  updateWheel(animate = true) {
    const itemHeight = this.getItemHeight();
    const targetY = -this.selectedIndex * itemHeight;

    if (animate) {
      this.track.style.transition = `transform ${this.options.smoothing}ms cubic-bezier(0.16, 1, 0.3, 1)`;
    } else {
      this.track.style.transition = 'none';
    }

    const tiltX = this.options.side === 'left' ? this.options.tilt : -this.options.tilt;
    this.track.style.transform = `translateY(${targetY + this.dragOffset}px) rotateY(${tiltX}deg)`;

    const totalCount = this.options.items.length;

    this.itemElements.forEach((el, i) => {
      const diff = i - (this.selectedIndex - this.dragOffset / itemHeight);
      const absDiff = Math.abs(diff);

      // 3D curved transformation
      const rotateX = -diff * 18 * this.options.curve;
      const translateZ = -absDiff * 35 * this.options.curve;
      const scale = Math.max(0.75, 1 - absDiff * 0.08);

      // Fade and blur calculations based on props
      const opacity = Math.max(this.options.fade, 1 - absDiff * 0.28);
      const blurAmount = absDiff < 0.5 ? 0 : Math.min(6, (absDiff - 0.5) * this.options.blur);

      el.style.transform = `rotateX(${rotateX}deg) translateZ(${translateZ}px) scale(${scale})`;
      el.style.opacity = opacity.toFixed(2);
      el.style.filter = blurAmount > 0 ? `blur(${blurAmount.toFixed(1)}px)` : 'none';

      if (Math.round(i) === this.selectedIndex) {
        el.classList.add('active');
        el.style.color = this.options.activeColor;
      } else {
        el.classList.remove('active');
        el.style.color = this.options.textColor;
      }
    });
  }

  selectIndex(index, triggerCallback = true) {
    if (index < 0) {
      index = this.options.loop ? this.options.items.length - 1 : 0;
    } else if (index >= this.options.items.length) {
      index = this.options.loop ? 0 : this.options.items.length - 1;
    }

    if (this.selectedIndex !== index) {
      this.selectedIndex = index;
      this.playSound();
      this.updateWheel(true);

      if (triggerCallback && typeof this.options.onChange === 'function') {
        const selectedItem = this.options.items[this.selectedIndex];
        this.options.onChange(this.selectedIndex, selectedItem);
      }
    }
  }

  playSound() {
    if (this.audio) {
      try {
        this.audio.currentTime = 0;
        this.audio.play().catch(() => {});
      } catch (e) {}
    }
  }

  bindEvents() {
    // Wheel scroll event
    this.viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        this.selectIndex(this.selectedIndex + 1);
      } else if (e.deltaY < 0) {
        this.selectIndex(this.selectedIndex - 1);
      }
    }, { passive: false });

    // Drag / Touch events
    if (this.options.draggable) {
      const onStart = (y) => {
        this.isDragging = true;
        this.startY = y;
        this.dragOffset = 0;
        this.viewport.style.cursor = 'grabbing';
      };

      const onMove = (y) => {
        if (!this.isDragging) return;
        const delta = y - this.startY;
        this.dragOffset = delta;
        this.updateWheel(false);
      };

      const onEnd = () => {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.viewport.style.cursor = 'grab';

        const itemHeight = this.getItemHeight();
        const steps = Math.round(-this.dragOffset / itemHeight);
        this.dragOffset = 0;

        if (steps !== 0) {
          this.selectIndex(this.selectedIndex + steps);
        } else {
          this.updateWheel(true);
        }
      };

      this.viewport.addEventListener('mousedown', (e) => onStart(e.clientY));
      window.addEventListener('mousemove', (e) => onMove(e.clientY));
      window.addEventListener('mouseup', () => onEnd());

      this.viewport.addEventListener('touchstart', (e) => onStart(e.touches[0].clientY), { passive: true });
      window.addEventListener('touchmove', (e) => onMove(e.touches[0].clientY), { passive: true });
      window.addEventListener('touchend', () => onEnd());
    }
  }

  setVisible(visible) {
    if (visible) {
      this.container.style.opacity = '1';
      this.container.style.pointerEvents = 'auto';
      this.container.style.transform = 'translateY(-50%) scale(1)';
    } else {
      this.container.style.opacity = '0';
      this.container.style.pointerEvents = 'none';
      this.container.style.transform = 'translateY(-50%) scale(0.95)';
    }
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

// Auto-initialization function for HTML data-attributes
export function initOptionWheels() {
  const elements = document.querySelectorAll('[data-option-wheel]');
  const instances = [];

  elements.forEach((el) => {
    try {
      const itemsRaw = el.getAttribute('data-items');
      const items = itemsRaw ? JSON.parse(itemsRaw) : null;
      const defaultSelected = parseInt(el.getAttribute('data-default-selected') || '0', 10);
      const side = el.getAttribute('data-side') || 'left';
      const inset = parseInt(el.getAttribute('data-inset') || '80', 10);

      const wheel = new OptionWheel(el, {
        items: items || [
          'Full-Stack Web',
          'Native Mobile',
          'UI/UX Design',
          'AI & Intelligence',
          'Cloud & Infra',
          'Enterprise Systems',
          'SEO & Organic',
          'PPC & Paid Ads',
          'Social Ecosystems',
          'Brand Production',
          'Executive Search',
          'Payroll & Statutory',
          'Strategic HR',
          'Campus Hiring'
        ],
        defaultSelected,
        side,
        inset,
        onChange: (index, item) => {
          console.log('Selected option:', index, item);
        }
      });
      instances.push(wheel);
    } catch (err) {
      console.error('Error initializing OptionWheel:', err);
    }
  });

  return instances;
}
