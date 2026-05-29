import { body, validationResult } from "express-validator";

// Login validation
export const loginValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email là bắt buộc")
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail()
    .toLowerCase(),
  body("password")
    .notEmpty()
    .withMessage("Mật khẩu là bắt buộc")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
];

// Register validation
export const registerValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email là bắt buộc")
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail()
    .toLowerCase(),
  body("password")
    .notEmpty()
    .withMessage("Mật khẩu là bắt buộc")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
  body("first_name").notEmpty().withMessage("Tên là bắt buộc").trim(),
  body("last_name").notEmpty().withMessage("Họ là bắt buộc").trim(),
  body("phone").notEmpty().withMessage("Số điện thoại là bắt buộc"),
];

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  return next();
};
