const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['USER', 'STORE', 'SYSTEM', 'ORDER', 'PRODUCT']
    },
    target: {
        type: String,
        required: true
    },
    admin: {
        type: String,
        default: 'System'
    },
    icon: {
        type: String,
        default: 'info'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
