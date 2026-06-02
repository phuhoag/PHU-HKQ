import {
  loginService,
  registerService,
  getCurrentUserService,
  logoutService,
  forgotPasswordService,
  resetPasswordService,
} from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validationResult } from "express-validator";

export const loginController = asyncHandler(async (req, res) => {
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

  const { email, password } = req.body;
  const result = await loginService(email, password);

  return res.status(200).json({
    success: true,
    message: "Đăng nhập thành công",
    data: result,
  });
});

export const registerController = asyncHandler(async (req, res) => {
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

  const result = await registerService(req.body);

  return res.status(201).json({
    success: true,
    message: "Đăng ký thành công",
    data: result,
  });
});

export const getCurrentUserController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await getCurrentUserService(userId);

  return res.status(200).json({
    success: true,
    message: "Lấy thông tin người dùng thành công",
    data: user,
  });
});

export const logoutController = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  await logoutService(token);

  return res.status(200).json({
    success: true,
    message: "Đăng xuất thành công",
  });
});

export const forgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const result = await forgotPasswordService(email);

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});

export const resetPasswordController = asyncHandler(async (req, res) => {
  const { resetToken, newPassword, confirmPassword } = req.body;

  if (!resetToken || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Reset token and new password are required",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  const result = await resetPasswordService(resetToken, newPassword);

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});
