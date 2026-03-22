const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const {
    getAllAdminReviews,
    getReviewStats,
    flagReview,
    approveReview,
    deleteAdminReview,
    bulkDeleteReviews,
    bulkFlagReviews,
    getFlaggedReviews,
    getPlatformSummary
} = require('../controllers/adminReviewController');

router.use(protect);
router.use(isAdmin);

router.get('/all', getAllAdminReviews);
router.get('/stats', getReviewStats);
router.get('/platform-summary', getPlatformSummary);
router.get('/flagged', getFlaggedReviews);

router.delete('/bulk', bulkDeleteReviews);
router.patch('/bulk/flag', bulkFlagReviews);

router.patch('/:id/flag', flagReview);
router.patch('/:id/approve', approveReview);
router.delete('/:id', deleteAdminReview);

module.exports = router;
