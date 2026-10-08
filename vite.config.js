import { defineConfig } from 'vite';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Old multi-page URLs now live as sections of the homepage (mirrors the redirects in vercel.json)
const MOVED = {
  '/about': '/#about', '/services': '/#services', '/careers': '/#careers', '/contact': '/#cta',
  '/corporate-training': '/#corporate-training', '/it-services': '/#it-services',
  '/digital-marketing': '/#digital-marketing', '/hr-services': '/#training-placement',
};

const cleanUrl = (req, res, next) => {
  const [path, query = ''] = (req.url || '').split('?');
  const moved = MOVED[path.replace(/\.html$/, '').replace(/\/$/, '')];
  if (moved) {
    res.statusCode = 301;
    res.setHeader('Location', moved);
    res.end();
    return;
  }
  if (path !== '/' && !path.includes('.') && !path.startsWith('/@') && !path.startsWith('/src') && !path.startsWith('/node_modules')) {
    const file = path.replace(/\/$/, '') + '.html';
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
