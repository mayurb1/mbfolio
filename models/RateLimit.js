import mongoose from 'mongoose'

// Fixed-window rate-limit counters, shared across serverless invocations via
// MongoDB. `key` encodes limiter + client IP + window bucket, so each window
// gets its own document. The TTL index on `resetAt` auto-purges a window's
// counter once that window has elapsed.

const rateLimitSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    count: {
      type: Number,
      required: true,
      default: 0,
    },
    resetAt: {
      type: Date,
      required: true,
    },
  },
  {
    // No createdAt/updatedAt: these are short-lived counters, not records.
    timestamps: false,
  }
)

// TTL index: MongoDB removes each window's counter once `resetAt` passes.
rateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.RateLimit ||
  mongoose.model('RateLimit', rateLimitSchema)
