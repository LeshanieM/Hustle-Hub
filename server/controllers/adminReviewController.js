const Review = require('../models/Review');
const aiSummaryService = require('../services/aiSummaryService');

const getAllAdminReviews = async (req, res) => {
    try {
        const { rating, type, status, keyword } = req.query;
        let query = {};

        if (status && status !== 'All') {
            query.status = status.toLowerCase();
        }
        if (rating && rating !== 'All') {
            query.rating = Number(rating);
        }
        if (type && type !== 'All') {
            if (type.toLowerCase() === 'product') query.product_id = { $ne: null };
            if (type.toLowerCase() === 'storefront') query.storefront_id = { $ne: null };
        }
        if (keyword) {
            query.feedback = { $regex: keyword, $options: 'i' };
        }

        const reviews = await Review.find(query)
            .populate('user_id', 'firstName lastName username email role')
            .populate('product_id', 'name')
            .sort({ created_at: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReviewStats = async (req, res) => {
    try {
        const totalReviews = await Review.countDocuments();
        
        const avgAggr = await Review.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" } } }]);
        const platformAvgRating = avgAggr.length > 0 ? Number(avgAggr[0].avg.toFixed(1)) : 0;
        
        const flaggedCount = await Review.countDocuments({ status: 'flagged' });
        const oneStarCount = await Review.countDocuments({ rating: 1 });
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const weeklyNew = await Review.countDocuments({ created_at: { $gte: sevenDaysAgo } });

        const distAggr = await Review.aggregate([
            { $group: { _id: "$rating", count: { $sum: 1 } } }
        ]);

        const ratingDistribution = { "5":0, "4":0, "3":0, "2":0, "1":0 };
        distAggr.forEach(d => {
            if (ratingDistribution[String(d._id)] !== undefined) {
                ratingDistribution[String(d._id)] = d.count;
            }
        });

        res.status(200).json({
            totalReviews,
            platformAvgRating,
            flaggedCount,
            oneStarCount,
            weeklyNew,
            ratingDistribution
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const flagReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, { status: 'flagged' }, { new: true });
        if (!review) return res.status(404).json({ message: 'Review not found' });
        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, { status: 'normal' }, { new: true });
        if (!review) return res.status(404).json({ message: 'Review not found' });
        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAdminReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const bulkDeleteReviews = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'A non-empty array of ids is required' });
        }
        await Review.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ message: 'Reviews deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const bulkFlagReviews = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'A non-empty array of ids is required' });
        }
        await Review.updateMany({ _id: { $in: ids } }, { $set: { status: 'flagged' } });
        res.status(200).json({ message: 'Reviews flagged successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFlaggedReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ status: 'flagged' })
            .populate('user_id', 'firstName lastName username email role')
            .populate('product_id', 'name')
            .sort({ created_at: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPlatformSummary = async (req, res) => {
    try {
        const summary = await aiSummaryService.generatePlatformSummary();
        res.status(200).json({ summary });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllAdminReviews,
    getReviewStats,
    flagReview,
    approveReview,
    deleteAdminReview,
    bulkDeleteReviews,
    bulkFlagReviews,
    getFlaggedReviews,
    getPlatformSummary
};
