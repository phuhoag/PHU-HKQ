import { useState } from "react";
import {
  MdVisibility,
  MdVisibilityOff,
  MdEmail,
  MdArrowForward,
  MdError,
} from "react-icons/md";
import { Link } from "react-router-dom";

export default function LoginForm() {
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
      console.log("Login attempt:", { email, password, rememberMe });
      setLoading(false);
      alert("Login successful! (This is a demo)");
    }, 1000);
  };

  const handleOAuthClick = (provider) => {
    console.log(`${provider} OAuth login`);
    alert(`${provider} login coming soon!`);
  };

  return (
    <div className="p-stack-lg md:p-16 flex flex-col justify-center bg-surface">
      <div className="mb-stack-lg">
        <h1 className="font-h1 text-h1 text-primary mb-2">Welcome Back</h1>
        <p className="font-body-md text-on-surface-variant">
          Access your dashboard with secure verification.
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
        <div className="grid grid-cols-2 gap-stack-sm">
          <button
            type="button"
            onClick={() => handleOAuthClick("Google")}
            className="flex items-center justify-center gap-2 py-3 px-4 border border-outline-variant rounded-lg font-button text-button text-on-surface-variant hover:bg-surface-container-low transition-all"
          >
            <img
              alt="Google"
              className="w-5 h-5"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuADDQqyxAZMavihoVbu2Ah-9wYvfd1F5OrwzAv0JM6uAgQmls6heD3862vLO5I0qRqThEBAVK2eM9n05m4qR7OMF8JGPADStcFj2LGYLGXYrdl7kmUF_8vaQukypuZTQwiVzAQf5MVEbzc2hIYod2X523k_CVKUcwuoSoyuFEo9evxeSXhOFhkKsOuNULTjQmlcCSxa164xJXY41Zer6UeNyuuBZOHBapGgLUgWCRcsdP3zQHN_f9FItGKB7zVF2NeC68_T6Wri3ud8"
            />
            Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuthClick("GitHub")}
            className="flex items-center justify-center gap-2 py-3 px-4 border border-outline-variant rounded-lg font-button text-button text-on-surface-variant hover:bg-surface-container-low transition-all"
          >
            <img
              alt="GitHub"
              className="w-5 h-5"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGdq2Fe6F5eXiZ2tfl7LRdmovTCDw0yKhAi_JXi1Nz4Why64B8bp2YbVejVNFk1sbybUYY3uphkGmvspyFs__LCB-o7yRs1MSddBQoWjCHQYZErj1VYGoo0svwusVR0P0jcYfEQlDuutKKZ0MAsEFkqzV297k6hjobDJQ6oriym4a4SIr67HjM3z2QTd4V6idgxh2EkIMX-E-pL5Uh0yDWqJH2m4DHpfkvsO-CnY_aoOSdVSaHAzrv7YoB6dLAdoCg9eJ7u5ri7_tN"
            />
            GitHub
          </button>
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
