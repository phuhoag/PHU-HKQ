import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MdOutlineSearch,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const { getWishlistCount } = useWishlist();
  const cartItemCount = getTotalItems();
  const wishlistCount = getWishlistCount();

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
    // TODO: Implement actual logout logic
    localStorage.removeItem("userToken");
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

        {/* Search & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant">
            <MdOutlineSearch
              className="text-on-surface-variant mr-2"
              size={20}
            />
            <input
              type="text"
              placeholder="Search tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-body-sm w-48 outline-none"
            />
          </div>

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
                <MdOutlineAccountCircle className="text-on-surface" size={24} />
                <MdExpandMore
                  className={`text-on-surface transition-transform ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                  size={16}
                />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-surface border border-outline-variant rounded-lg shadow-lg py-1 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-outline-variant">
                    <p className="text-body-sm font-body-sm text-on-surface">
                      Welcome Back!
                    </p>
                    <p className="text-label-sm text-on-surface-variant">
                      user@example.com
                    </p>
                  </div>

                  {/* Menu Items */}
                  <Link
                    to="/dashboard"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-on-surface"
                  >
                    <MdDashboard size={20} className="text-primary" />
                    <span className="text-body-sm font-body-sm">Dashboard</span>
                  </Link>

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
