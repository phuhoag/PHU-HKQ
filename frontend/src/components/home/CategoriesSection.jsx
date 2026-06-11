import { Link } from "react-router-dom";
import { MdArrowForward } from "react-icons/md";
import { useLanguage } from "../../context/LanguageContext.jsx";

const CATEGORIES = [
  {
    id: 1,
    nameKey: "home.categories.laptops",
    descKey: "home.categories.laptopsDesc",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&h=300&fit=crop",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: 2,
    nameKey: "home.categories.keyboards",
    descKey: "home.categories.keyboardsDesc",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=865&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "from-purple-500 to-purple-600",
  },
  {
    id: 3,
    nameKey: "home.categories.monitors",
    descKey: "home.categories.monitorsDesc",
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    id: 4,
    nameKey: "home.categories.mice",
    descKey: "home.categories.miceDesc",
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop",
    color: "from-pink-500 to-pink-600",
  },
];

export default function CategoriesSection() {
  const { t } = useLanguage();

  return (
    <section className="py-stack-lg">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="mb-stack-lg">
          <h2 className="font-h2 text-h2 text-on-surface mb-2">
            {t("home.categories.title")}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t("home.categories.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to="/categories"
              className="group relative overflow-hidden rounded-xl h-64 flex items-end shadow-md hover:shadow-lg transition-shadow"
            >
              {/* Background Image */}
              <img
                src={category.image}
                alt={t(category.nameKey)}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface via-transparent to-transparent opacity-70" />

              {/* Content */}
              <div className="relative z-10 w-full p-stack-md">
                <h3 className="font-h3 text-h3 text-on-primary mb-1">
                  {t(category.nameKey)}
                </h3>
                <p className="font-body-sm text-body-sm text-on-primary opacity-90 mb-3">
                  {t(category.descKey)}
                </p>
                <div className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-button text-button group-hover:bg-primary-container transition-colors">
                  {t("home.categories.explore")}
                  <MdArrowForward size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
