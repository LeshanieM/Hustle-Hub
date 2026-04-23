const Notification = require("../models/Notification");
const User = require("../models/User");

/**
 * Send a notification to a user
 * @param {Object} params
 * @param {string} params.recipientId - ID of the user receiving the notification
 * @param {string} [params.actorId] - ID of the user who triggered the notification
 * @param {string} params.type - Event type (e.g., 'ORDER_PLACED')
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} params.category - Category for preference checking (e.g., 'orderUpdates')
 * @param {string} [params.roleScope] - Role scope for the notification
 * @param {string} [params.entityType] - Type of entity related (e.g., 'booking')
 * @param {string} [params.entityId] - ID of the related entity
 * @param {string} [params.link] - Deep link for the notification
 * @param {boolean} [params.required=false] - If true, bypasses preference check
 * @param {string} [params.dedupeKey] - Key to prevent duplicate notifications
 * @param {Object} [params.metadata] - Extra data
 */
const sendNotification = async ({
  recipientId,
  actorId,
  type,
  title,
  message,
  category,
  roleScope,
  entityType,
  entityId,
  link,
  required = false,
  dedupeKey,
  metadata,
}) => {
  try {
    // 1. Fetch recipient and their preferences
    const recipient = await User.findById(recipientId).select("notificationPreferences role");
    if (!recipient) {
      console.warn(`[NotificationService] Recipient ${recipientId} not found.`);
      return null;
    }

    // 2. Check preferences if not required
    if (!required) {
      const preferences = recipient.notificationPreferences || {};
      if (preferences[category] === false) {
        console.log(`[NotificationService] Skipping optional notification for user ${recipientId} (category: ${category} disabled)`);
        return null;
      }
    }

    // 3. Deduplication check
    if (dedupeKey) {
      const existing = await Notification.findOne({ recipient: recipientId, dedupeKey });
      if (existing) {
        // If it exists and is unread, maybe we don't need another one?
        // Or we update the timestamp? For now, we skip.
        console.log(`[NotificationService] Duplicate notification skipped for key: ${dedupeKey}`);
        return existing;
      }
    }

    // 4. Determine roleScope if not provided
    const finalRoleScope = roleScope || recipient.role;

    // 5. Create notification
    const notification = await Notification.create({
      recipient: recipientId,
      actor: actorId,
      roleScope: finalRoleScope,
      type,
      category,
      title,
      message,
      entityType,
      entityId,
      link,
      dedupeKey,
      metadata,
    });

    console.log(`[NotificationService] Notification sent to ${recipientId}: ${type}`);
    return notification;
  } catch (error) {
    console.error("[NotificationService] Error sending notification:", error);
    return null;
  }
};

module.exports = {
  sendNotification,
};
