import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import router from "./routers/routes.jsx";
import "./index.css";

// Global fetch interceptor for Access Token & Refresh Token rotation
(function() {
  const { fetch: originalFetch } = window;
  let refreshPromise = null;

  async function performTokenRefresh() {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
        const response = await originalFetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (response.ok) {
          const res = await response.json();
          if (res.success && res.data?.token) {
            localStorage.setItem("token", res.data.token);
            if (res.data.user) {
              localStorage.setItem("user", JSON.stringify(res.data.user));
            }
            return true;
          }
        }
        
        // Clear session on failure
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return false;
      } catch (err) {
        console.error("Token refresh failed:", err);
        return false;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  window.fetch = async function(...args) {
    let [resource, config] = args;

    // Check if token exists and is near expiration (< 30 seconds)
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const exp = decoded.exp * 1000;
        const now = Date.now();

        // Expired or close to expiring (expires in < 30 seconds)
        if (exp - now < 30000) {
          const refreshSuccess = await performTokenRefresh();
          if (refreshSuccess) {
            const freshToken = localStorage.getItem("token");
            if (config) {
              if (!config.headers) {
                config.headers = {};
              }
              // Handle headers in object format or Headers interface
              if (config.headers instanceof Headers) {
                config.headers.set("Authorization", `Bearer ${freshToken}`);
              } else if (typeof config.headers === 'object') {
                config.headers.Authorization = `Bearer ${freshToken}`;
              }
            }
          }
        }
      } catch (e) {
        // Silent catch for token decoding
      }
    }

    let response = await originalFetch(resource, config);

    // If request fails with 401/403, check if it's token expiry and retry
    if (response.status === 401 || response.status === 403) {
      // Don't retry refresh calls to prevent infinite loops
      if (typeof resource === 'string' && resource.includes("/auth/refresh")) {
        return response;
      }

      const clone = response.clone();
      try {
        const json = await clone.json();
        if (json.message && (
          json.message.toLowerCase().includes("hết hạn") ||
          json.message.toLowerCase().includes("expired") ||
          json.message.toLowerCase().includes("token")
        )) {
          const refreshSuccess = await performTokenRefresh();
          if (refreshSuccess) {
            const freshToken = localStorage.getItem("token");
            if (config) {
              if (!config.headers) {
                config.headers = {};
              }
              if (config.headers instanceof Headers) {
                config.headers.set("Authorization", `Bearer ${freshToken}`);
              } else if (typeof config.headers === 'object') {
                config.headers.Authorization = `Bearer ${freshToken}`;
              }
            }
            response = await originalFetch(resource, config);
          }
        }
      } catch (err) {
        // Silent catch for parsing error responses
      }
    }

    return response;
  };
})();

const GOOGLE_CLIENT_ID =
  "15019269333-8ffecsqpggjlb2661r64qgn62e941034.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);

