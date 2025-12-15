const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Place new order
 * @route   POST /api/orders
 * @access  Private
 */
const placeOrder = asyncHandler(async (req, res) => {
    // 1. Get user cart
    const cart = await Cart.findOne({ user_id: req.user._id });

    if (!cart || cart.items.length === 0) {
        res.status(400);
        throw new Error('No items in cart');
    }

    // 2. Validate stock and prepare order items
    const orderItems = [];
    let totalPrice = 0;

    // Use a loop to validate all products before making changes
    for (const item of cart.items) {
        const product = await Product.findById(item.product_id);

        if (!product) {
            res.status(404);
            throw new Error(`Product not found with id: ${item.product_id}`);
        }

        if (product.stock_quantity < item.quantity) {
            res.status(400);
            throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        orderItems.push({
            product_id: product._id,
            quantity: item.quantity,
            price: product.price, // Store current price
        });

        totalPrice += product.price * item.quantity;
    }

    // 3. Create Order
    const order = new Order({
        user_id: req.user._id,
        items: orderItems,
        total_price: totalPrice,
        status: 'pending',
    });

    const createdOrder = await order.save();

    // 4. Update Product Stock and Clear Cart
    // We do this after order placement to ensure consistency. 
    // If order save fails, stock is not touched (thanks to line order).

    for (const item of orderItems) {
        await Product.updateOne(
            { _id: item.product_id },
            { $inc: { stock_quantity: -item.quantity } }
        );
    }

    // Clear cart or delete it. Deleting is cleaner for this model.
    await Cart.findOneAndDelete({ user_id: req.user._id });

    res.status(201).json(createdOrder);
});

module.exports = {
    placeOrder,
};
