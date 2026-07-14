import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import RateLimit from '@/models/RateLimit'

// Rate limiting ported from the Express `express-rate-limit` config.
//
// Preserves the five limiter profiles and their codes, and — like the original
// — is SKIPPED entirely outside production. In production it uses a best-effort
// fixed-window counter backed by MongoDB (the `RateLimit` collection, shared
// across serverless invocations; falls back to an in-memory Map if the DB is
// unavailable).
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
  // `x-real-ip` is set by Vercel; keep a generic fallback for other hosts.
  return request.headers.get('x-real-ip') || 'unknown'
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

  let count
  try {
    await connectDB()
    // Atomic increment; `$setOnInsert` stamps resetAt only when the window's
    // document is first created, so the TTL index can expire it on schedule.
    const doc = await RateLimit.findOneAndUpdate(
      { key },
      { $inc: { count: 1 }, $setOnInsert: { resetAt: new Date(resetAt) } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean()
    count = doc.count
  } catch {
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
