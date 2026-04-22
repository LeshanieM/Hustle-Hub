const Booking = require('../models/Booking');
const Product = require('../models/Product');
const Store = require('../models/Store');
const User = require('../models/User');
const { sendNotification } = require('../services/notificationService');

// ── Helper ────────────────────────────────────────────────────────────────────

const TIME_SLOTS = [];
for (let h = 8; h <= 17; h++) {
  for (const m of [0, 30]) {
    if (h === 17 && m === 30) break;
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const ampm = h < 12 ? 'AM' : 'PM';
    TIME_SLOTS.push(`${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`);
  }
}

const DELIVERY_PLACES = [
  'anohana', 'main_canteen', 'sliit_dupath',
  'new_canteen', 'bird_nest', 'sliit_ground',
];

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private (CUSTOMER)
 */
const createBooking = async (req, res) => {
  try {
    const { product_id, quantity, delivery_place, delivery_time, delivery_date, note } = req.body;

    // Validation
    if (!product_id || !quantity || !delivery_place || !delivery_time) {
      return res.status(400).json({ message: 'product_id, quantity, delivery_place, and delivery_time are required' });
    }

    if (!DELIVERY_PLACES.includes(delivery_place)) {
      return res.status(400).json({ message: 'Invalid delivery_place' });
    }

    if (!TIME_SLOTS.includes(delivery_time)) {
      return res.status(400).json({ message: 'Invalid delivery_time. Use a 30-min slot between 08:00 AM and 05:00 PM' });
    }

    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({ message: 'Quantity must be between 1 and 10' });
    }

    // Fetch product
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const total_price = product.price * quantity;

    const booking = await Booking.create({
      customer_id: req.user._id,
      product_id,
      quantity,
      delivery_place,
      delivery_time,
      delivery_date: delivery_date || '',
      note: note || '',
      total_price,
    });

    // Populate for response
    const populated = await Booking.findById(booking._id)
      .populate('product_id', 'name price type imageUrl ownerId')
      .populate('customer_id', 'firstName lastName username studentEmail');

    // Convert to object to attach storefront_id
    const populatedObj = populated.toObject();
    if (populatedObj.product_id && populatedObj.product_id.ownerId) {
      const ownerId = populatedObj.product_id.ownerId.toString();
      const store = /^[a-f\d]{24}$/i.test(ownerId)
        ? await Store.findOne({ ownerId }).select('storeName')
        : null;

      populatedObj.product_id.storefront_id = store
        ? { _id: store._id, storefront_name: store.storeName }
        : { _id: ownerId, storefront_name: 'Archived Store' };
      populatedObj.storefront_name = populatedObj.product_id.storefront_id.storefront_name;
    } else {
      populatedObj.storefront_name = 'Archived Store';
    }

    let newBadges = [];
    try {
      const { checkAndAwardBadges } = require('../services/badgeService');
      newBadges = await checkAndAwardBadges(req.user._id);
    } catch(err) {
      console.error('Badge service error:', err);
    }

    res.status(201).json({ ...populatedObj, newBadges });

    // Send notification to OWNER
    if (populated.product_id && populated.product_id.ownerId) {
      await sendNotification({
        recipientId: populated.product_id.ownerId,
        actorId: req.user._id,
        type: 'ORDER_PLACED',
        title: 'New Booking Received',
        message: `You have received a new booking for ${populated.product_id.name}.`,
        category: 'ownerOrderAlerts',
        roleScope: 'OWNER',
        entityType: 'booking',
        entityId: booking._id,
        link: `/owner/orders`, // Point to orders management
      });
    }
  } catch (error) {
    console.error('[createBooking]', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all bookings for the logged-in customer
 * @route   GET /api/bookings/my
 * @access  Private (CUSTOMER)
 */
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer_id: req.user._id })
      .populate({
        path: 'product_id',
        select: 'name price type imageUrl ownerId'
      })
      .sort({ createdAt: -1 });

    const ownerIds = [...new Set(bookings.map(b => b.product_id?.ownerId?.toString()).filter(Boolean))];
    const validOwnerIds = ownerIds.filter(id => /^[a-f\d]{24}$/i.test(id));

    const [stores, owners] = await Promise.all([
      Store.find({ ownerId: { $in: validOwnerIds } }).select('ownerId storeName'),
      User.find({ _id: { $in: validOwnerIds } }).select('firstName lastName username')
    ]);
    
    const storeMap = {};
    stores.forEach(s => {
      storeMap[s.ownerId.toString()] = { _id: s._id, storefront_name: s.storeName };
    });

    const ownerMap = {};
    owners.forEach(owner => {
      const displayName =
        [owner.firstName, owner.lastName].filter(Boolean).join(' ').trim() ||
        owner.username ||
        'Seller';

      ownerMap[owner._id.toString()] = {
        _id: owner._id,
        storefront_name: `${displayName}'s Store`
      };
    });

    const result = bookings.map(b => {
      const bObj = b.toObject();
      if (bObj.product_id && bObj.product_id.ownerId) {
         const ownerId = bObj.product_id.ownerId.toString();
         bObj.product_id.storefront_id = storeMap[ownerId] || ownerMap[ownerId] || {
          _id: ownerId,
          storefront_name: 'Archived Store'
         };
         bObj.storefront_name = bObj.product_id.storefront_id.storefront_name;
      } else {
         bObj.storefront_name = 'Archived Store';
      }
      return bObj;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('[getMyBookings]', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get a single booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private (owner of booking or ADMIN)
 */
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('product_id', 'name price type imageUrl')
      .populate('customer_id', 'firstName lastName username studentEmail');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isOwner = booking.customer_id._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error('[getBookingById]', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Cancel a booking (customer only, while pending)
 * @route   PATCH /api/bookings/:id/cancel
 * @access  Private (CUSTOMER — must own the booking)
 */
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.customer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Cannot cancel a booking that is already ${booking.status}` });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Recalculate badges — cancelled order no longer counts toward shopper badges
    try {
      const { checkAndAwardBadges } = require('../services/badgeService');
      await checkAndAwardBadges(req.user._id);
    } catch (err) {
      console.error('Badge recalc error on cancel:', err);
    }

    res.status(200).json({ message: 'Booking cancelled', booking });

    // Notify OWNER about cancellation
    const populated = await Booking.findById(booking._id).populate('product_id', 'ownerId name');
    if (populated && populated.product_id && populated.product_id.ownerId) {
      await sendNotification({
        recipientId: populated.product_id.ownerId,
        actorId: req.user._id,
        type: 'ORDER_CANCELLED',
        title: 'Booking Cancelled',
        message: `A booking for ${populated.product_id.name} has been cancelled by the customer.`,
        category: 'ownerOrderAlerts',
        roleScope: 'OWNER',
        entityType: 'booking',
        entityId: booking._id,
        link: `/owner/orders`,
      });
    }
  } catch (error) {
    console.error('[cancelBooking]', error);
    res.status(500).json({ message: error.message });
  }
};

// ── Admin Controllers ─────────────────────────────────────────────────────────

/**
 * @desc    Get ALL bookings (admin overview)
 * @route   GET /api/bookings/admin/all
 * @access  Private (ADMIN)
 */
const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Booking.countDocuments(filter);

    const bookings = await Booking.find(filter)
      .populate('product_id', 'name price type')
      .populate('customer_id', 'firstName lastName username studentEmail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({ total, page: parseInt(page), limit: parseInt(limit), bookings });
  } catch (error) {
    console.error('[getAllBookings]', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update booking status (admin only)
 * @route   PATCH /api/bookings/admin/:id/status
 * @access  Private (ADMIN)
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate('product_id', 'name price type')
      .populate('customer_id', 'firstName lastName username studentEmail');

    res.status(200).json(updated);
  } catch (error) {
    console.error('[updateBookingStatus]', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get booking statistics (admin)
 * @route   GET /api/bookings/admin/stats
 * @access  Private (ADMIN)
 */
const getBookingStats = async (req, res) => {
  try {
    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
    ]);

    // Total revenue from completed bookings
    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total_price' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    res.status(200).json({ total, pending, confirmed, completed, cancelled, totalRevenue });
  } catch (error) {
    console.error('[getBookingStats]', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete a cancelled booking permanently
 * @route   DELETE /api/bookings/:id
 * @access  Private (CUSTOMER — must own the booking and it must be cancelled)
 */
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.customer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this booking' });
    }

    if (booking.status !== 'cancelled') {
      return res.status(400).json({ message: 'Only cancelled bookings can be deleted' });
    }

    await booking.deleteOne();
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('[deleteBooking]', error);
    res.status(500).json({ message: error.message });
  }
};

// ── Owner Controllers ─────────────────────────────────────────────────────────

/**
 * Helper: parse a time-slot string "HH:MM AM/PM" into minutes-from-midnight
 */
const slotToMinutes = (slot) => {
  if (!slot) return 0;
  const [time, ampm] = slot.trim().split(' ');
  let [h, m] = time.split(':').map(Number);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + (m || 0);
};

/**
 * @desc    Get all bookings for products owned by the logged-in owner
 * @route   GET /api/bookings/owner/my-orders
 * @access  Private (OWNER)
 */
const getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.user._id.toString();
    const { status, delivery_place, delivery_time, sort } = req.query;

    // Find all products belonging to this owner
    const ownerProducts = await Product.find({ ownerId }).select('_id');
    const productIds = ownerProducts.map(p => p._id);

    const filter = { product_id: { $in: productIds } };
    if (status)         filter.status         = status;
    if (delivery_place) filter.delivery_place  = delivery_place;
    if (delivery_time)  filter.delivery_time   = delivery_time;

    let bookings = await Booking.find(filter)
      .populate('product_id', 'name price type category ownerId')
      .populate('customer_id', 'firstName lastName username studentEmail')
      .sort({ createdAt: -1 });

    // Client-requested sort by delivery time
    if (sort === 'delivery_time') {
      bookings = bookings.sort((a, b) => slotToMinutes(a.delivery_time) - slotToMinutes(b.delivery_time));
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error('[getOwnerBookings]', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Owner accepts a booking
 * @route   PATCH /api/bookings/:id/accept
 * @access  Private (OWNER)
 */
const acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('product_id', 'ownerId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.product_id.ownerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (booking.status !== 'pending')
      return res.status(400).json({ message: 'Only pending bookings can be accepted' });

    booking.status     = 'confirmed';
    booking.owner_note = req.body.note || '';
    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate('product_id', 'name price type category')
      .populate('customer_id', 'firstName lastName username studentEmail');
      
    // Award Seller Badges
    let newBadges = [];
    try {
      const { checkAndAwardBadges } = require('../services/badgeService');
      newBadges = await checkAndAwardBadges(req.user._id);
    } catch(err) {
      console.error('Seller badge error:', err);
    }
    
    res.status(200).json({ ...updated.toObject(), newBadges });

    // Notify CUSTOMER
    await sendNotification({
      recipientId: updated.customer_id._id,
      actorId: req.user._id,
      type: 'ORDER_CONFIRMED',
      title: 'Booking Confirmed!',
      message: `Your booking for ${updated.product_id.name} has been confirmed.`,
      category: 'customerOrderUpdates',
      roleScope: 'CUSTOMER',
      entityType: 'booking',
      entityId: updated._id,
      link: `/orders`,
      required: true, // Mandatory
    });
  } catch (error) {
    console.error('[acceptBooking]', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Owner rejects a booking
 * @route   PATCH /api/bookings/:id/reject
 * @access  Private (OWNER)
 */
const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('product_id', 'ownerId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.product_id.ownerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (booking.status !== 'pending')
      return res.status(400).json({ message: 'Only pending bookings can be rejected' });

    const VALID_REASONS = ['out_of_stock', 'too_busy', 'item_unavailable', 'other'];
    const { rejection_reason, note } = req.body;
    if (!VALID_REASONS.includes(rejection_reason))
      return res.status(400).json({ message: `rejection_reason must be one of: ${VALID_REASONS.join(', ')}` });

    booking.status           = 'cancelled';
    booking.rejection_reason = rejection_reason;
    booking.owner_note       = note || '';
    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate('product_id', 'name price type category')
      .populate('customer_id', 'firstName lastName username studentEmail');
    res.status(200).json(updated);

    // Notify CUSTOMER
    await sendNotification({
      recipientId: updated.customer_id._id,
      actorId: req.user._id,
      type: 'ORDER_REJECTED',
      title: 'Booking Rejected',
      message: `Your booking for ${updated.product_id.name} was rejected. Reason: ${rejection_reason.replace(/_/g, ' ')}.`,
      category: 'customerOrderUpdates',
      roleScope: 'CUSTOMER',
      entityType: 'booking',
      entityId: updated._id,
      link: `/orders`,
      required: true, // Mandatory
    });
  } catch (error) {
    console.error('[rejectBooking]', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Owner marks a confirmed booking as ready/completed
 * @route   PATCH /api/bookings/:id/ready
 * @access  Private (OWNER)
 */
const markReady = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('product_id', 'ownerId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.product_id.ownerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (booking.status !== 'confirmed')
      return res.status(400).json({ message: 'Only confirmed bookings can be marked ready' });

    booking.status = 'completed';
    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate('product_id', 'name price type category')
      .populate('customer_id', 'firstName lastName username studentEmail');
      
    // Award Seller Badges
    let newBadges = [];
    try {
      const { checkAndAwardBadges } = require('../services/badgeService');
      newBadges = await checkAndAwardBadges(req.user._id);
    } catch(err) {
      console.error('Seller badge error:', err);
    }

    res.status(200).json({ ...updated.toObject(), newBadges });

    // Notify CUSTOMER
    await sendNotification({
      recipientId: updated.customer_id._id,
      actorId: req.user._id,
      type: 'ORDER_READY',
      title: 'Order Ready!',
      message: `Your order for ${updated.product_id.name} is ready for pickup/delivery.`,
      category: 'customerOrderUpdates',
      roleScope: 'CUSTOMER',
      entityType: 'booking',
      entityId: updated._id,
      link: `/orders`,
      required: true, // Mandatory
    });
  } catch (error) {
    console.error('[markReady]', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Bulk accept or reject multiple bookings
 * @route   PATCH /api/bookings/bulk-action
 * @access  Private (OWNER)
 */
const bulkAction = async (req, res) => {
  try {
    const { bookingIds, action, rejection_reason, note } = req.body;
    if (!Array.isArray(bookingIds) || bookingIds.length === 0)
      return res.status(400).json({ message: 'bookingIds must be a non-empty array' });
    if (!['accept', 'reject'].includes(action))
      return res.status(400).json({ message: 'action must be "accept" or "reject"' });

    const ownerId = req.user._id.toString();
    const ownerProducts = await Product.find({ ownerId }).select('_id');
    const productIds = new Set(ownerProducts.map(p => p._id.toString()));

    // Only update pending bookings whose product belongs to this owner
    const bookings = await Booking.find({ _id: { $in: bookingIds }, status: 'pending' })
      .populate('product_id', 'ownerId');

    const eligible = bookings.filter(b => productIds.has(b.product_id._id.toString()));

    const updates = eligible.map(b => {
      if (action === 'accept') {
        b.status     = 'confirmed';
        b.owner_note = note || '';
      } else {
        b.status           = 'cancelled';
        b.rejection_reason = rejection_reason || 'other';
        b.owner_note       = note || '';
      }
      return b.save();
    });

    await Promise.all(updates);
    
    // Award Seller Badges
    let newBadges = [];
    try {
      const { checkAndAwardBadges } = require('../services/badgeService');
      newBadges = await checkAndAwardBadges(ownerId);
    } catch(err) {
      console.error('Seller badge error:', err);
    }
    
    res.status(200).json({ updated: eligible.length, newBadges });
  } catch (error) {
    console.error('[bulkAction]', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  deleteBooking,
  getAllBookings,
  updateBookingStatus,
  getBookingStats,
  getOwnerBookings,
  acceptBooking,
  rejectBooking,
  markReady,
  bulkAction,
};