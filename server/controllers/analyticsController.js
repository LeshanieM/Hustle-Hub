const User = require('../models/User');
const Product = require('../models/Product');
const Booking = require('../models/Booking');
const Store = require('../models/Store');

// @desc    Get owner Key Performance Indicators
// @route   GET /api/analytics/owner/kpis
// @access  Private/Owner
const getOwnerKPIs = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const products = await Product.find({ ownerId }).select('_id stock alertThreshold trackStock');
        const productIds = products.map(p => p._id);

        const customerCount = await User.countDocuments({ role: { $regex: /^customer$/i } });
        
        const completedBookings = await Booking.find({ product_id: { $in: productIds }, status: 'completed' });
        const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
        
        const pendingOrdersCount = await Booking.countDocuments({ product_id: { $in: productIds }, status: 'pending' });
        const lowStockCount = products.filter(p => p.trackStock && p.stock <= p.alertThreshold).length;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayBookings = completedBookings.filter(b => b.createdAt >= today);
        const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

        const kpis = {
            totalRevenue: { value: totalRevenue, change: 0 },
            todayRevenue: { value: todayRevenue, change: 0 },
            pendingOrders: { value: pendingOrdersCount, change: 0 },
            lowStock: { value: lowStockCount, change: 0 },
            totalExpenses: { value: 0, change: 0 },
            netProfit: { value: totalRevenue, change: 0 },
            activeCustomers: { value: customerCount, change: 0 }
        };
        res.json(kpis);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get owner sales chart data
// @route   GET /api/analytics/owner/sales?period=weekly
// @access  Private/Owner
const getOwnerSales = async (req, res) => {
    try {
        const period = req.query.period || 'weekly';
        const ownerId = req.user._id;
        const products = await Product.find({ ownerId }).select('_id');
        const productIds = products.map(p => p._id);
        
        const completedBookings = await Booking.find({ product_id: { $in: productIds }, status: 'completed' });
        
        const salesMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        completedBookings.forEach(b => {
             const d = new Date(b.createdAt);
             salesMap[days[d.getDay()]] += (b.total_price || 0);
        });

        const defaultSales = [
            { name: 'Mon', sales: salesMap['Mon'] },
            { name: 'Tue', sales: salesMap['Tue'] },
            { name: 'Wed', sales: salesMap['Wed'] },
            { name: 'Thu', sales: salesMap['Thu'] },
            { name: 'Fri', sales: salesMap['Fri'] },
            { name: 'Sat', sales: salesMap['Sat'] },
            { name: 'Sun', sales: salesMap['Sun'] }
        ];
        res.json(defaultSales);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get global platform stats (mocked data for Admin dashboard)
// @route   GET /api/analytics/admin/platform
// @access  Private/Admin
const getPlatformStats = async (req, res) => {
    try {
        const activeStores = await Store.countDocuments({ status: { $ne: 'SUSPENDED' } });
        const blockedBatch = await Store.countDocuments({ status: 'SUSPENDED' });
        const registeredStudents = await User.countDocuments({ role: { $regex: /^customer$/i } });

        res.json({
            totalVolume: 0,
            activeStores,
            blockedBatch,
            registeredStudents,
            growthRate: 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get owner revenue targets
// @route   GET /api/analytics/targets
// @access  Private/Owner
const getTargets = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('analyticsTargets');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.analyticsTargets || { daily: 0, monthly: 0, yearly: 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update owner revenue targets
// @route   PUT /api/analytics/targets
// @access  Private/Owner
const updateTargets = async (req, res) => {
    try {
        const { daily, monthly, yearly } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                analyticsTargets: {
                    daily: Number(daily) || 0,
                    monthly: Number(monthly) || 0,
                    yearly: Number(yearly) || 0
                }
            },
            { new: true }
        ).select('analyticsTargets');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.analyticsTargets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get owner's inventory alerts (all tracked products)
// @route   GET /api/analytics/owner/inventory-alerts
// @access  Private/Owner
const getInventoryAlerts = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const products = await Product.find({ ownerId });

        const lowStockProducts = products.filter(p => p.trackStock && p.stock <= p.alertThreshold);
        const trackedProducts = products.filter(p => p.trackStock);

        res.json({
            alertsConfigured: true,
            lowStockCount: lowStockProducts.length,
            trackedCount: trackedProducts.length,
            alerts: products.map(p => ({
                _id: p._id,
                name: p.name,
                type: p.type,
                stock: p.stock || 0,
                threshold: p.alertThreshold || 0,
                trackStock: p.trackStock,
                status: !p.trackStock ? 'No Tracking' : (p.stock === 0 ? 'Out of Stock' : (p.stock <= p.alertThreshold ? 'Low Stock' : 'Healthy')),
                imageUrl: p.imageUrl
            })).sort((a, b) => {
                // Untracked at the bottom
                if (a.trackStock && !b.trackStock) return -1;
                if (!a.trackStock && b.trackStock) return 1;
                // Tracked sorting
                if (a.stock === 0 && b.stock > 0) return -1;
                if (b.stock === 0 && a.stock > 0) return 1;
                if (a.stock <= a.threshold && b.stock > b.threshold) return -1;
                if (b.stock <= b.threshold && a.stock > a.threshold) return 1;
                return 0;
            })
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching inventory alerts' });
    }
};

// @desc    Update inventory alert threshold
// @route   PUT /api/analytics/owner/inventory-alerts/:id
// @access  Private/Owner
const updateInventoryAlert = async (req, res) => {
    try {
        const { threshold, trackStock } = req.body;
        const updateData = {};
        if (threshold !== undefined) updateData.alertThreshold = Number(threshold);
        if (trackStock !== undefined) updateData.trackStock = Boolean(trackStock);

        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.user._id },
            updateData,
            { new: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ 
            success: true, 
            threshold: product.alertThreshold,
            trackStock: product.trackStock,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating threshold' });
    }
};

module.exports = {
    getOwnerKPIs,
    getOwnerSales,
    getPlatformStats,
    getTargets,
    updateTargets,
    getInventoryAlerts,
    updateInventoryAlert
};
