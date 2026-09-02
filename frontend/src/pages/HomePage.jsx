import Header from "../components/layouts/Header";
import Footer from "../components/layouts/Footer";
import HeroBanner from "../components/home/HeroBanner";
import CategoriesSection from "../components/home/CategoriesSection";
import NewArrivalsSection from "../components/home/NewArrivalsSection";
import FeaturedProductsSection from "../components/home/FeaturedProductsSection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import NewsletterSection from "../components/home/NewsletterSection";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 w-full">
        {/* Hero Banner */}
        <section className="max-w-container-max mx-auto px-margin-desktop py-stack-lg">
          <HeroBanner />
        </section>

        {/* Categories */}
        <CategoriesSection />

        {/* 1. New Arrivals Section (Sản phẩm mới nhất) */}
        <NewArrivalsSection />

        {/* 2. Featured Products Section (Sản phẩm nổi bật do Admin chọn) */}
        <FeaturedProductsSection />

        {/* Testimonials */}
        <section className="max-w-container-max mx-auto px-margin-desktop">
          <TestimonialsSection />
        </section>

        {/* Newsletter */}
        <section className="max-w-container-max mx-auto px-margin-desktop py-stack-lg">
          <NewsletterSection />
        </section>
      </main>

      <Footer />
    </div>
  );
}
