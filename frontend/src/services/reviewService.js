const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/**
 * Review Service
 * Handles all product review and rating API calls
 */
export const reviewService = {
  /**
   * Get reviews for a specific product
   * GET /api/reviews/product/:productId
   */
  getProductReviews: async (productId, page = 1, limit = 10) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reviews/product/${productId}?page=${page}&limit=${limit}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("getProductReviews error:", error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Submit a new review
   * POST /api/reviews
   */
  createReview: async ({ product_id, rating, comment }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id, rating, comment }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("createReview error:", error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Delete a review
   * DELETE /api/reviews/:reviewId
   */
  deleteReview: async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("deleteReview error:", error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Get all reviews (Admin only)
   * GET /api/admin/reviews
   */
  getAdminReviews: async (params = {}) => {
    try {
      const token = localStorage.getItem("token");
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page);
      if (params.limit) query.set("limit", params.limit);
      if (params.search) query.set("search", params.search);
      if (params.rating) query.set("rating", params.rating);

      const response = await fetch(
        `${API_BASE_URL}/admin/reviews?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("getAdminReviews error:", error);
      return { success: false, message: error.message };
    }
  },
};
