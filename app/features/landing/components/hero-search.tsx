"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { JobSearchBar } from "@/app/features/jobs/components/job-search-bar";

export function HeroSearch() {
  return (
    <section className="relative min-h-screen sm:min-h-[85vh] flex items-center justify-center overflow-hidden py-16 sm:py-0">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80")',
        }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/60 to-black/70" />
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-white/70 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <SparklesIcon className="size-3.5" />
            Trusted by 5,000+ companies worldwide
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
        >
          Find Your Dream Job
          <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-light to-accent-light">
            or the Perfect Candidate
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-white/70 mt-4 max-w-2xl mx-auto"
        >
          The modern hiring platform connecting talented professionals with forward-thinking companies. No gatekeeping,
          just opportunity.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
          <JobSearchBar />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6"
        >
          <Link
            href="/jobs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-semibold text-white bg-brand hover:bg-brand-dark rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97]"
          >
            Browse Jobs
            <ArrowRightIcon className="size-4" />
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-semibold text-white bg-brand hover:bg-brand/90 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97]"
          >
            Sign Up Free
          </Link>
        </motion.div>
      </div>

      <span className="absolute bottom-4 right-4 text-[10px] text-white/25 select-none">Photo by Unsplash</span>
    </section>
  );
}
