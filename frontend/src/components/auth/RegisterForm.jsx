import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdVisibility,
  MdVisibilityOff,
  MdEmail,
  MdArrowForward,
  MdError,
  MdCheckCircle,
} from "react-icons/md";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import authService from "../../services/authService";
import { useCart } from "../../context/CartContext.jsx";

export default function RegisterForm() {
  const navigate = useNavigate();
  const { onLogin } = useCart();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setApiError("");
    try {
      const result = await authService.googleLogin(credentialResponse.credential);
      if (result.success) {
        await onLogin();
        navigate("/");
      }
    } catch (error) {
      setApiError(error.message || "Đăng ký bằng Google thất bại. Vui lòng thử lại.");
      console.error("Google login error:", error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setApiError("Đăng ký bằng Google thất bại. Vui lòng thử lại.");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the Terms of Service";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
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
      const result = await authService.register({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      setApiError(error.message || "Registration failed. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthClick = (provider) => {
    console.log(`${provider} OAuth registration`);
    alert(`${provider} registration coming soon!`);
  };

  if (success) {
    return (
      <div className="p-stack-lg md:p-16 flex flex-col justify-center items-center bg-surface min-h-[500px]">
        <div className="text-center">
          <MdCheckCircle className="text-6xl text-primary mx-auto mb-4" />
          <h2 className="font-h2 text-h2 text-primary mb-2">
            Welcome to TechStore!
          </h2>
          <p className="font-body-md text-on-surface-variant mb-4">
            Account created successfully. Redirecting to login...
          </p>
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-stack-lg md:p-16 flex flex-col justify-center bg-surface">
      <div className="mb-stack-lg">
        <h1 className="font-h1 text-h1 text-primary mb-2">Create Account</h1>
        <p className="font-body-md text-on-surface-variant">
          Join TechStore and start shopping today.
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
        {/* Name Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
            >
              FIRST NAME
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              className={`w-full px-4 py-3 bg-surface-container rounded-lg border-2 outline-none transition-all font-body-md text-on-surface ${
                errors.firstName
                  ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                  : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
              }`}
            />
            {errors.firstName && (
              <p className="mt-2 text-error text-[12px] flex items-center gap-1">
                <MdError className="text-[16px]" />
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="lastName"
              className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
            >
              LAST NAME
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              className={`w-full px-4 py-3 bg-surface-container rounded-lg border-2 outline-none transition-all font-body-md text-on-surface ${
                errors.lastName
                  ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                  : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
              }`}
            />
            {errors.lastName && (
              <p className="mt-2 text-error text-[12px] flex items-center gap-1">
                <MdError className="text-[16px]" />
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

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
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@techstore.com"
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

        {/* Password Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
            >
              PASSWORD
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
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

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
            >
              CONFIRM PASSWORD
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 bg-surface-container rounded-lg border-2 outline-none transition-all font-body-md text-on-surface pr-10 ${
                  errors.confirmPassword
                    ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                    : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors"
              >
                {showConfirmPassword ? (
                  <MdVisibilityOff className="text-[20px]" />
                ) : (
                  <MdVisibility className="text-[20px]" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-error text-[12px] flex items-center gap-1">
                <MdError className="text-[16px]" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="phone"
              className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
            >
              PHONE NUMBER
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0912345678"
              className={`w-full px-4 py-3 bg-surface-container rounded-lg border-2 outline-none transition-all font-body-md text-on-surface ${
                errors.phone
                  ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                  : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
              }`}
            />
            {errors.phone && (
              <p className="mt-2 text-error text-[12px] flex items-center gap-1">
                <MdError className="text-[16px]" />
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="flex items-start gap-2 py-2">
          <input
            id="agreeTerms"
            name="agreeTerms"
            type="checkbox"
            checked={formData.agreeTerms}
            onChange={handleChange}
            className="w-4 h-4 rounded border-outline-variant text-primary cursor-pointer accent-primary mt-1"
          />
          <label
            htmlFor="agreeTerms"
            className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer"
          >
            I agree to the{" "}
            <Link
              to="/terms"
              className="text-primary font-semibold hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="text-primary font-semibold hover:underline"
            >
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.agreeTerms && (
          <p className="text-error text-[12px] flex items-center gap-1">
            <MdError className="text-[16px]" />
            {errors.agreeTerms}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-on-primary font-button text-button py-4 rounded-lg shadow-sm hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Create Account"}
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
            OR SIGN UP WITH
          </span>
        </div>

        {/* Google Register Button */}
        <div className="flex flex-col items-center gap-3">
          {googleLoading ? (
            <div className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-outline-variant rounded-lg text-on-surface-variant bg-surface-container-low">
              <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-button text-button">Đang đăng ký...</span>
            </div>
          ) : (
            <div className="w-full flex justify-center [&>div]:w-full [&_iframe]:w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
                logo_alignment="center"
                width="100%"
              />
            </div>
          )}
        </div>
      </div>

      {/* Login Link */}
      <div className="mt-stack-lg text-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
