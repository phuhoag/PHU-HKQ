import express from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import userRoutes from "./user.routes.js";
import productRoutes from "./product.routes.js";
import categoryRoutes from "./category.routes.js";
import cartRoutes from "./cart.routes.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// Auth routes
router.use("/auth", authRoutes);

// Product routes (public - xem sản phẩm không cần login)
router.use("/products", productRoutes);

// Category routes (public)
router.use("/categories", categoryRoutes);

// ============================================
// PROTECTED ROUTES (cần authentication)
// ============================================

// User routes
router.use("/user", userRoutes);

// Cart routes (cần authentication)
router.use("/cart", cartRoutes);

// ============================================
// ADMIN ROUTES (cần admin role)
// ============================================

// Admin routes
router.use("/admin", adminRoutes);

export default router;
