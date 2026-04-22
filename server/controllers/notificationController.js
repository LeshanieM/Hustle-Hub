const Notification = require("../models/Notification");
const User = require("../models/User");

/**
 * @desc    Get all notifications for logged-in user
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;
    const filter = { recipient: req.user._id };

    if (isRead !== undefined) {
      filter.isRead = isRead === "true";
    }

    const notifications = await Notification.find(filter)
      .populate("actor", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Notification.countDocuments(filter);

    res.json({
      notifications,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: Date.now() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: Date.now() }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get notification preferences
 * @route   GET /api/notifications/preferences
 * @access  Private
 */
const getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("notificationPreferences");
    res.json(user.notificationPreferences || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update notification preferences
 * @route   PUT /api/notifications/preferences
 * @access  Private
 */
const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const userRole = req.user.role;

    // Define allowed keys per role
    const ALLOWED_KEYS = {
      CUSTOMER: ["promotions", "supportResponses"],
      OWNER: ["promotions", "supportResponses", "ownerOrderAlerts", "lowStockAlerts", "newReviews"],
      ADMIN: ["adminBusinessAlerts", "adminUserAlerts"],
    };

    // Filter preferences to only include allowed keys for this role
    const filteredPreferences = {};
    const allowedForRole = ALLOWED_KEYS[userRole] || [];
    
    // Also allow mandatory keys just in case they are sent (though they are always bypassed in service)
    const mandatoryKeys = ["systemUpdates", "verificationDecisions"];
    const allAllowed = [...allowedForRole, ...mandatoryKeys];

    Object.keys(preferences).forEach((key) => {
      if (allAllowed.includes(key)) {
        filteredPreferences[key] = !!preferences[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificationPreferences: filteredPreferences },
      { new: true }
    ).select("notificationPreferences");

    res.json(user.notificationPreferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences,
};
