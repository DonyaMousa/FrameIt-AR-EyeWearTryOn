const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
        res.status(400);
        throw new Error('Please provide productId and quantity');
    }

    const product = await Product.findById(productId);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.stock_quantity < quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for product: ${product.name}`);
    }

    let cart = await Cart.findOne({ user_id: req.user._id });

    if (!cart) {
        cart = await Cart.create({
            user_id: req.user._id,
            items: [],
        });
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.product_id.toString() === productId
    );

    if (itemIndex > -1) {
        // Product exists in cart, update quantity
        cart.items[itemIndex].quantity += Number(quantity);
    } else {
        // Product not in cart, add new item
        cart.items.push({
            product_id: productId,
            quantity: Number(quantity),
        });
    }

    // Optional: Re-validate total quantity against stock if needed, 
    // but usually adding more checks for current total in cart + new quantity vs stock is good practice.
    // For now, simple check on the increment is done above. 
    // A stricter check would be: if (existingQty + quantity > stock) throw error.

    // Let's implement stricter check if item exists
    if (itemIndex > -1) {
        if (cart.items[itemIndex].quantity > product.stock_quantity) {
            res.status(400);
            throw new Error(`Adding this quantity exceeds available stock for ${product.name}`);
        }
    }

    const updatedCart = await cart.save();

    // Populate product details for response
    const populatedCart = await Cart.findById(updatedCart._id).populate('items.product_id', 'name price image_url');

    res.status(200).json(populatedCart);
});

/**
 * @desc    Get user cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user_id: req.user._id }).populate('items.product_id', 'name price image_url');

    if (!cart) {
        // If no cart found, return empty structure or null
        return res.status(200).json({ items: [] });
    }

    res.status(200).json(cart);
});

module.exports = {
    addToCart,
    getCart,
};
