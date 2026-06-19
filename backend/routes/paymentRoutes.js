const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const {
  createOrder,
  verifyPayment,
  getPaymentHistory
} = require('../controllers/paymentController');

const router = express.Router();

// Create Razorpay order
router.post('/create-order', [
  protect,
  body('amount', 'Amount is required').isNumeric()
    .custom(value => value > 0)
], createOrder);

// Verify payment
router.post('/verify', [
  protect,
  body('razorpay_order_id', 'Order ID is required').notEmpty(),
  body('razorpay_payment_id', 'Payment ID is required').notEmpty(),
  body('razorpay_signature', 'Signature is required').notEmpty()
], verifyPayment);

// Payment history
router.get('/history', protect, getPaymentHistory);

module.exports = router;