import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

// =============================================
// THÊM SẢN PHẨM VÀO GIỎ HÀNG
// =============================================
export const addToCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: "product_id là bắt buộc",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Số lượng phải lớn hơn hoặc bằng 1",
      });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại",
      });
    }

    // Kiểm tra tồn kho
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Sản phẩm chỉ còn ${product.stock} trong kho`,
      });
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existingItem = await Cart.findOne({ user_id, product_id });

    if (existingItem) {
      // Nếu đã có thì cộng thêm số lượng
      const newQuantity = existingItem.quantity + quantity;

      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm chỉ còn ${product.stock} trong kho`,
        });
      }

      existingItem.quantity = newQuantity;
      await existingItem.save();

      const populatedItem = await Cart.findById(existingItem._id).populate(
        "product_id",
        "name price image stock",
      );

      return res.status(200).json({
        success: true,
        message: "Đã cập nhật số lượng sản phẩm trong giỏ hàng",
        data: populatedItem,
      });
    }

    // Thêm mới vào giỏ
    const cartItem = new Cart({ user_id, product_id, quantity });
    await cartItem.save();

    const populatedItem = await Cart.findById(cartItem._id).populate(
      "product_id",
      "name price image stock",
    );

    return res.status(201).json({
      success: true,
      message: "Đã thêm sản phẩm vào giỏ hàng",
      data: populatedItem,
    });
  } catch (error) {
    console.error("addToCart error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm vào giỏ hàng",
    });
  }
};

// =============================================
// LẤY GIỎ HÀNG CỦA NGƯỜI DÙNG (bao gồm tổng tiền)
// =============================================
export const getCart = async (req, res) => {
  try {
    const user_id = req.user.id;

    const cartItems = await Cart.find({ user_id }).populate(
      "product_id",
      "name price image stock description",
    );

    // Tính tổng tiền
    const totalPrice = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.product_id?.price?.toString() || "0");
      return sum + price * item.quantity;
    }, 0);

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return res.status(200).json({
      success: true,
      message: "Lấy giỏ hàng thành công",
      data: {
        items: cartItems,
        totalItems,
        totalPrice: totalPrice.toFixed(2),
      },
    });
  } catch (error) {
    console.error("getCart error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy giỏ hàng",
    });
  }
};

// =============================================
// CẬP NHẬT SỐ LƯỢNG SẢN PHẨM TRONG GIỎ
// =============================================
export const updateCartItem = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        message: "Số lượng là bắt buộc",
      });
    }

    // Nếu quantity <= 0 thì xóa khỏi giỏ
    if (quantity <= 0) {
      await Cart.findOneAndDelete({ _id: cartItemId, user_id });
      return res.status(200).json({
        success: true,
        message: "Đã xóa sản phẩm khỏi giỏ hàng",
        data: null,
      });
    }

    const cartItem = await Cart.findOne({ _id: cartItemId, user_id });
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm trong giỏ hàng",
      });
    }

    // Kiểm tra tồn kho
    const product = await Product.findById(cartItem.product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không còn tồn tại",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Sản phẩm chỉ còn ${product.stock} trong kho`,
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    const populatedItem = await Cart.findById(cartItem._id).populate(
      "product_id",
      "name price image stock",
    );

    return res.status(200).json({
      success: true,
      message: "Đã cập nhật số lượng",
      data: populatedItem,
    });
  } catch (error) {
    console.error("updateCartItem error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật giỏ hàng",
    });
  }
};

// =============================================
// XÓA SẢN PHẨM KHỎI GIỎ HÀNG
// =============================================
export const removeFromCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { cartItemId } = req.params;

    const cartItem = await Cart.findOneAndDelete({ _id: cartItemId, user_id });
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm trong giỏ hàng",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Đã xóa sản phẩm khỏi giỏ hàng",
    });
  } catch (error) {
    console.error("removeFromCart error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa sản phẩm khỏi giỏ hàng",
    });
  }
};

// =============================================
// XÓA TOÀN BỘ GIỎ HÀNG
// =============================================
export const clearCart = async (req, res) => {
  try {
    const user_id = req.user.id;

    await Cart.deleteMany({ user_id });

    return res.status(200).json({
      success: true,
      message: "Đã xóa toàn bộ giỏ hàng",
    });
  } catch (error) {
    console.error("clearCart error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa giỏ hàng",
    });
  }
};

// =============================================
// LƯU GIỎ HÀNG (SYNC từ localStorage lên DB)
// =============================================
export const syncCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { items } = req.body; // [{ product_id, quantity }]

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "items phải là một mảng",
      });
    }

    // Xử lý từng item trong danh sách gửi lên
    const results = [];

    for (const item of items) {
      const { product_id, quantity } = item;

      if (!product_id || !quantity || quantity < 1) continue;

      // Kiểm tra sản phẩm hợp lệ
      const product = await Product.findById(product_id);
      if (!product) continue;

      // Upsert: nếu tồn tại thì cập nhật, không thì tạo mới
      const cartItem = await Cart.findOneAndUpdate(
        { user_id, product_id },
        { quantity: Math.min(quantity, product.stock) },
        { upsert: true, new: true },
      );

      results.push(cartItem);
    }

    // Lấy giỏ hàng đầy đủ sau khi sync
    const cartItems = await Cart.find({ user_id }).populate(
      "product_id",
      "name price image stock",
    );

    const totalPrice = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.product_id?.price?.toString() || "0");
      return sum + price * item.quantity;
    }, 0);

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return res.status(200).json({
      success: true,
      message: "Đã đồng bộ giỏ hàng thành công",
      data: {
        items: cartItems,
        totalItems,
        totalPrice: totalPrice.toFixed(2),
      },
    });
  } catch (error) {
    console.error("syncCart error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi đồng bộ giỏ hàng",
    });
  }
};
