import express from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import userRoutes from "./user.routes.js";
import productRoutes from "./product.routes.js";
import categoryRoutes from "./category.routes.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// Auth routes
router.use("/auth", authRoutes);

// ============================================
// PROTECTED ROUTES (cần authentication)
// ============================================

// User routes
router.use("/user", userRoutes);

// ============================================
// ADMIN ROUTES (cần admin role)
// ============================================

// Admin routes
router.use("/admin", adminRoutes);

export default router;
