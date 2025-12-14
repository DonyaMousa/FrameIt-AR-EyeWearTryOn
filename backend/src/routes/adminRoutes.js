import express from "express";
import {
  addCompleteGlassesPackage,
  getAllProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/adminController.js";
import { uploadGlassesPackage, uploadProductImages } from "../middleware/upload.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

// Add complete glasses package (3D model + product + textures)
router.post(
  "/glasses/add-complete",
  authenticateAdmin,
  uploadGlassesPackage.fields([
    { name: "modelFiles", maxCount: 10 },
    { name: "textureFiles", maxCount: 20 },
    { name: "productImages", maxCount: 10 },
  ]),
  addCompleteGlassesPackage
);

// Product management
router.get("/products", authenticateAdmin, getAllProducts);
router.patch(
  "/products/:id",
  authenticateAdmin,
  uploadProductImages.array("productImages", 10),
  updateProduct
);
router.delete("/products/:id", authenticateAdmin, deleteProduct);

export default router;


