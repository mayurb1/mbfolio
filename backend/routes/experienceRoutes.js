const express = require("express");
const Experience = require("../models/Experience");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// GET /api/experience - Get all experiences (public)
router.get("/", async (req, res) => {
  try {
    const { isActive, search, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { company: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Experience.countDocuments(filter);

    const experiences = await Experience.find(filter)
      .populate('skills', 'name category proficiency')
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      data: {
        experiences,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      },
      message: "Experiences retrieved successfully",
      status: 200
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// GET /api/experience/:id - Get experience by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id)
      .populate('skills', 'name category proficiency');
    
    if (!experience) {
      return res.status(404).json({
        message: "Experience not found",
        status: 404
      });
    }

    res.status(200).json({
      data: { experience },
      message: "Experience retrieved successfully",
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Experience not found",
        status: 404
      });
    }
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// POST /api/experience - Create new experience (protected)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      company,
      position,
      duration,
      location,
      type,
      logo,
      website,
      description,
      achievements,
      skills,
      highlights,
      isActive,
      order
    } = req.body;

    // Check if experience with same company and position already exists
    const existingExperience = await Experience.findOne({ 
      company: { $regex: new RegExp(`^${company}$`, 'i') },
      position: { $regex: new RegExp(`^${position}$`, 'i') }
    });
    if (existingExperience) {
      return res.status(409).json({
        message: "Experience with this company and position already exists",
        status: 409
      });
    }

    const experience = new Experience({
      company,
      position,
      duration,
      location,
      type,
      logo,
      website,
      description,
      achievements,
      skills,
      highlights,
      isActive,
      order
    });

    const savedExperience = await experience.save();
    const populatedExperience = await Experience.findById(savedExperience._id)
      .populate('skills', 'name category proficiency');

    res.status(201).json({
      data: { experience: populatedExperience },
      message: "Experience created successfully",
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

// PUT /api/experience/:id - Update experience (protected)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const {
      company,
      position,
      duration,
      location,
      type,
      logo,
      website,
      description,
      achievements,
      skills,
      highlights,
      isActive,
      order
    } = req.body;

    // Check if experience exists
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({
        message: "Experience not found",
        status: 404
      });
    }

    // Check if company and position are being changed and if new combination already exists
    if ((company && company.toLowerCase() !== experience.company.toLowerCase()) ||
        (position && position.toLowerCase() !== experience.position.toLowerCase())) {
      const existingExperience = await Experience.findOne({ 
        company: { $regex: new RegExp(`^${company || experience.company}$`, 'i') },
        position: { $regex: new RegExp(`^${position || experience.position}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingExperience) {
        return res.status(409).json({
          message: "Experience with this company and position already exists",
          status: 409
        });
      }
    }

    const updatedExperience = await Experience.findByIdAndUpdate(
      req.params.id,
      {
        company,
        position,
        duration,
        location,
        type,
        logo,
        website,
        description,
        achievements,
        skills,
        highlights,
        isActive,
        order
      },
      { new: true, runValidators: true }
    );

    const populatedExperience = await Experience.findById(updatedExperience._id)
      .populate('skills', 'name category proficiency');

    res.status(200).json({
      data: { experience: populatedExperience },
      message: "Experience updated successfully",
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Experience not found",
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

// PATCH /api/experience/:id - Partial update experience (protected)
router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({
        message: "Experience not found",
        status: 404
      });
    }

    // Check if company and position are being changed and if new combination already exists
    if ((req.body.company && req.body.company.toLowerCase() !== experience.company.toLowerCase()) ||
        (req.body.position && req.body.position.toLowerCase() !== experience.position.toLowerCase())) {
      const existingExperience = await Experience.findOne({ 
        company: { $regex: new RegExp(`^${req.body.company || experience.company}$`, 'i') },
        position: { $regex: new RegExp(`^${req.body.position || experience.position}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingExperience) {
        return res.status(409).json({
          message: "Experience with this company and position already exists",
          status: 409
        });
      }
    }

    const updatedExperience = await Experience.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    const populatedExperience = await Experience.findById(updatedExperience._id)
      .populate('skills', 'name category proficiency');

    res.status(200).json({
      data: { experience: populatedExperience },
      message: "Experience updated successfully",
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Experience not found",
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

// DELETE /api/experience/:id - Delete experience (protected)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({
        message: "Experience not found",
        status: 404
      });
    }

    await Experience.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Experience deleted successfully",
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Experience not found",
        status: 404
      });
    }
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// POST /api/experience/bulk - Bulk create experiences (protected)
router.post("/bulk", authenticateToken, async (req, res) => {
  try {
    const { experiences } = req.body;
    
    if (!Array.isArray(experiences) || experiences.length === 0) {
      return res.status(400).json({
        message: "Experiences array is required",
        status: 400
      });
    }

    const createdExperiences = await Experience.insertMany(experiences, { ordered: false });

    res.status(201).json({
      data: { experiences: createdExperiences },
      message: `${createdExperiences.length} experiences created successfully`,
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
        message: "Some experiences already exist",
        status: 409
      });
    }

    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// PATCH /api/experience/bulk/toggle - Bulk toggle active status (protected)
router.patch("/bulk/toggle", authenticateToken, async (req, res) => {
  try {
    const { experienceIds, isActive } = req.body;
    
    if (!Array.isArray(experienceIds) || experienceIds.length === 0) {
      return res.status(400).json({
        message: "Experience IDs array is required",
        status: 400
      });
    }

    const result = await Experience.updateMany(
      { _id: { $in: experienceIds } },
      { $set: { isActive } }
    );

    res.status(200).json({
      data: { 
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      },
      message: `${result.modifiedCount} experiences updated successfully`,
      status: 200
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// PATCH /api/experience/:id/toggle-status - Toggle experience active status (protected)
router.patch("/:id/toggle-status", authenticateToken, async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({
        message: "Experience not found",
        status: 404
      });
    }

    experience.isActive = !experience.isActive;
    const savedExperience = await experience.save();
    
    const populatedExperience = await Experience.findById(savedExperience._id)
      .populate('skills', 'name category proficiency');

    res.status(200).json({
      data: { experience: populatedExperience },
      message: `Experience ${populatedExperience.isActive ? 'activated' : 'deactivated'} successfully`,
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Experience not found",
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