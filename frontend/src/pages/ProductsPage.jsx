import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import {
  MdShoppingCart,
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdCategory,
  MdArrowBack,
  MdWarning,
  MdClose,
} from "react-icons/md";

export default function ProductsPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Active Tab: "products" or "categories"
  const [activeTab, setActiveTab] = useState("products");

  // Products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Modals state
  const [productModal, setProductModal] = useState({
    isOpen: false,
    mode: "add", // "add" or "edit"
    data: {
      _id: "",
      name: "",
      category_id: "",
      price: "",
      stock: "",
      description: "",
      image: "",
    },
  });

  const [categoryModal, setCategoryModal] = useState({
    isOpen: false,
    mode: "add", // "add" or "edit"
    data: {
      _id: "",
      name: "",
      description: "",
      image: "",
    },
  });

  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);

  const handleProductImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("❌ Dung lượng ảnh không được vượt quá 5MB!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setUploadingProductImage(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const res = await response.json();
      if (response.ok && res.success) {
        setProductModal((prev) => ({
          ...prev,
          data: {
            ...prev.data,
            image: res.url,
          },
        }));
      } else {
        alert("❌ Upload thất bại: " + (res.message || "Lỗi không xác định"));
      }
    } catch (err) {
      alert("❌ Lỗi upload: " + err.message);
    } finally {
      setUploadingProductImage(false);
    }
  };

  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("❌ Dung lượng ảnh không được vượt quá 5MB!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setUploadingCategoryImage(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const res = await response.json();
      if (response.ok && res.success) {
        setCategoryModal((prev) => ({
          ...prev,
          data: {
            ...prev.data,
            image: res.url,
          },
        }));
      } else {
        alert("❌ Upload thất bại: " + (res.message || "Lỗi không xác định"));
      }
    } catch (err) {
      alert("❌ Lỗi upload: " + err.message);
    } finally {
      setUploadingCategoryImage(false);
    }
  };

  // Verify Admin role on mount
  useEffect(() => {
    const userString = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !userString) {
      navigate("/login");
      return;
    }

    try {
      const userData = JSON.parse(userString);
      setCurrentUser(userData);

      if (userData.role === "admin") {
        setIsAdmin(true);
        fetchProducts(token, 1, productSearch, productCategoryFilter);
        fetchCategories(token);
      } else {
        navigate("/dashboard");
      }
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch products
  const fetchProducts = async (token = localStorage.getItem("token"), page = 1, search = "", category = "") => {
    setLoadingProducts(true);
    try {
      const query = new URLSearchParams({
        page,
        limit: 8,
      });
      if (search) query.set("search", search);
      if (category) query.set("category", category);

      const response = await fetch(`/api/products?${query.toString()}`);
      const res = await response.json();
      if (res.success) {
        setProducts(res.data || []);
        setProductTotalPages(res.pagination?.totalPages || 1);
        setProductPage(res.pagination?.page || 1);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch categories
  const fetchCategories = async (token = localStorage.getItem("token")) => {
    setLoadingCategories(true);
    try {
      const response = await fetch("/api/categories");
      const res = await response.json();
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Trigger search / filter
  useEffect(() => {
    if (isAdmin) {
      fetchProducts(localStorage.getItem("token"), 1, productSearch, productCategoryFilter);
    }
  }, [productSearch, productCategoryFilter]);

  // Product CRUD Handlers
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const { _id, name, category_id, price, stock, description, image } = productModal.data;

    if (!name || !category_id || !price) {
      alert("Tên, danh mục và giá sản phẩm là bắt buộc!");
      return;
    }

    const url = productModal.mode === "add" ? "/api/products" : `/api/products/${_id}`;
    const method = productModal.mode === "add" ? "POST" : "PUT";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          category_id,
          price: parseFloat(price),
          stock: parseInt(stock) || 0,
          description,
          image,
        }),
      });

      const res = await response.json();
      if (response.ok) {
        alert(productModal.mode === "add" ? "✅ Tạo sản phẩm thành công!" : "✅ Cập nhật sản phẩm thành công!");
        setProductModal({ ...productModal, isOpen: false });
        fetchProducts(token, productPage, productSearch, productCategoryFilter);
      } else {
        alert("❌ " + (res.message || "Thao tác thất bại"));
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("🗑️ Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      if (response.ok) {
        alert("✅ Xóa sản phẩm thành công!");
        fetchProducts(token, productPage, productSearch, productCategoryFilter);
      } else {
        alert("❌ " + (res.message || "Xóa sản phẩm thất bại"));
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  // Category CRUD Handlers
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const { _id, name, description, image } = categoryModal.data;

    if (!name) {
      alert("Tên danh mục là bắt buộc!");
      return;
    }

    const url = categoryModal.mode === "add" ? "/api/categories" : `/api/categories/${_id}`;
    const method = categoryModal.mode === "add" ? "POST" : "PUT";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description, image }),
      });

      const res = await response.json();
      if (response.ok) {
        alert(categoryModal.mode === "add" ? "✅ Tạo danh mục thành công!" : "✅ Cập nhật danh mục thành công!");
        setCategoryModal({ ...categoryModal, isOpen: false });
        fetchCategories(token);
      } else {
        alert("❌ " + (res.message || "Thao tác thất bại"));
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("🗑️ Bạn có chắc muốn xóa danh mục này? Tất cả sản phẩm thuộc danh mục sẽ không đổi nhưng danh mục sẽ bị mất.")) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      if (response.ok) {
        alert("✅ Xóa danh mục thành công!");
        fetchCategories(token);
      } else {
        alert("❌ " + (res.message || "Xóa danh mục thất bại"));
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-inverse-surface text-on-background dark:text-inverse-on-surface transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-64 p-8 min-h-screen">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-outline-variant dark:border-outline">
          <div>
            <h1 className="text-h1 font-h1 text-on-background dark:text-inverse-on-surface flex items-center gap-3">
              <MdShoppingCart className="text-primary" size={32} />
              Quản lý sản phẩm & danh mục
            </h1>
            <p className="text-body-md text-on-surface-variant dark:text-surface-variant mt-1">
              Thêm, sửa, xóa sản phẩm và phân nhóm danh mục sản phẩm của cửa hàng.
            </p>
          </div>
          <div>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-body-md font-body-md border border-outline rounded-lg text-on-background hover:bg-surface-container transition"
            >
              <MdArrowBack size={18} />
              Về Dashboard
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant mb-6 gap-4">
          <button
            onClick={() => setActiveTab("products")}
            className={`py-3 px-4 text-body-md font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "products"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <MdShoppingCart size={20} />
            Sản phẩm ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`py-3 px-4 text-body-md font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "categories"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <MdCategory size={20} />
            Danh mục ({categories.length})
          </button>
        </div>

        {/* Tab Contents: Products */}
        {activeTab === "products" && (
          <div>
            {/* Filters & Add Button */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
              <div className="flex flex-1 gap-3 w-full md:max-w-xl">
                {/* Search */}
                <div className="relative flex-1">
                  <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                  />
                </div>
                {/* Category filter */}
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none cursor-pointer focus:border-primary transition"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add product button */}
              <button
                onClick={() =>
                  setProductModal({
                    isOpen: true,
                    mode: "add",
                    data: { name: "", category_id: categories[0]?._id || "", price: "", stock: "", description: "", image: "" },
                  })
                }
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-surface font-semibold rounded-lg hover:bg-primary/90 transition shadow-sm w-full md:w-auto justify-center"
              >
                <MdAdd size={20} />
                Thêm sản phẩm
              </button>
            </div>

            {/* Products Table */}
            {loadingProducts ? (
              <p className="text-center py-10 text-body-md text-on-surface-variant">Đang tải danh sách sản phẩm...</p>
            ) : products.length === 0 ? (
              <div className="text-center py-10 bg-surface-container-lowest border border-outline-variant rounded-xl">
                <p className="text-body-md text-on-surface-variant">Không tìm thấy sản phẩm nào.</p>
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-container border-b border-outline-variant">
                      <tr>
                        <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Hình ảnh</th>
                        <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Tên sản phẩm</th>
                        <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Danh mục</th>
                        <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Giá bán</th>
                        <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Kho hàng</th>
                        <th className="px-6 py-4 text-center text-label-md font-label-md text-on-surface-variant">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p._id} className="border-b border-outline-variant hover:bg-surface-container/30 transition">
                          <td className="px-6 py-4">
                            <img
                              src={p.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=100"}
                              alt={p.name}
                              className="w-12 h-12 rounded bg-surface object-cover border border-outline-variant"
                            />
                          </td>
                          <td className="px-6 py-4 font-semibold text-body-md text-on-surface">{p.name}</td>
                          <td className="px-6 py-4 text-body-md text-on-surface-variant">{p.category_id?.name || "N/A"}</td>
                          <td className="px-6 py-4 font-semibold text-body-md text-primary">
                            ${Number(p.price?.$numberDecimal || p.price || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-body-md text-on-surface">
                            <span className={`px-2.5 py-0.5 rounded font-semibold ${p.stock > 10 ? "bg-success/15 text-success" : p.stock > 0 ? "bg-warning/15 text-warning" : "bg-error/15 text-error"}`}>
                              {p.stock} sản phẩm
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() =>
                                  setProductModal({
                                    isOpen: true,
                                    mode: "edit",
                                    data: {
                                      _id: p._id,
                                      name: p.name,
                                      category_id: p.category_id?._id || p.category_id || "",
                                      price: p.price?.$numberDecimal || p.price || "",
                                      stock: p.stock,
                                      description: p.description || "",
                                      image: p.image || "",
                                    },
                                  })
                                }
                                className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition"
                                title="Sửa sản phẩm"
                              >
                                <MdEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p._id)}
                                className="p-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition"
                                title="Xóa sản phẩm"
                              >
                                <MdDelete size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Product Pagination */}
                {productTotalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-outline-variant p-4">
                    <button
                      onClick={() => fetchProducts(localStorage.getItem("token"), productPage - 1, productSearch, productCategoryFilter)}
                      disabled={productPage === 1}
                      className="px-4 py-2 border border-outline-variant rounded-lg text-body-sm font-semibold hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Trước
                    </button>
                    <span className="text-body-sm text-on-surface-variant font-semibold">Trang {productPage} / {productTotalPages}</span>
                    <button
                      onClick={() => fetchProducts(localStorage.getItem("token"), productPage + 1, productSearch, productCategoryFilter)}
                      disabled={productPage === productTotalPages}
                      className="px-4 py-2 border border-outline-variant rounded-lg text-body-sm font-semibold hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab Contents: Categories */}
        {activeTab === "categories" && (
          <div>
            <div className="flex justify-end mb-6">
              <button
                onClick={() =>
                  setCategoryModal({
                    isOpen: true,
                    mode: "add",
                    data: { name: "", description: "", image: "" },
                  })
                }
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-surface font-semibold rounded-lg hover:bg-primary/90 transition shadow-sm w-full md:w-auto justify-center"
              >
                <MdAdd size={20} />
                Thêm danh mục
              </button>
            </div>

            {loadingCategories ? (
              <p className="text-center py-10 text-body-md text-on-surface-variant">Đang tải danh mục...</p>
            ) : categories.length === 0 ? (
              <div className="text-center py-10 bg-surface-container-lowest border border-outline-variant rounded-xl">
                <p className="text-body-md text-on-surface-variant">Chưa có danh mục nào được tạo.</p>
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead className="bg-surface-container border-b border-outline-variant">
                    <tr>
                      <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Hình ảnh</th>
                      <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Tên danh mục</th>
                      <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Mô tả</th>
                      <th className="px-6 py-4 text-center text-label-md font-label-md text-on-surface-variant">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c._id} className="border-b border-outline-variant hover:bg-surface-container/30 transition">
                        <td className="px-6 py-4">
                          <img
                            src={c.image || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=100"}
                            alt={c.name}
                            className="w-12 h-12 rounded bg-surface object-cover border border-outline-variant"
                          />
                        </td>
                        <td className="px-6 py-4 font-semibold text-body-md text-on-surface">{c.name}</td>
                        <td className="px-6 py-4 text-body-md text-on-surface-variant truncate max-w-xs">{c.description || "Chưa có mô tả"}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() =>
                                setCategoryModal({
                                  isOpen: true,
                                  mode: "edit",
                                  data: {
                                    _id: c._id,
                                    name: c.name,
                                    description: c.description || "",
                                    image: c.image || "",
                                  },
                                })
                              }
                              className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition"
                              title="Sửa danh mục"
                            >
                              <MdEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(c._id)}
                              className="p-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition"
                              title="Xóa danh mục"
                            >
                              <MdDelete size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Product Modal */}
      {productModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-xl shadow-lg flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant">
              <h2 className="text-h2 font-h2 text-on-surface font-bold">
                {productModal.mode === "add" ? "Thêm sản phẩm mới" : "Sửa thông tin sản phẩm"}
              </h2>
              <button
                onClick={() => setProductModal({ ...productModal, isOpen: false })}
                className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant transition"
              >
                <MdClose size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={productModal.data.name}
                  onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, name: e.target.value } })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">Danh mục *</label>
                  <select
                    value={productModal.data.category_id}
                    onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, category_id: e.target.value } })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">Giá bán ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productModal.data.price}
                    onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, price: e.target.value } })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">Kho hàng</label>
                  <input
                    type="number"
                    value={productModal.data.stock}
                    onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, stock: e.target.value } })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">Ảnh sản phẩm</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-lg border border-outline-variant bg-surface flex items-center justify-center overflow-hidden flex-shrink-0 group">
                      {productModal.data.image ? (
                        <>
                          <img
                            src={productModal.data.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setProductModal({ ...productModal, data: { ...productModal.data, image: "" } })}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                            title="Xóa ảnh"
                          >
                            <MdDelete size={20} />
                          </button>
                        </>
                      ) : (
                        <div className="text-on-surface-variant text-body-sm text-center px-1">Chưa có ảnh</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className={`flex flex-col items-center justify-center px-4 py-3 border border-dashed border-outline-variant rounded-lg cursor-pointer hover:border-primary hover:bg-surface-container/30 transition text-center ${uploadingProductImage ? 'pointer-events-none opacity-60' : ''}`}>
                        <span className="text-body-sm text-primary font-semibold flex items-center gap-1.5">
                          {uploadingProductImage ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Đang upload...
                            </>
                          ) : (
                            <>
                              <MdAdd size={18} />
                              Chọn ảnh
                            </>
                          )}
                        </span>
                        <span className="text-label-sm text-on-surface-variant mt-0.5">Tối đa 5MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProductImageUpload}
                          className="hidden"
                          disabled={uploadingProductImage}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">Mô tả sản phẩm</label>
                <textarea
                  value={productModal.data.description}
                  onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, description: e.target.value } })}
                  rows={4}
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setProductModal({ ...productModal, isOpen: false })}
                  className="px-5 py-2 border border-outline rounded-lg text-body-md text-on-background hover:bg-surface-container transition font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-surface rounded-lg hover:bg-primary/90 transition font-semibold shadow-sm"
                >
                  {productModal.mode === "add" ? "Tạo sản phẩm" : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {categoryModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-xl shadow-lg flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant">
              <h2 className="text-h2 font-h2 text-on-surface font-bold">
                {categoryModal.mode === "add" ? "Thêm danh mục mới" : "Sửa thông tin danh mục"}
              </h2>
              <button
                onClick={() => setCategoryModal({ ...categoryModal, isOpen: false })}
                className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant transition"
              >
                <MdClose size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  value={categoryModal.data.name}
                  onChange={(e) => setCategoryModal({ ...categoryModal, data: { ...categoryModal.data, name: e.target.value } })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">Ảnh danh mục</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-lg border border-outline-variant bg-surface flex items-center justify-center overflow-hidden flex-shrink-0 group">
                    {categoryModal.data.image ? (
                      <>
                        <img
                          src={categoryModal.data.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setCategoryModal({ ...categoryModal, data: { ...categoryModal.data, image: "" } })}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                          title="Xóa ảnh"
                        >
                          <MdDelete size={20} />
                        </button>
                      </>
                    ) : (
                      <div className="text-on-surface-variant text-body-sm text-center px-1">Chưa có ảnh</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className={`flex flex-col items-center justify-center px-4 py-3 border border-dashed border-outline-variant rounded-lg cursor-pointer hover:border-primary hover:bg-surface-container/30 transition text-center ${uploadingCategoryImage ? 'pointer-events-none opacity-60' : ''}`}>
                      <span className="text-body-sm text-primary font-semibold flex items-center gap-1.5">
                        {uploadingCategoryImage ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang upload...
                          </>
                        ) : (
                          <>
                            <MdAdd size={18} />
                            Chọn ảnh
                          </>
                        )}
                      </span>
                      <span className="text-label-sm text-on-surface-variant mt-0.5">Tối đa 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCategoryImageUpload}
                        className="hidden"
                        disabled={uploadingCategoryImage}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-body-sm font-semibold text-on-surface-variant mb-1">Mô tả danh mục</label>
                <textarea
                  value={categoryModal.data.description}
                  onChange={(e) => setCategoryModal({ ...categoryModal, data: { ...categoryModal.data, description: e.target.value } })}
                  rows={4}
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface outline-none focus:border-primary transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setCategoryModal({ ...categoryModal, isOpen: false })}
                  className="px-5 py-2 border border-outline rounded-lg text-body-md text-on-background hover:bg-surface-container transition font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-surface rounded-lg hover:bg-primary/90 transition font-semibold shadow-sm"
                >
                  {categoryModal.mode === "add" ? "Tạo danh mục" : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
