const Booking = require('../models/Booking');
const Product = require('../models/Product');
const User = require('../models/User');
const Store = require('../models/Store');

// ==================== USER MANAGEMENT ====================
// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ==================== STORE MANAGEMENT ====================
// @desc    Get all stores
// @route   GET /api/admin/stores
// @access  Private/Admin
const getAllStores = async (req, res) => {
    try {
        const stores = await Store.find({}).populate('ownerId', 'firstName lastName email studentEmail');
        res.json(stores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update store status (approve/suspend)
// @route   PUT /api/admin/stores/:id/status
// @access  Private/Admin
const updateStoreStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const store = await Store.findById(req.params.id);

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        store.status = status;
        const updatedStore = await store.save();

        res.json(updatedStore);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ==================== BOOKING MANAGEMENT ====================
// @desc    Get all bookings (Admin only)
// @route   GET /api/admin/bookings
// @access  Private (ADMIN)
const getAllBookings = async (req, res) => {
    try {
        const { status, storefront_id, delivery_place, delivery_time, date, search } = req.query;
        let query = {};

        if (status && status !== 'All') {
            query.status = status.toLowerCase();
        }
        if (delivery_place && delivery_place !== 'All') {
            query.delivery_place = delivery_place;
        }
        if (delivery_time && delivery_time !== 'All') {
            query.delivery_time = delivery_time;
        }
        if (date) {
            query.delivery_date = date; // simple string match
        }

        // Fetch all bookings with basic populates
        let bookings = await Booking.find(query)
            .populate('customer_id', 'firstName lastName studentEmail studentId')
            .populate('product_id', 'name price type ownerId')
            .sort({ createdAt: -1 })
            .lean();

        // Manual population and filtering for search and storefront
        // Since ownerId is a string in Product.js, we fetch the owner users
        const ownerIds = [...new Set(bookings.filter(b => b.product_id?.ownerId).map(b => b.product_id.ownerId))];
        const owners = await User.find({ _id: { $in: ownerIds } }, 'firstName lastName').lean();
        const ownerMap = {};
        owners.forEach(o => {
            ownerMap[o._id.toString()] = { storefront_name: `${o.firstName} ${o.lastName}'s Store` };
        });

        // Attach storefront_name and map keys to what the frontend expects
        bookings = bookings.map(b => {
            const customer = b.customer_id || {};
            const product = b.product_id || {};
            const ownerId = product.ownerId;
            const storefront = ownerId && ownerMap[ownerId] ? ownerMap[ownerId] : { storefront_name: 'Unknown Store' };
            
            return {
                ...b,
                _id: b._id.toString(),
                student_id: {
                    _id: customer._id,
                    first_name: customer.firstName,
                    last_name: customer.lastName,
                    email: customer.studentEmail,
                    studentIdStr: customer.studentId
                },
                product_id: {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    category: product.type,
                    storefront_id: {
                        _id: ownerId,
                        storefront_name: storefront.storefront_name
                    }
                }
            };
        });

        // Client-side like search filter
        if (search) {
            const s = search.toLowerCase();
            bookings = bookings.filter(b => {
                const customerName = `${b.student_id.first_name} ${b.student_id.last_name}`.toLowerCase();
                const productName = (b.product_id.name || '').toLowerCase();
                const storeName = (b.product_id.storefront_id.storefront_name || '').toLowerCase();
                const orderIdStr = b._id.slice(-8).toLowerCase();
                
                return customerName.includes(s) || 
                       productName.includes(s) || 
                       storeName.includes(s) || 
                       orderIdStr.includes(s);
            });
        }

        // Storefront ID filter
        if (storefront_id && storefront_id !== 'All') {
            bookings = bookings.filter(b => b.product_id.storefront_id._id === storefront_id);
        }

        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error in getAllBookings:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get booking statistics (Admin only)
// @route   GET /api/admin/bookings/stats
// @access  Private (ADMIN)
const getBookingStats = async (req, res) => {
    try {
        const bookings = await Booking.find().lean();
        
        let total = bookings.length;
        let pending = 0;
        let confirmed = 0;
        let completed = 0;
        let cancelled = 0;
        let todayRevenue = 0;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        bookings.forEach(b => {
            if (b.status === 'pending') pending++;
            else if (b.status === 'confirmed') confirmed++;
            else if (b.status === 'completed') completed++;
            else if (b.status === 'cancelled') cancelled++;

            const bDate = new Date(b.createdAt);
            if (bDate >= todayStart && (b.status === 'confirmed' || b.status === 'completed')) {
                todayRevenue += (b.total_price || 0); // Note: quantity implicitly in total_price if designed that way, else price * quantity
            }
        });

        const validBookings = total - cancelled;
        const completionRate = validBookings > 0 ? (completed / validBookings) * 100 : 0;

        res.status(200).json({
            total,
            pending,
            confirmed,
            completed,
            cancelled,
            todayRevenue,
            completionRate: parseFloat(completionRate.toFixed(1))
        });
    } catch (error) {
        console.error('Error in getBookingStats:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Emergency status override (Admin only)
// @route   PATCH /api/admin/bookings/:id/status
// @access  Private (ADMIN)
const overrideBookingStatus = async (req, res) => {
    try {
        const { status, reason } = req.body;
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = status;
        // Optionally store the reason in owner_note or a new field, for now just log it or add to owner_note
        if (reason) {
           booking.owner_note = `[ADMIN OVERRIDE]: ${reason} ` + (booking.owner_note || '');
        }

        await booking.save();

        res.status(200).json(booking);
    } catch (error) {
        console.error('Error in overrideBookingStatus:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export bookings to CSV (Admin only)
// @route   GET /api/admin/bookings/export
// @access  Private (ADMIN)
const exportBookingsCSV = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('customer_id', 'firstName lastName studentEmail')
            .populate('product_id', 'name price ownerId')
            .sort({ createdAt: -1 })
            .lean();

        const ownerIds = [...new Set(bookings.filter(b => b.product_id?.ownerId).map(b => b.product_id.ownerId))];
        const owners = await User.find({ _id: { $in: ownerIds } }, 'firstName lastName').lean();
        const ownerMap = {};
        owners.forEach(o => {
            ownerMap[o._id.toString()] = `${o.firstName} ${o.lastName}'s Store`;
        });

        // Columns: Order ID, Customer Name, Customer Email, Product, Storefront, Delivery Location, Delivery Time, Delivery Date, Quantity, Total (LKR), Status, Placed On
        let csv = 'Order ID,Customer Name,Customer Email,Product,Storefront,Delivery Location,Delivery Time,Delivery Date,Quantity,Total (LKR),Status,Placed On\n';

        bookings.forEach(b => {
            const customer = b.customer_id || {};
            const product = b.product_id || {};
            const ownerId = product.ownerId;
            const storefrontName = (ownerId && ownerMap[ownerId] ? ownerMap[ownerId] : 'Unknown Store').replace(/,/g, '');
            
            const row = [
                b._id.toString(),
                `${customer.firstName || ''} ${customer.lastName || ''}`.replace(/,/g, ''),
                customer.studentEmail || '',
                (product.name || '').replace(/,/g, ''),
                storefrontName,
                (b.delivery_place || '').replace(/,/g, ''),
                (b.delivery_time || '').replace(/,/g, ''),
                (b.delivery_date || '').replace(/,/g, ''),
                b.quantity || 1,
                b.total_price || 0,
                b.status,
                new Date(b.createdAt).toISOString().split('T')[0]
            ];
            csv += row.join(',') + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=hustle-hub-bookings.csv');
        res.status(200).send(csv);

    } catch (error) {
        console.error('Error in exportBookingsCSV:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    // User management
    getAllUsers,
    
    // Store management
    getAllStores,
    updateStoreStatus,
    
    // Booking management
    getAllBookings,
    getBookingStats,
    overrideBookingStatus,
    exportBookingsCSV
};