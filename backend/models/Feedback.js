const mongoose = require('mongoose');

const feedbackSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  serviceQuality: {
    type: Number,
    min: [1, 'Service quality rating must be at least 1'],
    max: [5, 'Service quality rating cannot be more than 5']
  },
  deliverySpeed: {
    type: Number,
    min: [1, 'Delivery speed rating must be at least 1'],
    max: [5, 'Delivery speed rating cannot be more than 5']
  },
  valueForMoney: {
    type: Number,
    min: [1, 'Value for money rating must be at least 1'],
    max: [5, 'Value for money rating cannot be more than 5']
  },
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  adminResponse: {
    message: String,
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
feedbackSchema.index({ user: 1 });
feedbackSchema.index({ order: 1 });
feedbackSchema.index({ service: 1 });
feedbackSchema.index({ rating: -1 });
feedbackSchema.index({ isApproved: 1, isPublic: 1 });

// Ensure one feedback per order per user
feedbackSchema.index({ user: 1, order: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Feedback', feedbackSchema);