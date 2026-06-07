import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const PAYMENT_OPTIONS = [
  {
    value: "cash_on_delivery",
    label: "Thanh toán khi nhận hàng (COD)",
    icon: MdAttachMoney,
    desc: "Trả tiền mặt khi nhận hàng",
  },
  {
    value: "qr_code",
    label: "Thanh toán qua mã QR (SePay)",
    icon: MdQrCodeScanner,
    desc: "Quét mã QR để chuyển khoản nhanh qua App Ngân hàng",
  },
  {
    value: "bank_transfer",
    label: "Chuyển khoản ngân hàng",
    icon: MdAccountBalance,
    desc: "Chuyển khoản qua tài khoản ngân hàng",
  },
  {
    value: "credit_card",
    label: "Thẻ tín dụng / Ghi nợ",
    icon: MdCreditCard,
    desc: "Visa, MasterCard, JCB",
  },
];

const ORDER_STEPS = [
  { id: 1, label: "Thông tin giao hàng", icon: MdLocalShipping },
  { id: 2, label: "Thanh toán", icon: MdPayment },
  { id: 3, label: "Xác nhận", icon: MdCheckCircle },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart: clearLocalCart } = useCart();
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [shippingForm, setShippingForm] = useState({
    full_name: "",
    phone: "",
    shipping_address: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [errors, setErrors] = useState({});

  const totalPrice = getTotalPrice ? getTotalPrice() : 0;

  // ──────────── Validate ────────────
  const validateShipping = () => {
    const errs = {};
    if (!shippingForm.full_name.trim()) errs.full_name = "Vui lòng nhập họ tên";
    if (!shippingForm.phone.trim()) errs.phone = "Vui lòng nhập số điện thoại";
    else if (!/^[0-9]{9,11}$/.test(shippingForm.phone.replace(/\s/g, "")))
      errs.phone = "Số điện thoại không hợp lệ";
    if (!shippingForm.shipping_address.trim())
      errs.shipping_address = "Vui lòng nhập địa chỉ giao hàng";
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
      });

      if (res.success) {
        clearLocalCart?.();
        setOrderSuccess(res.data.order);
        setStep(3);
        addToast("🎉 Đặt hàng thành công!", "success");
      } else {
        addToast(res.message || "Đặt hàng thất bại", "error");
      }
    } catch {
      addToast("Lỗi kết nối server", "error");
    } finally {
      setLoading(false);
    }
  };

  // ──────────── Redirect nếu giỏ rỗng ────────────
  if (cart.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-16">
            <MdShoppingBag size={80} className="text-on-surface-variant/30 mx-auto mb-4" />
            <h2 className="text-h2 font-h2 text-on-surface mb-2">Giỏ hàng trống</h2>
            <p className="text-body-md text-on-surface-variant mb-6">
              Thêm sản phẩm vào giỏ hàng để tiếp tục đặt hàng
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="px-6 py-3 bg-primary text-surface rounded-xl font-button"
            >
              Tiếp tục mua sắm
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
            <span className="text-body-md">{step === 1 ? "Quay lại giỏ hàng" : "Quay lại"}</span>
          </button>
        )}

        <h1 className="text-h1 font-h1 text-on-surface mb-8">
          {step === 3 ? "🎉 Đặt hàng thành công!" : "Thanh toán"}
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
            <h2 className="text-h2 font-h2 text-on-surface mb-2">Cảm ơn bạn đã đặt hàng!</h2>
            <p className="text-body-md text-on-surface-variant mb-6">
              Đơn hàng của bạn đã được ghi nhận và đang chờ xác nhận
            </p>

            <div className="bg-surface-container rounded-2xl p-6 mb-8 text-left border border-outline-variant">
              <div className="grid grid-cols-2 gap-4 text-body-md">
                <div>
                  <p className="text-on-surface-variant text-body-sm">Mã đơn hàng</p>
                  <p className="font-semibold text-on-surface font-mono text-sm">
                    #{orderSuccess._id?.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-body-sm">Trạng thái</p>
                  <span className="inline-flex px-2 py-0.5 bg-warning/15 text-warning rounded-full text-body-sm font-semibold">
                    Chờ xác nhận
                  </span>
                </div>
                <div>
                  <p className="text-on-surface-variant text-body-sm">Tổng tiền</p>
                  <p className="font-bold text-primary text-xl">
                    ${parseFloat(orderSuccess.total_amount?.toString() || "0").toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-body-sm">Thanh toán</p>
                  <p className="font-semibold text-on-surface capitalize">
                    {orderSuccess.payment_method?.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            </div>

            {/* SePay Payment Card */}
            {orderSuccess.payment_method === "qr_code" && (
              <SepayPaymentCard
                orderId={orderSuccess._id}
                totalAmount={parseFloat(orderSuccess.total_amount?.toString() || "0")}
              />
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/orders")}
                className="px-6 py-3 bg-primary text-surface rounded-xl font-button hover:bg-primary/90 transition"
              >
                Xem lịch sử đơn hàng
              </button>
              <button
                onClick={() => navigate("/shop")}
                className="px-6 py-3 border-2 border-outline-variant text-on-surface rounded-xl font-button hover:border-primary hover:text-primary transition"
              >
                Tiếp tục mua sắm
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
                    Thông tin giao hàng
                  </h2>

                  <div className="space-y-4">
                    {/* Họ tên */}
                    <div>
                      <label className="block text-body-sm font-semibold text-on-surface mb-1">
                        <MdPerson className="inline mr-1" size={16} />
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        value={shippingForm.full_name}
                        onChange={(e) =>
                          setShippingForm({ ...shippingForm, full_name: e.target.value })
                        }
                        placeholder="Nguyễn Văn A"
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
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        value={shippingForm.phone}
                        onChange={(e) =>
                          setShippingForm({ ...shippingForm, phone: e.target.value })
                        }
                        placeholder="0901 234 567"
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
                        Địa chỉ giao hàng *
                      </label>
                      <textarea
                        value={shippingForm.shipping_address}
                        onChange={(e) =>
                          setShippingForm({ ...shippingForm, shipping_address: e.target.value })
                        }
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
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
                    Tiếp theo: Chọn thanh toán →
                  </button>
                </div>
              )}

              {/* ─── STEP 2: Payment ─── */}
              {step === 2 && (
                <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant">
                  <h2 className="text-h3 font-h3 text-on-surface mb-6 flex items-center gap-2">
                    <MdPayment className="text-primary" size={24} />
                    Phương thức thanh toán
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
                      📦 Giao hàng đến:
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
                    {loading ? "Đang đặt hàng..." : `🛍️ Đặt hàng • $${totalPrice}`}
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant sticky top-24">
                <h3 className="text-h3 font-h3 text-on-surface mb-4">
                  Đơn hàng ({cart.length} sản phẩm)
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
                    <span>Tạm tính</span>
                    <span>${totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-body-sm text-on-surface-variant">
                    <span>Phí vận chuyển</span>
                    <span className="text-success font-semibold">Miễn phí</span>
                  </div>
                  <div className="flex justify-between font-bold text-on-surface pt-2 border-t border-outline-variant">
                    <span>Tổng cộng</span>
                    <span className="text-primary text-xl">${totalPrice}</span>
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
