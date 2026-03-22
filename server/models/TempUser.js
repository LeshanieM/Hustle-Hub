const mongoose = require('mongoose');

const tempUserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    studentId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    studentEmail: { type: String, required: true },
    role: { type: String, required: true },
    studentIdImage: { type: String, required: true },
    otp: { type: String, required: true },
    otpExpiry: { type: Date, required: true },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: 600 // Automatically deletes the document from MongoDB after 10 minutes (600 seconds)
    }
});

module.exports = mongoose.model('TempUser', tempUserSchema);
