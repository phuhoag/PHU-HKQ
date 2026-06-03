import Product from "../models/product.model.js";

/**
 * @desc   Lấy danh sách sản phẩm (search, filter, sort, pagination)
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

    if (search) query.name = { $regex: search, $options: "i" };
    if (category) query.category_id = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category_id", "name")
        .sort(sort)
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
 * @desc   Lấy sản phẩm nổi bật (mới nhất + còn hàng)
 * @route  GET /api/products/featured
 * @access Public
 */
export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ stock: { $gt: 0 } })
      .populate("category_id", "name")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Lấy sản phẩm liên quan (cùng danh mục, loại trừ sản phẩm hiện tại)
 * @route  GET /api/products/:id/related
 * @access Public
 */
export const getRelatedProducts = async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Sản phẩm không tồn tại" });
    }

    const related = await Product.find({
      category_id: product.category_id,
      _id: { $ne: product._id },
      stock: { $gt: 0 },
    })
      .populate("category_id", "name")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: related,
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
    const { name, category_id, description, price, stock, image } = req.body;

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
    const { name, category_id, description, price, stock, image } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category_id, description, price, stock, image },
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

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category_id", "name")
        .sort(sort)
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
    const { name, category_id, description, price, stock, image } = req.body;

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
    const { name, category_id, description, price, stock, image } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category_id, description, price, stock, image },
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
