const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const faqController = require('../controllers/faqController');

// Public route for fetching FAQs (used by ChatBot)
router.get('/', faqController.getAllFaqs);

// Admin-protected routes for managing FAQs
router.post('/', protect, isAdmin, faqController.createFaq);
router.put('/:id', protect, isAdmin, faqController.updateFaq);
router.delete('/:id', protect, isAdmin, faqController.deleteFaq);

module.exports = router;
