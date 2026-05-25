import { Link } from "react-router-dom";
import { MdLanguage, MdSupportAgent } from "react-icons/md";

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant dark:border-outline w-full mt-stack-lg">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop py-stack-lg max-w-container-max mx-auto">
        {/* Brand & Copyright */}
        <div className="mb-6 md:mb-0">
          <h3 className="text-h2 font-h2 text-primary dark:text-primary-fixed block mb-2">
            TechStore
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant">
            © 2026 TechStore E-commerce. All rights reserved.
          </p>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-6">
          <Link
            to="/privacy"
            className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-all hover:underline decoration-primary"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-all hover:underline decoration-primary"
          >
            Terms of Service
          </Link>
          <Link
            to="/help"
            className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-all hover:underline decoration-primary"
          >
            Help Center
          </Link>
          <Link
            to="/contact"
            className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-all hover:underline decoration-primary"
          >
            Contact Us
          </Link>
          <Link
            to="/track"
            className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-all hover:underline decoration-primary"
          >
            Track Order
          </Link>
        </nav>

        {/* Social/Support Buttons */}
        <div className="flex gap-4 mt-6 md:mt-0">
          <button className="p-2 bg-surface-container-high rounded-full hover:bg-primary-fixed transition-all">
            <MdLanguage className="text-on-surface" size={20} />
          </button>
          <button className="p-2 bg-surface-container-high rounded-full hover:bg-primary-fixed transition-all">
            <MdSupportAgent className="text-on-surface" size={20} />
          </button>
        </div>
      </div>
    </footer>
  );
}
