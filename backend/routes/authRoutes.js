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

    // Return user data (without password) and success message
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email
    };

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

    // Return both token and user data (without password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email
    };

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

// Protected route example
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

module.exports = router;
