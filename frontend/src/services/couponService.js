const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const API_BASE_URL = `${API_BASE.replace(/\/$/, "")}/coupons`;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const couponService = {
  validateCoupon: async (code) => {
    const res = await fetch(`${API_BASE_URL}/validate`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ code }),
    });
    return await res.json();
  },

  getAllCoupons: async () => {
    const res = await fetch(API_BASE_URL, {
      method: "GET",
      headers: getHeaders(),
    });
    return await res.json();
  },

  getCouponById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return await res.json();
  },

  createCoupon: async (data) => {
    const res = await fetch(API_BASE_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  updateCoupon: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  deleteCoupon: async (id) => {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return await res.json();
  },
};
