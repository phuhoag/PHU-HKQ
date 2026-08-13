import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import { ToastProvider } from "./context/ToastContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";

import ChatWidget from "./components/chatbot/ChatWidget.jsx";

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
    <LanguageProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <Outlet />
            <ChatWidget />
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App;
