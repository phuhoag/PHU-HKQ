import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../products/ProductCard";
import { MdArrowForward, MdFiberNew } from "react-icons/md";
import { productService } from "../../services/productService";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function NewArrivalsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await productService.getProducts({ limit: 4, sort: "newest" });
        const list = res.data?.products || [];
        setProducts(list.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch new arrivals:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  const badge = { text: "NEW", position: "left-3", className: "bg-primary text-on-primary font-bold" };

  return (
    <section className="py-stack-lg bg-surface">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-stack-lg">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-primary/10 text-primary text-label-sm font-bold rounded-full flex items-center gap-1">
                <MdFiberNew size={18} />
                {t("home.newArrivals.title") || "Sản phẩm mới nhất"}
              </span>
            </div>
            <h2 className="font-h2 text-h2 text-on-surface mb-2">
              {t("home.newArrivals.title") || "Sản phẩm mới nhất"}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {t("home.newArrivals.subtitle") || "Khám phá các thiết bị công nghệ mới cập bến TechStore"}
            </p>
          </div>
          <Link
            to="/shop?sort=newest"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-container transition-colors font-button text-button font-semibold"
          >
            {t("home.newArrivals.viewAll") || "Xem tất cả"}
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
            {t("home.newArrivals.noProducts") || "Chưa có sản phẩm mới nào."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                badge={badge}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
