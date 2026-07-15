import { connectDB } from '@/lib/db'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'
import { ok, fail, validationError, isObjectIdError } from '@/lib/respond'

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
 */
export function withRoute(
  handler,
  { auth = false, limiter = 'general', notFound, duplicate } = {}
) {
  return async (request, ctx) => {
    const limited = await rateLimit(request, limiter)
    if (limited) return limited

    let session
    if (auth) {
      session = await authenticate(request)
      if (session.error) return session.error
    }

    try {
      await connectDB()
      return await handler(request, ctx, session)
    } catch (err) {
      return handleError(err, notFound, duplicate)
    }
  }
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
    async (request, { params }) => {
      const { id } = await params
      const doc = await Model.findById(id)
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
    async (request) => {
      const body = await request.json()
      const items = body[key]
      if (!Array.isArray(items) || items.length === 0) {
        return fail(`${requiredLabel} array is required`, 400)
      }

      const created = await Model.insertMany(items, { ordered: false })
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
    async (request) => {
      const body = await request.json()
      const ids = body[idsKey]
      const { isActive } = body
      if (!Array.isArray(ids) || ids.length === 0) {
        return fail(`${requiredLabel} IDs array is required`, 400)
      }

      const result = await Model.updateMany(
        { _id: { $in: ids } },
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
