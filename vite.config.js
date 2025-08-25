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
      
      // Static assets to include in the service worker precache
      // These files will be cached during service worker installation
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'resume.pdf'],
      
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
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      
      // Workbox service worker configuration
      workbox: {
        // File patterns to include in precache (cached during SW install)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2,pdf}'],
        
        // Service worker lifecycle options for immediate updates
        skipWaiting: true,        // New SW takes control immediately
        clientsClaim: true,       // SW controls all tabs immediately
        cleanupOutdatedCaches: true, // Remove old cache versions automatically
        
        // Runtime caching strategies for specific routes/files
        runtimeCaching: [
          {
            // Cache strategy specifically for resume PDF
            urlPattern: /\/resume\.pdf$/,
            
            // NetworkFirst: Always try network first, fallback to cache
            // This prevents serving stale 404s when file becomes available
            handler: 'NetworkFirst',
            
            options: {
              // Separate cache for PDF files (v2 to invalidate old 404 cache)
              cacheName: 'pdf-cache-v2',
              
              // Network timeout - fallback to cache after 3 seconds
              networkTimeoutSeconds: 3
            }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          animations: ['framer-motion'],
          charts: ['d3'],
          forms: ['formik', 'yup']
        }
      }
    }
  },
  server: {
    port: 3000
  }
})