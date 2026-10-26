import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Footer wordmark: the existing "MONARCH SOFTWARES" band as real text, one <span> per letter (per-letter hover, see style.css).
 *
 * The static band was an SVG whose glyphs were squeezed horizontally to fill the footer width
 * (text width = 100% of the band, cap height = 9.8% of the width). WarpText draws text at its natural
 * proportions and never uses more than 86% of its box, so the box is widened by 1/0.86 and flattened
 * vertically (a scaleY on the canvas only) to reproduce exactly the same size, shape and position as the static text.
 */
const TEXT = 'MONARCH SOFTWARES';
const COLOR = '#111114';          // the existing fill
const WEIGHT = 900;               // the existing weight
const SPACING = -0.04;            // em
// the tight tracking made a few letter pairs touch (the F's arm met the T's bar, E and S crowded); these pairs get a little extra room (em)
const PAIR_EXTRA = { FT: 0.08, TW: 0.04, ES: 0.07 };
const extraBefore = (i) => PAIR_EXTRA[TEXT[i - 1] + TEXT[i]] || 0;
const CAP = 0.711;                // Roboto cap-height / em
const TARGET_CAP = 98 / 1000;     // existing cap height as a fraction of the band width (138 * .711 / 1000)

const measureEm = (family) => {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = `${WEIGHT} 100px ${family}`;
    const natural = ctx.measureText(TEXT).width / 100;            // em, no letter spacing
    let extra = 0; for (let i = 1; i < TEXT.length; i++) extra += extraBefore(i);
    return natural + SPACING * (TEXT.length - 1) + extra;                  // spacing is applied between glyphs
};

function FooterWarp({ stage }) {
    const [dims, setDims] = useState(null);
    const [fit, setFit] = useState(1);       // measured correction: the rendered text (separate letter spans, no kerning) is a hair wider than the canvas estimate
    const textRef = useRef(null);

    useEffect(() => {
        // the static wordmark used the site's headline font (Roboto)
        const family = getComputedStyle(document.documentElement).getPropertyValue('--font-headline').trim() || 'Roboto, sans-serif';
        const calc = () => {
            const W = stage.clientWidth;
            if (!W) return;
            const f = W / measureEm(family);                       // font size (px) that makes the text exactly W wide
            const k = (TARGET_CAP * W) / (CAP * f);                // vertical squeeze matching the old glyph shape
            const boxH = Math.max(1.25 * f, 2);                    // tall enough that WarpText never height-limits the text
            setFit(1);
            setDims({ boxW: W / 0.86, boxH, f, k, family });
        };
        calc();
        const ro = new ResizeObserver(calc);
        ro.observe(stage);
        if (document.fonts?.ready) document.fonts.ready.then(calc);
        return () => ro.disconnect();
    }, [stage]);

    // After each (re)size, measure the text as actually rendered - from the left edge of the first letter's ink to the right edge of the last
    // letter's ink - and scale the font so all of it fits inside the band. Without this the final "S" ran a few pixels past the clipped band.
    useLayoutEffect(() => {
        const el = textRef.current;
        if (!dims || !el) return;
        const spans = el.querySelectorAll('.footer-letter');
        if (spans.length < 2) return;
        const cs = getComputedStyle(el);
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const mFirst = ctx.measureText(spans[0].textContent), mLast = ctx.measureText(spans[spans.length - 1].textContent);
        const r0 = spans[0].getBoundingClientRect(), r1 = spans[spans.length - 1].getBoundingClientRect();
        const boxW = r1.right - r0.left;                                       // the text box, which is what gets centred in the band
        const overR = Math.max(0, r1.left + mLast.actualBoundingBoxRight - r1.right);   // how far the last letter's ink pokes out past its box
        const overL = Math.max(0, mFirst.actualBoundingBoxLeft);                        // same on the left (usually none)
        const need = boxW + 2 * Math.max(overR, overL);                        // centred, so the larger overhang is needed on both sides
        const W = stage.clientWidth;
        if (need > 0 && W > 0) setFit(Math.min(1, (W * 0.995) / need));        // only ever shrinks: never makes the watermark larger than before
    }, [dims, stage]);

    if (!dims) return null;
    const { k, family } = dims;
    const f = dims.f * fit;
    // Each character is its own <span>: dark by default, pure white while the cursor is over that one letter.
    return (
        <div className="footer-letters" aria-hidden="true" style={{ '--letters-k': k }}>
            <div
                ref={textRef}
                className="footer-letters__text"
                style={{ fontFamily: family, fontSize: f, fontWeight: WEIGHT, letterSpacing: `${SPACING}em`, color: COLOR }}
            >
                {Array.from(TEXT).map((ch, i) =>
                    ch === ' ' ? (
                        <span key={i} className="footer-letters__space"> </span>
                    ) : (
                        <span key={i} className="footer-letter" style={extraBefore(i) ? { marginLeft: `${extraBefore(i)}em` } : undefined}>{ch}</span>
                    )
                )}
            </div>
        </div>
    );
}

export function initFooterWarp() {
    const stage = document.querySelector('.footer-wordmark__stage');
    if (stage && !stage.dataset.warp) {
        stage.dataset.warp = '1';
        createRoot(stage).render(<FooterWarp stage={stage} />);
    }
}

if (typeof document !== 'undefined') {
    initFooterWarp();
}

