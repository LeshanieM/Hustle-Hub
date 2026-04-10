const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// All routes require ADMIN role
router.use(protect);
router.use(isAdmin);

// ==================== USER ROUTES ====================
router.get('/users', adminController.getAllUsers);

// ==================== STORE ROUTES ====================
router.get('/stores', adminController.getAllStores);
router.put('/stores/:id/status', adminController.updateStoreStatus);

// ==================== BOOKING ROUTES ====================
router.get('/bookings', adminController.getAllBookings);
router.get('/bookings/stats', adminController.getBookingStats);
router.get('/bookings/export', adminController.exportBookingsCSV);
router.patch('/bookings/:id/status', adminController.overrideBookingStatus);

// ==================== PRODUCT ROUTES ====================
router.get('/products', adminController.getAllProductsForAdmin);
router.patch('/products/:id/flag', adminController.toggleProductFlag);

// ==================== SYSTEM ROUTES ====================
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;