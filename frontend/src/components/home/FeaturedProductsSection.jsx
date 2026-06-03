import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../products/ProductCard";
import { MdArrowForward } from "react-icons/md";
import { productService } from "../../services/productService";

export default function FeaturedProductsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await productService.getProducts({ limit: 4, sort: "newest" });
        const list = res.data?.products || [];
        setProducts(list.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch featured products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const badges = [
    { text: "NEW", position: "left-3", className: "bg-primary text-on-primary" },
    null,
    { text: "HOT", position: "right-3", className: "bg-tertiary text-on-tertiary" },
    null,
  ];

  return (
    <section className="py-stack-lg bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-stack-lg">
          <div>
            <h2 className="font-h2 text-h2 text-on-surface mb-2">
              Featured Products
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Check out our best-selling items
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-container transition-colors font-button text-button"
          >
            View All
            <MdArrowForward size={20} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-surface-container" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-surface-container rounded w-1/3" />
                  <div className="h-4 bg-surface-container rounded w-3/4" />
                  <div className="h-3 bg-surface-container rounded w-1/2" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-surface-container rounded w-1/4" />
                    <div className="h-9 w-9 bg-surface-container rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant">
            Chưa có sản phẩm nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {products.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                badge={badges[index] || null}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
