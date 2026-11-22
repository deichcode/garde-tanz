import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Design-Tokens und Komponenten-CSS kommen direkt aus ../design-system (eine Quelle für Styleguide und App).
export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0') },
  server: { fs: { allow: ['..'] } },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Garde-Tanz',
        short_name: 'Garde-Tanz',
        description: 'Gardetänze schreiben, drucken und trainieren',
        lang: 'de',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        // Manifest braucht feste Werte: Spiegel von --gm-paper und --gm-ink (tokens.css)
        background_color: '#FFFFFF',
        theme_color: '#11151C',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        // Die Anmeldung von Firebase (/__/auth/…) darf der Service Worker nicht abfangen.
        navigateFallbackDenylist: [/^\/__\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: { cacheName: 'schriften', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
  build: { chunkSizeWarningLimit: 800 }, // Firestore mit Offline-Speicher ist groß, wird nur im Vereinsbetrieb geladen
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
