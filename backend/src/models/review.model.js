import mongoose from "mongoose";
import { RATING } from "../constants/enums.js";

const reviewSchema = mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: RATING.MIN,
      max: RATING.MAX,
    },
    comment: {
      type: String,
      default: "",
    },
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
