import express from "express";
import {
  getSmtpSettingsController,
  updateSmtpSettingsController,
  clearSmtpSettingsController,
  testSmtpConnectionController,
  getUserProfileController,
  updateUserProfileController,
  changePasswordController,
  deleteOwnAccountController,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// User profile routes
router.get("/profile", getUserProfileController);
router.put("/profile", updateUserProfileController);
router.put("/change-password", changePasswordController);
router.delete("/delete-account", deleteOwnAccountController);

// SMTP settings routes
router.get("/settings/smtp", getSmtpSettingsController);
router.put("/settings/smtp", updateSmtpSettingsController);
router.delete("/settings/smtp", clearSmtpSettingsController);
router.post("/settings/smtp/test", testSmtpConnectionController);

export default router;
