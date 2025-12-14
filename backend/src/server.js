import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0';

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
app.use("/static", express.static(path.join(__dirname, "public")));
app.use("/api/static", express.static(path.join(__dirname, "public")));

// Database connection
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/frameit";
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    console.log("⚠️  Continuing without database connection...");
  });

// Basic routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "FrameIt API is running" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/products", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, data: [] });
    }
    const Product = (await import("./models/Product.js")).default;
    const products = await Product.find({ isActive: true })
      .populate("glassesModelId")
      .select(
        "name brand price originalPrice description category gender frameColor lensColor material frameShape images slug glassesModelId isActive createdAt updatedAt"
      ); // Explicitly select all fields including images

    // Log to verify images are in database
    console.log(`📦 Fetched ${products.length} products from database`);
    products.forEach((product) => {
      console.log(
        `  - ${product.name}: ${product.images?.length || 0} image(s)`
      );
    });

    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.json({ success: true, data: [] });
  }
});

app.get("/api/products/:slug", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }
    const Product = (await import("./models/Product.js")).default;
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    })
      .populate("glassesModelId")
      .select(
        "name brand price originalPrice description category gender frameColor lensColor material frameShape images slug glassesModelId isActive createdAt updatedAt"
      ); // Explicitly select all fields including images

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

app.get("/api/glasses-models", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, data: [] });
    }
    const GlassesModel = (await import("./models/GlassesModel.js")).default;
    const models = await GlassesModel.find({ isActive: true });
    res.json({ success: true, data: models });
  } catch (error) {
    console.error("Error fetching glasses models:", error);
    res.json({ success: true, data: [] });
  }
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📡 API available at http://${HOST}:${PORT}/api`);
});

// Handle server errors gracefully
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.log(`💡 Try: lsof -ti:${PORT} | xargs kill -9`);
    process.exit(1);
  } else {
    console.error("❌ Server error:", error);
    process.exit(1);
  }
});
