const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.patch("/:id/read", protect, markAsRead);
router.patch("/read-all", protect, markAllAsRead);
router.get("/preferences", protect, getPreferences);
router.put("/preferences", protect, updatePreferences);

module.exports = router;
