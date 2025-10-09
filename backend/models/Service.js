const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a service name'],
    trim: true,
    maxlength: [100, 'Service name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Shirts', 'Pants', 'Dresses', 'Bedding', 'Jackets', 'Accessories', 'Others'],
    default: 'Others'
  },
  services: {
    wash: {
      available: { type: Boolean, default: false },
      price: { type: Number, default: 0 }
    },
    iron: {
      available: { type: Boolean, default: false },
      price: { type: Number, default: 0 }
    },
    dryClean: {
      available: { type: Boolean, default: false },
      price: { type: Number, default: 0 }
    },
    washAndIron: {
      available: { type: Boolean, default: false },
      price: { type: Number, default: 0 }
    }
  },
  image: {
    type: String,
    default: '/images/default-service.jpg'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  minQuantity: {
    type: Number,
    default: 1
  },
  maxQuantity: {
    type: Number,
    default: 50
  },
  estimatedTime: {
    type: String,
    default: '24-48 hours'
  },
  specialInstructions: {
    type: String,
    maxlength: [200, 'Special instructions cannot be more than 200 characters']
  }
}, {
  timestamps: true
});

// Index for faster queries
serviceSchema.index({ category: 1 });
serviceSchema.index({ 'services.wash.available': 1 });
serviceSchema.index({ 'services.iron.available': 1 });
serviceSchema.index({ 'services.dryClean.available': 1 });

module.exports = mongoose.model('Service', serviceSchema);