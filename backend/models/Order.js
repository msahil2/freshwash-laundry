const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Service'
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required']
    // Removed enum to accept any service type
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be positive']
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal must be positive']
  }
});

const orderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  orderItems: [orderItemSchema],  // Changed from 'items' to 'orderItems'
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    instructions: String
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'cod', 'razorpay', 'card'],
    default: 'card'
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
    cardLast4: String,
    isDemoMode: Boolean
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0,
    min: [0, 'Items price must be positive']
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0,
    min: [0, 'Shipping price must be positive']
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0,
    min: [0, 'Tax price must be positive']
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0,
    min: [0, 'Total price must be positive']
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: Date,
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  pickupDate: Date,
  deliveryDate: Date,
  estimatedDelivery: Date,
  specialInstructions: String,
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: Date
}, {
  timestamps: true
});

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ isPaid: 1 });

// Calculate estimated delivery date before saving
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.estimatedDelivery) {
    const now = new Date();
    this.estimatedDelivery = new Date(now.getTime() + (48 * 60 * 60 * 1000)); // 48 hours from now
  }
  
  // Add status to history when status changes
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: `Status changed to ${this.status}`
    });
  }
  
  next();
});

module.exports = mongoose.model('Order', orderSchema);