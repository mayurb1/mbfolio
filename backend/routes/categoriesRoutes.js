const express = require("express");
const Category = require("../models/Category");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// GET /api/categories - Get all categories (public)
router.get("/", async (req, res) => {
  try {
    const { isActive, page = 1, limit = 50 } = req.query;
    
    // Build filter object
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Category.countDocuments(filter);

    const categories = await Category.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      data: {
        categories,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      },
      message: "Categories retrieved successfully",
      status: 200
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// GET /api/categories/:id - Get category by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        status: 404
      });
    }

    res.status(200).json({
      data: { category },
      message: "Category retrieved successfully",
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Category not found",
        status: 404
      });
    }
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// POST /api/categories - Create new category (protected)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, isActive } = req.body;

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
      return res.status(409).json({
        message: "Category with this name already exists",
        status: 409
      });
    }

    const category = new Category({
      name,
      isActive
    });

    await category.save();

    res.status(201).json({
      data: { category },
      message: "Category created successfully",
      status: 201
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = {};
      Object.keys(err.errors).forEach(key => {
        errors[key] = err.errors[key].message;
      });
      
      return res.status(400).json({
        message: 'Validation failed',
        status: 400,
        errors
      });
    }

    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// PUT /api/categories/:id - Update category (protected)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { name, isActive } = req.body;

    // Check if category exists
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        status: 404
      });
    }

    // Check if name is being changed and if new name already exists
    if (name && name.toLowerCase() !== category.name.toLowerCase()) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingCategory) {
        return res.status(409).json({
          message: "Category with this name already exists",
          status: 409
        });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, isActive },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      data: { category: updatedCategory },
      message: "Category updated successfully",
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Category not found",
        status: 404
      });
    }

    if (err.name === 'ValidationError') {
      const errors = {};
      Object.keys(err.errors).forEach(key => {
        errors[key] = err.errors[key].message;
      });
      
      return res.status(400).json({
        message: 'Validation failed',
        status: 400,
        errors
      });
    }

    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// DELETE /api/categories/:id - Delete category (protected)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        status: 404
      });
    }

    // Check if category is being used by any skills
    const Skills = require("../models/Skills");
    const skillsUsingCategory = await Skills.countDocuments({ category: category.name });
    
    if (skillsUsingCategory > 0) {
      return res.status(409).json({
        message: `Cannot delete category. ${skillsUsingCategory} skills are using this category.`,
        status: 409
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Category deleted successfully",
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Category not found",
        status: 404
      });
    }
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// PATCH /api/categories/:id/toggle-status - Toggle category active status (protected)
router.patch("/:id/toggle-status", authenticateToken, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        status: 404
      });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.status(200).json({
      data: { category },
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Category not found",
        status: 404
      });
    }
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

module.exports = router;