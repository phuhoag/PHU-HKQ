import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdShoppingBag,
  MdArrowBack,
  MdChevronRight,
  MdRefresh,
  MdLocalShipping,
  MdCheckCircle,
  MdCancel,
  MdHourglassEmpty,
  MdInventory,
} from "react-icons/md";
import Header from "../components/layouts/Header.jsx";
import Footer from "../components/layouts/Footer.jsx";
import { orderService } from "../services/orderService.js";

const STATUS_CONFIG = {
  pending: {
    label: "Chờ xác nhận",
    color: "text-warning",
    bg: "bg-warning/10",
    icon: MdHourglassEmpty,
  },
  processing: {
    label: "Đang xử lý",
    color: "text-primary",
    bg: "bg-primary/10",
    icon: MdInventory,
  },
  shipped: {
    label: "Đang giao hàng",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    icon: MdLocalShipping,
  },
  delivered: {
    label: "Đã giao hàng",
    color: "text-success",
    bg: "bg-success/10",
    icon: MdCheckCircle,
  },
  cancelled: {
    label: "Đã hủy",
    color: "text-error",
    bg: "bg-error/10",
    icon: MdCancel,
  },
};

const STATUS_FILTERS = [
  { value: "", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "processing", label: "Đang xử lý" },
  { value: "shipped", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await orderService.getMyOrders({
      limit: 50,
      status: statusFilter || undefined,
    });
    if (res.success) {
      setOrders(res.data.orders || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    setCancellingId(orderId);
    const res = await orderService.cancelOrder(orderId);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o))
      );
    } else {
      alert(res.message || "Hủy đơn thất bại");
    }
    setCancellingId(null);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-desktop py-stack-lg">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-primary hover:gap-3 transition mb-4"
          >
            <MdArrowBack size={20} />
            <span className="text-body-md">Về trang chủ</span>
          </button>

          <div className="flex items-center justify-between">
            <h1 className="text-h1 font-h1 text-on-surface flex items-center gap-3">
              <MdShoppingBag size={32} className="text-primary" />
              Lịch sử đơn hàng
            </h1>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 py-2 border-2 border-outline-variant rounded-xl text-on-surface-variant hover:border-primary hover:text-primary transition"
            >
              <MdRefresh size={18} />
              <span className="text-body-sm">Làm mới</span>
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-body-sm font-semibold transition-all ${
                statusFilter === f.value
                  ? "bg-primary text-surface shadow-md"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container rounded-2xl p-6 border border-outline-variant animate-pulse">
                <div className="h-4 bg-surface-container-high rounded w-32 mb-3" />
                <div className="h-3 bg-surface-container-high rounded w-48 mb-2" />
                <div className="h-3 bg-surface-container-high rounded w-24" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-container rounded-2xl border border-outline-variant">
            <MdShoppingBag size={64} className="text-on-surface-variant/30 mb-4" />
            <h2 className="text-h2 font-h2 text-on-surface mb-2">Chưa có đơn hàng</h2>
            <p className="text-body-md text-on-surface-variant mb-6">
              {statusFilter ? "Không có đơn hàng nào với trạng thái này" : "Bạn chưa đặt đơn hàng nào"}
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="px-6 py-3 bg-primary text-surface rounded-xl font-button hover:bg-primary/90 transition"
            >
              Bắt đầu mua sắm
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusInfo.icon;
              const totalAmount = parseFloat(order.total_amount?.toString() || "0");

              return (
                <div
                  key={order._id}
                  className="bg-surface-container rounded-2xl border border-outline-variant overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order header */}
                  <div className="flex items-center justify-between p-5 border-b border-outline-variant">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-body-sm text-on-surface-variant">
                          Đơn hàng #{order._id?.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-body-sm text-on-surface-variant">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-body-sm font-semibold ${statusInfo.bg} ${statusInfo.color}`}
                      >
                        <StatusIcon size={14} />
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Order items preview */}
                  <div className="p-5">
                    {order.items && order.items.length > 0 ? (
                      <div className="flex gap-3 mb-4 overflow-x-auto">
                        {order.items.slice(0, 4).map((item, idx) => (
                          <div
                            key={item._id || idx}
                            className="flex-shrink-0 flex items-center gap-2"
                          >
                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface border border-outline-variant">
                              {item.product_id?.image ? (
                                <img
                                  src={item.product_id.image}
                                  alt={item.product_id.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <MdShoppingBag size={20} className="text-on-surface-variant/30" />
                                </div>
                              )}
                            </div>
                            {idx === 3 && order.items.length > 4 && (
                              <span className="text-body-sm text-on-surface-variant">
                                +{order.items.length - 4} sản phẩm
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-body-sm text-on-surface-variant">
                          {order.items?.length || 0} sản phẩm •{" "}
                          <span className="capitalize">
                            {order.payment_method?.replace(/_/g, " ")}
                          </span>
                        </p>
                        <p className="text-xl font-bold text-primary">
                          ${totalAmount.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {order.status === "pending" && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={cancellingId === order._id}
                            className="px-4 py-2 border-2 border-error text-error rounded-xl text-body-sm font-semibold hover:bg-error/10 transition disabled:opacity-50"
                          >
                            {cancellingId === order._id ? "Đang hủy..." : "Hủy đơn"}
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/orders/${order._id}`)}
                          className="flex items-center gap-1 px-4 py-2 bg-primary text-surface rounded-xl text-body-sm font-semibold hover:bg-primary/90 transition"
                        >
                          Chi tiết
                          <MdChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
