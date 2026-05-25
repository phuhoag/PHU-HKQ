import { Outlet } from "react-router-dom";
import "./App.css";
import { CartProvider } from "./context/CartContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";

function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <Outlet />
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;
