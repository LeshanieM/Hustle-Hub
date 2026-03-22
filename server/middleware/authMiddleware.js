const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback');
            
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role && req.user.role.toUpperCase() === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

const isOwner = (req, res, next) => {
    if (req.user && req.user.role === 'OWNER') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an owner' });
    }
};

const isCustomer = (req, res, next) => {
    if (req.user && req.user.role && req.user.role.toUpperCase() === 'CUSTOMER') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a customer' });
    }
};

module.exports = { protect, isAdmin, isOwner, isCustomer };
