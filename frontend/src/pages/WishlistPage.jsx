import { useState } from "react";
import { Link } from "react-router-dom";
import { MdShoppingBag, MdArrowBack, MdChevronRight } from "react-icons/md";
import Header from "../components/layouts/Header.jsx";
import Footer from "../components/layouts/Footer.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import WishlistItem from "../components/wishlist/WishlistItem.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function WishlistPage() {
  const { wishlist, clearWishlist } = useWishlist();
  const [sortBy, setSortBy] = useState("newest");
  const { t } = useLanguage();

  // Sort products
  const sortedWishlist = [...wishlist].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="max-w-container-max mx-auto px-margin-desktop py-stack-lg min-h-screen flex-1 w-full">
        {/* Breadcrumbs & Header */}
        <div className="mb-stack-lg">
          <nav className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-stack-sm">
            <Link to="/" className="hover:text-primary">
              TechStore
            </Link>
            <MdChevronRight className="text-[16px]" />
            <span className="text-on-surface font-medium">{t("wishlist.title")}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-h1 text-h1 text-on-surface">{t("wishlist.title")}</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {wishlist.length} {t("wishlist.itemsSaved")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {t("wishlist.sortBy")}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface border border-outline-variant rounded-lg px-4 py-2 text-body-sm focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="newest">{t("wishlist.sortNewest")}</option>
                <option value="price-low">{t("wishlist.sortPriceLow")}</option>
                <option value="price-high">{t("wishlist.sortPriceHigh")}</option>
                <option value="rating">{t("wishlist.sortRating")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {wishlist.length === 0 ? (
          <div className="bg-surface-container rounded-lg p-12 text-center">
            <MdShoppingBag
              size={64}
              className="mx-auto text-outline-variant mb-4"
            />
            <h2 className="font-h2 text-h2 text-on-surface mb-2">
              {t("wishlist.empty")}
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
              {t("wishlist.emptyDesc")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg hover:bg-primary-container transition-colors font-label-lg"
              >
                <MdArrowBack size={20} />
                {t("wishlist.continueShopping")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container rounded-lg overflow-hidden shadow-sm">
            {/* Wishlist Items */}
            <div className="divide-y divide-outline-variant">
              {sortedWishlist.map((product) => (
                <WishlistItem key={product.id} product={product} />
              ))}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-outline-variant flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-container-lowest">
              <div className="font-body-lg text-on-surface-variant">
                {wishlist.length} {t("wishlist.inWishlist")}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={clearWishlist}
                  className="px-6 py-2 border-2 border-outline text-on-surface rounded-lg hover:bg-surface-container transition-colors font-label-lg"
                >
                  {t("wishlist.clear")}
                </button>

                <Link
                  to="/shop"
                  className="px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors font-label-lg"
                >
                  {t("wishlist.continueShopping")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
