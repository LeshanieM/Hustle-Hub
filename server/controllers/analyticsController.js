const User = require('../models/User');
const Product = require('../models/Product');
const Booking = require('../models/Booking');
const Store = require('../models/Store');

/**
 * Helper: Generates reusable date ranges for current and previous periods.
 * Removes all hardcoded change values by enabling relative comparison.
 */
const getReportingDates = (period) => {
    const end = new Date();
    const start = new Date();
    const prevEnd = new Date();
    const prevStart = new Date();

    switch (period.toLowerCase()) {
        case 'daily':
            start.setHours(0, 0, 0, 0);
            prevEnd.setDate(start.getDate());
            prevEnd.setHours(0, 0, 0, 0);
            prevStart.setDate(start.getDate() - 1);
            prevStart.setHours(0, 0, 0, 0);
            break;
        case 'weekly':
            start.setDate(end.getDate() - 7);
            prevEnd.setDate(start.getDate());
            prevStart.setDate(start.getDate() - 7);
            break;
        case 'monthly':
            start.setMonth(end.getMonth() - 1);
            prevEnd.setMonth(start.getMonth());
            prevStart.setMonth(start.getMonth() - 1);
            break;
        case 'annual':
        case 'yearly':
            start.setFullYear(end.getFullYear() - 1);
            prevEnd.setFullYear(start.getFullYear());
            prevStart.setFullYear(start.getFullYear() - 1);
            break;
        default:
            // Default to weekly logic if invalid period
            start.setDate(end.getDate() - 7);
            prevEnd.setDate(start.getDate());
            prevStart.setDate(start.getDate() - 7);
    }

    return { start, end, prevStart, prevEnd };
};

/**
 * Helper: Calculates percentage change between two values.
 */
const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    const change = ((current - previous) / previous) * 100;
    return parseFloat(change.toFixed(1));
};

// @desc    Get owner Key Performance Indicators (REAL DATA ONLY)
// @route   GET /api/analytics/owner/kpis
// @access  Private/Owner
const getOwnerKPIs = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const period = req.query.period || 'weekly';
        const { start, end, prevStart, prevEnd } = getReportingDates(period);

        // 1. Fetch Owner's Products
        const products = await Product.find({ ownerId }).select('_id name stock alertThreshold trackStock type');
        const productIds = products.map(p => p._id);

        if (productIds.length === 0) {
            return res.json({
                totalRevenue: { value: 0, change: 0 },
                todayRevenue: { value: 0, change: 0 },
                pendingOrders: { value: 0, change: 0 },
                lowStock: { value: 0, change: 0 },
                totalExpenses: { value: 0, change: 0 },
                netProfit: { value: 0, change: 0 },
                activeCustomers: { value: 0, change: 0 },
                topItems: [],
                periodStats: { startDate: start.toLocaleDateString(), endDate: end.toLocaleDateString(), label: period }
            });
        }

        // 2. Aggregate Bookings (Current vs Previous)
        const [currentBookings, prevBookings] = await Promise.all([
            Booking.find({ product_id: { $in: productIds }, status: 'completed', createdAt: { $gte: start, $lte: end } }),
            Booking.find({ product_id: { $in: productIds }, status: 'completed', createdAt: { $gte: prevStart, $lte: prevEnd } })
        ]);

        const currentRevenue = currentBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
        const prevRevenue = prevBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

        // 3. Today's Snapshot
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(todayStart.getDate() - 1);

        const todayBookings = await Booking.find({ product_id: { $in: productIds }, status: 'completed', createdAt: { $gte: todayStart } });
        const yesterdayBookings = await Booking.find({ product_id: { $in: productIds }, status: 'completed', createdAt: { $gte: yesterdayStart, $lt: todayStart } });

        const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
        const yesterdayRevenue = yesterdayBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

        // 4. Counts & Metrics
        const pendingOrdersCount = await Booking.countDocuments({ 
            product_id: { $in: productIds }, 
            status: 'pending',
            createdAt: { $gte: start }
        });

        const lowStockCount = products.filter(p => p.trackStock && p.stock <= p.alertThreshold).length;

        // Active customers who ordered in this period
        const activeCustomerIds = [...new Set(currentBookings.map(b => b.customer_id?.toString()).filter(id => id))];
        const prevActiveCustomerIds = [...new Set(prevBookings.map(b => b.customer_id?.toString()).filter(id => id))];

        // 5. Top Performing Items
        const itemSalesMap = {};
        currentBookings.forEach(b => {
            const pid = b.product_id.toString();
            itemSalesMap[pid] = (itemSalesMap[pid] || 0) + (b.quantity || 1);
        });

        const topItems = Object.entries(itemSalesMap)
            .map(([pid, sales]) => {
                const product = products.find(p => p._id.toString() === pid);
                return { 
                    name: product ? product.name : 'Unknown Product', 
                    type: product ? product.type : 'General',
                    sales 
                };
            })
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        // 6. Detailed Financials (Assuming 0 if no Expense model exists)
        // Strictly avoid mock multipliers like 0.2 or 0.8
        const totalExpenses = 0; // Placeholder for real expense records if implemented
        const netProfit = currentRevenue - totalExpenses;

        res.json({
            totalRevenue: { value: currentRevenue, change: calculateChange(currentRevenue, prevRevenue) },
            todayRevenue: { value: todayRevenue, change: calculateChange(todayRevenue, yesterdayRevenue) },
            pendingOrders: { value: pendingOrdersCount, change: 0 },
            lowStock: { value: lowStockCount, change: 0 },
            totalExpenses: { value: totalExpenses, change: 0 },
            netProfit: { value: netProfit, change: calculateChange(netProfit, (prevRevenue - 0)) },
            activeCustomers: { value: activeCustomerIds.length, change: calculateChange(activeCustomerIds.length, prevActiveCustomerIds.length) },
            topItems,
            periodStats: {
                startDate: start.toLocaleDateString(),
                endDate: end.toLocaleDateString(),
                label: period.charAt(0).toUpperCase() + period.slice(1)
            }
        });

    } catch (error) {
        console.error('KPI Engine Error:', error);
        res.status(500).json({ message: 'Internal Analytics Fault' });
    }
};

