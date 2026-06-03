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
      }
    } catch {
      navigate("/login");
    }
  }, [navigate]);

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

        {/* ===== ADMIN-ONLY SECTION: User Management ===== */}
        {isAdmin && (
          <div className="mt-10">
            {/* Admin Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-body-sm text-on-surface-variant mb-1">Total Users</p>
                    <p className="text-h2 font-h2 text-primary">{adminStats.totalUsers}</p>
                  </div>
                  <MdPeople className="text-primary text-[32px]" />
                </div>
                <p className="text-body-sm text-on-surface-variant">All registered users</p>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-body-sm text-on-surface-variant mb-1">Active Users</p>
                    <p className="text-h2 font-h2 text-success">{adminStats.activeUsers}</p>
                  </div>
                  <MdTrendingUp className="text-success text-[32px]" />
                </div>
                <p className="text-body-sm text-on-surface-variant">Currently active accounts</p>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-body-sm text-on-surface-variant mb-1">Total Orders</p>
                    <p className="text-h2 font-h2 text-tertiary">{adminStats.totalOrders}</p>
                  </div>
                  <MdShoppingCart className="text-tertiary text-[32px]" />
                </div>
                <p className="text-body-sm text-on-surface-variant">All orders</p>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-body-sm text-on-surface-variant mb-1">Total Revenue</p>
                    <p className="text-h2 font-h2 text-primary">
                      ${adminStats.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <MdTrendingUp className="text-primary text-[32px]" />
                </div>
                <p className="text-body-sm text-on-surface-variant">All-time earnings</p>
              </div>
            </div>

            {/* User Management Table */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
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
          </div>
        )}
      </main>
    </div>
  );
}
