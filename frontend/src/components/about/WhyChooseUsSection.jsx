import { MdVerified, MdSupportAgent, MdLightbulb } from "react-icons/md";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function WhyChooseUsSection() {
  const { t } = useLanguage();

  const VALUES = [
    {
      id: 1,
      title: t("about.valueQualityTitle"),
      description: t("about.valueQualityDesc"),
      icon: MdVerified,
    },
    {
      id: 2,
      title: t("about.valueSupportTitle"),
      description: t("about.valueSupportDesc"),
      icon: MdSupportAgent,
    },
    {
      id: 3,
      title: t("about.valueInnovationTitle"),
      description: t("about.valueInnovationDesc"),
      icon: MdLightbulb,
    },
  ];

  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="text-center mb-16">
          <h2 className="font-h2 text-h2 text-on-surface mb-2">
            {t("about.whyTitle")}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t("about.whySubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.id}
                className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center mb-6 text-on-primary group-hover:scale-110 transition-transform">
                  <Icon size={24} />
                </div>
                <h3 className="font-h3 text-h3 text-on-surface mb-4">
                  {value.title}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
