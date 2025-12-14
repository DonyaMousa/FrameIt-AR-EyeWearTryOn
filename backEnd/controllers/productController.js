const Product = require('../models/Product');

/**
 * @desc    Fetch all products
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
    try {
        const products = await Product.find({});
        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Fetch single product
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            res.status(200).json({
                success: true,
                data: product,
            });
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(404);
            error.message = 'Product not found';
        }
        next(error);
    }
};

/**
 * @desc    Create a product
 * @route   POST /api/products
 * @access  Public (should be Private/Admin)
 */
const createProduct = async (req, res, next) => {
    try {
        const {
            name,
            description,
            price,
            stock_quantity,
            sku,
            category,
            image_url,
            model_3d_url,
        } = req.body;

        if (!name || !price || !sku) {
            res.status(400);
            throw new Error('Please add all required fields');
        }

        const product = new Product({
            name,
            description,
            price,
            stock_quantity,
            sku,
            category,
            image_url,
            model_3d_url,
        });

        const createdProduct = await product.save();
        res.status(201).json({
            success: true,
            data: createdProduct,
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400);
            error.message = 'Product with this SKU already exists';
        }
        next(error);
    }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Public (should be Private/Admin)
 */
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = req.body.name || product.name;
            product.description = req.body.description || product.description;
            product.price = req.body.price || product.price;
            product.stock_quantity = req.body.stock_quantity || product.stock_quantity;
            product.sku = req.body.sku || product.sku;
            product.category = req.body.category || product.category;
            product.image_url = req.body.image_url || product.image_url;
            product.model_3d_url = req.body.model_3d_url || product.model_3d_url;
            product.is_active = req.body.is_active !== undefined ? req.body.is_active : product.is_active;

            const updatedProduct = await product.save();
            res.status(200).json({
                success: true,
                data: updatedProduct,
            });
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Public (should be Private/Admin)
 */
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne();
            res.status(200).json({
                success: true,
                message: 'Product removed',
            });
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
