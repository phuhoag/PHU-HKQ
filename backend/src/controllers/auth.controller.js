import {
  loginService,
  registerService,
  getCurrentUserService,
  logoutService,
} from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Login controller
export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginService(email, password);

  return res.status(200).json({
    success: true,
    message: "Đăng nhập thành công",
    data: result,
  });
});

// Register controller
export const registerController = asyncHandler(async (req, res) => {
  const result = await registerService(req.body);

  return res.status(201).json({
    success: true,
    message: "Đăng ký thành công",
    data: result,
  });
});

// Get current user controller
export const getCurrentUserController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await getCurrentUserService(userId);

  return res.status(200).json({
    success: true,
    message: "Lấy thông tin người dùng thành công",
    data: user,
  });
});

// Logout controller
export const logoutController = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  await logoutService(token);

  return res.status(200).json({
    success: true,
    message: "Đăng xuất thành công",
  });
});
