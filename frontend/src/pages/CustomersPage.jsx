import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import {
  MdPeople,
  MdAdminPanelSettings,
  MdBlock,
  MdCheckCircle,
  MdSearch,
  MdRefresh,
  MdWarning,
} from "react-icons/md";

export default function CustomersPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Role and auth check
  useEffect(() => {
    const userString = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !userString) {
      navigate("/login");
      return;
    }

    try {
      const userData = JSON.parse(userString);
      if (userData.role !== "admin") {
        navigate("/dashboard");
        return;
      }
      fetchUsers();
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const res = await response.json();

      if (response.ok) {
        setUsers(res.data || []);
      } else {
        setError(res.message || "Không thể tải danh sách tài khoản");
      }
    } catch (err) {
      setError("Lỗi kết nối đến máy chủ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!window.confirm(`⚠️ Bạn có chắc chắn muốn thay đổi vai trò của người dùng này thành: ${newRole === "admin" ? "Quản trị viên" : "Khách hàng"}?`)) {
      // Reset state / reload list
      fetchUsers();
      return;
    }

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

      const res = await response.json();

      if (response.ok) {
        setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
        alert(`✅ Cập nhật vai trò thành công sang: ${newRole === "admin" ? "Admin" : "Customer"}`);
      } else {
        alert("❌ " + (res.message || "Cập nhật vai trò thất bại"));
        fetchUsers();
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
      fetchUsers();
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    if (!window.confirm(`⚠️ Bạn có chắc chắn muốn ${newStatus ? "kích hoạt" : "vô hiệu hóa"} tài khoản này?`)) {
      return;
    }

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

      const res = await response.json();

      if (response.ok) {
        setUsers(users.map((u) => (u._id === userId ? { ...u, is_active: newStatus } : u)));
        alert(`✅ Tài khoản đã được ${newStatus ? "kích hoạt" : "vô hiệu hóa"} thành công`);
      } else {
        alert("❌ " + (res.message || "Cập nhật trạng thái thất bại"));
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa cập nhật";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Chưa cập nhật";
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Local calculations
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const customerCount = users.filter((u) => u.role === "customer").length;
  const activeCount = users.filter((u) => u.is_active).length;

  // Local filtering logic
  const filteredUsers = users.filter((u) => {
    // Search
    const term = searchTerm.toLowerCase();
    const fullName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
    const matchesSearch =
      u.email?.toLowerCase().includes(term) ||
      fullName.includes(term) ||
      (u.phone && u.phone.includes(term));

    // Role filter
    const matchesRole = !roleFilter || u.role === roleFilter;

    // Status filter
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && u.is_active) ||
      (statusFilter === "inactive" && !u.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

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
              <MdPeople className="text-primary" size={32} />
              Quản lý khách hàng
            </h1>
            <p className="text-body-md text-on-surface-variant dark:text-surface-variant mt-1">
              Quản lý phân quyền tài khoản, trạng thái khóa tài khoản thành viên trong hệ thống.
            </p>
          </div>
          <div>
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2 border border-outline rounded-lg text-on-background hover:bg-surface-container transition font-semibold"
            >
              <MdRefresh size={18} />
              Làm mới
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 text-error border border-error/20 rounded-lg flex items-start gap-3">
            <MdWarning className="text-[24px] flex-shrink-0" />
            <div>
              <p className="font-button text-button">Lỗi tải dữ liệu</p>
              <p className="text-body-md">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-body-md text-on-surface-variant animate-pulse">Đang tải danh sách thành viên...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Users */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface-variant">Tổng thành viên</p>
                    <p className="text-h2 font-h2 text-primary font-bold mt-1">{totalUsers} tài khoản</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <MdPeople size={24} />
                  </div>
                </div>
              </div>

              {/* Customers */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface-variant">Khách hàng (Customers)</p>
                    <p className="text-h2 font-h2 text-success font-bold mt-1">{customerCount} người</p>
                  </div>
                  <div className="p-3 bg-success/10 rounded-lg text-success">
                    <MdPeople size={24} />
                  </div>
                </div>
              </div>

              {/* Admins */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface-variant">Quản trị viên (Admins)</p>
                    <p className="text-h2 font-h2 text-warning font-bold mt-1">{adminCount} tài khoản</p>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-lg text-warning">
                    <MdAdminPanelSettings size={24} />
                  </div>
                </div>
              </div>

              {/* Active Accounts */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface-variant">Đang hoạt động</p>
                    <p className="text-h2 font-h2 text-info font-bold mt-1">{activeCount} hoạt động</p>
                  </div>
                  <div className="p-3 bg-info/10 rounded-lg text-info">
                    <MdCheckCircle size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
              <div className="relative flex-1 w-full md:max-w-md">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                <input
                  type="text"
                  placeholder="Tìm theo Tên, Email hoặc Số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                />
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none cursor-pointer focus:border-primary transition"
                >
                  <option value="">Tất cả vai trò</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                  <option value="customer">Khách hàng (Customer)</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none cursor-pointer focus:border-primary transition"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Đã khóa / Tạm dừng</option>
                </select>
              </div>
            </div>

            {/* Customers Table */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-10 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
                <p className="text-body-md text-on-surface-variant">Không tìm thấy thành viên nào khớp với bộ lọc.</p>
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-container border-b border-outline-variant">
                      <tr>
                        <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Thành viên</th>
                        <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Điện thoại</th>
                        <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Ngày đăng ký</th>
                        <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Vai trò</th>
                        <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Trạng thái</th>
                        <th className="px-6 py-4 text-center text-label-md font-label-md text-on-surface-variant">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((userItem) => {
                        const fullName = `${userItem.first_name || ""} ${userItem.last_name || ""}`.trim() || "Thành viên mới";
                        const initials = (userItem.first_name?.[0] || "" + userItem.last_name?.[0] || "").toUpperCase() || userItem.email?.[0]?.toUpperCase() || "?";
                        
                        return (
                          <tr key={userItem._id} className="border-b border-outline-variant hover:bg-surface-container/30 transition">
                            <td className="px-6 py-4 flex items-center gap-3">
                              {/* Initials Avatar */}
                              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-body-lg flex-shrink-0">
                                {initials}
                              </div>
                              <div>
                                <div className="text-body-md font-semibold text-on-surface">{fullName}</div>
                                <div className="text-body-sm text-on-surface-variant">{userItem.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-body-md text-on-surface">{userItem.phone || "Chưa cập nhật"}</td>
                            <td className="px-6 py-4 text-body-md text-on-surface-variant">{formatDate(userItem.createdAt)}</td>
                            <td className="px-6 py-4">
                              <select
                                value={userItem.role}
                                onChange={(e) => handleChangeRole(userItem._id, e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-body-sm text-on-surface cursor-pointer hover:border-primary outline-none transition"
                              >
                                <option value="customer">Khách hàng</option>
                                <option value="admin">Quản trị viên</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-body-sm font-semibold ${
                                  userItem.is_active
                                    ? "bg-success/15 text-success"
                                    : "bg-error/15 text-error"
                                }`}
                              >
                                {userItem.is_active ? "Đang hoạt động" : "Đã khóa"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleToggleStatus(userItem._id, userItem.is_active)}
                                className={`px-4 py-1.5 rounded-lg text-body-sm font-semibold transition-all ${
                                  userItem.is_active
                                    ? "bg-error/10 text-error hover:bg-error/20"
                                    : "bg-success/10 text-success hover:bg-success/20"
                                }`}
                              >
                                {userItem.is_active ? "Vô hiệu hóa" : "Kích hoạt"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
