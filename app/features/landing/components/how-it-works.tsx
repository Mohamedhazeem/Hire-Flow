"use client";

import { motion } from "motion/react";
import { UserPlusIcon, SearchIcon, BriefcaseIcon } from "lucide-react";

const steps = [
  {
    icon: UserPlusIcon,
    title: "Create your profile",
    description:
      "Build a polished candidate profile with your skills, experience, and career goals in minutes.",
  },
  {
    icon: SearchIcon,
    title: "Find relevant openings",
    description:
      "Filter by role, location, and work style to discover jobs that align with your ambitions.",
  },
  {
    icon: BriefcaseIcon,
    title: "Apply with confidence",
    description:
      "Submit professional applications and track progress across every company in one place.",
  },
];

const parentVariants = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const childVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function HowItWorks() {
  return (
    <section className="text-slate-950 py-12 sm:py-16 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mx-auto max-w-2xl">
          <p className="text-xs uppercase tracking-[0.32em] text-brand-light mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold">Three steps to elevate your job search</h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            A streamlined experience for candidates and hiring teams that prioritizes clarity,
            speed, and quality.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={parentVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              variants={childVariants}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="size-14 rounded-3xl bg-brand/10 text-brand flex items-center justify-center mb-5">
                <step.icon className="size-6" />
              </div>
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-light mb-2">
                Step {i + 1}
              </div>
              <h3 className="text-xl font-semibold text-slate-950 dark:text-white mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
