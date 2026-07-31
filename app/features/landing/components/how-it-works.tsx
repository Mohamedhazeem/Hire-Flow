"use client";

import { motion } from "motion/react";
import { UserPlusIcon, SearchIcon, BriefcaseIcon } from "lucide-react";

const steps = [
  {
    icon: UserPlusIcon,
    title: "Create Your Profile",
    description:
      "Sign up in minutes and build a standout profile that showcases your skills, experience, and career goals.",
  },
  {
    icon: SearchIcon,
    title: "Browse Opportunities",
    description:
      "Explore thousands of curated job listings from innovative companies that match your expertise.",
  },
  {
    icon: BriefcaseIcon,
    title: "Apply & Get Hired",
    description:
      "Submit applications with one click, track your progress, and land your next role faster.",
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
    <section className="bg-bg-surface border-y border-border-subtle py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-heading">How It Works</h2>
        <p className="text-sm text-text-muted mt-1 max-w-xl mx-auto">
          Three simple steps to land your next opportunity
        </p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={parentVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              variants={childVariants}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="bg-bg-page border border-border-subtle rounded-2xl p-6 sm:p-8 text-left transition-shadow hover:shadow-sm cursor-default"
            >
              <div className="size-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand mb-4">
                <step.icon className="size-6" />
              </div>
              <div className="text-sm font-semibold text-text-muted mb-1">Step {i + 1}</div>
              <h3 className="text-lg font-semibold text-text-heading mb-2">{step.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
