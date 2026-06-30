"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] sm:min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1521737711867-e3b97375f3f9?w=1200&q=80")',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-page via-transparent to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
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
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-accent-light">
            or the Perfect Candidate
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-white/70 mt-4 max-w-2xl mx-auto"
        >
          The modern hiring platform connecting talented professionals with
          forward-thinking companies. No gatekeeping, just opportunity.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-semibold text-white border border-white/30 hover:border-white/50 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97]"
          >
            Sign Up Free
          </Link>
        </motion.div>
      </div>

      <span className="absolute bottom-4 right-4 text-[10px] text-white/25 select-none">
        Photo by Unsplash
      </span>
    </section>
  );
}
