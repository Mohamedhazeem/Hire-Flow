"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { JOB_CATEGORIES } from "@/lib/job-categories";
import { BriefcaseIcon, MonitorIcon, HeartPulseIcon, BanknoteIcon, MegaphoneIcon, GlobeIcon } from "lucide-react";

const CATEGORY_ICONS: Record<string, typeof BriefcaseIcon> = {
  Technology: MonitorIcon,
  Healthcare: HeartPulseIcon,
  Finance: BanknoteIcon,
  Marketing: MegaphoneIcon,
  Remote: GlobeIcon,
};

export function CategoryStrip() {
  return (
    <div className="bg-bg-surface border-b border-border-subtle">
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 text-center sm:text-left">
            Browse by Category
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-5 sm:gap-4 scrollbar-none">
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
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    href={`/jobs?${params.toString()}`}
                    className="flex flex-col items-center gap-2 min-w-[100px] sm:min-w-0 px-5 py-4 rounded-2xl border border-border-subtle bg-bg-page hover:bg-bg-surface hover:border-brand/20 transition-all"
                  >
                    <div className="size-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-sm font-medium text-text-body whitespace-nowrap">
                      {cat.label}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
