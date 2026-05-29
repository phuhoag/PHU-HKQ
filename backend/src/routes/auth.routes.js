import express from "express";
import {
  loginController,
  registerController,
  getCurrentUserController,
  logoutController,
} from "../controllers/auth.controller.js";
import {
  loginValidator,
  registerValidator,
  handleValidationErrors,
} from "../validators/auth.validator.js";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/auth.middleware.js";

const authRoutes = express.Router();

// Public routes
authRoutes.post(
  "/login",
  loginValidator,
  handleValidationErrors,
  loginController,
);

authRoutes.post(
  "/register",
  registerValidator,
  handleValidationErrors,
  registerController,
);

// Protected routes
authRoutes.get("/me", authenticateToken, getCurrentUserController);

authRoutes.post("/logout", authenticateToken, logoutController);

export default authRoutes;
