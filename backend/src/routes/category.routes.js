import express from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @route  GET /api/categories
 * @desc   Lấy danh sách tất cả danh mục
 * @access Public
 */
router.get("/", getCategories);

/**
 * @route  GET /api/categories/:id
 * @desc   Lấy chi tiết danh mục
 * @access Public
 */
router.get("/:id", getCategoryById);

/**
 * @route  POST /api/categories
 * @desc   Tạo danh mục mới
 * @access Admin only
 */
router.post("/", authenticateToken, authorizeAdmin, createCategory);

/**
 * @route  PUT /api/categories/:id
 * @desc   Cập nhật danh mục
 * @access Admin only
 */
router.put("/:id", authenticateToken, authorizeAdmin, updateCategory);

/**
 * @route  DELETE /api/categories/:id
 * @desc   Xóa danh mục
 * @access Admin only
 */
router.delete("/:id", authenticateToken, authorizeAdmin, deleteCategory);

export default router;
