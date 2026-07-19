import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  MdDashboard,
  MdShoppingCart,
  MdReceipt,
  MdAnalytics,
  MdPeople,
  MdSettings,
  MdLogout,
  MdRateReview,
} from "react-icons/md";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

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
        { icon: MdDashboard, label: t("sidebar.overview"), href: "/dashboard" },
        { icon: MdShoppingCart, label: t("sidebar.products"), href: "/products" },
        { icon: MdReceipt, label: t("sidebar.orders"), href: "/orders" },
        { icon: MdAnalytics, label: t("sidebar.analytics"), href: "/analytics" },
        { icon: MdPeople, label: t("sidebar.users"), href: "/users" },
        { icon: MdRateReview, label: t("sidebar.reviews"), href: "/reviews-management" },
        { icon: MdSettings, label: t("sidebar.settings"), href: "/settings" },
      ]
    : [
        { icon: MdDashboard, label: t("sidebar.overview"), href: "/dashboard" },
        { icon: MdReceipt, label: t("sidebar.myOrders"), href: "/orders" },
        { icon: MdShoppingCart, label: t("sidebar.continueShopping"), href: "/shop" },
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
      className={`fixed left-0 top-0 h-screen bg-surface-container-lowest dark:bg-[#181b23] border-r border-outline-variant dark:border-outline transition-all duration-300 z-40 flex flex-col ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-outline-variant dark:border-outline">
        <div className="flex items-center justify-between">
          <h1
            className={`font-h2 text-h2 font-bold text-primary dark:text-primary-fixed ${
              isCollapsed && "hidden"
            }`}
          >
            {t("sidebar.adminPanel")}
          </h1>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-surface-container dark:hover:bg-on-secondary-fixed-variant/30 rounded-lg text-on-surface dark:text-inverse-on-surface transition"
          >
            {isCollapsed ? "→" : "←"}
          </button>
        </div>
        <p
          className={`text-body-sm text-on-surface-variant dark:text-surface-variant mt-2 ${
            isCollapsed && "hidden"
          }`}
        >
          {t("sidebar.storeManagement")}
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? "bg-primary text-surface text-body-md font-body-md"
                  : "text-on-surface dark:text-inverse-on-surface hover:bg-surface-container dark:hover:bg-on-secondary-fixed-variant/30"
              }`}
            >
              <Icon size={24} />
              <span className={isCollapsed ? "hidden" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="mt-auto p-4 border-t border-outline-variant dark:border-outline">
        <div className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-surface-container dark:hover:bg-on-secondary-fixed-variant/30 transition">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-surface text-h4 font-h4 flex-shrink-0">
            {getInitials()}
          </div>
          <div className={isCollapsed ? "hidden" : ""}>
            <p className="text-body-md font-body-md text-on-background dark:text-inverse-on-surface truncate max-w-[130px]">
              {getDisplayName()}
            </p>
            <p className="text-body-sm text-on-surface-variant dark:text-surface-variant">{getRoleLabel()}</p>
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
          <span className={isCollapsed ? "hidden" : ""}>{t("sidebar.logout")}</span>
        </button>
      </div>
    </aside>
  );
}
