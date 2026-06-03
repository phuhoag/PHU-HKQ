import nodemailer from "nodemailer";

let transporter;

// Decrypt function (matching encryption in user.controller.js)
const decryptPassword = (encrypted) => {
  if (!encrypted) return null;
  return Buffer.from(encrypted, "base64").toString("utf-8");
};

// Initialize transporter
async function initTransporter() {
  // Nếu có cấu hình Gmail, dùng Gmail
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    console.log(" Email transporter initialized with Gmail");
    return;
  }

  // Nếu không có cấu hình, tạo tài khoản Ethereal Email tạm thời (for development)
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(
      " Email transporter initialized with Ethereal Email (Development Mode)",
    );
    console.log(" Test email account:", testAccount.user);
    return testAccount;
  } catch (error) {
    console.error(" Error creating Ethereal account:", error);
    throw error;
  }
}

// Initialize on module load
const etherealAccount = await initTransporter();

/**
 * Send password reset email
 * Nếu user có SMTP config, dùng email của user
 * Nếu không, dùng system email (Ethereal hoặc Gmail)
 */
export const sendPasswordResetEmail = async (
  email,
  resetToken,
  userSmtpConfig = null,
) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3001"}/reset-password/${resetToken}`;

    // Nếu user có SMTP config, tạo transporter từ config của user
    let emailTransporter = transporter;
    if (
      userSmtpConfig &&
      userSmtpConfig.smtpEmail &&
      userSmtpConfig.smtpPassword
    ) {
      const decryptedPassword = decryptPassword(userSmtpConfig.smtpPassword);
      emailTransporter = nodemailer.createTransport({
        host: userSmtpConfig.smtpHost || "smtp.gmail.com",
        port: userSmtpConfig.smtpPort || 587,
        secure: false,
        auth: {
          user: userSmtpConfig.smtpEmail,
          pass: decryptedPassword,
        },
      });
      console.log(`📧 Using user SMTP: ${userSmtpConfig.smtpEmail}`);
    }

    const fromEmail =
      userSmtpConfig?.smtpEmail ||
      process.env.EMAIL_USER ||
      "noreply@techstore.com";

    const mailOptions = {
      from: fromEmail,
      to: email,
      subject: "Password Reset Request - TechStore",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1976d2; margin: 0;">TechStore</h1>
            <p style="color: #666; margin-top: 5px;">E-commerce Platform</p>
          </div>

          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password. If you didn't make this request, you can ignore this email.
          </p>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 30px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </div>

          <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
            Or copy this link in your browser:
          </p>
          <p style="color: #1976d2; word-break: break-all; font-size: 12px; margin-bottom: 30px;">
            ${resetUrl}
          </p>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              <strong>⚠️ Security Note:</strong> This link will expire in 1 hour. Never share this link with anyone. TechStore support staff will never ask for your password.
            </p>
          </div>

          <p style="color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px; margin-top: 30px;">
            © 2024 TechStore. All rights reserved.<br>
            If you have any questions, contact our support team.
          </p>
        </div>
      `,
    };

    // Send email
    const result = await emailTransporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", result.messageId);

    // Nếu dùng Ethereal Email, log preview URL
    if (!userSmtpConfig && !process.env.EMAIL_USER) {
      const previewUrl = nodemailer.getTestMessageUrl(result);
      console.log("\n📧 Preview URL (Ethereal):", previewUrl);
      console.log("\n🔗 Reset Link:", resetUrl);
    }

    return { success: true, message: "Reset link sent to email" };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    if (error.response) {
      console.error("SMTP Response:", error.response);
    }
    throw new Error(`Failed to send reset email: ${error.message}`);
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (email, firstName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@techstore.com",
      to: email,
      subject: "Welcome to TechStore!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1976d2; margin: 0;">Welcome to TechStore</h1>
          </div>

          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Hi ${firstName},
          </p>

          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Thank you for creating an account with us! You're now part of the TechStore community.
          </p>

          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Start exploring our amazing collection of tech products and enjoy exclusive deals!
          </p>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="http://localhost:5173" style="display: inline-block; padding: 12px 30px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Start Shopping
            </a>
          </div>

          <p style="color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px; margin-top: 30px;">
            © 2024 TechStore. All rights reserved.
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent to:", email);

    // Nếu dùng Ethereal Email (development), log preview URL
    if (!process.env.EMAIL_USER) {
      const previewUrl = nodemailer.getTestMessageUrl(result);
      console.log("📧 Preview URL (Ethereal):", previewUrl);
    }
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
  }
};
