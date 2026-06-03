import express from "express";
import {
  loginController,
  registerController,
  getCurrentUserController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  googleAuthController,
} from "../controllers/auth.controller.js";
import {
  loginValidator,
  registerValidator,
} from "../validators/auth.validator.js";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/auth.middleware.js";

const authRoutes = express.Router();

// Public routes
authRoutes.post("/login", ...loginValidator, loginController);

authRoutes.post("/register", ...registerValidator, registerController);

authRoutes.post("/forgot-password", forgotPasswordController);

authRoutes.post("/reset-password", resetPasswordController);

// Google OAuth
authRoutes.post("/google", googleAuthController);

// Protected routes
authRoutes.get("/me", authenticateToken, getCurrentUserController);

authRoutes.post("/logout", authenticateToken, logoutController);

export default authRoutes;

