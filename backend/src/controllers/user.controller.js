import User from "../models/user.model.js";
import crypto from "crypto";

const encryptPassword = (password) => {
  return Buffer.from(password).toString("base64");
};

const decryptPassword = (encrypted) => {
  return Buffer.from(encrypted, "base64").toString("utf-8");
};

export const getSmtpSettingsController = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "+smtpEmail +smtpHost +smtpPort",
    );

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    res.status(200).json({
      success: true,
      data: {
        smtpEmail: user.smtpEmail || "",
        smtpHost: user.smtpHost || "smtp.gmail.com",
        smtpPort: user.smtpPort || 587,
        smtpConfigured: !!user.smtpEmail,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSmtpSettingsController = async (req, res) => {
  try {
    const { smtpEmail, smtpPassword, smtpHost, smtpPort } = req.body;

    if (!smtpEmail || !smtpPassword) {
      return res.status(400).json({
        message: "Email SMTP và mật khẩu là bắt buộc",
      });
    }

    if (!smtpHost || !smtpPort) {
      return res.status(400).json({
        message: "SMTP host và port là bắt buộc",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    user.smtpEmail = smtpEmail;
    user.smtpPassword = encryptPassword(smtpPassword);
    user.smtpHost = smtpHost;
    user.smtpPort = smtpPort;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Cấu hình SMTP đã được cập nhật thành công",
      data: {
        smtpEmail: user.smtpEmail,
        smtpHost: user.smtpHost,
        smtpPort: user.smtpPort,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearSmtpSettingsController = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    user.smtpEmail = undefined;
    user.smtpPassword = undefined;
    user.smtpHost = "smtp.gmail.com";
    user.smtpPort = 587;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Cấu hình SMTP đã được xóa. Hệ thống sẽ sử dụng email mặc định.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const testSmtpConnectionController = async (req, res) => {
  try {
    const { smtpEmail, smtpPassword, smtpHost, smtpPort } = req.body;

    if (!smtpEmail || !smtpPassword || !smtpHost || !smtpPort) {
      return res.status(400).json({
        message: "Tất cả các trường SMTP là bắt buộc",
      });
    }

    const nodemailer = await import("nodemailer");
    const testTransporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

    await testTransporter.verify();

    res.status(200).json({
      success: true,
      message: " Kết nối SMTP thành công!",
    });
  } catch (error) {
    console.error(" SMTP Test Error:", error);
    res.status(400).json({
      success: false,
      message: " Kết nối SMTP thất bại: " + error.message,
    });
  }
};

export const getUserProfileController = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfileController = async (req, res) => {
  try {
    const { first_name, last_name, phone, address, avatar } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (avatar) user.avatar = avatar;

    if (first_name || last_name) {
      user.full_name = `${user.first_name} ${user.last_name}`;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Hồ sơ người dùng đã được cập nhật",
      data: user.toObject(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { decryptPassword };
