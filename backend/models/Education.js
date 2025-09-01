const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: [true, "Institution name is required"],
    trim: true,
    maxLength: [200, "Institution name cannot exceed 200 characters"]
  },
  degree: {
    type: String,
    required: [true, "Degree is required"],
    trim: true,
    maxLength: [200, "Degree cannot exceed 200 characters"]
  },
  duration: {
    type: String,
    required: [true, "Duration is required"],
    trim: true,
    maxLength: [100, "Duration cannot exceed 100 characters"]
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true,
    maxLength: [100, "Location cannot exceed 100 characters"]
  },
  gpa: {
    type: String,
    trim: true,
    maxLength: [50, "GPA cannot exceed 50 characters"]
  },
  logo: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: "Website must be a valid URL"
    }
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    maxLength: [1000, "Description cannot exceed 1000 characters"]
  },
  achievements: [{
    type: String,
    trim: true,
    maxLength: [500, "Achievement cannot exceed 500 characters"]
  }],
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
educationSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model("Education", educationSchema);