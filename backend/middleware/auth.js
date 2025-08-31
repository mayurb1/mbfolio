const jwt = require("jsonwebtoken");
const Users = require("../models/users");

const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      message: 'No token provided',
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
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Invalid token',
      status: 401
    });
  }
};

module.exports = { authenticateToken };