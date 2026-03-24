const User = require('../models/User');
const Store = require('../models/Store');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all stores
// @route   GET /api/admin/stores
// @access  Private/Admin
const getAllStores = async (req, res) => {
    try {
        const stores = await Store.find({}).populate('ownerId', 'firstName lastName email studentEmail');
        res.json(stores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update store status (approve/suspend)
// @route   PUT /api/admin/stores/:id/status
// @access  Private/Admin
const updateStoreStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const store = await Store.findById(req.params.id);

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        store.status = status;
        const updatedStore = await store.save();

        res.json(updatedStore);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllUsers,
    getAllStores,
    updateStoreStatus
};
