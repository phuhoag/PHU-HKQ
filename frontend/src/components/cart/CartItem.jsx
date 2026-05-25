import { MdAdd, MdRemove, MdDelete } from "react-icons/md";
import { useCart } from "../../context/CartContext.jsx";

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-lg border border-outline-variant hover:border-outline transition">
      {/* Product Image */}
      <div className="w-24 h-24 bg-surface-container rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={item.image || "https://via.placeholder.com/100"}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-grow min-w-0">
        <h3 className="text-body-lg font-body-lg text-on-background truncate">
          {item.name}
        </h3>
        <p className="text-body-sm text-on-surface-variant mt-1">
          {item.category || "Electronics"}
        </p>
        <p className="text-body-md font-body-md text-primary mt-2">
          ${item.price?.toFixed(2) || "0.00"}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2 bg-surface-container rounded-lg p-2">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="p-1 hover:bg-surface-container-highest rounded transition"
          aria-label="Decrease quantity"
        >
          <MdRemove size={18} className="text-on-surface" />
        </button>
        <span className="w-8 text-center text-body-md font-body-md">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="p-1 hover:bg-surface-container-highest rounded transition"
          aria-label="Increase quantity"
        >
          <MdAdd size={18} className="text-on-surface" />
        </button>
      </div>

      {/* Total Price */}
      <div className="text-right flex-shrink-0 min-w-[100px]">
        <p className="text-body-md font-body-md text-on-background">
          ${(item.price * item.quantity)?.toFixed(2) || "0.00"}
        </p>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => removeFromCart(item.id)}
        className="p-2 text-error hover:bg-error/10 rounded-lg transition flex-shrink-0"
        aria-label="Remove item"
      >
        <MdDelete size={20} />
      </button>
    </div>
  );
}
