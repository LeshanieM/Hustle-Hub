const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },
    storefront_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Storefront',
        default: null
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    feedback: {
        type: String,
        required: true,
        minlength: [10, 'Feedback must be at least 10 characters long']
    },
    status: {
        type: String,
        enum: ['normal', 'flagged'],
        default: 'normal'
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Enforce rule: Either product_id OR storefront_id must be provided, but never both
reviewSchema.pre('save', function () {
    if (!this.product_id && !this.storefront_id) {
        throw new Error('A review must be associated with either a product or a storefront.');
    }
    if (this.product_id && this.storefront_id) {
        throw new Error('A review cannot belong to both a product and a storefront.');
    }
});

module.exports = mongoose.model('Review', reviewSchema);
