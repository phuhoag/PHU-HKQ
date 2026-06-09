import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import { ToastProvider } from "./context/ToastContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";

function App() {
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <Outlet />
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
}

export default App;
