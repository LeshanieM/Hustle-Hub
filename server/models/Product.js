const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['General', 'Apparel', 'Books', 'Electronics', 'Collectibles', 'Ticket', 'Fashion', 'Shoes', 'Watches', 'Furniture'],
    default: 'General'
  },
  imageUrl: {
    type: String,
    default: null
  },
  modelUrl: {
    type: String,
    default: null
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  alertThreshold: {
    type: Number,
    default: 5,
    min: 0
  },
  trackStock: {
    type: Boolean,
    default: true
  },
  ownerId: {
    type: String,
    required: true
  },
  isFake: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Verified', 'Flagged', 'Pending'],
    default: 'Verified'
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
