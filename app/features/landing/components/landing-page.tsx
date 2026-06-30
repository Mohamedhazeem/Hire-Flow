import { HeroSection } from "./hero-section";
import { StatsBanner } from "./stats-banner";
import { FeaturedJobs } from "./featured-jobs";
import { HowItWorks } from "./how-it-works";
import { Testimonials } from "./testimonials";
import { Footer } from "./footer";

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <StatsBanner />
      <FeaturedJobs />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </>
  );
}
