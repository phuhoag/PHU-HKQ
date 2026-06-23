import { MdCheckCircle, MdLocalShipping, MdHistory, MdPersonAdd, MdPayment } from "react-icons/md";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function RecentActivity({ activities }) {
  const { t } = useLanguage();

  const list = activities && activities.length > 0 ? activities : [
    {
      id: "system-init",
      title: t("dashboard.systemActiveStable"),
      detail: "",
      date: t("dashboard.now"),
      icon: MdCheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    }
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
      <div className="p-6 border-b border-outline-variant">
        <h3 className="text-h3 font-h3 text-on-background">
          {t("dashboard.recentActivity")}
        </h3>
      </div>

      <div className="divide-y divide-outline-variant">
        {list.map((activity) => {
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
    </div>
  );
}
