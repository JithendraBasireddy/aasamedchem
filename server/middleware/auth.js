const jwt = require('jsonwebtoken');

// Middleware to verify if a user is logged in via JWT
const verifyToken = (req, res, next) => {
  // Get token from header (usually format: "Bearer TOKEN_STRING")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Please log in first.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = verified; // Add decoded user payload (id, email, role) to request object
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// Middleware to check if user has Admin role
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access forbidden. Admin role required.' });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
