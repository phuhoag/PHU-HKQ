import { Link } from "react-router-dom";
import {
  MdArrowForward,
  MdLocalShipping,
  MdAssignmentReturn,
  MdSecurity,
} from "react-icons/md";

export default function HeroBanner() {
  return (
    <section className="bg-gradient-to-r from-primary to-primary-container text-on-primary py-stack-lg rounded-xl overflow-hidden">
      <div className="max-w-container-max mx-auto px-margin-desktop py-16 flex flex-col md:flex-row items-center gap-8">
        {/* Left Content */}
        <div className="flex-1">
          <h1 className="font-h1 text-h1 text-on-primary mb-stack-md">
            Welcome to TechStore
          </h1>
          <p className="font-body-lg text-body-lg text-on-primary mb-stack-lg max-w-lg opacity-90">
            Discover the latest technology products at unbeatable prices. Shop
            premium laptops, keyboards, monitors, and more.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-on-primary text-primary px-8 py-3 rounded-lg font-button text-button hover:bg-surface-container-low transition-colors"
          >
            Shop Now
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
                Free Shipping
              </h4>
              <p className="font-body-sm text-body-sm text-on-primary opacity-80">
                On orders over $50
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <MdAssignmentReturn size={32} className="text-on-primary" />
            <div>
              <h4 className="font-button text-button text-on-primary">
                Easy Returns
              </h4>
              <p className="font-body-sm text-body-sm text-on-primary opacity-80">
                30-day return policy
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <MdSecurity size={32} className="text-on-primary" />
            <div>
              <h4 className="font-button text-button text-on-primary">
                Secure Checkout
              </h4>
              <p className="font-body-sm text-body-sm text-on-primary opacity-80">
                100% secure transactions
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
