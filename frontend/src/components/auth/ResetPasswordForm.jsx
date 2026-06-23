import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MdVisibility,
  MdVisibilityOff,
  MdError,
  MdCheckCircle,
  MdArrowForward,
} from "react-icons/md";
import authService from "../../services/authService";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function ResetPasswordForm() {
  const { t } = useLanguage();
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = t("resetPassword.validatePasswordRequired");
    } else if (newPassword.length < 6) {
      newErrors.newPassword = t("resetPassword.validatePasswordMin");
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t("resetPassword.validateConfirmPasswordRequired");
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t("resetPassword.validatePasswordsNotMatch");
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
      const result = await authService.resetPassword(
        token,
        newPassword,
        confirmPassword,
      );

      if (result.success) {
        setSubmitted(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      setApiError(
        error.message || t("resetPassword.resetFailed"),
      );
      console.error("Reset password error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="p-stack-lg md:p-16 flex flex-col justify-center bg-surface">
        <div className="flex flex-col items-center justify-center py-stack-xl">
          <MdError className="text-[64px] text-error mx-auto mb-stack-md" />
          <h2 className="font-h2 text-h2 text-primary text-center mb-stack-sm">
            {t("resetPassword.invalidLinkTitle")}
          </h2>
          <p className="font-body-md text-on-surface-variant text-center max-w-[300px] mb-stack-lg">
            {t("resetPassword.invalidLinkDesc")}
          </p>
          <Link
            to="/login"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-body-md"
          >
            {t("resetPassword.backToLogin")}
            <MdArrowForward className="text-[20px]" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-stack-lg md:p-16 flex flex-col justify-center bg-surface">
      {!submitted ? (
        <>
          <div className="mb-stack-lg">
            <h1 className="font-h1 text-h1 text-primary mb-2">
              {t("resetPassword.title")}
            </h1>
            <p className="font-body-md text-on-surface-variant">
              {t("resetPassword.description")}
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
            {/* New Password Input */}
            <div>
              <label
                htmlFor="newPassword"
                className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
              >
                {t("resetPassword.newPasswordLabel")}
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) {
                      setErrors({ ...errors, newPassword: "" });
                    }
                  }}
                  placeholder={t("resetPassword.newPasswordPlaceholder")}
                  className={`w-full px-4 py-3 bg-surface-container rounded-lg border-2 outline-none transition-all font-body-md text-on-surface ${
                    errors.newPassword
                      ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                      : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showPassword ? (
                    <MdVisibilityOff className="text-[20px]" />
                  ) : (
                    <MdVisibility className="text-[20px]" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-2 text-error text-[12px] flex items-center gap-1">
                  <MdError className="text-[16px]" />
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
              >
                {t("resetPassword.confirmPasswordLabel")}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: "" });
                    }
                  }}
                  placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                  className={`w-full px-4 py-3 bg-surface-container rounded-lg border-2 outline-none transition-all font-body-md text-on-surface ${
                    errors.confirmPassword
                      ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                      : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-on-primary font-label-caps text-label-caps rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-stack-md flex items-center justify-center gap-2"
            >
              {loading ? t("resetPassword.resetting") : t("resetPassword.resetButton")}
              {!loading && <MdArrowForward className="text-[20px]" />}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-stack-md flex items-center justify-center">
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 transition-colors font-body-md"
            >
              {t("resetPassword.backToLogin")}
            </Link>
          </div>
        </>
      ) : (
        /* Success State */
        <div className="flex flex-col items-center justify-center py-stack-xl">
          <div className="mb-stack-lg">
            <MdCheckCircle className="text-[64px] text-success mx-auto mb-stack-md" />
            <h2 className="font-h2 text-h2 text-primary text-center mb-stack-sm">
              {t("resetPassword.successTitle")}
            </h2>
            <p className="font-body-md text-on-surface-variant text-center max-w-[300px]">
              {t("resetPassword.successDesc")}
            </p>
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant text-center max-w-[350px] mb-stack-lg">
            {t("resetPassword.redirectNote")}
          </p>

          <Link
            to="/login"
            className="block py-3 px-8 bg-primary text-on-primary font-label-caps text-label-caps rounded-lg hover:bg-primary/90 transition-all text-center"
          >
            {t("resetPassword.goToLogin")}
          </Link>
        </div>
      )}
    </div>
  );
}
