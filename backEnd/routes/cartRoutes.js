const express = require('express');
const router = express.Router();
const { addToCart, getCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, addToCart).get(protect, getCart);

module.exports = router;
