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

  // Reset lỗi ảnh mỗi khi ảnh chính thay đổi
  useEffect(() => {
    setImageError(false);
  }, [activeImage]);

  const inWishlist = product ? isInWishlist(product._id || product.id) : false;

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
                {t("productDetail.stockLabel")}{" "}
                <span
                  className={`font-semibold ${
                    product.stock > 10
                      ? "text-success"
                      : product.stock > 0
                      ? "text-warning"
                      : "text-error"
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} ${t("productDetail.stockCount")}` : t("productDetail.outOfStock")}
                </span>
              </span>
            </div>

            {/* Price */}
            <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-[2.5rem] font-bold text-primary leading-none">
                ${price.toFixed(2)}
              </p>
              <p className="text-body-sm text-on-surface-variant mt-1">
                {t("productDetail.taxIncluded")}
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-body-md font-bold text-on-surface mb-2">
                  {t("productDetail.descriptionTitle")}
                </h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-body-md text-on-surface-variant">
                {t("productDetail.quantityLabel")}
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
                  ? t("productDetail.addedToCartToast")
                  : addingToCart
                  ? t("productDetail.addingToCartToast")
                  : isInStock
                  ? t("productDetail.addToCart")
                  : t("productDetail.outOfStock")}
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
                <span>{t("productDetail.freeShippingPromo")}</span>
              </div>
              <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <MdVerified className="text-primary text-[18px]" />
                <span>{t("productDetail.warrantyPromo")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== GALLERY SECTION ===== */}

        {galleryImages.length > 0 && (
          <div className="mb-12">
            <h2 className="text-h3 font-h3 text-on-surface mb-6">
              🖼️ {t("productDetail.imagesTitle")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {galleryImages.map((img) => (
                <button
                  key={img._id}
                  onClick={() => setActiveImage(img.image_url)}
                  title={img.alt_text || product.name}
                  className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    activeImage === img.image_url
                      ? "border-primary ring-2 ring-primary/30 shadow-lg"
                      : "border-outline-variant hover:border-primary/60 hover:shadow-md"
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={img.alt_text || product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = "none";
                      const fallback = e.target.parentNode.querySelector(".gallery-fallback");
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  {/* Fallback khi ảnh lỗi */}
                  <div
                    className="gallery-fallback absolute inset-0 bg-surface-container items-center justify-center"
                    style={{ display: "none" }}
                  >
                    <span className="text-2xl">🖼️</span>
                  </div>
                  {/* Primary badge */}
                  {img.is_primary && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-primary text-surface text-[10px] font-bold rounded-full z-10">
                      {t("productDetail.primaryBadge")}
                    </span>
                  )}
                  {/* Active overlay */}
                  {activeImage === img.image_url && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center z-10">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
            <h2 className="text-h3 font-h3 text-on-surface mb-4">
              {t("productDetail.infoTitle")}
            </h2>
            <table className="w-full">
              <tbody className="divide-y divide-outline-variant">
                <tr>
                  <td className="py-3 text-body-sm text-on-surface-variant w-1/3">
                    {t("productDetail.nameLabel")}
                  </td>
                  <td className="py-3 text-body-md text-on-surface font-medium">
                    {product.name}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-body-sm text-on-surface-variant">
                    {t("productDetail.categoryLabel")}
                  </td>
                  <td className="py-3 text-body-md text-on-surface font-medium">
                    {categoryName}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-body-sm text-on-surface-variant">
                    {t("productDetail.priceLabel")}
                  </td>
                  <td className="py-3 text-body-md text-primary font-bold">
                    ${price.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-body-sm text-on-surface-variant">
                    {t("productDetail.stockLabel")}
                  </td>
                  <td className="py-3 text-body-md text-on-surface font-medium">
                    {product.stock} {t("productDetail.stockCount")}
                  </td>
                </tr>
                {product.createdAt && (
                  <tr>
                    <td className="py-3 text-body-sm text-on-surface-variant">
                      {t("productDetail.createdAtLabel")}
                    </td>
                    <td className="py-3 text-body-md text-on-surface">
                      {new Date(product.createdAt).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
            <h2 className="text-h3 font-h3 text-on-surface mb-4">
              {t("productDetail.policyTitle")}
            </h2>
            <ul className="space-y-3">
              {[
                t("productDetail.policyExchange"),
                t("productDetail.policyDelivery"),
                t("productDetail.policyWarranty"),
                t("productDetail.policyPayment"),
                t("productDetail.policyGift"),
              ].map((item, i) => (
                <li key={i} className="text-body-sm text-on-surface-variant">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

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
              {authService.isLoggedIn() ? (
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
