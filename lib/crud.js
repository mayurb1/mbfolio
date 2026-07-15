import { connectDB } from '@/lib/db'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'
import { ok, fail, validationError, isObjectIdError } from '@/lib/respond'
import Users from '@/models/users'

// Shared building blocks for the API route handlers. These fold the rate-limit
// gate, auth gate, DB connection and error tail that every CRUD handler used to
// repeat, plus factories for the fully-mechanical toggle/bulk endpoints.

// Escape user input before interpolating it into a RegExp so special characters
// are matched literally (prevents regex injection / ReDoS in the name lookups).
export function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Case-insensitive exact-match filter value: { $regex: /^value$/i }, escaped.
export function ciExact(value) {
  return { $regex: new RegExp(`^${escapeRegex(value)}$`, 'i') }
}

// Centralized catch: Mongoose cast error -> 404, validation -> 400, duplicate
// key -> 409, otherwise 500.
export function handleError(err, notFound = 'Resource not found', duplicate = 'Duplicate entry') {
  if (isObjectIdError(err)) return fail(notFound, 404)
  if (err?.name === 'ValidationError') return validationError(err)
  if (err?.code === 11000) return fail(duplicate, 409)
  return fail(err?.message || 'Server error', 500)
}

/**
 * Wrap a route handler with the cross-cutting concerns every CRUD route shares:
 * the rate-limit gate, an optional auth gate, the DB connection and the shared
 * error tail. The wrapped handler receives (request, ctx, auth) and may either
 * return a NextResponse or throw (thrown errors go through handleError).
 *
 * `auth`:
 *   true       — require a valid session (401 otherwise); handler gets `session`.
 *   'optional' — attempt auth; on success `session` is populated, on failure it
 *                stays undefined and the request proceeds (used by public GETs
 *                that also serve the authenticated admin).
 *   false      — no auth.
 */
export function withRoute(
  handler,
  { auth = false, limiter = 'general', notFound, duplicate } = {}
) {
  return async (request, ctx) => {
    const limited = await rateLimit(request, limiter)
    if (limited) return limited

    let session
    if (auth === true) {
      session = await authenticate(request)
      if (session.error) return session.error
    } else if (auth === 'optional') {
      const attempted = await authenticate(request)
      if (!attempted.error) session = attempted
    }

    try {
      await connectDB()
      return await handler(request, ctx, session)
    } catch (err) {
      return handleError(err, notFound, duplicate)
    }
  }
}

/**
 * Resolve which user's data a (public or admin) read should be scoped to.
 * Precedence: explicit ?userId= → ?username= (looked up) → authenticated
 * session user. Returns the userId string, or null when no scope can be
 * determined (caller should 400).
 */
export async function resolveScopeUserId(request, session) {
  const sp = request.nextUrl.searchParams
  const qUserId = sp.get('userId')
  if (qUserId) return qUserId

  const username = sp.get('username')
  if (username) {
    const u = await Users.findOne({ username: username.toLowerCase().trim() })
      .select('_id')
      .lean()
    return u?._id?.toString() ?? null
  }

  return session?.user?._id?.toString() ?? null
}

// Parse ?page & ?limit into { page, limit, skip }.
export function parsePagination(searchParams, defaultLimit = 10) {
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || String(defaultLimit))
  return { page, limit, skip: (page - 1) * limit }
}

// Standard pagination envelope shared by every GET-list handler.
export function paginationMeta(total, page, limit) {
  return { total, page, limit, totalPages: Math.ceil(total / limit) }
}

/**
 * Factory for the PATCH toggle handlers (toggle-status / toggle-featured).
 * Flips a boolean field, saves, optionally re-populates, and returns the doc.
 *
 * @param {import('mongoose').Model} Model
 * @param {object} opts
 * @param {string} opts.key        response data key, e.g. 'category'
 * @param {string} [opts.field]    boolean field to flip (default 'isActive')
 * @param {string} opts.notFound   404 message
 * @param {object} opts.labels     { noun, on, off } for the success message
 * @param {Array}  [opts.populate] array of [path, select] tuples
 */
export function makeToggle(
  Model,
  { key, field = 'isActive', notFound = 'Resource not found', labels, populate = [] }
) {
  return withRoute(
    async (request, { params }, session) => {
      const { id } = await params
      const doc = await Model.findOne({ _id: id, userId: session.user._id })
      if (!doc) return fail(notFound, 404)

      doc[field] = !doc[field]
      await doc.save()
      for (const p of populate) await doc.populate(...p)

      return ok(
        { [key]: doc },
        `${labels.noun} ${doc[field] ? labels.on : labels.off} successfully`,
        200
      )
    },
    { auth: true, notFound }
  )
}

/**
 * Factory for the POST /bulk create handlers.
 *
 * @param {import('mongoose').Model} Model
 * @param {object} opts
 * @param {string} opts.key           request/response array key, e.g. 'education'
 * @param {string} opts.requiredLabel noun for the "array is required" message
 * @param {string} opts.itemLabel     noun for the "N ... created" message
 * @param {string} opts.duplicate     409 message on duplicate key
 */
export function makeBulkCreate(Model, { key, requiredLabel, itemLabel, duplicate }) {
  return withRoute(
    async (request, ctx, session) => {
      const body = await request.json()
      const items = body[key]
      if (!Array.isArray(items) || items.length === 0) {
        return fail(`${requiredLabel} array is required`, 400)
      }

      // Stamp ownership on every item so bulk-created docs belong to the caller.
      const owned = items.map((item) => ({ ...item, userId: session.user._id }))
      const created = await Model.insertMany(owned, { ordered: false })
      return ok(
        { [key]: created },
        `${created.length} ${itemLabel} created successfully`,
        201
      )
    },
    { auth: true, duplicate }
  )
}

/**
 * Factory for the PATCH /bulk/toggle handlers.
 *
 * @param {import('mongoose').Model} Model
 * @param {object} opts
 * @param {string} opts.idsKey        request array key, e.g. 'educationIds'
 * @param {string} opts.requiredLabel noun for the "IDs array is required" message
 * @param {string} opts.itemLabel     noun for the "N ... updated" message
 */
export function makeBulkToggle(Model, { idsKey, requiredLabel, itemLabel }) {
  return withRoute(
    async (request, ctx, session) => {
      const body = await request.json()
      const ids = body[idsKey]
      const { isActive } = body
      if (!Array.isArray(ids) || ids.length === 0) {
        return fail(`${requiredLabel} IDs array is required`, 400)
      }

      // Scope to the caller's own records so a user can't toggle others' docs.
      const result = await Model.updateMany(
        { _id: { $in: ids }, userId: session.user._id },
        { $set: { isActive } }
      )
      return ok(
        { modifiedCount: result.modifiedCount, matchedCount: result.matchedCount },
        `${result.modifiedCount} ${itemLabel} updated successfully`,
        200
      )
    },
    { auth: true }
  )
}
