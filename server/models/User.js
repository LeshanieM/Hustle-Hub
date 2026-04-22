const mongoose = require("mongoose");
 
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    studentEmail: {
      type: String,
      unique: true,
    },
    phone: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["ADMIN", "CUSTOMER", "OWNER"],
      required: true,
    },
    studentIdImage: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // ✅ NEW — tracks if user has logged in for the first time
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    analyticsTargets: {
      daily: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 },
      yearly: { type: Number, default: 0 },
    },
    badges: [{
      badgeId: String,
      earnedAt: Date,
    }],
    savedItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    notificationPreferences: {
      orderUpdates: { type: Boolean, default: true },
      lowStockAlerts: { type: Boolean, default: true },
      newReviews: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      supportResponses: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);
 
module.exports = mongoose.model("User", userSchema);
 