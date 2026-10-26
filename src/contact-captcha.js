/**
 * Typing CAPTCHA for the contact form.
 *
 * A random 6-character code (no look-alike characters such as 0/O or 1/I/l) is drawn on a canvas with per-character rotation, offset,
 * wavy baseline and noise lines, so it is readable to a person but not plain text in the page. The user types it into the field below;
 * the comparison trims spaces and ignores letter case. A new code is made on load, on the refresh button, after a wrong attempt
 * and after a successful submission.
 *
 * IMPORTANT: this check runs in the browser, so it only deters simple bots. The site has no server of its own (inquiries go straight
 * to Web3Forms), so there is nowhere to verify a code on a server. For real protection use a server-verified challenge such as
 * Cloudflare Turnstile with a small serverless endpoint that checks the token with a secret key.
 */
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LENGTH = 6;

const randomInt = (n) => {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] % n;
};

export function initContactCaptcha(form) {
  const canvas = form && form.querySelector('#captcha-canvas');
  const input = form && form.querySelector('#captcha-input');
  const refreshBtn = form && form.querySelector('#captcha-refresh');
  const message = form && form.querySelector('#captcha-message');
  if (!canvas || !input || !refreshBtn || !message) return null;

  let code = '';

  const draw = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 160, h = canvas.clientHeight || 44;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    const c = canvas.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    // faint noise dots
    for (let i = 0; i < 60; i++) {
      c.fillStyle = `rgba(255,255,255,${(0.05 + Math.random() * 0.12).toFixed(2)})`;
      c.fillRect(Math.random() * w, Math.random() * h, 1.2, 1.2);
    }
    // the characters
    const step = Math.min(w / (LENGTH + 1), h * 0.86);          // tight group, centred (a wide field would otherwise spread the letters thin)
    const x0 = (w - step * (LENGTH - 1)) / 2;
    for (let i = 0; i < LENGTH; i++) {
      c.save();
      const x = x0 + step * i + (Math.random() - 0.5) * 4;
      const y = h / 2 + Math.sin(i * 1.4 + Math.random()) * 4;
      c.translate(x, y);
      c.rotate((Math.random() - 0.5) * 0.5);
      c.transform(1, (Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.3, 1, 0, 0);   // slight skew
      c.font = `${Math.random() < 0.5 ? 600 : 800} ${Math.round(h * 0.62)}px "Courier New", monospace`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = `rgba(255,255,255,${(0.82 + Math.random() * 0.18).toFixed(2)})`;
      c.fillText(code[i], 0, 0);
      c.restore();
    }
    // crossing lines
    c.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) {
      c.strokeStyle = `rgba(255,255,255,${(0.28 + Math.random() * 0.25).toFixed(2)})`;
      c.beginPath();
      c.moveTo(Math.random() * w * 0.25, Math.random() * h);
      c.bezierCurveTo(w * 0.35, Math.random() * h, w * 0.65, Math.random() * h, w * (0.75 + Math.random() * 0.25), Math.random() * h);
      c.stroke();
    }
  };

  const clearMessage = () => {
    message.textContent = '';
    input.removeAttribute('aria-invalid');
    input.classList.remove('is-invalid');
  };

  const refresh = ({ keepMessage = false } = {}) => {
    let next = '';
    for (let i = 0; i < LENGTH; i++) next += CHARS[randomInt(CHARS.length)];
    code = next;
    input.value = '';
    if (!keepMessage) clearMessage();
    draw();
  };

  const showError = (text) => {
    message.textContent = text;
    input.setAttribute('aria-invalid', 'true');
    input.classList.add('is-invalid');
  };

  /** true when the typed value matches the current code; otherwise shows the matching inline message and returns false */
  const verify = () => {
    const typed = input.value.trim();
    if (!typed) { showError('Please enter the CAPTCHA code.'); input.focus(); return false; }
    if (typed.toUpperCase() !== code) {
      refresh({ keepMessage: true });          // a wrong guess invalidates the code: brute-forcing one code is not possible
      showError('Incorrect CAPTCHA. Please try again.');
      input.focus();
      return false;
    }
    clearMessage();
    return true;
  };

  refreshBtn.addEventListener('click', () => { refresh(); input.focus(); });
  input.addEventListener('input', () => { if (message.textContent) clearMessage(); });
  let resizeTimer = 0;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(draw, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);

  refresh();
  return { verify, refresh };
}
