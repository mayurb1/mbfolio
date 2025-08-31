const express = require("express");
const Skills = require("../models/Skills");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// GET /api/skills - Get all skills (public)
router.get("/", async (req, res) => {
  try {
    const { category, isActive, search, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Add search functionality for skill name
    if (search) {
      filter.name = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Skills.countDocuments(filter);

    const skills = await Skills.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      data: {
        skills,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      },
      message: "Skills retrieved successfully",
      status: 200
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// GET /api/skills/categories - Get all skill categories (public)
router.get("/categories", async (req, res) => {
  try {
    const categories = await Skills.distinct("category", { isActive: true });
    
    res.status(200).json({
      data: { categories },
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

// GET /api/skills/:id - Get skill by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const skill = await Skills.findById(req.params.id);
    
    if (!skill) {
      return res.status(404).json({
        message: "Skill not found",
        status: 404
      });
    }

    res.status(200).json({
      data: { skill },
      message: "Skill retrieved successfully",
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Skill not found",
        status: 404
      });
    }
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// POST /api/skills - Create new skill (protected)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      name,
      category,
      proficiency,
      experience,
      description,
      icon,
      color,
      isActive,
      sortOrder
    } = req.body;

    // Check if skill with same name already exists
    const existingSkill = await Skills.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingSkill) {
      return res.status(409).json({
        message: "Skill with this name already exists",
        status: 409
      });
    }

    const skill = new Skills({
      name,
      category,
      proficiency,
      experience,
      description,
      icon,
      color,
      isActive,
      sortOrder
    });

    await skill.save();

    res.status(201).json({
      data: { skill },
      message: "Skill created successfully",
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

// PUT /api/skills/:id - Update skill (protected)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const {
      name,
      category,
      proficiency,
      experience,
      description,
      icon,
      color,
      isActive,
      sortOrder
    } = req.body;

    // Check if skill exists
    const skill = await Skills.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({
        message: "Skill not found",
        status: 404
      });
    }

    // Check if name is being changed and if new name already exists
    if (name && name.toLowerCase() !== skill.name.toLowerCase()) {
      const existingSkill = await Skills.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingSkill) {
        return res.status(409).json({
          message: "Skill with this name already exists",
          status: 409
        });
      }
    }

    const updatedSkill = await Skills.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category,
        proficiency,
        experience,
        description,
        icon,
        color,
        isActive,
        sortOrder
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      data: { skill: updatedSkill },
      message: "Skill updated successfully",
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Skill not found",
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

// PATCH /api/skills/:id - Partial update skill (protected)
router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const skill = await Skills.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({
        message: "Skill not found",
        status: 404
      });
    }

    // Check if name is being changed and if new name already exists
    if (req.body.name && req.body.name.toLowerCase() !== skill.name.toLowerCase()) {
      const existingSkill = await Skills.findOne({ 
        name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingSkill) {
        return res.status(409).json({
          message: "Skill with this name already exists",
          status: 409
        });
      }
    }

    const updatedSkill = await Skills.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      data: { skill: updatedSkill },
      message: "Skill updated successfully",
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Skill not found",
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

// DELETE /api/skills/:id - Delete skill (protected)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const skill = await Skills.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({
        message: "Skill not found",
        status: 404
      });
    }

    await Skills.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Skill deleted successfully",
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Skill not found",
        status: 404
      });
    }
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// POST /api/skills/bulk - Bulk create skills (protected)
router.post("/bulk", authenticateToken, async (req, res) => {
  try {
    const { skills } = req.body;
    
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        message: "Skills array is required",
        status: 400
      });
    }

    const createdSkills = await Skills.insertMany(skills, { ordered: false });

    res.status(201).json({
      data: { skills: createdSkills },
      message: `${createdSkills.length} skills created successfully`,
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

    // Handle bulk write errors
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Some skills already exist",
        status: 409
      });
    }

    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// PATCH /api/skills/bulk/toggle - Bulk toggle active status (protected)
router.patch("/bulk/toggle", authenticateToken, async (req, res) => {
  try {
    const { skillIds, isActive } = req.body;
    
    if (!Array.isArray(skillIds) || skillIds.length === 0) {
      return res.status(400).json({
        message: "Skill IDs array is required",
        status: 400
      });
    }

    const result = await Skills.updateMany(
      { _id: { $in: skillIds } },
      { $set: { isActive } }
    );

    res.status(200).json({
      data: { 
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      },
      message: `${result.modifiedCount} skills updated successfully`,
      status: 200
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

module.exports = router;