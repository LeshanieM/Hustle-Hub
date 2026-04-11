const express = require('express');
const router = express.Router();
const { createTicket, getUserTickets, getStoreTickets, replyToTicket, editTicket, deleteTicket, getAllTickets } = require('../controllers/supportController');
const { protect, isOwner, isAdmin } = require('../middleware/authMiddleware');

router.post('/', protect, createTicket);
router.get('/my-tickets', protect, getUserTickets);
router.patch('/:id', protect, editTicket);
router.delete('/:id', protect, deleteTicket);

router.get('/store-tickets', protect, isOwner, getStoreTickets);
router.patch('/:id/reply', protect, isOwner, replyToTicket); 
router.patch('/:id/admin-resolve', protect, isAdmin, replyToTicket);
router.get('/all-tickets', protect, isAdmin, getAllTickets);

module.exports = router;
