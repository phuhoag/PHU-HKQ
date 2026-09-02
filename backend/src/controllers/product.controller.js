import Product from "../models/product.model.js";

/**
 * @desc   Lấy danh sách sản phẩm (search, filter, pagination)
 * @route  GET /api/products
 * @access Public
 */
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      minPrice,
      maxPrice,
      sort = "-createdAt",
    } = req.query;

    const query = {};

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Filter by category
    if (category) {
      query.category_id = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Filter by is_featured
    if (req.query.is_featured !== undefined) {
      query.is_featured = req.query.is_featured === "true" || req.query.is_featured === true;
    }

    // Parse sort query
    let sortOption = { createdAt: -1 }; // Default newest first
    if (sort === "newest" || sort === "-createdAt") {
      sortOption = { createdAt: -1 };
    } else if (sort === "oldest" || sort === "createdAt") {
      sortOption = { createdAt: 1 };
    } else if (sort === "price-low" || sort === "price-asc" || sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price-high" || sort === "price-desc" || sort === "price_desc") {
      sortOption = { price: -1 };
    } else if (sort === "name-asc") {
      sortOption = { name: 1 };
    } else if (sort === "name-desc") {
      sortOption = { name: -1 };
    } else if (typeof sort === "string" && (sort.startsWith("-") || sort.startsWith("+"))) {
      sortOption = sort;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category_id", "name")
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Lấy chi tiết sản phẩm theo ID
 * @route  GET /api/products/:id
 * @access Public
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category_id",
      "name description",
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Sản phẩm không tồn tại" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Tạo sản phẩm mới
 * @route  POST /api/products
 * @access Admin only
 */
export const createProduct = async (req, res) => {
  try {
    const { name, category_id, description, price, stock, image, is_featured } = req.body;

    if (!name || !category_id || !price) {
      return res.status(400).json({
        success: false,
        message: "Tên, danh mục và giá sản phẩm là bắt buộc",
      });
    }

    const product = await Product.create({
      name,
      category_id,
      description,
      price,
      stock: stock || 0,
      image,
      is_featured: Boolean(is_featured),
    });

    const populated = await product.populate("category_id", "name");

    res.status(201).json({
      success: true,
      message: "Sản phẩm đã được tạo thành công",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Cập nhật sản phẩm
 * @route  PUT /api/products/:id
 * @access Admin only
 */
export const updateProduct = async (req, res) => {
  try {
    const { name, category_id, description, price, stock, image, is_featured } = req.body;

    const updateData = { name, category_id, description, price, stock, image };
    if (is_featured !== undefined) {
      updateData.is_featured = Boolean(is_featured);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    ).populate("category_id", "name");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Sản phẩm không tồn tại" });
    }

    res.status(200).json({
      success: true,
      message: "Sản phẩm đã được cập nhật",
      data: product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Bật / tắt cờ nổi bật (is_featured) cho sản phẩm
 * @route  PATCH /api/products/:id/toggle-featured
 * @access Admin only
 */
export const toggleFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
    }

    product.is_featured = !product.is_featured;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Đã ${product.is_featured ? "đánh dấu nổi bật" : "bỏ đánh dấu nổi bật"} sản phẩm`,
      data: product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Xóa sản phẩm
 * @route  DELETE /api/products/:id
 * @access Admin only
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Sản phẩm không tồn tại" });
    }

    res.status(200).json({
      success: true,
      message: "Sản phẩm đã được xóa thành công",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
