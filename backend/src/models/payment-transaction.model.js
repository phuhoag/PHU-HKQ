import mongoose from "mongoose";
import {
  PAYMENT_METHODS,
  PAYMENT_TRANSACTION_STATUS,
} from "../constants/enums.js";

const paymentTransactionSchema = mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: mongoose.Decimal128,
      required: true,
      get: (value) => (value ? value.toString() : null),
    },
    payment_method: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_TRANSACTION_STATUS),
      default: PAYMENT_TRANSACTION_STATUS.PENDING,
    },
    transaction_id: {
      type: String,
    },
    response: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true, versionKey: false },
);

const PaymentTransaction = mongoose.model(
  "PaymentTransaction",
  paymentTransactionSchema,
);

export default PaymentTransaction;
