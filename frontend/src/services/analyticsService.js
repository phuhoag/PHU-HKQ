const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const analyticsService = {
  getAdminAnalytics: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/analytics`, {
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: "Lỗi kết nối: " + err.message };
    }
  },
};
