import { useEffect, useState } from 'react';
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
const CAP = 0.711;                // Roboto cap-height / em
const TARGET_CAP = 98 / 1000;     // existing cap height as a fraction of the band width (138 * .711 / 1000)

const measureEm = (family) => {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = `${WEIGHT} 100px ${family}`;
    const natural = ctx.measureText(TEXT).width / 100;            // em, no letter spacing
    return natural + SPACING * (TEXT.length - 1);                  // spacing is applied between glyphs
};

function FooterWarp({ stage }) {
    const [dims, setDims] = useState(null);

    useEffect(() => {
        // the static wordmark used the site's headline font (Roboto)
        const family = getComputedStyle(document.documentElement).getPropertyValue('--font-headline').trim() || 'Roboto, sans-serif';
        const calc = () => {
            const W = stage.clientWidth;
            if (!W) return;
            const f = W / measureEm(family);                       // font size (px) that makes the text exactly W wide
            const k = (TARGET_CAP * W) / (CAP * f);                // vertical squeeze matching the old glyph shape
            const boxH = Math.max(1.25 * f, 2);                    // tall enough that WarpText never height-limits the text
            setDims({ boxW: W / 0.86, boxH, f, k, family });
        };
        calc();
        const ro = new ResizeObserver(calc);
        ro.observe(stage);
        if (document.fonts?.ready) document.fonts.ready.then(calc);
        return () => ro.disconnect();
    }, [stage]);

    if (!dims) return null;
    const { f, k, family } = dims;
    // Each character is its own <span>: dark by default, pure white while the cursor is over that one letter.
    return (
        <div className="footer-letters" aria-hidden="true" style={{ '--letters-k': k }}>
            <div
                className="footer-letters__text"
                style={{ fontFamily: family, fontSize: f, fontWeight: WEIGHT, letterSpacing: `${SPACING}em`, color: COLOR }}
            >
                {Array.from(TEXT).map((ch, i) =>
                    ch === ' ' ? (
                        <span key={i} className="footer-letters__space"> </span>
                    ) : (
                        <span key={i} className="footer-letter">{ch}</span>
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

