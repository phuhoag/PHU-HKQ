import { MdCheckCircle, MdLocalShipping, MdHistory, MdCancel } from "react-icons/md";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function OrderHistory({ orders }) {
  const { t, language, formatPrice } = useLanguage();

  const getStatusDetails = (status) => {
    switch (status) {
      case "delivered":
        return { label: t("dashboard.statusDelivered"), color: "text-success", icon: MdCheckCircle };
      case "shipped":
        return { label: t("dashboard.statusShipped"), color: "text-info", icon: MdLocalShipping };
      case "processing":
        return { label: t("dashboard.statusProcessing"), color: "text-warning", icon: MdHistory };
      case "cancelled":
        return { label: t("dashboard.statusCancelled"), color: "text-error", icon: MdCancel };
      case "pending":
      default:
        return { label: t("dashboard.statusPending"), color: "text-warning", icon: MdHistory };
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
      <div className="p-6 border-b border-outline-variant">
        <h2 className="text-h3 font-h3 text-on-background">{t("dashboard.recentOrdersReceived")}</h2>
        <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
          {t("dashboard.recentOrdersDesc")}
        </p>
      </div>

      <div className="overflow-x-auto">
        {(!orders || orders.length === 0) ? (
          <div className="p-8 text-center text-body-md text-on-surface-variant">
            {t("dashboard.noOrdersInSystem")}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-surface-container border-b border-outline-variant">
              <tr>
                <th className="px-6 py-3 text-left text-label-md font-label-md text-on-surface-variant">
                  {t("dashboard.tableOrderCode")}
                </th>
                <th className="px-6 py-3 text-left text-label-md font-label-md text-on-surface-variant">
                  {t("dashboard.tableOrderDate")}
                </th>
                <th className="px-6 py-3 text-left text-label-md font-label-md text-on-surface-variant">
                  {t("dashboard.tableProducts")}
                </th>
                <th className="px-6 py-3 text-left text-label-md font-label-md text-on-surface-variant">
                  {t("dashboard.tableTotal")}
                </th>
                <th className="px-6 py-3 text-left text-label-md font-label-md text-on-surface-variant">
                  {t("dashboard.tableStatus")}
                </th>
                <th className="px-6 py-3 text-center text-label-md font-label-md text-on-surface-variant">
                  {t("dashboard.tableActions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const { label, color, icon: StatusIcon } = getStatusDetails(order.status);
                const itemsStr = order.items && order.items.length > 0
                  ? order.items.map((i) => `${i.product_id?.name || t("dashboard.tableProducts")} (x${i.quantity})`).join(", ")
                  : t("dashboard.noDetails");

                return (
                  <tr
                    key={order._id}
                    className="border-b border-outline-variant hover:bg-surface-container/30 transition"
                  >
                    <td className="px-6 py-4 text-body-md font-body-md text-primary">
                      <Link
                        to={`/orders?openOrder=${order._id}`}
                        className="hover:underline font-semibold"
                      >
                        #{order._id?.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-body-md font-body-md text-on-background">
                      {new Date(order.createdAt).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US")}
                    </td>
                    <td className="px-6 py-4 text-body-md font-body-md text-on-surface-variant max-w-xs truncate" title={itemsStr}>
                      {itemsStr}
                    </td>
                    <td className="px-6 py-4 text-body-md font-body-md font-semibold text-on-background">
                      {formatPrice(parseFloat(order.total_amount?.toString() || "0"))}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`text-[18px] ${color}`} />
                        <span className={`text-label-md font-label-md ${color}`}>
                          {label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to="/orders"
                        className="inline-block px-3 py-1.5 bg-primary/10 text-primary font-semibold text-body-sm rounded-lg hover:bg-primary/20 transition"
                      >
                        {t("dashboard.manage")}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="p-4 border-t border-outline-variant text-center">
        <Link to="/orders" className="text-primary text-body-md font-body-md hover:underline font-semibold">
          {t("dashboard.viewAllOrders")}
        </Link>
      </div>
    </div>
  );
}
