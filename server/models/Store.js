const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  storeName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true,
    default: "Welcome to my store!"
  },
  bannerUrl: {
    type: String,
    default: null
  },
  logoUrl: {
    type: String,
    default: null
  },
  themeSettings: {
    primaryColor: {
      type: String,
      default: "#1111d4"
    },
    fontFamily: {
      type: String,
      default: "Work Sans"
    },
    headline: {
      type: String,
      default: "Welcome to our store"
    },
    subheadline: {
      type: String,
      default: "Explore our latest collection."
    },
    ctaText: {
      type: String,
      default: "Shop Now"
    }
  },
  contactInfo: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ['PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED'],
    default: 'PENDING_APPROVAL'
  }
}, { timestamps: true });

module.exports = mongoose.model('Store', StoreSchema);
