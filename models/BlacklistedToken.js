import mongoose from 'mongoose'

// Revoked JWTs (logout blacklist), shared across serverless invocations via
// MongoDB. The TTL index on `expiresAt` lets MongoDB auto-purge documents once
// the token would have expired anyway, so the collection stays small.

const blacklistedTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// TTL index: MongoDB removes each doc once `expiresAt` passes (expireAfterSeconds: 0).
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.BlacklistedToken ||
  mongoose.model('BlacklistedToken', blacklistedTokenSchema)
