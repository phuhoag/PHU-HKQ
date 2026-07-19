import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import {
  MdRateReview,
  MdStar,
  MdSearch,
  MdRefresh,
  MdDelete,
  MdVerified,
  MdWarning,
} from "react-icons/md";
import { useLanguage } from "../context/LanguageContext.jsx";
import { reviewService } from "../services/reviewService.js";
import { useToast } from "../context/ToastContext.jsx";

export default function ReviewsManagementPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  // Authenticate user is Admin
  useEffect(() => {
    const userString = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !userString) {
      navigate("/login");
      return;
    }

    try {
      const userData = JSON.parse(userString);
      if (userData.role !== "admin") {
        navigate("/dashboard");
        return;
      }
      fetchReviews();
    } catch {
      navigate("/login");
    }
  }, [navigate, page, ratingFilter]); // refetch when page or rating changes

  // Fetch reviews via service
  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reviewService.getAdminReviews({
        page,
        limit: 8,
        search: searchTerm,
        rating: ratingFilter,
      });

      if (res.success && res.data) {
        setReviews(res.data.reviews || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalReviews(res.data.pagination?.total || 0);
      } else {
        setError(res.message || "Failed to load reviews");
      }
    } catch (err) {
      setError(err.message || "Server connection error");
    } finally {
      setLoading(false);
    }
  };

  // Perform search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReviews();
  };

  // Clear search & filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setRatingFilter("");
    setPage(1);
  };

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    const confirmDelete = window.confirm(
      language === "vi"
        ? "Bạn có chắc chắn muốn xóa đánh giá này khỏi hệ thống?"
        : "Are you sure you want to delete this review from the system?"
    );
    if (!confirmDelete) return;

    try {
      const res = await reviewService.deleteReview(reviewId);
      if (res.success) {
        addToast(
          language === "vi" ? "Đã xóa đánh giá thành công!" : "Review deleted successfully!",
          "success"
        );
        // Refresh reviews list
        fetchReviews();
      } else {
        addToast(res.message || "Failed to delete review", "error");
      }
    } catch (err) {
      addToast(err.message || "Failed to delete review", "error");
    }
  };

  // Helper to render stars
  const renderStars = (rating) => {
    return (
      <div className="flex text-warning">
        {Array.from({ length: 5 }).map((_, i) => (
          <MdStar
            key={i}
            className={i < rating ? "text-warning" : "text-outline-variant/30"}
            size={18}
          />
        ))}
      </div>
    );
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background dark:bg-inverse-surface text-on-background dark:text-inverse-on-surface transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 p-8 min-h-screen">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-outline-variant dark:border-outline">
          <div>
            <h1 className="text-h1 font-h1 font-bold text-on-background flex items-center gap-2">
              <MdRateReview className="text-primary" size={32} />
              {language === "vi" ? "Quản lý đánh giá sản phẩm" : "Customer Reviews Management"}
            </h1>
            <p className="text-body-sm text-on-surface-variant mt-2">
              {language === "vi"
                ? "Xem, kiểm duyệt và quản lý toàn bộ các phản hồi, đánh giá từ khách hàng"
                : "View, moderate, and manage all product feedback and reviews from customers"}
            </p>
          </div>
          <button
            onClick={fetchReviews}
            className="flex items-center gap-2 px-4 py-2 border border-outline rounded-lg text-body-sm hover:bg-surface-container transition"
          >
            <MdRefresh size={18} />
            {language === "vi" ? "Làm mới" : "Refresh"}
          </button>
        </div>

        {/* Filter and Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={
                language === "vi"
                  ? "Tìm kiếm bình luận đánh giá..."
                  : "Search reviews comments..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-outline-variant bg-surface text-on-surface outline-none focus:border-primary transition text-body-sm"
            />
            <MdSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant"
              size={20}
            />
          </div>

          <div className="flex gap-4">
            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 rounded-lg border-2 border-outline-variant bg-surface text-on-surface outline-none focus:border-primary transition text-body-sm"
            >
              <option value="">
                {language === "vi" ? "Tất cả điểm số (Sao)" : "All Ratings (Stars)"}
              </option>
              <option value="5">5 {language === "vi" ? "Sao" : "Stars"}</option>
              <option value="4">4 {language === "vi" ? "Sao" : "Stars"}</option>
              <option value="3">3 {language === "vi" ? "Sao" : "Stars"}</option>
              <option value="2">2 {language === "vi" ? "Sao" : "Stars"}</option>
              <option value="1">1 {language === "vi" ? "Sao" : "Stars"}</option>
            </select>

            {/* Reset filters */}
            {(searchTerm || ratingFilter) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2.5 text-body-sm text-error bg-error/10 hover:bg-error/15 rounded-lg transition"
              >
                {language === "vi" ? "Xóa bộ lọc" : "Clear Filters"}
              </button>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-primary text-surface font-semibold rounded-lg hover:bg-primary/95 transition text-body-sm"
            >
              {language === "vi" ? "Tìm kiếm" : "Search"}
            </button>
          </div>
        </form>

        {/* --- Loading State --- */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-container rounded-2xl border border-outline-variant/60 animate-pulse">
            <span className="text-body-md text-on-surface-variant">
              {language === "vi" ? "Đang tải dữ liệu đánh giá..." : "Loading reviews data..."}
            </span>
          </div>
        )}

        {/* --- Error State --- */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-10 bg-error/5 border border-error/20 rounded-2xl text-center px-4">
            <MdWarning className="text-error mb-2" size={40} />
            <h3 className="text-h3 font-h3 text-on-surface">
              {language === "vi" ? "Lỗi tải dữ liệu" : "Data Loading Error"}
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-1">{error}</p>
          </div>
        )}

        {/* --- Reviews List --- */}
        {!loading && !error && (
          <div>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="bg-surface-container rounded-2xl p-6 border border-outline-variant flex flex-col md:flex-row gap-6 shadow-sm hover:shadow transition duration-200"
                  >
                    {/* Left: Product info */}
                    <div className="w-full md:w-1/4 flex gap-3 border-r border-outline-variant/60 pr-4 flex-shrink-0">
                      <div className="w-16 h-16 rounded-xl bg-surface overflow-hidden border border-outline-variant flex-shrink-0">
                        {rev.product_id?.image ? (
                          <img
                            src={rev.product_id.image}
                            alt={rev.product_id.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-surface-container flex items-center justify-center text-xl">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-on-surface-variant font-medium block">
                          Product
                        </span>
                        <h4 className="text-body-sm font-semibold text-on-surface truncate">
                          {rev.product_id?.name || "N/A"}
                        </h4>
                        <span className="text-xs text-primary font-bold">
                          ${rev.product_id?.price ? parseFloat(rev.product_id.price.$numberDecimal || rev.product_id.price).toFixed(2) : "0.00"}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Review Content */}
                    <div className="flex-1 min-w-0">
                      {/* Review Header info */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm overflow-hidden border border-primary/20">
                            {rev.user_id?.avatar ? (
                              <img
                                src={rev.user_id.avatar}
                                alt="avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (rev.user_id?.full_name || rev.user_id?.first_name || "?")
                                .charAt(0)
                                .toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-on-surface text-body-sm">
                              {rev.user_id?.full_name ||
                                `${rev.user_id?.first_name || ""} ${rev.user_id?.last_name || ""}`.trim() ||
                                "Guest"}
                            </span>
                            <span className="text-xs text-on-surface-variant/70 ml-2">
                              ({rev.user_id?.email || "Guest"})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {renderStars(rev.rating)}
                          {rev.verifiedPurchase && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-success/10 text-success text-[10px] font-bold rounded-full border border-success/20">
                              <MdVerified size={10} />
                              {language === "vi" ? "Đã mua hàng" : "Verified"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Comment */}
                      <p className="text-body-sm text-on-surface-variant leading-relaxed whitespace-pre-line bg-surface p-3.5 rounded-xl border border-outline-variant/40 mt-3">
                        {rev.comment || <i>{language === "vi" ? "(Không có nội dung bình luận)" : "(No comment text)"}</i>}
                      </p>

                      {/* Date */}
                      <span className="text-xs text-on-surface-variant/60 block mt-2 text-right">
                        {formatDate(rev.createdAt)}
                      </span>
                    </div>

                    {/* Right: Deletion action */}
                    <div className="flex items-center justify-end md:justify-center border-t md:border-t-0 md:border-l border-outline-variant/60 pt-4 md:pt-0 pl-0 md:pl-4">
                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        className="p-3 bg-error/10 hover:bg-error/15 text-error rounded-xl transition flex items-center gap-2 text-body-sm font-semibold"
                        title={language === "vi" ? "Xóa đánh giá này" : "Delete this review"}
                      >
                        <MdDelete size={18} />
                        <span className="md:hidden">
                          {language === "vi" ? "Xóa đánh giá" : "Delete"}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-surface-container rounded-2xl border-2 border-dashed border-outline-variant/80">
                <MdRateReview className="text-on-surface-variant/30 mx-auto mb-3 animate-bounce" size={48} />
                <p className="text-body-md text-on-surface-variant font-medium">
                  {language === "vi"
                    ? "Không tìm thấy đánh giá nào trùng khớp."
                    : "No matching reviews found."}
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-10 h-10 rounded-lg font-semibold text-body-sm transition-all ${
                      page === pg
                        ? "bg-primary text-surface shadow"
                        : "bg-surface-container hover:bg-surface-container-highest text-on-surface"
                    }`}
                  >
                    {pg}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
