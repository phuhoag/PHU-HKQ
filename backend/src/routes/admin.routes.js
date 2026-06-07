import express from "express";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/auth.middleware.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import OrderItem from "../models/order-item.model.js";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";

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

/**
 * @route   GET /api/admin/analytics
 * @access  Admin only
 * @desc    Get dashboard analytics (revenue, users, products, categories, top-sellers)
 */
router.get(
  "/analytics",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      // 1. Fetch data in memory
      const [orders, orderItems, users, products, categories] = await Promise.all([
        Order.find().lean(),
        OrderItem.find().lean(),
        User.find({ role: "customer" }).lean(),
        Product.find().lean(),
        Category.find().lean()
      ]);

      // 2. Summary Metrics
      const totalUsers = users.length;
      const activeUsers = users.filter((u) => u.is_active).length;
      const totalProducts = products.length;
      const totalOrders = orders.length;
      const completedOrders = orders.filter((o) => o.status === "delivered").length;
      
      // Exclude cancelled orders for revenue
      const nonCancelledOrders = orders.filter((o) => o.status !== "cancelled");
      const totalRevenue = nonCancelledOrders.reduce(
        (sum, o) => sum + Number(o.total_amount?.toString() || 0),
        0
      );
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // 3. Monthly Sales breakdown
      const monthlyMap = {};
      nonCancelledOrders.forEach((o) => {
        const date = new Date(o.createdAt);
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-11
        const key = `${year}-${month.toString().padStart(2, "0")}`;
        if (!monthlyMap[key]) {
          monthlyMap[key] = { sales: 0, count: 0, year, month };
        }
        monthlyMap[key].sales += Number(o.total_amount?.toString() || 0);
        monthlyMap[key].count += 1;
      });

      const monthNames = [
        "T1", "T2", "T3", "T4", "T5", "T6",
        "T7", "T8", "T9", "T10", "T11", "T12"
      ];
      const monthlySales = Object.keys(monthlyMap)
        .sort()
        .map((key) => {
          const item = monthlyMap[key];
          return {
            month: `${monthNames[item.month]} / ${item.year}`,
            sales: parseFloat(item.sales.toFixed(2)),
            orders: item.count
          };
        });

      // 4. Category distribution
      const categoryMap = {};
      const productMap = {};
      products.forEach((p) => {
        productMap[p._id.toString()] = p;
      });

      const catNameMap = {};
      categories.forEach((c) => {
        catNameMap[c._id.toString()] = c.name;
      });

      const nonCancelledOrderIds = new Set(
        nonCancelledOrders.map((o) => o._id.toString())
      );

      orderItems.forEach((item) => {
        if (!nonCancelledOrderIds.has(item.order_id.toString())) return;

        const prodId = item.product_id?.toString() || item.product_id?._id?.toString();
        const product = productMap[prodId];
        if (!product) return;

        const catId = product.category_id?.toString();
        const catName = catNameMap[catId] || "Chưa phân loại";

        if (!categoryMap[catName]) {
          categoryMap[catName] = { sales: 0, qty: 0 };
        }
        const itemPrice = Number(item.price?.toString() || 0);
        categoryMap[catName].sales += item.quantity * itemPrice;
        categoryMap[catName].qty += item.quantity;
      });

      const categorySales = Object.keys(categoryMap)
        .map((name) => ({
          category: name,
          sales: parseFloat(categoryMap[name].sales.toFixed(2)),
          qty: categoryMap[name].qty
        }))
        .sort((a, b) => b.sales - a.sales);

      // 5. Top-selling products
      const topProdMap = {};
      orderItems.forEach((item) => {
        if (!nonCancelledOrderIds.has(item.order_id.toString())) return;

        const prodId = item.product_id?.toString() || item.product_id?._id?.toString();
        if (!prodId) return;

        const product = productMap[prodId];
        if (!product) return;

        if (!topProdMap[prodId]) {
          topProdMap[prodId] = {
            name: product.name,
            image: product.image,
            price: Number(product.price?.toString() || 0),
            unitsSold: 0,
            revenue: 0
          };
        }
        const itemPrice = Number(item.price?.toString() || 0);
        topProdMap[prodId].unitsSold += item.quantity;
        topProdMap[prodId].revenue += item.quantity * itemPrice;
      });

      const topProducts = Object.keys(topProdMap)
        .map((id) => ({
          _id: id,
          name: topProdMap[id].name,
          image: topProdMap[id].image,
          price: topProdMap[id].price,
          unitsSold: topProdMap[id].unitsSold,
          revenue: parseFloat(topProdMap[id].revenue.toFixed(2))
        }))
        .sort((a, b) => b.unitsSold - a.unitsSold)
        .slice(0, 5);

      res.status(200).json({
        success: true,
        data: {
          summary: {
            totalUsers,
            activeUsers,
            totalProducts,
            totalOrders,
            completedOrders,
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            avgOrderValue: parseFloat(avgOrderValue.toFixed(2))
          },
          monthlySales,
          categorySales,
          topProducts
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi lấy thống kê phân tích",
        error: error.message
      });
    }
  }
);

export default router;
