import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdStarRate,
  MdStarHalf,
  MdAddShoppingCart,
  MdCheckCircle,
  MdTune,
  MdBatteryChargingFull,
  MdSignalCellular4Bar,
} from "react-icons/md";
import { useCart } from "../../context/CartContext.jsx";

export default function ProductInfo({ product = {} }) {
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const defaultProduct = {
    id: 1,
    title: "Pro Wireless Headphones",
    category: "Professional Series",
    rating: 4.8,
    reviews: 120,
    price: 299,
    originalPrice: 349,
    inStock: true,
    description:
      "Experience studio-grade sound anywhere with the Pro Wireless Headphones. Engineered with 40mm custom drivers and advanced Active Noise Cancellation (ANC), these headphones deliver pure acoustic precision while blocking out unwanted environment noise.",
    features: [
      { icon: "graphic_eq", text: "Advanced Active Noise Cancellation" },
      { icon: "battery_charging_full", text: "Up to 40 hours of battery life" },
      { icon: "bluetooth", text: "Bluetooth 5.2 with Multi-point connection" },
    ],
  };

  const data = { ...defaultProduct, ...product };
  const discount = Math.round(
    ((data.originalPrice - data.price) / data.originalPrice) * 100,
  );

  const handleAddToCart = () => {
    addToCart(data, quantity);
    alert(`${quantity} ${data.title}(s) added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(data, quantity);
    navigate("/cart");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-label-caps font-label-caps mb-2 uppercase">
          {data.category}
        </span>
        <h1 className="text-h1 font-h1 text-on-surface mb-2">{data.title}</h1>

        {/* Rating */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex text-tertiary gap-1">
            {[...Array(4)].map((_, i) => (
              <MdStarRate
                key={i}
                className="text-[20px]"
                style={{ fill: "currentColor" }}
              />
            ))}
            <MdStarHalf
              className="text-[20px]"
              style={{ fill: "currentColor" }}
            />
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
            {data.rating} ({data.reviews} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-h1 font-h1 text-primary">
            ${data.price.toFixed(2)}
          </span>
          <span className="text-body-lg font-body-lg text-on-surface-variant line-through">
            ${data.originalPrice.toFixed(2)}
          </span>
          <span className="bg-tertiary text-on-tertiary text-label-caps font-label-caps px-2 py-1 rounded">
            -{discount}%
          </span>
        </div>
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2 text-primary font-medium">
        <MdCheckCircle className="text-[20px]" />
        <span className="font-body-md text-body-md">
          {data.inStock ? "In Stock - Ready to ship" : "Out of Stock"}
        </span>
      </div>

      {/* Description & Features */}
      <div className="space-y-4">
        <p className="text-body-md font-body-md text-on-surface-variant">
          {data.description}
        </p>
        <ul className="space-y-2">
          {data.features.map((feature, idx) => (
            <li
              key={idx}
              className="flex items-center gap-3 text-body-sm font-body-sm"
            >
              {feature.icon === "graphic_eq" && (
                <MdTune className="text-[20px] text-primary" />
              )}
              {feature.icon === "battery_charging_full" && (
                <MdBatteryChargingFull className="text-[20px] text-primary" />
              )}
              {feature.icon === "bluetooth" && (
                <MdSignalCellular4Bar className="text-[20px] text-primary" />
              )}
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="h-px bg-outline-variant"></div>

      {/* Purchase Section */}
      <div className="space-y-6">
        {/* Quantity Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-label-caps font-label-caps text-on-surface-variant">
            QUANTITY
          </label>
          <div className="flex items-center border border-outline rounded-lg w-fit">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2 hover:bg-surface-container transition-colors"
            >
              −
            </button>
            <span className="px-6 py-2 border-x border-outline font-medium">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-4 py-2 hover:bg-surface-container transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleAddToCart}
            className="bg-primary text-on-primary font-button text-button py-4 rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <MdAddShoppingCart className="text-[20px]" />
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="bg-on-surface text-on-primary font-button text-button py-4 rounded-lg hover:bg-inverse-surface active:scale-95 transition-all"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
