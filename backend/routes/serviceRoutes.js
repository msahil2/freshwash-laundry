const express = require('express');
const { body } = require('express-validator');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getServices,
  getServiceById,
  getServicesByCategory,
  createService,
  updateService,
  deleteService,
  getServiceCategories
} = require('../controllers/serviceController');

const router = express.Router();

// @route   GET /api/services
router.get('/', getServices);

// @route   GET /api/services/categories
router.get('/categories', getServiceCategories);

// @route   GET /api/services/category/:category
router.get('/category/:category', getServicesByCategory);

// @route   GET /api/services/:id
router.get('/:id', getServiceById);

// @route   POST /api/services
router.post('/', [
  protect,
  admin,
  body('name', 'Service name is required').notEmpty().trim(),
  body('description', 'Description is required').notEmpty().trim(),
  body('category', 'Category is required').notEmpty().trim()
], createService);

// @route   PUT /api/services/:id
router.put('/:id', [
  protect,
  admin,
  body('name', 'Service name is required').optional().notEmpty().trim(),
  body('description', 'Description is required').optional().notEmpty().trim(),
  body('category', 'Category is required').optional().notEmpty().trim()
], updateService);

// @route   DELETE /api/services/:id
router.delete('/:id', protect, admin, deleteService);

module.exports = router;