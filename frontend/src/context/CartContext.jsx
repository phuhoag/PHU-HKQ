import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartService } from "../services/cartService.js";
import { couponService } from "../services/couponService.js";
import { useToast } from "./ToastContext.jsx";
import { useLanguage } from "./LanguageContext.jsx";

const CartContext = createContext();

const isLoggedIn = () => !!localStorage.getItem("token");

// Lấy giỏ hàng từ localStorage (dùng khi chưa đăng nhập)
const getLocalCart = () => {
  try {
    const saved = localStorage.getItem("cart_guest");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Lưu giỏ hàng vào localStorage (dùng khi chưa đăng nhập)
const saveLocalCart = (cartItems) => {
  localStorage.setItem("cart_guest", JSON.stringify(cartItems));
};

// Parse giá từ Decimal128 ({ $numberDecimal }) hoặc string/number
const parsePrice = (raw) => {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === "object" && raw.$numberDecimal)
    return parseFloat(raw.$numberDecimal);
  const n = parseFloat(raw.toString());
  return isNaN(n) ? 0 : n;
};

// Chuyển dữ liệu cart từ API thành format dùng cho UI
const mapApiItem = (item) => ({
  cartItemId: item._id,
  id: item.product_id?._id || item.product_id,
  name: item.product_id?.name || "",
  price: parsePrice(item.product_id?.price),
  image: item.product_id?.image || "",
  stock: item.product_id?.stock || 0,
  quantity: item.quantity,
});

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToast } = useToast();
  const { language } = useLanguage();

  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // ============================================================
  // TẢI GIỎ HÀNG - ưu tiên từ server nếu đã đăng nhập
  // ============================================================
  const loadCart = useCallback(async () => {
    if (isLoggedIn()) {
      try {
        setLoading(true);
        const data = await cartService.getCart();
        const mapped = (data.data?.items || []).map(mapApiItem);
        setCart(mapped);
        setError(null);
      } catch (err) {
        console.error("Load cart error:", err);
        setError(err.message);
        // Fallback sang local cart nếu API lỗi
        setCart(getLocalCart());
      } finally {
        setLoading(false);
      }
    } else {
      // Chưa đăng nhập: dùng localStorage
      setCart(getLocalCart());
    }
  }, []);

  // Tải giỏ hàng lần đầu + theo dõi thay đổi đăng nhập
  useEffect(() => {
    loadCart();

    // Lắng nghe thay đổi token (đăng nhập / đăng xuất)
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        loadCart();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadCart]);

  // ============================================================
  // LƯU GIỎ HÀNG - đồng bộ giỏ chưa đăng nhập lên server
  // ============================================================
  const syncCartToServer = async (localItems) => {
    if (!isLoggedIn() || localItems.length === 0) return;
    try {
      const items = localItems.map((i) => ({
        product_id: i.id,
        quantity: i.quantity,
      }));
      const data = await cartService.syncCart(items);
      const mapped = (data.data?.items || []).map(mapApiItem);
      setCart(mapped);
      localStorage.removeItem("cart_guest");
    } catch (err) {
      console.error("Sync cart error:", err);
    }
  };

  // Gọi sync ngay sau khi đăng nhập (từ ngoài vào context)
  const onLogin = async () => {
    const localItems = getLocalCart();
    if (localItems.length > 0) {
      await syncCartToServer(localItems);
    } else {
      await loadCart();
    }
  };

  // Xóa giỏ hàng khi đăng xuất
  const onLogout = () => {
    setCart([]);
    localStorage.removeItem("cart_guest");
  };

  // ============================================================
  // THÊM SẢN PHẨM VÀO GIỎ
  // ============================================================
  const addToCart = async (product, quantity = 1) => {
    if (isLoggedIn()) {
      try {
        setLoading(true);
        await cartService.addToCart(product._id || product.id, quantity);
        await loadCart();
        addToast(`Đã thêm "${product.name}" vào giỏ hàng 🛒`, "success");
      } catch (err) {
        console.error("Add to cart error:", err);
        setError(err.message);
        addToast(err.message || "Không thể thêm vào giỏ hàng", "error");
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      // Chưa đăng nhập: lưu local
      setCart((prev) => {
        const existing = prev.find((i) => i.id === (product._id || product.id));
        let updated;
        if (existing) {
          updated = prev.map((i) =>
            i.id === (product._id || product.id)
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        } else {
          updated = [
            ...prev,
            {
              cartItemId: null,
              id: product._id || product.id,
              name: product.name,
              price: parsePrice(product.price),
              image: product.image || "",
              stock: product.stock || 0,
              quantity,
            },
          ];
        }
        saveLocalCart(updated);
        return updated;
      });
      addToast(`Đã thêm "${product.name}" vào giỏ hàng 🛒`, "success");
    }
  };

  // ============================================================
  // CẬP NHẬT SỐ LƯỢNG
  // ============================================================
  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    if (isLoggedIn()) {
      const item = cart.find((i) => i.id === productId);
      if (!item?.cartItemId) return;
      try {
        setLoading(true);
        await cartService.updateCartItem(item.cartItemId, quantity);
        await loadCart();
      } catch (err) {
        console.error("Update quantity error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setCart((prev) => {
        const updated = prev.map((i) =>
          i.id === productId ? { ...i, quantity } : i,
        );
        saveLocalCart(updated);
        return updated;
      });
    }
  };

  // ============================================================
  // XÓA SẢN PHẨM KHỎI GIỎ
  // ============================================================
  const removeFromCart = async (productId) => {
    if (isLoggedIn()) {
      const item = cart.find((i) => i.id === productId);
      if (!item?.cartItemId) return;
      try {
        setLoading(true);
        await cartService.removeFromCart(item.cartItemId);
        await loadCart();
      } catch (err) {
        console.error("Remove from cart error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setCart((prev) => {
        const updated = prev.filter((i) => i.id !== productId);
        saveLocalCart(updated);
        return updated;
      });
    }
  };

  // ============================================================
  // XÓA TOÀN BỘ GIỎ HÀNG
  // ============================================================
  const clearCart = async () => {
    if (isLoggedIn()) {
      try {
        setLoading(true);
        await cartService.clearCart();
        setCart([]);
      } catch (err) {
        console.error("Clear cart error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setCart([]);
      localStorage.removeItem("cart_guest");
    }
  };

  // ============================================================
  // TÍNH TỔNG
  // ============================================================
  const getTotalItems = () =>
    cart.reduce((total, item) => total + item.quantity, 0);

  const getTotalPrice = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const applyCoupon = async (code) => {
    if (!isLoggedIn()) {
      addToast(
        language === "vi"
          ? "Vui lòng đăng nhập để sử dụng mã giảm giá"
          : "Please log in to use a coupon",
        "error"
      );
      return { success: false, message: "Require login" };
    }

    try {
      const res = await couponService.validateCoupon(code);
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        addToast(
          language === "vi"
            ? "Áp dụng mã giảm giá thành công! 🎉"
            : "Coupon applied successfully! 🎉",
          "success"
        );
        return { success: true, data: res.data };
      } else {
        setAppliedCoupon(null);
        addToast(res.message || "Không thể áp dụng mã giảm giá", "error");
        return { success: false, message: res.message };
      }
    } catch (err) {
      setAppliedCoupon(null);
      addToast(
        language === "vi"
          ? "Lỗi kết nối khi áp dụng mã giảm giá"
          : "Connection error applying coupon",
        "error"
      );
      return { success: false, message: err.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast(
      language === "vi" ? "Đã gỡ mã giảm giá" : "Coupon removed",
      "info"
    );
  };

  // Recalculate discount_amount or revoke coupon when cart items change
  useEffect(() => {
    if (!appliedCoupon) return;
    const subtotal = getTotalPrice();
    if (subtotal === 0) {
      setAppliedCoupon(null);
      return;
    }
    if (subtotal < appliedCoupon.min_purchase) {
      setAppliedCoupon(null);
      addToast(
        language === "vi"
          ? "Mã giảm giá bị hủy vì tổng tiền chưa đạt mức tối thiểu"
          : "Coupon removed: order total is below minimum requirement",
        "warning"
      );
      return;
    }
    
    // Recalculate discount_amount
    let newDiscount = 0;
    if (appliedCoupon.discount_type === "percentage") {
      newDiscount = subtotal * (appliedCoupon.discount_value / 100);
      if (appliedCoupon.max_discount !== null && appliedCoupon.max_discount !== undefined && newDiscount > appliedCoupon.max_discount) {
        newDiscount = appliedCoupon.max_discount;
      }
    } else if (appliedCoupon.discount_type === "fixed") {
      newDiscount = appliedCoupon.discount_value;
    }
    
    if (newDiscount > subtotal) {
      newDiscount = subtotal;
    }
    
    const formattedDiscount = parseFloat(newDiscount.toFixed(2));
    if (formattedDiscount !== appliedCoupon.discount_amount) {
      setAppliedCoupon(prev => {
        if (!prev) return null;
        return {
          ...prev,
          discount_amount: formattedDiscount
        };
      });
    }
  }, [cart, appliedCoupon, getTotalPrice, language, addToast]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        loadCart,
        onLogin,
        onLogout,
        appliedCoupon,
        setAppliedCoupon,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
