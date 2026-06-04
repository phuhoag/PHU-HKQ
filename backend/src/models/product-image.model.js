import mongoose from "mongoose";

const productImageSchema = mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    image_url: {
      type: String,
      required: true,
      trim: true,
    },
    alt_text: {
      type: String,
      trim: true,
      default: "",
    },
    display_order: {
      type: Number,
      default: 0,
    },
    is_primary: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

const ProductImage = mongoose.model("ProductImage", productImageSchema);

export default ProductImage;
