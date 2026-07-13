import { NextResponse } from 'next/server'

// Rate limiting ported from the Express `express-rate-limit` config.
//
// Preserves the five limiter profiles and their codes, and — like the original
// — is SKIPPED entirely outside production. In production on Netlify it uses a
// best-effort fixed-window counter backed by Netlify Blobs (falls back to an
// in-memory Map if Blobs is unavailable).
//
// Note: the original `authLimiter` used `skipSuccessfulRequests`. Here every
// attempt is counted (a conservative approximation) since the count is applied
// before the handler runs.

const LIMITERS = {
  general: {
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: {
      error:
        'Too many requests from this IP, please try again after 15 minutes.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
      error:
        'Too many authentication attempts from this IP, please try again after 15 minutes.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: 15 * 60,
    },
  },
  upload: {
    windowMs: 60 * 60 * 1000,
    max: 50,
    message: {
      error:
        'Too many file upload attempts from this IP, please try again after 1 hour.',
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
    },
  },
  public: {
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: {
      error:
        'Too many requests from this IP, please try again after 15 minutes.',
      code: 'PUBLIC_RATE_LIMIT_EXCEEDED',
    },
  },
  strict: {
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: {
      error:
        'Too many attempts from this IP, please try again after 15 minutes.',
      code: 'STRICT_RATE_LIMIT_EXCEEDED',
      retryAfter: 15 * 60,
    },
  },
}

let memory = global._rateLimitStore
if (!memory) {
  memory = global._rateLimitStore = new Map() // key -> { count, resetAt }
}

function getClientIp(request) {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-nf-client-connection-ip') || 'unknown'
}

async function getBlobStore() {
  try {
    const { getStore } = await import('@netlify/blobs')
    return getStore('rate-limit')
  } catch {
    return null
  }
}

/**
 * Enforce a rate limit. Returns a 429 NextResponse if the limit is exceeded,
 * otherwise null. No-op (returns null) outside production.
 */
export async function rateLimit(request, name) {
  if (process.env.NODE_ENV !== 'production') return null

  const cfg = LIMITERS[name]
  if (!cfg) return null

  const now = Date.now()
  const window = Math.floor(now / cfg.windowMs)
  const key = `${name}:${getClientIp(request)}:${window}`
  const resetAt = (window + 1) * cfg.windowMs

  let count = 0
  const store = await getBlobStore()
  if (store) {
    try {
      const record = await store.get(key, { type: 'json' })
      count = (record?.count || 0) + 1
      await store.setJSON(key, { count, resetAt })
    } catch {
      count = incrMemory(key, resetAt, now)
    }
  } else {
    count = incrMemory(key, resetAt, now)
  }

  if (count > cfg.max) {
    return NextResponse.json(cfg.message, {
      status: 429,
      headers: {
        'RateLimit-Limit': String(cfg.max),
        'RateLimit-Remaining': '0',
        'Retry-After': String(Math.ceil((resetAt - now) / 1000)),
      },
    })
  }

  return null
}

function incrMemory(key, resetAt, now) {
  const existing = memory.get(key)
  if (!existing || existing.resetAt <= now) {
    memory.set(key, { count: 1, resetAt })
    return 1
  }
  existing.count += 1
  return existing.count
}
