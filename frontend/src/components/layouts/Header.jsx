import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MdOutlineShoppingCart,
  MdOutlineAccountCircle,
  MdDashboard,
  MdPerson,
  MdSettings,
  MdLogout,
  MdExpandMore,
  MdOutlineFavoriteBorder,
} from "react-icons/md";
import { useCart } from "../../context/CartContext.jsx";
import { useWishlist } from "../../context/WishlistContext.jsx";

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const { getTotalItems, onLogout } = useCart();
  const { getWishlistCount } = useWishlist();
  const cartItemCount = getTotalItems();
  const wishlistCount = getWishlistCount();

  // Lấy thông tin user từ localStorage
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const displayName = currentUser?.full_name
    || (currentUser?.first_name && currentUser?.last_name
        ? `${currentUser.first_name} ${currentUser.last_name}`
        : currentUser?.first_name || currentUser?.email || "User");
  const displayEmail = currentUser?.email || "";
  const displayAvatar = currentUser?.avatar || null;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart_guest");
    onLogout();
    setShowUserMenu(false);
    navigate("/login");
  };

  return (
    <header className="bg-surface dark:bg-surface-container-highest border-b border-outline-variant dark:border-outline shadow-sm sticky top-0 z-50 w-full">
      <div className="flex items-center justify-between px-margin-desktop h-16 w-full max-w-container-max mx-auto">
        {/* Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-h3 font-h3 text-primary dark:text-primary-fixed hover:text-primary-container transition-colors"
          >
            TechStore
          </Link>

          <nav className="hidden md:flex gap-6 items-center">
            <Link
              to="/shop"
              className="font-body-md text-body-md text-primary dark:text-primary-fixed border-b-2 border-primary dark:border-primary-fixed pb-1"
            >
              Shop
            </Link>
            <Link
              to="/categories"
              className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors"
            >
              Categories
            </Link>
            <Link
              to="/wishlist"
              className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors"
            >
              Wishlist
            </Link>
            <Link
              to="/about"
              className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors"
            >
              About
            </Link>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Link
              to="/cart"
              className="relative p-2 hover:bg-surface-container-low dark:hover:bg-on-secondary-fixed-variant transition-all rounded-full active:scale-90 transition-transform"
            >
              <MdOutlineShoppingCart className="text-on-surface" size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-surface text-label-sm font-label-sm rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <Link
              to="/wishlist"
              className="relative p-2 hover:bg-surface-container-low dark:hover:bg-on-secondary-fixed-variant transition-all rounded-full active:scale-90 transition-transform"
            >
              <MdOutlineFavoriteBorder className="text-on-surface" size={24} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-surface text-label-sm font-label-sm rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 hover:bg-surface-container-low dark:hover:bg-on-secondary-fixed-variant transition-all rounded-full active:scale-90 flex items-center gap-1"
              >
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-primary/30"
                  />
                ) : (
                  <MdOutlineAccountCircle className="text-on-surface" size={24} />
                )}
                <MdExpandMore
                  className={`text-on-surface transition-transform ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                  size={16}
                />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-surface border border-outline-variant rounded-lg shadow-lg py-1 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-outline-variant flex items-center gap-3">
                    {displayAvatar ? (
                      <img
                        src={displayAvatar}
                        alt={displayName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-primary/30 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-body-md">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-body-sm font-bold text-on-surface truncate">
                        {displayName}
                      </p>
                      <p className="text-label-sm text-on-surface-variant truncate">
                        {displayEmail}
                      </p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  {currentUser?.role === "admin" && (
                    <Link
                      to="/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-on-surface"
                    >
                      <MdDashboard size={20} className="text-primary" />
                      <span className="text-body-sm font-body-sm">Dashboard</span>
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-on-surface"
                  >
                    <MdPerson size={20} className="text-primary" />
                    <span className="text-body-sm font-body-sm">
                      My Profile
                    </span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-on-surface"
                  >
                    <MdSettings size={20} className="text-primary" />
                    <span className="text-body-sm font-body-sm">Settings</span>
                  </Link>

                  <div className="border-t border-outline-variant mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-error/10 transition-colors text-error"
                    >
                      <MdLogout size={20} />
                      <span className="text-body-sm font-body-sm">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
