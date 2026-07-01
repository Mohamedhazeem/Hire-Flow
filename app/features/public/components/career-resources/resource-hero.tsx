"use client";

import { motion } from "motion/react";
import { BookOpenIcon } from "lucide-react";

export function ResourceHero() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand/5 via-transparent to-transparent" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 text-xs font-medium text-brand bg-brand/10 rounded-full px-4 py-1.5 mb-4">
            <BookOpenIcon className="size-3.5" />
            Career Resources
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-heading leading-tight">
            Tips &amp; Tools for Your Job Search
          </h1>
          <p className="text-sm sm:text-base text-text-muted mt-4 max-w-xl mx-auto leading-relaxed">
            Actionable advice on resumes, interviews, and salary negotiation
            &mdash; built from real recruiter and hiring-manager experience.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
