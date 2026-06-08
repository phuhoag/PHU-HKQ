import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdEdit,
} from "react-icons/md";
import Header from "../components/layouts/Header.jsx";
import Footer from "../components/layouts/Footer.jsx";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    createdAt: "",
  });

  const [stats, setStats] = useState({
    joinDate: "N/A",
    totalOrders: 0,
    totalSpent: 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    fetchProfileData(token);
    fetchOrderStats(token);
  }, [navigate]);

  const fetchProfileData = async (token) => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      if (res.success && res.data) {
        setProfile(res.data);
        setEditData({
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setMessage({ type: "error", text: "Failed to load profile details." });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async (token) => {
    try {
      const response = await fetch("/api/orders/my-orders?limit=100", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      if (res.success && res.data) {
        const orders = res.data.orders || [];
        const totalOrders = res.data.pagination?.total || orders.length;
        
        // Exclude cancelled orders for total spent calculation
        const completedOrders = orders.filter(o => o.status !== "cancelled");
        const totalSpent = completedOrders.reduce(
          (sum, o) => sum + Number(o.total_amount?.$numberDecimal || o.total_amount || 0),
          0
        );

        setStats(prev => ({
          ...prev,
          totalOrders,
          totalSpent,
        }));
      }
    } catch (err) {
      console.error("Error fetching order statistics:", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: editData.first_name,
          last_name: editData.last_name,
          phone: editData.phone,
          address: editData.address,
        }),
      });

      const res = await response.json();
      if (response.ok && res.success) {
        setProfile(res.data);
        
        // Sync local storage user details
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...storedUser,
          first_name: res.data.first_name,
          last_name: res.data.last_name,
          full_name: `${res.data.first_name} ${res.data.last_name || ""}`.trim(),
          phone: res.data.phone,
          address: res.data.address,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setMessage({ type: "success", text: "✅ Profile updated successfully!" });
        setIsEditing(false);
        
        // Fire a window storage event to notify other components (e.g. Header displayName)
        window.dispatchEvent(new Event("storage"));
      } else {
        setMessage({ type: "error", text: `❌ ${res.message || "Failed to update profile."}` });
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setMessage({ type: "error", text: `❌ Error: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const joinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "N/A";

  const displayName = `${profile.first_name} ${profile.last_name || ""}`.trim() || profile.email;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-body-lg text-on-surface-variant">Loading profile details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow py-8 px-margin-mobile">
        <div className="w-full max-w-container-max mx-auto">
          {/* Page Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-h1 font-h1 text-on-background flex items-center gap-3">
                <MdPerson size={32} className="text-primary" />
                My Profile
              </h1>
              <p className="text-body-md text-on-surface-variant mt-2">
                Manage your account information and preferences
              </p>
            </div>

            {/* Alert Message */}
            {message.text && (
              <div
                className={`px-4 py-2.5 rounded-lg text-body-sm font-medium ${
                  message.type === "success"
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-error/10 text-error border border-error/20"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>

          {/* Profile Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-surface border border-outline-variant rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-h2 font-h2 text-on-surface">
                    Personal Information
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition shadow-sm"
                    >
                      <MdEdit size={18} />
                      <span className="text-body-sm font-semibold">Edit</span>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-label-sm font-semibold text-on-surface-variant">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={editData.first_name}
                          onChange={(e) =>
                            setEditData({ ...editData, first_name: e.target.value })
                          }
                          className="w-full px-4 py-2 mt-1 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                        />
                      </div>
                      <div>
                        <label className="text-label-sm font-semibold text-on-surface-variant">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={editData.last_name}
                          onChange={(e) =>
                            setEditData({ ...editData, last_name: e.target.value })
                          }
                          className="w-full px-4 py-2 mt-1 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-label-sm font-semibold text-on-surface-variant flex items-center gap-1.5">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={editData.phone}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                        className="w-full px-4 py-2 mt-1 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                      />
                    </div>

                    <div>
                      <label className="text-label-sm font-semibold text-on-surface-variant flex items-center gap-1.5">
                        Address
                      </label>
                      <textarea
                        value={editData.address}
                        onChange={(e) =>
                          setEditData({ ...editData, address: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-2 mt-1 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition text-body-sm font-semibold disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setEditData({
                            first_name: profile.first_name || "",
                            last_name: profile.last_name || "",
                            phone: profile.phone || "",
                            address: profile.address || "",
                          });
                        }}
                        className="px-5 py-2 border border-outline rounded-lg text-body-sm text-on-background hover:bg-surface-container transition font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-label-sm text-on-surface-variant">
                        Full Name
                      </label>
                      <p className="text-body-md text-on-surface mt-1 font-medium">
                        {displayName}
                      </p>
                    </div>

                    <div>
                      <label className="text-label-sm text-on-surface-variant flex items-center gap-2">
                        Email Address
                      </label>
                      <p className="text-body-md text-on-surface mt-1">
                        {profile.email}
                      </p>
                    </div>

                    <div>
                      <label className="text-label-sm text-on-surface-variant flex items-center gap-2">
                        Phone Number
                      </label>
                      <p className="text-body-md text-on-surface mt-1">
                        {profile.phone || "Not updated"}
                      </p>
                    </div>

                    <div>
                      <label className="text-label-sm text-on-surface-variant flex items-center gap-2">
                        Address
                      </label>
                      <p className="text-body-md text-on-surface mt-1">
                        {profile.address || "Not updated"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Statistics */}
              <div className="bg-surface border border-outline-variant rounded-xl p-6">
                <h2 className="text-h2 font-h2 text-on-surface mb-6">
                  Account Statistics
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-low rounded-lg p-4">
                    <p className="text-label-sm text-on-surface-variant">
                      Member Since
                    </p>
                    <p className="text-h3 font-h3 text-on-surface mt-2">
                      {joinDate}
                    </p>
                  </div>

                  <div className="bg-surface-container-low rounded-lg p-4">
                    <p className="text-label-sm text-on-surface-variant">
                      Total Orders
                    </p>
                    <p className="text-h3 font-h3 text-primary mt-2">
                      {stats.totalOrders}
                    </p>
                  </div>

                  <div className="bg-surface-container-low rounded-lg p-4">
                    <p className="text-label-sm text-on-surface-variant">
                      Total Spent
                    </p>
                    <p className="text-h3 font-h3 text-success mt-2">
                      ${stats.totalSpent.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-surface-container-low rounded-lg p-4">
                    <p className="text-label-sm text-on-surface-variant">
                      Account Status
                    </p>
                    <p className="text-h3 font-h3 text-secondary mt-2">
                      {profile.is_active ? "Active" : "Deactivated"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-surface border border-outline-variant rounded-xl p-6">
                <h3 className="text-h3 font-h3 text-on-surface mb-4">
                  Quick Actions
                </h3>

                <div className="space-y-3">
                  <Link
                    to="/dashboard"
                    className="block w-full py-3 px-4 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-low transition text-body-sm font-semibold text-center"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    to="/wishlist"
                    className="block w-full py-3 px-4 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-low transition text-body-sm font-semibold text-center"
                  >
                    Wishlist
                  </Link>
                  <Link
                    to="/shop"
                    className="block w-full py-3 px-4 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-low transition text-body-sm font-semibold text-center"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Account Security */}
              <div className="bg-primary-container rounded-xl p-6">
                <h3 className="text-h3 font-h3 text-on-primary-container mb-2">
                  Account Security
                </h3>
                <p className="text-body-sm text-on-primary-container/80 mb-4">
                  Your account is protected with secure session tokens and industry standard hashing.
                </p>
                <Link
                  to="/dashboard"
                  className="block w-full py-2 px-4 bg-primary text-on-primary rounded-lg text-body-sm font-semibold hover:bg-primary/90 transition text-center shadow-sm"
                >
                  Manage Security
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
