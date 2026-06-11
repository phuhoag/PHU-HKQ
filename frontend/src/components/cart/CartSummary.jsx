import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import { MdShoppingCart, MdLocalShipping } from "react-icons/md";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function CartSummary() {
  const navigate = useNavigate();
  const { cart, getTotalPrice, getTotalItems, clearCart } = useCart();
  const { t, language } = useLanguage();

  const subtotal = getTotalPrice();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 h-fit sticky top-8">
      <h3 className="text-h3 font-h3 text-on-background mb-6">{t("cart.summary.title")}</h3>

      <div className="space-y-3 mb-6">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-body-md text-on-surface-variant">
            {t("cart.summary.subtotal")} ({getTotalItems()} {language === "vi" ? "sản phẩm" : "items"})
          </span>
          <span className="text-body-md font-body-md text-on-background">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between">
          <span className="text-body-md text-on-surface-variant">
            {shipping === 0 ? t("cart.summary.freeShipping") : t("cart.summary.shipping")}
          </span>
          <span
            className={`text-body-md font-body-md ${
              shipping === 0 ? "text-success" : "text-on-background"
            }`}
          >
            {shipping === 0 ? t("cart.summary.free") : `$${shipping.toFixed(2)}`}
          </span>
        </div>

        {shipping > 0 && (
          <p className="text-body-sm text-success flex items-center gap-1">
            <MdLocalShipping size={14} />
            {t("cart.summary.freeShippingPromo")}
          </p>
        )}
      </div>

      {/* Total */}
      <div className="bg-primary/10 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-body-lg font-body-lg text-on-background">{t("cart.summary.total")}</span>
          <span className="text-h2 font-h2 text-primary">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={() => navigate("/checkout")}
        disabled={cart.length === 0}
        className="w-full px-4 py-3 bg-primary text-surface rounded-lg font-body-md hover:bg-primary/90 transition flex items-center justify-center gap-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MdShoppingCart size={20} />
        {t("cart.summary.checkout")}
      </button>

      {/* Continue Shopping */}
      <a
        href="/shop"
        className="w-full px-4 py-3 border border-outline rounded-lg font-body-md text-on-background hover:bg-surface-container transition text-center block"
      >
        {t("cart.summary.continueShopping")}
      </a>

      {/* Clear Cart */}
      {cart.length > 0 && (
        <button
          onClick={clearCart}
          className="w-full mt-3 px-4 py-2 text-error text-body-sm hover:bg-error/10 rounded-lg transition"
        >
          {t("cart.summary.clearCart")}
        </button>
      )}
    </div>
  );
}
