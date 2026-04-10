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
        const period = req.query.period || 'weekly';
        
        const products = await Product.find({ ownerId }).select('_id name stock alertThreshold trackStock type');
        const productIds = products.map(p => p._id);

        const customerCount = await User.countDocuments({ role: { $regex: /^customer$/i } });
        
        let startDate = new Date();
        if (period === 'daily') startDate.setHours(0, 0, 0, 0);
        else if (period === 'weekly') startDate.setDate(startDate.getDate() - 7);
        else if (period === 'monthly') startDate.setMonth(startDate.getMonth() - 1);
        else if (period === 'annual') startDate.setFullYear(startDate.getFullYear() - 1);

        const completedBookings = await Booking.find({ 
            product_id: { $in: productIds }, 
            status: 'completed',
            createdAt: { $gte: startDate }
        });

        const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
        const pendingOrdersCount = await Booking.countDocuments({ 
            product_id: { $in: productIds }, 
            status: 'pending',
            createdAt: { $gte: startDate }
        });
        
        const lowStockCount = products.filter(p => p.trackStock && p.stock <= p.alertThreshold).length;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayBookings = completedBookings.filter(b => b.createdAt >= today);
        const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

        // Calculate Top Items
        const itemSales = {};
        completedBookings.forEach(b => {
            const pid = b.product_id.toString();
            itemSales[pid] = (itemSales[pid] || 0) + 1;
        });

        const topItems = Object.entries(itemSales)
            .map(([pid, sales]) => {
                const product = products.find(p => p._id.toString() === pid);
                return { 
                    name: product ? product.name : 'Unknown Product', 
                    type: product ? product.type : 'General',
                    sales 
                };
            })
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 10);

        const kpis = {
            totalRevenue: { value: totalRevenue, change: period === 'weekly' ? 12.5 : 0 },
            todayRevenue: { value: todayRevenue, change: 5.2 },
            pendingOrders: { value: pendingOrdersCount, change: 0 },
            lowStock: { value: lowStockCount, change: 0 },
            totalExpenses: { value: Math.round(totalRevenue * 0.2), change: 0 },
            netProfit: { value: Math.round(totalRevenue * 0.8), change: 0 },
            activeCustomers: { value: customerCount, change: 0 },
            topItems,
            periodStats: {
                startDate: startDate.toLocaleDateString(),
                endDate: new Date().toLocaleDateString(),
                label: period.charAt(0).toUpperCase() + period.slice(1)
            }
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
        
        let startDate = new Date();
        if (period === 'daily') startDate.setHours(0, 0, 0, 0);
        else if (period === 'weekly') startDate.setDate(startDate.getDate() - 7);
        else if (period === 'monthly') startDate.setMonth(startDate.getMonth() - 1);
        else if (period === 'annual') startDate.setFullYear(startDate.getFullYear() - 1);

        const completedBookings = await Booking.find({ 
            product_id: { $in: productIds }, 
            status: 'completed',
            createdAt: { $gte: startDate }
        });
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        let salesData = [];
        
        if (period === 'annual') {
            const monthlyMap = {};
            months.forEach(m => monthlyMap[m] = 0);
            completedBookings.forEach(b => {
                const m = months[new Date(b.createdAt).getMonth()];
                monthlyMap[m] += (b.total_price || 0);
            });
            salesData = months.map(m => ({ name: m, sales: monthlyMap[m] }));
        } else {
            const dayMap = {};
            days.forEach(d => dayMap[d] = 0);
            completedBookings.forEach(b => {
                const d = days[new Date(b.createdAt).getDay()];
                dayMap[d] += (b.total_price || 0);
            });
            const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            salesData = order.map(d => ({ name: d, sales: dayMap[d] }));
        }

        res.json(salesData);
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