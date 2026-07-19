import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import OrderItem from "../models/order-item.model.js";
import { ORDER_STATUS } from "../constants/enums.js";

/**
 * @desc   Viết đánh giá cho sản phẩm
 * @route  POST /api/reviews
 * @access Private (Khách hàng đã đăng nhập)
 */
export const createReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    const user_id = req.user.id;

    if (!product_id || !rating) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp mã sản phẩm và điểm đánh giá",
      });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: "Điểm đánh giá phải từ 1 đến 5 sao",
      });
    }

    // 1. Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // 2. Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
    const existingReview = await Review.findOne({ product_id, user_id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đánh giá sản phẩm này rồi. Mỗi khách hàng chỉ được đánh giá một lần.",
      });
    }

    // 3. Kiểm tra xem khách hàng đã mua sản phẩm này chưa (Verified Purchase)
    const completedOrders = await Order.find({
      user_id,
      status: { $in: [ORDER_STATUS.DELIVERED, ORDER_STATUS.SHIPPED, ORDER_STATUS.PROCESSING] },
    });

    const orderIds = completedOrders.map((o) => o._id);
    const hasBought = await OrderItem.exists({
      order_id: { $in: orderIds },
      product_id,
    });

    // 4. Tạo đánh giá mới
    const review = await Review.create({
      product_id,
      user_id,
      rating: ratingNum,
      comment: comment || "",
      verifiedPurchase: !!hasBought,
    });

    // Populate thông tin người dùng gửi về client
    const populatedReview = await Review.findById(review._id).populate(
      "user_id",
      "full_name first_name last_name avatar email"
    );

    return res.status(201).json({
      success: true,
      message: "Đánh giá sản phẩm thành công!",
      data: populatedReview,
    });
  } catch (error) {
    console.error("createReview error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi gửi đánh giá",
    });
  }
};

/**
 * @desc   Lấy danh sách đánh giá của một sản phẩm
 * @route  GET /api/reviews/product/:productId
 * @access Public
 */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 1. Kiểm tra sản phẩm tồn tại
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // 2. Lấy danh sách reviews phân trang
    const [reviews, total] = await Promise.all([
      Review.find({ product_id: productId })
        .populate("user_id", "full_name first_name last_name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ product_id: productId }),
    ]);

    // 3. Tính điểm trung bình (avg rating) và thống kê số sao
    const allReviews = await Review.find({ product_id: productId }, "rating");
    const totalReviews = allReviews.length;
    
    let avgRating = 0;
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (totalReviews > 0) {
      const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
      avgRating = Number((sum / totalReviews).toFixed(1));
      
      allReviews.forEach((r) => {
        if (ratingDistribution[r.rating] !== undefined) {
          ratingDistribution[r.rating]++;
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        summary: {
          avgRating,
          totalReviews,
          ratingDistribution,
        },
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("getProductReviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy danh sách đánh giá",
    });
  }
};

/**
 * @desc   Xóa đánh giá (Admin hoặc chính chủ đánh giá)
 * @route  DELETE /api/reviews/:reviewId
 * @access Private
 */
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const user = req.user;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá",
      });
    }

    // Kiểm tra quyền: Phải là Admin hoặc chính chủ viết đánh giá
    const isAdmin = user.role === "admin";
    const isOwner = review.user_id.toString() === user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa đánh giá này",
      });
    }

    await Review.findByIdAndDelete(reviewId);

    return res.status(200).json({
      success: true,
      message: "Xóa đánh giá thành công!",
    });
  } catch (error) {
    console.error("deleteReview error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xóa đánh giá",
    });
  }
};
