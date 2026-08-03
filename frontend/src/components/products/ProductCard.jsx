import {
  MdAddShoppingCart,
  MdStarRate,
  MdFavoriteBorder,
  MdFavorite,
} from "react-icons/md";
import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

/**
 * Parse price từ MongoDB Decimal128 ({ $numberDecimal }) hoặc string/number
 */
const parsePrice = (raw) => {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === "object" && raw.$numberDecimal)
    return parseFloat(raw.$numberDecimal);
  const n = parseFloat(raw.toString());
  return isNaN(n) ? 0 : n;
};

export default function ProductCard({ product, badge }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { t, formatPrice } = useLanguage();

  // MongoDB dùng _id, fallback sang id
  const productId = product._id || product.id;
  const price = parsePrice(product.price);
  const inWishlist = isInWishlist(productId);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist({
      ...product,
      id: productId,
      price,
    });
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(
      {
        _id: productId,
        id: productId,
        name: product.name,
        price,
        image: product.image,
        stock: product.stock,
      },
      1,
    );
  };

  return (
    <div className="group bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
      {/* Product Image */}
      <Link
        to={`/product/${productId}`}
        className="relative aspect-square overflow-hidden bg-surface-container cursor-pointer"
      >
        {product.image ? (
          <img
            alt={product.name}
            src={product.image}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container text-on-surface-variant text-4xl">
            📦
          </div>
        )}

        {badge && (
          <span
            className={`absolute top-3 ${badge.position} px-3 py-1 rounded-full text-label-caps font-bold ${badge.className}`}
          >
            {badge.text}
          </span>
        )}

        {/* Stock badge */}
        {product.stock !== undefined && product.stock <= 0 && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-error text-surface rounded-full text-xs font-bold">
            {t("home.productCard.outOfStock")}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110"
          title={inWishlist ? t("home.productCard.removeFromFavorites") : t("home.productCard.addToFavorites")}
        >
          {inWishlist ? (
            <MdFavorite size={20} className="text-error" />
          ) : (
            <MdFavoriteBorder size={20} className="text-on-surface-variant" />
          )}
        </button>
      </Link>

      {/* Product Details */}
      <div className="p-stack-md flex flex-col flex-1">
        <div className="flex-1">
          {/* Category */}
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
            {product.category_id?.name || product.brand || ""}
          </span>

          <Link to={`/product/${productId}`} className="block">
            <h3 className="font-body-md text-body-md text-on-surface mt-1 group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Rating (chỉ hiện nếu có) */}
          {product.rating !== undefined && (
            <div className="flex items-center gap-1 mt-2 text-tertiary">
              <MdStarRate className="text-[14px] fill-current" />
              <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                {product.rating} ({product.reviews || 0} {t("home.productCard.reviews")})
              </span>
            </div>
          )}
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-4 flex items-center justify-between">
          <span className="font-h3 text-h3 text-on-surface">
            {formatPrice(price)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock !== undefined && product.stock <= 0}
            className="bg-primary text-on-primary p-2 rounded-lg hover:bg-primary-container transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            title={t("home.productCard.addToCart")}
          >
            <MdAddShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
