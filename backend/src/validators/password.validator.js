/**
 * Password Strength Validation
 * Requirements:
 * - Minimum 6 characters
 * - Should include uppercase, lowercase, numbers (optional but recommended)
 */

export const validatePasswordStrength = (password) => {
  const errors = [];

  if (!password) {
    errors.push("Mật khẩu là bắt buộc");
    return { isValid: false, errors };
  }

  if (password.length < 6) {
    errors.push("Mật khẩu phải có ít nhất 6 ký tự");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất một chữ cái thường");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất một chữ cái in hoa");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất một chữ số");
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: calculatePasswordScore(password),
  };
};

/**
 * Calculate password strength score (0-5)
 */
export const calculatePasswordScore = (password) => {
  let score = 0;

  if (!password) return 0;

  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  return Math.min(score, 5);
};

/**
 * Get password strength label
 */
export const getPasswordStrengthLabel = (score) => {
  const labels = {
    0: { label: "Rất yếu", color: "red" },
    1: { label: "Yếu", color: "orange" },
    2: { label: "Trung bình", color: "yellow" },
    3: { label: "Tốt", color: "lightgreen" },
    4: { label: "Rất tốt", color: "green" },
    5: { label: "Xuất sắc", color: "darkgreen" },
  };

  return labels[score] || labels[0];
};
