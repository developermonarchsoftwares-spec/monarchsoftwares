import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import WarpText from './warp/WarpText.jsx';

/**
 * Footer wordmark: the existing "MONARCH SOFTWARES" band, now drawn by the React Bits <WarpText />.
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
    const { boxW, boxH, f, k, family } = dims;
    return (
        <div
            style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: boxW,
                height: boxH,
                marginLeft: -boxW / 2,
                marginTop: -boxH / 2 + boxW * 0.0126, // optical centring: the cap letters sit slightly above the em-box middle
                '--warp-k': k // vertical stretch applied to the canvas only (see style.css), so WarpText still measures its true box
            }}
        >
            <WarpText
                text={TEXT}
                color={COLOR}
                warpStrength={0.08}
                warpScale={1.7}
                speed={0.55}
                pointerInfluence={0.42}
                pointerStrength={0.38}
                refraction={0.018}
                ripple
                fontSize={`${f * 3}px`}
                fontWeight={WEIGHT}
                fontFamily={family}
                letterSpacing={`${SPACING}em`}
                lineHeight={0.9}
                style={{ minHeight: boxH, height: boxH, overflow: 'visible' }}
            />
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

