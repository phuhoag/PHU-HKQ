import { useCart } from "../../context/CartContext.jsx";
import { MdShoppingCart } from "react-icons/md";

export default function CartSummary() {
  const { cart, getTotalPrice, getTotalItems, clearCart } = useCart();

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 h-fit sticky top-8">
      <h3 className="text-h3 font-h3 text-on-background mb-6">Order Summary</h3>

      <div className="space-y-3 mb-6">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-body-md text-on-surface-variant">
            Subtotal ({getTotalItems()} items)
          </span>
          <span className="text-body-md font-body-md text-on-background">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between">
          <span className="text-body-md text-on-surface-variant">
            {shipping === 0 ? "Shipping (FREE)" : "Shipping"}
          </span>
          <span
            className={`text-body-md font-body-md ${
              shipping === 0 ? "text-success" : "text-on-background"
            }`}
          >
            {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
          </span>
        </div>

        {/* Tax */}
        <div className="flex items-center justify-between">
          <span className="text-body-md text-on-surface-variant">
            Tax (10%)
          </span>
          <span className="text-body-md font-body-md text-on-background">
            ${tax.toFixed(2)}
          </span>
        </div>

        {/* Promo Code */}
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            placeholder="Promo code"
            className="flex-grow px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-background placeholder-on-surface-variant text-body-sm focus:outline-none focus:border-primary"
          />
          <button className="px-4 py-2 text-body-sm font-body-sm text-on-surface hover:bg-surface-container rounded-lg transition">
            Apply
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="bg-primary/10 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-body-lg font-body-lg text-on-background">
            Total
          </span>
          <span className="text-h2 font-h2 text-primary">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Free Shipping Info */}
      {shipping > 0 && (
        <p className="text-body-sm text-success mb-4">
          ✓ Free shipping on orders over $100
        </p>
      )}

      {/* Checkout Button */}
      <button className="w-full px-4 py-3 bg-primary text-surface rounded-lg font-body-md hover:bg-primary/90 transition flex items-center justify-center gap-2 mb-3">
        <MdShoppingCart size={20} />
        Proceed to Checkout
      </button>

      {/* Continue Shopping */}
      <a
        href="/shop"
        className="w-full px-4 py-3 border border-outline rounded-lg font-body-md text-on-background hover:bg-surface-container transition text-center block"
      >
        Continue Shopping
      </a>

      {/* Clear Cart */}
      {cart.length > 0 && (
        <button
          onClick={clearCart}
          className="w-full mt-3 px-4 py-2 text-error text-body-sm hover:bg-error/10 rounded-lg transition"
        >
          Clear Cart
        </button>
      )}
    </div>
  );
}
