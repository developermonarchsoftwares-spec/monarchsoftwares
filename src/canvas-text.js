/**
 * Pure Vanilla CanvasText implementation
 * Animates undulating bezier wave lines composited atop letterforms
 * (Direct port of components/ui/canvas-text.tsx for vanilla Vite / HTML)
 */

export function initCanvasText(selector = '.canvas-text-mount', options = {}) {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  const defaultColors = options.colors || [
    'rgba(255, 255, 255, 1)',
    'rgba(255, 255, 255, 0.9)',
    'rgba(255, 255, 255, 0.8)',
    'rgba(255, 255, 255, 0.7)',
    'rgba(255, 255, 255, 0.6)',
    'rgba(255, 255, 255, 0.5)',
    'rgba(255, 255, 255, 0.4)',
    'rgba(255, 255, 255, 0.3)',
    'rgba(255, 255, 255, 0.2)',
    'rgba(255, 255, 255, 0.1)'
  ];

  const animationDuration = options.animationDuration || 12;
  const lineWidth = options.lineWidth || 1.8;
  const lineGap = options.lineGap || 5;
  const curveIntensity = options.curveIntensity || 50;
  const bgColor = options.bgColor || '#000000';

  elements.forEach((el) => {
    const text = el.getAttribute('data-text') || el.textContent.trim();
    if (!text) return;

    el.innerHTML = '';
    el.style.position = 'relative';
    el.style.display = 'inline-block';

    const hiddenSpan = document.createElement('span');
    hiddenSpan.textContent = text;
    hiddenSpan.style.visibility = 'hidden';
    hiddenSpan.style.display = 'inline-block';
    el.appendChild(hiddenSpan);

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', text);
    el.appendChild(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    let font = '';
    let animId = 0;
    let startTime = performance.now();

    const updateSize = () => {
      const rect = hiddenSpan.getBoundingClientRect();
      const style = window.getComputedStyle(hiddenSpan);
      width = Math.ceil(rect.width) || 400;
      height = Math.ceil(rect.height) || 120;
      font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

      dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(hiddenSpan);

    const animate = (currentTime) => {
      if (width === 0 || height === 0 || !font) {
        animId = requestAnimationFrame(animate);
        return;
      }

      const elapsed = (currentTime - startTime) / 1000;
      const phase = (elapsed / animationDuration) * Math.PI * 2;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      ctx.font = font;
      const metrics = ctx.measureText(text);
      const ascent = metrics.actualBoundingBoxAscent || 40;
      const descent = metrics.actualBoundingBoxDescent || 10;
      const baselineY = (height + ascent - descent) / 2;

      // 1. Render base text mask
      ctx.globalCompositeOperation = 'source-over';
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#000000';
      ctx.fillText(text, 0, baselineY);

      // 2. Fill background
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // 3. Draw animated wave bezier lines
      ctx.globalCompositeOperation = 'source-atop';
      const numLines = Math.floor(height / lineGap) + 12;

      for (let i = 0; i < numLines; i++) {
        const y = i * lineGap;
        const curve1 = Math.sin(phase + i * 0.1) * curveIntensity;
        const curve2 = Math.sin(phase + 0.5 + i * 0.08) * curveIntensity * 0.7;

        const colorIndex = i % defaultColors.length;
        ctx.strokeStyle = defaultColors[colorIndex];
        ctx.lineWidth = lineWidth;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(
          width * 0.33,
          y + curve1,
          width * 0.66,
          y + curve2,
          width,
          y
        );
        ctx.stroke();
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
  });
}
