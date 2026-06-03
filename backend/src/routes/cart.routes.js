import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

// Tất cả cart routes đều yêu cầu đăng nhập
router.use(authenticateToken);

// GET /api/cart - Lấy giỏ hàng (bao gồm tổng tiền)
router.get("/", getCart);

// POST /api/cart/sync - Lưu/đồng bộ giỏ hàng từ localStorage (đặt trước POST /)
router.post("/sync", syncCart);

// POST /api/cart - Thêm sản phẩm vào giỏ
router.post("/", addToCart);

// PUT /api/cart/:cartItemId - Cập nhật số lượng
router.put("/:cartItemId", updateCartItem);

// DELETE /api/cart - Xóa toàn bộ giỏ hàng (đặt trước DELETE /:cartItemId)
router.delete("/", clearCart);

// DELETE /api/cart/:cartItemId - Xóa sản phẩm khỏi giỏ
router.delete("/:cartItemId", removeFromCart);

export default router;
