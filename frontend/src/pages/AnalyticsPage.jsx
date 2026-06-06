import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import {
  MdAnalytics,
  MdTrendingUp,
  MdPeople,
  MdShoppingCart,
  MdWarning,
  MdRefresh,
  MdAttachMoney,
  MdLocalMall,
} from "react-icons/md";
import { analyticsService } from "../services/analyticsService.js";

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    summary: {
      totalUsers: 0,
      activeUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
    },
    monthlySales: [],
    categorySales: [],
    topProducts: [],
  });

  const [hoveredBar, setHoveredBar] = useState(null);

  // Role and auth check
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
      fetchAnalytics();
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getAdminAnalytics();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || "Không thể tải dữ liệu thống kê");
      }
    } catch (err) {
      setError("Lỗi kết nối đến máy chủ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(val);
  };

  // Math for monthly sales SVG chart
  const monthlyData = data.monthlySales || [];
  const maxSales = monthlyData.length > 0 ? Math.max(...monthlyData.map((d) => d.sales)) : 1000;
  
  // Math for category sales
  const categoryData = data.categorySales || [];
  const totalCatSales = categoryData.reduce((sum, c) => sum + c.sales, 0);

  // Palette of premium colors for categories
  const categoryColors = [
    "bg-primary",
    "bg-success",
    "bg-warning",
    "bg-info",
    "bg-error",
    "bg-indigo-500",
    "bg-purple-500",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-64 p-8 min-h-screen">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-outline-variant">
          <div>
            <h1 className="text-h1 font-h1 text-on-background flex items-center gap-3">
              <MdAnalytics className="text-primary" size={32} />
              Phân tích & Báo cáo doanh thu
            </h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              Thống kê chi tiết tình hình hoạt động kinh doanh, doanh số và các sản phẩm bán chạy nhất.
            </p>
          </div>
          <div>
            <button
              onClick={fetchAnalytics}
              className="flex items-center gap-2 px-4 py-2 border border-outline rounded-lg text-on-background hover:bg-surface-container transition font-semibold"
            >
              <MdRefresh size={18} />
              Làm mới
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 text-error border border-error/20 rounded-lg flex items-start gap-3">
            <MdWarning className="text-[24px] flex-shrink-0" />
            <div>
              <p className="font-button text-button">Lỗi tải dữ liệu</p>
              <p className="text-body-md">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-body-md text-on-surface-variant animate-pulse">Đang thu thập dữ liệu thống kê từ hệ thống...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Revenue */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface-variant mb-1">
                      Tổng doanh thu
                    </p>
                    <p className="text-h2 font-h2 text-primary font-bold">
                      {formatCurrency(data.summary.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <MdAttachMoney size={24} />
                  </div>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Doanh số tích lũy (không tính đơn hủy)
                </p>
              </div>

              {/* Orders */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface-variant mb-1">
                      Tổng số đơn hàng
                    </p>
                    <p className="text-h2 font-h2 text-success font-bold">
                      {data.summary.totalOrders} đơn
                    </p>
                  </div>
                  <div className="p-3 bg-success/10 rounded-lg text-success">
                    <MdShoppingCart size={24} />
                  </div>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  {data.summary.completedOrders} đơn hàng đã giao thành công
                </p>
              </div>

              {/* Customers */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface-variant mb-1">
                      Tổng khách hàng
                    </p>
                    <p className="text-h2 font-h2 text-warning font-bold">
                      {data.summary.totalUsers} khách
                    </p>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-lg text-warning">
                    <MdPeople size={24} />
                  </div>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Có {data.summary.activeUsers} khách hàng đang hoạt động
                </p>
              </div>

              {/* Avg Order Value */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface-variant mb-1">
                      Giá trị trung bình đơn
                    </p>
                    <p className="text-h2 font-h2 text-info font-bold">
                      {formatCurrency(data.summary.avgOrderValue)}
                    </p>
                  </div>
                  <div className="p-3 bg-info/10 rounded-lg text-info">
                    <MdTrendingUp size={24} />
                  </div>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Doanh số trung bình trên mỗi đơn hàng
                </p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Revenue Custom SVG Bar Chart */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <h3 className="text-h3 font-h3 text-on-background mb-6 font-bold flex items-center gap-2">
                  <MdTrendingUp className="text-primary" />
                  Doanh thu theo tháng
                </h3>

                {monthlyData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center bg-surface border border-outline-variant border-dashed rounded-lg">
                    <p className="text-body-md text-on-surface-variant">Chưa có dữ liệu giao dịch</p>
                  </div>
                ) : (
                  <div>
                    {/* SVG Chart */}
                    <div className="relative h-64 flex items-end justify-between gap-3 pt-6 px-4">
                      {monthlyData.map((item, index) => {
                        const heightPct = (item.sales / maxSales) * 100;
                        const isHovered = hoveredBar === index;
                        return (
                          <div
                            key={index}
                            className="relative flex-1 flex flex-col justify-end items-center h-full group"
                            onMouseEnter={() => setHoveredBar(index)}
                            onMouseLeave={() => setHoveredBar(null)}
                          >
                            {/* Hover Tooltip */}
                            {isHovered && (
                              <div className="absolute -top-12 z-10 bg-on-background text-background text-body-sm font-semibold py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap animate-bounce">
                                <div>Doanh thu: {formatCurrency(item.sales)}</div>
                                <div className="text-center text-xs opacity-75">{item.orders} đơn hàng</div>
                              </div>
                            )}

                            {/* Bar Visual */}
                            <div
                              className="w-full bg-primary rounded-t-lg hover:bg-primary/80 transition-all duration-300 cursor-pointer shadow-sm relative overflow-hidden"
                              style={{
                                height: `${Math.max(heightPct, 5)}%`,
                              }}
                            >
                              {/* Glowing effect inside bar */}
                              <div className="absolute inset-x-0 top-0 h-1 bg-white/20" />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Month Labels */}
                    <div className="flex justify-between border-t border-outline-variant mt-4 pt-3 text-body-sm text-on-surface-variant font-semibold px-4">
                      {monthlyData.map((item, index) => (
                        <span key={index}>{item.month}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Category Sales Distribution */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <h3 className="text-h3 font-h3 text-on-background mb-6 font-bold flex items-center gap-2">
                  <MdLocalMall className="text-primary" />
                  Doanh số theo danh mục
                </h3>

                {categoryData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center bg-surface border border-outline-variant border-dashed rounded-lg">
                    <p className="text-body-md text-on-surface-variant">Chưa có dữ liệu giao dịch sản phẩm</p>
                  </div>
                ) : (
                  <div className="space-y-5 h-64 overflow-y-auto pr-2">
                    {categoryData.map((item, index) => {
                      const pct = totalCatSales > 0 ? (item.sales / totalCatSales) * 100 : 0;
                      const colorClass = categoryColors[index % categoryColors.length];
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-body-sm font-semibold">
                            <span className="text-on-surface">{item.category}</span>
                            <span className="text-on-surface-variant">
                              {formatCurrency(item.sales)} ({pct.toFixed(1)}%)
                            </span>
                          </div>
                          {/* Progress Bar Container */}
                          <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden border border-outline-variant">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="text-xs text-on-surface-variant">
                            Đã bán ra {item.qty} sản phẩm
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Top-Selling Products list */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-outline-variant">
                <h3 className="text-h3 font-h3 text-on-background font-bold flex items-center gap-2">
                  <MdLocalMall className="text-primary" />
                  Top 5 sản phẩm bán chạy nhất
                </h3>
              </div>

              {data.topProducts.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-body-md text-on-surface-variant">Chưa có dữ liệu giao dịch sản phẩm.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-container border-b border-outline-variant">
                      <tr>
                        <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Hình ảnh</th>
                        <th className="px-6 py-4 text-left text-label-md font-label-md text-on-surface-variant">Tên sản phẩm</th>
                        <th className="px-6 py-4 text-right text-label-md font-label-md text-on-surface-variant">Giá bán lẻ</th>
                        <th className="px-6 py-4 text-center text-label-md font-label-md text-on-surface-variant">Số lượng bán ra</th>
                        <th className="px-6 py-4 text-right text-label-md font-label-md text-on-surface-variant">Doanh số đem lại</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topProducts.map((p, idx) => (
                        <tr key={p._id || idx} className="border-b border-outline-variant hover:bg-surface-container/30 transition">
                          <td className="px-6 py-4">
                            <img
                              src={p.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=60"}
                              alt={p.name}
                              className="w-12 h-12 rounded object-cover bg-surface border border-outline-variant"
                            />
                          </td>
                          <td className="px-6 py-4 font-semibold text-body-md text-on-surface">{p.name}</td>
                          <td className="px-6 py-4 text-right text-body-md text-on-surface-variant">${p.price.toFixed(2)}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-success/15 text-success rounded-full font-semibold text-body-sm">
                              {p.unitsSold} sản phẩm
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-body-md text-primary">{formatCurrency(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
