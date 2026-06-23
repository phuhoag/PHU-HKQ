import Category from "../models/category.model.js";
import Product from "../models/product.model.js";

/**
 * @desc   Lấy danh sách tất cả danh mục (hỗ trợ search + pagination)
 * @route  GET /api/categories
 * @access Public
 */
export const getCategories = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [categories, total] = await Promise.all([
      Category.find(filter).sort({ name: 1 }).skip(skip).limit(parseInt(limit)),
      Category.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: categories,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Lấy danh sách danh mục kèm số lượng sản phẩm
 * @route  GET /api/categories/with-count
 * @access Public
 */
export const getCategoriesWithProductCount = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({
          category_id: cat._id,
          is_active: true,
        });
        return { ...cat, productCount };
      })
    );

    res.status(200).json({
      success: true,
      data: categoriesWithCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Lấy chi tiết danh mục theo ID
 * @route  GET /api/categories/:id
 * @access Public
 */
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Danh mục không tồn tại" });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Tạo danh mục mới
 * @route  POST /api/categories
 * @access Admin only
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Tên danh mục là bắt buộc" });
    }

    const existing = await Category.findOne({ name });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Danh mục đã tồn tại" });
    }

    const category = await Category.create({ name, description, image });

    res.status(201).json({
      success: true,
      message: "Danh mục đã được tạo thành công",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Cập nhật danh mục
 * @route  PUT /api/categories/:id
 * @access Admin only
 */
export const updateCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, image },
      { new: true, runValidators: true },
    );

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Danh mục không tồn tại" });
    }

    res.status(200).json({
      success: true,
      message: "Danh mục đã được cập nhật",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Xóa danh mục
 * @route  DELETE /api/categories/:id
 * @access Admin only
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Danh mục không tồn tại" });
    }

    res.status(200).json({
      success: true,
      message: "Danh mục đã được xóa thành công",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
