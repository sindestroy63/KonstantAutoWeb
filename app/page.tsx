import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { WhySection } from "@/components/home/WhySection";
import { HowSection } from "@/components/home/HowSection";
import { TrackingSection } from "@/components/home/TrackingSection";
import { CatalogPreviewSection } from "@/components/home/CatalogPreviewSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { FaqSection } from "@/components/home/FaqSection";
import { CtaSection } from "@/components/home/CtaSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <WhySection />
      <HowSection />
      <TrackingSection />
      <CatalogPreviewSection />
      <ReviewsSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
