import Users from '@/models/users'

// Username helpers for the multi-user public routing (/profile/{username}).

// Route segments and words that must never become a username, since they would
// collide with real routes or read as impersonation.
export const RESERVED_USERNAMES = new Set([
  'admin',
  'api',
  'profile',
  'login',
  'logout',
  'register',
  'dashboard',
  'me',
  'auth',
  'master',
  'health',
  'blog',
  'about',
  'contact',
  'settings',
  'null',
  'undefined',
  '_next',
  'static',
  'public',
])

// Same shape as the `match` validator on the Users schema.
export const USERNAME_REGEX = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/

// Turn an arbitrary display name into a URL-safe candidate slug. Never returns
// an empty string (falls back to 'user').
export function slugify(value = '') {
  const slug = String(value)
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents (combining marks)
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumerics -> hyphen
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
    .replace(/-{2,}/g, '-') // collapse repeats
    .slice(0, 30)
    .replace(/-+$/g, '') // re-trim after the slice
  return slug || 'user'
}

// Whether a username is structurally valid and not reserved.
export function isValidUsername(username = '') {
  const u = String(username).toLowerCase()
  return (
    u.length >= 3 &&
    u.length <= 30 &&
    USERNAME_REGEX.test(u) &&
    !RESERVED_USERNAMES.has(u)
  )
}

// Given a base candidate, return a username not currently taken (and not
// reserved), suffixing -2, -3, ... on collision. `excludeId` lets an existing
// user keep/normalize their own username without colliding with themselves.
export async function ensureUniqueUsername(base, excludeId = null) {
  let candidate = slugify(base)
  if (RESERVED_USERNAMES.has(candidate)) candidate = `${candidate}-1`

  let suffix = 1
  // Cap the base so suffixes never overflow the 30-char limit.
  const root = candidate.slice(0, 26)
  candidate = root

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { username: candidate }
    if (excludeId) query._id = { $ne: excludeId }
    const existing = await Users.findOne(query).select('_id').lean()
    if (!existing && !RESERVED_USERNAMES.has(candidate)) return candidate
    suffix += 1
    candidate = `${root}-${suffix}`
  }
}
