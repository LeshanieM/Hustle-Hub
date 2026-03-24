const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { protect, isOwner } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public route to view all storefronts
router.get('/', storeController.getAllStores);

// Protected routes for store owners — must be BEFORE /:storeName to avoid param collision
router.get('/my-store', protect, isOwner, storeController.getMyStore);
router.post(
    '/',
    protect,
    isOwner,
    upload.fields([{ name: 'banner', maxCount: 1 }, { name: 'logo', maxCount: 1 }]),
    storeController.createOrUpdateStore
);

// Public route to view storefront by name — must be LAST as it catches all /:param
router.get('/:storeName', storeController.getStoreByName);

module.exports = router;
