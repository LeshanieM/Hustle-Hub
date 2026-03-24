const mongoose = require('mongoose');

const DELIVERY_PLACES = [
  'anohana',
  'main_canteen',
  'sliit_dupath',
  'new_canteen',
  'bird_nest',
  'sliit_ground',
];

const bookingSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 1,
    },
    delivery_place: {
      type: String,
      enum: DELIVERY_PLACES,
      required: true,
    },
    delivery_time: {
      type: String, // e.g. "08:00 AM"
      required: true,
    },
    delivery_date: {
      type: String, // e.g. "2026-03-28"
      default: '',
    },
    note: {
      type: String,
      default: '',
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    total_price: {
      type: Number,
      required: true,
    },
    rejection_reason: {
      type: String,
      enum: ['out_of_stock', 'too_busy', 'item_unavailable', 'other', ''],
      default: '',
    },
    owner_note: {
      type: String,
      default: '',
      maxlength: 500,
    },
    is_urgent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
