import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  MdClose,
  MdSearch,
} from "react-icons/md";
import Header from "../components/layouts/Header.jsx";
import Footer from "../components/layouts/Footer.jsx";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import { orderService } from "../services/orderService.js";
import Pagination from "../components/common/Pagination.jsx";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10; // 10 orders per page for both admin and customer views

  // Role and auth state
  const [roleChecked, setRoleChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin search & detail modal state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [customerOrderHistory, setCustomerOrderHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Verify role on mount
  useEffect(() => {
    const userString = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !userString) {
      navigate("/login");
      return;
    }

    try {
      const userData = JSON.parse(userString);
      setCurrentUser(userData);
      setIsAdmin(userData.role === "admin");
      setRoleChecked(true);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      if (isAdmin) {
        const res = await orderService.adminGetAllOrders({
          page,
          limit: LIMIT,
          status: statusFilter || undefined,
        });
        if (res.success) {
          setOrders(res.data.orders || []);
          setTotalPages(res.data.pagination?.totalPages || 1);
        }
      } else {
        const res = await orderService.getMyOrders({
          page,
          limit: LIMIT,
          status: statusFilter || undefined,
        });
        if (res.success) {
          setOrders(res.data.orders || []);
          setTotalPages(res.data.pagination?.totalPages || 1);
        }
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roleChecked) {
      setCurrentPage(1);
      fetchOrders(1);

      // Check query parameter for openOrder
      const params = new URLSearchParams(window.location.search);
      const openOrderId = params.get("openOrder");
      if (openOrderId) {
        const fetchAndOpenOrder = async () => {
          try {
            const res = await orderService.getOrderById(openOrderId);
            if (res.success) {
              setSelectedOrder(res.data);
              setDetailModalOpen(true);
            }
          } catch (err) {
            console.error("Error fetching openOrder:", err);
          }
        };
        fetchAndOpenOrder();
      }
    }
  }, [roleChecked, statusFilter]);

  // Fetch customer purchase history when modal is opened for an order
  useEffect(() => {
    if (selectedOrder && selectedOrder.user_id?._id && isAdmin) {
      const fetchCustomerHistory = async () => {
        setLoadingHistory(true);
        try {
          const res = await orderService.adminGetAllOrders({
            userId: selectedOrder.user_id._id,
            limit: 100,
          });
          if (res.success) {
            // Exclude current order to show only *other* orders
            const otherOrders = (res.data.orders || []).filter(
              (o) => o._id !== selectedOrder._id
            );
            setCustomerOrderHistory(otherOrders);
          }
        } catch (err) {
          console.error("Error fetching customer order history:", err);
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchCustomerHistory();
    } else {
      setCustomerOrderHistory([]);
    }
  }, [selectedOrder, isAdmin]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchOrders(page);
  };

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

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await orderService.adminUpdateOrderStatus(orderId, newStatus);
      if (res.success) {
        alert("✅ Cập nhật trạng thái đơn hàng thành công!");
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        }
      } else {
        alert("❌ " + (res.message || "Cập nhật trạng thái thất bại"));
      }
    } catch (err) {
      alert("❌ Lỗi: " + err.message);
    }
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

  // Local search filter for Admin
  const filteredOrders = orders.filter((o) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const orderIdMatch = o._id?.toLowerCase().includes(term);
    const customerEmailMatch = o.user_id?.email?.toLowerCase().includes(term);
    const customerNameMatch = `${o.user_id?.first_name || ""} ${o.user_id?.last_name || ""}`.toLowerCase().includes(term);
    return orderIdMatch || customerEmailMatch || customerNameMatch;
  });

  if (!roleChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-body-md text-on-surface-variant animate-pulse">Đang xác thực thông tin...</p>
      </div>
    );
  }

  // Render Admin View
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-background dark:bg-inverse-surface text-on-background dark:text-inverse-on-surface transition-colors duration-200">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="ml-64 p-8 min-h-screen">
          {/* Top Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-outline-variant dark:border-outline">
            <div>
              <h1 className="text-h1 font-h1 text-on-background dark:text-inverse-on-surface flex items-center gap-3">
                <MdShoppingBag className="text-primary" size={32} />
                Quản lý đơn hàng
              </h1>
              <p className="text-body-md text-on-surface-variant dark:text-surface-variant mt-1">
                Xem danh sách, kiểm tra chi tiết và cập nhật trạng thái đơn hàng của hệ thống.
              </p>
            </div>
            <div>
              <button
                onClick={() => fetchOrders(currentPage)}
                className="flex items-center gap-2 px-4 py-2 border border-outline rounded-lg text-on-background hover:bg-surface-container transition font-semibold"
              >
                <MdRefresh size={18} />
                Làm mới
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
            <div className="flex flex-1 gap-3 w-full md:max-w-xl">
              {/* Search */}
              <div className="relative flex-1">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                <input
                  type="text"
                  placeholder="Tìm theo Mã đơn, Email hoặc Tên khách..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                />
              </div>
              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none cursor-pointer focus:border-primary transition"
              >
                {STATUS_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Orders Table */}
          {loading ? (
            <p className="text-center py-10 text-body-md text-on-surface-variant animate-pulse">Đang tải danh sách đơn hàng...</p>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-10 bg-surface-container-lowest border border-outline-variant rounded-xl">
              <p className="text-body-md text-on-surface-variant">Không tìm thấy đơn hàng nào.</p>
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-container border-b border-outline-variant">
                    <tr>
                      <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Mã đơn</th>
                      <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Ngày đặt</th>
                      <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Khách hàng</th>
                      <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Thanh toán</th>
                      <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Tổng tiền</th>
                      <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Trạng thái</th>
                      <th className="px-6 py-4 text-center text-label-md font-label-md text-on-surface-variant">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => {
                      const statusInfo = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
                      const totalAmount = parseFloat(o.total_amount?.toString() || "0");
                      const custName = o.user_id ? `${o.user_id.first_name || ""} ${o.user_id.last_name || ""}`.trim() || o.user_id.email : "Khách vãng lai";

                      return (
                        <tr key={o._id} className="border-b border-outline-variant hover:bg-surface-container/30 transition">
                          <td className="px-6 py-4 font-semibold text-body-md">
                            <button
                              onClick={() => {
                                setSelectedOrder(o);
                                setDetailModalOpen(true);
                              }}
                              className="text-primary hover:text-primary/80 hover:underline outline-none font-semibold text-left"
                            >
                              #{o._id?.slice(-8).toUpperCase()}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-body-md text-on-surface-variant">
                            {formatDate(o.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-body-md font-semibold text-on-surface">{custName}</div>
                            <div className="text-body-sm text-on-surface-variant">{o.user_id?.email || ""}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-body-md text-on-surface capitalize">{o.payment_method?.replace(/_/g, " ")}</div>
                            <div className="text-body-sm text-on-surface-variant capitalize">{o.payment_status || "pending"}</div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-body-md text-primary">
                            ${totalAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                              className={`px-3 py-1.5 rounded-full text-body-sm font-semibold border-none cursor-pointer outline-none ${statusInfo.bg} ${statusInfo.color}`}
                            >
                              <option value="pending">Chờ xác nhận</option>
                              <option value="processing">Đang xử lý</option>
                              <option value="shipped">Đang giao</option>
                              <option value="delivered">Đã giao</option>
                              <option value="cancelled">Đã hủy</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedOrder(o);
                                setDetailModalOpen(true);
                              }}
                              className="px-4 py-1.5 bg-primary/10 text-primary font-semibold text-body-sm rounded-lg hover:bg-primary/20 transition"
                            >
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-outline-variant p-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-outline-variant rounded-lg text-body-sm font-semibold hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Trước
                  </button>
                  <span className="text-body-sm text-on-surface-variant font-semibold">Trang {currentPage} / {totalPages}</span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-outline-variant rounded-lg text-body-sm font-semibold hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Detail Modal */}
        {detailModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-3xl shadow-lg flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-outline-variant">
                <div>
                  <h2 className="text-h2 font-h2 text-on-surface font-bold">
                    Chi tiết đơn hàng #{selectedOrder._id?.toUpperCase()}
                  </h2>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    Đặt ngày {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    setSelectedOrder(null);
                  }}
                  className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant transition"
                >
                  <MdClose size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-surface-container/30 border border-outline-variant rounded-xl p-4">
                    <h3 className="font-semibold text-body-md text-on-surface mb-3 border-b border-outline-variant pb-2">
                      Thông tin khách hàng
                    </h3>
                    <div className="space-y-1 text-body-sm text-on-surface-variant">
                      <p><span className="font-semibold text-on-surface">Họ tên:</span> {selectedOrder.user_id ? `${selectedOrder.user_id.first_name || ""} ${selectedOrder.user_id.last_name || ""}` : "N/A"}</p>
                      <p><span className="font-semibold text-on-surface">Email:</span> {selectedOrder.user_id?.email || "N/A"}</p>
                      <p><span className="font-semibold text-on-surface">Điện thoại đặt:</span> {selectedOrder.phone || "N/A"}</p>
                      <p><span className="font-semibold text-on-surface">Điện thoại tài khoản:</span> {selectedOrder.user_id?.phone || "N/A"}</p>
                      <p className="line-clamp-2"><span className="font-semibold text-on-surface">Địa chỉ giao hàng:</span> {selectedOrder.shipping_address || "N/A"}</p>
                    </div>
                  </div>

                  <div className="bg-surface-container/30 border border-outline-variant rounded-xl p-4">
                    <h3 className="font-semibold text-body-md text-on-surface mb-3 border-b border-outline-variant pb-2">
                      Thông tin giao dịch
                    </h3>
                    <div className="space-y-1 text-body-sm text-on-surface-variant">
                      <p><span className="font-semibold text-on-surface">Phương thức:</span> <span className="capitalize">{selectedOrder.payment_method?.replace(/_/g, " ")}</span></p>
                      <p><span className="font-semibold text-on-surface">Thanh toán:</span> <span className="capitalize">{selectedOrder.payment_status || "pending"}</span></p>
                      <p><span className="font-semibold text-on-surface">Tổng tiền:</span> <span className="text-primary font-semibold">${parseFloat(selectedOrder.total_amount?.toString() || "0").toFixed(2)}</span></p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-semibold text-on-surface">Trạng thái đơn:</span>
                        <select
                          value={selectedOrder.status}
                          onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-body-sm font-semibold border-none cursor-pointer outline-none ${STATUS_CONFIG[selectedOrder.status]?.bg} ${STATUS_CONFIG[selectedOrder.status]?.color}`}
                        >
                          <option value="pending">Chờ xác nhận</option>
                          <option value="processing">Đang xử lý</option>
                          <option value="shipped">Đang giao</option>
                          <option value="delivered">Đã giao</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <h3 className="font-semibold text-body-md text-on-surface mb-3">Sản phẩm đặt mua</h3>
                  <div className="border border-outline-variant rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-surface-container">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-label-md font-label-md text-on-surface-variant">Hình ảnh</th>
                          <th className="px-4 py-2.5 text-left text-label-md font-label-md text-on-surface-variant">Tên sản phẩm</th>
                          <th className="px-4 py-2.5 text-right text-label-md font-label-md text-on-surface-variant">Đơn giá</th>
                          <th className="px-4 py-2.5 text-center text-label-md font-label-md text-on-surface-variant">Số lượng</th>
                          <th className="px-4 py-2.5 text-right text-label-md font-label-md text-on-surface-variant">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item, idx) => {
                          const price = parseFloat(item.price?.toString() || "0");
                          const qty = item.quantity || 0;
                          return (
                            <tr key={item._id || idx} className="border-b border-outline-variant hover:bg-surface-container/20 transition">
                              <td className="px-4 py-2.5">
                                <img
                                  src={item.product_id?.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=60"}
                                  alt={item.product_id?.name || ""}
                                  className="w-10 h-10 rounded object-cover border border-outline-variant"
                                />
                              </td>
                              <td className="px-4 py-2.5 text-body-sm font-semibold text-on-surface">
                                {item.product_id?.name || "Sản phẩm đã bị xóa"}
                              </td>
                              <td className="px-4 py-2.5 text-right text-body-sm text-on-surface-variant">
                                ${price.toFixed(2)}
                              </td>
                              <td className="px-4 py-2.5 text-center text-body-sm text-on-surface font-semibold">
                                {qty}
                              </td>
                              <td className="px-4 py-2.5 text-right text-body-sm font-semibold text-primary">
                                ${(price * qty).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Lịch sử đơn hàng của khách hàng */}
                {isAdmin && (
                  <div className="mt-6 border-t border-outline-variant pt-6">
                    <h3 className="font-semibold text-body-md text-on-surface mb-3">
                      Lịch sử đơn hàng của khách hàng ({customerOrderHistory.length} đơn khác)
                    </h3>
                    {loadingHistory ? (
                      <p className="text-body-sm text-on-surface-variant animate-pulse">Đang tải lịch sử đơn hàng...</p>
                    ) : customerOrderHistory.length === 0 ? (
                      <p className="text-body-sm text-on-surface-variant italic">Không có đơn hàng nào khác từ khách hàng này.</p>
                    ) : (
                      <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface-container/10 max-h-48 overflow-y-auto">
                        <table className="w-full text-left text-body-sm border-collapse">
                          <thead className="bg-surface-container border-b border-outline-variant sticky top-0">
                            <tr>
                              <th className="px-4 py-2.5 text-label-sm font-label-sm text-on-surface-variant">Mã đơn</th>
                              <th className="px-4 py-2.5 text-label-sm font-label-sm text-on-surface-variant">Ngày đặt</th>
                              <th className="px-4 py-2.5 text-label-sm font-label-sm text-on-surface-variant">Tổng tiền</th>
                              <th className="px-4 py-2.5 text-label-sm font-label-sm text-on-surface-variant">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerOrderHistory.map((histOrder) => {
                              const statusInfo = STATUS_CONFIG[histOrder.status] || STATUS_CONFIG.pending;
                              return (
                                <tr key={histOrder._id} className="border-b border-outline-variant last:border-none hover:bg-surface-container/20 transition">
                                  <td className="px-4 py-2.5 font-semibold">
                                    <button
                                      onClick={() => setSelectedOrder(histOrder)}
                                      className="text-primary hover:underline text-left outline-none font-semibold"
                                    >
                                      #{histOrder._id?.slice(-8).toUpperCase()}
                                    </button>
                                  </td>
                                  <td className="px-4 py-2.5 text-on-surface-variant">
                                    {formatDate(histOrder.createdAt)}
                                  </td>
                                  <td className="px-4 py-2.5 font-semibold">
                                    ${parseFloat(histOrder.total_amount?.toString() || "0").toFixed(2)}
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                                      {statusInfo.label}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-outline-variant">
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    setSelectedOrder(null);
                  }}
                  className="px-5 py-2 bg-primary text-surface rounded-lg hover:bg-primary/90 transition font-semibold shadow-sm"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Customer View (existing layout)
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
              onClick={() => fetchOrders(currentPage)}
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

        {!loading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

