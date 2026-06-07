import express from "express";
import { handleSepayWebhook } from "../controllers/payment.controller.js";

const router = express.Router();

// Nhận webhook tự động cập nhật thanh toán từ SePay
router.post("/sepay-webhook", handleSepayWebhook);

export default router;
