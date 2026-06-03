import jwt from "jsonwebtoken";

// Verify JWT token middleware
export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token không được cung cấp",
      });
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
      (err, user) => {
        if (err) {
          return res.status(403).json({
            success: false,
            message: "Token không hợp lệ hoặc đã hết hạn",
          });
        }

        req.user = user;
        return next();
      },
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi xác thực token",
    });
  }
};

// Check if user is admin
export const authorizeAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin mới có quyền thực hiện hành động này",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi kiểm tra quyền",
    });
  }
};

// Check if user is customer
export const authorizeCustomer = (req, res, next) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Chỉ khách hàng mới có quyền thực hiện hành động này",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi kiểm tra quyền",
    });
  }
};
