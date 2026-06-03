import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  MdChevronRight,
  MdArrowBack,
  MdStar,
  MdShoppingCart,
  MdFavoriteBorder,
  MdFavorite,
  MdShare,
  MdInventory,
  MdLocalShipping,
  MdVerified,
  MdWarning,
} from "react-icons/md";
import Header from "../components/layouts/Header.jsx";
import Footer from "../components/layouts/Footer.jsx";
import productService from "../services/productService.js";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const inWishlist = product ? isInWishlist(product._id || product.id) : false;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    productService
      .getProductById(id)
      .then((res) => {
        if (res.success && res.data) {
          setProduct(res.data);
        } else {
          setError(res.message || "Không tìm thấy sản phẩm");
        }
      })
      .catch((err) => {
        setError("Lỗi kết nối: " + err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const getPrice = (p) => {
    if (!p?.price) return 0;
    if (typeof p.price === "object" && p.price.$numberDecimal)
      return parseFloat(p.price.$numberDecimal);
    return parseFloat(p.price);
  };

  const handleAddToCart = async () => {
    if (!product || addingToCart) return;
    setAddingToCart(true);
    try {
      await addToCart(
        {
          _id: product._id,
          id: product._id,
          name: product.name,
          price: getPrice(product),
          image: product.image,
          stock: product.stock,
        },
        quantity,
      );
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) {
      console.error("Add to cart error:", err);
    } finally {
      setTimeout(() => setAddingToCart(false), 2000);
    }
  };

  const handleWishlist = () => {
    if (!product) return;
    toggleWishlist({
      id: product._id,
      name: product.name,
      price: getPrice(product),
      image: product.image,
      brand: product.category_id?.name || "",
    });
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 w-full max-w-container-max mx-auto px-margin-desktop py-stack-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-surface-container rounded-2xl" />
            <div className="space-y-4">
              <div className="h-4 bg-surface-container rounded w-1/4" />
              <div className="h-8 bg-surface-container rounded w-3/4" />
              <div className="h-4 bg-surface-container rounded w-1/2" />
              <div className="h-10 bg-surface-container rounded w-1/3 mt-6" />
              <div className="h-12 bg-surface-container rounded mt-4" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error || !product) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mb-4">
            <MdWarning size={40} className="text-error" />
          </div>
          <h1 className="text-h2 font-h2 text-on-surface mb-2">
            Không tìm thấy sản phẩm
          </h1>
          <p className="text-body-md text-on-surface-variant mb-8 max-w-sm">
            {error || "Sản phẩm này không tồn tại hoặc đã bị xóa."}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 border border-outline rounded-xl text-body-md hover:bg-surface-container transition"
            >
              <MdArrowBack size={18} />
              Quay lại
            </button>
            <Link
              to="/shop"
              className="px-6 py-3 bg-primary text-surface rounded-xl text-body-md hover:bg-primary/90 transition"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const price = getPrice(product);
  const categoryName = product.category_id?.name || "Sản phẩm";
  const isInStock = product.stock > 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-desktop py-stack-lg">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-stack-md text-on-surface-variant text-body-sm">
          <Link to="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <MdChevronRight className="text-[14px]" />
          <Link to="/shop" className="hover:text-primary transition-colors">
            Sản phẩm
          </Link>
          <MdChevronRight className="text-[14px]" />
          <Link
            to={`/shop?category=${product.category_id?._id}`}
            className="hover:text-primary transition-colors"
          >
            {categoryName}
          </Link>
          <MdChevronRight className="text-[14px]" />
          <span className="text-on-surface truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Product Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Image */}
          <div className="relative group">
            <div className="aspect-square rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant shadow-sm">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MdInventory size={80} className="text-on-surface-variant/30" />
                </div>
              )}
            </div>

            {/* Stock badge */}
            {isInStock ? (
              <span className="absolute top-4 left-4 px-3 py-1 bg-success text-surface rounded-full text-body-sm font-semibold shadow">
                Còn hàng
              </span>
            ) : (
              <span className="absolute top-4 left-4 px-3 py-1 bg-error text-surface rounded-full text-body-sm font-semibold shadow">
                Hết hàng
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Category tag */}
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-body-sm font-semibold w-fit mb-3">
              <MdVerified size={14} />
              {categoryName}
            </span>

            {/* Name */}
            <h1 className="text-h1 font-h1 text-on-surface mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Stock info */}
            <div className="flex items-center gap-2 mb-4">
              <MdInventory className="text-on-surface-variant" />
              <span className="text-body-md text-on-surface-variant">
                Tồn kho:{" "}
                <span
                  className={`font-semibold ${
                    product.stock > 10
                      ? "text-success"
                      : product.stock > 0
                      ? "text-warning"
                      : "text-error"
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} sản phẩm` : "Hết hàng"}
                </span>
              </span>
            </div>

            {/* Price */}
            <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-[2.5rem] font-bold text-primary leading-none">
                ${price.toFixed(2)}
              </p>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Đã bao gồm thuế
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-body-md font-bold text-on-surface mb-2">
                  Mô tả sản phẩm
                </h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-body-md text-on-surface-variant">
                Số lượng:
              </span>
              <div className="flex items-center border-2 border-outline-variant rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-surface-container transition text-on-surface font-bold text-lg"
                >
                  −
                </button>
                <span className="w-12 text-center font-semibold text-on-surface">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  disabled={!isInStock}
                  className="w-10 h-10 flex items-center justify-center hover:bg-surface-container transition text-on-surface font-bold text-lg disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={!isInStock || addingToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-button text-button transition-all ${
                  addedToCart
                    ? "bg-success text-surface"
                    : addingToCart
                    ? "bg-primary/70 text-surface cursor-wait"
                    : isInStock
                    ? "bg-primary text-surface hover:bg-primary/90 active:scale-95"
                    : "bg-surface-container text-on-surface-variant cursor-not-allowed"
                }`}
              >
                <MdShoppingCart size={20} />
                {addedToCart
                  ? "✓ Đã thêm vào giỏ!"
                  : addingToCart
                  ? "Đang thêm..."
                  : isInStock
                  ? "Thêm vào giỏ hàng"
                  : "Hết hàng"}
              </button>
              <button
                onClick={handleWishlist}
                className={`w-14 h-14 flex items-center justify-center rounded-xl border-2 transition-all ${
                  inWishlist
                    ? "border-error bg-error/10 text-error"
                    : "border-outline-variant hover:border-error hover:text-error text-on-surface-variant"
                }`}
              >
                {inWishlist ? (
                  <MdFavorite size={22} />
                ) : (
                  <MdFavoriteBorder size={22} />
                )}
              </button>
              <button className="w-14 h-14 flex items-center justify-center rounded-xl border-2 border-outline-variant hover:border-primary hover:text-primary text-on-surface-variant transition-all">
                <MdShare size={22} />
              </button>
            </div>

            {/* Shipping info */}
            <div className="border-t border-outline-variant pt-4 space-y-2">
              <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <MdLocalShipping className="text-success text-[18px]" />
                <span>Miễn phí vận chuyển cho đơn hàng trên $50</span>
              </div>
              <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <MdVerified className="text-primary text-[18px]" />
                <span>Bảo hành chính hãng 12 tháng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
            <h2 className="text-h3 font-h3 text-on-surface mb-4">
              Thông tin sản phẩm
            </h2>
            <table className="w-full">
              <tbody className="divide-y divide-outline-variant">
                <tr>
                  <td className="py-3 text-body-sm text-on-surface-variant w-1/3">
                    Tên sản phẩm
                  </td>
                  <td className="py-3 text-body-md text-on-surface font-medium">
                    {product.name}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-body-sm text-on-surface-variant">
                    Danh mục
                  </td>
                  <td className="py-3 text-body-md text-on-surface font-medium">
                    {categoryName}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-body-sm text-on-surface-variant">
                    Giá
                  </td>
                  <td className="py-3 text-body-md text-primary font-bold">
                    ${price.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-body-sm text-on-surface-variant">
                    Tồn kho
                  </td>
                  <td className="py-3 text-body-md text-on-surface font-medium">
                    {product.stock} sản phẩm
                  </td>
                </tr>
                {product.createdAt && (
                  <tr>
                    <td className="py-3 text-body-sm text-on-surface-variant">
                      Ngày thêm
                    </td>
                    <td className="py-3 text-body-md text-on-surface">
                      {new Date(product.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
            <h2 className="text-h3 font-h3 text-on-surface mb-4">
              Chính sách mua hàng
            </h2>
            <ul className="space-y-3">
              {[
                "✅ Đổi trả trong 30 ngày",
                "🚚 Giao hàng 2-5 ngày làm việc",
                "🛡️ Bảo hành 12 tháng",
                "💳 Thanh toán an toàn 100%",
                "🎁 Quà tặng kèm theo đơn hàng",
              ].map((item, i) => (
                <li key={i} className="text-body-sm text-on-surface-variant">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-start">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 border-2 border-outline-variant rounded-xl text-body-md text-on-surface-variant hover:border-primary hover:text-primary transition-all"
          >
            <MdArrowBack size={18} />
            Quay lại danh sách
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
