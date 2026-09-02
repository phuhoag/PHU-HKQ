import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleFeatured,
} from "../controllers/product.controller.js";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @route  GET /api/products
 * @desc   Lấy danh sách sản phẩm (search, filter, pagination)
 * @access Public
 * @query  page, limit, search, category, minPrice, maxPrice, sort
 */
router.get("/", getProducts);

/**
 * @route  GET /api/products/:id
 * @desc   Lấy chi tiết sản phẩm theo ID
 * @access Public
 */
router.get("/:id", getProductById);

/**
 * @route  POST /api/products
 * @desc   Tạo sản phẩm mới
 * @access Admin only
 */
router.post("/", authenticateToken, authorizeAdmin, createProduct);

/**
 * @route  PUT /api/products/:id
 * @desc   Cập nhật sản phẩm
 * @access Admin only
 */
router.put("/:id", authenticateToken, authorizeAdmin, updateProduct);

/**
 * @route  PATCH /api/products/:id/toggle-featured
 * @desc   Bật / tắt cờ nổi bật của sản phẩm
 * @access Admin only
 */
router.patch("/:id/toggle-featured", authenticateToken, authorizeAdmin, toggleFeatured);

/**
 * @route  DELETE /api/products/:id
 * @desc   Xóa sản phẩm
 * @access Admin only
 */
router.delete("/:id", authenticateToken, authorizeAdmin, deleteProduct);

export default router;
