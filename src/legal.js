import './legal-modal.css';

/**
 * Privacy Policy / Terms of Service as one reusable modal.
 * Any link to /privacy or /terms (footer legal bars on every page) opens the document in a centred popup on the
 * current page — no navigation, no URL change. The text is read from the existing privacy.html / terms.html
 * (so the legal copy stays in one place); if that fetch fails, the link falls back to its normal navigation.
 */
const DOCS = {
    privacy: { url: '/privacy.html', title: 'Privacy Policy' },
    terms: { url: '/terms.html', title: 'Terms of Service' }
};
const cache = {};
let modal = null, bodyEl = null, titleEl = null, lastFocus = null;

const docOf = (a) => {
    if (a.matches('.privacy-trigger, #open-privacy-link')) return 'privacy'; // triggers the previous modal used
    if (a.matches('.terms-trigger, #open-terms-link')) return 'terms';
    const href = (a.getAttribute('href') || '').replace(/\.html$/, '').replace(/\/$/, '');
    if (href === '/privacy') return 'privacy';
    if (href === '/terms') return 'terms';
    return null;
};

const load = async (key) => {
    if (cache[key]) return cache[key];
    const res = await fetch(DOCS[key].url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('legal fetch failed');
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const wrap = doc.querySelector('main .container');
    if (!wrap) throw new Error('legal content missing');
    const label = wrap.querySelector('.tag-mono');
    if (label && label.parentElement) label.parentElement.remove(); // "Legal Documentation" label
    const h1 = wrap.querySelector('h1');
    if (h1) h1.remove(); // the modal header carries the title
    const frag = document.createElement('div');
    frag.className = 'legal-body';
    frag.innerHTML = wrap.innerHTML;
    cache[key] = frag.outerHTML;
    return cache[key];
};

const build = () => {
    modal = document.createElement('div');
    modal.className = 'legal-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('data-lenis-prevent', '');
    modal.innerHTML =
        '<div class="legal-modal__panel" role="dialog" aria-modal="true" aria-labelledby="legal-modal-title" tabindex="-1">' +
        '<div class="legal-modal__head"><h2 id="legal-modal-title" class="legal-modal__title"></h2>' +
        '<button type="button" class="legal-modal__x" aria-label="Close"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>' +
        '<div class="legal-modal__content" data-lenis-prevent></div>' +
        '<div class="legal-modal__foot"><button type="button" class="legal-modal__close">Close</button></div>' +
        '</div>';
    document.body.appendChild(modal);
    titleEl = modal.querySelector('.legal-modal__title');
    bodyEl = modal.querySelector('.legal-modal__content');
    // overlay click only; clicks inside the panel never close it
    modal.addEventListener('mousedown', (e) => { if (e.target === modal) close(); });
    modal.querySelector('.legal-modal__x').addEventListener('click', close);
    modal.querySelector('.legal-modal__close').addEventListener('click', close);
};

const lock = (on) => {
    const root = document.documentElement;
    if (on) {
        const sw = window.innerWidth - root.clientWidth;
        root.style.overflow = 'hidden';
        if (sw > 0) root.style.paddingRight = sw + 'px';
        if (window.lenis && window.lenis.stop) window.lenis.stop();
    } else {
        root.style.overflow = '';
        root.style.paddingRight = '';
        if (window.lenis && window.lenis.start) window.lenis.start();
    }
};

const onKey = (e) => {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab' && modal) { // keep focus inside the dialog
        const f = modal.querySelectorAll('button, a[href]');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
};

function open(key) {
    if (!modal) build();
    const wasOpen = modal.classList.contains('is-open');
    titleEl.textContent = DOCS[key].title;
    bodyEl.innerHTML = cache[key] || '';
    bodyEl.scrollTop = 0;
    if (!wasOpen) {
        lastFocus = document.activeElement;
        lock(true);
        document.addEventListener('keydown', onKey);
        modal.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(() => modal.classList.add('is-open'));
    }
    modal.querySelector('.legal-modal__panel').focus({ preventScroll: true });
}

function close() {
    if (!modal || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onKey);
    lock(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}

export function initLegalModals() {
    document.addEventListener('click', async (e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = e.target.closest && e.target.closest('a[href]');
        const key = a && docOf(a);
        if (!key) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        try {
            await load(key);
            open(key);
        } catch (err) {
            window.location.href = DOCS[key].url.replace(/\.html$/, ''); // fallback: normal navigation
        }
    }, true);
}
