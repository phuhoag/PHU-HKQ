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
} from "react-icons/md";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

  const fetchCustomerOrders = async (token) => {
    setLoadingOrders(true);
    try {
      const response = await fetch("/api/orders/my-orders?limit=5", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      if (res.success) {
        setOrders(res.data.orders || []);
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
        fetchCustomerOrders(token);
      }
    } catch {
      navigate("/login");
    }
  }, [navigate]);

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
      setProfileMsg({ type: "error", text: "❌ Lỗi: " + err.message });
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
      setPwdMsg({ type: "error", text: "❌ Mật khẩu mới phải dài ít nhất 6 ký tự" });
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
        setPwdMsg({ type: "success", text: "✅ Đổi mật khẩu thành công!" });
        setPasswords({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      } else {
        setPwdMsg({ type: "error", text: "❌ " + (res.message || "Đổi mật khẩu thất bại") });
      }
    } catch (err) {
      setPwdMsg({ type: "error", text: "❌ Lỗi: " + err.message });
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation1 = window.confirm("⚠️ CẢNH BÁO QUAN TRỌNG: Bạn có chắc chắn muốn xóa tài khoản này?");
    if (!confirmation1) return;

    const confirmation2 = window.confirm("Tài khoản của bạn sẽ bị vô hiệu hóa và bạn sẽ bị đăng xuất ngay lập tức. Xác nhận xóa?");
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
        alert("✅ Tài khoản của bạn đã được vô hiệu hóa thành công. Nhấn OK để đăng xuất.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        const res = await response.json();
        alert("❌ " + (res.message || "Xóa tài khoản thất bại"));
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
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
            date: new Date(o.createdAt).toLocaleDateString("vi-VN"),
            icon: MdShoppingCart,
            color: "text-primary",
            bgColor: "bg-primary/10",
          });
        });

        setRecentActivities(activities.slice(0, 5));
      } else {
        setAdminError(analyticsData.message || ordersData.message || "Không thể tải dữ liệu quản trị viên");
      }
    } catch (err) {
      setAdminError("Lỗi kết nối đến máy chủ: " + err.message);
    } finally {
      setLoadingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-64 p-8 min-h-screen">
        {isAdmin ? (
          <>
            {/* Top Bar with Title and Buttons */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-h1 font-h1 text-on-background">
                  Dashboard Overview
                </h1>
                <p className="text-body-md text-on-surface-variant mt-1">
                  Welcome back{currentUser?.first_name ? `, ${currentUser.first_name}` : ""}! Your store is performing well.
                </p>
              </div>
              <div className="flex space-x-3 items-center">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2 text-body-md font-body-md border border-outline rounded-lg text-on-background hover:bg-surface-container transition"
                >
                  <MdArrowBack size={18} />
                  Quay lại trang web
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
                <p className="text-body-md text-on-surface-variant animate-pulse">Đang tải dữ liệu tổng quan...</p>
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
                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
                    <h3 className="text-h3 font-h3 text-on-background mb-4">
                      Số liệu nhanh
                    </h3>
                    <div className="space-y-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="text-body-sm text-on-surface-variant">
                          Doanh thu thực tế
                        </p>
                        <p className="text-h2 font-h2 text-primary">
                          ${adminStats?.totalRevenue?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                        </p>
                      </div>
                      <div className="p-3 bg-success/10 rounded-lg">
                        <p className="text-body-sm text-on-surface-variant">
                          Thành viên hoạt động
                        </p>
                        <p className="text-h2 font-h2 text-success">
                          {adminStats?.activeUsers || "0"} / {adminStats?.totalUsers || "0"}
                        </p>
                      </div>
                      <div className="p-3 bg-warning/10 rounded-lg">
                        <p className="text-body-sm text-on-surface-variant">
                          Đơn hàng thành công
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
                  Tài khoản của tôi
                </h1>
                <p className="text-body-md text-on-surface-variant mt-1">
                  Quản lý thông tin cá nhân, mật khẩu và xem lịch sử đơn hàng.
                </p>
              </div>
              <div>
                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2 text-body-md font-body-md border border-outline rounded-lg text-on-background hover:bg-surface-container transition"
                >
                  <MdArrowBack size={18} />
                  Quay lại trang web
                </Link>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-surface-container border border-outline-variant rounded-xl p-5 shadow-sm">
                <p className="text-body-sm text-on-surface-variant mb-1">Mã khách hàng</p>
                <p className="text-h3 font-h3 text-on-surface">#{currentUser?.id?.slice(-8).toUpperCase()}</p>
              </div>
              <div className="bg-surface-container border border-outline-variant rounded-xl p-5 shadow-sm">
                <p className="text-body-sm text-on-surface-variant mb-1">Tổng số đơn hàng</p>
                <p className="text-h3 font-h3 text-primary">{orders.length} đơn hàng</p>
              </div>
              <div className="bg-surface-container border border-outline-variant rounded-xl p-5 shadow-sm">
                <p className="text-body-sm text-on-surface-variant mb-1">Trạng thái tài khoản</p>
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
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-3 px-4 text-body-md font-semibold border-b-2 transition-all ${
                  activeTab === "orders"
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Đơn hàng gần đây
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`py-3 px-4 text-body-md font-semibold border-b-2 transition-all ${
                  activeTab === "password"
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Đổi mật khẩu
              </button>
              <button
                onClick={() => setActiveTab("danger")}
                className={`py-3 px-4 text-body-md font-semibold border-b-2 transition-all ${
                  activeTab === "danger"
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Xóa tài khoản
              </button>
            </div>

            {/* Tab Contents */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-h2 font-h2 text-on-surface mb-6 font-bold">Thông tin cá nhân</h2>
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
                    <p className="text-body-md text-on-surface-variant">Đang tải...</p>
                  ) : (
                    <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">Họ</label>
                          <input
                            type="text"
                            value={profile.last_name || ""}
                            onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface hover:border-primary focus:border-primary outline-none transition"
                          />
                        </div>
                        <div>
                          <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">Tên</label>
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
                        <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">Số điện thoại</label>
                        <input
                          type="text"
                          value={profile.phone || ""}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface hover:border-primary focus:border-primary outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">Địa chỉ</label>
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
                        Lưu thay đổi
                      </button>
                    </form>
                  )}
                </div>
              )}

              {activeTab === "orders" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-h2 font-h2 text-on-surface font-bold">Đơn hàng gần đây</h2>
                    <Link to="/orders" className="text-primary hover:underline font-semibold text-body-md">
                      Xem tất cả đơn hàng →
                    </Link>
                  </div>
                  {loadingOrders ? (
                    <p className="text-body-md text-on-surface-variant">Đang tải...</p>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-body-md text-on-surface-variant">Bạn chưa thực hiện đơn hàng nào.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-outline-variant rounded-xl">
                      <table className="w-full">
                        <thead className="bg-surface-container border-b border-outline-variant">
                          <tr>
                            <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Mã đơn</th>
                            <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Ngày đặt</th>
                            <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Phương thức</th>
                            <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Tổng tiền</th>
                            <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Trạng thái</th>
                            <th className="px-6 py-4 text-center text-label-md font-label-md text-on-surface-variant">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => {
                            const orderStatus = order.status || "pending";
                            return (
                              <tr key={order._id} className="border-b border-outline-variant hover:bg-surface-container/30 transition">
                                <td className="px-6 py-4 text-body-md font-semibold text-primary">
                                  #{order._id?.slice(-8).toUpperCase()}
                                </td>
                                <td className="px-6 py-4 text-body-md text-on-background">
                                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                                </td>
                                <td className="px-6 py-4 text-body-md text-on-surface-variant capitalize">
                                  {order.payment_method?.replace(/_/g, " ")}
                                </td>
                                <td className="px-6 py-4 text-body-md font-semibold text-on-background">
                                  ${parseFloat(order.total_amount?.toString() || "0").toFixed(2)}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2.5 py-1 rounded text-body-sm font-semibold ${
                                    orderStatus === "delivered" ? "bg-success/10 text-success" :
                                    orderStatus === "cancelled" ? "bg-error/10 text-error" :
                                    "bg-warning/10 text-warning"
                                  }`}>
                                    {orderStatus === "delivered" ? "Đã giao" :
                                     orderStatus === "cancelled" ? "Đã hủy" : "Chờ xử lý"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <Link
                                    to={`/orders/${order._id}`}
                                    className="inline-block px-4 py-1.5 bg-primary/10 text-primary font-semibold text-body-sm rounded-lg hover:bg-primary/20 transition"
                                  >
                                    Chi tiết
                                  </Link>
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

              {activeTab === "password" && (
                <div>
                  <h2 className="text-h2 font-h2 text-on-surface mb-6 font-bold">Đổi mật khẩu</h2>
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
                      <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        required
                        value={passwords.currentPassword}
                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface hover:border-primary focus:border-primary outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">Mật khẩu mới</label>
                      <input
                        type="password"
                        required
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface hover:border-primary focus:border-primary outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">Xác nhận mật khẩu mới</label>
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
                      Cập nhật mật khẩu
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "danger" && (
                <div>
                  <h2 className="text-h2 font-h2 text-error mb-4 font-bold">Vùng nguy hiểm</h2>
                  <p className="text-body-md text-on-surface-variant mb-6">
                    Hành động này sẽ vô hiệu hóa hoàn toàn tài khoản của bạn trên hệ thống. 
                    Tất cả thông tin tài khoản và lịch sử giao dịch sẽ được khóa và bạn sẽ bị đăng xuất ngay lập tức.
                  </p>
                  <div className="p-4 bg-error/5 border border-error/20 rounded-xl max-w-xl">
                    <h4 className="text-body-md font-semibold text-error mb-2">Bạn chắc chắn chứ?</h4>
                    <p className="text-body-sm text-on-surface-variant mb-4">
                      Bạn không thể tự khôi phục lại tài khoản này sau khi đã thực hiện yêu cầu xóa.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-6 py-2.5 bg-error text-surface font-semibold rounded-lg hover:bg-error-container hover:text-on-error-container transition shadow-sm animate-pulse"
                    >
                      Vô hiệu hóa tài khoản của tôi
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
