import mongoose from 'mongoose'

// Shared schema fragments for timeline-style models (Experience, Education).
// Keep these in sync with the field definitions they replace — schemas are
// load-bearing, so every field/validator here must match exactly.

// Reusable "must be a valid http(s) URL (or empty)" validator.
export function urlValidator(message) {
  return {
    validator: function (v) {
      return !v || /^https?:\/\/.+/.test(v)
    },
    message,
  }
}

// Field fragments common to Experience and Education. Returned from a factory
// so each schema gets its own fresh definition objects (no cross-schema
// mutation via shared references).
export const timelineFields = () => ({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: [true, 'Owner is required'],
    index: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    default: null, // null means ongoing/present
  },
  isOngoing: {
    type: Boolean,
    default: false, // true if currently ongoing
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxLength: [100, 'Location cannot exceed 100 characters'],
  },
  logo: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
    validate: urlValidator('Website must be a valid URL'),
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxLength: [1000, 'Description cannot exceed 1000 characters'],
  },
  achievements: [
    {
      type: String,
      trim: true,
      maxLength: [500, 'Achievement cannot exceed 500 characters'],
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
})

// Shared Mongoose schema options.
export const baseSchemaOptions = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
}
