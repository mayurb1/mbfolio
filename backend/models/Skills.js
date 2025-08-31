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
    enum: {
      values: ["Frontend", "Backend", "Database", "DevOps", "Mobile", "Design", "Tools", "Other"],
      message: "Category must be one of: Frontend, Backend, Database, DevOps, Mobile, Design, Tools, Other"
    }
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
  icon: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: "#3B82F6",
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color must be a valid hex color code"]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient querying
skillSchema.index({ category: 1, isActive: 1 });
skillSchema.index({ sortOrder: 1 });

module.exports = mongoose.model("Skills", skillSchema);