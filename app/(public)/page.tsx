import { Suspense } from "react";
import { LandingPage } from "@/app/features/landing/components/landing-page";
import { LandingPageSkeleton } from "@/app/features/landing/components/landing-page-skeleton";

export default function Home() {
  return (
    <Suspense fallback={<LandingPageSkeleton />}>
      <LandingPage />
    </Suspense>
  );
}
