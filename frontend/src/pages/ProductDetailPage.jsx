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
  MdStarBorder,
  MdDelete,
} from "react-icons/md";
import Header from "../components/layouts/Header.jsx";
import Footer from "../components/layouts/Footer.jsx";
import productService from "../services/productService.js";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { reviewService } from "../services/reviewService.js";
import authService from "../services/authService.js";
import { useToast } from "../context/ToastContext.jsx";

export default function ProductDetailPage() {
  const { t, language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const getCategoryName = (cat) => {
    if (!cat) return t("productDetail.productsBreadcrumb");
    const key = `home.categories.${cat.name.toLowerCase()}`;
    const translated = t(key);
    return translated === key ? cat.name : translated;
  };

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsSummary, setReviewsSummary] = useState({
    avgRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // Submit review state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const { addToast } = useToast();

  // Gallery state
  const [galleryImages, setGalleryImages] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [imageError, setImageError] = useState(false); // track ảnh lỗi bằng React state

  // Tabs & Related products states
  const [activeTab, setActiveTab] = useState("overview"); // overview, specs, policy
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Reset lỗi ảnh mỗi khi ảnh chính thay đổi
  useEffect(() => {
    setImageError(false);
  }, [activeImage]);

  const inWishlist = product ? isInWishlist(product._id || product.id) : false;

  // Helper to dynamically build specs based on product name and category
  const generateSpecs = (p) => {
    if (!p) return [];
    const catName = p.category_id?.name?.toLowerCase() || "";
    const pName = p.name?.toLowerCase() || "";
    
    const specs = [
      { key: language === "vi" ? "Thương hiệu" : "Brand", value: p.name?.split(" ")[0] || "TechStore" },
      { key: language === "vi" ? "Bảo hành" : "Warranty", value: language === "vi" ? "12 tháng (Chính hãng)" : "12-month official warranty" },
      { key: language === "vi" ? "Tình trạng" : "Condition", value: p.stock > 0 ? (language === "vi" ? "Mới 100%" : "New 100%") : (language === "vi" ? "Hết hàng" : "Out of Stock") }
    ];

    if (catName.includes("laptop")) {
      specs.push(
        { key: "CPU", value: pName.includes("dell") ? "Intel Core i7 Gen 12th" : pName.includes("macbook") ? "Apple M2 Chip" : "Intel Core i5 / AMD Ryzen 5" },
        { key: language === "vi" ? "Bộ nhớ RAM" : "RAM", value: "16 GB LPDDR4X" },
        { key: language === "vi" ? "Ổ cứng" : "Storage", value: "512 GB NVMe PCIe SSD" },
        { key: language === "vi" ? "Màn hình" : "Display", value: pName.includes("macbook") ? "13.6-inch Liquid Retina" : "15.6-inch FHD (1920x1080) IPS" },
        { key: language === "vi" ? "Đồ họa" : "Graphics", value: pName.includes("dell") ? "Intel Iris Xe Graphics" : pName.includes("macbook") ? "Apple 10-core GPU" : "Intel UHD Graphics" },
        { key: language === "vi" ? "Hệ điều hành" : "OS", value: pName.includes("macbook") ? "macOS Sonoma" : "Windows 11 Home" }
      );
    } else if (catName.includes("keyboard") || catName.includes("bàn phím")) {
      specs.push(
        { key: language === "vi" ? "Loại bàn phím" : "Keyboard Type", value: "Bàn phím cơ (Mechanical Keyboard)" },
        { key: language === "vi" ? "Kiểu kết nối" : "Connection", value: "Wired USB-C / Wireless 2.4GHz / Bluetooth 5.1" },
        { key: language === "vi" ? "Switch" : "Switches", value: pName.includes("red") ? "Linear Red Switch" : pName.includes("blue") ? "Clicky Blue Switch" : "Tactile Brown Switch" },
        { key: language === "vi" ? "Đèn nền" : "Backlight", value: "RGB 16.8 triệu màu" },
        { key: language === "vi" ? "Chất liệu Keycap" : "Keycap Material", value: "Double-shot PBT" },
        { key: language === "vi" ? "Layout" : "Layout", value: "87 phím (Tenkeyless)" }
      );
    } else if (catName.includes("monitor") || catName.includes("màn hình")) {
      specs.push(
        { key: language === "vi" ? "Kích thước màn hình" : "Screen Size", value: "27 inch IPS" },
        { key: language === "vi" ? "Độ phân giải" : "Resolution", value: pName.includes("4k") ? "4K UHD (3840 x 2160)" : "FHD (1920 x 1080)" },
        { key: language === "vi" ? "Tần số quét" : "Refresh Rate", value: "144Hz / 165Hz" },
        { key: language === "vi" ? "Tỷ lệ màn hình" : "Aspect Ratio", value: "16:9" },
        { key: language === "vi" ? "Thời gian phản hồi" : "Response Time", value: "1ms (MPRT)" },
        { key: language === "vi" ? "Cổng kết nối" : "Inputs", value: "2x HDMI, 1x DisplayPort, 1x Audio Out" }
      );
    } else if (catName.includes("mouse") || catName.includes("chuột")) {
      specs.push(
        { key: language === "vi" ? "Kiểu kết nối" : "Connection", value: "Không dây Wireless 2.4G & Bluetooth / Cắm cáp USB" },
        { key: language === "vi" ? "Cảm biến" : "Sensor", value: "Optical High Precision" },
        { key: "DPI", value: "16,000 DPI (Có thể điều chỉnh)" },
        { key: language === "vi" ? "Thời lượng pin" : "Battery Life", value: "Lên đến 70 giờ liên tục" },
        { key: language === "vi" ? "Số nút bấm" : "Number of Buttons", value: "6 phím lập trình được" },
        { key: language === "vi" ? "Trọng lượng" : "Weight", value: "63g (Siêu nhẹ)" }
      );
    } else {
      specs.push(
        { key: language === "vi" ? "Xuất xứ" : "Origin", value: language === "vi" ? "Chính hãng (TechStore Distribution)" : "Genuine (TechStore)" },
        { key: language === "vi" ? "Kích thước đóng gói" : "Package Dimensions", value: "Standard Box" },
        { key: language === "vi" ? "Trọng lượng đóng gói" : "Package Weight", value: "1.2 kg" }
      );
    }

    return specs;
  };

  // STEP 1: Load thông tin sản phẩm
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setGalleryImages([]);
    setActiveImage(null);
    setImageError(false);

    productService
      .getProductById(id)
      .then((res) => {
        if (res.success && res.data) {
          setProduct(res.data);
          // Đặt ảnh tạm thời từ product.image cho đến khi gallery load
          setActiveImage(res.data.image || null);
        } else {
          setError(res.message || t("productDetail.notFound"));
        }
      })
      .catch((err) => {
        setError(t("catalog.connError") + err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // STEP 2: Load gallery SAU khi có product (để gallery primary LUÔN ưu tiên hơn product.image)
  useEffect(() => {
    if (!id || !product) return; // Đợi product load xong mới fetch gallery

    productService
      .getProductImages(id)
      .then((res) => {
        if (res.success && res.data?.length > 0) {
          setGalleryImages(res.data);
          // Gallery primary luôn ưu tiên hơn product.image
          const primary = res.data.find((img) => img.is_primary);
          if (primary) {
            setActiveImage(primary.image_url);
          } else {
            // Nếu không có primary, dùng ảnh đầu tiên trong gallery
            setActiveImage(res.data[0].image_url);
          }
        }
        // Nếu không có gallery, giữ nguyên product.image đã set ở trên
      })
      .catch(() => {}); // silent fail
  }, [id, product]); // phụ thuộc vào product để chạy sau STEP 1

  const loadReviews = async () => {
    if (!id) return;
    setLoadingReviews(true);
    try {
      const res = await reviewService.getProductReviews(id, reviewsPage, 10);
      if (res.success && res.data) {
        setReviews(res.data.reviews || []);
        setReviewsSummary(res.data.summary || {
          avgRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
        setReviewsTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Load reviews error:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [id, reviewsPage]);

  // Load related products by category
  useEffect(() => {
    if (!product || !product.category_id?._id) return;
    productService
      .getProductsByCategory(product.category_id._id)
      .then((res) => {
        if (res.success && res.data) {
          const currentProdId = product._id || product.id;
          const filtered = (res.data || []).filter(
            (p) => (p._id || p.id) !== currentProdId
          );
          setRelatedProducts(filtered.slice(0, 4));
        }
      })
      .catch((err) => {
        console.error("Error loading related products:", err);
      });
  }, [product]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!id) return;
    setSubmittingReview(true);
    setReviewError("");

    try {
      const res = await reviewService.createReview({
        product_id: id,
        rating: newRating,
        comment: newComment,
      });

      if (res.success) {
        addToast(t("productDetail.reviewSuccessToast"), "success");
        setNewComment("");
        setNewRating(5);
        loadReviews();
      } else {
        setReviewError(res.message || t("productDetail.alreadyReviewed"));
        addToast(res.message || t("productDetail.alreadyReviewed"), "error");
      }
    } catch (err) {
      setReviewError(err.message || "Failed to submit review");
      addToast(err.message || "Failed to submit review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm(t("productDetail.deleteReviewConfirm"))) return;

    try {
      const res = await reviewService.deleteReview(reviewId);
      if (res.success) {
        addToast(t("productDetail.reviewDeleteSuccessToast"), "success");
        loadReviews();
      } else {
        addToast(res.message || "Failed to delete review", "error");
      }
    } catch (err) {
      addToast(err.message || "Failed to delete review", "error");
    }
  };

  const renderStars = (ratingNum) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= ratingNum) {
        stars.push(<MdStar key={i} className="text-warning text-xl" />);
      } else {
        stars.push(<MdStarBorder key={i} className="text-on-surface-variant/30 text-xl" />);
      }
    }
    return <div className="flex">{stars}</div>;
  };

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast(
      language === "vi"
        ? "Đã sao chép liên kết sản phẩm vào bộ nhớ tạm!"
        : "Copied product link to clipboard!",
      "success"
    );
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
            {t("productDetail.notFound")}
          </h1>
          <p className="text-body-md text-on-surface-variant mb-8 max-w-sm">
            {error || t("productDetail.notFoundDesc")}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 border border-outline rounded-xl text-body-md hover:bg-surface-container transition"
            >
              <MdArrowBack size={18} />
              {t("productDetail.backButton")}
            </button>
            <Link
              to="/shop"
              className="px-6 py-3 bg-primary text-surface rounded-xl text-body-md hover:bg-primary/90 transition"
            >
              {t("productDetail.viewAllProducts")}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const price = getPrice(product);
  const categoryName = getCategoryName(product.category_id);
  const isInStock = product.stock > 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-desktop py-stack-lg">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-stack-md text-on-surface-variant text-body-sm">
          <Link to="/" className="hover:text-primary transition-colors">
            {t("productDetail.homeBreadcrumb")}
          </Link>
          <MdChevronRight className="text-[14px]" />
          <Link to="/shop" className="hover:text-primary transition-colors">
            {t("productDetail.productsBreadcrumb")}
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
          {/* Image + Gallery Thumbnails */}
          <div className="flex flex-col gap-3">
            {/* Main Image */}
            <div className="relative group">
              <div className="aspect-square rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant shadow-sm">
                {/* Hiển thị ảnh nếu có và chưa lỗi */}
                {activeImage && !imageError && (
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={() => setImageError(true)}
                  />
                )}
                {/* Placeholder khi không có ảnh hoặc ảnh lỗi */}
                {(!activeImage || imageError) && (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-surface-container">
                    <MdInventory size={60} className="text-on-surface-variant/30" />
                    <span className="text-body-sm text-on-surface-variant/50">{t("productDetail.noImage")}</span>
                  </div>
                )}
              </div>

              {/* Stock badge */}
              {isInStock ? (
                <span className="absolute top-4 left-4 px-3 py-1 bg-success text-surface rounded-full text-body-sm font-semibold shadow">
                  {t("productDetail.inStock")}
                </span>
              ) : (
                <span className="absolute top-4 left-4 px-3 py-1 bg-error text-surface rounded-full text-body-sm font-semibold shadow">
                  {t("productDetail.outOfStock")}
                </span>
              )}
            </div>

            {/* Thumbnail Strip - chỉ hiện khi có gallery */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {galleryImages.map((img) => (
                  <button
                    key={img._id}
                    onClick={() => {
                      setActiveImage(img.image_url);
                      setImageError(false); // reset lỗi khi click thumbnail
                    }}
                    title={img.alt_text || product.name}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === img.image_url && !imageError
                        ? "border-primary shadow-md scale-105"
                        : "border-outline-variant hover:border-primary/50 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt={img.alt_text || product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentNode.style.cssText =
                          "background:#f3f4f6;display:flex;align-items:center;justify-content:center";
                        e.target.insertAdjacentHTML("afterend", "<span style='font-size:18px'>🖼️</span>");
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Category tag */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-body-sm font-semibold w-fit mb-3">
              <MdVerified size={14} />
              {categoryName}
            </span>

            {/* Name */}
            <h1 className="text-h1 font-h1 text-on-surface mb-2 leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars Summary (Desktop buy box) */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-warning">
                {Array.from({ length: 5 }).map((_, i) => (
                  <MdStar
                    key={i}
                    className={
                      i < Math.round(reviewsSummary.avgRating || 0)
                        ? "text-warning"
                        : "text-outline-variant/30"
                    }
                    size={18}
                  />
                ))}
              </div>
              <span className="text-body-sm font-semibold text-on-surface">
                {reviewsSummary.avgRating || "0.0"}
              </span>
              <span className="text-xs text-on-surface-variant">
                ({reviewsSummary.totalReviews} {t("home.productCard.reviews")})
              </span>
            </div>

            {/* Stock info & warning urgency banner */}
            <div className="mb-4">
              {product.stock > 0 && product.stock <= 5 ? (
                <div className="bg-warning/10 text-warning px-4 py-2.5 rounded-xl border border-warning/20 text-body-sm font-semibold animate-pulse flex items-center gap-2">
                  <MdWarning size={18} />
                  <span>
                    {language === "vi"
                      ? `Chỉ còn ${product.stock} sản phẩm cuối cùng trong kho - Mua ngay kẻo lỡ!`
                      : `Only ${product.stock} items left in stock - Order soon!`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-body-md text-on-surface-variant">
                  <MdInventory className="text-on-surface-variant" />
                  <span>
                    {t("productDetail.stockLabel")}{" "}
                    <span className={`font-semibold ${product.stock > 0 ? "text-success" : "text-error"}`}>
                      {product.stock > 0 ? `${product.stock} ${t("productDetail.stockCount")}` : t("productDetail.outOfStock")}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="mb-6 p-5 bg-primary/5 rounded-2xl border border-primary/20 flex flex-col justify-center">
              <div className="flex items-baseline gap-2">
                <span className="text-[2.5rem] font-bold text-primary leading-none">
                  ${price.toFixed(2)}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">USD</span>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-1.5">
                {t("productDetail.taxIncluded")}
              </p>
            </div>

            {/* Description Short teaser */}
            {product.description && (
              <div className="mb-6 border-b border-outline-variant/40 pb-4">
                <h3 className="text-body-md font-bold text-on-surface mb-2">
                  {t("productDetail.descriptionTitle")}
                </h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed line-clamp-2">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-body-md text-on-surface-variant font-medium">
                {t("productDetail.quantityLabel")}
              </span>
              <div className="flex items-center border-2 border-outline-variant rounded-xl overflow-hidden bg-surface">
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
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-button text-button transition-all duration-300 ${
                  addedToCart
                    ? "bg-success text-surface scale-[1.02] shadow-md shadow-success/20"
                    : addingToCart
                    ? "bg-primary/70 text-surface cursor-wait"
                    : isInStock
                    ? "bg-primary text-surface hover:bg-primary/95 active:scale-95 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20"
                    : "bg-surface-container text-on-surface-variant cursor-not-allowed"
                }`}
              >
                <MdShoppingCart size={20} className={addingToCart ? "animate-spin" : ""} />
                {addedToCart
                  ? t("productDetail.addedToCartToast")
                  : addingToCart
                  ? t("productDetail.addingToCartToast")
                  : isInStock
                  ? t("productDetail.addToCart")
                  : t("productDetail.outOfStock")}
              </button>
              <button
                onClick={handleWishlist}
                className={`w-14 h-14 flex items-center justify-center rounded-xl border-2 transition-all duration-200 active:scale-90 ${
                  inWishlist
                    ? "border-error bg-error/10 text-error shadow-sm shadow-error/10"
                    : "border-outline-variant hover:border-error hover:text-error text-on-surface-variant hover:bg-error/5"
                }`}
                title={language === "vi" ? "Yêu thích" : "Wishlist"}
              >
                {inWishlist ? (
                  <MdFavorite size={22} />
                ) : (
                  <MdFavoriteBorder size={22} />
                )}
              </button>
              <button
                onClick={handleShare}
                className="w-14 h-14 flex items-center justify-center rounded-xl border-2 border-outline-variant hover:border-primary hover:text-primary text-on-surface-variant hover:bg-primary/5 transition-all duration-200 active:scale-90"
                title={language === "vi" ? "Chia sẻ" : "Share"}
              >
                <MdShare size={22} />
              </button>
            </div>

            {/* Shipping info */}
            <div className="border-t border-outline-variant pt-4 space-y-2.5">
              <div className="flex items-center gap-2.5 text-body-sm text-on-surface-variant">
                <MdLocalShipping className="text-success text-[20px]" />
                <span>{t("productDetail.freeShippingPromo")}</span>
              </div>
              <div className="flex items-center gap-2.5 text-body-sm text-on-surface-variant">
                <MdVerified className="text-primary text-[20px]" />
                <span>{t("productDetail.warrantyPromo")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs System for Specs, Overview, and policies */}
        <div className="border-b border-outline-variant/60 mb-8 flex gap-6 md:gap-8 overflow-x-auto pb-0.5">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3.5 text-body-md md:text-body-lg font-bold transition-all relative flex-shrink-0 ${
              activeTab === "overview"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            {language === "vi" ? "Mô tả sản phẩm" : "Product Overview"}
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-3.5 text-body-md md:text-body-lg font-bold transition-all relative flex-shrink-0 ${
              activeTab === "specs"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            {language === "vi" ? "Thông số kỹ thuật" : "Specifications"}
          </button>
          <button
            onClick={() => setActiveTab("policy")}
            className={`pb-3.5 text-body-md md:text-body-lg font-bold transition-all relative flex-shrink-0 ${
              activeTab === "policy"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            {language === "vi" ? "Chính sách bán hàng" : "Store Policies"}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mb-12">
          {activeTab === "overview" && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-h3 font-h3 text-on-surface mb-4">
                {t("productDetail.descriptionTitle")}
              </h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line mb-8">
                {product.description || (language === "vi" ? "Không có mô tả chi tiết." : "No description available.")}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-outline-variant/60">
                <div className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/40 flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                    <MdLocalShipping size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-body-sm text-on-surface mb-1">
                      {language === "vi" ? "Giao hàng siêu tốc" : "Fast Delivery"}
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      {language === "vi" ? "Nhận hàng nhanh chóng từ 2 - 5 ngày làm việc." : "Receive your package in 2 to 5 business days."}
                    </p>
                  </div>
                </div>
                
                <div className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/40 flex items-start gap-4">
                  <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center text-success flex-shrink-0">
                    <MdVerified size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-body-sm text-on-surface mb-1">
                      {language === "vi" ? "Chính hãng 100%" : "100% Genuine"}
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      {language === "vi" ? "Cam kết đền gấp 10 lần nếu phát hiện hàng nhái." : "Refund 10x if fake items are detected."}
                    </p>
                  </div>
                </div>
                
                <div className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/40 flex items-start gap-4">
                  <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center text-warning flex-shrink-0">
                    <MdInventory size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-body-sm text-on-surface mb-1">
                      {language === "vi" ? "Đổi trả dễ dàng" : "Easy Returns"}
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      {language === "vi" ? "Yên tâm mua sắm với chính sách lỗi là đổi trả 30 ngày." : "Shop confidently with simple 30-day return policy."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-h3 font-h3 text-on-surface mb-6">
                {language === "vi" ? "Thông số kỹ thuật chi tiết" : "Technical Specifications"}
              </h3>
              <div className="overflow-hidden border border-outline-variant rounded-2xl">
                <table className="w-full border-collapse">
                  <tbody>
                    {generateSpecs(product).map((spec, i) => (
                      <tr
                        key={i}
                        className={i % 2 === 0 ? "bg-surface-container-low/55" : "bg-surface-container-lowest"}
                      >
                        <td className="py-4 px-6 text-body-sm font-semibold text-on-surface-variant w-1/3 border-b border-outline-variant/40">
                          {spec.key}
                        </td>
                        <td className="py-4 px-6 text-body-sm text-on-surface font-medium border-b border-outline-variant/40">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "policy" && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-h3 font-h3 text-on-surface mb-6">
                {t("productDetail.policyTitle")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: language === "vi" ? "Chính sách đổi hàng" : "Exchange Policy", desc: t("productDetail.policyExchange"), icon: "🔄" },
                  { title: language === "vi" ? "Thời gian vận chuyển" : "Delivery Time", desc: t("productDetail.policyDelivery"), icon: "🚚" },
                  { title: language === "vi" ? "Chính sách bảo hành" : "Warranty Policy", desc: t("productDetail.policyWarranty"), icon: "🛡️" },
                  { title: language === "vi" ? "Bảo mật thanh toán" : "Secure Payment", desc: t("productDetail.policyPayment"), icon: "🔒" },
                  { title: language === "vi" ? "Quà tặng đi kèm" : "Free Gift Box", desc: t("productDetail.policyGift"), icon: "🎁" },
                ].map((p, i) => (
                  <div key={i} className="p-6 border border-outline-variant/60 rounded-2xl bg-surface-container-low/40 hover:bg-surface-container-low transition duration-200">
                    <span className="text-3xl mb-3 block">{p.icon}</span>
                    <h4 className="font-bold text-body-md text-on-surface mb-2">{p.title}</h4>
                    <p className="text-body-sm text-on-surface-variant">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Similar / Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mb-12 border-t border-outline-variant/60 pt-10">
            <h2 className="text-h2 font-h2 text-on-surface mb-6">
              {language === "vi" ? "Sản phẩm tương tự" : "Related Products"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => {
                const pPrice = parseFloat(p.price?.$numberDecimal || p.price || 0);
                return (
                  <Link
                    key={p._id || p.id}
                    to={`/products/${p._id || p.id}`}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="group bg-surface-container-lowest border border-outline-variant/80 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-square bg-surface border-b border-outline-variant/50 overflow-hidden relative">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {p.stock === 0 && (
                        <span className="absolute top-2 left-2 bg-error text-surface px-2 py-0.5 rounded text-[10px] font-bold">
                          {t("home.productCard.outOfStock")}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-on-surface group-hover:text-primary transition truncate text-body-sm">
                        {p.name}
                      </h4>
                      <p className="text-primary font-bold mt-1 text-body-md">
                        ${pPrice.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== REVIEWS SECTION ===== */}
        <div className="mb-12 border-t border-outline-variant/60 pt-10">
          <h2 className="text-h2 font-h2 text-on-surface mb-6 flex items-center gap-2">
            <MdStar className="text-warning" size={28} />
            {t("productDetail.reviewsTitle")} ({reviewsSummary.totalReviews})
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8">
            {/* Left: Summary and Distribution */}
            <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant flex flex-col md:flex-row lg:flex-col gap-6 col-span-1">
              {/* Avg rating score */}
              <div className="flex-1 text-center flex flex-col items-center justify-center p-4 bg-surface rounded-xl border border-outline-variant/40">
                <span className="text-5xl font-extrabold text-on-surface leading-tight">
                  {reviewsSummary.avgRating || "0.0"}
                </span>
                <span className="text-body-sm text-on-surface-variant my-1">out of 5 stars</span>
                {renderStars(Math.round(reviewsSummary.avgRating || 0))}
                <span className="text-body-xs text-on-surface-variant/70 mt-2">
                  ({reviewsSummary.totalReviews} {t("productDetail.reviewsSummary").toLowerCase()})
                </span>
              </div>

              {/* Distribution bars */}
              <div className="flex-[2] space-y-2.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviewsSummary.ratingDistribution[star] || 0;
                  const percentage = reviewsSummary.totalReviews > 0
                    ? Math.round((count / reviewsSummary.totalReviews) * 100)
                    : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-body-sm">
                      <span className="w-3 font-semibold text-on-surface">{star}</span>
                      <MdStar className="text-warning" size={16} />
                      <div className="flex-1 h-2.5 bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/30">
                        <div
                          className="h-full bg-warning rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-medium text-on-surface-variant">{percentage}%</span>
                      <span className="w-6 text-right text-xs text-on-surface-variant/60">({count})</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Write Review Form / Login prompt */}
            <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant lg:col-span-2">
              {authService.isAuthenticated() ? (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <h3 className="text-h3 font-h3 text-on-surface flex items-center gap-2">
                    <MdVerified className="text-primary" size={20} />
                    {t("productDetail.writeReviewTitle")}
                  </h3>

                  {/* Rating Selector */}
                  <div className="flex items-center gap-3">
                    <span className="text-body-md font-semibold text-on-surface-variant">
                      {t("productDetail.ratingLabel")}
                    </span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="text-2xl hover:scale-125 transition-transform text-warning focus:outline-none"
                        >
                          {star <= newRating ? <MdStar /> : <MdStarBorder className="text-on-surface-variant/40" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment input */}
                  <div>
                    <textarea
                      rows={4}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={t("productDetail.commentPlaceholder")}
                      className="w-full px-4 py-3 rounded-xl border-2 border-outline-variant bg-surface text-on-surface outline-none focus:border-primary transition resize-none text-body-md"
                    />
                  </div>

                  {reviewError && (
                    <p className="text-error text-body-sm flex items-center gap-1.5 bg-error/5 p-3 rounded-lg border border-error/20">
                      <MdWarning size={16} />
                      {reviewError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-3 bg-primary text-surface font-button rounded-xl hover:bg-primary/90 transition disabled:opacity-60"
                  >
                    {submittingReview ? "Submitting..." : t("productDetail.submitReviewButton")}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <p className="text-body-md text-on-surface-variant mb-4">
                    {t("productDetail.loginToReview")}
                  </p>
                  <button
                    onClick={() => navigate("/login", { state: { from: window.location.pathname } })}
                    className="px-6 py-2.5 bg-primary/10 hover:bg-primary/15 text-primary font-semibold rounded-xl transition"
                  >
                    {t("auth.loginTitle") || "Đăng nhập"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Reviews list */}
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((rev) => {
                const currentUser = authService.getUser();
                const isMyReview = currentUser && (currentUser.id === rev.user_id?._id || currentUser._id === rev.user_id?._id);
                const isAdminUser = currentUser && currentUser.role === "admin";
                return (
                  <div key={rev._id} className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 text-left shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg overflow-hidden border border-primary/20">
                          {rev.user_id?.avatar ? (
                            <img src={rev.user_id.avatar} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            (rev.user_id?.full_name || rev.user_id?.first_name || "?").charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-on-surface text-body-md">
                              {rev.user_id?.full_name || `${rev.user_id?.first_name || ""} ${rev.user_id?.last_name || ""}`.trim() || "Guest"}
                            </span>
                            {rev.verifiedPurchase && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-success/10 text-success text-[10px] font-bold rounded-full border border-success/20">
                                <MdVerified size={10} />
                                {t("productDetail.verifiedPurchase")}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-on-surface-variant/70 block mt-0.5">
                            {new Date(rev.createdAt).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US")}
                          </span>
                        </div>
                      </div>
                      
                      {/* Rating stars & Delete (if admin or author) */}
                      <div className="flex items-center gap-3">
                        {renderStars(rev.rating)}
                        {(isMyReview || isAdminUser) && (
                          <button
                            onClick={() => handleDeleteReview(rev._id)}
                            className="p-2 hover:bg-error/10 text-on-surface-variant hover:text-error rounded-full transition"
                            title="Xóa đánh giá"
                          >
                            <MdDelete size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-body-md text-on-surface-variant mt-3 leading-relaxed whitespace-pre-line pl-13">
                        {rev.comment}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 bg-surface-container rounded-2xl border border-dashed border-outline-variant/80">
                <p className="text-body-md text-on-surface-variant">
                  {t("productDetail.noReviews")}
                </p>
              </div>
            )}

            {/* Pagination for reviews */}
            {reviewsTotalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: reviewsTotalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setReviewsPage(pg)}
                    className={`w-9 h-9 rounded-lg font-semibold text-body-sm transition-all ${
                      reviewsPage === pg
                        ? "bg-primary text-surface shadow-sm"
                        : "bg-surface-container hover:bg-surface-container-highest text-on-surface"
                    }`}
                  >
                    {pg}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-start">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 border-2 border-outline-variant rounded-xl text-body-md text-on-surface-variant hover:border-primary hover:text-primary transition-all"
          >
            <MdArrowBack size={18} />
            {t("productDetail.backToList")}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
