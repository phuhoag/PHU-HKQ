import {
  loginService,
  registerService,
  getCurrentUserService,
  logoutService,
  forgotPasswordService,
  resetPasswordService,
  googleAuthService,
  refreshSessionService,
} from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validationResult } from "express-validator";

// Helper to set refresh token cookie
const setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Helper to parse cookies from headers
const parseCookies = (cookieHeader) => {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(";").forEach((cookie) => {
    let parts = cookie.split("=");
    list[parts.shift().trim()] = decodeURI(parts.join("="));
  });
  return list;
};

export const googleAuthController = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({
      success: false,
      message: "Google credential is required",
    });
  }

  const result = await googleAuthService(credential);

  setRefreshTokenCookie(res, result.refreshToken);

  return res.status(200).json({
    success: true,
    message: "Đăng nhập Google thành công",
    data: {
      token: result.token,
      user: result.user,
      refreshToken: result.refreshToken,
    },
  });
});

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

  setRefreshTokenCookie(res, result.refreshToken);

  return res.status(200).json({
    success: true,
    message: "Đăng nhập thành công",
    data: {
      token: result.token,
      user: result.user,
      refreshToken: result.refreshToken,
    },
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

  setRefreshTokenCookie(res, result.refreshToken);

  return res.status(201).json({
    success: true,
    message: "Đăng ký thành công",
    data: {
      token: result.token,
      user: result.user,
      refreshToken: result.refreshToken,
    },
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
  const cookies = parseCookies(req.headers.cookie);
  const refreshToken = cookies.refreshToken || req.body.refreshToken || req.headers["x-refresh-token"];

  await logoutService(refreshToken);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

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

export const refreshSessionController = asyncHandler(async (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const refreshToken = cookies.refreshToken || req.body.refreshToken || req.headers["x-refresh-token"];

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token không được tìm thấy",
    });
  }

  const result = await refreshSessionService(refreshToken);

  setRefreshTokenCookie(res, result.refreshToken);

  return res.status(200).json({
    success: true,
    message: "Làm mới phiên đăng nhập thành công",
    data: {
      token: result.accessToken,
      user: result.user,
      refreshToken: result.refreshToken,
    },
  });
});
