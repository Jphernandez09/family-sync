import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Manifest is in public/manifest.json — don't generate a second one
      manifest: false,
      // Include the manifest file in the service worker precache
      includeAssets: [
        "favicon.svg",
        "icons/*.png",
        "manifest.json",
      ],
      workbox: {
        // App shell strategy: cache HTML, JS, CSS immediately
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Network-first for API calls (never serve stale data from Base44)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.base44\.com\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "base44-api",
              expiration: { maxAgeSeconds: 60 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            // Cache Google Fonts and CDN assets
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        // Enable SW in dev so you can test offline behaviour locally
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    // Generate source maps for production debugging
    sourcemap: false,
    // Chunk size warning threshold
    chunkSizeWarningLimit: 600,
  },
});
