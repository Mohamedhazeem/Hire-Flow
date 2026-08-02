import { PublicNavbar } from "@/app/features/public/components/public-navbar";
import { PublicNavbarSkeleton } from "@/app/features/public/components/public-navbar-skeleton";
import { Footer } from "@/app/features/landing/components/footer";
import { Suspense } from "react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<PublicNavbarSkeleton />}>
        <PublicNavbar />
      </Suspense>
      {children}
      <Footer />
    </>
  );
}
