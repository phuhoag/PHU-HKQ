import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdPeople,
  MdLogout,
  MdSettings,
  MdShoppingCart,
  MdTrendingUp,
  MdWarning,
} from "react-icons/md";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    // Get logged-in user info
    const userString = localStorage.getItem("user");
    if (userString) {
      const userData = JSON.parse(userString);
      setUser(userData);
    }

    // Fetch users list from admin API
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
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
          // Calculate stats
          const adminCount = data.data?.filter(
            (u) => u.role === "admin",
          ).length;
          const customerCount = data.data?.filter(
            (u) => u.role === "customer",
          ).length;
          const activeCount = data.data?.filter(
            (u) => u.is_active === true,
          ).length;

          setStats({
            totalUsers: data.data?.length || 0,
            totalOrders: Math.floor(Math.random() * 100) + 10, // Mock data
            totalRevenue: Math.floor(Math.random() * 50000) + 10000, // Mock data
            activeUsers: activeCount,
          });
        } else {
          setError(data.message || "Failed to fetch users");
        }
      } catch (err) {
        setError("Error fetching users: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    navigate("/admin/login");
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
        // Update users list
        setUsers(
          users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
        );
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
        // Update users list
        setUsers(
          users.map((u) =>
            u._id === userId ? { ...u, is_active: newStatus } : u,
          ),
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
      {/* Header */}
      <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-50">
        <div className="max-w-container-max mx-auto px-margin-desktop py-stack-md flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MdDashboard className="text-primary text-[32px]" />
            <div>
              <h1 className="font-h2 text-h2 text-primary">Admin Dashboard</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Manage your e-commerce platform
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-body-md text-on-surface">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="font-body-sm text-on-surface-variant capitalize">
                {user?.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-all font-button text-button"
            >
              <MdLogout />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-container-max mx-auto px-margin-desktop py-stack-lg">
        {error && (
          <div className="mb-stack-lg p-4 bg-error/10 text-error border border-error/20 rounded-lg flex items-start gap-3">
            <MdWarning className="text-[24px] flex-shrink-0" />
            <div>
              <p className="font-button text-button">Error</p>
              <p className="font-body-md text-body-md">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md mb-stack-lg">
          {/* Total Users */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">
                  Total Users
                </p>
                <p className="font-h2 text-h2 text-primary">
                  {stats.totalUsers}
                </p>
              </div>
              <MdPeople className="text-primary text-[32px]" />
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              All registered users
            </p>
          </div>

          {/* Active Users */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">
                  Active Users
                </p>
                <p className="font-h2 text-h2 text-success">
                  {stats.activeUsers}
                </p>
              </div>
              <MdTrendingUp className="text-success text-[32px]" />
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Currently active accounts
            </p>
          </div>

          {/* Total Orders */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">
                  Total Orders
                </p>
                <p className="font-h2 text-h2 text-tertiary">
                  {stats.totalOrders}
                </p>
              </div>
              <MdShoppingCart className="text-tertiary text-[32px]" />
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              All orders
            </p>
          </div>

          {/* Revenue */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">
                  Total Revenue
                </p>
                <p className="font-h2 text-h2 text-primary">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <MdTrendingUp className="text-primary text-[32px]" />
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              All-time earnings
            </p>
          </div>
        </div>

        {/* Users Management Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
          <div className="p-stack-md border-b border-outline-variant">
            <h2 className="font-h3 text-h3 text-on-surface flex items-center gap-2">
              <MdPeople className="text-primary" />
              User Management
            </h2>
          </div>

          {loading ? (
            <div className="p-stack-lg text-center">
              <p className="font-body-md text-on-surface-variant">
                Loading users...
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-stack-lg text-center">
              <p className="font-body-md text-on-surface-variant">
                No users found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="text-left p-stack-md font-label-caps text-label-caps text-on-surface-variant">
                      Email
                    </th>
                    <th className="text-left p-stack-md font-label-caps text-label-caps text-on-surface-variant">
                      Name
                    </th>
                    <th className="text-left p-stack-md font-label-caps text-label-caps text-on-surface-variant">
                      Role
                    </th>
                    <th className="text-left p-stack-md font-label-caps text-label-caps text-on-surface-variant">
                      Status
                    </th>
                    <th className="text-left p-stack-md font-label-caps text-label-caps text-on-surface-variant">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr
                      key={userItem._id}
                      className="border-b border-outline-variant hover:bg-surface-container transition-colors"
                    >
                      <td className="p-stack-md font-body-md text-on-surface">
                        {userItem.email}
                      </td>
                      <td className="p-stack-md font-body-md text-on-surface">
                        {userItem.first_name} {userItem.last_name}
                      </td>
                      <td className="p-stack-md">
                        <select
                          value={userItem.role}
                          onChange={(e) =>
                            handleChangeRole(userItem._id, e.target.value)
                          }
                          className="px-3 py-1 rounded border border-outline-variant bg-surface-container font-body-sm text-on-surface cursor-pointer hover:border-primary"
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-stack-md">
                        <span
                          className={`px-3 py-1 rounded font-body-sm ${
                            userItem.is_active
                              ? "bg-success/10 text-success"
                              : "bg-error/10 text-error"
                          }`}
                        >
                          {userItem.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-stack-md">
                        <button
                          onClick={() =>
                            handleToggleStatus(
                              userItem._id,
                              !userItem.is_active,
                            )
                          }
                          className={`px-3 py-1 rounded font-body-sm transition-all ${
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
      </main>
    </div>
  );
}
