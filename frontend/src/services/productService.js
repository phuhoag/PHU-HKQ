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
          pagination: data.pagination || {
            currentPage: parseInt(params.page) || 1,
            totalPages: 1,
            totalItems: (data.data || []).length,
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
          pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
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
};

export default productService;
