const express = require('express');
const { body } = require('express-validator');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');

const router = express.Router();

// @route   POST /api/orders
router.post('/', [
  protect,
  body('orderItems', 'Order items are required').isArray().notEmpty(),
  body('shippingAddress.name', 'Shipping name is required').notEmpty().trim(),
  body('shippingAddress.street', 'Shipping address is required').notEmpty().trim(),
  body('shippingAddress.city', 'City is required').notEmpty().trim(),
  body('shippingAddress.zipCode', 'Zip code is required').notEmpty().trim(),
  body('paymentMethod', 'Payment method is required').notEmpty().trim(),
  body('totalPrice', 'Total price is required').isNumeric().custom(value => value > 0)
], addOrderItems);

// @route   GET /api/orders/myorders
router.get('/myorders', protect, getMyOrders);

// @route   GET /api/orders
router.get('/', protect, admin, getOrders);

// @route   GET /api/orders/:id
router.get('/:id', protect, getOrderById);

// @route   PUT /api/orders/:id/pay
router.put('/:id/pay', protect, updateOrderToPaid);

// @route   PUT /api/orders/:id/status
router.put('/:id/status', [
  protect,
  admin,
  body('status', 'Status is required').notEmpty().isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'])
], updateOrderStatus);

// @route   PUT /api/orders/:id/cancel
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;