import { MdCheckCircle, MdLocalShipping, MdHistory, MdCancel } from "react-icons/md";
import { Link } from "react-router-dom";

export default function OrderHistory({ orders }) {
  const getStatusDetails = (status) => {
    switch (status) {
      case "delivered":
        return { label: "Đã giao", color: "text-success", icon: MdCheckCircle };
      case "shipped":
        return { label: "Đang giao", color: "text-info", icon: MdLocalShipping };
      case "processing":
        return { label: "Đang xử lý", color: "text-warning", icon: MdHistory };
      case "cancelled":
        return { label: "Đã hủy", color: "text-error", icon: MdCancel };
      case "pending":
      default:
        return { label: "Chờ xác nhận", color: "text-warning", icon: MdHistory };
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
      <div className="p-6 border-b border-outline-variant">
        <h2 className="text-h3 font-h3 text-on-background">Đơn hàng mới nhận</h2>
        <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
          Danh sách các đơn hàng vừa được đặt trên hệ thống
        </p>
      </div>

      <div className="overflow-x-auto">
        {(!orders || orders.length === 0) ? (
          <div className="p-8 text-center text-body-md text-on-surface-variant">
            Chưa có đơn hàng nào trong hệ thống.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-surface-container border-b border-outline-variant">
              <tr>
                <th className="px-6 py-3 text-left text-label-md font-label-md text-on-surface-variant">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-label-md font-label-md text-on-surface-variant">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-label-md font-label-md text-on-surface-variant">
                  Chi tiết sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-label-md font-label-md text-on-surface-variant">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-label-md font-label-md text-on-surface-variant">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-center text-label-md font-label-md text-on-surface-variant">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const { label, color, icon: StatusIcon } = getStatusDetails(order.status);
                const itemsStr = order.items && order.items.length > 0
                  ? order.items.map((i) => `${i.product_id?.name || "Sản phẩm"} (x${i.quantity})`).join(", ")
                  : "Không có chi tiết";

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
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-body-md font-body-md text-on-surface-variant max-w-xs truncate" title={itemsStr}>
                      {itemsStr}
                    </td>
                    <td className="px-6 py-4 text-body-md font-body-md font-semibold text-on-background">
                      ${parseFloat(order.total_amount?.toString() || "0").toFixed(2)}
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
                        Quản lý
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
          Xem tất cả đơn hàng →
        </Link>
      </div>
    </div>
  );
}
