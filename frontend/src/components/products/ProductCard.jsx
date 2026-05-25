import {
  MdAddShoppingCart,
  MdStarRate,
  MdFavoriteBorder,
  MdFavorite,
} from "react-icons/md";
import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext.jsx";

export default function ProductCard({ product, badge }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  return (
    <div className="group bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
      {/* Product Image */}
      <Link
        to={`/product/${product.id}`}
        className="relative aspect-square overflow-hidden bg-surface-container cursor-pointer"
      >
        <img
          alt={product.name}
          src={product.image}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {badge && (
          <span
            className={`absolute top-3 ${badge.position} px-3 py-1 rounded-full text-label-caps font-bold ${badge.className}`}
          >
            {badge.text}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110"
          title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
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
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
            {product.brand}
          </span>
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="font-body-md text-body-md text-on-surface mt-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2 text-tertiary">
            <MdStarRate className="text-[14px] fill-current" />
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-4 flex items-center justify-between">
          <span className="font-h3 text-h3 text-on-surface">
            ${product.price.toFixed(2)}
          </span>
          <button className="bg-primary text-on-primary p-2 rounded-lg hover:bg-primary-container transition-colors flex items-center justify-center">
            <MdAddShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
