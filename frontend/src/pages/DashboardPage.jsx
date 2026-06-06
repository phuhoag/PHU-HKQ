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

  // Admin user management state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

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
    setLoadingUsers(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(data.data || []);
        const activeCount = data.data?.filter((u) => u.is_active === true).length;
        setAdminStats({
          totalUsers: data.data?.length || 0,
          activeUsers: activeCount,
          totalOrders: Math.floor(Math.random() * 100) + 10,
          totalRevenue: Math.floor(Math.random() * 50000) + 10000,
        });
      } else {
        setUsersError(data.message || "Failed to fetch users");
      }
    } catch (err) {
      setUsersError("Error fetching users: " + err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
        alert(`✅ Role changed to ${newRole}`);
      } else {
        alert("❌ " + (data.message || "Failed to change role"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleToggleStatus = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(
          users.map((u) => (u._id === userId ? { ...u, is_active: newStatus } : u))
        );
        alert(`✅ User ${newStatus ? "activated" : "deactivated"}`);
      } else {
        alert("❌ " + (data.message || "Failed to update status"));
      }
    } catch (err) {
      alert("Error: " + err.message);
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

            {/* Statistics Cards */}
            <div className="mb-8">
              <DashboardStats />
            </div>

            {/* Sales Analytics Chart */}
            <SalesAnalytics />

            {/* Bottom Section - Recent Activities and Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activities - Left Column */}
              <div className="lg:col-span-2">
                <RecentActivity />
              </div>

              {/* Quick Stats - Right Column */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
                <h3 className="text-h3 font-h3 text-on-background mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-body-sm text-on-surface-variant">
                      Total Revenue
                    </p>
                    <p className="text-h2 font-h2 text-primary">$128,430</p>
                  </div>
                  <div className="p-3 bg-success/10 rounded-lg">
                    <p className="text-body-sm text-on-surface-variant">
                      New Customers
                    </p>
                    <p className="text-h2 font-h2 text-success">+324</p>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <p className="text-body-sm text-on-surface-variant">
                      Pending Orders
                    </p>
                    <p className="text-h2 font-h2 text-warning">42</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order History Table */}
            <div className="mt-8">
              <OrderHistory />
            </div>

            {/* Admin User Management Section */}
            <div className="mt-10 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
              <div className="p-6 border-b border-outline-variant">
                <h2 className="text-h3 font-h3 text-on-surface flex items-center gap-2">
                  <MdPeople className="text-primary" />
                  User Management
                </h2>
              </div>

              {usersError && (
                <div className="m-6 p-4 bg-error/10 text-error border border-error/20 rounded-lg flex items-start gap-3">
                  <MdWarning className="text-[24px] flex-shrink-0" />
                  <div>
                    <p className="font-button text-button">Error</p>
                    <p className="text-body-md">{usersError}</p>
                  </div>
                </div>
              )}

              {loadingUsers ? (
                <div className="p-8 text-center">
                  <p className="text-body-md text-on-surface-variant">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-body-md text-on-surface-variant">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-outline-variant bg-surface-container/50">
                        <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                          Email
                        </th>
                        <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                          Name
                        </th>
                        <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                          Role
                        </th>
                        <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                          Status
                        </th>
                        <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userItem) => (
                        <tr
                          key={userItem._id}
                          className="border-b border-outline-variant hover:bg-surface-container/50 transition-colors"
                        >
                          <td className="p-4 text-body-md text-on-surface">{userItem.email}</td>
                          <td className="p-4 text-body-md text-on-surface">
                            {userItem.first_name} {userItem.last_name}
                          </td>
                          <td className="p-4">
                            <select
                              value={userItem.role}
                              onChange={(e) => handleChangeRole(userItem._id, e.target.value)}
                              className="px-3 py-1 rounded border border-outline-variant bg-surface-container text-body-sm text-on-surface cursor-pointer hover:border-primary transition"
                            >
                              <option value="customer">Customer</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded text-body-sm ${
                                userItem.is_active
                                  ? "bg-success/10 text-success"
                                  : "bg-error/10 text-error"
                              }`}
                            >
                              {userItem.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleStatus(userItem._id, !userItem.is_active)}
                              className={`px-3 py-1 rounded text-body-sm transition-all ${
                                userItem.is_active
                                  ? "bg-error/10 text-error hover:bg-error/20"
                                  : "bg-success/10 text-success hover:bg-success/20"
                              }`}
                            >
                              {userItem.is_active ? "Deactivate" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
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
