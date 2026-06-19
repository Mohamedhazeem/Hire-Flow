import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ErrorPage from "@/components/error-page";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
};
export default function NotFound() {
  return (
    <html lang="en" className={inter.variable}>
      <body>{newFunction()}</body>
    </html>
  );
}
function newFunction() {
  return (
    <ErrorPage
      errorTag="Unavailable"
      title="404 — Not Found"
      description="The path you looking for does not exist"
    />
  );
}
