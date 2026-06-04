import express from "express";
import {
  getProductImages,
  addProductImage,
  updateProductImage,
  setPrimaryImage,
  deleteProductImage,
  reorderProductImages,
} from "../controllers/product-image.controller.js";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router({ mergeParams: true });
// mergeParams: true để nhận :productId từ parent router

/**
 * @route  GET /api/products/:productId/images
 * @desc   Lấy tất cả ảnh gallery của sản phẩm
 * @access Public
 */
router.get("/", getProductImages);

/**
 * @route  POST /api/products/:productId/images
 * @desc   Thêm ảnh vào gallery
 * @access Admin only
 * @body   { image_url, alt_text?, display_order?, is_primary? }
 */
router.post("/", authenticateToken, authorizeAdmin, addProductImage);

/**
 * @route  PATCH /api/products/:productId/images/reorder
 * @desc   Sắp xếp lại thứ tự ảnh
 * @access Admin only
 * @body   { images: [{ id, display_order }] }
 */
router.patch("/reorder", authenticateToken, authorizeAdmin, reorderProductImages);

/**
 * @route  PATCH /api/products/:productId/images/:imageId/set-primary
 * @desc   Đặt ảnh làm ảnh chính
 * @access Admin only
 */
router.patch("/:imageId/set-primary", authenticateToken, authorizeAdmin, setPrimaryImage);

/**
 * @route  PUT /api/products/:productId/images/:imageId
 * @desc   Cập nhật thông tin ảnh
 * @access Admin only
 */
router.put("/:imageId", authenticateToken, authorizeAdmin, updateProductImage);

/**
 * @route  DELETE /api/products/:productId/images/:imageId
 * @desc   Xóa ảnh khỏi gallery
 * @access Admin only
 */
router.delete("/:imageId", authenticateToken, authorizeAdmin, deleteProductImage);

export default router;
