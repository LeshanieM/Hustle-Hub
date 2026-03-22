const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    studentId: {
        type: String,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    studentEmail: {
        type: String,
        unique: true
    },
    role: {
        type: String,
        enum: ['ADMIN', 'CUSTOMER', 'OWNER'],
        required: true
    },
    studentIdImage: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String
    },
    otpExpiry: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
