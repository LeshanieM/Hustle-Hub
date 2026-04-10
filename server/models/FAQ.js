const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: "General",
      trim: true
    },
    keywords: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FAQ", faqSchema);
