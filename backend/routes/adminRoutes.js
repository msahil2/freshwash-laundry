const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  getRevenue
} = require('../controllers/adminController');

const router = express.Router();

// All routes are protected and admin-only
router.use(protect);
router.use(admin);

// @route   GET /api/admin/stats
router.get('/stats', getDashboardStats);

// @route   GET /api/admin/users
router.get('/users', getAllUsers);

// @route   GET /api/admin/users/:id
router.get('/users/:id', getUserById);

// @route   PUT /api/admin/users/:id
router.put('/users/:id', updateUser);

// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', deleteUser);

// @route   GET /api/admin/orders
router.get('/orders', getAllOrders);

// @route   PUT /api/admin/orders/:id
router.put('/orders/:id', updateOrderStatus);

// @route   GET /api/admin/revenue
router.get('/revenue', getRevenue);

module.exports = router;