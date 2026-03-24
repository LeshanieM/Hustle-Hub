const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/bookingController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// ── Customer Routes ───────────────────────────────────────────────────────────

// POST   /api/bookings            — create a booking
router.post('/', protect, createBooking);

// GET    /api/bookings/my         — get the logged-in customer's bookings
router.get('/my', protect, getMyBookings);

// ── Owner Routes ──────────────────────────────────────────────────────────────

// GET    /api/bookings/owner/my-orders  — all bookings for owner's products
router.get('/owner/my-orders', protect, getOwnerBookings);

// PATCH  /api/bookings/bulk-action      — bulk accept/reject
router.patch('/bulk-action', protect, bulkAction);

// PATCH  /api/bookings/:id/accept       — owner accepts a pending booking
router.patch('/:id/accept', protect, acceptBooking);

// PATCH  /api/bookings/:id/reject       — owner rejects a pending booking
router.patch('/:id/reject', protect, rejectBooking);

// PATCH  /api/bookings/:id/ready        — owner marks confirmed booking as ready
router.patch('/:id/ready', protect, markReady);

// ── Shared ────────────────────────────────────────────────────────────────────

// GET    /api/bookings/:id        — get a single booking (owner or admin)
router.get('/:id', protect, getBookingById);

// PATCH  /api/bookings/:id/cancel — customer cancels their own pending booking
router.patch('/:id/cancel', protect, cancelBooking);

// DELETE /api/bookings/:id       — customer deletes their own cancelled booking
router.delete('/:id', protect, deleteBooking);

// ── Admin Routes ──────────────────────────────────────────────────────────────

// GET    /api/bookings/admin/stats       — aggregate stats
router.get('/admin/stats', protect, isAdmin, getBookingStats);

// GET    /api/bookings/admin/all         — list all bookings (paginated)
router.get('/admin/all', protect, isAdmin, getAllBookings);

// PATCH  /api/bookings/admin/:id/status  — update booking status
router.patch('/admin/:id/status', protect, isAdmin, updateBookingStatus);

module.exports = router;

