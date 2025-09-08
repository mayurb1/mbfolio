const jwt = require("jsonwebtoken");
const Users = require("../models/users");
const tokenBlacklist = require("../utils/tokenBlacklist");

const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      message: 'No token provided',
      status: 401
    });
  }

  // Check if token is blacklisted
  if (tokenBlacklist.isBlacklisted(token)) {
    return res.status(401).json({
      message: 'Token has been revoked',
      status: 401
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Users.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        message: 'Invalid token',
        status: 401
      });
    }

    req.user = user;
    req.token = token; // Store token for potential blacklisting
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Invalid token',
      status: 401
    });
  }
};

module.exports = { authenticateToken };