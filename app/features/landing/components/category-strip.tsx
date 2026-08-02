"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { JOB_CATEGORIES } from "@/lib/job-categories";
import {
  BriefcaseIcon,
  MonitorIcon,
  HeartPulseIcon,
  BanknoteIcon,
  MegaphoneIcon,
  GlobeIcon,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, typeof BriefcaseIcon> = {
  Technology: MonitorIcon,
  Healthcare: HeartPulseIcon,
  Finance: BanknoteIcon,
  Marketing: MegaphoneIcon,
  Remote: GlobeIcon,
};

const parentVariants = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const childVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function CategoryStrip() {
  return (
    <section className="relative z-10 text-slate-950 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-10 sm:py-14">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          variants={parentVariants}
          className="space-y-6"
        >
          <div className="text-center sm:text-left">
            <p className="text-xs uppercase tracking-[0.32em] text-brand-light mb-3">
              Browse roles by category
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-950 dark:text-white">
              Find opportunities that match your career focus.
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {JOB_CATEGORIES.map((cat) => {
              const params = new URLSearchParams(
                "industry" in cat.filter
                  ? { industry: cat.filter.industry! }
                  : { workMode: cat.filter.workMode! },
              );
              const Icon = CATEGORY_ICONS[cat.label] ?? BriefcaseIcon;

              return (
                <motion.div
                  key={cat.label}
                  variants={childVariants}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-3xl border border-slate-200 bg-white p-5 transition-all hover:border-brand/30 dark:border-slate-800 dark:bg-slate-900"
                >
                  <Link
                    href={`/jobs?${params.toString()}`}
                    className="flex h-full flex-col items-start gap-4"
                  >
                    <div className="size-11 rounded-3xl bg-brand/10 text-brand flex items-center justify-center">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-950 dark:text-white">
                      {cat.label}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Explore curated openings
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
