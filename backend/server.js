import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import adminRoutes from "./src/routes/adminRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Get port from environment or use default
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
const publicPath = path.join(__dirname, "src/public");
app.use("/static", express.static(publicPath));
app.use("/api/static", express.static(publicPath));

// Database connection
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/frameit";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    console.log("⚠️  Continuing without database connection...");
  });

// Health check endpoint (for Render health checks)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "FrameIt API is running",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);

// Products endpoint
app.get("/api/products", async (req, res) => {
  try {
    if (ose.connection.readyState !== 1) {
      return res.json({ success: true, data: [] });
    }
    const Product = (await import("./src/models/Product.js")).default;
    const products = await Product.find({ isActive: true })
      .populate("glassesModelId")
      .select(
        "name brand price originalPrice description category gender frameColor lensColor material frameShape images slug glassesModelId isActive createdAt updatedAt"
      );

    console.log(`📦 Fetched ${products.length} products from database`);
    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.json({ success: true, data: [] });
  }
});

// Product by slug endpoint
app.get("/api/products/:slug", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }
    const Product = (await import("./src/models/Product.js")).default;
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    })
      .populate("glassesModelId")
      .select(
        "name brand price originalPrice description category gender frameColor lensColor material frameShape images slug glassesModelId isActive createdAt updatedAt"
      );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    console.log(
      `📦 Fetched product: ${product.name}, Images: ${
        product.images?.length || 0
      }`
    );
    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Glasses models endpoint
app.get("/api/glasses-models", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, data: [] });
    }
    const GlassesModel = (await import("./src/models/GlassesModel.js")).default;
    const models = await GlassesModel.find({ isActive: true });
    res.json({ success: true, data: models });
  } catch (error) {
    console.error("Error fetching glasses models:", error);
    res.json({ success: true, data: [] });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "FrameIt API Server",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/api/health",
      products: "/api/products",
      auth: "/api/auth",
      admin: "/api/admin",
      orders: "/api/orders",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 FrameIt API Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `💾 Database: ${
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
    }`
  );
});

// Handle server errors gracefully
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use.`);
    process.exit(1);
  } else {
    console.error("❌ Server error:", error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
});

export default app;
