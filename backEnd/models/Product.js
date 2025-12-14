const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
            required: true,
        },
        stock_quantity: {
            type: Number,
            required: true,
            default: 0,
        },
        sku: {
            type: String,
            required: true,
            unique: true,
        },
        category: {
            type: String,
        },
        image_url: {
            type: String,
        },
        model_3d_url: {
            type: String,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
