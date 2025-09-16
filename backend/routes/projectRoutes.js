const express = require("express");
const Project = require("../models/Project");
const { authenticateToken } = require("../middleware/auth");
const { upload, cleanupFile } = require("../middleware/upload");
const uploadService = require("../services/uploadService");
const { uploadLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// GET /api/projects - Get all projects (public)
router.get("/", async (req, res) => {
  try {
    const { isActive, category, type, featured, search, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (featured !== undefined) filter.featured = featured === 'true';
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    let projects, total;

    if (search) {
      // Use aggregation pipeline for search with populated fields
      const pipeline = [
        { $match: filter },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $lookup: {
            from: 'skills',
            localField: 'technologies',
            foreignField: '_id',
            as: 'technologies'
          }
        },
        {
          $match: {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
              { 'technologies.name': { $regex: search, $options: 'i' } }
            ]
          }
        },
        { $sort: { featured: -1, order: 1, createdAt: -1 } }
      ];

      const countPipeline = [...pipeline, { $count: "total" }];
      const totalResult = await Project.aggregate(countPipeline);
      total = totalResult.length > 0 ? totalResult[0].total : 0;

      const dataPipeline = [...pipeline, { $skip: skip }, { $limit: parseInt(limit) }];
      projects = await Project.aggregate(dataPipeline);
    } else {
      // Regular query without search
      total = await Project.countDocuments(filter);
      projects = await Project.find(filter)
        .populate('category', 'name')
        .populate('technologies', 'name')
        .sort({ featured: -1, order: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    res.status(200).json({
      data: {
        projects,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      },
      message: "Projects retrieved successfully",
      status: 200
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// GET /api/projects/:id - Get project by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('category', 'name')
      .populate('technologies', 'name');
    
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
        status: 404
      });
    }

    res.status(200).json({
      data: { project },
      message: "Project retrieved successfully",
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Project not found",
        status: 404
      });
    }
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// POST /api/projects - Create new project (protected)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      fullDescription,
      category,
      status,
      type,
      technologies,
      highlights,
      images,
      mainImage,
      github,
      demo,
      duration,
      team,
      featured,
      isActive,
      order
    } = req.body;

    // Check if project with same title already exists
    const existingProject = await Project.findOne({ 
      title: { $regex: new RegExp(`^${title}$`, 'i') }
    });
    if (existingProject) {
      return res.status(409).json({
        message: "Project with this title already exists",
        status: 409
      });
    }

    const project = new Project({
      title,
      description,
      fullDescription,
      category,
      status,
      type,
      technologies,
      highlights,
      images,
      mainImage,
      github,
      demo,
      duration,
      team,
      featured,
      isActive,
      order
    });

    await project.save();
    await project.populate('category', 'name');
    await project.populate('technologies', 'name');

    res.status(201).json({
      data: { project },
      message: "Project created successfully",
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

// PUT /api/projects/:id - Update project (protected)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      fullDescription,
      category,
      status,
      type,
      technologies,
      highlights,
      images,
      mainImage,
      github,
      demo,
      duration,
      team,
      featured,
      isActive,
      order
    } = req.body;

    // Check if project exists
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
        status: 404
      });
    }

    // Check if title is being changed and if new title already exists
    if (title && title.toLowerCase() !== project.title.toLowerCase()) {
      const existingProject = await Project.findOne({ 
        title: { $regex: new RegExp(`^${title}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingProject) {
        return res.status(409).json({
          message: "Project with this title already exists",
          status: 409
        });
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        fullDescription,
        category,
        status,
        type,
        technologies,
        highlights,
        images,
        mainImage,
        github,
        demo,
        duration,
        team,
        featured,
        isActive,
        order
      },
      { new: true, runValidators: true }
    ).populate('category', 'name').populate('technologies', 'name');

    res.status(200).json({
      data: { project: updatedProject },
      message: "Project updated successfully",
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Project not found",
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

// PATCH /api/projects/:id - Partial update project (protected)
router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
        status: 404
      });
    }

    // Check if title is being changed and if new title already exists
    if (req.body.title && req.body.title.toLowerCase() !== project.title.toLowerCase()) {
      const existingProject = await Project.findOne({ 
        title: { $regex: new RegExp(`^${req.body.title}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingProject) {
        return res.status(409).json({
          message: "Project with this title already exists",
          status: 409
        });
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('category', 'name').populate('technologies', 'name');

    res.status(200).json({
      data: { project: updatedProject },
      message: "Project updated successfully",
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Project not found",
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

// DELETE /api/projects/:id - Delete project (protected)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
        status: 404
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Project deleted successfully",
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Project not found",
        status: 404
      });
    }
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// POST /api/projects/bulk - Bulk create projects (protected)
router.post("/bulk", authenticateToken, async (req, res) => {
  try {
    const { projects } = req.body;
    
    if (!Array.isArray(projects) || projects.length === 0) {
      return res.status(400).json({
        message: "Projects array is required",
        status: 400
      });
    }

    const createdProjects = await Project.insertMany(projects, { ordered: false });

    res.status(201).json({
      data: { projects: createdProjects },
      message: `${createdProjects.length} projects created successfully`,
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
        message: "Some projects already exist",
        status: 409
      });
    }

    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// PATCH /api/projects/bulk/toggle - Bulk toggle active status (protected)
router.patch("/bulk/toggle", authenticateToken, async (req, res) => {
  try {
    const { projectIds, isActive } = req.body;
    
    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({
        message: "Project IDs array is required",
        status: 400
      });
    }

    const result = await Project.updateMany(
      { _id: { $in: projectIds } },
      { $set: { isActive } }
    );

    res.status(200).json({
      data: { 
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      },
      message: `${result.modifiedCount} projects updated successfully`,
      status: 200
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// PATCH /api/projects/:id/toggle-status - Toggle project active status (protected)
router.patch("/:id/toggle-status", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
        status: 404
      });
    }

    project.isActive = !project.isActive;
    await project.save();
    await project.populate('category', 'name');
    await project.populate('technologies', 'name');

    res.status(200).json({
      data: { project },
      message: `Project ${project.isActive ? 'activated' : 'deactivated'} successfully`,
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Project not found",
        status: 404
      });
    }
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// PATCH /api/projects/:id/toggle-featured - Toggle project featured status (protected)
router.patch("/:id/toggle-featured", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
        status: 404
      });
    }

    project.featured = !project.featured;
    await project.save();
    await project.populate('category', 'name');
    await project.populate('technologies', 'name');

    res.status(200).json({
      data: { project },
      message: `Project ${project.featured ? 'marked as featured' : 'unmarked as featured'} successfully`,
      status: 200
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        message: "Project not found",
        status: 404
      });
    }
    res.status(500).json({
      message: err.message,
      status: 500
    });
  }
});

// Upload project image (protected)
router.post("/upload-image", uploadLimiter, authenticateToken, upload.single('file'), cleanupFile, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file provided",
        status: 400
      });
    }

    const imageUrl = await uploadService.uploadProjectImage(req.file);

    res.json({
      data: { imageUrl },
      message: "Project image uploaded successfully",
      status: 200
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      status: 400
    });
  }
});

// Delete project image (protected)
router.delete("/delete-image", authenticateToken, async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        message: "Public ID is required",
        status: 400
      });
    }

    await uploadService.deleteFile(publicId, 'image');

    res.json({
      message: "Project image deleted successfully",
      status: 200
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      status: 400
    });
  }
});

module.exports = router;