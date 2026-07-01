import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { PublicNavbarSkeleton } from "@/app/features/public/components/public-navbar-skeleton";
import { PublicNavbar } from "@/app/features/public/components/public-navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HireFlow",
  description: "Next Generation Hiring Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
              var e=localStorage.getItem("hireflow-ui");
              var isDark=false;
              if(e){
                var t=JSON.parse(e).state||{};
                if(t.theme==="dark") isDark=true;
                else if(t.theme!=="light") isDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
              }else{
                isDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
              }
              if(isDark) document.documentElement.classList.add("dark");
              else document.documentElement.classList.remove("dark");
            }catch(err){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Suspense fallback={<PublicNavbarSkeleton />}>
            <PublicNavbar />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
