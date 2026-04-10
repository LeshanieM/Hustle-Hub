const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat
// Modular MVC architecture implemented
router.post('/', chatController.handleChat);

module.exports = router;
