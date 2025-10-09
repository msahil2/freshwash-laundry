const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Service = require('../models/Service');
const { sendEmail } = require('../utils/sendEmail');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    specialInstructions,
    isPaid,
    paidAt,
    paymentResult
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    // Verify all services exist (skip strict price validation for demo mode)
    for (const item of orderItems) {
      const service = await Service.findById(item.service);
      if (!service) {
        res.status(404);
        throw new Error(`Service not found: ${item.service}`);
      }

      // Optional: Check if service is active
      if (!service.isActive) {
        console.warn(`Service ${service.name} is inactive but order allowed in demo mode`);
      }

      // Skip strict price validation for demo/test payments
      if (paymentResult && paymentResult.isDemoMode) {
        console.log('Demo payment detected - skipping price validation');
      } else {
        // Only validate price in production mode
        const servicePrice = service.services[item.serviceType];
        if (servicePrice && servicePrice.available && servicePrice.price !== item.price) {
          console.warn(`Price mismatch for ${service.name} - ${item.serviceType}: expected ${servicePrice.price}, got ${item.price}`);
        }
      }
    }

    const order = new Order({
      orderItems: orderItems.map(item => ({
        service: item.service,
        serviceType: item.serviceType,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal || item.quantity * item.price
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      specialInstructions,
      isPaid: isPaid || false,
      paidAt: paidAt || null,
      paymentResult: paymentResult || null,
      status: isPaid ? 'confirmed' : 'pending'
    });

    const createdOrder = await order.save();
    
    // Populate the order with service details
    await createdOrder.populate('orderItems.service', 'name category image');
    await createdOrder.populate('user', 'name email phone');

    // Send order confirmation email
    try {
      await sendEmail({
        to: req.user.email,
        subject: 'Order Confirmation - FreshWash Laundry',
        template: 'orderConfirmation',
        data: {
          customerName: req.user.name,
          orderNumber: createdOrder._id,
          orderItems: createdOrder.orderItems,
          totalPrice: createdOrder.totalPrice,
          shippingAddress: createdOrder.shippingAddress
        }
      });
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      // Don't throw error, just log it
    }

    res.status(201).json({
      success: true,
      order: createdOrder
    });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('orderItems.service', 'name category image description');

  if (order) {
    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json({
      success: true,
      order
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this order');
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address || req.body.payer?.email_address
    };
    order.status = 'confirmed';

    const updatedOrder = await order.save();

    res.json({
      success: true,
      order: updatedOrder
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  let query = { user: req.user._id };
  
  if (status && status !== 'all') {
    query.status = status;
  }

  try {
    const orders = await Order.find(query)
      .populate('orderItems.service', 'name category image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500);
    throw new Error('Failed to fetch orders');
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  
  let query = {};
  
  if (status && status !== 'all') {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { 'shippingAddress.name': { $regex: search, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
    ];
  }

  const orders = await Order.find(query)
    .populate('user', 'name email phone')
    .populate('orderItems.service', 'name category')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments(query);

  res.json({
    success: true,
    orders,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    const oldStatus = order.status;
    order.status = status;

    if (status === 'completed') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    // Send status update email
    try {
      await sendEmail({
        to: order.user.email,
        subject: `Order Status Update - FreshWash Laundry`,
        template: 'statusUpdate',
        data: {
          customerName: order.user.name,
          orderNumber: order._id,
          oldStatus,
          newStatus: status,
          orderUrl: `${process.env.FRONTEND_URL}/orders/${order._id}`
        }
      });
    } catch (error) {
      console.error('Failed to send status update email:', error);
    }

    res.json({
      success: true,
      order: updatedOrder
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Check if user owns this order or is admin
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Not authorized to cancel this order');
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      res.status(400);
      throw new Error('Order cannot be cancelled at this stage');
    }

    order.status = 'cancelled';
    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: updatedOrder
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  cancelOrder
};