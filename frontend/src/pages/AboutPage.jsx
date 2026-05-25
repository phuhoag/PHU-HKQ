import Header from "../components/layouts/Header";
import Footer from "../components/layouts/Footer";
import AboutHero from "../components/about/AboutHero";
import MissionSection from "../components/about/MissionSection";
import WhyChooseUsSection from "../components/about/WhyChooseUsSection";
import TeamSection from "../components/about/TeamSection";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <AboutHero />

        {/* Mission Section */}
        <MissionSection />

        {/* Why Choose Us */}
        <WhyChooseUsSection />

        {/* Team Section */}
        <TeamSection />
      </main>

      <Footer />
    </div>
  );
}
