import express from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import userRoutes from "./user.routes.js";
import productRoutes from "./product.routes.js";
// import productImageRoutes from "./product-image.routes.js";
import categoryRoutes from "./category.routes.js";
import cartRoutes from "./cart.routes.js";
import orderRoutes from "./order.routes.js";
import paymentRoutes from "./payment.routes.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// Auth routes
router.use("/auth", authRoutes);

// Product routes (public - xem sản phẩm không cần login)
router.use("/products", productRoutes);

// Product image routes (gallery ảnh sản phẩm)
// router.use("/products/:productId/images", productImageRoutes);

// Category routes (public)
router.use("/categories", categoryRoutes);

// Payment Webhook routes (public - tự xác thực bằng secret key)
router.use("/payments", paymentRoutes);

// ============================================
// PROTECTED ROUTES (cần authentication)
// ============================================

// User routes
router.use("/user", userRoutes);

// Cart routes (cần authentication)
router.use("/cart", cartRoutes);

// Order routes (cần authentication)
router.use("/orders", orderRoutes);

// ============================================
// ADMIN ROUTES (cần admin role)
// ============================================

// Admin routes
router.use("/admin", adminRoutes);

export default router;
