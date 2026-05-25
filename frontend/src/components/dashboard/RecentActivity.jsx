import { MdCheckCircle, MdLocalShipping, MdHistory } from "react-icons/md";

export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "order_delivered",
      title: "New order ORD-3942 placed by Sarah Connor",
      detail: "",
      date: "2 hours ago",
      icon: MdCheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      id: 2,
      type: "product_stock",
      title: "Product UltraBook Pro stock low (5 left)",
      detail: "",
      date: "4 minutes ago",
      icon: MdLocalShipping,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      id: 3,
      type: "order_paid",
      title: "Payment received for ORD-3938",
      detail: "$420.50",
      date: "1 hour ago",
      icon: MdCheckCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      id: 4,
      type: "customer_registered",
      title: "New customer registered: Alex Rivera",
      detail: "",
      date: "3 hours ago",
      icon: MdHistory,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      id: 5,
      type: "system_update",
      title: "System update completed successfully",
      detail: "",
      date: "1 hour ago",
      icon: MdCheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
      <div className="p-6 border-b border-outline-variant">
        <h3 className="text-h3 font-h3 text-on-background">
          Recent Activities
        </h3>
      </div>

      <div className="divide-y divide-outline-variant">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className="p-4 hover:bg-surface-container/30 transition cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${activity.bgColor} flex-shrink-0 mt-0.5`}
                >
                  <Icon className={`text-[18px] ${activity.color}`} />
                </div>

                <div className="flex-grow min-w-0">
                  <p className="text-body-sm font-body-md text-on-background">
                    {activity.title}
                  </p>
                  {activity.detail && (
                    <p className="text-body-sm text-on-surface-variant mt-0.5">
                      {activity.detail}
                    </p>
                  )}
                </div>

                <span className="text-label-sm text-on-surface-variant flex-shrink-0 ml-2">
                  {activity.date}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-outline-variant text-center">
        <a
          href="#"
          className="text-primary text-body-md font-body-md hover:underline"
        >
          View All Activities
        </a>
      </div>
    </div>
  );
}
