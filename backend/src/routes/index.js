import express from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
// import productRoutes from "./product.routes.js";
// import categoryRoutes from "./category.routes.js";
// import cartRoutes from "./cart.routes.js";
// import wishlistRoutes from "./wishlist.routes.js";
// import orderRoutes from "./order.routes.js";
// import reviewRoutes from "./review.routes.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// Auth routes
router.use("/auth", authRoutes);

// Product routes (public - có thể xem sản phẩm)
// router.use("/products", productRoutes);

// Category routes (public)
// router.use("/categories", categoryRoutes);

// Review routes (public - có thể xem review)
// router.use("/reviews", reviewRoutes);

// ============================================
// PROTECTED ROUTES (cần authentication)
// ============================================

// Cart routes
// router.use("/carts", cartRoutes);

// Wishlist routes
// router.use("/wishlists", wishlistRoutes);

// Order routes
// router.use("/orders", orderRoutes);

// ============================================
// ADMIN ROUTES (cần admin role)
// ============================================

// Admin routes
router.use("/admin", adminRoutes);

export default router;
