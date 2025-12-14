import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      sparse: true, // Allow null/undefined temporarily
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "paypal", "stripe"],
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving
OrderSchema.pre("save", async function (next) {
  if (!this.isNew || this.orderNumber) {
    return next();
  }

  try {
    // Generate unique order number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.orderNumber = `ORD-${timestamp}-${String(random).padStart(4, "0")}`;
    next();
  } catch (error) {
    // Fallback if countDocuments fails
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.orderNumber = `ORD-${timestamp}-${String(random).padStart(4, "0")}`;
    next();
  }
});

export default mongoose.model("Order", OrderSchema);
