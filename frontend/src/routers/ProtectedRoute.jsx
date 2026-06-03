import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute Component
 * Checks if user is logged in before allowing access to the route
 * If not logged in, redirects to login page
 */
export default function ProtectedRoute({ children }) {
  // Check if token exists in localStorage
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  // If no token or user data, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, allow access to the route
  return children;
}
