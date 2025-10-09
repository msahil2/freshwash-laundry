const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const Service = require('../models/Service');

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Private
const createFeedback = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const {
    order,
    service,
    rating,
    comment,
    serviceQuality,
    deliverySpeed,
    valueForMoney,
    wouldRecommend
  } = req.body;

  // Check if order exists and belongs to user (if order is provided)
  if (order) {
    const orderDoc = await Order.findById(order);
    if (!orderDoc) {
      res.status(404);
      throw new Error('Order not found');
    }
    
    if (orderDoc.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to give feedback for this order');
    }

    // Check if feedback already exists for this order
    const existingFeedback = await Feedback.findOne({ user: req.user._id, order });
    if (existingFeedback) {
      res.status(400);
      throw new Error('Feedback already submitted for this order');
    }
  }

  // Verify service exists (if service is provided)
  if (service) {
    const serviceDoc = await Service.findById(service);
    if (!serviceDoc) {
      res.status(404);
      throw new Error('Service not found');
    }
  }

  const feedback = await Feedback.create({
    user: req.user._id,
    order,
    service,
    rating,
    comment,
    serviceQuality,
    deliverySpeed,
    valueForMoney,
    wouldRecommend
  });

  await feedback.populate('user', 'name email');
  await feedback.populate('service', 'name category');

  res.status(201).json({
    success: true,
    feedback
  });
});

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Public
const getFeedback = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, rating, service, approved = 'true' } = req.query;
  
  let query = { isPublic: true };
  
  // Filter by approval status (only admins can see unapproved)
  if (!req.user || !req.user.isAdmin) {
    query.isApproved = true;
  } else if (approved !== 'all') {
    query.isApproved = approved === 'true';
  }

  // Filter by rating
  if (rating && rating !== 'all') {
    if (rating === '4+') {
      query.rating = { $gte: 4 };
    } else {
      query.rating = parseInt(rating);
    }
  }

  // Filter by service
  if (service && service !== 'all') {
    query.service = service;
  }

  const feedback = await Feedback.find(query)
    .populate('user', 'name')
    .populate('service', 'name category')
    .populate('order', 'createdAt')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Feedback.countDocuments(query);

  // Calculate average rating
  const ratingStats = await Feedback.aggregate([
    { $match: { isApproved: true, isPublic: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
      }
    }
  ]);

  res.json({
    success: true,
    feedback,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    total,
    stats: ratingStats[0] || {
      averageRating: 0,
      totalReviews: 0,
      fiveStars: 0,
      fourStars: 0,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0
    }
  });
});

// @desc    Get feedback by service
// @route   GET /api/feedback/service/:serviceId
// @access  Public
const getFeedbackByService = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const feedback = await Feedback.find({
    service: serviceId,
    isApproved: true,
    isPublic: true
  })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Feedback.countDocuments({
    service: serviceId,
    isApproved: true,
    isPublic: true
  });

  // Calculate average rating for this service
  const serviceStats = await Feedback.aggregate([
    { 
      $match: { 
        service: mongoose.Types.ObjectId(serviceId),
        isApproved: true,
        isPublic: true
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    feedback,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    total,
    serviceStats: serviceStats[0] || { averageRating: 0, totalReviews: 0 }
  });
});

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private
const updateFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);

  if (feedback) {
    // Check if user owns this feedback or is admin
    if (feedback.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Not authorized to update this feedback');
    }

    const {
      rating,
      comment,
      serviceQuality,
      deliverySpeed,
      valueForMoney,
      wouldRecommend,
      isApproved,
      isPublic
    } = req.body;

    feedback.rating = rating !== undefined ? rating : feedback.rating;
    feedback.comment = comment || feedback.comment;
    feedback.serviceQuality = serviceQuality !== undefined ? serviceQuality : feedback.serviceQuality;
    feedback.deliverySpeed = deliverySpeed !== undefined ? deliverySpeed : feedback.deliverySpeed;
    feedback.valueForMoney = valueForMoney !== undefined ? valueForMoney : feedback.valueForMoney;
    feedback.wouldRecommend = wouldRecommend !== undefined ? wouldRecommend : feedback.wouldRecommend;

    // Only admins can update approval and public status
    if (req.user.isAdmin) {
      feedback.isApproved = isApproved !== undefined ? isApproved : feedback.isApproved;
      feedback.isPublic = isPublic !== undefined ? isPublic : feedback.isPublic;
    }

    const updatedFeedback = await feedback.save();
    await updatedFeedback.populate('user', 'name email');
    await updatedFeedback.populate('service', 'name category');

    res.json({
      success: true,
      feedback: updatedFeedback
    });
  } else {
    res.status(404);
    throw new Error('Feedback not found');
  }
});

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private
const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);

  if (feedback) {
    // Check if user owns this feedback or is admin
    if (feedback.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Not authorized to delete this feedback');
    }

    await feedback.remove();

    res.json({
      success: true,
      message: 'Feedback removed'
    });
  } else {
    res.status(404);
    throw new Error('Feedback not found');
  }
});

// @desc    Add admin response to feedback
// @route   PUT /api/feedback/:id/respond
// @access  Private/Admin
const respondToFeedback = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const feedback = await Feedback.findById(req.params.id);

  if (feedback) {
    feedback.adminResponse = {
      message,
      respondedAt: Date.now(),
      respondedBy: req.user._id
    };

    const updatedFeedback = await feedback.save();
    await updatedFeedback.populate('user', 'name email');
    await updatedFeedback.populate('adminResponse.respondedBy', 'name');

    res.json({
      success: true,
      feedback: updatedFeedback
    });
  } else {
    res.status(404);
    throw new Error('Feedback not found');
  }
});

module.exports = {
  createFeedback,
  getFeedback,
  getFeedbackByService,
  updateFeedback,
  deleteFeedback,
  respondToFeedback
};