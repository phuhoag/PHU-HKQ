import mongoose from "mongoose";

const orderItemSchema = mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: mongoose.Decimal128,
      required: true,
      get: (value) => (value ? value.toString() : null),
    },
  },
  { timestamps: true, versionKey: false },
);

const OrderItem = mongoose.model("OrderItem", orderItemSchema);

export default OrderItem;
