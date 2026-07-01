"use client";

import { motion } from "motion/react";
import {
  FileTextIcon,
  SparklesIcon,
  SearchIcon,
  BookOpenIcon,
  PenLineIcon,
  type LucideIcon,
} from "lucide-react";

type Tip = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const tips: Tip[] = [
  {
    icon: PenLineIcon,
    title: "Tailor Your Resume",
    body: "Customize your resume for each application. Match keywords from the job description to pass ATS filters and show you have done your homework.",
  },
  {
    icon: SparklesIcon,
    title: "Quantify Impact",
    body: 'Use numbers to demonstrate results: "Increased sales by 30%" is far more powerful than "Helped grow sales."',
  },
  {
    icon: SearchIcon,
    title: "ATS Optimization",
    body: "Use standard section headings, avoid tables or columns, and save as PDF unless requested otherwise. Simple formatting parses best.",
  },
  {
    icon: BookOpenIcon,
    title: "Proofread Twice",
    body: "A single typo can cost you an interview. Read aloud, use spellcheck, and ask a friend to review before submitting.",
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function ResumeTipsSection() {
  return (
    <section className="border-t border-border-subtle py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.12 } },
            hidden: {},
          }}
        >
          <motion.div variants={sectionVariants}>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-heading flex items-center gap-2">
              <FileTextIcon className="size-6 text-brand" />
              Resume Tips
            </h2>
            <p className="text-sm text-text-muted mt-1 mb-8 max-w-lg">
              Make your resume stand out in a sea of applications.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {tips.map((tip) => (
              <motion.div
                key={tip.title}
                variants={sectionVariants}
                className="rounded-2xl border border-border-subtle bg-bg-surface p-6 hover:border-brand/20 transition-colors"
              >
                <div className="size-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand mb-3">
                  <tip.icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-text-heading mb-2">{tip.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{tip.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
