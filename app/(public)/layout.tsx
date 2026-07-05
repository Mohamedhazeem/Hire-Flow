import { PublicNavbar } from "@/app/features/public/components/public-navbar";
import { Footer } from "@/app/features/landing/components/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicNavbar />
      {children}
      <Footer />
    </>
  );
}
