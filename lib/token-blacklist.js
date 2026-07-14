// JWT logout blacklist.
//
// Backed by MongoDB (the `BlacklistedToken` collection) so revoked tokens are
// shared across serverless invocations. A TTL index auto-purges entries once
// the token would have expired. If the DB write/lookup fails, it falls back to
// an in-memory Map — good enough for a single dev process and mirrors the
// original in-memory implementation.

import connectDB from '@/lib/db'
import BlacklistedToken from '@/models/BlacklistedToken'

let memory = global._tokenBlacklist
if (!memory) {
  memory = global._tokenBlacklist = new Map() // token -> expiryMs
}

export async function blacklistToken(token, expiryMs) {
  memory.set(token, expiryMs)
  try {
    await connectDB()
    await BlacklistedToken.updateOne(
      { token },
      { $set: { expiresAt: new Date(expiryMs) } },
      { upsert: true }
    )
  } catch {
    // ignore — memory copy still applies for this invocation
  }
}

export async function isBlacklisted(token) {
  const now = Date.now()

  const memExpiry = memory.get(token)
  if (memExpiry !== undefined) {
    if (memExpiry > now) return true
    memory.delete(token)
  }

  try {
    await connectDB()
    const record = await BlacklistedToken.findOne({ token }).lean()
    // TTL cleanup can lag by up to a minute, so re-check the expiry ourselves.
    if (record && record.expiresAt.getTime() > now) return true
  } catch {
    // ignore lookup failures
  }

  return false
}
