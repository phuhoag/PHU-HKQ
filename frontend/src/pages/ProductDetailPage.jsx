import { Link } from "react-router-dom";
import { MdChevronRight } from "react-icons/md";
import Header from "../components/layouts/Header.jsx";
import Footer from "../components/layouts/Footer.jsx";
import ProductGallery from "../components/product/ProductGallery.jsx";
import ProductInfo from "../components/product/ProductInfo.jsx";
import ProductSpecs from "../components/product/ProductSpecs.jsx";
import RelatedProducts from "../components/product/RelatedProducts.jsx";

export default function ProductDetailPage() {
  const product = {
    id: 1,
    title: "Pro Wireless Headphones",
    category: "Professional Series",
    rating: 4.8,
    reviews: 120,
    price: 299,
    originalPrice: 349,
    inStock: true,
    description:
      "Experience studio-grade sound anywhere with the Pro Wireless Headphones. Engineered with 40mm custom drivers and advanced Active Noise Cancellation (ANC), these headphones deliver pure acoustic precision while blocking out unwanted environment noise.",
    features: [
      { icon: "graphic_eq", text: "Advanced Active Noise Cancellation" },
      { icon: "battery_charging_full", text: "Up to 40 hours of battery life" },
      { icon: "bluetooth", text: "Bluetooth 5.2 with Multi-point connection" },
    ],
  };

  const specs = [
    { label: "Driver Type", value: "40mm Dynamic Neodymium" },
    { label: "Frequency Response", value: "10Hz - 40kHz" },
    { label: "Impedance", value: "32 Ohms" },
    { label: "Connectivity", value: "Bluetooth 5.2, USB-C, 3.5mm" },
    { label: "Weight", value: "250g" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-desktop py-stack-lg">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-stack-md text-on-surface-variant font-body-sm text-body-sm">
          <Link to="/shop" className="hover:text-primary">
            Shop
          </Link>
          <MdChevronRight className="text-[14px]" />
          <Link to="/categories" className="hover:text-primary">
            Audio
          </Link>
          <MdChevronRight className="text-[14px]" />
          <span className="text-on-surface">{product.title}</span>
        </nav>

        {/* Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-stack-lg">
          {/* Gallery Column */}
          <div className="lg:col-span-7">
            <ProductGallery />
          </div>

          {/* Content Column */}
          <div className="lg:col-span-5">
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Specifications & Related */}
        <ProductSpecs specs={specs} />

        {/* Related Products */}
        <RelatedProducts />
      </main>

      <Footer />
    </div>
  );
}
