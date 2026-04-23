require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const storeRoutes = require("./routes/storeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const userRoutes = require("./routes/userRoutes");
const path = require("path");
const supportRoutes = require("./routes/supportRoutes");
const { performHistoricalMigration } = require("./utils/auditLogger");

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", productRoutes);
app.use("/api/user", userRoutes);

app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/stores", storeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/admin/reviews", require("./routes/adminReviewRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/support", supportRoutes);
app.use("/api/ai", require("./routes/aiRoutes"));
app.use('/api/faqs', require("./routes/faqRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
// Basic API Route
app.get("/api/health", (req, res) => {
  res.json({ message: "API is working!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  performHistoricalMigration();
});
