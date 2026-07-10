import { HeroSearch } from "@/app/features/landing/components/hero-search";
import { CategoryStrip } from "@/app/features/landing/components/category-strip";
import { FeaturedJobs } from "./featured-jobs";
import { FeaturedCompanies } from "@/app/features/landing/components/featured-companies";
import { HowItWorks } from "./how-it-works";
import { Testimonials } from "./testimonials";
import { EmployerCTA } from "@/app/features/landing/components/employer-cta";

export async function LandingPage() {
  return (
    <>
      <HeroSearch />
      <CategoryStrip />
      <FeaturedJobs />
      <FeaturedCompanies />
      <HowItWorks />
      <Testimonials />
      <EmployerCTA />
    </>
  );
}
