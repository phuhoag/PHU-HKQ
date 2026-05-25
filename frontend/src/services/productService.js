const API_BASE_URL = "http://localhost:5000/api";

/**
 * Product Service
 * Handles all product-related API calls
 */

export const productService = {
  /**
   * Get all products
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
   * Get product by ID with images
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
          headers: {
            "Content-Type": "application/json",
          },
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
        {
          method: "DELETE",
        },
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
        {
          method: "POST",
        },
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
