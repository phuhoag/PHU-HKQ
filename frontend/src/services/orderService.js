const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Order Service
 * Xử lý tất cả API calls liên quan đến đơn hàng
 */
export const orderService = {
  /**
   * Tạo đơn hàng từ giỏ hàng
   * @param {Object} orderData - { shipping_address, phone, full_name, payment_method }
   */
  createOrder: async (orderData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: "Lỗi kết nối: " + err.message };
    }
  },

  /**
   * Lấy danh sách đơn hàng của tôi
   * @param {Object} params - { page, limit, status }
   */
  getMyOrders: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page);
      if (params.limit) query.set("limit", params.limit);
      if (params.status) query.set("status", params.status);

      const res = await fetch(
        `${API_BASE_URL}/orders/my-orders?${query.toString()}`,
        { headers: getAuthHeaders() }
      );
      return await res.json();
    } catch (err) {
      return { success: false, message: "Lỗi kết nối: " + err.message };
    }
  },

  /**
   * Lấy chi tiết một đơn hàng
   * @param {string} orderId
   */
  getOrderById: async (orderId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: "Lỗi kết nối: " + err.message };
    }
  },

  /**
   * Hủy đơn hàng (chỉ được khi status là pending)
   * @param {string} orderId
   */
  cancelOrder: async (orderId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: "Lỗi kết nối: " + err.message };
    }
  },
};
