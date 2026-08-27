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
  MdAdd,
  MdEdit,
  MdDelete,
  MdClose,
} from "react-icons/md";
import { useLanguage } from "../context/LanguageContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function UsersPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [addFormData, setAddFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    role: "customer",
  });

  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    role: "customer",
    is_active: true,
  });

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
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
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
        setError(res.message || t("users.alertFetchError"));
      }
    } catch (err) {
      setError(t("users.alertConnError") + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addFormData),
      });

      const res = await response.json();

      if (response.ok) {
        alert(t("users.alertCreateSuccess"));
        setAddModalOpen(false);
        setAddFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          address: "",
          password: "",
          role: "customer",
        });
        fetchUsers();
      } else {
        alert("❌ " + (res.message || t("users.alertCreateFail")));
      }
    } catch (err) {
      alert(t("products.alertError") + err.message);
    }
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const bodyData = { ...editFormData };
      // If password is left blank, remove it so it isn't overwritten on backend
      if (!bodyData.password) {
        delete bodyData.password;
      }

      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      const res = await response.json();

      if (response.ok) {
        alert(t("users.alertUpdateSuccess"));
        setEditModalOpen(false);
        fetchUsers();
      } else {
        alert("❌ " + (res.message || t("users.alertUpdateFail")));
      }
    } catch (err) {
      alert(t("products.alertError") + err.message);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    const doubleConfirm = window.confirm(t("users.alertDeleteConfirm1").replace("{email}", userEmail));
    if (!doubleConfirm) return;

    const tripleConfirm = window.confirm(t("users.alertDeleteConfirm2"));
    if (!tripleConfirm) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const res = await response.json();

      if (response.ok) {
        alert(t("users.alertDeleteSuccess"));
        fetchUsers();
      } else {
        alert("❌ " + (res.message || t("users.alertDeleteFail")));
      }
    } catch (err) {
      alert(t("products.alertError") + err.message);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    const actionText = newStatus ? t("users.actionActivate") : t("users.actionDeactivate");
    if (!window.confirm(t("users.alertToggleStatusConfirm").replace("{action}", actionText))) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
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
        alert(t("users.alertToggleStatusSuccess").replace("{action}", actionText));
      } else {
        alert("❌ " + (res.message || t("users.alertToggleStatusFail")));
      }
    } catch (err) {
      alert(t("products.alertError") + err.message);
    }
  };

  const openEditModal = (userItem) => {
    setSelectedUser(userItem);
    setEditFormData({
      first_name: userItem.first_name || "",
      last_name: userItem.last_name || "",
      email: userItem.email || "",
      phone: userItem.phone || "",
      address: userItem.address || "",
      password: "", // Always start blank
      role: userItem.role || "customer",
      is_active: userItem.is_active !== undefined ? userItem.is_active : true,
    });
    setEditModalOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return t("users.notUpdated");
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return t("users.notUpdated");
    return d.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
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
              {t("users.title")}
            </h1>
            <p className="text-body-md text-on-surface-variant dark:text-surface-variant mt-1">
              {t("users.description")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-surface rounded-lg hover:bg-primary/95 transition font-semibold shadow-sm"
            >
              <MdAdd size={20} />
              {t("users.addUser")}
            </button>
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2 border border-outline rounded-lg text-on-background hover:bg-surface-container transition font-semibold"
            >
              <MdRefresh size={18} />
              {t("users.refresh")}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 text-error border border-error/20 rounded-lg flex items-start gap-3">
            <MdWarning className="text-[24px] flex-shrink-0" />
            <div>
              <p className="font-button text-button">{t("users.loadError")}</p>
              <p className="text-body-md">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-body-md text-on-surface-variant animate-pulse">{t("users.loadingUsers")}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Users */}
              <div className="bg-surface-container-lowest dark:bg-on-secondary-fixed-variant/20 border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface-variant">{t("users.statsTotal")}</p>
                    <p className="text-h2 font-h2 text-primary font-bold mt-1">
                      {totalUsers} {t("users.statsTotalUnit")}
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <MdPeople size={24} />
                  </div>
                </div>
              </div>

              {/* Customers */}
              <div className="bg-surface-container-lowest dark:bg-on-secondary-fixed-variant/20 border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface-variant">{t("users.statsCustomers")}</p>
                    <p className="text-h2 font-h2 text-success font-bold mt-1">
                      {customerCount} {t("users.statsCustomersUnit")}
                    </p>
                  </div>
                  <div className="p-3 bg-success/10 rounded-lg text-success">
                    <MdPeople size={24} />
                  </div>
                </div>
              </div>

              {/* Admins */}
              <div className="bg-surface-container-lowest dark:bg-on-secondary-fixed-variant/20 border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface-variant">{t("users.statsAdmins")}</p>
                    <p className="text-h2 font-h2 text-warning font-bold mt-1">
                      {adminCount} {t("users.statsAdminsUnit")}
                    </p>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-lg text-warning">
                    <MdAdminPanelSettings size={24} />
                  </div>
                </div>
              </div>

              {/* Active Accounts */}
              <div className="bg-surface-container-lowest dark:bg-on-secondary-fixed-variant/20 border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface-variant">{t("users.statsActive")}</p>
                    <p className="text-h2 font-h2 text-info font-bold mt-1">
                      {activeCount} {t("users.statsActiveUnit")}
                    </p>
                  </div>
                  <div className="p-3 bg-info/10 rounded-lg text-info">
                    <MdCheckCircle size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-container-lowest dark:bg-on-secondary-fixed-variant/20 border border-outline-variant rounded-xl p-5 shadow-sm">
              <div className="relative flex-1 w-full md:max-w-md">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                <input
                  type="text"
                  placeholder={t("users.searchPlaceholder")}
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
                  <option value="">{t("users.roleAll")}</option>
                  <option value="admin">{t("users.roleAdmin")}</option>
                  <option value="customer">{t("users.roleCustomer")}</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none cursor-pointer focus:border-primary transition"
                >
                  <option value="">{t("users.statusAll")}</option>
                  <option value="active">{t("users.statusActive")}</option>
                  <option value="inactive">{t("users.statusInactive")}</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-10 bg-surface-container-lowest dark:bg-on-secondary-fixed-variant/20 border border-outline-variant rounded-xl shadow-sm">
                <p className="text-body-md text-on-surface-variant">{t("users.noUsersFound")}</p>
              </div>
            ) : (
              <div className="bg-surface-container-lowest dark:bg-on-secondary-fixed-variant/20 border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-container border-b border-outline-variant">
                      <tr>
                        <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">{t("users.tableMember")}</th>
                        <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">{t("users.tablePhone")}</th>
                        <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">{t("users.tableRegisterDate")}</th>
                        <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">{t("users.tableRole")}</th>
                        <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">{t("users.tableStatus")}</th>
                        <th className="px-6 py-4 text-center text-label-md font-label-md text-on-surface-variant">{t("users.tableActions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((userItem) => {
                        const fullName = `${userItem.first_name || ""} ${userItem.last_name || ""}`.trim() || t("users.newUserDefaultName");
                        const initials = ((userItem.first_name?.[0] || "") + (userItem.last_name?.[0] || "")).toUpperCase() || userItem.email?.[0]?.toUpperCase() || "?";
                        
                        return (
                          <tr key={userItem._id} className="border-b border-outline-variant last:border-none hover:bg-surface-container/30 transition">
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
                            <td className="px-6 py-4 text-body-md text-on-surface">{userItem.phone || t("users.notUpdated")}</td>
                            <td className="px-6 py-4 text-body-md text-on-surface-variant">{formatDate(userItem.createdAt)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-body-sm font-semibold ${
                                userItem.role === "admin" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
                              }`}>
                                {userItem.role === "admin" ? t("users.roleAdminLabel") : t("users.roleCustomerLabel")}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-body-sm font-semibold ${
                                  userItem.is_active
                                    ? "bg-success/15 text-success"
                                    : "bg-error/15 text-error"
                                }`}
                              >
                                {userItem.is_active ? t("users.statusActiveLabel") : t("users.statusInactiveLabel")}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openEditModal(userItem)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary font-semibold text-body-sm rounded-lg hover:bg-primary/20 transition-all"
                                  title={t("users.actionEdit")}
                                >
                                  <MdEdit size={16} />
                                  {t("users.actionEdit")}
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(userItem._id, userItem.is_active)}
                                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-body-sm font-semibold transition-all ${
                                    userItem.is_active
                                      ? "bg-warning/10 text-warning hover:bg-warning/20"
                                      : "bg-success/10 text-success hover:bg-success/20"
                                  }`}
                                  title={userItem.is_active ? t("users.actionLock") : t("users.actionUnlock")}
                                >
                                  <MdBlock size={16} />
                                  {userItem.is_active ? t("users.actionLock") : t("users.actionUnlock")}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(userItem._id, userItem.email)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-error/10 text-error font-semibold text-body-sm rounded-lg hover:bg-error/20 transition-all"
                                  title={t("users.actionDelete")}
                                >
                                  <MdDelete size={16} />
                                  {t("users.actionDelete")}
                                </button>
                              </div>
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

      {/* Add User Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-200">
          <div className="bg-surface-container-lowest dark:bg-[#1a1d26] border border-outline-variant dark:border-outline rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform scale-100 transition-all duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-outline-variant dark:border-outline">
              <h2 className="text-h2 font-h2 text-on-surface font-bold flex items-center gap-2">
                <MdPeople className="text-primary" />
                {t("users.addModalTitle")}
              </h2>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-2 hover:bg-surface-container dark:hover:bg-on-secondary-fixed-variant/30 rounded-lg text-on-surface-variant transition"
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddUserSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("users.labelLastName")}</label>
                  <input
                    type="text"
                    required
                    value={addFormData.last_name}
                    onChange={(e) => setAddFormData({ ...addFormData, last_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("users.labelFirstName")}</label>
                  <input
                    type="text"
                    required
                    value={addFormData.first_name}
                    onChange={(e) => setAddFormData({ ...addFormData, first_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("users.labelEmail")}</label>
                <input
                  type="email"
                  required
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("users.labelPassword")}</label>
                <input
                  type="password"
                  required
                  placeholder={t("users.labelPasswordPlaceholder")}
                  value={addFormData.password}
                  onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("users.labelPhone")}</label>
                <input
                  type="text"
                  value={addFormData.phone}
                  onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("users.labelAddress")}</label>
                <textarea
                  rows={2}
                  value={addFormData.address}
                  onChange={(e) => setAddFormData({ ...addFormData, address: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary transition resize-none"
                />
              </div>

              <div>
                <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("users.labelRole")}</label>
                <select
                  value={addFormData.role}
                  onChange={(e) => setAddFormData({ ...addFormData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none cursor-pointer focus:border-primary transition"
                >
                  <option value="customer">{t("users.roleCustomer")}</option>
                  <option value="admin">{t("users.roleAdmin")}</option>
                </select>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant dark:border-outline">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-5 py-2 border border-outline rounded-lg text-on-background hover:bg-surface-container transition font-semibold"
                >
                  {t("users.buttonCancel")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-surface rounded-lg hover:bg-primary/95 transition font-semibold"
                >
                  {t("users.buttonSave")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-200">
          <div className="bg-surface-container-lowest dark:bg-[#1a1d26] border border-outline-variant dark:border-outline rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform scale-100 transition-all duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-outline-variant dark:border-outline">
              <h2 className="text-h2 font-h2 text-on-surface font-bold flex items-center gap-2">
                <MdEdit className="text-primary" />
                {t("users.editModalTitle")}
              </h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-2 hover:bg-surface-container dark:hover:bg-on-secondary-fixed-variant/30 rounded-lg text-on-surface-variant transition"
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditUserSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("users.labelLastName")}</label>
                  <input
                    type="text"
                    required
                    value={editFormData.last_name}
                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("users.labelFirstName")}</label>
                  <input
                    type="text"
                    required
                    value={editFormData.first_name}
                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("users.labelEmail")}</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("users.labelPasswordEditHelp")}</label>
                <input
                  type="password"
                  placeholder={t("users.labelPasswordEditPlaceholder")}
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("users.labelPhone")}</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("users.labelAddress")}</label>
                <textarea
                  rows={2}
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("users.labelRole")}</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none cursor-pointer focus:border-primary transition"
                  >
                    <option value="customer">{t("users.roleCustomerLabel")}</option>
                    <option value="admin">{t("users.roleAdminLabel")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">{t("users.labelStatus")}</label>
                  <select
                    value={editFormData.is_active ? "true" : "false"}
                    onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.value === "true" })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none cursor-pointer focus:border-primary transition"
                  >
                    <option value="true">{t("users.statusActiveLabel")}</option>
                    <option value="false">{t("users.statusInactiveLabel")}</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant dark:border-outline">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-5 py-2 border border-outline rounded-lg text-on-background hover:bg-surface-container transition font-semibold"
                >
                  {t("users.buttonCancel")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-surface rounded-lg hover:bg-primary/95 transition font-semibold"
                >
                  {t("users.buttonUpdate")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
