const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

const authorizeBase = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next();
  }
  
  if (req.user.role === 'base_commander' && req.user.baseId !== req.body.baseId && req.user.baseId !== req.params.baseId) {
    return res.status(403).json({ message: 'Access denied to this base' });
  }
  
  next();
};

module.exports = { authenticateToken, authorizeRoles, authorizeBase };
