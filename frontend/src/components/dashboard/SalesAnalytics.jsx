export default function SalesAnalytics({ monthlySales }) {
  const data = monthlySales && monthlySales.length > 0
    ? monthlySales.map((item) => ({
        month: item.month,
        value: item.sales,
      }))
    : [
        { month: "T1", value: 0 },
        { month: "T2", value: 0 },
        { month: "T3", value: 0 },
        { month: "T4", value: 0 },
        { month: "T5", value: 0 },
        { month: "T6", value: 0 },
        { month: "T7", value: 0 },
        { month: "T8", value: 0 },
        { month: "T9", value: 0 },
        { month: "T10", value: 0 },
        { month: "T11", value: 0 },
        { month: "T12", value: 0 },
      ];

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-h3 font-h3 text-on-background">Phân tích doanh thu</h3>
        <div className="flex space-x-3">
          <button className="px-3 py-1 text-body-sm font-body-sm text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition">
            Doanh thu
          </button>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="flex items-end justify-between space-x-2 h-64 border-b border-outline-variant pb-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col justify-end items-center flex-1 h-full">
            <div
              className="w-full bg-primary rounded-t hover:bg-primary/80 transition cursor-pointer"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                minHeight: item.value > 0 ? "4px" : "0px",
              }}
              title={`${item.month}: $${item.value.toLocaleString()}`}
            />
          </div>
        ))}
      </div>

      {/* Month Labels */}
      <div className="flex justify-between mt-4 text-body-sm text-on-surface-variant">
        {data.map((item, index) => (
          <span key={index} className="text-center flex-1 text-[11px] truncate px-0.5">
            {item.month}
          </span>
        ))}
      </div>
    </div>
  );
}
