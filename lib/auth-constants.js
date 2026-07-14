// Edge-safe auth constants. Kept free of Node-only imports (mongoose, bcrypt,
// jsonwebtoken) so both the Edge middleware and Node route handlers can import
// them.

export const COOKIE_NAME = 'admin_token'
export const TOKEN_TTL_SECONDS = 24 * 60 * 60 // 24h, matches JWT expiry
