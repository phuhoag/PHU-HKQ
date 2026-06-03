import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdVisibility,
  MdVisibilityOff,
  MdEmail,
  MdArrowForward,
  MdError,
} from "react-icons/md";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import authService from "../../services/authService";
import { useCart } from "../../context/CartContext.jsx";

export default function LoginForm() {
  const navigate = useNavigate();
  const { onLogin } = useCart();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const result = await authService.login(email, password);

      if (result.success) {
        await onLogin();
        const user = result.data?.user;
        if (user?.role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      setApiError(error.message || "Login failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setApiError("");
    try {
      const result = await authService.googleLogin(credentialResponse.credential);
      if (result.success) {
        await onLogin();
        const user = result.data?.user;
        if (user?.role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      setApiError(error.message || "Đăng nhập Google thất bại. Vui lòng thử lại.");
      console.error("Google login error:", error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setApiError("Đăng nhập Google thất bại. Vui lòng thử lại.");
  };

  return (
    <div className="p-stack-lg md:p-16 flex flex-col justify-center bg-surface">
      <div className="mb-stack-lg">
        <h1 className="font-h1 text-h1 text-primary mb-2">Welcome Back</h1>
        <p className="font-body-md text-on-surface-variant">
          Access your dashboard with secure verification.
        </p>
      </div>

      {/* API Error Message */}
      {apiError && (
        <div className="mb-stack-md p-3 bg-error/10 border border-error rounded-lg flex items-center gap-2">
          <MdError className="text-error text-[20px]" />
          <p className="text-error text-sm">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-stack-md">
        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
          >
            EMAIL ADDRESS
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors({ ...errors, email: "" });
                }
              }}
              placeholder="name@techstore.com"
              className={`w-full px-4 py-3 bg-surface-container rounded-lg border-2 outline-none transition-all font-body-md text-on-surface ${
                errors.email
                  ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                  : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
              }`}
            />
            <MdEmail className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" />
          </div>
          {errors.email && (
            <p className="mt-2 text-error text-[12px] flex items-center gap-1">
              <MdError className="text-[16px]" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label
              htmlFor="password"
              className="block font-label-caps text-label-caps text-on-surface-variant"
            >
              PASSWORD
            </label>
            <Link
              to="/forgot-password"
              className="font-body-sm text-body-sm text-primary hover:underline transition-all"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors({ ...errors, password: "" });
                }
              }}
              placeholder="••••••••"
              className={`w-full px-4 py-3 bg-surface-container rounded-lg border-2 outline-none transition-all font-body-md text-on-surface pr-10 ${
                errors.password
                  ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                  : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors"
            >
              {showPassword ? (
                <MdVisibilityOff className="text-[20px]" />
              ) : (
                <MdVisibility className="text-[20px]" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-error text-[12px] flex items-center gap-1">
              <MdError className="text-[16px]" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center gap-2 py-2">
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-outline-variant text-primary cursor-pointer accent-primary"
          />
          <label
            htmlFor="remember"
            className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer"
          >
            Keep me signed in for 30 days
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-on-primary font-button text-button py-4 rounded-lg shadow-sm hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Signing In..." : "Sign In"}
          <MdArrowForward className="text-[18px]" />
        </button>
      </form>

      {/* OAuth Section */}
      <div className="mt-stack-lg">
        <div className="relative flex items-center justify-center mb-stack-md">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline-variant"></div>
          </div>
          <span className="relative bg-surface px-4 font-label-caps text-label-caps text-on-surface-variant">
            OR CONTINUE WITH
          </span>
        </div>

        {/* Google Login Button */}
        <div className="flex flex-col items-center gap-3">
          {googleLoading ? (
            <div className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-outline-variant rounded-lg text-on-surface-variant bg-surface-container-low">
              <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-button text-button">Đang đăng nhập...</span>
            </div>
          ) : (
            <div className="w-full flex justify-center [&>div]:w-full [&_iframe]:w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                logo_alignment="center"
                width="100%"
              />
            </div>
          )}
        </div>
      </div>

      {/* Sign Up Link */}
      <div className="mt-stack-lg text-center space-y-2">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Don't have an account yet?{" "}
          <a href="/signup" className="text-primary font-bold hover:underline">
            Create an Account
          </a>
        </p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Admin?{" "}
          <Link
            to="/admin/login"
            className="text-primary font-bold hover:underline"
          >
            Admin Login
          </Link>
        </p>
      </div>
    </div>
  );
}
