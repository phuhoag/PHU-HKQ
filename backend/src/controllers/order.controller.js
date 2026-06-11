import Order from "../models/order.model.js";
import OrderItem from "../models/order-item.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { ORDER_STATUS } from "../constants/enums.js";

// =============================================
// TẠO ĐƠN HÀNG TỪ GIỎ HÀNG
// POST /api/orders
// =============================================
export const createOrder = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { shipping_address, phone, full_name, payment_method } = req.body;

    // Validate
    if (!shipping_address || !phone || !full_name || !payment_method) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ: họ tên, địa chỉ, số điện thoại, phương thức thanh toán",
      });
    }

    // Lấy giỏ hàng
    const cartItems = await Cart.find({ user_id }).populate(
      "product_id",
      "name price stock image"
    );

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Giỏ hàng trống, không thể đặt hàng",
      });
    }

    // Kiểm tra tồn kho và tính tổng
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of cartItems) {
      const product = item.product_id;
      if (!product) continue;

      const price = parseFloat(product.price?.toString() || "0");
      const quantity = item.quantity;

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho`,
        });
      }

      totalAmount += price * quantity;
      orderItemsData.push({ product_id: product._id, quantity, price });
    }

    // Tạo đơn hàng
    const fullAddress = `${full_name} | ${phone} | ${shipping_address}`;
    const order = await Order.create({
      user_id,
      total_amount: totalAmount.toFixed(2),
      status: ORDER_STATUS.PENDING,
      payment_method,
      payment_status: "pending",
      shipping_address: fullAddress,
      phone,
    });

    // Tạo order items + giảm tồn kho
    const orderItems = orderItemsData.map((item) => ({
      ...item,
      order_id: order._id,
    }));
    await OrderItem.insertMany(orderItems);

    // Giảm stock từng sản phẩm
    for (const item of orderItemsData) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Xóa giỏ hàng
    await Cart.deleteMany({ user_id });

    // Trả về order kèm items
    const populatedItems = await OrderItem.find({ order_id: order._id }).populate(
      "product_id",
      "name price image"
    );

    return res.status(201).json({
      success: true,
      message: "Đặt hàng thành công!",
      data: {
        order,
        items: populatedItems,
      },
    });
  } catch (error) {
    console.error("createOrder error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo đơn hàng",
    });
  }
};

// =============================================
// LẤY DANH SÁCH ĐƠN HÀNG CỦA TÔI
// GET /api/orders/my-orders
// =============================================
export const getMyOrders = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { user_id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    // Lấy items cho từng order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ order_id: order._id }).populate(
          "product_id",
          "name price image"
        );
        return { ...order.toObject(), items };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        orders: ordersWithItems,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("getMyOrders error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách đơn hàng",
    });
  }
};

// =============================================
// LẤY CHI TIẾT ĐƠN HÀNG
// GET /api/orders/:orderId
// =============================================
export const getOrderById = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user_id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    const items = await OrderItem.find({ order_id: order._id }).populate(
      "product_id",
      "name price image description"
    );

    return res.status(200).json({
      success: true,
      data: { ...order.toObject(), items },
    });
  } catch (error) {
    console.error("getOrderById error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết đơn hàng",
    });
  }
};

// =============================================
// HỦY ĐƠN HÀNG (chỉ khi pending)
// PATCH /api/orders/:orderId/cancel
// =============================================
export const cancelOrder = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user_id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (order.status !== ORDER_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể hủy đơn hàng đang ở trạng thái chờ xác nhận",
      });
    }

    // Hoàn lại stock
    const items = await OrderItem.find({ order_id: order._id });
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = ORDER_STATUS.CANCELLED;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Đã hủy đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("cancelOrder error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi hủy đơn hàng",
    });
  }
};

// =============================================
// ADMIN: Cập nhật trạng thái đơn hàng
// PATCH /api/orders/:orderId/status (Admin only)
// =============================================
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!Object.values(ORDER_STATUS).includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái không hợp lệ. Chấp nhận: ${Object.values(ORDER_STATUS).join(", ")}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    return res.status(200).json({
      success: true,
      message: `Đã cập nhật trạng thái đơn hàng thành: ${status}`,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =============================================
// ADMIN: Lấy tất cả đơn hàng
// GET /api/orders/all (Admin only)
// =============================================
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.user_id = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user_id", "first_name last_name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    // Lấy items cho từng order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ order_id: order._id }).populate(
          "product_id",
          "name price image"
        );
        return { ...order.toObject(), items };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        orders: ordersWithItems,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
