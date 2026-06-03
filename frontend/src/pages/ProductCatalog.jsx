import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  MdChevronRight,
  MdSearch,
  MdClose,
  MdTune,
  MdFilterList,
} from "react-icons/md";
import Header from "../components/layouts/Header";
import Footer from "../components/layouts/Footer";
import ProductGrid from "../components/products/ProductGrid";
import Pagination from "../components/common/Pagination";
import productService from "../services/productService";

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price-low", label: "Giá: Thấp → Cao" },
  { value: "price-high", label: "Giá: Cao → Thấp" },
  { value: "name-asc", label: "Tên: A → Z" },
  { value: "name-desc", label: "Tên: Z → A" },
];

const ITEMS_PER_PAGE = 9;

export default function ProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc filter trực tiếp từ URL (nguồn duy nhất)
  const selectedCategory = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") || "newest";
  const maxPrice = searchParams.get("maxPrice") || "";
  const minPrice = searchParams.get("minPrice") || "";

  // State nội bộ
  const [searchInput, setSearchInput] = useState(search);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: ITEMS_PER_PAGE,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchDebounceRef = useRef(null);

  // Helper: cập nhật URL params
  const updateParams = useCallback(
    (updates) => {
      const current = Object.fromEntries(searchParams.entries());
      const next = { ...current, ...updates };
      // Xóa params mặc định
      if (next.page === "1" || next.page === 1) delete next.page;
      if (!next.search) delete next.search;
      if (!next.category) delete next.category;
      if (!next.minPrice) delete next.minPrice;
      if (!next.maxPrice) delete next.maxPrice;
      if (next.sort === "newest") delete next.sort;
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Fetch categories một lần
  useEffect(() => {
    productService
      .getCategories()
      .then((res) => {
        if (res.success) setCategories(res.data || []);
      })
      .catch(() => {});
  }, []);

  // Fetch products khi URL params thay đổi
  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { page: currentPage, limit: ITEMS_PER_PAGE, sort };
        if (search.trim()) params.search = search.trim();
        if (selectedCategory) params.category = selectedCategory;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;

        const res = await productService.getProducts(params);
        if (!cancelled) {
          if (res.success) {
            setProducts(res.data.products || []);
            setPagination(res.data.pagination);
          } else {
            setError(res.message || "Không thể tải sản phẩm");
          }
        }
      } catch (err) {
        if (!cancelled) setError("Lỗi kết nối: " + err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducts();
    return () => { cancelled = true; };
  }, [selectedCategory, search, currentPage, sort, minPrice, maxPrice]);

  // Sync searchInput khi URL thay đổi (navigate từ trang khác)
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Handlers
  const handleSearchInput = (value) => {
    setSearchInput(value);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      updateParams({ search: value, page: 1 });
    }, 400);
  };

  const handleCategoryChange = (catId) => {
    updateParams({ category: catId === selectedCategory ? "" : catId, page: 1 });
  };

  const handleSortChange = (value) => {
    updateParams({ sort: value, page: 1 });
  };

  const handlePageChange = (page) => {
    updateParams({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMaxPriceChange = (value) => {
    updateParams({ maxPrice: value === "5000" ? "" : value, page: 1 });
  };

  const handleMinPriceChange = (value) => {
    updateParams({ minPrice: value, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = search || selectedCategory || minPrice || maxPrice;

  // Sidebar filter content (dùng chung desktop & mobile)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-body-md font-bold text-on-surface mb-3 flex items-center gap-2">
          <MdFilterList className="text-primary" />
          Danh mục
        </h3>
        <div className="space-y-1.5">
          <button
            onClick={() => handleCategoryChange("")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-body-sm transition-all ${
              selectedCategory === ""
                ? "bg-primary text-surface font-semibold shadow-sm"
                : "text-on-surface hover:bg-surface-container"
            }`}
          >
            Tất cả sản phẩm
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryChange(cat._id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-body-sm transition-all ${
                selectedCategory === cat._id
                  ? "bg-primary text-surface font-semibold shadow-sm"
                  : "text-on-surface hover:bg-surface-container"
              }`}
            >
              {cat.name}
            </button>
          ))}
          {categories.length === 0 && (
            <p className="text-body-sm text-on-surface-variant px-3 animate-pulse">
              Đang tải danh mục...
            </p>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-body-md font-bold text-on-surface mb-3">
          Khoảng giá
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-body-sm text-on-surface-variant block mb-1">
              Giá tối đa:{" "}
              <span className="text-primary font-semibold">
                ${parseInt(maxPrice || 5000).toLocaleString()}
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="5000"
              step="50"
              value={maxPrice || 5000}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[11px] text-on-surface-variant mt-1">
              <span>$0</span>
              <span>$5,000</span>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min $"
              value={minPrice}
              min="0"
              onChange={(e) => handleMinPriceChange(e.target.value)}
              className="w-full px-2 py-1.5 border border-outline-variant rounded-lg text-body-sm bg-surface-container focus:outline-none focus:border-primary"
            />
            <input
              type="number"
              placeholder="Max $"
              value={maxPrice}
              min="0"
              onChange={(e) => handleMaxPriceChange(e.target.value)}
              className="w-full px-2 py-1.5 border border-outline-variant rounded-lg text-body-sm bg-surface-container focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Reset filters */}
      {hasActiveFilters && (
        <button
          onClick={handleResetFilters}
          className="w-full py-2 px-4 border-2 border-error text-error rounded-lg text-body-sm hover:bg-error/10 transition-all flex items-center justify-center gap-2"
        >
          <MdClose size={16} />
          Xóa bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="max-w-container-max mx-auto px-margin-desktop py-stack-lg min-h-screen flex-1 w-full">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-6">
          <Link to="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <MdChevronRight className="text-[16px]" />
          <span className="text-on-surface font-medium">Sản phẩm</span>
          {selectedCategory &&
            categories.find((c) => c._id === selectedCategory) && (
              <>
                <MdChevronRight className="text-[16px]" />
                <span className="text-on-surface font-medium">
                  {categories.find((c) => c._id === selectedCategory)?.name}
                </span>
              </>
            )}
        </nav>

        {/* Page Header + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-h1 font-h1 text-on-surface">
              {selectedCategory &&
              categories.find((c) => c._id === selectedCategory)
                ? categories.find((c) => c._id === selectedCategory).name
                : "Tất cả sản phẩm"}
            </h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              {loading
                ? "Đang tải..."
                : `Hiển thị ${products.length} / ${pagination.totalItems} sản phẩm`}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Tìm kiếm sản phẩm theo tên..."
              className="w-full pl-10 pr-10 py-2.5 bg-surface border-2 border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {searchInput && (
              <button
                onClick={() => handleSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-error transition-colors"
              >
                <MdClose size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {search && (
              <span className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-body-sm">
                Tìm: "{search}"
                <button onClick={() => updateParams({ search: "", page: 1 })}>
                  <MdClose size={14} />
                </button>
              </span>
            )}
            {selectedCategory &&
              categories.find((c) => c._id === selectedCategory) && (
                <span className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-body-sm">
                  {categories.find((c) => c._id === selectedCategory)?.name}
                  <button
                    onClick={() => updateParams({ category: "", page: 1 })}
                  >
                    <MdClose size={14} />
                  </button>
                </span>
              )}
            {maxPrice && (
              <span className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-body-sm">
                Giá đến ${parseInt(maxPrice).toLocaleString()}
                <button onClick={() => updateParams({ maxPrice: "", page: 1 })}>
                  <MdClose size={14} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Sort + Mobile Filter Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowMobileFilter(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-body-sm hover:bg-surface-container transition"
          >
            <MdTune size={18} />
            Bộ lọc
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-primary rounded-full" />
            )}
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-body-sm text-on-surface-variant hidden sm:block">
              Sắp xếp:
            </span>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-surface border-2 border-outline-variant rounded-lg px-4 py-2 text-body-sm focus:outline-none focus:border-primary transition-all"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <FilterContent />
            </div>
          </aside>

          {/* Products Area */}
          <div className="flex-1">
            {error && (
              <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-body-md mb-6">
                ⚠️ {error}
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden animate-pulse"
                  >
                    <div className="aspect-square bg-surface-container" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-surface-container rounded w-1/3" />
                      <div className="h-4 bg-surface-container rounded w-3/4" />
                      <div className="h-3 bg-surface-container rounded w-1/2" />
                      <div className="h-6 bg-surface-container rounded w-1/4 mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-4">
                  <MdSearch size={40} className="text-on-surface-variant" />
                </div>
                <h3 className="text-h3 font-h3 text-on-surface mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-body-md text-on-surface-variant mb-6 max-w-sm">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm khác.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-primary text-surface rounded-xl text-body-md hover:bg-primary/90 transition-all"
                >
                  Xem tất cả sản phẩm
                </button>
              </div>
            )}

            {/* Product Grid */}
            {!loading && products.length > 0 && (
              <>
                <ProductGrid products={products} />
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilter(false)}
          />
          <div className="relative ml-auto w-80 max-w-full bg-background h-full overflow-y-auto p-6 shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h3 font-h3 text-on-surface">Bộ lọc</h2>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="p-2 hover:bg-surface-container rounded-lg transition"
              >
                <MdClose size={22} className="text-on-surface-variant" />
              </button>
            </div>
            <FilterContent />
            <button
              onClick={() => setShowMobileFilter(false)}
              className="w-full mt-8 py-3 bg-primary text-surface rounded-xl text-body-md font-semibold hover:bg-primary/90 transition-all"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
