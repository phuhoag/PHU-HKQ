import { useState } from "react";

export default function SalesAnalytics({ monthlySales }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  // Determine year from data or current year
  let dataYear = new Date().getFullYear();
  if (monthlySales && monthlySales.length > 0) {
    const match = monthlySales[0].month.match(/\/ (\d{4})/);
    if (match) {
      dataYear = parseInt(match[1]);
    }
  }

  // Pre-fill 12 months for the determined year
  const paddedData = Array.from({ length: 12 }, (_, i) => ({
    month: `Tháng ${i + 1}`,
    value: 0,
    orders: 0,
  }));

  // Populate data from monthlySales if match
  if (monthlySales && monthlySales.length > 0) {
    monthlySales.forEach((item) => {
      const match = item.month.match(/^T(\d+)/);
      if (match) {
        const monthNum = parseInt(match[1]);
        if (monthNum >= 1 && monthNum <= 12) {
          paddedData[monthNum - 1].value = item.sales;
          paddedData[monthNum - 1].orders = item.orders || 0;
        }
      }
    });
  }

  const maxValue = Math.max(...paddedData.map((d) => d.value), 1000);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-h3 font-h3 text-on-background font-bold">
            Phân tích doanh thu năm {dataYear}
          </h3>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Biểu đồ doanh số bán hàng theo từng tháng của năm {dataYear}
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-3 py-1 text-body-sm font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition">
            Doanh thu
          </button>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative h-64 border-l border-b border-outline-variant/60 ml-16 mr-4 mt-8">
        {/* Y-Axis Grid Lines & Tick Labels */}
        <div className="absolute left-0 right-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none z-0">
          {[1, 0.75, 0.5, 0.25, 0].map((pct, i) => {
            const val = maxValue * pct;
            return (
              <div key={i} className="w-full border-t border-outline-variant/20 relative h-0">
                <span className="absolute right-full mr-3 -top-2 text-[10px] text-on-surface-variant font-bold whitespace-nowrap">
                  {formatCurrency(val)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bars Container */}
        <div className="absolute inset-0 flex items-end justify-around gap-2 z-10 pt-6 px-2">
          {paddedData.map((item, index) => {
            const heightPct = (item.value / maxValue) * 100;
            const isHovered = hoveredBar === index;
            return (
              <div
                key={index}
                className="relative flex-1 max-w-[48px] flex flex-col justify-end items-center h-full group"
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Hover Tooltip */}
                {isHovered && item.value > 0 && (
                  <div className="absolute -top-14 z-20 bg-on-background text-background text-body-sm font-semibold py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap animate-bounce">
                    <div>Doanh thu: {formatCurrency(item.value)}</div>
                    <div className="text-center text-xs opacity-75">{item.orders} đơn hàng</div>
                  </div>
                )}

                {/* Bar Visual */}
                <div
                  className="w-full bg-gradient-to-t from-primary/30 to-primary rounded-t hover:from-primary/50 hover:to-primary transition-all duration-300 cursor-pointer shadow-sm relative overflow-hidden"
                  style={{
                    height: `${Math.max(heightPct, item.value > 0 ? 4 : 0)}%`,
                  }}
                >
                  {/* Glowing top line effect inside bar */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-white/20" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Month Labels */}
      <div className="flex justify-around mt-4 pt-3 text-body-sm text-on-surface-variant font-bold ml-16 mr-4">
        {paddedData.map((item, index) => (
          <span key={index} className="text-center flex-1 text-[10px] sm:text-[11px] truncate px-0.5" title={item.month}>
            Tháng {index + 1}
          </span>
        ))}
      </div>
    </div>
  );
}
