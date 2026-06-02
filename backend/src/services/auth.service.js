import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../utils/emailService.js";

// Login service
export const loginService = async (email, password) => {
  try {
    // Check if user exists - explicitly select password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error("Tài khoản đã bị vô hiệu hóa");
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    );

    // Return user info and token (exclude password)
    const userResponse = {
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: user.full_name,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      is_active: user.is_active,
    };

    return {
      user: userResponse,
      token,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Register service
export const registerService = async (userData) => {
  try {
    const { email, password, first_name, last_name, phone } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email đã tồn tại");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      full_name: `${first_name} ${last_name}`,
      phone,
      is_active: true,
      role: "customer",
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    );

    // Return user info and token
    const userResponse = {
      id: newUser._id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      full_name: newUser.full_name,
      phone: newUser.phone,
      role: newUser.role,
      is_active: newUser.is_active,
    };

    return {
      user: userResponse,
      token,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get current user info
export const getCurrentUserService = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Logout service (có thể mở rộng để vô hiệu hóa token)
export const logoutService = async (token) => {
  // Có thể thêm token vào blacklist nếu cần
  return { success: true };
};

// Forgot password service
export const forgotPasswordService = async (email) => {
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      throw new Error(
        "Nếu email tồn tại, bạn sẽ nhận được email đặt lại mật khẩu",
      );
    }

    // Generate reset token (random 32 bytes)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token and save to database with expiry (1 hour)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email with user SMTP config if available
    const userSmtpConfig = {
      smtpEmail: user.smtpEmail,
      smtpPassword: user.smtpPassword,
      smtpHost: user.smtpHost,
      smtpPort: user.smtpPort,
    };
    await sendPasswordResetEmail(email, resetToken, userSmtpConfig);

    return {
      success: true,
      message: "Nếu email tồn tại, bạn sẽ nhận được email đặt lại mật khẩu",
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Reset password service
export const resetPasswordService = async (resetToken, newPassword) => {
  try {
    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: new Date() }, // Token not expired
    }).select("+passwordResetToken +passwordResetExpiry");

    if (!user) {
      throw new Error("Token không hợp lệ hoặc đã hết hạn");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    return {
      success: true,
      message: "Mật khẩu đã được đặt lại thành công",
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
