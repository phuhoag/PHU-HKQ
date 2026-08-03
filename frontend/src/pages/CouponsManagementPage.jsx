import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import {
  MdConfirmationNumber,
  MdSearch,
  MdRefresh,
  MdAdd,
  MdEdit,
  MdDelete,
  MdClose,
  MdPercent,
  MdAttachMoney,
  MdCalendarToday,
  MdOutlineRule,
} from "react-icons/md";
import { useLanguage } from "../context/LanguageContext.jsx";
import { couponService } from "../services/couponService.js";
import { useToast } from "../context/ToastContext.jsx";

export default function CouponsManagementPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // Form states
  const [addFormData, setAddFormData] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_purchase: 0,
    max_discount: "",
    expiry_date: "",
    usage_limit: "",
    is_active: true,
  });

  const [editFormData, setEditFormData] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_purchase: 0,
    max_discount: "",
    expiry_date: "",
    usage_limit: "",
    is_active: true,
  });

  // Verify authentication & Admin privilege
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
      fetchCoupons();
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await couponService.getAllCoupons();
      if (res.success) {
        setCoupons(res.data || []);
      } else {
        setError(res.message || t("coupons.alertFetchError"));
      }
    } catch (err) {
      setError(t("coupons.alertFetchError") + ": " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.code.trim()) {
      addToast(t("coupons.validateCodeRequired"), "error");
      return;
    }
    if (!addFormData.discount_value || isNaN(parseFloat(addFormData.discount_value))) {
      addToast(t("coupons.validateValueRequired"), "error");
      return;
    }
    if (!addFormData.expiry_date) {
      addToast(t("coupons.validateExpiryRequired"), "error");
      return;
    }

    try {
      const res = await couponService.createCoupon(addFormData);
      if (res.success) {
        addToast(t("coupons.alertCreateSuccess"), "success");
        setAddModalOpen(false);
        setAddFormData({
          code: "",
          discount_type: "percentage",
          discount_value: "",
          min_purchase: 0,
          max_discount: "",
          expiry_date: "",
          usage_limit: "",
          is_active: true,
        });
        fetchCoupons();
      } else {
        addToast(res.message || t("coupons.alertCreateFail"), "error");
      }
    } catch (err) {
      addToast(err.message || t("coupons.alertCreateFail"), "error");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.code.trim()) {
      addToast(t("coupons.validateCodeRequired"), "error");
      return;
    }
    if (!editFormData.discount_value || isNaN(parseFloat(editFormData.discount_value))) {
      addToast(t("coupons.validateValueRequired"), "error");
      return;
    }
    if (!editFormData.expiry_date) {
      addToast(t("coupons.validateExpiryRequired"), "error");
      return;
    }

    try {
      const res = await couponService.updateCoupon(selectedCoupon._id, editFormData);
      if (res.success) {
        addToast(t("coupons.alertUpdateSuccess"), "success");
        setEditModalOpen(false);
        fetchCoupons();
      } else {
        addToast(res.message || t("coupons.alertUpdateFail"), "error");
      }
    } catch (err) {
      addToast(err.message || t("coupons.alertUpdateFail"), "error");
    }
  };

  const handleDelete = async (coupon) => {
    const confirmMessage = t("coupons.alertDeleteConfirm").replace("{code}", coupon.code);
    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await couponService.deleteCoupon(coupon._id);
      if (res.success) {
        addToast(t("coupons.alertDeleteSuccess"), "success");
        fetchCoupons();
      } else {
        addToast(res.message || t("coupons.alertDeleteFail"), "error");
      }
    } catch (err) {
      addToast(err.message || t("coupons.alertDeleteFail"), "error");
    }
  };

  const handleStatusToggle = async (coupon) => {
    try {
      const res = await couponService.updateCoupon(coupon._id, {
        is_active: !coupon.is_active,
      });
      if (res.success) {
        addToast(
          language === "vi"
            ? `Đã cập nhật trạng thái mã ${coupon.code}!`
            : `Updated status of ${coupon.code}!`,
          "success"
        );
        fetchCoupons();
      } else {
        addToast(res.message, "error");
      }
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const openEditModal = (coupon) => {
    setSelectedCoupon(coupon);
    
    // Format expiry date correctly for HTML input type="date"
    let dateStr = "";
    if (coupon.expiry_date) {
      const d = new Date(coupon.expiry_date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      dateStr = `${year}-${month}-${day}`;
    }

    setEditFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_purchase: coupon.min_purchase || 0,
      max_discount: coupon.max_discount || "",
      expiry_date: dateStr,
      usage_limit: coupon.usage_limit || "",
      is_active: coupon.is_active,
    });
    setEditModalOpen(true);
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "" || coupon.discount_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background dark:bg-inverse-surface text-on-background dark:text-inverse-on-surface transition-colors duration-200">
      <Sidebar />
      <main className="ml-64 p-8 min-h-screen">
        <div className="max-w-[1200px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-h1 font-h1 text-on-background flex items-center gap-2">
                  <MdConfirmationNumber className="text-primary" />
                  {t("coupons.title")}
                </h1>
                <p className="text-body-md text-on-surface-variant mt-1">
                  {t("coupons.description")}
                </p>
              </div>

              <button
                onClick={() => setAddModalOpen(true)}
                className="px-4 py-2 bg-primary text-surface rounded-xl hover:bg-primary/95 flex items-center gap-2 font-semibold shadow-sm transition"
              >
                <MdAdd size={20} />
                {t("coupons.addCoupon")}
              </button>
            </div>

            {/* Filter Section */}
            <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <MdSearch
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60"
                />
                <input
                  type="text"
                  placeholder={t("coupons.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-outline-variant rounded-xl bg-surface text-body-sm focus:border-primary outline-none uppercase"
                />
              </div>

              <div className="flex gap-4">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border-2 border-outline-variant rounded-xl bg-surface text-body-sm outline-none focus:border-primary"
                >
                  <option value="">{language === "vi" ? "Tất cả các loại" : "All Types"}</option>
                  <option value="percentage">{t("coupons.typePercentage")}</option>
                  <option value="fixed">{t("coupons.typeFixed")}</option>
                </select>

                <button
                  onClick={fetchCoupons}
                  title="Tải lại dữ liệu"
                  className="p-2 border-2 border-outline-variant rounded-xl hover:bg-surface-container-low text-on-surface-variant transition active:scale-95"
                >
                  <MdRefresh size={20} />
                </button>
              </div>
            </div>

            {/* Coupons Content */}
            {error && (
              <div className="p-4 bg-error/10 border border-error/20 text-error rounded-xl mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-body-md text-on-surface-variant">
                  {language === "vi" ? "Đang tải dữ liệu..." : "Loading coupons list..."}
                </p>
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-16 text-center">
                <MdConfirmationNumber size={64} className="text-on-surface-variant/30 mx-auto mb-4" />
                <p className="text-body-lg font-semibold text-on-surface-variant mb-2">
                  {t("coupons.noCoupons")}
                </p>
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant">
                        <th className="py-4 px-6 text-left text-body-sm font-bold text-on-surface-variant">
                          {t("coupons.tableCode")}
                        </th>
                        <th className="py-4 px-6 text-left text-body-sm font-bold text-on-surface-variant">
                          {t("coupons.tableType")}
                        </th>
                        <th className="py-4 px-6 text-left text-body-sm font-bold text-on-surface-variant">
                          {t("coupons.tableValue")}
                        </th>
                        <th className="py-4 px-6 text-left text-body-sm font-bold text-on-surface-variant">
                          {t("coupons.tableMinPurchase")}
                        </th>
                        <th className="py-4 px-6 text-left text-body-sm font-bold text-on-surface-variant">
                          {t("coupons.tableExpiry")}
                        </th>
                        <th className="py-4 px-6 text-left text-body-sm font-bold text-on-surface-variant">
                          {language === "vi" ? "Lượt dùng" : "Usage (Used/Limit)"}
                        </th>
                        <th className="py-4 px-6 text-left text-body-sm font-bold text-on-surface-variant">
                          {t("coupons.tableStatus")}
                        </th>
                        <th className="py-4 px-6 text-center text-body-sm font-bold text-on-surface-variant">
                          {t("coupons.tableActions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/65">
                      {filteredCoupons.map((coupon) => {
                        const isExpired = new Date(coupon.expiry_date) < new Date();
                        const isLimitReached =
                          coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit;

                        return (
                          <tr
                            key={coupon._id}
                            className={`hover:bg-surface-container-low/40 transition duration-150 ${
                              !coupon.is_active || isExpired ? "opacity-60 bg-surface/30" : ""
                            }`}
                          >
                            {/* Code */}
                            <td className="py-4 px-6">
                              <span className="font-mono text-body-md font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                                {coupon.code}
                              </span>
                            </td>

                            {/* Type */}
                            <td className="py-4 px-6 text-body-sm text-on-surface font-medium">
                              {coupon.discount_type === "percentage" ? (
                                <span className="flex items-center gap-1.5 text-blue-600">
                                  <MdPercent /> {t("coupons.typePercentage")}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 text-green-600">
                                  <MdAttachMoney /> {t("coupons.typeFixed")}
                                </span>
                              )}
                            </td>

                            {/* Value */}
                            <td className="py-4 px-6 text-body-md font-bold text-on-background">
                              {coupon.discount_type === "percentage"
                                ? `${coupon.discount_value}%`
                                : `$${coupon.discount_value.toFixed(2)}`}
                            </td>

                            {/* Min Purchase */}
                            <td className="py-4 px-6 text-body-sm text-on-surface-variant font-medium">
                              ${coupon.min_purchase.toFixed(2)}
                            </td>

                            {/* Expiry Date */}
                            <td className="py-4 px-6 text-body-sm font-medium">
                              <span
                                className={`flex items-center gap-1.5 ${
                                  isExpired ? "text-error font-bold" : "text-on-surface-variant"
                                }`}
                              >
                                <MdCalendarToday size={14} />
                                {new Date(coupon.expiry_date).toLocaleDateString(
                                  language === "vi" ? "vi-VN" : "en-US"
                                )}
                              </span>
                            </td>

                            {/* Usage info */}
                            <td className="py-4 px-6 text-body-sm text-on-surface font-medium">
                              <span className="font-semibold">{coupon.usage_count}</span>
                              <span className="text-on-surface-variant/50">
                                {" "}/{" "}
                                {coupon.usage_limit !== null
                                  ? coupon.usage_limit
                                  : t("coupons.unlimited")}
                              </span>
                              {isLimitReached && (
                                <span className="ml-2 text-[10px] bg-error/10 text-error px-1.5 py-0.5 rounded font-bold uppercase">
                                  {language === "vi" ? "Hết lượt" : "Full"}
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-4 px-6">
                              <button
                                onClick={() => handleStatusToggle(coupon)}
                                disabled={isExpired}
                                className={`px-2.5 py-1 rounded-full text-body-xs font-bold transition active:scale-95 ${
                                  isExpired
                                    ? "bg-surface-container text-on-surface-variant/50 cursor-not-allowed"
                                    : coupon.is_active
                                    ? "bg-success/15 text-success hover:bg-success/20"
                                    : "bg-error/15 text-error hover:bg-error/20"
                                }`}
                              >
                                {isExpired
                                  ? (language === "vi" ? "Hết hạn" : "Expired")
                                  : coupon.is_active
                                  ? t("coupons.active")
                                  : t("coupons.inactive")}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openEditModal(coupon)}
                                  className="p-1.5 border border-outline hover:border-primary hover:text-primary rounded-lg text-on-surface-variant transition duration-200 active:scale-90"
                                  title={t("coupons.editModalTitle")}
                                >
                                  <MdEdit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(coupon)}
                                  className="p-1.5 border border-outline hover:border-error hover:text-error rounded-lg text-on-surface-variant transition duration-200 active:scale-90"
                                  title="Xóa mã giảm giá"
                                >
                                  <MdDelete size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      </main>

      {/* =============================================
          MODAL: ADD NEW COUPON
      ============================================= */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface rounded-2xl w-full max-w-[500px] border border-outline-variant shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="text-h3 font-h3 text-on-surface flex items-center gap-2">
                <MdAdd className="text-primary" />
                {t("coupons.addModalTitle")}
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 hover:bg-surface-container text-on-surface-variant hover:text-on-surface rounded-full transition"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">
                  {t("coupons.labelCode")}
                </label>
                <input
                  type="text"
                  required
                  value={addFormData.code}
                  onChange={(e) => setAddFormData({ ...addFormData, code: e.target.value })}
                  placeholder="E.g., SUMMERSALE10"
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface uppercase outline-none focus:border-primary transition"
                />
              </div>

              {/* Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">
                    {t("coupons.labelType")}
                  </label>
                  <select
                    value={addFormData.discount_type}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, discount_type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none cursor-pointer focus:border-primary transition"
                  >
                    <option value="percentage">{t("coupons.typePercentage")}</option>
                    <option value="fixed">{t("coupons.typeFixed")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">
                    {t("coupons.labelValue")}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={addFormData.discount_value}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, discount_value: e.target.value })
                    }
                    placeholder={addFormData.discount_type === "percentage" ? "10 (%)" : "15 ($)"}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Min Purchase & Max Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">
                    {t("coupons.labelMinPurchase")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addFormData.min_purchase}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, min_purchase: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">
                    {t("coupons.labelMaxDiscount")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={addFormData.discount_type === "fixed"}
                    value={addFormData.max_discount}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, max_discount: e.target.value })
                    }
                    placeholder="Unlimited"
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary disabled:opacity-40 disabled:bg-surface-container transition"
                  />
                </div>
              </div>

              {/* Expiry Date & Usage Limit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">
                    {t("coupons.labelExpiry")}
                  </label>
                  <input
                    type="date"
                    required
                    value={addFormData.expiry_date}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, expiry_date: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">
                    {t("coupons.labelLimit")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={addFormData.usage_limit}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, usage_limit: e.target.value })
                    }
                    placeholder="Unlimited"
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Status active */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="add-is-active"
                  checked={addFormData.is_active}
                  onChange={(e) => setAddFormData({ ...addFormData, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary border-outline rounded focus:ring-primary focus:ring-opacity-40 cursor-pointer"
                />
                <label htmlFor="add-is-active" className="text-body-sm text-on-surface font-semibold cursor-pointer">
                  {t("coupons.labelActive")}
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant bg-surface">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-5 py-2 border border-outline rounded-lg text-on-background hover:bg-surface-container transition font-semibold"
                >
                  {t("coupons.buttonCancel")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-surface rounded-lg hover:bg-primary/95 transition font-semibold"
                >
                  {t("coupons.buttonSave")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============================================
          MODAL: EDIT COUPON
      ============================================= */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface rounded-2xl w-full max-w-[500px] border border-outline-variant shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="text-h3 font-h3 text-on-surface flex items-center gap-2">
                <MdEdit className="text-primary" />
                {t("coupons.editModalTitle")}
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 hover:bg-surface-container text-on-surface-variant hover:text-on-surface rounded-full transition"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">
                  {t("coupons.labelCode")}
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.code}
                  onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                  placeholder="E.g., SUMMERSALE10"
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface uppercase outline-none focus:border-primary transition"
                />
              </div>

              {/* Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">
                    {t("coupons.labelType")}
                  </label>
                  <select
                    value={editFormData.discount_type}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, discount_type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none cursor-pointer focus:border-primary transition"
                  >
                    <option value="percentage">{t("coupons.typePercentage")}</option>
                    <option value="fixed">{t("coupons.typeFixed")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">
                    {t("coupons.labelValue")}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={editFormData.discount_value}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, discount_value: e.target.value })
                    }
                    placeholder={editFormData.discount_type === "percentage" ? "10 (%)" : "15 ($)"}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Min Purchase & Max Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">
                    {t("coupons.labelMinPurchase")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.min_purchase}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, min_purchase: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">
                    {t("coupons.labelMaxDiscount")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={editFormData.discount_type === "fixed"}
                    value={editFormData.max_discount}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, max_discount: e.target.value })
                    }
                    placeholder="Unlimited"
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary disabled:opacity-40 disabled:bg-surface-container transition"
                  />
                </div>
              </div>

              {/* Expiry Date & Usage Limit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">
                    {t("coupons.labelExpiry")}
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.expiry_date}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, expiry_date: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">
                    {t("coupons.labelLimit")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editFormData.usage_limit}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, usage_limit: e.target.value })
                    }
                    placeholder="Unlimited"
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Status active */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="edit-is-active"
                  checked={editFormData.is_active}
                  onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary border-outline rounded focus:ring-primary focus:ring-opacity-40 cursor-pointer"
                />
                <label htmlFor="edit-is-active" className="text-body-sm text-on-surface font-semibold cursor-pointer">
                  {t("coupons.labelActive")}
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant bg-surface">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-5 py-2 border border-outline rounded-lg text-on-background hover:bg-surface-container transition font-semibold"
                >
                  {t("coupons.buttonCancel")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-surface rounded-lg hover:bg-primary/95 transition font-semibold"
                >
                  {t("coupons.buttonUpdate")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
