import mongoose from 'mongoose'
import { timelineFields, baseSchemaOptions } from './_shared'

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
    ...timelineFields(),
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
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skills',
      },
    ],
    highlights: [highlightSchema],
  },
  baseSchemaOptions
)

// Index for efficient querying
experienceSchema.index({ isActive: 1, order: 1 })
experienceSchema.index({ startDate: -1 }) // For sorting by start date

export default mongoose.models.Experience ||
  mongoose.model('Experience', experienceSchema)
