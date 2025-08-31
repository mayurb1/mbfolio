const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Category name is required"],
    unique: true,
    trim: true,
    maxLength: [50, "Category name cannot exceed 50 characters"]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Index for efficient querying
categorySchema.index({ isActive: 1, name: 1 });

module.exports = mongoose.model("Category", categorySchema);