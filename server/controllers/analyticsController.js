const User = require('../models/User');

// @desc    Get owner Key Performance Indicators (mocked)
// @route   GET /api/analytics/owner/kpis
// @access  Private/Owner
const getOwnerKPIs = async (req, res) => {
    try {
        const customerCount = await User.countDocuments({ role: { $regex: /^customer$/i } });

        // Since another student is handling the Order schema, we return
        // empty zeroed data temporarily to clear the dashboard of mock info.
        const kpis = {
            totalRevenue: { value: 0, change: 0 },
            totalExpenses: { value: 0, change: 0 },
            netProfit: { value: 0, change: 0 },
            activeCustomers: { value: customerCount, change: 0 }
        };
        res.json(kpis);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get owner sales chart data (mocked)
// @route   GET /api/analytics/owner/sales?period=weekly
// @access  Private/Owner
const getOwnerSales = async (req, res) => {
    try {
        const period = req.query.period || 'weekly';
        // Currently we don't have the Order schema, so we return 0 sales for the days.
        const defaultSales = [
            { name: 'Mon', sales: 0 },
            { name: 'Tue', sales: 0 },
            { name: 'Wed', sales: 0 },
            { name: 'Thu', sales: 0 },
            { name: 'Fri', sales: 0 },
            { name: 'Sat', sales: 0 },
            { name: 'Sun', sales: 0 }
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
        // Return empty stats to clear Admin dashboard
        res.json({
            totalVolume: 0,
            activeStores: 0,
            registeredStudents: 0,
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

module.exports = {
    getOwnerKPIs,
    getOwnerSales,
    getPlatformStats,
    getTargets,
    updateTargets
};
