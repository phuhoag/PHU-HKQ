import { MdCheckCircle, MdLocalShipping, MdMoreVert } from "react-icons/md";

export default function OrderHistory() {
  const orders = [
    {
      id: "ORD-2024-001",
      date: "May 10, 2024",
      items: "Pro Wireless Headphones × 1",
      total: "$299.00",
      status: "Delivered",
      statusColor: "text-success",
      icon: MdCheckCircle,
    },
    {
      id: "ORD-2024-002",
      date: "May 5, 2024",
      items: "Lite Wireless Earbuds × 2",
      total: "$258.00",
      status: "In Transit",
      statusColor: "text-warning",
      icon: MdLocalShipping,
    },
    {
      id: "ORD-2024-003",
      date: "April 28, 2024",
      items: "Hi-Fi Studio Speakers × 1",
      total: "$450.00",
      status: "Delivered",
      statusColor: "text-success",
      icon: MdCheckCircle,
    },
    {
      id: "ORD-2024-004",
      date: "April 15, 2024",
      items: "Aluminum Headphone Stand × 3",
      total: "$147.00",
      status: "Delivered",
      statusColor: "text-success",
      icon: MdCheckCircle,
    },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
      <div className="p-6 border-b border-outline-variant">
        <h2 className="text-h3 font-h3 text-on-background">Recent Orders</h2>
        <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
          Track your purchases and delivery status
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-container border-b border-outline-variant">
            <tr>
              <th className="px-6 py-3 text-left text-label-md font-label-md text-on-surface-variant">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-label-md font-label-md text-on-surface-variant">
                Date
              </th>
              <th className="px-6 py-3 text-left text-label-md font-label-md text-on-surface-variant">
                Items
              </th>
              <th className="px-6 py-3 text-left text-label-md font-label-md text-on-surface-variant">
                Total
              </th>
              <th className="px-6 py-3 text-left text-label-md font-label-md text-on-surface-variant">
                Status
              </th>
              <th className="px-6 py-3 text-center text-label-md font-label-md text-on-surface-variant">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => {
              const StatusIcon = order.icon;
              return (
                <tr
                  key={idx}
                  className="border-b border-outline-variant hover:bg-surface-container/30 transition"
                >
                  <td className="px-6 py-4 text-body-md font-body-md text-primary">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-body-md font-body-md text-on-background">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 text-body-md font-body-md text-on-surface-variant">
                    {order.items}
                  </td>
                  <td className="px-6 py-4 text-body-md font-body-md font-semibold text-on-background">
                    {order.total}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon
                        className={`text-[18px] ${order.statusColor}`}
                      />
                      <span
                        className={`text-label-md font-label-md ${order.statusColor}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 hover:bg-surface-container rounded-lg transition text-on-surface-variant hover:text-primary">
                      <MdMoreVert size={20} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-outline-variant text-center">
        <button className="text-primary text-body-md font-body-md hover:underline">
          View all orders →
        </button>
      </div>
    </div>
  );
}
