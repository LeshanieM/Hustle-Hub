const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(isAdmin);

router.get('/users', adminController.getAllUsers);
router.get('/stores', adminController.getAllStores);
router.put('/stores/:id/status', adminController.updateStoreStatus);

module.exports = router;
