import { useState } from "react";
import { MdEmail, MdError, MdArrowBack, MdCheckCircle } from "react-icons/md";
import { Link } from "react-router-dom";

export default function AdminForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
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
      console.log("Admin password reset request for:", email);
      setSubmitted(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-stack-lg md:p-16 flex flex-col justify-center bg-surface">
      {!submitted ? (
        <>
          <div className="mb-stack-lg">
            <h1 className="font-h1 text-h1 text-primary mb-2">
              Reset Admin Password
            </h1>
            <p className="font-body-md text-on-surface-variant">
              Enter your admin email address and we'll send you a link to reset
              your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-stack-md">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
              >
                ADMIN EMAIL ADDRESS
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-on-primary font-label-caps text-label-caps rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-stack-md"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {/* Back to Admin Login Link */}
          <div className="mt-stack-md flex items-center justify-center">
            <Link
              to="/admin/login"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-body-md"
            >
              <MdArrowBack className="text-[20px]" />
              Back to Admin Login
            </Link>
          </div>
        </>
      ) : (
        /* Success State */
        <div className="flex flex-col items-center justify-center py-stack-xl">
          <div className="mb-stack-lg">
            <MdCheckCircle className="text-[64px] text-success mx-auto mb-stack-md" />
            <h2 className="font-h2 text-h2 text-primary text-center mb-stack-sm">
              Check Your Email
            </h2>
            <p className="font-body-md text-on-surface-variant text-center max-w-[300px]">
              We've sent a password reset link to{" "}
              <span className="font-semibold text-on-surface">{email}</span>
            </p>
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant text-center max-w-[350px] mb-stack-lg">
            The link will expire in 24 hours. If you don't see the email, check
            your spam folder.
          </p>

          <div className="space-y-stack-sm w-full">
            <Link
              to="/admin/login"
              className="block w-full py-3 bg-primary text-on-primary font-label-caps text-label-caps rounded-lg hover:bg-primary/90 transition-all text-center"
            >
              Back to Admin Login
            </Link>
            <button
              onClick={() => {
                setEmail("");
                setSubmitted(false);
                setErrors({});
              }}
              className="block w-full py-3 bg-surface-container text-on-surface font-label-caps text-label-caps rounded-lg hover:bg-surface-container/80 transition-all border-2 border-outline-variant"
            >
              Try Another Email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
