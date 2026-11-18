import { defineConfig } from 'vite';
import { resolve } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { withSiteUrl } from './site.config.js';

// Old multi-page / section URLs now live as anchors of the homepage (mirrors the redirects in vercel.json)
const MOVED = {
  '/about': '/#about',
  '/services': '/#services',
  '/careers': '/#careers',
  '/contact': '/#cta',
  '/cta': '/#cta',
  '/home': '/',
  '/home/about': '/#about',
  '/home/services': '/#services',
  '/home/careers': '/#careers',
  '/home/contact': '/#cta',
  '/home/cta': '/#cta',
  '/hr-services': '/training-placement',
};

// Files that carry the %SITE_URL% placeholder outside the HTML pages
const SITE_URL_FILES = ['robots.txt', 'sitemap.xml', 'llms.txt'];
const TYPES = { 'robots.txt': 'text/plain', 'sitemap.xml': 'application/xml', 'llms.txt': 'text/plain' };

// Branded 404: dev serves it through Vite (so styles/scripts load), preview serves the built file. Always HTTP 404.
const notFound = (res, server) => {
  const send = (html) => { res.statusCode = 404; res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(html); };
  const built = resolve(__dirname, 'dist', '404.html');
  if (server) {
    server.transformIndexHtml('/404', readFileSync(resolve(__dirname, '404.html'), 'utf8')).then(send);
  } else if (existsSync(built)) {
    send(readFileSync(built, 'utf8'));
  } else {
    send('Not found');
  }
};

const cleanUrl = (server) => (req, res, next) => {
  // Prevent any browser 301 cache retention in dev mode
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Clear-Site-Data', '"cache"');

  const [path, query = ''] = (req.url || '').split('?');
  const normalized = path.replace(/\.html$/, '').replace(/\/$/, '');

  // Direct rewrite for /services/<slug> -> /<slug>.html without redirecting
  const serviceMatch = normalized.match(/^\/services\/(corporate-training|it-services|digital-marketing|training-placement)$/);
  if (serviceMatch) {
    req.url = `/${serviceMatch[1]}.html${query ? '?' + query : ''}`;
    next();
    return;
  }

  const moved = MOVED[normalized];
  if (moved) {
    res.statusCode = 302; // Use 302 Temporary in dev to avoid permanent browser cache poisoning
    res.setHeader('Location', moved);
    res.end();
    return;
  }

  const isAsset = path.includes('.') || path.startsWith('/@') || path.startsWith('/src') || path.startsWith('/node_modules') || path.startsWith('/api');
  if (path !== '/' && !isAsset) {
    const file = normalized + '.html';
    if (existsSync(resolve(__dirname, '.' + file)) && normalized !== '/404') req.url = file + (query ? '?' + query : '');
    else return notFound(res, server);
  }
  next();
};

export default defineConfig({
  plugins: [
    {
      // Mirror vercel.json clean URLs (/privacy -> /privacy.html), redirects and the 404 for dev and preview servers
      name: 'clean-url-rewrite',
      configureServer(server) { server.middlewares.use(cleanUrl(server)); },
      configurePreviewServer(server) { server.middlewares.use(cleanUrl(null)); },
    },
    {
      // Single preferred host (www): replaces %SITE_URL% in pages, sitemap.xml, robots.txt and llms.txt
      name: 'site-url',
      transformIndexHtml(html) { return withSiteUrl(html); },
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const name = (req.url || '').split('?')[0].replace(/^\//, '');
          if (!SITE_URL_FILES.includes(name)) return next();
          res.setHeader('Content-Type', `${TYPES[name]}; charset=utf-8`);
          res.end(withSiteUrl(readFileSync(resolve(__dirname, 'public', name), 'utf8')));
        });
      },
      closeBundle() {
        for (const name of SITE_URL_FILES) {
          const file = resolve(__dirname, 'dist', name);
          if (existsSync(file)) writeFileSync(file, withSiteUrl(readFileSync(file, 'utf8')));
        }
      },
    },
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(/%PUBLIC_URL%/g, '');
      },
    },
  ],
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
        corporateTraining: resolve(__dirname, 'corporate-training.html'),
        itServices: resolve(__dirname, 'it-services.html'),
        digitalMarketing: resolve(__dirname, 'digital-marketing.html'),
        trainingPlacement: resolve(__dirname, 'training-placement.html'),
        notFound: resolve(__dirname, '404.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'vendor-three';
            // three-globe's own dependencies: only the lazy-loaded home globe needs them, so keep them out of the shared vendor chunk
            if (/[\\/]node_modules[\\/](h3-js|d3-geo|d3-geo-voronoi|d3-delaunay|d3-octree|d3-color|d3-format|delaunator|tinycolor2|@tweenjs[\\/]tween\.js|earcut)[\\/]/.test(id)) return 'vendor-three';
            if (id.includes('gsap')) return 'vendor-gsap';
            if (id.includes('lenis')) return 'vendor-lenis';
            return 'vendor';
          }
        }
      }
    },
  },
});