// @desc    Get owner sales chart data (REAL DATA ONLY)
// @route   GET /api/analytics/owner/sales
// @access  Private/Owner
const getOwnerSales = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const period = req.query.period || 'weekly';
        const { start, end } = getReportingDates(period);

        const products = await Product.find({ ownerId }).select('_id');
        const productIds = products.map(p => p._id);

        const bookings = await Booking.find({ 
            product_id: { $in: productIds }, 
            status: 'completed',
            createdAt: { $gte: start, $lte: end }
        }).sort({ createdAt: 1 });

        const salesMap = new Map();

        // Dynamically build map based on period
        if (period === 'annual' || period === 'yearly') {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            months.forEach(m => salesMap.set(m, 0));
            bookings.forEach(b => {
                const m = months[new Date(b.createdAt).getMonth()];
                salesMap.set(m, salesMap.get(m) + (b.total_price || 0));
            });
        } else if (period === 'daily') {
            // Hourly breakdown for daily
            for (let i = 0; i < 24; i++) salesMap.set(`${i}:00`, 0);
            bookings.forEach(b => {
                const h = new Date(b.createdAt).getHours();
                salesMap.set(`${h}:00`, salesMap.get(`${h}:00`) + (b.total_price || 0));
            });
        } else {
            // Weekly/Monthly - Day of week
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            days.forEach(d => salesMap.set(d, 0));
            bookings.forEach(b => {
                const d = days[new Date(b.createdAt).getDay()];
                salesMap.set(d, salesMap.get(d) + (b.total_price || 0));
            });
        }

        const salesData = Array.from(salesMap, ([name, sales]) => ({ name, sales }));
        res.json(salesData);

    } catch (error) {
        console.error('Sales Aggregation Error:', error);
        res.status(500).json({ message: 'Internal Sales Fault' });
    }
};

// @desc    Get global platform stats (ADMIN ONLY)
const getPlatformStats = async (req, res) => {
    try {
        const [activeStores, blockedBatch, registeredStudents, totalRevenueData] = await Promise.all([
            Store.countDocuments({ status: { $ne: 'SUSPENDED' } }),
            Store.countDocuments({ status: 'SUSPENDED' }),
            User.countDocuments({ role: { $regex: /^customer$/i } }),
            Booking.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$total_price' } } }
            ])
        ]);

        res.json({
            totalVolume: totalRevenueData[0]?.total || 0,
            activeStores,
            blockedBatch,
            registeredStudents,
            growthRate: 0 // Placeholder for real growth logic if requested
        });
    } catch (error) {
        res.status(500).json({ message: 'Admin Stats Error' });
    }
};

// @desc    Get owner revenue targets
const getTargets = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('analyticsTargets');
        res.json(user?.analyticsTargets || { daily: 0, monthly: 0, yearly: 0 });
    } catch (error) {
        res.status(500).json({ message: 'Target Retrieval Error' });
    }
};

// @desc    Update owner revenue targets
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
        res.json(user.analyticsTargets);
    } catch (error) {
        res.status(500).json({ message: 'Target Update Error' });
    }
};

// @desc    Get owner's inventory alerts
const getInventoryAlerts = async (req, res) => {
    try {
        const products = await Product.find({ ownerId: req.user._id });
        const lowStockProducts = products.filter(p => p.trackStock && p.stock <= p.alertThreshold);
        
        res.json({
            alertsConfigured: true,
            lowStockCount: lowStockProducts.length,
            trackedCount: products.filter(p => p.trackStock).length,
            alerts: products.map(p => ({
                _id: p._id,
                name: p.name,
                type: p.type,
                stock: p.stock || 0,
                threshold: p.alertThreshold || 0,
                trackStock: p.trackStock,
                status: !p.trackStock ? 'No Tracking' : (p.stock === 0 ? 'Out of Stock' : (p.stock <= p.alertThreshold ? 'Low Stock' : 'Healthy')),
                imageUrl: p.imageUrl
            })).sort((a, b) => (b.trackStock - a.trackStock) || (a.stock - b.stock))
        });
    } catch (error) {
        res.status(500).json({ message: 'Inventory Fetch Error' });
    }
};

// @desc    Update inventory alert threshold
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
        res.json({ success: true, threshold: product.alertThreshold, trackStock: product.trackStock });
    } catch (error) {
        res.status(500).json({ message: 'Inventory Update Error' });
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