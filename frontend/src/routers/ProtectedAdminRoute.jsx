import { Navigate } from "react-router-dom";

/**
 * ProtectedAdminRoute Component
 * Checks if user is logged in AND has admin role
 * If not admin or not logged in, redirects to login page
 */
export default function ProtectedAdminRoute({ children }) {
  // Check if token and user data exist in localStorage
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  // If no token or user data, redirect to login
  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userString);

    // Check if user is admin
    if (user.role !== "admin") {
      // Non-admin user, redirect to home
      return <Navigate to="/" replace />;
    }

    // User is admin, allow access
    return children;
  } catch (error) {
    // Invalid user data, redirect to login
    return <Navigate to="/login" replace />;
  }
}

