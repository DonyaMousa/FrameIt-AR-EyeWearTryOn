import express from "express";
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  createOrder,
  getUserOrders,
} from "../controllers/orderController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Admin routes
router.get("/admin", authenticateAdmin, getAllOrders);
router.get("/admin/:id", authenticateAdmin, getOrderById);
router.patch("/admin/:id/status", authenticateAdmin, updateOrderStatus);

// User routes
router.get("/my", authenticateUser, getUserOrders); // Get user's orders
router.post("/", authenticateUser, createOrder);
router.get("/:id", authenticateUser, getOrderById);

export default router;
