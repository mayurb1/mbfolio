const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Skill name is required"],
    trim: true,
    maxLength: [100, "Skill name cannot exceed 100 characters"]
  },
  category: { 
    type: String, 
    required: [true, "Skill category is required"],
    trim: true
  },
  proficiency: { 
    type: String, 
    required: [true, "Proficiency level is required"],
    enum: {
      values: ["Beginner", "Intermediate", "Advanced", "Expert"],
      message: "Proficiency must be one of: Beginner, Intermediate, Advanced, Expert"
    }
  },
  experience: {
    type: Number,
    min: [0, "Experience cannot be negative"],
    max: [50, "Experience cannot exceed 50 years"],
    default: 0
  },
  description: {
    type: String,
    maxLength: [500, "Description cannot exceed 500 characters"],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient querying
skillSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model("Skills", skillSchema);