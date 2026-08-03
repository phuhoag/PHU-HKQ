import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import { MdShoppingCart, MdLocalShipping } from "react-icons/md";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function CartSummary() {
  const navigate = useNavigate();
  const {
    cart,
    getTotalPrice,
    getTotalItems,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { t, language, formatPrice } = useLanguage();

  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);

  const subtotal = getTotalPrice();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const discount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplying(true);
    try {
      const res = await applyCoupon(couponCode);
      if (res.success) {
        setCouponCode("");
      }
    } finally {
      setApplying(false);
    }
  };

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
            {formatPrice(subtotal)}
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
            {shipping === 0 ? t("cart.summary.free") : formatPrice(shipping)}
          </span>
        </div>

        {shipping > 0 && (
          <p className="text-body-sm text-success flex items-center gap-1">
            <MdLocalShipping size={14} />
            {t("cart.summary.freeShippingPromo")}
          </p>
        )}

        {/* Discount Line */}
        {appliedCoupon && (
          <div className="flex items-center justify-between text-success pt-2 border-t border-dashed border-outline-variant/60">
            <span className="text-body-md font-semibold">
              {t("cart.summary.discount").replace("{code}", appliedCoupon.code)}
            </span>
            <span className="text-body-md font-bold">
              -{formatPrice(discount)}
            </span>
          </div>
        )}
      </div>

      {/* Coupon input field */}
      <div className="border-t border-outline-variant/60 pt-4 mb-6">
        <label className="block text-body-sm font-bold text-on-surface-variant mb-2">
          {t("cart.summary.couponCodeLabel")}
        </label>
        
        {appliedCoupon ? (
          <div className="flex items-center justify-between bg-success/10 border border-success/30 rounded-xl p-3">
            <div>
              <p className="text-body-sm font-bold text-success">
                {t("cart.summary.couponApplied")}: {appliedCoupon.code}
              </p>
              <p className="text-xs text-on-surface-variant">
                {appliedCoupon.discount_type === "percentage"
                  ? `-${appliedCoupon.discount_value}%`
                  : `-${formatPrice(appliedCoupon.discount_value)}`}
              </p>
            </div>
            <button
              onClick={removeCoupon}
              className="text-error text-body-sm hover:underline font-semibold"
            >
              {t("cart.summary.remove")}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder={t("cart.summary.couponPlaceholder")}
              className="flex-grow border-2 border-outline-variant rounded-xl px-3 py-2 bg-surface text-body-sm font-medium focus:border-primary outline-none uppercase"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={applying || !couponCode.trim()}
              className="px-4 py-2 bg-primary text-surface text-body-sm font-semibold rounded-xl hover:bg-primary/95 disabled:opacity-40 transition flex items-center justify-center min-w-[70px]"
            >
              {applying ? "..." : t("cart.summary.apply")}
            </button>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="bg-primary/10 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-body-lg font-body-lg text-on-background">{t("cart.summary.total")}</span>
          <span className="text-h2 font-h2 text-primary">{formatPrice(total)}</span>
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
