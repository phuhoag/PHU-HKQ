import { createBrowserRouter, Navigate } from "react-router-dom";
import React from "react";
import LazyLoading from "../utils/LazyLoading.jsx";
import ErrorBoundary from "../components/error/ErrorBoundary.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

// Lazy load pages
const App = React.lazy(() => import("../App.jsx"));
const HomePage = React.lazy(() => import("../pages/HomePage"));
const AboutPage = React.lazy(() => import("../pages/AboutPage"));
const LoginPage = React.lazy(() => import("../pages/LoginPage"));
const RegisterPage = React.lazy(() => import("../pages/RegisterPage"));
const ForgotPasswordPage = React.lazy(
  () => import("../pages/ForgotPasswordPage"),
);
const ResetPasswordPage = React.lazy(
  () => import("../pages/ResetPasswordPage"),
);
const AdminLoginPage = React.lazy(() => import("../pages/AdminLoginPage"));
const AdminForgotPasswordPage = React.lazy(
  () => import("../pages/AdminForgotPasswordPage"),
);
const ProductCatalog = React.lazy(() => import("../pages/ProductCatalog"));
const ProductDetailPage = React.lazy(
  () => import("../pages/ProductDetailPage"),
);
const DashboardPage = React.lazy(() => import("../pages/DashboardPage"));
const ProductsPage = React.lazy(() => import("../pages/ProductsPage"));
const CartPage = React.lazy(() => import("../pages/CartPage"));
const WishlistPage = React.lazy(() => import("../pages/WishlistPage"));
const CheckoutPage = React.lazy(() => import("../pages/CheckoutPage"));
const OrdersPage = React.lazy(() => import("../pages/OrdersPage"));
const OrderDetailPage = React.lazy(() => import("../pages/OrderDetailPage"));
const ProfilePage = React.lazy(() => import("../pages/ProfilePage"));
const SettingsPage = React.lazy(() => import("../pages/SettingsPage"));


const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <LazyLoading children={<App />} />
      </ErrorBoundary>
    ),
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <ErrorBoundary>
              <LazyLoading children={<HomePage />} />
            </ErrorBoundary>
          </ProtectedRoute>
        ),
      },
      {
        path: "/shop",
        element: (
          <ErrorBoundary>
            <LazyLoading children={<ProductCatalog />} />
          </ErrorBoundary>
        ),
      },
      {
        path: "/categories",
        element: (
          <ErrorBoundary>
            <LazyLoading children={<ProductCatalog />} />
          </ErrorBoundary>
        ),
      },
      {
        path: "/computing",
        element: (
          <ErrorBoundary>
            <LazyLoading children={<ProductCatalog />} />
          </ErrorBoundary>
        ),
      },
      {
        path: "/product/:id",
        element: (
          <ErrorBoundary>
            <LazyLoading children={<ProductDetailPage />} />
          </ErrorBoundary>
        ),
      },
      {
        path: "/about",
        element: (
          <ErrorBoundary>
            <LazyLoading children={<AboutPage />} />
          </ErrorBoundary>
        ),
      },
      {
        path: "/login",
        element: (
          <ErrorBoundary>
            <LazyLoading children={<LoginPage />} />
          </ErrorBoundary>
        ),
      },
      {
        path: "/signup",
        element: (
          <ErrorBoundary>
            <LazyLoading children={<RegisterPage />} />
          </ErrorBoundary>
        ),
      },
      {
        path: "/forgot-password",
        element: (
          <ErrorBoundary>
            <LazyLoading children={<ForgotPasswordPage />} />
          </ErrorBoundary>
        ),
      },
      {
        path: "/reset-password/:token",
        element: (
          <ErrorBoundary>
            <LazyLoading children={<ResetPasswordPage />} />
          </ErrorBoundary>
        ),
      },
      {
        path: "/admin/login",
        element: (
          <ErrorBoundary>
            <LazyLoading children={<AdminLoginPage />} />
          </ErrorBoundary>
        ),
      },
      {
        path: "/admin/forgot-password",
        element: (
          <ErrorBoundary>
            <LazyLoading children={<AdminForgotPasswordPage />} />
          </ErrorBoundary>
        ),
      },
      {
        path: "/admin/dashboard",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <ErrorBoundary>
              <LazyLoading children={<DashboardPage />} />
            </ErrorBoundary>
          </ProtectedRoute>
        ),
      },
      {
        path: "/products",
        element: (
          <ProtectedRoute>
            <ErrorBoundary>
              <LazyLoading children={<ProductsPage />} />
            </ErrorBoundary>
          </ProtectedRoute>
        ),
      },
      {
        path: "/cart",
        element: (
          <ErrorBoundary>
            <LazyLoading children={<CartPage />} />
          </ErrorBoundary>
        ),
      },
      {
        path: "/wishlist",
        element: (
          <ErrorBoundary>
            <LazyLoading children={<WishlistPage />} />
          </ErrorBoundary>
        ),
      },
      {
        path: "/profile",
        element: (
          <ErrorBoundary>
            <LazyLoading children={<ProfilePage />} />
          </ErrorBoundary>
        ),
      },
      {
        path: "/settings",
        element: (
          <ErrorBoundary>
            <LazyLoading children={<SettingsPage />} />
          </ErrorBoundary>
        ),
      },
      {
        path: "/checkout",
        element: (
          <ErrorBoundary>
            <LazyLoading children={<CheckoutPage />} />
          </ErrorBoundary>
        ),
      },
      {
        path: "/orders",
        element: (
          <ErrorBoundary>
            <LazyLoading children={<OrdersPage />} />
          </ErrorBoundary>
        ),
      },
      {
        path: "/orders/:orderId",
        element: (
          <ErrorBoundary>
            <LazyLoading children={<OrderDetailPage />} />
          </ErrorBoundary>
        ),
      },
    ],
  },
]);

export default router;
