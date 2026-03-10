// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ineffablesolutions.net',
  integrations: [react(), sitemap()],
  // Explicitly scope to ./src — prevents Astro from scanning nested projects
  // (e.g., Gemini/ subdirectory which has its own pages/ and would pollute routes)
  srcDir: './src',
  vite: {
    ssr: {
      noExternal: ['gsap'],
    },
    build: {
      // Three.js is dynamically imported (first-visit desktop only).
      // Warn threshold raised so CI doesn't flag expected large async chunk.
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Separate Three.js into its own chunk for better caching.
          // It never changes version without a rebuild, so CDN/browser cache
          // hit rate is maximized independently of app code changes.
          manualChunks: {
            'three': ['three'],
          },
        },
      },
    },
  },
});
