const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Project title is required"],
    trim: true,
    maxLength: [200, "Title cannot exceed 200 characters"]
  },
  description: {
    type: String,
    required: [true, "Project description is required"],
    trim: true,
    maxLength: [500, "Description cannot exceed 500 characters"]
  },
  fullDescription: {
    type: String,
    required: [true, "Full description is required"],
    trim: true,
    maxLength: [2000, "Full description cannot exceed 2000 characters"]
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Category is required"]
  },
  status: {
    type: String,
    enum: {
      values: ["completed", "ongoing", "planned", "archived"],
      message: "Status must be one of: completed, ongoing, planned, archived"
    },
    default: "completed"
  },
  type: {
    type: String,
    enum: {
      values: ["personal", "organization", "freelance", "open-source"],
      message: "Type must be one of: personal, organization, freelance, open-source"
    },
    default: "personal"
  },
  technologies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Skills"
  }],
  highlights: [{
    type: String,
    trim: true,
    maxLength: [500, "Highlight cannot exceed 500 characters"]
  }],
  // Cloudinary image URLs
  images: [{
    type: String,
    trim: true
  }],
  mainImage: {
    type: String,
    trim: true
  },
  github: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: "GitHub URL must be a valid URL"
    }
  },
  demo: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: "Demo URL must be a valid URL"
    }
  },
  duration: {
    type: String,
    trim: true,
    maxLength: [50, "Duration cannot exceed 50 characters"]
  },
  team: {
    type: String,
    trim: true,
    maxLength: [100, "Team info cannot exceed 100 characters"]
  },
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient querying
projectSchema.index({ isActive: 1, featured: -1, order: 1 });
projectSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model("Project", projectSchema);