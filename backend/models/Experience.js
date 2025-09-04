const mongoose = require('mongoose')

const highlightSchema = new mongoose.Schema(
  {
    metric: {
      type: String,
      required: [true, 'Highlight metric is required'],
      trim: true,
      maxLength: [50, 'Metric cannot exceed 50 characters'],
    },
    description: {
      type: String,
      required: [true, 'Highlight description is required'],
      trim: true,
      maxLength: [100, 'Description cannot exceed 100 characters'],
    },
  },
  { _id: false }
)

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxLength: [200, 'Company name cannot exceed 200 characters'],
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
      maxLength: [200, 'Position cannot exceed 200 characters'],
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
    type: {
      type: String,
      enum: {
        values: [
          'Full-time',
          'Part-time',
          'Contract',
          'Internship',
          'Freelance',
        ],
        message:
          'Type must be one of: Full-time, Part-time, Contract, Internship, Freelance',
      },
      default: 'Full-time',
    },
    logo: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v)
        },
        message: 'Website must be a valid URL',
      },
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
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skills',
      },
    ],
    highlights: [highlightSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Index for efficient querying
experienceSchema.index({ isActive: 1, order: 1 })
experienceSchema.index({ startDate: -1 }) // For sorting by start date

module.exports = mongoose.model('Experience', experienceSchema)
