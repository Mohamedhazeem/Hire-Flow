"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRightIcon } from "lucide-react";

const ctaVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function ResourcesCTA() {
  return (
    <section className="bg-brand/5 border-y border-border-subtle py-20 sm:py-24">
      <div className="max-w-xl mx-auto px-4 md:px-6 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={ctaVariants}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-text-heading">
            Ready to Find Your Next Role?
          </h2>
          <p className="text-sm text-text-muted mt-2 mb-6">
            Browse thousands of active listings from top companies.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold text-white bg-brand hover:bg-brand-dark rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97]"
          >
            Browse Jobs
            <ArrowRightIcon className="size-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
