import {
  MdTrendingUp,
  MdShoppingCart,
  MdPerson,
  MdTrendingDown,
} from "react-icons/md";

export default function DashboardStats() {
  const stats = [
    {
      icon: MdTrendingUp,
      label: "Total Revenue",
      value: "$128,430.00",
      change: "+24.5%",
      changeType: "positive",
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      icon: MdShoppingCart,
      label: "Total Orders",
      value: "1,240",
      change: "+18.1%",
      changeType: "positive",
      bgColor: "bg-success/10",
      iconColor: "text-success",
    },
    {
      icon: MdPerson,
      label: "New Users",
      value: "324",
      change: "-2.4%",
      changeType: "negative",
      bgColor: "bg-warning/10",
      iconColor: "text-warning",
    },
    {
      icon: MdTrendingUp,
      label: "Conversion Rate",
      value: "3.42%",
      change: "+6.3%",
      changeType: "positive",
      bgColor: "bg-tertiary/10",
      iconColor: "text-tertiary",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`text-[24px] ${stat.iconColor}`} />
              </div>
            </div>

            <p className="text-body-sm font-body-sm text-on-surface-variant mb-1">
              {stat.label}
            </p>
            <h3 className="text-h3 font-h3 text-on-background mb-3">
              {stat.value}
            </h3>

            <p
              className={`text-label-sm font-label-sm ${stat.changeType === "positive" ? "text-success" : "text-error"}`}
            >
              {stat.change}
            </p>
          </div>
        );
      })}
    </div>
  );
}
