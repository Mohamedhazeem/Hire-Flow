import { Suspense } from "react";
import { LandingPage } from "@/app/features/landing/components/landing-page";

export default function Home() {
  return (
    <Suspense>
      <LandingPage />
    </Suspense>
  );
}
