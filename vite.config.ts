import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  define: { __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? 'dev') },
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'favicon.ico'],
      manifest: {
        name: 'Cadet Compass',
        short_name: 'Cadet Compass',
        description: 'Unofficial study aid for Junior ROTC cadets. Works offline. Keeps your progress on this device.',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#fbf8ee',
        theme_color: '#ffffff',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,jpg,svg,ico}'],
        // The content bundle is fetched, signature-checked and kept in IndexedDB by the app itself.
        globIgnores: ['content/**'],
      },
    }),
  ],
  test: { environment: 'node', include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs'] },
});
