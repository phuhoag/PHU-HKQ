import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdLocalShipping,
  MdCheckCircle,
  MdCancel,
  MdHourglassEmpty,
  MdInventory,
  MdShoppingBag,
  MdPhone,
  MdHome,
  MdPerson,
  MdPayment,
} from "react-icons/md";
import Header from "../components/layouts/Header.jsx";
import Footer from "../components/layouts/Footer.jsx";
import { orderService } from "../services/orderService.js";
import SepayPaymentCard from "../components/checkout/SepayPaymentCard.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

const STATUS_STEPS = [
  { key: "pending", icon: MdHourglassEmpty },
  { key: "processing", icon: MdInventory },
  { key: "shipped", icon: MdLocalShipping },
  { key: "delivered", icon: MdCheckCircle },
];

const STATUS_ORDER = ["pending", "processing", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { t, language } = useLanguage();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      const res = await orderService.getOrderById(orderId);
      if (res.success) {
        setOrder(res.data);
      }
      setLoading(false);
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleCancel = async () => {
    if (!window.confirm(t("dashboard.confirmCancelOrder"))) return;
    setCancelling(true);
    const res = await orderService.cancelOrder(orderId);
    if (res.success) {
      setOrder((prev) => ({ ...prev, status: "cancelled" }));
      alert(t("orders.alertCancelSuccess"));
    } else {
      alert(res.message || t("orders.alertCancelFail"));
    }
    setCancelling(false);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending": return t("dashboard.statusPending");
      case "processing": return t("dashboard.statusProcessing");
      case "shipped": return t("dashboard.statusShipped");
      case "delivered": return t("dashboard.statusDelivered");
      case "cancelled": return t("dashboard.statusCancelled");
      default: return status;
    }
  };

  const getStatusDesc = (status) => {
    switch (status) {
      case "pending": return language === "vi" ? "Đơn hàng đã được đặt thành công" : "Order placed successfully";
      case "processing": return language === "vi" ? "Đơn hàng đang được chuẩn bị" : "Order is being prepared";
      case "shipped": return language === "vi" ? "Đơn hàng đã được giao cho đơn vị vận chuyển" : "Order handed over to shipping carrier";
      case "delivered": return language === "vi" ? "Đơn hàng đã được giao thành công" : "Order delivered successfully";
      default: return "";
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-on-surface-variant">{t("dashboard.loadingOrders")}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MdShoppingBag size={64} className="text-on-surface-variant/30 mx-auto mb-4" />
            <h2 className="text-h2 font-h2 text-on-surface mb-2">{t("dashboard.notFoundOrder")}</h2>
            <button onClick={() => navigate("/orders")} className="px-6 py-3 bg-primary text-surface rounded-xl font-button">
              {t("dashboard.viewOrderHistory")}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";
  const currentStepIdx = STATUS_ORDER.indexOf(order.status);
  const totalAmount = parseFloat(order.total_amount?.toString() || "0");

  // Parse shipping address
  const addressParts = order.shipping_address?.split(" | ") || [];
  const recipientName = addressParts[0] || "";
  const recipientPhone = addressParts[1] || order.phone || "";
  const recipientAddress = addressParts[2] || addressParts[0] || "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-desktop py-stack-lg">
        {/* Back */}
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 text-primary hover:gap-3 transition mb-6"
        >
          <MdArrowBack size={20} />
          <span className="text-body-md">{t("dashboard.orderHistoryTitle")}</span>
        </button>

        {/* Title + status */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-h1 font-h1 text-on-surface">
              {t("dashboard.orderDetailTitle")} #{order._id?.slice(-8).toUpperCase()}
            </h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              {t("dashboard.placedAtLabel")} {formatDate(order.createdAt)}
            </p>
          </div>

          {order.status === "pending" && !isCancelled && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="px-5 py-2.5 border-2 border-error text-error rounded-xl font-button hover:bg-error/10 transition disabled:opacity-50"
            >
              {cancelling ? t("orders.cancelling") : t("dashboard.actionCancel")}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">

            {/* ─── Tracking Status ─── */}
            {!isCancelled ? (
              <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant">
                <h2 className="text-h3 font-h3 text-on-surface mb-6">📦 {t("dashboard.trackOrder")}</h2>

                <div className="relative">
                  {/* Progress line */}
                  <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-outline-variant" />
                  <div
                    className="absolute left-6 top-6 w-0.5 bg-primary transition-all"
                    style={{
                      height: `${Math.max(0, currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%`,
                    }}
                  />

                  <div className="space-y-6">
                    {STATUS_STEPS.map((s, idx) => {
                      const done = currentStepIdx >= idx;
                      const active = currentStepIdx === idx;
                      return (
                        <div key={s.key} className="flex items-start gap-5 relative">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                              done
                                ? active
                                  ? "bg-primary text-surface shadow-lg shadow-primary/30"
                                  : "bg-success text-surface"
                                : "bg-surface border-2 border-outline-variant text-on-surface-variant"
                            }`}
                          >
                            <s.icon size={22} />
                          </div>
                          <div className="pt-2">
                            <p className={`font-semibold text-body-md ${done ? "text-on-surface" : "text-on-surface-variant"}`}>
                              {getStatusLabel(s.key)}
                              {active && (
                                <span className="ml-2 text-primary text-body-sm font-normal">• {t("dashboard.currentStatus")}</span>
                              )}
                            </p>
                            <p className="text-body-sm text-on-surface-variant mt-0.5">{getStatusDesc(s.key)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-error/5 rounded-2xl p-6 border border-error/20 flex items-center gap-4">
                <MdCancel size={40} className="text-error flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-error text-body-md">{t("dashboard.orderCancelled")}</h3>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    {t("dashboard.cancelMessage")}
                  </p>
                </div>
              </div>
            )}

            {/* SePay Payment Card if order is pending and unpaid */}
            {order.status === "pending" &&
              order.payment_method === "qr_code" &&
              order.payment_status === "pending" && (
                <SepayPaymentCard
                  orderId={order._id}
                  totalAmount={totalAmount}
                />
              )}

            {/* ─── Order Items ─── */}
            <div className="bg-surface-container rounded-2xl border border-outline-variant overflow-hidden">
              <div className="p-5 border-b border-outline-variant">
                <h2 className="text-h3 font-h3 text-on-surface">
                  {t("dashboard.tableProducts")} ({order.items?.length || 0})
                </h2>
              </div>

              <div className="divide-y divide-outline-variant">
                {(order.items || []).map((item, idx) => {
                  const product = item.product_id;
                  const price = parseFloat(item.price?.toString() || "0");
                  return (
                    <div key={item._id || idx} className="flex items-center gap-4 p-5">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface border border-outline-variant flex-shrink-0">
                        {product?.image ? (
                          <img src={product.image} alt={product?.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MdShoppingBag size={24} className="text-on-surface-variant/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-on-surface truncate">
                          {product?.name || "Sản phẩm"}
                        </p>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">
                          {t("dashboard.tableUnitPrice")}: ${price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-primary text-lg">
                        ${(price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Summary */}
          <div className="space-y-4">
            {/* Order Info */}
            <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant">
              <h3 className="font-bold text-on-surface text-body-md mb-4">📋 {t("dashboard.orderInfo")}</h3>
              <div className="space-y-3 text-body-sm">
                <div className="flex items-start gap-2">
                  <MdPerson className="text-primary mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-on-surface-variant">{t("dashboard.recipientLabel")}</p>
                    <p className="font-semibold text-on-surface mt-0.5">{recipientName || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MdPhone className="text-primary mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-on-surface-variant">{t("dashboard.phoneLabel")}</p>
                    <p className="font-semibold text-on-surface mt-0.5">{recipientPhone || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MdHome className="text-primary mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-on-surface-variant">{t("dashboard.addressLabel")}</p>
                    <p className="font-semibold text-on-surface mt-0.5">{recipientAddress || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MdPayment className="text-primary mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-on-surface-variant">{t("dashboard.paymentLabel")}</p>
                    <p className="font-semibold text-on-surface capitalize mt-0.5">
                      {order.payment_method?.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant">
              <h3 className="font-bold text-on-surface text-body-md mb-4">💰 {t("dashboard.paymentSummaryTitle")}</h3>
              <div className="space-y-2 text-body-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>{t("dashboard.subtotalLabel")} ({order.items?.length || 0} {language === "vi" ? "sản phẩm" : "items"})</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>{t("dashboard.shippingLabel")}</span>
                  <span className="text-success font-semibold">{t("dashboard.freeLabel")}</span>
                </div>
                <div className="flex justify-between font-bold text-on-surface text-lg pt-3 border-t border-outline-variant">
                  <span>{t("dashboard.totalLabel")}</span>
                  <span className="text-primary">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
