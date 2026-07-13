import { jwtVerify } from 'jose'

// Edge-compatible JWT verification using `jose` (the Node `jsonwebtoken`
// library can't run in the Edge middleware runtime). Verifies the same
// HS256 tokens signed by lib/auth-node.js with process.env.JWT_SECRET.

function getSecretKey() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not defined')
  return new TextEncoder().encode(secret)
}

/**
 * Verify a token. Returns the decoded payload ({ id, iat, exp }) or null if
 * the token is missing, malformed, expired, or has a bad signature.
 */
export async function verifyEdgeToken(token) {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    return payload
  } catch {
    return null
  }
}
