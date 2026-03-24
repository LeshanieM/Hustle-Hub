const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, isOwner, isAdmin } = require('../middleware/authMiddleware');

// Owner Analytics
router.get('/owner/kpis', protect, isOwner, analyticsController.getOwnerKPIs);
router.get('/owner/sales', protect, isOwner, analyticsController.getOwnerSales);

// Owner Targets
router.get('/targets', protect, isOwner, analyticsController.getTargets);
router.put('/targets', protect, isOwner, analyticsController.updateTargets);

// Admin Analytics
router.get('/admin/platform', protect, isAdmin, analyticsController.getPlatformStats);

module.exports = router;
