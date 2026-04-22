const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Product = require('../models/Product');
const badgeEngine = require('../utils/badgeEngine');

const checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    // orderCount: only count bookings that were NOT cancelled
    const orderCount  = await Booking.countDocuments({ 
      customer_id: userId,
      status: { $nin: ['cancelled'] }
    });
    const reviewCount = await Review.countDocuments({ user_id: userId });

    const productCount      = await Product.countDocuments({ ownerId: userId.toString() });
    const productCountObjId = await Product.countDocuments({ ownerId: userId });

    const userProducts = await Product.find({
      $or: [{ ownerId: userId }, { ownerId: userId.toString() }]
    }).select('_id');
    const productIds = userProducts.map(p => p._id);

    const saleCount = await Booking.countDocuments({
      product_id: { $in: productIds },
      status: { $in: ['confirmed', 'completed'] }
    });

    const storefrontAgg = await Booking.aggregate([
      { $match: { customer_id: user._id } },
      { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $group: { _id: '$product.ownerId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const topStorefrontOrderCount = storefrontAgg.length > 0 ? storefrontAgg[0].count : 0;

    const accountAgeDays = Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24));
    const profileComplete = Boolean(
      user.firstName && user.lastName && user.studentEmail && user.studentId && user.studentIdImage
    );

    const stats = {
      orderCount,
      reviewCount,
      productCount: Math.max(productCount, productCountObjId),
      saleCount,
      topStorefrontOrderCount,
      accountAgeDays,
      profileComplete,
    };

    // --- 2. Run badgeEngine — get the full set of IDs that should be earned RIGHT NOW ---
    const shouldBeEarnedIds = badgeEngine
      .filter(badge => badge.condition(stats))
      .map(badge => badge.id);

    // --- 3. Get current badge IDs stored on the user ---
    const existingBadgeIds = (user.badges || []).map(b => b.badgeId);

    // --- 4. Diff in both directions ---
    const newlyEarnedIds = shouldBeEarnedIds.filter(id => !existingBadgeIds.includes(id));
    const revokedIds     = existingBadgeIds.filter(id => !shouldBeEarnedIds.includes(id));

    let changed = false;

    // Add new badges
    if (newlyEarnedIds.length > 0) {
      const now = new Date();
      const newBadgeObjects = newlyEarnedIds.map(id => ({ badgeId: id, earnedAt: now }));
      if (!user.badges) user.badges = [];
      user.badges.push(...newBadgeObjects);
      changed = true;
    }

    // Remove revoked badges
    if (revokedIds.length > 0) {
      user.badges = user.badges.filter(b => !revokedIds.includes(b.badgeId));
      changed = true;
    }

    if (changed) {
      await user.save();
    }

    // --- 5. Return only the newly earned badges (for toast notifications) ---
    const enrichedNewBadges = newlyEarnedIds.map(id => {
      const config = badgeEngine.find(b => b.id === id);
      return {
        id: config.id,
        label: config.label,
        icon: config.icon,
        description: config.description,
        earnedAt: new Date()
      };
    });

    return enrichedNewBadges;

  } catch (error) {
    console.error('[checkAndAwardBadges]', error);
    return [];
  }
};

module.exports = { checkAndAwardBadges };
