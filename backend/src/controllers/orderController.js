import Order from "../models/Order.js";
import Product from "../models/Product.js";

/**
 * Get all orders (Admin only)
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "firstName lastName email")
      .populate("items.product", "name brand price images")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch orders",
    });
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "firstName lastName email")
      .populate("items.product", "name brand price images");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch order",
    });
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    if (status) {
      order.status = status;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update order",
    });
  }
};

/**
 * Get user's orders
 */
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const orders = await Order.find({ user: userId })
      .populate("items.product", "name brand price images")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch orders",
    });
  }
};

/**
 * Create order (from checkout)
 */
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Order items are required",
      });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product ${item.productId} not found`,
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal >= 100 ? 0 : 9.99; // Free shipping over $100
    const total = subtotal + tax + shipping;

    // Generate order number before creating order
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const orderNumber = `ORD-${timestamp}-${String(random).padStart(4, "0")}`;

    console.log("📦 Creating order with number:", orderNumber);
    console.log("   User:", req.user?.id);
    console.log("   Items:", orderItems.length);
    console.log("   Total: $" + total.toFixed(2));

    const order = new Order({
      orderNumber, // Set order number explicitly
      user: req.user?.id || req.body.userId,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      paymentMethod: paymentMethod || "credit_card",
      paymentStatus: "paid", // For testing, mark as paid
      status: "pending",
    });

    await order.save();
    console.log("✅ Order saved successfully:", order._id);

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "firstName lastName email")
      .populate("items.product", "name brand price images");

    res.status(201).json({
      success: true,
      data: populatedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create order",
    });
  }
};
