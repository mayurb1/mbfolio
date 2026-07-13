import withPWAInit from '@ducanh2912/next-pwa'

/** @type {import('next').NextConfig} */

// Security headers — single source of truth (applied in dev, on Netlify, and
// any other host). The Netlify adapter honors next.config `headers()`.
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

const nextConfig = {
  reactStrictMode: true,
  // Empty Turbopack config silences the Next 16 warning about the webpack
  // config injected by next-pwa. PWA/webpack only matter for the production
  // build (`next build --webpack`); dev runs on Turbopack with PWA disabled.
  turbopack: {},
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

// Service worker generated into public/ (sw.js). Disabled in dev to avoid
// caching churn while iterating. Three runtime-caching rules: Cloudinary
// media, Next static build assets, and the public master-data API.
const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'cloudinary-media',
          expiration: { maxEntries: 128, maxAgeSeconds: 60 * 60 * 24 * 30 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-static',
          expiration: { maxEntries: 256, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /\/api\/master$/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'master-data',
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 8, maxAgeSeconds: 60 * 5 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
})

export default withPWA(nextConfig)
