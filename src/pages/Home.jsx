import HeroSection from "../components/HeroSection";
import CategorySection from "../components/CategorySection";
import BestSellers from "../components/BestSellers";
import NewArrivals from "../components/NewArrivals";
import WhyChooseUs from "../components/WhyChooseUs";
import HonestDifference from "../components/HonestDifference";
import CustomerReviews from "../components/CustomerReviews";
import CustomerAssistance from "../components/CustomerAssistance";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA"; // Import this
import WhatsAppWidget from "../components/WhatsAppWidget";
import BackToTop from "../components/BackToTop";

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <BestSellers />
      <CustomerAssistance />
      <NewArrivals />
      <WhyChooseUs />
      <HonestDifference />
      <CustomerReviews />
      <FAQ />
      <FinalCTA /> {/* Placed here */}      
      <WhatsAppWidget />
      <BackToTop />
    </>
  );
}