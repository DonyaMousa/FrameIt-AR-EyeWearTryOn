import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import { JWT_SECRET as JWT_SECRET_CONST } from "../config/jwt.js";

export const authenticateAdmin = async (req, res, next) => {
  console.log("🚨 authenticateAdmin middleware called");
  console.log("🚨 Request URL:", req.url);
  console.log("🚨 Request method:", req.method);

  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies.token;

    // Debug logging
    console.log("🔐 Admin Auth Check:");
    console.log(
      "  - Authorization header:",
      authHeader ? "Present" : "Missing"
    );
    console.log("  - Cookie token:", cookieToken ? "Present" : "Missing");

    let token = null;

    if (authHeader) {
      // Handle both "Bearer token" and "token" formats
      token = authHeader.startsWith("Bearer ")
        ? authHeader.replace("Bearer ", "").trim()
        : authHeader.trim();
      console.log("  - Using Authorization header token");
    } else if (cookieToken) {
      token = cookieToken;
      console.log("  - Using cookie token");
    }

    if (!token) {
      console.log("  ❌ No token found");
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    console.log("  - Token length:", token.length);
    console.log("  - Token preview:", token.substring(0, 20) + "...");

    // Use shared JWT_SECRET to ensure consistency with authController
    console.log("  - JWT_SECRET length:", JWT_SECRET_CONST.length);
    console.log(
      "  - JWT_SECRET preview:",
      JWT_SECRET_CONST.substring(0, 10) + "..."
    );

    const decoded = jwt.verify(token, JWT_SECRET_CONST);
    console.log("  - Token decoded successfully, admin ID:", decoded.id);

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      console.log("  ❌ Admin not found in database");
      return res.status(401).json({
        success: false,
        error: "Invalid token - admin not found",
      });
    }

    console.log("  ✅ Admin authenticated:", admin.email);
    req.admin = admin;
    req.user = { id: admin._id }; // For compatibility
    next();
  } catch (error) {
    console.log("  ❌ Token verification failed:", error.message);
    res.status(401).json({
      success: false,
      error: "Invalid or expired token",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const authenticateUser = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.replace("Bearer ", "") || req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET_CONST);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};
