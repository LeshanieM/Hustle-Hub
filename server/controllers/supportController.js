const SupportTicket = require('../models/SupportTicket');
const Store = require('../models/Store');

// @desc    Create a new support ticket
// @route   POST /api/support
// @access  Private (Customer)
const createTicket = async (req, res) => {
    try {
        const { targetStore, subject, message } = req.body;

        if (!targetStore || !subject || !message) {
            return res.status(400).json({ success: false, message: 'Please provide store, subject, and message' });
        }

        const ticket = await SupportTicket.create({
            sender: req.user._id,
            targetStore,
            subject,
            message,
            status: 'Open'
        });

        res.status(201).json({ success: true, ticket });

        // Notify OWNER
        const store = await Store.findOne({ storeName: targetStore });
        if (store && store.ownerId) {
            const { sendNotification } = require('../services/notificationService');
            await sendNotification({
                recipientId: store.ownerId,
                actorId: req.user._id,
                type: 'NEW_SUPPORT_TICKET',
                title: 'New Support Inquiry',
                message: `You have a new support request regarding "${subject}".`,
                category: 'SUPPORT_MESSAGES',
                roleScope: 'OWNER',
                entityType: 'support',
                entityId: ticket._id,
                link: `/owner-dashboard`, // Adjust as needed
            });
        }
    } catch (error) {
        console.error('Support Ticket Creation Error:', error);
        res.status(500).json({ success: false, message: 'Server error while creating ticket' });
    }
};

// @desc    Get user's support ticket history
// @route   GET /api/support/my-tickets
// @access  Private
const getUserTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ sender: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, tickets });
    } catch (error) {
        console.error('Get User Tickets Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching tickets' });
    }
};

// @desc    Get store's support ticket history
// @route   GET /api/support/store-tickets
// @access  Private (Owner)
const getStoreTickets = async (req, res) => {
    try {
        const store = await Store.findOne({ ownerId: req.user._id });
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }
        
        const tickets = await SupportTicket.find({ targetStore: store.storeName })
            .populate('sender', 'username firstName lastName studentEmail')
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, tickets });
    } catch (error) {
        console.error('Get Store Tickets Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching tickets' });
    }
};

// @desc    Reply to a support ticket
// @route   PATCH /api/support/:id/reply
// @access  Private (Owner)
const replyToTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { reply } = req.body;

        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        ticket.reply = reply;
        ticket.status = 'Resolved';
        await ticket.save();

        res.status(200).json({ success: true, ticket });

        // Notify CUSTOMER
        const { sendNotification } = require('../services/notificationService');
        await sendNotification({
            recipientId: ticket.sender,
            actorId: req.user._id,
            type: 'SUPPORT_RESPONSE',
            title: 'Support Request Update',
            message: `The store owner has replied to your inquiry: "${ticket.subject}".`,
            category: 'supportResponses',
            roleScope: 'CUSTOMER',
            entityType: 'support',
            entityId: ticket._id,
            link: `/customer-dashboard`, // Adjust as needed
            required: true,
        });
    } catch (error) {
        console.error('Reply to Ticket Error:', error);
        res.status(500).json({ success: false, message: 'Server error replying to ticket' });
    }
};

// @desc    Edit a support ticket
// @route   PATCH /api/support/:id
// @access  Private (Customer)
const editTicket = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }
        
        if (ticket.sender.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized to edit this ticket' });
        }
        
        if (ticket.status === 'Resolved' || ticket.reply) {
            return res.status(400).json({ success: false, message: 'Cannot edit a ticket that has already been replied to' });
        }
        
        const { message, subject, targetStore } = req.body;
        if (message) ticket.message = message;
        if (subject) ticket.subject = subject;
        if (targetStore) ticket.targetStore = targetStore;
        
        await ticket.save();
        res.status(200).json({ success: true, ticket });
    } catch (error) {
        console.error('Edit Ticket Error:', error);
        res.status(500).json({ success: false, message: 'Server error editing ticket' });
    }
};

// @desc    Delete a support ticket
// @route   DELETE /api/support/:id
// @access  Private (Customer)
const deleteTicket = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }
        
        if (ticket.sender.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this ticket' });
        }
        
        if (ticket.status === 'Resolved' || ticket.reply) {
            return res.status(400).json({ success: false, message: 'Cannot delete a ticket that has already been replied to' });
        }
        
        await SupportTicket.deleteOne({ _id: ticket._id });
        res.status(200).json({ success: true, message: 'Ticket removed', id: ticket._id });
    } catch (error) {
        console.error('Delete Ticket Error:', error);
        res.status(500).json({ success: false, message: 'Server error deleting ticket' });
    }
};

// @desc    Get all support tickets for admin
// @route   GET /api/support/all-tickets
// @access  Private (Admin)
const getAllTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({})
            .populate('sender', 'username firstName lastName studentEmail')
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, tickets });
    } catch (error) {
        console.error('Get All Tickets Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching tickets' });
    }
};

module.exports = {
    createTicket,
    getUserTickets,
    getStoreTickets,
    replyToTicket,
    editTicket,
    deleteTicket,
    getAllTickets
};
