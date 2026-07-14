// Canonical public origin, single source of truth for metadata (metadataBase,
// canonical URL, OpenGraph). Set NEXT_PUBLIC_SITE_URL per environment (e.g. the
// Vercel production domain). Falls back to localhost for local dev.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
