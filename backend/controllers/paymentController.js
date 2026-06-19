const asyncHandler = require('express-async-handler');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', notes = {} } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Valid amount is required');
  }

  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency.toUpperCase(),
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        ...notes
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500);
    throw new Error('Payment initialization failed');
  }
});

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId
  } = req.body;

  try {
    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      res.status(400);
      throw new Error('Payment verification failed - Invalid signature');
    }

    // Update order if orderId provided
    if (orderId) {
      const order = await Order.findById(orderId);

      if (!order) {
        res.status(404);
        throw new Error('Order not found');
      }

      if (order.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
      }

      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'confirmed';
      order.paymentResult = {
        id: razorpay_payment_id,
        status: 'succeeded',
        update_time: new Date().toISOString(),
        email_address: req.user.email
      };

      await order.save();
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    console.error('Payment verification failed:', error);
    res.status(500);
    throw new Error('Payment verification failed');
  }
});

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
    isPaid: true
  })
    .select('_id totalPrice paidAt paymentResult status createdAt')
    .populate('orderItems.service', 'name category')
    .sort({ paidAt: -1 });

  const total = await Order.countDocuments({
    user: req.user._id,
    isPaid: true
  });

  const paymentStats = await Order.aggregate([
    {
      $match: {
        user: req.user._id,
        isPaid: true
      }
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$totalPrice' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalPrice' }
      }
    }
  ]);

  res.json({
    success: true,
    payments: orders,
    total,
    stats: paymentStats[0] || {
      totalSpent: 0,
      totalOrders: 0,
      averageOrderValue: 0
    }
  });
});

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentHistory
};