import mongoose from "mongoose";
import {
  ORDER_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
} from "../constants/enums.js";

const orderSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    total_amount: {
      type: mongoose.Decimal128,
      required: true,
      get: (value) => (value ? value.toString() : null),
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    payment_method: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: true,
    },
    payment_status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    shipping_address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
