import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  createReview,
  getProductReviews,
  deleteReview,
} from "../controllers/review.controller.js";

const router = express.Router();

// Lấy danh sách đánh giá sản phẩm (Public)
router.get("/product/:productId", getProductReviews);

// Tạo đánh giá mới (Protected - Yêu cầu đăng nhập)
router.post("/", authenticateToken, createReview);

// Xóa đánh giá (Protected - Yêu cầu đăng nhập, chỉ cho phép chủ nhân hoặc Admin)
router.delete("/:reviewId", authenticateToken, deleteReview);

export default router;
