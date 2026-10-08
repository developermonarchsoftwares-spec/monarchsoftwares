import { defineConfig } from 'vite';
import { resolve } from 'path';
import { existsSync } from 'fs';

const cleanUrl = (req, _res, next) => {
  const [path, query = ''] = (req.url || '').split('?');
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
        about: resolve(__dirname, 'about.html'),
        careers: resolve(__dirname, 'careers.html'),
        contact: resolve(__dirname, 'contact.html'),
        corporateTraining: resolve(__dirname, 'corporate-training.html'),
        digitalMarketing: resolve(__dirname, 'digital-marketing.html'),
        hrServices: resolve(__dirname, 'hr-services.html'),
        itServices: resolve(__dirname, 'it-services.html'),
        services: resolve(__dirname, 'services.html'),
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
