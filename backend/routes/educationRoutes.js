const express = require("express");
const Education = require("../models/Education");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// GET /api/education - Get all education records (public)
router.get("/", async (req, res) => {
  try {
    const { isActive, search, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { institution: { $regex: search, $options: 'i' } },
        { degree: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Education.countDocuments(filter);

    const education = await Education.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      data: {
        education,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      },
      message: "Education records retrieved successfully",
      status: 200
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// GET /api/education/:id - Get education by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const education = await Education.findById(req.params.id);
    
    if (!education) {
      return res.status(404).json({
        message: "Education record not found",
        status: 404
      });
    }

    res.status(200).json({
      data: { education },
      message: "Education record retrieved successfully",
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Education record not found",
        status: 404
      });
    }
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// POST /api/education - Create new education record (protected)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      institution,
      degree,
      duration,
      location,
      gpa,
      logo,
      website,
      description,
      achievements,
      isActive,
      order
    } = req.body;

    // Check if education record with same institution and degree already exists
    const existingEducation = await Education.findOne({ 
      institution: { $regex: new RegExp(`^${institution}$`, 'i') },
      degree: { $regex: new RegExp(`^${degree}$`, 'i') }
    });
    if (existingEducation) {
      return res.status(409).json({
        message: "Education record with this institution and degree already exists",
        status: 409
      });
    }

    const education = new Education({
      institution,
      degree,
      duration,
      location,
      gpa,
      logo,
      website,
      description,
      achievements,
      isActive,
      order
    });

    await education.save();

    res.status(201).json({
      data: { education },
      message: "Education record created successfully",
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

// PUT /api/education/:id - Update education record (protected)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const {
      institution,
      degree,
      duration,
      location,
      gpa,
      logo,
      website,
      description,
      achievements,
      isActive,
      order
    } = req.body;

    // Check if education record exists
    const education = await Education.findById(req.params.id);
    if (!education) {
      return res.status(404).json({
        message: "Education record not found",
        status: 404
      });
    }

    // Check if institution and degree are being changed and if new combination already exists
    if ((institution && institution.toLowerCase() !== education.institution.toLowerCase()) ||
        (degree && degree.toLowerCase() !== education.degree.toLowerCase())) {
      const existingEducation = await Education.findOne({ 
        institution: { $regex: new RegExp(`^${institution || education.institution}$`, 'i') },
        degree: { $regex: new RegExp(`^${degree || education.degree}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingEducation) {
        return res.status(409).json({
          message: "Education record with this institution and degree already exists",
          status: 409
        });
      }
    }

    const updatedEducation = await Education.findByIdAndUpdate(
      req.params.id,
      {
        institution,
        degree,
        duration,
        location,
        gpa,
        logo,
        website,
        description,
        achievements,
        isActive,
        order
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      data: { education: updatedEducation },
      message: "Education record updated successfully",
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Education record not found",
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

// PATCH /api/education/:id - Partial update education record (protected)
router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const education = await Education.findById(req.params.id);
    if (!education) {
      return res.status(404).json({
        message: "Education record not found",
        status: 404
      });
    }

    // Check if institution and degree are being changed and if new combination already exists
    if ((req.body.institution && req.body.institution.toLowerCase() !== education.institution.toLowerCase()) ||
        (req.body.degree && req.body.degree.toLowerCase() !== education.degree.toLowerCase())) {
      const existingEducation = await Education.findOne({ 
        institution: { $regex: new RegExp(`^${req.body.institution || education.institution}$`, 'i') },
        degree: { $regex: new RegExp(`^${req.body.degree || education.degree}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingEducation) {
        return res.status(409).json({
          message: "Education record with this institution and degree already exists",
          status: 409
        });
      }
    }

    const updatedEducation = await Education.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      data: { education: updatedEducation },
      message: "Education record updated successfully",
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Education record not found",
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

// DELETE /api/education/:id - Delete education record (protected)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const education = await Education.findById(req.params.id);
    if (!education) {
      return res.status(404).json({
        message: "Education record not found",
        status: 404
      });
    }

    await Education.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Education record deleted successfully",
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Education record not found",
        status: 404
      });
    }
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// POST /api/education/bulk - Bulk create education records (protected)
router.post("/bulk", authenticateToken, async (req, res) => {
  try {
    const { education } = req.body;
    
    if (!Array.isArray(education) || education.length === 0) {
      return res.status(400).json({
        message: "Education array is required",
        status: 400
      });
    }

    const createdEducation = await Education.insertMany(education, { ordered: false });

    res.status(201).json({
      data: { education: createdEducation },
      message: `${createdEducation.length} education records created successfully`,
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
        message: "Some education records already exist",
        status: 409
      });
    }

    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// PATCH /api/education/bulk/toggle - Bulk toggle active status (protected)
router.patch("/bulk/toggle", authenticateToken, async (req, res) => {
  try {
    const { educationIds, isActive } = req.body;
    
    if (!Array.isArray(educationIds) || educationIds.length === 0) {
      return res.status(400).json({
        message: "Education IDs array is required",
        status: 400
      });
    }

    const result = await Education.updateMany(
      { _id: { $in: educationIds } },
      { $set: { isActive } }
    );

    res.status(200).json({
      data: { 
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      },
      message: `${result.modifiedCount} education records updated successfully`,
      status: 200
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// PATCH /api/education/:id/toggle-status - Toggle education active status (protected)
router.patch("/:id/toggle-status", authenticateToken, async (req, res) => {
  try {
    const education = await Education.findById(req.params.id);
    if (!education) {
      return res.status(404).json({
        message: "Education record not found",
        status: 404
      });
    }

    education.isActive = !education.isActive;
    await education.save();

    res.status(200).json({
      data: { education },
      message: `Education record ${education.isActive ? 'activated' : 'deactivated'} successfully`,
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Education record not found",
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