/**
 * Cart Service
 * Handles all cart-related API calls to the backend
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const cartService = {
  /**
   * Lấy giỏ hàng của người dùng (bao gồm tổng tiền)
   */
  getCart: async () => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Lấy giỏ hàng thất bại");
    return data;
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  addToCart: async (product_id, quantity = 1) => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_id, quantity }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Thêm vào giỏ thất bại");
    return data;
  },

  /**
   * Cập nhật số lượng sản phẩm trong giỏ
   */
  updateCartItem: async (cartItemId, quantity) => {
    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Cập nhật giỏ hàng thất bại");
    return data;
  },

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  removeFromCart: async (cartItemId) => {
    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Xóa sản phẩm thất bại");
    return data;
  },

  /**
   * Xóa toàn bộ giỏ hàng
   */
  clearCart: async () => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Xóa giỏ hàng thất bại");
    return data;
  },

  /**
   * Lưu/đồng bộ giỏ hàng từ localStorage lên server
   * items: [{ product_id, quantity }]
   */
  syncCart: async (items) => {
    const response = await fetch(`${API_BASE_URL}/cart/sync`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ items }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Đồng bộ giỏ hàng thất bại");
    return data;
  },
};

export default cartService;
