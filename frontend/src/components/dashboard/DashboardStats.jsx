import {
  MdTrendingUp,
  MdShoppingCart,
  MdPerson,
  MdTrendingDown,
} from "react-icons/md";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function DashboardStats({ statsData }) {
  const { t } = useLanguage();

  const formatRevenue = (val) => {
    return typeof val === "number"
      ? `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "$0.00";
  };

  const stats = [
    {
      icon: MdTrendingUp,
      label: t("dashboard.totalRevenue"),
      value: formatRevenue(statsData?.totalRevenue),
      change: t("dashboard.realTime"),
      changeType: "positive",
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      icon: MdShoppingCart,
      label: t("dashboard.totalOrders"),
      value: statsData?.totalOrders?.toLocaleString("en-US") || "0",
      change: `${t("dashboard.completed")}: ${statsData?.completedOrders || 0}`,
      changeType: "positive",
      bgColor: "bg-success/10",
      iconColor: "text-success",
    },
    {
      icon: MdPerson,
      label: t("dashboard.customers"),
      value: statsData?.totalUsers?.toLocaleString("en-US") || "0",
      change: `${t("dashboard.active")}: ${statsData?.activeUsers || 0}`,
      changeType: "positive",
      bgColor: "bg-warning/10",
      iconColor: "text-warning",
    },
    {
      icon: MdTrendingUp,
      label: t("dashboard.conversionRate"),
      value: statsData?.conversionRate !== undefined ? `${statsData.conversionRate}%` : "0.00%",
      change: t("dashboard.conversionDesc"),
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
