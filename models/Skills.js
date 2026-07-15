import mongoose from 'mongoose'

const skillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: [true, 'Owner is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      maxLength: [100, 'Skill name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Skill category is required'],
      trim: true,
    },
    proficiency: {
      type: String,
      required: [true, 'Proficiency level is required'],
      enum: {
        values: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        message:
          'Proficiency must be one of: Beginner, Intermediate, Advanced, Expert',
      },
    },
    experience: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      max: [50, 'Experience cannot exceed 50 years'],
      default: 0,
    },
    description: {
      type: String,
      maxLength: [500, 'Description cannot exceed 500 characters'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Index for efficient querying (scoped per owner). Uniqueness of skill name
// per user is enforced case-insensitively in the route handler, not here.
skillSchema.index({ userId: 1, category: 1, isActive: 1 })
skillSchema.index({ userId: 1, name: 1 })

export default mongoose.models.Skills || mongoose.model('Skills', skillSchema)
