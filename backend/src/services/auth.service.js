import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Login service
export const loginService = async (email, password) => {
  try {
    // Check if user exists
    const user = await User.findOne({ email });
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
