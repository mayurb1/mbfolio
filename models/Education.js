import mongoose from 'mongoose'
import { timelineFields, baseSchemaOptions } from './_shared.js'

const educationSchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
      maxLength: [200, 'Institution name cannot exceed 200 characters'],
    },
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
      maxLength: [200, 'Degree cannot exceed 200 characters'],
    },
    gpa: {
      type: String,
      trim: true,
      maxLength: [50, 'GPA cannot exceed 50 characters'],
    },
    ...timelineFields(),
  },
  baseSchemaOptions
)

// Index for efficient querying (scoped per owner)
educationSchema.index({ userId: 1, isActive: 1, order: 1 })
educationSchema.index({ userId: 1, startDate: -1 }) // For sorting by start date

export default mongoose.models.Education ||
  mongoose.model('Education', educationSchema)
