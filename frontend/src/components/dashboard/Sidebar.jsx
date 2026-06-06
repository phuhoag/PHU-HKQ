import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdShoppingCart,
  MdReceipt,
  MdAnalytics,
  MdPeople,
  MdSettings,
  MdLogout,
} from "react-icons/md";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        setCurrentUser(JSON.parse(userString));
      } catch {
        setCurrentUser(null);
      }
    }
  }, []);

  const menuItems = currentUser?.role === "admin"
    ? [
        { icon: MdDashboard, label: "Dashboard", href: "/dashboard" },
        { icon: MdShoppingCart, label: "Products", href: "/products" },
        { icon: MdReceipt, label: "Orders", href: "/orders" },
        { icon: MdAnalytics, label: "Analytics", href: "/analytics" },
        { icon: MdPeople, label: "Customers", href: "/customers" },
        { icon: MdSettings, label: "Settings", href: "/settings" },
      ]
    : [
        { icon: MdDashboard, label: "Tổng quan", href: "/dashboard" },
        { icon: MdReceipt, label: "Đơn hàng của tôi", href: "/orders" },
        { icon: MdShoppingCart, label: "Tiếp tục mua sắm", href: "/shop" },
      ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    navigate("/login");
  };

  const getInitials = () => {
    if (!currentUser) return "?";
    const first = currentUser.first_name?.[0] || "";
    const last = currentUser.last_name?.[0] || "";
    return (first + last).toUpperCase() || currentUser.email?.[0]?.toUpperCase() || "U";
  };

  const getDisplayName = () => {
    if (!currentUser) return "User";
    if (currentUser.first_name || currentUser.last_name) {
      return `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim();
    }
    return currentUser.email || "User";
  };

  const getRoleLabel = () => {
    if (!currentUser) return "";
    if (currentUser.role === "admin") return "Super Admin";
    return "Customer";
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-surface-container-lowest border-r border-outline-variant transition-all duration-300 z-40 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-outline-variant">
        <div className="flex items-center justify-between">
          <h1
            className={`font-h2 text-h2 font-bold text-primary ${
              isCollapsed && "hidden"
            }`}
          >
            Admin Panel
          </h1>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-surface-container rounded-lg transition"
          >
            {isCollapsed ? "→" : "←"}
          </button>
        </div>
        <p
          className={`text-body-sm text-on-surface-variant mt-2 ${
            isCollapsed && "hidden"
          }`}
        >
          Store Management
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? "bg-primary text-surface text-body-md font-body-md"
                  : "text-on-surface hover:bg-surface-container"
              }`}
            >
              <Icon size={24} />
              <span className={isCollapsed ? "hidden" : ""}>{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-outline-variant">
        <div className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-surface-container transition">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-surface text-h4 font-h4 flex-shrink-0">
            {getInitials()}
          </div>
          <div className={isCollapsed ? "hidden" : ""}>
            <p className="text-body-md font-body-md text-on-background truncate max-w-[130px]">
              {getDisplayName()}
            </p>
            <p className="text-body-sm text-on-surface-variant">{getRoleLabel()}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-error hover:bg-error/10 transition mt-2 ${
            isCollapsed && "justify-center"
          }`}
        >
          <MdLogout size={24} />
          <span className={isCollapsed ? "hidden" : ""}>Logout</span>
        </button>
      </div>
    </aside>
  );
}
