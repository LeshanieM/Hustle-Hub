const express = require('express');
const router = express.Router();
const { protect, isCustomer, isAdmin } = require('../middleware/authMiddleware');
const {
    createReview,
    getProductReviews,
    getStorefrontReviews,
    deleteReview,
    updateReview,
    getReviewSummary,
    getAllReviews,
     getOwnerReviews,
     getMyReviews
} = require('../controllers/reviewController');

// All review routes require authentication
router.use(protect);

router.post('/', isCustomer, createReview);
router.get('/my', getMyReviews);
router.get('/owner/my-reviews', getOwnerReviews);
router.get('/product/:id', getProductReviews); 
router.get('/store/:id', getStorefrontReviews);
router.get('/summary/:productId', getReviewSummary);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;
