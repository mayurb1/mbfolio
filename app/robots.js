import { SITE_URL } from '@/lib/site'

// Generates /robots.txt from SITE_URL so it stays correct on any domain.
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/profile/',
          '/blog',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/.env',
          '/*.log',
          '/*.tmp',
          '/*.bak',
          '/.git/',
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
