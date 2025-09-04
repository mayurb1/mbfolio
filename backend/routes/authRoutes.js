const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require("../models/users");

const router = express.Router();

// Check if registration is allowed
router.get("/registration-status", async (req, res) => {
  try {
    const existingAdminCount = await Users.countDocuments({});
    const isRegistrationAllowed = existingAdminCount === 0;

    res.json({
      data: {
        isRegistrationAllowed,
        adminExists: existingAdminCount > 0
      },
      message: isRegistrationAllowed ? "Registration is allowed" : "Registration is closed - admin already exists",
      status: 200
    });
  } catch (err) {
    res.status(500).json({ 
      message: err.message,
      status: 500
    });
  }
});

// Register (one-time admin registration only)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if any admin user already exists (since this is admin panel)
    const existingAdminCount = await Users.countDocuments({});
    if (existingAdminCount > 0) {
      return res.status(403).json({ 
        message: "Admin user already exists. Only one admin is allowed.",
        status: 403
      });
    }

    // Check if user exists (additional check for specific email)
    const existingUser = await Users.findOne({ email });
    if (existingUser) return res.status(400).json({ 
      message: "User already exists",
      status: 400
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const user = new Users({ name, email, password: hashedPassword });
    await user.save();

    // Get user data without password
    const userResponse = await Users.findById(user._id).select("-password");

    res.status(201).json({ 
      data: userResponse,
      message: "Admin user registered successfully",
      status: 201
    });
  } catch (err) {
    res.status(500).json({ 
      message: err.message,
      status: 500
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await Users.findOne({ email });
    if (!user) return res.status(400).json({ 
      message: "Invalid credentials",
      status: 400
    });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ 
      message: "Invalid credentials",
      status: 400
    });

    // Sign token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    // Get user data without password
    const userResponse = await Users.findById(user._id).select("-password");

    res.json({ 
      data: {
        token,
        user: userResponse
      },
      message: "Login successful",
      status: 200
    });
  } catch (err) {
    res.status(500).json({ 
      message: err.message,
      status: 500
    });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ 
        message: "No token provided",
        status: 401
      });
    }

    // Verify token is valid before processing logout
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ 
        message: "Invalid token",
        status: 401
      });
    }

    // In a production app, you might want to:
    // 1. Add token to a blacklist/revocation list
    // 2. Store tokens in Redis with expiration
    // 3. Use refresh tokens with shorter-lived access tokens
    
    // For now, we'll just send a success response
    // The client will clear the token from localStorage
    res.json({ 
      message: "Logout successful",
      status: 200
    });
  } catch (err) {
    res.status(500).json({ 
      message: err.message,
      status: 500
    });
  }
});

// Get current user profile
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ 
    message: "No token provided",
    status: 401
  });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Users.findById(decoded.id).select("-password");
    res.json({ 
      data: { user },
      message: "User data retrieved successfully",
      status: 200
    });
  } catch (err) {
    res.status(401).json({ 
      message: "Invalid token",
      status: 401
    });
  }
});

// Update user profile
router.put("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ 
    message: "No token provided",
    status: 401
  });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, email, phone, bio, profileImage } = req.body;

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await Users.findOne({ email, _id: { $ne: decoded.id } });
      if (existingUser) {
        return res.status(400).json({ 
          message: "Email already in use by another user",
          status: 400
        });
      }
    }

    // Prepare update data (only include provided fields)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    // Update user
    const user = await Users.findByIdAndUpdate(
      decoded.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: 404
      });
    }

    res.json({ 
      data: { user },
      message: "Profile updated successfully",
      status: 200
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: err.message,
        status: 400
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: "Invalid token",
        status: 401
      });
    }

    res.status(500).json({ 
      message: err.message,
      status: 500
    });
  }
});

// Change password
router.patch("/change-password", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ 
    message: "No token provided",
    status: 401
  });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
        status: 400
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
        status: 400
      });
    }

    // Find user with password
    const user = await Users.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: 404
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: "Current password is incorrect",
        status: 400
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await Users.findByIdAndUpdate(decoded.id, { password: hashedNewPassword });

    res.json({ 
      message: "Password changed successfully",
      status: 200
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: "Invalid token",
        status: 401
      });
    }

    res.status(500).json({ 
      message: err.message,
      status: 500
    });
  }
});

module.exports = router;
