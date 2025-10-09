const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');
const Service = require('../models/Service');
const Feedback = require('../models/Feedback');
const Contact = require('../models/Contact');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query; // days
  const periodDays = parseInt(period);
  const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

  try {
    // Get basic counts
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const totalOrders = await Order.countDocuments();
    const totalServices = await Service.countDocuments({ isActive: true });
    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Period-specific stats
    const periodOrders = await Order.countDocuments({
      createdAt: { $gte: startDate }
    });
    
    const periodRevenue = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate },
          isPaid: true 
        }
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const newUsersThisPeriod = await User.countDocuments({
      createdAt: { $gte: startDate },
      isAdmin: false
    });

    // Order status distribution
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue trend (last 7 days)
    const revenueTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          isPaid: true
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Top services by orders
    const topServices = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.service',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$orderItems.subtotal' }
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'service'
        }
      },
      { $unwind: '$service' },
      {
        $project: {
          serviceName: '$service.name',
          category: '$service.category',
          totalOrders: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 5 }
    ]);

    // Recent feedback
    const recentFeedback = await Feedback.find({ isApproved: true })
      .populate('user', 'name')
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Unread contacts
    const unreadContacts = await Contact.countDocuments({ isRead: false });

    // Average rating
    const avgRating = await Feedback.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    res.json({
      success: true,
      stats: {
        overview: {
          totalUsers,
          totalOrders,
          totalServices,
          totalRevenue: totalRevenue[0]?.total || 0,
          averageRating: avgRating[0]?.avgRating || 0
        },
        period: {
          days: periodDays,
          orders: periodOrders,
          revenue: periodRevenue[0]?.total || 0,
          newUsers: newUsersThisPeriod
        },
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        revenueTrend,
        topServices,
        recentFeedback,
        unreadContacts
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500);
    throw new Error('Failed to fetch dashboard statistics');
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isActive } = req.query;

  let query = { isAdmin: false };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    users,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    total
  });
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    // Get user's order statistics
    const userStats = await Order.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          avgOrderValue: { $avg: '$totalPrice' }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('orderItems.service', 'name');

    res.json({
      success: true,
      user,
      stats: userStats[0] || { totalOrders: 0, totalSpent: 0, avgOrderValue: 0 },
      recentOrders
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;
    
    // Only super admin can make users admin
    if (req.user.email === process.env.SUPER_ADMIN_EMAIL) {
      user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        isAdmin: updatedUser.isAdmin,
        isActive: updatedUser.isActive
      }
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error('Cannot delete admin user');
    }

    // Instead of deleting, deactivate the user
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated'
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all orders (admin view)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search, startDate, endDate } = req.query;

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

  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
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
    currentPage: parseInt(page),
    total
  });
});

// @desc    Update order status (admin)
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    const oldStatus = order.status;
    order.status = status;

    if (status === 'completed') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: Date.now(),
      note: note || `Status changed from ${oldStatus} to ${status} by admin`
    });

    const updatedOrder = await order.save();

    // Send email notification (implemented in orderController)
    try {
      const { sendEmail } = require('../utils/sendEmail');
      await sendEmail({
        to: order.user.email,
        subject: `Order Status Update - FreshWash Laundry`,
        template: 'statusUpdate',
        data: {
          customerName: order.user.name,
          orderNumber: order._id,
          oldStatus,
          newStatus: status,
          orderUrl: `${process.env.FRONTEND_URL}/dashboard#orders`
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

// @desc    Get revenue data
// @route   GET /api/admin/revenue
// @access  Private/Admin
const getRevenue = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query; // week, month, quarter, year

  let groupBy, matchDate;
  const now = new Date();

  switch (period) {
    case 'week':
      matchDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      break;
    case 'quarter':
      matchDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      groupBy = {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
      break;
    case 'year':
      matchDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      break;
    default: // month
      matchDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
  }

  const revenueData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: matchDate },
        isPaid: true
      }
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
        avgOrderValue: { $avg: '$totalPrice' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 }
    }
  ]);

  // Service category revenue
  const categoryRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: matchDate },
        isPaid: true
      }
    },
    { $unwind: '$orderItems' },
    {
      $lookup: {
        from: 'services',
        localField: 'orderItems.service',
        foreignField: '_id',
        as: 'service'
      }
    },
    { $unwind: '$service' },
    {
      $group: {
        _id: '$service.category',
        revenue: { $sum: '$orderItems.subtotal' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { revenue: -1 } }
  ]);

  // Total revenue summary
  const totalSummary = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: matchDate },
        isPaid: true
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        totalOrders: { $sum: 1 },
        avgOrderValue: { $avg: '$totalPrice' },
        maxOrderValue: { $max: '$totalPrice' },
        minOrderValue: { $min: '$totalPrice' }
      }
    }
  ]);

  res.json({
    success: true,
    period,
    summary: totalSummary[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      maxOrderValue: 0,
      minOrderValue: 0
    },
    revenueData,
    categoryRevenue
  });
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  getRevenue
};