import './open-positions-3d.css';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Open Positions - one continuous, scroll-scrubbed 3D scene (black & white).
 *
 *  empty space -> rock falls -> impact / break -> particles build the Monarch logo -> orbit rings draw
 *  -> three planets appear -> camera travels to planet 01 / 02 / 03 (job panels) -> settled overview.
 *
 * ONE GSAP master timeline (scrubbed by the pinned section's scroll progress) drives a plain `state`
 * object; render() is a pure function of that state, so scrolling back up reverses everything.
 * Nothing autoplays. The heading and the three job cards are the existing DOM.
 */
export function initOpenPositions() {
    const track = document.getElementById('positions');
    const stage = track && track.querySelector('.op-stage');
    const canvas = stage && stage.querySelector('.op-canvas');
    const heading = stage && stage.querySelector('.op-heading');
    const cards = stage ? Array.from(stage.querySelectorAll('.op-cards .job-card')) : [];
    if (!track || !canvas || cards.length !== 3) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmall = () => window.innerWidth < 760;
    const small = isSmall();

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, powerPreference: 'high-performance' });
    } catch (e) {
        track.classList.add('op-static'); // no WebGL: plain stacked layout (content stays reachable)
        return;
    }
    if (reduce) { track.classList.add('op-static'); renderer.dispose(); return; }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.75));
    renderer.setClearColor(0x000000, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 120);

    // ---------- tiny seeded RNG (deterministic scene) ----------
    let seed = 7;
    const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const rr = (a, b) => a + (b - a) * rnd();
    const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
    const seg = (x, a, b) => Math.min(1, Math.max(0, (x - a) / (b - a)));

    // ---------- lights ----------
    scene.add(new THREE.AmbientLight(0xffffff, 0.14));
    const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(-7, 6, 8); scene.add(key);
    const rim = new THREE.DirectionalLight(0xe8e8e8, 1.5); rim.position.set(7, 2, -7); scene.add(rim);
    const flashLight = new THREE.PointLight(0xffffff, 0, 30, 1.6); scene.add(flashLight);

    // ---------- shared soft-point shader ----------
    const px = renderer.getPixelRatio();
    const pointVS = `
        attribute vec3 aDir; attribute float aSpeed; attribute vec3 aTarget; attribute float aRand; attribute float aSize;
        uniform float uBurst, uForm, uFade, uPx;
        varying float vA;
        void main(){
            float b = 1.0 - pow(1.0 - clamp(uBurst, 0.0, 1.0), 3.0);
            vec3 burstPos = aDir * aSpeed * b * 5.5; burstPos.y -= 0.35 * b * b * aSpeed;
            float f = clamp((uForm - aRand * 0.4) / 0.6, 0.0, 1.0); f = f * f * (3.0 - 2.0 * f);
            vec3 swirl = cross(aDir, vec3(0.0, 0.0, 1.0)) * sin(f * 3.14159) * 0.9 * (1.0 - 0.3 * f);
            vec3 p = mix(burstPos, aTarget, f) + swirl;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = aSize * uPx * (1.0 - 0.45 * f) * (38.0 / -mv.z);
            vA = (1.0 - uFade) * step(0.0005, uBurst) * (0.55 + 0.45 * aRand);
        }`;
    const pointFS = `varying float vA; void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); if(d > 0.5) discard; gl_FragColor = vec4(vec3(1.0), vA * smoothstep(0.5, 0.0, d)); }`;

    // ---------- logo (sampled from the real Monarch mark) ----------
    const logoGroup = new THREE.Group(); scene.add(logoGroup);
    const dust = { mat: null, pts: null };
    const frags = [];
    const outlineMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const fillMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const glowMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const LOGO_W = 4.2;
    const buildLogo = (img) => {
        const S = 512, c = document.createElement('canvas'); c.width = c.height = S;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.fillStyle = '#000'; x.fillRect(0, 0, S, S);
        x.drawImage(img, 350, 305, 325, 325, 0, 0, S, S);
        const data = x.getImageData(0, 0, S, S).data;
        const on = (i, j) => i >= 0 && j >= 0 && i < S && j < S && data[(j * S + i) * 4] > 128;
        // edge map -> outline texture + sample points
        const oc = document.createElement('canvas'); oc.width = oc.height = S; const ox = oc.getContext('2d'); ox.fillStyle = '#000'; ox.fillRect(0, 0, S, S);
        const edge = []; ox.fillStyle = '#fff';
        for (let j = 1; j < S - 1; j += 1) for (let i = 1; i < S - 1; i += 1) {
            if (on(i, j) && (!on(i - 2, j) || !on(i + 2, j) || !on(i, j - 2) || !on(i, j + 2))) { ox.fillRect(i - 1, j - 1, 2, 2); if ((i + j) % 3 === 0) edge.push(i, j); }
        }
        const gc = document.createElement('canvas'); gc.width = gc.height = S; const gx = gc.getContext('2d');
        gx.filter = 'blur(14px)'; gx.drawImage(c, 0, 0);
        const tex = (cv) => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; };
        fillMat.map = tex(c); outlineMat.map = tex(oc); glowMat.map = tex(gc);
        [fillMat, outlineMat, glowMat].forEach((m) => { m.needsUpdate = true; });
        const plane = new THREE.PlaneGeometry(LOGO_W, LOGO_W);
        const glow = new THREE.Mesh(plane, glowMat); glow.scale.setScalar(1.12); glow.position.z = -0.02;
        logoGroup.add(glow, new THREE.Mesh(plane, outlineMat), new THREE.Mesh(plane, fillMat));
        // dust particles converge onto the outline
        const n = small ? 650 : 1300, pos = new Float32Array(n * 3), dir = new Float32Array(n * 3), spd = new Float32Array(n), tgt = new Float32Array(n * 3), rand = new Float32Array(n), size = new Float32Array(n);
        const m = edge.length / 2;
        for (let k = 0; k < n; k++) {
            const t = Math.floor(rnd() * m) * 2;
            tgt[k * 3] = (edge[t] / S - 0.5) * LOGO_W; tgt[k * 3 + 1] = -(edge[t + 1] / S - 0.5) * LOGO_W; tgt[k * 3 + 2] = rr(-0.08, 0.08);
            const th = rr(0, Math.PI * 2), ph = Math.acos(rr(-1, 1));
            dir[k * 3] = Math.sin(ph) * Math.cos(th); dir[k * 3 + 1] = Math.sin(ph) * Math.sin(th) * 0.8; dir[k * 3 + 2] = Math.cos(ph) * 0.9;
            spd[k] = rr(0.35, 1.4) * (rnd() < 0.12 ? 1.6 : 1); rand[k] = rnd(); size[k] = rr(0.7, 2.1);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aDir', new THREE.BufferAttribute(dir, 3)); g.setAttribute('aSpeed', new THREE.BufferAttribute(spd, 1));
        g.setAttribute('aTarget', new THREE.BufferAttribute(tgt, 3)); g.setAttribute('aRand', new THREE.BufferAttribute(rand, 1)); g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
        g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);
        dust.mat = new THREE.ShaderMaterial({ vertexShader: pointVS, fragmentShader: pointFS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uBurst: { value: 0 }, uForm: { value: 0 }, uFade: { value: 0 }, uPx: { value: px } } });
        dust.pts = new THREE.Points(g, dust.mat); dust.pts.frustumCulled = false; scene.add(dust.pts);
        // stone fragments: burst outward, then travel onto the outline and shrink away. Each one has its own natural shape,
        // proportions and tone (charcoal / graphite / grey), built by the same rock generator as the falling stone
        const NV = small ? 5 : 8, fgs = Array.from({ length: NV }, (_, i) => genRock(i + 1, small ? 3 : 4, [0.75 + 0.55 * hash3(i, 7, 1), 0.65 + 0.5 * hash3(i, 7, 2), 0.7 + 0.45 * hash3(i, 7, 3)], 2 + (i % 4), false));
        const fmats = [makeRockMat(0x6e6e6e, 0.97), makeRockMat(0x939393, 0.95), makeRockMat(0xb4b4b4, 0.93)];
        for (let k = 0; k < (small ? 16 : 30); k++) {
            const mesh = new THREE.Mesh(fgs[(k * 5) % NV], fmats[(k * 7) % 3]); mesh.visible = false;
            const th = rr(0, Math.PI * 2), ph = Math.acos(rr(-1, 1)), t = Math.floor(rnd() * m) * 2;
            frags.push({ mesh, s: rr(0.07, 0.24), d: new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.sin(ph) * Math.sin(th) * 0.8, Math.cos(ph) * 0.9), v: rr(0.5, 1.5), spin: new THREE.Vector3(rr(-5, 5), rr(-5, 5), rr(-5, 5)), r: rnd(), tgt: new THREE.Vector3((edge[t] / S - 0.5) * LOGO_W, -(edge[t + 1] / S - 0.5) * LOGO_W, 0) });
            frags[frags.length - 1].sc = new THREE.Vector3(0.8 + 0.5 * hash3(k, 9, 1), 0.75 + 0.5 * hash3(k, 9, 2), 0.8 + 0.45 * hash3(k, 9, 3));
            scene.add(mesh);
        }
        dirty = true;
    };

    // ---------- rock + trail + flash ----------
    // boulder: a convex block cut by random planes (angular facets), roughened with fractal noise and
    // coloured like weathered granite (grey body, tan stains, dark patches, pale veins)
    const hash3 = (x, y, z) => { const t = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return t - Math.floor(t); };
    const vnoise = (x, y, z) => {
        const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
        const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf), L = (a, b, t) => a + (b - a) * t;
        return L(L(L(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), u), L(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), u), v),
            L(L(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), u), L(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), u), v), w);
    };
    const fbm = (x, y, z, o) => { let a = 0, f = 1, amp = 0.5; for (let i = 0; i < o; i++) { a += amp * vnoise(x * f, y * f, z * f); f *= 2.03; amp *= 0.5; } return a; };
    // asteroid: a rounded, lumpy potato with large shallow craters and fine fractal roughness, smooth-shaded
    // (merged vertices) so the photographic relief below carries the detail
    const craters = Array.from({ length: 22 }, () => { const th = rr(0, Math.PI * 2), ph = Math.acos(rr(-1, 1)); return { d: new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)), r: rr(0.14, 0.42), k: rr(0.035, 0.09) }; });
    // Natural rock generator: every call produces its own irregular body (fractal lumps, ridges, pits, soft chipped planes),
    // smooth-shaded from merged vertices, with baked ambient occlusion in the vertex colours (crevices and pits darker).
    const smin = (x, y, k) => { const h = Math.max(k - Math.abs(x - y), 0) / k; return Math.min(x, y) - h * h * k * 0.25; };
    const genRock = (sh, detail, el, chips, useCraters) => {
        let g = new THREE.IcosahedronGeometry(1, detail); g.deleteAttribute('normal'); g.deleteAttribute('uv'); g = mergeVertices(g, 1e-4);
        const p = g.attributes.position, v = new THREE.Vector3(), col = new Float32Array(p.count * 3), o = sh * 13.7;
        const planes = [];
        for (let i = 0; i < chips; i++) { const th = hash3(sh, i, 1) * 6.2832, y = hash3(sh, i, 2) * 2 - 1, q = Math.sqrt(1 - y * y); planes.push({ n: new THREE.Vector3(q * Math.cos(th), y, q * Math.sin(th)), d: 0.7 + hash3(sh, i, 3) * 0.24 }); }
        for (let i = 0; i < p.count; i++) {
            v.fromBufferAttribute(p, i).normalize();
            const big = fbm(v.x * 1.3 + 4 + o, v.y * 1.3 + 4 + o, v.z * 1.3 + 4 + o, 3) - 0.5, mid = fbm(v.x * 3.4 + 17 + o, v.y * 3.4 + 17 + o, v.z * 3.4 + 17 + o, 3) - 0.5, fine = fbm(v.x * 9 + 29 + o, v.y * 9 + 29 + o, v.z * 9 + 29 + o, 3) - 0.5;
            let cr = 0;
            if (useCraters) for (const c of craters) { const d = v.distanceTo(c.d) / c.r; if (d < 1.4) cr += d < 1 ? -c.k * (1 - d * d) : c.k * 0.3 * Math.max(0, 1 - Math.abs(d - 1.1) * 5); }
            const f2 = fbm(v.x * 20 + 7 + o, v.y * 20 + 7 + o, v.z * 20 + 7 + o, 3) - 0.5, rg = 1 - Math.abs(fbm(v.x * 6 + 51 + o, v.y * 6 + 51 + o, v.z * 6 + 51 + o, 3) * 2 - 1);
            const pit = Math.pow(Math.max(0, fbm(v.x * 14 + 80 + o, v.y * 14 + 80 + o, v.z * 14 + 80 + o, 2) - 0.62) * 4, 2);   // tiny pits
            let r = 1 + big * (useCraters ? 0.55 : 0.62) + mid * 0.16 + fine * 0.05 + f2 * 0.04 - Math.pow(rg, 5) * 0.05 - pit * 0.03 + cr;
            for (const pl of planes) { const dp = v.dot(pl.n); if (dp > 0.05) r = smin(r, pl.d / dp, 0.16); }   // soft chipped faces, never razor facets
            p.setXYZ(i, v.x * r * el[0], v.y * r * el[1], v.z * r * el[2]);
            const ao = Math.min(1, Math.max(0.32, 0.74 + (big + mid) * 1.3 + cr * 3.0 - Math.pow(rg, 5) * 0.6 - pit * 0.5 + f2 * 0.3));
            col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = ao;
        }
        g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
    };
    const rockGeo = genRock(0, small ? 5 : 6, [1.08, 0.9, 1.0], 0, true);
    // surface painted from a photograph of a real asteroid: triplanar-projected colour AND a matching normal map, so the
    // lighting rakes across crisp cracks, pits and ridges with per-pixel detail (no seams while it tumbles, no blur)
    const loadRockTex = (url, srgb) => { const t = new THREE.TextureLoader().load(url, () => { dirty = true; }); t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
    const rockTex = loadRockTex('/rock-tex.webp', true), rockNrm = loadRockTex('/rock-nrm.webp', false);
    const makeRockMat = (tint, rough) => {
    const mat = new THREE.MeshStandardMaterial({ color: tint, roughness: rough, metalness: 0.0, flatShading: false, vertexColors: true });
    mat.onBeforeCompile = (sh) => {
        sh.uniforms.uRock = { value: rockTex }; sh.uniforms.uRockN = { value: rockNrm };
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vOP; varying vec3 vON; varying vec3 vAx; varying vec3 vAy; varying vec3 vAz;')
            .replace('#include <begin_vertex>', '#include <begin_vertex>\nvOP = position; vON = normal; vAx = normalize(normalMatrix * vec3(1.0, 0.0, 0.0)); vAy = normalize(normalMatrix * vec3(0.0, 1.0, 0.0)); vAz = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));');
        sh.fragmentShader = sh.fragmentShader
            .replace('#include <common>', '#include <common>\nvarying vec3 vOP; varying vec3 vON; varying vec3 vAx; varying vec3 vAy; varying vec3 vAz; uniform sampler2D uRock; uniform sampler2D uRockN;')
            .replace('#include <map_fragment>', `
                vec3 tw = pow(abs(normalize(vON)), vec3(5.0)); tw /= (tw.x + tw.y + tw.z);
                vec2 uvx = vOP.zy * 0.42 + 0.13, uvy = vOP.xz * 0.42 + 0.37, uvz = vOP.xy * 0.42 + 0.61;
                vec3 tc = texture2D(uRock, uvx).rgb * tw.x + texture2D(uRock, uvy).rgb * tw.y + texture2D(uRock, uvz).rgb * tw.z;
                vec3 d1 = texture2D(uRock, uvx * 3.1 + 0.3).rgb * tw.x + texture2D(uRock, uvy * 3.1 + 0.5).rgb * tw.y + texture2D(uRock, uvz * 3.1 + 0.7).rgb * tw.z;
                float dl = dot(d1, vec3(0.3, 0.59, 0.11));
                diffuseColor.rgb *= pow(tc, vec3(1.25)) * 2.5 * (0.55 + 0.95 * dl);`)
            .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
                {
                    vec2 nx = (texture2D(uRockN, uvx).xy + 0.6 * texture2D(uRockN, uvx * 3.1 + 0.3).xy + 0.35 * texture2D(uRockN, uvx * 9.7 + 0.1).xy) / 1.95 * 2.0 - 1.0;
                    vec2 ny = (texture2D(uRockN, uvy).xy + 0.6 * texture2D(uRockN, uvy * 3.1 + 0.5).xy + 0.35 * texture2D(uRockN, uvy * 9.7 + 0.2).xy) / 1.95 * 2.0 - 1.0;
                    vec2 nz = (texture2D(uRockN, uvz).xy + 0.6 * texture2D(uRockN, uvz * 3.1 + 0.7).xy + 0.35 * texture2D(uRockN, uvz * 9.7 + 0.3).xy) / 1.95 * 2.0 - 1.0;
                    vec3 o = vec3(0.0, nx.y, nx.x) * tw.x + vec3(ny.x, 0.0, ny.y) * tw.y + vec3(nz.x, nz.y, 0.0) * tw.z;
                    normal = normalize(normal + (o.x * vAx + o.y * vAy + o.z * vAz) * 1.6);
                }`);
    };
    return mat; };
    const rockMat = makeRockMat(0xffffff, 0.95);
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.visible = false; scene.add(rock);
    const TRAIL = small ? 70 : 150;
    const trail = (() => {
        const pos = new Float32Array(TRAIL * 3), a = new Float32Array(TRAIL), sz = new Float32Array(TRAIL), jit = [];
        for (let i = 0; i < TRAIL; i++) { jit.push([rr(-1, 1), rr(-1, 1), rnd()]); sz[i] = rr(0.8, 2.2); }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aAlpha', new THREE.BufferAttribute(a, 1)); g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
        const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uPx: { value: px } },
            vertexShader: 'attribute float aAlpha; attribute float aSize; uniform float uPx; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = aSize * uPx * (34.0 / -mv.z); vA = aAlpha; }',
            fragmentShader: pointFS });
        const pts = new THREE.Points(g, m); pts.frustumCulled = false; scene.add(pts); return { pts, jit, pos, a };
    })();
    const flashTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
    const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(flash);

    // ---------- orbit rings ----------
    const ringRadii = [3.4, 5.2, 7.2, 9.4], RING_SEG = 256;
    const rings = ringRadii.map((r, i) => {
        const pts = []; for (let k = 0; k < RING_SEG; k++) { const a = (k / RING_SEG) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
        const g = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.38 - i * 0.05, depthWrite: false }));
        line.geometry.setDrawRange(0, 0); scene.add(line); return line;
    });

    // ---------- planets ----------
    const planetTexture = (s0) => {
        seed = s0; const W = 512, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
        const id = x.createImageData(W, H), g = []; for (let i = 0; i < 24 * 12; i++) g.push(rnd());
        const vn = (u, v) => { const gx = Math.floor(u), gy = Math.floor(v), fx = u - gx, fy = v - gy, at = (a, b) => g[((b % 12) + 12) % 12 * 24 + ((a % 24) + 24) % 24]; const s = (t) => t * t * (3 - 2 * t); return at(gx, gy) * (1 - s(fx)) * (1 - s(fy)) + at(gx + 1, gy) * s(fx) * (1 - s(fy)) + at(gx, gy + 1) * (1 - s(fx)) * s(fy) + at(gx + 1, gy + 1) * s(fx) * s(fy); };
        for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
            const n = vn(i / 22, j / 22) * 0.55 + vn(i / 9, j / 9) * 0.3 + vn(i / 3.5, j / 3.5) * 0.15; const v = 70 + n * 120;
            const o = (j * W + i) * 4; id.data[o] = id.data[o + 1] = id.data[o + 2] = v; id.data[o + 3] = 255;
        }
        x.putImageData(id, 0, 0);
        for (let k = 0; k < 90; k++) { const cx = rnd() * W, cy = rnd() * H, r = rr(3, 22); const gr = x.createRadialGradient(cx, cy, r * 0.2, cx, cy, r); gr.addColorStop(0, 'rgba(0,0,0,.45)'); gr.addColorStop(0.8, 'rgba(0,0,0,.2)'); gr.addColorStop(0.92, 'rgba(255,255,255,.28)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); }
        const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return t;
    };
    const PLANETS = [
        { pos: new THREE.Vector3(-5.12, 0, 0.9), r: 1.1, tilt: 0.45, tex: 11 },
        { pos: new THREE.Vector3(5.9, 0, -4.13), r: 0.85, tilt: -0.35, tex: 23 },
        { pos: new THREE.Vector3(3.04, 0, 6.52), r: 1.0, tilt: 0.25, tex: 37 }
    ].map((d) => {
        const grp = new THREE.Group(); grp.position.copy(d.pos); grp.scale.setScalar(0.0001);
        const mat = new THREE.MeshStandardMaterial({ map: planetTexture(d.tex), roughness: 0.92, metalness: 0.02, color: 0xffffff });
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(d.r, small ? 40 : 72, small ? 28 : 48), mat);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
        const ring = new THREE.Mesh(new THREE.RingGeometry(d.r * 1.3, d.r * 1.325, 160), ringMat);
        ring.rotation.set(Math.PI / 2 - 0.22, 0, d.tilt);
        grp.add(mesh, ring); grp.visible = false; scene.add(grp);
        return { ...d, grp, mesh, mat, ringMat, ring };
    });

    // ---------- camera keyframes: wide, planet 1, 2, 3, wide ----------
    const WIDE = { p: new THREE.Vector3(0, 7.0, 19.5), t: new THREE.Vector3(0, 0.4, 0) };
    const focusKF = (pl, off, look) => ({ p: pl.pos.clone().add(off), t: pl.pos.clone().add(look) });
    const KF = [
        WIDE,
        focusKF(PLANETS[0], new THREE.Vector3(2.4, 0.9, 5.6), new THREE.Vector3(1.9, 0, 0)),
        focusKF(PLANETS[1], new THREE.Vector3(-1.2, 1.0, 5.4), new THREE.Vector3(1.9, 0, 0)),
        focusKF(PLANETS[2], new THREE.Vector3(0.0, 1.0, 5.6), new THREE.Vector3(1.9, 0, 0)),
        WIDE
    ];

    // ---------- post: depth of field (desktop only) ----------
    let composer = null, bokeh = null;
    if (!small) {
        composer = new EffectComposer(renderer);
        composer.renderTarget1.samples = 4; composer.renderTarget2.samples = 4;   // antialiased edges
        composer.addPass(new RenderPass(scene, camera));
        bokeh = new BokehPass(scene, camera, { focus: 20, aperture: 0.00003, maxblur: 0.012 });
        composer.addPass(bokeh); composer.addPass(new OutputPass());
    }

    // ---------- the single state driven by the master timeline ----------
    const S = { rock: 0, flash: 0, burst: 0, form: 0, outline: 0, fill: 0, fade: 0, rings: 0, p: [0, 0, 0], cam: 0, w: [0, 0, 0], fin: 0 };
    let dirty = true, visible = true;
    const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), look = new THREE.Vector3();

    const placePanels = () => {
        const W = stage.clientWidth, H = stage.clientHeight, mobile = isSmall();
        const hb = heading.getBoundingClientRect(), minY = hb.bottom - stage.getBoundingClientRect().top + 16;
        cards.forEach((card, i) => {
            const vis = Math.max(S.w[i], S.fin);
            const pl = PLANETS[i];
            card.style.opacity = String(vis);
            card.style.pointerEvents = vis > 0.6 ? 'auto' : 'none';
            const cw = card.offsetWidth || 420, ch = card.offsetHeight || 150;
            const sc = 1 - 0.45 * S.fin;
            let x, y;
            if (mobile) {
                x = (W - cw) / 2;
                const f = smooth(S.fin), hs = cards.map((c) => (c.offsetHeight || 150) * sc);
                const focusY = H - ch - 28;
                let below = 0; for (let k = i + 1; k < 3; k++) below += hs[k] + 8;
                const stackY = H - 28 - hs[i] - below;
                y = focusY + (stackY - focusY) * f;
            } else {
                tmp.copy(pl.pos).project(camera);
                const sx = (tmp.x * 0.5 + 0.5) * W, sy = (-tmp.y * 0.5 + 0.5) * H;
                tmp2.copy(pl.pos).add(new THREE.Vector3(pl.r, 0, 0)).project(camera);
                const rPx = Math.abs((tmp2.x * 0.5 + 0.5) * W - sx);
                x = sx + rPx * 1.35 + 18; y = sy - ch * 0.4;
                x = Math.min(x, W - cw * sc - 20); x = Math.max(x, 16);
                y = Math.min(Math.max(y, minY), H - ch * sc - 24);
                // final scene: each opening sits beside its own planet (left planet: below; right planets: below / to its left)
                const f = smooth(S.fin), fw = cw * sc, fh = ch * sc;
                let fx, fy;
                // like the focus shot: card beside its planet, vertically centred, on the side away from the logo (flip if no room)
                const gap = rPx * 1.15 + 12, outward = sx < W / 2 ? -1 : 1;
                const right = sx + gap, left = sx - gap - fw;
                const fits = (v) => v >= 16 && v <= W - fw - 16;
                const side = outward > 0 ? right : left;
                if (fits(side)) { fx = side; fy = sy - fh / 2; }
                else { fx = sx - fw / 2; fy = sy + rPx + 12; } // narrow screens: tuck it under the planet instead of over the logo
                fx = Math.min(Math.max(fx, 16), W - fw - 16); fy = Math.min(Math.max(fy, minY), H - fh - 20);
                x += (fx - x) * f; y += (fy - y) * f;
            }
            card.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${sc})`;
        });
    };

    const render = () => {
        // rock
        const rt = S.rock, impact = rt >= 0.999;
        rock.visible = rt > 0.001 && !impact;
        if (rock.visible) {
            const f = Math.pow(rt, 1.7);
            rock.position.set(0.6 * (1 - f), 10.5 * (1 - f), -3.0 * (1 - f)); rock.scale.set(1.25, 1.25 * (1 + 0.18 * rt), 1.25);
            rock.rotation.set(rt * 5.2, rt * 3.6, rt * 1.4);
        }
        // trail behind the rock (pure function of rock progress)
        const ta = trail.a, tp = trail.pos;
        for (let i = 0; i < TRAIL; i++) {
            const j = trail.jit[i], u = (i / TRAIL), f = Math.pow(Math.max(0, rt - u * 0.12), 1.7);
            tp[i * 3] = 0.6 * (1 - f) + j[0] * 0.2 * (0.3 + u); tp[i * 3 + 1] = 10.5 * (1 - f) + u * 1.6 * (0.4 + j[2]); tp[i * 3 + 2] = -3.0 * (1 - f) + j[1] * 0.2;
            ta[i] = rock.visible ? (1 - u) * 0.5 * smooth(rt * 6) : 0;
        }
        trail.pts.geometry.attributes.position.needsUpdate = true; trail.pts.geometry.attributes.aAlpha.needsUpdate = true;
        // impact flash
        flash.material.opacity = S.flash * 0.9; flash.scale.setScalar(2.2 + S.flash * 5.5); flashLight.intensity = S.flash * 90;
        // dust + fragments
        if (dust.mat) { dust.mat.uniforms.uBurst.value = S.burst; dust.mat.uniforms.uForm.value = S.form; dust.mat.uniforms.uFade.value = S.fade; }
        frags.forEach((fr) => {
            const b = 1 - Math.pow(1 - Math.min(1, S.burst), 3), f = smooth((S.form - fr.r * 0.4) / 0.6);
            fr.mesh.visible = S.burst > 0.0005 && S.fade < 0.999 && f < 0.995;
            if (!fr.mesh.visible) return;
            tmp.copy(fr.d).multiplyScalar(fr.v * b * 5.0); tmp.y -= 0.35 * b * b * fr.v;
            fr.mesh.position.copy(tmp).lerp(fr.tgt, f);
            fr.mesh.scale.copy(fr.sc).multiplyScalar(fr.s * (1 - f * 0.92) * Math.min(1, b * 6));
            fr.mesh.rotation.set(fr.spin.x * S.burst, fr.spin.y * S.burst, fr.spin.z * S.burst);
        });
        outlineMat.opacity = S.outline * (1 - S.fill * 0.55); fillMat.opacity = S.fill; glowMat.opacity = S.fill * 0.55;
        // rings (progressive draw) – each ring starts slightly after the previous one
        rings.forEach((ln, i) => { const u = smooth(seg(S.rings, i * 0.16, 0.52 + i * 0.16)); ln.geometry.setDrawRange(0, Math.floor(RING_SEG * u) + (u > 0 ? 1 : 0)); ln.rotation.y = S.rings * (0.25 + i * 0.12) + S.cam * 0.08 * (i + 1); });
        // planets
        PLANETS.forEach((pl, i) => {
            const u = smooth(S.p[i]);
            pl.grp.visible = u > 0.002; pl.grp.scale.setScalar(Math.max(0.0001, u));
            pl.mesh.rotation.y = S.cam * 0.5 + i; pl.ringMat.opacity = 0.5 * u;
            const dim = small ? 1 - 0.55 * (1 - S.w[i]) * Math.min(1, S.cam) * (1 - S.fin) : 1; // phones: dim instead of blur
            pl.mat.color.setScalar(dim);
        });
        // camera: piecewise keyframes with eased stops
        const ci = Math.min(3, Math.floor(S.cam)), cf = smooth(S.cam - ci);
        camera.position.lerpVectors(KF[ci].p, KF[ci + 1].p, cf);
        look.lerpVectors(KF[ci].t, KF[ci + 1].t, cf);
        camera.lookAt(look);
        // depth of field follows the focused planet
        if (bokeh) {
            const wsum = S.w[0] + S.w[1] + S.w[2];
            tmp.set(0, 0, 0); PLANETS.forEach((pl, i) => tmp.addScaledVector(pl.pos, S.w[i]));
            tmp2.set(0, 0, 0).multiplyScalar(1 - Math.min(1, wsum)); tmp.add(tmp2);
            const focus = camera.position.distanceTo(wsum > 0.02 ? tmp.multiplyScalar(1 / Math.max(wsum, 0.0001)) : new THREE.Vector3(0, 0, 0));
            bokeh.uniforms.focus.value = focus;
            bokeh.uniforms.aperture.value = S.cam < 0.02 ? 0 : 0.00003 + 0.00022 * Math.min(1, wsum);
        }
        placePanels();
        if (composer) composer.render(); else renderer.render(scene, camera);
    };

    // ---------- ONE master timeline (0..116), scrubbed by the pinned section ----------
    const tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: () => { dirty = true; },
        scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: 1.5, invalidateOnRefresh: true, onToggle: (st) => { visible = st.isActive; dirty = true; } }
    });
    tl.to(S, { rock: 1, duration: 14 }, 6)                                   // rock falls from the top to the centre
      .to(S, { flash: 1, duration: 1.4 }, 19.6).to(S, { flash: 0, duration: 6, ease: 'power2.out' }, 21)   // controlled light burst
      .to(S, { burst: 1, duration: 12 }, 20)                                  // fragments + dust fly outward
      .to(S, { form: 1, duration: 18 }, 28)                                   // particles travel onto the logo outline
      .to(S, { outline: 1, duration: 6 }, 40).to(S, { fill: 1, duration: 6 }, 44).to(S, { fade: 1, duration: 8 }, 44)   // lines -> outline -> completed logo
      .to(S, { rings: 1, duration: 11 }, 50)                                  // orbit rings draw in
      .to(S.p, { 0: 1, duration: 4 }, 60).to(S.p, { 1: 1, duration: 4 }, 64).to(S.p, { 2: 1, duration: 4 }, 68)     // three planets, one by one
      .to(S, { cam: 1, duration: 8 }, 72).to(S.w, { 0: 1, duration: 6 }, 74)                                   // travel to opening 01
      .to(S, { cam: 2, duration: 8 }, 84).to(S.w, { 0: 0, duration: 5 }, 84).to(S.w, { 1: 1, duration: 6 }, 87)  // …to opening 02
      .to(S, { cam: 3, duration: 8 }, 94).to(S.w, { 1: 0, duration: 5 }, 94).to(S.w, { 2: 1, duration: 6 }, 97)  // …to opening 03
      .to(S, { cam: 4, duration: 9 }, 106).to(S.w, { 2: 0, duration: 5 }, 106).to(S, { fin: 1, duration: 7 }, 108)  // settle: complete orbit + all three openings
      .to({}, { duration: 4 }, 116);                                          // short hold before the section releases

    // ---------- sizing / loop ----------
    const resize = () => {
        const W = stage.clientWidth, H = stage.clientHeight; if (!W || !H) return;
        renderer.setSize(W, H, false); camera.aspect = W / H;
        const asp = W / H; camera.fov = asp < 0.8 ? 52 : 40; camera.setViewOffset(W, H, 0, -H * 0.08, W, H); camera.updateProjectionMatrix();
        const k = asp < 0.8 ? Math.min(2.4, 1.1 / Math.pow(asp, 0.95)) : 1; // portrait: pull the wide shot back
        WIDE.p.set(0, 7.0 * k, 19.5 * k);
        if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(W, H); }
        dirty = true;
    };
    resize();
    new ResizeObserver(resize).observe(stage);
    let raf = 0;
    const loop = () => { raf = requestAnimationFrame(loop); if (dirty && visible) { dirty = false; render(); } };
    loop();
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(raf); else { cancelAnimationFrame(raf); loop(); } });

    // logo mark -> particle / outline targets
    const img = new Image();
    img.onload = () => buildLogo(img);
    img.src = '/logo-mark.png';
    render();
}
