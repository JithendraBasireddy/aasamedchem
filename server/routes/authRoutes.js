const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Private route (requires valid JWT token in Authorization header)
router.get('/me', verifyToken, getMe);

module.exports = router;
