import express from "express";
import {
  validateCoupon,
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/coupon.controller.js";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes (cho khách hàng)
router.post("/validate", authenticateToken, validateCoupon);

// Admin routes (quản lý coupon)
router.get("/", authenticateToken, authorizeAdmin, getAllCoupons);
router.get("/:id", authenticateToken, authorizeAdmin, getCouponById);
router.post("/", authenticateToken, authorizeAdmin, createCoupon);
router.put("/:id", authenticateToken, authorizeAdmin, updateCoupon);
router.delete("/:id", authenticateToken, authorizeAdmin, deleteCoupon);

export default router;
