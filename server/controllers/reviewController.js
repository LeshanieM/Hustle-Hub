const Review = require('../models/Review');
const aiSummaryService = require('../services/aiSummaryService');

// @desc    Create a review
// @route   POST /api/reviews/
// @access  Private (CUSTOMER)
const createReview = async (req, res) => {
    try {
        const { product_id, storefront_id, rating, feedback } = req.body;
        
        if (req.user.isVerified !== undefined && req.user.isVerified === false) {
             return res.status(403).json({ message: 'Only verified users can post reviews' });
        }

        if (!product_id && !storefront_id) {
            return res.status(400).json({ message: 'product_id or storefront_id is required' });
        }
        
        if (product_id && storefront_id) {
            return res.status(400).json({ message: 'Review cannot have both product and storefront IDs' });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        if (!feedback || feedback.length < 10) {
            return res.status(400).json({ message: 'Feedback must be at least 10 characters long' });
        }

        // (Removed duplicate review check to allow multiple reviews)

        const review = await Review.create({
            user_id: req.user._id,
            product_id: product_id || null,
            storefront_id: storefront_id || null,
            rating,
            feedback
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:id
// @access  Private (CUSTOMER, OWNER, ADMIN)
const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product_id: req.params.id })
            .populate('user_id', 'firstName lastName username email role')
            .sort({ created_at: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reviews for a storefront
// @route   GET /api/reviews/store/:id
// @access  Private 
const getStorefrontReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ storefront_id: req.params.id })
            .populate('user_id', 'firstName lastName username email role')
            .sort({ created_at: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner or ADMIN)
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Allow ADMIN or Owner of the review
        const isAdmin = req.user.role === 'ADMIN';
        const isOwner = review.user_id.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        await review.deleteOne();
        res.status(200).json({ message: 'Review removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Owner only)
const updateReview = async (req, res) => {
    try {
        const { rating, feedback } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Only the owner can update
        if (review.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only update your own reviews' });
        }

        if (rating) review.rating = rating;
        if (feedback) review.feedback = feedback;

        await review.save();
        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reviews for admin
// @route   GET /api/reviews/admin/all
// @access  Private (ADMIN)
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user_id', 'firstName lastName username email role')
            .sort({ created_at: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get AI generated summary for a product
// @route   GET /api/reviews/summary/:productId
// @access  Private (CUSTOMER)
const getReviewSummary = async (req, res) => {
    try {
        const productId = req.params.productId;
        const summary = await aiSummaryService.generateReviewSummary(productId);
        res.status(200).json({ summary });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReview,
    getProductReviews,
    getStorefrontReviews,
    deleteReview,
    updateReview,
    getReviewSummary,
    getAllReviews
};
