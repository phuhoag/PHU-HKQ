import mongoose from "mongoose";

const couponSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discount_type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discount_value: {
      type: Number,
      required: true,
    },
    min_purchase: {
      type: Number,
      default: 0,
    },
    max_discount: {
      type: Number,
      default: null, // Chỉ áp dụng cho kiểu percentage
    },
    expiry_date: {
      type: Date,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    usage_limit: {
      type: Number,
      default: null, // null nghĩa là không giới hạn
    },
    usage_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
