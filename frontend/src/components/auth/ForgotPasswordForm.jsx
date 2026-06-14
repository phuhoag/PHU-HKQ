import { useState } from "react";
import { MdEmail, MdError, MdArrowBack, MdCheckCircle } from "react-icons/md";
import { Link } from "react-router-dom";
import authService from "../../services/authService";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function ForgotPasswordForm() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = t("forgotPassword.validateEmailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t("forgotPassword.validateEmailInvalid");
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
      const result = await authService.forgotPassword(email);

      if (result.success) {
        setSubmitted(true);
      }
    } catch (error) {
      setApiError(
        error.message || t("forgotPassword.sendEmailFailed"),
      );
      console.error("Forgot password error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-stack-lg md:p-16 flex flex-col justify-center bg-surface">
      {!submitted ? (
        <>
          <div className="mb-stack-lg">
            {/* API Error Message */}
            {apiError && (
              <div className="mb-stack-md p-3 bg-error/10 border border-error rounded-lg flex items-center gap-2">
                <MdError className="text-error text-[20px]" />
                <p className="text-error text-sm">{apiError}</p>
              </div>
            )}
            <h1 className="font-h1 text-h1 text-primary mb-2">
              {t("forgotPassword.title")}
            </h1>
            <p className="font-body-md text-on-surface-variant">
              {t("forgotPassword.description")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-stack-md">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
              >
                {t("auth.emailLabel")}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-on-primary font-label-caps text-label-caps rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-stack-md"
            >
              {loading ? t("forgotPassword.sending") : t("forgotPassword.resetButton")}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-stack-md flex items-center justify-center">
            <Link
              to="/login"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-body-md"
            >
              <MdArrowBack className="text-[20px]" />
              {t("forgotPassword.backToLogin")}
            </Link>
          </div>
        </>
      ) : (
        /* Success State */
        <div className="flex flex-col items-center justify-center py-stack-xl">
          <div className="mb-stack-lg">
            <MdCheckCircle className="text-[64px] text-success mx-auto mb-stack-md" />
            <h2 className="font-h2 text-h2 text-primary text-center mb-stack-sm">
              {t("forgotPassword.successTitle")}
            </h2>
            <p className="font-body-md text-on-surface-variant text-center max-w-[300px]">
              {t("forgotPassword.successDesc").replace("{email}", "")}
              <span className="font-semibold text-on-surface">{email}</span>
            </p>
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant text-center max-w-[350px] mb-stack-lg">
            {t("forgotPassword.successExpiryNote")}
          </p>

          <div className="space-y-stack-sm w-full">
            <Link
              to="/login"
              className="block w-full py-3 bg-primary text-on-primary font-label-caps text-label-caps rounded-lg hover:bg-primary/90 transition-all text-center"
            >
              {t("forgotPassword.backToLogin")}
            </Link>
            <button
              onClick={() => {
                setEmail("");
                setSubmitted(false);
                setErrors({});
              }}
              className="block w-full py-3 bg-surface-container text-on-surface font-label-caps text-label-caps rounded-lg hover:bg-surface-container/80 transition-all border-2 border-outline-variant"
            >
              {t("forgotPassword.tryAnotherEmail")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
