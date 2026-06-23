import { MdStarRate } from "react-icons/md";
import { useLanguage } from "../../context/LanguageContext.jsx";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Alex Johnson",
    roleKey: "home.testimonials.softwareEngineer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    rating: 5,
    textKey: "home.testimonials.alexText",
  },
  {
    id: 2,
    name: "Sarah Chen",
    roleKey: "home.testimonials.contentCreator",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    rating: 5,
    textKey: "home.testimonials.sarahText",
  },
  {
    id: 3,
    name: "Michael Brown",
    roleKey: "home.testimonials.gamer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    rating: 5,
    textKey: "home.testimonials.michaelText",
  },
];

export default function TestimonialsSection() {
  const { t } = useLanguage();

  return (
    <section className="py-stack-lg">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="text-center mb-stack-lg">
          <h2 className="font-h2 text-h2 text-on-surface mb-2">
            {t("home.testimonials.title")}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
            {t("home.testimonials.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-surface border border-outline-variant rounded-lg p-stack-md shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-stack-md text-tertiary">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <MdStarRate key={i} className="fill-current" size={16} />
                ))}
              </div>

              {/* Text */}
              <p className="font-body-md text-body-md text-on-surface mb-stack-md italic">
                "{t(testimonial.textKey)}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-button text-button text-on-surface">
                    {testimonial.name}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {t(testimonial.roleKey)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
