import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
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
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('gsap')) return 'vendor-gsap';
            if (id.includes('ogl')) return 'vendor-ogl';
            if (id.includes('lenis') || id.includes('lucide')) return 'vendor-ui';
            return 'vendor';
          }
        }
      }
    },
  },
});
