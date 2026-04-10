const express = require('express');
const router = express.Router();
const aiAdminController = require('../controllers/aiAdminController');

// POST /api/ai/admin-query
router.post('/admin-query', aiAdminController.handleAdminQuery);

module.exports = router;
