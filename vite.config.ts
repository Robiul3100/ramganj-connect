import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "127.0.0.1",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "slider/*.jpg"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff,woff2}"],
        navigateFallbackDenylist: [/^\/~oauth/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/.*supabase.*\/rest\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
      manifest: {
        name: "রামগঞ্জ সিটি — আধুনিকতার ছোঁয়ায় রামগঞ্জ",
        short_name: "রামগঞ্জ সিটি",
        description: "রামগঞ্জের সকল সেবা, খবর ও জরুরি তথ্য এক অ্যাপে",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        theme_color: "#2680EB",
        background_color: "#F0F2F5",
        categories: ["utilities", "news", "lifestyle"],
        icons: [
          { src: "/pwa-icons/icon-72.png", sizes: "72x72", type: "image/png" },
          { src: "/pwa-icons/icon-96.png", sizes: "96x96", type: "image/png" },
          { src: "/pwa-icons/icon-128.png", sizes: "128x128", type: "image/png" },
          { src: "/pwa-icons/icon-144.png", sizes: "144x144", type: "image/png" },
          { src: "/pwa-icons/icon-152.png", sizes: "152x152", type: "image/png" },
          { src: "/pwa-icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-icons/icon-384.png", sizes: "384x384", type: "image/png" },
          { src: "/pwa-icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/pwa-icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

