export default function SalesAnalytics() {
  const data = [
    { month: "JAN", value: 45000 },
    { month: "FEB", value: 52000 },
    { month: "MAR", value: 48000 },
    { month: "APR", value: 61000 },
    { month: "MAY", value: 55000 },
    { month: "JUN", value: 67000 },
    { month: "JUL", value: 58000 },
    { month: "AUG", value: 72000 },
    { month: "SEP", value: 61000 },
    { month: "OCT", value: 68000 },
  ];

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-h3 font-h3 text-on-background">Sales Analytics</h3>
        <div className="flex space-x-3">
          <button className="px-3 py-1 text-body-sm font-body-sm text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition">
            Revenue
          </button>
          <button className="px-3 py-1 text-body-sm font-body-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition">
            Profit
          </button>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end justify-between space-x-2 h-64">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="w-full bg-primary rounded-t-sm hover:bg-primary/80 transition cursor-pointer"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
              }}
              title={`${item.month}: $${item.value.toLocaleString()}`}
            />
          </div>
        ))}
      </div>

      {/* Month Labels */}
      <div className="flex justify-between mt-4 text-body-sm text-on-surface-variant">
        {data.map((item, index) => (
          <span key={index}>{item.month}</span>
        ))}
      </div>
    </div>
  );
}
