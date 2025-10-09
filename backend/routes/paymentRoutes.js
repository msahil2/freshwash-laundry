const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory
} = require('../controllers/paymentController');

const router = express.Router();

// @route   POST /api/payments/create-payment-intent
router.post('/create-payment-intent', [
  protect,
  body('amount', 'Amount is required').isNumeric().custom(value => value > 0),
  body('currency', 'Currency is required').optional().isIn(['inr', 'usd'])
], createPaymentIntent);

// @route   POST /api/payments/confirm
router.post('/confirm', [
  protect,
  body('paymentIntentId', 'Payment intent ID is required').notEmpty()
], confirmPayment);

// @route   GET /api/payments/history
router.get('/history', protect, getPaymentHistory);

module.exports = router;