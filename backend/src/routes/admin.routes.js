import express from "express";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/auth.middleware.js";
import User from "../models/user.model.js";

const router = express.Router();

/**
 * @route   GET /api/admin/users
 * @access  Admin only
 * @desc    Get all users (admin dashboard)
 */
router.get("/users", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password") // Exclude password
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Danh sách người dùng",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách người dùng",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/admin/users/:id
 * @access  Admin only
 * @desc    Get user by ID
 */
router.get(
  "/users/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      res.status(200).json({
        success: true,
        message: "Thông tin người dùng",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi lấy thông tin người dùng",
        error: error.message,
      });
    }
  },
);

/**
 * @route   PUT /api/admin/users/:id/status
 * @access  Admin only
 * @desc    Activate/Deactivate user account
 */
router.put(
  "/users/:id/status",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { is_active } = req.body;

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { is_active },
        { new: true },
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      res.status(200).json({
        success: true,
        message: `Tài khoản đã được ${is_active ? "kích hoạt" : "vô hiệu hóa"}`,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi cập nhật trạng thái người dùng",
        error: error.message,
      });
    }
  },
);

/**
 * @route   PUT /api/admin/users/:id/role
 * @access  Admin only
 * @desc    Change user role
 */
router.put(
  "/users/:id/role",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { role } = req.body;
      const validRoles = ["admin", "customer"];

      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Vai trò không hợp lệ",
        });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true },
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      res.status(200).json({
        success: true,
        message: "Vai trò đã được cập nhật",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi cập nhật vai trò người dùng",
        error: error.message,
      });
    }
  },
);

/**
 * @route   DELETE /api/admin/users/:id
 * @access  Admin only
 * @desc    Delete user (soft delete - set is_active to false)
 */
router.delete(
  "/users/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { is_active: false },
        { new: true },
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      res.status(200).json({
        success: true,
        message: "Người dùng đã được xóa",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi xóa người dùng",
        error: error.message,
      });
    }
  },
);

export default router;
