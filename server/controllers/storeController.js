const Store = require('../models/Store');

// @desc    Get current user's store profile
// @route   GET /api/stores/my-store
// @access  Private/Owner
const getMyStore = async (req, res) => {
    try {
        let store = await Store.findOne({ ownerId: req.user._id });

        // Lazy create if not found (for legacy users)
        if (!store) {
            store = new Store({
                ownerId: req.user._id,
                storeName: `${req.user.username || 'My'}'s Store`,
                description: 'A new Hustle Hub storefront.',
                themeSettings: {
                    primaryColor: '#1111d4',
                    headline: 'Welcome to our store',
                    subheadline: 'Explore our latest collection.',
                    ctaText: 'Shop Now'
                }
            });
            await store.save();
        }

        res.json({ success: true, store });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create or update store profile
// @route   POST /api/stores
// @access  Private/Owner
const createOrUpdateStore = async (req, res) => {
    try {
        const { storeName, description, themeSettings, contactInfo } = req.body;

        const bannerUrl = req.files && req.files.banner ? req.files.banner[0].path : req.body.bannerUrl;
        const logoUrl = req.files && req.files.logo ? req.files.logo[0].path : req.body.logoUrl;

        const updateData = {};
        if (storeName) updateData.storeName = storeName;
        if (description) updateData.description = description;
        if (bannerUrl) updateData.bannerUrl = bannerUrl;
        if (logoUrl) updateData.logoUrl = logoUrl;
        if (contactInfo !== undefined) updateData.contactInfo = contactInfo;

        if (themeSettings) {
            const settings = typeof themeSettings === 'string' ? JSON.parse(themeSettings) : themeSettings;
            updateData.themeSettings = settings;
        }

        let store = await Store.findOne({ ownerId: req.user._id });

        if (store) {
            // Update existing
            if (storeName) store.storeName = storeName;
            if (description) store.description = description;
            if (bannerUrl) store.bannerUrl = bannerUrl;
            if (logoUrl) store.logoUrl = logoUrl;
            if (contactInfo !== undefined) store.contactInfo = contactInfo;

            if (themeSettings) {
                const settings = typeof themeSettings === 'string' ? JSON.parse(themeSettings) : themeSettings;
                // Deep merge or at least ensure we don't lose other fields like fontFamily
                store.themeSettings = {
                    ...store.themeSettings.toObject(),
                    ...settings
                };
            }

            await store.save();
        } else {
            // Create if not found
            // Check if name is taken
            const nameTaken = await Store.findOne({ storeName });
            if (nameTaken) {
                return res.status(400).json({ success: false, message: 'Store name already exists' });
            }

            store = new Store({
                ownerId: req.user._id,
                storeName,
                description,
                bannerUrl,
                logoUrl,
                contactInfo: contactInfo || "",
                themeSettings: typeof themeSettings === 'string' ? JSON.parse(themeSettings) : themeSettings
            });
            await store.save();

            // Notify ADMINS
            const { sendNotification } = require('../services/notificationService');
            const User = require('../models/User');
            const admins = await User.find({ role: 'ADMIN' }).select('_id');
            for (const admin of admins) {
                await sendNotification({
                    recipientId: admin._id,
                    actorId: req.user._id,
                    type: 'NEW_BUSINESS_REQUEST',
                    title: 'New Business Request',
                    message: `${req.user.firstName} has created a new store: "${storeName}".`,
                    category: 'adminBusinessAlerts',
                    roleScope: 'ADMIN',
                    entityType: 'store',
                    entityId: store._id,
                    link: `/admin/businesses`,
                    required: true,
                });
            }

            return res.status(201).json({ success: true, store });
        }

        return res.json({ success: true, store });
    } catch (error) {
        console.error('Store Update Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Store name already exists' });
        }
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

// @desc    Get store by name (for public storefront)
// @route   GET /api/stores/:storeName
// @access  Public
const getStoreByName = async (req, res) => {
    try {
        const store = await Store.findOne({
            storeName: { $regex: new RegExp(`^${req.params.storeName}$`, 'i') }
        });

        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        res.json({ success: true, store });
    } catch (error) {
        console.error('[getStoreByName] Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
const getAllStores = async (req, res) => {
    try {
        // Return all stores except SUSPENDED ones
        const stores = await Store.find({ status: { $ne: 'SUSPENDED' } }).sort({ createdAt: -1 });
        res.json({ success: true, stores });
    } catch (error) {
        console.error('[getAllStores] Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getMyStore,
    createOrUpdateStore,
    getStoreByName,
    getAllStores
};
