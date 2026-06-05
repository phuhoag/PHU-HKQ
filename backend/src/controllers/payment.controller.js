import Order from "../models/order.model.js";
import PaymentTransaction from "../models/payment-transaction.model.js";
import {
  ORDER_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  PAYMENT_TRANSACTION_STATUS,
} from "../constants/enums.js";

/**
 * @desc   Nhận webhook từ SePay khi có biến động số dư chuyển khoản
 * @route  POST /api/payments/sepay-webhook
 * @access Public (Xác thực bằng Secret Key)
 */
export const handleSepayWebhook = async (req, res) => {
  try {
    // 1. Xác thực Secret Key gửi từ SePay
    let secretKey = req.headers["x-secret-key"];
    
    // Nếu không có x-secret-key, hỗ trợ lấy từ Authorization header (định dạng "Apikey KEY")
    const authHeader = req.headers["authorization"];
    if (!secretKey && authHeader) {
      if (authHeader.startsWith("Apikey ")) {
        secretKey = authHeader.slice(7).trim();
      } else {
        secretKey = authHeader.trim();
      }
    }

    if (!secretKey || secretKey !== process.env.SEPAY_WEBHOOK_SECRET_KEY) {
      console.warn("⚠️ [SePay Webhook] Unauthorized request. Secret key mismatch or missing.");
      console.warn(`Received headers: ${JSON.stringify(req.headers)}`);
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id, content, transferAmount, referenceCode, transferType } = req.body;

    console.log(`[SePay Webhook] Received transaction ID: ${id}, Content: "${content}", Amount: ${transferAmount}, Type: ${transferType}`);

    // Chỉ xử lý giao dịch tiền vào (transferType === "in")
    if (transferType !== "in") {
      console.log(`[SePay Webhook] Ignored non-incoming transaction type: ${transferType}`);
      return res.status(200).json({ success: true, message: "Ignored non-incoming transaction" });
    }

    // 2. Tìm mã đơn hàng từ nội dung chuyển khoản
    // Cú pháp nội dung: THANH TOAN DON HANG <SUFFIX_8_CHARACTERS>
    const match = content.match(/THANH TOAN DON HANG\s+([A-F0-9]{8})/i);
    if (!match) {
      console.warn(`⚠️ [SePay Webhook] Could not parse order ID suffix from content: "${content}"`);
      return res.status(200).json({ success: true, message: "Order ID suffix not found in content" });
    }

    const suffix = match[1].toUpperCase();

    // 3. Tìm các đơn hàng pending trong vòng 7 ngày qua
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const pendingOrders = await Order.find({
      status: ORDER_STATUS.PENDING,
      createdAt: { $gte: sevenDaysAgo },
    });

    const order = pendingOrders.find((o) =>
      o._id.toString().toUpperCase().endsWith(suffix)
    );

    if (!order) {
      console.warn(`⚠️ [SePay Webhook] No pending order found in the last 7 days ending with: "${suffix}"`);
      return res.status(200).json({ success: true, message: "Order not found" });
    }

    // Kiểm tra xem đơn hàng đã được thanh toán chưa để tránh xử lý lặp
    if (order.payment_status === PAYMENT_STATUS.PAID) {
      console.log(`[SePay Webhook] Order #${order._id} was already marked as PAID.`);
      return res.status(200).json({ success: true, message: "Order already paid" });
    }

    // 4. Đối chiếu số tiền chuyển khoản (VND) với tổng tiền đơn hàng (USD)
    // Tỷ giá quy định: 1 USD = 25.000 VND
    const EXCHANGE_RATE = 25000;
    const expectedAmountVnd = Math.round(parseFloat(order.total_amount.toString()) * EXCHANGE_RATE);

    // Cho phép sai số tối đa 100 VND do làm tròn số hoặc làm tròn tỷ giá
    if (Math.abs(expectedAmountVnd - transferAmount) > 100) {
      console.error(`❌ [SePay Webhook] Amount mismatch for Order #${order._id}. Expected: ${expectedAmountVnd} VND, Received: ${transferAmount} VND.`);
      
      // Ghi log giao dịch lỗi
      await PaymentTransaction.create({
        order_id: order._id,
        user_id: order.user_id,
        amount: order.total_amount,
        payment_method: PAYMENT_METHODS.QR_CODE,
        status: PAYMENT_TRANSACTION_STATUS.FAILED,
        transaction_id: referenceCode || id.toString(),
        response: req.body,
      });

      return res.status(200).json({ success: true, message: "Amount mismatch" });
    }

    // 5. Cập nhật trạng thái đơn hàng thành PAID và status thành PROCESSING
    order.payment_status = PAYMENT_STATUS.PAID;
    order.status = ORDER_STATUS.PROCESSING;
    await order.save();

    // 6. Lưu log giao dịch thành công
    await PaymentTransaction.create({
      order_id: order._id,
      user_id: order.user_id,
      amount: order.total_amount,
      payment_method: PAYMENT_METHODS.QR_CODE,
      status: PAYMENT_TRANSACTION_STATUS.SUCCESS,
      transaction_id: referenceCode || id.toString(),
      response: req.body,
    });

    console.log(`🎉 [SePay Webhook] Successfully processed payment for Order #${order._id}. Updated status to PAID and PROCESSING.`);

    return res.status(200).json({ success: true, message: "Payment processed successfully" });
  } catch (error) {
    console.error("❌ [SePay Webhook] Controller error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
