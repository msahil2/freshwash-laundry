const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Order = require('../models/Order');

// @desc    Create payment intent (Demo Mode)
// @route   POST /api/payments/create-payment-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { amount, currency = 'inr', orderId, metadata = {} } = req.body;

  try {
    // Generate demo payment intent ID
    const demoPaymentIntentId = `pi_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const demoClientSecret = `${demoPaymentIntentId}_secret_${Math.random().toString(36).substr(2, 9)}`;

    // Convert amount to smallest currency unit (paise for INR)
    const paymentAmount = Math.round(amount * 100);

    // Log demo payment creation
    console.log('Demo Payment Intent Created:', {
      id: demoPaymentIntentId,
      amount: paymentAmount,
      currency,
      userId: req.user._id,
      orderId: orderId || 'none'
    });

    res.json({
      success: true,
      clientSecret: demoClientSecret,
      paymentIntentId: demoPaymentIntentId,
      amount: paymentAmount,
      currency: currency.toLowerCase(),
      isDemoMode: true
    });
  } catch (error) {
    console.error('Demo payment intent creation failed:', error);
    res.status(500);
    throw new Error('Payment initialization failed');
  }
});

// @desc    Confirm payment (Demo Mode)
// @route   POST /api/payments/confirm
// @access  Private
const confirmPayment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { paymentIntentId, orderId } = req.body;

  try {
    // Simulate payment verification (always succeeds in demo mode)
    const demoPaymentIntent = {
      id: paymentIntentId,
      status: 'succeeded',
      amount: 0,
      currency: 'inr'
    };

    console.log('Demo Payment Confirmed:', demoPaymentIntent.id);

    // Update order if orderId provided
    if (orderId) {
      const order = await Order.findById(orderId);
      
      if (!order) {
        res.status(404);
        throw new Error('Order not found');
      }

      // Verify order belongs to user
      if (order.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to access this order');
      }

      // Update order payment status
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: demoPaymentIntent.id,
        status: demoPaymentIntent.status,
        update_time: new Date().toISOString(),
        email_address: req.user.email,
        isDemoMode: true
      };
      order.status = 'confirmed';

      await order.save();

      res.json({
        success: true,
        message: 'Demo payment confirmed and order updated',
        order: {
          _id: order._id,
          isPaid: order.isPaid,
          paidAt: order.paidAt,
          status: order.status,
          totalPrice: order.totalPrice
        },
        paymentIntent: {
          id: demoPaymentIntent.id,
          status: demoPaymentIntent.status,
          amount: demoPaymentIntent.amount,
          currency: demoPaymentIntent.currency,
          isDemoMode: true
        }
      });
    } else {
      res.json({
        success: true,
        message: 'Demo payment confirmed',
        paymentIntent: {
          id: demoPaymentIntent.id,
          status: demoPaymentIntent.status,
          amount: demoPaymentIntent.amount,
          currency: demoPaymentIntent.currency,
          isDemoMode: true
        }
      });
    }
  } catch (error) {
    console.error('Demo payment confirmation failed:', error);
    res.status(500);
    throw new Error('Payment confirmation failed');
  }
});

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    // Get orders with payment information for the user
    const orders = await Order.find({
      user: req.user._id,
      isPaid: true
    })
      .select('_id totalPrice paidAt paymentResult status createdAt')
      .populate('orderItems.service', 'name category')
      .sort({ paidAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments({
      user: req.user._id,
      isPaid: true
    });

    // Calculate payment statistics
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
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      stats: paymentStats[0] || {
        totalSpent: 0,
        totalOrders: 0,
        averageOrderValue: 0
      },
      isDemoMode: true
    });
  } catch (error) {
    console.error('Failed to get payment history:', error);
    res.status(500);
    throw new Error('Failed to retrieve payment history');
  }
});

// @desc    Handle webhook (Demo Mode - No-op)
// @route   POST /api/payments/webhook
// @access  Public
const handleStripeWebhook = asyncHandler(async (req, res) => {
  console.log('Demo webhook received (ignored in demo mode)');
  res.json({ 
    received: true, 
    isDemoMode: true,
    message: 'Webhook processing disabled in demo mode' 
  });
});

// @desc    Refund payment (Demo Mode)
// @route   POST /api/payments/refund
// @access  Private/Admin
const refundPayment = asyncHandler(async (req, res) => {
  const { paymentIntentId, amount, reason = 'requested_by_customer', orderId } = req.body;

  try {
    // Generate demo refund ID
    const demoRefundId = `re_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('Demo Refund Created:', {
      refundId: demoRefundId,
      paymentIntentId,
      amount,
      reason
    });

    // Update order status if orderId provided
    if (orderId) {
      const order = await Order.findById(orderId);
      
      if (order) {
        order.status = 'refunded';
        order.refundedAt = Date.now();
        order.refundReason = reason;
        await order.save();
      }
    }

    res.json({
      success: true,
      refund: {
        id: demoRefundId,
        amount: amount || 0,
        status: 'succeeded',
        reason: reason,
        isDemoMode: true
      },
      message: 'Demo refund processed successfully'
    });
  } catch (error) {
    console.error('Demo refund failed:', error);
    res.status(500);
    throw new Error('Refund processing failed');
  }
});

// @desc    Process demo payment (all-in-one endpoint)
// @route   POST /api/payments/process-demo
// @access  Private
const processDemoPayment = asyncHandler(async (req, res) => {
  const { orderId, cardDetails } = req.body;

  try {
    const order = await Order.findById(orderId);
    
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Verify order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this order');
    }

    // Generate demo payment ID
    const demoPaymentId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update order
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: demoPaymentId,
      status: 'succeeded',
      update_time: new Date().toISOString(),
      email_address: req.user.email,
      cardLast4: cardDetails?.cardNumber?.slice(-4) || 'XXXX',
      isDemoMode: true
    };
    order.status = 'confirmed';

    await order.save();

    console.log('Demo Payment Processed:', {
      orderId: order._id,
      paymentId: demoPaymentId,
      amount: order.totalPrice
    });

    res.json({
      success: true,
      message: 'Payment processed successfully (Demo Mode)',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        status: order.status,
        totalPrice: order.totalPrice
      },
      isDemoMode: true
    });
  } catch (error) {
    console.error('Demo payment processing failed:', error);
    res.status(500);
    throw new Error('Payment processing failed');
  }
});

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  handleStripeWebhook,
  refundPayment,
  processDemoPayment
};