import { Link } from "react-router-dom";
import {
  MdArrowForward,
  MdLocalShipping,
  MdAssignmentReturn,
  MdSecurity,
} from "react-icons/md";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function HeroBanner() {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-r from-primary to-primary-container text-on-primary py-stack-lg rounded-xl overflow-hidden">
      <div className="max-w-container-max mx-auto px-margin-desktop py-16 flex flex-col md:flex-row items-center gap-8">
        {/* Left Content */}
        <div className="flex-1">
          <h1 className="font-h1 text-h1 text-on-primary mb-stack-md">
            {t("home.hero.welcome")}
          </h1>
          <p className="font-body-lg text-body-lg text-on-primary mb-stack-lg max-w-lg opacity-90">
            {t("home.hero.description")}
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-on-primary text-primary px-8 py-3 rounded-lg font-button text-button hover:bg-surface-container-low transition-colors"
          >
            {t("home.hero.shopNow")}
            <MdArrowForward size={20} />
          </Link>
        </div>

        {/* Right Image */}
        <div className="flex-1">
          <div className="aspect-video bg-surface-container-high rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop"
              alt="Hero Banner"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="border-t border-on-primary border-opacity-20 mt-12">
        <div className="max-w-container-max mx-auto px-margin-desktop py-8 flex flex-col md:flex-row justify-around gap-8">
          <div className="flex items-center gap-4">
            <MdLocalShipping size={32} className="text-on-primary" />
            <div>
              <h4 className="font-button text-button text-on-primary">
                {t("home.hero.freeShipping")}
              </h4>
              <p className="font-body-sm text-body-sm text-on-primary opacity-80">
                {t("home.hero.freeShippingDesc")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <MdAssignmentReturn size={32} className="text-on-primary" />
            <div>
              <h4 className="font-button text-button text-on-primary">
                {t("home.hero.easyReturns")}
              </h4>
              <p className="font-body-sm text-body-sm text-on-primary opacity-80">
                {t("home.hero.easyReturnsDesc")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <MdSecurity size={32} className="text-on-primary" />
            <div>
              <h4 className="font-button text-button text-on-primary">
                {t("home.hero.secureCheckout")}
              </h4>
              <p className="font-body-sm text-body-sm text-on-primary opacity-80">
                {t("home.hero.secureCheckoutDesc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
