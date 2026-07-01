import { Suspense } from "react";
import { PublicNavbarSkeleton } from "@/app/features/public/components/public-navbar-skeleton";
import { PublicNavbar } from "@/app/features/public/components/public-navbar";
import { Footer } from "@/app/features/landing/components/footer";

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
