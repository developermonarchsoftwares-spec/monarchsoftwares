import { defineConfig } from 'vite';
import { resolve } from 'path';
import { existsSync, mkdirSync, copyFileSync } from 'fs';

// Old multi-page URLs now live as sections of the homepage (mirrors the redirects in vercel.json)
const MOVED = {
  '/about': '/home/about',
  '/services': '/home/services',
  '/careers': '/home/careers',
  '/contact': '/home/contact',
  '/cta': '/home/contact',
  '/hr-services': '/training-placement',
};

const cleanUrl = (req, res, next) => {
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

  // Direct rewrite for /home and any /home/* -> /index.html
  if (normalized === '/home' || normalized.startsWith('/home/')) {
    req.url = `/index.html${query ? '?' + query : ''}`;
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

  if (path !== '/' && !path.includes('.') && !path.startsWith('/@') && !path.startsWith('/src') && !path.startsWith('/node_modules')) {
    const file = normalized + '.html';
    if (existsSync(resolve(__dirname, '.' + file))) req.url = file + (query ? '?' + query : '');
  }
  next();
};

export default defineConfig({
  plugins: [
    {
      // Mirror vercel.json clean URLs (/about -> /about.html) for dev and preview servers
      name: 'clean-url-rewrite',
      configureServer(server) { server.middlewares.use(cleanUrl); },
      configurePreviewServer(server) { server.middlewares.use(cleanUrl); },
    },
    {
      // Vercel 404s the /home and /home/* rewrites in vercel.json, so emit real files for those routes
      // (with cleanUrls, dist/home/services.html is served at /home/services just like /it-services is)
      name: 'home-route-pages',
      apply: 'build',
      closeBundle() {
        const dist = resolve(__dirname, 'dist');
        const home = resolve(dist, 'index.html');
        if (!existsSync(home)) return;
        mkdirSync(resolve(dist, 'home'), { recursive: true });
        copyFileSync(home, resolve(dist, 'home.html'));
        for (const section of ['services', 'careers', 'about', 'contact', 'cta']) copyFileSync(home, resolve(dist, 'home', `${section}.html`));
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
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'vendor-three';
            if (id.includes('gsap')) return 'vendor-gsap';
            if (id.includes('lenis')) return 'vendor-lenis';
            return 'vendor';
          }
        }
      }
    },
  },
});
