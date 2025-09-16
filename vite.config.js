import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Auto-update service worker without user prompt for seamless updates
      registerType: 'autoUpdate',
      // Defer service worker registration to not block initial render
      injectRegister: 'script-defer',

      // Static assets to include in the service worker precache
      // These files will be cached during service worker installation
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'masked-icon.svg',
        'resume.pdf',
      ],

      // PWA manifest configuration for installable app
      manifest: {
        name: 'Personal Portfolio',
        short_name: 'Portfolio',
        description: 'Software Engineer Portfolio',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },

      // Workbox service worker configuration
      workbox: {
        // File patterns to include in precache (cached during SW install)
        globPatterns: ['**/*.{js,css,html,ico,svg,json,vue,txt,woff2,pdf}'],

        // Exclude large images from precaching - they'll be cached on-demand
        globIgnores: [
          '**/images/byhh_main_img.png',
          '**/images/profile-pic.jpg',
        ],

        // Set maximum file size for precaching (5MB)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

        // Service worker lifecycle options for immediate updates
        skipWaiting: true, // New SW takes control immediately
        clientsClaim: true, // SW controls all tabs immediately
        cleanupOutdatedCaches: true, // Remove old cache versions automatically

        // Runtime caching strategies for specific routes/files
        runtimeCaching: [
          {
            // Cache strategy specifically for resume PDF
            urlPattern: /\/resume\.pdf$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pdf-cache-v2',
              networkTimeoutSeconds: 3,
            },
          },
          {
            // Cache large images with stale-while-revalidate strategy
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            // Cache API calls
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          animations: ['framer-motion'],
          forms: ['formik', 'yup'],
          markdown: ['react-markdown'],
          ui: ['lucide-react'],
        },
      },
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
    cssMinify: true,
  },
  server: {
    port: 3000,
  },
})
