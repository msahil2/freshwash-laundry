const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  refreshToken,
  logoutUser
} = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/register
router.post('/register', [
  body('name', 'Name is required').notEmpty().trim().isLength({ min: 2, max: 50 }),
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], registerUser);

// @route   POST /api/auth/login
router.post('/login', [
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password is required').exists()
], authUser);

// @route   GET /api/auth/me
router.get('/me', protect, getUserProfile);

// @route   PUT /api/auth/profile
router.put('/profile', protect, updateUserProfile);

// @route   POST /api/auth/refresh
router.post('/refresh', refreshToken);

// @route   POST /api/auth/logout
router.post('/logout', protect, logoutUser);

module.exports = router;