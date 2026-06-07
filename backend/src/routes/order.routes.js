import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
} from "../controllers/order.controller.js";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// ─── Customer routes (cần đăng nhập) ───────────────────
router.post("/", authenticateToken, createOrder);                                     // Tạo đơn hàng
router.get("/my-orders", authenticateToken, getMyOrders);                             // Lịch sử đơn hàng
router.get("/admin/all", authenticateToken, authorizeAdmin, getAllOrders);            // Admin: tất cả đơn
router.get("/:orderId", authenticateToken, getOrderById);                             // Chi tiết đơn hàng
router.patch("/:orderId/cancel", authenticateToken, cancelOrder);                     // Hủy đơn hàng
router.patch("/:orderId/status", authenticateToken, authorizeAdmin, updateOrderStatus); // Admin: cập nhật status

export default router;
