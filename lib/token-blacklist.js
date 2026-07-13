// JWT logout blacklist.
//
// On Netlify (production) this is backed by Netlify Blobs so revoked tokens are
// shared across serverless invocations. When Blobs is unavailable (local dev,
// non-Netlify), it falls back to an in-memory Map — good enough for a single
// dev process and mirrors the original in-memory implementation.

const STORE_NAME = 'token-blacklist'

let memory = global._tokenBlacklist
if (!memory) {
  memory = global._tokenBlacklist = new Map() // token -> expiryMs
}

async function getBlobStore() {
  try {
    const { getStore } = await import('@netlify/blobs')
    return getStore(STORE_NAME)
  } catch {
    return null
  }
}

export async function blacklistToken(token, expiryMs) {
  memory.set(token, expiryMs)
  const store = await getBlobStore()
  if (store) {
    try {
      await store.setJSON(token, { expiryMs })
    } catch {
      // ignore — memory copy still applies for this invocation
    }
  }
}

export async function isBlacklisted(token) {
  const now = Date.now()

  const memExpiry = memory.get(token)
  if (memExpiry !== undefined) {
    if (memExpiry > now) return true
    memory.delete(token)
  }

  const store = await getBlobStore()
  if (store) {
    try {
      const record = await store.get(token, { type: 'json' })
      if (record && record.expiryMs > now) return true
    } catch {
      // ignore lookup failures
    }
  }

  return false
}
