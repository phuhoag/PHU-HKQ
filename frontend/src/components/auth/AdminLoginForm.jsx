import { useState } from "react";
import {
  MdVisibility,
  MdVisibilityOff,
  MdEmail,
  MdArrowForward,
  MdError,
} from "react-icons/md";
import { Link } from "react-router-dom";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
    // Simulate API call
    setTimeout(() => {
      console.log("Admin login attempt:", { email, password, rememberMe });
      setLoading(false);
      alert("Admin login successful! (This is a demo)");
      // In production, redirect to dashboard
      // window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <div className="p-stack-lg md:p-16 flex flex-col justify-center bg-surface">
      <div className="mb-stack-lg">
        <h1 className="font-h1 text-h1 text-primary mb-2">Admin Portal</h1>
        <p className="font-body-md text-on-surface-variant">
          Secure login for administrators and staff members.
        </p>
      </div>

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
              placeholder="admin@techstore.com"
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
              to="/admin/forgot-password"
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
          {loading ? "Signing In..." : "Sign In to Admin"}
          <MdArrowForward className="text-[18px]" />
        </button>
      </form>

      {/* Back to Customer Login */}
      <div className="mt-stack-lg text-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Customer login?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Go to Customer Login
          </Link>
        </p>
      </div>
    </div>
  );
}
