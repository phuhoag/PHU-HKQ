import Coupon from "../models/coupon.model.js";
import Cart from "../models/cart.model.js";

// =============================================
// VALIDATE VÀ TÍNH TOÁN GIẢM GIÁ CỦA MÃ
// POST /api/coupons/validate
// =============================================
export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập mã giảm giá",
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Mã giảm giá không tồn tại hoặc đã hết hạn",
      });
    }

    if (!coupon.is_active) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá này đã tạm dừng hoạt động",
      });
    }

    if (new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá đã hết hạn sử dụng",
      });
    }

    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá này đã được sử dụng hết lượt giới hạn",
      });
    }

    // Lấy giỏ hàng của user để tính tổng tiền subtotal
    const cartItems = await Cart.find({ user_id: req.user.id }).populate(
      "product_id",
      "price"
    );

    const subtotal = cartItems.reduce((total, item) => {
      if (!item.product_id) return total;
      const price = parseFloat(item.product_id.price?.toString() || "0");
      return total + price * item.quantity;
    }, 0);

    if (subtotal === 0) {
      return res.status(400).json({
        success: false,
        message: "Giỏ hàng trống, không thể áp dụng mã giảm giá",
      });
    }

    if (subtotal < coupon.min_purchase) {
      return res.status(400).json({
        success: false,
        message: `Giá trị đơn hàng chưa đạt mức tối thiểu $${coupon.min_purchase.toFixed(
          2
        )} để sử dụng mã này`,
      });
    }

    // Tính toán discount
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = subtotal * (coupon.discount_value / 100);
      if (coupon.max_discount !== null && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    } else if (coupon.discount_type === "fixed") {
      discountAmount = coupon.discount_value;
    }

    // Đảm bảo không giảm vượt quá subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    return res.status(200).json({
      success: true,
      message: "Áp dụng mã giảm giá thành công!",
      data: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: parseFloat(discountAmount.toFixed(2)),
        min_purchase: coupon.min_purchase,
        max_discount: coupon.max_discount,
      },
    });
  } catch (error) {
    console.error("validateCoupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi kiểm tra mã giảm giá",
    });
  }
};

// =============================================
// LẤY TẤT CẢ MÃ GIẢM GIÁ (ADMIN)
// GET /api/coupons
// =============================================
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    console.error("getAllCoupons error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tải danh sách mã giảm giá",
    });
  }
};

// =============================================
// LẤY MỘT MÃ CHI TIẾT (ADMIN)
// GET /api/coupons/:id
// =============================================
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã giảm giá",
      });
    }
    return res.status(200).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error("getCouponById error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tải thông tin mã giảm giá",
    });
  }
};

// =============================================
// TẠO MÃ GIẢM GIÁ MỚI (ADMIN)
// POST /api/coupons
// =============================================
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      min_purchase,
      max_discount,
      expiry_date,
      usage_limit,
      is_active,
    } = req.body;

    if (!code || !discount_type || !discount_value || !expiry_date) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ các trường bắt buộc",
      });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá này đã tồn tại",
      });
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      discount_type,
      discount_value: parseFloat(discount_value),
      min_purchase: min_purchase ? parseFloat(min_purchase) : 0,
      max_discount: max_discount ? parseFloat(max_discount) : null,
      expiry_date: new Date(expiry_date),
      usage_limit: usage_limit ? parseInt(usage_limit) : null,
      is_active: is_active !== undefined ? is_active : true,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo mã giảm giá thành công!",
      data: coupon,
    });
  } catch (error) {
    console.error("createCoupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tạo mã giảm giá",
    });
  }
};

// =============================================
// CẬP NHẬT MÃ GIẢM GIÁ (ADMIN)
// PUT /api/coupons/:id
// =============================================
export const updateCoupon = async (req, res) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      min_purchase,
      max_discount,
      expiry_date,
      usage_limit,
      is_active,
    } = req.body;

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã giảm giá",
      });
    }

    if (code) {
      const cleanCode = code.toUpperCase().trim();
      if (cleanCode !== coupon.code) {
        const existing = await Coupon.findOne({ code: cleanCode });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: "Mã giảm giá này đã tồn tại trên một coupon khác",
          });
        }
        coupon.code = cleanCode;
      }
    }

    if (discount_type) coupon.discount_type = discount_type;
    if (discount_value !== undefined) coupon.discount_value = parseFloat(discount_value);
    if (min_purchase !== undefined) coupon.min_purchase = parseFloat(min_purchase);
    if (max_discount !== undefined) coupon.max_discount = max_discount ? parseFloat(max_discount) : null;
    if (expiry_date) coupon.expiry_date = new Date(expiry_date);
    if (usage_limit !== undefined) coupon.usage_limit = usage_limit ? parseInt(usage_limit) : null;
    if (is_active !== undefined) coupon.is_active = is_active;

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật mã giảm giá thành công!",
      data: coupon,
    });
  } catch (error) {
    console.error("updateCoupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi cập nhật mã giảm giá",
    });
  }
};

// =============================================
// XÓA MÃ GIẢM GIÁ (ADMIN)
// DELETE /api/coupons/:id
// =============================================
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã giảm giá",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Đã xóa mã giảm giá thành công!",
    });
  } catch (error) {
    console.error("deleteCoupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xóa mã giảm giá",
    });
  }
};
