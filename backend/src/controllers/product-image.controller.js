import ProductImage from "../models/product-image.model.js";
import Product from "../models/product.model.js";

/**
 * @desc   Lấy tất cả ảnh của một sản phẩm (sắp xếp theo display_order)
 * @route  GET /api/products/:productId/images
 * @access Public
 */
export const getProductImages = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Sản phẩm không tồn tại" });
    }

    const images = await ProductImage.find({ product_id: productId }).sort({
      is_primary: -1,
      display_order: 1,
    });

    return res.status(200).json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error("getProductImages error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi lấy ảnh sản phẩm" });
  }
};

/**
 * @desc   Thêm ảnh vào gallery sản phẩm
 * @route  POST /api/products/:productId/images
 * @access Admin only
 * @body   { image_url, alt_text?, display_order?, is_primary? }
 */
export const addProductImage = async (req, res) => {
  try {
    const { productId } = req.params;
    const { image_url, alt_text = "", display_order = 0, is_primary = false } = req.body;

    if (!image_url) {
      return res
        .status(400)
        .json({ success: false, message: "image_url là bắt buộc" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Sản phẩm không tồn tại" });
    }

    // Nếu đặt là primary → bỏ primary của ảnh cũ
    if (is_primary) {
      await ProductImage.updateMany(
        { product_id: productId },
        { is_primary: false }
      );
    }

    // Nếu chưa có ảnh nào → tự động đặt là primary
    const existingCount = await ProductImage.countDocuments({ product_id: productId });
    const shouldBePrimary = is_primary || existingCount === 0;

    const image = await ProductImage.create({
      product_id: productId,
      image_url,
      alt_text,
      display_order,
      is_primary: shouldBePrimary,
    });

    // Cập nhật trường image chính của product nếu là primary
    if (shouldBePrimary) {
      await Product.findByIdAndUpdate(productId, { image: image_url });
    }

    return res.status(201).json({
      success: true,
      message: "Đã thêm ảnh vào gallery sản phẩm",
      data: image,
    });
  } catch (error) {
    console.error("addProductImage error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi thêm ảnh sản phẩm" });
  }
};

/**
 * @desc   Cập nhật thông tin ảnh (alt_text, display_order, is_primary)
 * @route  PUT /api/products/:productId/images/:imageId
 * @access Admin only
 */
export const updateProductImage = async (req, res) => {
  try {
    const { productId, imageId } = req.params;
    const { image_url, alt_text, display_order, is_primary } = req.body;

    const image = await ProductImage.findOne({
      _id: imageId,
      product_id: productId,
    });

    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Ảnh không tồn tại" });
    }

    // Nếu set is_primary = true → bỏ primary của ảnh cũ
    if (is_primary === true) {
      await ProductImage.updateMany(
        { product_id: productId, _id: { $ne: imageId } },
        { is_primary: false }
      );
      // Cập nhật image chính của product
      await Product.findByIdAndUpdate(productId, {
        image: image_url || image.image_url,
      });
    }

    const updated = await ProductImage.findByIdAndUpdate(
      imageId,
      {
        ...(image_url !== undefined && { image_url }),
        ...(alt_text !== undefined && { alt_text }),
        ...(display_order !== undefined && { display_order }),
        ...(is_primary !== undefined && { is_primary }),
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Đã cập nhật ảnh",
      data: updated,
    });
  } catch (error) {
    console.error("updateProductImage error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi cập nhật ảnh" });
  }
};

/**
 * @desc   Đặt ảnh làm ảnh chính (primary)
 * @route  PATCH /api/products/:productId/images/:imageId/set-primary
 * @access Admin only
 */
export const setPrimaryImage = async (req, res) => {
  try {
    const { productId, imageId } = req.params;

    const image = await ProductImage.findOne({
      _id: imageId,
      product_id: productId,
    });

    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Ảnh không tồn tại" });
    }

    // Bỏ primary của tất cả ảnh khác
    await ProductImage.updateMany(
      { product_id: productId },
      { is_primary: false }
    );

    // Set ảnh này làm primary
    image.is_primary = true;
    await image.save();

    // Cập nhật trường image chính của product
    await Product.findByIdAndUpdate(productId, { image: image.image_url });

    return res.status(200).json({
      success: true,
      message: "Đã đặt làm ảnh chính",
      data: image,
    });
  } catch (error) {
    console.error("setPrimaryImage error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi cập nhật ảnh chính" });
  }
};

/**
 * @desc   Xóa ảnh khỏi gallery
 * @route  DELETE /api/products/:productId/images/:imageId
 * @access Admin only
 */
export const deleteProductImage = async (req, res) => {
  try {
    const { productId, imageId } = req.params;

    const image = await ProductImage.findOneAndDelete({
      _id: imageId,
      product_id: productId,
    });

    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Ảnh không tồn tại" });
    }

    // Nếu xóa ảnh primary → tự động set ảnh đầu tiên còn lại làm primary
    if (image.is_primary) {
      const nextImage = await ProductImage.findOne({ product_id: productId }).sort({
        display_order: 1,
      });

      if (nextImage) {
        nextImage.is_primary = true;
        await nextImage.save();
        await Product.findByIdAndUpdate(productId, { image: nextImage.image_url });
      } else {
        // Không còn ảnh nào → xóa image chính của product
        await Product.findByIdAndUpdate(productId, { image: null });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Đã xóa ảnh khỏi gallery",
    });
  } catch (error) {
    console.error("deleteProductImage error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi xóa ảnh" });
  }
};

/**
 * @desc   Cập nhật thứ tự hiển thị của nhiều ảnh cùng lúc
 * @route  PATCH /api/products/:productId/images/reorder
 * @access Admin only
 * @body   { images: [{ id, display_order }] }
 */
export const reorderProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    const { images } = req.body;

    if (!Array.isArray(images) || images.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "images phải là mảng không rỗng" });
    }

    const updatePromises = images.map(({ id, display_order }) =>
      ProductImage.findOneAndUpdate(
        { _id: id, product_id: productId },
        { display_order },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    const updatedImages = await ProductImage.find({ product_id: productId }).sort({
      is_primary: -1,
      display_order: 1,
    });

    return res.status(200).json({
      success: true,
      message: "Đã cập nhật thứ tự ảnh",
      data: updatedImages,
    });
  } catch (error) {
    console.error("reorderProductImages error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi sắp xếp ảnh" });
  }
};
