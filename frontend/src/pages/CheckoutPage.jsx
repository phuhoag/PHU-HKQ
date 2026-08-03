import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MdArrowBack,
  MdLocalShipping,
  MdPayment,
  MdShoppingBag,
  MdCheckCircle,
  MdPerson,
  MdPhone,
  MdHome,
  MdCreditCard,
  MdAccountBalance,
  MdAttachMoney,
  MdQrCodeScanner,
} from "react-icons/md";
import Header from "../components/layouts/Header.jsx";
import Footer from "../components/layouts/Footer.jsx";
import { useCart } from "../context/CartContext.jsx";
import { orderService } from "../services/orderService.js";
import { useToast } from "../context/ToastContext.jsx";
import SepayPaymentCard from "../components/checkout/SepayPaymentCard.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { cart, getTotalPrice, clearCart: clearLocalCart, appliedCoupon, setAppliedCoupon } = useCart();
  const { addToast } = useToast();
  const { t, language } = useLanguage();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const orderIdParam = searchParams.get("orderId");

  useEffect(() => {
    if (orderIdParam) {
      const fetchOrder = async () => {
        setLoading(true);
        try {
          const res = await orderService.getOrderById(orderIdParam);
          if (res.success) {
            setOrderSuccess(res.data);
            setStep(3);
          } else {
            addToast("Không thể tải thông tin đơn hàng", "error");
          }
        } catch (err) {
          addToast("Lỗi tải thông tin đơn hàng: " + err.message, "error");
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [orderIdParam]);

  const [shippingForm, setShippingForm] = useState({
    full_name: "",
    phone: "",
    shipping_address: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [errors, setErrors] = useState({});

  const subtotal = getTotalPrice ? getTotalPrice() : 0;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const discount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const totalPrice = Math.max(0, subtotal + shipping - discount);

  // ──────────── Payment options & steps inside component to access translator ────────────
  const PAYMENT_OPTIONS = [
    {
      value: "cash_on_delivery",
      label: t("checkout.codLabel"),
      icon: MdAttachMoney,
      desc: t("checkout.codDesc"),
    },
    {
      value: "qr_code",
      label: t("checkout.sepayLabel"),
      icon: MdQrCodeScanner,
      desc: t("checkout.sepayDesc"),
    },
    {
      value: "bank_transfer",
      label: t("checkout.bankLabel"),
      icon: MdAccountBalance,
      desc: t("checkout.bankDesc"),
    },
    {
      value: "credit_card",
      label: t("checkout.cardLabel"),
      icon: MdCreditCard,
      desc: t("checkout.cardDesc"),
    },
  ];

  const ORDER_STEPS = [
    { id: 1, label: t("checkout.shippingInfo"), icon: MdLocalShipping },
    { id: 2, label: t("checkout.payment"), icon: MdPayment },
    { id: 3, label: t("checkout.confirmation"), icon: MdCheckCircle },
  ];

  // ──────────── Validate ────────────
  const validateShipping = () => {
    const errs = {};
    if (!shippingForm.full_name.trim()) errs.full_name = t("checkout.validateName");
    if (!shippingForm.phone.trim()) errs.phone = t("checkout.validatePhone");
    else if (!/^[0-9]{9,11}$/.test(shippingForm.phone.replace(/\s/g, "")))
      errs.phone = t("checkout.validatePhoneInvalid");
    if (!shippingForm.shipping_address.trim())
      errs.shipping_address = t("checkout.validateAddress");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && !validateShipping()) return;
    setStep((s) => s + 1);
  };

  // ──────────── Đặt hàng ────────────
  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await orderService.createOrder({
        ...shippingForm,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
      });

      if (res.success) {
        clearLocalCart?.();
        setAppliedCoupon?.(null);
        setOrderSuccess(res.data.order);
        setStep(3);
        setSearchParams({ orderId: res.data.order._id }, { replace: true });
        addToast(t("checkout.orderSuccessToast"), "success");
      } else {
        addToast(res.message || t("checkout.orderFailToast"), "error");
      }
    } catch {
      addToast(t("checkout.connErrorToast"), "error");
    } finally {
      setLoading(false);
    }
  };

  // ──────────── Redirect nếu giỏ rỗng ────────────
  if (cart.length === 0 && step !== 3 && !orderIdParam) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-16">
            <MdShoppingBag size={80} className="text-on-surface-variant/30 mx-auto mb-4" />
            <h2 className="text-h2 font-h2 text-on-surface mb-2">{t("checkout.emptyCartTitle")}</h2>
            <p className="text-body-md text-on-surface-variant mb-6">
              {t("checkout.emptyCartDesc")}
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="px-6 py-3 bg-primary text-surface rounded-xl font-button"
            >
              {t("cart.summary.continueShopping")}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-desktop py-stack-lg">
        {/* Breadcrumb */}
        {step < 3 && (
          <button
            onClick={() => step === 1 ? navigate("/cart") : setStep((s) => s - 1)}
            className="flex items-center gap-2 text-primary hover:gap-3 transition mb-6"
          >
            <MdArrowBack size={20} />
            <span className="text-body-md">
              {step === 1 ? t("checkout.backButton") : t("checkout.backButton")}
            </span>
          </button>
        )}

        <h1 className="text-h1 font-h1 text-on-surface mb-8">
          {step === 3 ? t("checkout.confirmation") : t("nav.dashboard")}
        </h1>

        {/* ─── Progress Steps ─── */}
        {step < 3 && (
          <div className="flex items-center gap-4 mb-10">
            {ORDER_STEPS.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-body-sm font-semibold transition-all ${
                    step === s.id
                      ? "bg-primary text-surface shadow-md"
                      : step > s.id
                      ? "bg-success text-surface"
                      : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  <s.icon size={16} />
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.id}</span>
                </div>
                {idx < ORDER_STEPS.length - 1 && (
                  <div
                    className={`h-0.5 w-8 ${step > s.id ? "bg-success" : "bg-outline-variant"}`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ─────────── STEP 3: SUCCESS ─────────── */}
        {step === 3 && orderSuccess && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MdCheckCircle size={60} className="text-success" />
            </div>
            <h2 className="text-h2 font-h2 text-on-surface mb-2">{t("checkout.successTitle")}</h2>
            <p className="text-body-md text-on-surface-variant mb-6">
              {t("checkout.successDesc")}
            </p>

            <div className="bg-surface-container rounded-2xl p-6 mb-8 text-left border border-outline-variant">
              <div className="grid grid-cols-2 gap-4 text-body-md">
                <div>
                  <p className="text-on-surface-variant text-body-sm">{t("checkout.orderId")}</p>
                  <p className="font-semibold text-on-surface font-mono text-sm">
                    #{orderSuccess._id?.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-body-sm">{t("checkout.status")}</p>
                  {orderSuccess.payment_status === "paid" ? (
                    <span className="inline-flex px-2 py-0.5 bg-success/15 text-success rounded-full text-body-sm font-semibold">
                      {language === "vi" ? "Đang xử lý" : "Processing"}
                    </span>
                  ) : orderSuccess.payment_status === "failed" ? (
                    <span className="inline-flex px-2 py-0.5 bg-error/15 text-error rounded-full text-body-sm font-semibold">
                      {language === "vi" ? "Thanh toán thất bại" : "Payment Failed"}
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-0.5 bg-warning/15 text-warning rounded-full text-body-sm font-semibold">
                      {language === "vi" ? "Chờ xác nhận" : "Pending Confirmation"}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-on-surface-variant text-body-sm">{t("checkout.totalAmount")}</p>
                  <p className="font-bold text-primary text-xl">
                    ${parseFloat(orderSuccess.total_amount?.toString() || "0").toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-body-sm">{t("checkout.paymentStatus")}</p>
                  <p className="font-semibold text-on-surface capitalize">
                    {orderSuccess.payment_method?.replace(/_/g, " ")}
                    {orderSuccess.payment_status === "paid" && (language === "vi" ? " (Đã thanh toán)" : " (Paid)")}
                    {orderSuccess.payment_status === "failed" && (language === "vi" ? " (Thanh toán thất bại)" : " (Payment Failed)")}
                  </p>
                </div>
              </div>
            </div>

            {/* SePay Payment Card */}
            {orderSuccess.payment_method === "qr_code" && (
              orderSuccess.payment_status === "paid" ? (
                <div className="bg-success/10 border border-success/20 rounded-2xl p-6 mb-8 text-center shadow-sm">
                  <div className="text-success text-5xl mb-3">✓</div>
                  <h3 className="text-h3 font-h3 text-success font-bold mb-2">
                    {language === "vi" ? "Thanh toán chuyển khoản thành công!" : "Bank transfer payment successful!"}
                  </h3>
                  <p className="text-body-md text-on-surface-variant">
                    {language === "vi"
                      ? "Hệ thống đã ghi nhận số tiền thanh toán của bạn. Đơn hàng đang được chuẩn bị để giao."
                      : "We have received your payment. Your order is being prepared for shipment."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderSuccess.payment_status === "failed" && (
                    <div className="bg-error/10 border border-error/20 rounded-2xl p-6 mb-4 text-center shadow-sm">
                      <div className="text-error text-5xl mb-3">✗</div>
                      <h3 className="text-h3 font-h3 text-error font-bold mb-2">
                        {language === "vi" ? "Thanh toán chuyển khoản thất bại!" : "Bank transfer payment failed!"}
                      </h3>
                      <p className="text-body-md text-on-surface-variant">
                        {language === "vi"
                          ? "Số tiền chuyển khoản không khớp hoặc giao dịch bị lỗi. Vui lòng quét mã QR bên dưới để thực hiện lại giao dịch."
                          : "The transferred amount did not match or the transaction failed. Please scan the QR code below to retry the transaction."}
                      </p>
                    </div>
                  )}
                  <SepayPaymentCard
                    orderId={orderSuccess._id}
                    totalAmount={parseFloat(orderSuccess.total_amount?.toString() || "0")}
                    onPaymentSuccess={() => {
                      if (orderSuccess._id) {
                        orderService.getOrderById(orderSuccess._id).then((res) => {
                          if (res.success) setOrderSuccess(res.data);
                        });
                      }
                    }}
                  />
                </div>
              )
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/orders")}
                className="px-6 py-3 bg-primary text-surface rounded-xl font-button hover:bg-primary/90 transition"
              >
                {t("checkout.viewOrdersButton")}
              </button>
              <button
                onClick={() => navigate("/shop")}
                className="px-6 py-3 border-2 border-outline-variant text-on-surface rounded-xl font-button hover:border-primary hover:text-primary transition"
              >
                {t("cart.summary.continueShopping")}
              </button>
            </div>
          </div>
        )}

        {/* ─────────── STEP 1 & 2 LAYOUT ─────────── */}
        {step < 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: Form */}
            <div className="lg:col-span-2 space-y-6">

              {/* ─── STEP 1: Shipping Info ─── */}
              {step === 1 && (
                <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant">
                  <h2 className="text-h3 font-h3 text-on-surface mb-6 flex items-center gap-2">
                    <MdLocalShipping className="text-primary" size={24} />
                    {t("checkout.shippingInfo")}
                  </h2>

                  <div className="space-y-4">
                    {/* Họ tên */}
                    <div>
                      <label className="block text-body-sm font-semibold text-on-surface mb-1">
                        <MdPerson className="inline mr-1" size={16} />
                        {t("checkout.fullNameLabel")} *
                      </label>
                      <input
                        type="text"
                        value={shippingForm.full_name}
                        onChange={(e) =>
                          setShippingForm({ ...shippingForm, full_name: e.target.value })
                        }
                        placeholder={t("checkout.fullNamePlaceholder")}
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-surface text-on-surface outline-none transition ${
                          errors.full_name
                            ? "border-error focus:border-error"
                            : "border-outline-variant focus:border-primary"
                        }`}
                      />
                      {errors.full_name && (
                        <p className="text-error text-body-sm mt-1">{errors.full_name}</p>
                      )}
                    </div>

                    {/* Số điện thoại */}
                    <div>
                      <label className="block text-body-sm font-semibold text-on-surface mb-1">
                        <MdPhone className="inline mr-1" size={16} />
                        {t("checkout.phoneLabel")} *
                      </label>
                      <input
                        type="tel"
                        value={shippingForm.phone}
                        onChange={(e) =>
                          setShippingForm({ ...shippingForm, phone: e.target.value })
                        }
                        placeholder={t("checkout.phonePlaceholder")}
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-surface text-on-surface outline-none transition ${
                          errors.phone
                            ? "border-error focus:border-error"
                            : "border-outline-variant focus:border-primary"
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-error text-body-sm mt-1">{errors.phone}</p>
                      )}
                    </div>

                    {/* Địa chỉ */}
                    <div>
                      <label className="block text-body-sm font-semibold text-on-surface mb-1">
                        <MdHome className="inline mr-1" size={16} />
                        {t("checkout.addressLabel")} *
                      </label>
                      <textarea
                        value={shippingForm.shipping_address}
                        onChange={(e) =>
                          setShippingForm({ ...shippingForm, shipping_address: e.target.value })
                        }
                        placeholder={t("checkout.addressPlaceholder")}
                        rows={3}
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-surface text-on-surface outline-none transition resize-none ${
                          errors.shipping_address
                            ? "border-error focus:border-error"
                            : "border-outline-variant focus:border-primary"
                        }`}
                      />
                      {errors.shipping_address && (
                        <p className="text-error text-body-sm mt-1">{errors.shipping_address}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="mt-6 w-full py-4 bg-primary text-surface rounded-xl font-button text-button hover:bg-primary/90 active:scale-95 transition-all"
                  >
                    {t("checkout.nextButton")} →
                  </button>
                </div>
              )}

              {/* ─── STEP 2: Payment ─── */}
              {step === 2 && (
                <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant">
                  <h2 className="text-h3 font-h3 text-on-surface mb-6 flex items-center gap-2">
                    <MdPayment className="text-primary" size={24} />
                    {t("checkout.paymentMethodLabel")}
                  </h2>

                  <div className="space-y-3 mb-6">
                    {PAYMENT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setPaymentMethod(opt.value)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          paymentMethod === opt.value
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-outline-variant hover:border-primary/40"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === opt.value
                              ? "bg-primary text-surface"
                              : "bg-surface-container text-on-surface-variant"
                          }`}
                        >
                          <opt.icon size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-on-surface text-body-md">{opt.label}</p>
                          <p className="text-body-sm text-on-surface-variant">{opt.desc}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === opt.value
                              ? "border-primary bg-primary"
                              : "border-outline-variant"
                          }`}
                        >
                          {paymentMethod === opt.value && (
                            <div className="w-2 h-2 rounded-full bg-surface" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Shipping summary */}
                  <div className="bg-surface rounded-xl p-4 border border-outline-variant mb-6">
                    <h3 className="font-semibold text-on-surface text-body-md mb-2">
                      📦 {t("checkout.shippingInfo")}:
                    </h3>
                    <p className="text-body-sm text-on-surface-variant">
                      <strong>{shippingForm.full_name}</strong> • {shippingForm.phone}
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      {shippingForm.shipping_address}
                    </p>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full py-4 bg-primary text-surface rounded-xl font-button text-button hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-wait"
                  >
                    {loading ? t("checkout.placingOrderButton") : `🛍️ ${t("checkout.placeOrderButton")} • $${totalPrice}`}
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant sticky top-24">
                <h3 className="text-h3 font-h3 text-on-surface mb-4">
                  {t("checkout.summaryTitle")} ({cart.length} {language === "vi" ? "sản phẩm" : "items"})
                </h3>

                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {cart.map((item) => {
                    const price = parseFloat(
                      item.price?.toString() || item.product_id?.price?.toString() || "0"
                    );
                    return (
                      <div key={item.id || item._id} className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-surface-container flex items-center justify-center">
                              <MdShoppingBag size={20} className="text-on-surface-variant/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-body-sm font-semibold text-on-surface truncate">
                            {item.name}
                          </p>
                          <p className="text-body-sm text-on-surface-variant">
                            x{item.quantity}
                          </p>
                        </div>
                        <p className="text-body-sm font-bold text-primary">
                          ${(price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-outline-variant pt-4 space-y-2">
                  <div className="flex justify-between text-body-sm text-on-surface-variant">
                    <span>{t("checkout.tempTotal")}</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-body-sm text-on-surface-variant">
                    <span>{t("checkout.shipFee")}</span>
                    {shipping === 0 ? (
                      <span className="text-success font-semibold">{t("checkout.free")}</span>
                    ) : (
                      <span>${shipping.toFixed(2)}</span>
                    )}
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-body-sm text-success">
                      <span>{t("cart.summary.discount").replace("{code}", appliedCoupon.code)}</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-on-surface pt-2 border-t border-outline-variant">
                    <span>{t("cart.summary.total")}</span>
                    <span className="text-primary text-xl">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
