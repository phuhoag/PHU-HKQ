import { MdVerified, MdSupportAgent, MdLightbulb } from "react-icons/md";

const VALUES = [
  {
    id: 1,
    title: "Uncompromising Quality",
    description:
      "Every product in our inventory undergoes rigorous technical validation and performance testing before reaching your door.",
    icon: MdVerified,
  },
  {
    id: 2,
    title: "Expert Support",
    description:
      "Our team consists of certified engineers ready to assist with complex integrations and technical troubleshooting 24/7.",
    icon: MdSupportAgent,
  },
  {
    id: 3,
    title: "Next-Gen Innovation",
    description:
      "We partner with emerging tech giants to provide early access to transformative hardware and software solutions.",
    icon: MdLightbulb,
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="text-center mb-16">
          <h2 className="font-h2 text-h2 text-on-surface mb-2">
            Why TechStore?
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            The standard for professional electronic retail.
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
