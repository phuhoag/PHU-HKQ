import { useState } from "react";
import {
  MdVisibility,
  MdVisibilityOff,
  MdEmail,
  MdArrowForward,
  MdError,
  MdCheckCircle,
} from "react-icons/md";
import { Link } from "react-router-dom";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
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
    // Simulate API call
    setTimeout(() => {
      console.log("Registration attempt:", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      });
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        // Redirect to login after 2 seconds
        window.location.href = "/login";
      }, 2000);
    }, 1500);
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
