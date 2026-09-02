const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/**
 * Product Service
 * Handles all product-related API calls
 */

export const productService = {
  /**
   * Get products with filters, search, pagination
   * Returns normalized: { success, data: { products, pagination } }
   */
  getProducts: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page);
      if (params.limit) query.set("limit", params.limit);
      if (params.search) query.set("search", params.search);
      if (params.category) query.set("category", params.category);
      if (params.minPrice) query.set("minPrice", params.minPrice);
      if (params.maxPrice) query.set("maxPrice", params.maxPrice);
      if (params.is_featured !== undefined) query.set("is_featured", params.is_featured);
      if (params.sort) {
        const sortMap = {
          newest: "-createdAt",
          oldest: "createdAt",
          "price-low": "price",
          "price-high": "-price",
          "name-asc": "name",
          "name-desc": "-name",
        };
        query.set("sort", sortMap[params.sort] || "-createdAt");
      }

      const response = await fetch(
        `${API_BASE_URL}/products?${query.toString()}`,
      );
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();

      // Normalize to shape ProductCatalog.jsx expects: res.data.products & res.data.pagination
      return {
        success: data.success,
        message: data.message,
        data: {
          products: data.data || [],
          pagination: data.pagination ? {
            currentPage: data.pagination.page,
            totalPages: data.pagination.totalPages,
            totalItems: data.pagination.total,
            itemsPerPage: data.pagination.limit,
          } : {
            currentPage: parseInt(params.page) || 1,
            totalPages: 1,
            totalItems: (data.data || []).length,
            itemsPerPage: parseInt(params.limit) || 9,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      return {
        success: false,
        message: error.message,
        data: {
          products: [],
          pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 9 },
        },
      };
    }
  },

  /**
   * Get all categories
   */
  getCategories: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      return await response.json();
    } catch (error) {
      console.error("Error fetching categories:", error);
      return { success: false, data: [] };
    }
  },

  /**
   * Get all products (no filter)
   */
  getAllProducts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return await response.json();
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  /**
   * Get product by ID
   */
  getProductById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      return await response.json();
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  /**
   * Get product by slug
   */
  getProductBySlug: async (slug) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/slug/${slug}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      return await response.json();
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  /**
   * Get products by category
   */
  getProductsByCategory: async (categoryId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/category/${categoryId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch products");
      return await response.json();
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  /**
   * Search products
   */
  searchProducts: async (query) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`,
      );
      if (!response.ok) throw new Error("Failed to search products");
      return await response.json();
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  },

  /**
   * Get product images
   */
  getProductImages: async (productId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/images`,
      );
      if (!response.ok) throw new Error("Failed to fetch images");
      return await response.json();
    } catch (error) {
      console.error("Error fetching images:", error);
      throw error;
    }
  },

  /**
   * Add image to product
   */
  addProductImage: async (productId, imageData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/images`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(imageData),
        },
      );
      if (!response.ok) throw new Error("Failed to add image");
      return await response.json();
    } catch (error) {
      console.error("Error adding image:", error);
      throw error;
    }
  },

  /**
   * Delete product image
   */
  deleteProductImage: async (productId, imageId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/images/${imageId}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Failed to delete image");
      return await response.json();
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  },

  /**
   * Set image as primary
   */
  setPrimaryImage: async (productId, imageId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/images/${imageId}/set-primary`,
        { method: "POST" },
      );
      if (!response.ok) throw new Error("Failed to set primary image");
      return await response.json();
    } catch (error) {
      console.error("Error setting primary image:", error);
      throw error;
    }
  },

  // ============================================================
  // PRODUCT IMAGES API
  // ============================================================

  /**
   * Lấy tất cả ảnh gallery của sản phẩm
   */
  getProductImages: async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/images`);
      if (!response.ok) throw new Error("Failed to fetch product images");
      return await response.json();
    } catch (error) {
      console.error("Error fetching product images:", error);
      throw error;
    }
  },

  /**
   * Thêm ảnh vào gallery sản phẩm (Admin)
   * @param {string} productId
   * @param {{ image_url, alt_text?, display_order?, is_primary? }} imageData
   */
  addProductImage: async (productId, imageData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/products/${productId}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(imageData),
      });
      if (!response.ok) throw new Error("Failed to add product image");
      return await response.json();
    } catch (error) {
      console.error("Error adding product image:", error);
      throw error;
    }
  },

  /**
   * Cập nhật ảnh (Admin)
   */
  updateProductImage: async (productId, imageId, imageData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/images/${imageId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(imageData),
        }
      );
      if (!response.ok) throw new Error("Failed to update product image");
      return await response.json();
    } catch (error) {
      console.error("Error updating product image:", error);
      throw error;
    }
  },

  /**
   * Đặt ảnh làm ảnh chính (Admin)
   */
  setPrimaryImage: async (productId, imageId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/images/${imageId}/set-primary`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to set primary image");
      return await response.json();
    } catch (error) {
      console.error("Error setting primary image:", error);
      throw error;
    }
  },

  /**
   * Xóa ảnh khỏi gallery (Admin)
   */
  deleteProductImage: async (productId, imageId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/images/${imageId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to delete product image");
      return await response.json();
    } catch (error) {
      console.error("Error deleting product image:", error);
      throw error;
    }
  },

  /**
   * Sắp xếp lại thứ tự ảnh (Admin)
   * @param {string} productId
   * @param {{ id: string, display_order: number }[]} images
   */
  reorderProductImages: async (productId, images) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/images/reorder`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ images }),
        }
      );
      if (!response.ok) throw new Error("Failed to reorder product images");
      return await response.json();
    } catch (error) {
      console.error("Error reordering product images:", error);
  /**
   * Bật / tắt trạng thái nổi bật (Admin)
   * @param {string} productId
   */
  toggleFeatured: async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/toggle-featured`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to toggle featured status");
      return await response.json();
    } catch (error) {
      console.error("Error toggling featured status:", error);
      throw error;
    }
  },
};

export default productService;
