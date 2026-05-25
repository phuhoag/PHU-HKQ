import { MdClose, MdAddShoppingCart, MdStarRate } from "react-icons/md";
import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext.jsx";

export default function WishlistItem({ product }) {
  const { removeFromWishlist } = useWishlist();

  const handleAddToCart = () => {
    // TODO: Integrate with CartContext
    console.log("Add to cart:", product);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
      {/* Product Image */}
      <Link
        to={`/product/${product.id}`}
        className="relative aspect-square overflow-hidden bg-surface-container rounded-lg cursor-pointer md:col-span-1"
      >
        <img
          alt={product.name}
          src={product.image}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Product Details */}
      <div className="md:col-span-2 flex flex-col justify-between py-2">
        <div>
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
            {product.brand}
          </span>
          <Link to={`/product/${product.id}`} className="block mt-1">
            <h3 className="font-body-lg text-body-lg text-on-surface hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2 text-tertiary">
            <MdStarRate className="text-[16px] fill-current" />
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
              {product.rating || "N/A"} ({product.reviews || 0} reviews)
            </span>
          </div>

          {/* Stock Status */}
          <div className="mt-2">
            {product.stock > 0 ? (
              <span className="text-body-sm text-on-surface-variant">
                ✓ In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-body-sm text-error">Out of Stock</span>
            )}
          </div>
        </div>
      </div>

      {/* Price & Actions */}
      <div className="flex flex-col justify-between items-end md:col-span-1">
        <div className="text-right">
          {product.original_price && product.original_price > product.price && (
            <div className="text-body-sm text-on-surface-variant line-through">
              ${product.original_price.toFixed(2)}
            </div>
          )}
          <div className="font-h2 text-h2 text-on-surface">
            ${product.price.toFixed(2)}
          </div>
          {product.original_price && product.original_price > product.price && (
            <div className="text-body-sm text-primary font-medium">
              Save{" "}
              {Math.round(
                ((product.original_price - product.price) /
                  product.original_price) *
                  100,
              )}
              %
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="flex-1 bg-primary text-on-primary px-3 py-2 rounded-lg hover:bg-primary-container transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdAddShoppingCart size={18} />
            <span className="hidden sm:inline text-body-sm">Add</span>
          </button>

          <button
            onClick={() => removeFromWishlist(product.id)}
            className="bg-surface-container text-on-surface px-3 py-2 rounded-lg hover:bg-outline-variant transition-colors flex items-center justify-center"
            title="Remove from wishlist"
          >
            <MdClose size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
