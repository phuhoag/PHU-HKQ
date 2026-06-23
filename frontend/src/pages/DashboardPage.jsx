import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import DashboardStats from "../components/dashboard/DashboardStats.jsx";
import SalesAnalytics from "../components/dashboard/SalesAnalytics.jsx";
import RecentActivity from "../components/dashboard/RecentActivity.jsx";
import OrderHistory from "../components/dashboard/OrderHistory.jsx";
import {
  MdPeople,
  MdWarning,
  MdTrendingUp,
  MdShoppingCart,
  MdArrowBack,
  MdClose,
  MdHourglassEmpty,
  MdLocalShipping,
  MdCheckCircle,
  MdCancel,
  MdInventory,
  MdRefresh,
} from "react-icons/md";
import { orderService } from "../services/orderService.js";
import { useLanguage } from "../context/LanguageContext.jsx";

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
    label: "Đang giao",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    icon: MdLocalShipping,
  },
  delivered: {
    label: "Đã giao",
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

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

  // Admin state
  const [adminStats, setAdminStats] = useState(null);
  const [monthlySales, setMonthlySales] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [adminError, setAdminError] = useState(null);

  // Customer states
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [orders, setOrders] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [pwdMsg, setPwdMsg] = useState({ type: "", text: "" });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [currentPageOrders, setCurrentPageOrders] = useState(1);
  const [totalPagesOrders, setTotalPagesOrders] = useState(1);
  const [statusFilterOrders, setStatusFilterOrders] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchCustomerProfile = async (token) => {
    setLoadingProfile(true);
    try {
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      if (res.success) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchCustomerOrders = async (token, page = 1, status = "") => {
    setLoadingOrders(true);
    try {
      let url = `/api/orders/my-orders?page=${page}&limit=5`;
      if (status) {
        url += `&status=${status}`;
      }
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      if (res.success) {
        setOrders(res.data.orders || []);
        setTotalPagesOrders(res.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

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

      if (userData.role === "admin") {
        setIsAdmin(true);
        fetchAdminData(token);
      } else {
        setIsAdmin(false);
        fetchCustomerProfile(token);
        fetchCustomerOrders(token, currentPageOrders, statusFilterOrders);
      }
    } catch {
      navigate("/login");
    }
  }, [navigate, currentPageOrders, statusFilterOrders]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          address: profile.address,
        }),
      });
      const res = await response.json();
      if (response.ok) {
        setProfileMsg({ type: "success", text: "✅ Cập nhật thông tin thành công!" });
        const userString = localStorage.getItem("user");
        if (userString) {
          const u = JSON.parse(userString);
          u.first_name = profile.first_name;
          u.last_name = profile.last_name;
          u.phone = profile.phone;
          u.address = profile.address;
          u.full_name = `${profile.first_name} ${profile.last_name}`;
          localStorage.setItem("user", JSON.stringify(u));
          setCurrentUser(u);
        }
      } else {
        setProfileMsg({ type: "error", text: "❌ " + (res.message || "Cập nhật thất bại") });
      }
    } catch (err) {
      setProfileMsg({ type: "error", text: "❌ " + t("dashboard.changePasswordFail") + ": " + err.message });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: "", text: "" });

    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setPwdMsg({ type: "error", text: "❌ Mật khẩu mới và xác nhận mật khẩu không khớp" });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setPwdMsg({ type: "error", text: t("dashboard.passwordLengthError") });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const res = await response.json();
      if (response.ok) {
        setPwdMsg({ type: "success", text: t("dashboard.changePasswordSuccess") });
        setPasswords({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      } else {
        setPwdMsg({ type: "error", text: "❌ " + (res.message || t("dashboard.changePasswordFail")) });
      }
    } catch (err) {
      setPwdMsg({ type: "error", text: "❌ " + t("dashboard.changePasswordFail") + ": " + err.message });
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation1 = window.confirm(t("dashboard.confirmDeactivate1"));
    if (!confirmation1) return;

    const confirmation2 = window.confirm(t("dashboard.confirmDeactivate2"));
    if (!confirmation2) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert(t("dashboard.deactivateSuccess"));
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        const res = await response.json();
        alert("❌ " + (res.message || t("dashboard.deactivateFail")));
      }
    } catch (err) {
      alert(t("dashboard.deactivateFail") + ": " + err.message);
    }
  };

  const handleViewOrderDetail = async (orderId) => {
    try {
      const res = await orderService.getOrderById(orderId);
      if (res.success) {
        setSelectedOrder(res.data);
        setDetailModalOpen(true);
      } else {
        alert(t("dashboard.loadOrderDetailFail") + res.message);
      }
    } catch (err) {
      alert(t("dashboard.connError") + err.message);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(t("dashboard.confirmCancelOrder"))) return;
    try {
      const res = await orderService.cancelOrder(orderId);
      if (res.success) {
        alert(t("dashboard.cancelOrderSuccess"));
        const token = localStorage.getItem("token");
        fetchCustomerOrders(token, currentPageOrders, statusFilterOrders);
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status: "cancelled" }));
        }
      } else {
        alert(t("dashboard.cancelOrderFail") + res.message);
      }
    } catch (err) {
      alert(t("dashboard.deactivateFail") + ": " + err.message);
    }
  };

  const fetchAdminData = async (token) => {
    setLoadingAdmin(true);
    setAdminError(null);
    try {
      // 1. Fetch analytics summary & monthly sales
      const analyticsRes = await fetch("/api/admin/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const analyticsData = await analyticsRes.json();

      // 2. Fetch 5 recent orders
      const ordersRes = await fetch("/api/orders/admin/all?limit=5", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const ordersData = await ordersRes.json();

      if (analyticsRes.ok && ordersRes.ok) {
        const summary = analyticsData.data?.summary || {};
        const mSales = analyticsData.data?.monthlySales || [];
        const rOrders = ordersData.data?.orders || [];

        // Calculate conversion rate: (totalOrders / totalUsers) * 100
        const totalUsers = summary.totalUsers || 0;
        const totalOrders = summary.totalOrders || 0;
        const convRate = totalUsers > 0 ? ((totalOrders / totalUsers) * 100).toFixed(2) : "0.00";

        setAdminStats({
          totalRevenue: summary.totalRevenue || 0,
          totalOrders: summary.totalOrders || 0,
          completedOrders: summary.completedOrders || 0,
          totalUsers: summary.totalUsers || 0,
          activeUsers: summary.activeUsers || 0,
          conversionRate: convRate,
        });

        setMonthlySales(mSales);
        setRecentOrders(rOrders);

        // 3. Generate dynamic activities based on recent orders
        const activities = [];
        rOrders.forEach((o, index) => {
          const custName = `${o.user_id?.first_name || ""} ${o.user_id?.last_name || ""}`.trim() || "Khách hàng";
          activities.push({
            id: `order-${o._id}-${index}`,
            title: `Đơn hàng mới #${o._id?.slice(-8).toUpperCase()} từ ${custName}`,
            detail: `Tổng thanh toán: $${parseFloat(o.total_amount || 0).toFixed(2)} (${o.payment_method?.replace(/_/g, " ").toUpperCase()})`,
            date: new Date(o.createdAt).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US"),
            icon: MdShoppingCart,
            color: "text-primary",
            bgColor: "bg-primary/10",
          });
        });

        setRecentActivities(activities.slice(0, 5));
      } else {
        setAdminError(analyticsData.message || ordersData.message || t("dashboard.loadAdminDataFail"));
      }
    } catch (err) {
      setAdminError(t("dashboard.connServerFail") + err.message);
    } finally {
      setLoadingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-inverse-surface text-on-background dark:text-inverse-on-surface transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-64 p-8 min-h-screen">
        {isAdmin ? (
          <>
            {/* Top Bar with Title and Buttons */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-h1 font-h1 text-on-background dark:text-inverse-on-surface">
                  Dashboard Overview
                </h1>
                <p className="text-body-md text-on-surface-variant dark:text-surface-variant mt-1">
                  Welcome back{currentUser?.first_name ? `, ${currentUser.first_name}` : ""}! Your store is performing well.
                </p>
              </div>
              <div className="flex space-x-3 items-center">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2 text-body-md font-body-md border border-outline rounded-lg text-on-background hover:bg-surface-container transition"
                >
                  <MdArrowBack size={18} />
                  {t("dashboard.backToWebsite")}
                </Link>
                <button className="px-4 py-2 text-body-md font-body-md border border-outline rounded-lg text-on-background hover:bg-surface-container transition">
                  Last 30 Days
                </button>
                <button className="px-4 py-2 text-body-md font-body-md bg-primary text-surface rounded-lg hover:bg-primary/90 transition">
                  + New Product
                </button>
              </div>
            </div>

            {adminError && (
              <div className="mb-6 p-4 bg-error/10 text-error border border-error/20 rounded-lg">
                {adminError}
              </div>
            )}

            {loadingAdmin ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-body-md text-on-surface-variant animate-pulse">{t("dashboard.loadingOverview")}</p>
              </div>
            ) : (
              <>
                {/* Statistics Cards */}
                <div className="mb-8">
                  <DashboardStats statsData={adminStats} />
                </div>

                {/* Sales Analytics Chart */}
                <SalesAnalytics monthlySales={monthlySales} />

                {/* Bottom Section - Recent Activities and Quick Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Activities - Left Column */}
                  <div className="lg:col-span-2">
                    <RecentActivity activities={recentActivities} />
                  </div>

                  {/* Quick Stats - Right Column */}
                  <div className="bg-surface-container-lowest dark:bg-on-secondary-fixed-variant/20 rounded-xl border border-outline-variant dark:border-outline p-6">
                    <h3 className="text-h3 font-h3 text-on-background dark:text-inverse-on-surface mb-4">
                      {t("dashboard.quickStats")}
                    </h3>
                    <div className="space-y-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="text-body-sm text-on-surface-variant dark:text-surface-variant">
                          {t("dashboard.revenue")}
                        </p>
                        <p className="text-h2 font-h2 text-primary">
                          ${adminStats?.totalRevenue?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                        </p>
                      </div>
                      <div className="p-3 bg-success/10 rounded-lg">
                        <p className="text-body-sm text-on-surface-variant dark:text-surface-variant">
                          {t("dashboard.activeMembers")}
                        </p>
                        <p className="text-h2 font-h2 text-success">
                          {adminStats?.activeUsers || "0"} / {adminStats?.totalUsers || "0"}
                        </p>
                      </div>
                      <div className="p-3 bg-warning/10 rounded-lg">
                        <p className="text-body-sm text-on-surface-variant dark:text-surface-variant">
                          {t("dashboard.successfulOrders")}
                        </p>
                        <p className="text-h2 font-h2 text-warning">
                          {adminStats?.completedOrders || "0"} / {adminStats?.totalOrders || "0"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order History Table */}
                <div className="mt-8">
                  <OrderHistory orders={recentOrders} />
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-8 border-b border-outline-variant pb-6">
              <div>
                <h1 className="text-h1 font-h1 text-on-background">
                  {t("dashboard.myAccount")}
                </h1>
                <p className="text-body-md text-on-surface-variant mt-1">
                  {t("dashboard.accountDesc")}
                </p>
              </div>
              <div>
                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2 text-body-md font-body-md border border-outline rounded-lg text-on-background hover:bg-surface-container transition"
                >
                  <MdArrowBack size={18} />
                  {t("dashboard.backToWebsite")}
                </Link>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-surface-container border border-outline-variant rounded-xl p-5 shadow-sm">
                <p className="text-body-sm text-on-surface-variant mb-1">{t("dashboard.customerId")}</p>
                <p className="text-h3 font-h3 text-on-surface">#{currentUser?.id?.slice(-8).toUpperCase()}</p>
              </div>
              <div className="bg-surface-container border border-outline-variant rounded-xl p-5 shadow-sm">
                <p className="text-body-sm text-on-surface-variant mb-1">{t("dashboard.totalOrders")}</p>
                <p className="text-h3 font-h3 text-primary">{orders.length} {t("dashboard.orderCount")}</p>
              </div>
              <div className="bg-surface-container border border-outline-variant rounded-xl p-5 shadow-sm">
                <p className="text-body-sm text-on-surface-variant mb-1">{t("dashboard.accountStatus")}</p>
                <span className="inline-block mt-1 px-3 py-1 rounded bg-success/10 text-success text-body-sm font-semibold">Active</span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-outline-variant mb-8 gap-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-3 px-4 text-body-md font-semibold border-b-2 transition-all ${
                  activeTab === "profile"
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t("dashboard.profileTitle")}
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-3 px-4 text-body-md font-semibold border-b-2 transition-all ${
                  activeTab === "orders"
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t("dashboard.orderHistoryTitle")}
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`py-3 px-4 text-body-md font-semibold border-b-2 transition-all ${
                  activeTab === "password"
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t("dashboard.changePasswordTitle")}
              </button>
              <button
                onClick={() => setActiveTab("danger")}
                className={`py-3 px-4 text-body-md font-semibold border-b-2 transition-all ${
                  activeTab === "danger"
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t("dashboard.dangerZoneTitle")}
              </button>
            </div>

            {/* Tab Contents */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-h2 font-h2 text-on-surface mb-6 font-bold">{t("dashboard.profileTitle")}</h2>
                  {profileMsg.text && (
                    <div className={`p-4 mb-6 rounded-lg text-body-md border ${
                      profileMsg.type === "success" 
                        ? "bg-success/10 text-success border-success/20" 
                        : "bg-error/10 text-error border-error/20"
                    }`}>
                      {profileMsg.text}
                    </div>
                  )}
                  {loadingProfile ? (
                    <p className="text-body-md text-on-surface-variant">{t("dashboard.loading")}</p>
                  ) : (
                    <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("dashboard.lastName")}</label>
                          <input
                            type="text"
                            value={profile.last_name || ""}
                            onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface hover:border-primary focus:border-primary outline-none transition"
                          />
                        </div>
                        <div>
                          <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("dashboard.firstName")}</label>
                          <input
                            type="text"
                            value={profile.first_name || ""}
                            onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface hover:border-primary focus:border-primary outline-none transition"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">Email</label>
                        <input
                          type="email"
                          value={profile.email || ""}
                          disabled
                          className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-body-md text-on-surface-variant opacity-60 outline-none cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("dashboard.phone")}</label>
                        <input
                          type="text"
                          value={profile.phone || ""}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface hover:border-primary focus:border-primary outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("dashboard.address")}</label>
                        <textarea
                          value={profile.address || ""}
                          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface hover:border-primary focus:border-primary outline-none transition resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-primary text-surface font-semibold rounded-lg hover:bg-primary/90 transition shadow-sm"
                      >
                        {t("dashboard.saveChanges")}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {activeTab === "orders" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-h2 font-h2 text-on-surface font-bold">{t("dashboard.orderHistoryTitle")}</h2>
                    <button
                      onClick={() => {
                        const token = localStorage.getItem("token");
                        fetchCustomerOrders(token, currentPageOrders, statusFilterOrders);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 border border-outline rounded-lg text-on-surface-variant hover:border-primary hover:text-primary transition font-semibold"
                    >
                      <MdRefresh size={18} />
                      <span className="text-body-sm">{t("dashboard.refresh")}</span>
                    </button>
                  </div>

                  {/* Status Filters */}
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                    {STATUS_FILTERS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => {
                          setStatusFilterOrders(f.value);
                          setCurrentPageOrders(1);
                        }}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-body-sm font-semibold transition-all ${
                          statusFilterOrders === f.value
                            ? "bg-primary text-surface shadow-md"
                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {loadingOrders ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-body-md text-on-surface-variant animate-pulse">{t("dashboard.loadingOrders")}</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-10 bg-surface-container border border-outline-variant rounded-xl">
                      <p className="text-body-md text-on-surface-variant">
                        {statusFilterOrders ? t("dashboard.noOrdersFiltered") : t("dashboard.noOrdersYet")}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto border border-outline-variant rounded-xl">
                        <table className="w-full">
                          <thead className="bg-surface-container border-b border-outline-variant">
                            <tr>
                              <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">{t("dashboard.tableOrderCode")}</th>
                              <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">{t("dashboard.tableOrderDate")}</th>
                              <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">{t("dashboard.tableProducts")}</th>
                              <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">{t("dashboard.tableTotal")}</th>
                              <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">{t("dashboard.tableStatus")}</th>
                              <th className="px-6 py-4 text-center text-label-md font-label-md text-on-surface-variant">{t("dashboard.tableActions")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map((order) => {
                              const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                              const statusLabel = getStatusLabel(order.status);
                              const StatusIcon = statusInfo.icon;
                              
                              const productsListStr = order.items && order.items.length > 0
                                ? order.items.map((i) => `${i.product_id?.name || t("dashboard.tableProducts")} (x${i.quantity})`).join(", ")
                                : t("dashboard.noDetails");

                              return (
                                <tr key={order._id} className="border-b border-outline-variant hover:bg-surface-container/30 transition">
                                  <td className="px-6 py-4 text-body-md font-semibold text-primary">
                                    #{order._id?.slice(-8).toUpperCase()}
                                  </td>
                                  <td className="px-6 py-4 text-body-md text-on-background">
                                    {new Date(order.createdAt).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US")}
                                  </td>
                                  <td className="px-6 py-4 text-body-md text-on-surface-variant max-w-xs truncate" title={productsListStr}>
                                    {productsListStr}
                                  </td>
                                  <td className="px-6 py-4 text-body-md font-semibold text-on-background">
                                    ${parseFloat(order.total_amount?.toString() || "0").toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-body-sm font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                                      <StatusIcon size={14} />
                                      {statusLabel}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        onClick={() => handleViewOrderDetail(order._id)}
                                        className="px-4 py-1.5 bg-primary/10 text-primary font-semibold text-body-sm rounded-lg hover:bg-primary/20 transition"
                                      >
                                        Chi tiết
                                      </button>
                                      {order.status === "pending" && (
                                        <button
                                          onClick={() => handleCancelOrder(order._id)}
                                          className="px-4 py-1.5 bg-error/10 text-error font-semibold text-body-sm rounded-lg hover:bg-error/20 transition"
                                        >
                                          Hủy
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {totalPagesOrders > 1 && (
                        <div className="flex items-center justify-between border-t border-outline-variant p-4 mt-4">
                          <button
                            onClick={() => setCurrentPageOrders(prev => Math.max(prev - 1, 1))}
                            disabled={currentPageOrders === 1}
                            className="px-4 py-2 border border-outline-variant rounded-lg text-body-sm font-semibold hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {t("dashboard.paginationPrev")}
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPagesOrders }, (_, idx) => idx + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => setCurrentPageOrders(page)}
                                className={`w-9 h-9 flex items-center justify-center rounded-lg text-body-sm font-semibold transition-all ${
                                  currentPageOrders === page
                                    ? "bg-primary text-surface shadow-sm"
                                    : "hover:bg-surface-container text-on-surface"
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => setCurrentPageOrders(prev => Math.min(prev + 1, totalPagesOrders))}
                            disabled={currentPageOrders === totalPagesOrders}
                            className="px-4 py-2 border border-outline-variant rounded-lg text-body-sm font-semibold hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {t("dashboard.paginationNext")}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === "password" && (
                <div>
                  <h2 className="text-h2 font-h2 text-on-surface mb-6 font-bold">{t("dashboard.changePasswordTitle")}</h2>
                  {pwdMsg.text && (
                    <div className={`p-4 mb-6 rounded-lg text-body-md border ${
                      pwdMsg.type === "success" 
                        ? "bg-success/10 text-success border-success/20" 
                        : "bg-error/10 text-error border-error/20"
                    }`}>
                      {pwdMsg.text}
                    </div>
                  )}
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
                    <div>
                      <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("dashboard.currentPassword")}</label>
                      <input
                        type="password"
                        required
                        value={passwords.currentPassword}
                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface hover:border-primary focus:border-primary outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("dashboard.newPassword")}</label>
                      <input
                        type="password"
                        required
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface hover:border-primary focus:border-primary outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("dashboard.confirmNewPassword")}</label>
                      <input
                        type="password"
                        required
                        value={passwords.confirmNewPassword}
                        onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface hover:border-primary focus:border-primary outline-none transition"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-primary text-surface font-semibold rounded-lg hover:bg-primary/90 transition shadow-sm"
                    >
                      {t("dashboard.updatePassword")}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "danger" && (
                <div>
                  <h2 className="text-h2 font-h2 text-error mb-4 font-bold">{t("dashboard.dangerZoneTitle")}</h2>
                  <p className="text-body-md text-on-surface-variant mb-6">
                    {t("dashboard.deactivateDesc1")} 
                    {t("dashboard.deactivateDesc2")}
                  </p>
                  <div className="p-4 bg-error/5 border border-error/20 rounded-xl max-w-xl">
                    <h4 className="text-body-md font-semibold text-error mb-2">{t("dashboard.areYouSure")}</h4>
                    <p className="text-body-sm text-on-surface-variant mb-4">
                      {t("dashboard.deactivateWarning")}
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-6 py-2.5 bg-error text-surface font-semibold rounded-lg hover:bg-error-container hover:text-on-error-container transition shadow-sm animate-pulse"
                    >
                      {t("dashboard.deactivateButton")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Customer Order Detail Modal */}
        {detailModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-200">
            <div className="bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform scale-100 transition-all duration-200">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-outline-variant dark:border-outline bg-surface-container/30">
                <div>
                  <h2 className="text-h2 font-h2 text-on-surface font-bold">
                    {t("dashboard.orderDetailTitle")} #{selectedOrder._id?.toUpperCase()}
                  </h2>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    {t("dashboard.orderPlacedOn").replace("{date}", new Date(selectedOrder.createdAt).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US")).replace("{time}", new Date(selectedOrder.createdAt).toLocaleTimeString(language === "vi" ? "vi-VN" : "en-US", { hour: '2-digit', minute: '2-digit' }))}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    setSelectedOrder(null);
                  }}
                  className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant transition"
                >
                  <MdClose size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shipping Details */}
                  <div className="bg-surface-container/20 border border-outline-variant rounded-xl p-5">
                    <h3 className="font-semibold text-body-md text-on-surface mb-3 border-b border-outline-variant pb-2">
                      {t("dashboard.shippingInfo")}
                    </h3>
                    {(() => {
                      const addressParts = selectedOrder.shipping_address?.split(" | ") || [];
                      const recipientName = addressParts[0] || "";
                      const recipientPhone = addressParts[1] || "";
                      const recipientAddr = addressParts[2] || selectedOrder.shipping_address;
                      return (
                        <div className="space-y-2 text-body-sm text-on-surface-variant">
                          <p><span className="font-semibold text-on-surface">{t("dashboard.recipientName")}</span> {recipientName}</p>
                          <p><span className="font-semibold text-on-surface">{t("dashboard.recipientPhone")}</span> {recipientPhone || selectedOrder.phone}</p>
                          <p className="leading-relaxed"><span className="font-semibold text-on-surface">{t("dashboard.recipientAddress")}</span> {recipientAddr}</p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Transaction details */}
                  <div className="bg-surface-container/20 border border-outline-variant rounded-xl p-5">
                    <h3 className="font-semibold text-body-md text-on-surface mb-3 border-b border-outline-variant pb-2">
                      {t("dashboard.paymentInfo")}
                    </h3>
                    <div className="space-y-2 text-body-sm text-on-surface-variant">
                      <p><span className="font-semibold text-on-surface">{t("dashboard.paymentMethod")}</span> <span className="capitalize">{selectedOrder.payment_method?.replace(/_/g, " ")}</span></p>
                      <p><span className="font-semibold text-on-surface">{t("dashboard.paymentStatus")}</span> <span className="capitalize font-semibold">{selectedOrder.payment_status || "pending"}</span></p>
                      <p><span className="font-semibold text-on-surface">{t("dashboard.paymentTotal")}</span> <span className="text-primary font-bold text-body-md">${parseFloat(selectedOrder.total_amount?.toString() || "0").toFixed(2)}</span></p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-semibold text-on-surface">{t("dashboard.orderStatusLabel")}</span>
                        {(() => {
                          const statusInfo = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.pending;
                          const statusLabel = getStatusLabel(selectedOrder.status);
                          const StatusIcon = statusInfo.icon;
                          return (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-body-sm font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                              <StatusIcon size={14} />
                              {statusLabel}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items List Table */}
                <div>
                  <h3 className="font-semibold text-body-md text-on-surface mb-3">{t("dashboard.orderedProducts")}</h3>
                  <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface-container/10">
                    <table className="w-full border-collapse">
                      <thead className="bg-surface-container">
                        <tr>
                          <th className="px-4 py-3 text-left text-label-md font-label-md text-on-surface-variant">{t("dashboard.tableImage")}</th>
                          <th className="px-4 py-3 text-left text-label-md font-label-md text-on-surface-variant">{t("dashboard.tableProducts")}</th>
                          <th className="px-4 py-3 text-right text-label-md font-label-md text-on-surface-variant">{t("dashboard.tableUnitPrice")}</th>
                          <th className="px-4 py-3 text-center text-label-md font-label-md text-on-surface-variant">{t("dashboard.tableQuantity")}</th>
                          <th className="px-4 py-3 text-right text-label-md font-label-md text-on-surface-variant">{t("dashboard.tableSubtotal")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item, idx) => {
                          const price = parseFloat(item.price?.toString() || "0");
                          const qty = item.quantity || 0;
                          return (
                            <tr key={item._id || idx} className="border-b border-outline-variant last:border-none hover:bg-surface-container/20 transition">
                              <td className="px-4 py-3">
                                <img
                                  src={item.product_id?.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=60"}
                                  alt={item.product_id?.name || ""}
                                  className="w-12 h-12 rounded-lg object-cover border border-outline-variant bg-surface"
                                />
                              </td>
                              <td className="px-4 py-3 text-body-sm font-semibold text-on-surface">
                                {item.product_id?.name || t("dashboard.productUnavailable")}
                              </td>
                              <td className="px-4 py-3 text-right text-body-sm text-on-surface-variant">
                                ${price.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-center text-body-sm text-on-surface font-semibold">
                                {qty}
                              </td>
                              <td className="px-4 py-3 text-right text-body-sm font-semibold text-primary">
                                ${(price * qty).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between items-center p-6 border-t border-outline-variant dark:border-outline bg-surface-container/30">
                <div>
                  {selectedOrder.status === "pending" && (
                    <button
                      onClick={() => handleCancelOrder(selectedOrder._id)}
                      className="px-5 py-2.5 bg-error text-surface rounded-xl hover:bg-error/90 transition font-semibold shadow-sm"
                    >
                      {t("dashboard.cancelThisOrder")}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    setSelectedOrder(null);
                  }}
                  className="px-5 py-2.5 bg-primary text-surface rounded-xl hover:bg-primary/90 transition font-semibold shadow-sm"
                >
                  {t("dashboard.close")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
