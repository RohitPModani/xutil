import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  root:'.',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // main.tsx registers the worker itself so it can poll for new builds.
      injectRegister: null,
      includeAssets: ['cog_dark.svg', 'cog_light.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'XUtil - Developer Tools',
        short_name: 'XUtil',
        description: 'Offline-first dev tools for everyone',
        theme_color: '#0e1518',
        background_color: '#0e1518',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    outDir: 'dist',
  },
})
